# AgriFarm AI — Implementation Roadmap

## Team: 1–3 Developers + AI Coding Assistant
## Total Timeline: ~12 Weeks (v1.0 Web App) + Future Releases

---

## Strategy: Start Small, Plan Big

**v1.0 (Now):** Web app with Farmer Project Service + deterministic engines (planner, weather, soil, disease, market)
**v2.0 (Future):** Flutter mobile apps + AI Chat (Gemini) + RAG + Marketplace
**v3.0 (Future):** AI Agent + MCP Server + Desktop app

Services roll out **incrementally** with account- and project-level gating. See [`16_SERVICE_GATING.md`](./16_SERVICE_GATING.md).

All code is structured to support future expansion from day one.

---

## Architecture Quick Reference

| Component | Technology | Notes |
|-----------|-----------|-------|
| Backend | FastAPI (Python) in `backend/` | Modular monolith, single deployable |
| Frontend | Next.js 14 in `frontend/` | Separate app, REST API client |
| Database | PostgreSQL 16 + Redis 7 | Docker Compose for local dev |
| Python deps | `requirements.txt` or Poetry | Backend only — not for frontend |
| Frontend deps | npm + `node_modules/` | Local per project, not global |
| Deploy | Separate | Frontend CDN/Vercel + Backend VPS/Docker |

**Phase 0 builds DB + backend + frontend foundations — not Phase 4.**

---

## PHASE 0 — Environment Setup & Seed Data
**Duration:** Week 1
**Goal:** Working dev environment + seeded database

### Backend Setup
- [ ] Python 3.11+ virtual env (`requirements.txt` or Poetry in `backend/`)
- [ ] Install FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, Celery, Redis
- [ ] Configure Docker Compose: PostgreSQL 16 (+ PostGIS + pgvector + pg_trgm), Redis 7
- [ ] Create `database.py`, `config.py`
- [ ] Create first Alembic migration with all core tables (Sections 1–10 from DB model)
- [ ] Run migration, verify tables exist

### Frontend Setup
- [ ] Initialize Next.js 14 project with App Router, TypeScript
- [ ] Install Tailwind CSS + Recharts + Zustand + React Query
- [ ] Create AppShell layout (TopBar + BottomNav)
- [ ] Create `lib/api.ts` (Axios instance, JWT interceptor, token refresh)

### Seed Data
- [ ] Seed `plants` (5 crops: Tomato, Chili, Rice, Brinjal, Beans)
- [ ] Seed `plant_stages`, water, nutrient, fertilizer records
- [ ] Seed `plant_diseases` + `disease_solutions` for Tomato and Chili
- [ ] Seed `plant_pests` + `pest_solutions` (optional in v1.0)

**✅ Deliverable:** `docker-compose up` → PostgreSQL + Redis running, migrations applied, seed loaded, `/docs` shows API

---

## PHASE 1 — Auth & Farmer Profile
**Duration:** Week 2
**Goal:** User can register, login, and manage their farm profile

### Backend
- [ ] Auth: register, login, refresh, `/me`, JWT (HS256 dev / RS256 prod), bcrypt
- [ ] On register: create `farmer_profile` + optional first `farmer_location`
- [ ] On register: seed `account_features` from `DEFAULT_ACCOUNT_SERVICES` env var
- [ ] Farmer: profile CRUD, locations, land details

### Frontend
- [ ] Login, register (account → profile → location), profile page
- [ ] Location management with Leaflet map picker

**✅ Deliverable:** Farmer registers with GPS location; account has service access rows

---

## PHASE 2 — Project CRUD & Dashboard Shell
**Duration:** Weeks 3–4
**Goal:** Farmer can create a project and see the dashboard skeleton

### Backend
- [ ] Project CRUD + `GET /projects/{id}/dashboard`
- [ ] On project create: seed `project_services` from account's enabled services
- [ ] `GET /projects/{id}/services` — list active services
- [ ] Master data: plants, stages, farming methods
- [ ] Dashboard returns `enabled_services[]` for frontend block visibility

### Frontend
- [ ] Dashboard, create-project wizard, project dashboard
- [ ] FarmingCircle, DayCounter
- [ ] Service blocks: show only when service in `enabled_services`
- [ ] Placeholder / "Coming soon" for disabled services

**✅ Deliverable:** Farmer creates project; dashboard shows Farming Circle + enabled blocks only

---

## PHASE 3 — Activity Planner (Life Cycle Engine) — CORE
**Duration:** Weeks 5–6
**Goal:** Full-season activity plan generated automatically, daily tasks visible

**Note:** `activity_plan` is always enabled — no service gating.

### Backend
- [ ] `generate_season_plan()` on project creation (sync or Celery)
- [ ] Watering, fertilizing, monitoring — scaled to area, filtered by farming method
- [ ] `GET /planner/{project_id}/today`, activities list, complete/skip
- [ ] Fix ownership checks via `farmer_profiles.id` (not `accounts.id`)

### Frontend
- [ ] ActivityBlock, timeline page, Done/Skip UI

**✅ Deliverable:** Creating a project generates ~77 activities; farmer marks tasks done

---

## PHASE 4 — Weather Integration
**Duration:** Week 7
**Goal:** Weather data fetched, activities adjusted, alerts generated
**Gated service:** `weather`

### Backend
- [ ] OpenWeatherMap integration + cache (Redis or DB, 3-hour TTL)
- [ ] `require_project_service("weather")` on weather endpoints
- [ ] Celery Beat: refresh cache, adjust plan (5 AM), check alerts
- [ ] Weather rules: skip watering if rain > 5mm, etc.

### Frontend
- [ ] WeatherBlock, AlertBanner, weather detail page
- [ ] Hide weather UI when service not in `enabled_services`

**✅ Deliverable:** Activities auto-adjust based on weather (for accounts with access)

---

## PHASE 5 — Soil Analysis & Disease/Pest Service
**Duration:** Weeks 8–9
**Goal:** Soil test analysis + disease matching engine
**Gated services:** `soil`, `disease_watch`

### Backend — Soil
- [ ] Soil test submit, history, recommendations
- [ ] Nutrient gap calculator vs `plant_nutrient_requirements`
- [ ] `require_project_service("soil")`

### Backend — Disease
- [ ] Issue reporting, disease search (PostgreSQL FTS when ready)
- [ ] Solutions filtered by farming method
- [ ] **No AI fallback in v1.0** — return helpful "no match" message
- [ ] `require_project_service("disease_watch")`

### Frontend
- [ ] SoilBlock, test form, disease issue flow, solutions tabs

**✅ Deliverable:** Soil test → recommendations. "Yellow spots" → Early Blight + solutions

---

## PHASE 6 — Market Prices & Notifications
**Duration:** Week 10
**Goal:** Crop price tracking and push notifications
**Gated services:** `market_price`, `notifications`

### Backend
- [ ] Market prices, trends, revenue estimate
- [ ] Admin price entry, Celery trend computation
- [ ] Notifications list/read, Web Push subscribe, daily Celery job

### Frontend
- [ ] MarketBlock, notification center, push permission prompt

**✅ Deliverable:** Farmer sees tomato price trend; gets "3 tasks today" notification

---

## PHASE 7 — Polish, Testing & Deploy
**Duration:** Weeks 11–12
**Goal:** Production-ready v1.0

### Testing
- [ ] Unit tests: planner, soil calculator, weather rules
- [ ] Integration: register → project → plan flow
- [ ] E2E: register → create project → mark task done

### PWA & Deployment
- [ ] Service Worker caching, offline daily plan
- [ ] Docker build for FastAPI + Celery; frontend build separately
- [ ] VPS deploy, HTTPS, GitHub Actions CI/CD

**✅ Deliverable:** v1.0 deployed — planner + gated optional services, **no AI chat**

---

## FUTURE RELEASES (Post v1.0)

### v2.0 — AI Chat (Gemini)
**Not in v1.0.** Backend module exists but routes are unmounted until ready.

- [ ] Mount `/ai/*` routes
- [ ] `POST /ai/summary/{project_id}`, `POST /ai/chat`
- [ ] Grant via `account_features.service_type = 'ai_chat'`
- [ ] Intent classifier routes to weather/market/planner where possible
- [ ] Rate limiting, deterministic fallback

### v2.0 — Flutter Mobile Apps
- [ ] Android + iOS, same API, FCM push, camera for disease photos

### v2.0 — Marketplace
- [ ] Vendor/buyer profiles, agri-input and harvest listings, orders

### v3.0 — AI Agent + MCP
**Not in v1.0 or v2.0 chat scope.**

- [ ] Self-hosted Gemma 3, pgvector RAG, MCP server
- [ ] Autonomous agent, proactive alerts
- [ ] Grant via `account_features.service_type = 'ai_agent'`

### v3.0 — Desktop & Advanced
- [ ] Flutter Desktop, admin dashboard, Sinhala/Tamil, computer vision

---

## Environment Variables Checklist

```bash
# Database
DATABASE_URL=postgresql+asyncpg://agrifarm:password@localhost:5432/agrifarm_db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=<dev secret>
JWT_ACCESS_EXPIRE_MINUTES=15
JWT_REFRESH_EXPIRE_DAYS=30

# Service rollout — comma-separated, no AI in v1.0
DEFAULT_ACCOUNT_SERVICES=activity_plan,weather,soil,disease_watch,market_price

# Weather (FREE — 1000 calls/day)
OPENWEATHER_API_KEY=<https://openweathermap.org/api>

# Future — AI (not required for v1.0)
# GOOGLE_AI_STUDIO_API_KEY=

# Push Notifications
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_EMAIL=admin@agrifarm.app

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
```

**Required API accounts for v1.0:**
- [ ] OpenWeatherMap — free tier (1,000 calls/day)

**Future (v2.0 AI):**
- [ ] Google AI Studio — free Gemini API key

---

## Phase Numbering Reference

| Doc phase | What it is |
|-----------|------------|
| Phase 0 | DB + backend + frontend setup |
| Phase 1–3 | Auth, projects, **core planner** |
| Phase 4–6 | Optional gated services |
| Phase 7 | Deploy v1.0 |
| v2.0 / v3.0 | AI chat, mobile, agent — **future milestone names** (not Phase 8+) |

Do not confuse with old overview doc labels ("Phase 2 = Flutter"). Use **v2.0 / v3.0** for future platforms.
