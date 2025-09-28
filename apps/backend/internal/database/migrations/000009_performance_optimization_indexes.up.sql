-- ========================================
-- MIGRATION 000009: Performance Optimization Indexes
-- Purpose: Add missing performance-critical indexes for exam system
-- Date: 2025-01-19
-- ========================================

-- ========================================
-- PART 1: EXAM PERFORMANCE INDEXES
-- ========================================

-- Critical composite indexes for exam queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exams_status_published_at 
ON exams(status, published_at DESC) 
WHERE status = 'published';

-- Full text search index for exam content
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exams_fulltext 
ON exams USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Academic filtering performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exams_subject_grade_difficulty 
ON exams(subject, grade, difficulty) 
WHERE status = 'published';

-- ========================================
-- PART 2: EXAM ATTEMPTS PERFORMANCE INDEXES
-- ========================================

-- Critical user-exam relationship index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_attempts_user_exam 
ON exam_attempts(user_id, exam_id);

-- Performance analytics indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_attempts_exam_score 
ON exam_attempts(exam_id, score DESC) 
WHERE score IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_attempts_user_performance 
ON exam_attempts(user_id, percentage DESC) 
WHERE percentage IS NOT NULL;

-- Status-based filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_attempts_status_started_at 
ON exam_attempts(status, started_at DESC);

-- ========================================
-- PART 3: EXAM ANSWERS PERFORMANCE INDEXES
-- ========================================

-- Critical answer lookup and scoring
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_answers_attempt_correct 
ON exam_answers(attempt_id, is_correct);

-- Points and performance analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_answers_points_earned 
ON exam_answers(attempt_id, points_earned) 
WHERE points_earned > 0;

-- Time-based analysis for performance monitoring
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_answers_attempt_time 
ON exam_answers(attempt_id, answered_at);

-- JSONB answer data search for complex queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_answers_data_gin 
ON exam_answers USING gin(answer_data);

-- ========================================
-- PART 4: EXAM QUESTIONS PERFORMANCE INDEXES
-- ========================================

-- Question ordering and scoring optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_questions_exam_order 
ON exam_questions(exam_id, order_number);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_questions_points 
ON exam_questions(exam_id, points DESC);

-- Bonus questions filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_questions_bonus 
ON exam_questions(exam_id, is_bonus) 
WHERE is_bonus = true;

-- ========================================
-- PART 5: EXAM RESULTS PERFORMANCE INDEXES
-- ========================================

-- Results analysis and ranking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_results_accuracy 
ON exam_results(accuracy_percentage DESC) 
WHERE accuracy_percentage IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_results_correct_answers 
ON exam_results(correct_answers DESC);

-- Grade-based filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_results_grade 
ON exam_results(grade) 
WHERE grade IS NOT NULL;

-- Time performance analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_results_avg_time 
ON exam_results(avg_time_per_question) 
WHERE avg_time_per_question IS NOT NULL;

-- ========================================
-- PART 6: EXAM FEEDBACK PERFORMANCE INDEXES
-- ========================================

-- Feedback analysis and rating
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_feedback_rating 
ON exam_feedback(exam_id, rating) 
WHERE rating IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_feedback_difficulty 
ON exam_feedback(exam_id, difficulty_rating) 
WHERE difficulty_rating IS NOT NULL;

-- ========================================
-- PART 7: CONNECTION POOLING OPTIMIZATION
-- ========================================

-- Set optimal connection pool settings for exam system
-- These will be applied at application level, documented here for reference

-- Recommended settings:
-- max_connections = 100
-- shared_buffers = 256MB
-- effective_cache_size = 1GB
-- work_mem = 4MB
-- maintenance_work_mem = 64MB
-- checkpoint_completion_target = 0.9
-- wal_buffers = 16MB
-- default_statistics_target = 100

-- ========================================
-- PART 8: QUERY PERFORMANCE MONITORING
-- ========================================

-- Enable pg_stat_statements for query performance monitoring
-- This should be done at PostgreSQL configuration level
-- shared_preload_libraries = 'pg_stat_statements'
-- pg_stat_statements.track = all

-- Create view for monitoring slow queries
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE calls > 10
ORDER BY mean_time DESC;

-- ========================================
-- PART 9: INDEX USAGE MONITORING
-- ========================================

-- Create view for monitoring index usage
CREATE OR REPLACE VIEW index_usage AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    CASE 
        WHEN idx_scan = 0 THEN 'UNUSED'
        WHEN idx_scan < 10 THEN 'LOW_USAGE'
        ELSE 'ACTIVE'
    END as usage_status
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- Log completion
INSERT INTO migration_log (version, description, applied_at) 
VALUES ('000009', 'Performance optimization indexes for exam system', NOW())
ON CONFLICT (version) DO NOTHING;
