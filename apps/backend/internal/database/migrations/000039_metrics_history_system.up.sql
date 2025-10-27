-- =========================================
-- Migration: 000039_metrics_history_system
-- Description: Create metrics_history table for storing time-series admin dashboard metrics
-- Author: System
-- Date: 2025-10-27
-- =========================================

-- Create metrics_history table
-- Stores snapshots of system metrics for historical analysis and sparkline charts
CREATE TABLE IF NOT EXISTS metrics_history (
    id BIGSERIAL PRIMARY KEY,
    
    -- Timestamp of this metrics snapshot
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- User metrics
    total_users INTEGER NOT NULL DEFAULT 0,
    active_users INTEGER NOT NULL DEFAULT 0,
    new_users_today INTEGER NOT NULL DEFAULT 0,
    
    -- Session metrics  
    total_sessions INTEGER NOT NULL DEFAULT 0,
    active_sessions INTEGER NOT NULL DEFAULT 0,
    
    -- Security metrics
    suspicious_activities INTEGER NOT NULL DEFAULT 0,
    blocked_ips INTEGER NOT NULL DEFAULT 0,
    security_events INTEGER NOT NULL DEFAULT 0,
    
    -- System health metrics (optional, for future use)
    avg_response_time_ms INTEGER DEFAULT NULL,
    error_rate_percent DECIMAL(5,2) DEFAULT NULL,
    uptime_percent DECIMAL(5,2) DEFAULT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT metrics_history_positive_users CHECK (total_users >= 0),
    CONSTRAINT metrics_history_positive_sessions CHECK (total_sessions >= 0),
    CONSTRAINT metrics_history_active_le_total_users CHECK (active_users <= total_users),
    CONSTRAINT metrics_history_active_le_total_sessions CHECK (active_sessions <= total_sessions)
);

-- =========================================
-- INDEXES for efficient time-series queries
-- =========================================

-- Primary index for time-range queries (DESC for most recent first)
CREATE INDEX idx_metrics_history_recorded_at_desc 
    ON metrics_history(recorded_at DESC);

-- Composite index for specific metric queries over time
CREATE INDEX idx_metrics_history_recorded_at_users 
    ON metrics_history(recorded_at DESC, total_users, active_users);

CREATE INDEX idx_metrics_history_recorded_at_sessions 
    ON metrics_history(recorded_at DESC, total_sessions, active_sessions);

CREATE INDEX idx_metrics_history_recorded_at_security 
    ON metrics_history(recorded_at DESC, suspicious_activities);

-- Partial index for recent data (last 7 days) - most frequently accessed
CREATE INDEX idx_metrics_history_recent 
    ON metrics_history(recorded_at DESC)
    WHERE recorded_at > NOW() - INTERVAL '7 days';

-- =========================================
-- COMMENTS for documentation
-- =========================================

COMMENT ON TABLE metrics_history IS 
'Time-series storage for system metrics. Records snapshots every 5 minutes for dashboard sparklines and historical analysis. Retention: 30 days.';

COMMENT ON COLUMN metrics_history.recorded_at IS 
'Timestamp when this metrics snapshot was recorded (indexed DESC for recent-first queries)';

COMMENT ON COLUMN metrics_history.total_users IS 
'Total number of users in the system at this snapshot';

COMMENT ON COLUMN metrics_history.active_users IS 
'Number of active users at this snapshot';

COMMENT ON COLUMN metrics_history.total_sessions IS 
'Total number of sessions at this snapshot';

COMMENT ON COLUMN metrics_history.active_sessions IS 
'Number of currently active sessions';

COMMENT ON COLUMN metrics_history.suspicious_activities IS 
'Count of suspicious security activities detected';

-- =========================================
-- INITIAL DATA (optional)
-- =========================================

-- Insert initial snapshot with current stats
-- This will be replaced by scheduled job recordings
INSERT INTO metrics_history (
    total_users,
    active_users,
    total_sessions,
    active_sessions,
    suspicious_activities
)
SELECT 
    COUNT(*)::INTEGER as total_users,
    COUNT(*) FILTER (WHERE is_active = true)::INTEGER as active_users,
    0 as total_sessions,  -- Will be populated by session tracking
    0 as active_sessions,
    0 as suspicious_activities
FROM users
ON CONFLICT DO NOTHING;

-- =========================================
-- MAINTENANCE
-- =========================================

-- Auto-cleanup function for retention policy (keep last 30 days)
-- Will be called by scheduled job
CREATE OR REPLACE FUNCTION cleanup_old_metrics()
RETURNS void AS $$
BEGIN
    DELETE FROM metrics_history 
    WHERE recorded_at < NOW() - INTERVAL '30 days';
    
    -- Log cleanup action
    RAISE NOTICE 'Cleaned up metrics older than 30 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_metrics() IS 
'Removes metrics_history records older than 30 days to maintain storage efficiency';

