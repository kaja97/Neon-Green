import uuid
from sqlalchemy import String, Text, ForeignKey, Numeric, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from .base import BaseModel


class Transaction(BaseModel):
    __tablename__ = "transactions"

    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="RESTRICT"), index=True)
    seller_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), index=True)
    buyer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), index=True)

    quantity: Mapped[float] = mapped_column(Numeric(10, 2))
    unit: Mapped[str] = mapped_column(String(50), default="kg")
    unit_price: Mapped[float] = mapped_column(Numeric(12, 2))
    total_price: Mapped[float] = mapped_column(Numeric(12, 2))

    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending, confirmed, completed, cancelled
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    transaction_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    product: Mapped["Product"] = relationship("Product", back_populates="transactions")
    seller: Mapped["Account"] = relationship("Account", foreign_keys=[seller_id], back_populates="sales")
    buyer: Mapped["Account"] = relationship("Account", foreign_keys=[buyer_id], back_populates="purchases")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="transaction", cascade="all, delete-orphan")


class Review(BaseModel):
    __tablename__ = "reviews"

    transaction_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("transactions.id", ondelete="CASCADE"), index=True)
    reviewer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), index=True)
    reviewee_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), index=True)

    rating: Mapped[int] = mapped_column(Integer)  # 1-5 stars
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    transaction: Mapped["Transaction"] = relationship("Transaction", back_populates="reviews")
    reviewer: Mapped["Account"] = relationship("Account", foreign_keys=[reviewer_id], back_populates="reviews_given")
    reviewee: Mapped["Account"] = relationship("Account", foreign_keys=[reviewee_id], back_populates="reviews_received")
