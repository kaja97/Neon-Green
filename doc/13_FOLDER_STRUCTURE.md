# AgriFarm AI — Project Folder Structure & Codebase Organization

## Overview
This document defines the exact folder structure for the entire AgriFarm AI codebase. It covers the backend (FastAPI), frontend (Next.js), and shared configuration.

---

## Root Directory

```
agrifarm-ai/
├── backend/                          ← FastAPI Python backend
├── frontend/                         ← Next.js 14 web app
├── docker/                           ← Docker configs
├── doc/                              ← Documentation files
├── scripts/                          ← Dev utility scripts
├── .github/                          ← CI/CD workflows
├── docker-compose.yml                ← Local dev: PostgreSQL + Redis + Backend + Chat + Frontend
├── docker-compose.prod.yml           ← Production compose
├── .env.example                      ← Template for environment variables
├── .gitignore
├── Makefile                          ← Convenience commands
└── README.md                         ← Project quickstart
```

---

## Backend Structure

```
backend/
├── main.py                           ← FastAPI app entry, mounts all routers
├── config.py                         ← Pydantic BaseSettings (env vars)
├── database.py                       ← SQLAlchemy async engine + session factory
├── dependencies.py                   ← Shared deps: get_db, get_current_user, get_ai_service
├── exceptions.py                     ← [NOT IMPLEMENTED / REPLACED] (errors are in core/errors)
├── middleware.py                      ← [NOT IMPLEMENTED / REPLACED] (CORS middleware is in main.py)
│
├── core/                             ← Shared infrastructure helpers
│   ├── __init__.py
│   └── cache.py                      ← Redis helpers: get_dashboard_cache, invalidate_dashboard_cache
│                                        setex wrapper, DASHBOARD_CACHE_KEY, TTL constants
│
├── models/                           ← SQLAlchemy ORM models (shared across modules)
│   ├── __init__.py                   ← Exports all models for Alembic
│   ├── base.py                       ← Base model class (id, created_at, updated_at)
│   ├── account.py                    ← Account, FarmerProfile, VendorProfile, BuyerProfile
│   ├── farmer.py                     ← FarmerLocation, FarmerLandDetail, FarmerLivestock
│   ├── project.py                    ← Project, ProjectService
│   ├── plant.py                      ← Plant, PlantStage, PlantNutrientReq, PlantWaterReq
│   ├── plant_health.py               ← PlantDisease, DiseaseSolution, PlantPest, PestSolution
│   ├── plant_fertilizer.py           ← PlantFertilizerRecommendation
│   ├── activity.py                   ← ActivityPlan, FarmingActivity, ActivityDetail
│   ├── soil.py                       ← SoilTest, SoilNutrientResult, SoilRecommendation
│   ├── weather.py                    ← WeatherCache, WeatherAlert
│   ├── issue.py                      ← ProjectIssue
│   ├── market.py                     ← MarketPrice, MarketTrend
│   ├── notification.py               ← Notification
│   ├── ai.py                         ← AIProjectSummary, AIConversation, AIQueryLog
│   └── marketplace.py                ← VendorProduct, HarvestListing, Order, OrderItem (future)
│
├── modules/                          ← Feature modules (each has router + service + schemas)
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── router.py                 ← POST /auth/register, /auth/login, /auth/refresh, GET /auth/me
│   │   ├── service.py                ← hash_password, verify_password, create_tokens, validate_token
│   │   ├── schemas.py                ← RegisterRequest, LoginRequest, TokenResponse
│   │   └── utils.py                  ← JWT encode/decode helpers
│   │
│   ├── farmer/
│   │   ├── __init__.py
│   │   ├── router.py                 ← CRUD: profile, locations, land details
│   │   ├── service.py                ← Profile management, location validation
│   │   └── schemas.py                ← FarmerProfileResponse, LocationCreate, LandDetailCreate
│   │
│   ├── project/
│   │   ├── __init__.py
│   │   ├── router.py                 ← POST /projects, GET /projects/{id}/dashboard
│   │   ├── service.py                ← create_project (triggers plan generation), dashboard aggregation
│   │   ├── schemas.py                ← ProjectCreate, ProjectDashboard, FarmingCircleResponse
│   │   └── dashboard.py              ← Aggregation logic: combine weather + soil + activities + AI
│   │
│   ├── planner/
│   │   ├── __init__.py
│   │   ├── router.py                 ← GET /planner/{id}/today, PATCH /activities/{id}/complete
│   │   │                                Calls invalidate_dashboard_cache() on complete/skip mutations
│   │   ├── service.py                ← get_today, mark_complete, mark_skip
│   │   ├── schemas.py                ← ActivityResponse, CompleteRequest, SkipRequest
│   │   └── engine.py                 ← generate_season_plan() — pure async, NO Celery import
│   │                                    Includes pre-flight stage gap detection + auto-patch
│   │                                    Includes build_generic_stages() 3-stage fallback
│   │
│   ├── weather/
│   │   ├── __init__.py
│   │   ├── router.py                 ← GET /weather/{project_id}, GET /weather/{id}/alerts
│   │   ├── service.py                ← fetch_forecast, cache_weather, generate_alerts
│   │   ├── schemas.py                ← WeatherForecast, WeatherAlertResponse
│   │   ├── client.py                 ← OpenWeatherMap API client (free tier)
│   │   └── rules.py                  ← Deterministic adjustment rules (rain → skip watering, etc.)
│   │
│   ├── soil/
│   │   ├── __init__.py
│   │   ├── router.py                 ← POST /soil/tests, GET /soil/recommendations/{id}
│   │   ├── service.py                ← submit_test, compute_recommendations
│   │   ├── schemas.py                ← SoilTestCreate, SoilRecommendationResponse
│   │   └── calculator.py             ← Deterministic nutrient gap calculator
│   │
│   ├── disease/
│   │   ├── __init__.py
│   │   ├── router.py                 ← POST /issues, GET /disease/search
│   │   ├── service.py                ← report_issue, match_disease, get_solutions
│   │   ├── schemas.py                ← IssueCreate, DiseaseMatchResponse, SolutionResponse
│   │   └── matcher.py                ← PostgreSQL full-text search + ts_rank matching
│   │
│   ├── market/
│   │   ├── __init__.py
│   │   ├── router.py                 ← GET /market/prices/{plant_id}, GET /market/trends
│   │   ├── service.py                ← get_prices, compute_trends, revenue_calculator
│   │   └── schemas.py                ← PriceResponse, TrendResponse, RevenueEstimate
│   │
│   ├── ai/
│   │   ├── __init__.py
│   │   ├── router.py                 ← POST /ai/summary/{id}, POST /ai/chat
│   │   ├── service.py                ← get_ai_summary, chat, safe_ai_call with fallback
│   │   │                                Uses get_or_generate_ai_summary() with context hashing
│   │   ├── schemas.py                ← AISummaryResponse, ChatRequest, ChatResponse
│   │   ├── context_builder.py        ← build_project_context() — flatten all tables to JSON
│   │   ├── prompts.py                ← System prompts: SUMMARY_PROMPT, QA_PROMPT, DIAGNOSIS_PROMPT
│   │   ├── gemini_client.py          ← Google AI Studio SDK wrapper (free tier)
│   │   ├── intent_classifier.py      ← Regex-based: route weather/price/schedule to deterministic
│   │   ├── rate_limiter.py           ← 3-bucket daily quota: chat(5) / refresh(3) / diagnosis(2)
│   │   │                                AICallType enum, check_quota(), consume_quota() via Redis
│   │   └── response_parser.py        ← Extract insights from AI response → update DB
│   │
│   └── notification/
│       ├── __init__.py
│       ├── router.py                 ← GET /notifications, PATCH /{id}/read
│       ├── service.py                ← create_notification, send_push, mark_read
│       ├── schemas.py                ← NotificationResponse
│       └── push.py                   ← Web Push VAPID implementation
│
├── tasks/                            ← Celery background tasks
│   ├── __init__.py
│   ├── celery_app.py                 ← Celery app config (broker=Redis)
│   │                                    Supports CELERY_EAGER_MODE env var for local testing without Docker
│   ├── weather_tasks.py              ← refresh_weather_cache, adjust_plan_for_weather, check_alerts
│   │                                    Calls invalidate_dashboard_cache() after activity adjustments
│   ├── planner_tasks.py              ← generate_season_plan_task — THIN WRAPPER only
│   │                                    All logic is in modules/planner/engine.py (testable without Celery)
│   │                                    Uses max_retries=3, exponential backoff
│   ├── notification_tasks.py         ← send_daily_notifications (5:30 AM)
│   ├── market_tasks.py               ← compute_market_trends (daily)
│   └── ai_tasks.py                   ← generate_weekly_ai_summary (Sunday 6 AM)
│                                        Throttled: 4-second delay between calls to stay under 15 RPM
│
├── seed/                             ← Database seed data
│   ├── __init__.py
│   ├── run_seed.py                   ← Master seed runner: python -m backend.seed.run_seed
│   │                                    Calls validator.py after seeding — fails loud on data errors
│   ├── validator.py                  ← [NEW] Seed data validation suite:
│   │                                    validate_plant_stages() — checks start/end day continuity
│   │                                    validate_fertilizer_coverage() — organic+conventional exists
│   │                                    validate_water_requirements() — every stage has water data
│   │                                    run_all_validations() — fails with SystemExit(1) on errors
│   ├── farming_methods.py            ← 3 records
│   ├── plants.py                     ← 5 crops
│   ├── stages.py                     ← 30 records (6 per crop)
│   ├── nutrients.py                  ← 30 records
│   ├── water.py                      ← 30 records
│   ├── fertilizers.py                ← ~60 records (organic + conventional)
│   ├── diseases.py                   ← ~40 records (8-10 per crop)
│   ├── solutions.py                  ← ~80 records (2 per disease per method)
│   └── pests.py                      ← ~30 records
│
├── migrations/                       ← Alembic database migrations
│   ├── alembic.ini
│   ├── env.py
│   └── versions/
│       ├── 001_initial_schema.py     ← All v1.0 tables
│       └── 002_ai_context_hash.py    ← [NEW] Adds context_hash VARCHAR(32) to ai_project_summaries
│                                        Enables deduplication: skip Gemini if context unchanged
│
├── tests/                            ← Test suite
│   ├── conftest.py                   ← Test database, fixtures, mock data
│   ├── test_auth.py
│   ├── test_project.py
│   ├── test_planner.py               ← Test plan generation, activity count, organic filtering
│   │                                    Calls engine.py directly (no Celery needed in tests)
│   ├── test_weather.py               ← Test adjustment rules
│   ├── test_soil.py                  ← Test nutrient calculator
│   ├── test_disease.py               ← Test keyword matching
│   ├── test_ai.py                    ← Test context builder, rate limiting, context hashing, fallback
│   ├── test_seed_data.py             ← [NEW] Validates all seed data integrity:
│   │                                    test_all_plants_have_stages()
│   │                                    test_stage_continuity_no_gaps()
│   │                                    test_all_stages_have_water_requirements()
│   │                                    test_organic_fertilizer_exists_for_all_stages()
│   └── test_integration.py           ← Full flow: register → create project → verify plan
│
├── requirements.txt                  ← Python dependencies
├── pyproject.toml                    ← Modern Python project config
└── Dockerfile                        ← Backend Docker image
```

---

## Chat Service Structure (Standalone)

```
frontend/
├── app/                              ← Next.js 14 App Router
│   ├── layout.tsx                    ← Root layout (fonts, metadata, providers)
│   ├── globals.css                   ← Global styles + Tailwind imports
│   ├── (auth)/                       ← Auth group (no main nav)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   └── (app)/                        ← Main app group (with TopBar + BottomNav)
│       ├── layout.tsx                ← AppShell layout
│       ├── dashboard/page.tsx        ← Project list landing page
│       ├── profile/page.tsx          ← Farmer profile settings
│       ├── notifications/page.tsx    ← Notification center
│       └── projects/
│           ├── new/page.tsx          ← 5-step create project wizard
│           └── [id]/
│               ├── page.tsx          ← Project dashboard (Farming Circle + blocks)
│               ├── weather/page.tsx
│               ├── soil/page.tsx
│               ├── plan/page.tsx     ← Full activity timeline
│               ├── disease/page.tsx
│               ├── market/page.tsx
│               └── ai/page.tsx       ← AI Chat (free Gemini)
│
├── components/
│   ├── ui/                           ← shadcn/ui base components (Button, Card, Dialog, etc.)
│   ├── layout/                       ← TopBar, BottomNav, AppShell
│   ├── dashboard/                    ← ProjectCard, QuickActions, EmptyState
│   ├── project/                      ← FarmingCircle, StageIndicator, DayCounter, ProgressRing
│   ├── blocks/                       ← WeatherBlock, SoilBlock, ActivityBlock, MarketBlock, AISummaryBlock
│   ├── activities/                   ← ActivityCard, ActivityTimeline, DoneButton, SkipDialog
│   ├── ai/                           ← AIChatWindow, AISummaryCard, ChatInput
│   ├── forms/                        ← ProjectWizard, SoilTestForm, IssueReportForm, LocationPicker
│   └── charts/                       ← PriceTrendChart, WeatherForecastChart, SoilRadarChart
│
├── lib/
│   ├── api.ts                        ← Axios instance, JWT interceptor, auto-refresh
│   ├── auth.ts                       ← Token storage, login/logout, auth guard
│   ├── hooks/                        ← React Query hooks (useProjects, useDashboard, useAISummary)
│   ├── stores/                       ← Zustand stores (authStore, offlineStore, uiStore)
│   └── utils/                        ← Date formatting, stage calculators, currency formatters
│
├── public/
│   ├── icons/                        ← PWA icons (192x192, 512x512)
│   ├── crops/                        ← Crop images (tomato.png, chili.png, etc.)
│   ├── manifest.json                 ← PWA manifest
│   └── sw.js                         ← Service Worker (generated by next-pwa)
│
├── next.config.js                    ← Next.js + PWA config
├── tailwind.config.ts                ← Tailwind theme (colors, fonts, spacing)
├── tsconfig.json
├── package.json
└── Dockerfile                        ← Frontend Docker image
```

---

## Docker Configuration

```
docker/
├── nginx/
│   ├── nginx.conf                    ← Reverse proxy: /api → backend:8000, / → frontend:3000
│   └── Dockerfile
├── postgres/
│   └── init.sql                      ← Enable extensions: postgis, pgvector, pg_trgm
└── redis/
    └── redis.conf                    ← Max memory, eviction policy
```

### docker-compose.yml (Development)

```yaml
version: "3.9"
services:
  postgres:
    image: postgis/postgis:16-3.4
    environment:
      POSTGRES_DB: agrifarm_db
      POSTGRES_USER: agrifarm
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U agrifarm"]
      interval: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+asyncpg://agrifarm:dev_password@postgres:5432/agrifarm_db
      REDIS_URL: redis://redis:6379/0
      GOOGLE_AI_STUDIO_API_KEY: ${GOOGLE_AI_STUDIO_API_KEY}
      OPENWEATHER_API_KEY: ${OPENWEATHER_API_KEY}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - ./backend:/app

  celery_worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: celery -A tasks.celery_app worker --loglevel=info
    environment:
      DATABASE_URL: postgresql+asyncpg://agrifarm:dev_password@postgres:5432/agrifarm_db
      REDIS_URL: redis://redis:6379/0
      CELERY_BROKER_URL: redis://redis:6379/1
    depends_on:
      - postgres
      - redis

  celery_beat:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: celery -A tasks.celery_app beat --loglevel=info
    environment:
      CELERY_BROKER_URL: redis://redis:6379/1
    depends_on:
      - redis

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    command: npm run dev
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000/api/v1
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  pgdata:
  redisdata:
```

### PostgreSQL Init Script

```sql
-- docker/postgres/init.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgvector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

---

## Makefile (Developer Convenience)

```makefile
# Makefile — Developer shortcuts

.PHONY: dev up down migrate seed test lint

# Start all services
dev:
	docker-compose up -d
	@echo "🌱 AgriFarm AI running at http://localhost:3000"
	@echo "📡 API at http://localhost:8000/docs"

up:
	docker-compose up -d

down:
	docker-compose down

# Database
migrate:
	cd backend && alembic upgrade head

seed:
	cd backend && python -m seed.run_seed

# Testing
test:
	cd backend && pytest -v

test-cov:
	cd backend && pytest --cov=modules --cov-report=html

# Linting
lint:
	cd backend && ruff check . --fix
	cd frontend && npx eslint . --fix
```

---

## .env.example

```bash
# ═══════════════════════════════════════════
# AgriFarm AI — Environment Variables
# ═══════════════════════════════════════════

# Database
DATABASE_URL=postgresql+asyncpg://agrifarm:dev_password@localhost:5432/agrifarm_db

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# JWT Authentication
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_EXPIRE_MINUTES=15
JWT_REFRESH_EXPIRE_DAYS=30

# AI (FREE — get key from https://aistudio.google.com/apikey)
GOOGLE_AI_STUDIO_API_KEY=your-free-api-key

# Weather (FREE — get key from https://openweathermap.org/api)
OPENWEATHER_API_KEY=your-free-api-key

# Storage (MinIO for dev, S3 for production)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=agrifarm-uploads

# Push Notifications (generate with: npx web-push generate-vapid-keys)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=admin@agrifarm.app

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```
