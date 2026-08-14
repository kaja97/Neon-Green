# Project Guidelines & Architecture Notes

## Deployment Infrastructure & Architecture Map

When diagnosing errors, failure logs, CORS issues, environment variable mismatches, or system issues, always keep the following deployment target mapping in mind:

| Component | Technology / Framework | Deployed On | Key Responsibilities & Notes |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js (App Router, TailwindCSS, TanStack Query) | **Vercel** | UI / Client application, SSR/SSG, client-side routing, static assets. |
| **Backend** | FastAPI / Python (SQLAlchemy asyncpg, Pydantic v2) | **Render** | Core REST API, business logic, authentication, service coordination. |
| **Database** | PostgreSQL 16 / Auth / Storage | **Supabase** | Persistent storage, database migrations, Supabase connection pooler. |
| **Async / Tasks** | Celery / Background Workers | **Redis** (Broker/Backend) | Asynchronous task queues, background processing, caching, pub/sub. |

---

## Core Domain Rules & Architectural Guidelines

### 1. Plant & Agronomic Reference Data (70 Crops Library)
- The application includes a standardized 70-crop agronomic dataset spanning Vegetables, Fruits, Grains/Cereals, Spices/Herbs, Legumes/Pulses, Plantations, and Cash Crops.
- Each crop has:
  - **Varieties (`plant_varieties`)**: Biological metadata (duration, seasons, optimal pH/temp/rain, yields, soil types, companion/incompatible plants).
  - **Stages (`plant_stages`)**: 6 continuous growth stages with unbroken day continuities (`0` to `end_day`).
  - **Water Requirements (`plant_water_requirements`)**: Daily mm and frequency per stage.
  - **Nutrient Requirements (`plant_nutrient_requirements`)**: N-P-K-Ca-Mg kg specs per stage.
  - **Fertilizer Recommendations (`plant_fertilizer_recommendations`)**: Organic, Conventional, and Integrated prescriptions.
  - **Pruning Guides (`plant_pruning_guides`)**: Step-by-step methods, tools, pre/post care, and importance levels for crops requiring canopy management.
  - **Diseases & Solutions (`plant_diseases` / `disease_solutions`)**: Symptoms, severity, and curative/preventive treatments across farming methods.

### 2. Activity Planning Engine & Execution Details
- **ActivityPlan Uniqueness**: `activity_plans.project_id` has a strict UNIQUE constraint. Re-generating a plan must update the existing `ActivityPlan` version and refresh its activities rather than inserting a duplicate record.
- **Activity Types**: Standardized set includes `irrigation` (watering), `fertilizer`, `pruning`, `pest_control`, `disease_check`, `weeding`, `soil_preparation`, `monitoring`, `harvesting`, `other`.
- **ActivityDetail 1-to-1 Association**: Every `FarmingActivity` has a linked `ActivityDetail` containing:
  - Water liters and application instructions.
  - Fertilizer product name, required kg, and placement instructions.
  - Pruning type (`pinching`, `desuckering`, `topping`, `thinning`, `leaf_removal`), importance level, tools needed, and comprehensive step-by-step paragraphs.
  - Pest control target disease/pest, treatment name, dosage, and pre-harvest safety intervals.
- **Planner Reliability Fallback**: Project creation in `backend/modules/project/service.py` must always use the synchronous plan generator fallback (`sync_planner.py`) if background Celery worker dispatch fails.

### 3. Database & Connection Guidelines
- **Supabase Credentials**: Passwords containing special characters (`@`, `#`) must be URL-encoded (e.g., `@` $\to$ `%40`, `#` $\to$ `%23`) in the connection string (`aws-0-ap-southeast-1.pooler.supabase.com:5432`).
- **Cascade Deletions**: Deleting a project cascades to its activity plan, farming activities, and activity details.

---

## Troubleshooting Guide for AI

When the user asks about an error or failure:
1. **Frontend / Vercel Issues**:
   - Check build logs, client-side console errors, `NEXT_PUBLIC_` env vars, Vercel routing (`vercel.json`), or CORS issues calling the backend.
2. **Backend / Render Issues**:
   - Check FastAPI startup logs, service URLs, Render port bindings (`PORT` env var), request timeouts, and backend environment secrets.
3. **Database / Supabase Issues**:
   - Check connection strings, URL encoding of credentials, RLS policies, schema migrations, and connection pool limits.
4. **Celery / Redis / Background Worker Issues**:
   - Check Redis broker connection URLs (`REDIS_URL`), task serialization, worker concurrency/OOM crashes, celery task timeouts, and sync fallbacks.
