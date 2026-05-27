#!/usr/bin/env bash
# reset.sh — Tear down CTI Lab and wipe all persistent volumes.
# WARNING: This permanently deletes all lab data.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo ""
echo "  !! WARNING: This will DESTROY all CTI Lab data !!"
echo "  Volumes: Elasticsearch indices, OpenCTI data, TheHive cases,"
echo "           Cortex jobs, MinIO objects, Redis cache, RabbitMQ queues."
echo ""
read -r -p "Type 'yes' to confirm: " confirm
[[ "$confirm" == "yes" ]] || { echo "Aborted."; exit 0; }

echo ""
echo "[*] Stopping all containers (including all profiles)..."
docker compose \
  --profile connectors \
  --profile logstash \
  -f "$ROOT_DIR/docker-compose.yml" \
  down --volumes --remove-orphans

echo "[✓] All containers stopped and volumes removed."
echo ""
echo "    Run 'docker compose up -d' and './scripts/setup.sh' to start fresh."
echo ""
