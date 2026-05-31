---
id: opencti
title: OpenCTI
sidebar_position: 2
---

# OpenCTI

[OpenCTI](https://www.opencti.io/) is the core threat intelligence platform. It stores STIX2 objects (threat actors, attack patterns, malware, campaigns, IOCs) and provides a graph-based investigation interface.

## Access

URL: http://localhost:8080  
Default user: value of `OPENCTI_ADMIN_EMAIL` in `.env`

## Services

Three containers make up the OpenCTI stack:

| Container | Role |
|---|---|
| `opencti` | Platform API + frontend (Node.js) |
| `opencti-worker` | Background job processor — pulls from RabbitMQ (×2 replicas) |
| `connector-mitre` | MITRE ATT&CK data importer (profile: `connectors`) |

## Configuration

All settings are passed as environment variables in [`docker-compose.yml`](/docs/architecture). Key variables:

| Variable | Description |
|---|---|
| `APP__ADMIN__TOKEN` | API token used by workers and connectors — must match `OPENCTI_ADMIN_TOKEN` in `.env` |
| `APP__SECRET_KEY` | JWT signing secret — must be a 64-char hex string |
| `ELASTICSEARCH__URL` | `http://elasticsearch:9200` |
| `MINIO__ENDPOINT` | `minio` (service hostname) |
| `RABBITMQ__HOSTNAME` | `rabbitmq` |

## MITRE ATT&CK connector

Start with:

```bash
docker compose --profile connectors up -d
```

On [first run](/docs/setup/first-run), the connector fetches the full STIX2 ATT&CK Enterprise bundle from MITRE. It runs once every 7 days (`MITRE_INTERVAL=7`).

After sync, in OpenCTI you will find:
- **Attack Patterns** — all Enterprise techniques and sub-techniques
- **Intrusion Sets** — known threat actor groups
- **Malware** and **Tools** — software used by groups
- **Campaigns** — attributed campaigns
- **Courses of Action** — mitigations

## Adding more connectors

OpenCTI connectors run as separate containers. To add one, append a service to [`docker-compose.yml`](https://docs.docker.com/compose/):

```yaml
connector-misp-feed:
  image: opencti/connector-misp-feed:6.4.1
  environment:
    - OPENCTI_URL=http://opencti:8080
    - OPENCTI_TOKEN=${OPENCTI_ADMIN_TOKEN}
    - CONNECTOR_ID=<new-uuid>
    - CONNECTOR_NAME=MISP Feed
    - CONNECTOR_SCOPE=indicator
    - MISP_FEED_URL=https://www.circl.lu/doc/misp/feed-osint/
    - MISP_FEED_SSL_VERIFY=true
    - MISP_FEED_IMPORT_FROM_DATE=2023-01-01
    - MISP_FEED_INTERVAL=60
  profiles:
    - connectors
  networks:
    - cti-net
  depends_on:
    - opencti
  restart: unless-stopped
```

A full connector catalog is at: https://github.com/OpenCTI-Platform/connectors

## API access

OpenCTI exposes a GraphQL API at `http://localhost:8080/graphql`. See the [OpenCTI setup](/docs/setup/opencti-setup) page for creating API users. Authenticate with your admin token:

```bash
curl -X POST http://localhost:8080/graphql \
  -H "Authorization: Bearer ${OPENCTI_ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ about { version } }"}'
```

---

## Ecosystem

This service is part of the [lab stack](/docs/architecture). See the full [ecosystem](/docs/ecosystem) overview or visit the [CTI Portfolio](https://anpa1200.github.io/cti.html).
