# AgriFarm AI — Backend Rules

## 1. Project Structure & Module Pattern

Every feature is a self-contained module under `backend/modules/<name>/`. Each module MUST follow this exact structure using the **Class-Based Architecture and Repository Pattern**:

```
modules/<name>/
├── __init__.py     ← exports `router`
├── router.py       ← FastAPI router, endpoint definitions (injects services via Depends)
├── service.py      ← Business logic classes inheriting from `BaseService`
├── repository.py   ← DB abstraction classes inheriting from `BaseRepository` (all SQLAlchemy queries go here)
└── schemas.py      ← Pydantic v2 request/response models
```

Optional module-level sub-files (use when needed):
- `engine.py` — deterministic calculation engine (planner, soil calculator)
- `client.py` — external API client wrapper (OpenWeatherMap)
- `rules.py` — deterministic if/then rule sets (weather adjustments)
- `matcher.py` — search/matching logic (disease matching)
- `context_builder.py` — data flattening logic (AI module only)
- `prompts.py` — system prompt constants (AI module only)
- `gemini_client.py` — Google AI Studio SDK wrapper (AI module only)
- `intent_classifier.py` — regex-based query routing (AI module only)
- `response_parser.py` — AI response parsing + DB update (AI module only)
- `push.py` — Web Push VAPID logic (notification module only)

## 2. Implemented Modules (DO NOT scaffold these from scratch)

The following modules already exist and have working code:
- `modules/auth/` — register, login, refresh, JWT (includes OTP flows)
- `modules/farmer/` — profile, locations, land details
- `modules/project/` — project CRUD, dashboard aggregation
- `modules/planner/` — season plan generation, today's tasks
- `modules/weather/` — OpenWeatherMap integration, caching
- `modules/soil/` — soil test submission, recommendations
- `modules/disease/` — issue reporting, disease search
- `modules/ai/` — Gemini integration, chat, summary
- `modules/market/` — price tracking, trends
- `modules/notification/` — push notifications, notification center
- `modules/admin/` — user and project management for admin role

## 3. Shared Infrastructure (DO NOT recreate)

These already exist at the backend root:
- `main.py` — FastAPI app, all routers mounted at `/api/v1`
- `database.py` — async SQLAlchemy engine, `get_db()` dependency
- `config.py` — `settings` object via Pydantic BaseSettings (reads `.env`)
- `dependencies.py` — **Central DI Factory**. Contains `get_db`, `get_current_user`, AND factory functions for every service (e.g., `get_auth_service()`, `get_project_service()`). Always use these in routers.
- `models/base.py` — `BaseModel` with `id` (UUID), `created_at`, `updated_at`
- `core/base_repository.py` — `BaseRepository[ModelType, CreateSchemaType, UpdateSchemaType]` providing standard generic CRUD operations.
- `core/base_service.py` — `BaseService` providing standardized logging and base methods for services.
- `core/cache.py` — Redis helpers: `invalidate_dashboard_cache(project_id)`, `DASHBOARD_CACHE_TTL = 180`
- `core/otp.py` — Redis-backed OTP generation and verification
- `core/rate_limiter.py` — Sliding window rate limiter

## 4. All Models Live in `backend/models/`

ORM models are in a shared `backend/models/` directory (NOT inside modules). File map:

| File | Models Defined |
|------|---------------|
| `base.py` | `BaseModel` (UUID pk, timestamps) |
| `account.py` | `Account`, `FarmerProfile`, `VendorProfile`, `BuyerProfile` |
| `farmer.py` | `FarmerLocation`, `FarmerLandDetail`, `FarmerLivestock` |
| `project.py` | `Project`, `ProjectService` |
| `plant.py` | `Plant`, `PlantStage`, `PlantNutrientRequirement`, `PlantWaterRequirement` |
| `plant_fertilizer.py` | `PlantFertilizerRecommendation` |
| `plant_health.py` | `PlantDisease`, `DiseaseSolution`, `PlantPest`, `PestSolution` |
| `activity.py` | `ActivityPlan`, `FarmingActivity`, `ActivityDetail` |
| `soil.py` | `SoilTest`, `SoilNutrientResult`, `SoilRecommendation` |
| `weather.py` | `WeatherCache`, `WeatherAlert` |
| `issue.py` | `ProjectIssue` |
| `market.py` | `MarketPrice`, `MarketTrend` |
| `notification.py` | `Notification` |
| `ai.py` | `AIProjectSummary`, `AIConversation`, `AIQueryLog` |
| `marketplace.py` | `VendorProduct`, `HarvestListing`, `Order`, `OrderItem` (future) |

**Do NOT define ORM models inside modules.** Import from `models/<file>.py`.

## 5. Async First

- All FastAPI endpoints MUST be `async def`.
- All database operations must use the async SQLAlchemy session (`AsyncSession`).
- Use `await session.execute()`, `await session.get()`, `await session.commit()`.
- External API calls (OpenWeatherMap, Gemini) MUST use `httpx.AsyncClient` or the SDK's async interface.
- Never use the synchronous `requests` library.

## 6. Pydantic v2 Validation

- All request payloads MUST be validated by a Pydantic v2 `BaseModel` in `schemas.py`.
- All response shapes MUST be serialized by a Pydantic model. Do not return raw dicts.
- Use `model_config = ConfigDict(from_attributes=True)` on response models that serialize ORM objects.

## 7. Background Tasks (Celery)

All long-running or scheduled work lives in `backend/tasks/`. Never run heavy work synchronously in an endpoint.

### ⚠️ Critical Architecture Rule: Decouple Engine from Celery

**Problem:** Celery doesn't run natively on Windows (no Unix `fork()`). If all logic is inside Celery tasks, nothing is testable without Docker.

**Rule:** Business logic MUST live in `modules/*/engine.py` or `modules/*/service.py` as pure `async def` functions. The Celery task file is a **thin wrapper only**.

```python
# CORRECT ✔ — engine is testable without Celery
# modules/planner/engine.py
async def generate_season_plan(project_id: str, db: AsyncSession): ...

# tasks/planner_tasks.py — thin wrapper
@celery_app.task(bind=True, max_retries=3)
def generate_season_plan_task(self, project_id: str):
    try:
        asyncio.run(generate_season_plan(project_id, get_sync_db()))
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)

# WRONG ✘ — all logic inside Celery task, untestable without Docker
@celery_app.task
def generate_plan_task(project_id):
    project = db.query(...)  # Can't test this directly
```

### Development Without Docker (CELERY_EAGER_MODE)

Add `CELERY_EAGER_MODE=true` to `.env` for quick debugging without Docker. Tasks run synchronously in the same process:

```python
# tasks/celery_app.py
if settings.CELERY_EAGER_MODE:
    celery_app.conf.update(task_always_eager=True, task_eager_propagates=True)
```

**For production and CI: always use Docker Compose.** Celery worker runs Linux inside Docker — no Windows pool issues.

| Task File | Contains |
|-----------|----------|
| `planner_tasks.py` | `generate_season_plan_task` — wrapper around `engine.py` |
| `weather_tasks.py` | `refresh_weather_cache`, `adjust_plan_for_weather` (5 AM), `check_weather_alerts` (6hr) |
| `notification_tasks.py` | `send_daily_notifications` (5:30 AM Celery Beat) |
| `market_tasks.py` | `compute_market_trends` (daily) |
| `ai_tasks.py` | `generate_weekly_ai_summary` (Sunday 6 AM) — throttled with 4s delays |

Celery app config is in `tasks/celery_app.py`. Broker is Redis DB 1. Result backend is Redis DB 2.

## 8. API Design

- All routes prefixed with `/api/v1` (mounted in `main.py`).
- Use proper HTTP verbs: `GET` for reads, `POST` for creates, `PUT` for full updates, `PATCH` for partial updates, `DELETE` for deletes.
- Return standardized response shapes. Successful creates return `201`.
- Authentication: Bearer JWT token in `Authorization` header. Validate via `get_current_user` dependency.

### CRUD Principles
- **Deletes**: Use **Soft Deletes** (`is_active = False`) for core entities (like `Account`) to preserve historical data. Use **Hard Deletes** (`await db.delete(obj)`) for nested dependencies (like `FarmerLocation`, `FarmerLandDetail`, `Project`) where soft deletion isn't necessary.
- **Dependencies**: Always validate parent dependencies before creating a child record (e.g., validate `FarmerLocation` exists and belongs to the user before creating a `Project`).

### Dashboard Cache Invalidation Rule
After any mutation that changes data shown on the dashboard, call `invalidate_dashboard_cache(project_id)` from `core/cache.py`. Required on:
- `PATCH /planner/activities/{id}/complete`
- `PATCH /planner/activities/{id}/skip`
- `POST /soil/tests`
- `POST /ai/summary/{id}`
- `tasks/weather_tasks.py` after `adjust_plan_for_weather` completes

## 9. Security

- Passwords: `bcrypt` hashing only.
- JWT: `HS256` for current implementation (config has `JWT_ALGORITHM = "HS256"`). Access tokens expire in 15 minutes. Refresh tokens stored in Redis for 30 days.
- Never expose internal IDs in error messages. Use generic error messages to prevent user enumeration.
- No raw SQL. Use SQLAlchemy ORM or parameterized `text()` calls.

## 10. Error Handling

- Use `HTTPException` with clear status codes.
- Duplicate registration → `409 Conflict`
- Invalid credentials → `401 Unauthorized` (generic message, no user enumeration)
- Not found → `404 Not Found`
- Validation errors are handled automatically by FastAPI (Pydantic).
- AI rate limit hit → `429 Too Many Requests` (return deterministic fallback, don't raise 500).

## 11. Configuration

All environment variables are loaded via `config.py → Settings`. Access them as `settings.VARIABLE_NAME`. Do not use `os.environ` directly.

Key settings:
- `settings.DATABASE_URL` — `postgresql+asyncpg://...`
- `settings.REDIS_URL` — Redis connection
- `settings.GOOGLE_AI_STUDIO_API_KEY` — may be `None` if not configured
- `settings.OPENWEATHER_API_KEY` — may be `None` if not configured
- `settings.JWT_SECRET_KEY`, `settings.JWT_ALGORITHM`
