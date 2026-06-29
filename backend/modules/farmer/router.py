from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from database import get_db
from dependencies import get_current_user
from models.account import Account
from .schemas import (
    FarmerProfileUpdate, FarmerProfileResponse,
    LocationCreate, LocationResponse,
    LandDetailCreate, LandDetailResponse
)
from . import service

router = APIRouter(prefix="/farmer", tags=["farmer"])

@router.get("/profile", response_model=FarmerProfileResponse)
async def get_profile(db: AsyncSession = Depends(get_db), current_user: Account = Depends(get_current_user)):
    return await service.get_profile(db, current_user.id)

@router.put("/profile", response_model=FarmerProfileResponse)
async def update_profile(
    update_data: FarmerProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user)
):
    return await service.update_profile(db, current_user.id, update_data)

@router.post("/locations", response_model=LocationResponse)
async def create_location(
    location_data: LocationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user)
):
    return await service.create_location(db, current_user.id, location_data)

@router.get("/locations", response_model=List[LocationResponse])
async def list_locations(
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user)
):
    return await service.list_locations(db, current_user.id)

@router.post("/land", response_model=LandDetailResponse)
async def create_land_detail(
    land_data: LandDetailCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user)
):
    return await service.create_land_detail(db, current_user.id, land_data)

@router.get("/land", response_model=List[LandDetailResponse])
async def list_land_details(
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user)
):
    return await service.list_land_details(db, current_user.id)
