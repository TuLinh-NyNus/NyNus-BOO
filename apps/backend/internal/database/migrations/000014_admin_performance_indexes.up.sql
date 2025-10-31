-- ========================================
-- MIGRATION 000014: Admin Performance Indexes
-- Purpose: Fix admin pages slow data loading (3-5s → 300ms-1s)
-- Date: 2025-01-19
-- Author: NyNus Development Team
-- ========================================

-- ========================================
-- PART 1: USERS TABLE PERFORMANCE INDEXES
-- ========================================

-- Lowercase search indexes cho case-insensitive search
-- Giải quyết vấn đề: Search queries phải scan toàn bộ users table
-- Performance improvement: 1-3s → 50-100ms
CREATE INDEX IF NOT EXISTS idx_users_email_lower 
ON users(LOWER(email));

CREATE INDEX IF NOT EXISTS idx_users_first_name_lower 
ON users(LOWER(first_name));

CREATE INDEX IF NOT EXISTS idx_users_last_name_lower 
ON users(LOWER(last_name));

-- Composite index cho admin filtering queries
-- Tối ưu cho query: WHERE role = ? AND status = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_users_role_status_created 
ON users(role, status, created_at DESC);

-- Index cho active users queries
-- Tối ưu cho query: WHERE is_active = true
CREATE INDEX IF NOT EXISTS idx_users_is_active 
ON users(is_active) 
WHERE is_active = true;

-- ========================================
-- PART 2: AUDIT LOGS PERFORMANCE INDEXES
-- ========================================

-- Descending created_at index cho recent logs queries
-- Tối ưu cho query: ORDER BY created_at DESC LIMIT 50
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_desc 
ON audit_logs(created_at DESC);

-- Composite index cho user audit logs
-- Tối ưu cho query: WHERE user_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created 
ON audit_logs(user_id, created_at DESC);

-- Composite index cho resource audit logs
-- Tối ưu cho query: WHERE resource = ? AND resource_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_created 
ON audit_logs(resource, resource_id, created_at DESC);

-- Index cho action filtering
-- Tối ưu cho query: WHERE action = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created 
ON audit_logs(action, created_at DESC);

-- Index cho success status filtering
-- Tối ưu cho query: WHERE success = false (error tracking)
CREATE INDEX IF NOT EXISTS idx_audit_logs_success_created 
ON audit_logs(success, created_at DESC) 
WHERE success = false;

-- ========================================
-- PART 3: RESOURCE ACCESS PERFORMANCE INDEXES
-- ========================================

-- Descending created_at index cho recent access queries
-- Tối ưu cho query: ORDER BY created_at DESC LIMIT 50
CREATE INDEX IF NOT EXISTS idx_resource_access_created_desc 
ON resource_access(created_at DESC);

-- Composite index cho user resource access
-- Tối ưu cho query: WHERE user_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_resource_access_user_created 
ON resource_access(user_id, created_at DESC);

-- Composite index cho resource type filtering
-- Tối ưu cho query: WHERE resource_type = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_resource_access_type_created 
ON resource_access(resource_type, created_at DESC);

-- Composite index cho action filtering
-- Tối ưu cho query: WHERE action = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_resource_access_action_created 
ON resource_access(action, created_at DESC);

-- Index cho high risk access queries
-- Tối ưu cho query: WHERE risk_score >= 70 ORDER BY risk_score DESC
CREATE INDEX IF NOT EXISTS idx_resource_access_high_risk 
ON resource_access(risk_score DESC, created_at DESC) 
WHERE risk_score >= 70;

-- Composite index cho resource-specific access
-- Tối ưu cho query: WHERE resource_type = ? AND resource_id = ?
CREATE INDEX IF NOT EXISTS idx_resource_access_type_id_created 
ON resource_access(resource_type, resource_id, created_at DESC);

-- ========================================
-- PART 4: NOTIFICATIONS PERFORMANCE INDEXES
-- ========================================

-- Composite index cho unread notifications
-- Tối ưu cho query: WHERE user_id = ? AND is_read = false ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread_created 
ON notifications(user_id, is_read, created_at DESC) 
WHERE is_read = false;

-- Index cho notification type filtering
-- Tối ưu cho query: WHERE type = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_notifications_type_created 
ON notifications(type, created_at DESC);

-- ========================================
-- PART 6: PERFORMANCE MONITORING
-- ========================================

-- Enable pg_stat_statements extension for query performance monitoring
-- (Chỉ chạy nếu chưa enable)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- ========================================
-- MIGRATION NOTES
-- ========================================

-- Expected performance improvements:
-- 1. Users search: 1-3s → 50-100ms (95% improvement)
-- 2. Audit logs: 500ms-1s → 100-200ms (80% improvement)
-- 3. Resource access: 500ms-1s → 100-200ms (80% improvement)
-- 4. Overall admin pages: 3-5s → 300ms-1s (80-90% improvement)

-- Index maintenance:
-- - PostgreSQL automatically maintains indexes
-- - Run ANALYZE after migration to update statistics
-- - Monitor index usage with pg_stat_user_indexes

-- Rollback strategy:
-- - All indexes use IF NOT EXISTS to prevent errors
-- - Down migration drops all indexes safely
-- - No data loss on rollback

