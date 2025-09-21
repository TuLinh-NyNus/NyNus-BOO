-- NyNus Exam Bank System - Database Initialization
-- This file is executed when PostgreSQL container starts for the first time

-- Create database if not exists (this is handled by POSTGRES_DB environment variable)
-- The database 'exam_bank_db' will be created automatically

-- Create user if not exists (this is handled by POSTGRES_USER environment variable)
-- The user 'exam_bank_user' will be created automatically

-- Grant privileges (this is handled automatically by PostgreSQL)
-- The user will have full privileges on the database

-- Set timezone
SET timezone = 'Asia/Ho_Chi_Minh';

-- Enable extensions that might be needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Log initialization
SELECT 'NyNus Database initialized successfully' AS status;
