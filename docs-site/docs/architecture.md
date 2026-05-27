---
id: architecture
title: Architecture
sidebar_position: 2
---

# Architecture

## Design principles

- **Single Docker Compose file** — every service defined in one place, no Kubernetes overhead
- **Shared Elasticsearch** — one ES cluster serves OpenCTI, TheHive, Cortex, and Kibana SIEM; avoids running three separate JVMs
- **Profiles for optional services** — connectors and Logstash are opt-in (`--profile connectors`, `--profile logstash`)
- **Environment-variable secrets** — all passwords and tokens live in `.env`, never committed to git
- **MinIO as shared object store** — both OpenCTI (file observables) and TheHive (case attachments) use the same MinIO instance with separate buckets

## Network topology

All containers share a single Docker bridge network (`cti-net`). Services communicate by container hostname (service name). Only the ports listed below are bound to the host.

```
Host port  →  Container     Service
─────────────────────────────────────────────────────
8080       →  opencti:8080  OpenCTI platform
5601       →  kibana:5601   Kibana / Elastic SIEM
9200       →  elastic:9200  Elasticsearch (debug access)
9100       →  thehive:9000  TheHive 5
9002       →  cortex:9001   Cortex
9000       →  minio:9000    MinIO S3 API
9001       →  minio:9001    MinIO web console
15672      →  rabbit:15672  RabbitMQ management UI
5672       →  rabbit:5672   RabbitMQ AMQP
5044       →  logstash:5044 Beats input (profile: logstash)
9600       →  logstash:9600 Logstash API (profile: logstash)
```

## Data flows

### Threat intelligence ingestion (OpenCTI)

```
MITRE ATT&CK connector
  → RabbitMQ queue
    → opencti-worker (2 replicas)
      → Elasticsearch index (opencti-*)
        → OpenCTI API
```

The worker containers pull jobs from RabbitMQ and write STIX2 objects to Elasticsearch. Workers are stateless — scale by increasing `replicas`.

### Case management (TheHive + Cortex)

```
Alert arrives → TheHive case created → Observable added
  → Cortex analyzer triggered
    → Docker: runs analyzer container with observable
      → Result written back to TheHive as task log
```

Cortex requires access to `/var/run/docker.sock` to launch analyzer images as sibling containers.

### Detection (Elastic SIEM)

```
Filebeat/Winlogbeat on endpoint
  → Logstash :5044 (parse + enrich)
    → Elasticsearch index (cti-lab-logs-YYYY.MM.dd)
      → Kibana Security rules engine
        → Alert → Timeline
```

### Storage

| Service | Elasticsearch index prefix | MinIO bucket | Local volume |
|---|---|---|---|
| OpenCTI | `opencti-*` | `opencti` | — |
| TheHive | `thehive` | `thehive` | `thehivedata:/data/db` |
| Cortex | `cortex` | — | `cortexjobs:/tmp/cortex-jobs` |
| Kibana SIEM | `.siem-signals-*`, `cti-lab-logs-*` | — | — |

## Resource allocation

| Container | JVM / Node heap | Typical RSS |
|---|---|---|
| Elasticsearch | 2 GB (`ES_JAVA_OPTS`) | 3–4 GB |
| Kibana | 1 GB (Node.js) | 1.5 GB |
| OpenCTI | 8 GB Node old-space (`NODE_OPTIONS`) | 1–2 GB |
| TheHive | 1 GB (`JVM_OPTS`) | 1.5 GB |
| Cortex | 1 GB (`JVM_OPTS`) | 1 GB |
| Logstash | 512 MB (`LS_JAVA_OPTS`) | 800 MB |

**Total: ~12–14 GB. Minimum host RAM: 16 GB.**

Tune by editing the `*_OPTS` environment variables in `docker-compose.yml`.
