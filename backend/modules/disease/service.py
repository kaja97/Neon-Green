from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from datetime import date
import uuid

from models.project import Project
from models.account import FarmerProfile
from models.issue import ProjectIssue
from models.plant_health import PlantDisease
from core.base_service import BaseService
from modules.auth.repository import FarmerProfileRepository
from modules.project.repository import ProjectRepository
from .repository import ProjectIssueRepository, DiseaseSolutionRepository
from .schemas import IssueCreate

class DiseaseService(BaseService):
    def __init__(
        self,
        profile_repo: FarmerProfileRepository,
        project_repo: ProjectRepository,
        issue_repo: ProjectIssueRepository,
        solution_repo: DiseaseSolutionRepository
    ):
        super().__init__()
        self.profile_repo = profile_repo
        self.project_repo = project_repo
        self.issue_repo = issue_repo
        self.solution_repo = solution_repo

    async def _get_farmer_id(self, db: AsyncSession, account_id: uuid.UUID) -> uuid.UUID:
        result = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == account_id))
        profile = result.scalars().first()
        if not profile:
            raise HTTPException(status_code=404, detail="Farmer profile not found")
        return profile.id

    async def report_issue(self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID, data: IssueCreate):
        farmer_id = await self._get_farmer_id(db, account_id)
        project = await self.project_repo.get(db, project_id)
        if not project or project.farmer_id != farmer_id:
            raise HTTPException(status_code=404, detail="Project not found")

        issue = ProjectIssue(
            project_id=project_id,
            issue_type=data.issue_type,
            title=data.title,
            description=data.description,
            severity=data.severity,
            reported_date=date.today(),
            status="open",
            images=data.images
        )

        db.add(issue)
        await db.commit()
        await db.refresh(issue)

        try:
            from core.cache import invalidate_dashboard_cache
            await invalidate_dashboard_cache(str(project_id))
        except Exception:
            pass

        return issue

    async def get_issues(self, db: AsyncSession, project_id: uuid.UUID, account_id: uuid.UUID):
        farmer_id = await self._get_farmer_id(db, account_id)
        project = await self.project_repo.get(db, project_id)
        if not project or project.farmer_id != farmer_id:
            raise HTTPException(status_code=404, detail="Project not found")
            
        return await self.issue_repo.get_by_project(db, project_id)

    async def search_diseases(self, db: AsyncSession, query: str):
        from .matcher import match_disease
        matches = await match_disease(db, query)
        
        if matches:
            ids = [m["id"] for m in matches]
            result = await db.execute(select(PlantDisease).where(PlantDisease.id.in_(ids)))
            diseases = result.scalars().all()
            
            id_to_rank = {m["id"]: m["rank"] for m in matches}
            diseases.sort(key=lambda d: id_to_rank.get(d.id, 0), reverse=True)
            return diseases
            
        return []

    async def get_disease_solutions(self, db: AsyncSession, disease_id: uuid.UUID, farming_method: str = "conventional"):
        methods = [farming_method]
        if farming_method == "inorganic":
            methods = ["conventional"]
        elif farming_method == "integrated":
            methods = ["conventional", "organic"]

        return await self.solution_repo.get_by_disease_and_methods(db, disease_id, methods)

    async def resolve_issue(self, db: AsyncSession, issue_id: uuid.UUID, account_id: uuid.UUID):
        farmer_id = await self._get_farmer_id(db, account_id)
        result = await db.execute(
            select(ProjectIssue, Project)
            .join(Project, ProjectIssue.project_id == Project.id)
            .where(ProjectIssue.id == issue_id)
        )
        row = result.first()
        if not row:
            raise HTTPException(status_code=404, detail="Issue not found")

        issue, project = row
        if project.farmer_id != farmer_id:
            raise HTTPException(status_code=403, detail="Not authorized")
            
        issue.status = "resolved"
        issue.resolved_date = date.today()

        await db.commit()
        await db.refresh(issue)

        try:
            from core.cache import invalidate_dashboard_cache
            await invalidate_dashboard_cache(str(issue.project_id))
        except Exception:
            pass

        return issue
