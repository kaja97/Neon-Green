import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database import async_session
from models.marketplace import ProductCategory, ProductSubCategory
from sqlalchemy.future import select

async def seed_categories():
    categories_data = {
        "Vegetables": ["Tomato", "Carrot", "Onion", "Potato", "Cabbage"],
        "Livestock": ["Goat", "Chicken", "Milk", "Eggs", "Cattle"],
        "Farming Tools": ["Tractor", "Shovel", "Irrigation Pipes", "Sprayer"],
        "Fertilizer & Chemicals": ["Organic Compost", "Urea", "Pesticides", "Herbicides"],
        "Other": ["Seeds", "Packaging", "Consulting"]
    }
    
    async with async_session() as db:
        for cat_name, subcats in categories_data.items():
            # Check if category exists
            res = await db.execute(select(ProductCategory).where(ProductCategory.name == cat_name))
            cat = res.scalars().first()
            if not cat:
                cat = ProductCategory(name=cat_name, description=f"{cat_name} products")
                db.add(cat)
                await db.flush()
            
            for sub_name in subcats:
                res = await db.execute(select(ProductSubCategory).where(
                    ProductSubCategory.category_id == cat.id, 
                    ProductSubCategory.name == sub_name
                ))
                sub = res.scalars().first()
                if not sub:
                    sub = ProductSubCategory(
                        category_id=cat.id,
                        name=sub_name,
                        description=f"{sub_name} under {cat_name}"
                    )
                    db.add(sub)
        
        await db.commit()
        print("Successfully seeded product categories and subcategories.")

if __name__ == "__main__":
    asyncio.run(seed_categories())
