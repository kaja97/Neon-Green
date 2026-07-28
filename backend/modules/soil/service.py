from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
import uuid
import logging
from datetime import date

from models.project import Project
from models.account import FarmerProfile
from models.plant import Plant, PlantVariety, PlantStage
from models.soil import SoilTest, SoilNutrientResult, SoilRecommendation
from core.base_service import BaseService
from modules.auth.repository import FarmerProfileRepository
from modules.project.repository import ProjectRepository
from .repository import SoilTestRepository, SoilNutrientResultRepository, SoilRecommendationRepository
from .schemas import SoilTestCreate
from .calculator import calculate_nutrient_gaps, generate_ai_recommendations

logger = logging.getLogger(__name__)


class SoilService(BaseService):
    def __init__(
        self,
        profile_repo: FarmerProfileRepository,
        project_repo: ProjectRepository,
        test_repo: SoilTestRepository,
        result_repo: SoilNutrientResultRepository,
        rec_repo: SoilRecommendationRepository
    ):
        super().__init__()
        self.profile_repo = profile_repo
        self.project_repo = project_repo
        self.test_repo = test_repo
        self.result_repo = result_repo
        self.rec_repo = rec_repo

    async def _get_farmer_id(self, db: AsyncSession, account_id: uuid.UUID) -> uuid.UUID:
        result = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == account_id))
        profile = result.scalars().first()
        if not profile:
            raise HTTPException(status_code=404, detail="Farmer profile not found")
        return profile.id

    async def _build_project_context(self, db: AsyncSession, project: Project) -> dict:
        """Build project context dict for Gemini soil recommendations."""
        plant = await db.get(Plant, project.plant_id)
        variety = await db.get(PlantVariety, project.variety_id) if project.variety_id else None

        # Determine current growth stage
        growth_stage = "Unknown"
        if project.planting_date:
            days_since_planting = (date.today() - project.planting_date).days
            stage_res = await db.execute(
                select(PlantStage)
                .where(PlantStage.plant_id == project.plant_id)
                .order_by(PlantStage.stage_order)
            )
            stages = stage_res.scalars().all()
            for s in stages:
                if s.start_day <= days_since_planting <= s.end_day:
                    growth_stage = s.stage_name
                    break
        else:
            days_since_planting = 0

        return {
            "crop_name": plant.common_name if plant else "Unknown",
            "crop_category": plant.category if plant else "Unknown",
            "variety": variety.variety_name if variety else None,
            "farming_method": project.farming_method,
            "area": f"{float(project.area)} {project.area_unit}",
            "growth_stage": growth_stage,
            "days_since_planting": days_since_planting,
            "planting_date": project.planting_date.isoformat() if project.planting_date else None,
        }

    async def submit_soil_test(self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID, data: SoilTestCreate):
        farmer_id = await self._get_farmer_id(db, account_id)
        project = await self.project_repo.get(db, project_id)
        if not project or project.farmer_id != farmer_id:
            raise HTTPException(status_code=404, detail="Project not found")

        # 1. Save soil test
        soil_test = SoilTest(
            project_id=project_id,
            test_date=data.test_date,
            tested_by=data.tested_by,
            status="completed",
            notes=data.notes
        )
        db.add(soil_test)
        await db.flush()

        # 2. Save nutrient results
        soil_res = SoilNutrientResult(
            soil_test_id=soil_test.id,
            # Physical & Chemical
            ph_level=data.results.ph_level,
            electrical_conductivity_ec=data.results.electrical_conductivity_ec,
            organic_carbon_oc=data.results.organic_carbon_oc,
            cation_exchange_capacity_cec=data.results.cation_exchange_capacity_cec,
            # Primary Macronutrients
            nitrogen_n=data.results.nitrogen_n,
            phosphorus_p=data.results.phosphorus_p,
            potassium_k=data.results.potassium_k,
            # Secondary Macronutrients
            calcium_ca=data.results.calcium_ca,
            magnesium_mg=data.results.magnesium_mg,
            sulfur_s=data.results.sulfur_s,
            # Micronutrients
            zinc_zn=data.results.zinc_zn,
            boron_b=data.results.boron_b,
            iron_fe=data.results.iron_fe,
            manganese_mn=data.results.manganese_mn,
            copper_cu=data.results.copper_cu,
        )
        db.add(soil_res)

        # 3. Generate recommendations — try AI first, fall back to static calculator
        try:
            project_context = await self._build_project_context(db, project)
            recs = await generate_ai_recommendations(soil_test, soil_res, project_context)
            logger.info("AI-generated %d soil recommendations for project %s", len(recs), project_id)
        except Exception as e:
            logger.warning(
                "AI soil recommendations failed, falling back to static calculator: %s", e
            )
            recs = calculate_nutrient_gaps(soil_test, soil_res, project.farming_method)

        db.add_all(recs)

        await db.commit()
        await db.refresh(soil_test)

        soil_test.results = soil_res
        soil_test.recommendations = await self.rec_repo.get_by_test(db, soil_test.id)

        return soil_test

    async def get_soil_tests(self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
        farmer_id = await self._get_farmer_id(db, account_id)
        project = await self.project_repo.get(db, project_id)
        if not project or project.farmer_id != farmer_id:
            raise HTTPException(status_code=404, detail="Project not found")

        tests = await self.test_repo.get_by_project(db, project_id)

        if not tests:
            return []

        latest = tests[0]
        latest.results = await self.result_repo.get_by_test(db, latest.id)
        latest.recommendations = await self.rec_repo.get_by_test(db, latest.id)

        return tests

    async def get_soil_recommendations(self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
        farmer_id = await self._get_farmer_id(db, account_id)
        project = await self.project_repo.get(db, project_id)
        if not project or project.farmer_id != farmer_id:
            raise HTTPException(status_code=404, detail="Project not found")

        tests = await self.test_repo.get_by_project(db, project_id)
        if not tests:
            return []

        latest = tests[0]
        return await self.rec_repo.get_by_test(db, latest.id)
