-- Migration to rename tables to snake_case convention
-- This ensures consistency between entity definitions and database schema
-- Columns are already in snake_case, only need to rename tables

-- 1️⃣ Drop existing foreign key constraints first
ALTER TABLE question DROP CONSTRAINT IF EXISTS question_questioncodeid_fkey;
ALTER TABLE questionimage DROP CONSTRAINT IF EXISTS questionimage_questionid_fkey;
ALTER TABLE questiontag DROP CONSTRAINT IF EXISTS questiontag_questionid_fkey;
ALTER TABLE questionfeedback DROP CONSTRAINT IF EXISTS questionfeedback_questionid_fkey;

-- 2️⃣ Rename Tables to snake_case
ALTER TABLE questioncode RENAME TO question_code;
ALTER TABLE questionimage RENAME TO question_image;
ALTER TABLE questiontag RENAME TO question_tag;
ALTER TABLE questionfeedback RENAME TO question_feedback;

-- 3️⃣ Recreate foreign key constraints with correct references
ALTER TABLE question
    ADD CONSTRAINT question_question_code_id_fkey
    FOREIGN KEY (question_code_id) REFERENCES question_code(code) ON DELETE RESTRICT;

ALTER TABLE question_image
    ADD CONSTRAINT question_image_question_id_fkey
    FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE;

ALTER TABLE question_tag
    ADD CONSTRAINT question_tag_question_id_fkey
    FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE;

ALTER TABLE question_feedback
    ADD CONSTRAINT question_feedback_question_id_fkey
    FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE;

-- 4️⃣ Update Indexes to match new table names (indexes should already exist with correct column names)
-- No need to recreate indexes as they are automatically renamed with tables

-- 5️⃣ Add comments for documentation
COMMENT ON TABLE question_code IS 'Question codes with hierarchical structure (Grade-Subject-Chapter-Level-Lesson-Form)';
COMMENT ON TABLE question IS 'Main questions table with LaTeX content and metadata';
COMMENT ON TABLE question_image IS 'Images associated with questions (diagrams, figures, etc.)';
COMMENT ON TABLE question_tag IS 'Tags for categorizing and searching questions';
COMMENT ON TABLE question_feedback IS 'User feedback and ratings for questions';

COMMENT ON COLUMN question.raw_content IS 'Original LaTeX content with formatting';
COMMENT ON COLUMN question.correct_answer IS 'JSON array of correct answer(s)';
COMMENT ON COLUMN question.usage_count IS 'Number of times question has been used';
COMMENT ON COLUMN question.question_code_id IS 'Reference to question_code table';
