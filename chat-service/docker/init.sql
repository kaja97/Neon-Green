-- Chat database initialization
-- Enable required extensions for UUID generation and fuzzy text search
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
