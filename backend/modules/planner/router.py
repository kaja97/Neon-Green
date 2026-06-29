# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends
# pyrefly: ignore [missing-import]
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from database import get_db
from dependencies import get_current_user
from models.account import Account
from . import schemas, service

router = APIRouter(prefix="/planner", tags=["planner"])

@router.get("/{project_id}/today", response_model=List[schemas.ActivityResponse])
async def get_today_activities(project_id: uuid.UUID, current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await service.get_today_activities(db, project_id, current_user.id)

@router.get("/{project_id}/activities", response_model=List[schemas.ActivityResponse])
async def list_activities(project_id: uuid.UUID, current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await service.list_activities(db, project_id, current_user.id)

@router.patch("/activities/{activity_id}/complete", response_model=schemas.ActivityResponse)
async def mark_activity_complete(activity_id: uuid.UUID, data: schemas.CompleteRequest, current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await service.mark_complete(db, activity_id, current_user.id, data)

@router.patch("/activities/{activity_id}/skip", response_model=schemas.ActivityResponse)
async def mark_activity_skip(activity_id: uuid.UUID, data: schemas.SkipRequest, current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await service.mark_skip(db, activity_id, current_user.id, data)
