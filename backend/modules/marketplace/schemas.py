from typing import Optional, List
from pydantic import BaseModel, ConfigDict
import uuid

# ── Category Models ──────────────────────────────────────

class SubCategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    description: Optional[str] = None

class CategoryShortResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    description: Optional[str] = None

class CategoryResponse(CategoryShortResponse):
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
    category: Optional[CategoryShortResponse] = None
    sub_category: Optional[SubCategoryResponse] = None
    
class SellerInfo(BaseModel):
    id: uuid.UUID
    name: str
    phone: Optional[str] = None
    email: str

class ProductDetailResponse(ProductResponse):
    seller_info: Optional[SellerInfo] = None
    
# ── Farmer Directory (for Vendors) ────────────────────────

class FarmerLocationShort(BaseModel):
    id: uuid.UUID
    name: str
    district: str

class FarmerProjectShort(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    plant_name: str
    plant_category: Optional[str] = None
    plant_sub_category: Optional[str] = None
    variety_name: Optional[str] = None
    status: str
    planting_date: str
    location_district: Optional[str] = None

class FarmerDirectoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    account_id: uuid.UUID
    farmer_profile_id: uuid.UUID
    full_name: str
    farming_method: str
    experience_years: int
    bio: Optional[str] = None
    district: Optional[str] = None  # Primary location district
    projects: List[FarmerProjectShort] = []

# ── Farmer Detail ────────────────────────────────────────

class FarmerProjectDetail(BaseModel):
    id: uuid.UUID
    name: str
    plant_name: str
    plant_category: Optional[str] = None
    plant_sub_category: Optional[str] = None
    variety_name: Optional[str] = None
    status: str
    farming_method: str
    planting_date: str
    expected_harvest_date: Optional[str] = None
    expected_yield_kg: Optional[float] = None
    expected_revenue: Optional[float] = None
    actual_yield_kg: Optional[float] = None
    actual_revenue: Optional[float] = None
    area: float
    area_unit: str
    location_name: Optional[str] = None
    location_district: Optional[str] = None

class FarmerDetailResponse(BaseModel):
    account_id: uuid.UUID
    farmer_profile_id: uuid.UUID
    full_name: str
    farming_method: str
    experience_years: int
    bio: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    locations: List[FarmerLocationShort] = []
    projects: List[FarmerProjectDetail] = []
