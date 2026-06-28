# AgriFarm AI — Marketplace & Universal Identity Module (Future — v2.0)

> **NOTE:** This module is planned for v2.0 AFTER the core Farmer Project Service is complete.
> The database schema and identity structure are designed from day one to support this expansion.

## Overview
This document outlines the expansion of AgriFarm AI from a Farm Management System into a complete **B2B & B2C Agricultural Marketplace**. A person shouldn't have to create separate accounts to farm, sell fertilizer, and buy groceries.

---

## 1. Universal Identity Strategy: Role-Based Profiles

Instead of separate user tables per role, we use a single `accounts` table with optional linked profiles based on what the user wants to do.

```
accounts (The Master User)
    ├── farmer_profiles  (For managing crops, using AI guidance)
    ├── vendor_profiles   (For selling fertilizer, equipment, seeds)
    └── buyer_profiles    (For purchasing harvest — individuals, retailers, wholesalers)
```

**Why this works:** A farmer can have a `farmer_profile` to grow tomatoes AND a `vendor_profile` to sell organic compost to other farmers — all under one login.

### v1.0 (Current):
- Only `accounts` + `farmer_profiles` are active
- The `accounts` table already has the correct structure for multi-profile expansion

### v2.0 (Future):
- Add `vendor_profiles` and `buyer_profiles` tables
- Add marketplace endpoints
- Add role switcher in UI

---

## 2. Database Tables (Already Defined in 03_DATABASE_MODEL.md)

### `vendor_profiles`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `account_id` | UUID FK → accounts | CASCADE DELETE |
| `business_name` | VARCHAR(255) | Required |
| `tax_id` | VARCHAR(100) | |
| `warehouse_location` | TEXT | |
| `contact_phone` | VARCHAR(20) | |
| `rating` | DECIMAL(3,2) | 0.0 - 5.0 |
| `is_verified` | BOOLEAN | Admin-verified business |

### `buyer_profiles`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `account_id` | UUID FK → accounts | CASCADE DELETE |
| `full_name` | VARCHAR(255) | |
| `buyer_type` | VARCHAR(50) | `Individual`, `Retailer`, `Wholesaler` |
| `delivery_address` | TEXT | |
| `contact_phone` | VARCHAR(20) | |

### `vendor_products` (Agri-Input Market)
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `vendor_profile_id` | UUID FK → vendor_profiles | |
| `name` | VARCHAR(255) | e.g., "Organic Compost 50kg" |
| `type` | VARCHAR(50) | `Fertilizer`, `Seed`, `Equipment`, `Tool` |
| `description` | TEXT | |
| `price` | DECIMAL(10,2) | |
| `currency` | VARCHAR(10) | Default LKR |
| `stock_quantity` | INTEGER | |
| `image_url` | TEXT | |

### `harvest_listings` (Harvest Market)
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `project_id` | UUID FK → projects | Links to RAG-tracked growing history |
| `farmer_profile_id` | UUID FK → farmer_profiles | |
| `yield_amount` | DECIMAL(10,2) | Available quantity |
| `unit` | VARCHAR(20) | kg, tons |
| `price_per_kg` | DECIMAL(10,2) | |
| `status` | VARCHAR(50) | `Pre-order`, `Harvested`, `Sold Out` |
| `available_date` | DATE | |

**Key feature:** `harvest_listings.project_id` links directly to the farming project — buyers can view the crop's complete growing history (weather, soil, fertilizer, disease treatments) as a "Transparency Report".

### `orders` and `order_items`
Standard order/line-item pattern for both Agri-Input and Harvest markets.

---

## 3. Marketplace Services (v2.0 Implementation)

```python
# backend/modules/marketplace/service.py

class MarketplaceService:

    @staticmethod
    async def post_vendor_product(db, vendor_id, data):
        """Allow a Vendor to list a fertilizer/seed/tool product."""
        product = VendorProduct(vendor_profile_id=vendor_id, **data)
        db.add(product)
        await db.commit()
        return product

    @staticmethod
    async def create_harvest_listing(db, farmer_id, project_id, data):
        """Allow a Farmer to convert a Completed project into a listing."""
        project = await db.get(Project, project_id)
        if project.status != "harvested":
            raise HTTPException(400, "Project must be harvested before listing")

        listing = HarvestListing(
            farmer_profile_id=farmer_id,
            project_id=project_id,
            **data,
            status="Harvested"
        )
        db.add(listing)
        await db.commit()
        return listing

    @staticmethod
    async def place_order(db, buyer_id, items_data):
        """Allow a Buyer to place an order with row-level locking."""
        order = Order(buyer_profile_id=buyer_id, total_price=0, status="Pending")
        db.add(order)
        await db.flush()

        total = 0
        for item in items_data:
            # Row-level locking to prevent double-selling
            if item.get("harvest_listing_id"):
                listing = await db.execute(
                    select(HarvestListing)
                    .where(HarvestListing.id == item["harvest_listing_id"])
                    .with_for_update()  # SELECT ... FOR UPDATE
                )
                listing = listing.scalar_one()
                if listing.status == "Sold Out":
                    raise HTTPException(409, "Listing already sold out")

            line_total = item["quantity"] * item["unit_price"]
            total += line_total
            db.add(OrderItem(order_id=order.id, total_price=line_total, **item))

        order.total_price = total
        await db.commit()
        return order
```

---

## 4. API Routes (v2.0)

```python
# backend/modules/marketplace/router.py

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])

@router.post("/products")       # Vendor lists a product
@router.get("/products")        # Browse all products
@router.post("/harvests")       # Farmer lists a harvest
@router.get("/harvests")        # Browse all harvests
@router.get("/harvests/{id}/provenance")  # View crop's growing history
@router.post("/orders")         # Buyer places order
@router.get("/orders")          # List buyer's orders
```

---

## 5. Frontend Pages (v2.0)

```
app/(app)/
├── marketplace/
│   ├── page.tsx                  ← Marketplace home (browse products + harvests)
│   ├── products/page.tsx         ← Agri-input product grid
│   ├── harvests/page.tsx         ← Harvest listings grid
│   ├── harvests/[id]/page.tsx    ← Harvest detail + Transparency Report
│   ├── cart/page.tsx             ← Shopping cart
│   └── orders/page.tsx           ← Order history
├── vendor/
│   ├── dashboard/page.tsx        ← Vendor dashboard (my products, orders)
│   ├── products/new/page.tsx     ← Add new product form
│   └── orders/page.tsx           ← Vendor order management
```

### Role Switcher (in TopBar)
When a user has multiple profiles, they see a role switcher:
```
[🌱 Farmer Mode ▼]
  ├── 🌱 Farmer Mode
  ├── 🏪 Vendor Mode
  └── 🛒 Buyer Mode
```
