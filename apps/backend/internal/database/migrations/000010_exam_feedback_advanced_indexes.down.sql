-- ===================================================================
-- MIGRATION ROLLBACK: 000010_exam_feedback_advanced_indexes
-- PURPOSE: Remove advanced indexes for exam_feedback table
-- DATE: 2025-09-27
-- ===================================================================

-- ========================================
-- PART 1: DROP ADVANCED INDEXES
-- ========================================

-- Drop composite analytics indexes first
DROP INDEX IF EXISTS idx_exam_feedback_exam_rating_created;
DROP INDEX IF EXISTS idx_exam_feedback_user_created;

-- Drop single-column advanced indexes
DROP INDEX IF EXISTS idx_exam_feedback_content_gin;
DROP INDEX IF EXISTS idx_exam_feedback_created_at;
DROP INDEX IF EXISTS idx_exam_feedback_difficulty;
DROP INDEX IF EXISTS idx_exam_feedback_rating;
DROP INDEX IF EXISTS idx_exam_feedback_attempt_id;

-- Success message
SELECT 'Migration 000010 rollback: exam_feedback advanced indexes removed successfully!' as message;
