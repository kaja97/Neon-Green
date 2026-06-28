# AgriFarm AI — RAG & MCP Strategy

## Overview

The AI layer is the most critical and most expensive part of the system.
This document defines exactly when we use AI, when we don't, and how the RAG + MCP architecture works.

---

## Golden Rule: AI is the Last Resort

```
User Question / Task
        ↓
Can a deterministic function handle this?
  YES → Use the function (0 tokens, instant)
  NO  ↓
Can we answer from structured DB data?
  YES → Format DB data as response (0 tokens)
  NO  ↓
Can we answer from RAG retrieval alone (no generation)?
  YES → Return top RAG chunks directly
  NO  ↓
Call LLM with RAG context + MCP tools (costs tokens)
```

---

## Per-Farmer RAG Architecture

### Concept
Every farmer has their own "knowledge bubble" — a private vector store built from their specific farm data. When the LLM is called, it retrieves relevant context from this private store instead of guessing.

```
[Farmer's RAG Knowledge Base]
         │
┌────────┼──────────────────────────────────┐
│        │                                  │
│  Personal Context          General Context │
│  - Soil test results       - Plant info    │
│  - Activity history        - Disease DB    │
│  - Previous solutions      - Market data   │
│  - Farm location/climate   - Agri guides   │
│  - Crop outcomes           - Fertilizer DB │
│  - Own notes               - Local weather │
└────────────────────────────────────────────┘
         │
   [pgvector index]
         │
   Cosine similarity search on farmer's chunks
```

### RAG Document Types & Sources

| Document Type | Trigger | Content | Update Frequency |
|---------------|---------|---------|-----------------|
| `plant_info` | Project created | Full plant guide (stages, care, nutrients) | Once |
| `soil_profile` | Soil test added | Soil analysis + gap recommendations | Per test |
| `activity_history` | Activity completed | Log of what was done and when | Daily |
| `issue_log` | Issue reported + resolved | Problem description + solution applied | Per issue |
| `weather_summary` | Monthly | Monthly weather pattern summary | Monthly |
| `market_summary` | Weekly | Price trends for farmer's crops | Weekly |
| `farmer_notes` | Farmer uses AI chat | Anything farmer shares about their farm | Per conversation |
| `agronomist_advice` | Admin uploads | Expert guidance for local conditions | As available |

### Chunking Strategy

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,      # tokens per chunk
    chunk_overlap=50,    # token overlap between chunks
    separators=["\n\n", "\n", ".", " "]
)

# For structured data (soil results), use smaller chunks
soil_splitter = RecursiveCharacterTextSplitter(
    chunk_size=200,
    chunk_overlap=20
)
```

### Embedding Model
- **Primary:** `text-embedding-3-small` (OpenAI) — 1536 dimensions, cheap ($0.02/1M tokens)
- **Fallback:** `voyage-lite-02-instruct` (Voyage AI) — agriculture domain performs better
- Store dimension count in config so we can swap models

### Retrieval Strategy

```python
async def smart_retrieval(farmer_id, project_id, query, intent):
    """
    Multi-query retrieval with intent-specific filters
    """
    results = []
    
    # 1. Primary semantic search
    primary = await vector_search(
        farmer_id=farmer_id,
        query=query,
        filter={'project_id': project_id},
        top_k=3
    )
    results.extend(primary)
    
    # 2. Intent-specific boosting
    if intent == 'disease':
        disease_docs = await vector_search(
            farmer_id=farmer_id,
            query=query,
            filter={'document_type': ['plant_info', 'issue_log']},
            top_k=2
        )
        results.extend(disease_docs)
    
    if intent == 'market':
        market_docs = await vector_search(
            farmer_id=farmer_id,
            query=query,
            filter={'document_type': 'market_summary'},
            top_k=2
        )
        results.extend(market_docs)
    
    # 3. Deduplicate and rank
    unique_results = deduplicate_by_chunk_id(results)
    ranked = sorted(unique_results, key=lambda x: x.similarity, reverse=True)
    
    return ranked[:5]  # top 5 chunks for context
```

---

## Per-Farmer MCP Server Architecture

### What is the MCP Server Here?
Each farmer gets a **virtual MCP server** — it's a session-scoped object (not a persistent process) that:
1. Knows the farmer's context (id, active project, farming method)
2. Exposes tools that the LLM can call to fetch real-time data
3. Routes tool calls to the correct backend service
4. Assembles context for the LLM efficiently

### MCP Session Lifecycle

```
Farmer opens AI Chat
        ↓
Create MCP session:
  - Load farmer_profile
  - Load active project context
  - Initialize tool registry
        ↓
LLM receives system prompt with farmer context
        ↓
LLM calls tools as needed (weather, soil, market, RAG search)
        ↓
MCP routes to correct service, returns structured data
        ↓
LLM assembles answer using tool results + RAG context
        ↓
Session closed (tools released)
```

### MCP Server Implementation

```python
from mcp import Server, Tool
from mcp.types import TextContent

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
            """Get today's scheduled farming activities with full details."""
            return await planner_service.get_today(self.project_id)
        
        @self.server.tool()
        async def get_soil_status():
            """Get latest soil test results and nutrient recommendations."""
            return await soil_service.get_latest(self.project_id)
        
        @self.server.tool()
        async def search_knowledge(query: str):
            """Search farmer's personal knowledge base for relevant information."""
            return await rag_service.retrieve_context(
                self.farmer_id, query, self.project_id
            )
        
        @self.server.tool()
        async def get_disease_solutions(disease_name: str, farming_method: str):
            """Get treatment solutions for a specific disease or pest."""
            return await disease_service.get_solutions(disease_name, farming_method)
        
        @self.server.tool()
        async def get_market_prices():
            """Get current market prices for crops in the farmer's district."""
            return await market_service.get_for_project(self.project_id)
        
        @self.server.tool()
        async def save_note(note: str):
            """Save an observation or note to the farmer's knowledge base."""
            await rag_service.ingest_note(self.farmer_id, self.project_id, note)
            return {"saved": True}
```

### System Prompt Template (LLM Context)

```python
def build_system_prompt(farmer, project, stage, soil_summary, weather_today):
    return f"""
You are a personal AI farming assistant for {farmer.full_name}.

## Farmer Profile
- Location: {farmer.district}, {farmer.province}
- Farming experience: {farmer.experience_years} years
- Preferred language: {farmer.primary_language}
- Farming method: {project.farming_method} (IMPORTANT: only recommend {project.farming_method} solutions)

## Current Project
- Crop: {project.plant.common_name} ({project.plant.local_name})
- Area: {project.area} {project.area_unit} ({project.plant_count} plants)
- Started: {project.planting_date}
- Current stage: {stage.stage_name} (Day {stage.current_day} of {stage.end_day})
- Stage key activities: {stage.key_activities}
- Watch for this stage: {stage.watch_for}

## Today's Weather
{weather_today}

## Recent Soil Status
{soil_summary}

## Your Rules
1. ALWAYS give specific, actionable advice — quantities, timings, products
2. If you don't know something, use the search_knowledge tool
3. NEVER recommend {opposite_method} products — farmer uses {project.farming_method}
4. Give dosages scaled to {project.area} {project.area_unit}
5. If you see a disease or pest risk, suggest preventive action proactively
6. Be concise. Farmers are busy. Lead with the action, explain briefly.
7. Use simple language appropriate for a farmer — avoid jargon

Answer in {farmer.primary_language}.
"""
```

---

## Cost Control Implementation

### Token Budget per Request

```python
MAX_INPUT_TOKENS = 4000   # system prompt + history + context
MAX_OUTPUT_TOKENS = 800   # enough for good farming advice

# Context trimming — if conversation gets long, summarize
async def trim_conversation(messages, farmer_id):
    total_tokens = count_tokens(messages)
    
    if total_tokens > 3000:
        # Summarize older messages
        old_messages = messages[:-4]  # keep last 4 turns fresh
        summary = await summarize_conversation(old_messages)
        
        # Store summary in DB
        await save_conversation_summary(farmer_id, summary)
        
        # Replace with summary message
        trimmed = [
            {"role": "system", "content": f"Previous conversation summary: {summary}"}
        ] + messages[-4:]
        return trimmed
    
    return messages
```

### Daily AI Budget Guard

```python
DAILY_TOKEN_LIMIT_PER_FARMER = 50_000  # ~$0.15/day/farmer

async def check_ai_budget(farmer_id) -> bool:
    today_usage = await get_today_token_usage(farmer_id)
    
    if today_usage > DAILY_TOKEN_LIMIT_PER_FARMER:
        # Fall back to deterministic answers only
        await log_budget_exceeded(farmer_id)
        return False
    
    return True
```

### Intent Classifier (Avoid LLM for Simple Questions)

```python
DETERMINISTIC_INTENTS = {
    r'(water|irrigat|how much water)': 'watering_details',
    r'(weather|rain|forecast|temperature)': 'weather_info',
    r'(price|market|sell|selling)': 'market_price',
    r'(today|activity|task|schedule|plan)': 'todays_plan',
    r'(fertiliz|nutrient|npk|urea|compost)': 'fertilizer_schedule',
    r'(harvest|when.*harvest|harvest.*when)': 'harvest_date',
}

def classify_intent(message: str) -> str | None:
    for pattern, intent in DETERMINISTIC_INTENTS.items():
        if re.search(pattern, message.lower()):
            return intent
    return 'llm_required'  # Only then call LLM
```

---

## RAG Update Pipeline (Background Jobs)

```python
# Celery tasks for RAG maintenance

@celery.task
def update_activity_rag_doc(project_id, activity_id):
    """Called when activity is marked as done."""
    activity = get_activity(activity_id)
    content = f"""
Activity completed on {activity.completed_at}:
- Type: {activity.activity_type}
- Action: {activity.title}
- Details: {format_activity_details(activity.details)}
- Notes: {activity.notes or 'None'}
"""
    ingest_rag_document(
        farmer_id=activity.project.farmer_id,
        project_id=project_id,
        doc_type='activity_history',
        content=content,
        metadata={'date': str(activity.scheduled_date), 'type': activity.activity_type}
    )

@celery.task
def update_soil_rag_doc(soil_test_id):
    """Called when soil test is analyzed."""
    test = get_soil_test(soil_test_id)
    content = build_soil_summary_text(test)
    ingest_rag_document(
        farmer_id=test.farmer_id,
        project_id=test.project_id,
        doc_type='soil_profile',
        content=content
    )

@celery.task
def weekly_market_rag_update():
    """Runs every Sunday — updates market summaries for all farmers."""
    for farmer in get_all_farmers():
        projects = get_active_projects(farmer.id)
        for project in projects:
            market_data = market_service.get_weekly_summary(project.plant_id)
            ingest_rag_document(
                farmer_id=farmer.id,
                project_id=project.id,
                doc_type='market_summary',
                content=market_data
            )
```
