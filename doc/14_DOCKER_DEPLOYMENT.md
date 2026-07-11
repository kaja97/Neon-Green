# AgriFarm AI — Docker Deployment Guide

## 1. Prerequisites
- Docker Engine installed (v24+)
- Docker Compose plugin installed (v2.20+)
- Environment variables configured (Optional, falls back to defaults for dev)

## 2. Infrastructure Services

### PostgreSQL (with PostGIS & pgvector)
We use a specialized `postgis/postgis:16-3.4` image to support our geospatial farm boundary polygons. 
- **Port:** `5432`
- **Volume:** `pgdata` ensures data persistence across container restarts.
- **Healthcheck:** Ensures FastAPI and Celery wait for the DB to be ready before starting.

### Redis
Used for caching AI context (Context Hashing) and as the Celery message broker.
- **Port:** `6379`
- **Volume:** `redisdata` for persistence.

## 3. Application Services

### Backend (FastAPI)
The modular monolith.
- **Port:** `8000`
- **Volume:** `./backend:/app` allows for hot-reloading (`--reload`) during development.

### Celery Worker
Handles heavy background tasks (AI Plan generation, external weather API fetching).
- Bound to the `core.celery_app` module.
- Uses `-P solo` on Windows-compatible environments to avoid threading issues.

### Celery Beat
Cron scheduler for triggering periodic background tasks (e.g., daily weather updates, midnight activity status sweeps).

### Frontend (Next.js PWA)
- **Port:** `3000`
- **Volume:** `./frontend:/app` for HMR.
- Automatically connects to the backend at `http://localhost:8000/api/v1`.

## 4. Running the Stack

To spin up the entire application stack:
```bash
docker compose up -d
```

To view logs for the background workers:
```bash
docker compose logs -f celery_worker
```

To shut down (preserves data volumes):
```bash
docker compose down
```

To wipe the database and start fresh:
```bash
docker compose down -v
```
