# AgriFarm AI — Business Logic Rules

## 1. The Activity Planner Engine (Core Feature)

**Location:** `backend/modules/planner/engine.py` → `generate_season_plan(project_id, db)`
**Trigger:** Celery task wrapper in `backend/tasks/planner_tasks.py` — called immediately after project creation.
**This is the single most critical piece of logic in the entire app.**

### Architecture: Engine is Decoupled from Celery

The engine function is a pure `async def` with no Celery import. This allows it to be called directly in tests without Docker:

```python
# modules/planner/engine.py — pure async, testable directly
async def generate_season_plan(project_id: str, db: AsyncSession): ...

# tasks/planner_tasks.py — thin wrapper only
@celery_app.task(bind=True, max_retries=3)
def generate_season_plan_task(self, project_id: str):
    try:
        asyncio.run(generate_season_plan(project_id, get_sync_db()))
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
```

### How it works:
1. Load `Project` → `Plant` → `PlantStage[]` (ordered by `stage_order`)
2. For each stage, iterate through the stage's date range:
   - **Watering:** Generate one activity per `irrigation_frequency_days` (from `PlantWaterRequirement`). Scale `water_mm_per_day * area * 4.047` = liters. Schedule at 06:00.
   - **Fertilizing:** One activity at `stage_start + 2 days` per `PlantFertilizerRecommendation`. Scale `quantity_per_acre * area`. Filter by `farming_method` (`organic`/`inorganic`/`integrated`).
   - **Monitoring:** One activity every 7 days per stage. Use `stage.watch_for` as the task description. Schedule at 08:00.
3. Bulk insert all `FarmingActivity` records.
4. A full Tomato season (90 days, 6 stages) generates **~77 activities**.

### Farming Method Filtering (CRITICAL)
```python
if farming_method == "organic" and not fert.is_organic:
    continue   # Skip conventional fertilizers for organic farms
if farming_method == "inorganic" and fert.is_organic:
    continue   # Skip organic for conventional farms
# "integrated" uses both — no filter
```

### Graceful Fallback (Missing Seed Data) + Pre-Flight Checks

Before generating any activities, validate the stage data. Do NOT silently generate wrong plans:

```python
if not stages:
    log.warning(f"No stages for plant '{plant.common_name}'. Using generic 3-stage fallback.")
    stages = build_generic_stages(plant)  # Returns 3-stage fallback
else:
    # Validate stage continuity — auto-patch gaps
    for i in range(len(stages) - 1):
        if stages[i].end_day != stages[i+1].start_day:
            log.error(f"Stage gap: {plant.common_name} stage {i+1}→{i+2}. Auto-patching.")
            stages[i].end_day = stages[i+1].start_day  # Extend stage to close gap
```

The 3-stage generic fallback (`build_generic_stages(plant)`) produces:
- Stage 1: Planting (day 0 → day 14)
- Stage 2: Growing (day 14 → `growth_duration_days - 14`)
- Stage 3: Harvest (last 14 days)

---

## 2. Weather Adjustment Rules Engine

**Location:** `backend/modules/weather/rules.py`
**Trigger:** Celery Beat at 5:00 AM daily via `weather_tasks.py → adjust_plan_for_weather()`

### Rules (Deterministic — Never use AI for these)

| Condition | Activity Type | Action |
|-----------|--------------|--------|
| `rain_mm > 5` | `watering` | Status → `skipped`, reason: `"Rain expected: Xmm"` |
| `rain_mm > 25` | `fertilizing` | Status → `rescheduled`, date + 1 day, reason: `"Heavy rain — fertilizer washout risk"` |
| `wind_speed > 20 km/h` | `spraying` | Status → `rescheduled`, date + 1 day |
| `rain_mm > 50` | ANY | Create `WeatherAlert` type `flood_risk`, severity `critical` |
| `temp_min < 10°C` | ANY | Create `WeatherAlert` type `frost_risk`, severity `warning` |
| `humidity > 90% AND temp_max > 25°C` | ANY | Create `WeatherAlert` type `disease_risk_high_humidity`, severity `warning` |

### Weather Cache Check Order
1. Check Redis: `GET weather:{lat_3dp},{lng_3dp}` (TTL: 3 hours)
2. If Redis miss → check `weather_cache` PostgreSQL table (`expires_at > now()`)
3. If both miss → call OpenWeatherMap free API → store in both Redis AND `weather_cache` table
4. If OpenWeatherMap fails → **do NOT modify any activities** (fail-safe: better to over-water than skip incorrectly). Log the API failure.

---

## 3. Soil Recommendation Engine

**Location:** `backend/modules/soil/calculator.py`
**Trigger:** `POST /soil/tests` → synchronous calculation (fast enough, not Celery)

### Calculation Logic (Deterministic)
1. Load `SoilNutrientResult` + `Project` + current `PlantStage` + `PlantNutrientRequirement`
2. For each nutrient (pH, N, P, K, Ca, Mg):
   - Compare actual value against `plant_nutrient_requirements` optimal values
   - Calculate deficiency severity: `none`, `mild` (gap < 20%), `moderate` (20–50%), `severe` (> 50%)
   - Generate specific product + quantity recommendation (scaled to farm area)
   - Apply organic/conventional filter based on `project.farming_method`

### pH Correction
```python
if soil.ph < plant.optimal_ph_min:
    product = "Agricultural lime" if not organic else "Wood ash or dolomite"
    qty = (plant.optimal_ph_min - soil.ph) * 500  # kg
```

### Nitrogen (N) Check
```python
target_n_ppm = crop_needs.nitrogen_kg_per_acre * 2.24
if soil.nitrogen_ppm < target_n_ppm:
    product = "Compost or blood meal" if organic else "Urea (46-0-0)"
```

### Validation
- Reject soil test submissions where ALL values are zero (invalid test).
- Minimum: `ph` must be > 0 (required field).

---

## 4. Disease Matching Engine

**Location:** `backend/modules/disease/matcher.py`
**Trigger:** `POST /issues` → search `plant_diseases` via PostgreSQL full-text search

### Matching Steps
1. Run PostgreSQL `ts_rank` query against `plant_diseases.symptoms + visual_symptoms`
2. Filter by `plant_id` (or `plant_id IS NULL` for multi-crop diseases)
3. If `rank > 0.1` → sufficient confidence → return DB match + solutions filtered by farming method
4. If `rank ≤ 0.1` (or no results) → route to Gemini AI with `DIAGNOSIS_PROMPT` + project context
5. Store in `project_issues` with `source: "database"` or `source: "ai_gemini"`

### When DB Returns No Match
Show the farmer: `"Try describing what you see: leaf color, spots, wilting, fruit damage."`
Do not show a blank screen.

### Solution Filtering
Always filter `disease_solutions` and `pest_solutions` by `method_id` matching the project's farming method. Organic farmers must never see conventional chemical solutions.

---

## 5. Project Dashboard Aggregation

**Location:** `backend/modules/project/dashboard.py`
**Endpoint:** `GET /projects/{id}/dashboard`

### ⚠️ Performance Requirement

This endpoint must respond in **< 200ms fresh, instant from cache**. Use two layers:

**Layer 1 — Redis Cache (3-minute TTL):**
```python
cache_key = f"dashboard:{project_id}"
cached = await redis.get(cache_key)
if cached:
    return json.loads(cached)  # Instant
```

**Layer 2 — `asyncio.gather()` for parallel DB queries:**
All 11 sub-queries run simultaneously, not sequentially:
```python
(
    project_detail, farming_circle, todays_activities,
    upcoming_activities, weather_data, weather_alerts,
    soil_status, active_issues, market_price,
    notifications, ai_summary,
) = await asyncio.gather(
    get_project_detail(project_id, db),
    get_all_stages_with_progress(project_id, db),
    get_todays_activities(project_id, db),
    get_upcoming_activities(project_id, db, days=7),
    get_5day_forecast(project_id),         # Redis first
    get_active_weather_alerts(project_id, db),
    get_latest_soil_summary(project_id, db),
    get_open_issues(project_id, db),
    get_latest_price(project_id, db),
    get_unread_notifications(project_id, db),
    get_latest_ai_summary(project_id, db), # DB cache only, never calls Gemini
)
```

### Cache Invalidation
Call `invalidate_dashboard_cache(project_id)` from `core/cache.py` whenever:
- Activity marked done/skipped
- New soil test submitted
- New AI summary generated
- Weather tasks adjust activities

The `ai_summary` field in the response always comes from `ai_project_summaries` DB cache. The dashboard endpoint **never calls Gemini directly**.

---

## 6. Notification Types & Triggers

| Type | Trigger | Deep Link |
|------|---------|-----------|
| `activity_reminder` | Celery Beat 5:30 AM | `/projects/[id]?scroll=activities` |
| `weather_alert` | `check_weather_alerts` Celery job | `/projects/[id]/weather` |
| `disease_risk` | High humidity alert created | `/projects/[id]/disease` |
| `market_alert` | Price change > 15% | `/projects/[id]/market` |
| `ai_insight` | Weekly AI summary generated | `/projects/[id]/ai` |

Notifications stored in the `notifications` table. Push sent via Web Push VAPID. Always create the DB record first, push is best-effort.

---

## 7. Market Price Alerts

- Compute daily trend via Celery `compute_market_trends` task in `market_tasks.py`
- Trigger `market_alert` notification when: price rises > 20% OR drops > 15% vs previous week average
- `market_trends` table stores `avg_price`, `min_price`, `max_price`, `trend_direction` (rising/falling/stable), `trend_pct`

---

## 8. Current Stage Calculation

To determine what stage a project is currently in:
```python
days_elapsed = (date.today() - project.planting_date).days
current_stage = next(
    (s for s in stages if s.start_day <= days_elapsed <= s.end_day),
    stages[-1]  # Default to last stage if beyond all ranges
)
```

This is used in:
- Dashboard `farming_circle` response
- `build_project_context()` for AI
- Soil recommendation engine (to get correct nutrient requirements)
- Activity planner (to label activities with the correct stage)

---

## 9. Performance Targets

| Operation | Target | Implementation |
|-----------|--------|---------------|
| Non-AI API responses | < 200ms | DB indexes, Redis caching, async |
| AI summary response | < 5 seconds | Gemini 2.0 Flash is fast; context ~2K tokens |
| Dashboard load | < 1 second | Single aggregated endpoint, server-side cache |
| Activity plan generation | < 10 seconds | Runs in Celery background, bulk insert |
| PWA first load | < 3 seconds | SSR, Tailwind CSS purging |
| Offline access | Instant | Service Worker caches daily plan |

---

## 10. Project Status Lifecycle

```
planning → active → harvested
               ↓
             failed
               ↓
             paused → active (resume)
```

- `planning`: just created, activity plan still being generated
- `active`: plan ready, daily guidance active
- `harvested`: `actual_harvest_date` set, project complete
- `failed`: crop failed mid-season
- `paused`: temporarily stopped (e.g., farmer on leave)

Only `active` projects receive daily Celery notifications and weather adjustments.

---

## 11. Revenue Calculator Engine (Master Plan Alignment)

**Trigger:** On project creation and dashboard load.
To empower the farmer before dealing with middlemen, the system calculates projected revenue.
- **Expected Yield (kg):** `Project.area` (acres) × `Plant.expected_yield_per_acre_kg`.
- **Expected Revenue:** `expected_yield_kg` × `MarketPrice.price_per_kg` (latest price for crop in farmer's district).
- **Storage:** Saved in `Project.expected_yield_kg` and `Project.expected_revenue`.
