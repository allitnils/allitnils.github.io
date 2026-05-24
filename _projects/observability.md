---
layout: page
title: Observability Stack
description: Full-stack observability platform built on Prometheus, Loki, and Grafana for unified metrics, logs, and alerting across distributed infrastructure.
img: assets/img/9.jpg
importance: 2
category: work
---

## Overview

A production-grade observability platform built on the Grafana ecosystem. Prometheus scrapes and stores time-series metrics; Loki aggregates logs without indexing; Grafana unifies both into interactive dashboards with drill-down and correlation across signals.

## Components

### Prometheus
- Configures scrape targets and relabelling rules for services and infrastructure nodes.
- Defines PromQL-based alerting rules with severity tiers routed via Alertmanager.
- Integrates with exporters: Node Exporter, cAdvisor, Blackbox Exporter.

### Loki
- Log aggregation with LogQL query language for filtering and pattern extraction.
- Label-based indexing for efficient storage without full-text indexing overhead.
- Integrated with Promtail for structured log shipping from services and system journals.

### Grafana
- Unified dashboards correlating metrics (Prometheus) and logs (Loki) in a single pane.
- Custom panels: time-series, heatmaps, stat tiles, and log streams.
- Templated variables for multi-environment (dev/staging/prod) switching.
- Alert rules with notification channels (email, Slack, PagerDuty).

## Stack

- **Metrics**: Prometheus + Alertmanager
- **Logs**: Loki + Promtail
- **Dashboards**: Grafana
- **Deployment**: Docker Compose / Kubernetes
- **Languages**: PromQL, LogQL, YAML
