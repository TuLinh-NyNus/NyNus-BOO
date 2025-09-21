-- Create Supporting Tables Migration
-- This migration creates QuestionImage, QuestionTag, and QuestionFeedback tables

-- 1️⃣ Create ImageType and ImageStatus enums (if not exists)
DO $$ BEGIN
    CREATE TYPE ImageType AS ENUM ('QUESTION', 'SOLUTION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ImageStatus AS ENUM ('PENDING', 'UPLOADING', 'UPLOADED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE FeedbackType AS ENUM ('LIKE', 'DISLIKE', 'REPORT', 'SUGGESTION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2️⃣ QuestionImage Table
CREATE TABLE QuestionImage (
    id              TEXT PRIMARY KEY,
    question_id     TEXT NOT NULL REFERENCES Question(id) ON DELETE CASCADE,
    image_type      ImageType NOT NULL,
    image_path      TEXT,                        -- Local path (temporary)
    drive_url       TEXT,                        -- Google Drive URL
    drive_file_id   VARCHAR(100),                -- Google Drive file ID
    status          ImageStatus DEFAULT 'PENDING',
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for QuestionImage
CREATE INDEX idx_questionimage_question_id ON QuestionImage(question_id);
CREATE INDEX idx_questionimage_status ON QuestionImage(status);
CREATE INDEX idx_questionimage_image_type ON QuestionImage(image_type);
CREATE INDEX idx_questionimage_drive_file_id ON QuestionImage(drive_file_id) WHERE drive_file_id IS NOT NULL;

-- 3️⃣ QuestionTag Table (separate from array field)
CREATE TABLE QuestionTag (
    id           TEXT PRIMARY KEY,
    question_id  TEXT NOT NULL REFERENCES Question(id) ON DELETE CASCADE,
    tag_name     VARCHAR(100) NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (question_id, tag_name)
);

-- Indexes for QuestionTag
CREATE INDEX idx_questiontag_question_id ON QuestionTag(question_id);
CREATE INDEX idx_questiontag_tag_name ON QuestionTag(tag_name);
CREATE INDEX idx_questiontag_tag_name_lower ON QuestionTag(LOWER(tag_name)); -- For case-insensitive search

-- 4️⃣ QuestionFeedback Table
CREATE TABLE QuestionFeedback (
    id             TEXT PRIMARY KEY,
    question_id    TEXT NOT NULL REFERENCES Question(id) ON DELETE CASCADE,
    user_id        TEXT,                        -- Tùy chọn, có thể null cho anonymous feedback
    feedback_type  FeedbackType NOT NULL,
    content        TEXT,                        -- Nội dung feedback text
    rating         INT CHECK (rating >= 1 AND rating <= 5), -- 1-5 sao
    created_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for QuestionFeedback
CREATE INDEX idx_questionfeedback_question_id ON QuestionFeedback(question_id);
CREATE INDEX idx_questionfeedback_user_id ON QuestionFeedback(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_questionfeedback_feedback_type ON QuestionFeedback(feedback_type);
CREATE INDEX idx_questionfeedback_rating ON QuestionFeedback(rating) WHERE rating IS NOT NULL;
CREATE INDEX idx_questionfeedback_created_at ON QuestionFeedback(created_at);

-- 5️⃣ Create triggers for updated_at
CREATE TRIGGER update_questionimage_updated_at 
    BEFORE UPDATE ON QuestionImage 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6️⃣ Add helpful views for statistics
CREATE VIEW question_stats AS
SELECT 
    q.id,
    q.content,
    q.type,
    q.status,
    q.difficulty,
    COUNT(DISTINCT qi.id) as image_count,
    COUNT(DISTINCT qt.id) as tag_count,
    COUNT(DISTINCT qf.id) as feedback_count,
    AVG(qf.rating) as average_rating,
    q.usage_count,
    q.created_at,
    q.updated_at
FROM Question q
LEFT JOIN QuestionImage qi ON q.id = qi.question_id
LEFT JOIN QuestionTag qt ON q.id = qt.question_id  
LEFT JOIN QuestionFeedback qf ON q.id = qf.question_id
GROUP BY q.id, q.content, q.type, q.status, q.difficulty, q.usage_count, q.created_at, q.updated_at;

-- Success message
SELECT 'Supporting tables (QuestionImage, QuestionTag, QuestionFeedback) created successfully!' as message;