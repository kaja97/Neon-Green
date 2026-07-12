# AgriFarm AI — Development Phase Rules

## Current Build Status

The project is building through **8 phases** toward v1.0. Track what is done vs. pending before implementing anything.

---

## PHASE 0 — Environment + Seed Data ✅ DONE
**Week 1**

### What was completed:
- Docker Compose with PostgreSQL 16 (+ PostGIS + pgvector + pg_trgm) + Redis 7 + API + Celery Workers. Deployment docs created in `doc/14_DOCKER_DEPLOYMENT.md`.
- FastAPI application scaffold (`main.py`, `config.py`, `database.py`, `dependencies.py`)
- All 10 module stubs created under `backend/modules/`
- All ORM models created in `backend/models/` (16 model files)
- Alembic migration (`migrations/versions/001_initial_schema.py`) with all tables
- Seed data scripts in `backend/seed/`
- Next.js 14 project initialized in `frontend/` with App Router, TypeScript, Tailwind, shadcn/ui
- `config.py` includes `CELERY_EAGER_MODE: bool = False` setting

### DO NOT re-do:
- Do not re-scaffold the FastAPI app or recreate `main.py`
- Do not create new model files — all models already exist in `backend/models/`
- Do not re-initialize the Next.js project

---

## PHASE 1 — Auth + Farmer Profile ✅ DONE
**Week 2**

### What was completed:
- `modules/auth/router.py` — Auth refactored to support OTP verification (`request-otp` and `verify`). Includes login, refresh, change-password.
- `modules/auth/service.py` — bcrypt password hashing, JWT creation with RBAC roles (`farmer`, `admin`), token validation.
- `core/otp.py` and `core/rate_limiter.py` added for secure, rate-limited SMS/Email OTP flow.
- `tasks/otp_tasks.py` — Celery background tasks for email and SMS dispatch.
- `modules/auth/schemas.py` — updated schemas for OTP-based requests.
- `modules/farmer/` — farmer profile CRUD, full location management (POST, GET, PUT, DELETE), full land details (POST, GET, PUT, DELETE). Added livestock endpoints.

### DO NOT re-implement:
- JWT authentication with RBAC is working. Do not change the auth flow.
- OTP mechanisms are centrally handled via Redis.
- Do not change the `modules/auth/` files unless fixing a specific bug.

---

## PHASE 2 — Project CRUD + Dashboard Shell 🔄 IN PROGRESS
**Weeks 3–4**

### What needs to be built:
- [ ] `core/cache.py` — `invalidate_dashboard_cache(project_id)`, `DASHBOARD_CACHE_KEY`, `DASHBOARD_CACHE_TTL = 180`
- [x] `modules/project/service.py` — `create_project()`, `update_project()`, `delete_project()` (fixed location validation)
- [x] `modules/project/router.py` — `POST /projects`, `GET /projects`, `GET /projects/{id}`, `PUT /projects/{id}`, `DELETE /projects/{id}`
- [ ] `modules/project/router.py` — `GET /projects/{id}/dashboard`
- [ ] `modules/project/dashboard.py` — `asyncio.gather()` parallel queries + Redis 3-min cache + `invalidate_dashboard_cache()`
- [ ] Master data endpoints: `GET /plants`, `GET /plants/{id}/stages`, `GET /farming-methods`

### Frontend (Phase 2):
- [ ] `app/(app)/dashboard/page.tsx` — project card list
- [ ] `app/(app)/projects/new/page.tsx` — 5-step create wizard
- [ ] `app/(app)/projects/[id]/page.tsx` — project dashboard page
- [ ] `components/project/FarmingCircle.tsx` — SVG ring component
- [ ] `components/project/DayCounter.tsx`
- [ ] `components/dashboard/ProjectCard.tsx`
- [ ] Service block placeholders (WeatherBlock, SoilBlock, etc. — skeleton only)

### Deliverable:
Farmer creates "Tomato 1 acre" project and sees the Farming Circle on the dashboard.

---

## PHASE 3 — Activity Planner (Life Cycle Engine)
**Weeks 5–6**

### What needs to be built:
- [ ] `modules/planner/engine.py` — `generate_season_plan(project_id, db)` as pure `async def` (NO Celery import)
  - Pre-flight: stage gap detection and auto-patch
  - Pre-flight: `build_generic_stages()` 3-stage fallback if no stages found
  - Organic/conventional/integrated filtering logic
- [ ] `tasks/planner_tasks.py` — thin Celery wrapper (`generate_season_plan_task`) with `max_retries=3`
- [ ] `tasks/celery_app.py` — add `CELERY_EAGER_MODE` support (`task_always_eager` when enabled)
- [ ] `modules/planner/router.py` — `GET /planner/{id}/today`, `GET /planner/{id}/activities`, `PATCH /planner/activities/{id}/complete`, `PATCH /planner/activities/{id}/skip`
  - Both complete and skip must call `invalidate_dashboard_cache(project_id)` after mutation
- [ ] `modules/planner/service.py` — service layer for activity queries

### Frontend (Phase 3):
- [ ] `components/blocks/ActivityBlock.tsx` — today's task cards with Done/Skip
- [ ] `app/(app)/projects/[id]/plan/page.tsx` — full activity timeline
- [ ] `components/activities/ActivityCard.tsx`
- [ ] `components/activities/DoneButton.tsx` (optimistic update; calls invalidate on success)
- [ ] `components/activities/SkipDialog.tsx`

### Deliverable:
Creating a tomato project generates ~77 activities. Farmer marks tasks done.

---

## PHASE 4 — Weather Integration
**Week 7**

### What needs to be built:
- [ ] `modules/weather/client.py` — OpenWeatherMap free API client (`httpx`)
- [ ] `modules/weather/rules.py` — deterministic adjustment rules (rain → skip watering, etc.)
- [ ] `modules/weather/service.py` — fetch + cache forecast, generate alerts
- [ ] `modules/weather/router.py` — `GET /weather/{project_id}`, `GET /weather/{id}/alerts`
- [ ] `tasks/weather_tasks.py` — `refresh_weather_cache` (every 3hr), `adjust_plan_for_weather` (5 AM), `check_weather_alerts` (every 6hr)

### Frontend (Phase 4):
- [ ] `components/blocks/WeatherBlock.tsx` — current + 5-day mini forecast
- [ ] `components/blocks/AlertBanner.tsx` — red/yellow strip
- [ ] `app/(app)/projects/[id]/weather/page.tsx` — full 5-day chart (Recharts)
- [ ] Activity card: show weather-adjusted badge ("⚡ Skipped by weather")

### Deliverable:
Activities auto-adjust to weather. Flood/frost/disease-risk alerts created and pushed.

---

## PHASE 5 — Soil Analysis + Disease Service
**Weeks 8–9**

### What needs to be built:
- [ ] `modules/soil/calculator.py` — deterministic nutrient gap calculator
- [ ] `modules/soil/service.py` — `submit_test()`, `compute_recommendations()`
- [ ] `modules/soil/router.py` — `POST /soil/tests`, `GET /soil/tests/{project_id}`, `GET /soil/recommendations/{project_id}`
- [ ] `modules/disease/matcher.py` — PostgreSQL `ts_rank` full-text disease search
- [ ] `modules/disease/service.py` — `report_issue()`, `match_disease()`, `get_solutions()`
- [ ] `modules/disease/router.py` — `POST /issues`, `GET /issues/{project_id}`, `GET /disease/search`, `GET /disease/{id}/solutions`, `POST /disease/identify-image` (CV Hook)

### Frontend (Phase 5):
- [ ] `components/blocks/SoilBlock.tsx` — pH + N/P/K status badges
- [ ] `app/(app)/projects/[id]/soil/page.tsx` — radar chart + recommendations
- [ ] `components/forms/SoilTestForm.tsx` — lab result entry
- [ ] `components/blocks/DiseaseBlock.tsx` — issue count
- [ ] `components/forms/IssueReportForm.tsx` — symptom selector
- [ ] `app/(app)/projects/[id]/disease/page.tsx`

### Deliverable:
Soil test → "Apply 30kg Urea/acre". "Yellow spots" → "Early Blight" + solutions.

---

## PHASE 6 — AI Integration (Free Gemini)
**Weeks 10–11**

### What needs to be built:
- [ ] `modules/ai/context_builder.py` — `build_project_context(project_id)` → JSON ~2K tokens
- [ ] `modules/ai/prompts.py` — `SUMMARY_PROMPT`, `QA_PROMPT`, `DIAGNOSIS_PROMPT` constants
- [ ] `modules/ai/gemini_client.py` — Google AI Studio SDK wrapper (free tier)
- [ ] `modules/ai/intent_classifier.py` — regex-based query routing (NO AI for routing)
- [ ] `modules/ai/rate_limiter.py` — **[NEW FIX]** 3-bucket daily quota: `AICallType` enum, `check_quota()`, `consume_quota()` via Redis. Buckets: `chat`=5, `refresh`=3, `diagnosis`=2.
- [ ] `modules/ai/response_parser.py` — parse AI response → create DB records (alerts, recs)
- [ ] `modules/ai/service.py` — `get_or_generate_ai_summary()` with context hashing, `chat()`, `safe_ai_call()` with fallback
- [ ] `modules/ai/router.py` — `GET /ai/summary/{project_id}`, `POST /ai/summary/{project_id}`, `POST /ai/chat`
  - `POST /ai/summary/{id}` must call `invalidate_dashboard_cache(project_id)` after generating
- [ ] `migrations/versions/002_ai_context_hash.py` — **[NEW FIX]** adds `context_hash VARCHAR(32)` to `ai_project_summaries`
- [ ] `tasks/ai_tasks.py` — `generate_weekly_ai_summary` (Sunday 6 AM) with 4-second throttle between projects

### Frontend (Phase 6):
- [ ] `components/blocks/AISummaryBlock.tsx` — cached summary + Refresh button
- [ ] `app/(app)/projects/[id]/ai/page.tsx` — full AI chat
- [ ] `components/ai/AIChatWindow.tsx`, `AISummaryCard.tsx`, `AICostBadge.tsx`, `ChatInput.tsx`

### Deliverable:
"Why are leaves yellow?" → Gemini answers using farmer's soil, weather, stage context.

---

## PHASE 7 — Market Prices + Notifications
**Week 12**

### What needs to be built:
- [ ] `modules/market/service.py` — `get_prices()`, `compute_trends()`, revenue calculator
- [ ] `modules/market/router.py` — `GET /market/prices/{plant_id}`, `GET /market/trends/{plant_id}`, `POST /market/admin/prices`
- [ ] `tasks/market_tasks.py` — `compute_market_trends` (daily Celery Beat)
- [ ] `modules/notification/push.py` — Web Push VAPID implementation
- [ ] `modules/notification/service.py` — `create_notification()`, `send_push()`, `mark_read()`
- [ ] `modules/notification/router.py` — `GET /notifications`, `PATCH /{id}/read`, `POST /notifications/subscribe`
- [ ] `tasks/notification_tasks.py` — `send_daily_notifications` (5:30 AM Celery Beat)

### Frontend (Phase 7):
- [ ] `components/blocks/MarketBlock.tsx` — price + trend arrow
- [ ] `app/(app)/projects/[id]/market/page.tsx` — 30-day chart + revenue calculator
- [ ] `app/(app)/notifications/page.tsx` — notification center
- [ ] TopBar: notification bell with unread count badge

### Deliverable:
Farmer gets push "🌱 3 tasks today" → taps → app scrolls to activity block.

---

## PHASE 8 — Admin Roles & Backoffice Features
**Week 13**

### What needs to be built:
- [ ] `modules/admin/router.py` — `/admin/users`, `/admin/stats`, `/admin/projects`, etc.
- [ ] `dependencies.py` — `get_admin_user` dependency enforcement
- [ ] Admin panel frontend pages (user list, project monitoring, stats)
- [ ] Role toggling (`farmer` ↔ `admin`) and account deactivation functionality

### Deliverable:
System admin can securely log in, list all users, view platform usage, and deactivate abusive accounts.

---

## PHASE 9 — Polish, Testing, Deploy
**Weeks 14–15**

### What needs to be built:
- [ ] `tests/test_planner.py` — assert 77 activities generated, organic filtering works (call `engine.py` directly, no Celery)
- [ ] `tests/test_soil.py` — input low nitrogen, assert compost recommendation
- [ ] `tests/test_weather.py` — rain 30mm → watering activity skipped
- [ ] `tests/test_ai.py` — mock Gemini, test context builder, context hashing, rate limiter, fallback
- [ ] `tests/test_seed_data.py` — **[NEW FIX]** validates all seed data integrity:
  - `test_all_plants_have_stages()` — no plant has empty stage list
  - `test_stage_continuity_no_gaps()` — no gaps between consecutive stages
  - `test_all_stages_have_water_requirements()` — every stage has a water record
  - `test_organic_fertilizer_exists_for_all_stages()` — organic option always present
- [ ] `tests/test_integration.py` — full register → project → plan flow
- [ ] `seed/validator.py` — **[NEW FIX]** runs after `run_seed.py`, exits with code 1 on data errors
- [ ] Service Worker config in `next.config.js` (next-pwa)
- [ ] Docker production build (`Dockerfile` for backend + frontend)
- [ ] GitHub Actions CI/CD pipeline (run `pytest tests/test_seed_data.py` in CI)
- [ ] Lighthouse audit > 90

### Deliverable:
v1.0 live at agrifarm.app. $0 AI cost. 300 farmers supported.

---

## Future Phases (DO NOT implement in v1.0)

| Phase | Feature | Version |
|-------|---------|---------|
| Phase 9 | Flutter mobile apps (Android + iOS) | v2.0 |
| Phase 10 | B2B/B2C Marketplace | v2.0 |
| Phase 11 | AI Agent + MCP Server + Gemma 3 self-hosted | v3.0 |
| Phase 12 | Flutter Desktop + Computer Vision disease detection | v3.0 |
| Future | Full RAG pipeline (pgvector embeddings) | v3.0 |
| Future | Multi-language (Sinhala, Tamil) | v2.0 |

**Do not scaffold, stub, or implement any future-phase features during v1.0 development.** The database schema has placeholder tables (`marketplace.py`, `farmer_rag_chunks`) — they exist but should not have endpoints or business logic yet.
