from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from models.account import FarmerProfile
from models.farmer import FarmerLocation, FarmerLandDetail
from .schemas import FarmerProfileUpdate, LocationCreate, LandDetailCreate
import uuid

async def get_profile(db: AsyncSession, account_id: uuid.UUID):
    result = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == account_id))
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

async def update_profile(db: AsyncSession, account_id: uuid.UUID, update_data: FarmerProfileUpdate):
    profile = await get_profile(db, account_id)
    
    for key, value in update_data.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)
        
    await db.commit()
    await db.refresh(profile)
    return profile

async def create_location(db: AsyncSession, account_id: uuid.UUID, location_data: LocationCreate):
    profile = await get_profile(db, account_id)
    
    if location_data.is_primary:
        # Reset other primary locations
        result = await db.execute(select(FarmerLocation).where(FarmerLocation.farmer_id == profile.id))
        locations = result.scalars().all()
        for loc in locations:
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

async def list_locations(db: AsyncSession, account_id: uuid.UUID):
    profile = await get_profile(db, account_id)
    result = await db.execute(select(FarmerLocation).where(FarmerLocation.farmer_id == profile.id))
    return result.scalars().all()

async def create_land_detail(db: AsyncSession, account_id: uuid.UUID, land_data: LandDetailCreate):
    profile = await get_profile(db, account_id)
    
    # Verify location belongs to farmer
    result = await db.execute(select(FarmerLocation).where(
        FarmerLocation.id == land_data.location_id,
        FarmerLocation.farmer_id == profile.id
    ))
    location = result.scalars().first()
    
    if not location:
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

async def list_land_details(db: AsyncSession, account_id: uuid.UUID):
    profile = await get_profile(db, account_id)
    result = await db.execute(select(FarmerLandDetail).where(FarmerLandDetail.farmer_id == profile.id))
    return result.scalars().all()
