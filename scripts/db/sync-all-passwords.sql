-- ========================================
-- Script: Sync All User Passwords to Abd8stbcs!
-- ========================================
-- Purpose: Update all user passwords in database to Abd8stbcs!
--          for development/testing purposes
-- 
-- Password: Abd8stbcs!
-- Bcrypt Hash (cost 10): $2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe
--
-- Usage: 
--   psql -U exam_bank_user -d exam_bank_db -f sync-all-passwords.sql
-- 
-- Or from Docker:
--   docker exec -i exam-bank-postgres psql -U exam_bank_user -d exam_bank_db < sync-all-passwords.sql
-- ========================================

BEGIN;

-- Show current password statistics before update
\echo '========================================';
\echo 'BEFORE UPDATE - Password Statistics';
\echo '========================================';

SELECT 
    role,
    COUNT(*) as total_users,
    COUNT(DISTINCT password_hash) as unique_passwords
FROM users
GROUP BY role
ORDER BY role;

\echo '';
\echo 'Total users in database:';
SELECT COUNT(*) as total_users FROM users;

\echo '';
\echo '========================================';
\echo 'UPDATING ALL PASSWORDS...';
\echo '========================================';

-- Update all user passwords to Abd8stbcs!
UPDATE users
SET 
    password_hash = '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe',
    updated_at = NOW()
WHERE password_hash != '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe';

-- Show results
\echo '';
\echo 'Users updated:';
SELECT 
    COUNT(*) as users_updated
FROM users
WHERE updated_at >= NOW() - INTERVAL '1 second';

\echo '';
\echo '========================================';
\echo 'AFTER UPDATE - Password Statistics';
\echo '========================================';

SELECT 
    role,
    COUNT(*) as total_users,
    COUNT(DISTINCT password_hash) as unique_passwords
FROM users
GROUP BY role
ORDER BY role;

\echo '';
\echo 'Verification - All users should have same password hash:';
SELECT 
    password_hash,
    COUNT(*) as user_count
FROM users
GROUP BY password_hash
ORDER BY user_count DESC;

COMMIT;

-- Success message
\echo '';
\echo '========================================';
\echo '✅ SUCCESS: All passwords synchronized!';
\echo '========================================';
\echo '';
\echo 'Password for ALL accounts: Abd8stbcs!';
\echo 'Bcrypt Hash: $2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe';
\echo '';
\echo 'Test login examples:';
\echo '  - admin1@nynus.com / Abd8stbcs!';
\echo '  - teacher1@nynus.com / Abd8stbcs!';
\echo '  - student1@nynus.com / Abd8stbcs!';
\echo '  - demo.student@exambank.com / Abd8stbcs!';
\echo '';

