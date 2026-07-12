"""
Farmer router — 15 endpoints for profile, locations, land details, and livestock.
All endpoints scoped to the authenticated farmer.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from dependencies import get_current_farmer
from models.account import Account
from core.response import success_response, created_response, message_response
from . import service
from .schemas import (
    FarmerProfileUpdate, FarmerProfileResponse,
    LocationCreate, LocationUpdate, LocationResponse,
    LandDetailCreate, LandDetailUpdate, LandDetailResponse,
    LivestockCreate, LivestockUpdate, LivestockResponse,
)
import uuid

router = APIRouter(prefix="/farmer", tags=["farmer"])


# ── Profile ──────────────────────────────────────────────

@router.get("/profile", status_code=200)
async def get_profile(
    current_user: Account = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    """Get current farmer's profile."""
    profile = await service.get_profile(db, current_user.id)
    return success_response(FarmerProfileResponse.model_validate(profile).model_dump())


@router.put("/profile", status_code=200)
async def update_profile(
    data: FarmerProfileUpdate,
    current_user: Account = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    """Update current farmer's profile."""
    profile = await service.update_profile(db, current_user.id, data)
    return success_response(FarmerProfileResponse.model_validate(profile).model_dump())


# ── Locations ────────────────────────────────────────────

@router.post("/locations", status_code=201)
async def add_location(
    data: LocationCreate,
    current_user: Account = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    """Add a new farm location."""
    loc = await service.create_location(db, current_user.id, data)
    return created_response(LocationResponse.model_validate(loc).model_dump())


@router.get("/locations", status_code=200)
async def list_locations(
    current_user: Account = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    """List all farm locations."""
    locs = await service.list_locations(db, current_user.id)
    return success_response([LocationResponse.model_validate(l).model_dump() for l in locs])


@router.get("/locations/{location_id}", status_code=200)
async def get_location(
    location_id: uuid.UUID,
    current_user: Account = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific location by ID."""
    loc = await service.get_location(db, current_user.id, location_id)
    return success_response(LocationResponse.model_validate(loc).model_dump())


@router.put("/locations/{location_id}", status_code=200)
async def update_location(
    location_id: uuid.UUID,
    data: LocationUpdate,
    current_user: Account = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    """Update a farm location."""
    loc = await service.update_location(db, current_user.id, location_id, data)
    return success_response(LocationResponse.model_validate(loc).model_dump())


@router.delete("/locations/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_location(
    location_id: uuid.UUID,
    current_user: Account = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    """Delete a farm location. Fails if it has active projects."""
    await service.delete_location(db, current_user.id, location_id)
    return None


# ── Land Details ─────────────────────────────────────────

@router.post("/land", status_code=201)
async def add_land_detail(
    data: LandDetailCreate,
    current_user: Account = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    """Add a land detail to a location."""
    land = await service.create_land_detail(db, current_user.id, data)
    return created_response(LandDetailResponse.model_validate(land).model_dump())


@router.get("/land", status_code=200)
async def list_land_details(
    current_user: Account = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    """List all land details."""
    lands = await service.list_land_details(db, current_user.id)
    return success_response([LandDetailResponse.model_validate(l).model_dump() for l in lands])


@router.get("/land/{land_id}", status_code=200)
async def get_land_detail(
    land_id: uuid.UUID,
    current_user: Account = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific land detail."""
    land = await service.get_land_detail(db, current_user.id, land_id)
    return success_response(LandDetailResponse.model_validate(land).model_dump())


@router.put("/land/{land_id}", status_code=200)
async def update_land_detail(
    land_id: uuid.UUID,
    data: LandDetailUpdate,
    current_user: Account = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    """Update a land detail."""
    land = await service.update_land_detail(db, current_user.id, land_id, data)
    return success_response(LandDetailResponse.model_validate(land).model_dump())


@router.delete("/land/{land_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_land_detail(
    land_id: uuid.UUID,
    current_user: Account = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    """Delete a land detail."""
    await service.delete_land_detail(db, current_user.id, land_id)
    return None


# ── Livestock ────────────────────────────────────────────

@router.post("/livestock", status_code=201)
async def add_livestock(
    data: LivestockCreate,
    current_user: Account = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    """Add a livestock record."""
    ls = await service.create_livestock(db, current_user.id, data)
    return created_response(LivestockResponse.model_validate(ls).model_dump())


@router.get("/livestock", status_code=200)
async def list_livestock(
    current_user: Account = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    """List all livestock records."""
    livestock = await service.list_livestock(db, current_user.id)
    return success_response([LivestockResponse.model_validate(l).model_dump() for l in livestock])


@router.get("/livestock/{livestock_id}", status_code=200)
async def get_livestock(
    livestock_id: uuid.UUID,
    current_user: Account = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific livestock record."""
    ls = await service.get_livestock(db, current_user.id, livestock_id)
    return success_response(LivestockResponse.model_validate(ls).model_dump())


@router.put("/livestock/{livestock_id}", status_code=200)
async def update_livestock(
    livestock_id: uuid.UUID,
    data: LivestockUpdate,
    current_user: Account = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    """Update a livestock record."""
    ls = await service.update_livestock(db, current_user.id, livestock_id, data)
    return success_response(LivestockResponse.model_validate(ls).model_dump())


@router.delete("/livestock/{livestock_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_livestock(
    livestock_id: uuid.UUID,
    current_user: Account = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db),
):
    """Delete a livestock record."""
    await service.delete_livestock(db, current_user.id, livestock_id)
    return None
