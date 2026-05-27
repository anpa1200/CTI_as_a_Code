#!/usr/bin/env bash
# setup.sh — One-time post-startup configuration for CTI Lab
# Run once after: docker compose up -d
# Usage: ./scripts/setup.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Load .env
if [[ ! -f "$ROOT_DIR/.env" ]]; then
  echo "[ERROR] .env not found. Copy .env.example to .env and fill in all values."
  exit 1
fi
set -a; source "$ROOT_DIR/.env"; set +a

ES_URL="http://localhost:9200"
MINIO_URL="http://localhost:9000"

# ── Helpers ──────────────────────────────────────────────────────────────────

log()  { echo "[*] $*"; }
ok()   { echo "[✓] $*"; }
fail() { echo "[✗] $*" >&2; exit 1; }

wait_for_url() {
  local url="$1"
  local name="$2"
  local max=30
  local count=0
  log "Waiting for $name ($url)..."
  until curl -sf "$url" > /dev/null 2>&1; do
    sleep 5
    count=$((count + 1))
    [[ $count -ge $max ]] && fail "$name did not become ready after $((max * 5))s"
    printf "  . "
  done
  echo ""
  ok "$name is ready."
}

wait_for_es() {
  log "Waiting for Elasticsearch..."
  local max=30
  local count=0
  until curl -sf -u "elastic:${ELASTIC_PASSWORD}" \
      "${ES_URL}/_cluster/health" 2>/dev/null \
      | grep -qE '"status":"(green|yellow)"'; do
    sleep 5
    count=$((count + 1))
    [[ $count -ge $max ]] && fail "Elasticsearch did not become healthy after $((max * 5))s"
    printf "  . "
  done
  echo ""
  ok "Elasticsearch is healthy."
}

# ── Step 1: Wait for Elasticsearch ───────────────────────────────────────────
wait_for_es

# ── Step 2: Set kibana_system password ───────────────────────────────────────
log "Setting kibana_system user password..."
response=$(curl -sf -X POST \
  -u "elastic:${ELASTIC_PASSWORD}" \
  -H "Content-Type: application/json" \
  "${ES_URL}/_security/user/kibana_system/_password" \
  -d "{\"password\":\"${KIBANA_SYSTEM_PASSWORD}\"}" 2>&1) || fail "Failed to set kibana_system password: $response"
ok "kibana_system password set."

# ── Step 3: Wait for MinIO and create buckets ─────────────────────────────────
wait_for_url "$MINIO_URL/minio/health/live" "MinIO"

log "Creating MinIO buckets (opencti, thehive)..."
docker run --rm \
  --network cti-lab_cti-net \
  --entrypoint sh \
  minio/mc:latest -c "
    mc alias set lab http://minio:9000 '${MINIO_ROOT_USER}' '${MINIO_ROOT_PASSWORD}' --quiet
    mc mb --ignore-existing lab/opencti
    mc mb --ignore-existing lab/thehive
  "
ok "MinIO buckets ready."

# ── Step 4: Create Elasticsearch index template for Logstash ─────────────────
log "Creating Logstash index template..."
curl -sf -X PUT \
  -u "elastic:${ELASTIC_PASSWORD}" \
  -H "Content-Type: application/json" \
  "${ES_URL}/_index_template/cti-lab-logs" \
  -d '{
    "index_patterns": ["cti-lab-logs-*"],
    "template": {
      "settings": {
        "number_of_shards": 1,
        "number_of_replicas": 0
      }
    },
    "priority": 1
  }' > /dev/null
ok "Logstash index template created."

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════════"
echo " CTI Lab Setup Complete"
echo "══════════════════════════════════════════════════════"
echo ""
echo "  OpenCTI    →  http://localhost:8080"
echo "               user: ${OPENCTI_ADMIN_EMAIL}"
echo ""
echo "  Kibana      →  http://localhost:5601"
echo "               user: elastic"
echo ""
echo "  TheHive     →  http://localhost:9100"
echo "               (create admin on first login)"
echo ""
echo "  Cortex      →  http://localhost:9002"
echo "               (create admin on first login)"
echo ""
echo "  MinIO       →  http://localhost:9001"
echo "               user: ${MINIO_ROOT_USER}"
echo ""
echo "  RabbitMQ    →  http://localhost:15672"
echo "               user: ${RABBITMQ_DEFAULT_USER}"
echo ""
echo "Next steps:"
echo "  1. Start connectors:  docker compose --profile connectors up -d"
echo "  2. Connect Cortex to TheHive — see docs/setup/cortex-setup.md"
echo "  3. Connect TheHive to OpenCTI — see docs/integrations/opencti-thehive.md"
echo ""
