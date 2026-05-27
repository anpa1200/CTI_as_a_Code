---
id: intro
slug: /
title: Introduction
sidebar_position: 1
---

# Linux CTI Lab

A self-contained Cyber Threat Intelligence lab you can spin up on a single Linux host with one command.

## What's in the lab

| Platform | Role |
|---|---|
| **OpenCTI** | Threat intelligence platform — store, enrich, and correlate STIX2 objects (actors, TTPs, IOCs) |
| **TheHive 5** | Incident response case management — track alerts, cases, and observables |
| **Cortex** | Automated enrichment engine — run analyzers and responders against observables |
| **Elasticsearch 8** | Shared data store powering every service |
| **Kibana (SIEM)** | Detection dashboards, alert triage, timeline investigation |
| **Logstash** | Log ingestion pipeline — Beats, syslog, and custom inputs |
| **MinIO** | S3-compatible object storage for file attachments |
| **RabbitMQ** | Message broker for OpenCTI async workers |

## Who this is for

- CTI analysts who want a realistic platform for practising threat actor research and IOC enrichment
- Detection engineers who want to chain intelligence → alerts → cases end-to-end
- Security researchers building and testing new Cortex analyzers or OpenCTI connectors

## Lab architecture

```
                    ┌──────────────────────────────────────────────────────┐
                    │                  cti-net (Docker bridge)              │
                    │                                                        │
  ┌───────────────┐ │  ┌─────────────┐   ┌──────────────┐  ┌───────────┐  │
  │   Analyst     │ │  │   OpenCTI   │   │   TheHive 5  │  │  Cortex   │  │
  │  (Browser)    │─┼─▶│   :8080     │   │    :9100     │  │  :9002    │  │
  └───────────────┘ │  └──────┬──────┘   └──────┬───────┘  └─────┬─────┘  │
                    │         │                  │                │        │
                    │  ┌──────▼──────────────────▼────────────────▼──────┐  │
                    │  │          Elasticsearch 8.x   :9200              │  │
                    │  └──────────────────────────────────────────────────┘  │
                    │                                                        │
                    │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │
                    │  │  Redis   │  │ RabbitMQ │  │  MinIO (S3)  :9000   │ │
                    │  └──────────┘  └──────────┘  └──────────────────────┘ │
                    │                                                        │
                    │  ┌─────────────────────────┐  ┌──────────────────────┐│
                    │  │  Kibana SIEM  :5601      │  │  Logstash  :5044     ││
                    │  └─────────────────────────┘  └──────────────────────┘│
                    └──────────────────────────────────────────────────────┘
```

## Navigation

- **[Architecture](architecture)** — detailed design decisions and data flows
- **[Prerequisites](prerequisites)** — host requirements and dependencies
- **[Quick Start](quick-start)** — up and running in 10 minutes
- **[Services](services/elasticsearch)** — per-service configuration reference
- **[First-Run Setup](setup/first-run)** — post-startup configuration steps
- **[Integrations](integrations/opencti-thehive)** — wiring services together
- **[Workflows](workflows/ioc-triage)** — hands-on CTI practice guides
