import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from core.base_service import BaseService
from core.errors.exceptions import AppException
from core.errors.error_codes import ErrorCode

from models.marketplace import Product, ProductCategory, ProductSubCategory
from models.account import Account, FarmerProfile
from models.project import Project
from models.plant import Plant

from .repository import ProductRepository
from .schemas import ProductCreate, ProductUpdate, FarmerDirectoryResponse

from sqlalchemy.orm import selectinload

class MarketplaceService(BaseService):
    def __init__(self, product_repo: ProductRepository):
        super().__init__()
        self.product_repo = product_repo
        
    async def get_categories(self, db: AsyncSession) -> List[ProductCategory]:
        # Fetch categories with their active subcategories eagerly loaded
        query = select(ProductCategory).where(ProductCategory.is_active == True).options(
            selectinload(ProductCategory.subcategories)
        )
        result = await db.execute(query)
        return list(result.scalars().all())
        
    async def create_product(self, db: AsyncSession, seller_id: uuid.UUID, data: ProductCreate) -> Product:
        # Verify category exists
        category = await db.get(ProductCategory, data.category_id)
        if not category:
            raise AppException(ErrorCode.VALIDATION_ERROR, "Category not found.")
            
        # Verify subcategory exists and belongs to the category
        subcategory = await db.get(ProductSubCategory, data.sub_category_id)
        if not subcategory or subcategory.category_id != data.category_id:
            raise AppException(ErrorCode.VALIDATION_ERROR, "Invalid subcategory.")

        # Verify plant exists if provided
        if data.plant_id:
            plant = await db.get(Plant, data.plant_id)
            if not plant:
                raise AppException(ErrorCode.VALIDATION_ERROR, "Plant not found.")
                
        obj_in = data.model_dump()
        obj_in["seller_id"] = seller_id
        
        product = await self.product_repo.create(db, obj_in=obj_in)
        await db.commit()
        
        # Eager load relationships for the response
        res = await db.execute(
            select(Product)
            .where(Product.id == product.id)
            .options(
                selectinload(Product.category),
                selectinload(Product.sub_category)
            )
        )
        return res.scalars().first()
        
    async def get_products(self, db: AsyncSession, plant_id: Optional[uuid.UUID] = None) -> List[Product]:
        return await self.product_repo.get_multi_available(db, plant_id=plant_id)

    async def get_product(self, db: AsyncSession, product_id: uuid.UUID) -> dict:
        product = await self.product_repo.get_product_with_details(db, product_id)
        if not product:
            raise AppException(ErrorCode.NOT_FOUND, "Product not found")
        
        # Build seller info
        seller_name = "Unknown Seller"
        if product.seller.farmer_profile:
            seller_name = product.seller.farmer_profile.full_name
        elif product.seller.vendor_profile:
            seller_name = product.seller.vendor_profile.business_name
            
        seller_info = {
            "id": product.seller.id,
            "name": seller_name,
            "phone": product.seller.phone,
            "email": product.seller.email
        }
        
        # We need to return a dict or something compatible with ProductDetailResponse
        # Since Product is a SQLAlchemy model, we can just attach seller_info to it dynamically 
        # before Pydantic serializes it.
        setattr(product, "seller_info", seller_info)
        return product
        
    async def get_my_products(self, db: AsyncSession, seller_id: uuid.UUID) -> List[Product]:
        return await self.product_repo.get_multi_by_seller(db, seller_id=seller_id)
        
    async def get_farmer_directory(self, db: AsyncSession) -> List[dict]:
        """Fetch all farmers and their active projects for vendors to browse."""
        query = (
            select(Account, FarmerProfile)
            .join(FarmerProfile, Account.id == FarmerProfile.account_id)
            .where(Account.role == "farmer", Account.is_active == True)
        )
        
        result = await db.execute(query)
        rows = result.all()
        
        directory = []
        for account, profile in rows:
            # Fetch active projects for this farmer
            proj_query = (
                select(Project, Plant)
                .join(Plant, Project.plant_id == Plant.id)
                .where(Project.farmer_id == profile.id, Project.status == "active")
            )
            proj_res = await db.execute(proj_query)
            proj_rows = proj_res.all()
            
            projects = []
            for proj, plant in proj_rows:
                projects.append({
                    "id": proj.id,
                    "plant_name": plant.common_name,
                    "status": proj.status,
                    "planting_date": proj.planting_date.isoformat() if proj.planting_date else None
                })
                
            directory.append({
                "account_id": account.id,
                "farmer_profile_id": profile.id,
                "full_name": profile.full_name,
                "farming_method": profile.farming_method,
                "experience_years": profile.experience_years,
                "projects": projects
            })
            
        return directory
