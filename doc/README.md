# AgriFarm AI — Documentation Index

> **Project:** AgriFarm AI — Personalized AI Farming Assistant Platform
> **Type:** Web Application (Mobile-First PWA) → Future: Flutter Mobile + Desktop
> **Stack:** Next.js 14 · FastAPI · PostgreSQL · Redis · Google Gemini AI (Free)
> **AI Cost:** $0.00 per farmer per month

---

## 📁 Document Structure

| File | Purpose |
|------|---------|
| [`01_PROJECT_OVERVIEW.md`](./01_PROJECT_OVERVIEW.md) | Vision, goals, user flow, AI cost strategy, multi-platform plan |
| [`02_SYSTEM_ARCHITECTURE.md`](./02_SYSTEM_ARCHITECTURE.md) | Modular monolith architecture, tech stack, AI integration pipeline |
| [`03_DATABASE_MODEL.md`](./03_DATABASE_MODEL.md) | Complete table model with relationships, indexes, ER diagram |
| [`04_API_CONTRACT.md`](./04_API_CONTRACT.md) | All REST API endpoints, request/response shapes, auth rules |
| [`05_BACKEND_SERVICES.md`](./05_BACKEND_SERVICES.md) | All service modules — purpose, logic, endpoints, code patterns |
| [`06_FRONTEND_PLAN.md`](./06_FRONTEND_PLAN.md) | Pages, components, state management, UI wireframes, PWA config |
| [`07_AI_RAG_MCP.md`](./07_AI_RAG_MCP.md) | Free Gemini AI strategy, flattened context approach, future RAG/MCP |
| [`08_LIFE_CYCLE_GUIDE.md`](./08_LIFE_CYCLE_GUIDE.md) | Farming Circle, season plan generation, daily guidance engine |
| [`09_IMPLEMENTATION_ROADMAP.md`](./09_IMPLEMENTATION_ROADMAP.md) | Phase 0-8 build plan (~14 weeks), environment setup, env vars |
| [`10_DATA_SEED_GUIDE.md`](./10_DATA_SEED_GUIDE.md) | Master data seeding — crops, stages, nutrients, diseases, solutions |
| [`11_MARKETPLACE_EXTENSION.md`](./11_MARKETPLACE_EXTENSION.md) | Future v2.0: B2B & B2C Marketplace, Universal Identity |
| [`12_MASTER_BLUEPRINT.md`](./12_MASTER_BLUEPRINT.md) | ADRs, edge cases, error handling, testing strategy, performance |
| [`13_FOLDER_STRUCTURE.md`](./13_FOLDER_STRUCTURE.md) | Codebase folder structure, Docker Compose, Makefile, env template |
| [`14_REVENUE_HARVEST.md`](./14_REVENUE_HARVEST.md) | Revenue calculator, harvest management, yield tracking |
| [`15_NOTIFICATIONS_OFFLINE.md`](./15_NOTIFICATIONS_OFFLINE.md) | Smart notification routing, offline-first PWA, mutation queue |

---

## 🚀 Quick Start Reading Order

1. **`01_PROJECT_OVERVIEW.md`** — Understand the vision and AI cost strategy
2. **`03_DATABASE_MODEL.md`** — The data model is the foundation of everything
3. **`08_LIFE_CYCLE_GUIDE.md`** — Understand the core farming lifecycle concept
4. **`07_AI_RAG_MCP.md`** — How free Google Gemini AI integrates via flattened context
5. **`05_BACKEND_SERVICES.md`** — How each backend module works
6. **`04_API_CONTRACT.md`** — API shapes for frontend-backend communication
7. **`06_FRONTEND_PLAN.md`** — UI wireframes and component structure
8. **`13_FOLDER_STRUCTURE.md`** — How the codebase is organized + Docker setup
9. **`09_IMPLEMENTATION_ROADMAP.md`** — Start building (Phase 0 first!)
10. **`10_DATA_SEED_GUIDE.md`** — Seed the database with crop/disease data

---

## 🌾 Core Concept in One Line

> A farmer creates a **Project** (e.g., Tomato, 1 acre) → the system generates a **Life Cycle Plan** → guides the farmer **daily** with weather-adjusted tasks, soil advice, disease alerts, and **free AI chat** powered by Google Gemini.

---

## 💡 Key Design Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Architecture | Modular monolith | Simpler for 1-3 devs, extractable to microservices later |
| AI Provider | Google Gemini Free | $0 cost, 15 RPM, 1,500 RPD — sufficient for 100-300 farmers |
| AI Approach | Flattened context (not RAG) | Project data is ~2K tokens — fits in context directly |
| Frontend | Next.js PWA | Mobile-first, offline-capable, faster to build than native |
| Future Mobile | Flutter | Same API, native features (camera, GPS, FCM) |
| Deterministic Logic | 80% of tasks | Weather rules, soil calculator, activity planner — zero AI cost |

---

## 📊 v1.0 Scope (Current Build)

- ✅ Farmer Project Service (create project, life cycle plan, daily guidance)
- ✅ Weather integration (free OpenWeatherMap API)
- ✅ Soil analysis (deterministic nutrient calculator)
- ✅ Disease matching (keyword + AI fallback)
- ✅ Market price tracking
- ✅ Free AI chat (Google Gemini)
- ✅ Push notifications
- ✅ PWA (offline daily plan)

## 🔮 Future Scope

- 📱 Flutter mobile apps (v2.0)
- 🏪 Marketplace — vendors + harvest market (v2.0)
- 🤖 AI Agent + MCP Server (v3.0)
- 🖥️ Desktop app (v3.0)
- 🧠 Full RAG pipeline with pgvector embeddings (v3.0)
