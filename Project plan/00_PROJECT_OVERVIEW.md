# AgriFarm AI — Project Overview & Vision

## Project Name
**AgriFarm AI** — Personalized AI Farming Assistant Platform

---

## What We Are Building

A web platform where every farmer gets their **own personalized AI assistant** powered by:
- A **RAG (Retrieval-Augmented Generation) model** built from their specific farm data
- A **per-farmer MCP (Model Context Protocol) server** that routes context intelligently
- **Deterministic rule-based services** for routine tasks (weather planning, fertilizer scheduling, soil analysis) to keep AI token costs low
- **LLM invoked only** when true intelligence is needed (complex queries, disease diagnosis, personalized guidance)

---

## Core Problem We Solve

Generic farming advice does not work. A farmer in the dry north needs different guidance than one in the wet south. Soil pH, crop type, farming method (organic vs inorganic), local market prices, upcoming rain — all must be combined to give **accurate, actionable, personalized guidance**.

---

## Key Concepts

### 1. Per-Farmer RAG Model
Each farmer account has a vector knowledge base that grows over time:
- Their soil test reports
- Their historical activity logs
- Their crop choices and outcomes
- General plant knowledge filtered to their crops
- Local market trends for their location

### 2. Per-Project MCP Server
Each farming project (e.g., "Tomato Farm — 1 Acre — March 2025") gets an MCP server instance that:
- Holds the project context (crop, stage, soil, weather, activities)
- Routes tool calls to the right deterministic service
- Assembles context for LLM calls without redundant token usage

### 3. Cost-Efficient AI Strategy
**Do NOT use LLM for everything.** Use deterministic functions for:
- Weather-based activity decisions (if rain in 3 days → skip watering)
- Nutrient deficiency calculation from soil test numbers
- Fertilizer schedule generation based on plant stage
- Irrigation calculation from area + weather + crop water needs
- Market price alerts from fetched data

**Use LLM only for:**
- Complex disease/pest diagnosis from farmer description
- Personalized recommendations combining multiple data sources
- Farmer chat questions that require reasoning
- Generating summaries and action plans

---

## Target Users
- Small to medium-scale farmers
- Mixed farming (multiple crops, some livestock)
- Organic and conventional farming methods
- Primarily mobile web users (must be mobile-first)

---

## Platform Flow

```
Farmer Registers
  → Creates Profile (location, land, farming method)
  → Adds soil test OR selects default soil type
  → Creates a Project (crop, area, start date)
    → System generates:
        - Activity Plan (deterministic scheduler)
        - Weather-adjusted daily actions
        - Fertilizer/irrigation schedule
        - Disease watch calendar
    → Dashboard shows:
        - Farming Circle (visual progress ring)
        - Today's tasks (notification blocks)
        - Service blocks (soil, weather, market, AI chat)
    → Farmer clicks notification → Scrolls to service block → Gets detailed action
    → If problem occurs → Reports issue → Disease/Pest service → Solution shown
    → AI Chat available for deep personalized guidance
```

---

## What Makes This Different
1. **Not a chatbot** — it's a structured farming platform that uses AI intelligently
2. **Cost efficient** — 80% of daily tasks handled by deterministic functions
3. **Truly personalized** — each farmer's RAG model learns their specific context
4. **Offline-friendly** — daily plans cached, work without connectivity
5. **Multi-project** — one farmer can run tomatoes AND rice AND poultry simultaneously
