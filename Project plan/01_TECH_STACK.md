# AgriFarm AI — Technology Stack

## Decision Philosophy
- **PostgreSQL** for relational data (accounts, projects, plants, schedules) — structured, reliable, joins work well
- **pgvector** extension on PostgreSQL for RAG embeddings — avoids a separate vector DB service
- **FastAPI (Python)** for backend — best AI/ML library support, async, fast
- **Next.js 14** for frontend — App Router, SSR, mobile-first, PWA support
- **Redis** for caching and job queues — weather cache, notification queue
- **Celery** for background task workers — activity plan generation, RAG indexing

---

## Full Stack

### Frontend
| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | Next.js 14 (App Router) | SSR, file-based routing, PWA support |
| Language | TypeScript | Type safety across the full stack |
| Styling | Tailwind CSS + shadcn/ui | Rapid UI, accessible components |
| Charts/Viz | Recharts + D3.js | Farming circle, activity timeline, weather charts |
| State | Zustand + React Query (TanStack) | Server state + client state separation |
| Maps | Leaflet.js / MapLibre | Farm location, field mapping |
| PWA | next-pwa | Offline support, mobile home screen install |
| Forms | React Hook Form + Zod | Validation, type-safe forms |
| Notifications | Web Push API + Service Worker | Push notifications for daily tasks |

### Backend (Microservices in Python FastAPI)
| Service | Technology | Reason |
|---------|-----------|--------|
| API Gateway | FastAPI + Nginx | Single entry, rate limiting, auth middleware |
| Auth Service | FastAPI + JWT + bcrypt | Stateless auth |
| Core API | FastAPI | Farmers, projects, CRUD |
| Weather Service | FastAPI + httpx | Fetches OpenWeatherMap/Tomorrow.io |
| Soil Service | FastAPI + NumPy | Nutrient calculations, deterministic |
| Activity Planner | FastAPI + Celery | Schedule generation, rule engine |
| Disease/Pest Service | FastAPI | Lookup + LLM-enhanced diagnosis |
| Market Service | FastAPI + httpx | Price scraping/API |
| RAG Service | FastAPI + LangChain | Embedding, chunking, retrieval |
| MCP Server | Python MCP SDK | Per-farmer tool routing |
| AI Assistant | FastAPI + Anthropic SDK | LLM orchestration |
| Notification Service | FastAPI + Celery Beat | Scheduled push notifications |

### Data Layer
| Purpose | Technology | Reason |
|---------|-----------|--------|
| Primary Database | PostgreSQL 16 | Relational, ACID, pgvector support |
| Vector Embeddings | pgvector (PostgreSQL extension) | Same DB, no extra service |
| Cache | Redis 7 | Weather cache, session cache, queues |
| Task Queue | Celery + Redis | Background jobs, scheduled tasks |
| File Storage | AWS S3 / Cloudflare R2 | Soil reports, profile images |
| Search | PostgreSQL Full-Text Search | Plant/disease lookup |

### AI Layer
| Component | Technology | Reason |
|-----------|-----------|--------|
| LLM | Anthropic Claude API (claude-sonnet-4-6) | Best reasoning, structured output |
| Embeddings | text-embedding-3-small (OpenAI) or Voyage AI | Fast, cheap, good quality |
| RAG Framework | LangChain + custom retriever | Flexible retrieval pipeline |
| MCP Protocol | Anthropic MCP Python SDK | Standard protocol, tool routing |

### Infrastructure
| Component | Technology | Reason |
|-----------|-----------|--------|
| Container | Docker + Docker Compose | Local dev, consistent environments |
| Orchestration | Kubernetes (production) | Scale individual services |
| CI/CD | GitHub Actions | Automated testing and deployment |
| Cloud | AWS or GCP | S3, RDS, ElastiCache |
| Monitoring | Prometheus + Grafana | Service health, AI cost tracking |
| Logging | Structured JSON logs → CloudWatch | Centralized logging |

### External APIs
| API | Purpose |
|-----|---------|
| OpenWeatherMap / Tomorrow.io | 5-day weather forecast by lat/lng |
| Google Maps / Nominatim | Geocoding addresses to lat/lng |
| Agri market APIs (local) | Crop price feeds |
| WhatsApp Business API | Optional: send daily task alerts via WhatsApp |

---

## Architecture Pattern

```
[Next.js Frontend]
        ↓ HTTPS
[API Gateway (FastAPI + Nginx)]
        ↓
[Auth Middleware (JWT validation)]
        ↓
   ┌────┴────┐
   │  Core   │  ← PostgreSQL (accounts, projects, plants)
   │   API   │
   └────┬────┘
        │
   ┌────┼─────────────────────────────────┐
   │    │                                 │
[Weather  [Soil       [Activity        [RAG
Service]   Service]    Planner]         Service]
   │         │            │                │
   │      [NumPy]    [Celery Worker]   [pgvector]
   │                      │                │
[Redis Cache]         [PostgreSQL]    [Claude Embeddings]
                           │
                    [MCP Server Layer]
                           │
                    [AI Assistant Service]
                           │
                    [Claude API (LLM)]
```

---

## Cost Management Strategy

### AI Token Budget Per Farmer Per Month (Estimate)
| Trigger | Frequency | Tokens | Cost |
|---------|-----------|--------|------|
| Daily activity plan refresh | Daily × 30 | 0 (deterministic) | $0 |
| Weather-adjusted plan | Daily × 30 | 0 (rule-based) | $0 |
| Disease diagnosis | ~2/month | ~2,000 each | ~$0.02 |
| AI chat session | ~5/month | ~3,000 each | ~$0.075 |
| Monthly summary generation | 1/month | ~1,500 | ~$0.0075 |
| **Total per farmer/month** | | | **~$0.10** |

This makes the platform viable at scale. **Never call LLM for scheduled/routine tasks.**

---

## Development Environment Setup
```bash
# Backend
python -m venv venv
pip install fastapi uvicorn sqlalchemy asyncpg redis celery langchain anthropic

# Frontend
npx create-next-app@latest agrifarm-ui --typescript --tailwind --app
cd agrifarm-ui && npm install zustand @tanstack/react-query recharts leaflet

# Database
docker run -d --name agrifarm-db \
  -e POSTGRES_PASSWORD=secret \
  -p 5432:5432 \
  pgvector/pgvector:pg16

# Redis
docker run -d --name agrifarm-redis -p 6379:6379 redis:7
```
