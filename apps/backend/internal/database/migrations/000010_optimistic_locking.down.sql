-- ========================================
-- ROLLBACK OPTIMISTIC LOCKING IMPLEMENTATION
-- Migration: 000010_optimistic_locking.down.sql
-- ========================================

-- Drop performance monitoring functions
DROP FUNCTION IF EXISTS record_connection_pool_stats(INT, INT, INT, INT, DECIMAL(10,4));
DROP FUNCTION IF EXISTS record_performance_metric(VARCHAR(100), DECIMAL(10,4), VARCHAR(20), JSONB);
DROP FUNCTION IF EXISTS process_usage_queue();
DROP FUNCTION IF EXISTS update_question_with_version_check(UUID, INT, TEXT, VARCHAR(20), VARCHAR(20));
DROP FUNCTION IF EXISTS update_exam_with_version_check(UUID, INT, VARCHAR(500), TEXT, INT, INT);

-- Drop performance monitoring tables
DROP TABLE IF EXISTS connection_pool_stats;
DROP TABLE IF EXISTS performance_metrics;
DROP TABLE IF EXISTS question_usage_queue;

-- Drop indexes
DROP INDEX IF EXISTS idx_exam_attempts_id_version;
DROP INDEX IF EXISTS idx_questions_id_version;
DROP INDEX IF EXISTS idx_exams_id_version;

-- Remove version columns
ALTER TABLE exam_attempts DROP COLUMN IF EXISTS version;
ALTER TABLE questions DROP COLUMN IF EXISTS version;
ALTER TABLE exams DROP COLUMN IF EXISTS version;
