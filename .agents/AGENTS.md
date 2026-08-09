# AgriFarm AI — Agent Rules Index

**Project:** AgriFarm AI — Personalized AI Farming Assistant Platform
**Stack:** FastAPI (Python 3.11) · PostgreSQL 16 · Redis · Next.js 14 (PWA) · Google Gemini (Free)
**Current Phase:** v1.0 — Phases 0–8 (Web App + API)

All rules are split by domain. Read each file before implementing any feature in that domain.

## Rule Files

| Domain | File | Covers |
|--------|------|--------|
| Backend | [backend-rules.md](file:///c:/Users/Kajanan/Desktop/Neon%20Farming/.agents/backend-rules.md) | FastAPI, modules, async, Celery, JWT, errors |
| Database | [database-rules.md](file:///c:/Users/Kajanan/Desktop/Neon%20Farming/.agents/database-rules.md) | SQLAlchemy, models, migrations, seeding, indexes |
| AI Integration | [ai-rules.md](file:///c:/Users/Kajanan/Desktop/Neon%20Farming/.agents/ai-rules.md) | Zero-cost policy, Gemini, flattened context, fallbacks |
| Frontend | [frontend-rules.md](file:///c:/Users/Kajanan/Desktop/Neon%20Farming/.agents/frontend-rules.md) | Next.js 14, components, state, PWA, offline |
| Business Logic | [business-rules.md](file:///c:/Users/Kajanan/Desktop/Neon%20Farming/.agents/business-rules.md) | Planner engine, weather rules, soil calc, disease matching |
| Development Phases | [phase-rules.md](file:///c:/Users/Kajanan/Desktop/Neon%20Farming/.agents/phase-rules.md) | What is built, what is NOT yet built, completion status |

## Single Most Important Rule
**80% of all logic must be deterministic Python code. AI (Gemini) is a last resort only.**
