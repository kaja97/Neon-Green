from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func, or_, and_
import uuid

from core.base_repository import BaseRepository
from models.transaction import Transaction, Review


class TransactionRepository(BaseRepository[Transaction, dict, dict]):
    def __init__(self):
        super().__init__(Transaction)

    async def get_by_user(
        self,
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        role: Optional[str] = None,
        status_filter: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[Transaction]:
        """Get transactions for a user, optionally filtered by role (seller/buyer) and status."""
        query = select(Transaction)

        if role == "sales":
            query = query.where(Transaction.seller_id == user_id)
        elif role == "purchases":
            query = query.where(Transaction.buyer_id == user_id)
        else:
            query = query.where(
                or_(Transaction.seller_id == user_id, Transaction.buyer_id == user_id)
            )

        if status_filter:
            query = query.where(Transaction.status == status_filter)

        query = query.options(
            selectinload(Transaction.product),
            selectinload(Transaction.seller),
            selectinload(Transaction.buyer),
        ).order_by(Transaction.created_at.desc()).offset(skip).limit(limit)

        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_with_details(
        self, db: AsyncSession, transaction_id: uuid.UUID
    ) -> Optional[Transaction]:
        """Get a transaction with all relationships eagerly loaded."""
        query = (
            select(Transaction)
            .where(Transaction.id == transaction_id)
            .options(
                selectinload(Transaction.product),
                selectinload(Transaction.seller),
                selectinload(Transaction.buyer),
                selectinload(Transaction.reviews),
            )
        )
        result = await db.execute(query)
        return result.scalars().first()

    async def get_summary_stats(
        self, db: AsyncSession, user_id: uuid.UUID
    ) -> dict:
        """Get aggregate transaction stats for a user."""
        # Total sales (where user is seller, status = completed)
        sales_query = select(
            func.coalesce(func.sum(Transaction.total_price), 0).label("total"),
            func.count(Transaction.id).label("count"),
        ).where(
            and_(
                Transaction.seller_id == user_id,
                Transaction.status == "completed",
            )
        )
        sales_result = await db.execute(sales_query)
        sales_row = sales_result.first()

        # Total purchases (where user is buyer, status = completed)
        purchases_query = select(
            func.coalesce(func.sum(Transaction.total_price), 0).label("total"),
            func.count(Transaction.id).label("count"),
        ).where(
            and_(
                Transaction.buyer_id == user_id,
                Transaction.status == "completed",
            )
        )
        purchases_result = await db.execute(purchases_query)
        purchases_row = purchases_result.first()

        # Pending count
        pending_query = select(func.count(Transaction.id)).where(
            and_(
                or_(Transaction.seller_id == user_id, Transaction.buyer_id == user_id),
                Transaction.status == "pending",
            )
        )
        pending_result = await db.execute(pending_query)
        pending_count = pending_result.scalar() or 0

        total_sales = float(sales_row.total) if sales_row else 0.0
        total_purchases = float(purchases_row.total) if purchases_row else 0.0

        return {
            "total_sales": total_sales,
            "total_purchases": total_purchases,
            "net_balance": total_sales - total_purchases,
            "sales_count": sales_row.count if sales_row else 0,
            "purchases_count": purchases_row.count if purchases_row else 0,
            "pending_count": pending_count,
        }

    async def get_by_product(
        self, db: AsyncSession, product_id: uuid.UUID
    ) -> List[Transaction]:
        """Get all transactions for a product."""
        result = await db.execute(
            select(Transaction)
            .where(Transaction.product_id == product_id)
            .order_by(Transaction.created_at.desc())
        )
        return list(result.scalars().all())


class ReviewRepository(BaseRepository[Review, dict, dict]):
    def __init__(self):
        super().__init__(Review)

    async def get_by_transaction(
        self, db: AsyncSession, transaction_id: uuid.UUID
    ) -> List[Review]:
        """Get all reviews for a transaction."""
        result = await db.execute(
            select(Review)
            .where(Review.transaction_id == transaction_id)
            .options(
                selectinload(Review.reviewer),
                selectinload(Review.reviewee),
            )
        )
        return list(result.scalars().all())

    async def get_by_user(
        self, db: AsyncSession, user_id: uuid.UUID, skip: int = 0, limit: int = 50
    ) -> List[Review]:
        """Get all reviews received by a user."""
        result = await db.execute(
            select(Review)
            .where(Review.reviewee_id == user_id)
            .options(
                selectinload(Review.reviewer),
                selectinload(Review.transaction),
            )
            .order_by(Review.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def exists_for_reviewer(
        self, db: AsyncSession, transaction_id: uuid.UUID, reviewer_id: uuid.UUID
    ) -> bool:
        """Check if a reviewer has already reviewed this transaction."""
        result = await db.execute(
            select(func.count(Review.id)).where(
                and_(
                    Review.transaction_id == transaction_id,
                    Review.reviewer_id == reviewer_id,
                )
            )
        )
        return (result.scalar() or 0) > 0
