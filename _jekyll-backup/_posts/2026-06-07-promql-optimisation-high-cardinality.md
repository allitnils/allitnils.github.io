---
layout: post
title: "PromQL Optimisation Patterns for High-Cardinality Environments"
date: 2026-06-07
description: "Concrete PromQL optimisation techniques for platform engineers operating at high cardinality: label matchers, recording rules, histogram strategies, aggregation ordering, and failure modes that silently degrade query performance in production."
tags: [prometheus, promql, observability, sre, platform-engineering, grafana, cardinality, metrics]
categories: [observability]
author: Ivan Ocampo
featured: true
thumbnail: assets/img/6.jpg
excerpt: "High-cardinality Prometheus environments punish bad PromQL in ways that only show up under load. These are the patterns that keep query engines responsive when your time series count crosses ten million."
---

High-cardinality Prometheus environments punish bad PromQL in ways that only show up under load. A query that returns in 80ms with 500k active series takes 12 seconds with 8 million — and the query hasn't changed. The problem isn't the query language. It's the implicit assumptions baked into query patterns that held at smaller scale.

This is not a PromQL introduction. You already know what `rate()` does and why you use `irate()` sparingly. This is about the patterns that separate queries that scale from queries that silently degrade your Prometheus under production load.

---

## Why Cardinality Is the Actual Problem

Before patterns: a precise definition of what "high cardinality" actually costs you.

Each unique combination of label values is a time series. Prometheus stores every active series in memory — the TSDB head block lives in RAM. At 100k series, Prometheus uses roughly 300MB. At 10 million series, you're at 30GB, and that's before chunk overhead, WAL, and query working set.

Query cost is not just about the number of series matched. It's about:

1. **Selector evaluation** — how many series Prometheus has to consider before label matching
2. **Range vector loading** — how many chunks get pulled from disk into memory for a `[5m]` range
3. **Aggregation fan-out** — how many intermediate vectors the query engine produces before reducing

An unoptimised query at 10M series isn't just slow — it triggers OOM on an undersized instance, or it holds the query engine long enough to delay scrapes, which corrupts rate calculations for the next 5-minute window.

---

## Pattern 1: Left-Anchor Your Matchers on Low-Cardinality Labels

Prometheus evaluates label matchers left to right and short-circuits on non-matching series. The ordering of matchers in your selector matters.

**Anti-pattern:**

```promql
http_requests_total{pod=~"frontend-.*", env="production", region="ap-southeast-2"}
```

`pod` is high cardinality (hundreds of values). Prometheus evaluates that regex against every series for the metric before it can apply the cheap equality matchers. In a cluster with 400 pods and 30 endpoints each, that regex fans out across 12,000 series before `env` and `region` eliminate 95% of them.

**Optimised:**

```promql
http_requests_total{env="production", region="ap-southeast-2", pod=~"frontend-.*"}
```

Equality matchers on `env` and `region` eliminate the bulk of the series immediately. The regex only runs against the surviving set. At 10M total series, this can halve selector evaluation time.

**Production trade-off:** Prometheus's internal label index doesn't guarantee left-to-right short-circuit behaviour across all versions and storage backends. The optimisation is most reliable on Prometheus 2.40+ and VictoriaMetrics. On Thanos Querier, query pushdown to store gateways may reorder matchers. Verify with `curl -G 'http://prometheus:9090/api/v1/query?query=...' --data-urlencode 'query=...'` and compare `/metrics` for `prometheus_engine_query_duration_seconds`.

---

## Pattern 2: Recording Rules Are Not a Crutch — They Are Load-Shedding Architecture

Recording rules are widely understood but systematically underused. The common usage is pre-aggregating expensive dashboard queries. The correct usage is treating them as a deliberate cardinality reduction step in your metric pipeline.

A metric like:

```
http_requests_total{job, instance, pod, namespace, env, region, http_method, status_code, route, version, feature_flag}
```

...with 11 labels on a busy service generates enormous series counts. Most dashboards and alerts only need a subset of those dimensions at query time.

**Recording rule that sheds cardinality at the source:**

```yaml
groups:
  - name: http_request_aggregations
    interval: 30s
    rules:
      - record: job:http_requests:rate5m
        expr: |
          sum by (job, env, status_code) (
            rate(http_requests_total[5m])
          )
      - record: job_route:http_requests:rate5m
        expr: |
          sum by (job, env, route, status_code) (
            rate(http_requests_total[5m])
          )
```

Now dashboards query `job:http_requests:rate5m` — a metric with 3 labels instead of 11. Cardinality drops by orders of magnitude. Range queries over these recorded metrics are cheap because the series count is bounded and predictable.

**Naming convention matters for operator sanity.** The Prometheus community convention is `level:metric:operation`. `job:http_requests:rate5m` tells you: aggregation level is `job`, base metric is `http_requests`, operation is `rate5m`. Stick to it — it becomes your cardinality taxonomy.

**Production trade-off:** Recording rules introduce a 30-second (or interval-configured) lag. They are unsuitable for alerting on instantaneous spikes unless your alert has a `for` duration that accommodates the lag. For alerting, pre-compute at 15s intervals and accept the marginal additional write load. Do not set intervals below 15s — you'll generate more WAL pressure than you save on query time.

---

## Pattern 3: Histogram Optimisation — Avoiding the Bucket Cardinality Trap

Native histograms (Prometheus 2.40+, `FEATURE_FLAG=native-histograms`) aside, classic histograms are one of the primary cardinality sources in production environments.

A histogram metric `http_request_duration_seconds` with 15 buckets, 8 label dimensions, and 500 pods generates:

```
500 pods × 15 buckets × 8 label combinations = 60,000+ series
```

Add `_sum` and `_count` and the real number is higher. Multiply by 10 services and you have 600k series from latency histograms alone.

**Anti-pattern — querying raw histogram buckets in dashboards:**

```promql
histogram_quantile(
  0.99,
  sum by (le, pod) (
    rate(http_request_duration_seconds_bucket{env="production"}[5m])
  )
)
```

`by (le, pod)` preserves `pod` in the aggregation. You're computing a per-pod p99 from raw bucket series. At 500 pods × 15 buckets, the query engine loads 7,500 series, computes rates across them, then aggregates. This runs fine at 50 pods. At 500, it starts to hurt. At 5,000 Kubernetes pods in a large cluster, this query is a Prometheus killer.

**Optimised — pre-aggregate histogram buckets via recording rule:**

```yaml
- record: job:http_request_duration_seconds_bucket:rate5m
  expr: |
    sum by (le, job, env, status_code) (
      rate(http_request_duration_seconds_bucket[5m])
    )
```

Dashboard query becomes:

```promql
histogram_quantile(
  0.99,
  job:http_request_duration_seconds_bucket:rate5m{env="production"}
)
```

You've traded per-pod p99 visibility for per-job p99 visibility in the dashboard. This is almost always the right trade. If you need pod-level p99 for debugging, run the expensive query on-demand in Explore — don't bake it into a dashboard that 40 people have open simultaneously.

**On bucket boundaries:** Histograms are only as useful as their bucket boundaries are appropriate for the observed distribution. The default `DefBuckets` (`0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10` seconds) are wrong for most services. A database query service with 200ms P99 needs buckets at `0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 5`. A real-time stream processor with 5ms P99 needs buckets below 10ms. Misconfigured buckets make `histogram_quantile` return meaningless values — the interpolation error grows when your actual distribution falls mostly between two sparse buckets.

---

## Pattern 4: `without` Over `by` for Future-Proof Aggregations

When aggregating, `by` requires you to enumerate every label you want to keep. `without` lets you enumerate the labels you want to drop. In environments where labels are added by instrumentation teams without coordinating with the platform team, `by` queries silently lose new label dimensions.

**`by` — breaks silently when a new label is added:**

```promql
sum by (job, env, namespace) (http_requests_total)
```

If instrumentation adds a `region` label next sprint, your aggregation no longer correctly groups by region — it silently sums across regions. Alerts and dashboards give you wrong numbers with no error signal.

**`without` — preserves new labels automatically:**

```promql
sum without (pod, instance, node) (http_requests_total)
```

This drops the high-cardinality per-instance labels and preserves everything else, including labels added in the future. New `region` label appears in instrumentation? It automatically appears in your aggregated metric.

**Production trade-off:** `without` requires you to know which labels to drop, not which to keep. In environments with inconsistent labelling across services, this can accidentally preserve a label that varies per-replica and defeats the aggregation. Audit your label set before switching to `without` patterns. For environments with a strict label taxonomy, `without` is clearly superior. For environments with ad-hoc label practices, `by` gives you more control at the cost of maintenance overhead.

---

## Pattern 5: Subquery Caution — The Hidden Range Expansion

Subqueries (`query_range[d:step]`) are powerful for computing rate-of-rates or rolling window aggregations. They are also one of the most common sources of unexpected query load at scale.

**Anti-pattern:**

```promql
max_over_time(
  rate(http_requests_total[5m])[1h:1m]
)[10m:]
```

This looks like a 10-minute query. It is not. The subquery `[1h:1m]` instructs the engine to evaluate the inner `rate(http_requests_total[5m])` at 60 steps across the last hour. Each of those 60 evaluations loads a 5-minute range vector across all matched series. For a metric with 100k series, you've just issued the equivalent of 60 simultaneous heavy range queries.

In Prometheus, subqueries are evaluated in the query engine with full fanout — there's no caching of intermediate results across steps. The load is multiplicative.

**Safer approach for rolling aggregations:**

Use a recording rule to pre-compute the rate at 1-minute resolution, then run `max_over_time` over the recorded metric:

```yaml
- record: job:http_requests:rate1m
  expr: |
    sum by (job, env) (rate(http_requests_total[1m]))
  interval: 1m
```

```promql
max_over_time(job:http_requests:rate1m{env="production"}[1h])
```

Same semantics. No fanout. The recording rule computation is amortised across all queries that consume it.

---

## Failure Mode: The Slow Dashboard That Becomes a Prometheus Cascade

At scale, a badly-written dashboard becomes an attack vector against your own metrics infrastructure.

**Sequence of events:**

1. A dashboard with 12 panels, each running a `histogram_quantile` over raw buckets with `by (pod)`, is opened by 8 engineers simultaneously during an incident.
2. Grafana issues 96 concurrent range queries (12 panels × 8 users).
3. Each query loads 7,500 series × 300 data points for a 1-hour time range.
4. Prometheus query engine goroutines pile up. Memory climbs 15GB in 4 minutes.
5. Prometheus OOMs. Scrapes are lost. Rate calculations for the next 5-minute window are incorrect.
6. The alerts that would have told you Prometheus was struggling are computed by the same Prometheus that just crashed.

**Mitigations:**

- **Query concurrency limits:** `--query.max-concurrency=20` (default is unbounded in older versions). Reject rather than queue — a rejected query tells Grafana to show an error; a queued query holds memory and delays scrapes.
- **Query timeout:** `--query.timeout=120s`. Long-running queries from a broken dashboard don't exhaust the engine indefinitely.
- **Recording rules for all dashboard queries:** If a dashboard panel runs for more than 500ms in testing, it needs a recording rule. No exceptions in production.
- **Grafana query caching:** Enable Grafana's built-in query result cache (requires Grafana 9.x enterprise or OSS cache plugin) for dashboards with high concurrent access. NOC dashboards and executive dashboards are the primary targets — same query, dozens of viewers, results should be served from cache.
- **Separate scrape and query instances:** Thanos or VictoriaMetrics cluster mode isolate scrape reliability from query load. Your scrape layer should not share a process with the query engine at production scale.

---

## Anti-Pattern: The Metric That Records Everything

The most dangerous cardinality pattern is the metric that uses a user-controlled or unbounded value as a label.

```go
// In application code — this is the bomb
httpRequestsTotal.WithLabelValues(r.URL.Path, r.Method, strconv.Itoa(statusCode)).Inc()
```

`r.URL.Path` is user-controlled. An API with path parameters like `/api/orders/12345` generates a unique series for every order ID. 10 million orders → 10 million series, from one metric. Prometheus's TSDB head will exhaust RAM. Ingestion will fall behind. The WAL grows unboundedly. Prometheus becomes unresponsive and eventually crashes.

**Detection:** `prometheus_tsdb_head_series` growing monotonically with no ceiling is the primary signal. Set an alert:

```yaml
- alert: PrometheusCardinalityExploding
  expr: |
    rate(prometheus_tsdb_head_series[1h]) > 10000
  for: 15m
  labels:
    severity: warning
  annotations:
    summary: "Prometheus series count growing rapidly — investigate new high-cardinality metrics"
```

**Mitigation at the application level:** Normalize or drop high-cardinality label values before they reach Prometheus. Relabelling in the scrape config can drop or rewrite labels before ingestion:

```yaml
scrape_configs:
  - job_name: 'api-service'
    metric_relabel_configs:
      - source_labels: [__name__, route]
        regex: 'http_requests_total;/api/orders/.*'
        target_label: route
        replacement: '/api/orders/:id'
```

This rewrites any route matching `/api/orders/<anything>` to the normalised form `/api/orders/:id` before the series is created in the TSDB. Cardinality stays bounded regardless of what the application emits.

---

## Production-Scale Checklist

Before deploying a new dashboard or alert to production:

- [ ] Every dashboard panel query runs in under 500ms against production data volume. If not, it needs a recording rule.
- [ ] No histogram query aggregates `by (le, pod)` or `by (le, instance)` without a corresponding recording rule.
- [ ] `prometheus_tsdb_head_series` is alerted on growth rate, not just absolute value.
- [ ] Query concurrency and timeout limits are explicitly set — do not rely on defaults.
- [ ] All incident-critical dashboards use recorded metrics, not raw series queries.
- [ ] New metrics introduced by application teams are reviewed for cardinality before they reach production Prometheus.
- [ ] Subqueries are not used in dashboards with more than 20 concurrent expected viewers.

---

Prometheus at scale is not a harder version of Prometheus at small scale. The failure modes are qualitatively different — a query that seemed fine in staging will silently degrade production under concurrent load, and the degradation manifests as metric loss rather than as an obvious error. The patterns here won't make your PromQL prettier. They'll keep your metrics infrastructure intact when it's under the most load — which is exactly when you need it most.
