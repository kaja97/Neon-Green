# AgriFarm AI — System Architecture

## Architecture Pattern: Modular Monolith → Future Microservices

The backend starts as a **FastAPI modular monolith** (single deployable, logically separated modules). This is cheaper and simpler to develop and deploy for v1.0. Services are structured as separate Python modules with their own routers, making future extraction into microservices trivial.

---

## High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│              FRONTEND (Current: Next.js 14 PWA)                  │
│         Future: Flutter (Android, iOS, Desktop)                  │
│         Mobile-first · TypeScript · Tailwind CSS                 │
└─────────────────────────────┬────────────────────────────────────┘
                              │ HTTPS / REST API
┌─────────────────────────────▼────────────────────────────────────┐
│              API GATEWAY  (FastAPI + Nginx)                       │
│         Rate Limiting · JWT Auth Middleware · Routing             │
└──┬───────┬──────┬──────┬──────┬──────┬──────┬──────┬─────────────┘
   │       │      │      │      │      │      │      │
   ▼       ▼      ▼      ▼      ▼      ▼      ▼      ▼
[Auth] [Farmer] [Project] [Weather] [Soil] [Planner] [Disease] [Market]
  │      │        │          │        │       │         │         │
  │      │        │      [Redis]    [NumPy] [Celery]    │         │
  │      │        │          │               │           │         │
  └──────┴────────┴──────────┴───────────────┴───────────┴─────────┘
                              │
                    ┌─────────▼──────────┐
                    │    PostgreSQL 16    │
                    │  + pgvector ext    │
                    │  + PostGIS ext     │
                    │  Primary database  │
                    └─────────┬──────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
         [AI Summary]   [Future: MCP]    [Notification]
              │               │               │
     [Google AI Studio] [Future: Agent]  [Web Push]
     [Free Gemini API]                   [Celery Beat]
     [Future: Gemma 3]
```

---

## Service Modules (FastAPI Routers)

All services live as Python modules within a single FastAPI application. Each module has its own `router.py`, `service.py`, `models.py`, and `schemas.py`.

| # | Module | Path Prefix | Purpose |
|---|--------|-------------|---------|
| 1 | Auth | `/auth` | Register, login, JWT tokens |
| 2 | Farmer | `/farmer` | Profile, locations, land, livestock |
| 3 | Project | `/projects` | Project CRUD, dashboard aggregation |
| 4 | Weather | `/weather` | Weather fetch, cache, farm actions |
| 5 | Soil | `/soil` | Soil test analysis, recommendations |
| 6 | Activity Planner | `/planner` | Full-season plan generation, daily tasks |
| 7 | Disease | `/disease`, `/issues` | Disease/pest lookup, diagnosis, solutions |
| 8 | Market | `/market` | Crop price data, trends, alerts |
| 9 | AI Summary | `/ai` | Flattened context → Google Gemini → summary |
| 10 | Notification | `/notifications` | Push notifications, Celery Beat jobs |
| **Future** | RAG Service | `/rag` | Knowledge base ingestion and retrieval |
| **Future** | MCP Server | `/mcp` | Per-farmer tool routing for AI Agent |
| **Future** | Marketplace | `/marketplace` | B2B/B2C vendor products, harvest listings |

---

## Technology Stack

### Frontend (v1.0 — Web App)
| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | Next.js 14 (App Router) | SSR, routing, PWA support |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS + shadcn/ui | Rapid UI, accessible components |
| Charts | Recharts | Farming circle, weather charts, radar charts |
| State | Zustand + React Query (TanStack) | Server + client state separation |
| Maps | Leaflet.js | Farm location picker |
| PWA | next-pwa | Offline daily plan, home screen install |
| Notifications | Web Push API + Service Worker | Push notifications for daily tasks |

### Frontend (Future — Mobile & Desktop)
| Platform | Technology | Notes |
|----------|-----------|-------|
| Android | Flutter (Dart) | Native ARM, offline-first, Hive/SQLite for local cache |
| iOS | Flutter (Dart) | Same codebase as Android |
| Desktop | Flutter Desktop | Windows + macOS from same codebase |

### Backend
| Technology | Usage |
|-----------|-------|
| FastAPI (Python 3.11+) | Modular monolith, all services |
| SQLAlchemy 2.0 + asyncpg | Async ORM for PostgreSQL |
| Alembic | Database migrations |
| Pydantic v2 | Request/response validation |
| Celery + Redis | Background tasks, scheduled jobs |
| httpx | Async HTTP client for external APIs |

### Data Layer
| Technology | Purpose |
|-----------|---------|
| PostgreSQL 16 | Primary relational database |
| PostGIS extension | Geospatial queries (farm boundaries, location-based weather) |
| pgvector extension | Future: vector embeddings for RAG |
| pg_trgm extension | Fuzzy text search for disease symptoms |
| Redis 7 | Weather cache, session cache, Celery broker |
| AWS S3 / MinIO | Soil report PDFs, farmer profile images |

### AI Layer (ZERO COST)
| Component | Technology | Cost |
|-----------|-----------|------|
| Primary LLM | Google AI Studio — Gemini 2.0 Flash | **Free** (15 RPM, 1M tokens/min) |
| Fallback LLM | Google AI Studio — Gemini 1.5 Flash | **Free** (fallback tier) |
| Small Tasks | Self-hosted Gemma 3 1B (future) | **Free** (runs on VPS) |
| Embeddings (future) | Gemini Embedding API (free tier) | **Free** |
| Intent Classifier | Regex-based Python (no AI) | **Free** |

### Infrastructure
| Component | Technology |
|-----------|-----------|
| Local Dev | Docker Compose |
| Production | VPS (DigitalOcean/Hetzner) or AWS EC2 |
| CI/CD | GitHub Actions |
| Monitoring | Prometheus + Grafana (future) |
| Logging | Structured JSON logging |

---

## AI Integration Architecture (Google AI Studio Free API)

### Data Flattening Pipeline

When a farmer requests an AI summary or asks a question, the system builds a **flattened context object** from the database:

```python
async def build_project_context(db: AsyncSession, project_id: uuid.UUID) -> str:
    """
    Flatten project state into ~2000 token JSON context string for Gemini.
    """
    project = await db.get(Project, project_id)
    plant = await db.get(Plant, project.plant_id)
    stages = await get_plant_stages(db, project.plant_id)
    days_since_planting = (date.today() - project.planting_date).days
    
    # Calculate current stage...
    # Query latest soil nutrient result...
    # Query pending activities count...

    context = {
        "crop": plant.common_name if plant else "Unknown",
        "scientific_name": plant.scientific_name if plant else None,
        "farming_method": project.farming_method,
        "area": f"{float(project.area)} {project.area_unit}",
        "planting_date": project.planting_date.isoformat(),
        "days_since_planting": days_since_planting,
        "current_stage": current_stage.stage_name if current_stage else "Unknown",
        "total_growth_days": plant.growth_duration_days if plant else 0,
        "expected_harvest": project.expected_harvest_date.isoformat() if project.expected_harvest_date else None,
        "pending_activities": pending_count,
        "soil": soil_info,
        "status": project.status
    }
    return json.dumps(context, indent=2)
```

### Google AI Studio API Call

```python
import google.generativeai as genai
import json

genai.configure(api_key=os.environ["GOOGLE_AI_STUDIO_API_KEY"])

async def get_ai_summary(project_id: str, farmer_query: str = None):
    context = await build_project_context(db, project_id)

    system_prompt = """You are a farming expert assistant for Sri Lankan farmers.
    Based on the project data provided, give a concise, actionable summary.
    Include:
    1. Current growth status and what to expect
    2. Weather outlook and impact on farming
    3. Soil/nutrient health assessment
    4. Disease or pest risks
    5. Today's priority actions
    6. Any warnings or urgent recommendations

    Keep your response under 500 words. Use simple language.
    If the farmer asked a specific question, answer it using the context provided.
    Always recommend specific quantities scaled to the farm area.
    Only recommend organic solutions if farming_method is 'organic'.
    """

    user_message = f"""
    PROJECT DATA:
    {json.dumps(context, indent=2)}

    {"FARMER QUESTION: " + farmer_query if farmer_query else "Please provide a daily summary update."}
    """

    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(
        [system_prompt, user_message],
        generation_config=genai.GenerationConfig(
            max_output_tokens=800,
            temperature=0.3
        )
    )

    return {
        "summary": response.text,
        "context_used": context,
        "model": "gemini-2.0-flash",
        "cost": 0.00
    }
```

### AI Response Processing

The system also parses the AI response to update the database:

```python
async def process_ai_response(project_id, ai_response):
    """
    Parse AI summary and create actionable database records.
    """
    # Use simple keyword extraction to identify:
    # 1. Disease warnings → create weather_alert or project_issue
    # 2. Fertilizer recommendations → update soil_recommendations
    # 3. Schedule changes → update farming_activities

    text = ai_response["summary"].lower()

    if "disease risk" in text or "fungal" in text or "blight" in text:
        create_weather_alert(project_id, "disease_risk", ai_response["summary"])

    if "nitrogen deficient" in text or "low nitrogen" in text:
        create_soil_recommendation(project_id, "nitrogen", ai_response["summary"])

    # Store the AI summary in a project_summaries table for history
    save_ai_summary(project_id, ai_response)
```

---

## Background Job Schedule (Celery Beat)

| Time | Task | Purpose |
|------|------|---------|
| 05:00 AM daily | `adjust_plan_for_weather` | Re-adjust activities based on fresh weather data |
| 05:30 AM daily | `send_daily_notifications` | Generate and push today's task reminders |
| Every 3 hours | `refresh_weather_cache` | Fetch new weather for all active project locations |
| Every 6 hours | `check_weather_alerts` | Detect storms, frost, drought — push alerts |
| Every day | `compute_market_trends` | Compute price trend direction |
| Sunday 6 AM | `generate_weekly_ai_summary` | Flatten each project → Gemini → weekly summary card |

---

## External API Dependencies

| API | Purpose | Cost | Fallback |
|-----|---------|------|----------|
| Google AI Studio (Gemini) | AI summaries, farmer Q&A | **Free** | Deterministic response |
| OpenWeatherMap (free tier) | 5-day weather by lat/lng | **Free** (1000/day) | Redis cached data |
| Nominatim (OpenStreetMap) | Geocoding address → lat/lng | **Free** | Manual coordinate entry |
| Web Push VAPID | Browser push notifications | **Free** | In-app only |

**No paid APIs are used in v1.0.** All external dependencies have free tiers sufficient for the initial user base.

---

## Security Architecture

| Layer | Mechanism |
|-------|----------|
| Auth | JWT (RS256, 15-min access, 30-day refresh in Redis) |
| API Rate Limiting | Nginx: 100 req/min per IP |
| AI Rate Limiting | 10 AI calls/day per farmer (Google free tier has 15 RPM) |
| Database | Parameterized queries (SQLAlchemy), no raw SQL |
| File Uploads | Image-only validation, max 5MB, stored in S3/MinIO |
| Passwords | bcrypt hashing |

---

## Future Architecture Evolution

```
v1.0 (Current)                    v2.0 (Future)                    v3.0 (Future)
─────────────────                 ─────────────────                 ─────────────────
Web App (Next.js)                 + Flutter Mobile                  + AI Agent
Modular Monolith                  + RAG Service (pgvector)          + MCP Server
Google Gemini Free                + Gemma 3 Self-hosted             + Marketplace
Deterministic Engine              + Vector Embeddings               + Multi-tenant
PostgreSQL + Redis                + Enhanced AI Pipeline            + Kubernetes
```
