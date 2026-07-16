# AgriFarm AI — Revenue Calculator & Harvest Management

## Overview
This document covers two features mentioned in the original project plan that need deeper specification:
1. **Revenue Calculator** — estimates what the farmer's crop is worth based on expected yield and live market prices
2. **Harvest Management** — tracks the end-of-season yield, quality, and sales

These features bridge the gap between the Activity Planner (growing the crop) and the Marketplace (selling the crop).

---

## 1. Revenue Calculator

### What It Does
At any point during the growing season, the farmer can see:
- **Expected yield** based on crop type, area, and current growth progress
- **Current market price** for their crop in their district
- **Estimated revenue** = Expected Yield × Current Price
- **Trend analysis** — is the price likely to go up or down by harvest time?

### When It Appears
- On the **MarketBlock** of the project dashboard (compact view)
- On the **Market detail page** (`/projects/[id]/market`) — full breakdown
- In the **weekly AI summary** — the AI mentions projected revenue

### Backend Logic (Deterministic)

```python
# backend/modules/market/service.py

def calculate_revenue_estimate(project_id: str, db: Session) -> dict:
    """
    Estimate revenue based on expected yield and current market price.
    Uses plant-specific yield-per-acre data and live price feeds.
    """
    project = db.get(Project, project_id)
    plant = project.plant
    area = float(project.area)
    days_since_planting = (date.today() - project.planting_date).days
    total_days = plant.growth_duration_days
    progress_pct = min((days_since_planting / total_days) * 100, 100)

    # Expected yield from plant master data (kg per acre)
    base_yield = float(plant.expected_yield_per_acre_kg or 0)
    expected_yield = base_yield * area

    # Yield adjustment based on project health
    # If farmer has been completing tasks consistently, yield estimate is higher
    task_completion_rate = get_task_completion_rate(project_id)
    issue_count = count_active_issues(project_id)

    yield_factor = 1.0
    if task_completion_rate > 0.9:
        yield_factor = 1.1  # Well-maintained farm: +10% yield
    elif task_completion_rate < 0.5:
        yield_factor = 0.7  # Neglected farm: -30% yield

    if issue_count > 3:
        yield_factor *= 0.85  # Multiple active issues: -15%

    adjusted_yield = expected_yield * yield_factor

    # Current market price
    price = get_latest_price(plant.id, project.location.district)
    current_price_per_kg = float(price.price) if price else 0
    trend = price.trend if price else "stable"

    # Revenue estimate
    estimated_revenue = adjusted_yield * current_price_per_kg

    # Projected revenue at harvest (using trend)
    if trend == "rising":
        harvest_price_estimate = current_price_per_kg * 1.10  # +10%
    elif trend == "falling":
        harvest_price_estimate = current_price_per_kg * 0.90  # -10%
    else:
        harvest_price_estimate = current_price_per_kg

    projected_revenue_at_harvest = adjusted_yield * harvest_price_estimate

    return {
        "crop": plant.common_name,
        "area": f"{project.area} {project.area_unit}",
        "progress_pct": round(progress_pct, 1),
        "expected_yield_kg": round(adjusted_yield, 1),
        "yield_factor": yield_factor,
        "yield_notes": get_yield_notes(task_completion_rate, issue_count),
        "current_price": {
            "price_per_kg": current_price_per_kg,
            "currency": "LKR",
            "trend": trend,
            "recorded_date": str(price.recorded_date) if price else None
        },
        "revenue_estimate_now": {
            "total": round(estimated_revenue, 2),
            "currency": "LKR",
            "note": "Based on current market price"
        },
        "revenue_estimate_at_harvest": {
            "total": round(projected_revenue_at_harvest, 2),
            "currency": "LKR",
            "note": f"Projected based on {trend} price trend"
        },
        "days_to_harvest": max(total_days - days_since_planting, 0)
    }

def get_yield_notes(completion_rate, issue_count):
    """Human-readable notes about yield adjustment."""
    notes = []
    if completion_rate > 0.9:
        notes.append("✅ Excellent task completion (+10% yield estimate)")
    elif completion_rate < 0.5:
        notes.append("⚠️ Low task completion (-30% yield estimate)")
    if issue_count > 3:
        notes.append(f"⚠️ {issue_count} active issues (-15% yield estimate)")
    if not notes:
        notes.append("📊 Standard yield estimate based on crop and area")
    return notes
```

### API Endpoint

```
GET /market/revenue/{project_id}
Response 200: {
  "data": {
    "crop": "Tomato",
    "area": "1.0 acres",
    "progress_pct": 50.0,
    "expected_yield_kg": 2200.0,
    "yield_factor": 1.1,
    "yield_notes": ["✅ Excellent task completion (+10% yield estimate)"],
    "current_price": { "price_per_kg": 180.00, "currency": "LKR", "trend": "rising" },
    "revenue_estimate_now": { "total": 396000.00, "currency": "LKR" },
    "revenue_estimate_at_harvest": { "total": 435600.00, "currency": "LKR" },
    "days_to_harvest": 45
  }
}
```

### Frontend: MarketBlock (Dashboard)

```
┌─────────────────────────────────────┐
│  💰 Revenue Estimate                │
│                                     │
│  Expected Yield: 2,200 kg           │
│  Current Price: 180 LKR/kg ↑12%    │
│                                     │
│  ─────────────────────────────────  │
│  💵 Estimated Revenue               │
│  LKR 396,000                        │
│  (At harvest: ~LKR 435,600 ↑)      │
│                                     │
│  📅 45 days to harvest              │
│  ✅ +10% yield bonus (good care)    │
└─────────────────────────────────────┘
```

---

## 2. Harvest Management [NOT FULLY IMPLEMENTED YET]
Note: Harvest logs table and the custom endpoints are not implemented yet in v1.0. Tapping 'Complete Harvest' simply updates the project status to harvested via `PATCH /projects/{id}/status`. [NOT FULLY IMPLEMENTED YET]
Note: Harvest logs table and the custom endpoints are not implemented yet in v1.0. Tapping 'Complete Harvest' simply updates the project status to harvested via `PATCH /projects/{id}/status`.

When a project reaches the Harvest stage, the farmer records actual harvest data.

### Harvest Recording Flow

```
Project Status: active → harvesting → harvested

Step 1: System detects Harvest stage reached (day 81+)
  → Send notification: "🌾 Your crop is ready to harvest!"
  → Show "Start Harvesting" button on dashboard

Step 2: Farmer taps "Start Harvesting"
  → Project status changes to "harvesting"
  → Daily harvest log becomes available

Step 3: Farmer records each harvest batch
  → Date, quantity (kg), quality grade, notes
  → Can record multiple batches over several days

Step 4: Farmer taps "Complete Harvest"
  → Records actual total yield
  → Records actual selling price
  → System generates end-of-season report
  → Project status changes to "harvested"
  → Option to "List on Marketplace" (future v2.0)
```

### API Endpoints

```
# Start harvesting
PATCH /projects/{id}/status
Body: { "status": "harvesting" }

# Record a harvest batch
POST /projects/{id}/harvest
Body: {
  "harvest_date": "2025-05-25",
  "quantity_kg": 450.0,
  "quality_grade": "A",
  "notes": "First batch from rows 1-5"
}

# Complete harvest (final)
POST /projects/{id}/harvest/complete
Body: {
  "total_yield_kg": 2100.0,
  "total_revenue_lkr": 378000.0,
  "average_price_per_kg": 180.0,
  "notes": "Good season. Late blight reduced yield slightly."
}

# Get harvest report
GET /projects/{id}/harvest/report
Response 200: {
  "data": {
    "crop": "Tomato",
    "area": "1.0 acres",
    "duration_days": 88,
    "planned_yield_kg": 2200.0,
    "actual_yield_kg": 2100.0,
    "yield_variance": -4.5,
    "total_revenue": 378000.0,
    "task_completion_rate": 92.0,
    "issues_count": 2,
    "issues_resolved": 2,
    "weather_adjustments": 8,
    "fertilizer_applied": [...],
    "water_used_liters": 16200,
    "ai_narrative": "Your tomato crop performed well...",
    "harvest_batches": [
      { "date": "2025-05-25", "kg": 450, "grade": "A" },
      { "date": "2025-05-27", "kg": 380, "grade": "A" },
      { "date": "2025-05-29", "kg": 520, "grade": "B" },
      { "date": "2025-05-31", "kg": 750, "grade": "A" }
    ]
  }
}
```

### Database Table Addition

```sql
-- Add to 03_DATABASE_MODEL.md Section 5

CREATE TABLE harvest_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    harvest_date DATE NOT NULL,
    quantity_kg DECIMAL(10,2) NOT NULL,
    quality_grade VARCHAR(10), -- A, B, C
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add columns to projects table:
ALTER TABLE projects ADD COLUMN actual_yield_kg DECIMAL(10,2);
ALTER TABLE projects ADD COLUMN actual_revenue DECIMAL(12,2);
ALTER TABLE projects ADD COLUMN actual_harvest_date DATE;
```

---

## 3. Plants Master Data Addition

The `plants` table needs a `expected_yield_per_acre_kg` column for the revenue calculator:

```python
# Addition to plants seed data
PLANT_YIELDS = {
    "Tomato": 2000,        # kg per acre (Sri Lankan average)
    "Chili": 800,          # kg per acre
    "Rice (Paddy)": 2500,  # kg per acre
    "Brinjal": 1500,       # kg per acre
    "Green Beans": 1200    # kg per acre
}
```

---

## 4. AI Integration with Revenue Data

The revenue data is included in the flattened context sent to Gemini:

```python
# Addition to context_builder.py

def build_project_context(project_id):
    # ... existing context ...
    
    revenue = calculate_revenue_estimate(project_id)
    
    context["revenue"] = {
        "expected_yield_kg": revenue["expected_yield_kg"],
        "current_price_per_kg": revenue["current_price"]["price_per_kg"],
        "estimated_revenue": revenue["revenue_estimate_now"]["total"],
        "projected_at_harvest": revenue["revenue_estimate_at_harvest"]["total"],
        "days_to_harvest": revenue["days_to_harvest"],
        "yield_factor": revenue["yield_factor"]
    }
    
    return context
```

The AI can then say things like:
> "Your tomato crop is on track for approximately 2,200 kg harvest (worth ~LKR 396,000 at today's prices). With tomato prices rising, you may earn closer to LKR 435,000 by harvest time. Focus on preventing blight to maintain your +10% yield bonus."
