import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.account import Account
from dependencies import get_current_user, get_transaction_service
from core.response import success_response, created_response

from .schemas import (
    TransactionCreate,
    TransactionStatusUpdate,
    TransactionResponse,
    TransactionDetailResponse,
    TransactionSummary,
    ReviewCreate,
    ReviewResponse,
    SellerBuyerInfo,
    ProductShortInfo,
)
from .service import TransactionService

router = APIRouter(prefix="/transactions", tags=["Transactions"])


def _build_seller_buyer_info(account: Account) -> dict:
    """Build seller/buyer info dict from an Account object."""
    name = account.email.split("@")[0]  # fallback name
    if account.farmer_profile:
        name = account.farmer_profile.full_name
    elif account.vendor_profile:
        name = account.vendor_profile.business_name
    elif account.buyer_profile:
        name = account.buyer_profile.full_name

    return {
        "id": account.id,
        "email": account.email,
        "name": name,
        "phone": account.phone,
    }


def _format_transaction(tx) -> dict:
    """Format a transaction ORM object into a response dict."""
    data = {
        "id": tx.id,
        "product_id": tx.product_id,
        "seller_id": tx.seller_id,
        "buyer_id": tx.buyer_id,
        "quantity": float(tx.quantity),
        "unit": tx.unit,
        "unit_price": float(tx.unit_price),
        "total_price": float(tx.total_price),
        "status": tx.status,
        "notes": tx.notes,
        "transaction_date": tx.transaction_date,
        "created_at": tx.created_at,
        "updated_at": tx.updated_at,
    }

    if tx.product:
        data["product"] = {
            "id": tx.product.id,
            "title": tx.product.title,
            "unit": tx.product.unit,
            "images": tx.product.images,
            "status": tx.product.status,
        }

    if tx.seller:
        data["seller_info"] = _build_seller_buyer_info(tx.seller)

    if tx.buyer:
        data["buyer_info"] = _build_seller_buyer_info(tx.buyer)

    if hasattr(tx, "reviews") and tx.reviews:
        data["reviews"] = [
            {
                "id": r.id,
                "transaction_id": r.transaction_id,
                "reviewer_id": r.reviewer_id,
                "reviewee_id": r.reviewee_id,
                "rating": r.rating,
                "comment": r.comment,
                "created_at": r.created_at,
                "reviewer_name": _build_seller_buyer_info(r.reviewer)["name"] if r.reviewer else None,
                "reviewee_name": _build_seller_buyer_info(r.reviewee)["name"] if r.reviewee else None,
            }
            for r in tx.reviews
        ]
    else:
        data["reviews"] = []

    return data


def _format_review(review) -> dict:
    """Format a review ORM object into a response dict."""
    return {
        "id": review.id,
        "transaction_id": review.transaction_id,
        "reviewer_id": review.reviewer_id,
        "reviewee_id": review.reviewee_id,
        "rating": review.rating,
        "comment": review.comment,
        "created_at": review.created_at,
        "reviewer_name": _build_seller_buyer_info(review.reviewer)["name"] if review.reviewer else None,
        "reviewee_name": _build_seller_buyer_info(review.reviewee)["name"] if review.reviewee else None,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_transaction(
    data: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user),
    service: TransactionService = Depends(get_transaction_service),
):
    """Create a new transaction (buy a product)."""
    tx = await service.create_transaction(db, current_user.id, data)
    return created_response(_format_transaction(tx))


@router.get("")
async def list_my_transactions(
    type: Optional[str] = Query(None, description="Filter: 'sales' or 'purchases'"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user),
    service: TransactionService = Depends(get_transaction_service),
):
    """List transactions for the current user."""
    transactions = await service.get_my_transactions(
        db, current_user.id, role=type, status_filter=status_filter,
        skip=skip, limit=limit,
    )
    return success_response([_format_transaction(tx) for tx in transactions])


@router.get("/summary")
async def get_transaction_summary(
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user),
    service: TransactionService = Depends(get_transaction_service),
):
    """Get aggregate transaction stats for the current user."""
    summary = await service.get_summary(db, current_user.id)
    return success_response(summary)


@router.get("/{transaction_id}")
async def get_transaction_detail(
    transaction_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user),
    service: TransactionService = Depends(get_transaction_service),
):
    """Get details of a specific transaction."""
    tx = await service.get_transaction_detail(db, transaction_id, current_user.id)
    return success_response(_format_transaction(tx))


@router.patch("/{transaction_id}/status")
async def update_transaction_status(
    transaction_id: uuid.UUID,
    data: TransactionStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user),
    service: TransactionService = Depends(get_transaction_service),
):
    """Update transaction status (confirm, complete, cancel)."""
    tx = await service.update_status(db, transaction_id, current_user.id, data)
    return success_response(_format_transaction(tx))


@router.post("/{transaction_id}/reviews", status_code=status.HTTP_201_CREATED)
async def create_review(
    transaction_id: uuid.UUID,
    data: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user),
    service: TransactionService = Depends(get_transaction_service),
):
    """Leave a review for a completed transaction."""
    review = await service.create_review(db, transaction_id, current_user.id, data)
    return created_response(_format_review(review))


@router.get("/{transaction_id}/reviews")
async def get_transaction_reviews(
    transaction_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user),
    service: TransactionService = Depends(get_transaction_service),
):
    """Get reviews for a specific transaction."""
    reviews = await service.get_reviews_for_transaction(db, transaction_id)
    return success_response([_format_review(r) for r in reviews])


@router.get("/reviews/me")
async def get_my_reviews(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Account = Depends(get_current_user),
    service: TransactionService = Depends(get_transaction_service),
):
    """Get all reviews received by the current user."""
    reviews = await service.get_reviews_for_user(db, current_user.id, skip, limit)
    return success_response([_format_review(r) for r in reviews])
