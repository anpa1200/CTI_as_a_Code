---
id: first-run
title: First-Run Checklist
sidebar_position: 1
---

# First-Run Checklist

Run through this list after [`docker compose`](https://docs.docker.com/compose/) `up -d` and `./scripts/setup.sh` complete successfully.

## 1. Elasticsearch

```bash
curl -u "elastic:${ELASTIC_PASSWORD}" http://localhost:9200/_cluster/health?pretty
```

Expected: `"status": "yellow"` (single-node, normal)

## 2. Kibana

- Open http://localhost:5601
- Log in with `elastic` / `ELASTIC_PASSWORD`
- Navigate to **Security** — the [Elastic SIEM](/docs/services/elastic-siem) tile should appear without errors

## 3. OpenCTI

- Open http://localhost:8080
- Log in with `OPENCTI_ADMIN_EMAIL` / `OPENCTI_ADMIN_PASSWORD`
- Go to **Settings → Parameters** — check platform status is green (see [OpenCTI setup](/docs/setup/opencti-setup))

If OpenCTI shows a red status on any dependency, run:
```bash
docker compose logs opencti | tail -50
```

## 4. TheHive

- Open http://localhost:9100
- Complete the first-login wizard: [TheHive setup →](/setup/thehive-setup)

## 5. Cortex

- Open http://localhost:9002
- Complete the first-login wizard: [Cortex setup →](/setup/cortex-setup)

## 6. MinIO

- Open http://localhost:9001
- Log in with `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`
- Verify buckets `opencti` and `thehive` exist under **Buckets**

## 7. RabbitMQ

- Open http://localhost:15672
- Log in with `RABBITMQ_DEFAULT_USER` / `RABBITMQ_DEFAULT_PASS`
- **Overview** tab should show all connections healthy

## Post-check script

```bash
./scripts/health-check.sh
```

All lines should show `✓  HTTP 200`.

## Common startup issues

### Elasticsearch exits immediately

Check `vm.max_map_count`:

```bash
sysctl vm.max_map_count
# Should be 262144
sudo sysctl -w vm.max_map_count=262144
```

### OpenCTI shows "Platform is not ready"

OpenCTI requires all of its dependencies to be healthy before fully starting. Wait 2–3 minutes and reload. If persistent:

```bash
docker compose restart opencti
```

### TheHive cannot reach Elasticsearch

Verify the `ELASTIC_PASSWORD` env var is set correctly in `.env` and that the [`thehive`](/docs/services/thehive-cortex) service can reach [`elasticsearch:9200`](/docs/services/elasticsearch):

```bash
docker exec cti-thehive curl -su "elastic:${ELASTIC_PASSWORD}" http://elasticsearch:9200/_cluster/health
```

### MinIO buckets missing

Re-run the bucket creation step manually:

```bash
docker run --rm --network cti-lab_cti-net minio/mc:latest sh -c "
  mc alias set lab http://minio:9000 '${MINIO_ROOT_USER}' '${MINIO_ROOT_PASSWORD}' --quiet
  mc mb --ignore-existing lab/opencti
  mc mb --ignore-existing lab/thehive
"
```

---

## Ecosystem

This page is part of the [initial setup](/docs/setup/first-run) flow. See the full [ecosystem](/docs/ecosystem) overview or visit the [CTI Portfolio](https://anpa1200.github.io/cti.html).
