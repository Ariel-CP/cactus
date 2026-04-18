# Cactus

Sistema para administrar un micro emprendimiento de produccion y venta de perfumes y otros articulos.

## Stack

- Backend: FastAPI + SQLAlchemy + PostgreSQL
- Frontend: React + Vite + TypeScript (PWA base)
- Infra: Docker Compose

## Requisitos

- Docker + Docker Compose
- VS Code con extensiones recomendadas

## Entorno recomendado (equipo)

- Desarrollo remoto con VS Code Remote-SSH a la Raspberry.
- Flujo de ramas simple: `main` para estable y ramas cortas por feature.
- Commits con convencion semantica (feat, fix, docs, chore).
- Secretos solo en `.env` local, nunca en Git.

## Inicio rapido

1. Copiar variables de entorno:
   - `cp .env.example .env`
2. Ajustar secretos en `.env`.
3. Levantar servicios:
   - `docker compose up --build`
4. Accesos:
   - Frontend: `http://localhost:3000`
   - API docs: `http://localhost:8000/docs`
5. Probar autenticacion:
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `GET /api/auth/me` (Bearer token)

## Despliegue en Raspberry (recomendado)

1. Seguir la guia:
   - `docs/raspberry-ssh-and-deploy.md`
2. Provisionar Raspberry:
   - `./scripts/raspberry/bootstrap.sh`
3. Desplegar en modo produccion con proxy:
   - `./scripts/raspberry/deploy.sh ~/cactus prod`
4. Acceso unico por proxy:
   - `http://<raspberry-ip>/` (frontend)
   - `http://<raspberry-ip>/api/health` (api)

## Estructura

- `backend/`: API y logica de negocio
- `frontend/`: interfaz PWA
- `infra/`: configuraciones de despliegue
- `docs/`: documentacion de arquitectura y operacion

## Operacion

- Backup de base:
   - `./scripts/raspberry/backup-postgres.sh ~/cactus ~/cactus-backups`

## Siguientes pasos

- Implementar autenticacion y roles
- Implementar modulos de inventario y produccion por lotes
- Agregar pruebas y CI
