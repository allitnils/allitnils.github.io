---
title: "OpenTelemetry Migration in Production: Trade-offs Every Platform Team Gets Wrong"
description: "Concrete collector topology decisions, SDK migration patterns, tail sampling configuration, cardinality budget management, and rollback architecture for teams migrating from proprietary agents to OpenTelemetry in Kubernetes production environments."
pubDate: 2026-05-25
tags: [observability, cloud, architecture]
category: observability
featured: false
---

OpenTelemetry reached signal stability — traces, metrics, and logs — across every major language SDK between 2024 and early 2025. Your leadership is asking when you're migrating. Your vendors are pushing OTLP endpoints. The demos take twenty minutes. The production migration takes six months, and usually not because of the instrumentation.

This is not a "what is OpenTelemetry" tutorial. This is about the architectural decisions that determine whether your migration extends your vendor contract by eighteen months or actually ships.


## Signal Migration Order — and Why Getting It Wrong Costs You Three Sprints

Most platform teams try to migrate traces, metrics, and logs simultaneously. Don't. The signals have very different blast radii, and getting them out of order creates a compounding failure mode where you're debugging metric regressions while also triaging broken log pipelines.

**Traces first.** SDK replacement is mechanical. An OTLP exporter is a drop-in for most vendor SDKs. Your backend almost certainly accepts OTLP today via a vendor-provided endpoint. Zero dashboard risk in the first week. The only failure mode here is head-sampling rate misconfiguration.

**Metrics second.** This is where teams bleed time. OTel semantic conventions changed metric naming between the Prometheus era and OTel stable:

| Prometheus (vendor agent) | OTel Stable (1.23+) |
|---|---|
| `http_requests_total` | `http.server.request.count` |
| `http_request_duration_seconds` | `http.server.request.duration` |
| `process_cpu_seconds_total` | `process.cpu.time` |
| `db_query_duration_seconds` | `db.client.request.duration` |

Every dashboard and alert that hardcodes the old name breaks when a service migrates. Budget two sprints for dashboard reconciliation per service cluster, or build a PromQL recording rule bridge before you cut over:

```promql
# Bridge rule: keep old name working during migration window
record: http_requests_total
expr: http_server_request_count_total{job="checkout-service"}
```

**Logs last.** Log pipeline changes touch Fluentd/Fluent Bit configs, structured logging library integration, Loki label extraction strategies, and alert rules simultaneously. Do this after your trace and metric pipelines are stable and you have operational confidence in the collector fleet.

Parallelising across teams is fine. Parallelising all three signals within the same service during the same on-call rotation is not.


## Collector Topology — The Decision You Make Once

The topology you choose for your OTel Collector deployment determines what's possible, what fails, and what it costs. There are three patterns in production use. They are not interchangeable.

![OTel Collector Deployment Topologies](/assets/img/otel-collector-topologies.svg)
*Figure 1: Three OTel Collector deployment topologies with distinct blast radius, memory, and capability trade-offs.*

### Sidecar

One collector container per application pod. The collector is co-located with the service it captures.

**Use when:** You're in a regulated environment (PCI-DSS, HIPAA, SOC 2) where telemetry data must not traverse node boundaries before encryption/filtering. Or when a service has bursty, high-cardinality traffic that you want to rate-limit and process before it leaves the pod.

**Don't use when:** You're running 500+ pods. Memory scales with pod count, not workload. At 128 MiB per collector, 500 pods costs you 64 GiB of Kubernetes memory quota purely for collectors. At scale, that becomes a budget conversation.

**Blast radius:** Single pod. A collector crash drops that pod's data only.

### DaemonSet (the sensible default)

One collector per Kubernetes node, receiving from all pods on that node via the node IP.

**Use when:** Almost always. This is the right starting point for any Kubernetes workload. Memory scales with node count, resource limits are easy to reason about at the node level, and the failure domain is bounded.

**Don't use when:** You need tail sampling. DaemonSet collectors see only a fraction of any given distributed trace (only the spans from pods on their node), so they cannot make trace-level sampling decisions.

**Blast radius:** A node crash causes 30–120 seconds of data loss for all pods on that node, depending on your in-flight buffer configuration. This is acceptable for most workloads. If it isn't, add a gateway tier.

**Pod-to-DaemonSet discovery** is the part most config examples skip. Pods need to find their node-local collector. Use the Kubernetes downward API:

```yaml
# In your application Deployment spec
env:
  - name: NODE_IP
    valueFrom:
      fieldRef:
        fieldPath: status.hostIP
  - name: OTEL_EXPORTER_OTLP_ENDPOINT
    value: "http://$(NODE_IP):4317"
```

### Gateway

A horizontally-scaled fleet of collectors receiving from DaemonSet collectors. This is the only tier at which tail sampling is possible.

**Use when:** You need trace-level sampling decisions, cross-service attribute enrichment, or centralised credential management for multiple backends. The common production pattern is DaemonSet + Gateway in tandem — the DaemonSet handles local processing and forwards to the gateway fleet.

**Don't use when:** You need high availability without significant operational investment. The gateway fleet is a single point of failure for your entire observability pipeline. You need persistent storage (Kafka) for a resilient tail-sampling buffer, not just in-memory queues.

**Blast radius:** Cluster-wide. A misconfigured gateway config rolls out to all services simultaneously.


## Production DaemonSet Config

The defaults in most OTel Collector examples are wrong for production. This configuration handles the failure modes that kill Prometheus scraping and OOM-crash the collector under traffic spikes:

```yaml
# otel-collector-daemonset.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 5s
    send_batch_size: 512
    send_batch_max_size: 1024  # hard cap prevents runaway memory under bursts
  memory_limiter:
    limit_mib: 512
    spike_limit_mib: 128
    check_interval: 5s          # must be set — default polling is too slow
  resourcedetection:
    detectors: [k8snode, k8sattributes, env]
    override: false             # don't overwrite SDK-set attributes
  k8sattributes:
    extract:
      metadata:
        - k8s.namespace.name
        - k8s.pod.name
        - k8s.node.name
        - k8s.deployment.name
      labels:
        - tag_name: app.version
          key: app.kubernetes.io/version
          from: pod

exporters:
  otlphttp:
    endpoint: http://otel-gateway.observability.svc.cluster.local:4318
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 120s    # fail fast enough that your buffer doesn't fill
    sending_queue:
      enabled: true
      num_consumers: 10
      queue_size: 5000          # tune against your peak spans/sec

service:
  telemetry:
    metrics:
      address: 0.0.0.0:8888    # expose collector self-metrics for Prometheus scrape
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, resourcedetection, k8sattributes, batch]
      exporters: [otlphttp]
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, resourcedetection, k8sattributes, batch]
      exporters: [otlphttp]
```

Two things that will bite you if you omit them: the `memory_limiter` processor (OOM kills in production under traffic spikes are brutal), and the `check_interval` on the memory limiter (the default polling rate is too slow for a high-ingestion pipeline).


## Gateway Tail Sampling Config

Tail sampling requires the gateway to buffer all spans for a complete trace before making a sampling decision. The critical sizing question is: how long does your longest trace take to complete?

```yaml
# otel-gateway-tail-sampling.yaml
processors:
  tail_sampling:
    decision_wait: 30s           # must exceed your p99 trace duration
    num_traces: 100000           # in-memory trace buffer ceiling
    expected_new_traces_per_sec: 500

    policies:
      - name: errors-policy
        type: status_code
        status_code:
          status_codes: [ERROR]

      - name: slow-requests
        type: latency
        latency:
          threshold_ms: 2000

      - name: critical-services
        type: string_attribute
        string_attribute:
          key: service.name
          values: [checkout-service, payment-service]  # always sample business-critical paths

      - name: probabilistic-catchall
        type: probabilistic
        probabilistic:
          sampling_percentage: 5   # 5% random baseline for happy-path visibility
```

**Gateway memory sizing.** This is the formula teams miss until their gateway OOMs at 3am:

```
Required memory = num_traces × avg_spans_per_trace × avg_span_size_bytes
                = 100,000 × 50 × 1,024 bytes
                = ~5 GB
```

Add 2× headroom for the 30-second decision window during traffic surges. A gateway pod running 100k trace buffer needs at least 12 GiB of memory limit, not the 512 MiB that looks reasonable in a dev environment.

The tail sampling flow for every trace:

![OTel Tail Sampling Decision Flow](/assets/img/otel-tail-sampling-flow.svg)
*Figure 2: Trace-level sampling decision. ~85–90% of healthy traces are dropped. The full trace — all spans — is exported or dropped together, never individual spans.*


## SDK Migration: Auto-instrumentation vs Manual

### Auto-instrumentation

Zero code changes. Attach an agent (Java, Python, Node.js) and the framework instrumentation is injected automatically. For services with standard frameworks (Spring Boot, Django, Express), this covers 80–90% of what you need.

```bash
# Java: no code changes required
java \
  -javaagent:/opt/otel/opentelemetry-javaagent.jar \
  -Dotel.service.name=checkout-service \
  -Dotel.resource.attributes=deployment.environment=production,team=payments \
  -Dotel.exporter.otlp.endpoint=http://$(NODE_IP):4317 \
  -Dotel.exporter.otlp.protocol=grpc \
  -Dotel.traces.sampler=parentbased_traceidratio \
  -Dotel.traces.sampler.arg=0.1 \
  -jar checkout.jar
```

The sampler is critical: `parentbased_traceidratio` at 0.1 means 10% head sampling, which propagates the decision to downstream services. Without this, every service samples independently and you lose trace continuity.

### Manual SDK (Go)

Manual instrumentation is required for services with custom frameworks, non-standard protocols, or where you need precise control over span attributes, sampling, and batch configuration.

```go
func InitTracer(ctx context.Context, serviceName, version string) (func(context.Context) error, error) {
    conn, err := grpc.DialContext(ctx,
        os.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT"),
        grpc.WithTransportCredentials(insecure.NewCredentials()),
    )
    if err != nil {
        return nil, fmt.Errorf("otel grpc dial: %w", err)
    }

    exporter, err := otlptracegrpc.New(ctx, otlptracegrpc.WithGRPCConn(conn))
    if err != nil {
        return nil, err
    }

    res := resource.NewWithAttributes(
        semconv.SchemaURL,
        semconv.ServiceNameKey.String(serviceName),
        semconv.ServiceVersionKey.String(version),
        semconv.DeploymentEnvironmentKey.String(os.Getenv("ENVIRONMENT")),
    )

    tp := sdktrace.NewTracerProvider(
        sdktrace.WithBatcher(exporter,
            sdktrace.WithBatchTimeout(5*time.Second),
            sdktrace.WithMaxExportBatchSize(512),
        ),
        sdktrace.WithResource(res),
        sdktrace.WithSampler(
            sdktrace.ParentBased(sdktrace.TraceIDRatioBased(0.1)),
        ),
    )

    otel.SetTracerProvider(tp)
    // Both propagators required for cross-service trace context
    otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(
        propagation.TraceContext{},
        propagation.Baggage{},
    ))

    return tp.Shutdown, nil
}
```

The `propagation.TraceContext{}` + `propagation.Baggage{}` composite propagator is the part most Go examples omit. Without it, traces don't stitch across service boundaries.

| Dimension | Auto-instrumentation | Manual SDK |
|---|---|---|
| Code changes | None | Significant |
| Framework coverage | High (auto-detected) | Only what you instrument |
| Custom span attributes | Limited | Full control |
| Agent CPU overhead | 3–8% (JVM agent) | 1–3% (native) |
| Migration to different backend | Re-configure env vars | Re-wire exporter only |
| Non-standard protocol support | No | Yes |


## The Cardinality Budget Problem in Metrics Migration

This is where most migrations fail silently. The `spanmetrics` connector — which generates RED metrics (rate, errors, duration) from trace data — ships with dangerous defaults.

```yaml
connectors:
  spanmetrics:
    histogram:
      explicit:
        buckets: [5ms, 10ms, 25ms, 50ms, 100ms, 250ms, 500ms, 1s, 2s, 5s]
    dimensions:
      - name: http.method          # bounded: ~5 values
      - name: http.status_code     # bounded: ~25 values
      - name: service.name         # bounded: your service count
      # DANGER — these create unbounded cardinality:
      # - name: http.url           # never — one series per unique URL
      # - name: user.id            # never — one series per user
      # OK if routes are normalised:
      # - name: http.route         # /api/users/{id} not /api/users/12345
    dimensions_cache_size: 10000   # REQUIRED — default is unbounded, will OOM Prometheus
    metrics_flush_interval: 60s
```

Calculate your series ceiling before enabling:

```
series_count = methods × status_codes × services × histogram_buckets
             = 5 × 25 × 20 × 10
             = 25,000 active series   ← manageable

+ http.route (100 normalised routes): 2,500,000 series   ← heavy
+ http.url (unbounded):               ∞                  ← TSDB dies
```

Use this PromQL query post-migration to detect runaway cardinality before it hits your retention budget:

```promql
# Alert: any metric family exceeding 50k active series
topk(10,
  count by (__name__) ({__name__=~"otel_.*"})
)
> 50000
```

And to validate that the migration didn't drop data silently — compare throughput between your old and new pipelines during dual-write:

```promql
# Parity check: should be ~1.0 during dual-write window
rate(otel_exporter_sent_spans_total{exporter="otlphttp"}[5m])
/
rate(otel_exporter_sent_spans_total{exporter="datadog"}[5m])
```

Acceptable deviation: less than 2%. Beyond that, check for dropping/sampling differences before cutting the vendor exporter.


## Vendor Lock-in: What OTel Doesn't Solve

OTel 1.0 covers the signal protocol layer. It does not replace the following, which remain vendor-differentiated as of 2026:

**Continuous profiling.** Datadog's Continuous Profiler, Grafana Pyroscope, and Dynatrace Code-Level Visibility all use proprietary agents or eBPF hooks. The OTel Profiling Signal specification has not reached stable across any major language SDK. Plan to run a separate profiling agent indefinitely.

**Network performance monitoring.** Datadog NPM, Dynatrace AppMon, and Cisco ThousandEyes use kernel-level data collection (eBPF, kernel modules) that OTel has no equivalent for. This category won't migrate.

**Real user monitoring (RUM).** OTel's browser SDK covers basic web vitals. Mature session replay, conversion funnel analytics, and user journey stitching remain vendor territory.

**Synthetic monitoring.** No OTel equivalent. Plan for a separate tool permanently.

The realistic end-state for most enterprise migrations:

```
OTel SDK        → traces, application metrics       (migrated)
Vendor agent    → profiling, NPM, infra metrics     (retained)
OTLP passthrough → route OTel data to vendor backend (bridge)
```

Most vendors (Datadog, Dynatrace, New Relic, Honeycomb) now ingest OTLP natively. This means you can send OTel data to them without their SDK — but you lose vendor-specific enrichment, APM correlation features, and Watchdog/Davis AI. Benchmark the actual impact on your p95 APM query latency in a staging environment before making this trade.


## Rollback Architecture — Build the Kill Switch First

Never migrate to a single exporter. Build dual-write from day one and treat the vendor exporter as your rollback path.

```yaml
# collector config: dual-write during migration window
exporters:
  datadog:
    api:
      key: ${DD_API_KEY}
      site: datadoghq.com
  otlphttp:
    endpoint: https://new-backend.example.com
    headers:
      Authorization: "Bearer ${NEW_BACKEND_TOKEN}"

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [datadog, otlphttp]   # both active — dual-write
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [datadog, otlphttp]
```

**Kill switch:** Edit the ConfigMap, remove one exporter, signal the collector Deployment. No application restarts. No code deployments. 30-second rollback.

The dual-write tax is real: roughly 2× egress cost for the duration of the migration window, plus the new backend ingestion cost. Budget for it explicitly rather than discovering it at the end-of-month cloud invoice.

Set a hard cutover deadline in your migration runbook. Without one, teams leave dual-write enabled for months "just in case" and pay the 2× cost indefinitely.


## Operational Trade-offs Matrix

| Dimension | Sidecar | DaemonSet | DaemonSet + Gateway |
|---|---|---|---|
| **Memory model** | 128 MiB × pod count | 128 MiB × node count | Node cost + gateway fleet |
| **Node crash impact** | Pod-only data loss | Node-wide data loss | Buffered (30s window) |
| **Tail sampling** | No | No | Yes |
| **Cross-service enrichment** | No | Partial (node scope) | Yes (full trace scope) |
| **Config blast radius** | Pod | Node | Cluster (gateway rollout) |
| **Cardinality control** | Processor-level | Processor-level | Centralised |
| **Credential exposure** | Per-pod secret | Per-node secret | Single gateway secret |
| **Operational complexity** | Low | Medium | High |
| **Min viable HA** | Pod restart | Node redundancy | Multi-AZ gateway fleet |

For 95% of Kubernetes workloads starting a migration today: DaemonSet with dual-write exporters and a cardinality budget set in the spanmetrics connector. Add a gateway tier when you have a concrete tail sampling requirement, not speculatively.


## Pre-Migration Checklist

Before cutting a single service over, verify these are in place:

- [ ] Vendor backend accepts OTLP natively (test with `grpcurl` before writing a line of config)
- [ ] DaemonSet collectors deployed with `memory_limiter` and `k8sattributes` processors active
- [ ] `dimensions_cache_size` set on any `spanmetrics` connector (default is unbounded)
- [ ] Dual-write configured with parity check alert firing at < 2% deviation
- [ ] Semantic convention rename recording rules deployed for all affected dashboards
- [ ] Gateway memory sized against `num_traces × avg_spans × avg_span_bytes` formula
- [ ] Rollback runbook written and tested (edit ConfigMap → rolling restart timer measured)
- [ ] Cardinality headroom confirmed in Prometheus TSDB (`topk` query above)
- [ ] Head sampling rate decision documented and consistent across all services

The hardest part of an OTel migration is not the SDK work. It is discovering, three months in, that half your dashboards broke on metric rename day, your gateway is OOMing under Monday morning load, and your vendor contract expires in six weeks. These are solvable problems, but only if you've planned for them before you hit deploy.
