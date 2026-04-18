# Cactus Architecture (Initial)

## Goal

Provide a reliable base for a 4-user micro business system running on Raspberry Pi 4.

## Components

- backend: FastAPI app exposing REST endpoints.
- db: PostgreSQL persistent data store.
- frontend: React + Vite static build served by Nginx.

## Runtime

- Local network first.
- Internet exposure postponed.
- Docker Compose orchestrates all services.

## Next Deliverables

- Auth and role model.
- Domain entities and migrations.
- Inventory and production lot workflows.
- Sales and reporting module.
