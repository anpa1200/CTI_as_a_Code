---
id: opencti-setup
title: OpenCTI Setup
sidebar_position: 2
---

# OpenCTI First-Run Setup

## Initial configuration

1. Open http://localhost:8080 and log in with your admin credentials from `.env`
2. Navigate to **Settings → Parameters**
3. Review the platform version and dependency health — all should show green

## Create a marking definition (TLP)

OpenCTI pre-populates TLP markings during the MITRE connector sync. If you start without the connector, create them manually:

**Settings → Customization → Marking Definitions → Add**

| Name | Definition |
|---|---|
| TLP:WHITE | TLP:WHITE |
| TLP:GREEN | TLP:GREEN |
| TLP:AMBER | TLP:AMBER |
| TLP:RED | TLP:RED |

## Create an organization

**Settings → Entities → Organizations → Add**

Create your lab organization (e.g., `CTI Lab`). This becomes the default author for imported data.

Set it as the platform organization: **Settings → Parameters → Platform organization**

## Create API users for integrations

For TheHive and other tools that connect to OpenCTI via API:

1. **Settings → Security → Users → Add User**
2. Name: `TheHive Connector`
3. Role: `Connector`
4. Copy the generated API token — you'll need it in [OpenCTI → TheHive integration](../integrations/opencti-thehive)

## Start the MITRE ATT&CK connector

```bash
docker compose --profile connectors up -d
```

Monitor the connector:

```bash
docker compose logs -f connector-mitre
```

After the initial sync (5–10 min), verify in OpenCTI:
- **Arsenal → Attack Patterns** — should list 200+ techniques
- **Threats → Intrusion Sets** — known APT groups

## Enable Live streams

OpenCTI's live streams allow other platforms (TheHive, MISP) to subscribe to intelligence updates in real time.

**Settings → Data sharing → Live Streams → Add stream**

- Name: `TheHive feed`
- Filters: select the entity types you want to push to cases
- Visibility: `Public`

Copy the stream ID — you'll use it in the [TheHive integration](../integrations/opencti-thehive).
