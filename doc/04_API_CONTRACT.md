# AgriFarm AI — API Contract

## Base URL
```
Development:  http://localhost:8000/api/v1
Production:   https://api.agrifarm.app/api/v1
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
Response 201: {
  "success": true,
  "data": {
    "account_id": "uuid",
    "farmer_profile_id": "uuid",
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "token_type": "bearer"
  }
}
```

### Login
```
POST /auth/login
Body: {
  "email": "farmer@example.com",
  "password": "secure123"
}
Response 200: {
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "token_type": "bearer",
    "expires_in": 900
  }
}
```

### Refresh Token
```
POST /auth/refresh
Body: { "refresh_token": "eyJ..." }
Response 200: {
  "data": { "access_token": "new_eyJ...", "refresh_token": "new_eyJ..." }
}
```

### Get Current User
```
GET /auth/me
Headers: Authorization: Bearer <token>
Response 200: {
  "data": {
    "account_id": "uuid",
    "email": "farmer@example.com",
    "farmer_profile": { "full_name": "Nimal Perera", "farming_method": "organic" },
    "vendor_profile": null,
    "buyer_profile": null
  }
}
```

### Update Account (Email/Phone)
```
PUT /auth/account
Headers: Authorization: Bearer <token>
Body: {
  "phone": "+94777123456"
}
```

### Delete Account (Soft Delete)
```
DELETE /auth/account
Headers: Authorization: Bearer <token>
Response 204 No Content
```

---

## FARMER ENDPOINTS

### Get Profile
```
GET /farmer/profile
Response 200: {
  "data": {
    "id": "uuid",
    "full_name": "Nimal Perera",
    "primary_language": "en",
    "experience_years": 5,
    "farming_method": "organic",
    "avatar_url": null
  }
}
```

### Update Profile
```
PUT /farmer/profile
Body: {
  "full_name": "Nimal Perera",
  "primary_language": "si",
  "experience_years": 6,
  "farming_method": "organic"
}
```

### Add Location
```
POST /farmer/locations
Body: {
  "label": "Home Farm",
  "address_line": "123 Farm Road",
  "city": "Dambulla",
  "district": "Matale",
  "province": "Central",
  "latitude": 7.8731,
  "longitude": 80.6518,
  "is_primary": true
}
```

### List Locations
```
GET /farmer/locations
Response 200: {
  "data": [
    {
      "id": "uuid",
      "label": "Home Farm",
      "city": "Dambulla",
      "district": "Matale",
      "latitude": 7.8731,
      "longitude": 80.6518,
      "is_primary": true
    }
  ]
}
```

### Update/Delete Location
```
PUT /farmer/locations/{id}
DELETE /farmer/locations/{id}
```

### Add Land Details
```
POST /farmer/land
Body: {
  "location_id": "uuid",
  "total_area": 1.0,
  "area_unit": "acres",
  "soil_type": "loam",
  "water_source": "well",
  "irrigation_type": "drip",
  "land_ownership": "owned"
}
```

### Update/Delete Land Details
```
PUT /farmer/land/{id}
DELETE /farmer/land/{id}
```

---

## PROJECT ENDPOINTS ⭐ (Core Feature)

### Create Project
```
POST /projects
Body: {
  "plant_id": "uuid",
  "location_id": "uuid",
  "land_detail_id": "uuid",
  "farming_method_id": "uuid",
  "name": "Tomato Farm — 1 Acre — March 2025",
  "area": 1.0,
  "area_unit": "acres",
  "planting_date": "2025-03-01"
}
Response 201: {
  "data": {
    "id": "uuid",
    "name": "Tomato Farm — 1 Acre — March 2025",
    "plant": { "common_name": "Tomato", "growth_duration_days": 90 },
    "planting_date": "2025-03-01",
    "expected_harvest_date": "2025-05-29",
    "status": "active",
    "plan_generation_status": "in_progress"
  }
}
```
**Side effects:** Background Celery task starts generating the full season activity plan.

### List Projects
```
GET /projects
Query params: ?status=active&page=1&per_page=10
Response 200: {
  "data": [
    {
      "id": "uuid",
      "name": "Tomato Farm — 1 Acre",
      "plant": { "common_name": "Tomato", "image_url": "..." },
      "planting_date": "2025-03-01",
      "days_since_planting": 45,
      "current_stage": "Flowering",
      "progress_pct": 50.0,
      "status": "active",
      "todays_task_count": 3,
      "active_alerts": 1
    }
  ]
}
```

### Get Project Dashboard (Aggregated)
```
GET /projects/{id}/dashboard
Response 200: {
  "data": {
    "project": {
      "id": "uuid",
      "name": "Tomato Farm — 1 Acre",
      "crop": "Tomato",
      "area": "1.0 acres",
      "planting_date": "2025-03-01",
      "days_since_planting": 45,
      "expected_harvest_date": "2025-05-29",
      "status": "active"
    },
    "farming_circle": {
      "stages": [
        { "name": "Germination", "order": 1, "start_day": 0, "end_day": 7, "status": "completed" },
        { "name": "Seedling", "order": 2, "start_day": 8, "end_day": 21, "status": "completed" },
        { "name": "Vegetative", "order": 3, "start_day": 22, "end_day": 42, "status": "completed" },
        { "name": "Flowering", "order": 4, "start_day": 43, "end_day": 60, "status": "current" },
        { "name": "Fruiting", "order": 5, "start_day": 61, "end_day": 80, "status": "upcoming" },
        { "name": "Harvest", "order": 6, "start_day": 81, "end_day": 90, "status": "upcoming" }
      ],
      "current_stage": "Flowering",
      "current_day": 45,
      "progress_pct": 50.0
    },
    "todays_activities": [
      { "id": "uuid", "type": "watering", "title": "Water plants — 180L", "priority": 2, "status": "pending" },
      { "id": "uuid", "type": "monitoring", "title": "Check for blight", "priority": 3, "status": "pending" }
    ],
    "upcoming_activities": [...],
    "weather": {
      "today": { "condition": "sunny", "temp_max": 32, "rain_mm": 0, "humidity": 68 },
      "forecast_5day": [...]
    },
    "weather_alerts": [
      { "type": "disease_risk_high_humidity", "severity": "warning", "title": "High humidity — blight risk" }
    ],
    "soil_status": {
      "ph": 6.2,
      "nitrogen_status": "LOW",
      "last_test": "2025-03-20"
    },
    "active_issues": [],
    "market_price": { "price_per_kg": 180, "trend": "rising", "change_pct": 12.0 },
    "ai_summary": {
      "text": "Your tomato crop is in the Flowering stage (Day 45). Growth is on track...",
      "generated_at": "2025-04-14T05:00:00Z",
      "source": "gemini-2.0-flash"
    }
  }
}
```

### Update Project Status
```
PATCH /projects/{id}/status
Body: { "status": "harvested", "actual_harvest_date": "2025-05-25" }
```

### Full Update / Delete Project
```
PUT /projects/{id}
DELETE /projects/{id}
```

---

## PLANNER ENDPOINTS

### Get Today's Activities
```
GET /planner/{project_id}/today
Response 200: {
  "data": [
    {
      "id": "uuid",
      "activity_type": "watering",
      "title": "Water plants — 180L",
      "description": "Irrigate via drip system",
      "scheduled_date": "2025-04-15",
      "scheduled_time": "06:00",
      "priority": 2,
      "status": "pending",
      "is_weather_adjusted": false,
      "stage": "Flowering"
    }
  ]
}
```

### Mark Activity Complete
```
PATCH /planner/activities/{id}/complete
Body: { "notes": "Watered all rows, soil looks moist" }
Response 200: { "data": { "id": "uuid", "status": "done", "completed_at": "2025-04-15T07:30:00Z" } }
```

### Skip Activity
```
PATCH /planner/activities/{id}/skip
Body: { "reason": "Rained heavily this morning" }
Response 200: { "data": { "id": "uuid", "status": "skipped", "skipped_reason": "Rained heavily this morning" } }
```

### Get Full Season Plan
```
GET /planner/{project_id}/activities
Query params: ?stage_id=uuid&status=pending&page=1
```

---

## WEATHER ENDPOINTS

### Get Weather for Project
```
GET /weather/{project_id}
Response 200: {
  "data": {
    "location": { "city": "Dambulla", "lat": 7.8731, "lng": 80.6518 },
    "current": { "temp": 30, "humidity": 72, "condition": "partly_cloudy", "wind_speed": 12 },
    "forecast_5day": [
      { "date": "2025-04-15", "temp_max": 32, "temp_min": 24, "rain_mm": 0, "humidity": 68, "condition": "sunny" },
      { "date": "2025-04-16", "temp_max": 29, "temp_min": 23, "rain_mm": 5, "humidity": 78, "condition": "cloudy" }
    ],
    "cached_at": "2025-04-15T05:00:00Z"
  }
}
```

### Get Weather Alerts
```
GET /weather/{project_id}/alerts
Response 200: {
  "data": [
    {
      "id": "uuid",
      "type": "disease_risk_high_humidity",
      "severity": "warning",
      "title": "High humidity — blight risk",
      "description": "Humidity above 90% with temps >25°C creates ideal conditions for blight.",
      "action_required": "Inspect leaves for brown spots. Apply preventive copper spray if organic.",
      "is_acknowledged": false
    }
  ]
}
```

---

## SOIL ENDPOINTS

### Submit Soil Test
```
POST /soil/tests
Body: {
  "project_id": "uuid",
  "test_date": "2025-03-20",
  "lab_name": "NIFS Kandy",
  "input_method": "manual",
  "results": {
    "ph": 6.2,
    "nitrogen_ppm": 120,
    "phosphorus_ppm": 45,
    "potassium_ppm": 185,
    "organic_matter_pct": 2.1
  }
}
Response 201: {
  "data": {
    "soil_test_id": "uuid",
    "recommendations": [
      {
        "type": "fertilizer",
        "nutrient": "Nitrogen",
        "severity": "moderate",
        "action": "Apply compost or blood meal",
        "quantity_per_acre": 25.0,
        "unit": "kg"
      }
    ]
  }
}
```

---

## DISEASE ENDPOINTS

### Report Issue
```
POST /issues
Body: {
  "project_id": "uuid",
  "issue_type": "disease",
  "title": "Yellow spots on leaves",
  "description": "Lower leaves have yellow-brown circular spots, started 3 days ago",
  "affected_parts": ["leaves"],
  "affected_area_pct": 15.0,
  "image_urls": ["s3://uploads/issue_123.jpg"]
}
Response 201: {
  "data": {
    "issue_id": "uuid",
    "matched_disease": {
      "name": "Early Blight",
      "confidence": 0.85,
      "source": "database_keyword_match"
    },
    "solutions": [
      {
        "method": "organic",
        "name": "Copper-based fungicide (Bordeaux mixture)",
        "dosage": "10g copper sulfate + 10g lime per 1L water",
        "application": "Spray on affected leaves, morning application",
        "frequency": "Every 7 days"
      },
      {
        "method": "conventional",
        "name": "Mancozeb spray",
        "dosage": "2g per liter",
        "application": "Full plant coverage spray",
        "frequency": "Every 7-10 days"
      }
    ]
  }
}
```

### Search Diseases by Symptoms
```
GET /disease/search?plant_id=uuid&symptoms=yellow+spots+leaves
```

---

## MARKET ENDPOINTS

### Get Prices
```
GET /market/prices/{plant_id}?district=Colombo
Response 200: {
  "data": {
    "crop": "Tomato",
    "district": "Colombo",
    "current_price": 180.00,
    "unit": "kg",
    "currency": "LKR",
    "trend": "rising",
    "change_pct": 12.0,
    "recorded_date": "2025-04-14"
  }
}
```

### Get 30-Day Trend
```
GET /market/trends/{plant_id}?district=Colombo
Response 200: {
  "data": {
    "prices": [
      { "date": "2025-03-15", "price": 160 },
      { "date": "2025-03-22", "price": 165 },
      { "date": "2025-04-01", "price": 172 },
      { "date": "2025-04-14", "price": 180 }
    ],
    "avg_30d": 169.25,
    "min_30d": 155,
    "max_30d": 185,
    "trend": "rising"
  }
}
```

---

## AI ENDPOINTS ⭐ (Free Google AI Studio)

### Get AI Summary (Cached)
```
GET /ai/summary/{project_id}
Response 200: {
  "data": {
    "summary": "📊 Your tomato crop is in Flowering stage (Day 45/90).\n\n🌤️ Weather looks good for the next 3 days...",
    "generated_at": "2025-04-15T05:00:00Z",
    "model": "gemini-2.0-flash",
    "cost": 0.00,
    "source": "cached"
  }
}
```

### Generate Fresh AI Summary
```
POST /ai/summary/{project_id}
Response 200: {
  "data": {
    "summary": "📊 GROWTH STATUS: Your tomatoes are in Flowering stage...",
    "generated_at": "2025-04-15T10:30:00Z",
    "model": "gemini-2.0-flash",
    "cost": 0.00,
    "ai_calls_remaining_today": 8,
    "insights_applied": [
      "Created soil recommendation: Nitrogen deficiency detected",
      "Updated weather alert: High humidity blight risk"
    ]
  }
}
```

### AI Chat (Ask a Question)
```
POST /ai/chat
Body: {
  "project_id": "uuid",
  "message": "Why are my tomato leaves turning yellow?"
}
Response 200: {
  "data": {
    "answer": "Based on your project data, the yellow leaves are most likely due to...",
    "source": "gemini-2.0-flash",
    "cost": 0.00,
    "ai_calls_remaining_today": 7
  }
}
```
**Note:** If the question matches a deterministic intent (weather, schedule, price), it routes directly to the database without calling the AI.

---

## NOTIFICATION ENDPOINTS

### Get Notifications
```
GET /notifications?unread_only=true
Response 200: {
  "data": [
    {
      "id": "uuid",
      "type": "activity_reminder",
      "title": "Water plants — 180L",
      "message": "No rain expected today. Water your tomato plants.",
      "deep_link": "/projects/uuid?tab=plan&highlight=activity_uuid",
      "is_read": false,
      "created_at": "2025-04-15T05:30:00Z"
    }
  ]
}
```

### Mark as Read
```
PATCH /notifications/{id}/read
```

---

## MASTER DATA ENDPOINTS (Read-only)

### List Available Crops
```
GET /plants?category=vegetable&search=tomato
Response 200: {
  "data": [
    {
      "id": "uuid",
      "common_name": "Tomato",
      "local_name": "තක්කාලි",
      "category": "vegetable",
      "growth_duration_days": 90,
      "image_url": "...",
      "compatible_soil_types": ["loam", "sandy"],
      "optimal_temp_range": "20-30°C"
    }
  ]
}
```

### List Farming Methods
```
GET /farming-methods
Response 200: {
  "data": [
    { "id": "uuid", "code": "organic", "name": "Organic Farming" },
    { "id": "uuid", "code": "inorganic", "name": "Conventional Farming" },
    { "id": "uuid", "code": "integrated", "name": "Integrated Farming" }
  ]
}
```

---

## Future API Endpoints (Planned — Not in v1.0)

| Module | Endpoint | When |
|--------|----------|------|
| Marketplace | `POST /marketplace/products` | v2.0 |
| Marketplace | `POST /marketplace/harvests` | v2.0 |
| Marketplace | `POST /marketplace/orders` | v2.0 |
| Vendor Profile | `POST /vendor/profile` | v2.0 |
| Buyer Profile | `POST /buyer/profile` | v2.0 |
| AI Agent | `POST /agent/task` | v3.0 |
| MCP Server | `GET /mcp/tools` | v3.0 |

---

## Rate Limits

| Endpoint Category | Limit | Notes |
|-------------------|-------|-------|
| Auth | 5 req/min per IP | Prevent brute force |
| General API | 100 req/min per user | Normal use |
| AI endpoints | 10 req/day per farmer | Google free tier protection |
| File uploads | 5 req/min, 5MB max | S3/MinIO |
