from fastapi import APIRouter, Depends, HTTPException, status
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

    # If is_primary is true, we should unset others. Simple approach is skipping that for now
    # or updating others to False.
    if location_data.is_primary:
        # Fetch all and set to False
        locs_result = await db.execute(select(FarmerLocation).where(FarmerLocation.farmer_profile_id == profile.id))
        for loc in locs_result.scalars().all():
            loc.is_primary = False

    new_location = FarmerLocation(
        farmer_profile_id=profile.id,
        **location_data.model_dump()
    )
    db.add(new_location)
    await db.commit()
    await db.refresh(new_location)
    return new_location

@router.get("/locations", response_model=list[LocationResponse])
async def get_locations(
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == current_user.id))
    profile = result.scalars().first()
    if not profile:
        return []

    locs_result = await db.execute(select(FarmerLocation).where(FarmerLocation.farmer_profile_id == profile.id))
    return locs_result.scalars().all()

@router.post("/land", response_model=LandDetailResponse)
async def add_land_detail(
    land_data: LandDetailCreate,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_land = FarmerLandDetail(**land_data.model_dump())
    db.add(new_land)
    await db.commit()
    await db.refresh(new_land)
    return new_land

@router.get("/land", response_model=list[LandDetailResponse])
async def get_land_details(
    location_id: str,
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(FarmerLandDetail).where(FarmerLandDetail.location_id == location_id))
    return result.scalars().all()
