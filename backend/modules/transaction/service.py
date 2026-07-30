import uuid
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from core.base_service import BaseService
from core.enums import TransactionStatus, TRANSACTION_STATUS_TRANSITIONS
from core.errors.exceptions import AppException
from core.errors.error_codes import ErrorCode
from models.marketplace import Product
from models.transaction import Transaction, Review
from models.account import Account, VendorProfile
from .repository import TransactionRepository, ReviewRepository
from .schemas import TransactionCreate, TransactionStatusUpdate, ReviewCreate


class TransactionService(BaseService):
    def __init__(
        self,
        transaction_repo: TransactionRepository,
        review_repo: ReviewRepository,
    ):
        super().__init__()
        self.transaction_repo = transaction_repo
        self.review_repo = review_repo

    async def create_transaction(
        self, db: AsyncSession, buyer_id: uuid.UUID, data: TransactionCreate
    ) -> Transaction:
        """
        Create a new transaction (purchase).
        Uses row-level locking (SELECT ... FOR UPDATE) to prevent overselling.
        """
        # 1. Lock the product row to prevent concurrent purchases
        result = await db.execute(
            select(Product)
            .where(Product.id == data.product_id)
            .with_for_update()
        )
        product = result.scalars().first()

        if not product:
            raise AppException(ErrorCode.NOT_FOUND, "Product not found")

        if product.status != "available":
            raise AppException(ErrorCode.VALIDATION_ERROR, "Product is not available for purchase")

        # 2. Prevent buying your own product
        if product.seller_id == buyer_id:
            raise AppException(ErrorCode.VALIDATION_ERROR, "You cannot buy your own product")

        # 3. Validate quantity
        if data.quantity > float(product.quantity_available):
            raise AppException(
                ErrorCode.VALIDATION_ERROR,
                f"Requested quantity ({data.quantity}) exceeds available ({float(product.quantity_available)})"
            )

        # 4. Calculate price server-side
        unit_price = float(product.price_per_unit)
        total_price = round(data.quantity * unit_price, 2)

        # 5. Create the transaction
        transaction = Transaction(
            product_id=product.id,
            seller_id=product.seller_id,
            buyer_id=buyer_id,
            quantity=data.quantity,
            unit=product.unit,
            unit_price=unit_price,
            total_price=total_price,
            status=TransactionStatus.PENDING.value,
            notes=data.notes,
        )
        db.add(transaction)

        # 6. Decrement product quantity
        product.quantity_available = float(product.quantity_available) - data.quantity
        if product.quantity_available <= 0:
            product.quantity_available = 0
            product.status = "sold_out"

        await db.commit()
        await db.refresh(transaction)

        # Re-fetch with relationships
        return await self.transaction_repo.get_with_details(db, transaction.id)

    async def get_my_transactions(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        role: Optional[str] = None,
        status_filter: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[Transaction]:
        """Get transactions for the current user."""
        return await self.transaction_repo.get_by_user(
            db, user_id=user_id, role=role, status_filter=status_filter,
            skip=skip, limit=limit,
        )

    async def get_transaction_detail(
        self, db: AsyncSession, transaction_id: uuid.UUID, user_id: uuid.UUID
    ) -> Transaction:
        """Get a single transaction. Only seller or buyer can view."""
        transaction = await self.transaction_repo.get_with_details(db, transaction_id)

        if not transaction:
            raise AppException(ErrorCode.NOT_FOUND, "Transaction not found")

        if transaction.seller_id != user_id and transaction.buyer_id != user_id:
            raise AppException(ErrorCode.FORBIDDEN, "You are not part of this transaction")

        return transaction

    async def get_summary(
        self, db: AsyncSession, user_id: uuid.UUID
    ) -> dict:
        """Get aggregate transaction stats."""
        return await self.transaction_repo.get_summary_stats(db, user_id)

    async def update_status(
        self,
        db: AsyncSession,
        transaction_id: uuid.UUID,
        user_id: uuid.UUID,
        data: TransactionStatusUpdate,
    ) -> Transaction:
        """
        Update transaction status with state machine enforcement.
        - Seller can: confirm (pending→confirmed), complete (confirmed→completed)
        - Buyer can: cancel (pending→cancelled)
        - Either can cancel a pending transaction.
        """
        transaction = await self.transaction_repo.get_with_details(db, transaction_id)

        if not transaction:
            raise AppException(ErrorCode.NOT_FOUND, "Transaction not found")

        if transaction.seller_id != user_id and transaction.buyer_id != user_id:
            raise AppException(ErrorCode.FORBIDDEN, "You are not part of this transaction")

        # Validate status transition
        current_status = TransactionStatus(transaction.status)
        try:
            new_status = TransactionStatus(data.status)
        except ValueError:
            raise AppException(ErrorCode.VALIDATION_ERROR, f"Invalid status: {data.status}")

        allowed = TRANSACTION_STATUS_TRANSITIONS.get(current_status, [])
        if new_status not in allowed:
            raise AppException(
                ErrorCode.VALIDATION_ERROR,
                f"Cannot transition from '{current_status.value}' to '{new_status.value}'"
            )

        # Role-based rules
        is_seller = transaction.seller_id == user_id
        is_buyer = transaction.buyer_id == user_id

        if new_status == TransactionStatus.CONFIRMED and not is_seller:
            raise AppException(ErrorCode.FORBIDDEN, "Only the seller can confirm a transaction")

        if new_status == TransactionStatus.COMPLETED and not is_seller:
            raise AppException(ErrorCode.FORBIDDEN, "Only the seller can mark a transaction as completed")

        # On cancellation, restore product quantity
        if new_status == TransactionStatus.CANCELLED:
            product = await db.get(Product, transaction.product_id)
            if product:
                product.quantity_available = float(product.quantity_available) + float(transaction.quantity)
                if product.status == "sold_out" and product.quantity_available > 0:
                    product.status = "available"

        transaction.status = new_status.value
        await db.commit()
        await db.refresh(transaction)

        return await self.transaction_repo.get_with_details(db, transaction.id)

    async def create_review(
        self,
        db: AsyncSession,
        transaction_id: uuid.UUID,
        reviewer_id: uuid.UUID,
        data: ReviewCreate,
    ) -> Review:
        """
        Create a review for a completed transaction.
        - Only seller or buyer can review.
        - Transaction must be completed.
        - No duplicate reviews.
        """
        transaction = await self.transaction_repo.get_with_details(db, transaction_id)

        if not transaction:
            raise AppException(ErrorCode.NOT_FOUND, "Transaction not found")

        if transaction.status != TransactionStatus.COMPLETED.value:
            raise AppException(ErrorCode.VALIDATION_ERROR, "Can only review completed transactions")

        if transaction.seller_id != reviewer_id and transaction.buyer_id != reviewer_id:
            raise AppException(ErrorCode.FORBIDDEN, "You are not part of this transaction")

        # Check for duplicate
        already_reviewed = await self.review_repo.exists_for_reviewer(
            db, transaction_id, reviewer_id
        )
        if already_reviewed:
            raise AppException(ErrorCode.VALIDATION_ERROR, "You have already reviewed this transaction")

        # Determine reviewee
        if reviewer_id == transaction.buyer_id:
            reviewee_id = transaction.seller_id
        else:
            reviewee_id = transaction.buyer_id

        review = Review(
            transaction_id=transaction_id,
            reviewer_id=reviewer_id,
            reviewee_id=reviewee_id,
            rating=data.rating,
            comment=data.comment,
        )
        db.add(review)
        await db.commit()
        await db.refresh(review)

        # Update vendor rating if reviewee has a vendor profile
        await self._update_vendor_rating(db, reviewee_id)

        return review

    async def _update_vendor_rating(self, db: AsyncSession, user_id: uuid.UUID):
        """Recalculate and update vendor profile rating from all reviews received."""
        result = await db.execute(
            select(func.avg(Review.rating)).where(Review.reviewee_id == user_id)
        )
        avg_rating = result.scalar()

        if avg_rating is not None:
            vendor_result = await db.execute(
                select(VendorProfile).where(VendorProfile.account_id == user_id)
            )
            vendor = vendor_result.scalars().first()
            if vendor:
                vendor.rating = round(float(avg_rating), 2)
                await db.commit()

    async def get_reviews_for_transaction(
        self, db: AsyncSession, transaction_id: uuid.UUID
    ) -> List[Review]:
        """Get reviews for a transaction."""
        return await self.review_repo.get_by_transaction(db, transaction_id)

    async def get_reviews_for_user(
        self, db: AsyncSession, user_id: uuid.UUID, skip: int = 0, limit: int = 50
    ) -> List[Review]:
        """Get all reviews received by a user."""
        return await self.review_repo.get_by_user(db, user_id, skip, limit)
