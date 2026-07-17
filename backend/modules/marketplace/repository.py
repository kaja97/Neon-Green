from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
import uuid

from core.base_repository import BaseRepository
from models.marketplace import Product

class ProductRepository(BaseRepository[Product, dict, dict]):
    def __init__(self):
        super().__init__(Product)
    async def get_multi_by_seller(
        self, db: AsyncSession, *, seller_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> List[Product]:
        result = await db.execute(
            select(Product)
            .where(Product.seller_id == seller_id)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_multi_available(
        self, db: AsyncSession, *, plant_id: Optional[uuid.UUID] = None, skip: int = 0, limit: int = 100
    ) -> List[Product]:
        query = select(Product).where(Product.status == "available")
        
        if plant_id:
            query = query.where(Product.plant_id == plant_id)
            
        result = await db.execute(
            query.offset(skip).limit(limit)
        )
        return list(result.scalars().all())
