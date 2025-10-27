-- =========================================
-- Migration Rollback: 000039_metrics_history_system
-- Description: Drop metrics_history table and related objects
-- =========================================

-- Drop cleanup function
DROP FUNCTION IF EXISTS cleanup_old_metrics();

-- Drop indexes (will be dropped automatically with table, but explicit for clarity)
DROP INDEX IF EXISTS idx_metrics_history_recent;
DROP INDEX IF EXISTS idx_metrics_history_recorded_at_security;
DROP INDEX IF EXISTS idx_metrics_history_recorded_at_sessions;
DROP INDEX IF EXISTS idx_metrics_history_recorded_at_users;
DROP INDEX IF EXISTS idx_metrics_history_recorded_at_desc;

-- Drop table
DROP TABLE IF EXISTS metrics_history;

