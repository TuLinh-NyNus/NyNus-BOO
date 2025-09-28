-- ========================================
-- MIGRATION 000009 ROLLBACK: Performance Optimization Indexes
-- Purpose: Remove performance optimization indexes
-- Date: 2025-01-19
-- ========================================

-- ========================================
-- PART 1: DROP MONITORING VIEWS
-- ========================================

DROP VIEW IF EXISTS index_usage;
DROP VIEW IF EXISTS slow_queries;

-- ========================================
-- PART 2: DROP EXAM FEEDBACK INDEXES
-- ========================================

DROP INDEX CONCURRENTLY IF EXISTS idx_exam_feedback_difficulty;
DROP INDEX CONCURRENTLY IF EXISTS idx_exam_feedback_rating;

-- ========================================
-- PART 3: DROP EXAM RESULTS INDEXES
-- ========================================

DROP INDEX CONCURRENTLY IF EXISTS idx_exam_results_avg_time;
DROP INDEX CONCURRENTLY IF EXISTS idx_exam_results_grade;
DROP INDEX CONCURRENTLY IF EXISTS idx_exam_results_correct_answers;
DROP INDEX CONCURRENTLY IF EXISTS idx_exam_results_accuracy;

-- ========================================
-- PART 4: DROP EXAM QUESTIONS INDEXES
-- ========================================

DROP INDEX CONCURRENTLY IF EXISTS idx_exam_questions_bonus;
DROP INDEX CONCURRENTLY IF EXISTS idx_exam_questions_points;
DROP INDEX CONCURRENTLY IF EXISTS idx_exam_questions_exam_order;

-- ========================================
-- PART 5: DROP EXAM ANSWERS INDEXES
-- ========================================

DROP INDEX CONCURRENTLY IF EXISTS idx_exam_answers_data_gin;
DROP INDEX CONCURRENTLY IF EXISTS idx_exam_answers_attempt_time;
DROP INDEX CONCURRENTLY IF EXISTS idx_exam_answers_points_earned;
DROP INDEX CONCURRENTLY IF EXISTS idx_exam_answers_attempt_correct;

-- ========================================
-- PART 6: DROP EXAM ATTEMPTS INDEXES
-- ========================================

DROP INDEX CONCURRENTLY IF EXISTS idx_exam_attempts_status_started_at;
DROP INDEX CONCURRENTLY IF EXISTS idx_exam_attempts_user_performance;
DROP INDEX CONCURRENTLY IF EXISTS idx_exam_attempts_exam_score;
DROP INDEX CONCURRENTLY IF EXISTS idx_exam_attempts_user_exam;

-- ========================================
-- PART 7: DROP EXAM INDEXES
-- ========================================

DROP INDEX CONCURRENTLY IF EXISTS idx_exams_subject_grade_difficulty;
DROP INDEX CONCURRENTLY IF EXISTS idx_exams_fulltext;
DROP INDEX CONCURRENTLY IF EXISTS idx_exams_status_published_at;

-- ========================================
-- ROLLBACK COMPLETE
-- ========================================

-- Remove from migration log
DELETE FROM migration_log WHERE version = '000009';
