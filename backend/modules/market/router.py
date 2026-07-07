from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import uuid

from database import get_db
from dependencies import get_current_user
from models.account import Account
from core.service_gating import require_project_service
from . import schemas, service

router = APIRouter(prefix="/market", tags=["market"])

@router.get("/prices/{plant_id}", response_model=List[schemas.PriceResponse])
async def get_prices(
    plant_id: uuid.UUID,
    region: Optional[str] = Query(None),
    days: int = Query(30),
    db: AsyncSession = Depends(get_db)
):
    return await service.get_prices(db, plant_id, region, days)

@router.get("/trends/{plant_id}", response_model=schemas.TrendResponse)
async def get_trend(
    plant_id: uuid.UUID,
    region: str = Query("Jaffna"),
    db: AsyncSession = Depends(get_db)
):
    return await service.get_trend(db, plant_id, region)

@router.get("/estimate/{project_id}", response_model=schemas.RevenueEstimate)
async def estimate_revenue(
    project_id: uuid.UUID,
    region: str = Query("Jaffna"),
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await require_project_service(db, current_user.id, project_id, "market_price")
    return await service.estimate_revenue(db, project_id, current_user.id, region)
