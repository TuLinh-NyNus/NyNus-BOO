-- Migration: 000006_exam_system
-- Description: Create tables for exam management system
-- Author: NyNus Team
-- Date: 2025-01-17

-- ===================================================================
-- EXAMS TABLE
-- ===================================================================

-- Create enum for exam status
CREATE TYPE exam_status AS ENUM ('draft', 'published', 'archived');

-- Create enum for exam type
CREATE TYPE exam_type AS ENUM ('practice', 'quiz', 'midterm', 'final', 'custom');

-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    instructions TEXT,
    duration_minutes INT NOT NULL DEFAULT 60,
    total_points INT DEFAULT 0,
    pass_percentage INT DEFAULT 60 CHECK (pass_percentage >= 0 AND pass_percentage <= 100),
    exam_type exam_type DEFAULT 'practice',
    status exam_status DEFAULT 'draft',
    
    -- Settings
    shuffle_questions BOOLEAN DEFAULT false,
    shuffle_answers BOOLEAN DEFAULT false,
    show_results BOOLEAN DEFAULT true,
    show_answers BOOLEAN DEFAULT false,
    allow_review BOOLEAN DEFAULT true,
    max_attempts INT DEFAULT 1,
    
    -- Metadata
    tags TEXT[],
    grade VARCHAR(10),
    subject VARCHAR(50),
    chapter VARCHAR(50),
    difficulty VARCHAR(20), -- easy, medium, hard, expert
    
    -- Timestamps and ownership
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for exams
CREATE INDEX idx_exams_status ON exams(status);
CREATE INDEX idx_exams_created_by ON exams(created_by);
CREATE INDEX idx_exams_exam_type ON exams(exam_type);
CREATE INDEX idx_exams_grade_subject ON exams(grade, subject);
CREATE INDEX idx_exams_published_at ON exams(published_at DESC);
CREATE INDEX idx_exams_tags ON exams USING GIN(tags);

-- ===================================================================
-- EXAM QUESTIONS TABLE (Junction table)
-- ===================================================================

CREATE TABLE IF NOT EXISTS exam_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES Question(id) ON DELETE CASCADE,
    order_number INT NOT NULL,
    points INT DEFAULT 1,
    is_bonus BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(exam_id, question_id),
    UNIQUE(exam_id, order_number)
);

-- Create indexes for exam_questions
CREATE INDEX idx_exam_questions_exam_id ON exam_questions(exam_id);
CREATE INDEX idx_exam_questions_question_id ON exam_questions(question_id);
CREATE INDEX idx_exam_questions_order ON exam_questions(exam_id, order_number);

-- ===================================================================
-- EXAM ATTEMPTS TABLE
-- ===================================================================

-- Create enum for attempt status
CREATE TYPE attempt_status AS ENUM ('in_progress', 'submitted', 'graded', 'cancelled');

CREATE TABLE IF NOT EXISTS exam_attempts (
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

-- Create indexes for exam_attempts
CREATE INDEX idx_exam_attempts_exam_id ON exam_attempts(exam_id);
CREATE INDEX idx_exam_attempts_user_id ON exam_attempts(user_id);
CREATE INDEX idx_exam_attempts_status ON exam_attempts(status);
CREATE INDEX idx_exam_attempts_started_at ON exam_attempts(started_at DESC);

-- ===================================================================
-- EXAM ANSWERS TABLE (User's answers)
-- ===================================================================

CREATE TABLE IF NOT EXISTS exam_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES Question(id) ON DELETE CASCADE,
    
    -- Answer data (flexible for different question types)
    answer_data JSONB, -- Stores the actual answer
    is_correct BOOLEAN,
    points_earned DECIMAL(5,2) DEFAULT 0,
    
    -- Timing
    time_spent_seconds INT,
    answered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(attempt_id, question_id)
);

-- Create indexes for exam_answers
CREATE INDEX idx_exam_answers_attempt_id ON exam_answers(attempt_id);
CREATE INDEX idx_exam_answers_question_id ON exam_answers(question_id);
CREATE INDEX idx_exam_answers_is_correct ON exam_answers(is_correct);

-- ===================================================================
-- EXAM RESULTS TABLE (Summary of attempt)
-- ===================================================================

CREATE TABLE IF NOT EXISTS exam_results (
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

-- Create index for exam_results
CREATE INDEX idx_exam_results_attempt_id ON exam_results(attempt_id);

-- ===================================================================
-- EXAM FEEDBACK TABLE
-- ===================================================================

CREATE TABLE IF NOT EXISTS exam_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attempt_id UUID REFERENCES exam_attempts(id) ON DELETE CASCADE,
    
    rating INT CHECK (rating >= 1 AND rating <= 5),
    difficulty_rating INT CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
    content TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for exam_feedback
CREATE INDEX idx_exam_feedback_exam_id ON exam_feedback(exam_id);
CREATE INDEX idx_exam_feedback_user_id ON exam_feedback(user_id);

-- ===================================================================
-- TRIGGERS
-- ===================================================================

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

-- Add comments for documentation
COMMENT ON TABLE exams IS 'Stores exam definitions and configurations';
COMMENT ON TABLE exam_questions IS 'Junction table linking exams to questions with ordering';
COMMENT ON TABLE exam_attempts IS 'Tracks user attempts at taking exams';
COMMENT ON TABLE exam_answers IS 'Stores user answers for each question in an attempt';
COMMENT ON TABLE exam_results IS 'Summary statistics and results for completed attempts';
COMMENT ON TABLE exam_feedback IS 'User feedback and ratings for exams';