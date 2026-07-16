# AgriFarm AI — Master Blueprint (Architecture, Edge Cases & Testing)

## Overview
This document serves as the technical reference for edge cases, error handling, component logic, and testing strategy. It supplements the other plan documents with implementation-level detail.

---

## 1. Architecture Decision Records

### ADR-1: Modular Monolith over Microservices
**Decision:** Start with a FastAPI modular monolith.
**Reasoning:** 1-3 developers building v1.0. Microservices add deployment complexity, inter-service communication overhead, and distributed debugging challenges. A modular monolith with clean module boundaries can be extracted to microservices later if traffic demands it.
**Future migration:** Each `backend/modules/<name>/` folder maps 1:1 to a future microservice.

### ADR-2: Free AI Only (Google Gemini + Gemma)
**Decision:** Use exclusively free AI APIs. No paid API keys.
**Reasoning:** Target users are smallholder farmers in Sri Lanka. The platform must run at near-zero cost. Google AI Studio free tier (Gemini 2.0 Flash) provides 15 RPM and 1,500 RPD — sufficient for 100-300 active farmers.
**Fallback:** If free tier is exhausted, deterministic summary generation handles remaining queries.

### ADR-3: Flattened Context over RAG
**Decision:** Send flattened project data as direct context to the AI instead of building a full RAG pipeline.
**Reasoning:** A single farming project's relevant data is ~2,000 tokens when flattened. This fits trivially in Gemini's 1M token context window. RAG adds complexity (embedding pipeline, vector search, chunk relevance scoring) without benefit at this data scale. RAG is planned for v3.0 when historical data spans multiple seasons.

### ADR-4: Web App First, Flutter Later
**Decision:** Build Next.js PWA first. Flutter mobile apps in v2.0.
**Reasoning:** PWA provides near-native experience with faster development. It works on all devices immediately. Flutter apps will share the same API and add native features (camera, GPS, FCM push) in v2.0.

---

## 2. Detailed Component Logic

### A. Activity Planner Engine
- **Trigger:** `POST /projects` → Celery task `generate_season_plan(project_id)`
- **Input:** project_id, planting_date, plant_id, area, farming_method_id
- **Process:** Queries `plant_stages`, `plant_water_requirements`, `plant_fertilizer_recommendations`. Generates activities per stage.
- **Output:** 50-100 `farming_activities` records bulk-inserted.
- **Error Handling:** If plant is missing stage data, create a generic 3-stage plan (Planting → Growing → Harvest) and log a warning. The project is still usable — just with a simpler plan.

### B. Weather Adjustment Job
- **Trigger:** Celery Beat at 5:00 AM daily
- **Input:** All active project locations
- **Process:** Fetch 5-day forecast → evaluate today's pending activities → apply deterministic rules
- **Output:** Activities marked `skipped` or `rescheduled`. Weather alerts created.
- **Error Handling:** If OpenWeatherMap API is down or rate-limited:
  1. Check Redis cache (up to 3 hours old) — use if available
  2. If cache also empty — do NOT modify any activities (fail-safe: better to over-water than drought)
  3. Log the API failure, retry in 30 minutes

### C. Soil Recommendation Engine
- **Trigger:** `POST /soil/tests` → synchronous calculation
- **Input:** Soil test results (pH, N, P, K, etc.) + project's plant and current stage
- **Process:** Compare actual values against optimal ranges from `plant_nutrient_requirements`. Calculate gap.
- **Output:** List of `soil_recommendations` with product name, quantity per acre, priority
- **Error Handling:** If optimal values are missing for this plant, return a generic recommendation set and flag for admin review.

### D. AI Summary Service
- **Trigger:** Manual (farmer taps "Refresh AI") or Celery Beat (weekly Sunday 6AM)
- **Input:** project_id → `build_project_context()` → flattened JSON
- **Process:** Send to Google AI Studio (Gemini 2.0 Flash) with system prompt
- **Output:** Natural language summary + parsed insights → database updates
- **Error Handling:**
  - `ResourceExhausted` (rate limit) → return deterministic summary
  - `GoogleAPIError` → return cached summary or deterministic fallback
  - AI returns unsafe/hallucinated content → system prompt includes strict guardrails

### E. Disease Matching Engine
- **Trigger:** `POST /issues` → search `plant_diseases` via full-text search
- **Input:** symptoms text, affected parts, plant_id
- **Process:** PostgreSQL `ts_rank` scoring against symptom keywords
- **Output:** Matched diseases with confidence scores + filtered solutions
- **Error Handling:** If no match exceeds confidence threshold (0.1 ts_rank):
  1. Route to Google Gemini for AI diagnosis
  2. AI response includes treatment steps
  3. System creates a `project_issue` record with `source: "ai_diagnosis"`

---

## 3. Edge Cases & Error Handling Table

| Component | Edge Case | Recovery |
|-----------|-----------|----------|
| **Registration** | Duplicate email/phone | 409 Conflict. Generic message (no user enumeration). |
| **JWT** | Access token expired | 401 with `token_expired` code. Frontend auto-refreshes via `/auth/refresh`. |
| **JWT** | Refresh token revoked | 401. Force full re-login. |
| **Project creation** | Plant has no stage data | Generate generic 3-stage plan. Log warning for admin. |
| **Project creation** | Location has no GPS coordinates | Block creation. Require GPS coordinates. |
| **Activity generation** | Celery task fails mid-generation | Celery retry (3 attempts, exponential backoff). Project status shows "plan_generation_failed". |
| **Weather API** | OpenWeatherMap down | Serve Redis cache. If cache expired, don't modify activities. |
| **Weather API** | Free tier exhausted (1000/day) | Queue remaining locations. Process in next cycle. |
| **AI API** | Google AI Studio rate limit (15 RPM) | Queue request, retry in 5s. Show "Generating..." in UI. |
| **AI API** | Google free tier daily limit | Return deterministic summary. Show "AI summary temporarily unavailable". |
| **AI API** | Gemini returns hallucinated dosage | System prompt forbids dosage recommendations without DB source. Review before applying to DB. |
| **Soil test** | All nutrient values are zero | Reject submission. Validation: at least pH must be > 0. |
| **Disease match** | Farmer enters gibberish symptoms | Zero results. Suggest "Try describing what you see: leaf color, spots, wilting". |
| **File upload** | Image > 5MB | 413 error. Compress client-side before upload. |
| **Offline PWA** | Farmer marks task done without internet | Zustand stores mutation. React Query syncs on reconnection. |
| **Concurrent access** | Two farmers creating projects simultaneously | No conflict — separate project records per farmer. |

---

## 4. Testing Strategy

### A. Unit Tests (`pytest`)

```python
# Test activity planner generates correct count
def test_generate_tomato_plan():
    project = create_mock_project(plant="Tomato", area=1.0, method="organic")
    activities = generate_season_plan(project.id)
    assert len(activities) >= 50  # Minimum for 90-day crop
    assert any(a.activity_type == "watering" for a in activities)
    assert any(a.activity_type == "fertilizing" for a in activities)
    assert any(a.activity_type == "monitoring" for a in activities)
    # Organic project should not have conventional fertilizer
    for a in activities:
        if a.activity_type == "fertilizing":
            assert "Urea" not in a.title  # Urea is conventional

# Test soil calculator
def test_soil_low_nitrogen():
    results = compute_recommendations(
        soil_ph=6.2, nitrogen_ppm=50, phosphorus_ppm=45, potassium_ppm=185,
        plant="Tomato", stage="Vegetative", method="organic"
    )
    nitrogen_rec = next(r for r in results if r["nutrient"] == "Nitrogen")
    assert nitrogen_rec["severity"] in ["moderate", "severe"]
    assert "compost" in nitrogen_rec["action"].lower()  # Organic solution

# Test intent classifier routes correctly
def test_intent_weather():
    assert classify_intent("Will it rain tomorrow?") == "weather_info"
    assert classify_intent("What's the price of tomatoes?") == "market_price"
    assert classify_intent("Why are my leaves curling?") == "ai_required"

# Test weather adjustment
def test_skip_watering_if_rain():
    activity = mock_activity(type="watering", status="pending")
    weather = mock_weather(rain_mm=15)
    adjust_activity(activity, weather)
    assert activity.status == "skipped"
    assert "rain" in activity.skipped_reason.lower()
```

### B. Integration Tests (`pytest` + Docker PostgreSQL)

```python
# Full project creation flow
async def test_create_project_flow():
    # Register farmer
    response = await client.post("/auth/register", json={...})
    token = response.json()["data"]["access_token"]

    # Create project
    response = await client.post("/projects", json={
        "plant_id": tomato_id,
        "location_id": location_id,
        "planting_date": "2025-03-01",
        "area": 1.0
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201
    project_id = response.json()["data"]["id"]

    # Wait for Celery task (or run synchronously in test)
    await generate_season_plan(project_id)

    # Verify plan generated
    response = await client.get(f"/planner/{project_id}/today",
                                headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert len(response.json()["data"]) > 0

# Dashboard aggregation returns all blocks
async def test_dashboard_complete():
    response = await client.get(f"/projects/{project_id}/dashboard",
                                headers={"Authorization": f"Bearer {token}"})
    data = response.json()["data"]
    assert "farming_circle" in data
    assert "todays_activities" in data
    assert "weather" in data
    assert "ai_summary" in data
```

### C. AI Integration Tests

```python
# Test flattened context builder
async def test_build_context_complete(db_session):
    context_str = await build_project_context(db_session, project_id)
    context = json.loads(context_str)
    assert "crop" in context
    assert "current_stage" in context
    assert "soil" in context
    assert context["crop"] == "Tomato"

# Test AI rate limiting
async def test_ai_rate_limit():
    for i in range(10):
        await client.post(f"/ai/summary/{project_id}")  # Use up daily quota
    response = await client.post(f"/ai/summary/{project_id}")
    assert response.status_code == 429  # Rate limited

# Test deterministic fallback when AI unavailable
async def test_ai_fallback(mock_gemini_unavailable):
    response = await client.post(f"/ai/summary/{project_id}")
    assert response.status_code == 200
    assert response.json()["data"]["source"] == "deterministic_fallback"
```

### D. E2E Tests (Playwright)

```python
# Critical User Journey 1: Full farmer flow
def test_farmer_journey(page):
    page.goto("/register")
    page.fill("#email", "farmer@test.com")
    page.fill("#password", "secure123")
    page.fill("#full_name", "Test Farmer")
    page.click("button[type=submit]")

    # Create project
    page.click("text=New Project")
    page.click("text=Tomato")            # Select crop
    page.click("text=Home Farm")          # Select location
    page.click("text=Organic Farming")    # Select method
    page.fill("#area", "1")
    page.click("text=Create Project")

    # Verify dashboard loads
    expect(page.locator(".farming-circle")).to_be_visible()
    expect(page.locator(".activity-card")).to_have_count_greater_than(0)

    # Mark task done
    page.click(".activity-card >> text=Done")
    expect(page.locator(".activity-card").first).to_have_text("✓ done")
```

---

## 5. Performance Targets

| Metric | Target | How |
|--------|--------|-----|
| API response time (non-AI) | < 200ms | Database indexes, Redis caching, async queries |
| AI response time | < 5 seconds | Gemini 2.0 Flash is fast; context is small (~2K tokens) |
| Dashboard load | < 1 second | Single aggregated endpoint, server-side caching |
| Activity plan generation | < 10 seconds | Bulk insert, runs in background (Celery) |
| PWA first load | < 3 seconds | Next.js SSR, Tailwind CSS purging, image optimization |
| Offline access | Instant | Service Worker caches daily plan |
