# AgriFarm AI — AI Coding Prompts

> Feed this file to Cursor, Claude, or any AI coding assistant.
> These prompts are designed to generate production-ready code from the plan files.

---

## PROMPT 1: Generate Database Models (Start Here)

```
You are building AgriFarm AI — a personalized AI farming assistant platform.

Read the database schema in 02_DATABASE_SCHEMA.md.

Generate:
1. SQLAlchemy 2.0 async ORM models for ALL tables
2. Use UUID primary keys (Python uuid.uuid4)
3. Use async session (from sqlalchemy.ext.asyncio)
4. Add __tablename__ for each model
5. Add relationship() links matching the ERD
6. Create a base model with created_at / updated_at auto-timestamps
7. Create alembic migration script for the full schema

Tech: Python, SQLAlchemy 2.0, PostgreSQL 16, asyncpg, alembic
File structure: /backend/app/models/
```

---

## PROMPT 2: Generate Auth Service

```
You are building the Auth Service for AgriFarm AI.

From 03_BACKEND_SERVICES.md SERVICE 1 and 06_API_DESIGN.md AUTH ENDPOINTS:

Generate:
1. FastAPI router with all auth endpoints
2. JWT handling (RS256, access 15min, refresh 30 days)
3. Redis-based refresh token storage
4. bcrypt password hashing
5. Email OTP generation and Redis storage
6. Pydantic v2 request/response schemas
7. Full error handling with proper HTTP status codes

Tech: Python, FastAPI, SQLAlchemy async, Redis, python-jose, passlib[bcrypt]
File: /backend/app/routers/auth.py
```

---

## PROMPT 3: Generate Activity Planner Service

```
You are building the Activity Planner Service for AgriFarm AI.

From 03_BACKEND_SERVICES.md SERVICE 6:

Generate:
1. Season plan generator function — takes project + plant stages → returns list of activities
2. Water volume calculator (mm/day × area → liters)
3. Fertilizer schedule generator (from plant_fertilizer_recommendations table)
4. Weather adjustment function (if rainfall > 10mm → skip watering)
5. FastAPI endpoints: generate plan, get today, get week, mark done
6. Celery task for background plan generation
7. Celery Beat task for daily weather adjustment at 5 AM

Rules:
- All calculation must be deterministic (no LLM calls)
- Scale quantities by project.area and project.plant_count
- Include all activity detail params (liters, product name, dosage)

Tech: Python, FastAPI, SQLAlchemy async, Celery, Redis
```

---

## PROMPT 4: Generate RAG Service

```
You are building the RAG Service for AgriFarm AI.

From 04_RAG_MCP_STRATEGY.md:

Generate:
1. Document ingestion pipeline (chunk → embed → store in pgvector)
2. Text splitter (500 token chunks, 50 overlap)
3. OpenAI embedding call (text-embedding-3-small, 1536 dims)
4. pgvector cosine similarity search with farmer_id filter
5. Smart retrieval with intent-based document type filtering
6. FastAPI endpoints: ingest, search, status
7. Celery tasks: auto-ingest on project create, soil test, activity done

Use:
- langchain.text_splitter.RecursiveCharacterTextSplitter
- openai.AsyncOpenAI for embeddings
- Raw asyncpg for pgvector queries (SQLAlchemy doesn't support vector well)

File: /backend/app/services/rag_service.py
```

---

## PROMPT 5: Generate Soil Analysis Service

```
You are building the Soil Analysis Service for AgriFarm AI.

From 03_BACKEND_SERVICES.md SERVICE 5:

Generate:
1. Optimal soil ranges dictionary (per crop, per nutrient)
2. analyze_soil() function:
   - pH correction (lime/sulfur calculation)
   - N/P/K gap calculation
   - Organic matter assessment
   - Recommend products based on farming_method (organic vs conventional)
   - Return prioritized SoilRecommendation list
3. adjust_qty_for_area() helper
4. FastAPI endpoints from 06_API_DESIGN.md SOIL ENDPOINTS

Nutrient formulas:
- Lime needed (kg/acre) = (target_ph - actual_ph) × 1500 (general approximation)
- Nitrogen supplement = (gap_ppm / optimal_ppm) × base_nitrogen_kg_per_acre

Tech: Python, FastAPI, NumPy (for calculations), SQLAlchemy async
```

---

## PROMPT 6: Generate Weather Service

```
You are building the Weather Service for AgriFarm AI.

From 03_BACKEND_SERVICES.md SERVICE 4:

Generate:
1. OpenWeatherMap API client (fetch 5-day forecast by lat/lng)
2. Redis caching decorator (3hr TTL, cache key = lat_lng rounded to 3 decimals)
3. Store in weather_cache table
4. generate_weather_actions() deterministic rule engine:
   - rainfall > 5mm → skip_watering
   - rainfall > 20mm + organic farming → check_drainage
   - humidity > 85% + temp > 28°C → fungal_risk_warning
   - wind > 20kmh → delay_spraying
5. Weather alert generator
6. FastAPI endpoints from 06_API_DESIGN.md WEATHER ENDPOINTS
7. Celery Beat: refresh weather every 3 hours for active projects

Tech: Python, FastAPI, httpx (async HTTP), Redis, Celery
```

---

## PROMPT 7: Generate Disease Service

```
You are building the Disease & Pest Service for AgriFarm AI.

From 03_BACKEND_SERVICES.md SERVICE 7:

Generate:
1. Keyword-based matcher: search plant_diseases by symptoms text overlap
2. Confidence scoring (0.0 to 1.0 based on matching keywords)
3. If confidence < 0.6 → call LLM (Claude) with context
4. Disease risk calendar generator (cross-ref plant stages + weather conditions)
5. Solution fetcher filtered by farming_method_id
6. Issue report handler (save to project_issues table)
7. FastAPI endpoints from 06_API_DESIGN.md DISEASE ENDPOINTS
8. PostgreSQL full-text search for disease lookup

LLM call format:
- System: You are an expert plant disease diagnostician
- User: Plant: {plant}, Stage: {stage}, Symptoms: {description}, Affected parts: {parts}
- Expected JSON: { matched_disease: string, confidence: float, explanation: string }

Tech: Python, FastAPI, SQLAlchemy async, Anthropic SDK
```

---

## PROMPT 8: Generate MCP Server + AI Chat

```
You are building the MCP Server and AI Assistant for AgriFarm AI.

From 04_RAG_MCP_STRATEGY.md and 03_BACKEND_SERVICES.md SERVICE 10 + 11:

Generate:
1. FarmerMCPServer class with all tools registered:
   - get_current_weather(project_id)
   - get_todays_activities(project_id)
   - get_soil_status(project_id)
   - search_knowledge(query)
   - get_disease_solutions(disease_name, farming_method)
   - get_market_prices()
   - save_note(note)
2. build_system_prompt() function using farmer profile + project context
3. process_farmer_chat() function:
   - Run intent classifier first (deterministic)
   - If deterministic answer → return without LLM
   - Else → retrieve RAG context → call Claude with MCP tools
4. Conversation management (history + token-based trimming)
5. Token budget guard (50k tokens/farmer/day)
6. FastAPI endpoints from 06_API_DESIGN.md AI CHAT ENDPOINTS
7. AI query logging to ai_query_logs table

Tech: Python, FastAPI, Anthropic SDK (claude-sonnet-4-6), MCP Python SDK
```

---

## PROMPT 9: Generate Next.js Project Dashboard

```
You are building the Project Dashboard page for AgriFarm AI.

From 05_FRONTEND_PLAN.md PAGE 4:

Generate:
1. /app/(app)/projects/[id]/page.tsx — main project dashboard
2. FarmingCircle component (Recharts RadialBarChart showing plant stages as arcs)
3. TodayAlerts component (urgent activity cards at top)
4. ServiceBlockList component (weather, soil, plan, disease, market, ai blocks)
5. Each ServiceBlock is a card with:
   - Colored left border (each service has a color)
   - Summary data
   - Expand link → /projects/[id]/[service]
   - Animated highlight when navigated to from notification
6. Deep link handling: parse ?scroll= and ?highlight= URL params
7. React Query hooks for all data fetching
8. Loading skeleton states

Tech: Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, Recharts, TanStack Query
```

---

## PROMPT 10: Generate Notification System

```
You are building the Notification System for AgriFarm AI.

From 03_BACKEND_SERVICES.md SERVICE 12:

Generate:
1. Backend notification service with push + in-app notifications
2. Celery Beat task: every day 5 AM → create activity notifications
3. Web Push setup (VAPID keys, pywebpush library)
4. Deep link URL builder: /projects/{id}?scroll={service}&highlight={item_id}
5. Frontend Service Worker for Web Push (public/sw.js)
6. NotificationBell component (bell icon + unread badge)
7. Notifications page with grouping (Today / Yesterday / Earlier)
8. Notification card with deep-link navigation
9. Mark read / mark all read

Tech backend: Python, FastAPI, Celery, pywebpush
Tech frontend: Next.js, TypeScript, Web Push API, Service Worker
```

---

## HOW TO USE THESE PROMPTS

### In Cursor IDE
1. Open the project folder
2. Press `Cmd+K` or `Ctrl+K` to open AI panel
3. Paste the prompt + reference the .md files in your project
4. Cursor will generate code in context of your existing files

### In Claude (claude.ai)
1. Upload all .md files from this plan folder
2. Paste the prompt you want
3. Claude will generate code consistent with the full plan

### In ChatGPT / Copilot
Same approach — paste plan context + specific prompt

### Recommended Build Order
Start with: Prompt 1 → Prompt 2 → Prompt 3 → Prompt 6 → Prompt 5 → Prompt 7 → Prompt 4 → Prompt 8 → Prompt 9 → Prompt 10
(Database first, then services without AI, then AI last)
