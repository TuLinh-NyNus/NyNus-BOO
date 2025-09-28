-- ===================================================================
-- ROLLBACK: 000011_exam_security
-- PURPOSE: Remove exam security and anti-cheating infrastructure
-- DATE: 2025-01-19
-- ===================================================================

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_update_security_score ON exam_security_events;
DROP TRIGGER IF EXISTS trigger_create_exam_security_config ON exams;

-- Drop functions
DROP FUNCTION IF EXISTS update_attempt_security_score();
DROP FUNCTION IF EXISTS calculate_security_score(VARCHAR);
DROP FUNCTION IF EXISTS cleanup_old_security_events();
DROP FUNCTION IF EXISTS create_default_exam_security_config();

-- Remove security-related columns from exam_attempts
ALTER TABLE exam_attempts DROP COLUMN IF EXISTS flag_reason;
ALTER TABLE exam_attempts DROP COLUMN IF EXISTS is_flagged;
ALTER TABLE exam_attempts DROP COLUMN IF EXISTS security_violations;
ALTER TABLE exam_attempts DROP COLUMN IF EXISTS security_score;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS exam_security_config CASCADE;
DROP TABLE IF EXISTS exam_rate_limits CASCADE;
DROP TABLE IF EXISTS exam_activity_log CASCADE;
DROP TABLE IF EXISTS exam_browser_info CASCADE;
DROP TABLE IF EXISTS exam_security_events CASCADE;
DROP TABLE IF EXISTS exam_sessions CASCADE;
