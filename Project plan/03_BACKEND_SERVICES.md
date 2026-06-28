# AgriFarm AI — Backend Services Plan

## Architecture: Python FastAPI Microservices

All services are FastAPI apps, containerized with Docker, communicate via internal HTTP. API Gateway handles routing, auth middleware, and rate limiting.

---

## SERVICE 1: Auth Service
**Path:** `/services/auth`
**Purpose:** Registration, login, JWT token management, password reset

### Endpoints
```
POST /auth/register          → Create account + farmer_profile stub
POST /auth/login             → Return JWT access + refresh token
POST /auth/refresh           → Refresh access token
POST /auth/logout            → Invalidate token
POST /auth/forgot-password   → Send OTP via email/SMS
POST /auth/reset-password    → Validate OTP, update password
GET  /auth/verify-email/{token}
```

### Logic
- bcrypt password hashing
- JWT signed with RS256 (private/public key pair)
- Access token: 15 min, Refresh token: 30 days (stored in Redis)
- OTP: 6-digit, expires in 10 min, stored in Redis

---

## SERVICE 2: Farmer Profile Service
**Path:** `/services/farmer`
**Purpose:** Manage farmer profile, land, livestock, locations

### Endpoints
```
GET    /farmer/profile
PUT    /farmer/profile
POST   /farmer/locations
GET    /farmer/locations
PUT    /farmer/locations/{id}
DELETE /farmer/locations/{id}
POST   /farmer/land
GET    /farmer/land
PUT    /farmer/land/{id}
POST   /farmer/livestock
GET    /farmer/livestock
PUT    /farmer/livestock/{id}
DELETE /farmer/livestock/{id}
```

### Logic
- On profile update → trigger RAG document update (background job)
- Geocode address to lat/lng using Google Maps API or Nominatim (free)

---

## SERVICE 3: Project Service
**Path:** `/services/projects`
**Purpose:** Create and manage farming projects, project services, project dashboard data

### Endpoints
```
GET    /projects                         → List all farmer projects
POST   /projects                         → Create new project
GET    /projects/{id}                    → Get project details
PUT    /projects/{id}                    → Update project
DELETE /projects/{id}                    → Archive project
GET    /projects/{id}/dashboard          → Dashboard aggregate data
POST   /projects/{id}/services           → Add a service to project
PUT    /projects/{id}/services/{type}    → Configure a service
DELETE /projects/{id}/services/{type}    → Remove a service
GET    /projects/{id}/stage              → Current plant stage info
```

### Dashboard Aggregate Response
```json
{
  "project": { ... },
  "current_stage": { "name": "Flowering", "day": 45, "total_days": 90, "progress_pct": 50 },
  "todays_activities": [ { "id": "...", "title": "Water 200L", "type": "watering", "priority": 1 } ],
  "upcoming_activities": [ ... ],  // next 7 days
  "active_alerts": [ ... ],
  "service_blocks": [ "weather", "soil", "activity_plan", "disease_watch", "market" ],
  "issues_open": 2,
  "weather_summary": { "today": "Sunny 32°C", "rain_in_days": 3 }
}
```

### Logic
- On project creation → trigger Activity Planner Service (background)
- On project creation → trigger RAG document seeding (background)

---

## SERVICE 4: Weather Service
**Path:** `/services/weather`
**Purpose:** Fetch and cache weather forecasts, generate weather-based farming actions

### Endpoints
```
GET /weather/forecast?lat={lat}&lng={lng}          → 5-day forecast
GET /weather/forecast/project/{project_id}         → Project location forecast
GET /weather/actions/project/{project_id}          → Weather-adjusted farming actions
POST /weather/alerts/check/{project_id}            → Check and create weather alerts
```

### Logic (DETERMINISTIC — no LLM)

```python
def generate_weather_actions(forecast, project):
    actions = []
    for day in forecast['days']:
        if day['rainfall_mm'] > 5:
            actions.append({
                'date': day['date'],
                'skip_watering': True,
                'reason': f"Expected {day['rainfall_mm']}mm rain"
            })
        if day['rainfall_mm'] > 20 and project.farming_method == 'organic':
            actions.append({
                'date': day['date'],
                'action': 'Check drainage',
                'priority': 'high'
            })
        if day['humidity'] > 85 and day['temp'] > 28:
            actions.append({
                'date': day['date'],
                'warning': 'High disease risk - monitor for fungal',
                'priority': 'urgent'
            })
    return actions
```

### Cache Strategy
- Fetch weather from OpenWeatherMap / Tomorrow.io
- Cache in Redis: 3 hours TTL
- Store in `weather_cache` table for historical analysis
- Background Celery task refreshes every 3 hours for active projects

---

## SERVICE 5: Soil Analysis Service
**Path:** `/services/soil`
**Purpose:** Accept soil test results, compute nutrient gaps, generate fertilizer recommendations

### Endpoints
```
POST /soil/tests                          → Submit soil test data
GET  /soil/tests/project/{project_id}     → Get all soil tests for project
GET  /soil/tests/{test_id}               → Get single test
GET  /soil/tests/{test_id}/recommendations → Get computed recommendations
POST /soil/analyze                        → On-the-fly analysis (no save)
```

### Logic (DETERMINISTIC — no LLM)

```python
OPTIMAL_RANGES = {
    'tomato': {
        'ph': (6.0, 6.8),
        'nitrogen_ppm': (150, 250),
        'phosphorus_ppm': (30, 60),
        'potassium_ppm': (150, 250),
    },
    # ... per crop
}

def analyze_soil(soil_results, plant_id, farming_method):
    plant = get_plant(plant_id)
    optimal = OPTIMAL_RANGES[plant.common_name]
    recommendations = []
    
    # pH correction
    if soil_results.ph < optimal['ph'][0]:
        deficit = optimal['ph'][0] - soil_results.ph
        lime_kg = deficit * 1500  # rule-based formula
        recommendations.append({
            'type': 'pH_correction',
            'action': f'Apply {lime_kg}kg of agricultural lime per acre',
            'priority': 1 if deficit > 0.5 else 2
        })
    
    # Nitrogen check
    n_actual = soil_results.nitrogen_ppm
    n_optimal_mid = sum(optimal['nitrogen_ppm']) / 2
    if n_actual < optimal['nitrogen_ppm'][0]:
        gap_pct = ((n_optimal_mid - n_actual) / n_optimal_mid) * 100
        if farming_method == 'organic':
            product = 'Compost' if gap_pct < 30 else 'Blood Meal'
        else:
            product = 'Urea (46-0-0)'
        qty = calculate_nitrogen_supplement(gap_pct, area_acres=1)
        recommendations.append({
            'type': 'fertilizer',
            'nutrient': 'Nitrogen',
            'action': f'Apply {qty}kg of {product}',
            'priority': 1
        })
    
    return recommendations
```

### RAG Trigger
After soil analysis → generate RAG document summarizing soil profile and recommendations → feed into farmer's RAG model

---

## SERVICE 6: Activity Planner Service
**Path:** `/services/planner`
**Purpose:** Generate full-season activity plans based on plant stages, soil, and weather

### Endpoints
```
POST /planner/generate/{project_id}        → Generate full season plan
GET  /planner/plan/{project_id}            → Get current plan
POST /planner/adjust/{project_id}          → Weather-adjust plan
GET  /planner/today/{project_id}           → Today's activities with details
GET  /planner/week/{project_id}            → Next 7 days plan
PUT  /planner/activities/{activity_id}     → Mark done/skip/reschedule
```

### Plan Generation Logic (DETERMINISTIC)

```python
def generate_season_plan(project, soil_recommendations):
    plant = project.plant
    start_date = project.planting_date
    activities = []
    
    for stage in plant.plant_stages:
        stage_start = start_date + timedelta(days=stage.start_day)
        stage_end = start_date + timedelta(days=stage.end_day)
        
        # Watering schedule
        water_req = get_water_requirements(plant.id, stage.id)
        watering_dates = generate_watering_schedule(
            start=stage_start, end=stage_end,
            frequency_days=water_req.irrigation_frequency_days
        )
        for date in watering_dates:
            liters = calculate_water_volume(
                area=project.area,
                mm_per_day=water_req.water_mm_per_day,
                plant_count=project.plant_count
            )
            activities.append({
                'type': 'watering',
                'date': date,
                'title': f'Water plants — {liters}L',
                'details': { 'water_liters': liters, 'method': 'drip' }
            })
        
        # Fertilizer schedule
        ferts = get_fertilizer_recommendations(plant.id, stage.id, project.farming_method_id)
        for fert in ferts:
            fert_date = calculate_fert_date(stage_start, stage_end, fert.timing_note)
            qty = adjust_qty_for_area(fert.quantity_per_acre, project.area)
            activities.append({
                'type': 'fertilizing',
                'date': fert_date,
                'title': f'Apply {fert.fertilizer_type}',
                'details': {
                    'product': fert.fertilizer_type,
                    'quantity': qty, 'unit': fert.unit,
                    'method': fert.application_method
                }
            })
    
    return activities
```

### Weather Adjustment (Celery task, runs daily at 5 AM)
```python
def adjust_plan_for_weather(project_id):
    project = get_project(project_id)
    forecast = get_weather_forecast(project.location)
    activities = get_pending_activities(project_id, days=7)
    
    for activity in activities:
        day_forecast = forecast.get(activity.scheduled_date)
        if activity.type == 'watering' and day_forecast.rainfall_mm > 10:
            skip_activity(activity.id, reason=f"Rain {day_forecast.rainfall_mm}mm expected")
        if activity.type == 'spraying' and day_forecast.wind_speed > 20:
            reschedule_activity(activity.id, days=1, reason="High wind, spraying not effective")
```

---

## SERVICE 7: Disease & Pest Detection Service
**Path:** `/services/disease`
**Purpose:** Disease/pest lookup, image-based matching, solution recommendations

### Endpoints
```
POST /disease/report/{project_id}           → Farmer reports an issue
GET  /disease/report/{issue_id}             → Get issue and diagnosis
POST /disease/search                        → Search diseases/pests by symptoms
GET  /disease/watch/{project_id}            → Disease risk calendar for project
GET  /disease/solutions/{disease_id}        → Get solutions by farming method
GET  /pest/solutions/{pest_id}             → Get pest solutions by farming method
```

### Logic Flow

```
Farmer describes problem (text + optional images)
  ↓
1. DETERMINISTIC: search plant_diseases by plant_id + affected_parts + stage
   → If high confidence match (symptom keyword overlap > 70%) → return diagnosis
  ↓
2. If low confidence OR image uploaded:
   → Call LLM with context: plant, stage, symptoms, affected_parts
   → LLM returns matched disease/pest + confidence
  ↓
3. Fetch solutions from disease_solutions / pest_solutions
   filtered by project.farming_method
  ↓
4. Return diagnosis + solutions ranked by effectiveness
```

### Disease Watch Calendar (Deterministic)
```python
def generate_disease_watch_calendar(project):
    # Get diseases common to this plant in each stage
    # Cross-reference with weather (humidity + temp conditions)
    # Return a calendar of high-risk periods
    risk_periods = []
    for stage in plant.stages:
        stage_diseases = get_diseases_for_stage(plant.id, stage.id)
        for disease in stage_diseases:
            if weather_matches_conditions(disease.spread_conditions, forecast):
                risk_periods.append({
                    'start': stage.start_date,
                    'end': stage.end_date,
                    'disease': disease.disease_name,
                    'risk_level': 'high'
                })
    return risk_periods
```

---

## SERVICE 8: Market Price Service
**Path:** `/services/market`
**Purpose:** Fetch, store and analyze crop market prices

### Endpoints
```
GET /market/prices/{plant_id}?district={district}   → Latest prices
GET /market/prices/{plant_id}/trend                 → Price trend
GET /market/alert/{project_id}                      → Price alerts for farmer's crops
GET /market/best-time/{plant_id}                    → Best selling window prediction
```

### Logic
- Scheduled Celery task fetches prices daily from:
  - Sri Lanka Hector Kobbekaduwa Agrarian Research Institute API
  - Manual entry by admin
  - Scraping (where legal)
- Stores in `market_prices` table
- Computes weekly trend in `market_trends`
- Sends alert if price drops >15% or rises >20%

---

## SERVICE 9: RAG Service
**Path:** `/services/rag`
**Purpose:** Manage farmer-specific RAG knowledge base — ingest, embed, and retrieve

### Endpoints
```
POST /rag/ingest/{farmer_id}                → Add document to RAG
POST /rag/ingest/project/{project_id}       → Seed project RAG docs
GET  /rag/search/{farmer_id}?q={query}      → Semantic search
DELETE /rag/document/{document_id}          → Remove document
GET  /rag/status/{farmer_id}               → RAG index status
```

### Ingestion Pipeline

```python
async def ingest_document(farmer_id, project_id, doc_type, content, metadata):
    # 1. Store document in farmer_rag_documents
    doc = await create_rag_document(farmer_id, project_id, doc_type, content, metadata)
    
    # 2. Chunk the content (500 token chunks, 50 token overlap)
    chunks = text_splitter.split_text(content)
    
    # 3. Generate embeddings (batched)
    embeddings = await embed_texts(chunks)  # OpenAI text-embedding-3-small
    
    # 4. Store chunks with embeddings in farmer_rag_chunks
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        await create_rag_chunk(doc.id, farmer_id, i, chunk, embedding)
    
    await mark_document_indexed(doc.id)
```

### RAG Documents Generated Automatically
| Trigger | Document Content |
|---------|-----------------|
| Project created | Plant info, growth stages, typical schedule |
| Soil test added | Soil analysis summary + recommendations |
| Activity marked done | Activity history log entry |
| Issue reported + resolved | Problem + solution log |
| Market data fetched | Weekly price summary for farmer's crops |
| Weather pattern | Monthly weather summary for farmer's location |

### Retrieval

```python
async def retrieve_context(farmer_id, query, project_id=None, top_k=5):
    query_embedding = await embed_text(query)
    
    # pgvector cosine similarity search
    chunks = await db.execute("""
        SELECT content, metadata_json, 1 - (embedding <=> $1) AS similarity
        FROM farmer_rag_chunks
        WHERE farmer_id = $2
        AND ($3::uuid IS NULL OR metadata_json->>'project_id' = $3)
        ORDER BY embedding <=> $1
        LIMIT $4
    """, query_embedding, farmer_id, project_id, top_k)
    
    return chunks
```

---

## SERVICE 10: MCP Server (Per Farmer)
**Path:** `/services/mcp`
**Purpose:** Per-farmer Model Context Protocol server — routes LLM tool calls to correct service

### Tools Exposed via MCP
```python
tools = [
    MCPTool(
        name="get_weather_forecast",
        description="Get weather forecast for farmer's location",
        input_schema={ "project_id": "string" },
        handler=weather_service.get_forecast
    ),
    MCPTool(
        name="get_soil_status",
        description="Get soil test results and recommendations",
        input_schema={ "project_id": "string" },
        handler=soil_service.get_latest
    ),
    MCPTool(
        name="get_activity_plan",
        description="Get scheduled farming activities",
        input_schema={ "project_id": "string", "days": "integer" },
        handler=planner_service.get_activities
    ),
    MCPTool(
        name="get_disease_solutions",
        description="Get treatment solutions for a disease or pest",
        input_schema={ "disease_id": "string", "farming_method": "string" },
        handler=disease_service.get_solutions
    ),
    MCPTool(
        name="get_market_prices",
        description="Get current market prices for crop",
        input_schema={ "plant_id": "string", "district": "string" },
        handler=market_service.get_prices
    ),
    MCPTool(
        name="search_farmer_knowledge",
        description="Search farmer's personal RAG knowledge base",
        input_schema={ "query": "string", "project_id": "string" },
        handler=rag_service.retrieve_context
    ),
    MCPTool(
        name="log_farmer_note",
        description="Save farmer observation to knowledge base",
        input_schema={ "note": "string", "project_id": "string" },
        handler=rag_service.ingest_note
    )
]
```

### MCP Server Lifecycle
- One MCP server instance per farmer session (not per request)
- Initialized with farmer_id and current project context
- Stateless between sessions — context loaded fresh from DB

---

## SERVICE 11: AI Assistant Service
**Path:** `/services/ai`
**Purpose:** Handle farmer chat, complex reasoning, personalized guidance using LLM + RAG + MCP

### Endpoints
```
POST /ai/chat/{project_id}                → Send message, get response
GET  /ai/conversations/{project_id}       → Conversation history
POST /ai/diagnose/{issue_id}              → AI disease/pest diagnosis
POST /ai/summarize/{project_id}           → Generate project health summary
GET  /ai/insights/{project_id}            → Proactive AI insights
```

### Cost-Efficient Chat Flow

```python
async def process_farmer_chat(farmer_id, project_id, message):
    # 1. Try to answer deterministically first
    intent = classify_intent(message)  # rule-based intent classifier
    
    if intent == 'watering_schedule':
        return planner_service.get_watering_details(project_id)
    if intent == 'weather_today':
        return weather_service.get_today_summary(project_id)
    if intent == 'market_price':
        return market_service.get_latest_prices(project_id)
    
    # 2. For complex questions → use LLM with RAG context
    context_chunks = await rag_service.retrieve_context(
        farmer_id=farmer_id,
        query=message,
        project_id=project_id,
        top_k=5
    )
    
    system_prompt = build_system_prompt(farmer_profile, project, context_chunks)
    
    response = await anthropic_client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        system=system_prompt,
        messages=conversation_history + [{"role": "user", "content": message}]
    )
    
    # 3. Log token usage for cost tracking
    await log_ai_query(farmer_id, project_id, input_tokens, output_tokens)
    
    return response.content[0].text
```

---

## SERVICE 12: Notification Service
**Path:** `/services/notifications`
**Purpose:** Schedule and send push notifications, in-app alerts

### Endpoints
```
GET    /notifications/{farmer_id}                → List notifications
PUT    /notifications/{id}/read                  → Mark as read
PUT    /notifications/mark-all-read             → Mark all read
POST   /notifications/push-token                → Register device push token
DELETE /notifications/push-token               → Remove push token
```

### Celery Beat Scheduled Tasks
```python
# Every day at 5:00 AM — generate today's notifications
@celery.task
def send_daily_activity_notifications():
    active_projects = get_all_active_projects()
    for project in active_projects:
        activities = planner.get_todays_activities(project.id)
        for activity in activities:
            create_notification(
                farmer_id=project.farmer_id,
                project_id=project.id,
                activity_id=activity.id,
                title=activity.title,
                message=build_activity_message(activity),
                scheduled_for=today_8am_in_farmer_timezone
            )

# Every 3 hours — check weather and send alerts
@celery.task
def check_weather_alerts():
    for project in active_projects:
        forecast = weather_service.get_forecast(project.location)
        alerts = weather_service.check_alerts(project, forecast)
        for alert in alerts:
            push_notification(project.farmer_id, alert)
```
