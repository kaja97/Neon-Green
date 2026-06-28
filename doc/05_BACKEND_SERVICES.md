# AgriFarm AI — Backend Services Plan

## Architecture: 12 FastAPI Microservices

All services are Python FastAPI apps, containerized with Docker. The API Gateway handles routing, JWT auth middleware, and rate limiting.

---

## SERVICE 1: Auth Service
**Port:** 8001 | **Path prefix:** `/auth`

### Purpose
Registration, login, JWT token lifecycle, password reset.

### Endpoints
```
POST /auth/register          → Create account + farmer_profile stub
POST /auth/login             → Return JWT access + refresh token
POST /auth/refresh           → Refresh access token
POST /auth/logout            → Invalidate refresh token
POST /auth/forgot-password   → Send OTP via email/SMS
POST /auth/verify-otp        → Validate OTP, set new password
GET  /auth/verify-email/{token}
```

### Logic
- **Password:** bcrypt hashing (cost factor 12)
- **JWT:** RS256 signed (private/public key pair)
- **Access token:** 15 min TTL
- **Refresh token:** 30 days, stored in Redis (key: `refresh:{farmer_id}:{jti}`)
- **OTP:** 6-digit, 10 min TTL, stored in Redis

---

## SERVICE 2: Farmer Profile Service
**Port:** 8002 | **Path prefix:** `/farmer`

### Purpose
CRUD for farmer profile, land details, locations, and livestock.

### Endpoints
```
GET    /farmer/me                      → Full profile (profile + locations + land + livestock)
PUT    /farmer/me                      → Update profile
POST   /farmer/locations               → Add a location
GET    /farmer/locations               → List locations
PUT    /farmer/locations/{id}          → Update location
DELETE /farmer/locations/{id}          → Remove location
POST   /farmer/land                    → Add land details
GET    /farmer/land                    → List land details
PUT    /farmer/land/{id}               → Update land
DELETE /farmer/land/{id}              → Remove land
POST   /farmer/livestock               → Add livestock
GET    /farmer/livestock               → List livestock
PUT    /farmer/livestock/{id}          → Update livestock
DELETE /farmer/livestock/{id}          → Remove livestock
```

### Logic
- On profile update → trigger background job to update RAG documents
- On location add → geocode address to lat/lng (Google Maps or Nominatim)
- Avatar upload → store in S3, save URL in `farmer_profiles.avatar_url`

---

## SERVICE 3: Project Service
**Port:** 8003 | **Path prefix:** `/projects`

### Purpose
Create/manage farming projects, activate services, return dashboard aggregate data.

### Endpoints
```
GET    /projects                         → List all projects (with stage + progress + alerts)
POST   /projects                         → Create new project
GET    /projects/{id}                    → Full project details
PUT    /projects/{id}                    → Update project
DELETE /projects/{id}                    → Soft archive project
GET    /projects/{id}/dashboard          → Full dashboard aggregate
POST   /projects/{id}/services           → Enable a service for this project
PUT    /projects/{id}/services/{type}    → Configure service settings
DELETE /projects/{id}/services/{type}    → Disable a service
GET    /projects/{id}/stage              → Current stage info + progress
```

### Dashboard Response Shape
```json
{
  "project": { "id": "...", "name": "Tomato Farm", "area": 1.0 },
  "current_stage": {
    "name": "Flowering",
    "stage_order": 4,
    "day_in_stage": 8,
    "days_since_planting": 45,
    "total_days": 90,
    "progress_pct": 50,
    "key_indicators": "...",
    "watch_for": "..."
  },
  "todays_activities": [
    { "id": "...", "title": "Water 180L", "type": "watering", "priority": 2, "status": "pending" }
  ],
  "upcoming_activities": [...],
  "active_alerts": [...],
  "open_issues_count": 1,
  "weather_summary": { "today": "Sunny 32°C", "rain_in_days": 3 },
  "soil_summary": { "ph": 6.2, "nitrogen_status": "LOW", "last_test": "2025-05-28" },
  "market_summary": { "price": 180, "unit": "kg", "trend": "rising" },
  "service_blocks": ["weather", "soil", "activity_plan", "disease_watch", "market", "ai_chat"]
}
```

### Logic
- On project creation:
  - Trigger `generate_season_plan(project_id)` via Celery
  - Trigger `seed_rag_documents(project_id)` via Celery
  - Compute and set `expected_harvest_date` from `planting_date + plant.growth_duration_days`

---

## SERVICE 4: Weather Service
**Port:** 8004 | **Path prefix:** `/weather`

### Purpose
Fetch weather forecasts, cache them, generate farm-specific weather actions and alerts.

### Endpoints
```
GET  /weather/project/{project_id}         → 5-day forecast + farm actions + alerts
GET  /weather/project/{project_id}/alerts  → Active weather alerts
POST /weather/alerts/{alert_id}/acknowledge → Mark alert as seen
```

### Weather Action Logic (DETERMINISTIC — no LLM)
```python
def generate_weather_actions(forecast_days, project):
    actions = []
    for day in forecast_days:
        # Watering skip
        if day['rainfall_mm'] > 10:
            actions.append({
                'date': day['date'],
                'action_type': 'skip_watering',
                'reason': f"Rain {day['rainfall_mm']}mm expected",
                'priority': 'info'
            })
        # Spraying postpone
        if day['wind_speed_kmh'] > 20:
            actions.append({
                'date': day['date'],
                'action_type': 'postpone_spraying',
                'reason': "High wind — spray won't be effective",
                'priority': 'warning'
            })
        # Disease risk alert
        if day['humidity_pct'] > 85 and day['temp_max'] > 28:
            actions.append({
                'date': day['date'],
                'action_type': 'disease_risk',
                'reason': "High humidity + heat — fungal disease risk",
                'priority': 'urgent'
            })
        # Frost alert
        if day['temp_min'] < 5:
            actions.append({
                'date': day['date'],
                'action_type': 'frost_warning',
                'reason': f"Frost risk — temp drops to {day['temp_min']}°C",
                'priority': 'critical'
            })
    return actions
```

### Cache Strategy
- Fetch from OpenWeatherMap (free tier: 1000 calls/day)
- Store in Redis: 3-hour TTL (key: `weather:{lat_3dp},{lng_3dp}`)
- Also persist in `weather_cache` table for historical analysis
- Celery Beat: refresh every 3 hours for all active project locations

---

## SERVICE 5: Soil Analysis Service
**Port:** 8005 | **Path prefix:** `/soil`

### Purpose
Accept soil test inputs, compute nutrient gap analysis, generate prioritized fertilizer recommendations.

### Endpoints
```
POST /soil/tests                            → Submit test data, get instant recommendations
GET  /soil/tests/project/{project_id}       → All tests for a project
GET  /soil/tests/{test_id}                  → Single test + results + recommendations
GET  /soil/tests/{test_id}/recommendations  → Prioritized recommendations list
POST /soil/analyze                          → Quick analysis without saving
```

### Soil Analysis Logic (DETERMINISTIC — no LLM)

```python
OPTIMAL_RANGES_BY_CROP = {
    'tomato': {
        'ph':              (6.0, 6.8),
        'nitrogen_ppm':    (150, 250),
        'phosphorus_ppm':  (30,  60),
        'potassium_ppm':   (150, 250),
        'calcium_ppm':     (200, 400),
        'magnesium_ppm':   (50,  100),
        'organic_matter':  (2.5, 5.0),  # percent
    },
    # ... per crop from plant_nutrient_requirements table
}

def analyze_soil(soil_results, plant, project, farming_method):
    optimal = OPTIMAL_RANGES_BY_CROP[plant.common_name.lower()]
    recommendations = []
    
    # pH correction
    if soil_results.ph < optimal['ph'][0]:
        deficit = optimal['ph'][0] - soil_results.ph
        lime_kg_per_acre = deficit * 1500  # industry standard formula
        qty = lime_kg_per_acre * project.area
        recommendations.append({
            'type': 'pH_correction',
            'nutrient': 'pH',
            'current': soil_results.ph,
            'optimal': f"{optimal['ph'][0]}–{optimal['ph'][1]}",
            'severity': 'severe' if deficit > 0.5 else 'moderate',
            'action': f"Apply {qty:.0f}kg agricultural lime per {project.area} {project.area_unit}",
            'product': 'Agricultural Lime (CaCO₃)',
            'priority': 1 if deficit > 0.5 else 2
        })
    
    # Nutrient gap calculations
    for nutrient in ['nitrogen_ppm', 'phosphorus_ppm', 'potassium_ppm']:
        actual = getattr(soil_results, nutrient)
        low, high = optimal[nutrient]
        if actual < low:
            gap_pct = ((low - actual) / low) * 100
            severity = 'severe' if gap_pct > 50 else 'moderate' if gap_pct > 25 else 'mild'
            product, qty = get_fertilizer_recommendation(nutrient, gap_pct, farming_method, project.area)
            recommendations.append({
                'type': 'fertilizer',
                'nutrient': nutrient,
                'severity': severity,
                'action': f"Apply {qty:.1f}kg {product}",
                'product': product,
                'priority': 1 if severity == 'severe' else 2
            })
    
    return sorted(recommendations, key=lambda r: r['priority'])
```

### RAG Trigger
After analysis → generate summary text → ingest into farmer's RAG knowledge base

---

## SERVICE 6: Activity Planner Service
**Port:** 8006 | **Path prefix:** `/planner`

### Purpose
Generate the full-season activity plan, serve daily/weekly task views, handle status updates.

### Endpoints
```
POST /planner/generate/{project_id}         → (Re)generate full season plan (background)
GET  /planner/plan/{project_id}             → Full plan by week
GET  /planner/today/{project_id}            → Today's activities with full details
GET  /planner/week/{project_id}             → 7-day view
PUT  /planner/activities/{activity_id}      → Mark done / skip / note
POST /planner/activities/{activity_id}/reschedule → Move to different date
POST /planner/adjust/{project_id}           → Re-run weather adjustment on next 7 days
```

### Plan Generation Logic (DETERMINISTIC — no LLM)

```python
def generate_season_plan(project_id):
    project   = get_project(project_id)
    plant     = project.plant
    stages    = get_plant_stages(plant.id)
    method_id = project.farming_method_id
    activities = []

    for stage in sorted(stages, key=lambda s: s.stage_order):
        stage_start = project.planting_date + timedelta(days=stage.start_day)
        stage_end   = project.planting_date + timedelta(days=stage.end_day)

        # 1. Watering schedule
        water_req = get_water_requirements(plant.id, stage.id)
        for date in date_range(stage_start, stage_end, step=water_req.irrigation_frequency_days):
            litres = water_mm_to_litres(water_req.water_mm_per_day, project.area)
            activities.append(Activity(
                type='watering',
                title=f"Water plants — {litres:.0f}L",
                scheduled_date=date,
                priority=2,
                details={'water_liters': litres, 'method': project.irrigation_type}
            ))

        # 2. Fertilizer schedule
        ferts = get_fertilizer_recommendations(plant.id, stage.id, method_id)
        for fert in ferts:
            fert_date = parse_timing(fert.timing_note, stage_start, stage_end)
            qty = fert.quantity_per_acre * project.area
            activities.append(Activity(
                type='fertilizing',
                title=f"Apply {fert.fertilizer_type} — {qty:.1f}{fert.unit}",
                scheduled_date=fert_date,
                priority=2,
                details={
                    'product': fert.fertilizer_type,
                    'quantity': qty, 'unit': fert.unit,
                    'method': fert.application_method
                }
            ))

        # 3. Stage monitoring
        activities.append(Activity(
            type='monitoring',
            title=f"Begin {stage.stage_name} stage care",
            scheduled_date=stage_start,
            priority=1,
            description=f"{stage.critical_actions}\n\nWatch for: {stage.watch_for}"
        ))

    # Bulk insert all activities
    bulk_create_activities(project_id, activities)
```

### Daily Weather Adjustment (Celery task — 5 AM)
```python
def adjust_plan_for_weather(project_id):
    forecast   = get_weather_forecast(project.location)
    activities = get_pending_activities(project_id, days=7)

    for activity in activities:
        day_fc = forecast.get(activity.scheduled_date)
        if not day_fc:
            continue

        if activity.activity_type == 'watering' and day_fc['rainfall_mm'] > 10:
            skip_activity(activity.id, reason=f"Rain {day_fc['rainfall_mm']}mm expected")

        elif activity.activity_type == 'spraying' and day_fc['wind_speed_kmh'] > 20:
            reschedule_activity(activity.id, days=1, reason="High wind — rescheduled")
```

---

## SERVICE 7: Disease & Pest Detection Service
**Port:** 8007 | **Path prefix:** `/disease`, `/pest`, `/issues`

### Purpose
Disease/pest lookup, issue reporting, AI-assisted diagnosis, solution delivery.

### Endpoints
```
POST /issues/report                         → Submit a problem report
GET  /issues/project/{project_id}           → All issues for project
GET  /issues/{issue_id}                     → Issue + diagnosis + solutions
PUT  /issues/{issue_id}                     → Update resolution status

GET  /disease/watch/{project_id}            → Disease risk calendar
GET  /disease/search?plant_id=&symptoms=    → Search by keyword
GET  /disease/{disease_id}/solutions        → Solutions by farming method

GET  /pest/{pest_id}/solutions              → Pest solutions by method
```

### Diagnosis Flow
```
1. KEYWORD MATCH (deterministic):
   Query plant_diseases WHERE plant_id = project.plant_id
   Filter by affected_parts overlap with farmer's report
   Score each by symptom keyword overlap

   IF best_match_score > 0.70 → return diagnosis (no LLM needed)

2. LLM FALLBACK (only if low confidence or image uploaded):
   Build context: plant, stage, symptoms, affected_parts, stage risk list
   Call Claude API → structured JSON response:
     { matched_disease: "...", confidence: 0.85, reasoning: "..." }

3. SOLUTION FETCH (deterministic):
   Query disease_solutions / pest_solutions
   Filter by project.farming_method_id
   Sort by effectiveness DESC
```

### Disease Risk Calendar (Deterministic)
```python
def generate_disease_watch_calendar(project, forecast):
    risk_calendar = []
    for stage in project.plant.stages:
        stage_diseases = get_diseases_common_to_stage(project.plant_id, stage.id)
        for disease in stage_diseases:
            for day in forecast.days:
                if weather_matches_spread_conditions(disease.spread_conditions, day):
                    risk_calendar.append({
                        'date': day.date,
                        'disease_name': disease.disease_name,
                        'risk_level': compute_risk_level(disease, day),
                        'prevention_action': get_prevention_tip(disease, project.farming_method)
                    })
    return risk_calendar
```

---

## SERVICE 8: Market Price Service
**Port:** 8008 | **Path prefix:** `/market`

### Purpose
Store, retrieve, and analyze crop market prices. Generate price alerts.

### Endpoints
```
GET /market/project/{project_id}        → Current price + trend + revenue estimate
GET /market/prices/{plant_id}           → Prices by district
GET /market/trends/{plant_id}           → 30-day trend data
POST /market/admin/prices               → Admin endpoint to add price records
```

### Logic
- Celery task: fetch prices daily from Sri Lanka Agri API or manual admin entry
- Weekly: compute `market_trends` records (avg, min, max, direction, % change)
- Alert: if price drops > 15% or rises > 20% → create notification for farmer
- Revenue estimate: `yield_kg_per_acre * project.area * current_price`

---

## SERVICE 9: RAG Service
**Port:** 8009 | **Path prefix:** `/rag`

### Purpose
Per-farmer knowledge base — document ingestion, embedding, and semantic retrieval.

### Endpoints
```
POST /rag/ingest/{farmer_id}            → Ingest a document (admin/internal)
POST /rag/ingest/project/{project_id}  → Seed all docs for a new project
GET  /rag/status/{farmer_id}           → RAG index status
GET  /rag/search/{farmer_id}?q=...     → Debug semantic search
```

### Ingestion Pipeline
```python
async def ingest_document(farmer_id, project_id, doc_type, title, content, metadata):
    # 1. Store document
    doc = await create_farmer_rag_document(
        farmer_id, project_id, doc_type, title, content, metadata
    )

    # 2. Chunk (500-token chunks, 50-token overlap)
    chunks = text_splitter.split_text(content)

    # 3. Embed (batched API call)
    embeddings = await openai_client.embeddings.create(
        input=chunks,
        model="text-embedding-3-small"
    )

    # 4. Store in pgvector
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings.data)):
        await create_rag_chunk(doc.id, farmer_id, i, chunk, embedding.embedding, metadata)

    await mark_document_indexed(doc.id)
```

### Retrieval
```python
async def retrieve_context(farmer_id, query, project_id=None, top_k=5):
    query_embedding = await embed_text(query)

    chunks = await db.execute("""
        SELECT content, metadata_json,
               1 - (embedding <=> $1) AS similarity
        FROM farmer_rag_chunks
        WHERE farmer_id = $2
          AND ($3::uuid IS NULL OR metadata_json->>'project_id' = $3::text)
        ORDER BY embedding <=> $1
        LIMIT $4
    """, query_embedding, farmer_id, project_id, top_k)

    return chunks
```

### Auto-Generated Documents
| Trigger | Document Created |
|---------|-----------------|
| Project created | Full plant guide (stages, care, nutrient needs) |
| Soil test submitted | Soil analysis + gap recommendations |
| Activity marked done | Activity log entry |
| Issue resolved | Problem + solution applied |
| Market data fetched | Weekly price summary |
| Monthly | Weather pattern summary |

---

## SERVICE 10: MCP Server
**Port:** 8010 | **Path prefix:** `/mcp`

### Purpose
Per-farmer virtual MCP server. Routes tool calls from LLM to correct backend services.

### Tools Exposed
| Tool Name | Description | Routes To |
|-----------|-------------|-----------|
| `get_current_weather` | Today's weather + 5-day forecast | Weather Service |
| `get_todays_activities` | Today's scheduled tasks | Planner Service |
| `get_soil_status` | Latest soil test + recommendations | Soil Service |
| `get_market_prices` | Current crop prices | Market Service |
| `get_disease_solutions` | Treatments for a disease | Disease Service |
| `search_knowledge` | Semantic search of farmer's RAG | RAG Service |
| `save_note` | Store observation in knowledge base | RAG Service |

### MCP Session Lifecycle
```
Farmer opens AI Chat
    ↓
Initialize FarmerMCPServer(farmer_id, project_id)
    → Load farmer profile
    → Load current project + stage
    → Register all tools
    ↓
LLM receives system prompt with farmer context
LLM calls tools as needed via MCP
MCP routes → correct service → returns structured data
LLM assembles personalized response
Session closes
```

---

## SERVICE 11: AI Assistant Service
**Port:** 8011 | **Path prefix:** `/ai`

### Purpose
Handle farmer chat, complex reasoning, disease diagnosis, and summaries.

### Endpoints
```
POST /ai/chat                          → Send message, get AI response
GET  /ai/conversations/{project_id}   → Conversation history list
GET  /ai/conversations/{id}/messages  → Full message thread
POST /ai/diagnose/{issue_id}          → AI disease diagnosis
POST /ai/insights/{project_id}        → Proactive AI insights
POST /ai/summarize/{project_id}       → End-of-week/season summary
```

### Cost-Efficient Chat Flow
```python
async def process_chat(farmer_id, project_id, message, conversation_id):
    # STEP 1: Try deterministic intent first
    intent = classify_intent(message)
    if intent == 'watering_schedule':
        return planner.get_watering_details(project_id)
    if intent == 'weather_today':
        return weather.get_today_summary(project_id)
    if intent == 'market_price':
        return market.get_latest_prices(project_id)
    if intent == 'harvest_date':
        return project.get_harvest_estimate(project_id)

    # STEP 2: Check AI budget
    if not await check_daily_budget(farmer_id):
        return {"message": "Daily AI limit reached. Ask specific questions for instant answers."}

    # STEP 3: RAG retrieval
    context_chunks = await rag.retrieve_context(farmer_id, message, project_id, top_k=5)

    # STEP 4: Build system prompt with full farmer context
    system = build_system_prompt(farmer_profile, project, current_stage, weather_today, context_chunks)

    # STEP 5: Call Claude
    response = await anthropic_client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=800,
        system=system,
        messages=trim_conversation(conversation_history) + [{"role": "user", "content": message}]
    )

    # STEP 6: Log token usage
    await log_ai_query(farmer_id, project_id, response.usage)

    return {"message": response.content[0].text, "conversation_id": conversation_id}
```

---

## SERVICE 12: Notification Service
**Port:** 8012 | **Path prefix:** `/notifications`

### Purpose
Serve, manage, and dispatch push notifications. Scheduled via Celery Beat.

### Endpoints
```
GET    /notifications                    → List farmer's notifications
GET    /notifications/count              → Unread count
PUT    /notifications/{id}/read         → Mark as read
POST   /notifications/mark-all-read     → Mark all read
POST   /notifications/push-token        → Register device for push
DELETE /notifications/push-token        → Unregister device
```

### Celery Beat Schedule
```python
# 5:00 AM — Adjust activities for weather, create today's notification records
@celery.task
def daily_plan_and_notifications():
    for project in get_active_projects():
        adjust_plan_for_weather(project.id)
        activities = get_todays_activities(project.id)
        for act in activities:
            create_notification(
                farmer_id=project.farmer_id,
                project_id=project.id,
                activity_id=act.id,
                type='activity_reminder',
                title=act.title,
                message=build_message(act),
                deep_link=f"/projects/{project.id}?scroll=activity_plan&highlight={act.id}",
                scheduled_for=6am_in_farmer_timezone(project.location.timezone)
            )

# 6:00 AM — Send push notifications that are due
@celery.task
def dispatch_push_notifications():
    due = get_notifications_due_for_push(now())
    for notif in due:
        if push_token := get_farmer_push_token(notif.farmer_id):
            web_push(push_token, notif.title, notif.message)
            mark_notification_pushed(notif.id)

# Every 3 hours — Check weather and push urgent alerts
@celery.task
def check_weather_alerts():
    for project in get_active_projects():
        alerts = weather_service.check_for_new_alerts(project)
        for alert in alerts:
            push_urgent_notification(project.farmer_id, alert)
```
