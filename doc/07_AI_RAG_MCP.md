# AgriFarm AI — AI Strategy (Free Gemini + Future RAG/MCP)

## The Golden Rule: ZERO COST AI

All AI in this platform uses **exclusively free APIs and open-source models**. No paid API keys required.

```
User question or task
        ↓
Can a deterministic function answer this?
  YES → Return instantly (0 tokens, $0)
  NO  ↓
Can structured DB data answer this?
  YES → Format and return (0 tokens, $0)
  NO  ↓
Flatten project context → Send to Google AI Studio (Gemini Free)
  → Get summary/guidance/answer ($0, free tier)
```

**Result:** ~80% of daily queries answered without any AI. Remaining 20% use free Gemini API.

---

## 1. Google AI Studio Free Tier (Current AI Backend)

### What Is Google AI Studio?
Google AI Studio provides **free access** to Gemini models via a simple REST API. No credit card required. The free tier is generous enough for a farming platform.

### Free Tier Limits (Gemini 2.0 Flash)
| Limit | Value | Our Usage |
|-------|-------|-----------|
| Requests per minute | 15 RPM | Stay ≤14 RPM with global sliding-window counter |
| Tokens per minute | 1,000,000 | ~50,000 tokens/min at peak |
| Requests per day | 1,500 RPD | ~300 RPD at 100 farmers (with context hashing) |
| Input token limit | 1,048,576 per request | Our context: ~2,000 tokens per call |
| Output token limit | 8,192 per response | Our limit: 800 tokens per response |

### ⚠️ Real Capacity Warning
- Without fixes: 150 active farmers × 10 calls/day = **1,500 calls → hits ceiling exactly**
- The weekly Celery job alone (300 projects × 1 call) = 300 calls on Sunday
- **Three fixes** bring effective capacity to 500+ farmers within the free tier (see Section 5)

### Setup
```bash
# Install the Google Generative AI Python SDK
pip install google-generativeai

# Get your FREE API key from:
# https://aistudio.google.com/apikey
# No credit card needed. Click "Create API Key" → done.
```

```python
# backend/services/ai_service.py
import google.generativeai as genai
import os

genai.configure(api_key=os.environ["GOOGLE_AI_STUDIO_API_KEY"])

# Use Gemini 2.0 Flash (free, fast, good for structured tasks)
model = genai.GenerativeModel("gemini-2.0-flash")
```

---

## 2. The Flattened Context Approach

Instead of complex RAG (vector embeddings, chunking, retrieval), we use a simpler and equally effective approach: **flatten all project-related data into a single structured JSON** and send it directly as context to the AI.

### Why Flattening Works Better Than RAG for v1.0

| Approach | Complexity | Accuracy | Cost |
|----------|-----------|----------|------|
| Full RAG (vector DB, embeddings) | High | Good | Embedding API costs |
| Flattened Context (direct DB → JSON) | Low | **Excellent** (no retrieval errors) | **$0** |

**Key insight:** A single farming project has limited data (~2,000 tokens when flattened). This easily fits in Gemini's 1M token context window. RAG is designed for when you have millions of documents — we don't. We have a few hundred rows per project. Just send them all.

### What Gets Flattened

```python
async def build_project_context(db: AsyncSession, project_id: uuid.UUID) -> str:
    """
    Flatten project state into ~2000 token JSON context string for Gemini.
    """
    # Returns a JSON string of the following structure:
    # {
    #   "crop": "Tomato",
    #   "scientific_name": "Solanum lycopersicum",
    #   "farming_method": "organic",
    #   "area": "1.0 acres",
    #   "planting_date": "2025-03-01",
    #   "days_since_planting": 45,
    #   "current_stage": "Flowering",
    #   "total_growth_days": 90,
    #   "expected_harvest": "2025-05-29",
    #   "pending_activities": 2,
    #   "soil": {
    #     "ph": 6.2,
    #     "nitrogen": "Low",
    #     "phosphorus": "Medium",
    #     "potassium": "High"
    #   },
    #   "status": "active"
    # }
```

**Total token size:** ~1,500-2,500 tokens (easily fits in Gemini's free tier context window).

---

## 3. AI Use Cases

### Use Case 1: Daily Project Summary
**Trigger:** Farmer taps "Get AI Summary" on dashboard, or automated weekly summary.

```python
SUMMARY_PROMPT = """You are an expert farming assistant for Sri Lankan farmers.

Based on the project data below, provide a clear daily summary in this format:

📊 GROWTH STATUS
- Current stage, progress percentage, what's normal/abnormal

🌤️ WEATHER IMPACT
- How weather affects the crop this week, any action needed

🧪 SOIL & NUTRITION
- Nutrient health, any deficiencies, what to apply

🦠 DISEASE & PEST RISK
- Current risk level, what to watch for, prevention steps

📋 TODAY'S PRIORITIES
- Top 3 actions the farmer must do today, in order

⚠️ WARNINGS
- Any urgent issues requiring immediate attention

Keep it under 400 words. Use simple language. 
Scale all quantities to the farm area specified.
If farming method is 'organic', only recommend organic solutions."""
```

### Use Case 2: Farmer Q&A
**Trigger:** Farmer types a question in the AI chat.

```python
QA_PROMPT = """You are a farming expert assistant. A farmer has a question.

Use ONLY the project data provided below to answer.
Do not make up information. If you don't know, say so.

Always be specific:
- Use exact quantities scaled to the farm area
- Recommend specific products (organic or conventional based on farming method)
- Reference the current growth stage
- Consider the weather forecast in your answer

FARMER'S QUESTION: {farmer_question}

PROJECT DATA:
{flattened_context_json}
"""
```

### Use Case 3: Disease Diagnosis Assistance
**Trigger:** Farmer reports issue but keyword matcher gives low confidence.

```python
DIAGNOSIS_PROMPT = """You are a plant pathologist analyzing a sick crop.

Based on the symptoms described and the project context:
1. What is the most likely disease or deficiency?
2. What caused it? (weather, nutrition, pest?)
3. Immediate treatment steps ({farming_method} methods only)
4. How to prevent recurrence

REPORTED SYMPTOMS: {description}
AFFECTED PARTS: {affected_parts}
AREA AFFECTED: {pct}%

PROJECT CONTEXT:
{flattened_context_json}
"""
```

### Use Case 4: AI-Powered Database Updates
**Trigger:** After receiving AI response, system parses it to create actionable records.

```python
async def process_and_apply_ai_insights(project_id, ai_response_text):
    """
    Parse the AI summary and create database records from it.
    This makes the AI 'smart brain' that updates the system.
    """
    text = ai_response_text.lower()

    # 1. Disease risk detection
    disease_keywords = ["blight", "fungal", "mildew", "wilt", "rot", "virus"]
    for keyword in disease_keywords:
        if keyword in text:
            create_project_alert(
                project_id=project_id,
                alert_type="disease_risk",
                title=f"AI detected potential {keyword} risk",
                description=extract_sentence_containing(text, keyword),
                severity="warning"
            )

    # 2. Nutrient deficiency detection
    nutrient_keywords = {
        "nitrogen": "nitrogen_deficiency",
        "phosphorus": "phosphorus_deficiency",
        "potassium": "potassium_deficiency",
        "calcium": "calcium_deficiency"
    }
    for nutrient, issue_type in nutrient_keywords.items():
        if f"low {nutrient}" in text or f"{nutrient} deficien" in text:
            create_soil_recommendation(
                project_id=project_id,
                recommendation_type="fertilizer",
                nutrient_affected=nutrient,
                action_required=extract_sentence_containing(text, nutrient)
            )

    # 3. Activity adjustment suggestions
    if "skip watering" in text or "postpone irrigation" in text:
        skip_todays_watering(project_id, reason="AI recommendation based on weather + soil analysis")

    if "apply fertilizer" in text or "apply lime" in text:
        # Don't auto-apply — create a notification instead
        create_notification(
            project_id=project_id,
            type="ai_insight",
            title="AI recommends fertilizer action",
            message=extract_sentence_containing(text, "apply")
        )

    # 4. Store the full summary for history
    save_ai_summary(project_id, ai_response_text)
```

---

## 4. Intent Classifier (No AI Needed — Regex)

Before calling the AI, a regex-based intent classifier routes simple questions to deterministic functions:

```python
import re

DETERMINISTIC_INTENTS = {
    r'(water|irrigat|how much water)': 'watering_details',
    r'(weather|rain|forecast|temperature|sunny|cloudy)': 'weather_info',
    r'(price|market|sell|selling|how much.*sell)': 'market_price',
    r'(today|activity|task|schedule|plan|what to do)': 'todays_plan',
    r'(fertiliz|nutrient|npk|urea|compost|feed)': 'fertilizer_schedule',
    r'(harvest|when.*harvest|ready.*pick)': 'harvest_date',
    r'(soil|ph|nitrogen|phosphorus|potassium)': 'soil_status',
}

def classify_intent(message: str) -> str:
    msg = message.lower().strip()
    for pattern, intent in DETERMINISTIC_INTENTS.items():
        if re.search(pattern, msg):
            return intent
    return 'ai_required'  # Only this goes to Gemini

# Usage in chat handler:
intent = classify_intent(farmer_message)
if intent == 'weather_info':
    return weather_service.get_today_summary(project_id)  # Instant, free
if intent == 'todays_plan':
    return planner_service.get_today(project_id)  # Instant, free
if intent == 'ai_required':
    return await get_ai_summary(project_id, farmer_message)  # Gemini free API
```

---

## 5. Rate Limiting & Error Handling

### Fix 1: Context Hashing — Avoid Duplicate Gemini Calls

Before calling Gemini, hash the flattened context. If the project data hasn't changed since the last summary, return the cached result without any API call. This is the single most effective way to stay within free tier limits.

```python
import hashlib, json

async def get_or_generate_ai_summary(project_id: str, force_refresh: bool = False):
    # Build context first (cheap — DB queries only)
    context = await build_project_context(project_id, db)
    context_hash = hashlib.md5(
        json.dumps(context, sort_keys=True, default=str).encode()
    ).hexdigest()

    # Check if we already have a summary for this exact context state
    existing = await get_latest_ai_summary(project_id)  # from ai_project_summaries
    if existing and existing.context_hash == context_hash and not force_refresh:
        return existing  # Data unchanged — no Gemini call needed

    # Context changed or forced — call Gemini
    summary = await call_gemini(context)
    await save_ai_summary(project_id, summary, context_hash=context_hash)
    return summary
```

> **Note:** Add `context_hash VARCHAR(32)` column to `ai_project_summaries` table in a new migration.

### Fix 2: Three-Bucket Per-Farmer Daily Quota

Instead of a flat "10 calls/day" limit, split the budget by call type so disease diagnosis never blocks the farmer's ability to ask questions:

```python
# modules/ai/rate_limiter.py
from enum import Enum

class AICallType(str, Enum):
    MANUAL_CHAT = "chat"          # Farmer explicitly asks a question
    MANUAL_REFRESH = "refresh"    # Farmer taps "Refresh AI Summary"
    AUTO_DIAGNOSIS = "diagnosis"  # Triggered when farmer reports an issue

DAILY_QUOTAS = {
    AICallType.MANUAL_CHAT: 5,
    AICallType.MANUAL_REFRESH: 3,
    AICallType.AUTO_DIAGNOSIS: 2,
}  # Total: 10/day — tracked separately per type

async def check_quota(farmer_id: str, call_type: AICallType) -> bool:
    key = f"ai_quota:{farmer_id}:{call_type.value}:{today()}"
    count = int(await redis.get(key) or 0)
    return count < DAILY_QUOTAS[call_type]

async def consume_quota(farmer_id: str, call_type: AICallType):
    key = f"ai_quota:{farmer_id}:{call_type.value}:{today()}"
    await redis.incr(key)
    await redis.expire(key, 86400)  # TTL: 1 day (auto-resets)
```

### Fix 3: Global RPM Limiter (stays under 15 RPM)

```python
MAX_AI_CALLS_PER_MINUTE_GLOBAL = 14  # 1 buffer below 15 RPM free limit

async def rate_limit_global() -> bool:
    """Sliding window rate limit for Google free tier."""
    key = f"ai_global:{current_minute()}"
    count = await redis.incr(key)
    await redis.expire(key, 60)
    return count <= MAX_AI_CALLS_PER_MINUTE_GLOBAL
```

### Fix 4: Throttled Weekly Summary Job

The Sunday 6 AM Celery job generates summaries for ALL active projects. For 300 projects at 15 RPM this takes 20 minutes minimum — space the calls to avoid burst failures:

```python
# tasks/ai_tasks.py
@celery_app.task
def generate_weekly_ai_summary():
    active_projects = get_all_active_projects()
    for i, project in enumerate(active_projects):
        # 4-second delay between calls = max 15 per minute
        if i > 0:
            time.sleep(4)
        try:
            _generate_summary_for_project(project.id)
        except ResourceExhausted:
            log.warning(f"Rate limited on project {project.id}, skipping this week")
            continue  # Skip — will get summary next week
```

### Error Handling (unchanged)

```python
async def safe_ai_call(project_id, query=None, call_type=AICallType.MANUAL_CHAT):
    try:
        response = await get_or_generate_ai_summary(project_id, query)
        return response
    except google.api_core.exceptions.ResourceExhausted:
        return {
            "summary": generate_deterministic_summary(project_id),
            "source": "deterministic_fallback",
            "reason": "AI rate limit reached. Showing calculated summary."
        }
    except google.api_core.exceptions.GoogleAPIError:
        cached = await get_latest_ai_summary(project_id)
        if cached:
            return {"summary": cached.summary_text, "source": "cached"}
        return {
            "summary": generate_deterministic_summary(project_id),
            "source": "deterministic_fallback"
        }
```

### Effective Capacity with All Fixes

| Scenario | Without Fixes | With Fixes |
|----------|--------------|------------|
| 100 active farmers | 500-1000 calls/day | ~200 calls/day (context hashing) |
| 300 active farmers | **breaks at RPD limit** | ~600 calls/day ✅ |
| Weekly job (300 projects) | Burst failures | Throttled, 20 min, stable ✅ |

---

## 6. Future: Self-Hosted Gemma 3 for Small Tasks

For high-frequency, small tasks (intent classification, symptom extraction), deploy Google's open-source Gemma 3 1B model on a cheap VPS:

```python
# Future: local Gemma 3 via Ollama or vLLM
# Cost: $5/month VPS (2 vCPU, 4GB RAM is sufficient for 1B model)
# Latency: ~200ms per call (much faster than API)
# Use for: intent classification, keyword extraction, short answers

# Example with Ollama:
# ollama run gemma3:1b

import httpx

async def gemma_classify(text: str) -> str:
    """Use local Gemma 3 1B for intent classification."""
    response = await httpx.post("http://localhost:11434/api/generate", json={
        "model": "gemma3:1b",
        "prompt": f"Classify this farming question into one category: weather, soil, disease, market, schedule, general.\nQuestion: {text}\nCategory:",
        "stream": False
    })
    return response.json()["response"].strip().lower()
```

---

## 7. Future: Full RAG + MCP Architecture (v3.0)

When the user base grows and projects accumulate years of historical data, upgrade to full RAG:

```
v1.0 (Current)                    v2.0                              v3.0
─────────────────                 ─────────────────                 ─────────────────
Flattened Context                 + pgvector embeddings             Full RAG Pipeline
→ Google Gemini Free              + Gemini Embedding API (free)     + MCP Server
Regex Intent Classifier           + Gemma 3 local classifier        + AI Agent
Simple DB queries                 + Semantic search                 + Autonomous actions
```

### MCP Server (Future — When AI Agent Feature Ships)

```python
# Future: Model Context Protocol server
# Each farmer gets a virtual MCP endpoint that exposes tools:
#   - get_current_weather()
#   - get_todays_activities()
#   - get_soil_status()
#   - get_market_prices()
#   - search_knowledge()
#
# The AI Agent can autonomously call these tools to:
#   - Monitor crops 24/7
#   - Auto-reschedule activities
#   - Generate proactive alerts
#   - Answer complex multi-step queries
```
