-- ========================================
-- Script: Unlock All Locked User Accounts
-- ========================================
-- Purpose: Reset login attempts and unlock all accounts
--          for development/testing purposes
-- 
-- Usage: 
--   psql -U exam_bank_user -d exam_bank_db -f unlock-all-accounts.sql
-- 
-- Or from Docker:
--   docker exec -i exam-bank-postgres psql -U exam_bank_user -d exam_bank_db < unlock-all-accounts.sql
-- ========================================

BEGIN;

-- Show accounts that will be unlocked
SELECT 
    email,
    login_attempts,
    locked_until,
    CASE 
        WHEN locked_until IS NOT NULL AND locked_until > NOW() 
        THEN 'LOCKED' 
        ELSE 'UNLOCKED' 
    END as current_status
FROM users
WHERE login_attempts > 0 OR locked_until IS NOT NULL
ORDER BY email;

-- Reset login attempts and clear lock timestamp
UPDATE users
SET 
    login_attempts = 0,
    locked_until = NULL,
    updated_at = NOW()
WHERE login_attempts > 0 OR locked_until IS NOT NULL;

-- Show results
SELECT 
    COUNT(*) as total_users_unlocked
FROM users
WHERE updated_at >= NOW() - INTERVAL '1 second';

COMMIT;

-- Success message
\echo '✅ All accounts have been unlocked successfully!'
\echo 'Login attempts reset to 0'
\echo 'Lock timestamps cleared'
