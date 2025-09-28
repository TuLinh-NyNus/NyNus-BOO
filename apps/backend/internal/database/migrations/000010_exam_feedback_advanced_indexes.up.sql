-- ===================================================================
-- MIGRATION: 000010_exam_feedback_advanced_indexes
-- PURPOSE: Add advanced indexes for exam_feedback table performance optimization
-- BASED ON: ExamSystem.md specification requirements
-- DATE: 2025-09-27
-- ===================================================================

-- ========================================
-- PART 1: ADVANCED EXAM_FEEDBACK INDEXES
-- ========================================

-- Attempt-based queries (with NULL filtering)
CREATE INDEX IF NOT EXISTS idx_exam_feedback_attempt_id 
    ON exam_feedback(attempt_id) 
    WHERE attempt_id IS NOT NULL;

-- Rating analysis indexes (with NULL filtering)
CREATE INDEX IF NOT EXISTS idx_exam_feedback_rating 
    ON exam_feedback(exam_id, rating) 
    WHERE rating IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_exam_feedback_difficulty 
    ON exam_feedback(exam_id, difficulty_rating) 
    WHERE difficulty_rating IS NOT NULL;

-- Time-based queries (DESC for recent-first ordering)
CREATE INDEX IF NOT EXISTS idx_exam_feedback_created_at 
    ON exam_feedback(created_at DESC);

-- Full-text search on feedback content (GIN index for text search)
CREATE INDEX IF NOT EXISTS idx_exam_feedback_content_gin 
    ON exam_feedback USING gin(to_tsvector('english', content))
    WHERE content IS NOT NULL;

-- ========================================
-- PART 2: COMPOSITE INDEXES FOR ANALYTICS
-- ========================================

-- User feedback history (for user analytics)
CREATE INDEX IF NOT EXISTS idx_exam_feedback_user_created 
    ON exam_feedback(user_id, created_at DESC);

-- Exam feedback summary (for exam analytics)
CREATE INDEX IF NOT EXISTS idx_exam_feedback_exam_rating_created 
    ON exam_feedback(exam_id, rating, created_at DESC) 
    WHERE rating IS NOT NULL;

-- ========================================
-- PART 3: PERFORMANCE COMMENTS
-- ========================================

COMMENT ON INDEX idx_exam_feedback_attempt_id IS 'Fast lookup of feedback by exam attempt';
COMMENT ON INDEX idx_exam_feedback_rating IS 'Efficient rating analysis per exam';
COMMENT ON INDEX idx_exam_feedback_difficulty IS 'Difficulty rating analysis per exam';
COMMENT ON INDEX idx_exam_feedback_created_at IS 'Time-based feedback queries (recent first)';
COMMENT ON INDEX idx_exam_feedback_content_gin IS 'Full-text search on feedback content';
COMMENT ON INDEX idx_exam_feedback_user_created IS 'User feedback history queries';
COMMENT ON INDEX idx_exam_feedback_exam_rating_created IS 'Exam analytics with rating and time';

-- ========================================
-- PART 4: VALIDATION
-- ========================================

-- Verify all indexes were created successfully
DO $$
BEGIN
    -- Check if all expected indexes exist
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_exam_feedback_attempt_id') THEN
        RAISE EXCEPTION 'Failed to create idx_exam_feedback_attempt_id';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_exam_feedback_rating') THEN
        RAISE EXCEPTION 'Failed to create idx_exam_feedback_rating';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_exam_feedback_difficulty') THEN
        RAISE EXCEPTION 'Failed to create idx_exam_feedback_difficulty';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_exam_feedback_created_at') THEN
        RAISE EXCEPTION 'Failed to create idx_exam_feedback_created_at';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_exam_feedback_content_gin') THEN
        RAISE EXCEPTION 'Failed to create idx_exam_feedback_content_gin';
    END IF;
    
    RAISE NOTICE 'All exam_feedback advanced indexes created successfully!';
END $$;

-- Success message
SELECT 'Migration 000010: exam_feedback advanced indexes completed successfully!' as message;
