from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from database import get_db
from dependencies import get_current_user
from models.account import Account
from . import schemas, service

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("", response_model=List[schemas.NotificationResponse])
async def get_notifications(
    limit: int = Query(50),
    unread_only: bool = Query(False),
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await service.get_notifications(db, current_user.id, limit, unread_only)

@router.patch("/{notification_id}/read", response_model=schemas.NotificationResponse)
async def mark_read(
    notification_id: uuid.UUID,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await service.mark_read(db, notification_id, current_user.id)

@router.patch("/read-all")
async def mark_all_read(
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await service.mark_all_read(db, current_user.id)
    return {"message": "All notifications marked as read"}

@router.get("/count", response_model=schemas.NotificationCount)
async def get_count(
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await service.get_unread_count(db, current_user.id)
