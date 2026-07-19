from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
import uuid

from models.notification import Notification
from models.account import FarmerProfile
from core.base_service import BaseService
from modules.auth.repository import FarmerProfileRepository
from .repository import NotificationRepository

class NotificationService(BaseService):
    def __init__(
        self,
        profile_repo: FarmerProfileRepository,
        notification_repo: NotificationRepository
    ):
        super().__init__()
        self.profile_repo = profile_repo
        self.notification_repo = notification_repo

    async def _get_farmer_id(self, db: AsyncSession, account_id: uuid.UUID) -> uuid.UUID:
        result = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == account_id))
        profile = result.scalars().first()
        if not profile:
            raise HTTPException(status_code=404, detail="Farmer profile not found")
        return profile.id

    async def get_notifications(self, db: AsyncSession, account_id: uuid.UUID, limit: int = 50, unread_only: bool = False):
        farmer_id = await self._get_farmer_id(db, account_id)
        return await self.notification_repo.get_by_farmer(db, farmer_id, limit, unread_only)

    async def mark_read(self, db: AsyncSession, notification_id: uuid.UUID, account_id: uuid.UUID):
        farmer_id = await self._get_farmer_id(db, account_id)
        
        notification = await self.notification_repo.get(db, notification_id)
        if not notification or notification.farmer_id != farmer_id:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        notification.is_read = True
        await db.commit()
        return notification

    async def mark_all_read(self, db: AsyncSession, account_id: uuid.UUID):
        farmer_id = await self._get_farmer_id(db, account_id)
        
        notifications = await self.notification_repo.get_unread_by_farmer(db, farmer_id)
        for n in notifications:
            n.is_read = True
        
        await db.commit()

    async def get_unread_count(self, db: AsyncSession, account_id: uuid.UUID):
        farmer_id = await self._get_farmer_id(db, account_id)
        
        total, unread = await self.notification_repo.get_counts(db, farmer_id)
        
        return {"unread": unread, "total": total}

    async def create_notification(self, db: AsyncSession, farmer_id: uuid.UUID, title: str, message: str,
                                  notification_type: str = "info", project_id: uuid.UUID | None = None):
        """Utility to create a notification (called by other modules)."""
        n = Notification(
            farmer_id=farmer_id,
            title=title,
            message=message,
            type=notification_type,
            project_id=project_id
        )
        db.add(n)
        await db.flush()
        return n
