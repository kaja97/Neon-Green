# Project Guidelines & Architecture Notes

## Deployment Infrastructure & Architecture Map

When diagnosing errors, failure logs, CORS issues, environment variable mismatches, or system issues, always keep the following deployment target mapping in mind:

| Component | Technology / Framework | Deployed On | Key Responsibilities & Notes |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js | **Vercel** | UI / Client application, SSR/SSG, client-side routing, static assets. |
| **Backend** | FastAPI / Python | **Render** | Core REST API, business logic, authentication, service coordination. |
| **Database** | PostgreSQL / Auth | **Supabase** | Persistent storage, database migrations, Supabase auth/storage. |
| **Async / Tasks** | Celery / Background Workers | **Redis** (Broker/Backend) | Asynchronous task queues, background processing, caching, pub/sub. |

---

## Troubleshooting Guide for AI

When the user asks about an error or failure:
1. **Frontend / Vercel Issues**:
   - Check build logs, client-side console errors, `NEXT_PUBLIC_` env vars, Vercel routing (`vercel.json`), or CORS issues calling the backend.
2. **Backend / Render Issues**:
   - Check FastAPI startup logs, service URLs, Render port bindings (`PORT` env var), request timeouts, and backend environment secrets.
3. **Database / Supabase Issues**:
   - Check connection strings, Supabase API keys (anon vs service_role), Row Level Security (RLS) policies, schema migrations, and connection pool limits.
4. **Celery / Redis / Background Worker Issues**:
   - Check Redis broker connection URLs (`REDIS_URL`), task serialization, worker concurrency/OOM crashes, celery task timeouts, and queue names.
