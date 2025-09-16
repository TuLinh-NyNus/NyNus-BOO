-- Migration to rename tables to snake_case convention
-- This ensures consistency between entity definitions and database schema
-- Columns are already in snake_case, only need to rename tables

-- 1️⃣ Drop existing foreign key constraints first
ALTER TABLE question DROP CONSTRAINT IF EXISTS question_questioncodeid_fkey;
ALTER TABLE question DROP CONSTRAINT IF EXISTS question_question_code_id_fkey;
ALTER TABLE questionimage DROP CONSTRAINT IF EXISTS questionimage_questionid_fkey;
ALTER TABLE questiontag DROP CONSTRAINT IF EXISTS questiontag_questionid_fkey;
ALTER TABLE questionfeedback DROP CONSTRAINT IF EXISTS questionfeedback_questionid_fkey;

-- 2️⃣ Rename Tables to snake_case (only if they haven't been renamed yet)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'questioncode' AND schemaname = 'public') THEN
        ALTER TABLE questioncode RENAME TO question_code;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'questionimage' AND schemaname = 'public') THEN
        ALTER TABLE questionimage RENAME TO question_image;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'questiontag' AND schemaname = 'public') THEN
        ALTER TABLE questiontag RENAME TO question_tag;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'questionfeedback' AND schemaname = 'public') THEN
        ALTER TABLE questionfeedback RENAME TO question_feedback;
    END IF;
END $$;

-- 3️⃣ Recreate foreign key constraints with correct references (only if not exists)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'question_question_code_id_fkey') THEN
        ALTER TABLE question
            ADD CONSTRAINT question_question_code_id_fkey
            FOREIGN KEY (question_code_id) REFERENCES question_code(code) ON DELETE RESTRICT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'question_image_question_id_fkey') THEN
        ALTER TABLE question_image
            ADD CONSTRAINT question_image_question_id_fkey
            FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'question_tag_question_id_fkey') THEN
        ALTER TABLE question_tag
            ADD CONSTRAINT question_tag_question_id_fkey
            FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'question_feedback_question_id_fkey') THEN
        ALTER TABLE question_feedback
            ADD CONSTRAINT question_feedback_question_id_fkey
            FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE;
    END IF;
END $$;

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
