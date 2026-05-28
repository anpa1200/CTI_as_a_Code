#!/usr/bin/env bash
# health-check.sh — Report status of all CTI Lab services

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a; source "$ROOT_DIR/.env"; set +a
fi

ELASTIC_PASSWORD="${ELASTIC_PASSWORD:-}"

pad() { printf "%-22s" "$1"; }

check() {
  local name="$1"
  local url="$2"
  local auth="${3:-}"
  local result

  if [[ -n "$auth" ]]; then
    result=$(curl -sf -u "$auth" "$url" -o /dev/null -w "%{http_code}" 2>/dev/null || echo "000")
  else
    result=$(curl -sf "$url" -o /dev/null -w "%{http_code}" 2>/dev/null || echo "000")
  fi

  if [[ "$result" == "200" || "$result" == "302" ]]; then
    echo "$(pad "$name") ✓  HTTP $result"
  else
    echo "$(pad "$name") ✗  HTTP $result  (unreachable or unhealthy)"
  fi
}

# GraphQL endpoints require POST; a 200 response (even with auth error in body) means the API is up
check_post() {
  local name="$1"
  local url="$2"
  local result
  result=$(curl -s -X POST -H "Content-Type: application/json" \
    -d '{"query":"{ about { version } }"}' \
    "$url" -o /dev/null -w "%{http_code}" 2>/dev/null || echo "000")
  if [[ "$result" == "200" ]]; then
    echo "$(pad "$name") ✓  HTTP $result"
  else
    echo "$(pad "$name") ✗  HTTP $result  (unreachable or unhealthy)"
  fi
}

echo ""
echo "CTI Lab — Service Health Check"
echo "────────────────────────────────────────"
check "Elasticsearch"  "http://localhost:9200/_cluster/health"  "elastic:${ELASTIC_PASSWORD}"
check "Kibana"         "http://localhost:5601/api/status"       "elastic:${ELASTIC_PASSWORD}"
check_post "OpenCTI"   "http://localhost:8080/graphql"
check "TheHive"        "http://localhost:9100/api/status"
check "Cortex"         "http://localhost:9002/api/status"
check "MinIO (API)"    "http://localhost:9000/minio/health/live"
check "MinIO (UI)"     "http://localhost:9001"
check "RabbitMQ"       "http://localhost:15672"
check "Logstash API"   "http://localhost:9600"
echo "────────────────────────────────────────"
echo ""

echo "Docker container status:"
docker compose -f "$ROOT_DIR/docker-compose.yml" ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || \
  echo "(run from project root or ensure docker compose is in PATH)"
echo ""
