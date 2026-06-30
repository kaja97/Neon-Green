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

router = APIRouter(prefix="/weather", tags=["weather"])

@router.get("/{project_id}", response_model=schemas.WeatherResponse)
async def get_weather(project_id: uuid.UUID, current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await service.get_weather_for_project(db, project_id, current_user.id)

@router.get("/{project_id}/alerts", response_model=List[schemas.AlertResponse])
async def get_alerts(project_id: uuid.UUID, current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await service.get_alerts_for_project(db, project_id, current_user.id)
