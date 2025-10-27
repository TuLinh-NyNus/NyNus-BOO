-- ===================================================================
-- MIGRATION: 000019_add_favorite_to_questions
-- PURPOSE: Add is_favorite field to question table for favorite functionality
-- DATE: 2025-01-26
-- ===================================================================

-- Add is_favorite column to question table
ALTER TABLE question
ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE NOT NULL;

-- Create index for efficient favorite filtering
CREATE INDEX idx_question_is_favorite 
ON question(is_favorite) 
WHERE is_favorite = TRUE;

-- Add comment
COMMENT ON COLUMN question.is_favorite IS 'Indicates if the question is marked as favorite by admin';

-- Success message
SELECT 'Added is_favorite field to question table successfully!' as message;

