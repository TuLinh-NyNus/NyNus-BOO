-- ===================================================================
-- MIGRATION: 000002_question_bank_system
-- PURPOSE: Complete Question Bank System with all related tables
-- CONSOLIDATES: 000002 + 000003 (both versions) + 000004_supporting_tables
-- DATE: 2025-09-22
-- ===================================================================

-- ========================================
-- PART 1: QUESTION SYSTEM ENUMS
-- ========================================

-- Core Question enums
CREATE TYPE CodeFormat AS ENUM ('ID5', 'ID6');
CREATE TYPE QuestionType AS ENUM ('MC', 'TF', 'SA', 'ES', 'MA'); -- MA added from 000003
CREATE TYPE QuestionStatus AS ENUM ('ACTIVE', 'PENDING', 'INACTIVE', 'ARCHIVED');
CREATE TYPE QuestionDifficulty AS ENUM ('EASY', 'MEDIUM', 'HARD', 'EXPERT'); -- EXPERT added from 000003

-- Supporting table enums
CREATE TYPE ImageType AS ENUM ('QUESTION', 'SOLUTION');
CREATE TYPE ImageStatus AS ENUM ('PENDING', 'UPLOADING', 'UPLOADED', 'FAILED');
CREATE TYPE FeedbackType AS ENUM ('LIKE', 'DISLIKE', 'REPORT', 'SUGGESTION');

-- ========================================
-- PART 2: QUESTION_CODE TABLE
-- ========================================

CREATE TABLE question_code (
    code        VARCHAR(7) PRIMARY KEY,
    format      CodeFormat NOT NULL,
    grade       CHAR(1) NOT NULL,
    subject     CHAR(1) NOT NULL,
    chapter     CHAR(1) NOT NULL,
    lesson      CHAR(1) NOT NULL,
    form        CHAR(1),
    level       CHAR(1) NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for question_code
CREATE INDEX idx_question_code_grade ON question_code(grade);
CREATE INDEX idx_question_code_grade_subject ON question_code(grade, subject);
CREATE INDEX idx_question_code_grade_subject_chapter ON question_code(grade, subject, chapter);
CREATE INDEX idx_question_code_grade_level ON question_code(grade, level);
CREATE INDEX idx_question_code_grade_subject_level ON question_code(grade, subject, level);
CREATE INDEX idx_question_code_full_filter ON question_code(grade, subject, chapter, level);

-- ========================================
-- PART 3: MAIN QUESTION TABLE
-- ========================================

CREATE TABLE question (
    id                TEXT PRIMARY KEY,
    raw_content       TEXT NOT NULL,
    content           TEXT NOT NULL,
    subcount          VARCHAR(10),
    type              QuestionType NOT NULL,
    source            TEXT,

    -- Answer data
    answers           JSONB,
    correct_answer    JSONB,
    solution          TEXT,

    -- Metadata
    tag               TEXT[] DEFAULT '{}',
    usage_count       INT DEFAULT 0,
    creator           TEXT DEFAULT 'ADMIN',
    status            QuestionStatus DEFAULT 'ACTIVE',
    feedback          INT DEFAULT 0,
    difficulty        QuestionDifficulty DEFAULT 'MEDIUM',

    -- Optional classification fields (from 000003_add_missing_question_fields)
    grade             CHAR(1),            -- Lớp (0,1,2) - Optional classification
    subject           CHAR(1),            -- Môn học (P,L,H) - Optional classification  
    chapter           CHAR(1),            -- Chương (1-9) - Optional classification
    level             CHAR(1),            -- Mức độ (N,H,V,C,T,M) - Optional classification

    -- Timestamps
    created_at        TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key
    question_code_id  VARCHAR(7) NOT NULL REFERENCES question_code(code) ON DELETE RESTRICT
);

-- Indexes for question table
CREATE INDEX idx_question_question_code_id ON question(question_code_id);
CREATE INDEX idx_question_type ON question(type);
CREATE INDEX idx_question_status ON question(status);
CREATE INDEX idx_question_usage_count ON question(usage_count);
CREATE INDEX idx_question_creator ON question(creator);
CREATE INDEX idx_question_difficulty ON question(difficulty);
CREATE INDEX idx_question_content_fts ON question USING GIN (to_tsvector('simple', content));

-- Classification field indexes (from 000003)
CREATE INDEX idx_question_grade ON question(grade);
CREATE INDEX idx_question_subject ON question(subject);
CREATE INDEX idx_question_chapter ON question(chapter);  
CREATE INDEX idx_question_level ON question(level);
CREATE INDEX idx_question_grade_subject ON question(grade, subject);
CREATE INDEX idx_question_grade_subject_chapter ON question(grade, subject, chapter);
CREATE INDEX idx_question_grade_level ON question(grade, level);
CREATE INDEX idx_question_grade_subject_level ON question(grade, subject, level);
CREATE INDEX idx_question_grade_subject_chapter_level ON question(grade, subject, chapter, level);

-- ========================================
-- PART 4: QUESTION_IMAGE TABLE
-- ========================================

CREATE TABLE question_image (
    id              TEXT PRIMARY KEY,
    question_id     TEXT NOT NULL REFERENCES question(id) ON DELETE CASCADE,
    image_type      ImageType NOT NULL,
    image_path      TEXT,                        -- Local path (temporary)
    drive_url       TEXT,                        -- Google Drive URL
    drive_file_id   VARCHAR(100),                -- Google Drive file ID
    status          ImageStatus DEFAULT 'PENDING',
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for question_image
CREATE INDEX idx_question_image_question_id ON question_image(question_id);
CREATE INDEX idx_question_image_status ON question_image(status);
CREATE INDEX idx_question_image_image_type ON question_image(image_type);
CREATE INDEX idx_question_image_drive_file_id ON question_image(drive_file_id) WHERE drive_file_id IS NOT NULL;

-- ========================================
-- PART 5: QUESTION_TAG TABLE
-- ========================================

CREATE TABLE question_tag (
    id           TEXT PRIMARY KEY,
    question_id  TEXT NOT NULL REFERENCES question(id) ON DELETE CASCADE,
    tag_name     VARCHAR(100) NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (question_id, tag_name)
);

-- Indexes for question_tag
CREATE INDEX idx_question_tag_question_id ON question_tag(question_id);
CREATE INDEX idx_question_tag_tag_name ON question_tag(tag_name);
CREATE INDEX idx_question_tag_tag_name_lower ON question_tag(LOWER(tag_name)); -- Case-insensitive search

-- ========================================
-- PART 6: QUESTION_FEEDBACK TABLE
-- ========================================

CREATE TABLE question_feedback (
    id             TEXT PRIMARY KEY,
    question_id    TEXT NOT NULL REFERENCES question(id) ON DELETE CASCADE,
    user_id        TEXT,                        -- Optional, can be null for anonymous feedback
    feedback_type  FeedbackType NOT NULL,
    content        TEXT,                        -- Feedback text content
    rating         INT CHECK (rating >= 1 AND rating <= 5), -- 1-5 stars
    created_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for question_feedback
CREATE INDEX idx_question_feedback_question_id ON question_feedback(question_id);
CREATE INDEX idx_question_feedback_user_id ON question_feedback(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_question_feedback_feedback_type ON question_feedback(feedback_type);
CREATE INDEX idx_question_feedback_rating ON question_feedback(rating) WHERE rating IS NOT NULL;
CREATE INDEX idx_question_feedback_created_at ON question_feedback(created_at);

-- ========================================
-- PART 7: TRIGGERS
-- ========================================

-- Update triggers for updated_at columns
CREATE TRIGGER update_question_code_updated_at 
    BEFORE UPDATE ON question_code 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_updated_at 
    BEFORE UPDATE ON question 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_image_updated_at 
    BEFORE UPDATE ON question_image 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- PART 8: SAMPLE DATA
-- ========================================

-- Insert sample question_code data
INSERT INTO question_code (code, format, grade, subject, chapter, lesson, form, level) VALUES
('6M1A1E1', 'ID6', '6', 'M', '1', 'A', '1', 'E'),
('6M1A2M1', 'ID6', '6', 'M', '1', 'A', '2', 'M'),
('6M1A3H1', 'ID6', '6', 'M', '1', 'A', '3', 'H'),
('6E2B1E1', 'ID6', '6', 'E', '2', 'B', '1', 'E'),
('6E2B2M1', 'ID6', '6', 'E', '2', 'B', '2', 'M'),
('7M3C1E1', 'ID6', '7', 'M', '3', 'C', '1', 'E'),
('7M3C2H1', 'ID6', '7', 'M', '3', 'C', '2', 'H'),
('8S4D1M1', 'ID6', '8', 'S', '4', 'D', '1', 'M'),
('8S4D2H1', 'ID6', '8', 'S', '4', 'D', '2', 'H'),
('9P5E1E1', 'ID6', '9', 'P', '5', 'E', '1', 'E')
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- PART 9: HELPFUL VIEWS
-- ========================================

-- Question statistics view
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
FROM question q
LEFT JOIN question_image qi ON q.id = qi.question_id
LEFT JOIN question_tag qt ON q.id = qt.question_id
LEFT JOIN question_feedback qf ON q.id = qf.question_id
GROUP BY q.id, q.content, q.type, q.status, q.difficulty, q.usage_count, q.created_at, q.updated_at;

-- ========================================
-- PART 10: COMMENTS
-- ========================================

COMMENT ON TABLE question_code IS 'Question codes with hierarchical structure (Grade-Subject-Chapter-Level-Lesson-Form)';
COMMENT ON TABLE question IS 'Main questions table with LaTeX content and metadata';
COMMENT ON TABLE question_image IS 'Images associated with questions (diagrams, figures, etc.)';
COMMENT ON TABLE question_tag IS 'Tags for categorizing and searching questions';
COMMENT ON TABLE question_feedback IS 'User feedback and ratings for questions';

COMMENT ON COLUMN question.raw_content IS 'Original LaTeX content with formatting';
COMMENT ON COLUMN question.correct_answer IS 'JSON array of correct answer(s)';
COMMENT ON COLUMN question.usage_count IS 'Number of times question has been used';
COMMENT ON COLUMN question.question_code_id IS 'Reference to question_code table';

-- Success message
SELECT 'Complete Question Bank System created successfully!' as message;
