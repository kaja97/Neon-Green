from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
import uuid

from models.project import Project
from models.account import FarmerProfile
from models.soil import SoilTest, SoilNutrientResult, SoilRecommendation
from .schemas import SoilTestCreate

from .calculator import calculate_nutrient_gaps


async def _get_farmer_id(db: AsyncSession, account_id: uuid.UUID) -> uuid.UUID:
    """Resolve the authenticated account to its farmer profile id.

    Project ownership is keyed on FarmerProfile.id, not Account.id (see
    dependencies.get_current_user), so ownership checks must resolve through here.
    """
    result = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == account_id))
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    return profile.id


async def submit_soil_test(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID, data: SoilTestCreate):
    # Verify project
    farmer_id = await _get_farmer_id(db, account_id)
    project = await db.get(Project, project_id)
    if not project or project.farmer_id != farmer_id:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Create Test
    soil_test = SoilTest(
        project_id=project_id,
        test_date=data.test_date,
        tested_by=data.tested_by,
        status="completed",
        notes=data.notes
    )
    db.add(soil_test)
    await db.flush() # get ID
    
    # Create Result
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
    
    # Generate Recommendations
    recs = calculate_nutrient_gaps(soil_test, soil_res, project.farming_method)
    db.add_all(recs)
    
    await db.commit()
    await db.refresh(soil_test)

    # Attach result and recommendations so SoilTestDetailResponse can serialize them.
    # (db.refresh only loads mapped columns, not dynamic relationships.)
    soil_test.results = soil_res
    rec_query = await db.execute(
        select(SoilRecommendation).where(SoilRecommendation.soil_test_id == soil_test.id)
    )
    soil_test.recommendations = rec_query.scalars().all()

    return soil_test

async def get_soil_tests(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
    farmer_id = await _get_farmer_id(db, account_id)
    project = await db.get(Project, project_id)
    if not project or project.farmer_id != farmer_id:
        raise HTTPException(status_code=404, detail="Project not found")
        
    result = await db.execute(
        select(SoilTest).where(SoilTest.project_id == project_id).order_by(SoilTest.test_date.desc())
    )
    tests = result.scalars().all()
    
    # For details, load the latest test completely
    if not tests:
        return []
        
    # Populate the first one with details as a convenience
    latest = tests[0]
    
    res_query = await db.execute(select(SoilNutrientResult).where(SoilNutrientResult.soil_test_id == latest.id))
    latest.results = res_query.scalars().first()
    
    rec_query = await db.execute(select(SoilRecommendation).where(SoilRecommendation.soil_test_id == latest.id))
    latest.recommendations = rec_query.scalars().all()
    
    return tests

async def get_soil_recommendations(db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
    farmer_id = await _get_farmer_id(db, account_id)
    project = await db.get(Project, project_id)
    if not project or project.farmer_id != farmer_id:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Get latest test
    result = await db.execute(
        select(SoilTest).where(SoilTest.project_id == project_id).order_by(SoilTest.test_date.desc())
    )
    latest = result.scalars().first()
    if not latest:
        return []
        
    rec_query = await db.execute(select(SoilRecommendation).where(SoilRecommendation.soil_test_id == latest.id))
    return rec_query.scalars().all()
