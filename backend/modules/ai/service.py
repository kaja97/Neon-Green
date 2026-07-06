"""
AI Service — Gemini integration with project context, intent classification,
rate limiting, and deterministic fallback.
"""
import re
import uuid
import json
import logging
from datetime import datetime, date, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException

from models.project import Project
from models.plant import Plant, PlantStage
from models.activity import ActivityPlan, FarmingActivity
from models.weather import WeatherCache
from models.soil import SoilTest, SoilNutrientResult
from models.ai import AIProjectSummary, AIConversation, AIQueryLog
from models.account import FarmerProfile
from config import settings

logger = logging.getLogger(__name__)

# ── Intent Classifier (regex-based, no tokens) ──────────────────────

INTENT_PATTERNS = {
    "weather": r"\b(weather|rain|temperature|humidity|forecast|wind|storm|drought|frost)\b",
    "disease": r"\b(disease|blight|wilt|rot|fungus|pest|insect|yellow|spots|leaves|curling|mildew)\b",
    "fertilizer": r"\b(fertilizer|nutrient|npk|nitrogen|phosphorus|potassium|urea|compost|manure|feed)\b",
    "watering": r"\b(water|irrigation|irrigat|drought|moisture|dry|wet)\b",
    "harvest": r"\b(harvest|yield|pick|ready|mature|ripe)\b",
    "soil": r"\b(soil|ph|acidity|alkaline|organic matter|clay|sandy|loam)\b",
}

def classify_intent(message: str) -> str:
    message_lower = message.lower()
    scores = {}
    for intent, pattern in INTENT_PATTERNS.items():
        matches = re.findall(pattern, message_lower)
        if matches:
            scores[intent] = len(matches)
    
    if scores:
        return max(scores, key=scores.get)
    return "general"

# ── Context Builder ──────────────────────────────────────────────────

async def build_project_context(db: AsyncSession, project_id: uuid.UUID) -> str:
    """Flatten project state into ~2000 token JSON context for Gemini."""
    project = await db.get(Project, project_id)
    if not project:
        return "{}"
    
    plant = await db.get(Plant, project.plant_id)
    
    # Current stage
    stages_res = await db.execute(
        select(PlantStage).where(PlantStage.plant_id == project.plant_id).order_by(PlantStage.stage_order)
    )
    stages = stages_res.scalars().all()
    
    days_since_planting = (date.today() - project.planting_date).days
    current_stage = None
    for s in stages:
        if s.start_day <= days_since_planting <= s.end_day:
            current_stage = s
            break
    
    # Today's activities
    plan_res = await db.execute(
        select(ActivityPlan).where(ActivityPlan.project_id == project_id, ActivityPlan.is_active == True)
    )
    plan = plan_res.scalars().first()
    
    pending_count = 0
    if plan:
        act_res = await db.execute(
            select(FarmingActivity)
            .where(FarmingActivity.plan_id == plan.id, FarmingActivity.status == "pending")
        )
        pending_count = len(act_res.scalars().all())
    
    # Latest soil test
    soil_res = await db.execute(
        select(SoilTest).where(SoilTest.project_id == project_id).order_by(SoilTest.test_date.desc()).limit(1)
    )
    latest_soil = soil_res.scalars().first()
    soil_info = None
    if latest_soil:
        nut_res = await db.execute(
            select(SoilNutrientResult).where(SoilNutrientResult.soil_test_id == latest_soil.id)
        )
        nut = nut_res.scalars().first()
        if nut:
            soil_info = {
                "ph": float(nut.ph_level), "nitrogen": nut.nitrogen_level,
                "phosphorus": nut.phosphorus_level, "potassium": nut.potassium_level
            }
    
    context = {
        "crop": plant.common_name if plant else "Unknown",
        "scientific_name": plant.scientific_name if plant else None,
        "farming_method": project.farming_method,
        "area": f"{float(project.area)} {project.area_unit}",
        "planting_date": project.planting_date.isoformat(),
        "days_since_planting": days_since_planting,
        "current_stage": current_stage.stage_name if current_stage else "Unknown",
        "total_growth_days": plant.growth_duration_days if plant else 0,
        "expected_harvest": project.expected_harvest_date.isoformat() if project.expected_harvest_date else None,
        "pending_activities": pending_count,
        "soil": soil_info,
        "status": project.status
    }
    
    return json.dumps(context, indent=2)

# ── Rate Limiter ─────────────────────────────────────────────────────

async def check_rate_limit(db: AsyncSession, farmer_id: uuid.UUID) -> bool:
    """Check if farmer has exceeded 10 AI calls per day."""
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    result = await db.execute(
        select(AIQueryLog)
        .join(AIConversation, AIQueryLog.conversation_id == AIConversation.id)
        .join(Project, AIConversation.project_id == Project.id)
        .where(Project.farmer_id == farmer_id, AIQueryLog.role == "user", AIQueryLog.created_at >= today_start)
    )
    count = len(result.scalars().all())
    return count < 10

# ── Deterministic Fallbacks ──────────────────────────────────────────

FALLBACK_RESPONSES = {
    "weather": "Based on the weather forecast for your area, I recommend checking the weather module for the latest 5-day forecast. If heavy rain is expected, consider delaying fertilizer application and ensuring proper drainage.",
    "disease": "Common symptoms like yellow spots or wilting leaves could indicate several diseases. Use the Disease Search feature to look up specific symptoms. Early Blight and Late Blight are common in this season. Always remove and destroy infected plant parts.",
    "fertilizer": "For your current growth stage, check the Activity Planner for specific fertilizer recommendations. Remember: organic methods use compost, vermicompost, and bio-fertilizers; conventional methods use synthetic NPK formulations.",
    "watering": "Water requirements vary by growth stage. Check your activity plan for the recommended daily water amount. As a general rule: water deeply but less frequently. Morning watering is best to reduce disease risk.",
    "harvest": "Monitor your crop for maturity indicators specific to the variety. Check the Farming Circle on your dashboard to see how close you are to the expected harvest date.",
    "soil": "Soil health is crucial. If you haven't done a soil test recently, submit one through the Soil Analysis feature. Ideal pH for most vegetables is 6.0-7.0.",
    "general": "I can help with questions about your crop's health, watering schedule, fertilizer needs, weather impacts, and disease identification. Try asking something specific about your farm!"
}

# ── Gemini API Call ──────────────────────────────────────────────────

async def call_gemini(context: str, message: str, intent: str) -> tuple[str, int]:
    """Call Gemini API with project context. Returns (response, tokens_used)."""
    api_key = settings.GOOGLE_AI_STUDIO_API_KEY
    
    if not api_key or api_key == "your-free-api-key":
        return FALLBACK_RESPONSES.get(intent, FALLBACK_RESPONSES["general"]), 0
    
    try:
        from google import genai
        
        client = genai.Client(api_key=api_key)
        
        system_prompt = f"""You are AgriFarm AI, a helpful farming assistant for Sri Lankan farmers.
You provide practical, actionable advice based on the farmer's specific context.
Keep responses concise (under 200 words). Use simple language.
Always consider the farmer's farming method (organic vs conventional) when recommending treatments.

FARMER'S CURRENT PROJECT CONTEXT:
{context}"""

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                {"role": "user", "parts": [{"text": f"{system_prompt}\n\nFarmer's question: {message}"}]}
            ]
        )
        
        text = response.text if response.text else FALLBACK_RESPONSES.get(intent, FALLBACK_RESPONSES["general"])
        tokens = response.usage_metadata.total_token_count if hasattr(response, 'usage_metadata') and response.usage_metadata else 0
        return text, tokens
        
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return FALLBACK_RESPONSES.get(intent, FALLBACK_RESPONSES["general"]), 0

# ── Main Chat Function ───────────────────────────────────────────────

async def chat(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID, message: str, conversation_id: uuid.UUID | None = None):
    """Process a chat message: classify intent, build context, call Gemini, save logs."""
    # Verify project ownership
    profile_res = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == account_id))
    profile = profile_res.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    
    project = await db.get(Project, project_id)
    if not project or project.farmer_id != profile.id:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Rate limit check
    if not await check_rate_limit(db, profile.id):
        raise HTTPException(status_code=429, detail="Daily AI query limit reached (10/day). Try again tomorrow.")
    
    # Get or create conversation
    if conversation_id:
        conv = await db.get(AIConversation, conversation_id)
        if not conv or conv.project_id != project_id:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conv = AIConversation(
            project_id=project_id,
            session_title=message[:50] + ("..." if len(message) > 50 else ""),
            is_active=True
        )
        db.add(conv)
        await db.flush()
    
    # Classify intent
    intent = classify_intent(message)
    
    # Build context
    context = await build_project_context(db, project_id)
    
    # Call Gemini (or fallback)
    ai_response, tokens = await call_gemini(context, message, intent)
    
    # Save query logs
    user_log = AIQueryLog(conversation_id=conv.id, role="user", content=message, tokens_used=0)
    ai_log = AIQueryLog(conversation_id=conv.id, role="model", content=ai_response, tokens_used=tokens)
    db.add_all([user_log, ai_log])
    
    await db.commit()
    
    return {
        "conversation_id": conv.id,
        "user_message": message,
        "ai_response": ai_response,
        "intent": intent,
        "tokens_used": tokens
    }

async def get_conversations(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
    profile_res = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == account_id))
    profile = profile_res.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    
    project = await db.get(Project, project_id)
    if not project or project.farmer_id != profile.id:
        raise HTTPException(status_code=404, detail="Project not found")
    
    result = await db.execute(
        select(AIConversation)
        .where(AIConversation.project_id == project_id)
        .order_by(AIConversation.created_at.desc())
    )
    return result.scalars().all()

async def get_conversation_messages(db: AsyncSession, conversation_id: uuid.UUID, account_id: uuid.UUID):
    conv = await db.get(AIConversation, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    result = await db.execute(
        select(AIQueryLog)
        .where(AIQueryLog.conversation_id == conversation_id)
        .order_by(AIQueryLog.created_at)
    )
    return result.scalars().all()

async def get_project_summary(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
    profile_res = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == account_id))
    profile = profile_res.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    
    project = await db.get(Project, project_id)
    if not project or project.farmer_id != profile.id:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check for existing summary
    result = await db.execute(
        select(AIProjectSummary).where(AIProjectSummary.project_id == project_id)
    )
    summary = result.scalars().first()
    
    if not summary:
        # Generate a fresh context-based summary
        context = await build_project_context(db, project_id)
        summary = AIProjectSummary(
            project_id=project_id,
            summary_json=json.loads(context),
            last_updated_at=datetime.now(timezone.utc)
        )
        db.add(summary)
        await db.commit()
        await db.refresh(summary)
    
    return summary
