-- ========================================
-- MIGRATION 000014: Admin Performance Indexes - ROLLBACK
-- Purpose: Remove admin performance indexes
-- Date: 2025-01-19
-- Author: NyNus Development Team
-- ========================================

-- ========================================
-- PART 6: NOTIFICATIONS INDEXES
-- ========================================

DROP INDEX IF EXISTS idx_notifications_type_created;
DROP INDEX IF EXISTS idx_notifications_user_unread_created;

-- ========================================
-- PART 5: SESSIONS INDEXES
-- ========================================
-- PART 4: RESOURCE ACCESS INDEXES
-- ========================================

DROP INDEX IF EXISTS idx_resource_access_type_id_created;
DROP INDEX IF EXISTS idx_resource_access_high_risk;
DROP INDEX IF EXISTS idx_resource_access_action_created;
DROP INDEX IF EXISTS idx_resource_access_type_created;
DROP INDEX IF EXISTS idx_resource_access_user_created;
DROP INDEX IF EXISTS idx_resource_access_created_desc;

-- ========================================
-- PART 3: AUDIT LOGS INDEXES
-- ========================================

DROP INDEX IF EXISTS idx_audit_logs_success_created;
DROP INDEX IF EXISTS idx_audit_logs_action_created;
DROP INDEX IF EXISTS idx_audit_logs_resource_created;
DROP INDEX IF EXISTS idx_audit_logs_user_created;
DROP INDEX IF EXISTS idx_audit_logs_created_desc;

-- ========================================
-- PART 2: USERS TABLE INDEXES
-- ========================================

DROP INDEX IF EXISTS idx_users_is_active;
DROP INDEX IF EXISTS idx_users_role_status_created;
DROP INDEX IF EXISTS idx_users_last_name_lower;
DROP INDEX IF EXISTS idx_users_first_name_lower;
DROP INDEX IF EXISTS idx_users_email_lower;

-- ========================================
-- ROLLBACK NOTES
-- ========================================

-- Note: pg_stat_statements extension is NOT dropped
-- Reason: Other parts of the system may depend on it
-- If you need to drop it manually, run:
-- DROP EXTENSION IF EXISTS pg_stat_statements;

-- After rollback:
-- - Admin pages will revert to slower performance
-- - No data is lost
-- - Existing queries will still work (just slower)
-- - Run ANALYZE to update statistics

