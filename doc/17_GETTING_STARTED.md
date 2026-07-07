# AgriFarm AI — Getting Started (Next Steps)

Follow these steps in order after the service-gating update.

---

## Prerequisites

- **Docker Desktop** — running (PostgreSQL + Redis)
- **Python 3.11+**
- **Node.js 18+** and npm

---

## Step 1 — Database & migrations

### 1.1 Start PostgreSQL and Redis

```powershell
cd "c:\Users\Kajanan\Desktop\Neon Farming"
docker compose up -d
```

Verify:

```powershell
docker compose ps
```

Both `postgres` and `redis` should be **running**.

### 1.2 Create environment file

```powershell
copy env.example .env
```

Edit `.env` if needed. Defaults match `docker-compose.yml`.

Create frontend env:

```powershell
copy frontend\.env.local.example frontend\.env.local
```

### 1.3 Install backend dependencies

**Option A — pip + venv (current repo):**

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Option B — Poetry (optional):**

```powershell
cd backend
poetry install
poetry shell
```

### 1.4 Generate first Alembic migration

From `backend/` with venv active:

```powershell
alembic revision --autogenerate -m "initial_schema"
alembic upgrade head
```

This creates all tables including:
- `account_features` (new)
- `project_services` (updated: `config_json`, `activated_at`)

**If you already have an old database** with a different `project_services` schema:

```powershell
# Dev only — wipes all data
docker compose down -v
docker compose up -d
alembic upgrade head
```

For production, write a manual migration instead of dropping data.

### 1.5 Seed reference data

```powershell
cd backend
python -m seed.run_seed
```

Or from project root:

```powershell
make seed
```

### 1.6 Start the API

```powershell
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Open http://localhost:8000/docs — you should **not** see `/ai/*` routes (deferred to v2.0).

---

## Step 2 — Verify service gating works

### 2.1 Register a test farmer

```powershell
# POST /api/v1/auth/register
# Body: email, password, full_name, farming_method, primary_language, location (optional)
```

Or use Swagger UI at http://localhost:8000/docs.

On register, the backend:
1. Creates `account_features` from `DEFAULT_ACCOUNT_SERVICES` in `.env`
2. Creates first location if provided in register payload

### 2.2 Create a project

```powershell
# POST /api/v1/projects
```

This auto-creates `project_services` rows for each service your account has.

### 2.3 Check enabled services

```powershell
# GET /api/v1/projects/{project_id}/services
# GET /api/v1/projects/{project_id}/dashboard  →  enabled_services: [...]
```

### 2.4 Test rollout (optional)

To enable **only the planner** for new accounts:

```env
DEFAULT_ACCOUNT_SERVICES=activity_plan
```

Restart backend, register a **new** account. Weather/soil endpoints should return **403**.

To grant weather to one account manually (SQL):

```sql
INSERT INTO account_features (id, account_id, service_type, is_enabled, enabled_at, created_at, updated_at)
VALUES (gen_random_uuid(), '<account-uuid>', 'weather', true, NOW(), NOW(), NOW());

INSERT INTO project_services (id, project_id, service_type, is_active, activated_at, created_at, updated_at)
VALUES (gen_random_uuid(), '<project-uuid>', 'weather', true, NOW(), NOW(), NOW());
```

---

## Step 3 — Frontend

### 3.1 Install and run

```powershell
cd frontend
npm install
npm run dev
```

App: http://localhost:3000

`frontend/lib/api.ts` stores JWT in `localStorage` and calls `NEXT_PUBLIC_API_URL`.

### 3.2 Use `enabled_services` on project dashboard

The dashboard API returns:

```json
{
  "enabled_services": ["activity_plan", "weather", "soil", ...],
  "farming_circle": { ... },
  "todays_activities": [ ... ]
}
```

Frontend rules:

| Service in `enabled_services` | Show |
|-------------------------------|------|
| `activity_plan` | Activity block, plan page |
| `weather` | WeatherBlock, AlertBanner |
| `soil` | Soil block + pages |
| `disease_watch` | Disease block + pages |
| `market_price` | Market block + pages |
| `ai_chat` | **Hide in v1.0** (future) |

Example pattern:

```tsx
const { data } = useQuery({
  queryKey: ["dashboard", projectId],
  queryFn: () => api.get(`/projects/${projectId}/dashboard`).then(r => r.data),
});

const enabled = new Set(data?.enabled_services ?? ["activity_plan"]);

{enabled.has("weather") && <WeatherBlock projectId={projectId} />}
{enabled.has("ai_chat") && <AISummaryBlock />}  {/* v2.0 only */}
```

### 3.3 Login flow

1. Register at `/register`
2. Token saved to `localStorage`
3. Create project at `/projects/new`
4. Open `/projects/{id}` — blocks appear based on `enabled_services`

---

## Quick command cheat sheet

| Task | Command |
|------|---------|
| Start DB | `docker compose up -d` |
| Migrate | `cd backend && alembic upgrade head` |
| Seed | `cd backend && python -m seed.run_seed` |
| Backend | `cd backend && uvicorn main:app --reload` |
| Frontend | `cd frontend && npm run dev` |
| Stop DB | `docker compose down` |
| Reset DB (dev) | `docker compose down -v && docker compose up -d` |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Docker pipe error | Start **Docker Desktop**, wait until running |
| `email_validator` missing | `pip install email-validator` |
| Tables don't exist | Run `alembic upgrade head` |
| 403 on weather/soil | Check `DEFAULT_ACCOUNT_SERVICES` and `account_features` table |
| Frontend can't reach API | Check `frontend/.env.local` → `NEXT_PUBLIC_API_URL` |
| `@/lib/api` not found | Ensure `frontend/lib/api.ts` exists (not gitignored) |

---

## What comes later (not v1.0)

- **v2.0:** Mount AI chat routes in `backend/main.py`, grant `ai_chat` in `account_features`
- **v3.0:** AI Agent + MCP — grant `ai_agent` service type

See [`16_SERVICE_GATING.md`](./16_SERVICE_GATING.md) and [`09_IMPLEMENTATION_ROADMAP.md`](./09_IMPLEMENTATION_ROADMAP.md).
