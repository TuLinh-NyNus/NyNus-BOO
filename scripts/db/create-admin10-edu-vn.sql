-- ========================================
-- Script: Create admin10@nynus.edu.vn Account
-- ========================================
-- Purpose: Create admin10@nynus.edu.vn account for testing
--          Password: Abd8stbcs!
--          Hash: $2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe
-- 
-- Usage from PowerShell:
--   Get-Content scripts\db\create-admin10-edu-vn.sql | docker exec -i NyNus-postgres psql -U exam_bank_user -d exam_bank_db
--
-- Or from Docker:
--   docker exec -i NyNus-postgres psql -U exam_bank_user -d exam_bank_db < scripts/db/create-admin10-edu-vn.sql
--

-- Set client encoding to UTF-8 for Vietnamese characters
SET CLIENT_ENCODING TO 'UTF8';

BEGIN;

\echo '';
\echo '========================================';
\echo 'Creating admin10@nynus.edu.vn Account';
\echo '========================================';
\echo '';

-- Check if account already exists
DO $$
DECLARE
  existing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO existing_count
  FROM users
  WHERE email = 'admin10@nynus.edu.vn';
  
  IF existing_count > 0 THEN
    RAISE NOTICE 'Account admin10@nynus.edu.vn already exists. Skipping creation.';
  ELSE
    -- Create admin10@nynus.edu.vn account
    INSERT INTO users (
      id,
      email,
      password_hash,
      first_name,
      last_name,
      username,
      role,
      level,
      status,
      is_active,
      email_verified,
      bio,
      phone,
      school,
      max_concurrent_sessions,
      last_login_at,
      last_login_ip,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid()::text,
      'admin10@nynus.edu.vn',
      '$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe',
      'Admin',
      'Test Account',
      'admin.test10',
      'ADMIN',
      NULL,
      'ACTIVE',
      TRUE,
      TRUE,
      'Admin test account for development - admin10@nynus.edu.vn',
      '0901234510',
      'NyNus Exam Bank System',
      5,
      NOW(),
      '192.168.1.1',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Successfully created admin10@nynus.edu.vn account';
  END IF;
END $$;

COMMIT;

-- Verify account was created
\echo '';
\echo '========================================';
\echo 'Verification';
\echo '========================================';
\echo '';

SELECT 
  id,
  email,
  first_name,
  last_name,
  username,
  role,
  status,
  is_active,
  email_verified,
  created_at
FROM users
WHERE email = 'admin10@nynus.edu.vn';

\echo '';
\echo '========================================';
\echo '✅ SUCCESS: Account Ready';
\echo '========================================';
\echo '';
\echo 'Login credentials:';
\echo '  Email: admin10@nynus.edu.vn';
\echo '  Password: Abd8stbcs!';
\echo '';
\echo 'Test login at: http://localhost:3000/login';
\echo '';

