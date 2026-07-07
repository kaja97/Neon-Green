# AgriFarm AI — Service Gating & Incremental Rollout

## Overview

Services (Weather, Soil, Disease, Market, etc.) can be **rolled out one at a time**. Access is controlled at two levels:

1. **Account level** (`account_features`) — which services this user is allowed to use (beta, tier, admin grant)
2. **Project level** (`project_services`) — which services are active for a specific farming project

The **Activity Planner** (`activity_plan`) is the **core service** and is always enabled when a project exists.

**AI Chat** and **AI Agent** are **future services** — not part of v1.0.

---

## Service Types

| `service_type` | Layer | v1.0 Status | Description |
|----------------|-------|-------------|-------------|
| `activity_plan` | Core | **Always ON** | Life-cycle plan, daily tasks |
| `weather` | Optional | Phase 4 | Forecast, alerts, plan adjustments |
| `soil` | Optional | Phase 5 | Soil tests, nutrient recommendations |
| `disease_watch` | Optional | Phase 5 | Issue reporting, disease search |
| `market_price` | Optional | Phase 6 | Crop prices, trends, revenue estimate |
| `notifications` | Optional | Phase 6 | Push / in-app notifications |
| `ai_chat` | Future | v2.0+ | Gemini Q&A with project context |
| `ai_agent` | Future | v3.0+ | Autonomous agent + MCP tools |

---

## How Gating Works

```
Request → JWT auth → Account has service? → Project has service? → Execute
                              ↓ NO                    ↓ NO
                           403 Forbidden           403 Forbidden
```

### Backend implementation

- `backend/core/service_gating.py` — check helpers
- Routers call `require_project_service()` or `require_account_service()` before business logic
- `GET /projects/{id}/services` — list enabled services for a project
- Dashboard returns `enabled_services[]` so the frontend hides unavailable blocks

### Default services for new accounts

Set via environment variable:

```bash
# All v1.0 services except AI (adjust per rollout)
DEFAULT_ACCOUNT_SERVICES=activity_plan,weather,soil,disease_watch,market_price
```

To roll out **only the planner** initially:

```bash
DEFAULT_ACCOUNT_SERVICES=activity_plan
```

Then enable more services per account in `account_features` (admin/SQL) when each phase ships.

---

## Database Tables

### `account_features`

| Column | Type | Notes |
|--------|------|-------|
| `account_id` | UUID FK → accounts | |
| `service_type` | VARCHAR(50) | e.g. `weather`, `soil` |
| `is_enabled` | BOOLEAN | |
| `enabled_at` | TIMESTAMP | |
| **UNIQUE** | | `(account_id, service_type)` |

Seeded automatically on registration from `DEFAULT_ACCOUNT_SERVICES`.

### `project_services`

| Column | Type | Notes |
|--------|------|-------|
| `project_id` | UUID FK → projects | |
| `service_type` | VARCHAR(50) | |
| `config_json` | JSONB | Service-specific settings |
| `is_active` | BOOLEAN | |
| `activated_at` | TIMESTAMP | |
| **UNIQUE** | | `(project_id, service_type)` |

Created automatically on project creation — one row per service the account has access to.

---

## Rollout Playbook

### Phase 4 — Enable Weather

1. Deploy weather module (backend + frontend block)
2. Grant `weather` in `account_features` for beta farmers:
   ```sql
   INSERT INTO account_features (id, account_id, service_type, is_enabled, enabled_at)
   VALUES (gen_random_uuid(), '<account-uuid>', 'weather', true, NOW());
   ```
3. New projects auto-get `project_services.weather` if account has access
4. Existing projects: insert `project_services` row or recreate project

### Phase 5 — Enable Soil + Disease

Same pattern for `soil` and `disease_watch`.

### Future — AI Chat (v2.0)

1. Implement `/ai/*` routes (currently unmounted)
2. Grant `ai_chat` only to selected accounts
3. Never enable `ai_agent` until v3.0 MCP work is complete

---

## Frontend Behavior

| `enabled_services` | UI |
|--------------------|-----|
| Contains `weather` | Show WeatherBlock + weather pages |
| Missing `weather` | Hide block or show "Coming soon" |
| Missing `ai_chat` | Hide AI tab (default in v1.0) |

Query `GET /projects/{id}/dashboard` → use `enabled_services` array.

---

## Architecture Notes

- Backend and frontend are **separate apps** — deploy independently
- **Poetry** (backend) and **npm** (frontend) are separate dependency managers
- **Docker Compose** runs PostgreSQL + Redis locally; apps run natively in dev
- Production: Docker for API + Celery; frontend on Vercel/CDN or same VPS

See also: [`09_IMPLEMENTATION_ROADMAP.md`](./09_IMPLEMENTATION_ROADMAP.md)
