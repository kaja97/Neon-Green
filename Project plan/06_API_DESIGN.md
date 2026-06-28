# AgriFarm AI — API Design

## Base URL: `https://api.agrifarm.app/v1`

## Authentication
All endpoints (except auth routes) require:
```
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

## Standard Response Envelope
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 45
  },
  "error": null
}
```

## Error Response
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "SOIL_TEST_NOT_FOUND",
    "message": "No soil test found for this project",
    "details": {}
  }
}
```

---

## AUTH ENDPOINTS

```
POST /auth/register
Body: { email, phone, password, full_name, district }
Response: { account, farmer_profile, access_token, refresh_token }

POST /auth/login
Body: { email_or_phone, password }
Response: { access_token, refresh_token, farmer_profile }

POST /auth/refresh
Body: { refresh_token }
Response: { access_token }

POST /auth/logout
Body: { refresh_token }
Response: { success: true }

POST /auth/forgot-password
Body: { email_or_phone }
Response: { message: "OTP sent" }

POST /auth/verify-otp
Body: { email_or_phone, otp, new_password }
Response: { access_token }
```

---

## FARMER PROFILE ENDPOINTS

```
GET  /farmer/me
Response: { account, profile, locations, land_details, livestock }

PUT  /farmer/me
Body: { full_name, primary_language, experience_years }

POST /farmer/locations
Body: { label, address_line, city, district, latitude, longitude, is_primary }

GET  /farmer/locations
Response: [ FarmerLocation ]

PUT  /farmer/locations/{location_id}
DELETE /farmer/locations/{location_id}

POST /farmer/land
Body: { location_id, total_area, area_unit, land_type, soil_type, water_source, irrigation_type }

GET  /farmer/land
PUT  /farmer/land/{land_id}
DELETE /farmer/land/{land_id}

POST /farmer/livestock
Body: { animal_type, breed, count, purpose, notes }
GET  /farmer/livestock
PUT  /farmer/livestock/{id}
DELETE /farmer/livestock/{id}
```

---

## PROJECT ENDPOINTS

```
GET  /projects
Query: ?status=active&page=1&per_page=10
Response: [ ProjectSummary with current_stage, progress_pct, alert_count, today_task_count ]

POST /projects
Body: {
  plant_id, name, description, farming_method_id,
  location_id, land_detail_id,
  area, area_unit, plant_count,
  planting_date, expected_harvest_date,
  services: ['weather', 'activity_plan', 'soil', 'market', 'disease_watch', 'ai_chat']
}
Response: { project, generated_plan_id }

GET  /projects/{project_id}
Response: { project, plant, current_stage, farming_method, location }

PUT  /projects/{project_id}
Body: { name, description, status, notes }

DELETE /projects/{project_id}
(Soft delete — sets status to 'archived')

GET  /projects/{project_id}/dashboard
Response: {
  project, current_stage, progress_pct,
  todays_activities: [ Activity ],
  upcoming_activities: [ Activity ],  // next 7 days
  active_alerts: [ Alert ],
  open_issues: Integer,
  weather_summary: WeatherSummary,
  soil_summary: SoilSummary | null,
  market_summary: MarketSummary | null,
  service_blocks: [ ServiceBlockType ]
}
```

---

## WEATHER ENDPOINTS

```
GET /weather/project/{project_id}
Response: {
  location: { lat, lng, name },
  forecast: [
    {
      date: "2025-06-10",
      condition: "rain",
      temp_max: 32, temp_min: 24,
      rainfall_mm: 18,
      humidity_pct: 85,
      wind_speed_kmh: 12,
      uv_index: 7
    }
  ],
  farm_actions: [
    {
      date: "2025-06-10",
      action_type: "skip_watering",
      reason: "18mm rain expected",
      priority: "info"
    }
  ],
  active_alerts: [ WeatherAlert ]
}

GET /weather/project/{project_id}/alerts
Response: [ WeatherAlert ]

POST /weather/alerts/{alert_id}/acknowledge
```

---

## SOIL ENDPOINTS

```
POST /soil/tests
Body: {
  project_id,
  test_date, lab_name, report_ref,
  ph, nitrogen_ppm, phosphorus_ppm, potassium_ppm,
  calcium_ppm, magnesium_ppm, sulfur_ppm,
  zinc_ppm, boron_ppm, iron_ppm,
  organic_matter_pct, ec_ds_per_m
}
Response: { soil_test, recommendations: [ SoilRecommendation ] }

GET /soil/tests/project/{project_id}
Response: [ SoilTest with nutrient_results ]

GET /soil/tests/{test_id}
Response: { soil_test, nutrient_results, recommendations }

GET /soil/tests/{test_id}/recommendations
Response: [ SoilRecommendation sorted by priority ]

POST /soil/analyze
Body: { same as POST /soil/tests but without saving }
Response: { recommendations }  # quick analysis without storage
```

---

## ACTIVITY PLAN ENDPOINTS

```
POST /planner/generate/{project_id}
(Triggers background task — returns plan_id)
Response: { plan_id, message: "Plan generation started" }

GET  /planner/plan/{project_id}
Response: { plan, activities_by_week: { "2025-W23": [ Activity ] } }

GET  /planner/today/{project_id}
Response: {
  date: "2025-06-10",
  activities: [
    {
      id, type, title, priority, status,
      details: { water_liters: 180, method: "drip" },
      note: "High humidity today — check for mold after"
    }
  ]
}

GET  /planner/week/{project_id}
Query: ?start_date=2025-06-10
Response: { days: [ { date, activities: [ Activity ] } ] }

PUT  /planner/activities/{activity_id}
Body: { status: "done" | "skipped", notes, completed_at }

POST /planner/activities/{activity_id}/reschedule
Body: { new_date, reason }

POST /planner/adjust/{project_id}
(Re-runs weather adjustment on next 7 days)
Response: { adjusted_count: 3, changes: [ { activity_id, change_type, reason } ] }
```

---

## DISEASE & PEST ENDPOINTS

```
POST /issues/report
Body: {
  project_id,
  issue_type: "disease" | "pest" | "other",
  description,
  affected_parts: ["leaves", "stem"],
  affected_area_pct: 20,
  image_urls: []
}
Response: {
  issue,
  diagnosis: {
    matched_disease: Disease | null,
    matched_pest: Pest | null,
    confidence: 0.85,
    method: "keyword" | "llm",
    solutions: [ Solution ]
  }
}

GET  /issues/project/{project_id}
GET  /issues/{issue_id}
PUT  /issues/{issue_id}
Body: { resolution_status, resolution_notes }

GET  /disease/watch/{project_id}
Response: {
  current_risk_level: "medium",
  risk_calendar: [
    { date: "2025-06-12", risk: "high", disease: "Late Blight", reason: "High humidity forecast" }
  ],
  diseases_to_watch: [ Disease with prevention_tips ]
}

GET  /disease/search
Query: ?plant_id={id}&symptoms=yellowing+leaves&stage_id={id}
Response: [ Disease with confidence_score ]

GET  /disease/{disease_id}/solutions?method=organic
Response: [ DiseaseSolution ]

GET  /pest/{pest_id}/solutions?method=organic
Response: [ PestSolution ]
```

---

## MARKET ENDPOINTS

```
GET /market/prices/{plant_id}
Query: ?district=colombo
Response: {
  plant, district,
  latest_price: { price, unit, date, source },
  change_pct: 12.5,
  change_direction: "rising",
  prices_by_market: [
    { market_name, price, date }
  ]
}

GET /market/trends/{plant_id}
Query: ?district=colombo&period=30d
Response: {
  trend_data: [ { date, avg_price } ],
  direction: "rising",
  best_sell_window: "2025-06-20 to 2025-06-25"
}

GET /market/project/{project_id}
Response: {
  plant, latest_price, trend,
  estimated_revenue: {
    yield_kg: 1200, price_per_kg: 180, total_lkr: 216000
  }
}
```

---

## AI CHAT ENDPOINTS

```
POST /ai/chat
Body: {
  project_id,
  message: "My tomato leaves are turning yellow",
  conversation_id: null,  // null = new conversation
  image_urls: []
}
Response: {
  conversation_id,
  message: "Based on your tomato farm at Day 45...",
  suggestions: [ "Report as issue", "See disease solutions" ],
  related_service: "disease",  // hints which block to scroll to
  tokens_used: { input: 850, output: 320 }
}

GET  /ai/conversations/{project_id}
Response: [ ConversationSummary ]

GET  /ai/conversations/{conversation_id}/messages
Response: [ { role, content, timestamp } ]

POST /ai/insights/{project_id}
(Generate proactive insights)
Response: {
  insights: [
    {
      type: "weather_opportunity",
      title: "Good planting window",
      message: "Next 3 days have ideal conditions for transplanting seedlings",
      action: "View activity plan"
    }
  ]
}
```

---

## NOTIFICATIONS ENDPOINTS

```
GET  /notifications
Query: ?is_read=false&type=activity&page=1
Response: [ Notification ]

GET  /notifications/count
Response: { unread: 5 }

PUT  /notifications/{id}/read

POST /notifications/mark-all-read

POST /notifications/push-token
Body: { token, platform: "web" | "ios" | "android" }

DELETE /notifications/push-token
Body: { token }
```

---

## RAG / AI KNOWLEDGE ENDPOINTS (Internal — Admin/Debug)

```
GET  /rag/status/{farmer_id}
Response: { document_count, chunk_count, last_indexed }

POST /rag/reindex/{farmer_id}
(Trigger full reindex — admin only)

GET  /rag/search/{farmer_id}?q=tomato+nitrogen+deficiency
(Debug endpoint — returns raw chunks)
```

---

## MASTER DATA ENDPOINTS (Seeded, rarely changes)

```
GET /plants
Query: ?category=vegetable&q=tomato
Response: [ Plant ]

GET /plants/{plant_id}
Response: { plant, stages, nutrient_requirements, water_requirements, diseases, pests }

GET /plants/{plant_id}/stages
GET /plants/{plant_id}/diseases
GET /plants/{plant_id}/pests
GET /farming-methods
```
