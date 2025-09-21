-- Rollback migration: 000006_exam_system
-- Description: Drop tables and types for exam management system

-- Drop triggers first
DROP TRIGGER IF EXISTS update_exam_total_points ON exam_questions;
DROP FUNCTION IF EXISTS calculate_exam_total_points();

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS exam_feedback CASCADE;
DROP TABLE IF EXISTS exam_results CASCADE;
DROP TABLE IF EXISTS exam_answers CASCADE;
DROP TABLE IF EXISTS exam_attempts CASCADE;
DROP TABLE IF EXISTS exam_questions CASCADE;
DROP TABLE IF EXISTS exams CASCADE;

-- Drop enum types
DROP TYPE IF EXISTS attempt_status;
DROP TYPE IF EXISTS exam_type;
DROP TYPE IF EXISTS exam_status;