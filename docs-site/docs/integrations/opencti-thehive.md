---
id: opencti-thehive
title: OpenCTI → TheHive
sidebar_position: 1
---

# OpenCTI → TheHive Integration

This integration enables two workflows:
1. **Push intel to cases** — when a threat actor or campaign is confirmed, push related IOCs from [OpenCTI](/CTI_as_a_Code/services/opencti) into a [TheHive](/CTI_as_a_Code/services/thehive-cortex) case automatically
2. **Enrich observables** — when analysts add observables to TheHive cases, query OpenCTI to see if they match known threat intel

## Method 1: TheHive connector for OpenCTI (recommended)

OpenCTI has a native TheHive connector that creates alerts in TheHive when new STIX indicators appear.

### Configure the connector

Add to `docker-compose.yml` under the `connectors` profile:

```yaml
connector-thehive:
  image: opencti/connector-thehive:6.4.1
  container_name: cti-connector-thehive
  environment:
    - OPENCTI_URL=http://opencti:8080
    - OPENCTI_TOKEN=${OPENCTI_ADMIN_TOKEN}
    - CONNECTOR_ID=<new-uuid>
    - CONNECTOR_NAME=TheHive
    - CONNECTOR_SCOPE=indicator
    - CONNECTOR_LOG_LEVEL=error
    - THEHIVE_URL=http://thehive:9000
    - THEHIVE_API_KEY=${THEHIVE_API_KEY}
    - THEHIVE_ORGANISATION_NAME=CTI-Lab
    - THEHIVE_CREATE_ALERT=true
    - THEHIVE_ALERT_SEVERITY=2
    - THEHIVE_ALERT_TAGS=opencti,auto
  profiles:
    - connectors
  networks:
    - cti-net
  depends_on:
    - opencti
    - thehive
  restart: unless-stopped
```

Add to `.env`:

```bash
THEHIVE_API_KEY=<thehive-api-key-from-setup>
```

Start:

```bash
docker compose --profile connectors up -d connector-thehive
```

### What it creates in TheHive

For each OpenCTI `Indicator` object, the connector creates a TheHive **Alert** with:
- Title: the indicator pattern (e.g., `[ipv4-addr:value = '1.2.3.4']`)
- Tags: `opencti`, source marking (TLP)
- Custom fields: STIX ID, OpenCTI URL
- Severity: configurable via `THEHIVE_ALERT_SEVERITY`

Analysts promote alerts to cases and add [Cortex](/CTI_as_a_Code/services/thehive-cortex) analyzers to enrich them.

## Method 2: Manual export via STIX2

For one-off intelligence sharing:

1. In OpenCTI, navigate to an entity (threat actor, campaign, observable set)
2. **Actions → Export → STIX2 bundle**
3. Import the bundle into TheHive via its API:

```bash
curl -X POST \
  -H "Authorization: Bearer <thehive-api-key>" \
  -H "Content-Type: application/json" \
  "http://localhost:9100/api/v1/alert" \
  -d @stix_export.json
```

## Method 3: OpenCTI Live Streams

OpenCTI supports live streams that external tools can poll for real-time intelligence updates.

1. In OpenCTI: **Settings → Data sharing → Live Streams → Add stream**
2. Configure filters (e.g., only `Indicator` objects with TLP:AMBER)
3. Copy the stream URL
4. Use `opencti-client-python` to subscribe:

```python
from pycti import OpenCTIApiClient

client = OpenCTIApiClient("http://localhost:8080", "<admin-token>")

# Subscribe to stream and push to TheHive
for event in client.stream("<stream-id>"):
    if event["type"] == "create" and event["data"]["type"] == "indicator":
        # push to TheHive...
        pass
```

## Querying OpenCTI from TheHive (observable lookup)

You can manually query OpenCTI from the TheHive observable panel using [Cortex](/CTI_as_a_Code/setup/cortex-setup)'s `OpenCTI_*` analyzers (if installed). These hit the OpenCTI API and return any matching STIX objects.

Enable in Cortex: **Organization → Analyzers → OpenCTI_SimpleObservable_1_0**

Configuration:
- `url`: `http://opencti:8080`
- `token`: `OPENCTI_ADMIN_TOKEN`

---

## Ecosystem

This integration is part of the [lab stack](/CTI_as_a_Code/architecture). See the full [ecosystem](/CTI_as_a_Code/ecosystem) overview or visit the [CTI Portfolio](https://1200km.com/cti.html).
