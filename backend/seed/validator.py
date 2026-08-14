import asyncio
import sys
import logging
from sqlalchemy.future import select
from database import engine, async_session
from models import Plant, PlantStage, PlantFertilizerRecommendation

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def validate_seed_data():
    """Validates the seed data for consistency and logic errors."""
    has_errors = False
    
    async with async_session() as db:
        # 1. Check for stage continuity
        plants = (await db.execute(select(Plant))).scalars().all()
        for plant in plants:
            stages = (await db.execute(
                select(PlantStage)
                .where(PlantStage.plant_id == plant.id)
                .order_by(PlantStage.stage_order)
            )).scalars().all()
            
            if not stages:
                logger.error(f"Plant {plant.common_name} has no stages!")
                has_errors = True
                continue
            
            # Check gaps or overlaps
            expected_start = 0
            for stage in stages:
                if stage.start_day != expected_start:
                    logger.error(f"Plant {plant.common_name} stage {stage.stage_name} starts at {stage.start_day}, expected {expected_start}")
                    has_errors = True
                expected_start = stage.end_day
            
            # Baseline duration is determined by the end_day of the final stage.
            baseline_duration = stages[-1].end_day
            logger.info(f"Plant {plant.common_name} has a baseline duration of {baseline_duration} days.")
        # 2. Verify organic fertilizers don't recommend synthetic products
        fertilizers = (await db.execute(select(PlantFertilizerRecommendation))).scalars().all()
        synthetic_terms = ["urea", "tsp", "mop", "npk", "synthetic"]
        
        for fert in fertilizers:
            if fert.farming_method == "organic":
                for term in synthetic_terms:
                    if term in fert.fertilizer_name.lower():
                        logger.error(f"Organic fertilizer recommendation contains synthetic product: {fert.fertilizer_name}")
                        has_errors = True
                        
    if has_errors:
        logger.error("Seed data validation failed.")
        sys.exit(1)
    else:
        logger.info("Seed data validation passed.")
        sys.exit(0)

if __name__ == "__main__":
    asyncio.run(validate_seed_data())
