from fastapi import APIRouter, Depends, Query, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from database import get_db
from core.security import get_current_user_id
from core.response import success_response
from schemas.user import UserResponse, UserSearchResult, UserUpdateRequest
from services.user_service import UserService
from repositories.user_repo import ChatUserRepository

router = APIRouter(prefix="/users", tags=["Users"])


def get_user_service() -> UserService:
    return UserService(ChatUserRepository())


@router.get("/me", response_model=dict)
async def get_current_user_profile(
    request: Request,
    db: AsyncSession = Depends(get_db),
    account_id: str = Depends(get_current_user_id),
    user_service: UserService = Depends(get_user_service),
):
    """Get the current user's chat profile (auto-syncs if needed)."""
    # Note: request.headers.get("Authorization") contains the "Bearer <token>"
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid auth header")
    token = auth_header.split(" ")[1]

    user = await user_service.get_or_sync_user(db, account_id, token)
    return success_response(UserResponse.model_validate(user).model_dump())


@router.get("/search", response_model=dict)
async def search_users(
    request: Request,
    q: str = Query(..., min_length=2, description="Search term (name, email, phone)"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    account_id: str = Depends(get_current_user_id),
    user_service: UserService = Depends(get_user_service),
):
    """Search for other users by name, email, or phone."""
    auth_header = request.headers.get("Authorization")
    jwt_token = auth_header.split(" ")[1] if auth_header and auth_header.startswith("Bearer ") else ""

    # Resolve current user to exclude them from results
    current_user = await user_service.user_repo.get_by_account_id(
        db, uuid.UUID(account_id)
    )
    exclude_id = current_user.id if current_user else None

    users, total = await user_service.search_users(
        db, query=q, current_user_id=exclude_id, jwt_token=jwt_token, page=page, per_page=per_page
    )
    user_responses = [UserResponse.model_validate(u) for u in users]
    return success_response({"users": [u.model_dump() for u in user_responses], "total": total})


@router.get("/{target_account_id}", response_model=dict)
async def get_user_by_account_id(
    target_account_id: str,
    db: AsyncSession = Depends(get_db),
    current_account_id: str = Depends(get_current_user_id),
    user_service: UserService = Depends(get_user_service),
):
    """Get a specific user's chat profile by their main app account_id."""
    try:
        target_uuid = uuid.UUID(target_account_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid account_id format")

    user = await user_service.user_repo.get_by_account_id(db, target_uuid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return success_response(UserResponse.model_validate(user).model_dump())


@router.patch("/me", response_model=dict)
async def update_current_user_profile(
    data: UserUpdateRequest,
    db: AsyncSession = Depends(get_db),
    account_id: str = Depends(get_current_user_id),
    user_service: UserService = Depends(get_user_service),
):
    """Update own chat profile display name or avatar."""
    current_user = await user_service.user_repo.get_by_account_id(
        db, uuid.UUID(account_id)
    )
    if not current_user:
        raise HTTPException(status_code=404, detail="Chat profile not found. Call /me first.")
    
    updated_user = await user_service.update_profile(
        db, 
        current_user.id, 
        display_name=data.display_name, 
        avatar_url=data.avatar_url
    )
    return success_response(UserResponse.model_validate(updated_user).model_dump())
