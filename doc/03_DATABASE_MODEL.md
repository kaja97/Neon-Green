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
ai_project_summaries (cached Gemini AI summaries per project)
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
| `location_polygon` | GEOMETRY(Polygon, 4326) | PostGIS GeoJSON mapping coordinates |
| `centroid` | GEOMETRY(Point, 4326) | Focal point for localized weather fetching |
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

### `farming_methods` [NOT IMPLEMENTED AS A DB TABLE]
Note: Farming methods are defined statically as a service list in the backend code. The `projects.farming_method` column is a simple `VARCHAR(50)` string storing `"organic"`, `"inorganic"`, or `"integrated"`.

| Field | Type | Notes |
|-------|------|-------|
| `id` | VARCHAR(20) | `organic` / `inorganic` / `integrated` |
| `name` | VARCHAR(100) | Display name |
| `description` | TEXT | Brief explanation |

---

### `plant_diseases`
Master disease catalogue. Linked to a plant.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `plant_id` | UUID FK → plants | CASCADE DELETE |
| `name` | VARCHAR(255) | "Early Blight", "Late Blight" |
| `scientific_name` | VARCHAR(255) | Optional |
| `description` | TEXT | Detailed description |
| `symptoms` | VARCHAR[] | Array of symptom keywords |
| `conditions` | VARCHAR[] | Array of weather conditions, e.g. `['high humidity', 'temp > 30C']` |
| `severity` | VARCHAR(50) | `low`, `medium`, `high`, `critical` |
| `image_url` | TEXT | S3/MinIO visual reference image |

---

### `plant_pests` [NOT SEEDED IN v1.0]
Master pest catalogue.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `plant_id` | UUID FK → plants | CASCADE DELETE |
| `name` | VARCHAR(255) | "Aphids", "Whitefly" |
| `scientific_name` | VARCHAR(255) | Optional |
| `description` | TEXT | Detailed description |
| `signs` | VARCHAR[] | Array of signs keywords |
| `affected_parts` | VARCHAR[] | Array of affected parts |
| `image_url` | TEXT | S3/MinIO visual reference image | |

---

### `disease_solutions`
Treatment solutions per disease, filtered by farming method.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `disease_id` | UUID FK → plant_diseases | CASCADE DELETE |
| `farming_method` | VARCHAR(50) | `organic` or `conventional` |
| `solution_type` | VARCHAR(50) | `preventive` or `curative` |
| `treatment_name` | VARCHAR(255) | Name of treatment |
| `dosage` | VARCHAR(255) | e.g., "2g per liter" |
| `instructions` | TEXT | Application instructions |

---

### `pest_solutions` [NOT SEEDED IN v1.0]
Treatment solutions per pest, filtered by farming method.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `pest_id` | UUID FK → plant_pests | CASCADE DELETE |
| `farming_method` | VARCHAR(50) | `organic` or `conventional` |
| `treatment_name` | VARCHAR(255) | |
| `dosage` | VARCHAR(255) | |
| `instructions` | TEXT | |

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
| `area` | DECIMAL(10,2) | Area being farmed |
| `area_unit` | VARCHAR(20) | `acres`, `hectares` |
| `farming_method` | VARCHAR(50) | `organic` / `inorganic` / `integrated` |
| `planting_date` | DATE | When planting started |
| `status` | VARCHAR(50) | `active`, `harvested`, `failed`, etc. |
| `current_stage_id` | UUID FK → plant_stages | Current growth stage |
| `plan_generation_status` | VARCHAR(50) | `pending`, `generating`, `completed`, `failed` |
| `expected_harvest_date` | DATE | Auto-calculated |
| `expected_yield_kg` | DECIMAL(10,2) | Yield estimate |
| `expected_revenue` | DECIMAL(12,2) | Revenue estimate |
| `actual_yield_kg` | DECIMAL(10,2) | Actual yield at harvest |
| `actual_revenue` | DECIMAL(12,2) | Actual revenue |
| `actual_harvest_date` | DATE | Date harvested |
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
| `soil_test_id` | UUID FK → soil_tests | CASCADE DELETE |
| `ph_level` | DECIMAL(3,1) | Soil pH |
| `nitrogen_level` | VARCHAR(20) | `Low`, `Medium`, `High` |
| `phosphorus_level` | VARCHAR(20) | `Low`, `Medium`, `High` |
| `potassium_level` | VARCHAR(20) | `Low`, `Medium`, `High` |
| `organic_matter_perc` | DECIMAL(5,2) | Organic matter percentage |
| `moisture_level` | VARCHAR(20) | Moisture level indicator |

---

### `soil_recommendations`
Computed recommendations generated from soil test analysis (deterministic calculation).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `soil_test_id` | UUID FK → soil_tests | CASCADE DELETE |
| `recommendation_type` | VARCHAR(50) | `fertilizer`, `amendment`, `practice` |
| `description` | TEXT | Recommendation details |
| `is_applied` | BOOLEAN | Has recommendation been applied |
| `applied_at` | TIMESTAMP | When applied |

---

## Section 6: Weather Tables

### `weather_cache`
Caches weather API responses to avoid repeated API calls.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `location_id` | UUID FK → farmer_locations | CASCADE DELETE |
| `forecast_date` | DATE | Date the forecast is for |
| `data` | JSONB | Full API response |
| `expires_at` | TIMESTAMP | Cache expiry (3 hours) |

---

### `weather_alerts`
Alerts generated from weather analysis for a project.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `project_id` | UUID FK → projects | CASCADE DELETE |
| `alert_type` | VARCHAR(50) | `heavy_rain`, `drought`, `extreme_heat`, etc. |
| `severity` | VARCHAR(20) | `low`, `medium`, `high` |
| `message` | TEXT | Alert message details |
| `target_date` | DATE | Target date for the alert |
| `is_resolved` | BOOLEAN | Resolved status |

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
| `plan_id` | UUID FK → activity_plans | CASCADE DELETE |
| `activity_type` | VARCHAR(50) | `irrigation`, `fertilizer`, `monitoring`, etc. |
| `title` | VARCHAR(255) | "Water plants — 180L" |
| `description` | TEXT | Detailed instructions |
| `planned_date` | DATE | Planned date for activity |
| `due_date` | DATE | Due date for activity |
| `status` | VARCHAR(50) | `pending`, `done`, `skipped`, etc. |
| `completed_at` | TIMESTAMP | Completion timestamp |
| `is_ai_recommended` | BOOLEAN | Generated or recommended |
| `ai_reasoning` | TEXT | Notes/reasoning |

---

### `activity_details`
Details for individual activities.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `activity_id` | UUID FK → farming_activities | CASCADE DELETE, UNIQUE |
| `required_water_liters` | DECIMAL(8,2) | |
| `required_fertilizer_kg` | DECIMAL(8,2) | |
| `fertilizer_name` | VARCHAR(255) | |
| `actual_water_liters` | DECIMAL(8,2) | |
| `actual_fertilizer_kg` | DECIMAL(8,2) | |
| `notes` | TEXT | |
| `attachments` | VARCHAR[] | Array of attachment S3 URLs |

---

### `project_issues`
Farmer-reported problems (disease/pest/nutrient deficiency/other).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `project_id` | UUID FK → projects | CASCADE DELETE |
| `issue_type` | VARCHAR(50) | `disease`, `pest`, `nutrient_deficiency`, `other` |
| `title` | VARCHAR(255) | Brief title |
| `description` | TEXT | Detailed description |
| `severity` | VARCHAR(20) | `low`, `medium`, `high`, `critical` |
| `reported_date` | DATE | Date reported |
| `status` | VARCHAR(20) | `open`, `in_progress`, `resolved` |
| `resolved_date` | DATE | Date resolved |
| `identified_disease_id` | UUID FK → plant_diseases | Optional |
| `identified_pest_id` | UUID FK → plant_pests | Optional |
| `images` | VARCHAR[] | Array of uploaded photo URLs |
| `ai_diagnosis` | TEXT | Stored raw diagnosis response |

---

## Section 8: Market Price Tables

### `market_prices`
Crop price records (fetched or manually entered).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `plant_id` | UUID FK → plants | CASCADE DELETE |
| `region` | VARCHAR(100) | Market region/district |
| `date` | DATE | Date recorded |
| `price_per_kg` | DECIMAL(10,2) | |
| `currency` | VARCHAR(10) | Default: LKR |
| `source` | VARCHAR(100) | Data source |

---

### `market_trends`
Weekly computed price trend summaries.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `plant_id` | UUID FK → plants | CASCADE DELETE |
| `region` | VARCHAR(100) | |
| `trend_direction` | VARCHAR(20) | `up`, `down`, `stable` |
| `percentage_change` | DECIMAL(5,2) | Percentage change |
| `analysis` | VARCHAR(255) | Brief summary analysis text |

---

## Section 9: Notifications Table

### `notifications`
In-app and push notification records.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `farmer_id` | UUID FK → farmer_profiles | CASCADE DELETE |
| `project_id` | UUID FK → projects | CASCADE DELETE |
| `type` | VARCHAR(50) | `activity_reminder`, `weather_alert`, `market_alert`, `issue_update`, `ai_insight` |
| `title` | VARCHAR(255) | |
| `message` | TEXT | |
| `icon` | VARCHAR(50) | |
| `deep_link` | VARCHAR(500) | |
| `target_block` | VARCHAR(50) | |
| `target_entity_id` | UUID | |
| `is_read` | BOOLEAN | |
| `is_pushed` | BOOLEAN | |
| `scheduled_for` | TIMESTAMP | |

---

## Section 10: RAG & AI Tables

### `farmer_rag_documents` [NOT IMPLEMENTED YET] [NOT IMPLEMENTED YET]
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

### `farmer_rag_chunks` [NOT IMPLEMENTED YET] [NOT IMPLEMENTED YET]
Vector chunks from RAG documents. Uses pgvector for similarity search.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `document_id` | UUID FK → farmer_rag_documents | |
| `farmer_id` | UUID FK → farmer_profiles | Denormalized for faster filtering |
| `chunk_index` | INTEGER | Chunk position in document |
| `content` | TEXT | Chunk text (500 tokens) |
| `embedding` | `vector(768)` | Gemini Embedding API (free tier) — future |
| `token_count` | INTEGER | |
| `metadata_json` | JSONB | Searchable metadata |

**Index:** `CREATE INDEX ON farmer_rag_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);`

---

### `ai_conversations`
Chat sessions between farmer and AI assistant.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `project_id` | UUID FK → projects | CASCADE DELETE |
| `session_title` | VARCHAR(255) | Auto-generated from first message |
| `is_active` | BOOLEAN | Session status |

---

### `ai_query_logs`
Chat messages history mapping.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `conversation_id` | UUID FK → ai_conversations | CASCADE DELETE |
| `role` | VARCHAR(50) | `user` or `model` |
| `content` | TEXT | Content of message |
| `tokens_used` | INTEGER | Tokens consumed |

---

### `ai_project_summaries`
Cached AI-generated summaries for each project.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `project_id` | UUID FK → projects | CASCADE DELETE, UNIQUE |
| `summary_json` | JSONB | Flattened project state |
| `last_updated_at` | TIMESTAMP | Timestamp of summary creation |
| `hash_signature` | VARCHAR(64) | Hash signature for context deduplication |

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

### `orders` [NOT IMPLEMENTED YET] [NOT IMPLEMENTED YET]
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

### `order_items` [NOT IMPLEMENTED YET] [NOT IMPLEMENTED YET]
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
