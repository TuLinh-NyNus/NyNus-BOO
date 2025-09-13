-- Rollback Enhanced Auth System Migration
-- Reverts database to state before enhanced auth implementation

-- ========================================
-- PART 1: DROP NEW TABLES (in reverse order)
-- ========================================

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS resource_access CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS oauth_accounts CASCADE;

-- ========================================
-- PART 2: DROP FUNCTIONS & TRIGGERS
-- ========================================

DROP TRIGGER IF EXISTS trigger_validate_user_role_level ON users;
DROP FUNCTION IF EXISTS validate_user_role_level();

-- ========================================
-- PART 3: REVERT USERS TABLE
-- ========================================

-- Remove constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;

-- Revert role constraint to original 3 roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('student', 'teacher', 'admin'));

-- Convert roles back to lowercase
UPDATE users SET role = LOWER(role) WHERE role IS NOT NULL;

-- Drop indexes
DROP INDEX IF EXISTS idx_users_google_id;
DROP INDEX IF EXISTS idx_users_role_level;
DROP INDEX IF EXISTS idx_users_status;
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_last_login;

-- Drop new columns
ALTER TABLE users 
    DROP COLUMN IF EXISTS google_id,
    DROP COLUMN IF EXISTS username,
    DROP COLUMN IF EXISTS avatar,
    DROP COLUMN IF EXISTS bio,
    DROP COLUMN IF EXISTS phone,
    DROP COLUMN IF EXISTS address,
    DROP COLUMN IF EXISTS school,
    DROP COLUMN IF EXISTS date_of_birth,
    DROP COLUMN IF EXISTS gender,
    DROP COLUMN IF EXISTS level,
    DROP COLUMN IF EXISTS status,
    DROP COLUMN IF EXISTS email_verified,
    DROP COLUMN IF EXISTS max_concurrent_sessions,
    DROP COLUMN IF EXISTS last_login_at,
    DROP COLUMN IF EXISTS last_login_ip,
    DROP COLUMN IF EXISTS login_attempts,
    DROP COLUMN IF EXISTS locked_until;

-- ========================================
-- PART 4: REMOVE COMMENTS
-- ========================================

COMMENT ON COLUMN users.level IS NULL;
COMMENT ON COLUMN users.google_id IS NULL;
COMMENT ON COLUMN users.max_concurrent_sessions IS NULL;