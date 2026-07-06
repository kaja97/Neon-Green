from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from dependencies import get_current_user
from models.account import Account, FarmerProfile
from models.farmer import FarmerLocation, FarmerLandDetail
from .schemas import (
    FarmerProfileUpdate, FarmerProfileResponse,
    LocationCreate, LocationResponse,
    LandDetailCreate, LandDetailResponse
)
from typing import List

router = APIRouter(prefix="/farmer", tags=["farmer"])

@router.get("/profile", response_model=FarmerProfileResponse)
async def get_profile(current_user: Account = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == current_user.id))
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.put("/profile", response_model=FarmerProfileResponse)
async def update_profile(
    profile_update: FarmerProfileUpdate,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == current_user.id))
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = profile_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    await db.commit()
    await db.refresh(profile)
    return profile

@router.post("/locations", response_model=LocationResponse)
async def add_location(
    location_data: LocationCreate,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == current_user.id))
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if location_data.is_primary:
        locs_result = await db.execute(select(FarmerLocation).where(FarmerLocation.farmer_id == profile.id))
        for loc in locs_result.scalars().all():
            loc.is_primary = False

    new_location = FarmerLocation(
        farmer_id=profile.id,
        name=location_data.name,
        address=location_data.address,
        district=location_data.district,
        latitude=location_data.latitude,
        longitude=location_data.longitude,
        is_primary=location_data.is_primary
    )
    db.add(new_location)
    await db.commit()
    await db.refresh(new_location)
    return new_location

@router.get("/locations", response_model=List[LocationResponse])
async def get_locations(
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == current_user.id))
    profile = result.scalars().first()
    if not profile:
        return []

    locs_result = await db.execute(select(FarmerLocation).where(FarmerLocation.farmer_id == profile.id))
    return locs_result.scalars().all()

@router.post("/land", response_model=LandDetailResponse)
async def add_land_detail(
    land_data: LandDetailCreate,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == current_user.id))
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Verify location belongs to this farmer
    loc_result = await db.execute(
        select(FarmerLocation).where(FarmerLocation.id == land_data.location_id, FarmerLocation.farmer_id == profile.id)
    )
    if not loc_result.scalars().first():
        raise HTTPException(status_code=404, detail="Location not found")

    new_land = FarmerLandDetail(
        farmer_id=profile.id,
        location_id=land_data.location_id,
        total_area=land_data.total_area,
        area_unit=land_data.area_unit,
        soil_type=land_data.soil_type,
        irrigation_type=land_data.irrigation_type
    )
    db.add(new_land)
    await db.commit()
    await db.refresh(new_land)
    return new_land

@router.get("/land", response_model=List[LandDetailResponse])
async def get_land_details(
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == current_user.id))
    profile = result.scalars().first()
    if not profile:
        return []

    result = await db.execute(select(FarmerLandDetail).where(FarmerLandDetail.farmer_id == profile.id))
    return result.scalars().all()
