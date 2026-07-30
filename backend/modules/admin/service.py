"""Admin service — business logic for user management and system stats."""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_, and_
from models.account import Account, FarmerProfile
from models.project import Project
from models.notification import Notification
from core.errors.exceptions import AppException
from core.errors.error_codes import ErrorCode
from core.redis import get_redis_client
from core.pagination import PaginationParams
from typing import Optional
from core.base_service import BaseService
from modules.auth.repository import AccountRepository
from .repository import PlantRepository, DiseaseRepository
from .schemas import PlantCreate, PlantUpdate, DiseaseCreate, DiseaseUpdate
import uuid
from fastapi import HTTPException
from models.plant import Plant
from models.plant_health import PlantDisease, PlantPest, DiseaseSolution


class AdminService(BaseService):
    def __init__(self, account_repo: AccountRepository, plant_repo: PlantRepository, disease_repo: DiseaseRepository):
        super().__init__()
        self.account_repo = account_repo
        self.plant_repo = plant_repo
        self.disease_repo = disease_repo

    async def list_users(
        self,
        db: AsyncSession,
        pagination: PaginationParams,
        role: Optional[str] = None,
        is_active: Optional[bool] = None,
        search: Optional[str] = None,
    ) -> tuple[list[dict], int]:
        """List all user accounts with optional filters."""
        query = select(Account, FarmerProfile).outerjoin(
            FarmerProfile, Account.id == FarmerProfile.account_id
        )

        if role:
            query = query.where(Account.role == role)
        if is_active is not None:
            query = query.where(Account.is_active == is_active)
        if search:
            search_term = f"%{search}%"
            query = query.where(
                or_(
                    Account.email.ilike(search_term),
                    Account.phone.ilike(search_term),
                    FarmerProfile.full_name.ilike(search_term),
                )
            )

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total = (await db.execute(count_query)).scalar() or 0

        # Paginate
        query = query.offset(pagination.offset).limit(pagination.per_page)
        if pagination.sort_order == "desc":
            query = query.order_by(Account.created_at.desc())
        else:
            query = query.order_by(Account.created_at.asc())

        result = await db.execute(query)
        rows = result.all()

        users = []
        for account, profile in rows:
            users.append({
                "id": str(account.id),
                "email": account.email,
                "phone": account.phone,
                "role": account.role,
                "is_active": account.is_active,
                "is_verified": account.is_verified,
                "last_login_at": account.last_login_at.isoformat() if account.last_login_at else None,
                "created_at": account.created_at.isoformat(),
                "full_name": profile.full_name if profile else None,
            })

        return users, total

    async def get_user_detail(self, db: AsyncSession, user_id: str) -> dict:
        """Get detailed user info."""
        result = await db.execute(
            select(Account, FarmerProfile).outerjoin(
                FarmerProfile, Account.id == FarmerProfile.account_id
            ).where(Account.id == user_id)
        )
        row = result.first()
        if not row:
            raise AppException(ErrorCode.ADMIN_USER_NOT_FOUND)

        account, profile = row

        # Count projects — farmer_id is FarmerProfile.id, NOT Account.id
        proj_count = 0
        if profile:
            proj_count = (await db.execute(
                select(func.count()).select_from(Project).where(Project.farmer_id == profile.id)
            )).scalar() or 0

        return {
            "id": str(account.id),
            "email": account.email,
            "phone": account.phone,
            "role": account.role,
            "is_active": account.is_active,
            "is_verified": account.is_verified,
            "last_login_at": account.last_login_at.isoformat() if account.last_login_at else None,
            "created_at": account.created_at.isoformat(),
            "full_name": profile.full_name if profile else None,
            "farming_method": profile.farming_method if profile else None,
            "primary_language": profile.primary_language if profile else None,
            "experience_years": profile.experience_years if profile else 0,
            "project_count": proj_count,
        }

    async def deactivate_user(
        self, db: AsyncSession, admin_user: Account, target_user_id: str
    ) -> dict:
        """Soft-delete a user. Cannot deactivate self."""
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
        """Restore a deactivated user."""
        user = await self.account_repo.get(db, target_user_id)
        if not user:
            raise AppException(ErrorCode.ADMIN_USER_NOT_FOUND)

        user.is_active = True
        await db.commit()

        return {"message": f"User {user.email} has been reactivated."}

    async def change_user_role(
        self, db: AsyncSession, admin_user: Account, target_user_id: str, new_role: str
    ) -> dict:
        """Change a user's role (farmer ↔ admin)."""
        if str(admin_user.id) == target_user_id:
            raise AppException(ErrorCode.ADMIN_CANNOT_DELETE_SELF, detail="Cannot change your own role.")

        user = await self.account_repo.get(db, target_user_id)
        if not user:
            raise AppException(ErrorCode.ADMIN_USER_NOT_FOUND)

        user.role = new_role
        await db.commit()

        return {"message": f"User {user.email} role changed to {new_role}."}

    async def get_admin_stats(self, db: AsyncSession) -> dict:
        """Dashboard stats for admin panel."""
        total_users = (await db.execute(select(func.count()).select_from(Account))).scalar() or 0
        active_users = (await db.execute(
            select(func.count()).select_from(Account).where(Account.is_active == True)
        )).scalar() or 0
        admin_count = (await db.execute(
            select(func.count()).select_from(Account).where(Account.role == "admin")
        )).scalar() or 0

        total_projects = (await db.execute(select(func.count()).select_from(Project))).scalar() or 0
        active_projects = (await db.execute(
            select(func.count()).select_from(Project).where(Project.status == "active")
        )).scalar() or 0
        harvested_projects = (await db.execute(
            select(func.count()).select_from(Project).where(Project.status == "harvested")
        )).scalar() or 0

        total_notifications = (await db.execute(
            select(func.count()).select_from(Notification)
        )).scalar() or 0

        return {
            "users": {
                "total": total_users,
                "active": active_users,
                "deactivated": total_users - active_users,
                "admins": admin_count,
            },
            "projects": {
                "total": total_projects,
                "active": active_projects,
                "harvested": harvested_projects,
                "failed": total_projects - active_projects - harvested_projects,
            },
            "ai": {
                "calls_today": 0,
                "quota_utilization_pct": 0.0,
            },
            "notifications": {
                "sent_today": 0,
                "total": total_notifications,
            },
        }

    # --- Master Data Management ---

    async def list_plants(self, db: AsyncSession):
        return await self.plant_repo.get_active_plants(db)

    async def create_plant(self, db: AsyncSession, data: PlantCreate) -> Plant:
        return await self.plant_repo.create(db, obj_in=data)

    async def update_plant(self, db: AsyncSession, plant_id: uuid.UUID, data: PlantUpdate) -> Plant:
        plant = await self.plant_repo.get(db, plant_id)
        if not plant:
            raise HTTPException(status_code=404, detail="Plant not found")
        return await self.plant_repo.update(db, db_obj=plant, obj_in=data)

    async def delete_plant(self, db: AsyncSession, plant_id: uuid.UUID) -> dict:
        plant = await self.plant_repo.get(db, plant_id)
        if not plant:
            raise HTTPException(status_code=404, detail="Plant not found")
        await self.plant_repo.remove(db, id=plant_id)
        return {"message": "Plant deleted"}

    async def list_diseases(self, db: AsyncSession):
        return await self.disease_repo.get_all_ordered(db)

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
