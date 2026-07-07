from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
import uuid

from models.soil import SoilTest, SoilNutrientResult, SoilRecommendation
from core.farmer import get_owned_project
from .schemas import SoilTestCreate

def _generate_recommendations(test: SoilTest, result: SoilNutrientResult, farming_method: str) -> list[SoilRecommendation]:
    recs = []
    
    if result.ph_level < 6.0:
        desc = "Apply agricultural lime (100kg/acre) to raise pH." if farming_method != "organic" else "Apply calcitic limestone or wood ash to raise pH."
        recs.append(SoilRecommendation(soil_test_id=test.id, recommendation_type="amendment", description=desc))
    elif result.ph_level > 7.5:
        desc = "Apply elemental sulfur to lower pH." if farming_method != "organic" else "Add pine needles or sphagnum peat moss to lower pH."
        recs.append(SoilRecommendation(soil_test_id=test.id, recommendation_type="amendment", description=desc))

    if result.nitrogen_level.lower() == "low":
        desc = "Apply Urea (50kg/acre) as basal dressing." if farming_method != "organic" else "Apply mature compost or blood meal (high N)."
        recs.append(SoilRecommendation(soil_test_id=test.id, recommendation_type="fertilizer", description=desc))

    if result.phosphorus_level.lower() == "low":
        desc = "Apply TSP (Triple Super Phosphate) (25kg/acre)." if farming_method != "organic" else "Apply bone meal or rock phosphate."
        recs.append(SoilRecommendation(soil_test_id=test.id, recommendation_type="fertilizer", description=desc))

    if result.potassium_level.lower() == "low":
        desc = "Apply MOP (Muriate of Potash) (25kg/acre)." if farming_method != "organic" else "Apply kelp meal or banana peel tea."
        recs.append(SoilRecommendation(soil_test_id=test.id, recommendation_type="fertilizer", description=desc))
        
    return recs

async def submit_soil_test(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID, data: SoilTestCreate):
    project, _ = await get_owned_project(db, project_id, account_id)
        
    soil_test = SoilTest(
        project_id=project_id,
        test_date=data.test_date,
        tested_by=data.tested_by,
        status="completed",
        notes=data.notes
    )
    db.add(soil_test)
    await db.flush()
    
    soil_res = SoilNutrientResult(
        soil_test_id=soil_test.id,
        ph_level=data.results.ph_level,
        nitrogen_level=data.results.nitrogen_level,
        phosphorus_level=data.results.phosphorus_level,
        potassium_level=data.results.potassium_level,
        organic_matter_perc=data.results.organic_matter_perc,
        moisture_level=data.results.moisture_level
    )
    db.add(soil_res)
    
    recs = _generate_recommendations(soil_test, soil_res, project.farming_method)
    db.add_all(recs)
    
    await db.commit()
    await db.refresh(soil_test)
    return soil_test

async def get_soil_tests(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
    await get_owned_project(db, project_id, account_id)
        
    result = await db.execute(
        select(SoilTest).where(SoilTest.project_id == project_id).order_by(SoilTest.test_date.desc())
    )
    tests = result.scalars().all()
    
    if not tests:
        return []
        
    latest = tests[0]
    
    res_query = await db.execute(select(SoilNutrientResult).where(SoilNutrientResult.soil_test_id == latest.id))
    latest.results = res_query.scalars().first()
    
    rec_query = await db.execute(select(SoilRecommendation).where(SoilRecommendation.soil_test_id == latest.id))
    latest.recommendations = rec_query.scalars().all()
    
    return tests

async def get_soil_recommendations(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
    await get_owned_project(db, project_id, account_id)
        
    result = await db.execute(
        select(SoilTest).where(SoilTest.project_id == project_id).order_by(SoilTest.test_date.desc())
    )
    latest = result.scalars().first()
    if not latest:
        return []
        
    rec_query = await db.execute(select(SoilRecommendation).where(SoilRecommendation.soil_test_id == latest.id))
    return rec_query.scalars().all()
