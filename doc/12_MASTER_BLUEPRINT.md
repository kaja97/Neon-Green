# AgriFarm AI — Master Implementation Blueprint

This document serves as the **Enhanced Master Blueprint** for the AgriFarm AI ecosystem. It synthesizes the database models, microservices architecture, AI integrations, and marketplace ecosystem into a rigorous, step-by-step guide optimized for AI-assisted code generation.

---

## 1. Architecture & Tech Stack

### Deep Architecture Pattern
The project uses a **Modular Monolith** pattern that can easily scale into microservices. 
- **API Gateway (NGINX/FastAPI):** Handles JWT validation, rate limiting, and routing.
- **Service Layer (FastAPI):** Isolated domains (Auth, Projects, Weather, Market, AI, Marketplace).
- **Data Layer (PostgreSQL 16):** Single DB with bounded contexts (logical separation of tables by domain). Uses `pgvector` for AI embeddings and `pg_trgm` for fuzzy search.
- **Async Workers (Celery + Redis):** Handles heavy tasks (Life Cycle generation, RAG chunking, Weather polling).
- **Client (Next.js PWA):** Mobile-first, offline-capable frontend.

### Ideal Tech Stack & Libraries
* **Backend:**
  - Framework: `FastAPI` (Python 3.11+)
  - ORM: `SQLAlchemy 2.0` (async engine) + `Alembic` (migrations)
  - Validation: `Pydantic v2`
  - Background Tasks: `Celery` with `Redis` broker
  - AI/RAG: `LangChain` (for chunking), `mcp` (Model Context Protocol), `anthropic`, `openai` (for embeddings)
* **Frontend:**
  - Framework: `Next.js 14` (App Router)
  - Language: `TypeScript`
  - Styling: `Tailwind CSS` + `shadcn/ui`
  - State & Data Fetching: `Zustand` (client state) + `@tanstack/react-query` (server state/caching)
  - Charts: `Recharts`
  - PWA: `next-pwa`
* **Infrastructure:**
  - Deployment: `Docker` + `Docker Compose`
  - Cloud Storage: `AWS S3` or `MinIO` (for image uploads)
  - CI/CD: `GitHub Actions`

---

## 2. Phased Implementation Roadmap

### Phase 1: Core Foundation & MVP (Weeks 1-4)
* **Milestone 1.1:** Setup Docker, PostgreSQL, Redis, and FastAPI boilerplate.
* **Milestone 1.2:** Database schema migrations using Alembic (Auth, Profiles, Plants, Master Data). Seed the database with 8 priority crops.
* **Milestone 1.3:** Build Universal Identity (Auth Service). JWT login, Registration for Farmer profiles.
* **Milestone 1.4:** Build Project CRUD. A farmer can create a project linked to a piece of land and a crop.

### Phase 2: Intelligence & Guidance Engine (Weeks 5-8)
* **Milestone 2.1:** Implement the Activity Planner (Deterministic Engine). Generate a 90-day task list based on planting date and plant stages.
* **Milestone 2.2:** Build the Next.js Frontend Shell. Mobile layout, Bottom Nav, Project Dashboard, and the visual "Farming Circle".
* **Milestone 2.3:** Implement OpenWeatherMap API integration. Build Celery jobs to fetch weather and adjust daily activities (e.g., skip watering if raining).

### Phase 3: Diagnostic & Analytical Systems (Weeks 9-11)
* **Milestone 3.1:** Soil Analysis Service. Algorithms to compute nutrient gaps and recommend specific fertilizers.
* **Milestone 3.2:** Disease & Pest Matching Engine. Keyword-based symptom matching mapped to organic/conventional solutions.
* **Milestone 3.3:** Market Prices. Web scraping or API integration for crop prices, computing 30-day trends.

### Phase 4: AI & RAG Ecosystem (Weeks 12-14)
* **Milestone 4.1:** RAG Ingestion Pipeline. Celery tasks to chunk and embed project history, soil tests, and plant data into `pgvector`.
* **Milestone 4.2:** Build the FarmerMCPServer. Expose weather, tasks, and market tools to the LLM.
* **Milestone 4.3:** AI Chat Interface in Next.js. Implement the intent classifier to route deterministic queries away from the LLM to save costs.

### Phase 5: B2B/B2C Marketplace Ecosystem (Weeks 15-17)
* **Milestone 5.1:** Identity Expansion. Add Vendor and Buyer profiles linked to the core Account.
* **Milestone 5.2:** Agri-Input Market. Allow vendors to list fertilizers/tools. Buyers/Farmers can purchase.
* **Milestone 5.3:** Harvest Market. Farmers convert completed projects into `HarvestListings`, linking crop provenance (RAG history) for premium pricing.

### Phase 6: Scaling & Hardening (Week 18+)
* **Milestone 6.1:** Offline PWA implementation (service workers caching daily tasks).
* **Milestone 6.2:** Comprehensive E2E Testing and CI/CD pipelines.

---

## 3. Detailed Component Breakdown

### A. Activity Planner Engine (Deterministic)
* **Logic:** Triggered on Project Creation. Queries `plant_stages`, `plant_water_requirements`, and `plant_fertilizer_recommendations`.
* **Input:** `project_id`, `planting_date`, `area`, `farming_method_id`.
* **Output:** Bulk insert 50-100 `farming_activities` into the DB.
* **Error Handling:** If `plant_id` is missing stage data, fallback to generic 3-stage crop template. Log warning to Sentry.

### B. Weather Adjustment Job (Celery Beat)
* **Logic:** Runs at 5:00 AM daily. Fetches 5-day forecast. Evaluates `farming_activities` for today and tomorrow.
* **Input:** Active `location` coordinates.
* **Output:** Updates `activity.status = 'skipped'` or `'rescheduled'`. Creates `weather_alerts`.
* **Error Handling:** If Weather API times out, fallback to Redis cache. If cache expired, do NOT skip any watering tasks (fail safe = overwater rather than drought).

### C. Disease Matching Engine
* **Logic:** Farmer submits symptoms and affected parts. Uses Postgres `to_tsvector` for keyword matching against `plant_diseases`.
* **Input:** `plant_id`, `symptoms_text`, `affected_parts_list`.
* **Output:** Matched disease IDs, confidence score, and associated solutions (filtered by project's farming method).
* **Error Handling:** If no DB match > 60% confidence, route text and images to Claude LLM for fallback analysis.

### D. Marketplace Transaction Engine
* **Logic:** Handles orders bridging profiles. Deducts `stock_quantity` or `yield_amount`.
* **Input:** `buyer_id`, `items` (listing_ids, quantities).
* **Output:** Generated `Order` and `OrderItem` records.
* **Error Handling:** Concurrency issues (two buyers purchasing last stock). Must use SQL `SELECT ... FOR UPDATE` (row-level locking) when checking and updating quantities.

---

## 4. Edge Cases & Error Handling

| Component | Potential Failure Point | Explicit Recovery Protocol |
|-----------|-------------------------|---------------------------|
| **Auth/Identity** | Duplicate phone/email during registration | Return generic 400. Suggest login or password reset. |
| **Weather API** | Rate limiting (1000 calls/day exceeded) | Backoff algorithm. Serve last known Redis cache. Warn UI: "Weather data is 12h old". |
| **LLM / AI Chat** | Hallucinations on chemical dosages | **CRITICAL:** System prompt STRICTLY dictates pulling dosages only from MCP Tools. UI disclaimer on all AI advice. |
| **RAG Embedding** | OpenAI API timeout during chunking | Celery task exponential backoff (`max_retries=5`). Mark document status as `indexing_failed`. |
| **Marketplace** | Farmer sells harvest that is still marked "Active" | Block listing. Require project status = `Harvested` before `HarvestListing` can be created. |
| **Offline UI** | Farmer marks task done without internet | Zustand stores mutation locally. React Query syncs to backend upon network reconnection using background sync API. |

---

## 5. Verification & Testing Plan

### A. Unit Testing (`pytest`)
* **Focus:** Deterministic engines.
* **Test Cases:**
  - Mock a 1-acre tomato farm. Run Activity Planner. Assert exact number of watering and fertilizing tasks are generated.
  - Test the Soil Analysis logic: Input pH 5.5, assert output recommends exact kg of lime.
  - Test Intent Classifier: Pass string "What is the price of tomatoes", assert routing bypasses LLM.

### B. Integration Testing (`pytest` + `testcontainers`)
* **Focus:** Database constraints and API routing.
* **Test Cases:**
  - Attempt to delete a Farmer Profile. Assert Cascade Delete removes all associated Projects and Activities.
  - Marketplace concurrency: Simulate 3 concurrent API calls buying the same `HarvestListing`. Assert only 1 succeeds, others receive 409 Conflict.

### C. AI / RAG Testing
* **Focus:** Retrieval accuracy and cost control.
* **Test Cases:**
  - Create a golden dataset of 50 farmer questions.
  - Run retrieval pipeline. Assert top-3 chunks contain the actual answer 95% of the time.
  - Assert the MCP Server correctly blocks queries exceeding the `DAILY_TOKEN_LIMIT`.

### D. E2E Testing (`Playwright`)
* **Focus:** Critical User Journeys (CUJs).
* **Test Cases:**
  1. Registration -> Add Land -> Create Project -> View Dashboard.
  2. View Dashboard -> Tap Activity -> Mark as Done -> Verify Progress Ring updates.
  3. Switch Profile to Buyer -> Browse Harvests -> Add to Cart -> Checkout.
