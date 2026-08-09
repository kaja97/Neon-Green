# Transactions and Reviews System

## 1. Overview
The Transactions and Reviews system allows Neon Farming users (Farmers, Vendors, Buyers) to formally execute deals on the marketplace and leave two-way feedback. This feature also seamlessly integrates the Project Lifecycle with the Marketplace, enabling farmers to list their harvested crops directly.

## 2. Core Workflows

### 2.1 Harvest to Marketplace Pipeline
1. **Harvest Completion**: When a project reaches the `harvested` status, the farmer is presented with a "Sell Harvest" option on the Project Details dashboard.
2. **Auto-filled Listing Form**: Initiating the sale opens a marketplace listing form. Crucial data such as the `project_id`, product name (from crop variety), and harvest date are automatically pre-filled.
3. **Marketplace Visibility**: The farmer specifies the `quantity_available` and `price_per_unit`. Upon submission, a `Product` entity is created and linked to the `Project`, making it visible to buyers and vendors in the Marketplace.

### 2.2 Transaction Execution
1. **Purchase Initiation**: A vendor or buyer browsing the marketplace clicks "Buy Now" on a listed product.
2. **Transaction Record**: A `Transaction` entity is generated. It records:
   - `product_id` (The item being sold)
   - `seller_id` (The farmer/owner of the product)
   - `buyer_id` (The user initiating the purchase)
   - `quantity`, `unit_price`, and calculated `total_price`
   - `status` (e.g., pending, completed, cancelled)

### 2.3 Two-Way Reviews
Once a transaction is finalized (status = `completed`), both parties can review each other.
- **Buyer reviewing Seller**: Focuses on product quality, accuracy of listing, and communication.
- **Seller reviewing Buyer**: Focuses on payment promptness and reliability.
- Both reviews are stored in the `Review` table, explicitly linked to the `Transaction` ID to maintain context.

### 2.4 Transaction History Dashboard
Both Farmers and Vendors have access to a dedicated `/transactions` dashboard.
- **Metrics**: Total Sales, Total Purchases, Net Balance.
- **Charts**: A visual representation (e.g., Bar Chart) comparing Sales Revenue vs. Purchases over time.
- **Ledger**: A detailed, filterable table of past transactions showing the partner involved, amount, and status.

## 3. Database Schema Additions

### Transaction Table
- `id` (UUID, PK)
- `product_id` (FK -> products.id)
- `seller_id` (FK -> accounts.id)
- `buyer_id` (FK -> accounts.id)
- `quantity` (Numeric)
- `unit_price` (Numeric)
- `total_price` (Numeric)
- `status` (String: pending, completed, cancelled)
- `transaction_date` (DateTime)

### Review Table
- `id` (UUID, PK)
- `transaction_id` (FK -> transactions.id)
- `reviewer_id` (FK -> accounts.id)
- `reviewee_id` (FK -> accounts.id)
- `rating` (Numeric/Integer, 1-5)
- `comment` (Text)
- `created_at` (DateTime)

### Modifications to Existing Tables
- **Product**: Added `project_id` (FK -> projects.id).
- **Project**: Added `products` relationship.
- **Account**: Added relationships for `sales`, `purchases`, `reviews_given`, and `reviews_received`.
