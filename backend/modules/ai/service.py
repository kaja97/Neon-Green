import uuid
import json
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException

from models.project import Project
from models.ai import AIProjectSummary, AIConversation, AIQueryLog
from models.account import FarmerProfile
from core.base_service import BaseService
from modules.auth.repository import FarmerProfileRepository
from modules.project.repository import ProjectRepository
from .repository import AIConversationRepository, AIQueryLogRepository, AIProjectSummaryRepository

from .context_builder import build_project_context
from .intent_classifier import classify_intent
from .gemini_client import call_gemini
from .response_parser import parse_ai_response

class AIService(BaseService):
    def __init__(
        self,
        profile_repo: FarmerProfileRepository,
        project_repo: ProjectRepository,
        conv_repo: AIConversationRepository,
        log_repo: AIQueryLogRepository,
        summary_repo: AIProjectSummaryRepository
    ):
        super().__init__()
        self.profile_repo = profile_repo
        self.project_repo = project_repo
        self.conv_repo = conv_repo
        self.log_repo = log_repo
        self.summary_repo = summary_repo

    async def _get_farmer_id(self, db: AsyncSession, account_id: uuid.UUID) -> uuid.UUID:
        result = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == account_id))
        profile = result.scalars().first()
        if not profile:
            raise HTTPException(status_code=404, detail="Farmer profile not found")
        return profile.id

    async def chat(self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID, message: str, conversation_id: uuid.UUID | None = None):
        profile_id = await self._get_farmer_id(db, account_id)
        project = await self.project_repo.get(db, project_id)
        if not project or project.farmer_id != profile_id:
            raise HTTPException(status_code=404, detail="Project not found")
        
        
        if conversation_id:
            conv = await self.conv_repo.get(db, conversation_id)
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
        
        intent, needs_calculation = classify_intent(message)
        context = await build_project_context(db, project_id, intent=intent)
        ai_response, tokens = await call_gemini(context, message, intent, needs_calculation)
        parsed = parse_ai_response(ai_response)
        
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
            "needs_calculation": needs_calculation,
            "tokens_used": tokens
        }

    async def get_conversations(self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
        profile_id = await self._get_farmer_id(db, account_id)
        project = await self.project_repo.get(db, project_id)
        if not project or project.farmer_id != profile_id:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return await self.conv_repo.get_by_project(db, project_id)

    async def get_conversation_messages(self, db: AsyncSession, conversation_id: uuid.UUID, account_id: uuid.UUID):
        conv = await self.conv_repo.get(db, conversation_id)
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        return await self.log_repo.get_by_conversation(db, conversation_id)

    async def get_project_summary(self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
        profile_id = await self._get_farmer_id(db, account_id)
        project = await self.project_repo.get(db, project_id)
        if not project or project.farmer_id != profile_id:
            raise HTTPException(status_code=404, detail="Project not found")
        
        
        context = await build_project_context(db, project_id)
        summary = await self.summary_repo.get_by_project(db, project_id)
        
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
