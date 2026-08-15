"""
Admin service — Business logic for user management, master data CRUD (plants,
varieties, growth stages, water/nutrient reqs, fertilizer recs, pruning guides,
diseases, pests, and treatments), global projects, and field issues triage.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func, or_, desc
from datetime import datetime, timezone, date
import uuid
from typing import Optional, List, Tuple
from fastapi import HTTPException

from models.account import Account, FarmerProfile, VendorProfile, BuyerProfile
from models.farmer import FarmerLocation
from models.project import Project
from models.notification import Notification
from models.issue import ProjectIssue
from models.plant import (
    Plant,
    PlantStage,
    PlantVariety,
    PlantWaterReq,
    PlantNutrientReq,
)
from models.plant_fertilizer import PlantFertilizerRecommendation
from models.plant_pruning import PlantPruningGuide
from models.plant_health import (
    PlantDisease,
    DiseaseSolution,
    PlantPest,
    PestSolution,
)
from core.errors.exceptions import AppException
from core.errors.error_codes import ErrorCode
from core.pagination import PaginationParams
from core.redis import get_redis_client
from core.base_service import BaseService

from modules.auth.repository import AccountRepository
from .repository import PlantRepository, DiseaseRepository
from .schemas import (
    PlantCreate,
    PlantUpdate,
    PlantVarietyCreate,
    PlantVarietyUpdate,
    PlantStageCreate,
    PlantStageUpdate,
    FertilizerRecommendationCreate,
    PruningGuideCreate,
    DiseaseCreate,
    DiseaseUpdate,
    PestCreate,
    PestUpdate,
    IssueStatusUpdate,
)


class AdminService(BaseService):
    def __init__(
        self,
        account_repo: AccountRepository,
        plant_repo: PlantRepository,
        disease_repo: DiseaseRepository,
    ):
        super().__init__()
        self.account_repo = account_repo
        self.plant_repo = plant_repo
        self.disease_repo = disease_repo

    # ── 1. User Management ───────────────────────────────────

    async def list_users(
        self,
        db: AsyncSession,
        pagination: PaginationParams,
        role: Optional[str] = None,
        is_active: Optional[bool] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[dict], int]:
        """List accounts with profile summaries and project counts."""
        stmt = (
            select(Account, FarmerProfile, VendorProfile, BuyerProfile)
            .outerjoin(FarmerProfile, Account.id == FarmerProfile.account_id)
            .outerjoin(VendorProfile, Account.id == VendorProfile.account_id)
            .outerjoin(BuyerProfile, Account.id == BuyerProfile.account_id)
        )

        if role:
            stmt = stmt.where(Account.role == role)
        if is_active is not None:
            stmt = stmt.where(Account.is_active == is_active)
        if search:
            q = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    Account.email.ilike(q),
                    Account.phone.ilike(q),
                    FarmerProfile.full_name.ilike(q),
                    VendorProfile.business_name.ilike(q),
                    BuyerProfile.full_name.ilike(q),
                )
            )

        # Count total
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await db.execute(count_stmt)).scalar() or 0

        # Paginate
        stmt = (
            stmt.order_by(desc(Account.created_at))
            .offset(pagination.offset)
            .limit(pagination.per_page)
        )
        result = await db.execute(stmt)
        rows = result.all()

        users = []
        for account, farmer, vendor, buyer in rows:
            display_name = "User"
            if farmer and farmer.full_name:
                display_name = farmer.full_name
            elif vendor and vendor.business_name:
                display_name = vendor.business_name
            elif buyer and buyer.full_name:
                display_name = buyer.full_name

            users.append({
                "id": str(account.id),
                "email": account.email,
                "phone": account.phone,
                "role": account.role,
                "is_active": account.is_active,
                "is_verified": account.is_verified,
                "created_at": account.created_at.isoformat(),
                "last_login_at": account.last_login_at.isoformat() if account.last_login_at else None,
                "display_name": display_name,
                "farming_method": farmer.farming_method if farmer else None,
                "business_name": vendor.business_name if vendor else None,
                "buyer_type": buyer.buyer_type if buyer else None,
            })

        return users, total

    async def get_user_detail(self, db: AsyncSession, user_id: str) -> dict:
        """Get rich user profile including associated models and counts."""
        result = await db.execute(
            select(Account, FarmerProfile, VendorProfile, BuyerProfile)
            .outerjoin(FarmerProfile, Account.id == FarmerProfile.account_id)
            .outerjoin(VendorProfile, Account.id == VendorProfile.account_id)
            .outerjoin(BuyerProfile, Account.id == BuyerProfile.account_id)
            .where(Account.id == user_id)
        )
        row = result.first()
        if not row:
            raise AppException(ErrorCode.ADMIN_USER_NOT_FOUND)

        account, farmer, vendor, buyer = row

        proj_count = 0
        locations = []
        if farmer:
            proj_count = (await db.execute(
                select(func.count()).select_from(Project).where(Project.farmer_id == farmer.id)
            )).scalar() or 0

            loc_res = await db.execute(
                select(FarmerLocation).where(FarmerLocation.farmer_id == farmer.id)
            )
            locations = [
                {
                    "id": str(loc.id),
                    "name": loc.name,
                    "district": loc.district,
                    "is_primary": loc.is_primary,
                }
                for loc in loc_res.scalars().all()
            ]

        return {
            "id": str(account.id),
            "email": account.email,
            "phone": account.phone,
            "role": account.role,
            "is_active": account.is_active,
            "is_verified": account.is_verified,
            "last_login_at": account.last_login_at.isoformat() if account.last_login_at else None,
            "created_at": account.created_at.isoformat(),
            "farmer_profile": {
                "id": str(farmer.id),
                "full_name": farmer.full_name,
                "farming_method": farmer.farming_method,
                "primary_language": farmer.primary_language,
                "experience_years": farmer.experience_years,
                "project_count": proj_count,
                "locations": locations,
            } if farmer else None,
            "vendor_profile": {
                "id": str(vendor.id),
                "business_name": vendor.business_name,
                "tax_id": vendor.tax_id,
                "rating": vendor.rating,
                "is_verified": vendor.is_verified,
                "warehouse_location": vendor.warehouse_location,
            } if vendor else None,
            "buyer_profile": {
                "id": str(buyer.id),
                "full_name": buyer.full_name,
                "buyer_type": buyer.buyer_type,
                "delivery_address": buyer.delivery_address,
            } if buyer else None,
        }

    async def deactivate_user(
        self, db: AsyncSession, admin_user: Account, target_user_id: str
    ) -> dict:
        if str(admin_user.id) == target_user_id:
            raise AppException(ErrorCode.ADMIN_CANNOT_DELETE_SELF)

        user = await self.account_repo.get(db, target_user_id)
        if not user:
            raise AppException(ErrorCode.ADMIN_USER_NOT_FOUND)

        user.is_active = False
        await db.commit()

        redis = await get_redis_client()
        if redis:
            await redis.delete(f"refresh_token:{target_user_id}")

        return {"message": f"User {user.email} has been deactivated."}

    async def reactivate_user(self, db: AsyncSession, target_user_id: str) -> dict:
        user = await self.account_repo.get(db, target_user_id)
        if not user:
            raise AppException(ErrorCode.ADMIN_USER_NOT_FOUND)

        user.is_active = True
        await db.commit()

        return {"message": f"User {user.email} has been reactivated."}

    async def change_user_role(
        self, db: AsyncSession, admin_user: Account, target_user_id: str, new_role: str
    ) -> dict:
        if str(admin_user.id) == target_user_id:
            raise AppException(ErrorCode.ADMIN_CANNOT_DELETE_SELF, detail="Cannot change your own role.")

        user = await self.account_repo.get(db, target_user_id)
        if not user:
            raise AppException(ErrorCode.ADMIN_USER_NOT_FOUND)

        user.role = new_role
        await db.commit()

        return {"message": f"User {user.email} role changed to {new_role}."}

    # ── 2. Admin Telemetry & Statistics ──────────────────────

    async def get_admin_stats(self, db: AsyncSession) -> dict:
        """Dashboard stats for admin panel with comprehensive counts."""
        total_users = (await db.execute(select(func.count()).select_from(Account))).scalar() or 0
        active_users = (await db.execute(
            select(func.count()).select_from(Account).where(Account.is_active == True)
        )).scalar() or 0
        farmers_count = (await db.execute(
            select(func.count()).select_from(Account).where(Account.role == "farmer")
        )).scalar() or 0
        vendors_count = (await db.execute(
            select(func.count()).select_from(Account).where(Account.role == "vendor")
        )).scalar() or 0
        buyers_count = (await db.execute(
            select(func.count()).select_from(Account).where(Account.role == "buyer")
        )).scalar() or 0
        admins_count = (await db.execute(
            select(func.count()).select_from(Account).where(Account.role == "admin")
        )).scalar() or 0

        total_projects = (await db.execute(select(func.count()).select_from(Project))).scalar() or 0
        active_projects = (await db.execute(
            select(func.count()).select_from(Project).where(Project.status == "active")
        )).scalar() or 0
        harvested_projects = (await db.execute(
            select(func.count()).select_from(Project).where(Project.status == "harvested")
        )).scalar() or 0

        total_plants = (await db.execute(select(func.count()).select_from(Plant))).scalar() or 0
        total_varieties = (await db.execute(select(func.count()).select_from(PlantVariety))).scalar() or 0
        total_diseases = (await db.execute(select(func.count()).select_from(PlantDisease))).scalar() or 0
        total_pests = (await db.execute(select(func.count()).select_from(PlantPest))).scalar() or 0

        total_issues = (await db.execute(select(func.count()).select_from(ProjectIssue))).scalar() or 0
        open_issues = (await db.execute(
            select(func.count()).select_from(ProjectIssue).where(ProjectIssue.status == "open")
        )).scalar() or 0
        resolved_issues = (await db.execute(
            select(func.count()).select_from(ProjectIssue).where(ProjectIssue.status == "resolved")
        )).scalar() or 0

        return {
            "users": {
                "total": total_users,
                "active": active_users,
                "deactivated": total_users - active_users,
                "farmers": farmers_count,
                "vendors": vendors_count,
                "buyers": buyers_count,
                "admins": admins_count,
            },
            "projects": {
                "total": total_projects,
                "active": active_projects,
                "harvested": harvested_projects,
                "failed": max(0, total_projects - active_projects - harvested_projects),
            },
            "master_data": {
                "plants": total_plants,
                "varieties": total_varieties,
                "diseases": total_diseases,
                "pests": total_pests,
            },
            "issues": {
                "total": total_issues,
                "open": open_issues,
                "in_progress": max(0, total_issues - open_issues - resolved_issues),
                "resolved": resolved_issues,
            },
            "ai": {
                "calls_today": 0,
                "quota_utilization_pct": 0.0,
            },
            "notifications": {
                "total": (await db.execute(select(func.count()).select_from(Notification))).scalar() or 0,
            },
        }

    # ── 3. Global Project Monitor ────────────────────────────

    async def list_projects(
        self, db: AsyncSession, pagination: PaginationParams, status: Optional[str] = None
    ) -> Tuple[List[dict], int]:
        stmt = (
            select(Project, Plant, FarmerProfile)
            .outerjoin(Plant, Project.plant_id == Plant.id)
            .outerjoin(FarmerProfile, Project.farmer_id == FarmerProfile.id)
        )
        if status:
            stmt = stmt.where(Project.status == status)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await db.execute(count_stmt)).scalar() or 0

        stmt = (
            stmt.order_by(desc(Project.created_at))
            .offset(pagination.offset)
            .limit(pagination.per_page)
        )
        res = await db.execute(stmt)

        items = []
        for p, plant, farmer in res.all():
            items.append({
                "id": str(p.id),
                "farmer_id": str(p.farmer_id),
                "farmer_name": farmer.full_name if farmer else "Farmer",
                "name": p.name,
                "plant_id": str(p.plant_id) if p.plant_id else None,
                "crop_name": plant.common_name if plant else "Crop",
                "status": p.status,
                "farming_method": p.farming_method,
                "area": float(p.area) if p.area else 0,
                "area_unit": p.area_unit,
                "planting_date": p.planting_date.isoformat() if p.planting_date else None,
                "expected_harvest_date": p.expected_harvest_date.isoformat() if p.expected_harvest_date else None,
                "created_at": p.created_at.isoformat(),
            })

        return items, total

    async def get_project_detail(self, db: AsyncSession, project_id: str) -> dict:
        stmt = (
            select(Project)
            .options(
                selectinload(Project.plant),
                selectinload(Project.variety),
                selectinload(Project.current_stage),
                selectinload(Project.location),
                selectinload(Project.issues),
            )
            .where(Project.id == project_id)
        )
        res = await db.execute(stmt)
        project = res.scalar_one_or_none()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Get farmer profile
        farmer_res = await db.execute(
            select(FarmerProfile).where(FarmerProfile.id == project.farmer_id)
        )
        farmer = farmer_res.scalar_one_or_none()

        return {
            "id": str(project.id),
            "farmer_id": str(project.farmer_id),
            "farmer_name": farmer.full_name if farmer else "Farmer",
            "name": project.name,
            "status": project.status,
            "farming_method": project.farming_method,
            "area": float(project.area) if project.area else None,
            "area_unit": project.area_unit,
            "planting_date": project.planting_date.isoformat() if project.planting_date else None,
            "expected_harvest_date": project.expected_harvest_date.isoformat() if project.expected_harvest_date else None,
            "actual_harvest_date": project.actual_harvest_date.isoformat() if project.actual_harvest_date else None,
            "plan_generation_status": project.plan_generation_status,
            "created_at": project.created_at.isoformat(),
            "crop": {
                "id": str(project.plant.id),
                "common_name": project.plant.common_name,
                "category": project.plant.category,
            } if project.plant else None,
            "variety": {
                "id": str(project.variety.id),
                "variety_name": project.variety.variety_name,
            } if project.variety else None,
            "location": {
                "id": str(project.location.id),
                "name": project.location.name,
                "district": project.location.district,
            } if project.location else None,
            "current_stage": {
                "id": str(project.current_stage.id),
                "stage_name": project.current_stage.stage_name,
                "stage_order": project.current_stage.stage_order,
            } if project.current_stage else None,
            "issues_count": len(project.issues) if project.issues else 0,
        }

    # ── 4. Master Data: Plants & Growth Stages ───────────────

    async def list_plants(self, db: AsyncSession) -> List[dict]:
        """List all plants with varieties count and stages count."""
        stmt = (
            select(Plant)
            .options(
                selectinload(Plant.stages),
                selectinload(Plant.varieties),
            )
            .order_by(Plant.common_name)
        )
        result = await db.execute(stmt)
        plants = result.scalars().all()

        out = []
        for p in plants:
            out.append({
                "id": str(p.id),
                "common_name": p.common_name,
                "local_name": p.local_name,
                "category": p.category,
                "sub_category": p.sub_category,
                "description": p.description,
                "is_active": p.is_active,
                "stages_count": len(p.stages),
                "varieties_count": len(p.varieties),
                "created_at": p.created_at.isoformat(),
            })
        return out

    async def get_plant_detail(self, db: AsyncSession, plant_id: uuid.UUID) -> dict:
        """Get full plant detail including stages, cultural requirements, and varieties."""
        stmt = (
            select(Plant)
            .options(
                selectinload(Plant.stages).selectinload(PlantStage.water_req),
                selectinload(Plant.stages).selectinload(PlantStage.nutrient_req),
                selectinload(Plant.stages).selectinload(PlantStage.fertilizer_recommendations),
                selectinload(Plant.stages).selectinload(PlantStage.pruning_guides),
                selectinload(Plant.varieties),
            )
            .where(Plant.id == plant_id)
        )
        res = await db.execute(stmt)
        plant = res.scalar_one_or_none()
        if not plant:
            raise HTTPException(status_code=404, detail="Plant not found")

        stages = []
        for s in plant.stages:
            stages.append({
                "id": str(s.id),
                "stage_name": s.stage_name,
                "stage_order": s.stage_order,
                "start_day": s.start_day,
                "end_day": s.end_day,
                "description": s.description,
                "key_indicators": s.key_indicators,
                "critical_actions": s.critical_actions,
                "watch_for": s.watch_for,
                "water_req": {
                    "water_mm_per_day": float(s.water_req.water_mm_per_day),
                    "frequency_days": s.water_req.frequency_days,
                    "drought_tolerance": s.water_req.drought_tolerance,
                } if s.water_req else None,
                "nutrient_req": {
                    "nitrogen_kg": float(s.nutrient_req.nitrogen_kg),
                    "phosphorus_kg": float(s.nutrient_req.phosphorus_kg),
                    "potassium_kg": float(s.nutrient_req.potassium_kg),
                    "calcium_kg": float(s.nutrient_req.calcium_kg) if s.nutrient_req.calcium_kg else None,
                    "magnesium_kg": float(s.nutrient_req.magnesium_kg) if s.nutrient_req.magnesium_kg else None,
                } if s.nutrient_req else None,
                "fertilizer_recommendations": [
                    {
                        "id": str(f.id),
                        "plant_stage_id": str(f.plant_stage_id),
                        "farming_method": f.farming_method,
                        "fertilizer_name": f.fertilizer_name,
                        "application_rate_per_acre_kg": float(f.application_rate_per_acre_kg),
                        "instructions": f.instructions,
                    }
                    for f in s.fertilizer_recommendations
                ],
                "pruning_guides": [
                    {
                        "id": str(pr.id),
                        "plant_stage_id": str(pr.plant_stage_id),
                        "pruning_type": pr.pruning_type,
                        "pruning_method": pr.pruning_method,
                        "trigger_day": pr.trigger_day,
                        "frequency_days": pr.frequency_days,
                        "pre_pruning": pr.pre_pruning,
                        "post_pruning": pr.post_pruning,
                        "tools_needed": pr.tools_needed,
                        "season_notes": pr.season_notes,
                        "importance": pr.importance,
                    }
                    for pr in s.pruning_guides
                ],
            })

        varieties = [
            {
                "id": str(v.id),
                "plant_id": str(v.plant_id),
                "variety_name": v.variety_name,
                "scientific_name": v.scientific_name,
                "growth_duration_days": v.growth_duration_days,
                "planting_season": v.planting_season,
                "optimal_temp_min": float(v.optimal_temp_min) if v.optimal_temp_min else None,
                "optimal_temp_max": float(v.optimal_temp_max) if v.optimal_temp_max else None,
                "optimal_rainfall_mm": float(v.optimal_rainfall_mm) if v.optimal_rainfall_mm else None,
                "optimal_ph_min": float(v.optimal_ph_min) if v.optimal_ph_min else None,
                "optimal_ph_max": float(v.optimal_ph_max) if v.optimal_ph_max else None,
                "expected_yield_per_acre_kg": float(v.expected_yield_per_acre_kg) if v.expected_yield_per_acre_kg else None,
                "compatible_soil_types": v.compatible_soil_types,
                "companion_plants": v.companion_plants,
                "incompatible_plants": v.incompatible_plants,
                "description": v.description,
                "is_active": v.is_active,
            }
            for v in plant.varieties
        ]

        return {
            "id": str(plant.id),
            "common_name": plant.common_name,
            "local_name": plant.local_name,
            "category": plant.category,
            "sub_category": plant.sub_category,
            "description": plant.description,
            "is_active": plant.is_active,
            "stages": stages,
            "varieties": varieties,
        }

    async def create_plant(self, db: AsyncSession, data: PlantCreate) -> Plant:
        plant = Plant(**data.model_dump())
        db.add(plant)
        await db.commit()
        await db.refresh(plant)
        return plant

    async def update_plant(self, db: AsyncSession, plant_id: uuid.UUID, data: PlantUpdate) -> Plant:
        plant = await self.plant_repo.get(db, plant_id)
        if not plant:
            raise HTTPException(status_code=404, detail="Plant not found")
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(plant, k, v)
        await db.commit()
        await db.refresh(plant)
        return plant

    async def delete_plant(self, db: AsyncSession, plant_id: uuid.UUID) -> dict:
        plant = await self.plant_repo.get(db, plant_id)
        if not plant:
            raise HTTPException(status_code=404, detail="Plant not found")
        await db.delete(plant)
        await db.commit()
        return {"message": "Plant and associated stages/varieties deleted."}

    # ── 5. Master Data: Plant Varieties ──────────────────────

    async def list_varieties(self, db: AsyncSession, plant_id: Optional[uuid.UUID] = None) -> List[dict]:
        stmt = select(PlantVariety, Plant).join(Plant, PlantVariety.plant_id == Plant.id)
        if plant_id:
            stmt = stmt.where(PlantVariety.plant_id == plant_id)
        stmt = stmt.order_by(Plant.common_name, PlantVariety.variety_name)
        res = await db.execute(stmt)

        out = []
        for v, p in res.all():
            out.append({
                "id": str(v.id),
                "plant_id": str(v.plant_id),
                "crop_name": p.common_name,
                "variety_name": v.variety_name,
                "scientific_name": v.scientific_name,
                "growth_duration_days": v.growth_duration_days,
                "planting_season": v.planting_season,
                "optimal_temp_min": float(v.optimal_temp_min) if v.optimal_temp_min else None,
                "optimal_temp_max": float(v.optimal_temp_max) if v.optimal_temp_max else None,
                "optimal_rainfall_mm": float(v.optimal_rainfall_mm) if v.optimal_rainfall_mm else None,
                "optimal_ph_min": float(v.optimal_ph_min) if v.optimal_ph_min else None,
                "optimal_ph_max": float(v.optimal_ph_max) if v.optimal_ph_max else None,
                "expected_yield_per_acre_kg": float(v.expected_yield_per_acre_kg) if v.expected_yield_per_acre_kg else None,
                "compatible_soil_types": v.compatible_soil_types,
                "companion_plants": v.companion_plants,
                "incompatible_plants": v.incompatible_plants,
                "description": v.description,
                "is_active": v.is_active,
            })
        return out

    async def create_variety(self, db: AsyncSession, plant_id: uuid.UUID, data: PlantVarietyCreate) -> dict:
        plant = await self.plant_repo.get(db, plant_id)
        if not plant:
            raise HTTPException(status_code=404, detail="Plant not found")

        variety = PlantVariety(plant_id=plant_id, **data.model_dump())
        db.add(variety)
        await db.commit()
        await db.refresh(variety)
        return {"id": str(variety.id), "variety_name": variety.variety_name, "message": "Variety created"}

    async def update_variety(self, db: AsyncSession, variety_id: uuid.UUID, data: PlantVarietyUpdate) -> dict:
        res = await db.execute(select(PlantVariety).where(PlantVariety.id == variety_id))
        variety = res.scalar_one_or_none()
        if not variety:
            raise HTTPException(status_code=404, detail="Variety not found")

        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(variety, k, v)
        await db.commit()
        await db.refresh(variety)
        return {"id": str(variety.id), "variety_name": variety.variety_name, "message": "Variety updated"}

    async def delete_variety(self, db: AsyncSession, variety_id: uuid.UUID) -> dict:
        res = await db.execute(select(PlantVariety).where(PlantVariety.id == variety_id))
        variety = res.scalar_one_or_none()
        if not variety:
            raise HTTPException(status_code=404, detail="Variety not found")
        await db.delete(variety)
        await db.commit()
        return {"message": "Variety deleted"}

    # ── 6. Master Data: Stages, Water & Nutrients ─────────────

    async def create_plant_stage(self, db: AsyncSession, plant_id: uuid.UUID, data: PlantStageCreate) -> dict:
        plant = await self.plant_repo.get(db, plant_id)
        if not plant:
            raise HTTPException(status_code=404, detail="Plant not found")

        stage_dict = data.model_dump(exclude={"water_req", "nutrient_req"})
        stage = PlantStage(plant_id=plant_id, **stage_dict)
        db.add(stage)
        await db.flush()

        if data.water_req:
            w_req = PlantWaterReq(plant_stage_id=stage.id, **data.water_req.model_dump())
            db.add(w_req)

        if data.nutrient_req:
            n_req = PlantNutrientReq(plant_stage_id=stage.id, **data.nutrient_req.model_dump())
            db.add(n_req)

        await db.commit()
        await db.refresh(stage)
        return {"id": str(stage.id), "stage_name": stage.stage_name, "stage_order": stage.stage_order}

    async def update_plant_stage(self, db: AsyncSession, stage_id: uuid.UUID, data: PlantStageUpdate) -> dict:
        res = await db.execute(
            select(PlantStage)
            .options(selectinload(PlantStage.water_req), selectinload(PlantStage.nutrient_req))
            .where(PlantStage.id == stage_id)
        )
        stage = res.scalar_one_or_none()
        if not stage:
            raise HTTPException(status_code=404, detail="Stage not found")

        stage_dict = data.model_dump(exclude={"water_req", "nutrient_req"}, exclude_unset=True)
        for k, v in stage_dict.items():
            setattr(stage, k, v)

        if data.water_req is not None:
            if stage.water_req:
                for k, v in data.water_req.model_dump().items():
                    setattr(stage.water_req, k, v)
            else:
                db.add(PlantWaterReq(plant_stage_id=stage.id, **data.water_req.model_dump()))

        if data.nutrient_req is not None:
            if stage.nutrient_req:
                for k, v in data.nutrient_req.model_dump().items():
                    setattr(stage.nutrient_req, k, v)
            else:
                db.add(PlantNutrientReq(plant_stage_id=stage.id, **data.nutrient_req.model_dump()))

        await db.commit()
        await db.refresh(stage)
        return {"id": str(stage.id), "stage_name": stage.stage_name, "message": "Stage updated"}

    async def delete_plant_stage(self, db: AsyncSession, stage_id: uuid.UUID) -> dict:
        res = await db.execute(select(PlantStage).where(PlantStage.id == stage_id))
        stage = res.scalar_one_or_none()
        if not stage:
            raise HTTPException(status_code=404, detail="Stage not found")
        await db.delete(stage)
        await db.commit()
        return {"message": "Stage and associated requirements deleted"}

    async def create_fertilizer_rec(self, db: AsyncSession, stage_id: uuid.UUID, data: FertilizerRecommendationCreate) -> dict:
        res = await db.execute(select(PlantStage).where(PlantStage.id == stage_id))
        if not res.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Stage not found")

        rec = PlantFertilizerRecommendation(plant_stage_id=stage_id, **data.model_dump())
        db.add(rec)
        await db.commit()
        await db.refresh(rec)
        return {"id": str(rec.id), "fertilizer_name": rec.fertilizer_name}

    async def delete_fertilizer_rec(self, db: AsyncSession, rec_id: uuid.UUID) -> dict:
        res = await db.execute(select(PlantFertilizerRecommendation).where(PlantFertilizerRecommendation.id == rec_id))
        rec = res.scalar_one_or_none()
        if not rec:
            raise HTTPException(status_code=404, detail="Fertilizer recommendation not found")
        await db.delete(rec)
        await db.commit()
        return {"message": "Fertilizer recommendation deleted"}

    async def create_pruning_guide(self, db: AsyncSession, stage_id: uuid.UUID, data: PruningGuideCreate) -> dict:
        res = await db.execute(select(PlantStage).where(PlantStage.id == stage_id))
        if not res.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Stage not found")

        guide = PlantPruningGuide(plant_stage_id=stage_id, **data.model_dump())
        db.add(guide)
        await db.commit()
        await db.refresh(guide)
        return {"id": str(guide.id), "pruning_type": guide.pruning_type}

    async def delete_pruning_guide(self, db: AsyncSession, guide_id: uuid.UUID) -> dict:
        res = await db.execute(select(PlantPruningGuide).where(PlantPruningGuide.id == guide_id))
        guide = res.scalar_one_or_none()
        if not guide:
            raise HTTPException(status_code=404, detail="Pruning guide not found")
        await db.delete(guide)
        await db.commit()
        return {"message": "Pruning guide deleted"}

    # ── 7. Master Data: Diseases & Health ────────────────────

    async def list_diseases(self, db: AsyncSession, plant_id: Optional[uuid.UUID] = None) -> List[dict]:
        stmt = (
            select(PlantDisease, Plant)
            .join(Plant, PlantDisease.plant_id == Plant.id)
            .options(selectinload(PlantDisease.solutions))
        )
        if plant_id:
            stmt = stmt.where(PlantDisease.plant_id == plant_id)
        stmt = stmt.order_by(PlantDisease.name)
        res = await db.execute(stmt)

        out = []
        for d, p in res.all():
            out.append({
                "id": str(d.id),
                "plant_id": str(d.plant_id),
                "crop_name": p.common_name,
                "name": d.name,
                "scientific_name": d.scientific_name,
                "description": d.description,
                "symptoms": d.symptoms or [],
                "conditions": d.conditions or [],
                "severity": d.severity,
                "image_url": d.image_url,
                "solutions_count": len(d.solutions) if hasattr(d, "solutions") and d.solutions else 0,
            })
        return out

    async def get_disease_detail(self, db: AsyncSession, disease_id: uuid.UUID) -> dict:
        stmt = (
            select(PlantDisease, Plant)
            .join(Plant, PlantDisease.plant_id == Plant.id)
            .where(PlantDisease.id == disease_id)
        )
        res = await db.execute(stmt)
        row = res.first()
        if not row:
            raise HTTPException(status_code=404, detail="Disease not found")

        disease, plant = row
        sol_res = await db.execute(
            select(DiseaseSolution).where(DiseaseSolution.disease_id == disease.id)
        )
        solutions = [
            {
                "id": str(s.id),
                "farming_method": s.farming_method,
                "solution_type": s.solution_type,
                "treatment_name": s.treatment_name,
                "dosage": s.dosage,
                "instructions": s.instructions,
            }
            for s in sol_res.scalars().all()
        ]

        return {
            "id": str(disease.id),
            "plant_id": str(disease.plant_id),
            "crop_name": plant.common_name,
            "name": disease.name,
            "scientific_name": disease.scientific_name,
            "description": disease.description,
            "symptoms": disease.symptoms or [],
            "conditions": disease.conditions or [],
            "severity": disease.severity,
            "image_url": disease.image_url,
            "solutions": solutions,
        }

    async def create_disease(self, db: AsyncSession, data: DiseaseCreate) -> dict:
        solutions_data = data.solutions or []
        disease_dict = data.model_dump(exclude={"solutions"})

        disease = PlantDisease(**disease_dict)
        db.add(disease)
        await db.flush()

        for sol in solutions_data:
            solution = DiseaseSolution(disease_id=disease.id, **sol.model_dump())
            db.add(solution)

        await db.commit()
        await db.refresh(disease)
        return {"id": str(disease.id), "name": disease.name, "solutions_count": len(solutions_data)}

    async def update_disease(self, db: AsyncSession, disease_id: uuid.UUID, data: DiseaseUpdate) -> dict:
        disease = await self.disease_repo.get(db, disease_id)
        if not disease:
            raise HTTPException(status_code=404, detail="Disease not found")

        solutions_data = data.solutions
        update_dict = data.model_dump(exclude={"solutions"}, exclude_unset=True)
        for k, v in update_dict.items():
            setattr(disease, k, v)

        if solutions_data is not None:
            existing = await db.execute(select(DiseaseSolution).where(DiseaseSolution.disease_id == disease.id))
            for sol in existing.scalars().all():
                await db.delete(sol)
            for sol in solutions_data:
                new_sol = DiseaseSolution(disease_id=disease.id, **sol.model_dump())
                db.add(new_sol)

        await db.commit()
        await db.refresh(disease)
        return {"id": str(disease.id), "name": disease.name, "message": "Updated successfully"}

    async def delete_disease(self, db: AsyncSession, disease_id: uuid.UUID) -> dict:
        disease = await self.disease_repo.get(db, disease_id)
        if not disease:
            raise HTTPException(status_code=404, detail="Disease not found")
        await self.disease_repo.remove(db, id=disease_id)
        return {"message": "Disease deleted"}

    # ── 8. Master Data: Pests & Solutions ────────────────────

    async def list_pests(self, db: AsyncSession, plant_id: Optional[uuid.UUID] = None) -> List[dict]:
        stmt = select(PlantPest, Plant).join(Plant, PlantPest.plant_id == Plant.id)
        if plant_id:
            stmt = stmt.where(PlantPest.plant_id == plant_id)
        stmt = stmt.order_by(PlantPest.name)
        res = await db.execute(stmt)

        out = []
        for pest, plant in res.all():
            out.append({
                "id": str(pest.id),
                "plant_id": str(pest.plant_id),
                "crop_name": plant.common_name,
                "name": pest.name,
                "scientific_name": pest.scientific_name,
                "description": pest.description,
                "signs": pest.signs or [],
                "affected_parts": pest.affected_parts or [],
                "image_url": pest.image_url,
            })
        return out

    async def get_pest_detail(self, db: AsyncSession, pest_id: uuid.UUID) -> dict:
        stmt = select(PlantPest, Plant).join(Plant, PlantPest.plant_id == Plant.id).where(PlantPest.id == pest_id)
        res = await db.execute(stmt)
        row = res.first()
        if not row:
            raise HTTPException(status_code=404, detail="Pest not found")

        pest, plant = row
        sol_res = await db.execute(
            select(PestSolution).where(PestSolution.pest_id == pest.id)
        )
        solutions = [
            {
                "id": str(s.id),
                "farming_method": s.farming_method,
                "treatment_name": s.treatment_name,
                "dosage": s.dosage,
                "instructions": s.instructions,
            }
            for s in sol_res.scalars().all()
        ]

        return {
            "id": str(pest.id),
            "plant_id": str(pest.plant_id),
            "crop_name": plant.common_name,
            "name": pest.name,
            "scientific_name": pest.scientific_name,
            "description": pest.description,
            "signs": pest.signs or [],
            "affected_parts": pest.affected_parts or [],
            "image_url": pest.image_url,
            "solutions": solutions,
        }

    async def create_pest(self, db: AsyncSession, data: PestCreate) -> dict:
        solutions_data = data.solutions or []
        pest_dict = data.model_dump(exclude={"solutions"})

        pest = PlantPest(**pest_dict)
        db.add(pest)
        await db.flush()

        for sol in solutions_data:
            solution = PestSolution(pest_id=pest.id, **sol.model_dump())
            db.add(solution)

        await db.commit()
        await db.refresh(pest)
        return {"id": str(pest.id), "name": pest.name, "solutions_count": len(solutions_data)}

    async def update_pest(self, db: AsyncSession, pest_id: uuid.UUID, data: PestUpdate) -> dict:
        res = await db.execute(select(PlantPest).where(PlantPest.id == pest_id))
        pest = res.scalar_one_or_none()
        if not pest:
            raise HTTPException(status_code=404, detail="Pest not found")

        solutions_data = data.solutions
        update_dict = data.model_dump(exclude={"solutions"}, exclude_unset=True)
        for k, v in update_dict.items():
            setattr(pest, k, v)

        if solutions_data is not None:
            existing = await db.execute(select(PestSolution).where(PestSolution.pest_id == pest.id))
            for sol in existing.scalars().all():
                await db.delete(sol)
            for sol in solutions_data:
                new_sol = PestSolution(pest_id=pest.id, **sol.model_dump())
                db.add(new_sol)

        await db.commit()
        await db.refresh(pest)
        return {"id": str(pest.id), "name": pest.name, "message": "Updated successfully"}

    async def delete_pest(self, db: AsyncSession, pest_id: uuid.UUID) -> dict:
        res = await db.execute(select(PlantPest).where(PlantPest.id == pest_id))
        pest = res.scalar_one_or_none()
        if not pest:
            raise HTTPException(status_code=404, detail="Pest not found")
        await db.delete(pest)
        await db.commit()
        return {"message": "Pest deleted"}

    # ── 9. Field Issues Triage ───────────────────────────────

    async def list_issues(
        self,
        db: AsyncSession,
        pagination: PaginationParams,
        status: Optional[str] = None,
        issue_type: Optional[str] = None,
        severity: Optional[str] = None,
        project_id: Optional[uuid.UUID] = None,
    ) -> Tuple[List[dict], int]:
        stmt = (
            select(ProjectIssue, Project, FarmerProfile, Plant)
            .join(Project, ProjectIssue.project_id == Project.id)
            .join(FarmerProfile, Project.farmer_id == FarmerProfile.id)
            .outerjoin(Plant, Project.plant_id == Plant.id)
        )

        if status:
            stmt = stmt.where(ProjectIssue.status == status)
        if issue_type:
            stmt = stmt.where(ProjectIssue.issue_type == issue_type)
        if severity:
            stmt = stmt.where(ProjectIssue.severity == severity)
        if project_id:
            stmt = stmt.where(ProjectIssue.project_id == project_id)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await db.execute(count_stmt)).scalar() or 0

        stmt = (
            stmt.order_by(desc(ProjectIssue.created_at))
            .offset(pagination.offset)
            .limit(pagination.per_page)
        )
        res = await db.execute(stmt)

        issues = []
        for issue, project, farmer, plant in res.all():
            issues.append({
                "id": str(issue.id),
                "project_id": str(issue.project_id),
                "project_name": project.name,
                "farmer_name": farmer.full_name,
                "crop_name": plant.common_name if plant else "Crop",
                "issue_type": issue.issue_type,
                "title": issue.title,
                "description": issue.description,
                "severity": issue.severity,
                "reported_date": issue.reported_date.isoformat(),
                "status": issue.status,
                "resolved_date": issue.resolved_date.isoformat() if issue.resolved_date else None,
                "is_shared_to_community": issue.is_shared_to_community,
                "images": issue.images or [],
                "ai_diagnosis": issue.ai_diagnosis,
                "identified_disease_id": str(issue.identified_disease_id) if issue.identified_disease_id else None,
                "identified_pest_id": str(issue.identified_pest_id) if issue.identified_pest_id else None,
                "created_at": issue.created_at.isoformat(),
            })

        return issues, total

    async def get_issue_detail(self, db: AsyncSession, issue_id: uuid.UUID) -> dict:
        stmt = (
            select(ProjectIssue, Project, FarmerProfile, Plant)
            .join(Project, ProjectIssue.project_id == Project.id)
            .join(FarmerProfile, Project.farmer_id == FarmerProfile.id)
            .outerjoin(Plant, Project.plant_id == Plant.id)
            .where(ProjectIssue.id == issue_id)
        )
        res = await db.execute(stmt)
        row = res.first()
        if not row:
            raise HTTPException(status_code=404, detail="Issue not found")

        issue, project, farmer, plant = row
        return {
            "id": str(issue.id),
            "project_id": str(issue.project_id),
            "project_name": project.name,
            "farmer_name": farmer.full_name,
            "crop_name": plant.common_name if plant else "Crop",
            "issue_type": issue.issue_type,
            "title": issue.title,
            "description": issue.description,
            "severity": issue.severity,
            "reported_date": issue.reported_date.isoformat(),
            "status": issue.status,
            "resolved_date": issue.resolved_date.isoformat() if issue.resolved_date else None,
            "is_shared_to_community": issue.is_shared_to_community,
            "images": issue.images or [],
            "ai_diagnosis": issue.ai_diagnosis,
            "identified_disease_id": str(issue.identified_disease_id) if issue.identified_disease_id else None,
            "identified_pest_id": str(issue.identified_pest_id) if issue.identified_pest_id else None,
            "created_at": issue.created_at.isoformat(),
        }

    async def update_issue(self, db: AsyncSession, issue_id: uuid.UUID, data: IssueStatusUpdate) -> dict:
        res = await db.execute(select(ProjectIssue).where(ProjectIssue.id == issue_id))
        issue = res.scalar_one_or_none()
        if not issue:
            raise HTTPException(status_code=404, detail="Issue not found")

        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(issue, k, v)

        if data.status == "resolved" and not issue.resolved_date:
            issue.resolved_date = date.today()

        await db.commit()
        await db.refresh(issue)
        return {"id": str(issue.id), "status": issue.status, "message": "Issue updated successfully"}

    async def delete_issue(self, db: AsyncSession, issue_id: uuid.UUID) -> dict:
        res = await db.execute(select(ProjectIssue).where(ProjectIssue.id == issue_id))
        issue = res.scalar_one_or_none()
        if not issue:
            raise HTTPException(status_code=404, detail="Issue not found")
        await db.delete(issue)
        await db.commit()
        return {"message": "Issue deleted"}
