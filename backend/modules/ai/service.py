"""
AI Service — Orchestrates context builder, intent classifier, Gemini client,
and rate limiting to provide farming assistance.
"""
import uuid
import json
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException

from models.project import Project
from models.ai import AIProjectSummary, AIConversation, AIQueryLog
from models.account import FarmerProfile

from .context_builder import build_project_context
from .intent_classifier import classify_intent
from .gemini_client import call_gemini
from .rate_limiter import check_rate_limit
from .response_parser import parse_ai_response

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
    
    # Rate limit check (using the 'chat' quota bucket)
    if not await check_rate_limit(profile.id, "chat"):
        raise HTTPException(status_code=429, detail="Daily AI chat limit reached. Try again tomorrow.")
    
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
    
    # Call Gemini
    ai_response, tokens = await call_gemini(context, message, intent)
    parsed = parse_ai_response(ai_response)
    
    # Save query logs
    user_log = AIQueryLog(conversation_id=conv.id, role="user", content=message, tokens_used=0)
    ai_log = AIQueryLog(conversation_id=conv.id, role="model", content=parsed["text"], tokens_used=tokens)
    db.add_all([user_log, ai_log])
    
    await db.commit()
    
    return {
        "conversation_id": conv.id,
        "user_message": message,
        "ai_response": parsed["text"],
        "structured": parsed["structured"],
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
    
    # Rate limit check (using the 'refresh' quota bucket)
    if not await check_rate_limit(profile.id, "refresh"):
        raise HTTPException(status_code=429, detail="Daily AI refresh limit reached.")
        
    # Generate a fresh context-based summary
    context = await build_project_context(db, project_id)
    
    # Check for existing summary
    result = await db.execute(
        select(AIProjectSummary).where(AIProjectSummary.project_id == project_id)
    )
    summary = result.scalars().first()
    
    if not summary:
        summary = AIProjectSummary(
            project_id=project_id,
            summary_json=json.loads(context),
            last_updated_at=datetime.now(timezone.utc)
        )
        db.add(summary)
    else:
        summary.summary_json = json.loads(context)
        summary.last_updated_at = datetime.now(timezone.utc)
        
    await db.commit()
    await db.refresh(summary)
    
    return summary
