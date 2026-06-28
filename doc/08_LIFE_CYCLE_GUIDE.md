# AgriFarm AI — Life Cycle Plan & Daily Guidance Engine

## Overview

The **Life Cycle** is the core concept of AgriFarm AI. When a farmer creates a project, the system automatically generates a complete plan that covers the entire growing season — from planting to harvest — and then guides the farmer **every single day** through what needs to be done.

---

## 1. The Farming Circle (Visual Life Cycle)

The main visual on the project dashboard is the **Farming Circle** — a radial progress ring showing:

```
                    🌱 SEED (Day 0–7)
                  ●
                ●   ●
              ●       ●  🌿 SEEDLING (Day 7–21)
            ●           ●
           ●   [🍅 DAY]   ●
            ●   45/90   ●  🌸 FLOWERING (Day 35–55) ← CURRENT
              ●       ●
                ●   ●  🍎 FRUITING (Day 55–80)
                  ●
                    🌾 HARVEST (Day 80–90)
```

### Circle Rendering Logic
- Each arc segment = one plant stage
- Arc length = proportional to stage duration (days)
- **Completed stages:** Green fill
- **Current stage:** Blue/animated pulse, with day indicator
- **Upcoming stages:** Gray fill
- **Position marker:** Shows current day on the circle

---

## 2. Plant Stage Structure

Each crop in the master database has **6–7 growth stages**. Example for Tomato:

| Stage | Order | Start Day | End Day | Duration |
|-------|-------|-----------|---------|----------|
| Germination | 1 | 0 | 7 | 7 days |
| Seedling / Transplant | 2 | 7 | 21 | 14 days |
| Vegetative Growth | 3 | 21 | 42 | 21 days |
| Flowering | 4 | 42 | 60 | 18 days |
| Fruit Development | 5 | 60 | 78 | 18 days |
| Ripening & Harvest | 6 | 78 | 90 | 12 days |

**How current stage is determined:**
```python
def get_current_stage(project, plant_stages):
    days_since_planting = (date.today() - project.planting_date).days
    
    for stage in sorted(plant_stages, key=lambda s: s.stage_order):
        if stage.start_day <= days_since_planting <= stage.end_day:
            return stage, days_since_planting
    
    return None, days_since_planting  # harvest complete
```

---

## 3. Life Cycle Plan Generation

### Trigger
When a project is created → background Celery task runs `generate_season_plan(project_id)`

### Generation Algorithm

```
INPUT:
  - project.planting_date
  - project.area (e.g., 1 acre)
  - project.plant_count
  - project.farming_method (organic / conventional)
  - plant.plant_stages (all stages with start/end day)
  - plant_nutrient_requirements (N, P, K per stage)
  - plant_water_requirements (mm/day per stage)
  - plant_fertilizer_recommendations (products per stage)

OUTPUT:
  - List of farming_activities records
  - One activity_plans record

ALGORITHM:
  For each plant_stage:
    1. Calculate stage dates from planting_date + start_day/end_day
    
    2. Generate WATERING schedule:
       - frequency = water_requirements.irrigation_frequency_days
       - amount = water_mm_per_day × area_m² ÷ 1000 (convert to litres)
       - Create one watering activity every N days in the stage window
    
    3. Generate FERTILIZING schedule:
       - Get fertilizer_recommendations for this stage + farming method
       - Parse timing_note → assign a date within the stage
       - Scale quantity = quantity_per_acre × project.area
       - Create fertilizing activity with details (product, qty, method)
    
    4. Generate MONITORING activities:
       - For each high-risk disease in this stage → monitoring check every 7 days
    
    5. Generate MILESTONE activities:
       - Stage-start marker (e.g., "Begin vegetative care phase")
       - Stage-end marker (e.g., "Check for harvest readiness")
```

### Sample Output (Tomato, 1 Acre, March 2025)

```
Day 0   (Mar 1)  → Germination Start: Prepare seedling trays, sow seeds
Day 3   (Mar 4)  → Water seedling trays (5L)
Day 6   (Mar 7)  → Water seedling trays (5L)
Day 7   (Mar 8)  → Apply starter fertilizer to seedling mix
Day 14  (Mar 15) → Transplant seedlings to field (watering: 120L)
Day 17  (Mar 18) → Water field (120L)
Day 20  (Mar 21) → Apply basal fertilizer (TSP 50kg, MOP 25kg broadcast)
Day 21  (Mar 22) → Begin Vegetative Growth stage monitoring
Day 24  (Mar 25) → Water (150L) — monitor for aphids
Day 28  (Mar 29) → Apply Urea top-dressing (30kg broadcast + water in)
...
Day 42  (Apr 12) → Flowering begins — Stop nitrogen, boost potassium
Day 42  (Apr 12) → Apply Muriate of Potash (45kg)
Day 44  (Apr 14) → Water (160L) — critical flower retention period
Day 47  (Apr 17) → Monitor for fungal disease (high humidity risk)
...
Day 78  (May 18) → Check harvest readiness — 70% fruits red/pink
Day 82  (May 22) → Harvest first batch (estimated 800–1000 kg)
Day 85  (May 25) → Harvest final batch
Day 90  (May 30) → Project complete — update yield records
```

---

## 4. Daily Guidance Engine

Every morning at **5:00 AM**, a Celery Beat job runs for all active projects:

### Step 1: Weather Fetch & Adjustment
```
For each active project:
  1. Get lat/lng from project.location
  2. Fetch 5-day forecast (from Redis cache or API)
  3. Get pending activities for today + next 7 days
  
  For each activity:
    IF activity.type == 'watering' AND forecast.today.rainfall_mm > 10:
      → Mark activity 'skipped', reason = "Rain {X}mm expected"
      → Create notification: "Watering skipped — rain expected today"
    
    IF activity.type == 'spraying' AND forecast.wind_speed > 20 km/h:
      → Reschedule activity to +1 day
      → Notify: "Spraying rescheduled — wind too strong"
    
    IF forecast.humidity > 85 AND forecast.temp > 28:
      → Create weather_alert: "High disease risk — check for fungal"
```

### Step 2: Today's Task List Assembly
```
For each active project:
  today_activities = get_farming_activities(
    project_id=project.id,
    scheduled_date=today,
    status='pending'
  )
  
  Prioritize:
    Priority 1 (Critical): Harvest, transplanting, key fertilizer applications
    Priority 2 (Normal):   Regular watering, routine fertilizing
    Priority 3 (Optional): Monitoring checks, optional pruning
  
  Return today_activities sorted by priority
```

### Step 3: Notification Generation (sent at 6:00 AM)
```
For each active project:
  For each today_activity:
    Create notification:
      title = activity.title
      message = build_activity_message(activity, weather)
      deep_link = /projects/{id}?scroll=activity_plan&highlight={activity.id}
      scheduled_for = 6:00 AM in farmer's timezone
  
  If any weather_alert exists for today:
    Create urgent notification:
      title = weather_alert.title
      message = weather_alert.description
      deep_link = /projects/{id}?scroll=weather
```

---

## 5. Daily Dashboard View (What Farmer Sees)

### Morning (after notifications)
```
┌─────────────────────────────────────────────┐
│  🍅 TOMATO FARM — Day 45 of 90             │
│  Current Stage: FLOWERING ●●●○○ 50%         │
│                                             │
│  TODAY'S ACTIONS                            │
│  ┌─────────────────────────────────────┐   │
│  │ 🔴 CRITICAL — Apply Potassium       │   │
│  │    45kg Muriate of Potash           │   │
│  │    Method: Broadcast + water in     │   │
│  │    [✓ Mark Done] [Details]          │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ 🟡 NORMAL — Water plants            │   │
│  │    180 litres via drip irrigation   │   │
│  │    ⚠️ Skip if rain today            │   │
│  │    [✓ Mark Done] [Skip]             │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ 🔵 OPTIONAL — Pest monitoring       │   │
│  │    Check for aphids on new growth   │   │
│  │    [✓ Done] [Skip]                  │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Stage-Specific Guidance
Each stage has:
- `key_indicators`: What the farmer should see at this stage
- `critical_actions`: What MUST be done
- `watch_for`: Threats specific to this stage

Example for **Flowering Stage**:
```
KEY INDICATORS:
  ✅ Flower buds visible on all branches
  ✅ Plants are 60–90 cm tall
  ⚠️ Watch for blossom drop (indicates stress)

CRITICAL ACTIONS THIS STAGE:
  → Reduce nitrogen, increase potassium + phosphorus
  → Keep soil consistently moist (not waterlogged)
  → Avoid spraying pesticides during peak flowering (9am–3pm)
  → Stake or cage plants if not already done

WATCH FOR:
  ⚠️ Late Blight (fungal) — high risk if humidity > 80%
  ⚠️ Blossom End Rot — calcium deficiency symptom
  ⚠️ Whitefly — check undersides of leaves
```

---

## 6. Marking Activities as Done

When a farmer marks an activity as done:

```
1. Update farming_activities.status = 'done'
2. Set farming_activities.completed_at = now()
3. Trigger background job: update_activity_rag_doc(activity_id)
   → Adds to farmer's RAG knowledge base:
     "On {date}, applied {fertilizer} ({qty}kg) at {stage} stage. Notes: {farmer_notes}"
4. Update project dashboard progress
```

---

## 7. Rescheduling Logic

If a farmer skips or reschedules an activity:

```
Skip: status = 'skipped', skipped_reason filled
  → Critical activities (priority=1) create a warning notification next day
  → Normal activities: no follow-up

Reschedule: Create new activity record for new_date
  → Original activity: status = 'rescheduled'
  → New activity: linked to same plan, same stage
  → Check if new_date is still within the stage window
  → If beyond stage end: warn farmer that timing may be suboptimal
```

---

## 8. End-of-Season Summary

When a project reaches harvest:

```
1. Farmer updates project.actual_harvest_date
2. System triggers AI summary generation:
   - Total activities completed vs scheduled
   - Issues reported and resolved
   - Soil test history
   - Estimated vs actual yield
   - Market price at harvest time
   - Revenue estimate

3. Adds summary to farmer's RAG knowledge base
   → Future AI queries can reference this season's outcomes
4. Prompts farmer to: "Start a new tomato project? Use insights from this season"
```

---

## 9. Life Cycle Data Flow Summary

```
Project Created
      ↓
[Activity Planner Service]
  Generate full-season activity plan
  (deterministic: plant stages + water + fertilizer + monitoring)
      ↓
farming_activities table (all 90-day tasks created)
      ↓
Daily at 5 AM: Weather Adjustment Job
  Fetch weather → Skip/reschedule activities → Create alerts
      ↓
Daily at 6 AM: Notification Dispatch
  Push "today's tasks" to farmer's device
      ↓
Farmer takes action:
  Mark done / skip / report issue
      ↓
Background RAG update:
  Activity history → farmer's knowledge base
      ↓
AI Assistant uses RAG context:
  "Based on your activity history and current soil data..."
```
