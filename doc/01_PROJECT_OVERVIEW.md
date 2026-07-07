# AgriFarm AI — Project Overview & Vision

## Project Name
**AgriFarm AI** — Personalized AI Farming Assistant Platform

---

## Problem Statement

Generic farming advice fails real farmers. A farmer in the dry north needs different guidance than one in the wet south. Soil pH, crop type, farming method (organic vs conventional), local market prices, upcoming rain — all these factors must be combined to give **accurate, actionable, personalized daily guidance**.

Most farming apps give static calendars or generic tips. AgriFarm AI gives each farmer their own **intelligent assistant** that knows their specific land, soil, crop stage, and local weather.

---

## What We Are Building

A web-based platform (initially) where every farmer gets their own personalized farming assistant.

### Current Phase (v1.0 — Web App)
- **Web application** built with Next.js 14 (mobile-first PWA)
- **Farmer Project Service** as the core starting feature (activity planner always on)
- **Deterministic rule-based engines** for weather, fertilizer, soil, activity planning, disease matching
- **Incremental service rollout** via `account_features` + `project_services` (see `16_SERVICE_GATING.md`)
- **Separate backend** (FastAPI) and **frontend** (Next.js) — deploy independently

### Future Phases
- **v2.0:** AI Chat (Gemini Q&A) + Flutter mobile apps (Android + iOS) + Marketplace
- **v3.0:** AI Agent with MCP + Desktop app (Windows/macOS via Flutter) + full RAG

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
      - Enables Services (weather, soil, activity plan, disease watch, market — per account access)
      - AI chat and AI Agent are future services (v2.0 / v3.0)

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
      - Service Blocks: Weather · Soil · Activities · Disease · Market
      - AI Chat block — future (v2.0)

  → Daily Operation:
      Every morning → farmer gets notifications for today's tasks
      Farmer taps notification → scrolls to relevant service block → takes action
      Farmer reports issue → Disease/Pest service → solution shown
      Farmer has question → AI Chat (future v2.0 — Gemini with project context)
```

---

## AI Strategy: ZERO COST

The platform uses **exclusively free AI APIs** and open-source models:

```
┌──────────────────────────────────────────────────────────┐
│                   AI COST STRATEGY                       │
│                                                          │
│  Tier 1: Deterministic Engines (80% of queries)          │
│    → Rule-based: watering, fertilizer, soil analysis     │
│    → Python functions, no AI tokens, instant response    │
│                                                          │
│  Tier 2: Google AI Studio Free API (15% of queries)      │
│    → Gemini 2.0 Flash (free tier: 15 RPM, 1M tokens/min)│
│    → Input: flattened project context (JSON)             │
│    → Output: situation summary, growth advice, alerts    │
│                                                          │
│  Tier 3: Self-Hosted Gemma 3 (5% of queries, future)    │
│    → Deploy Google Gemma 3 1B on cheap VPS               │
│    → For quick classification tasks, intent routing      │
│    → Runs locally = truly zero API cost                  │
│                                                          │
│  RESULT: $0.00 per farmer per month for AI               │
└──────────────────────────────────────────────────────────┘
```

### How Free AI Works in Practice

When a farmer asks a question or requests a project summary:

1. **Flatten all related project data** into a structured JSON context:
   - Project details (crop, area, planting date, days since planting)
   - Current plant stage (from `plant_stages` table)
   - Recent activities (last 7 days of `farming_activities`)
   - Current soil status (from `soil_nutrient_results`)
   - Current weather forecast (5-day from `weather_cache`)
   - Active issues (from `project_issues`)
   - Fertilizer history (from `activity_details`)

2. **Send to Google AI Studio free API** (Gemini 2.0 Flash) with a system prompt:
   ```
   "Based on this farming project data, summarize the current situation.
    Include: growth status, weather outlook, nutrient health, disease risks,
    and what the farmer should do today and this week."
   ```

3. **Receive structured response** → display as "AI Summary" card on dashboard

4. **System also uses the AI response** to update database:
   - If AI identifies a nutrient issue → create `soil_recommendations` record
   - If AI identifies disease risk → create `weather_alerts` or `project_issues`
   - If AI suggests rescheduling → update `farming_activities` status

---

## Key Concepts

### 1. Project = One Crop Season
Each project represents one crop on one piece of land for one season.
- Example: "Tomato Farm — 1 Acre — March 2025"
- A farmer can run multiple projects simultaneously (tomatoes + beans + poultry)
- Each project has its own life cycle, service blocks, and AI context

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
None of the above                         → Flatten context → Google AI Studio free API
```

**Result:** ~80% of daily tasks handled without any AI call. Remaining 20% use free Gemini API.

---

## Target Users

| User Type | Description |
|-----------|-------------|
| Small-scale farmer | 1–10 acres, single crop |
| Medium-scale farmer | 10–50 acres, multiple crops |
| Mixed farmer | Crops + livestock |
| Organic farmer | Needs organic-only recommendations |
| Conventional farmer | Uses chemical fertilizers and pesticides |

**Primary device:** Mobile phone (must be mobile-first PWA, then native apps)
**Primary language:** English (with Sinhala/Tamil support planned)

---

## Multi-Platform Strategy

| Phase | Platform | Technology | Timeline |
|-------|----------|-----------|----------|
| v1.0 | Web App (PWA) | Next.js 14 + TypeScript | **Current** |
| v2.0 | Android App | Flutter (Dart) | Future |
| v2.0 | iOS App | Flutter (Dart) | Future |
| v3.0 | Desktop App | Flutter Desktop | Future |

All platforms share the **same FastAPI backend** and **same PostgreSQL database**. The API-first architecture ensures any frontend can connect.

---

## What Makes This Different

| Feature | AgriFarm AI | Generic Farming App |
|---------|-------------|---------------------|
| AI cost | **$0.00** (free Gemini API + Gemma) | Expensive or no AI |
| Personalization | Project-specific context flattening | Generic advice for all |
| Daily guidance | Automated, weather-adjusted, push notifications | Static calendars |
| Disease diagnosis | Keyword → AI fallback → solutions by farming method | Generic list |
| Soil intelligence | Nutrient gap calculator, fertilizer recommendations | None |
| Multi-project | Tomatoes + Rice + Poultry simultaneously | Single crop focus |
| Offline | PWA, daily plan cached | Online-only |
| Life cycle | Full visual farming circle with stage tracking | None |
| Multi-platform | Web → Android → iOS → Desktop (planned) | Single platform |

---

## Success Metrics

- Farmer completes daily tasks: > 70% completion rate
- AI cost per farmer per month: **$0.00** (free tier only)
- Daily active users (farmers checking app): > 60%
- Disease diagnosis accuracy (keyword matcher): > 80% for common diseases
- API response time (non-AI endpoints): < 200ms
