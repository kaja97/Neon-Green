from typing import Optional, List
from pydantic import BaseModel, ConfigDict
import uuid

# ── Category Models ──────────────────────────────────────

class SubCategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    description: Optional[str] = None

class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    description: Optional[str] = None
    subcategories: List[SubCategoryResponse] = []

# ── Product Models ───────────────────────────────────────

class ProductBase(BaseModel):
    title: str
    description: Optional[str] = None
    quantity_available: float
    unit: str
    price_per_unit: float
    currency: str = "LKR"
    condition: Optional[str] = None
    category_id: uuid.UUID
    sub_category_id: uuid.UUID
    plant_id: Optional[uuid.UUID] = None
    images: Optional[List[str]] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    quantity_available: Optional[float] = None
    unit: Optional[str] = None
    price_per_unit: Optional[float] = None
    condition: Optional[str] = None
    status: Optional[str] = None
    images: Optional[List[str]] = None

class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    seller_id: uuid.UUID
    status: str
    category: Optional[CategoryResponse] = None
    sub_category: Optional[SubCategoryResponse] = None
    
# ── Farmer Directory (for Vendors) ────────────────────────

class FarmerProjectShort(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    plant_name: str
    status: str
    planting_date: str

class FarmerDirectoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    account_id: uuid.UUID
    farmer_profile_id: uuid.UUID
    full_name: str
    farming_method: str
    experience_years: int
    projects: List[FarmerProjectShort] = []
