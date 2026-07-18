import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.account import Account
from dependencies import get_current_user, get_marketplace_service

from .schemas import ProductCreate, ProductResponse, FarmerDirectoryResponse, CategoryResponse
from .service import MarketplaceService

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])

@router.get("/categories", response_model=List[CategoryResponse])
async def list_categories(
    db: AsyncSession = Depends(get_db),
    service: MarketplaceService = Depends(get_marketplace_service)
):
    """List all product categories and their subcategories."""
    return await service.get_categories(db)

@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user),
    service: MarketplaceService = Depends(get_marketplace_service)
):
    """Create a new product listing (Farmers and Vendors only)."""
    return await service.create_product(db, current_user.id, data)

@router.get("/products", response_model=List[ProductResponse])
async def list_products(
    plant_id: Optional[uuid.UUID] = Query(None, description="Filter by crop/plant type"),
    db: AsyncSession = Depends(get_db),
    service: MarketplaceService = Depends(get_marketplace_service)
):
    """List all available products in the marketplace."""
    return await service.get_products(db, plant_id)

@router.get("/products/me", response_model=List[ProductResponse])
async def list_my_products(
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user),
    service: MarketplaceService = Depends(get_marketplace_service)
):
    """List products listed by the current user."""
    return await service.get_my_products(db, current_user.id)

@router.get("/farmers", response_model=List[FarmerDirectoryResponse])
async def list_farmers_directory(
    db: AsyncSession = Depends(get_db),
    service: MarketplaceService = Depends(get_marketplace_service)
):
    """List active farmers and their current projects for vendors to browse."""
    return await service.get_farmer_directory(db)
