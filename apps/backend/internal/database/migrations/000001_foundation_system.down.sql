-- ===================================================================
-- ROLLBACK: 000001_foundation_system
-- PURPOSE: Remove core infrastructure and users table
-- DATE: 2025-09-22
-- ===================================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_validate_user_role_level ON users;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Drop functions
DROP FUNCTION IF EXISTS validate_user_role_level();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS schema_migrations CASCADE;

-- Drop extensions (be careful - other systems might use this)
-- DROP EXTENSION IF EXISTS "uuid-ossp";

SELECT 'Foundation system rollback completed!' as message;
