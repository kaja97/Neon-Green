from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from core.base_repository import BaseRepository
from models.notification import Notification
import uuid

class NotificationRepository(BaseRepository[Notification, None, None]):
    def __init__(self):
        super().__init__(Notification)

    async def get_by_farmer(self, db: AsyncSession, farmer_id: uuid.UUID, limit: int = 50, unread_only: bool = False):
        query = select(self.model).where(self.model.farmer_id == farmer_id)
        
        if unread_only:
            query = query.where(self.model.is_read == False)
        
        query = query.order_by(self.model.created_at.desc()).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()

    async def get_unread_by_farmer(self, db: AsyncSession, farmer_id: uuid.UUID):
        result = await db.execute(
            select(self.model).where(self.model.farmer_id == farmer_id, self.model.is_read == False)
        )
        return result.scalars().all()

    async def get_counts(self, db: AsyncSession, farmer_id: uuid.UUID):
        total_res = await db.execute(
            select(func.count()).select_from(self.model).where(self.model.farmer_id == farmer_id)
        )
        total = total_res.scalar() or 0
        
        unread_res = await db.execute(
            select(func.count()).select_from(self.model).where(
                self.model.farmer_id == farmer_id, self.model.is_read == False
            )
        )
        unread = unread_res.scalar() or 0
        
        return total, unread
