from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from fastapi import HTTPException
import uuid
from datetime import datetime, timezone

from models.notification import Notification
from models.account import FarmerProfile

async def _get_farmer_id(db: AsyncSession, account_id: uuid.UUID) -> uuid.UUID:
    result = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == account_id))
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    return profile.id

async def get_notifications(db: AsyncSession, account_id: uuid.UUID, limit: int = 50, unread_only: bool = False):
    farmer_id = await _get_farmer_id(db, account_id)
    
    query = select(Notification).where(Notification.farmer_id == farmer_id)
    
    if unread_only:
        query = query.where(Notification.is_read == False)
    
    query = query.order_by(Notification.created_at.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def mark_read(db: AsyncSession, notification_id: uuid.UUID, account_id: uuid.UUID):
    farmer_id = await _get_farmer_id(db, account_id)
    
    notification = await db.get(Notification, notification_id)
    if not notification or notification.farmer_id != farmer_id:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    await db.commit()
    return notification

async def mark_all_read(db: AsyncSession, account_id: uuid.UUID):
    farmer_id = await _get_farmer_id(db, account_id)
    
    result = await db.execute(
        select(Notification).where(Notification.farmer_id == farmer_id, Notification.is_read == False)
    )
    for n in result.scalars().all():
        n.is_read = True
    
    await db.commit()

async def get_unread_count(db: AsyncSession, account_id: uuid.UUID):
    farmer_id = await _get_farmer_id(db, account_id)
    
    total_res = await db.execute(
        select(func.count()).select_from(Notification).where(Notification.farmer_id == farmer_id)
    )
    total = total_res.scalar() or 0
    
    unread_res = await db.execute(
        select(func.count()).select_from(Notification).where(
            Notification.farmer_id == farmer_id, Notification.is_read == False
        )
    )
    unread = unread_res.scalar() or 0
    
    return {"unread": unread, "total": total}

async def create_notification(db: AsyncSession, farmer_id: uuid.UUID, title: str, message: str,
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
