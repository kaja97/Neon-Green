from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from database import get_db
from dependencies import get_current_user, get_notification_service
from models.account import Account
from core.response import success_response, message_response
from . import schemas
from .service import NotificationService

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("", status_code=200)
async def get_notifications(
    limit: int = Query(50),
    unread_only: bool = Query(False),
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    notification_service: NotificationService = Depends(get_notification_service)
):
    notifications = await notification_service.get_notifications(db, current_user.id, limit, unread_only)
    return success_response([schemas.NotificationResponse.model_validate(n).model_dump() for n in notifications])

@router.patch("/{notification_id}/read", status_code=200)
async def mark_read(
    notification_id: uuid.UUID,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    notification_service: NotificationService = Depends(get_notification_service)
):
    notification = await notification_service.mark_read(db, notification_id, current_user.id)
    return success_response(schemas.NotificationResponse.model_validate(notification).model_dump())

@router.patch("/read-all", status_code=200)
async def mark_all_read(
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    notification_service: NotificationService = Depends(get_notification_service)
):
    await notification_service.mark_all_read(db, current_user.id)
    return message_response("All notifications marked as read")

@router.get("/count", status_code=200)
async def get_count(
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    notification_service: NotificationService = Depends(get_notification_service)
):
    count = await notification_service.get_unread_count(db, current_user.id)
    return success_response(schemas.NotificationCount.model_validate(count).model_dump())
