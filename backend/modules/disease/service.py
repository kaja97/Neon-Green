from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from datetime import date
import uuid

from models.project import Project
from models.account import FarmerProfile
from models.issue import ProjectIssue
from models.plant_health import PlantDisease
from models.comment import IssueComment
from core.base_service import BaseService
from modules.auth.repository import FarmerProfileRepository
from modules.project.repository import ProjectRepository
from .repository import ProjectIssueRepository, IssueCommentRepository, DiseaseSolutionRepository
from .schemas import (
    IssueCreate, IssueResponse, CommunityFeedItem,
    CommentCreate, IssueCommentResponse, CommentAuthorResponse,
)


class DiseaseService(BaseService):
    def __init__(
        self,
        profile_repo: FarmerProfileRepository,
        project_repo: ProjectRepository,
        issue_repo: ProjectIssueRepository,
        solution_repo: DiseaseSolutionRepository,
        comment_repo: IssueCommentRepository | None = None,
    ):
        super().__init__()
        self.profile_repo = profile_repo
        self.project_repo = project_repo
        self.issue_repo = issue_repo
        self.solution_repo = solution_repo
        self.comment_repo = comment_repo or IssueCommentRepository()

    async def _get_farmer_id(self, db: AsyncSession, account_id: uuid.UUID) -> uuid.UUID:
        result = await db.execute(select(FarmerProfile).where(FarmerProfile.account_id == account_id))
        profile = result.scalars().first()
        if not profile:
            raise HTTPException(status_code=404, detail="Farmer profile not found")
        return profile.id

    # ── Issue CRUD (owner-scoped) ──

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
            images=data.images,
            is_shared_to_community=data.is_shared_to_community,
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

    # ── Community feed (any authenticated farmer) ──

    async def list_community_issues(
        self,
        db: AsyncSession,
        *,
        issue_type: str | None = None,
        page: int = 1,
        per_page: int = 20,
    ) -> list[CommunityFeedItem]:
        """Paginated feed of issues shared to the community."""
        offset = (page - 1) * per_page
        q = (
            select(ProjectIssue, Project, FarmerProfile)
            .join(Project, ProjectIssue.project_id == Project.id)
            .join(FarmerProfile, Project.farmer_id == FarmerProfile.id)
            .where(ProjectIssue.is_shared_to_community.is_(True))
        )
        if issue_type:
            q = q.where(ProjectIssue.issue_type == issue_type)
        q = q.order_by(ProjectIssue.created_at.desc()).limit(per_page).offset(offset)

        result = await db.execute(q)
        rows = result.all()

        items: list[CommunityFeedItem] = []
        for issue, project, farmer in rows:
            comment_count = await self.comment_repo.count_by_issue(db, issue.id)
            items.append(CommunityFeedItem(
                id=issue.id,
                title=issue.title,
                issue_type=issue.issue_type,
                severity=issue.severity,
                status=issue.status,
                images=issue.images,
                author_name=farmer.full_name,
                author_avatar_url=farmer.avatar_url,
                plant_name=project.name,
                created_at=issue.created_at,
                comment_count=comment_count,
            ))
        return items

    async def get_community_issue(self, db: AsyncSession, issue_id: uuid.UUID) -> dict:
        """Single shared issue detail, enriched with author + comment count."""
        result = await db.execute(
            select(ProjectIssue, Project, FarmerProfile)
            .join(Project, ProjectIssue.project_id == Project.id)
            .join(FarmerProfile, Project.farmer_id == FarmerProfile.id)
            .where(ProjectIssue.id == issue_id, ProjectIssue.is_shared_to_community.is_(True))
        )
        row = result.first()
        if not row:
            raise HTTPException(status_code=404, detail="Community issue not found")

        issue, project, farmer = row
        comment_count = await self.comment_repo.count_by_issue(db, issue.id)

        data = IssueResponse.model_validate(issue).model_dump()
        data["author_name"] = farmer.full_name
        data["author_avatar_url"] = farmer.avatar_url
        data["comment_count"] = comment_count
        data["plant_name"] = project.name
        return data

    # ── Comments (tree) ──

    async def list_comments(self, db: AsyncSession, issue_id: uuid.UUID) -> list[dict]:
        """Return a comment tree (nested dict structure) for an issue."""
        comments = await self.comment_repo.get_by_issue(db, issue_id)

        # Bulk-load authors
        author_ids = list({c.author_id for c in comments})
        authors = await self.comment_repo.get_authors(db, author_ids)
        author_map = {a.id: CommentAuthorResponse.model_validate(a) for a in authors}

        # Flat → tree
        lookup: dict[uuid.UUID, dict] = {}
        for c in comments:
            lookup[c.id] = {
                "id": str(c.id),
                "issue_id": str(c.issue_id),
                "parent_id": str(c.parent_id) if c.parent_id else None,
                "author": author_map[c.author_id].model_dump() if c.author_id in author_map else {
                    "id": str(c.author_id), "full_name": "Unknown", "avatar_url": None
                },
                "body": c.body,
                "images": c.images,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "replies": [],
            }

        roots: list[dict] = []
        for node in lookup.values():
            if node["parent_id"]:
                parent = lookup.get(uuid.UUID(node["parent_id"]))
                if parent:
                    parent["replies"].append(node)
                    continue
            roots.append(node)

        return roots

    async def create_comment(
        self,
        db: AsyncSession,
        issue_id: uuid.UUID,
        account_id: uuid.UUID,
        data: CommentCreate,
    ) -> dict:
        """Create a top-level comment or reply on a shared community issue."""
        issue = await self.issue_repo.get(db, issue_id)
        if not issue or not issue.is_shared_to_community:
            raise HTTPException(status_code=404, detail="Community issue not found")

        farmer_id = await self._get_farmer_id(db, account_id)

        # If replying, validate parent belongs to the same issue
        if data.parent_id:
            parent_result = await db.execute(
                select(IssueComment).where(IssueComment.id == data.parent_id)
            )
            parent = parent_result.scalars().first()
            if not parent or parent.issue_id != issue_id:
                raise HTTPException(status_code=400, detail="Parent comment not found on this issue")

        comment = IssueComment(
            issue_id=issue_id,
            author_id=farmer_id,
            parent_id=data.parent_id,
            body=data.body,
            images=data.images,
        )
        db.add(comment)
        await db.commit()
        await db.refresh(comment)

        # Load author for response
        authors = await self.comment_repo.get_authors(db, [farmer_id])
        author_resp = (
            CommentAuthorResponse.model_validate(authors[0])
            if authors
            else CommentAuthorResponse(id=farmer_id, full_name="Unknown", avatar_url=None)
        )

        return IssueCommentResponse(
            id=comment.id,
            issue_id=comment.issue_id,
            parent_id=comment.parent_id,
            author=author_resp,
            body=comment.body,
            images=comment.images,
            created_at=comment.created_at,
            replies=[],
        ).model_dump()
