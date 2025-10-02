-- ========================================
-- OPTIMISTIC LOCKING IMPLEMENTATION
-- Migration: 000010_optimistic_locking.up.sql
-- ========================================

-- Add version fields for optimistic locking
ALTER TABLE exams ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE question ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;

-- Create indexes for version-based queries
CREATE INDEX IF NOT EXISTS idx_exams_id_version ON exams(id, version);
CREATE INDEX IF NOT EXISTS idx_question_id_version ON question(id, version);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_id_version ON exam_attempts(id, version);

-- ========================================
-- OPTIMISTIC LOCKING FUNCTIONS
-- ========================================

-- Function to update exam with version check
CREATE OR REPLACE FUNCTION update_exam_with_version_check(
    p_exam_id UUID,
    p_current_version INT,
    p_title VARCHAR(500),
    p_description TEXT,
    p_duration_minutes INT,
    p_total_points INT
) RETURNS TABLE(success BOOLEAN, new_version INT, error_message TEXT) AS $$
DECLARE
    v_current_version INT;
    v_new_version INT;
BEGIN
    -- Get current version
    SELECT version INTO v_current_version 
    FROM exams 
    WHERE id = p_exam_id;
    
    -- Check if exam exists
    IF v_current_version IS NULL THEN
        RETURN QUERY SELECT FALSE, 0, 'Exam not found'::TEXT;
        RETURN;
    END IF;
    
    -- Check version conflict
    IF v_current_version != p_current_version THEN
        RETURN QUERY SELECT FALSE, v_current_version, 'Version conflict - exam was modified by another user'::TEXT;
        RETURN;
    END IF;
    
    -- Calculate new version
    v_new_version := v_current_version + 1;
    
    -- Update exam with new version
    UPDATE exams 
    SET 
        title = p_title,
        description = p_description,
        duration_minutes = p_duration_minutes,
        total_points = p_total_points,
        version = v_new_version,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_exam_id AND version = p_current_version;
    
    -- Check if update was successful
    IF FOUND THEN
        RETURN QUERY SELECT TRUE, v_new_version, NULL::TEXT;
    ELSE
        RETURN QUERY SELECT FALSE, v_current_version, 'Update failed - concurrent modification detected'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update question with version check
CREATE OR REPLACE FUNCTION update_question_with_version_check(
    p_question_id UUID,
    p_current_version INT,
    p_content TEXT,
    p_type VARCHAR(20),
    p_difficulty VARCHAR(20)
) RETURNS TABLE(success BOOLEAN, new_version INT, error_message TEXT) AS $$
DECLARE
    v_current_version INT;
    v_new_version INT;
BEGIN
    -- Get current version
    SELECT version INTO v_current_version
    FROM question
    WHERE id = p_question_id;
    
    -- Check if question exists
    IF v_current_version IS NULL THEN
        RETURN QUERY SELECT FALSE, 0, 'Question not found'::TEXT;
        RETURN;
    END IF;
    
    -- Check version conflict
    IF v_current_version != p_current_version THEN
        RETURN QUERY SELECT FALSE, v_current_version, 'Version conflict - question was modified by another user'::TEXT;
        RETURN;
    END IF;
    
    -- Calculate new version
    v_new_version := v_current_version + 1;
    
    -- Update question with new version
    UPDATE question
    SET
        content = p_content,
        type = p_type::question_type,
        difficulty = p_difficulty::difficulty_unified,
        version = v_new_version,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_question_id AND version = p_current_version;
    
    -- Check if update was successful
    IF FOUND THEN
        RETURN QUERY SELECT TRUE, v_new_version, NULL::TEXT;
    ELSE
        RETURN QUERY SELECT FALSE, v_current_version, 'Update failed - concurrent modification detected'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- BATCH PROCESSING INFRASTRUCTURE
-- ========================================

-- Create usage tracking queue table
CREATE TABLE IF NOT EXISTS question_usage_queue (
    id SERIAL PRIMARY KEY,
    question_id TEXT NOT NULL REFERENCES question(id) ON DELETE CASCADE,
    increment_value INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE
);

-- Create index for efficient processing
CREATE INDEX IF NOT EXISTS idx_question_usage_queue_unprocessed 
ON question_usage_queue(processed, created_at) 
WHERE processed = FALSE;

-- Create index for question lookup
CREATE INDEX IF NOT EXISTS idx_question_usage_queue_question_id 
ON question_usage_queue(question_id);

-- Batch processing function
CREATE OR REPLACE FUNCTION process_usage_queue()
RETURNS TABLE(processed_count INT, questions_updated INT) AS $$
DECLARE
    v_processed_count INT := 0;
    v_questions_updated INT := 0;
BEGIN
    -- Update questions with aggregated usage counts
    WITH usage_aggregates AS (
        SELECT 
            question_id,
            SUM(increment_value) as total_increment
        FROM question_usage_queue
        WHERE processed = FALSE
        GROUP BY question_id
    ),
    updated_questions AS (
        UPDATE question
        SET
            usage_count = usage_count + ua.total_increment,
            updated_at = CURRENT_TIMESTAMP
        FROM usage_aggregates ua
        WHERE question.id = ua.question_id
        RETURNING question.id
    )
    SELECT COUNT(*) INTO v_questions_updated FROM updated_questions;
    
    -- Mark queue entries as processed
    UPDATE question_usage_queue 
    SET processed = TRUE, updated_at = CURRENT_TIMESTAMP
    WHERE processed = FALSE;
    
    GET DIAGNOSTICS v_processed_count = ROW_COUNT;
    
    RETURN QUERY SELECT v_processed_count, v_questions_updated;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PERFORMANCE MONITORING TABLES
-- ========================================

-- Create performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    metric_unit VARCHAR(20) NOT NULL, -- 'ms', 'count', 'bytes', 'percent'
    context JSONB, -- Additional context data
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance metrics
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name_time 
ON performance_metrics(metric_name, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_context 
ON performance_metrics USING GIN(context);

-- Function to record performance metric
CREATE OR REPLACE FUNCTION record_performance_metric(
    p_metric_name VARCHAR(100),
    p_metric_value DECIMAL(10,4),
    p_metric_unit VARCHAR(20),
    p_context JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO performance_metrics (metric_name, metric_value, metric_unit, context)
    VALUES (p_metric_name, p_metric_value, p_metric_unit, p_context);
    
    -- Keep only last 10000 records per metric to prevent table bloat
    DELETE FROM performance_metrics 
    WHERE metric_name = p_metric_name 
    AND id NOT IN (
        SELECT id FROM performance_metrics 
        WHERE metric_name = p_metric_name 
        ORDER BY recorded_at DESC 
        LIMIT 10000
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- CONNECTION POOL MONITORING
-- ========================================

-- Create connection pool stats table
CREATE TABLE IF NOT EXISTS connection_pool_stats (
    id SERIAL PRIMARY KEY,
    active_connections INT NOT NULL,
    idle_connections INT NOT NULL,
    total_connections INT NOT NULL,
    max_connections INT NOT NULL,
    connection_wait_time_ms DECIMAL(10,4),
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create index for time-based queries
CREATE INDEX IF NOT EXISTS idx_connection_pool_stats_time 
ON connection_pool_stats(recorded_at DESC);

-- Function to record connection pool stats
CREATE OR REPLACE FUNCTION record_connection_pool_stats(
    p_active INT,
    p_idle INT,
    p_total INT,
    p_max INT,
    p_wait_time_ms DECIMAL(10,4) DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO connection_pool_stats (
        active_connections, 
        idle_connections, 
        total_connections, 
        max_connections, 
        connection_wait_time_ms
    ) VALUES (p_active, p_idle, p_total, p_max, p_wait_time_ms);
    
    -- Keep only last 1000 records to prevent table bloat
    DELETE FROM connection_pool_stats 
    WHERE id NOT IN (
        SELECT id FROM connection_pool_stats 
        ORDER BY recorded_at DESC 
        LIMIT 1000
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE question_usage_queue IS 'Queue for batch processing question usage tracking to improve performance';
COMMENT ON TABLE performance_metrics IS 'Stores application performance metrics for monitoring and alerting';
COMMENT ON TABLE connection_pool_stats IS 'Tracks database connection pool statistics for optimization';

COMMENT ON FUNCTION update_exam_with_version_check IS 'Updates exam with optimistic locking using version field';
COMMENT ON FUNCTION update_question_with_version_check IS 'Updates question with optimistic locking using version field';
COMMENT ON FUNCTION process_usage_queue IS 'Batch processes question usage tracking queue for performance';
COMMENT ON FUNCTION record_performance_metric IS 'Records application performance metrics';
COMMENT ON FUNCTION record_connection_pool_stats IS 'Records database connection pool statistics';
