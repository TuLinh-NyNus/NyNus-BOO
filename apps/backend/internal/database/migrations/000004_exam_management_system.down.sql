-- ===================================================================
-- ROLLBACK: 000004_exam_management_system
-- PURPOSE: Remove complete Exam Management System
-- DATE: 2025-09-22
-- ===================================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS update_exam_total_points ON exam_questions;
DROP TRIGGER IF EXISTS update_exams_updated_at ON exams;

-- Drop functions
DROP FUNCTION IF EXISTS calculate_exam_total_points();

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS exam_feedback CASCADE;
DROP TABLE IF EXISTS exam_results CASCADE;
DROP TABLE IF EXISTS exam_answers CASCADE;
DROP TABLE IF EXISTS exam_attempts CASCADE;
DROP TABLE IF EXISTS exam_questions CASCADE;
DROP TABLE IF EXISTS exams CASCADE;

-- Drop enums
DROP TYPE IF EXISTS difficulty_unified;
DROP TYPE IF EXISTS attempt_status;
DROP TYPE IF EXISTS exam_type;
DROP TYPE IF EXISTS exam_status;

SELECT 'Exam Management System rollback completed!' as message;
