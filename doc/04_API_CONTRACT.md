# AgriFarm AI — API Contract

## Base URL
```
Development:  http://localhost:8000/v1
Production:   https://api.agrifarm.app/v1
```

## Authentication
All protected endpoints require:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

## Standard Response Envelope
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "per_page": 20, "total": 45 }
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

### Register
```
POST /auth/register
Body: {
  "email": "farmer@example.com",
  "phone": "+94771234567",
  "password": "secure123",
  "full_name": "Nimal Perera",
  "district": "Colombo"
}
Response: {
  "account": { "id": "...", "email": "..." },
  "farmer_profile": { "id": "...", "full_name": "Nimal Perera" },
  "access_token": "eyJ...",
  "refresh_token": "eyJ..."
}
```

### Login
```
POST /auth/login
Body: { "email_or_phone": "farmer@example.com", "password": "secure123" }
Response: { "access_token": "...", "refresh_token": "...", "farmer_profile": {...} }
```

### Refresh Token
```
POST /auth/refresh
Body: { "refresh_token": "..." }
Response: { "access_token": "..." }
```

### Logout
```
POST /auth/logout
Body: { "refresh_token": "..." }
Response: { "success": true }
```

### Forgot Password
```
POST /auth/forgot-password
Body: { "email_or_phone": "..." }
Response: { "message": "OTP sent to your email/phone" }

POST /auth/verify-otp
Body: { "email_or_phone": "...", "otp": "123456", "new_password": "new123" }
Response: { "access_token": "..." }
```

---

## FARMER PROFILE ENDPOINTS

### Get Full Profile
```
GET /farmer/me
Response: {
  "account": { "id": "...", "email": "...", "role": "farmer" },
  "profile": {
    "id": "...", "full_name": "Nimal", "primary_language": "en",
    "experience_years": 5, "avatar_url": "..."
  },
  "locations": [
    {
      "id": "...", "label": "Home Farm", "city": "Kandy",
      "district": "Kandy", "latitude": 7.2906, "longitude": 80.6337,
      "is_primary": true
    }
  ],
  "land_details": [...],
  "livestock": [...]
}
```

### Update Profile
```
PUT /farmer/me
Body: { "full_name": "...", "primary_language": "si", "experience_years": 6 }
```

### Locations CRUD
```
POST /farmer/locations
Body: {
  "label": "North Field",
  "address_line": "123 Farm Road",
  "city": "Jaffna", "district": "Jaffna", "province": "Northern",
  "latitude": 9.6615, "longitude": 80.0255,
  "is_primary": false
}

GET  /farmer/locations
PUT  /farmer/locations/{id}    Body: { same fields }
DELETE /farmer/locations/{id}
```

### Land Details CRUD
```
POST /farmer/land
Body: {
  "location_id": "...",
  "total_area": 1.5, "area_unit": "acres",
  "land_type": "highland", "soil_type": "loam",
  "water_source": "well", "irrigation_type": "drip",
  "land_ownership": "owned"
}

GET  /farmer/land
PUT  /farmer/land/{id}
DELETE /farmer/land/{id}
```

### Livestock CRUD
```
POST /farmer/livestock
Body: { "animal_type": "poultry", "breed": "Broiler", "count": 200, "purpose": "meat" }
GET  /farmer/livestock
PUT  /farmer/livestock/{id}
DELETE /farmer/livestock/{id}
```

---

## PROJECT ENDPOINTS

### List Projects
```
GET /projects?status=active&page=1&per_page=10
Response: [
  {
    "id": "...", "name": "Tomato Farm — 1 Acre",
    "plant": { "common_name": "Tomato", "image_url": "..." },
    "current_stage": { "name": "Flowering", "progress_pct": 50 },
    "today_task_count": 3,
    "alert_count": 1,
    "status": "active"
  }
]
```

### Create Project
```
POST /projects
Body: {
  "plant_id": "uuid-of-tomato",
  "name": "Tomato Farm — 1 Acre — March 2025",
  "farming_method_id": "uuid-of-conventional",
  "location_id": "uuid-of-location",
  "land_detail_id": "uuid-of-land",
  "area": 1.0, "area_unit": "acres",
  "plant_count": 2000,
  "planting_date": "2025-03-01",
  "services": ["weather", "activity_plan", "soil", "disease_watch", "market", "ai_chat"]
}
Response: {
  "project": { "id": "...", "name": "...", "expected_harvest_date": "2025-05-29" },
  "message": "Project created. Activity plan generating in background."
}
```

### Get Project
```
GET /projects/{project_id}
Response: {
  "project": { full project object },
  "plant": { plant + stages },
  "current_stage": { stage details + day count },
  "farming_method": { "code": "conventional", "name": "Conventional" },
  "location": { location details }
}
```

### Update Project
```
PUT /projects/{project_id}
Body: { "name": "...", "status": "paused", "notes": "..." }
```

### Archive Project (Soft Delete)
```
DELETE /projects/{project_id}
→ Sets status = 'archived'. No data deletion.
```

### Project Dashboard (Full Aggregate)
```
GET /projects/{project_id}/dashboard
Response: {
  "project": { id, name, area, planting_date },
  "current_stage": {
    "name": "Flowering", "stage_order": 4,
    "days_since_planting": 45, "total_days": 90, "progress_pct": 50,
    "key_indicators": "Flower buds visible...",
    "watch_for": "Watch for Late Blight..."
  },
  "todays_activities": [
    { "id": "...", "type": "watering", "title": "Water 180L", "priority": 2, "status": "pending",
      "details": { "water_liters": 180, "method": "drip" } }
  ],
  "upcoming_activities": [ ... next 7 days ... ],
  "active_alerts": [
    { "type": "disease_risk", "severity": "warning", "title": "High fungal risk tomorrow" }
  ],
  "open_issues_count": 1,
  "weather_summary": { "today": "Sunny 32°C", "rain_in_days": 3 },
  "soil_summary": { "ph": 6.2, "nitrogen_status": "LOW", "last_test": "2025-05-28" },
  "market_summary": { "price": 180, "unit": "kg", "currency": "LKR", "trend": "rising", "change_pct": 12 },
  "service_blocks": ["weather", "soil", "activity_plan", "disease_watch", "market", "ai_chat"]
}
```

### Manage Project Services
```
POST /projects/{id}/services
Body: { "service_type": "soil", "config_json": {} }

PUT /projects/{id}/services/{service_type}
Body: { "config_json": { "notify_low_price": true } }

DELETE /projects/{id}/services/{service_type}
```

---

## WEATHER ENDPOINTS

```
GET /weather/project/{project_id}
Response: {
  "location": { "lat": 7.29, "lng": 80.63, "name": "Kandy" },
  "forecast": [
    {
      "date": "2025-06-10",
      "condition": "sunny",
      "temp_max": 32, "temp_min": 24,
      "rainfall_mm": 0,
      "humidity_pct": 68,
      "wind_speed_kmh": 10,
      "uv_index": 8
    },
    {
      "date": "2025-06-12",
      "condition": "rain",
      "rainfall_mm": 25,
      "humidity_pct": 92
    }
  ],
  "farm_actions": [
    { "date": "2025-06-12", "action_type": "skip_watering",
      "reason": "25mm rain expected", "priority": "info" },
    { "date": "2025-06-12", "action_type": "disease_risk",
      "reason": "High humidity — fungal risk", "priority": "urgent" }
  ],
  "active_alerts": [...]
}
```

---

## SOIL ENDPOINTS

### Submit Soil Test
```
POST /soil/tests
Body: {
  "project_id": "...",
  "test_date": "2025-05-28",
  "lab_name": "Agricultural Research Institute",
  "ph": 5.8,
  "nitrogen_ppm": 120,
  "phosphorus_ppm": 22,
  "potassium_ppm": 185,
  "calcium_ppm": 280,
  "organic_matter_pct": 1.8,
  "ec_ds_per_m": 0.4
}
Response: {
  "soil_test": { "id": "...", "test_date": "2025-05-28" },
  "recommendations": [
    {
      "type": "pH_correction",
      "nutrient": "pH",
      "current_level": 5.8,
      "optimal_level": "6.0–6.8",
      "severity": "moderate",
      "action": "Apply 450kg agricultural lime per acre",
      "product": "Agricultural Lime",
      "priority": 1
    },
    {
      "type": "fertilizer",
      "nutrient": "nitrogen_ppm",
      "severity": "moderate",
      "action": "Apply 30kg Urea per acre",
      "product": "Urea (46-0-0)",
      "priority": 1
    }
  ]
}
```

### Get Tests & Recommendations
```
GET /soil/tests/project/{project_id}   → All soil tests list
GET /soil/tests/{test_id}              → Single test + nutrient results + recommendations
GET /soil/tests/{test_id}/recommendations  → Sorted by priority
POST /soil/analyze   → Same body as POST /soil/tests but no DB save
```

---

## ACTIVITY PLAN ENDPOINTS

```
POST /planner/generate/{project_id}
→ Trigger background Celery task
Response: { "message": "Plan generation started", "plan_id": "..." }

GET /planner/plan/{project_id}
Response: {
  "plan": { "id": "...", "generated_at": "...", "is_active": true },
  "activities_by_week": {
    "2025-W10": [ { activity objects } ],
    "2025-W11": [ ... ]
  }
}

GET /planner/today/{project_id}
Response: {
  "date": "2025-06-10",
  "activities": [
    {
      "id": "...", "type": "watering", "title": "Water plants — 180L",
      "priority": 2, "status": "pending",
      "details": { "water_liters": 180, "method": "drip", "duration_minutes": 45 },
      "note": "High humidity today — check for mold after watering"
    }
  ]
}

GET /planner/week/{project_id}?start_date=2025-06-10
Response: {
  "days": [
    { "date": "2025-06-10", "activities": [...] },
    { "date": "2025-06-11", "activities": [...] }
  ]
}

PUT /planner/activities/{activity_id}
Body: { "status": "done", "notes": "Used drip irrigation, 45 mins", "completed_at": "2025-06-10T08:30:00" }

POST /planner/activities/{activity_id}/reschedule
Body: { "new_date": "2025-06-11", "reason": "Equipment issue" }

POST /planner/adjust/{project_id}
Response: {
  "adjusted_count": 2,
  "changes": [
    { "activity_id": "...", "change": "skipped", "reason": "25mm rain expected" }
  ]
}
```

---

## DISEASE & PEST ENDPOINTS

### Report an Issue
```
POST /issues/report
Body: {
  "project_id": "...",
  "issue_type": "disease",
  "description": "Leaves turning yellow with brown spots at edges",
  "affected_parts": ["leaves"],
  "affected_area_pct": 15,
  "image_urls": ["https://s3.aws.../photo1.jpg"]
}
Response: {
  "issue": { "id": "...", "status": "open" },
  "diagnosis": {
    "matched_disease": {
      "id": "...", "disease_name": "Early Blight",
      "symptoms": "...", "severity": "medium"
    },
    "confidence": 0.82,
    "method": "keyword",
    "solutions": [
      {
        "method": "conventional",
        "product_name": "Mancozeb 75 WP",
        "dosage": "2g per litre water",
        "application_method": "Spray foliage",
        "frequency": "Every 7 days",
        "waiting_period_days": 3
      }
    ]
  }
}
```

### Disease Watch
```
GET /disease/watch/{project_id}
Response: {
  "current_risk_level": "medium",
  "risk_calendar": [
    {
      "date": "2025-06-12",
      "disease_name": "Late Blight",
      "risk_level": "high",
      "reason": "High humidity forecast (92%) + warm temperature"
    }
  ],
  "diseases_to_watch": [
    {
      "disease_name": "Early Blight",
      "visual_symptoms": "Brown spots with yellow halo on older leaves",
      "prevention_tips": "Spray Mancozeb before symptoms appear"
    }
  ]
}

GET /disease/search?plant_id=&symptoms=yellowing+leaves&stage_id=
Response: [ { disease with confidence_score } ]

GET /disease/{disease_id}/solutions?method=organic
Response: [ { solution objects } ]
```

---

## MARKET ENDPOINTS

```
GET /market/project/{project_id}
Response: {
  "plant": { "common_name": "Tomato" },
  "latest_price": { "price": 180, "unit": "kg", "currency": "LKR", "date": "2025-06-10" },
  "change_pct": 12.5, "change_direction": "rising",
  "prices_by_market": [
    { "market_name": "Colombo Pettah", "price": 185, "date": "2025-06-10" },
    { "market_name": "Dambulla", "price": 172, "date": "2025-06-10" }
  ],
  "estimated_revenue": {
    "yield_kg": 1200, "price_per_kg": 180,
    "total_lkr": 216000,
    "yield_basis": "industry average for 1 acre tomato"
  }
}

GET /market/trends/{plant_id}?district=colombo&period=30d
Response: {
  "trend_data": [ { "date": "2025-05-10", "avg_price": 140 }, ... ],
  "direction": "rising",
  "best_sell_window": "2025-06-15 to 2025-06-25"
}
```

---

## AI CHAT ENDPOINTS

```
POST /ai/chat
Body: {
  "project_id": "...",
  "message": "My tomato leaves are turning yellow from the bottom",
  "conversation_id": null,
  "image_urls": []
}
Response: {
  "conversation_id": "...",
  "message": "Based on your tomato farm at Day 45 (Flowering stage) and the symptom you described — yellowing from the bottom up — this is likely nitrogen deficiency or early signs of Fusarium wilt...",
  "suggestions": ["Report as issue", "See disease solutions"],
  "related_service": "disease",
  "tokens_used": { "input": 850, "output": 340 }
}

GET  /ai/conversations/{project_id}        → List conversations
GET  /ai/conversations/{id}/messages       → Full message history

POST /ai/insights/{project_id}
Response: {
  "insights": [
    {
      "type": "weather_opportunity",
      "title": "Good transplanting window",
      "message": "Next 3 days have ideal conditions: 27–29°C, no rain, moderate humidity",
      "action": "View activity plan"
    }
  ]
}
```

---

## NOTIFICATIONS ENDPOINTS

```
GET /notifications?is_read=false&type=activity&page=1
Response: [
  {
    "id": "...",
    "type": "activity_reminder",
    "title": "Water your tomatoes — 180L",
    "message": "Today is watering day for Tomato Farm. No rain expected.",
    "deep_link": "/projects/123?scroll=activity_plan&highlight=act_456",
    "is_read": false,
    "created_at": "2025-06-10T06:00:00"
  }
]

GET  /notifications/count               → { "unread": 5 }
PUT  /notifications/{id}/read           → Mark as read
POST /notifications/mark-all-read       → Mark all read
POST /notifications/push-token          → { "token": "...", "platform": "web" }
DELETE /notifications/push-token        → { "token": "..." }
```

---

## MASTER DATA ENDPOINTS (Read-only, Seeded)

```
GET /plants?category=vegetable&q=tomato
Response: [ { id, common_name, local_name, growth_duration_days, image_url, category } ]

GET /plants/{plant_id}
Response: {
  "plant": { full plant object },
  "stages": [ all growth stages ],
  "diseases": [ associated diseases ],
  "pests": [ associated pests ]
}

GET /plants/{plant_id}/stages
GET /plants/{plant_id}/diseases
GET /plants/{plant_id}/pests
GET /farming-methods    → [ { code, name, description } ]
```
