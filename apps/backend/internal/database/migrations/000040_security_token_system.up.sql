-- ==========================================
-- Security & Token Management System
-- Phase 6.2: Backend Integration
-- ==========================================

-- Security Events Table
-- Stores all security threats and events
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    threat_type TEXT NOT NULL,  -- BRUTE_FORCE, RAPID_REQUESTS, UNUSUAL_LOCATION, TOKEN_ANOMALY, etc.
    risk_score INT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    status TEXT NOT NULL DEFAULT 'DETECTED',  -- DETECTED, INVESTIGATING, MITIGATED, RESOLVED
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',  -- Additional contextual data
    ip_address TEXT,
    user_agent TEXT,
    device_fingerprint TEXT,
    location TEXT,  -- Geographic location or region
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT REFERENCES users(id) ON DELETE SET NULL
);

-- Security Responses Table
-- Tracks automated and manual security responses
CREATE TABLE IF NOT EXISTS security_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    threat_id UUID REFERENCES security_events(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,  -- ALERT, BLOCK, MFA_REQUIRED, LOGOUT, RATE_LIMIT
    duration_seconds INT DEFAULT 0,  -- 0 = permanent
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',  -- PENDING, EXECUTING, COMPLETED, FAILED
    executed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    executed_by TEXT,  -- 'SYSTEM' or user_id for manual responses
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Token Metrics Table
-- Stores performance metrics for token operations
CREATE TABLE IF NOT EXISTS token_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,  -- NULL for system-wide metrics
    metric_type TEXT NOT NULL,  -- REFRESH, VALIDATION, ERROR
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_ms INT NOT NULL,  -- Operation duration in milliseconds
    success BOOLEAN NOT NULL DEFAULT true,
    error_type TEXT,  -- NULL if success = true
    metadata JSONB DEFAULT '{}',  -- Additional data (e.g., cache hit/miss, batch size)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Session Tracking Table (Enhanced)
-- Alter existing user_sessions table to add new columns
-- Table already exists from migration 000003
DO $$
BEGIN
    -- Add refresh_token_hash if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'refresh_token_hash'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN refresh_token_hash TEXT;
    END IF;

    -- Add invalidated_at if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'invalidated_at'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN invalidated_at TIMESTAMPTZ;
    END IF;

    -- Add invalidation_reason if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'invalidation_reason'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN invalidation_reason TEXT;
    END IF;

    -- Rename last_activity to last_activity_at if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'last_activity'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'last_activity_at'
    ) THEN
        ALTER TABLE user_sessions RENAME COLUMN last_activity TO last_activity_at;
    END IF;
END $$;

-- Audit Logs Table (Enhanced from existing audit_logger.go)
-- Alter existing audit_logs table to add new columns if needed
-- Table already exists from previous migrations
DO $$
BEGIN
    -- Add user_role if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'user_role'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN user_role TEXT;
    END IF;

    -- Add entity if not exists (might be named 'resource' in older schema)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'entity'
    ) THEN
        -- If 'resource' column exists, rename it to 'entity'
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'audit_logs' AND column_name = 'resource'
        ) THEN
            ALTER TABLE audit_logs RENAME COLUMN resource TO entity;
        ELSE
            ALTER TABLE audit_logs ADD COLUMN entity TEXT NOT NULL DEFAULT 'unknown';
        END IF;
    END IF;

    -- Add entity_id if not exists (might be named 'resource_id' in older schema)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'entity_id'
    ) THEN
        -- If 'resource_id' column exists, rename it to 'entity_id'
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'audit_logs' AND column_name = 'resource_id'
        ) THEN
            ALTER TABLE audit_logs RENAME COLUMN resource_id TO entity_id;
        ELSE
            ALTER TABLE audit_logs ADD COLUMN entity_id TEXT;
        END IF;
    END IF;

    -- Add description if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'description'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN description TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- ==========================================
-- INDEXES for Performance
-- ==========================================

-- Security Events Indexes
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_threat_type ON security_events(threat_type);
CREATE INDEX IF NOT EXISTS idx_security_events_status ON security_events(status);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_risk_score ON security_events(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_composite ON security_events(user_id, status, created_at DESC);

-- Security Responses Indexes
CREATE INDEX IF NOT EXISTS idx_security_responses_threat_id ON security_responses(threat_id);
CREATE INDEX IF NOT EXISTS idx_security_responses_user_id ON security_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_security_responses_status ON security_responses(status);
CREATE INDEX IF NOT EXISTS idx_security_responses_created_at ON security_responses(created_at DESC);

-- Token Metrics Indexes
CREATE INDEX IF NOT EXISTS idx_token_metrics_user_id ON token_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_token_metrics_type ON token_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_token_metrics_timestamp ON token_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_token_metrics_success ON token_metrics(success);
CREATE INDEX IF NOT EXISTS idx_token_metrics_composite ON token_metrics(user_id, metric_type, timestamp DESC);

-- User Sessions Indexes (some already exist from migration 003)
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_composite ON user_sessions(user_id, is_active, last_activity_at DESC);

-- Audit Logs Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_composite ON audit_logs(user_id, action, created_at DESC);

-- ==========================================
-- DATA RETENTION & CLEANUP
-- ==========================================

-- Function to cleanup old metrics (90 days retention)
CREATE OR REPLACE FUNCTION cleanup_old_token_metrics()
RETURNS void AS $$
BEGIN
    DELETE FROM token_metrics
    WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    UPDATE user_sessions
    SET is_active = false,
        invalidated_at = NOW(),
        invalidation_reason = 'EXPIRED'
    WHERE expires_at < NOW()
      AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old audit logs (1 year retention)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM audit_logs
    WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Auto-update updated_at on security_events
CREATE OR REPLACE FUNCTION update_security_event_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_security_event_timestamp
BEFORE UPDATE ON security_events
FOR EACH ROW
EXECUTE FUNCTION update_security_event_timestamp();

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON TABLE security_events IS 'Stores all detected security threats and events';
COMMENT ON TABLE security_responses IS 'Tracks automated and manual security response actions';
COMMENT ON TABLE token_metrics IS 'Performance metrics for JWT token operations';
COMMENT ON TABLE user_sessions IS 'Tracks active user sessions across multiple devices';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for security and administrative actions';



