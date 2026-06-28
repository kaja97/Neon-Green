# AgriFarm AI — System Architecture

## Architecture Pattern: Microservices with API Gateway

All backend services are individual **FastAPI** applications. The API Gateway is the single entry point for the frontend.

---

## High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14 PWA)                     │
│            Mobile-first · TypeScript · Tailwind CSS             │
└─────────────────────────────┬────────────────────────────────────┘
                              │ HTTPS / REST
┌─────────────────────────────▼────────────────────────────────────┐
│              API GATEWAY  (FastAPI + Nginx)                      │
│         Rate Limiting · JWT Auth Middleware · Routing            │
└──┬───────┬──────┬──────┬──────┬──────┬──────┬──────┬────────────┘
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
                    │  Primary database  │
                    └─────────┬──────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
         [RAG Service]   [MCP Server]   [AI Assistant]
              │               │               │
         [pgvector]     [Tool Router]   [Claude API]
         [Embeddings]         │         [Anthropic]
                         [All services]
```

---

## Service Directory

| # | Service | Port | Purpose |
|---|---------|------|---------|
| 1 | Auth Service | 8001 | Register, login, JWT tokens |
| 2 | Farmer Service | 8002 | Profile, locations, land, livestock |
| 3 | Project Service | 8003 | Project CRUD, dashboard aggregation |
| 4 | Weather Service | 8004 | Weather fetch, cache, farm actions |
| 5 | Soil Service | 8005 | Soil test analysis, recommendations |
| 6 | Activity Planner | 8006 | Full-season plan generation, daily tasks |
| 7 | Disease Service | 8007 | Disease/pest lookup, diagnosis, solutions |
| 8 | Market Service | 8008 | Crop price data, trends, alerts |
| 9 | RAG Service | 8009 | Knowledge base ingestion and retrieval |
| 10 | MCP Server | 8010 | Per-farmer tool routing for LLM |
| 11 | AI Assistant | 8011 | Chat, diagnosis, summaries via LLM |
| 12 | Notification Service | 8012 | Push notifications, Celery Beat jobs |

---

## Technology Stack

### Frontend
| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | Next.js 14 (App Router) | SSR, routing, PWA support |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS + shadcn/ui | Rapid UI, accessible components |
| Charts | Recharts + D3.js | Farming circle, weather charts, radar charts |
| State | Zustand + React Query (TanStack) | Server + client state separation |
| Maps | Leaflet.js | Farm location picker |
| PWA | next-pwa | Offline daily plan, home screen install |
| Forms | React Hook Form + Zod | Validated, type-safe forms |
| Notifications | Web Push API + Service Worker | Push notifications for daily tasks |

### Backend
| Technology | Usage |
|-----------|-------|
| FastAPI (Python) | All 12 microservices |
| SQLAlchemy + asyncpg | Async ORM for PostgreSQL |
| Pydantic v2 | Request/response validation |
| Celery + Redis | Background tasks, scheduled jobs |
| LangChain | RAG pipeline, chunking, embedding |
| Anthropic SDK | Claude API calls |

### Data Layer
| Technology | Purpose |
|-----------|---------|
| PostgreSQL 16 | Primary relational database |
| pgvector extension | Vector embeddings for RAG (same DB, no extra service) |
| Redis 7 | Weather cache, session cache, Celery queue |
| AWS S3 / Cloudflare R2 | Soil report PDFs, farmer profile images |

### AI Layer
| Component | Technology |
|-----------|-----------|
| LLM | Anthropic Claude (claude-sonnet-4-6) |
| Embeddings | OpenAI text-embedding-3-small (1536 dims) |
| RAG Framework | LangChain + custom pgvector retriever |
| MCP Protocol | Anthropic MCP Python SDK |

### Infrastructure
| Component | Technology |
|-----------|-----------|
| Local Dev | Docker Compose |
| Production | Kubernetes (AWS/GCP) |
| CI/CD | GitHub Actions |
| Monitoring | Prometheus + Grafana |
| Logging | Structured JSON → CloudWatch |
| Error Tracking | Sentry (frontend) |

---

## Background Job Schedule (Celery Beat)

| Time | Task | Purpose |
|------|------|---------|
| 05:00 AM daily | `send_daily_activity_notifications` | Generate and push today's task reminders |
| 05:30 AM daily | `adjust_plan_for_weather` | Re-adjust activities based on fresh weather data |
| Every 3 hours | `refresh_weather_cache` | Fetch new weather for all active project locations |
| Every 6 hours | `check_weather_alerts` | Detect storms, frost, drought — push alerts |
| Every day | `compute_market_trends` | Compute price trend direction |
| Every Sunday | `weekly_market_rag_update` | Update market price RAG docs for all farmers |
| Every Monday | `weekly_disease_risk_update` | Recompute disease risk calendars based on upcoming weather |

---

## Communication Patterns

### Synchronous (Frontend → API Gateway → Service)
- All user-facing requests
- Response time target: < 200ms for non-AI endpoints

### Asynchronous (Background Jobs via Celery)
- Activity plan generation (on project create)
- RAG document ingestion (on soil test, activity complete, issue resolve)
- Weather cache refresh
- Notification dispatch

### Event Triggers
| Trigger Event | Background Job Started |
|--------------|----------------------|
| Project created | `generate_season_plan`, `seed_rag_documents` |
| Soil test submitted | `compute_soil_recommendations`, `update_soil_rag_doc` |
| Activity marked done | `update_activity_rag_doc` |
| Issue reported + resolved | `update_issue_rag_doc` |
| Market data fetched | `compute_market_trends` |

---

## External API Dependencies

| API | Purpose | Fallback |
|-----|---------|---------|
| OpenWeatherMap / Tomorrow.io | 5-day weather by lat/lng | Cached data |
| Anthropic Claude API | LLM for AI assistant | Deterministic fallback |
| OpenAI Embeddings API | text-embedding-3-small | Voyage AI |
| Google Maps / Nominatim | Geocoding address → lat/lng | Manual coordinate entry |
| Sri Lanka Agri Market API | Crop price feeds | Admin manual entry |
| Web Push VAPID | Browser push notifications | In-app only |

---

## Security Architecture

| Layer | Mechanism |
|-------|----------|
| Auth | JWT (RS256, 15-min access, 30-day refresh in Redis) |
| API Rate Limiting | Nginx: 100 req/min per IP, 20 AI calls/day per farmer |
| Database | Parameterized queries (SQLAlchemy), no raw SQL |
| File Uploads | Image-only validation, max 5MB, stored in S3 |
| Passwords | bcrypt hashing |
| AI Budget Guard | Daily token limit per farmer (50,000 tokens/day) |
