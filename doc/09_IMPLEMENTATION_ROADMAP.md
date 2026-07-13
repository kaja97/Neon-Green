# AgriFarm AI — Implementation Roadmap

## Team: 1–3 Developers + AI Coding Assistant
## Total Timeline: ~14 Weeks (v1.0 Web App) + Future Phases

---

## Strategy: Start Small, Plan Big

**v1.0 (Now):** Web app with Farmer Project Service + Free AI (Google Gemini)
**v2.0 (Future):** Flutter mobile apps (Android + iOS) + RAG + Marketplace
**v3.0 (Future):** AI Agent + MCP Server + Desktop app

All code is structured to support future expansion from day one.

---

## PHASE 0 — Environment Setup & Seed Data
**Duration:** Week 1
**Goal:** Working dev environment + seeded database

### Backend Setup
- [x] Initialize Python project: `pyproject.toml`, virtual env (Python 3.11+)
- [x] Install FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, Celery, Redis
- [x] Configure Docker Compose: PostgreSQL 16 (+ PostGIS + pgvector + pg_trgm), Redis 7
- [x] Create `database.py` (async engine, session factory)
- [x] Create `config.py` (Pydantic BaseSettings, env vars)
- [x] Create first Alembic migration with all core tables (Sections 1-10 from DB model)
- [x] Run migration, verify tables exist

### Frontend Setup
- [x] Initialize Next.js 14 project with App Router, TypeScript
- [x] Install Tailwind CSS + shadcn/ui + Recharts + Zustand + React Query
- [x] Configure `next-pwa` for offline capability
- [x] Create AppShell layout (TopBar + BottomNav)
- [x] Create `lib/api.ts` (Axios instance, JWT interceptor, token refresh)

### Seed Data
- [x] Seed `farming_methods` (organic, inorganic, integrated)
- [x] Seed `plants` table with 5 priority crops: Tomato, Chili, Rice, Brinjal, Beans
- [x] Seed `plant_stages` for all 5 crops (6 stages each = 30 records)
- [x] Seed `plant_water_requirements` for all stages (30 records)
- [x] Seed `plant_nutrient_requirements` for all stages (30 records)
- [x] Seed `plant_fertilizer_recommendations` for all stages × organic + conventional (60 records)
- [x] Seed `plant_diseases` for Tomato (8 diseases) and Chili (5 diseases)
- [x] Seed `disease_solutions` for each disease × organic + conventional
- [x] Seed `plant_pests` for Tomato (6 pests) and Chili (4 pests)
- [x] Seed `pest_solutions` for each pest

**✅ Deliverable:** `docker-compose up` → PostgreSQL running, all tables created, seed data loaded

---

## PHASE 1 — Auth & Farmer Profile
**Duration:** Week 2
**Goal:** User can register, login, and manage their farm profile

### Backend
- [x] Auth Module:
  - [x] `POST /auth/register/request-otp` — send OTP via Celery
  - [x] `POST /auth/register/verify` — complete account + farmer_profile
  - [x] `POST /auth/login` — email/phone + password → JWT pair (includes role)
  - [x] `POST /auth/refresh` — refresh token rotation
  - [x] `GET /auth/me` — current user info
  - [x] `PATCH /auth/change-password`
  - [x] `POST /auth/forgot-password/request-otp` & `verify`
  - [x] JWT middleware (RS256, 15-min access, 30-day refresh in Redis) with RBAC roles support (`farmer`, `admin`)
  - [x] `core/otp.py` — Redis-backed OTP system
  - [x] `core/rate_limiter.py` — Redis sliding window rate limiter
  - [x] `tasks/otp_tasks.py` — `send_otp_email_task`, `send_otp_sms_task` (Celery background tasks)
- [x] Farmer Module:
  - [x] `GET /farmer/profile` — get own profile
  - [x] `PUT /farmer/profile` — update profile
  - [x] `POST /farmer/locations` — add GPS location
  - [x] `GET /farmer/locations` — list locations
  - [x] `PUT /farmer/locations/{id}` — update location
  - [x] `DELETE /farmer/locations/{id}` — delete location
  - [x] `POST /farmer/land` — add land details
  - [x] `GET /farmer/land` — list land details
  - [x] `PUT /farmer/land/{id}` — update land details
  - [x] `DELETE /farmer/land/{id}` — delete land details
  - [x] `POST/GET/PUT/DELETE /farmer/livestock` — manage livestock

### Frontend
- [x] Login page (`/login`)
- [x] Register page (`/register`) — multi-step: OTP request → OTP verify → account → profile → first location
- [x] Forgot password flow
- [x] Profile page (`/profile`) — edit farmer info
- [x] Location management page — add/edit locations with Leaflet map picker

**✅ Deliverable:** Farmer can register with OTP verification, login, add farm locations, and manage profile

---

## PHASE 2 — Project CRUD & Dashboard Shell
**Duration:** Weeks 3–4
**Goal:** Farmer can create a project and see the dashboard skeleton

### Backend
- [x] Project Module:
  - [x] `POST /projects` — create project (validate crop, location, land)
  - [x] `GET /projects` — list projects (with filter by status)
  - [x] `GET /projects/{id}` — project detail
  - [x] `PUT /projects/{id}` — update project details
  - [x] `DELETE /projects/{id}` — delete project
  - [x] `PATCH /projects/{id}/status` — change status
  - [x] `GET /projects/{id}/dashboard` — aggregated dashboard endpoint
- [x] Master Data endpoints:
  - [x] `GET /plants` — list crops with search
  - [x] `GET /plants/{id}/stages` — get growth stages
  - [x] `GET /farming-methods` — list methods

### Frontend
- [x] Dashboard page (`/dashboard`) — project card grid
- [x] Create Project Wizard (`/projects/new`) — 5-step wizard:
  1. Select crop (grid of crop cards)
  2. Select location
  3. Select land details + farming method
  4. Set planting date + area
  5. Review & create
- [x] Project Dashboard page (`/projects/[id]`) — skeleton with:
  - [x] FarmingCircle component (visual stage ring)
  - [x] DayCounter ("Day 45 of 90 — 50%")
  - [x] Service blocks placeholder (Weather, Soil, Activities, Market, AI)

**✅ Deliverable:** Farmer creates "Tomato Farm — 1 Acre" project, sees Farming Circle on dashboard

---

## PHASE 3 — Activity Planner (Life Cycle Engine)
**Duration:** Weeks 5–6
**Goal:** Full-season activity plan generated automatically, daily tasks visible

### Backend
- [x] Activity Planner Module:
  - [x] `generate_season_plan()` — Celery task triggered on project creation
  - [x] Generates watering, fertilizing, monitoring activities for all stages
  - [x] Scales quantities to farm area, filters by farming method
  - [x] `GET /planner/{project_id}/today` — today's pending activities
  - [x] `GET /planner/{project_id}/activities` — full plan with pagination
  - [x] `PATCH /planner/activities/{id}/complete` — mark done (with notes)
  - [x] `PATCH /planner/activities/{id}/skip` — skip with reason

### Frontend
- [x] ActivityBlock on project dashboard — today's task cards
- [x] Activity timeline view (`/projects/[id]/plan`) — vertical timeline
- [x] ActivityCard component — tap to expand, "Done" / "Skip" buttons
- [x] DoneButton with optional notes input
- [x] SkipDialog with required reason

**✅ Deliverable:** Creating a project generates 77 activities. Farmer sees daily tasks and marks them done.

---

## PHASE 4 — Weather Integration
**Duration:** Week 7
**Goal:** Weather data fetched, activities adjusted, alerts generated

### Backend
- [x] Weather Module:
  - [x] OpenWeatherMap free API integration (1000 calls/day)
  - [x] Redis caching (3-hour TTL, GPS rounded to 3 decimals)
  - [x] `GET /weather/{project_id}` — 5-day forecast
  - [x] `GET /weather/{project_id}/alerts` — active alerts
- [x] Celery Beat jobs:
  - [x] `refresh_weather_cache` — every 3 hours
  - [x] `adjust_plan_for_weather` — 5:00 AM daily
  - [x] `check_weather_alerts` — every 6 hours
- [x] Weather adjustment rules:
  - [x] Skip watering if rain > 5mm
  - [x] Reschedule fertilizer if rain > 25mm
  - [x] Reschedule spraying if wind > 20km/h
  - [x] Alert: flood (>50mm), frost (<10°C), disease risk (humidity >85%)

### Frontend
- [x] WeatherBlock on project dashboard — current + 5-day mini forecast
- [x] AlertBanner component — red/yellow strip for weather alerts
- [x] Weather detail page (`/projects/[id]/weather`) — full 5-day chart
- [x] Weather-adjusted activity badge (shows "⚡ Skipped by weather" on task card)

**✅ Deliverable:** Activities auto-adjust based on weather. Farmer sees alerts.

---

## PHASE 5 — Soil Analysis & Disease/Pest Service
**Duration:** Weeks 8–9
**Goal:** Soil test analysis + disease matching engine working

### Backend — Soil
- [x] Soil Module:
  - [x] `POST /soil/tests` — submit soil test with nutrient results
  - [x] `GET /soil/tests/{project_id}` — test history
  - [x] `GET /soil/recommendations/{project_id}` — computed recommendations
  - [x] Deterministic nutrient gap calculator:
    - [x] Compare actual vs. optimal (from `plant_nutrient_requirements`)
    - [x] Generate specific product + quantity recommendations
    - [x] Filter organic/conventional by project farming method

### Backend — Disease
- [x] Disease Module:
  - [x] `POST /issues` — report a problem (symptoms + affected parts)
  - [x] `GET /issues/{project_id}` — issue history
  - [x] `GET /disease/search` — keyword search against `plant_diseases`
  - [x] `GET /disease/{id}/solutions` — solutions filtered by farming method
  - [x] PostgreSQL full-text search (`to_tsvector`, `ts_rank`)
  - [x] If keyword match confidence < threshold → route to AI (Phase 6)

### Frontend
- [x] SoilBlock on dashboard — pH, N/P/K status badges
- [x] Soil detail page — radar chart + recommendations list
- [x] Soil test form — manual entry of lab results
- [x] DiseaseBlock on dashboard — "No active issues" / issue count
- [x] Issue report flow — select symptoms → select affected parts → submit
- [x] Solutions display — organic tab / conventional tab

**✅ Deliverable:** Farmer submits soil test → gets "Apply 30kg Urea per acre". Reports "yellow spots" → matched to "Early Blight" with solutions.

---

## PHASE 6 — AI Integration (Free Google Gemini)
**Duration:** Weeks 10–11
**Goal:** AI-powered summaries, chat, and smart database updates

### Backend
- [x] AI Module:
  - [x] `context_builder.py` — flatten all project tables into JSON context
  - [x] `prompts.py` — system prompts for summary, Q&A, diagnosis
  - [x] `service.py` — Google AI Studio integration:
    - [x] `pip install google-generativeai`
    - [x] Configure with free API key (no credit card needed)
    - [x] Use `gemini-2.0-flash` model
  - [x] `POST /ai/summary/{project_id}` — generate fresh AI summary
  - [x] `GET /ai/summary/{project_id}` — get cached summary
  - [x] `POST /ai/chat` — farmer Q&A with project context
  - [x] Intent classifier (regex-based, no AI):
    - [x] Weather questions → route to weather service
    - [x] Price questions → route to market service
    - [x] Schedule questions → route to planner service
    - [x] Complex questions → route to Gemini
  - [x] Rate limiting: 10 AI calls/day per farmer, 14 RPM global
  - [x] Error handling: fallback to deterministic summary if Gemini unavailable
  - [x] AI response parser: extract insights → update DB:
    - [x] Disease risk detection → create `project_issues` or `weather_alerts`
    - [x] Nutrient deficiency → create `soil_recommendations`
    - [x] Schedule suggestions → create `notifications`
- [x] Celery Beat:
  - [x] `generate_weekly_ai_summary` — Sundays 6 AM, flatten each project → Gemini

### Frontend
- [x] AISummaryBlock on dashboard — latest cached AI summary
- [x] "🔄 Refresh AI" button — trigger fresh summary
- [x] AI Chat page (`/projects/[id]/ai`):
  - [x] Chat window with message bubbles
  - [x] Context badge ("Tomato Farm — Day 45")
  - [x] Remaining calls counter ("8 AI calls remaining today")
  - [x] "$0.00" cost badge (shows it's free)
- [x] ChatInput with send button

**✅ Deliverable:** Farmer taps "Get AI Summary" → sees "Your tomato is in Flowering stage, watch for blight due to humidity..." Farmer asks "Why are leaves yellow?" → AI answers using project soil + weather data.

---

## PHASE 7 — Market Prices & Notifications
**Duration:** Week 12
**Goal:** Crop price tracking and push notifications

### Backend
- [x] Market Module:
  - [x] `GET /market/prices/{plant_id}` — current price by district
  - [x] `GET /market/trends/{plant_id}` — 30-day trend
  - [x] Admin endpoint: `POST /market/admin/prices` — manual price entry
  - [x] Celery: `compute_market_trends` — daily trend calculation
  - [x] Price change alert trigger (>15% drop or >20% rise)
- [x] Notification Module:
  - [x] `GET /notifications` — list notifications (filter: unread)
  - [x] `PATCH /notifications/{id}/read` — mark as read
  - [x] `POST /notifications/subscribe` — register Web Push subscription
  - [x] Web Push via VAPID keys + Service Worker
  - [x] Celery Beat: `send_daily_notifications` — 5:30 AM

### Frontend
- [x] MarketBlock on dashboard — price + trend arrow
- [x] Market detail page — 30-day line chart + revenue calculator
- [x] Notification center (`/notifications`) — grouped by type
- [x] Push notification permission prompt on first login
- [x] Notification bell with unread count badge in TopBar

**✅ Deliverable:** Farmer sees tomato price 180 LKR/kg (↑12%). Gets push: "🌱 3 tasks today"

---

## PHASE 8 — Admin Roles & Backoffice Features
**Duration:** Week 13
**Goal:** Admin role access and platform management

### Backend
- [x] Admin Module (`modules/admin/`):
  - [x] `GET /admin/users` — List and filter all users
  - [x] `GET /admin/users/{id}` — View user detail
  - [x] `PATCH /admin/users/{id}/deactivate` / `reactivate`
  - [x] `PATCH /admin/users/{id}/role` — Change user role (farmer ↔ admin)
  - [x] `GET /admin/stats` — Platform aggregates
  - [x] `GET /admin/projects` — List all projects
  - [x] `GET /admin/ai/usage` — AI metrics dashboard

### Frontend
- [x] Admin layout and sidebar navigation
- [x] Users management table with role toggling
- [x] System metrics dashboard

**✅ Deliverable:** System admin can manage farmers and view platform usage securely.

---

## PHASE 9 — Polish, Testing & PWA
**Duration:** Weeks 14–15
**Goal:** Production-ready v1.0

### Testing
- [x] Unit tests (`pytest`):
  - [x] Activity planner: generate plan for tomato, assert 77 activities
  - [x] Soil calculator: input pH 5.5, assert lime recommendation
  - [x] Intent classifier: "What's the weather?" → routes to weather, not AI
  - [x] Weather adjustment: rain 30mm → watering skipped
- [x] Integration tests:
  - [x] Full project creation flow: register → login → create project → verify plan generated
  - [x] Dashboard aggregation: verify all blocks return data
  - [x] AI summary: mock Gemini response, verify DB updates
- [x] E2E tests (Playwright):
  - [x] Register → Create project → Mark task done → View dashboard
  - [x] Ask AI question → See response

### PWA & Performance
- [x] Service Worker caching for daily plan and weather
- [x] Offline mode: show cached activities without internet
- [x] Optimistic updates: mark task done immediately, sync later
- [x] Lighthouse audit: target > 90 on all metrics

### Deployment
- [x] Docker build for FastAPI + Celery worker + Celery Beat
- [x] Docker Compose: Nginx (reverse proxy) + FastAPI + PostgreSQL + Redis
- [x] GitHub Actions CI/CD pipeline
- [x] Deploy to VPS (DigitalOcean / Hetzner)
- [x] HTTPS via Let's Encrypt
- [x] Environment variables for production

**✅ Deliverable:** v1.0 deployed. Farmer can register, create project, get daily guidance, ask AI questions — all for $0 AI cost.

---

## FUTURE PHASES (Post v1.0)

### Phase 9 — Flutter Mobile Apps (v2.0)
- [ ] Flutter project setup (shared codebase for Android + iOS)
- [ ] Same API, native UI components
- [ ] Camera integration for disease photo upload
- [ ] GPS auto-detection for location
- [ ] FCM push notifications (replaces Web Push)
- [ ] Hive/SQLite for rich offline caching

### Phase 10 — Marketplace (v2.0)
- [ ] Vendor Profile and Buyer Profile (role-based identity)
- [ ] Agri-Input Market: vendors list fertilizers/seeds/tools
- [ ] Harvest Market: farmers list completed crops with provenance
- [ ] Order system with status tracking

### Phase 11 — AI Agent + MCP (v3.0)
- [ ] Self-hosted Gemma 3 model for small classification tasks
- [ ] pgvector embeddings for full RAG pipeline
- [ ] MCP Server: per-farmer tool endpoints
- [ ] AI Agent: autonomous monitoring, proactive alerts
- [ ] Multi-step reasoning for complex farming questions

### Phase 12 — Desktop & Advanced Features (v3.0)
- [ ] Flutter Desktop (Windows + macOS)
- [ ] Admin dashboard for platform management
- [ ] Multi-language support (Sinhala, Tamil)
- [ ] Computer vision for disease detection (photo → diagnosis)

---

## Environment Variables Checklist

```bash
# Database
DATABASE_URL=postgresql+asyncpg://agrifarm:password@localhost:5432/agrifarm_db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_PRIVATE_KEY=<RS256 private key>
JWT_PUBLIC_KEY=<RS256 public key>
JWT_ACCESS_EXPIRE_MINUTES=15
JWT_REFRESH_EXPIRE_DAYS=30

# AI (FREE — no credit card needed)
GOOGLE_AI_STUDIO_API_KEY=<get from https://aistudio.google.com/apikey>

# Weather (FREE — 1000 calls/day)
OPENWEATHER_API_KEY=<get from https://openweathermap.org/api>

# Storage
AWS_ACCESS_KEY_ID=...          # Or use MinIO for local dev
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=agrifarm-uploads

# Push Notifications
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_EMAIL=admin@agrifarm.app

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
```

**Required API accounts (all FREE):**
- [x] Google AI Studio — free API key (no credit card): https://aistudio.google.com/apikey
- [x] OpenWeatherMap — free tier (1,000 calls/day): https://openweathermap.org/api
- [x] Generate VAPID keys: `npx web-push generate-vapid-keys`
