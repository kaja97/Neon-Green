from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import uuid

from database import get_db
from dependencies import get_current_user, get_market_service
from models.account import Account
from core.response import success_response
from . import schemas
from .service import MarketService

router = APIRouter(prefix="/market", tags=["market"])

@router.get("/prices/{plant_id}", status_code=200)
async def get_prices(
    plant_id: uuid.UUID,
    region: Optional[str] = Query(None),
    days: int = Query(30),
    db: AsyncSession = Depends(get_db),
    market_service: MarketService = Depends(get_market_service)
):
    prices = await market_service.get_prices(db, plant_id, region, days)
    return success_response([schemas.PriceResponse.model_validate(p).model_dump() for p in prices])

@router.get("/trends/{plant_id}", status_code=200)
async def get_trend(
    plant_id: uuid.UUID,
    region: str = Query("Jaffna"),
    db: AsyncSession = Depends(get_db),
    market_service: MarketService = Depends(get_market_service)
):
    data = await market_service.get_trend(db, plant_id, region)
    return success_response(data)

@router.get("/estimate/{project_id}", status_code=200)
async def estimate_revenue(
    project_id: uuid.UUID,
    region: str = Query("Jaffna"),
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    market_service: MarketService = Depends(get_market_service)
):
    data = await market_service.estimate_revenue(db, project_id, current_user.id, region)
    return success_response(data)
