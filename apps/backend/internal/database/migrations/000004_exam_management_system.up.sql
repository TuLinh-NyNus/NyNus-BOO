-- ===================================================================
-- MIGRATION: 000004_exam_management_system
-- PURPOSE: Complete Exam Management System with all fixes applied
-- CONSOLIDATES: 000009 + 000013-000018 (all enum fixes and field corrections)
-- DATE: 2025-09-22
-- ===================================================================

-- ========================================
-- PART 1: EXAM SYSTEM ENUMS (CORRECTED)
-- ========================================

-- Exam status enum (UPPERCASE, aligned with Question system)
CREATE TYPE exam_status AS ENUM ('ACTIVE', 'PENDING', 'INACTIVE', 'ARCHIVED');

-- Exam type enum (lowercase, aligned with ExamSystem.md design)
-- Design specifies: 'generated' (from question bank), 'official' (real exams from schools)
CREATE TYPE exam_type AS ENUM ('generated', 'official');

-- Attempt status enum
CREATE TYPE attempt_status AS ENUM ('in_progress', 'submitted', 'graded', 'cancelled');

-- Unified difficulty enum (matches Question system)
CREATE TYPE difficulty_unified AS ENUM ('EASY', 'MEDIUM', 'HARD', 'EXPERT');

-- ========================================
-- PART 2: EXAMS TABLE (COMPLETE & CORRECTED)
-- ========================================

CREATE TABLE exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    instructions TEXT,
    duration_minutes INT NOT NULL DEFAULT 60,
    total_points INT DEFAULT 0,
    pass_percentage INT DEFAULT 60 CHECK (pass_percentage >= 0 AND pass_percentage <= 100),
    exam_type exam_type DEFAULT 'generated',
    status exam_status DEFAULT 'PENDING',
    
    -- Settings
    shuffle_questions BOOLEAN DEFAULT false,
    shuffle_answers BOOLEAN DEFAULT false,
    show_results BOOLEAN DEFAULT true,
    show_answers BOOLEAN DEFAULT false,
    allow_review BOOLEAN DEFAULT true,
    max_attempts INT DEFAULT 1,
    
    -- Metadata (CORRECTED TYPES)
    tags TEXT[],
    grade INT CHECK (grade IS NULL OR (grade >= 1 AND grade <= 12)), -- INT type, 1-12 range
    subject VARCHAR(50),
    chapter VARCHAR(50),
    difficulty difficulty_unified DEFAULT 'MEDIUM', -- Enum type, not VARCHAR
    
    -- Official exam fields (from 000015)
    is_official BOOLEAN DEFAULT false,
    exam_year INT,
    exam_season VARCHAR(20), -- 'spring', 'summer', 'fall', 'winter'
    province VARCHAR(100),
    school_name VARCHAR(255),
    exam_code VARCHAR(50),
    source_file_path TEXT,
    
    -- Version control (for optimistic locking)
    version INT DEFAULT 1,
    
    -- Timestamps and ownership
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- PART 3: EXAM_QUESTIONS TABLE (Junction)
-- ========================================

CREATE TABLE exam_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES question(id) ON DELETE CASCADE,
    order_number INT NOT NULL,
    points INT DEFAULT 1,
    is_bonus BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(exam_id, question_id),
    UNIQUE(exam_id, order_number)
);

-- ========================================
-- PART 4: EXAM_ATTEMPTS TABLE
-- ========================================

CREATE TABLE exam_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attempt_number INT NOT NULL DEFAULT 1,
    status attempt_status DEFAULT 'in_progress',
    
    -- Scoring
    score DECIMAL(5,2),
    total_points INT,
    percentage DECIMAL(5,2),
    passed BOOLEAN,
    
    -- Timing
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    submitted_at TIMESTAMPTZ,
    time_spent_seconds INT,
    
    -- Additional data
    ip_address INET,
    user_agent TEXT,
    notes TEXT,
    
    UNIQUE(exam_id, user_id, attempt_number)
);

-- ========================================
-- PART 5: EXAM_ANSWERS TABLE
-- ========================================

CREATE TABLE exam_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES question(id) ON DELETE CASCADE,
    
    -- Answer data (flexible for different question types)
    answer_data JSONB, -- Stores the actual answer
    is_correct BOOLEAN,
    points_earned DECIMAL(5,2) DEFAULT 0,
    
    -- Timing
    time_spent_seconds INT,
    answered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(attempt_id, question_id)
);

-- ========================================
-- PART 6: EXAM_RESULTS TABLE
-- ========================================

CREATE TABLE exam_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    attempt_id UUID UNIQUE NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
    
    -- Statistics
    total_questions INT NOT NULL,
    correct_answers INT DEFAULT 0,
    incorrect_answers INT DEFAULT 0,
    unanswered INT DEFAULT 0,
    
    -- Score breakdown by question type
    score_breakdown JSONB, -- {"MC": 10, "TF": 5, "SA": 8, ...}
    
    -- Performance metrics
    accuracy_percentage DECIMAL(5,2),
    avg_time_per_question DECIMAL(8,2),
    
    -- Feedback
    feedback TEXT,
    grade VARCHAR(2), -- A+, A, B+, B, C, D, F
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- PART 7: EXAM_FEEDBACK TABLE
-- ========================================

CREATE TABLE exam_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attempt_id UUID REFERENCES exam_attempts(id) ON DELETE CASCADE,
    
    rating INT CHECK (rating >= 1 AND rating <= 5),
    difficulty_rating INT CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
    content TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- PART 8: INDEXES FOR PERFORMANCE
-- ========================================

-- Exams table indexes
CREATE INDEX idx_exams_status ON exams(status);
CREATE INDEX idx_exams_created_by ON exams(created_by);
CREATE INDEX idx_exams_exam_type ON exams(exam_type);
CREATE INDEX idx_exams_grade_subject ON exams(grade, subject);
CREATE INDEX idx_exams_published_at ON exams(published_at DESC);
CREATE INDEX idx_exams_tags ON exams USING GIN(tags);
CREATE INDEX idx_exams_difficulty ON exams(difficulty);
CREATE INDEX idx_exams_is_official ON exams(is_official);
CREATE INDEX idx_exams_exam_year ON exams(exam_year) WHERE exam_year IS NOT NULL;
CREATE INDEX idx_exams_province ON exams(province) WHERE province IS NOT NULL;

-- Exam questions indexes
CREATE INDEX idx_exam_questions_exam_id ON exam_questions(exam_id);
CREATE INDEX idx_exam_questions_question_id ON exam_questions(question_id);
CREATE INDEX idx_exam_questions_order ON exam_questions(exam_id, order_number);

-- Exam attempts indexes
CREATE INDEX idx_exam_attempts_exam_id ON exam_attempts(exam_id);
CREATE INDEX idx_exam_attempts_user_id ON exam_attempts(user_id);
CREATE INDEX idx_exam_attempts_status ON exam_attempts(status);
CREATE INDEX idx_exam_attempts_started_at ON exam_attempts(started_at DESC);

-- Exam answers indexes
CREATE INDEX idx_exam_answers_attempt_id ON exam_answers(attempt_id);
CREATE INDEX idx_exam_answers_question_id ON exam_answers(question_id);
CREATE INDEX idx_exam_answers_is_correct ON exam_answers(is_correct);

-- Exam results indexes
CREATE INDEX idx_exam_results_attempt_id ON exam_results(attempt_id);

-- Exam feedback indexes
CREATE INDEX idx_exam_feedback_exam_id ON exam_feedback(exam_id);
CREATE INDEX idx_exam_feedback_user_id ON exam_feedback(user_id);

-- ========================================
-- PART 9: TRIGGERS
-- ========================================

-- Add trigger to update updated_at timestamp for exams
CREATE TRIGGER update_exams_updated_at
    BEFORE UPDATE ON exams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to calculate total_points when exam_questions change
CREATE OR REPLACE FUNCTION calculate_exam_total_points()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE exams
    SET total_points = (
        SELECT COALESCE(SUM(points), 0)
        FROM exam_questions
        WHERE exam_id = COALESCE(NEW.exam_id, OLD.exam_id)
        AND is_bonus = false
    )
    WHERE id = COALESCE(NEW.exam_id, OLD.exam_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_exam_total_points
    AFTER INSERT OR UPDATE OR DELETE ON exam_questions
    FOR EACH ROW
    EXECUTE FUNCTION calculate_exam_total_points();

-- ========================================
-- PART 10: COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE exams IS 'Stores exam definitions and configurations with corrected field types';
COMMENT ON TABLE exam_questions IS 'Junction table linking exams to questions with ordering';
COMMENT ON TABLE exam_attempts IS 'Tracks user attempts at taking exams';
COMMENT ON TABLE exam_answers IS 'Stores user answers for each question in an attempt';
COMMENT ON TABLE exam_results IS 'Summary statistics and results for completed attempts';
COMMENT ON TABLE exam_feedback IS 'User feedback and ratings for exams';

COMMENT ON COLUMN exams.exam_type IS 'Exam type: generated (from question bank), official (real exams from schools)';
COMMENT ON COLUMN exams.grade IS 'Khối lớp (1-12) - INT type for proper sorting and filtering';
COMMENT ON COLUMN exams.difficulty IS 'Difficulty level enum: EASY, MEDIUM, HARD, EXPERT';
COMMENT ON COLUMN exams.status IS 'Exam status: PENDING (draft), ACTIVE (published), INACTIVE (paused), ARCHIVED';
COMMENT ON COLUMN exams.is_official IS 'True for official exams from schools/government';
COMMENT ON COLUMN exams.version IS 'Version number for optimistic locking';

-- Success message
SELECT 'Complete Exam Management System created successfully!' as message;
