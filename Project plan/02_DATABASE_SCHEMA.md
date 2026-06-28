# AgriFarm AI — Database Schema

## Database: PostgreSQL 16 with pgvector extension

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy text search
```

---

## 1. ACCOUNT & IDENTITY TABLES

```sql
-- Core authentication account
CREATE TABLE accounts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    phone           VARCHAR(20) UNIQUE,
    password_hash   TEXT NOT NULL,
    role            VARCHAR(20) DEFAULT 'farmer',  -- farmer, admin, agronomist
    is_verified     BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    last_login_at   TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Farmer personal details (1-to-1 with accounts)
CREATE TABLE farmer_profiles (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id          UUID UNIQUE NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    full_name           VARCHAR(255) NOT NULL,
    date_of_birth       DATE,
    gender              VARCHAR(20),
    primary_language    VARCHAR(10) DEFAULT 'en',  -- en, si, ta (Sinhala, Tamil)
    experience_years    INTEGER DEFAULT 0,
    education_level     VARCHAR(50),
    avatar_url          TEXT,
    bio                 TEXT,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- Farmer location (can have multiple land locations)
CREATE TABLE farmer_locations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id       UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    label           VARCHAR(100),  -- "Home Farm", "North Field"
    address_line    TEXT,
    city            VARCHAR(100),
    district        VARCHAR(100),
    province        VARCHAR(100),
    country         VARCHAR(100) DEFAULT 'Sri Lanka',
    postal_code     VARCHAR(20),
    latitude        DECIMAL(10, 8),
    longitude       DECIMAL(11, 8),
    timezone        VARCHAR(50) DEFAULT 'Asia/Colombo',
    is_primary      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Farmer land details (total land holdings)
CREATE TABLE farmer_land_details (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id           UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    location_id         UUID REFERENCES farmer_locations(id),
    total_area          DECIMAL(10, 4) NOT NULL,
    area_unit           VARCHAR(20) DEFAULT 'acres',  -- acres, hectares, perches
    land_type           VARCHAR(50),  -- paddy, highland, garden, greenhouse
    soil_type           VARCHAR(50),  -- clay, loam, sandy, silty
    water_source        VARCHAR(50),  -- well, canal, rain-fed, borehole
    irrigation_type     VARCHAR(50),  -- drip, sprinkler, flood, none
    land_ownership      VARCHAR(30),  -- owned, leased, rented
    notes               TEXT,
    created_at          TIMESTAMP DEFAULT NOW()
);

-- Farmer's existing livestock/animals
CREATE TABLE farmer_livestock (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id       UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    animal_type     VARCHAR(100),  -- cattle, poultry, goat, pig, fish
    breed           VARCHAR(100),
    count           INTEGER DEFAULT 0,
    purpose         VARCHAR(50),  -- dairy, meat, eggs, dual
    housing_type    VARCHAR(50),
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);
```

---

## 2. MASTER PLANT DATABASE TABLES

```sql
-- Master plant/crop catalogue
CREATE TABLE plants (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    common_name             VARCHAR(255) NOT NULL,
    local_name              VARCHAR(255),  -- Sinhala/Tamil name
    scientific_name         VARCHAR(255),
    category                VARCHAR(100),  -- vegetable, fruit, grain, spice, leafy
    sub_category            VARCHAR(100),
    growth_duration_days    INTEGER,       -- total days seed to harvest
    planting_season         TEXT[],        -- ['Yala', 'Maha'] or months
    optimal_temp_min        DECIMAL(5,2),  -- Celsius
    optimal_temp_max        DECIMAL(5,2),
    optimal_rainfall_mm     DECIMAL(8,2),
    optimal_ph_min          DECIMAL(4,2),
    optimal_ph_max          DECIMAL(4,2),
    compatible_soil_types   TEXT[],
    incompatible_plants     TEXT[],        -- companion planting negatives
    companion_plants        TEXT[],        -- companion planting positives
    description             TEXT,
    image_url               TEXT,
    is_active               BOOLEAN DEFAULT TRUE,
    created_at              TIMESTAMP DEFAULT NOW()
);

-- Growth stages for each plant
CREATE TABLE plant_stages (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_id            UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    stage_name          VARCHAR(100) NOT NULL,  -- Germination, Seedling, Vegetative, Flowering, Fruiting, Harvest
    stage_order         INTEGER NOT NULL,
    start_day           INTEGER NOT NULL,  -- day from planting start
    end_day             INTEGER NOT NULL,
    description         TEXT,
    key_indicators      TEXT,  -- visual signs farmer should see
    critical_actions    TEXT,  -- must-do actions in this stage
    watch_for           TEXT,  -- threats/risks in this stage
    image_url           TEXT,
    created_at          TIMESTAMP DEFAULT NOW(),
    UNIQUE(plant_id, stage_order)
);

-- Nutrient requirements per plant per stage
CREATE TABLE plant_nutrient_requirements (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_id            UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    stage_id            UUID NOT NULL REFERENCES plant_stages(id) ON DELETE CASCADE,
    nitrogen_kg_per_acre    DECIMAL(8,4),
    phosphorus_kg_per_acre  DECIMAL(8,4),
    potassium_kg_per_acre   DECIMAL(8,4),
    calcium_kg_per_acre     DECIMAL(8,4),
    magnesium_kg_per_acre   DECIMAL(8,4),
    sulfur_kg_per_acre      DECIMAL(8,4),
    zinc_ppm                DECIMAL(8,4),
    boron_ppm               DECIMAL(8,4),
    iron_ppm                DECIMAL(8,4),
    notes                   TEXT,
    created_at              TIMESTAMP DEFAULT NOW()
);

-- Water requirements per plant per stage
CREATE TABLE plant_water_requirements (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_id                UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    stage_id                UUID NOT NULL REFERENCES plant_stages(id) ON DELETE CASCADE,
    water_mm_per_day        DECIMAL(8,4),  -- mm of water per day
    irrigation_frequency_days INTEGER DEFAULT 1,
    drought_tolerance       VARCHAR(20),  -- low, medium, high
    waterlogging_tolerance  VARCHAR(20),
    notes                   TEXT,
    created_at              TIMESTAMP DEFAULT NOW()
);

-- Fertilizer recommendations per plant per stage
CREATE TABLE plant_fertilizer_recommendations (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_id            UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    stage_id            UUID NOT NULL REFERENCES plant_stages(id) ON DELETE CASCADE,
    fertilizer_type     VARCHAR(100),  -- Urea, TSP, MOP, Compost, etc.
    is_organic          BOOLEAN DEFAULT FALSE,
    quantity_per_acre   DECIMAL(10,4),
    unit                VARCHAR(20),   -- kg, L, bags
    application_method  VARCHAR(100),  -- broadcast, band, foliar, drip
    timing_note         TEXT,          -- "Apply at planting", "Split 3 ways"
    created_at          TIMESTAMP DEFAULT NOW()
);
```

---

## 3. DISEASES & PESTS TABLES

```sql
-- Farming method types (organic, inorganic, integrated)
CREATE TABLE farming_methods (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code        VARCHAR(20) UNIQUE NOT NULL,  -- organic, inorganic, integrated
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Plant diseases master table
CREATE TABLE plant_diseases (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_id            UUID REFERENCES plants(id),  -- NULL = affects many plants
    disease_name        VARCHAR(255) NOT NULL,
    local_name          VARCHAR(255),
    pathogen_type       VARCHAR(50),  -- fungal, bacterial, viral, nutritional, physiological
    symptoms            TEXT NOT NULL,
    visual_symptoms     TEXT,         -- what farmer sees
    affected_parts      TEXT[],       -- ['leaves', 'stem', 'roots', 'fruit']
    spread_conditions   TEXT,         -- weather/conditions that promote spread
    spread_method       VARCHAR(100), -- water, wind, insects, soil
    severity            VARCHAR(20),  -- low, medium, high, critical
    incubation_period   VARCHAR(100),
    image_urls          TEXT[],
    created_at          TIMESTAMP DEFAULT NOW()
);

-- Plant pests master table
CREATE TABLE plant_pests (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_id            UUID REFERENCES plants(id),  -- NULL = affects many plants
    pest_name           VARCHAR(255) NOT NULL,
    local_name          VARCHAR(255),
    pest_type           VARCHAR(50),   -- insect, mite, nematode, rodent, bird
    pest_category       VARCHAR(50),   -- sucking, chewing, boring, soil
    symptoms            TEXT NOT NULL,
    visual_symptoms     TEXT,
    affected_parts      TEXT[],
    infestation_conditions TEXT,
    damage_threshold    TEXT,          -- economic threshold info
    life_cycle          TEXT,
    severity            VARCHAR(20),
    image_urls          TEXT[],
    created_at          TIMESTAMP DEFAULT NOW()
);

-- Solutions for diseases (mapped to farming method)
CREATE TABLE disease_solutions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disease_id          UUID NOT NULL REFERENCES plant_diseases(id) ON DELETE CASCADE,
    method_id           UUID NOT NULL REFERENCES farming_methods(id),
    solution_name       VARCHAR(255) NOT NULL,
    product_name        VARCHAR(255),  -- brand or chemical name
    active_ingredient   VARCHAR(255),
    description         TEXT NOT NULL,
    dosage              TEXT,
    dilution_ratio      TEXT,
    application_method  TEXT,
    frequency           TEXT,
    timing              TEXT,          -- "Apply in early morning"
    waiting_period_days INTEGER,       -- days before harvest after application
    precautions         TEXT,
    estimated_cost      DECIMAL(10,2),
    effectiveness       INTEGER,       -- 1-10 rating
    created_at          TIMESTAMP DEFAULT NOW()
);

-- Solutions for pests (mapped to farming method)
CREATE TABLE pest_solutions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pest_id             UUID NOT NULL REFERENCES plant_pests(id) ON DELETE CASCADE,
    method_id           UUID NOT NULL REFERENCES farming_methods(id),
    solution_name       VARCHAR(255) NOT NULL,
    product_name        VARCHAR(255),
    active_ingredient   VARCHAR(255),
    description         TEXT NOT NULL,
    dosage              TEXT,
    dilution_ratio      TEXT,
    application_method  TEXT,
    frequency           TEXT,
    timing              TEXT,
    waiting_period_days INTEGER,
    precautions         TEXT,
    estimated_cost      DECIMAL(10,2),
    effectiveness       INTEGER,
    created_at          TIMESTAMP DEFAULT NOW()
);
```

---

## 4. PROJECT TABLES

```sql
-- A farming project (e.g., "Tomato Farm - 1 Acre - March 2025")
CREATE TABLE projects (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id           UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    plant_id            UUID NOT NULL REFERENCES plants(id),
    location_id         UUID REFERENCES farmer_locations(id),
    land_detail_id      UUID REFERENCES farmer_land_details(id),
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    farming_method_id   UUID NOT NULL REFERENCES farming_methods(id),
    area                DECIMAL(10, 4) NOT NULL,
    area_unit           VARCHAR(20) DEFAULT 'acres',
    plant_count         INTEGER,       -- number of plants (if known)
    planting_date       DATE NOT NULL,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    status              VARCHAR(30) DEFAULT 'planning',  -- planning, active, harvested, failed, paused
    notes               TEXT,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- Services enabled for a project (modular add-ons)
CREATE TABLE project_services (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    service_type    VARCHAR(50) NOT NULL,  -- weather, soil, activity_plan, disease_watch, market_price, ai_chat
    config_json     JSONB DEFAULT '{}',    -- service-specific settings
    is_active       BOOLEAN DEFAULT TRUE,
    activated_at    TIMESTAMP DEFAULT NOW(),
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(project_id, service_type)
);
```

---

## 5. SOIL ANALYSIS TABLES

```sql
-- Soil test records for a project
CREATE TABLE soil_tests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    farmer_id       UUID NOT NULL REFERENCES farmer_profiles(id),
    test_date       DATE NOT NULL,
    lab_name        VARCHAR(255),
    report_ref      VARCHAR(100),  -- lab reference number
    report_url      TEXT,          -- uploaded scan/PDF in S3
    input_method    VARCHAR(30) DEFAULT 'manual',  -- manual, upload, api
    status          VARCHAR(20) DEFAULT 'pending',  -- pending, processed, applied
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Soil nutrient results from test
CREATE TABLE soil_nutrient_results (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    soil_test_id    UUID NOT NULL REFERENCES soil_tests(id) ON DELETE CASCADE,
    ph              DECIMAL(4,2),
    nitrogen_ppm    DECIMAL(10,4),
    phosphorus_ppm  DECIMAL(10,4),
    potassium_ppm   DECIMAL(10,4),
    calcium_ppm     DECIMAL(10,4),
    magnesium_ppm   DECIMAL(10,4),
    sulfur_ppm      DECIMAL(10,4),
    zinc_ppm        DECIMAL(10,4),
    boron_ppm       DECIMAL(10,4),
    iron_ppm        DECIMAL(10,4),
    manganese_ppm   DECIMAL(10,4),
    copper_ppm      DECIMAL(10,4),
    organic_matter_pct DECIMAL(5,2),
    ec_ds_per_m     DECIMAL(8,4),  -- electrical conductivity
    cec             DECIMAL(8,4),  -- cation exchange capacity
    sand_pct        DECIMAL(5,2),
    silt_pct        DECIMAL(5,2),
    clay_pct        DECIMAL(5,2),
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Computed recommendations from soil test (deterministic calculation)
CREATE TABLE soil_recommendations (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    soil_test_id            UUID NOT NULL REFERENCES soil_tests(id) ON DELETE CASCADE,
    project_id              UUID NOT NULL REFERENCES projects(id),
    recommendation_type     VARCHAR(50),  -- fertilizer, amendment, pH_correction, irrigation
    nutrient_affected       VARCHAR(50),
    current_level           DECIMAL(10,4),
    optimal_level           DECIMAL(10,4),
    deficiency_severity     VARCHAR(20),  -- none, mild, moderate, severe
    action_required         TEXT NOT NULL,
    product_name            VARCHAR(255),
    quantity_per_acre       DECIMAL(10,4),
    unit                    VARCHAR(20),
    timing                  TEXT,
    priority                INTEGER DEFAULT 1,  -- 1=urgent, 2=normal, 3=optional
    is_for_organic          BOOLEAN,
    created_at              TIMESTAMP DEFAULT NOW()
);
```

---

## 6. WEATHER TABLES

```sql
-- Weather cache by location (avoid repeated API calls)
CREATE TABLE weather_cache (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    latitude        DECIMAL(10, 8) NOT NULL,
    longitude       DECIMAL(11, 8) NOT NULL,
    location_key    VARCHAR(50) GENERATED ALWAYS AS (
                        ROUND(latitude::NUMERIC, 3)::TEXT || ',' || ROUND(longitude::NUMERIC, 3)::TEXT
                    ) STORED,
    forecast_date   DATE NOT NULL,
    weather_json    JSONB NOT NULL,  -- full 5-day forecast from API
    fetched_at      TIMESTAMP DEFAULT NOW(),
    expires_at      TIMESTAMP,
    UNIQUE(location_key, forecast_date)
);

-- Weather-based alerts for projects
CREATE TABLE weather_alerts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    alert_type      VARCHAR(50),  -- rain_expected, drought, frost, storm, high_humidity
    severity        VARCHAR(20),  -- info, warning, critical
    title           VARCHAR(255),
    description     TEXT,
    start_time      TIMESTAMP,
    end_time        TIMESTAMP,
    action_required TEXT,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT NOW()
);
```

---

## 7. ACTIVITY PLANNING TABLES

```sql
-- Master activity plan for a project (generated by planner service)
CREATE TABLE activity_plans (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    plan_type       VARCHAR(50),  -- full_season, weekly, weather_adjusted
    generated_at    TIMESTAMP DEFAULT NOW(),
    valid_from      DATE,
    valid_to        DATE,
    plan_metadata   JSONB,  -- generation params, version
    is_active       BOOLEAN DEFAULT TRUE
);

-- Individual farming activities (tasks)
CREATE TABLE farming_activities (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id          UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    plan_id             UUID REFERENCES activity_plans(id),
    stage_id            UUID REFERENCES plant_stages(id),
    activity_type       VARCHAR(50) NOT NULL,  -- watering, fertilizing, pruning, spraying, harvesting, monitoring
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    scheduled_date      DATE NOT NULL,
    scheduled_time      TIME,
    priority            INTEGER DEFAULT 2,  -- 1=critical, 2=normal, 3=optional
    status              VARCHAR(30) DEFAULT 'pending',  -- pending, done, skipped, rescheduled
    is_weather_adjusted BOOLEAN DEFAULT FALSE,
    completed_at        TIMESTAMP,
    skipped_reason      TEXT,
    notes               TEXT,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- Detailed parameters for each activity
CREATE TABLE activity_details (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id     UUID NOT NULL REFERENCES farming_activities(id) ON DELETE CASCADE,
    detail_key      VARCHAR(100) NOT NULL,  -- 'water_liters', 'fertilizer_name', 'dosage', 'method'
    detail_value    TEXT NOT NULL,
    unit            VARCHAR(50),
    notes           TEXT
);

-- Farmer-reported problems (disease/pest/other issues)
CREATE TABLE project_issues (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id          UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    farmer_id           UUID NOT NULL REFERENCES farmer_profiles(id),
    issue_type          VARCHAR(50),  -- disease, pest, weather_damage, nutritional, other
    title               VARCHAR(255),
    description         TEXT NOT NULL,
    affected_area_pct   DECIMAL(5,2),  -- percentage of crop affected
    affected_parts      TEXT[],
    image_urls          TEXT[],
    reported_at         TIMESTAMP DEFAULT NOW(),
    -- Resolved mapping
    matched_disease_id  UUID REFERENCES plant_diseases(id),
    matched_pest_id     UUID REFERENCES plant_pests(id),
    resolution_status   VARCHAR(30) DEFAULT 'open',  -- open, diagnosed, resolved, monitoring
    resolution_notes    TEXT,
    resolved_at         TIMESTAMP
);
```

---

## 8. MARKET PRICE TABLES

```sql
-- Market price records for crops
CREATE TABLE market_prices (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_id        UUID NOT NULL REFERENCES plants(id),
    district        VARCHAR(100),
    market_name     VARCHAR(255),
    price_per_unit  DECIMAL(10,2) NOT NULL,
    unit            VARCHAR(30),  -- kg, 100kg, bushel
    currency        VARCHAR(10) DEFAULT 'LKR',
    source          VARCHAR(100),
    recorded_date   DATE NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Price trend analysis (computed weekly)
CREATE TABLE market_trends (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_id        UUID NOT NULL REFERENCES plants(id),
    district        VARCHAR(100),
    period_start    DATE,
    period_end      DATE,
    avg_price       DECIMAL(10,2),
    min_price       DECIMAL(10,2),
    max_price       DECIMAL(10,2),
    trend_direction VARCHAR(20),  -- rising, falling, stable
    trend_pct       DECIMAL(6,2), -- % change from previous period
    computed_at     TIMESTAMP DEFAULT NOW()
);
```

---

## 9. NOTIFICATIONS TABLE

```sql
CREATE TABLE notifications (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id           UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    project_id          UUID REFERENCES projects(id) ON DELETE CASCADE,
    activity_id         UUID REFERENCES farming_activities(id) ON DELETE SET NULL,
    issue_id            UUID REFERENCES project_issues(id) ON DELETE SET NULL,
    alert_id            UUID REFERENCES weather_alerts(id) ON DELETE SET NULL,
    notification_type   VARCHAR(50),  -- activity_reminder, weather_alert, market_alert, issue_update, ai_insight
    title               VARCHAR(255) NOT NULL,
    message             TEXT NOT NULL,
    deep_link           TEXT,       -- URL path to scroll to correct service block
    is_read             BOOLEAN DEFAULT FALSE,
    is_pushed           BOOLEAN DEFAULT FALSE,  -- sent via push notification
    push_token          TEXT,       -- device push token used
    scheduled_for       TIMESTAMP,
    sent_at             TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW()
);
```

---

## 10. RAG & AI TABLES

```sql
-- Documents stored in farmer's RAG knowledge base
CREATE TABLE farmer_rag_documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id       UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    project_id      UUID REFERENCES projects(id) ON DELETE CASCADE,
    document_type   VARCHAR(50),  -- soil_report, activity_history, plant_info, market_data, farmer_notes
    title           VARCHAR(255),
    source          VARCHAR(100),  -- system_generated, farmer_uploaded, external_api
    content         TEXT NOT NULL,
    metadata_json   JSONB,  -- project_id, date, plant_id, etc.
    char_count      INTEGER,
    is_indexed      BOOLEAN DEFAULT FALSE,
    indexed_at      TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Vector chunks from RAG documents (pgvector)
CREATE TABLE farmer_rag_chunks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id     UUID NOT NULL REFERENCES farmer_rag_documents(id) ON DELETE CASCADE,
    farmer_id       UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    chunk_index     INTEGER NOT NULL,
    content         TEXT NOT NULL,
    embedding       vector(1536),   -- dimension matches embedding model
    token_count     INTEGER,
    metadata_json   JSONB,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Create vector similarity search index
CREATE INDEX ON farmer_rag_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- AI conversation sessions
CREATE TABLE ai_conversations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id       UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    project_id      UUID REFERENCES projects(id) ON DELETE CASCADE,
    session_title   VARCHAR(255),
    messages_json   JSONB NOT NULL DEFAULT '[]',  -- [{role, content, timestamp}]
    context_summary TEXT,  -- compressed summary for long conversations
    token_count     INTEGER DEFAULT 0,
    cost_usd        DECIMAL(10,6) DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- AI query audit log (for cost tracking)
CREATE TABLE ai_query_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id       UUID NOT NULL REFERENCES farmer_profiles(id),
    project_id      UUID REFERENCES projects(id),
    conversation_id UUID REFERENCES ai_conversations(id),
    service_type    VARCHAR(50),  -- chat, disease_diagnosis, plan_generation, summary
    query_summary   TEXT,
    input_tokens    INTEGER,
    output_tokens   INTEGER,
    cost_usd        DECIMAL(10,6),
    model_used      VARCHAR(100),
    latency_ms      INTEGER,
    created_at      TIMESTAMP DEFAULT NOW()
);
```

---

## Entity Relationship Summary

```
accounts (1) ──────── (1) farmer_profiles
                             │
              ┌──────────────┼──────────────┐
              │              │              │
    farmer_locations  farmer_land_details  farmer_livestock
              │
              │
           projects (many per farmer)
              │
    ┌─────────┼──────────────────────┐
    │         │                      │
project_   farming_            project_issues
services   activities               │
              │                ┌────┴─────┐
           activity_       plant_diseases  plant_pests
           details             │              │
                        disease_solutions  pest_solutions
                                │              │
                          farming_methods (shared)

plants (1) ──── (many) plant_stages
                            │
               ┌────────────┼───────────────┐
       plant_nutrient_  plant_water_   plant_fertilizer_
       requirements     requirements   recommendations

soil_tests ──── soil_nutrient_results ──── soil_recommendations

farmer_rag_documents ──── farmer_rag_chunks (vector)
ai_conversations ──── ai_query_logs

market_prices ──── market_trends
weather_cache ──── weather_alerts ──── notifications
```

---

## Key Indexes

```sql
-- Performance indexes
CREATE INDEX idx_projects_farmer ON projects(farmer_id);
CREATE INDEX idx_farming_activities_project ON farming_activities(project_id);
CREATE INDEX idx_farming_activities_date ON farming_activities(scheduled_date);
CREATE INDEX idx_farming_activities_status ON farming_activities(status);
CREATE INDEX idx_notifications_farmer ON notifications(farmer_id, is_read);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for);
CREATE INDEX idx_market_prices_plant ON market_prices(plant_id, recorded_date DESC);
CREATE INDEX idx_soil_tests_project ON soil_tests(project_id);
CREATE INDEX idx_rag_chunks_farmer ON farmer_rag_chunks(farmer_id);
CREATE INDEX idx_weather_cache_location_date ON weather_cache(location_key, forecast_date);

-- Full text search on plants
CREATE INDEX idx_plants_name_fts ON plants USING gin(to_tsvector('english', common_name || ' ' || COALESCE(scientific_name, '')));
CREATE INDEX idx_diseases_name_fts ON plant_diseases USING gin(to_tsvector('english', disease_name || ' ' || COALESCE(symptoms, '')));
```
