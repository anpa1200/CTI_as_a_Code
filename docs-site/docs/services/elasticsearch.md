---
id: elasticsearch
title: Elasticsearch
sidebar_position: 1
---

# Elasticsearch

Elasticsearch 8.x acts as the shared data store for every service in the lab: OpenCTI, TheHive, Cortex, and Kibana SIEM.

## Configuration

File: `config/elasticsearch/elasticsearch.yml`

Key settings:

| Setting | Value | Reason |
|---|---|---|
| `discovery.type: single-node` | single-node | Lab only — disables cluster health waiting |
| `xpack.security.enabled: true` | true | Enables authentication for all access |
| `xpack.security.http.ssl.enabled: false` | false | Plain HTTP inside Docker network |
| `xpack.license.self_generated.type: basic` | basic | Enables SIEM features without paid license |
| `ES_JAVA_OPTS=-Xms2g -Xmx2g` | 2 GB | Tune to available RAM (host RAM ÷ 4) |

## Credentials

The `elastic` superuser password is set via the `ELASTIC_PASSWORD` environment variable at first container startup. If you change it after the fact, you must use the Elasticsearch API:

```bash
curl -X POST -u "elastic:OLD_PASSWORD" \
  -H "Content-Type: application/json" \
  "http://localhost:9200/_security/user/elastic/_password" \
  -d '{"password":"NEW_PASSWORD"}'
```

## Indices used per service

| Index prefix | Service |
|---|---|
| `opencti-*` | OpenCTI (STIX objects, graph) |
| `thehive` | TheHive (cases, observables, alerts) |
| `cortex` | Cortex (job history) |
| `.kibana*` | Kibana saved objects |
| `.siem-signals-*` | Kibana SIEM detection alerts |
| `cti-lab-logs-*` | Logstash (ingested logs) |

## Health check

```bash
curl -u "elastic:${ELASTIC_PASSWORD}" http://localhost:9200/_cluster/health?pretty
```

Expected output:

```json
{
  "cluster_name" : "cti-lab",
  "status" : "yellow",
  "number_of_nodes" : 1,
  ...
}
```

`yellow` is normal for a single-node cluster (replica shards cannot be assigned).

## Useful queries

```bash
# List all indices
curl -u "elastic:$ELASTIC_PASSWORD" "http://localhost:9200/_cat/indices?v"

# OpenCTI index sizes
curl -u "elastic:$ELASTIC_PASSWORD" "http://localhost:9200/_cat/indices/opencti-*?v&s=store.size:desc"

# Check a specific index
curl -u "elastic:$ELASTIC_PASSWORD" "http://localhost:9200/thehive/_stats/store?pretty"
```
