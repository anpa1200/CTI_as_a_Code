---
id: quick-start
title: Quick Start
sidebar_position: 4
---

# Quick Start

Get the full lab running in under 10 minutes.

## 1. Clone the repository

```bash
git clone https://github.com/anpa1200/CTI_as_a_Code.git
cd CTI_as_a_Code
```

## 2. Configure credentials

```bash
cp .env.example .env
```

Open `.env` and replace every placeholder. At minimum, change all passwords and generate real secrets:

```bash
# Generate a 32-byte hex secret
openssl rand -hex 32

# Generate a UUID
cat /proc/sys/kernel/random/uuid
```

Values to fill in:
- `ELASTIC_PASSWORD` — Elasticsearch `elastic` superuser password
- `KIBANA_SYSTEM_PASSWORD` — internal Kibana service account password
- `KIBANA_ENCRYPTION_KEY` — 32+ character random string
- `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` — MinIO admin credentials
- `RABBITMQ_DEFAULT_USER` / `RABBITMQ_DEFAULT_PASS`
- `OPENCTI_ADMIN_PASSWORD` — your OpenCTI admin login
- `OPENCTI_APP_SECRET` — 64-char hex (use `openssl rand -hex 32`)
- `OPENCTI_ADMIN_TOKEN` — UUID (used by connectors and the worker)
- `CONNECTOR_MITRE_ID` — UUID (unique ID for the MITRE connector)
- `THEHIVE_SECRET` / `CORTEX_SECRET` — 64-char hex each

## 3. Apply kernel tuning

```bash
sudo sysctl -w vm.max_map_count=262144
echo 'vm.max_map_count=262144' | sudo tee -a /etc/sysctl.conf
```

## 4. Start core services

```bash
docker compose up -d
```

This starts: Elasticsearch, Kibana, Redis, RabbitMQ, MinIO, OpenCTI, OpenCTI workers (×2), TheHive, Cortex.

Watch startup progress:

```bash
docker compose logs -f
```

Elasticsearch takes 60–90 seconds on first boot. Wait until you see `green` or `yellow` cluster status before proceeding.

## 5. Run first-time setup

```bash
./scripts/setup.sh
```

This script:
1. Waits for Elasticsearch to be healthy
2. Sets the `kibana_system` user password (required for Kibana to connect)
3. Creates the `opencti` and `thehive` MinIO buckets
4. Creates the Logstash index template

## 6. Verify all services are up

```bash
./scripts/health-check.sh
```

All services should return `HTTP 200` or `HTTP 302`.

## 7. (Optional) Start the MITRE ATT&CK connector

```bash
docker compose --profile connectors up -d
```

The connector will populate OpenCTI with the full MITRE ATT&CK Enterprise matrix (tactics, techniques, groups, software). Initial sync takes 5–10 minutes.

## 8. (Optional) Start Logstash

```bash
docker compose --profile logstash up -d
```

Point Filebeat or Winlogbeat on your endpoints at `<lab-host>:5044`.

## Access the services

| Service | URL | Credentials |
|---|---|---|
| OpenCTI | http://localhost:8080 | `OPENCTI_ADMIN_EMAIL` + `OPENCTI_ADMIN_PASSWORD` from `.env` |
| Kibana SIEM | http://localhost:5601 | `elastic` + `ELASTIC_PASSWORD` |
| TheHive | http://localhost:9100 | Create admin on first visit |
| Cortex | http://localhost:9002 | Create admin on first visit |
| MinIO Console | http://localhost:9001 | `MINIO_ROOT_USER` + `MINIO_ROOT_PASSWORD` |
| RabbitMQ | http://localhost:15672 | `RABBITMQ_DEFAULT_USER` + `RABBITMQ_DEFAULT_PASS` |

## Next steps

1. **[OpenCTI first-run setup](/setup/opencti-setup)** — configure organizations and marking definitions
2. **[TheHive first-run setup](/setup/thehive-setup)** — create an organization and first user
3. **[Connect Cortex to TheHive](/setup/cortex-setup)** — wire up automated enrichment
4. **[Connect OpenCTI to TheHive](/integrations/opencti-thehive)** — push threat intel into cases
5. **[IOC triage workflow](/workflows/ioc-triage)** — put it all together
