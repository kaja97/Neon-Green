from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.base_repository import BaseRepository
from models.ai import AIConversation, AIQueryLog, AIProjectSummary
import uuid

class AIConversationRepository(BaseRepository[AIConversation, None, None]):
    def __init__(self):
        super().__init__(AIConversation)

    async def get_by_project(self, db: AsyncSession, project_id: uuid.UUID):
        result = await db.execute(
            select(self.model)
            .where(self.model.project_id == project_id)
            .order_by(self.model.created_at.desc())
        )
        return result.scalars().all()

class AIQueryLogRepository(BaseRepository[AIQueryLog, None, None]):
    def __init__(self):
        super().__init__(AIQueryLog)

    async def get_by_conversation(self, db: AsyncSession, conversation_id: uuid.UUID):
        result = await db.execute(
            select(self.model)
            .where(self.model.conversation_id == conversation_id)
            .order_by(self.model.created_at)
        )
        return result.scalars().all()

class AIProjectSummaryRepository(BaseRepository[AIProjectSummary, None, None]):
    def __init__(self):
        super().__init__(AIProjectSummary)

    async def get_by_project(self, db: AsyncSession, project_id: uuid.UUID):
        result = await db.execute(
            select(self.model).where(self.model.project_id == project_id)
        )
        return result.scalars().first()
