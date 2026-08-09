# AgriFarm AI — AI Integration Rules

## 1. ZERO COST POLICY (NON-NEGOTIABLE)

**Rule: The system must operate at $0.00 AI cost per farmer per month.**

- **Primary LLM:** Google AI Studio — `gemini-2.0-flash` (Free: 15 RPM, 1,500 RPD, 1M tokens/min)
- **Fallback LLM:** Google AI Studio — `gemini-1.5-flash` (Free tier, fallback only)
- **Future (v3.0):** Self-hosted Gemma 3 1B on VPS for classification tasks
- **Embeddings (future):** Gemini Embedding API free tier only
- **NO paid API keys.** `GOOGLE_AI_STUDIO_API_KEY` is obtained free from https://aistudio.google.com/apikey

## 2. The Three-Tier Decision Flow

Before invoking Gemini for ANY query, always follow this priority order:

```
Tier 1 (80% of queries): Can a deterministic Python function answer this?
  → YES → Return instantly. Zero AI tokens used.
  → Examples: weather adjustment rules, soil nutrient calc, activity scheduling

Tier 2 (15% of queries): Is there structured DB data that directly answers this?
  → YES → Format and return from DB. Zero AI tokens used.
  → Examples: "What are today's tasks?", "What is the current price?", "What stage am I in?"

Tier 3 (5% of queries): None of the above work.
  → Flatten project context → Call Google AI Studio free API
  → Examples: "Why are my leaves curling?", "Give me a weekly summary"
```

**Never call Gemini for a question that can be answered deterministically.**

## 3. The "Flattened Context" Approach (NO RAG in v1.0)

For v1.0, do NOT build a RAG pipeline. Instead, use `context_builder.py` to flatten all relevant project data into a single JSON object (~2,000 tokens) and pass it directly to Gemini.

The `build_project_context(project_id, db)` function in `modules/ai/context_builder.py` must collect:

```python
{
    "project": {
        "crop": plant.common_name,
        "area": f"{project.area} {project.area_unit}",
        "planting_date": str(project.planting_date),
        "days_since_planting": (date.today() - project.planting_date).days,
        "total_growth_days": plant.growth_duration_days,
        "farming_method": project.farming_method.code,   # "organic" | "inorganic" | "integrated"
        "status": project.status
    },
    "current_stage": { "name", "day_in_stage", "key_indicators", "critical_actions", "watch_for" },
    "weather_5day": [ { "date", "condition", "temp_max", "rain_mm", "humidity" } ],
    "soil_status": { "ph", "nitrogen_ppm", "phosphorus_ppm", "potassium_ppm", "last_test_date" },
    "recent_activities": [ { "date", "type", "title", "status" } ],   # last 7 days
    "todays_tasks": [ { "title", "type", "priority" } ],
    "active_issues": [ { "type", "description", "severity" } ],
    "market_price": { "price_per_kg", "trend" }
}
```

## 4. System Prompt Rules

System prompts live as constants in `modules/ai/prompts.py`. Always use these rules:

- Instruct Gemini to keep responses under 500 words.
- Use simple language (farmers with varying education levels).
- **Forbid Gemini from recommending dosages NOT present in the context.** AI must only cite quantities provided in the flattened context.
- If `farming_method == "organic"`, Gemini MUST only recommend organic solutions.
- Scale all recommendations to the farmer's actual farm area.

## 5. Intent Classifier (Regex-Based — NO AI)

Before sending to Gemini, run the query through `modules/ai/intent_classifier.py`. This regex-based classifier routes simple questions to the correct deterministic service:

| Intent Pattern | Route To |
|---------------|----------|
| "rain", "weather", "temperature", "forecast" | Weather service |
| "price", "market", "kg", "LKR" | Market service |
| "today", "tasks", "schedule", "plan" | Planner service |
| "soil", "pH", "nitrogen" | Soil service |
| Everything else | Gemini API |

This prevents burning free Gemini quota on questions that structured data can answer.

## 6. Rate Limiting (3-Bucket System)

Do NOT use a single flat "10 calls/day" counter. Use separate buckets per call type so that a disease diagnosis never blocks the farmer's ability to chat.

**Redis-based per-farmer daily quota** (auto-resets at midnight via TTL):

| Bucket | `AICallType` | Daily Limit | Use Case |
|--------|-------------|------------|----------|
| `chat` | `MANUAL_CHAT` | 5 | Farmer types a question in AI chat |
| `refresh` | `MANUAL_REFRESH` | 3 | Farmer taps "Refresh AI Summary" |
| `diagnosis` | `AUTO_DIAGNOSIS` | 2 | Triggered when reporting an issue (low-confidence disease match) |

Redis key: `ai_quota:{farmer_id}:{call_type}:{YYYY-MM-DD}` — TTL 86400 seconds.

Implementation lives in `modules/ai/rate_limiter.py`:
```python
async def check_quota(farmer_id: str, call_type: AICallType) -> bool: ...
async def consume_quota(farmer_id: str, call_type: AICallType): ...
```

**Global RPM guard (stays under 15 RPM free limit):**
Redis key: `ai_global:{current_minute}` — increment and expire after 60s. Max value: 14.

If a farmer hits their daily limit → return HTTP `429` and fall through to deterministic summary. Show `"AI summary temporarily unavailable"` in the UI.

## 7. Caching AI Summaries (Context Hashing)

Before calling Gemini, build the flattened context and compute its MD5 hash. If the last stored summary was generated for the same context hash, return it without any Gemini call. This is the most effective way to stay within the free tier limit at scale.

```python
async def get_or_generate_ai_summary(project_id: str, force_refresh: bool = False):
    context = await build_project_context(project_id, db)
    context_hash = hashlib.md5(
        json.dumps(context, sort_keys=True, default=str).encode()
    ).hexdigest()

    existing = await get_latest_ai_summary(project_id)  # from ai_project_summaries
    if existing and existing.context_hash == context_hash and not force_refresh:
        return existing  # Context unchanged — no Gemini call needed

    summary = await call_gemini(context)
    await save_ai_summary(project_id, summary, context_hash=context_hash)
    return summary
```

The `ai_project_summaries` table has a `context_hash VARCHAR(32)` column (added in migration `002_ai_context_hash.py`).

**Expected impact:** At 300 active farmers, only projects with data changes since the last summary call Gemini. In practice, this reduces daily Gemini calls by 60-70%.

## 8. Deterministic Fallback (Always Required)

Every Gemini call MUST have a fallback. If Gemini is unavailable or rate-limited:

```python
async def safe_ai_call(project_id, query=None):
    try:
        return await call_gemini(project_id, query)
    except ResourceExhausted:
        return generate_deterministic_summary(project_id)   # Always implement this
    except GoogleAPIError:
        cached = get_latest_ai_summary(project_id)
        if cached:
            return cached
        return generate_deterministic_summary(project_id)
```

The `generate_deterministic_summary()` function must produce a human-readable summary using only database data, without any AI calls.

## 9. AI Response Parser

After receiving an AI response, `modules/ai/response_parser.py` must parse the text and create DB records for actionable insights:

```python
text = ai_response.lower()

# Create disease alert if AI identifies disease risk
if "disease risk" in text or "fungal" in text or "blight" in text:
    create_weather_alert(project_id, "disease_risk", ...)

# Create soil recommendation if AI identifies deficiency
if "nitrogen deficient" in text or "low nitrogen" in text:
    create_soil_recommendation(project_id, "nitrogen", ...)
```

## 10. Gemini SDK Usage

Use `google-generativeai` Python SDK. Model name: `"gemini-2.0-flash"`.

```python
import google.generativeai as genai
genai.configure(api_key=settings.GOOGLE_AI_STUDIO_API_KEY)

model = genai.GenerativeModel("gemini-2.0-flash")
response = model.generate_content(
    [system_prompt, user_message],
    generation_config=genai.GenerationConfig(
        max_output_tokens=800,
        temperature=0.3       # Low temperature for factual farming advice
    )
)
```

**Always log the call to `ai_query_logs` with `cost_usd=0.00`.**

## 11. Disease Diagnosis via AI

When the PostgreSQL `ts_rank` disease matcher returns low confidence (score < 0.1), route to Gemini with the `DIAGNOSIS_PROMPT`. Gemini response is stored with `source: "ai_gemini"` in `project_issues`. Always prefer the DB match when confidence is sufficient.

## 12. Weekly Automated Summary (Throttled)

The Celery Beat job in `ai_tasks.py` (`generate_weekly_ai_summary`) runs every Sunday at 6 AM. It:
1. Gets all `active` projects
2. For each project, builds the flattened context and checks the context hash
3. Skips projects whose context hash hasn't changed since last summary
4. For projects that need a new summary: waits 4 seconds between calls to stay under 15 RPM
5. On `ResourceExhausted`: logs warning, skips that project (gets summary next week)
6. Stores result in `ai_project_summaries`
7. Creates a `notification` of type `ai_insight` for the farmer

```python
for i, project in enumerate(active_projects):
    if i > 0:
        time.sleep(4)  # 4s delay = max 15/min, stays within free tier
    try:
        _generate_summary_for_project(project.id)
    except ResourceExhausted:
        log.warning(f"Skipping {project.id} — rate limited")
        continue
```
