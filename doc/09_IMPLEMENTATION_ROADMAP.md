# AgriFarm AI — Implementation Roadmap

## Team: 1–3 Developers + AI Coding Assistant
## Total Timeline: ~17 Weeks

---

## PHASE 0 — Environment Setup & Seed Data
**Duration:** Week 1
**Goal:** Working dev environment + seeded database

### Tasks

#### Infrastructure
- [ ] Initialize GitHub monorepo: `/backend`, `/frontend`, `/doc`
- [ ] Docker Compose file with all services:
  - [ ] PostgreSQL 16 with pgvector + pg_trgm extensions
  - [ ] Redis 7
  - [ ] Backend (FastAPI, auto-reload)
  - [ ] Frontend (Next.js dev server)
- [ ] `.env.example` with all required environment variables
- [ ] Basic Makefile: `make up`, `make down`, `make seed`, `make migrate`

#### Database
- [ ] Run all DDL from `03_DATABASE_MODEL.md`
- [ ] Verify all foreign keys, indexes, and unique constraints
- [ ] Test pgvector: create dummy embedding, run cosine search

#### Seed Data (Master Data)
- [ ] `farming_methods`: organic, conventional, integrated
- [ ] `plants`: 20+ common crops minimum
  - Priority: Tomato, Beans, Cabbage, Potato, Chilli, Brinjal, Okra, Carrot
  - Include: Paddy (rice), Maize, Cucumber, Bitter gourd, Pumpkin
- [ ] `plant_stages`: 6–7 stages per crop (with start_day, end_day)
- [ ] `plant_nutrient_requirements`: per plant per stage
- [ ] `plant_water_requirements`: per plant per stage
- [ ] `plant_fertilizer_recommendations`: organic + conventional per stage
- [ ] `plant_diseases`: 50+ diseases with symptoms (keyword-rich)
- [ ] `plant_pests`: 30+ pests with symptoms
- [ ] `disease_solutions`: organic + conventional per disease
- [ ] `pest_solutions`: organic + conventional per pest

#### Backend Scaffold
- [ ] FastAPI project structure (`/services/{service_name}/`)
- [ ] Shared `database.py` (SQLAlchemy async engine + session)
- [ ] Shared `models.py` (all SQLAlchemy ORM models)
- [ ] Shared `schemas.py` (Pydantic v2 request/response models)
- [ ] API Gateway: basic FastAPI app with `include_router` for all services

#### Frontend Scaffold
- [ ] `npx create-next-app@latest ./frontend --typescript --tailwind --app`
- [ ] Install: `zustand @tanstack/react-query recharts leaflet shadcn-ui next-pwa`
- [ ] Basic layout: TopBar + BottomNav + AppShell components
- [ ] i18next setup for English (Sinhala later)

**✅ Deliverable:** `docker compose up` shows empty but functional app

---

## PHASE 1 — Authentication & Farmer Profile
**Duration:** Week 2
**Goal:** Farmer can register, log in, set up profile

### Backend
- [ ] Auth Service (SERVICE 1):
  - [ ] `POST /auth/register` → create account + farmer_profile
  - [ ] `POST /auth/login` → return JWT access + refresh
  - [ ] `POST /auth/refresh` → new access token
  - [ ] `POST /auth/logout` → invalidate Redis token
  - [ ] `POST /auth/forgot-password` → OTP via email
  - [ ] `POST /auth/verify-otp` → validate OTP, set new password
- [ ] Farmer Profile Service (SERVICE 2):
  - [ ] `GET/PUT /farmer/me` → profile CRUD
  - [ ] `POST/GET/PUT/DELETE /farmer/locations` → location management
  - [ ] `POST/GET/PUT/DELETE /farmer/land` → land details
  - [ ] `POST/GET/PUT/DELETE /farmer/livestock` → livestock
- [ ] JWT middleware applied to all non-auth routes
- [ ] Pydantic v2 validation on all request bodies

### Frontend
- [ ] `/register` — 4-step wizard (credentials → identity → farming background → quick start)
- [ ] `/login` — email/phone + password form
- [ ] `/forgot-password` — OTP request + reset
- [ ] `/profile` — view + edit profile form
- [ ] Location add/edit with Leaflet map picker
- [ ] Zustand auth store (token storage, refresh logic)
- [ ] React Query: auto-refresh access token before expiry

**✅ Deliverable:** Full auth flow end-to-end. Farmer can manage complete profile.

---

## PHASE 2 — Projects & Activity Planner
**Duration:** Weeks 3–4
**Goal:** Farmer creates project → sees generated 90-day activity plan

### Backend
- [ ] Project Service (SERVICE 3):
  - [ ] `GET/POST /projects` — list + create
  - [ ] `GET/PUT/DELETE /projects/{id}` — CRUD
  - [ ] `GET /projects/{id}/dashboard` — aggregate endpoint
  - [ ] `GET /projects/{id}/stage` — current stage info
  - [ ] `POST/PUT/DELETE /projects/{id}/services` — service management
- [ ] Activity Planner Service (SERVICE 6):
  - [ ] `generate_season_plan(project_id)` — full-season generator
  - [ ] `water_volume_calculator(area, mm_per_day)` — litres calculation
  - [ ] `fertilizer_schedule_generator(plant_id, stage_id, method_id)` — fertilizer tasks
  - [ ] `GET /planner/today/{project_id}` — today's tasks
  - [ ] `GET /planner/week/{project_id}` — 7-day view
  - [ ] `PUT /planner/activities/{id}` — mark done/skip
  - [ ] Celery task: triggered on project create

### Frontend
- [ ] `/dashboard` — project list (ProjectCard + ProjectGrid)
- [ ] `/projects/new` — 6-step create wizard:
  - [ ] Step 1: Crop search + selection grid
  - [ ] Step 2: Project details + location/land picker
  - [ ] Step 3: Farming method cards
  - [ ] Step 4: Date picker + auto-calculate harvest date
  - [ ] Step 5: Service toggles
  - [ ] Step 6: Review + Create (with generation animation)
- [ ] `/projects/[id]` — Project Dashboard (Phase 2 version):
  - [ ] FarmingCircle component (Recharts RadialBarChart)
  - [ ] StageIndicator badge
  - [ ] TodayActionItems (basic version)
  - [ ] ActivityPlanBlock (service block)
- [ ] `/projects/[id]/plan` — Full activity calendar
  - [ ] Month/week toggle
  - [ ] ActivityCard with done/skip buttons

**✅ Deliverable:** Farmer creates tomato project → sees 90-day plan → can mark tasks done

---

## PHASE 3 — Weather Integration
**Duration:** Week 5
**Goal:** Weather shown, activities adjusted automatically

### Backend
- [ ] Weather Service (SERVICE 4):
  - [ ] OpenWeatherMap API integration
  - [ ] Redis cache (3-hour TTL)
  - [ ] `weather_cache` table persistence
  - [ ] `generate_weather_actions(forecast, project)` — rule-based
  - [ ] Weather alerts generator
  - [ ] Celery Beat: daily weather refresh + activity adjustment

### Frontend
- [ ] WeatherBlock on project dashboard
- [ ] `/projects/[id]/weather` — Weather detail page:
  - [ ] 7-day horizontal forecast cards
  - [ ] Temp + humidity line chart (Recharts)
  - [ ] Farm impact list
  - [ ] Weather alert banners
- [ ] Activities: show weather-adjusted status differently (skipped/rescheduled)

**✅ Deliverable:** Rain tomorrow → watering auto-marked "skipped (rain expected)"

---

## PHASE 4 — Soil Analysis
**Duration:** Week 6
**Goal:** Farmer enters soil test → gets nutrient recommendations

### Backend
- [ ] Soil Service (SERVICE 5):
  - [ ] `POST /soil/tests` — submit + instant analysis
  - [ ] Nutrient gap calculator (per-crop optimal ranges)
  - [ ] pH correction calculator
  - [ ] `soil_recommendations` record generation
  - [ ] `GET /soil/tests/{id}/recommendations` — sorted by priority

### Frontend
- [ ] SoilBlock on project dashboard
- [ ] `/projects/[id]/soil` — Soil detail page:
  - [ ] Nutrient radar chart (6 axes, actual vs optimal)
  - [ ] Deficiency status badges
  - [ ] Prioritized recommendations list
  - [ ] SoilTestForm (manual data entry)
  - [ ] Test history timeline
  - [ ] "Upload report" button (S3 upload)

**✅ Deliverable:** Farmer enters pH 5.8 → sees "Nitrogen LOW — apply 30kg Urea before week 8"

---

## PHASE 5 — Disease & Pest System
**Duration:** Weeks 7–8
**Goal:** Report problem → get diagnosis + solutions

### Backend
- [ ] Disease Service (SERVICE 7):
  - [ ] Keyword-based symptom matcher
  - [ ] `POST /issues/report` — submit + instant diagnosis
  - [ ] LLM fallback for low-confidence matches
  - [ ] Solution fetch filtered by farming method
  - [ ] Disease risk calendar generator
  - [ ] `GET /disease/watch/{project_id}` — risk calendar

### Frontend
- [ ] DiseaseWatchBlock on project dashboard
- [ ] `/projects/[id]/disease` — Disease watch page:
  - [ ] Risk level banner
  - [ ] Risk heatmap calendar
  - [ ] Disease accordion cards
  - [ ] Active issues list
- [ ] `/projects/[id]/report-issue` — Report flow:
  - [ ] Step-by-step: what you see → where → describe → photo → diagnosis
  - [ ] DiagnosisResult: disease card + organic/conventional solution tabs

**✅ Deliverable:** "Yellowing leaves" → system suggests 3 diseases → farmer picks → sees organic + conventional solutions

---

## PHASE 6 — Market Prices
**Duration:** Week 9
**Goal:** Crop price tracking, trends, revenue estimate

### Backend
- [ ] Market Service (SERVICE 8):
  - [ ] Price record storage
  - [ ] Weekly trend computation (Celery)
  - [ ] Revenue estimator
  - [ ] Admin endpoint: `POST /market/admin/prices`
  - [ ] Price change alert trigger (>15% drop or >20% rise)

### Frontend
- [ ] MarketBlock on project dashboard
- [ ] `/projects/[id]/market` — Market detail:
  - [ ] Big price display + change arrow
  - [ ] 30-day price line chart
  - [ ] By-market price table
  - [ ] Revenue calculator with yield slider

**✅ Deliverable:** Farmer sees current tomato price, 30-day trend, and revenue estimate

---

## PHASE 7 — RAG System
**Duration:** Weeks 10–11
**Goal:** Per-farmer knowledge base built and searchable

### Backend
- [ ] RAG Service (SERVICE 9):
  - [ ] Document ingestion pipeline (chunk + embed + store)
  - [ ] OpenAI embeddings integration
  - [ ] pgvector storage + IVFFlat index
  - [ ] Semantic retrieval with intent filtering
  - [ ] Celery tasks:
    - [ ] `seed_project_rag_documents` (on project create)
    - [ ] `update_soil_rag_doc` (on soil test)
    - [ ] `update_activity_rag_doc` (on activity done)
    - [ ] `update_issue_rag_doc` (on issue resolve)
    - [ ] `weekly_market_rag_update` (Sunday)
    - [ ] `monthly_weather_rag_update`

### Testing
- [ ] Seed test data and verify retrieval accuracy
- [ ] Token cost measurement per query
- [ ] Index performance test (response time < 100ms)

**✅ Deliverable:** Each farmer has a growing personal knowledge base with accurate semantic retrieval

---

## PHASE 8 — AI Assistant & MCP
**Duration:** Weeks 12–13
**Goal:** Farmer chats with personalized AI assistant

### Backend
- [ ] MCP Server (SERVICE 10):
  - [ ] `FarmerMCPServer` class with all 7 tools
  - [ ] Tool routing to correct services
- [ ] AI Assistant Service (SERVICE 11):
  - [ ] `POST /ai/chat` — full chat pipeline
  - [ ] Intent classifier (deterministic pre-filter)
  - [ ] System prompt builder
  - [ ] Conversation trimming (long sessions)
  - [ ] Token budget guard
  - [ ] `ai_query_logs` tracking
  - [ ] `POST /ai/diagnose/{issue_id}` — AI disease diagnosis
  - [ ] `POST /ai/insights/{project_id}` — proactive insights

### Frontend
- [ ] AIChatBlock on project dashboard
- [ ] `/projects/[id]/ai` — Chat page:
  - [ ] WhatsApp-style chat bubbles
  - [ ] SuggestedPrompts chips
  - [ ] ThinkingAnimation while AI responds
  - [ ] Voice input (Web Speech API)
  - [ ] Image attachment (for disease diagnosis)
  - [ ] Context bar (crop + stage info)

**✅ Deliverable:** "What should I do this week?" → AI uses RAG + weather + activities → personalized answer

---

## PHASE 9 — Notifications
**Duration:** Week 14
**Goal:** Farmers get daily task reminders and weather alerts

### Backend
- [ ] Notification Service (SERVICE 12):
  - [ ] `GET /notifications` + count + mark read
  - [ ] `POST /notifications/push-token` — register device
  - [ ] Celery Beat: 5 AM daily notification creation
  - [ ] Celery Beat: 6 AM push dispatch
  - [ ] Web Push API (VAPID) integration
  - [ ] Deep link URL generation

### Frontend
- [ ] NotificationBell in TopBar (with unread badge)
- [ ] `/notifications` — notification center:
  - [ ] Grouped by Today / Yesterday / Earlier
  - [ ] Filter tabs: All / Activities / Weather / Market / Issues
  - [ ] "Mark all read" button
- [ ] Service Worker for Web Push (push API)
- [ ] Deep link handler: `?scroll=service_name&highlight=item_id` → auto-scroll + pulse

**✅ Deliverable:** 6 AM push: "Water tomatoes — 180L today" → tap → opens project → scrolls to activity block

---

## PHASE 10 — Polish & Production Readiness
**Duration:** Weeks 15–16

### Frontend Polish
- [ ] Offline mode (PWA daily plan + weather cache)
- [ ] Loading skeleton screens everywhere
- [ ] Empty states (no projects, no soil tests, etc.)
- [ ] Error states with retry buttons
- [ ] Swipe gestures on mobile (swipe to mark done)
- [ ] Sinhala language support (i18n)
- [ ] Accessibility: ARIA labels, keyboard nav

### Performance
- [ ] All non-AI APIs: < 200ms target (EXPLAIN ANALYZE all slow queries)
- [ ] React Query prefetching for dashboard data
- [ ] Image lazy loading + Next.js Image optimization
- [ ] Bundle size analysis (next build --analyze)

### Monitoring
- [ ] Prometheus metrics: requests/sec, response time, error rate per service
- [ ] Grafana dashboard: API health, AI cost per farmer, active users
- [ ] Sentry: frontend error tracking
- [ ] Structured JSON logging → CloudWatch
- [ ] AI cost dashboard (tokens per farmer per day)

### Security Hardening
- [ ] Rate limiting: 100 req/min per IP, 20 AI calls/day per farmer
- [ ] Input sanitization on all text inputs
- [ ] File upload validation (image only, max 5MB)
- [ ] HTTPS everywhere (SSL/TLS via Nginx)
- [ ] All SQL parameterized (no raw string queries)

---

## PHASE 11 — Admin Panel
**Duration:** Week 17

### Features
- [ ] Admin login (separate `admin` role, separate subdomain)
- [ ] Plant management: add/edit crops, stages, nutrient requirements
- [ ] Disease/pest database management
- [ ] Market price manual entry interface
- [ ] Farmer overview: accounts, active projects, last login
- [ ] AI cost dashboard: total tokens, cost per farmer, daily trends
- [ ] RAG document management: list, reindex, delete

---

## API Keys & Environment Variables Checklist

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/agrifarm
REDIS_URL=redis://localhost:6379/0

# Auth
JWT_PRIVATE_KEY=<RS256 private key>
JWT_PUBLIC_KEY=<RS256 public key>
JWT_ACCESS_EXPIRE_MINUTES=15
JWT_REFRESH_EXPIRE_DAYS=30

# AI
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...           # Embeddings only
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536

# Weather
OPENWEATHER_API_KEY=...

# Maps
GOOGLE_MAPS_API_KEY=...         # Or use free Nominatim

# Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=agrifarm-uploads
AWS_REGION=ap-southeast-1

# Push Notifications
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_EMAIL=admin@agrifarm.app

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
```

**Required API accounts:**
- [ ] OpenWeatherMap (free tier: 1,000 calls/day)
- [ ] Anthropic Claude API
- [ ] OpenAI API (embeddings only — very cheap)
- [ ] Google Maps Geocoding API (or use free Nominatim)
- [ ] AWS account (S3 bucket for uploads)
- [ ] Generate VAPID keys: `npx web-push generate-vapid-keys`
