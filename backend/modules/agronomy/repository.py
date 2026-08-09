"""Read-side repositories for the agronomy module.

The product catalog is mostly read; admin CRUD will reuse these via the
admin module later. Specialized lookup methods support the nutrient engine
and product matcher.
"""
import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from core.base_repository import BaseRepository
from models.product import ProductCatalog, ProductNutrientContent


class ProductCatalogRepository(BaseRepository[ProductCatalog, None, None]):
    def __init__(self):
        super().__init__(ProductCatalog)

    async def list_active(
        self,
        db: AsyncSession,
        *,
        primary_nutrient: Optional[str] = None,
        farming_method: Optional[str] = None,
        product_type: Optional[str] = None,
    ):
        """Active catalog entries, optionally filtered. Ordered by name."""
        stmt = select(self.model).where(self.model.is_active == True)
        if primary_nutrient:
            stmt = stmt.where(self.model.primary_nutrient == primary_nutrient)
        if product_type:
            stmt = stmt.where(self.model.product_type == product_type)
        if farming_method and farming_method != "both":
            # Include products flagged "both" plus the requested method
            stmt = stmt.where(
                (self.model.farming_method == farming_method)
                | (self.model.farming_method == "both")
            )
        stmt = stmt.order_by(self.model.name)
        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_for_nutrient(
        self,
        db: AsyncSession,
        nutrient_code: str,
        farming_method: str,
    ):
        """All products that supply a given nutrient and match the farming method.

        Used by the product matcher to enumerate candidates for a deficit.
        """
        # Join through ProductNutrientContent so we only get products that
        # actually contain the requested nutrient.
        stmt = (
            select(self.model)
            .join(ProductNutrientContent, ProductNutrientContent.product_id == self.model.id)
            .where(
                self.model.is_active == True,
                ProductNutrientContent.nutrient_code == nutrient_code,
            )
        )
        if farming_method != "both":
            stmt = stmt.where(
                (self.model.farming_method == farming_method)
                | (self.model.farming_method == "both")
            )
        stmt = stmt.order_by(self.model.name)
        result = await db.execute(stmt)
        return result.scalars().all()


class ProductNutrientContentRepository(BaseRepository[ProductNutrientContent, None, None]):
    def __init__(self):
        super().__init__(ProductNutrientContent)

    async def get_for_product(self, db: AsyncSession, product_id: uuid.UUID):
        result = await db.execute(
            select(self.model).where(self.model.product_id == product_id)
        )
        return result.scalars().all()

    async def get_for_products(self, db: AsyncSession, product_ids: list[uuid.UUID]):
        """Bulk fetch nutrient contents for many products at once (avoids N+1)."""
        if not product_ids:
            return []
        result = await db.execute(
            select(self.model).where(self.model.product_id.in_(product_ids))
        )
        return result.scalars().all()
