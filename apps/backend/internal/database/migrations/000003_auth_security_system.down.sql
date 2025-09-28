-- ===================================================================
-- ROLLBACK: 000003_auth_security_system
-- PURPOSE: Remove complete Authentication & Security System
-- DATE: 2025-09-22
-- ===================================================================

-- Drop functions first
DROP FUNCTION IF EXISTS cleanup_expired_refresh_tokens();
DROP FUNCTION IF EXISTS revoke_token_family(TEXT, TEXT);

-- Drop triggers
DROP TRIGGER IF EXISTS update_oauth_accounts_updated_at ON oauth_accounts;
DROP TRIGGER IF EXISTS update_course_enrollments_updated_at ON course_enrollments;
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS resource_access CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS account_locks CASCADE;
DROP TABLE IF EXISTS login_attempts CASCADE;
DROP TABLE IF EXISTS email_verification_tokens CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS oauth_accounts CASCADE;

SELECT 'Authentication & Security System rollback completed!' as message;
