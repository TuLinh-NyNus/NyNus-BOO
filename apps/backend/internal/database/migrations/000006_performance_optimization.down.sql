-- ===================================================================
-- ROLLBACK: 000006_performance_optimization
-- PURPOSE: Remove performance optimizations
-- DATE: 2025-09-22
-- ===================================================================

-- Drop performance monitoring table
DROP TABLE IF EXISTS query_performance_log CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS cleanup_old_data();
DROP FUNCTION IF EXISTS analyze_exam_difficulty(UUID);
DROP FUNCTION IF EXISTS get_popular_questions(INT);

-- Drop views
DROP VIEW IF EXISTS system_health CASCADE;
DROP VIEW IF EXISTS user_learning_progress CASCADE;
DROP VIEW IF EXISTS exam_statistics CASCADE;
DROP VIEW IF EXISTS question_performance CASCADE;

-- Note: Indexes are automatically dropped when tables are dropped
-- Specialized indexes will be removed with their respective tables

SELECT 'Performance optimization rollback completed!' as message;
