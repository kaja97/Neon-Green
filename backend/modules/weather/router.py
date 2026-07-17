from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from database import get_db
from dependencies import get_current_user, get_weather_service
from models.account import Account
from core.response import success_response
from . import schemas
from .service import WeatherService

router = APIRouter(prefix="/weather", tags=["weather"])

@router.get("/{project_id}", status_code=200)
async def get_weather(
    project_id: uuid.UUID,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    weather_service: WeatherService = Depends(get_weather_service)
):
    data = await weather_service.get_weather_for_project(db, project_id, current_user.id)
    return success_response(data.model_dump(mode="json"))

@router.get("/{project_id}/alerts", status_code=200)
async def get_alerts(
    project_id: uuid.UUID,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    weather_service: WeatherService = Depends(get_weather_service)
):
    alerts = await weather_service.get_alerts_for_project(db, project_id, current_user.id)
    return success_response([schemas.AlertResponse.model_validate(a).model_dump() for a in alerts])
