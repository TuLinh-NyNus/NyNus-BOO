-- ===================================================================
-- ROLLBACK MIGRATION: 000019_add_favorite_to_questions
-- PURPOSE: Remove is_favorite field from question table
-- DATE: 2025-01-26
-- ===================================================================

-- Drop index
DROP INDEX IF EXISTS idx_question_is_favorite;

-- Remove is_favorite column
ALTER TABLE question
DROP COLUMN IF EXISTS is_favorite;

-- Success message
SELECT 'Removed is_favorite field from question table successfully!' as message;

