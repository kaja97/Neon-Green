# Deployment & Infrastructure Documentation

This document outlines where each component of the application is hosted and deployed, along with platform-specific debugging tips.

---

## Infrastructure Overview

| Layer | Service / Stack | Hosting Platform | Notes |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js | **Vercel** | Static hosting & serverless SSR/API routes |
| **Backend** | FastAPI (Python) | **Render** | Main REST API service |
| **Database** | PostgreSQL | **Supabase** | Managed PostgreSQL database & Supabase services |
| **Background Tasks** | Celery Workers | **Redis** (Broker) / Render/Docker | Async task processing & message brokering |

---

## Troubleshooting Guide by Platform

### 1. Frontend (Vercel)
- **Common Issues**:
  - Build step failure (`npm run build` / peer dependency conflicts).
  - Incorrect `NEXT_PUBLIC_API_URL` pointing to local instead of Render backend.
  - CORS errors caused by domain mismatch or missing headers.
- **Where to Check**: Vercel Dashboard -> Project -> Deployments -> Build/Runtime Logs.

### 2. Backend (Render)
- **Common Issues**:
  - Web service failing health checks or port binding (`PORT` environment variable).
  - Missing environment secrets (DB keys, Redis URI, JWT secret).
  - Free-tier spinning down / cold starts or request timeouts.
- **Where to Check**: Render Dashboard -> Web Service -> Logs / Events.

### 3. Database (Supabase)
- **Common Issues**:
  - Connection exhaustion / pooling errors (use session or transaction mode pooler ports).
  - Row-Level Security (RLS) blocking read/write queries.
  - Supabase client auth token / service role key expiration or misconfiguration.
- **Where to Check**: Supabase Dashboard -> Database -> Logs & API Logs.

### 4. Celery & Redis (Background Jobs)
- **Common Issues**:
  - Celery worker unable to connect to Redis (`REDIS_URL` or SSL `rediss://` format).
  - Task serialization failures (non-JSON serializable parameters).
  - Worker memory limits or unhandled task exceptions.
- **Where to Check**: Celery worker logs / Redis dashboard & connection monitors.
