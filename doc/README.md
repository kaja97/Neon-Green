# AgriFarm AI — Documentation Index

> **Project:** AgriFarm AI — Personalized AI Farming Assistant Platform
> **Type:** Web Application (Mobile-First PWA)
> **Stack:** Next.js 14 · FastAPI · PostgreSQL · Redis · Claude AI

---

## 📁 Document Structure

| File | Purpose |
|------|---------|
| [`01_PROJECT_OVERVIEW.md`](./01_PROJECT_OVERVIEW.md) | Vision, goals, platform flow, what makes it different |
| [`02_SYSTEM_ARCHITECTURE.md`](./02_SYSTEM_ARCHITECTURE.md) | Full architecture diagram, service map, infrastructure |
| [`03_DATABASE_MODEL.md`](./03_DATABASE_MODEL.md) | Complete table model with relationships, indexes, ER diagram |
| [`04_API_CONTRACT.md`](./04_API_CONTRACT.md) | All REST API endpoints, request/response shapes, auth rules |
| [`05_BACKEND_SERVICES.md`](./05_BACKEND_SERVICES.md) | 12 microservices — purpose, logic, endpoints, code patterns |
| [`06_FRONTEND_PLAN.md`](./06_FRONTEND_PLAN.md) | Pages, components, state, routing, UI design guide |
| [`07_AI_RAG_MCP.md`](./07_AI_RAG_MCP.md) | RAG architecture, MCP server, cost control, intent engine |
| [`08_LIFE_CYCLE_GUIDE.md`](./08_LIFE_CYCLE_GUIDE.md) | Project life cycle, daily guidance engine, stage logic |
| [`09_IMPLEMENTATION_ROADMAP.md`](./09_IMPLEMENTATION_ROADMAP.md) | Phase-by-phase build plan (17 weeks), tasks, deliverables |
| [`10_DATA_SEED_GUIDE.md`](./10_DATA_SEED_GUIDE.md) | Master data seeding — crops, stages, nutrients, diseases |
| [`11_MARKETPLACE_EXTENSION.md`](./11_MARKETPLACE_EXTENSION.md) | B2B & B2C Marketplace and Universal Identity Module |
| [`12_MASTER_BLUEPRINT.md`](./12_MASTER_BLUEPRINT.md) | Rigorous architecture, edge cases, and testing blueprint |

---

## 🚀 Quick Start Reading Order

1. Start with `01_PROJECT_OVERVIEW.md` — understand what we're building
2. Read `03_DATABASE_MODEL.md` — the data model is the foundation
3. Read `08_LIFE_CYCLE_GUIDE.md` — understand the core farming lifecycle concept
4. Read `05_BACKEND_SERVICES.md` — how each service works
5. Use `09_IMPLEMENTATION_ROADMAP.md` to plan your sprint

---

## 🌾 Core Concept in One Line

> A farmer creates a **Project** (e.g., Tomato, 1 acre) → the system generates a **Life Cycle Plan** → guides the farmer **daily** with weather-adjusted tasks, soil advice, disease alerts, and AI chat.
