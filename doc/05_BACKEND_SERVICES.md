# AgriFarm AI — Backend Services Plan

## Architecture: FastAPI Modular Monolith

All services are Python modules inside a single FastAPI application. Each module has its own `router.py`, `service.py`, `models.py`, and `schemas.py`. They share the same database and can call each other's service layers directly.

```
backend/
├── main.py                    # FastAPI app, mounts all routers
├── database.py                # SQLAlchemy engine, session factory
├── config.py                  # Environment config (Pydantic BaseSettings)
├── dependencies.py            # Shared deps: get_db, get_current_user
├── modules/
│   ├── auth/
│   │   ├── router.py          # POST /auth/register, /auth/login, /auth/refresh
│   │   ├── service.py         # Hash passwords, create JWT, validate tokens
│   │   ├── models.py          # Account SQLAlchemy model
│   │   └── schemas.py         # Pydantic: RegisterRequest, LoginRequest, TokenResponse
│   ├── farmer/
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── models.py          # FarmerProfile, FarmerLocation, FarmerLandDetail, FarmerLivestock
│   │   └── schemas.py
│   ├── project/
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── models.py          # Project, ProjectService
│   │   └── schemas.py
│   ├── weather/
│   │   ├── router.py
│   │   ├── service.py         # OpenWeatherMap free API integration
│   │   ├── models.py          # WeatherCache, WeatherAlert
│   │   └── schemas.py
│   ├── soil/
│   │   ├── router.py
│   │   ├── service.py         # Nutrient gap calculator (deterministic)
│   │   ├── models.py          # SoilTest, SoilNutrientResult, SoilRecommendation
│   │   └── schemas.py
│   ├── planner/
│   │   ├── router.py
│   │   ├── service.py         # Life cycle engine, daily task generator
│   │   ├── models.py          # ActivityPlan, FarmingActivity, ActivityDetail
│   │   └── schemas.py
│   ├── disease/
│   │   ├── router.py
│   │   ├── service.py         # Keyword matcher + AI fallback
│   │   ├── models.py          # ProjectIssue
│   │   └── schemas.py
│   ├── market/
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── models.py          # MarketPrice, MarketTrend
│   │   └── schemas.py
│   ├── ai/
│   │   ├── router.py          # POST /ai/summary, POST /ai/chat
│   │   ├── service.py         # Context flattening + Google Gemini call
│   │   ├── context_builder.py # build_project_context()
│   │   ├── prompts.py         # All system prompts as constants
│   │   └── schemas.py
│   └── notification/
│       ├── router.py
│       ├── service.py
│       ├── models.py          # Notification
│       └── schemas.py
├── tasks/                     # Celery background tasks
│   ├── weather_tasks.py
│   ├── planner_tasks.py
│   ├── notification_tasks.py
│   └── ai_tasks.py            # Weekly AI summary generation
└── seed/                      # Database seed data
    ├── plants.py
    ├── stages.py
    └── diseases.py
```

---

## SERVICE 1: Auth Module

**Path:** `/auth`

### Endpoints
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/auth/register` | Create account + farmer profile | Public |
| POST | `/auth/login` | Email/phone + password → JWT pair | Public |
| POST | `/auth/refresh` | Refresh token → new access token | Refresh token |
| GET | `/auth/me` | Get current user info | Bearer |
| POST | `/auth/forgot-password/request-otp` | Request OTP for password reset | Public |
| POST | `/auth/forgot-password/verify` | Verify OTP and set new password | Public |
| PATCH | `/auth/change-password` | Change password for logged in user | Bearer |

### Logic
```python
# Registration flow:
# 1. Validate email/phone uniqueness
# 2. Hash password with bcrypt
# 3. Create Account record
# 4. Create FarmerProfile record (default role)
# 5. Return JWT access + refresh tokens

# JWT Strategy:
# Access token: 15 minutes, RS256 signed
# Refresh token: 30 days, stored in Redis for revocation
# On refresh: validate refresh token exists in Redis, issue new pair
```

### Error Handling
| Error | Response | Recovery |
|-------|----------|----------|
| Duplicate email | 409 Conflict | Suggest login or password reset |
| Invalid credentials | 401 Unauthorized | Generic message (no user enumeration) |
| Expired access token | 401 + `token_expired` code | Frontend auto-refreshes |
| Revoked refresh token | 401 | Force re-login |

---

## SERVICE 2: Farmer Module

**Path:** `/farmer`

### Endpoints
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/farmer/profile` | Get own profile | Bearer |
| PUT | `/farmer/profile` | Update profile | Bearer |
| POST | `/farmer/locations` | Add a farm location | Bearer |
| GET | `/farmer/locations` | List all locations | Bearer |
| PUT | `/farmer/locations/{id}` | Update location | Bearer |
| POST | `/farmer/land` | Add land details | Bearer |
| GET | `/farmer/land` | List all land details | Bearer |

### Logic
- Profile stores: name, language, experience, preferred farming method
- Location stores: GPS coordinates, address, timezone (for weather + notifications)
- Land details: area, soil type, water source, irrigation type
- Location `is_primary` flag determines default location for new projects

---

## SERVICE 3: Project Module ⭐ (Core Feature — Build First)

**Path:** `/projects`

### Endpoints
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/projects` | Create new farming project | Bearer |
| GET | `/projects` | List all farmer's projects | Bearer |
| GET | `/projects/{id}` | Get project detail + dashboard data | Bearer |
| PUT | `/projects/{id}` | Update project | Bearer |
| PATCH | `/projects/{id}/status` | Change status (active → harvested) | Bearer |
| GET | `/projects/{id}/dashboard` | Aggregated dashboard (all blocks) | Bearer |

### Project Creation Flow (The Most Critical Flow)
```python
async def create_project(data: ProjectCreateRequest, farmer_id: str):
    # 1. Validate plant_id exists in master catalogue
    plant = db.get(Plant, data.plant_id)
    if not plant:
        raise HTTPException(404, "Crop not found")

    # 2. Validate location and land detail
    location = db.get(FarmerLocation, data.location_id)
    land = db.get(FarmerLandDetail, data.land_detail_id)

    # 3. Create project record
    project = Project(
        farmer_id=farmer_id,
        plant_id=data.plant_id,
        location_id=data.location_id,
        land_detail_id=data.land_detail_id,
        farming_method_id=data.farming_method_id,
        area=data.area,
        area_unit=data.area_unit,
        planting_date=data.planting_date,
        expected_harvest_date=data.planting_date + timedelta(days=plant.growth_duration_days),
        status="active"
    )
    db.add(project)
    db.flush()

    # 4. TRIGGER: Generate full-season activity plan (Celery background task)
    generate_season_plan.delay(project.id)

    # 5. TRIGGER: Fetch initial weather data
    refresh_weather_for_location.delay(location.latitude, location.longitude)

    db.commit()
    return project
```

### Dashboard Aggregation Endpoint
**`GET /projects/{id}/dashboard`** — Returns ALL data blocks in one call.

**⚠️ Performance Rule:** Use `asyncio.gather()` for parallel queries. Never run these 11 queries sequentially — it would take 500ms+. Target: <200ms fresh, instant from cache.

```python
# modules/project/dashboard.py
import asyncio

async def get_dashboard(project_id: str, db: AsyncSession):
    # Layer 1: Check Redis cache first (3-minute TTL)
    cache_key = f"dashboard:{project_id}"
    cached = await redis.get(cache_key)
    if cached:
        return json.loads(cached)  # Instant response

    # Layer 2: Run ALL 11 queries in parallel
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
        get_5day_forecast(project_id),          # Redis first
        get_active_weather_alerts(project_id, db),
        get_latest_soil_summary(project_id, db),
        get_open_issues(project_id, db),
        get_latest_price(project_id, db),
        get_unread_notifications(project_id, db),
        get_latest_ai_summary(project_id, db),  # DB cache only, never calls Gemini
    )

    result = {
        "project": project_detail,
        "current_stage": get_current_stage(project_detail),
        "farming_circle": farming_circle,
        "todays_activities": todays_activities,
        "upcoming_activities": upcoming_activities,
        "weather": weather_data,
        "weather_alerts": weather_alerts,
        "soil_status": soil_status,
        "active_issues": active_issues,
        "market_price": market_price,
        "notifications": notifications,
        "ai_summary": ai_summary
    }

    # Cache for 3 minutes
    await redis.setex(cache_key, 180, json.dumps(result, default=str))
    return result


async def invalidate_dashboard_cache(project_id: str):
    """Call this after any mutation that changes dashboard data."""
    await redis.delete(f"dashboard:{project_id}")
```

**Call `invalidate_dashboard_cache(project_id)` from:**
- `PATCH /planner/activities/{id}/complete`
- `PATCH /planner/activities/{id}/skip`
- `POST /soil/tests` (new soil test submitted)
- `POST /ai/summary/{id}` (new AI summary generated)
- `tasks/weather_tasks.py` after `adjust_plan_for_weather` modifies activities

---

## SERVICE 4: Weather Module

**Path:** `/weather`

### External API: OpenWeatherMap Free Tier
- **Free tier:** 1,000 calls/day, 5-day forecast
- **Endpoint:** `api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}`

### Endpoints
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/weather/{project_id}` | Get 5-day forecast for project location | Bearer |
| GET | `/weather/{project_id}/alerts` | Get active weather alerts | Bearer |

### Caching Strategy
```python
# 1. Round GPS coordinates to 3 decimal places (~111m precision)
# 2. Create cache key: "weather:{lat_3dp},{lng_3dp}"
# 3. Cache TTL: 3 hours (matches refresh_weather_cache Celery job)
# 4. If cache miss, call OpenWeatherMap API
# 5. Parse response, store in weather_cache table AND Redis

# Redis key format: "weather:7.873,80.771"
# TTL: 10800 seconds (3 hours)
```

### Weather → Activity Adjustment Logic (Deterministic)
```python
# modules/weather/rules.py

def should_skip_watering(rain_mm_today: float) -> tuple[bool, str]:
    if rain_mm_today > 5.0:
        return True, f"Skipped due to sufficient rain forecast ({round(rain_mm_today, 1)}mm)"
    return False, ""

def should_postpone_fertilizing(rain_mm_today: float) -> tuple[bool, str]:
    if rain_mm_today > 25.0:
        return True, f"Postponed 1 day due to heavy rain risk ({round(rain_mm_today, 1)}mm)"
    return False, ""

def should_postpone_spraying(wind_kph_today: float) -> tuple[bool, str]:
    if wind_kph_today > 20.0:
        return True, f"Postponed 1 day due to high winds ({round(wind_kph_today, 1)} km/h)"
    return False, ""

def evaluate_weather_alerts(rain_tomorrow: float, min_temp_tomorrow: float, avg_humidity_tomorrow: float) -> list[tuple[str, str, str]]:
    alerts = []
    if rain_tomorrow > 50.0:
        alerts.append(("heavy_rain", "high", f"Heavy rain expected tomorrow ({round(rain_tomorrow,1)}mm)."))
    if min_temp_tomorrow < 10.0:
        alerts.append(("frost", "high", f"Frost warning tomorrow."))
    if avg_humidity_tomorrow > 85.0:
        alerts.append(("disease_risk", "medium", f"High humidity tomorrow."))
    return alerts
```

---

## SERVICE 5: Soil Module

**Path:** `/soil`

### Endpoints
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/soil/tests/{project_id}` | Submit a soil test result | Bearer |
| GET | `/soil/tests/{project_id}` | Get all soil tests for project | Bearer |
| GET | `/soil/recommendations/{project_id}` | Get computed recommendations | Bearer |

### Soil Recommendation Engine (100% Deterministic)
```python
def calculate_nutrient_gaps(test: SoilTest, result: SoilNutrientResult, farming_method: str) -> list[SoilRecommendation]:
    """
    Compare actual soil values against simplified ranges and return recommendations list.
    """
    recs = []
    
    # pH logic
    if result.ph_level < 6.0:
        desc = "Apply agricultural lime (100kg/acre) to raise pH." if farming_method != "organic" else "Apply Slaked lime or wood ash to raise pH."
        recs.append(SoilRecommendation(soil_test_id=test.id, recommendation_type="amendment", description=desc))
    elif result.ph_level > 7.5:
        desc = "Apply elemental sulfur to lower pH." if farming_method != "organic" else "Add peat moss to lower pH."
        recs.append(SoilRecommendation(soil_test_id=test.id, recommendation_type="amendment", description=desc))

    # Nitrogen check
    if result.nitrogen_level.lower() == "low":
        desc = "Apply Urea (50kg/acre) as basal dressing." if farming_method != "organic" else "Apply compost or blood meal."
        recs.append(SoilRecommendation(soil_test_id=test.id, recommendation_type="fertilizer", description=desc))

    # Repeat for Phosphorus, Potassium...
    return recs
```

### Revenue Calculator Service (Master Plan Alignment)

The master plan requires farmers to see an estimated revenue calculation (Expected Yield × Current Market Price) so they know exactly what their crop is worth before talking to middlemen.

**Calculation Logic (runs on project creation/dashboard load):**
1. **Expected Yield:** `Project.area` (in acres) × `Plant.expected_yield_per_acre_kg`. This value is saved to `Project.expected_yield_kg`.
2. **Current Price:** Fetch the latest `MarketPrice.price_per_kg` for this `plant_id` in the farmer's `district`.
3. **Expected Revenue:** `Project.expected_yield_kg` × `MarketPrice.price_per_kg`. Saved to `Project.expected_revenue`.

The dashboard endpoint aggregates this and returns it inside the `market_price` block.

---

## SERVICE 6: Activity Planner ⭐ (Critical Engine)

**Path:** `/planner`

### Endpoints
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/planner/{project_id}/activities` | List all activities | Bearer |
| GET | `/planner/{project_id}/today` | Today's activities | Bearer |
| PATCH | `/planner/activities/{id}/complete` | Mark activity done | Bearer |
| PATCH | `/planner/activities/{id}/skip` | Skip with reason | Bearer |

### Full-Season Plan Generator (Deterministic Engine)

**⚠️ Architecture Rule:** The engine function lives in `modules/planner/engine.py` as a pure `async def` with NO Celery dependency. The Celery task in `tasks/planner_tasks.py` is a thin wrapper. This allows the engine to be called directly in tests without Docker/Celery.

```python
# modules/planner/engine.py — pure async, no Celery import
async def generate_season_plan(project_id: str, db: AsyncSession):
    """
    Called on project creation via Celery, or directly in tests.
    Generates 50-100+ activities for the entire growing season.
    """
    project = await get_project(project_id, db)
    plant = project.plant
    stages = await get_plant_stages(plant.id, db)  # Ordered by stage_order
    area = float(project.area)
    farming_method = project.farming_method.code
    planting_date = project.planting_date

    # PRE-FLIGHT CHECK: Handle missing or broken stage data
    if not stages:
        log.warning(f"No stages for plant '{plant.common_name}'. Using generic 3-stage fallback.")
        stages = build_generic_stages(plant)  # Planting / Growing / Harvest
    else:
        # Validate stage continuity — auto-patch gaps
        for i in range(len(stages) - 1):
            if stages[i].end_day != stages[i+1].start_day:
                log.error(
                    f"Stage gap: {plant.common_name} stage {i+1} ends day {stages[i].end_day}, "
                    f"stage {i+2} starts day {stages[i+1].start_day}. Auto-patching."
                )
                stages[i].end_day = stages[i+1].start_day  # Patch gap

    activities = []

    for stage in stages:
        stage_start = planting_date + timedelta(days=stage.start_day)
        stage_end = planting_date + timedelta(days=stage.end_day)
        stage_days = stage.end_day - stage.start_day

        # 1. Generate watering activities
        water = await get_water_requirements(plant.id, stage.id, db)
        if water:
            interval = water.irrigation_frequency_days or 2
            for day_offset in range(0, stage_days, interval):
                activity_date = stage_start + timedelta(days=day_offset)
                daily_water = float(water.water_mm_per_day) * area * 4.047  # mm*acres → liters
                activities.append(FarmingActivity(
                    project_id=project_id,
                    stage_id=stage.id,
                    activity_type="watering",
                    title=f"Water plants — {round(daily_water)}L",
                    description=f"Irrigate via {project.land_detail.irrigation_type or 'manual'}",
                    scheduled_date=activity_date,
                    scheduled_time=time(6, 0),
                    priority=2
                ))

        # 2. Generate fertilizer activities (filtered by farming method)
        fert_recs = await get_fertilizer_recommendations(plant.id, stage.id, db)
        for fert in fert_recs:
            if farming_method == "organic" and not fert.is_organic:
                continue  # Skip conventional for organic farms
            if farming_method == "inorganic" and fert.is_organic:
                continue  # Skip organic for conventional farms
            # "integrated" uses both — no filter
            qty = float(fert.quantity_per_acre) * area
            activities.append(FarmingActivity(
                project_id=project_id,
                stage_id=stage.id,
                activity_type="fertilizing",
                title=f"Apply {fert.fertilizer_type} — {round(qty, 1)} {fert.unit}",
                description=f"Method: {fert.application_method}. {fert.timing_note or ''}",
                scheduled_date=stage_start + timedelta(days=2),
                scheduled_time=time(7, 0),
                priority=1
            ))

        # 3. Generate monitoring activities (weekly per stage)
        for week in range(0, stage_days, 7):
            activities.append(FarmingActivity(
                project_id=project_id,
                stage_id=stage.id,
                activity_type="monitoring",
                title=f"Check for: {stage.watch_for or 'general health'}",
                description=stage.key_indicators or "Inspect plants visually",
                scheduled_date=stage_start + timedelta(days=week),
                scheduled_time=time(8, 0),
                priority=3
            ))

    # Bulk insert all activities
    db.add_all(activities)
    await db.commit()
    return len(activities)


# tasks/planner_tasks.py — thin wrapper only
@celery_app.task(bind=True, max_retries=3)
def generate_season_plan_task(self, project_id: str):
    """Celery wrapper. Engine logic lives in modules/planner/engine.py."""
    try:
        asyncio.run(generate_season_plan(project_id, get_sync_db()))
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)  # Exponential backoff

---

## 6. Disease Management & Diagnostics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/disease/diagnose` | Rule-based keyword matching | Bearer |
| POST | `/disease/identify-image` | **[FUTURE]** Upload photo for Computer Vision analysis | Bearer |
| POST | `/disease/resolve/{id}` | Mark issue as resolved | Bearer |

### Computer Vision (Future Hook)
The master plan mandates a unified diagnostic tool. When a farmer uploads an image to `POST /disease/identify-image`, the system will:
1. Run computer vision to extract visual features (e.g., "brown spots with yellow halos").
2. Pass these visual features to the rule-based keyword matcher.
3. If confidence is low, fallback to the AI (LLM Vision) for deep diagnosis.

| GET | `/disease/{id}/solutions` | Get treatment solutions | Bearer |

### Keyword Matcher (`get_disease_diagnosis`)

### Disease Matching Logic
```python
def match_disease(plant_id: str, symptoms_text: str, affected_parts: list):
    """
    Step 1: Try deterministic keyword matching (PostgreSQL full-text search)
    Step 2: If low confidence, route to Google Gemini free API
    """
    # Full-text search against plant_diseases
    results = db.execute(text("""
        SELECT id, disease_name, symptoms, severity,
               ts_rank(to_tsvector('english', symptoms || ' ' || visual_symptoms),
                       plainto_tsquery('english', :query)) as rank
        FROM plant_diseases
        WHERE (plant_id = :plant_id OR plant_id IS NULL)
          AND to_tsvector('english', symptoms || ' ' || visual_symptoms) @@
              plainto_tsquery('english', :query)
        ORDER BY rank DESC
        LIMIT 5
    """), {"plant_id": plant_id, "query": symptoms_text})

    matches = results.fetchall()

    if matches and matches[0].rank > 0.1:
        # High confidence — return DB match + solutions
        disease = matches[0]
        solutions = get_solutions(disease.id)
        return {"source": "database", "disease": disease, "solutions": solutions}

    # Low confidence — call Google Gemini for diagnosis
    context = build_project_context(project_id)
    diagnosis = await gemini_diagnose(symptoms_text, affected_parts, context)
    return {"source": "ai_gemini", "diagnosis": diagnosis}
```

---

## SERVICE 8: Market Module

**Path:** `/market`

### Endpoints
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/market/prices/{plant_id}` | Get current prices | Bearer |
| GET | `/market/trends/{plant_id}` | Get 30-day trend | Bearer |
| POST | `/market/admin/prices` | Admin: add price data | Admin |

---

## SERVICE 9: AI Summary Module ⭐

**Path:** `/ai`

### Endpoints
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/ai/{project_id}/summary` | Get latest cached AI summary | Bearer |
| POST | `/ai/{project_id}/summary [NOT IMPLEMENTED]` | Generate new AI summary | Bearer |
| POST | `/ai/{project_id}/chat` | Ask a question (with project context) | Bearer |

### Logic
See [07_AI_RAG_MCP.md](07_AI_RAG_MCP.md) for complete implementation.

---

## SERVICE 10: Notification Module

**Path:** `/notifications`

### Endpoints
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/notifications` | Get farmer's notifications | Bearer |
| PATCH | `/notifications/{id}/read` | Mark as read | Bearer |
| POST | `/notifications/subscribe` | Register push subscription | Bearer |

### Notification Types
| Type | Trigger | Content Example |
|------|---------|-----------------|
| `activity_reminder` | Daily 5:30 AM job | "Water plants today — 180L needed" |
| `weather_alert` | Weather check detects storm | "Heavy rain tomorrow! Postpone fertilizer" |
| `disease_risk` | High humidity + warm temp | "Blight risk high — inspect leaves today" |
| `market_alert` | Price changes > 15% | "Tomato price rose 18% in Colombo!" |
| `ai_insight` | Weekly AI summary generated | "Your weekly crop health report is ready" |

---

## SERVICE 11: Admin Module

**Path:** `/admin`

### Endpoints
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/admin/users` | List all users | Admin |
| PATCH | `/admin/users/{id}/role` | Change user role | Admin |
| PATCH | `/admin/users/{id}/deactivate` | Deactivate/reactivate user | Admin |
| GET | `/admin/stats` | Platform statistics | Admin |
| GET | `/admin/master-data/crops` | Manage crop master data | Admin |
| GET | `/admin/master-data/diseases` | Manage disease master data | Admin |

