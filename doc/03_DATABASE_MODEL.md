# AgriFarm AI — Database Model

## Database: PostgreSQL 16 + pgvector + pg_trgm extensions

---

## Entity Relationship Overview

```
                                  ┌── (1) farmer_profiles ── (many) projects
                                  │
accounts (1) ─────────────────────┼── (1) vendor_profiles ── (many) vendor_products
                                  │
                                  └── (1) buyer_profiles  ── (many) orders

                  ┌───────────────────────┼──────────────────────┐
                  │                       │                      │
         farmer_locations        farmer_land_details      farmer_livestock
                  │
                  │  (location linked to project)
                  │
              projects (many per farmer)
              ├── plant_id ────────────── plants
              ├── location_id ─────────── farmer_locations
              ├── land_detail_id ──────── farmer_land_details
              └── farming_method_id ───── farming_methods
                  │
     ┌────────────┼──────────────────────────────────────┐
     │            │                                      │
project_      farming_activities                 project_issues
services      ├── plan_id ──── activity_plans       │
              ├── stage_id ─── plant_stages       ┌──┴──────────┐
              └── activity_details          plant_diseases   plant_pests
                                                  │               │
                                           disease_solutions  pest_solutions
                                                  └─────┬─────────┘
                                               farming_methods (shared)

plants (1) ──── (many) plant_stages
                            │
               ┌────────────┼───────────────────┐
      plant_nutrient_   plant_water_    plant_fertilizer_
      requirements      requirements   recommendations

soil_tests ──── soil_nutrient_results ──── soil_recommendations

weather_cache ──── weather_alerts
notifications (links to: farmer, project, activity, issue, alert)

farmer_rag_documents ──── farmer_rag_chunks (pgvector)
ai_conversations ──── ai_query_logs
market_prices ──── market_trends

vendor_products (agri-inputs) ──── orders (B2B/B2C)
harvest_listings (crop sales) ──── order_items
```

---

## Section 1: Universal Identity & Account Tables

### `accounts`
Core authentication record. One per user.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | Auto-generated |
| `email` | VARCHAR(255) UNIQUE | Login identifier |
| `phone` | VARCHAR(20) UNIQUE | Optional, for SMS |
| `password_hash` | TEXT | bcrypt |
| `role` | VARCHAR(20) | `farmer` / `admin` / `agronomist` |
| `is_verified` | BOOLEAN | Email verification status |
| `is_active` | BOOLEAN | Soft disable |
| `last_login_at` | TIMESTAMP | Track activity |
| `created_at` | TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | Auto |

---

### `farmer_profiles`
Personal details for each farmer. **1-to-1 with accounts.** Used for managing crops and using the RAG AI.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `account_id` | UUID FK → accounts | CASCADE DELETE |
| `full_name` | VARCHAR(255) | Required |
| `date_of_birth` | DATE | Optional |
| `gender` | VARCHAR(20) | Optional |
| `primary_language` | VARCHAR(10) | `en`, `si`, `ta` |
| `experience_years` | INTEGER | Default 0 |
| `education_level` | VARCHAR(50) | Optional |
| `farming_method` | VARCHAR(50) | e.g. `organic`, `conventional` |
| `avatar_url` | TEXT | S3 URL |
| `bio` | TEXT | Short farm description |

---

### `vendor_profiles`
For sellers of agri-inputs (Fertilizer, Equipment, Seeds). **1-to-1 with accounts.**

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `account_id` | UUID FK → accounts | CASCADE DELETE |
| `business_name` | VARCHAR(255) | Required |
| `tax_id` | VARCHAR(100) | |
| `warehouse_location` | TEXT | |
| `contact_phone` | VARCHAR(20) | |
| `rating` | DECIMAL(3,2) | 0.0 - 5.0 |
| `is_verified` | BOOLEAN | Verified business |

---

### `buyer_profiles`
For purchasing harvest outputs (Individuals, Retailers, Wholesalers). **1-to-1 with accounts.**

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `account_id` | UUID FK → accounts | CASCADE DELETE |
| `full_name` | VARCHAR(255) | |
| `buyer_type` | VARCHAR(50) | `Individual`, `Retailer`, `Wholesaler` |
| `delivery_address` | TEXT | |
| `contact_phone` | VARCHAR(20) | |

---

### `farmer_locations`
A farmer can have multiple land locations (home farm, north field, etc.)

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `farmer_id` | UUID FK → farmer_profiles | CASCADE DELETE |
| `label` | VARCHAR(100) | "Home Farm", "North Field" |
| `address_line` | TEXT | Street address |
| `city` | VARCHAR(100) | |
| `district` | VARCHAR(100) | Important for market prices |
| `province` | VARCHAR(100) | |
| `country` | VARCHAR(100) | Default: Sri Lanka |
| `latitude` | DECIMAL(10,8) | GPS coordinate |
| `longitude` | DECIMAL(11,8) | GPS coordinate |
| `timezone` | VARCHAR(50) | Default: Asia/Colombo |
| `is_primary` | BOOLEAN | Primary farm location |

---

### `farmer_land_details`
Detailed land characteristics for a location.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `farmer_id` | UUID FK → farmer_profiles | |
| `location_id` | UUID FK → farmer_locations | Optional link |
| `total_area` | DECIMAL(10,4) | Area size |
| `area_unit` | VARCHAR(20) | `acres`, `hectares`, `perches` |
| `land_type` | VARCHAR(50) | `paddy`, `highland`, `garden`, `greenhouse` |
| `soil_type` | VARCHAR(50) | `clay`, `loam`, `sandy`, `silty` |
| `water_source` | VARCHAR(50) | `well`, `canal`, `rain-fed`, `borehole` |
| `irrigation_type` | VARCHAR(50) | `drip`, `sprinkler`, `flood`, `none` |
| `land_ownership` | VARCHAR(30) | `owned`, `leased`, `rented` |
| `notes` | TEXT | Free-form notes |

---

### `farmer_livestock`
Animals the farmer keeps. Used for holistic farm context.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `farmer_id` | UUID FK → farmer_profiles | |
| `animal_type` | VARCHAR(100) | `cattle`, `poultry`, `goat`, `pig`, `fish` |
| `breed` | VARCHAR(100) | Breed name |
| `count` | INTEGER | Number of animals |
| `purpose` | VARCHAR(50) | `dairy`, `meat`, `eggs`, `dual` |
| `housing_type` | VARCHAR(50) | Housing arrangement |
| `notes` | TEXT | |

---

## Section 2: Master Plant Database

### `plants`
Master catalogue of crops. Seeded by admin. Read-only by farmers.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `common_name` | VARCHAR(255) | "Tomato" |
| `local_name` | VARCHAR(255) | Sinhala/Tamil name |
| `scientific_name` | VARCHAR(255) | Optional |
| `category` | VARCHAR(100) | `vegetable`, `fruit`, `grain`, `spice`, `leafy` |
| `sub_category` | VARCHAR(100) | |
| `growth_duration_days` | INTEGER | Total days seed to harvest |
| `planting_season` | TEXT[] | `['Yala', 'Maha']` |
| `optimal_temp_min` | DECIMAL(5,2) | °C |
| `optimal_temp_max` | DECIMAL(5,2) | °C |
| `optimal_rainfall_mm` | DECIMAL(8,2) | Annual mm |
| `optimal_ph_min` | DECIMAL(4,2) | |
| `optimal_ph_max` | DECIMAL(4,2) | |
| `compatible_soil_types` | TEXT[] | List of compatible soil types |
| `companion_plants` | TEXT[] | Good neighbor plants |
| `incompatible_plants` | TEXT[] | Bad neighbor plants |
| `description` | TEXT | General crop description |
| `image_url` | TEXT | S3 URL |
| `is_active` | BOOLEAN | Show/hide in app |

---

### `plant_stages`
The growth stages of each plant. This powers the **Life Cycle Plan**.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `plant_id` | UUID FK → plants | CASCADE DELETE |
| `stage_name` | VARCHAR(100) | "Germination", "Seedling", "Vegetative", "Flowering", "Fruiting", "Harvest" |
| `stage_order` | INTEGER | Sequence number (1, 2, 3…) |
| `start_day` | INTEGER | Day from planting start (e.g., 0) |
| `end_day` | INTEGER | Day when stage ends (e.g., 14) |
| `description` | TEXT | What happens in this stage |
| `key_indicators` | TEXT | Visual signs farmer should look for |
| `critical_actions` | TEXT | Must-do actions in this stage |
| `watch_for` | TEXT | Threats / risks in this stage |
| `image_url` | TEXT | Stage visual guide |
| **UNIQUE** | | `(plant_id, stage_order)` |

---

### `plant_nutrient_requirements`
How much N, P, K etc. a plant needs at each growth stage. Powers fertilizer scheduling.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `plant_id` | UUID FK → plants | |
| `stage_id` | UUID FK → plant_stages | |
| `nitrogen_kg_per_acre` | DECIMAL(8,4) | |
| `phosphorus_kg_per_acre` | DECIMAL(8,4) | |
| `potassium_kg_per_acre` | DECIMAL(8,4) | |
| `calcium_kg_per_acre` | DECIMAL(8,4) | |
| `magnesium_kg_per_acre` | DECIMAL(8,4) | |
| `sulfur_kg_per_acre` | DECIMAL(8,4) | |
| `zinc_ppm` | DECIMAL(8,4) | Micronutrient |
| `boron_ppm` | DECIMAL(8,4) | Micronutrient |
| `iron_ppm` | DECIMAL(8,4) | Micronutrient |
| `notes` | TEXT | Application notes |

---

### `plant_water_requirements`
Daily water needs per plant per stage. Powers irrigation scheduling.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `plant_id` | UUID FK → plants | |
| `stage_id` | UUID FK → plant_stages | |
| `water_mm_per_day` | DECIMAL(8,4) | Millimeters of water per day |
| `irrigation_frequency_days` | INTEGER | Irrigate every N days |
| `drought_tolerance` | VARCHAR(20) | `low`, `medium`, `high` |
| `waterlogging_tolerance` | VARCHAR(20) | `low`, `medium`, `high` |
| `notes` | TEXT | |

---

### `plant_fertilizer_recommendations`
Specific fertilizer products recommended per plant per stage.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `plant_id` | UUID FK → plants | |
| `stage_id` | UUID FK → plant_stages | |
| `fertilizer_type` | VARCHAR(100) | "Urea", "TSP", "MOP", "Compost" |
| `is_organic` | BOOLEAN | Organic-only flag |
| `quantity_per_acre` | DECIMAL(10,4) | Amount per acre |
| `unit` | VARCHAR(20) | `kg`, `L`, `bags` |
| `application_method` | VARCHAR(100) | `broadcast`, `band`, `foliar`, `drip` |
| `timing_note` | TEXT | "Apply at planting", "Split 3 ways over the stage" |

---

## Section 3: Diseases & Pests Tables

### `farming_methods`
Reference table for organic / conventional / integrated farming.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `code` | VARCHAR(20) UNIQUE | `organic`, `inorganic`, `integrated` |
| `name` | VARCHAR(100) | Display name |
| `description` | TEXT | Brief explanation |

---

### `plant_diseases`
Master disease catalogue. Linked to a plant (or NULL = affects many plants).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `plant_id` | UUID FK → plants | NULL = multi-crop disease |
| `disease_name` | VARCHAR(255) | "Early Blight", "Late Blight" |
| `local_name` | VARCHAR(255) | Sinhala/Tamil name |
| `pathogen_type` | VARCHAR(50) | `fungal`, `bacterial`, `viral`, `nutritional`, `physiological` |
| `symptoms` | TEXT | Keyword-rich symptom text (for matching) |
| `visual_symptoms` | TEXT | What the farmer sees in plain language |
| `affected_parts` | TEXT[] | `['leaves', 'stem', 'roots', 'fruit']` |
| `spread_conditions` | TEXT | Weather/conditions that promote spread |
| `spread_method` | VARCHAR(100) | `water`, `wind`, `insects`, `soil` |
| `severity` | VARCHAR(20) | `low`, `medium`, `high`, `critical` |
| `incubation_period` | VARCHAR(100) | e.g., "5–10 days after infection" |
| `image_urls` | TEXT[] | Visual reference images |

---

### `plant_pests`
Master pest catalogue.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `plant_id` | UUID FK → plants | NULL = multi-crop pest |
| `pest_name` | VARCHAR(255) | "Aphids", "Whitefly" |
| `local_name` | VARCHAR(255) | |
| `pest_type` | VARCHAR(50) | `insect`, `mite`, `nematode`, `rodent`, `bird` |
| `pest_category` | VARCHAR(50) | `sucking`, `chewing`, `boring`, `soil` |
| `symptoms` | TEXT | Keyword-rich symptom text |
| `visual_symptoms` | TEXT | Plain-language description |
| `affected_parts` | TEXT[] | |
| `infestation_conditions` | TEXT | Conditions that favour pest |
| `damage_threshold` | TEXT | Economic injury level |
| `life_cycle` | TEXT | Brief life cycle description |
| `severity` | VARCHAR(20) | |
| `image_urls` | TEXT[] | |

---

### `disease_solutions`
Treatment solutions per disease, filtered by farming method.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `disease_id` | UUID FK → plant_diseases | |
| `method_id` | UUID FK → farming_methods | Organic or conventional |
| `solution_name` | VARCHAR(255) | "Mancozeb spray", "Neem oil" |
| `product_name` | VARCHAR(255) | Brand or chemical name |
| `active_ingredient` | VARCHAR(255) | Active ingredient |
| `description` | TEXT | Application instructions |
| `dosage` | TEXT | e.g., "2g per litre" |
| `dilution_ratio` | TEXT | e.g., "1:500" |
| `application_method` | TEXT | Spraying, soil drench, etc. |
| `frequency` | TEXT | e.g., "Every 7 days" |
| `timing` | TEXT | "Early morning", "Before rain" |
| `waiting_period_days` | INTEGER | Days before harvest after application |
| `precautions` | TEXT | Safety warnings |
| `estimated_cost` | DECIMAL(10,2) | Per acre cost estimate |
| `effectiveness` | INTEGER | Rating 1–10 |

---

### `pest_solutions`
Same structure as disease_solutions but for pests.
*(Same columns as disease_solutions, referencing pest_id)*

---

## Section 4: Project Tables

### `projects`
The central entity. One project = one crop + one farm area + one season.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `farmer_id` | UUID FK → farmer_profiles | |
| `plant_id` | UUID FK → plants | The crop being grown |
| `location_id` | UUID FK → farmer_locations | Where it's being grown |
| `land_detail_id` | UUID FK → farmer_land_details | Land characteristics |
| `name` | VARCHAR(255) | "Tomato Farm — 1 Acre — March 2025" |
| `description` | TEXT | Optional notes |
| `farming_method_id` | UUID FK → farming_methods | Determines recommendation type |
| `area` | DECIMAL(10,4) | Area being farmed |
| `area_unit` | VARCHAR(20) | `acres`, `hectares` |
| `plant_count` | INTEGER | Estimated plant count |
| `planting_date` | DATE | When planting started |
| `expected_harvest_date` | DATE | Auto-calculated from plant duration |
| `actual_harvest_date` | DATE | Filled on harvest |
| `status` | VARCHAR(30) | `planning`, `active`, `harvested`, `failed`, `paused` |
| `notes` | TEXT | |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

### `project_services`
Which services are enabled for each project (modular add-ons).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `project_id` | UUID FK → projects | |
| `service_type` | VARCHAR(50) | `weather`, `soil`, `activity_plan`, `disease_watch`, `market_price`, `ai_chat` |
| `config_json` | JSONB | Service-specific settings |
| `is_active` | BOOLEAN | On/off toggle |
| `activated_at` | TIMESTAMP | |
| **UNIQUE** | | `(project_id, service_type)` |

---

## Section 5: Soil Analysis Tables

### `soil_tests`
Records of soil tests conducted for a project.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `project_id` | UUID FK → projects | |
| `farmer_id` | UUID FK → farmer_profiles | |
| `test_date` | DATE | When the test was taken |
| `lab_name` | VARCHAR(255) | Testing laboratory |
| `report_ref` | VARCHAR(100) | Lab reference number |
| `report_url` | TEXT | S3 URL to uploaded PDF |
| `input_method` | VARCHAR(30) | `manual`, `upload`, `api` |
| `status` | VARCHAR(20) | `pending`, `processed`, `applied` |
| `notes` | TEXT | |

---

### `soil_nutrient_results`
Actual measured values from the soil test.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `soil_test_id` | UUID FK → soil_tests | |
| `ph` | DECIMAL(4,2) | Soil pH |
| `nitrogen_ppm` | DECIMAL(10,4) | |
| `phosphorus_ppm` | DECIMAL(10,4) | |
| `potassium_ppm` | DECIMAL(10,4) | |
| `calcium_ppm` | DECIMAL(10,4) | |
| `magnesium_ppm` | DECIMAL(10,4) | |
| `sulfur_ppm` | DECIMAL(10,4) | |
| `zinc_ppm` | DECIMAL(10,4) | |
| `boron_ppm` | DECIMAL(10,4) | |
| `iron_ppm` | DECIMAL(10,4) | |
| `manganese_ppm` | DECIMAL(10,4) | |
| `copper_ppm` | DECIMAL(10,4) | |
| `organic_matter_pct` | DECIMAL(5,2) | |
| `ec_ds_per_m` | DECIMAL(8,4) | Electrical conductivity |
| `cec` | DECIMAL(8,4) | Cation exchange capacity |
| `sand_pct` | DECIMAL(5,2) | Texture analysis |
| `silt_pct` | DECIMAL(5,2) | |
| `clay_pct` | DECIMAL(5,2) | |

---

### `soil_recommendations`
Computed recommendations generated from soil test analysis (deterministic calculation).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `soil_test_id` | UUID FK → soil_tests | |
| `project_id` | UUID FK → projects | |
| `recommendation_type` | VARCHAR(50) | `fertilizer`, `amendment`, `pH_correction`, `irrigation` |
| `nutrient_affected` | VARCHAR(50) | Which nutrient is deficient |
| `current_level` | DECIMAL(10,4) | Measured value |
| `optimal_level` | DECIMAL(10,4) | Target value |
| `deficiency_severity` | VARCHAR(20) | `none`, `mild`, `moderate`, `severe` |
| `action_required` | TEXT | Plain-language action |
| `product_name` | VARCHAR(255) | Recommended product |
| `quantity_per_acre` | DECIMAL(10,4) | How much to apply |
| `unit` | VARCHAR(20) | kg, L |
| `timing` | TEXT | When to apply |
| `priority` | INTEGER | 1=urgent, 2=normal, 3=optional |
| `is_for_organic` | BOOLEAN | Organic-compatible solution |

---

## Section 6: Weather Tables

### `weather_cache`
Caches weather API responses to avoid repeated API calls.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `latitude` | DECIMAL(10,8) | |
| `longitude` | DECIMAL(11,8) | |
| `location_key` | VARCHAR(50) GENERATED | `"lat,lng"` rounded to 3 decimals |
| `forecast_date` | DATE | Date the forecast is for |
| `weather_json` | JSONB | Full API response |
| `fetched_at` | TIMESTAMP | When it was fetched |
| `expires_at` | TIMESTAMP | Cache expiry (3 hours) |
| **UNIQUE** | | `(location_key, forecast_date)` |

---

### `weather_alerts`
Alerts generated from weather analysis for a project.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `project_id` | UUID FK → projects | |
| `alert_type` | VARCHAR(50) | `rain_expected`, `drought`, `frost`, `storm`, `high_humidity` |
| `severity` | VARCHAR(20) | `info`, `warning`, `critical` |
| `title` | VARCHAR(255) | Short alert title |
| `description` | TEXT | Detail |
| `start_time` | TIMESTAMP | Alert window start |
| `end_time` | TIMESTAMP | Alert window end |
| `action_required` | TEXT | What farmer should do |
| `is_acknowledged` | BOOLEAN | Farmer has read it |

---

## Section 7: Activity Planning Tables

### `activity_plans`
The master plan record for a project (container for all activities).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `project_id` | UUID FK → projects | |
| `plan_type` | VARCHAR(50) | `full_season`, `weekly`, `weather_adjusted` |
| `generated_at` | TIMESTAMP | |
| `valid_from` | DATE | |
| `valid_to` | DATE | |
| `plan_metadata` | JSONB | Generation parameters, version |
| `is_active` | BOOLEAN | Current active plan |

---

### `farming_activities`
Individual farming tasks (the core of daily guidance).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `project_id` | UUID FK → projects | |
| `plan_id` | UUID FK → activity_plans | Which plan this belongs to |
| `stage_id` | UUID FK → plant_stages | Which crop stage this is for |
| `activity_type` | VARCHAR(50) | `watering`, `fertilizing`, `pruning`, `spraying`, `harvesting`, `monitoring` |
| `title` | VARCHAR(255) | "Water plants — 180L" |
| `description` | TEXT | Detailed instructions |
| `scheduled_date` | DATE | When to do it |
| `scheduled_time` | TIME | Optimal time of day |
| `priority` | INTEGER | 1=critical, 2=normal, 3=optional |
| `status` | VARCHAR(30) | `pending`, `done`, `skipped`, `rescheduled` |
| `is_weather_adjusted` | BOOLEAN | Was this modified by weather? |
| `completed_at` | TIMESTAMP | When farmer marked done |
| `skipped_reason` | TEXT | e.g., "Rain expected 18mm" |
| `notes` | TEXT | Farmer notes on completion |

---

### `activity_details`
Key-value parameters for each activity (flexible schema for different task types).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `activity_id` | UUID FK → farming_activities | |
| `detail_key` | VARCHAR(100) | `water_liters`, `fertilizer_name`, `dosage`, `method` |
| `detail_value` | TEXT | The value |
| `unit` | VARCHAR(50) | Unit of measurement |
| `notes` | TEXT | |

**Example rows for a watering activity:**
- `water_liters` = `180`, unit = `L`
- `method` = `drip`
- `duration_minutes` = `45`

**Example rows for a fertilizing activity:**
- `fertilizer_name` = `Muriate of Potash`
- `quantity_kg` = `12`, unit = `kg`
- `method` = `broadcast`
- `timing` = `Apply in morning, water after`

---

### `project_issues`
Farmer-reported problems (disease/pest/weather damage/other).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `project_id` | UUID FK → projects | |
| `farmer_id` | UUID FK → farmer_profiles | |
| `issue_type` | VARCHAR(50) | `disease`, `pest`, `weather_damage`, `nutritional`, `other` |
| `title` | VARCHAR(255) | Brief title |
| `description` | TEXT | Detailed description |
| `affected_area_pct` | DECIMAL(5,2) | % of crop affected |
| `affected_parts` | TEXT[] | `['leaves', 'fruit']` |
| `image_urls` | TEXT[] | Uploaded photos |
| `reported_at` | TIMESTAMP | |
| `matched_disease_id` | UUID FK → plant_diseases | Resolved diagnosis |
| `matched_pest_id` | UUID FK → plant_pests | Resolved diagnosis |
| `resolution_status` | VARCHAR(30) | `open`, `diagnosed`, `resolved`, `monitoring` |
| `resolution_notes` | TEXT | What was done |
| `resolved_at` | TIMESTAMP | |

---

## Section 8: Market Price Tables

### `market_prices`
Crop price records (fetched or manually entered).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `plant_id` | UUID FK → plants | |
| `district` | VARCHAR(100) | Market district |
| `market_name` | VARCHAR(255) | "Colombo Pettah", "Dambulla" |
| `price_per_unit` | DECIMAL(10,2) | |
| `unit` | VARCHAR(30) | `kg`, `100kg`, `bushel` |
| `currency` | VARCHAR(10) | Default: LKR |
| `source` | VARCHAR(100) | Data source |
| `recorded_date` | DATE | |

---

### `market_trends`
Weekly computed price trend summaries.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `plant_id` | UUID FK → plants | |
| `district` | VARCHAR(100) | |
| `period_start` | DATE | Week start |
| `period_end` | DATE | Week end |
| `avg_price` | DECIMAL(10,2) | |
| `min_price` | DECIMAL(10,2) | |
| `max_price` | DECIMAL(10,2) | |
| `trend_direction` | VARCHAR(20) | `rising`, `falling`, `stable` |
| `trend_pct` | DECIMAL(6,2) | % change from previous period |
| `computed_at` | TIMESTAMP | |

---

## Section 9: Notifications Table

### `notifications`
In-app and push notification records.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `farmer_id` | UUID FK → farmer_profiles | |
| `project_id` | UUID FK → projects | Optional |
| `activity_id` | UUID FK → farming_activities | Links to specific activity |
| `issue_id` | UUID FK → project_issues | Links to specific issue |
| `alert_id` | UUID FK → weather_alerts | Links to weather alert |
| `notification_type` | VARCHAR(50) | `activity_reminder`, `weather_alert`, `market_alert`, `issue_update`, `ai_insight` |
| `title` | VARCHAR(255) | |
| `message` | TEXT | |
| `deep_link` | TEXT | URL: `/projects/[id]?scroll=activity_plan&highlight=act_123` |
| `is_read` | BOOLEAN | |
| `is_pushed` | BOOLEAN | Sent via push notification |
| `push_token` | TEXT | Device token used |
| `scheduled_for` | TIMESTAMP | When to send |
| `sent_at` | TIMESTAMP | When actually sent |

---

## Section 10: RAG & AI Tables

### `farmer_rag_documents`
Text documents stored in each farmer's personal knowledge base.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `farmer_id` | UUID FK → farmer_profiles | Per-farmer isolation |
| `project_id` | UUID FK → projects | Optional, links doc to project |
| `document_type` | VARCHAR(50) | `soil_report`, `activity_history`, `plant_info`, `market_data`, `farmer_notes` |
| `title` | VARCHAR(255) | |
| `source` | VARCHAR(100) | `system_generated`, `farmer_uploaded`, `external_api` |
| `content` | TEXT | Full text content |
| `metadata_json` | JSONB | `{project_id, date, plant_id, ...}` |
| `char_count` | INTEGER | |
| `is_indexed` | BOOLEAN | Has been embedded |
| `indexed_at` | TIMESTAMP | |

---

### `farmer_rag_chunks`
Vector chunks from RAG documents. Uses pgvector for similarity search.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `document_id` | UUID FK → farmer_rag_documents | |
| `farmer_id` | UUID FK → farmer_profiles | Denormalized for faster filtering |
| `chunk_index` | INTEGER | Chunk position in document |
| `content` | TEXT | Chunk text (500 tokens) |
| `embedding` | `vector(1536)` | OpenAI text-embedding-3-small |
| `token_count` | INTEGER | |
| `metadata_json` | JSONB | Searchable metadata |

**Index:** `CREATE INDEX ON farmer_rag_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);`

---

### `ai_conversations`
Chat sessions between farmer and AI assistant.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `farmer_id` | UUID FK → farmer_profiles | |
| `project_id` | UUID FK → projects | Context project |
| `session_title` | VARCHAR(255) | Auto-generated from first message |
| `messages_json` | JSONB | `[{role, content, timestamp}]` |
| `context_summary` | TEXT | Compressed summary for long sessions |
| `token_count` | INTEGER | Total tokens used |
| `cost_usd` | DECIMAL(10,6) | Total cost |

---

### `ai_query_logs`
Token usage and cost tracking per AI call.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `farmer_id` | UUID FK | |
| `project_id` | UUID FK | |
| `conversation_id` | UUID FK → ai_conversations | |
| `service_type` | VARCHAR(50) | `chat`, `disease_diagnosis`, `plan_generation`, `summary` |
| `query_summary` | TEXT | Brief description of query |
| `input_tokens` | INTEGER | |
| `output_tokens` | INTEGER | |
| `cost_usd` | DECIMAL(10,6) | |
| `model_used` | VARCHAR(100) | claude-sonnet-4-6 |
| `latency_ms` | INTEGER | Response time |

---

## Key Indexes

```sql
-- Account & farmer
CREATE INDEX idx_projects_farmer ON projects(farmer_id);

-- Activity lookup (most frequent query pattern)
CREATE INDEX idx_farming_activities_project ON farming_activities(project_id);
CREATE INDEX idx_farming_activities_date ON farming_activities(scheduled_date);
CREATE INDEX idx_farming_activities_status ON farming_activities(status);
CREATE INDEX idx_farming_activities_project_date_status ON farming_activities(project_id, scheduled_date, status);

-- Notifications
CREATE INDEX idx_notifications_farmer ON notifications(farmer_id, is_read);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for);

-- Market prices
CREATE INDEX idx_market_prices_plant ON market_prices(plant_id, recorded_date DESC);

-- Soil
CREATE INDEX idx_soil_tests_project ON soil_tests(project_id);

-- RAG
CREATE INDEX idx_rag_chunks_farmer ON farmer_rag_chunks(farmer_id);

-- Weather
CREATE INDEX idx_weather_cache_location_date ON weather_cache(location_key, forecast_date);

-- Full text search
CREATE INDEX idx_plants_name_fts ON plants USING gin(to_tsvector('english', common_name || ' ' || COALESCE(scientific_name, '')));
CREATE INDEX idx_diseases_name_fts ON plant_diseases USING gin(to_tsvector('english', disease_name || ' ' || COALESCE(symptoms, '')));
```

---

## Section 11: Marketplace Tables (B2B & B2C)

### `vendor_products`
The Agri-Input Market (Vendors selling to Farmers).

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
| `created_at` | TIMESTAMP | |

---

### `harvest_listings`
The Harvest Market (Farmers selling to Buyers). Links directly to the farming project so buyers know exactly how it was grown!

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `project_id` | UUID FK → projects | Links to RAG-tracked history, weather, soil data |
| `farmer_profile_id` | UUID FK → farmer_profiles | |
| `yield_amount` | DECIMAL(10,2) | Available quantity |
| `unit` | VARCHAR(20) | kg, tons |
| `price_per_kg` | DECIMAL(10,2) | |
| `status` | VARCHAR(50) | `Pre-order`, `Harvested`, `Sold Out` |
| `available_date` | DATE | Expected or actual harvest date |
| `created_at` | TIMESTAMP | |

---

### `orders`
Master order record for transactions (both input and harvest markets).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `buyer_profile_id` | UUID FK → buyer_profiles | Optional (if bought by buyer) |
| `farmer_profile_id` | UUID FK → farmer_profiles | Optional (if farmer bought input) |
| `total_price` | DECIMAL(10,2) | |
| `status` | VARCHAR(50) | `Pending`, `Paid`, `Shipped`, `Delivered`, `Cancelled` |
| `delivery_address` | TEXT | |
| `created_at` | TIMESTAMP | |

---

### `order_items`
Line items for an order.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `order_id` | UUID FK → orders | |
| `vendor_product_id` | UUID FK → vendor_products | Nullable |
| `harvest_listing_id` | UUID FK → harvest_listings | Nullable |
| `quantity` | DECIMAL(10,2) | |
| `unit_price` | DECIMAL(10,2) | |
| `total_price` | DECIMAL(10,2) | |

---

## Data Integrity Rules

| Rule | Implementation |
|------|---------------|
| One farmer profile per account | UNIQUE constraint on `account_id` in `farmer_profiles` |
| One service type per project | UNIQUE `(project_id, service_type)` in `project_services` |
| Stages ordered correctly | UNIQUE `(plant_id, stage_order)` in `plant_stages` |
| Weather cache deduplication | UNIQUE `(location_key, forecast_date)` in `weather_cache` |
| Cascade deletes | Account → profile → projects → activities (all CASCADE) |
| Soft project delete | Set `status = 'archived'`, never hard delete |
