import uuid
import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.account import Account
from dependencies import get_current_user, get_marketplace_service

from .schemas import ProductCreate, ProductUpdate, ProductResponse, FarmerDirectoryResponse, CategoryResponse, ProductDetailResponse, FarmerDetailResponse
from .service import MarketplaceService

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])

@router.post("/products/images", response_model=List[str], status_code=status.HTTP_201_CREATED)
async def upload_product_images(
    files: List[UploadFile] = File(...),
    current_user: Account = Depends(get_current_user)
):
    """Upload product images (max 5)"""
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 images allowed")
        
    uploaded_urls = []
    upload_dir = "uploads/products"
    
    for file in files:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image files are allowed")
            
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        uploaded_urls.append(f"/static/uploads/products/{unique_filename}")
        
    return uploaded_urls


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

@router.get("/products/{product_id}", response_model=ProductDetailResponse)
async def get_product_details(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    service: MarketplaceService = Depends(get_marketplace_service)
):
    """Get details of a specific product."""
    return await service.get_product(db, product_id)

@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: uuid.UUID,
    data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user),
    service: MarketplaceService = Depends(get_marketplace_service)
):
    """Update a product listing. Only the seller can update their product."""
    return await service.update_product(db, product_id, current_user.id, data)

@router.patch("/products/{product_id}/sold-out", response_model=ProductResponse)
async def mark_product_sold_out(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user),
    service: MarketplaceService = Depends(get_marketplace_service)
):
    """Mark a product as sold out. Only the seller can do this."""
    return await service.mark_sold_out(db, product_id, current_user.id)

@router.get("/farmers", response_model=List[FarmerDirectoryResponse])
async def list_farmers_directory(
    db: AsyncSession = Depends(get_db),
    service: MarketplaceService = Depends(get_marketplace_service)
):
    """List active farmers and their current projects for vendors to browse."""
    return await service.get_farmer_directory(db)

@router.get("/farmers/{farmer_profile_id}", response_model=FarmerDetailResponse)
async def get_farmer_detail(
    farmer_profile_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    service: MarketplaceService = Depends(get_marketplace_service)
):
    """Get detailed information about a specific farmer and all their projects."""
    return await service.get_farmer_detail(db, farmer_profile_id)
