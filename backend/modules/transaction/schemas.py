from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
import uuid
from datetime import datetime


# ── Transaction Schemas ──────────────────────────────────

class TransactionCreate(BaseModel):
    """Buyer initiates a purchase. Price is derived server-side from the product."""
    product_id: uuid.UUID
    quantity: float = Field(..., gt=0, description="Quantity to purchase (must be > 0)")
    notes: Optional[str] = Field(None, max_length=500, description="Optional delivery or purchase notes")


class TransactionStatusUpdate(BaseModel):
    """Update transaction status (confirm, complete, cancel)."""
    status: str = Field(..., description="New status: confirmed, completed, or cancelled")
    reason: Optional[str] = Field(None, max_length=500, description="Optional reason for status change")


class SellerBuyerInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    email: str
    name: Optional[str] = None
    phone: Optional[str] = None


class ProductShortInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    title: str
    unit: str
    images: Optional[List[str]] = None
    status: str


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    product_id: uuid.UUID
    seller_id: uuid.UUID
    buyer_id: uuid.UUID
    quantity: float
    unit: str
    unit_price: float
    total_price: float
    status: str
    notes: Optional[str] = None
    transaction_date: datetime
    created_at: datetime
    updated_at: datetime


class TransactionDetailResponse(TransactionResponse):
    product: Optional[ProductShortInfo] = None
    seller_info: Optional[SellerBuyerInfo] = None
    buyer_info: Optional[SellerBuyerInfo] = None
    reviews: Optional[List["ReviewResponse"]] = []


class TransactionSummary(BaseModel):
    total_sales: float = 0.0
    total_purchases: float = 0.0
    net_balance: float = 0.0
    sales_count: int = 0
    purchases_count: int = 0
    pending_count: int = 0


class TransactionListParams(BaseModel):
    """Query parameters for listing transactions."""
    type: Optional[str] = None  # "sales" or "purchases" or None for all
    status: Optional[str] = None
    skip: int = 0
    limit: int = 50


# ── Review Schemas ───────────────────────────────────────

class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")
    comment: Optional[str] = Field(None, max_length=1000)


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    transaction_id: uuid.UUID
    reviewer_id: uuid.UUID
    reviewee_id: uuid.UUID
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    reviewer_name: Optional[str] = None
    reviewee_name: Optional[str] = None


# Rebuild forward refs
TransactionDetailResponse.model_rebuild()
