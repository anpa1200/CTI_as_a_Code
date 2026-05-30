---
id: threat-feeds
title: Threat Feeds
sidebar_position: 2
---

# Threat Feeds and Data Sources

Populate the lab with real threat intelligence by connecting external feeds. See the [ecosystem](/docs/ecosystem) for how feeds fit into the overall [lab stack](/docs/architecture).

## [OpenCTI](https://www.opencti.io/) connectors

### MITRE ATT&CK (included)

```bash
docker compose --profile connectors up -d connector-mitre
```

Provides: attack patterns, groups, software, campaigns, mitigations.

### MISP OSINT feed

Add to `docker-compose.yml`:

```yaml
connector-misp-feed:
  image: opencti/connector-misp-feed:6.4.1
  environment:
    - OPENCTI_URL=http://opencti:8080
    - OPENCTI_TOKEN=${OPENCTI_ADMIN_TOKEN}
    - CONNECTOR_ID=<uuid>
    - CONNECTOR_NAME=MISP Feed OSINT
    - CONNECTOR_SCOPE=indicator
    - MISP_FEED_URL=https://www.circl.lu/doc/misp/feed-osint/
    - MISP_FEED_SSL_VERIFY=true
    - MISP_FEED_IMPORT_FROM_DATE=2024-01-01
    - MISP_FEED_INTERVAL=60
  profiles: [connectors]
  networks: [cti-net]
  depends_on: [opencti]
  restart: unless-stopped
```

### AlienVault OTX

Requires a free OTX API key (https://otx.alienvault.com):

```yaml
connector-alienvault:
  image: opencti/connector-alienvault:6.4.1
  environment:
    - OPENCTI_URL=http://opencti:8080
    - OPENCTI_TOKEN=${OPENCTI_ADMIN_TOKEN}
    - CONNECTOR_ID=<uuid>
    - CONNECTOR_NAME=AlienVault OTX
    - ALIENVAULT_BASE_URL=https://otx.alienvault.com
    - ALIENVAULT_API_KEY=${OTX_API_KEY}
    - ALIENVAULT_INTERVAL=24
    - ALIENVAULT_TLP=White
  profiles: [connectors]
  networks: [cti-net]
  depends_on: [opencti]
  restart: unless-stopped
```

Add `OTX_API_KEY=<your-key>` to `.env`.

## [Elastic SIEM](/docs/services/elastic-siem) threat intelligence feeds

[Kibana](/docs/services/elastic-siem)'s **Threat Intelligence** module can ingest STIX/TAXII feeds directly:

1. **Security → Intelligence → Add new data source**
2. Select **TAXII** or **Manual upload**
3. Point at an ISAC TAXII server or import a STIX bundle

Built-in indicator match rules in Kibana will fire when logs contain indicators from these feeds.

## Free TAXII feeds

| Feed | URL | Notes |
|---|---|---|
| CIRCL MISP | https://www.circl.lu/doc/misp/feed-osint/ | MISP JSON format |
| Abuse.ch MalwareBazaar | https://mb-api.abuse.ch/api/v1/ | Hashes |
| Feodo Tracker | https://feodotracker.abuse.ch/downloads/ipblocklist.json | C2 IPs |
| ThreatFox | https://threatfox.abuse.ch/export/ | IOCs by malware family |

## MISP integration (optional)

If you add a standalone MISP instance to the lab, connect it bidirectionally:
- [OpenCTI](/docs/services/opencti) → MISP: via `opencti/connector-misp` (export)
- MISP → OpenCTI: via `opencti/connector-misp-feed` (import)

A full MISP [Docker Compose](https://docs.docker.com/compose/) deployment guide: https://github.com/MISP/misp-docker

---

## Ecosystem

See the full [ecosystem](/docs/ecosystem) overview, the [OpenCTI-TheHive integration](/docs/integrations/opencti-thehive) for how feeds connect to cases, or visit the [CTI Portfolio](https://anpa1200.github.io/cti.html).
