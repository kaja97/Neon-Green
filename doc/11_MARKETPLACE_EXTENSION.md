# AgriFarm AI — Marketplace & Universal Identity Module

## Overview
This document outlines the expansion of the AgriFarm ecosystem from a pure Farm Management System (FMS) into a comprehensive B2B and B2C Marketplace. By introducing Role-Based Profiles tied to a Universal Identity, users can seamlessly transition between being a farmer, a vendor, and a buyer without managing multiple accounts.

---

## 1. Identity Models (FastAPI / SQLAlchemy)

The `Account` model now acts as a Universal Identity. Specific role behaviors are enabled by linking profile records (`FarmerProfile`, `VendorProfile`, `BuyerProfile`) to the base account.

```python
# backend/models/identity.py
from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, DECIMAL
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from .base import Base

class Account(Base):
    __tablename__ = "accounts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    
    # 1-to-1 relationships for universal identity
    farmer_profile = relationship("FarmerProfile", back_populates="account", uselist=False, cascade="all, delete-orphan")
    vendor_profile = relationship("VendorProfile", back_populates="account", uselist=False, cascade="all, delete-orphan")
    buyer_profile = relationship("BuyerProfile", back_populates="account", uselist=False, cascade="all, delete-orphan")


class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), unique=True)
    
    full_name = Column(String(255), nullable=False)
    farming_method = Column(String(50)) # organic, conventional, integrated
    
    account = relationship("Account", back_populates="farmer_profile")
    projects = relationship("Project", back_populates="farmer")
    harvest_listings = relationship("HarvestListing", back_populates="farmer")


class VendorProfile(Base):
    __tablename__ = "vendor_profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), unique=True)
    
    business_name = Column(String(255), nullable=False)
    tax_id = Column(String(100))
    warehouse_location = Column(String(500))
    
    account = relationship("Account", back_populates="vendor_profile")
    products = relationship("VendorProduct", back_populates="vendor")


class BuyerProfile(Base):
    __tablename__ = "buyer_profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), unique=True)
    
    full_name = Column(String(255))
    buyer_type = Column(String(50)) # Individual, Retailer, Wholesaler
    delivery_address = Column(String(500))
    
    account = relationship("Account", back_populates="buyer_profile")
    orders = relationship("Order", back_populates="buyer")
```

---

## 2. Marketplace Models (FastAPI / SQLAlchemy)

The Marketplace is split into two branches:
**A. Agri-Input Market:** Vendors sell supplies to farmers.
**B. Harvest Market:** Farmers sell their crops to buyers (linked to RAG-tracked projects).

```python
# backend/models/marketplace.py
from sqlalchemy import Column, String, Integer, ForeignKey, DECIMAL, Date, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from .base import Base

class VendorProduct(Base):
    """The Agri-Input Market (Vendors selling to Farmers)"""
    __tablename__ = "vendor_products"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vendor_profile_id = Column(UUID(as_uuid=True), ForeignKey("vendor_profiles.id", ondelete="CASCADE"))
    
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False) # Fertilizer, Seed, Tool, Equipment
    price = Column(DECIMAL(10, 2), nullable=False)
    stock_quantity = Column(Integer, default=0)
    
    vendor = relationship("VendorProfile", back_populates="products")


class HarvestListing(Base):
    """The Harvest Market (Farmers selling to Buyers)"""
    __tablename__ = "harvest_listings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_profile_id = Column(UUID(as_uuid=True), ForeignKey("farmer_profiles.id", ondelete="CASCADE"))
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE")) 
    
    yield_amount = Column(DECIMAL(10, 2), nullable=False)
    price_per_kg = Column(DECIMAL(10, 2), nullable=False)
    status = Column(String(50), default="Pre-order") # Pre-order, Harvested, Sold Out
    
    # Project relationship allows buyers to view RAG-tracked history, weather, and soil data
    project = relationship("Project") 
    farmer = relationship("FarmerProfile", back_populates="harvest_listings")


class Order(Base):
    """Master transaction record"""
    __tablename__ = "orders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    buyer_profile_id = Column(UUID(as_uuid=True), ForeignKey("buyer_profiles.id", ondelete="SET NULL"), nullable=True)
    farmer_profile_id = Column(UUID(as_uuid=True), ForeignKey("farmer_profiles.id", ondelete="SET NULL"), nullable=True)
    
    total_price = Column(DECIMAL(10, 2), nullable=False)
    status = Column(String(50), default="Pending") # Pending, Paid, Shipped, Delivered, Cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
    
    buyer = relationship("BuyerProfile", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    """Line items for transactions"""
    __tablename__ = "order_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"))
    vendor_product_id = Column(UUID(as_uuid=True), ForeignKey("vendor_products.id", ondelete="SET NULL"), nullable=True)
    harvest_listing_id = Column(UUID(as_uuid=True), ForeignKey("harvest_listings.id", ondelete="SET NULL"), nullable=True)
    
    quantity = Column(DECIMAL(10, 2), nullable=False)
    unit_price = Column(DECIMAL(10, 2), nullable=False)
    total_price = Column(DECIMAL(10, 2), nullable=False)
    
    order = relationship("Order", back_populates="items")
```

---

## 3. Marketplace Services (Modular Monolith)

This service manages the core CRUD functionality for the marketplace.

```python
# backend/services/marketplace.py
from sqlalchemy.orm import Session
from backend.models.marketplace import VendorProduct, HarvestListing, Order, OrderItem
from backend.models.identity import VendorProfile, FarmerProfile, BuyerProfile

class MarketplaceService:
    
    @staticmethod
    def post_vendor_product(db: Session, vendor_id: str, data: dict):
        """a) Allow a Vendor to post a fertilizer or input product."""
        product = VendorProduct(vendor_profile_id=vendor_id, **data)
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def create_harvest_listing(db: Session, farmer_id: str, project_id: str, yield_amount: float, price_per_kg: float):
        """b) Allow a Farmer to convert a Completed project into a HarvestListing."""
        listing = HarvestListing(
            farmer_profile_id=farmer_id,
            project_id=project_id,
            yield_amount=yield_amount,
            price_per_kg=price_per_kg,
            status="Harvested"
        )
        db.add(listing)
        db.commit()
        db.refresh(listing)
        return listing

    @staticmethod
    def place_order(db: Session, buyer_id: str, items_data: list):
        """c) Allow a Buyer to place an Order."""
        total_price = 0
        order = Order(buyer_profile_id=buyer_id, total_price=0, status="Pending")
        db.add(order)
        db.flush() # Get order.id
        
        for item in items_data:
            line_total = item["quantity"] * item["unit_price"]
            total_price += line_total
            order_item = OrderItem(
                order_id=order.id,
                vendor_product_id=item.get("vendor_product_id"),
                harvest_listing_id=item.get("harvest_listing_id"),
                quantity=item["quantity"],
                unit_price=item["unit_price"],
                total_price=line_total
            )
            db.add(order_item)
            
            # Stock reduction logic goes here
            
        order.total_price = total_price
        db.commit()
        db.refresh(order)
        return order
```

---

## 4. API Routing

The FastAPI routers expose the marketplace endpoints securely.

```python
# backend/api/routers/marketplace.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.services.marketplace import MarketplaceService
from backend.api.dependencies import get_current_user # Authentication dependency

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])

@router.post("/products", status_code=201)
def create_vendor_product(data: dict, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Allows a Vendor to list a product."""
    if not current_user.vendor_profile:
        raise HTTPException(status_code=403, detail="Vendor profile required")
    
    return MarketplaceService.post_vendor_product(db, current_user.vendor_profile.id, data)


@router.post("/harvests", status_code=201)
def create_harvest_listing(data: dict, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Allows a Farmer to list a crop harvest for sale."""
    if not current_user.farmer_profile:
        raise HTTPException(status_code=403, detail="Farmer profile required")
    
    return MarketplaceService.create_harvest_listing(
        db, current_user.farmer_profile.id, data["project_id"], data["yield_amount"], data["price_per_kg"]
    )


@router.post("/orders", status_code=201)
def place_order(data: dict, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Allows a Buyer or Farmer to place an order."""
    # Note: A farmer can also be a buyer in the agri-input market
    buyer_id = current_user.buyer_profile.id if current_user.buyer_profile else None
    
    if not buyer_id:
        raise HTTPException(status_code=403, detail="Buyer profile required")
        
    return MarketplaceService.place_order(db, buyer_id, data["items"])


@router.get("/harvests/{listing_id}/provenance")
def get_harvest_provenance(listing_id: str, db: Session = Depends(get_db)):
    """
    Returns the RAG-tracked history, weather data, and soil tests 
    for the project associated with a harvest listing.
    """
    # Logic to fetch Project details, Activities, and Soil results
    pass
```
