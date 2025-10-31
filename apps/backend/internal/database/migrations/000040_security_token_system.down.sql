-- ==========================================
-- Rollback Security & Token Management System
-- Phase 6.2: Backend Integration
-- ==========================================

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_update_security_event_timestamp ON security_events;

-- Drop functions
DROP FUNCTION IF EXISTS update_security_event_timestamp();
DROP FUNCTION IF EXISTS cleanup_old_token_metrics();
DROP FUNCTION IF EXISTS cleanup_expired_sessions();
DROP FUNCTION IF EXISTS cleanup_old_audit_logs();

-- Drop new indexes (only those not from migration 003)
DROP INDEX IF EXISTS idx_user_sessions_composite;

-- Drop tables (in reverse dependency order)
-- Note: user_sessions and audit_logs tables are NOT dropped as they were created in migration 003
DROP TABLE IF EXISTS token_metrics;
DROP TABLE IF EXISTS security_responses;
DROP TABLE IF EXISTS security_events;

-- Remove columns added to user_sessions table
DO $$
BEGIN
    -- Remove refresh_token_hash if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'refresh_token_hash'
    ) THEN
        ALTER TABLE user_sessions DROP COLUMN refresh_token_hash;
    END IF;

    -- Remove invalidated_at if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'invalidated_at'
    ) THEN
        ALTER TABLE user_sessions DROP COLUMN invalidated_at;
    END IF;

    -- Remove invalidation_reason if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'invalidation_reason'
    ) THEN
        ALTER TABLE user_sessions DROP COLUMN invalidation_reason;
    END IF;

    -- Rename last_activity_at back to last_activity if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'last_activity_at'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'last_activity'
    ) THEN
        ALTER TABLE user_sessions RENAME COLUMN last_activity_at TO last_activity;
    END IF;
END $$;

-- Revert audit_logs table changes
DO $$
BEGIN
    -- Remove user_role if exists and wasn't in original
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'user_role'
    ) THEN
        ALTER TABLE audit_logs DROP COLUMN IF EXISTS user_role;
    END IF;

    -- Rename entity back to resource if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'entity'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'resource'
    ) THEN
        ALTER TABLE audit_logs RENAME COLUMN entity TO resource;
    END IF;

    -- Rename entity_id back to resource_id if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'entity_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'resource_id'
    ) THEN
        ALTER TABLE audit_logs RENAME COLUMN entity_id TO resource_id;
    END IF;

    -- Remove description if it wasn't in original schema
    -- Note: Keep it if it exists in migration 021 schema
END $$;



