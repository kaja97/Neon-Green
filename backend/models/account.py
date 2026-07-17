from sqlalchemy import (
    String,
    Boolean,
    DateTime,
    Date,
    ForeignKey,
    Integer,
    Text,
    Numeric,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from .base import BaseModel
import uuid


class Account(BaseModel):
    __tablename__ = "accounts"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(
        String(20), unique=True, index=True, nullable=True
    )
    password_hash: Mapped[str] = mapped_column(Text)
    role: Mapped[str] = mapped_column(String(20), default="buyer")
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    farmer_profile: Mapped["FarmerProfile"] = relationship(
        back_populates="account", uselist=False, cascade="all, delete-orphan", lazy="selectin"
    )
    vendor_profile: Mapped["VendorProfile"] = relationship(
        back_populates="account", uselist=False, cascade="all, delete-orphan", lazy="selectin"
    )
    buyer_profile: Mapped["BuyerProfile"] = relationship(
        back_populates="account", uselist=False, cascade="all, delete-orphan", lazy="selectin"
    )
    products: Mapped[list["Product"]] = relationship(
        "Product", back_populates="seller", cascade="all, delete-orphan"
    )


class FarmerProfile(BaseModel):
    __tablename__ = "farmer_profiles"

    account_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), unique=True
    )
    full_name: Mapped[str] = mapped_column(String(255))
    date_of_birth: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    primary_language: Mapped[str] = mapped_column(String(10), default="en")
    experience_years: Mapped[int] = mapped_column(Integer, default=0)
    education_level: Mapped[str | None] = mapped_column(String(50), nullable=True)
    farming_method: Mapped[str] = mapped_column(String(50), default="integrated")
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)

    account: Mapped["Account"] = relationship(back_populates="farmer_profile")


class VendorProfile(BaseModel):
    __tablename__ = "vendor_profiles"

    account_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), unique=True
    )
    business_name: Mapped[str] = mapped_column(String(255))
    tax_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    warehouse_location: Mapped[str | None] = mapped_column(Text, nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    rating: Mapped[float] = mapped_column(Numeric(3, 2), default=0.0)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    account: Mapped["Account"] = relationship(back_populates="vendor_profile")


class BuyerProfile(BaseModel):
    __tablename__ = "buyer_profiles"

    account_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), unique=True
    )
    full_name: Mapped[str] = mapped_column(String(255))
    buyer_type: Mapped[str] = mapped_column(String(50), default="Individual")
    delivery_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)

    account: Mapped["Account"] = relationship(back_populates="buyer_profile")
