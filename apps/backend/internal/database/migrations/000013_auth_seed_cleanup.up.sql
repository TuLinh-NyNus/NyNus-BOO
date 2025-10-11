-- ===================================================================
-- MIGRATION: 000013_auth_seed_cleanup (up)
-- PURPOSE : Normalize default seed user data to satisfy auth checks
-- ===================================================================

-- Ensure status is set to ACTIVE for any legacy seed rows
UPDATE users
SET status = 'ACTIVE'
WHERE status IS NULL
   OR status = ''
   OR status NOT IN ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- Normalize role values that may have been inserted with lowercase strings
UPDATE users
SET role = UPPER(role)
WHERE role IN ('admin', 'teacher', 'tutor', 'student', 'guest');

-- Guarantee seed accounts are treated as verified and active
UPDATE users
SET email_verified = TRUE,
    is_active = TRUE,
    max_concurrent_sessions = COALESCE(max_concurrent_sessions, 3),
    login_attempts = 0,
    locked_until = NULL
WHERE email IN (
    'admin@exambank.com',
    'teacher@exambank.com',
    'student@exambank.com',
    'demo.teacher@exambank.com',
    'demo.student@exambank.com'
);
