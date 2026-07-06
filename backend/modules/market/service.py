from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
import uuid
from datetime import date, timedelta

from models.market import MarketPrice
from models.project import Project
from models.plant import Plant
from models.account import FarmerProfile

async def get_prices(db: AsyncSession, plant_id: uuid.UUID, region: str | None = None, days: int = 30):
    """Get market prices for a crop with optional region and date filters."""
    start_date = date.today() - timedelta(days=days)
    
    query = select(MarketPrice).where(
        MarketPrice.plant_id == plant_id,
        MarketPrice.date >= start_date
    )
    
    if region:
        query = query.where(MarketPrice.region == region)
    
    query = query.order_by(MarketPrice.date.desc())
    
    result = await db.execute(query)
    return result.scalars().all()

async def get_trend(db: AsyncSession, plant_id: uuid.UUID, region: str = "Jaffna"):
    """Calculate 30-day price trend for a crop in a region."""
    plant = await db.get(Plant, plant_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Crop not found")
    
    today = date.today()
    start_date = today - timedelta(days=30)
    
    result = await db.execute(
        select(MarketPrice)
        .where(MarketPrice.plant_id == plant_id, MarketPrice.region == region, MarketPrice.date >= start_date)
        .order_by(MarketPrice.date)
    )
    prices = result.scalars().all()
    
    if not prices:
        raise HTTPException(status_code=404, detail="No price data found for this crop and region")
    
    price_values = [float(p.price_per_kg) for p in prices]
    current_price = price_values[-1]
    oldest_price = price_values[0]
    
    change = current_price - oldest_price
    change_pct = (change / oldest_price * 100) if oldest_price > 0 else 0
    
    if change_pct > 2:
        direction = "up"
    elif change_pct < -2:
        direction = "down"
    else:
        direction = "stable"
    
    return {
        "plant_id": plant_id,
        "plant_name": plant.common_name,
        "region": region,
        "current_price": current_price,
        "price_30d_ago": oldest_price,
        "change_percentage": round(change_pct, 1),
        "direction": direction,
        "min_price_30d": min(price_values),
        "max_price_30d": max(price_values),
        "avg_price_30d": round(sum(price_values) / len(price_values), 1)
    }

async def estimate_revenue(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID, region: str = "Jaffna"):
    """Estimate revenue for a project based on area, expected yield, and current price."""
    profile_res = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == account_id))
    profile = profile_res.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    
    project = await db.get(Project, project_id)
    if not project or project.farmer_id != profile.id:
        raise HTTPException(status_code=404, detail="Project not found")
    
    plant = await db.get(Plant, project.plant_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Crop not found")
    
    # Get latest price
    result = await db.execute(
        select(MarketPrice)
        .where(MarketPrice.plant_id == plant.id, MarketPrice.region == region)
        .order_by(MarketPrice.date.desc())
        .limit(1)
    )
    latest_price = result.scalars().first()
    
    current_price = float(latest_price.price_per_kg) if latest_price else 0
    expected_yield = float(plant.expected_yield_per_acre_kg or 0) * float(project.area)
    estimated_revenue = expected_yield * current_price
    
    return {
        "project_id": project_id,
        "crop_name": plant.common_name,
        "area": float(project.area),
        "area_unit": project.area_unit,
        "expected_yield_kg": round(expected_yield, 1),
        "current_price_per_kg": current_price,
        "estimated_revenue": round(estimated_revenue, 2),
        "currency": "LKR",
        "region": region
    }
