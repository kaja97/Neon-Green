# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, status
# pyrefly: ignore [missing-import]
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from database import get_db
from dependencies import get_current_user
from models.account import Account
from core.response import success_response
from . import schemas, service

router = APIRouter(prefix="/planner", tags=["planner"])

@router.get("/{project_id}/today", status_code=200)
async def get_today_activities(project_id: uuid.UUID, current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    activities = await service.get_today_activities(db, project_id, current_user.id)
    return success_response([schemas.ActivityResponse.model_validate(a).model_dump() for a in activities])

@router.get("/{project_id}/activities", status_code=200)
async def list_activities(project_id: uuid.UUID, current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    activities = await service.list_activities(db, project_id, current_user.id)
    return success_response([schemas.ActivityResponse.model_validate(a).model_dump() for a in activities])

@router.post("/{project_id}/activities", status_code=201)
async def create_activity(project_id: uuid.UUID, data: schemas.ActivityCreate, current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    activity = await service.create_activity(db, project_id, current_user.id, data)
    return success_response(schemas.ActivityResponse.model_validate(activity).model_dump())

@router.put("/activities/{activity_id}", status_code=200)
async def update_activity(activity_id: uuid.UUID, data: schemas.ActivityUpdate, current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    activity = await service.update_activity(db, activity_id, current_user.id, data)
    return success_response(schemas.ActivityResponse.model_validate(activity).model_dump())

@router.delete("/activities/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_activity(activity_id: uuid.UUID, current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await service.delete_activity(db, activity_id, current_user.id)
    return None

@router.patch("/activities/{activity_id}/complete", status_code=200)
async def mark_activity_complete(activity_id: uuid.UUID, data: schemas.CompleteRequest, current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    activity = await service.mark_complete(db, activity_id, current_user.id, data)
    return success_response(schemas.ActivityResponse.model_validate(activity).model_dump())

@router.patch("/activities/{activity_id}/skip", status_code=200)
async def mark_activity_skip(activity_id: uuid.UUID, data: schemas.SkipRequest, current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    activity = await service.mark_skip(db, activity_id, current_user.id, data)
    return success_response(schemas.ActivityResponse.model_validate(activity).model_dump())

@router.post("/activities/{activity_id}/reset", status_code=200)
async def reset_activity(activity_id: uuid.UUID, current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    activity = await service.reset_activity(db, activity_id, current_user.id)
    return success_response(schemas.ActivityResponse.model_validate(activity).model_dump())
