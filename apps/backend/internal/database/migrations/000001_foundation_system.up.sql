-- ===================================================================
-- MIGRATION: 000001_foundation_system
-- PURPOSE: Core infrastructure, users table with complete auth fields
-- CONSOLIDATES: Original 000001 + user fields from 000004_enhanced_auth
-- DATE: 2025-09-22
-- ===================================================================

-- ========================================
-- PART 1: CORE INFRASTRUCTURE
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schema migrations table (migration tracking)
CREATE TABLE IF NOT EXISTS schema_migrations (
    version BIGINT PRIMARY KEY,
    dirty BOOLEAN NOT NULL DEFAULT FALSE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- PART 2: CORE FUNCTIONS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PART 3: USERS TABLE (COMPLETE)
-- ========================================

-- Users table with all auth fields included from the start
CREATE TABLE IF NOT EXISTS users (
    -- Core identity
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    
    -- OAuth fields
    google_id TEXT UNIQUE,
    username TEXT UNIQUE,
    avatar TEXT,
    bio TEXT,
    phone TEXT,
    address TEXT,
    school TEXT,
    date_of_birth DATE,
    gender TEXT,
    
    -- Role and hierarchy (5-role system)
    role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('GUEST', 'STUDENT', 'TUTOR', 'TEACHER', 'ADMIN')),
    level INTEGER, -- 1-9 for STUDENT, TUTOR, TEACHER; NULL for GUEST, ADMIN
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    
    -- Security fields
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    max_concurrent_sessions INTEGER NOT NULL DEFAULT 3,
    last_login_at TIMESTAMPTZ,
    last_login_ip TEXT,
    login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    
    -- Legacy compatibility
    is_active BOOLEAN NOT NULL DEFAULT true,
    resource_path TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- PART 4: INDEXES FOR USERS
-- ========================================

-- Core lookup indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX idx_users_username ON users(username) WHERE username IS NOT NULL;

-- Role and status indexes
CREATE INDEX idx_users_role_level ON users(role, level);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role_status ON users(role, status);

-- Security indexes
CREATE INDEX idx_users_last_login ON users(last_login_at DESC);
CREATE INDEX idx_users_locked_until ON users(locked_until) WHERE locked_until IS NOT NULL;
CREATE INDEX idx_users_login_attempts ON users(login_attempts) WHERE login_attempts > 0;

-- ========================================
-- PART 5: CONSTRAINTS & VALIDATION
-- ========================================

-- Function to validate user role and level combination
CREATE OR REPLACE FUNCTION validate_user_role_level()
RETURNS TRIGGER AS $$
BEGIN
    -- GUEST and ADMIN should not have levels
    IF NEW.role IN ('GUEST', 'ADMIN') AND NEW.level IS NOT NULL THEN
        RAISE EXCEPTION 'Role % cannot have a level', NEW.role;
    END IF;
    
    -- STUDENT, TUTOR, TEACHER must have levels 1-9
    IF NEW.role IN ('STUDENT', 'TUTOR', 'TEACHER') THEN
        IF NEW.level IS NULL OR NEW.level < 1 OR NEW.level > 9 THEN
            RAISE EXCEPTION 'Role % must have a level between 1 and 9', NEW.role;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for role-level validation
CREATE TRIGGER trigger_validate_user_role_level
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION validate_user_role_level();

-- Add trigger for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- PART 6: COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE users IS 'Core users table with complete authentication and authorization fields';
COMMENT ON COLUMN users.role IS '5-role system: GUEST, STUDENT, TUTOR, TEACHER, ADMIN';
COMMENT ON COLUMN users.level IS 'Hierarchy level 1-9 for STUDENT, TUTOR, TEACHER roles; NULL for GUEST, ADMIN';
COMMENT ON COLUMN users.google_id IS 'Google OAuth account ID for SSO integration';
COMMENT ON COLUMN users.max_concurrent_sessions IS 'Maximum concurrent sessions allowed (default 3)';
COMMENT ON COLUMN users.status IS 'Account status: ACTIVE, INACTIVE, SUSPENDED';

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

SELECT 'Foundation system (core infrastructure + complete users table) created successfully!' as message;
