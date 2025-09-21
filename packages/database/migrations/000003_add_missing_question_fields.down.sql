-- Rollback Missing Question Fields Migration

-- 1️⃣ Drop indexes for classification fields
DROP INDEX IF EXISTS idx_question_grade_subject_chapter_level;
DROP INDEX IF EXISTS idx_question_grade_subject_level;
DROP INDEX IF EXISTS idx_question_grade_level;
DROP INDEX IF EXISTS idx_question_grade_subject_chapter;
DROP INDEX IF EXISTS idx_question_grade_subject;
DROP INDEX IF EXISTS idx_question_level;
DROP INDEX IF EXISTS idx_question_chapter;
DROP INDEX IF EXISTS idx_question_subject;
DROP INDEX IF EXISTS idx_question_grade;

-- 2️⃣ Remove optional classification fields from Question table
ALTER TABLE Question 
DROP COLUMN IF EXISTS grade,
DROP COLUMN IF EXISTS subject,
DROP COLUMN IF EXISTS chapter,
DROP COLUMN IF EXISTS level;

-- Note: PostgreSQL doesn't support dropping enum values directly
-- The EXPERT and MA enum values will remain but unused

SELECT 'Missing Question fields rollback completed!' as message;