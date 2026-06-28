# AgriFarm AI — AI, RAG & MCP Architecture

## The Golden Rule: AI is the Last Resort

```
User question or task
        ↓
Can a deterministic function answer this?
  YES → Return instantly (0 tokens, 0 cost)
  NO  ↓
Can structured DB data answer this?
  YES → Format and return (0 tokens, 0 cost)
  NO  ↓
Can RAG retrieval alone answer without generation?
  YES → Return top chunks directly (0 tokens)
  NO  ↓
Call LLM with RAG context + MCP tools (costs tokens)
```

**Result:** ~80% of daily queries answered without LLM.
**Estimated AI cost:** < $0.10 per farmer per month.

---

## 1. Per-Farmer RAG Architecture

### Concept
Every farmer has a **private knowledge bubble** — a vector store built entirely from their specific farm data. When the LLM is needed, it retrieves context from this personal store rather than guessing or using generic knowledge.

### Knowledge Bubble Structure
```
[Farmer's RAG Knowledge Base]
         │
┌────────┴──────────────────────────────┐
│  PERSONAL CONTEXT    GENERAL CONTEXT  │
│  - Soil test results - Plant info     │
│  - Activity history  - Disease DB     │
│  - Problem history   - Fertilizer DB  │
│  - Farm location     - Market trends  │
│  - Crop outcomes     - Agri guides    │
│  - Own notes         - Local weather  │
└────────────────────────────────────────┘
         │
   [pgvector index]
   Cosine similarity search on farmer's chunks
```

---

## 2. RAG Document Types

| Document Type | Trigger | Content | Update Frequency |
|--------------|---------|---------|-----------------|
| `plant_info` | Project created | Full plant guide (stages, care, nutrient needs) | Once per project |
| `soil_profile` | Soil test submitted | Soil analysis summary + gap recommendations | Per test |
| `activity_history` | Activity marked done | Log of what was done, when, farmer notes | Daily |
| `issue_log` | Issue resolved | Problem description + solution applied | Per issue |
| `weather_summary` | Monthly | Weather pattern summary for farm location | Monthly |
| `market_summary` | Weekly | Price trends for farmer's crops | Weekly |
| `farmer_notes` | AI chat / manual | Observations the farmer shares | Per conversation |
| `agronomist_advice` | Admin upload | Expert guidance for local conditions | As available |

---

## 3. Document Ingestion Pipeline

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Standard documents: 500-token chunks, 50-token overlap
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", ".", " "]
)

# Structured data (soil, nutrient tables): smaller chunks
soil_splitter = RecursiveCharacterTextSplitter(
    chunk_size=200,
    chunk_overlap=20
)

async def ingest_document(farmer_id, project_id, doc_type, title, content, metadata):
    # 1. Store document record
    doc = await create_farmer_rag_document(
        farmer_id=farmer_id,
        project_id=project_id,
        document_type=doc_type,
        title=title,
        content=content,
        metadata_json=metadata
    )

    # 2. Choose splitter based on content type
    active_splitter = soil_splitter if doc_type == 'soil_profile' else splitter
    chunks = active_splitter.split_text(content)

    # 3. Generate embeddings (batched — cheaper API usage)
    embeddings_response = await openai_client.embeddings.create(
        input=chunks,
        model="text-embedding-3-small"  # 1536 dimensions, $0.02/1M tokens
    )

    # 4. Store chunks with embeddings in pgvector
    chunk_records = [
        {
            'document_id': doc.id,
            'farmer_id': farmer_id,
            'chunk_index': i,
            'content': chunk,
            'embedding': embedding.embedding,
            'token_count': len(chunk.split()),
            'metadata_json': {**metadata, 'chunk_index': i}
        }
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings_response.data))
    ]
    await bulk_create_rag_chunks(chunk_records)
    await mark_document_indexed(doc.id)

    return doc
```

---

## 4. Retrieval Strategy

```python
async def retrieve_context(farmer_id, query, project_id=None, intent=None, top_k=5):
    """
    Multi-query retrieval with intent-specific boosting.
    """
    query_embedding = await embed_text(query)
    results = []

    # Primary semantic search (project-scoped if project_id provided)
    primary = await vector_search(
        farmer_id=farmer_id,
        embedding=query_embedding,
        filter={'project_id': project_id} if project_id else None,
        top_k=3
    )
    results.extend(primary)

    # Intent-specific boosting (add specialized chunks)
    if intent == 'disease':
        disease_docs = await vector_search(
            farmer_id=farmer_id,
            embedding=query_embedding,
            filter={'document_type': ['plant_info', 'issue_log']},
            top_k=2
        )
        results.extend(disease_docs)

    if intent == 'market':
        market_docs = await vector_search(
            farmer_id=farmer_id,
            embedding=query_embedding,
            filter={'document_type': 'market_summary'},
            top_k=2
        )
        results.extend(market_docs)

    if intent == 'soil':
        soil_docs = await vector_search(
            farmer_id=farmer_id,
            embedding=query_embedding,
            filter={'document_type': 'soil_profile'},
            top_k=2
        )
        results.extend(soil_docs)

    # Deduplicate by chunk_id and return top K by similarity
    seen = set()
    unique = [r for r in results if r.id not in seen and not seen.add(r.id)]
    return sorted(unique, key=lambda x: x.similarity, reverse=True)[:top_k]
```

### pgvector SQL Query
```sql
SELECT
    content,
    metadata_json,
    1 - (embedding <=> $1) AS similarity
FROM farmer_rag_chunks
WHERE farmer_id = $2
  AND ($3::uuid IS NULL OR metadata_json->>'project_id' = $3::text)
  AND ($4::text IS NULL OR metadata_json->>'document_type' = ANY($4::text[]))
ORDER BY embedding <=> $1
LIMIT $5;
```

---

## 5. Embedding Model

| Model | Dimensions | Cost | Notes |
|-------|-----------|------|-------|
| `text-embedding-3-small` (OpenAI) | 1536 | $0.02/1M tokens | Primary, fast |
| `voyage-lite-02-instruct` (Voyage AI) | 1024 | $0.02/1M tokens | Agriculture domain fallback |

**Config:** Store embedding dimensions in environment variable so models can be swapped without schema changes.

---

## 6. Per-Farmer MCP Server

### What is It?
Each farmer gets a **session-scoped virtual MCP server** — a Python object (not a persistent process) that:
1. Knows the farmer's context (id, active project, farming method, language)
2. Exposes tools that the LLM can call to fetch real-time data
3. Routes tool calls to the correct backend service
4. Assembles context efficiently

### MCP Session Lifecycle
```
Farmer opens AI Chat
        ↓
Create FarmerMCPServer(farmer_id, project_id):
  → Load farmer_profile (name, language, method)
  → Load active project (crop, area, stage)
  → Register all tools
        ↓
Build system prompt with farmer context
        ↓
LLM receives prompt + available tools
        ↓
LLM calls tools as needed (weather, soil, market, RAG search)
        ↓
MCP routes to correct service → returns structured data
        ↓
LLM assembles personalized, context-aware answer
        ↓
Session closed (stateless — all context loaded from DB next time)
```

### MCP Server Implementation
```python
from mcp import Server, Tool

class FarmerMCPServer:
    def __init__(self, farmer_id: str, project_id: str):
        self.farmer_id = farmer_id
        self.project_id = project_id
        self.server = Server("agrifarm-farmer-mcp")
        self._register_tools()

    def _register_tools(self):

        @self.server.tool()
        async def get_current_weather():
            """Get today's weather and 5-day forecast for the farmer's field."""
            return await weather_service.get_forecast_for_project(self.project_id)

        @self.server.tool()
        async def get_todays_activities():
            """Get today's scheduled farming activities with full details and quantities."""
            return await planner_service.get_today(self.project_id)

        @self.server.tool()
        async def get_soil_status():
            """Get latest soil test results and nutrient recommendations."""
            return await soil_service.get_latest(self.project_id)

        @self.server.tool()
        async def get_market_prices():
            """Get current market prices for crops in the farmer's district."""
            return await market_service.get_for_project(self.project_id)

        @self.server.tool()
        async def get_disease_solutions(disease_name: str):
            """Get treatment solutions for a specific disease or pest."""
            method = await project_service.get_farming_method(self.project_id)
            return await disease_service.get_solutions(disease_name, method)

        @self.server.tool()
        async def search_knowledge(query: str):
            """Search farmer's personal knowledge base for relevant information."""
            return await rag_service.retrieve_context(
                self.farmer_id, query, self.project_id
            )

        @self.server.tool()
        async def save_note(note: str):
            """Save an observation or note to the farmer's knowledge base."""
            await rag_service.ingest_note(self.farmer_id, self.project_id, note)
            return {"saved": True, "message": "Note saved to your knowledge base"}
```

---

## 7. System Prompt Builder

```python
def build_system_prompt(farmer, project, current_stage, weather_today, soil_summary, rag_context):
    method = project.farming_method
    opposite = "organic" if method == "conventional" else "conventional"

    context_text = "\n".join([f"- {chunk.content}" for chunk in rag_context])

    return f"""
You are a personal AI farming assistant for {farmer.full_name}.

## Farmer Profile
- Location: {farmer.district}, {farmer.province}
- Farming experience: {farmer.experience_years} years
- Farming method: {method} (CRITICAL: only recommend {method} solutions)
- Preferred language: {farmer.primary_language}

## Current Project
- Crop: {project.plant.common_name} ({project.plant.local_name})
- Area: {project.area} {project.area_unit} ({project.plant_count} plants)
- Planting date: {project.planting_date}
- Expected harvest: {project.expected_harvest_date}

## Current Stage: {current_stage.stage_name}
- Day {current_stage.days_since_planting} of {project.plant.growth_duration_days}
- Key actions this stage: {current_stage.critical_actions}
- Watch for: {current_stage.watch_for}
- Key indicators: {current_stage.key_indicators}

## Today's Weather
{weather_today}

## Soil Summary
{soil_summary}

## Your Knowledge Base (relevant context)
{context_text}

## Your Rules
1. Give SPECIFIC advice — quantities, product names, timings, methods
2. Scale all quantities to {project.area} {project.area_unit}
3. NEVER recommend {opposite} products
4. Use search_knowledge tool if you need more context
5. If disease/pest risk: proactively suggest prevention action
6. Be concise — farmers are busy. Lead with the action, explain briefly.
7. Use simple language — avoid agricultural jargon
8. Answer in {farmer.primary_language}
""".strip()
```

---

## 8. Intent Classifier (Deterministic Pre-Filter)

```python
import re

DETERMINISTIC_INTENTS = {
    r'(water|irrigat|how much water)': 'watering_details',
    r'(weather|rain|forecast|temperature|temp|sunny|cloudy)': 'weather_info',
    r'(price|market|sell|selling|how much.*sell|kg.*price)': 'market_price',
    r'(today|activity|task|schedule|plan|what to do)': 'todays_plan',
    r'(fertiliz|nutrient|npk|urea|compost|feed)': 'fertilizer_schedule',
    r'(harvest|when.*harvest|harvest.*when|ready.*pick)': 'harvest_date',
    r'(soil|ph|nitrogen|phosphorus|potassium)': 'soil_status',
}

def classify_intent(message: str) -> str:
    msg = message.lower().strip()
    for pattern, intent in DETERMINISTIC_INTENTS.items():
        if re.search(pattern, msg):
            return intent
    return 'llm_required'

# In process_chat():
intent = classify_intent(message)
if intent == 'watering_details':
    return planner_service.get_watering_details(project_id)
if intent == 'weather_info':
    return weather_service.get_today_summary(project_id)
if intent == 'market_price':
    return market_service.get_latest_prices(project_id)
if intent == 'todays_plan':
    return planner_service.get_today_summary(project_id)
if intent == 'harvest_date':
    return project_service.get_harvest_estimate(project_id)
if intent == 'soil_status':
    return soil_service.get_summary(project_id)
# Only if intent == 'llm_required': proceed to LLM
```

---

## 9. AI Cost Control

### Token Budget Per Request
```python
MAX_SYSTEM_PROMPT_TOKENS = 2000   # farmer context + RAG chunks
MAX_HISTORY_TOKENS        = 1500  # conversation history (trimmed)
MAX_OUTPUT_TOKENS         = 800   # response length

# Daily limit per farmer
DAILY_TOKEN_LIMIT = 50_000  # ~$0.15/day ceiling

async def check_daily_budget(farmer_id: str) -> bool:
    today_usage = await get_today_token_usage(farmer_id)
    if today_usage >= DAILY_TOKEN_LIMIT:
        await log_budget_exceeded(farmer_id)
        return False
    return True
```

### Conversation Trimming (Long Sessions)
```python
async def trim_conversation(messages: list, farmer_id: str) -> list:
    total_tokens = estimate_token_count(messages)

    if total_tokens > 3000:
        # Keep last 4 turns fresh
        recent = messages[-4:]
        old = messages[:-4]

        # Summarize older messages using LLM (one-time cost)
        summary = await summarize_conversation(old)
        await save_conversation_summary(farmer_id, summary)

        return [
            {"role": "system", "content": f"Previous conversation summary: {summary}"}
        ] + recent

    return messages
```

### Monthly Cost Estimate Per Farmer
| Task | Frequency | Tokens | Cost/Month |
|------|-----------|--------|-----------|
| Daily activity plan | 0 (deterministic) | 0 | $0 |
| Weather-adjusted plan | 0 (rule-based) | 0 | $0 |
| Disease diagnosis | ~2/month | 2,000 each | $0.02 |
| AI chat session | ~5/month | 3,000 each | $0.075 |
| Monthly summary | 1/month | 1,500 | $0.0075 |
| **TOTAL** | | | **~$0.10** |

---

## 10. Background RAG Update Tasks

```python
from celery import shared_task

@shared_task
def update_activity_rag_doc(project_id: str, activity_id: str):
    """Called when an activity is marked as done."""
    activity = get_activity(activity_id)
    project = get_project(project_id)

    content = f"""
Farming Activity Completed:
Date: {activity.completed_at.date()}
Type: {activity.activity_type}
Action: {activity.title}
Details: {format_activity_details(activity)}
Stage: {activity.stage.stage_name} (Day {get_day_in_project(project, activity.scheduled_date)})
Notes: {activity.notes or 'None'}
    """.strip()

    ingest_document(
        farmer_id=project.farmer_id,
        project_id=project_id,
        doc_type='activity_history',
        title=f"Activity: {activity.title} on {activity.completed_at.date()}",
        content=content,
        metadata={'date': str(activity.scheduled_date), 'type': activity.activity_type}
    )


@shared_task
def update_soil_rag_doc(soil_test_id: str):
    """Called after soil analysis is computed."""
    test = get_soil_test_with_results(soil_test_id)
    content = build_soil_summary_text(test)  # Human-readable summary
    ingest_document(
        farmer_id=test.farmer_id,
        project_id=test.project_id,
        doc_type='soil_profile',
        title=f"Soil Test: {test.test_date}",
        content=content,
        metadata={'test_date': str(test.test_date)}
    )


@shared_task
def seed_project_rag_documents(project_id: str):
    """Called when a project is created. Seeds plant knowledge."""
    project = get_project(project_id)
    plant = project.plant

    # Comprehensive plant guide
    content = build_plant_guide(plant)  # stages + care + nutrients + diseases
    ingest_document(
        farmer_id=project.farmer_id,
        project_id=project_id,
        doc_type='plant_info',
        title=f"Complete Guide: {plant.common_name}",
        content=content,
        metadata={'plant_id': str(plant.id)}
    )


@shared_task
def weekly_market_rag_update():
    """Every Sunday: update market summary docs for all active farmers."""
    for project in get_all_active_projects():
        summary = market_service.build_weekly_summary(project.plant_id, project.location.district)
        ingest_document(
            farmer_id=project.farmer_id,
            project_id=project.id,
            doc_type='market_summary',
            title=f"Market Summary: {project.plant.common_name} - Week of {today()}",
            content=summary
        )
```

---

## 11. AI for Disease Diagnosis (LLM Use Case)

```python
async def ai_diagnose_issue(issue_id: str):
    issue = get_issue(issue_id)
    project = get_project(issue.project_id)

    # Build context
    context = f"""
Plant: {project.plant.common_name} ({project.plant.scientific_name})
Current stage: {get_current_stage(project).stage_name}
Farmer reports: {issue.description}
Affected parts: {', '.join(issue.affected_parts)}
Affected area: {issue.affected_area_pct}% of crop
Stage-specific threats: {get_current_stage(project).watch_for}
Common diseases this stage: {get_common_diseases(project)}
    """

    response = await anthropic_client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=500,
        system="You are an expert plant pathologist. Return a JSON response only.",
        messages=[{
            "role": "user",
            "content": f"""
Diagnose the farming issue based on this context:
{context}

Return JSON:
{{
  "matched_disease": "disease name or null",
  "matched_pest": "pest name or null",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation",
  "immediate_action": "what to do RIGHT NOW"
}}
            """
        }]
    )

    diagnosis = json.loads(response.content[0].text)
    await update_issue_diagnosis(issue_id, diagnosis)
    return diagnosis
```
