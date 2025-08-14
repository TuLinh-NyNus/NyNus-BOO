-- Migration to rename tables and columns to snake_case convention
-- This ensures consistency between entity definitions and database schema

-- 1️⃣ Rename Question table columns to snake_case FIRST
ALTER TABLE question RENAME COLUMN rawcontent TO raw_content;
ALTER TABLE question RENAME COLUMN correctanswer TO correct_answer;
ALTER TABLE question RENAME COLUMN usagecount TO usage_count;
ALTER TABLE question RENAME COLUMN questioncodeid TO question_code_id;

-- 2️⃣ Rename QuestionImage table columns to snake_case
ALTER TABLE questionimage RENAME COLUMN questionid TO question_id;
ALTER TABLE questionimage RENAME COLUMN imagetype TO image_type;
ALTER TABLE questionimage RENAME COLUMN imagepath TO image_path;
ALTER TABLE questionimage RENAME COLUMN driveurl TO drive_url;
ALTER TABLE questionimage RENAME COLUMN drivefileid TO drive_file_id;

-- 3️⃣ Rename QuestionTag table columns to snake_case
ALTER TABLE questiontag RENAME COLUMN questionid TO question_id;
ALTER TABLE questiontag RENAME COLUMN tagname TO tag_name;

-- 4️⃣ Rename QuestionFeedback table columns to snake_case
ALTER TABLE questionfeedback RENAME COLUMN questionid TO question_id;
ALTER TABLE questionfeedback RENAME COLUMN userid TO user_id;
ALTER TABLE questionfeedback RENAME COLUMN feedbacktype TO feedback_type;

-- 5️⃣ Update Foreign Key References
-- Drop existing foreign key constraints
ALTER TABLE question DROP CONSTRAINT IF EXISTS question_questioncodeid_fkey;
ALTER TABLE questionimage DROP CONSTRAINT IF EXISTS questionimage_questionid_fkey;
ALTER TABLE questiontag DROP CONSTRAINT IF EXISTS questiontag_questionid_fkey;
ALTER TABLE questionfeedback DROP CONSTRAINT IF EXISTS questionfeedback_questionid_fkey;

-- 6️⃣ Rename Tables to snake_case AFTER column renames
ALTER TABLE questioncode RENAME TO question_code;
ALTER TABLE questionimage RENAME TO question_image;
ALTER TABLE questiontag RENAME TO question_tag;
ALTER TABLE questionfeedback RENAME TO question_feedback;

-- Recreate foreign key constraints with correct references
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

-- 4️⃣ Update Indexes to match new column names
-- Drop old indexes
DROP INDEX IF EXISTS idx_question_questioncodeid;
DROP INDEX IF EXISTS idx_question_usagecount;
DROP INDEX IF EXISTS idx_questiontag_tag_name;

-- Create new indexes with snake_case names
CREATE INDEX idx_question_question_code_id ON question(question_code_id);
CREATE INDEX idx_question_usage_count ON question(usage_count);
CREATE INDEX idx_question_tag_tag_name ON question_tag(tag_name);

-- 5️⃣ Update any existing triggers or functions
-- Update trigger function if it references old column names
-- (The update_updated_at_column function should work with any column name)

-- 6️⃣ Add comments for documentation
COMMENT ON TABLE question_code IS 'Question codes with hierarchical structure (Grade-Subject-Chapter-Level-Lesson-Form)';
COMMENT ON TABLE question IS 'Main questions table with LaTeX content and metadata';
COMMENT ON TABLE question_image IS 'Images associated with questions (diagrams, figures, etc.)';
COMMENT ON TABLE question_tag IS 'Tags for categorizing and searching questions';
COMMENT ON TABLE question_feedback IS 'User feedback and ratings for questions';

COMMENT ON COLUMN question.raw_content IS 'Original LaTeX content with formatting';
COMMENT ON COLUMN question.correct_answer IS 'JSON array of correct answer(s)';
COMMENT ON COLUMN question.usage_count IS 'Number of times question has been used';
COMMENT ON COLUMN question.question_code_id IS 'Reference to question_code table';
