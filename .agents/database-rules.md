# AgriFarm AI — Database Rules

## 1. Database Engine

- **Database:** PostgreSQL 16
- **ORM:** SQLAlchemy 2.0 (`DeclarativeBase`, `Mapped`, `mapped_column`) + `GeoAlchemy2` (for PostGIS)
- **Driver:** asyncpg (async connections only)
- **Migrations:** Alembic. Migration files in `backend/migrations/versions/`.
- **Extensions required** (enabled in `docker/postgres/init.sql`):
  - `uuid-ossp` — UUID generation
  - `postgis` — geospatial queries (used in `FarmerLocation` for `location_polygon` and `centroid`)
  - `pgvector` — future vector embeddings (reserved for v3.0)
  - `pg_trgm` — fuzzy text search for disease/plant matching

## 2. Base Model Pattern

All ORM models inherit from `BaseModel` (defined in `backend/models/base.py`):

```python
class BaseModel(Base):
    __abstract__ = True
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now())
```

- All primary keys are `UUID` — never use auto-increment integers for main entities.
- Always inherit from `BaseModel`, never from `Base` directly (except `BaseModel` itself).

## 3. Model File Locations

ORM models are in `backend/models/` (NOT inside modules). See backend-rules.md for the full file map. Import models into modules like this:
```python
from models.activity import FarmingActivity, ActivityPlan
from models.plant import Plant, PlantStage
```

## 4. Critical Relationships

### The Core Chain (understand this first)
```
accounts (1) → farmer_profiles (1) → projects (many)
projects → plant_id (plants)
projects → location_id (farmer_locations)
projects → land_detail_id (farmer_land_details)
projects → farming_method_id (farming_methods)
projects → activity_plans (1) → farming_activities (many)
```

### Key FK rules
- `projects.farmer_id` → `farmer_profiles.id` (NOT accounts.id)
- `farming_activities.project_id` → `projects.id`
- `farming_activities.stage_id` → `plant_stages.id`
- `project_issues.matched_disease_id` → `plant_diseases.id` (nullable)
- `disease_solutions.method_id` → `farming_methods.id`
- `plant_diseases.plant_id` → `plants.id` (nullable = multi-crop disease)

## 5. Seeding Requirements

The entire system depends on master data seeded before the app can be used. Seed scripts are in `backend/seed/`.

| Seed File | Records | Purpose |
|-----------|---------|---------|
| `farming_methods.py` | 3 | `organic`, `inorganic`, `integrated` |
| `plants.py` | 5 | Tomato, Chili, Rice, Brinjal, Beans |
| `stages.py` | 30 | 6 stages per crop (Germination→Harvest) |
| `nutrients.py` | 30 | N/P/K requirements per stage |
| `water.py` | 30 | Water/irrigation requirements per stage |
| `fertilizers.py` | ~60 | Organic + conventional per stage |
| `diseases.py` | ~40 | 8–10 diseases per crop |
| `solutions.py` | ~80 | 2 solutions per disease per farming method |
| `pests.py` | ~30 | Common pests per crop |

Run seed: `python -m seed.run_seed` from the `backend/` directory.

**The planner engine (`generate_season_plan`) CANNOT function without seeded plant stages, water, and fertilizer data.**

## 6. Critical Query Patterns & Repository Pattern

### Repository Pattern (CRITICAL)
All direct SQLAlchemy `select()`, `insert()`, `update()`, and `delete()` operations MUST be encapsulated inside Repositories (`repository.py` in each module) which inherit from `BaseRepository`.
**NEVER** write raw `db.execute(select(...))` directly in `router.py` or `service.py`. Services should call their injected repositories.

### Activity lookup (most common query in the app)
Inside `FarmingActivityRepository`:
```python
# Always filter by project_id + date + status together — composite index exists
async def get_pending_activities(self, db: AsyncSession, project_id: uuid.UUID, today: date):
    return await db.execute(
        select(FarmingActivity)
        .where(
            FarmingActivity.project_id == project_id,
            FarmingActivity.scheduled_date == today,
            FarmingActivity.status == "pending"
        )
    )
```

### Required Indexes (already defined in migration)
```sql
CREATE INDEX idx_farming_activities_project_date_status ON farming_activities(project_id, scheduled_date, status);
CREATE INDEX idx_notifications_farmer ON notifications(farmer_id, is_read);
CREATE INDEX idx_market_prices_plant ON market_prices(plant_id, recorded_date DESC);
CREATE INDEX idx_weather_cache_location_date ON weather_cache(location_key, forecast_date);
```
Do NOT query `farming_activities` without filtering on `project_id`. It will be slow.

## 7. Weather Cache Strategy

- Cache key format: round GPS to 3 decimal places → `"lat_3dp,lng_3dp"` e.g. `"7.873,80.771"`
- Cache stored in BOTH `weather_cache` table (PostgreSQL) AND Redis (TTL: 3 hours / 10800 seconds)
- Redis key format: `"weather:7.873,80.771"`
- Always check Redis first, then fall back to PostgreSQL table, then call OpenWeatherMap API.

## 8. Disease Matching (Full-Text Search)

The disease search uses PostgreSQL `to_tsvector` + `ts_rank`. The index is:
```sql
CREATE INDEX idx_diseases_symptoms_fts ON plant_diseases
    USING gin(to_tsvector('english', symptoms || ' ' || visual_symptoms));
```

Confidence threshold: `ts_rank > 0.1` = sufficient match (use DB result).
Below threshold → route to Gemini AI for diagnosis.

## 9. AI Tables

- `ai_project_summaries` — cached Gemini AI summaries per project. Always check here before calling Gemini.
  - `context_hash VARCHAR(32)` — MD5 hash of the flattened context JSON. If hash matches the current context, skip the Gemini call entirely (added in migration `002_ai_context_hash.py`).
- `ai_query_logs` — log every Gemini call with `input_tokens`, `output_tokens`, `cost_usd` (always 0.00), `latency_ms`.
- `ai_conversations` — stores full chat history in `messages_json` JSONB column.

## 10. Alembic Migrations

- Migration files are in `migrations/versions/`.
- Run `alembic upgrade head` after any model changes.
- Never modify existing migration files. Create new migration files for schema changes.
- Makefile shortcut: `make migrate`

| Migration | Description |
|-----------|-------------|
| `001_initial_schema.py` | All v1.0 tables |
| `002_ai_context_hash.py` | Adds `context_hash VARCHAR(32)` to `ai_project_summaries` (enables Gemini call deduplication) |

## 11. JSONB Columns

Several tables use JSONB for flexible storage:
- `weather_cache.weather_json` — full OpenWeatherMap API response
- `project_services.config_json` — per-service configuration
- `ai_project_summaries.context_json` — flattened context sent to Gemini
- `ai_conversations.messages_json` — `[{role, content, timestamp}]` array
- `activity_plans.plan_metadata` — generation parameters and version
- `farmer_rag_chunks.metadata_json` — searchable chunk metadata (future)

## 12. Soft Deletes & Status Fields

Do NOT hard-delete these records. Use status fields:
- `projects.status`: `planning`, `active`, `harvested`, `failed`, `paused`
- `farming_activities.status`: `pending`, `done`, `skipped`, `rescheduled`
- `project_issues.resolution_status`: `open`, `diagnosed`, `resolved`, `monitoring`
- `accounts.is_active`: set to `False` to disable account (never DELETE)

---

## 13. Seed Data Validation (CRITICAL)

The planner engine, soil calculator, and disease matcher ALL depend on correctly structured seed data. **Invalid seed data generates wrong plans silently — no exceptions raised.**

### Validation Script
`backend/seed/validator.py` runs automatically after `run_seed.py`. It checks:
- Every plant has at least 1 stage
- Stage `start_day`/`end_day` chains are continuous (no gaps, no overlaps)
- First stage starts at day 0, last stage ends at `plant.growth_duration_days`
- Every stage has a `PlantWaterRequirement` record
- Every stage has at least 1 organic AND 1 conventional `PlantFertilizerRecommendation`

If validation fails, `run_seed.py` exits with code 1 and prints all errors before the app can start.

### Pytest Test Suite
`tests/test_seed_data.py` covers the same checks as automated regression tests. Run with `pytest tests/test_seed_data.py` to catch regressions when editing seed data files.
