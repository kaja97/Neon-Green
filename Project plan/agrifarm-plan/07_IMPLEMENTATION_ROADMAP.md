# AgriFarm AI — Implementation Roadmap

## Team Assumption: 1-3 developers (you + AI coding assistant)

---

## PHASE 0 — Setup & Seed Data (Week 1)

### Goal: Working development environment + seeded database

### Tasks
- [ ] Initialize GitHub repo (monorepo: `/backend`, `/frontend`)
- [ ] Docker Compose setup (Postgres + pgvector, Redis, backend, frontend)
- [ ] PostgreSQL schema — run all DDL from `02_DATABASE_SCHEMA.md`
- [ ] Create admin seed script for master data:
  - [ ] Add 20+ common crops to `plants` table
  - [ ] Add plant stages for each crop (6-7 stages each)
  - [ ] Add nutrient/water requirements per stage
  - [ ] Add fertilizer recommendations (organic + conventional)
  - [ ] Add common diseases and pests (50+)
  - [ ] Add solutions for each (organic + conventional)
  - [ ] Add farming methods (organic, inorganic, integrated)
- [ ] Environment variable structure (`.env.example`)
- [ ] Basic FastAPI project scaffold with folder structure
- [ ] Basic Next.js project scaffold with shadcn/ui

### Deliverable
Running `docker compose up` shows empty but functional app

---

## PHASE 1 — Auth + Farmer Profile (Week 2)

### Goal: Farmer can register, log in, set up profile

### Backend
- [ ] Auth Service: register, login, JWT, refresh, logout
- [ ] Farmer Profile Service: CRUD for profile, locations, land, livestock
- [ ] Middleware: JWT validation on all protected routes
- [ ] Input validation with Pydantic

### Frontend
- [ ] Register page (multi-step form)
- [ ] Login page
- [ ] Profile setup page
- [ ] Location add/edit (with map picker using Leaflet)
- [ ] Land details form
- [ ] Auth state in Zustand + token refresh logic

### Deliverable
Full auth flow works end-to-end. Farmer can manage their profile.

---

## PHASE 2 — Projects + Activity Planner (Weeks 3–4)

### Goal: Farmer can create a project and see a generated activity plan

### Backend
- [ ] Project Service: CRUD projects + services
- [ ] Activity Planner Service:
  - [ ] Season plan generator (deterministic)
  - [ ] Water volume calculator
  - [ ] Fertilizer schedule generator
  - [ ] Celery task for plan generation
- [ ] Plant stages API

### Frontend
- [ ] Main Dashboard (project list)
- [ ] Create Project Wizard (all 6 steps)
- [ ] Project Dashboard (basic version):
  - [ ] Farming Circle component (Recharts RadialBarChart)
  - [ ] Stage indicator
  - [ ] Activity Plan service block
- [ ] Activity Plan detail page
- [ ] Mark done / skip / reschedule activity

### Deliverable
Farmer creates a tomato project → system generates a 90-day activity plan → farmer sees today's tasks

---

## PHASE 3 — Weather Integration (Week 5)

### Goal: Weather data shown, activities adjusted by weather

### Backend
- [ ] Weather Service: fetch from OpenWeatherMap API
- [ ] Redis caching (3hr TTL)
- [ ] Weather-to-activity adjustment rules (deterministic)
- [ ] Weather alerts generator
- [ ] Celery Beat: daily weather adjustment task

### Frontend
- [ ] Weather service block on project dashboard
- [ ] Weather detail page (7-day chart)
- [ ] Activity plan: show weather-adjusted items differently
- [ ] Weather alert banners

### Deliverable
Rain tomorrow → watering activity marked "skipped (rain expected)"

---

## PHASE 4 — Soil Analysis (Week 6)

### Goal: Farmer enters soil test → gets nutrient recommendations

### Backend
- [ ] Soil Service: submit test, compute recommendations
- [ ] Nutrient gap calculator (deterministic, per crop)
- [ ] pH correction calculator
- [ ] Fertilizer adjustment based on soil results

### Frontend
- [ ] Soil service block (summary view)
- [ ] Soil detail page
- [ ] Soil test input form (manual entry)
- [ ] Nutrient radar chart (Recharts RadarChart)
- [ ] Recommendations list (prioritized cards)
- [ ] Soil test history timeline

### Deliverable
Farmer enters soil test → sees "Nitrogen is LOW — apply 15kg Urea before week 3"

---

## PHASE 5 — Disease & Pest System (Weeks 7–8)

### Goal: Disease/pest reporting, diagnosis, and solution delivery

### Backend
- [ ] Disease/Pest Service: search, match, solution fetch
- [ ] Keyword-based matcher (deterministic)
- [ ] Disease risk calendar generator
- [ ] Issue management (report, track, resolve)

### Frontend
- [ ] Disease Watch service block
- [ ] Disease detail page + risk calendar (heatmap)
- [ ] Report Issue flow (multi-step)
- [ ] Diagnosis result display
- [ ] Solution cards (organic vs conventional tabs)
- [ ] Issue history list

### Deliverable
Farmer taps "I see yellowing leaves" → system suggests 3 possible diseases → farmer picks match → sees organic + conventional solutions

---

## PHASE 6 — Market Prices (Week 9)

### Goal: Crop price tracking and alerts

### Backend
- [ ] Market Service: price storage, trend computation
- [ ] Admin endpoint to enter prices
- [ ] Trend computation (weekly Celery task)
- [ ] Revenue estimator

### Frontend
- [ ] Market service block (summary)
- [ ] Market detail page (price chart, trend)
- [ ] Revenue calculator UI
- [ ] Price alert display

### Deliverable
Farmer sees current tomato price, 30-day trend, and estimated revenue

---

## PHASE 7 — RAG System (Weeks 10–11)

### Goal: Per-farmer knowledge base built and searchable

### Backend
- [ ] RAG Service: document ingestion pipeline
- [ ] Embedding generation (OpenAI API)
- [ ] pgvector storage and retrieval
- [ ] Background indexing tasks:
  - [ ] On project create → seed plant info docs
  - [ ] On soil test → ingest soil summary
  - [ ] On activity done → log to history
  - [ ] On issue resolved → log problem + solution
  - [ ] Weekly → market + weather summaries

### Test
- [ ] Search accuracy tests against seeded data
- [ ] Token cost measurement

### Deliverable
Each farmer has a growing personal knowledge base; RAG retrieval returns relevant chunks for any farm question

---

## PHASE 8 — AI Assistant + MCP (Weeks 12–13)

### Goal: Farmer can chat with their personalized AI assistant

### Backend
- [ ] MCP Server implementation
- [ ] AI Assistant Service
- [ ] Intent classifier (deterministic pre-filter)
- [ ] System prompt builder (farmer context)
- [ ] Conversation management (history + summarization)
- [ ] Token budget guard
- [ ] AI query logging

### Frontend
- [ ] AI Chat page (bubble UI)
- [ ] AI service block (entry point)
- [ ] Suggested prompt chips
- [ ] Thinking animation
- [ ] Voice input (Web Speech API)
- [ ] Image attachment for disease diagnosis

### Deliverable
"What should I do this week with my tomato?" → AI uses RAG + weather + activity plan → gives accurate, personalized answer

---

## PHASE 9 — Notifications (Week 14)

### Goal: Farmers get daily task reminders and alerts

### Backend
- [ ] Notification Service
- [ ] Celery Beat: 5 AM daily notifications
- [ ] Push notification via Web Push API
- [ ] Deep link URL generation (scroll to service block)
- [ ] Notification preferences per farmer

### Frontend
- [ ] Notification bell + badge (TopBar)
- [ ] Notifications page
- [ ] Service Worker for Web Push
- [ ] Deep link → auto-scroll + highlight behavior
- [ ] Today's alerts bar on project dashboard

### Deliverable
Every morning at 6 AM: "Water your tomatoes today — 180L needed" notification → tap → opens project → scrolls to Activity Plan block

---

## PHASE 10 — Polish + Production (Weeks 15–16)

### Frontend Polish
- [ ] Offline mode (PWA caching)
- [ ] Loading skeletons everywhere
- [ ] Error states (empty states, retry buttons)
- [ ] Bilingual support (Sinhala)
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Mobile gestures (swipe to mark done)

### Performance
- [ ] API response time targets: <200ms for all non-AI endpoints
- [ ] Image lazy loading
- [ ] React Query prefetching for dashboard
- [ ] Postgres query optimization (EXPLAIN ANALYZE)

### Monitoring
- [ ] Prometheus metrics for each service
- [ ] Grafana dashboard (API latency, error rate, AI cost per farmer)
- [ ] Structured logging (JSON → CloudWatch)
- [ ] Sentry for frontend error tracking
- [ ] AI cost dashboard (tokens used per farmer per day)

### Security
- [ ] Rate limiting (100 req/min per IP, 20 AI calls/day per farmer)
- [ ] Input sanitization
- [ ] File upload validation (images only, max 5MB)
- [ ] HTTPS everywhere
- [ ] SQL injection prevention (all parameterized queries)

---

## PHASE 11 — Admin Panel (Week 17)

### Purpose: Content management, farmer oversight, price data entry

### Features
- [ ] Admin login (separate role)
- [ ] Plant management (add/edit crops, stages, nutrients)
- [ ] Disease/pest database management
- [ ] Market price manual entry
- [ ] Farmer overview (all accounts, activity)
- [ ] AI cost monitoring dashboard
- [ ] RAG document management

---

## Technology Setup Checklist

### External API Keys Needed
- [ ] OpenWeatherMap API key (free tier: 1000 calls/day)
- [ ] Anthropic API key (Claude)
- [ ] OpenAI API key (embeddings only)
- [ ] Google Maps API key (geocoding)
- [ ] Web Push VAPID keys (generate with `web-push generate-vapid-keys`)

### Environment Variables (`.env`)
```
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/agrifarm
REDIS_URL=redis://localhost:6379/0

# Auth
JWT_PRIVATE_KEY=...
JWT_PUBLIC_KEY=...
JWT_ACCESS_EXPIRE_MINUTES=15
JWT_REFRESH_EXPIRE_DAYS=30

# AI
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
EMBEDDING_MODEL=text-embedding-3-small

# Weather
OPENWEATHER_API_KEY=...

# Maps
GOOGLE_MAPS_API_KEY=...

# Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=agrifarm-uploads

# Push
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_EMAIL=admin@agrifarm.app
```

---

## File to Feed AI Coding Assistants

### For Cursor IDE
Feed these files in order:
1. `00_PROJECT_OVERVIEW.md` — Context
2. `01_TECH_STACK.md` — What to install
3. `02_DATABASE_SCHEMA.md` — Generate models from this
4. `03_BACKEND_SERVICES.md` — Generate service code
5. `06_API_DESIGN.md` — Generate route handlers
6. `05_FRONTEND_PLAN.md` — Generate pages and components

**Cursor Prompt:**
```
Read all the .md files in this folder. They describe a farming AI assistant platform.
Start with 02_DATABASE_SCHEMA.md and generate SQLAlchemy async models for all tables.
Use PostgreSQL with asyncpg. Include all relationships.
```

### For Claude (claude.ai)
Upload all 7 .md files and ask:
```
These files describe a farming AI platform called AgriFarm AI.
Please help me build the [specific service] service first.
Start with the database models and API routes from the schema.
```

### For GitHub Copilot
Add all .md files to `docs/` folder in your repo.
Reference them in code comments: `# See docs/03_BACKEND_SERVICES.md - SERVICE 5`
