---
id: thehive-cortex
title: TheHive + Cortex
sidebar_position: 3
---

# TheHive 5 + Cortex

TheHive is the incident response case management system. Cortex is the companion automated enrichment engine that runs analyzers against observables.

## TheHive

URL: http://localhost:9100

### Storage

TheHive 5 in this lab uses:
- **JanusGraph + BerkeleyDB** for its graph database (stored in `thehivedata:/data/db`)
- **Elasticsearch** for full-text indexing (`thehive` index)
- **MinIO** (`thehive` bucket) for case file attachments

### Configuration

File: `config/thehive/application.conf` (HOCON format)

Key sections:

```hocon
db.janusgraph {
  storage.backend: berkeleyje       # local embedded DB, suitable for a lab
  index.search.backend: elasticsearch
}

storage.provider: s3                # file attachments go to MinIO
```

Environment variables expected by the container:

| Variable | Source |
|---|---|
| `SECRET` | `THEHIVE_SECRET` from `.env` |
| `ELASTIC_PASSWORD` | Elasticsearch auth |
| `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` | MinIO auth |

### First login

On first visit to http://localhost:9100:
1. Create an organisation (e.g., `CTI-Lab`)
2. Create an admin user
3. Log in with those credentials

See the [TheHive setup guide](/setup/thehive-setup) for the full walkthrough.

---

## Cortex

URL: http://localhost:9002

Cortex runs analyzer Docker images against observables (IPs, domains, hashes, emails, etc.) and returns structured reports back to TheHive.

### Configuration

File: `config/cortex/application.conf`

Key section:

```hocon
search {
  uri      = "http://elasticsearch:9200"
  index    = cortex
  user     = elastic
  password = ${ELASTIC_PASSWORD}
}

job {
  runner = [docker, process]  # runs analyzers as Docker containers
}
```

### Installing analyzers

After first Cortex login and organization creation:

1. Go to **Organization** → **Analyzers**
2. Click **Refresh analyzers** — Cortex will pull the latest Cortex-Analyzers catalog from GitHub
3. Enable analyzers you need (e.g., `VirusTotal_GetReport`, `Shodan_Host`, `AbuseIPDB`, `MISP_2_1`)

For analyzers that require API keys, configure them under the analyzer settings panel.

### Connecting Cortex to TheHive

See the [Cortex setup guide](/setup/cortex-setup).

### Docker socket requirement

Cortex mounts `/var/run/docker.sock` to launch analyzer containers. Your host user must be in the `docker` group:

```bash
sudo usermod -aG docker $USER && newgrp docker
```
