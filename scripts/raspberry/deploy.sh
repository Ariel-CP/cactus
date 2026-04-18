#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${1:-$HOME/cactus}"
MODE="${2:-prod}"

if [[ ! -d "${PROJECT_DIR}" ]]; then
  echo "Project directory not found: ${PROJECT_DIR}"
  exit 1
fi

cd "${PROJECT_DIR}"

if [[ ! -f ".env" ]]; then
  echo "Missing .env. Create it from .env.example before deploying."
  exit 1
fi

echo "Pulling latest changes"
git pull --ff-only

echo "Building and starting services"
if [[ "${MODE}" == "prod" ]]; then
  docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
else
  docker compose up -d --build
fi

echo "Current service status"
docker compose ps
