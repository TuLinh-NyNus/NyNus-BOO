-- ========================================
-- Script: Activate All User Accounts
-- ========================================
-- Purpose: Activate all user accounts in database for development/testing
--          - Set status to ACTIVE
--          - Set is_active to TRUE
--          - Set email_verified to TRUE
--          - Reset login_attempts to 0
--          - Clear locked_until
-- 
-- Usage: 
--   psql -U exam_bank_user -d exam_bank_db -f activate-all-accounts.sql
-- 
-- Or from Docker:
--   docker exec -i NyNus-postgres psql -U exam_bank_user -d exam_bank_db < activate-all-accounts.sql
--
-- Or from PowerShell:
--   Get-Content scripts\db\activate-all-accounts.sql | docker exec -i NyNus-postgres psql -U exam_bank_user -d exam_bank_db
-- ========================================

BEGIN;

-- Show current problematic accounts BEFORE update
\echo '========================================';
\echo 'BEFORE UPDATE - Problematic Accounts';
\echo '========================================';

SELECT 
    id, 
    email, 
    role, 
    is_active, 
    email_verified, 
    status, 
    login_attempts,
    locked_until
FROM users
WHERE status != 'ACTIVE' OR is_active = FALSE OR email_verified = FALSE OR login_attempts > 0 OR locked_until IS NOT NULL
ORDER BY role, id;

\echo '';
\echo 'Summary by Role:';
SELECT 
    role,
    COUNT(*) as total_users,
    COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_status,
    COUNT(CASE WHEN status = 'INACTIVE' THEN 1 END) as inactive_status,
    COUNT(CASE WHEN status = 'SUSPENDED' THEN 1 END) as suspended_status,
    COUNT(CASE WHEN is_active = TRUE THEN 1 END) as is_active_true,
    COUNT(CASE WHEN is_active = FALSE THEN 1 END) as is_active_false,
    COUNT(CASE WHEN email_verified = TRUE THEN 1 END) as email_verified_true,
    COUNT(CASE WHEN email_verified = FALSE THEN 1 END) as email_verified_false
FROM users
GROUP BY role
ORDER BY role;

\echo '';
\echo '========================================';
\echo 'ACTIVATING ALL ACCOUNTS...';
\echo '========================================';

-- Activate all accounts
UPDATE users
SET 
    status = 'ACTIVE',
    is_active = TRUE,
    email_verified = TRUE,
    login_attempts = 0,
    locked_until = NULL,
    updated_at = NOW()
WHERE status != 'ACTIVE' 
   OR is_active = FALSE 
   OR email_verified = FALSE 
   OR login_attempts > 0 
   OR locked_until IS NOT NULL;

-- Show results
\echo '';
\echo 'Accounts updated:';
SELECT 
    COUNT(*) as accounts_updated
FROM users
WHERE updated_at >= NOW() - INTERVAL '1 second';

\echo '';
\echo '========================================';
\echo 'AFTER UPDATE - Verification';
\echo '========================================';

-- Verify all accounts are now active
SELECT 
    role,
    COUNT(*) as total_users,
    COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_status,
    COUNT(CASE WHEN status = 'INACTIVE' THEN 1 END) as inactive_status,
    COUNT(CASE WHEN status = 'SUSPENDED' THEN 1 END) as suspended_status,
    COUNT(CASE WHEN is_active = TRUE THEN 1 END) as is_active_true,
    COUNT(CASE WHEN is_active = FALSE THEN 1 END) as is_active_false,
    COUNT(CASE WHEN email_verified = TRUE THEN 1 END) as email_verified_true,
    COUNT(CASE WHEN email_verified = FALSE THEN 1 END) as email_verified_false,
    COUNT(CASE WHEN login_attempts = 0 THEN 1 END) as zero_login_attempts,
    COUNT(CASE WHEN locked_until IS NULL THEN 1 END) as not_locked
FROM users
GROUP BY role
ORDER BY role;

\echo '';
\echo 'Check for any remaining problematic accounts:';
SELECT 
    COUNT(*) as problematic_accounts
FROM users
WHERE status != 'ACTIVE' 
   OR is_active = FALSE 
   OR email_verified = FALSE 
   OR login_attempts > 0 
   OR locked_until IS NOT NULL;

COMMIT;

-- Success message
\echo '';
\echo '========================================';
\echo '✅ SUCCESS: All accounts activated!';
\echo '========================================';
\echo '';
\echo 'All user accounts now have:';
\echo '  - status = ACTIVE';
\echo '  - is_active = TRUE';
\echo '  - email_verified = TRUE';
\echo '  - login_attempts = 0';
\echo '  - locked_until = NULL';
\echo '';
\echo 'Test login examples:';
\echo '  - admin1@nynus.edu.vn / Abd8stbcs!';
\echo '  - teacher1@nynus.edu.vn / Abd8stbcs!';
\echo '  - student1@nynus.edu.vn / Abd8stbcs!';
\echo '  - student-001 (student1@nynus.edu.vn) / Abd8stbcs!';
\echo '';

