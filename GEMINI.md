# Workspace Context & Deployment Architecture

## Deployment Target Reference

This project is deployed across multiple specialized cloud platforms:

- **Frontend**: **Vercel** (Next.js client application)
- **Backend**: **Render** (FastAPI backend service)
- **Database**: **Supabase** (PostgreSQL database, Auth, Storage)
- **Celery Workers / Message Broker**: **Redis** (Task queues & async background processing)

## Failure & Error Debugging Context

Whenever the user reports an issue or asks to debug an error:
- **Vercel (Frontend)**: Investigate frontend build logs, Next.js runtime errors, SSR issues, client-side API base URL misconfigurations, or Vercel edge/serverless execution limits.
- **Render (Backend)**: Investigate FastAPI exception traces, Render deployment/build logs, web service health checks, worker timeouts, or environment variables.
- **Supabase (Database)**: Check PostgreSQL queries, RLS policies, connection pooling (PgBouncer/direct connection strings), and Supabase client credentials.
- **Redis & Celery (Workers)**: Check Celery worker process logs, broker connectivity (`REDIS_URL`), task retry logic, unhandled worker exceptions, and message serialization.
