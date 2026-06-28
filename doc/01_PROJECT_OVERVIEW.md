# AgriFarm AI — Project Overview & Vision

## Project Name
**AgriFarm AI** — Personalized AI Farming Assistant Platform

---

## Problem Statement

Generic farming advice fails real farmers. A farmer in the dry north needs different guidance than one in the wet south. Soil pH, crop type, farming method (organic vs conventional), local market prices, upcoming rain — all these factors must be combined to give **accurate, actionable, personalized daily guidance**.

Most farming apps give static calendars or generic tips. AgriFarm AI gives each farmer their own **intelligent assistant** that knows their specific land, soil, crop stage, and local weather.

---

## What We Are Building

A web platform where every farmer gets their own personalized AI assistant powered by:

- A **RAG (Retrieval-Augmented Generation)** model built from their specific farm data
- A **per-farmer MCP (Model Context Protocol)** server that routes context intelligently
- **Deterministic rule-based services** for routine tasks (weather planning, fertilizer scheduling, soil analysis) — keeps AI costs near zero for daily operations
- **LLM invoked only** when true intelligence is needed: complex queries, disease diagnosis, personalized guidance

---

## Core User Flow

```
Farmer Registers
  → Creates Profile (name, location, farming experience, farming method)
  → Adds Location(s) with GPS coordinates
  → Adds Land Details (area, soil type, water source)
  → Creates a Project:
      - Selects Crop (from master plant catalogue)
      - Sets Area (e.g., 1 acre)
      - Sets Planting Date
      - Selects Farming Method (organic / conventional / integrated)
      - Enables Services (weather, soil, activity plan, disease watch, market, AI)

  → System Automatically Generates:
      ┌─────────────────────────────────────────────┐
      │  Life Cycle Plan (full-season activity plan) │
      │  - Stage-by-stage breakdown                 │
      │  - Daily watering schedule                  │
      │  - Fertilizer schedule (by stage)           │
      │  - Disease watch calendar                   │
      └─────────────────────────────────────────────┘

  → Project Dashboard Shows:
      - Farming Circle (visual ring: stages + progress)
      - Today's Action Items (notification blocks)
      - Service Blocks: Weather · Soil · Activities · Disease · Market · AI

  → Daily Operation:
      Every morning → farmer gets notifications for today's tasks
      Farmer taps notification → scrolls to relevant service block → takes action
      Farmer reports issue → Disease/Pest service → solution shown
      Farmer has question → AI Chat (uses RAG + MCP for personalized answer)
```

---

## Key Concepts

### 1. Project = One Crop Season
Each project represents one crop on one piece of land for one season.
- Example: "Tomato Farm — 1 Acre — March 2025"
- A farmer can run multiple projects simultaneously (tomatoes + beans + poultry)
- Each project has its own life cycle, service blocks, and AI knowledge

### 2. Life Cycle Plan = Full-Season Activity Schedule
When a project is created, the system generates a **deterministic activity plan** covering the entire growing season:
- Seeded from: plant growth stages, nutrient requirements, water requirements
- Adjusted daily by: weather forecast, soil test results, farmer-reported issues
- Displayed as: a visual farming circle + daily task list

### 3. Daily Guidance Engine
Every day at 5 AM, a background job:
1. Fetches latest weather for each active project's location
2. Adjusts today's activities (skip watering if rain expected, etc.)
3. Generates notifications for the farmer
4. Updates the project dashboard

### 4. AI = Last Resort (Cost Efficiency)
```
Can a deterministic function answer this? → YES → Return instantly (0 tokens)
Can structured DB data answer this?       → YES → Format and return (0 tokens)
Can RAG retrieval alone answer this?      → YES → Return top chunks (0 tokens)
None of the above                         → Call LLM with RAG context (costs tokens)
```

**Result:** ~80% of daily tasks handled without any LLM call. AI cost < $0.10/farmer/month.

---

## Target Users

| User Type | Description |
|-----------|-------------|
| Small-scale farmer | 1–10 acres, single crop |
| Medium-scale farmer | 10–50 acres, multiple crops |
| Mixed farmer | Crops + livestock |
| Organic farmer | Needs organic-only recommendations |
| Conventional farmer | Uses chemical fertilizers and pesticides |

**Primary device:** Mobile phone (must be mobile-first PWA)
**Primary language:** English (with Sinhala/Tamil support planned)

---

## What Makes This Different

| Feature | AgriFarm AI | Generic Farming App |
|---------|-------------|---------------------|
| Personalization | Per-farmer RAG model, per-project context | Generic advice for all |
| AI cost | ~$0.10/farmer/month | Expensive or no AI |
| Daily guidance | Automated, weather-adjusted, push notifications | Static calendars |
| Disease diagnosis | Keyword → LLM fallback → solutions by farming method | Generic list |
| Soil intelligence | Nutrient gap calculator, fertilizer recommendations | None |
| Multi-project | Tomatoes + Rice + Poultry simultaneously | Single crop focus |
| Offline | PWA, daily plan cached | Online-only |
| Life cycle | Full visual farming circle with stage tracking | None |

---

## Success Metrics

- Farmer completes daily tasks: > 70% completion rate
- AI cost per farmer per month: < $0.15
- Daily active users (farmers checking app): > 60%
- Disease diagnosis accuracy (keyword matcher): > 80% for common diseases
- API response time (non-AI endpoints): < 200ms
