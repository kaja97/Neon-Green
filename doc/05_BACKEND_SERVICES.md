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
**`GET /projects/{id}/dashboard`** — Returns ALL data blocks in one call:

```python
async def get_dashboard(project_id: str):
    return {
        "project": get_project_detail(project_id),
        "current_stage": get_current_stage(project_id),
        "farming_circle": get_all_stages_with_progress(project_id),
        "todays_activities": get_todays_activities(project_id),
        "upcoming_activities": get_upcoming_activities(project_id, days=7),
        "weather": get_5day_forecast(project_id),
        "weather_alerts": get_active_weather_alerts(project_id),
        "soil_status": get_latest_soil_summary(project_id),
        "active_issues": get_open_issues(project_id),
        "market_price": get_latest_price(project_id),
        "notifications": get_unread_notifications(project_id),
        "ai_summary": get_latest_ai_summary(project_id)  # Cached AI summary
    }
```

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
def adjust_activities_for_weather(project_id: str):
    """
    Called by Celery at 5:00 AM daily.
    Adjusts today's activities based on weather forecast.
    """
    forecast = get_todays_weather(project_id)
    activities = get_todays_pending_activities(project_id)

    for activity in activities:
        # Rule 1: Skip watering if rain > 5mm expected
        if activity.activity_type == "watering" and forecast.rain_mm > 5:
            activity.status = "skipped"
            activity.skipped_reason = f"Rain expected: {forecast.rain_mm}mm"

        # Rule 2: Postpone spraying if wind > 20km/h
        if activity.activity_type == "spraying" and forecast.wind_speed > 20:
            activity.status = "rescheduled"
            activity.scheduled_date += timedelta(days=1)

        # Rule 3: Skip fertilizer if heavy rain > 25mm (nutrient washout)
        if activity.activity_type == "fertilizing" and forecast.rain_mm > 25:
            activity.status = "rescheduled"
            activity.skipped_reason = "Heavy rain expected - fertilizer would wash away"

    # Create weather alerts for dangerous conditions
    if forecast.rain_mm > 50:
        create_weather_alert(project_id, "flood_risk", "critical")
    if forecast.temp_min < 10:
        create_weather_alert(project_id, "frost_risk", "warning")
    if forecast.humidity > 90 and forecast.temp_max > 25:
        create_weather_alert(project_id, "disease_risk_high_humidity", "warning")
```

---

## SERVICE 5: Soil Module

**Path:** `/soil`

### Endpoints
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/soil/tests` | Submit a soil test result | Bearer |
| GET | `/soil/tests/{project_id}` | Get all soil tests for project | Bearer |
| GET | `/soil/recommendations/{project_id}` | Get computed recommendations | Bearer |

### Soil Recommendation Engine (100% Deterministic)
```python
def compute_soil_recommendations(soil_test_id: str, project_id: str):
    """
    Compare actual soil values against crop-specific optimal ranges.
    Generate specific fertilizer recommendations.
    """
    soil = get_soil_results(soil_test_id)
    project = get_project(project_id)
    plant = project.plant
    stage = get_current_stage(project)
    crop_needs = get_nutrient_requirements(plant.id, stage.id)
    is_organic = project.farming_method.code == "organic"

    recommendations = []

    # pH correction
    if soil.ph < plant.optimal_ph_min:
        recommendations.append({
            "type": "pH_correction",
            "nutrient": "pH",
            "current": soil.ph,
            "optimal": plant.optimal_ph_min,
            "severity": "severe" if (plant.optimal_ph_min - soil.ph) > 1.0 else "mild",
            "action": "Apply agricultural lime" if not is_organic else "Apply wood ash or dolomite",
            "quantity_per_acre": round((plant.optimal_ph_min - soil.ph) * 500, 1),  # kg
            "unit": "kg"
        })

    # Nitrogen check
    if soil.nitrogen_ppm < crop_needs.nitrogen_kg_per_acre * 2.24:  # Convert
        product = "Compost or blood meal" if is_organic else "Urea (46-0-0)"
        recommendations.append({
            "type": "fertilizer",
            "nutrient": "Nitrogen",
            "current": soil.nitrogen_ppm,
            "optimal": crop_needs.nitrogen_kg_per_acre * 2.24,
            "severity": calculate_severity(soil.nitrogen_ppm, crop_needs.nitrogen_kg_per_acre * 2.24),
            "action": f"Apply {product}",
            "quantity_per_acre": round(crop_needs.nitrogen_kg_per_acre - (soil.nitrogen_ppm / 2.24), 1),
            "unit": "kg"
        })

    # Repeat for Phosphorus, Potassium, etc.
    # ...

    return recommendations
```

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
```python
def generate_season_plan(project_id: str):
    """
    Called on project creation. Generates 50-100+ activities
    for the entire growing season based on:
    - Plant stages (from plant_stages table)
    - Water requirements per stage
    - Fertilizer schedule per stage
    - Disease watch calendar per stage
    """
    project = get_project(project_id)
    plant = project.plant
    stages = get_plant_stages(plant.id)  # Ordered by stage_order
    area = float(project.area)
    farming_method = project.farming_method.code
    planting_date = project.planting_date

    activities = []

    for stage in stages:
        stage_start = planting_date + timedelta(days=stage.start_day)
        stage_end = planting_date + timedelta(days=stage.end_day)
        stage_days = stage.end_day - stage.start_day

        # 1. Generate watering activities
        water = get_water_requirements(plant.id, stage.id)
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
                    scheduled_time=time(6, 0),  # Morning
                    priority=2
                ))

        # 2. Generate fertilizer activities
        fert_recs = get_fertilizer_recommendations(plant.id, stage.id)
        for fert in fert_recs:
            if farming_method == "organic" and not fert.is_organic:
                continue
            if farming_method == "inorganic" and fert.is_organic:
                continue
            # Apply at start of each stage
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
    db.bulk_save_objects(activities)
    db.commit()
```

---

## SERVICE 7: Disease Module

**Path:** `/disease`, `/issues`

### Endpoints
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/issues` | Report a problem | Bearer |
| GET | `/issues/{project_id}` | List issues for project | Bearer |
| GET | `/disease/search` | Search diseases by symptoms | Bearer |
| GET | `/disease/{id}/solutions` | Get treatment solutions | Bearer |

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
| GET | `/ai/summary/{project_id}` | Get latest cached AI summary | Bearer |
| POST | `/ai/summary/{project_id}` | Generate new AI summary | Bearer |
| POST | `/ai/chat` | Ask a question (with project context) | Bearer |

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
