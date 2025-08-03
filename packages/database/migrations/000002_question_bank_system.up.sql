-- Advanced Question Bank System Migration
-- This migration transforms the simple exam system into a comprehensive question bank

-- 1️⃣ Create Enums
CREATE TYPE CodeFormat AS ENUM ('ID5', 'ID6');
CREATE TYPE QuestionType AS ENUM ('MC', 'TF', 'SA', 'ES', 'MA');
CREATE TYPE QuestionStatus AS ENUM ('ACTIVE', 'PENDING', 'INACTIVE', 'ARCHIVED');
CREATE TYPE ImageType AS ENUM ('QUESTION', 'SOLUTION');
CREATE TYPE ImageStatus AS ENUM ('PENDING', 'UPLOADING', 'UPLOADED', 'FAILED');
CREATE TYPE FeedbackType AS ENUM ('LIKE', 'DISLIKE', 'REPORT', 'SUGGESTION');
CREATE TYPE QuestionDifficulty AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- 2️⃣ QuestionCode Table
CREATE TABLE QuestionCode (
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

-- Indexes for QuestionCode
CREATE INDEX idx_questioncode_grade ON QuestionCode(grade);
CREATE INDEX idx_questioncode_grade_subject ON QuestionCode(grade, subject);
CREATE INDEX idx_questioncode_grade_subject_chapter ON QuestionCode(grade, subject, chapter);
CREATE INDEX idx_questioncode_grade_level ON QuestionCode(grade, level);
CREATE INDEX idx_questioncode_grade_subject_level ON QuestionCode(grade, subject, level);
CREATE INDEX idx_questioncode_full_filter ON QuestionCode(grade, subject, chapter, level);

-- 3️⃣ Drop old questions table and create new Question table
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS exam_questions CASCADE;
DROP TABLE IF EXISTS user_answers CASCADE;
DROP TABLE IF EXISTS exam_attempts CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS questions CASCADE;

CREATE TABLE Question (
    id             TEXT PRIMARY KEY,
    rawContent     TEXT NOT NULL,
    content        TEXT NOT NULL,
    subcount       VARCHAR(10),
    type           QuestionType NOT NULL,
    source         TEXT,

    answers        JSONB,
    correctAnswer  JSONB,
    solution       TEXT,

    tag            TEXT[] DEFAULT '{}',
    usageCount     INT DEFAULT 0,
    creator        TEXT DEFAULT 'ADMIN',
    status         QuestionStatus DEFAULT 'ACTIVE',
    feedback       INT DEFAULT 0,

    difficulty     QuestionDifficulty DEFAULT 'MEDIUM',

    created_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    questionCodeId VARCHAR(7) NOT NULL REFERENCES QuestionCode(code) ON DELETE RESTRICT
);

-- Indexes for Question
CREATE INDEX idx_question_questionCodeId ON Question(questionCodeId);
CREATE INDEX idx_question_type ON Question(type);
CREATE INDEX idx_question_status ON Question(status);
CREATE INDEX idx_question_usageCount ON Question(usageCount);
CREATE INDEX idx_question_creator ON Question(creator);
CREATE INDEX idx_question_difficulty ON Question(difficulty);
CREATE INDEX idx_question_content_fts ON Question USING GIN (to_tsvector('simple', content));

-- 4️⃣ QuestionImage Table
CREATE TABLE QuestionImage (
    id           TEXT PRIMARY KEY,
    questionId   TEXT NOT NULL REFERENCES Question(id) ON DELETE CASCADE,
    imageType    ImageType NOT NULL,
    imagePath    TEXT,
    driveUrl     TEXT,
    driveFileId  VARCHAR(100),
    status       ImageStatus DEFAULT 'PENDING',
    created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for QuestionImage
CREATE INDEX idx_questionimage_questionId ON QuestionImage(questionId);
CREATE INDEX idx_questionimage_status ON QuestionImage(status);

-- 5️⃣ QuestionTag Table
CREATE TABLE QuestionTag (
    id          TEXT PRIMARY KEY,
    questionId  TEXT NOT NULL REFERENCES Question(id) ON DELETE CASCADE,
    tagName     VARCHAR(100) NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (questionId, tagName)
);

-- Indexes for QuestionTag
CREATE INDEX idx_questiontag_tagName ON QuestionTag(tagName);

-- 6️⃣ QuestionFeedback Table
CREATE TABLE QuestionFeedback (
    id           TEXT PRIMARY KEY,
    questionId   TEXT NOT NULL REFERENCES Question(id) ON DELETE CASCADE,
    userId       TEXT,
    feedbackType FeedbackType NOT NULL,
    content      TEXT,
    rating       INT,
    created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for QuestionFeedback
CREATE INDEX idx_questionfeedback_questionId ON QuestionFeedback(questionId);
CREATE INDEX idx_questionfeedback_userId ON QuestionFeedback(userId);

-- 7️⃣ Create triggers for updated_at
CREATE TRIGGER update_questioncode_updated_at BEFORE UPDATE ON QuestionCode FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_question_updated_at BEFORE UPDATE ON Question FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questionimage_updated_at BEFORE UPDATE ON QuestionImage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8️⃣ Insert sample QuestionCode data
INSERT INTO QuestionCode (code, format, grade, subject, chapter, lesson, form, level) VALUES
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

-- Success message
SELECT 'Advanced Question Bank System schema created successfully!' as message;
