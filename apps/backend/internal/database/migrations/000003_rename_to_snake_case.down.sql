-- Rollback migration: Revert snake_case back to original naming
-- This reverts the changes made in 000003_rename_to_snake_case.up.sql

-- 1️⃣ Drop new foreign key constraints
ALTER TABLE question DROP CONSTRAINT IF EXISTS question_question_code_id_fkey;
ALTER TABLE question_image DROP CONSTRAINT IF EXISTS question_image_question_id_fkey;
ALTER TABLE question_tag DROP CONSTRAINT IF EXISTS question_tag_question_id_fkey;
ALTER TABLE question_feedback DROP CONSTRAINT IF EXISTS question_feedback_question_id_fkey;

-- 2️⃣ Rename Question table columns back to original
ALTER TABLE question RENAME COLUMN raw_content TO rawcontent;
ALTER TABLE question RENAME COLUMN correct_answer TO correctanswer;
ALTER TABLE question RENAME COLUMN usage_count TO usagecount;
ALTER TABLE question RENAME COLUMN question_code_id TO questioncodeid;

-- 3️⃣ Rename Tables back to original
ALTER TABLE question_code RENAME TO questioncode;
ALTER TABLE question_image RENAME TO questionimage;
ALTER TABLE question_tag RENAME TO questiontag;
ALTER TABLE question_feedback RENAME TO questionfeedback;

-- 4️⃣ Recreate original foreign key constraints
ALTER TABLE question 
    ADD CONSTRAINT question_questioncodeid_fkey 
    FOREIGN KEY (questioncodeid) REFERENCES questioncode(code) ON DELETE RESTRICT;

ALTER TABLE questionimage 
    ADD CONSTRAINT questionimage_questionid_fkey 
    FOREIGN KEY (questionid) REFERENCES question(id) ON DELETE CASCADE;

ALTER TABLE questiontag 
    ADD CONSTRAINT questiontag_questionid_fkey 
    FOREIGN KEY (questionid) REFERENCES question(id) ON DELETE CASCADE;

ALTER TABLE questionfeedback 
    ADD CONSTRAINT questionfeedback_questionid_fkey 
    FOREIGN KEY (questionid) REFERENCES question(id) ON DELETE CASCADE;

-- 5️⃣ Drop new indexes
DROP INDEX IF EXISTS idx_question_question_code_id;
DROP INDEX IF EXISTS idx_question_usage_count;
DROP INDEX IF EXISTS idx_question_tag_tag_name;

-- 6️⃣ Recreate original indexes
CREATE INDEX idx_question_questioncodeid ON question(questioncodeid);
CREATE INDEX idx_question_usagecount ON question(usagecount);
CREATE INDEX idx_questiontag_tag_name ON questiontag(tag_name);

-- 7️⃣ Remove comments
COMMENT ON TABLE questioncode IS NULL;
COMMENT ON TABLE question IS NULL;
COMMENT ON TABLE questionimage IS NULL;
COMMENT ON TABLE questiontag IS NULL;
COMMENT ON TABLE questionfeedback IS NULL;

COMMENT ON COLUMN question.rawcontent IS NULL;
COMMENT ON COLUMN question.correctanswer IS NULL;
COMMENT ON COLUMN question.usagecount IS NULL;
COMMENT ON COLUMN question.questioncodeid IS NULL;
