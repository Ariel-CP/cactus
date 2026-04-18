#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${1:-$HOME/cactus}"
BACKUP_DIR="${2:-$HOME/cactus-backups}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

cd "${PROJECT_DIR}"

mkdir -p "${BACKUP_DIR}"

set -a
source .env
set +a

OUTPUT_FILE="${BACKUP_DIR}/cactus-${TIMESTAMP}.sql.gz"

echo "Creating backup at ${OUTPUT_FILE}"
docker compose exec -T db pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" | gzip > "${OUTPUT_FILE}"

echo "Backup complete"
