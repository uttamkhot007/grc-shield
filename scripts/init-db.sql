-- GRC Shield Database Initialization Script
-- This script runs when the PostgreSQL container is first created

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schemas for multi-tenancy isolation (optional)
-- CREATE SCHEMA IF NOT EXISTS tenant_data;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE grcshield TO grcuser;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'GRC Shield database initialized successfully at %', NOW();
END $$;
