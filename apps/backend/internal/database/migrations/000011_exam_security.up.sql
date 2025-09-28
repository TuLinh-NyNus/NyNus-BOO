-- ===================================================================
-- MIGRATION: 000011_exam_security
-- PURPOSE: Add exam security and anti-cheating infrastructure
-- DATE: 2025-01-19
-- ===================================================================

-- Create exam_sessions table for secure exam session management
CREATE TABLE IF NOT EXISTS exam_sessions (
    session_id VARCHAR(32) PRIMARY KEY,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
    
    -- Session timing
    start_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiry_time TIMESTAMPTZ NOT NULL,
    last_activity TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Session security
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    security_token VARCHAR(64) NOT NULL,
    
    -- Client information
    ip_address INET,
    user_agent TEXT,
    
    -- Security tracking
    violations INT NOT NULL DEFAULT 0,
    
    -- Termination info
    terminated_at TIMESTAMPTZ,
    termination_reason TEXT,
    lock_reason TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for exam_sessions
CREATE INDEX IF NOT EXISTS idx_exam_sessions_exam_user 
ON exam_sessions(exam_id, user_id);

CREATE INDEX IF NOT EXISTS idx_exam_sessions_active 
ON exam_sessions(is_active, expiry_time) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_active 
ON exam_sessions(user_id, is_active) WHERE is_active = true;

-- Create exam_security_events table for tracking security events
CREATE TABLE IF NOT EXISTS exam_security_events (
    event_id VARCHAR(32) PRIMARY KEY,
    session_id VARCHAR(32) NOT NULL REFERENCES exam_sessions(session_id) ON DELETE CASCADE,
    
    -- Event details
    event_type VARCHAR(50) NOT NULL, -- tab_switch, window_blur, copy_paste, etc.
    severity VARCHAR(20) NOT NULL,   -- low, medium, high, critical
    description TEXT NOT NULL,
    
    -- Event metadata
    metadata JSONB,
    
    -- Timing
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for exam_security_events
CREATE INDEX IF NOT EXISTS idx_exam_security_events_session 
ON exam_security_events(session_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_exam_security_events_type_severity 
ON exam_security_events(event_type, severity, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_exam_security_events_timestamp 
ON exam_security_events(timestamp DESC);

-- Create exam_browser_info table for browser security tracking
CREATE TABLE IF NOT EXISTS exam_browser_info (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(32) NOT NULL REFERENCES exam_sessions(session_id) ON DELETE CASCADE,
    
    -- Browser security info
    is_fullscreen BOOLEAN NOT NULL DEFAULT false,
    tab_count INT,
    has_devtools BOOLEAN NOT NULL DEFAULT false,
    window_size VARCHAR(20),
    screen_size VARCHAR(20),
    timezone VARCHAR(50),
    language VARCHAR(10),
    
    -- Tracking
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for exam_browser_info
CREATE INDEX IF NOT EXISTS idx_exam_browser_info_session 
ON exam_browser_info(session_id, recorded_at DESC);

-- Create exam_activity_log table for detailed activity tracking
CREATE TABLE IF NOT EXISTS exam_activity_log (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(32) NOT NULL REFERENCES exam_sessions(session_id) ON DELETE CASCADE,
    attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
    
    -- Activity details
    activity_type VARCHAR(50) NOT NULL, -- question_view, answer_change, navigation, etc.
    question_id TEXT,
    
    -- Activity data
    activity_data JSONB,
    
    -- Timing
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    duration_ms INT -- Time spent on activity
);

-- Create indexes for exam_activity_log
CREATE INDEX IF NOT EXISTS idx_exam_activity_log_session 
ON exam_activity_log(session_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_exam_activity_log_attempt 
ON exam_activity_log(attempt_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_exam_activity_log_question 
ON exam_activity_log(question_id, timestamp DESC) WHERE question_id IS NOT NULL;

-- Create exam_rate_limits table for exam-specific rate limiting
CREATE TABLE IF NOT EXISTS exam_rate_limits (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    
    -- Rate limiting
    action_type VARCHAR(50) NOT NULL, -- answer_submit, question_view, etc.
    action_count INT NOT NULL DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    window_end TIMESTAMPTZ NOT NULL,
    
    -- Limits
    max_actions INT NOT NULL,
    is_blocked BOOLEAN NOT NULL DEFAULT false,
    
    UNIQUE(user_id, exam_id, action_type, window_start)
);

-- Create indexes for exam_rate_limits
CREATE INDEX IF NOT EXISTS idx_exam_rate_limits_user_exam 
ON exam_rate_limits(user_id, exam_id, action_type);

CREATE INDEX IF NOT EXISTS idx_exam_rate_limits_window 
ON exam_rate_limits(window_end) WHERE is_blocked = false;

-- Create exam_security_config table for per-exam security settings
CREATE TABLE IF NOT EXISTS exam_security_config (
    exam_id UUID PRIMARY KEY REFERENCES exams(id) ON DELETE CASCADE,
    
    -- Security settings
    require_fullscreen BOOLEAN NOT NULL DEFAULT true,
    block_copy_paste BOOLEAN NOT NULL DEFAULT true,
    block_right_click BOOLEAN NOT NULL DEFAULT true,
    detect_devtools BOOLEAN NOT NULL DEFAULT true,
    monitor_tab_switching BOOLEAN NOT NULL DEFAULT true,
    
    -- Violation limits
    max_violations INT NOT NULL DEFAULT 5,
    allowed_violations_per_hour INT NOT NULL DEFAULT 3,
    
    -- Session settings
    session_timeout_minutes INT NOT NULL DEFAULT 120,
    activity_timeout_minutes INT NOT NULL DEFAULT 30,
    
    -- Proctoring settings
    require_webcam BOOLEAN NOT NULL DEFAULT false,
    require_microphone BOOLEAN NOT NULL DEFAULT false,
    record_screen BOOLEAN NOT NULL DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add security-related columns to existing exam_attempts table
ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS security_score INT DEFAULT 100;
ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS security_violations INT DEFAULT 0;
ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false;
ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS flag_reason TEXT;

-- Create function to automatically create default security config for new exams
CREATE OR REPLACE FUNCTION create_default_exam_security_config()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO exam_security_config (exam_id)
    VALUES (NEW.id)
    ON CONFLICT (exam_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create security config
DROP TRIGGER IF EXISTS trigger_create_exam_security_config ON exams;
CREATE TRIGGER trigger_create_exam_security_config
    AFTER INSERT ON exams
    FOR EACH ROW
    EXECUTE FUNCTION create_default_exam_security_config();

-- Create function to clean up old security events (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_security_events()
RETURNS void AS $$
BEGIN
    -- Delete security events older than 90 days
    DELETE FROM exam_security_events 
    WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '90 days';
    
    -- Delete activity logs older than 30 days
    DELETE FROM exam_activity_log 
    WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    -- Delete expired rate limit entries
    DELETE FROM exam_rate_limits 
    WHERE window_end < CURRENT_TIMESTAMP - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate security score
CREATE OR REPLACE FUNCTION calculate_security_score(p_session_id VARCHAR(32))
RETURNS INT AS $$
DECLARE
    base_score INT := 100;
    violation_penalty INT;
    critical_events INT;
    high_events INT;
    medium_events INT;
BEGIN
    -- Count security events by severity
    SELECT 
        COUNT(CASE WHEN severity = 'critical' THEN 1 END),
        COUNT(CASE WHEN severity = 'high' THEN 1 END),
        COUNT(CASE WHEN severity = 'medium' THEN 1 END)
    INTO critical_events, high_events, medium_events
    FROM exam_security_events
    WHERE session_id = p_session_id;
    
    -- Calculate penalty
    violation_penalty := (critical_events * 30) + (high_events * 15) + (medium_events * 5);
    
    -- Return score (minimum 0)
    RETURN GREATEST(0, base_score - violation_penalty);
END;
$$ LANGUAGE plpgsql;

-- Create function to update attempt security score
CREATE OR REPLACE FUNCTION update_attempt_security_score()
RETURNS TRIGGER AS $$
DECLARE
    session_record RECORD;
    security_score INT;
BEGIN
    -- Get session info
    SELECT * INTO session_record
    FROM exam_sessions
    WHERE session_id = NEW.session_id;
    
    IF FOUND THEN
        -- Calculate security score
        security_score := calculate_security_score(NEW.session_id);
        
        -- Update attempt
        UPDATE exam_attempts
        SET 
            security_score = security_score,
            security_violations = (
                SELECT COUNT(*) 
                FROM exam_security_events 
                WHERE session_id = NEW.session_id 
                AND severity IN ('medium', 'high', 'critical')
            ),
            is_flagged = CASE WHEN security_score < 70 THEN true ELSE false END,
            flag_reason = CASE 
                WHEN security_score < 70 THEN 'Low security score due to violations'
                ELSE NULL
            END
        WHERE id = session_record.attempt_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update security score on new events
DROP TRIGGER IF EXISTS trigger_update_security_score ON exam_security_events;
CREATE TRIGGER trigger_update_security_score
    AFTER INSERT ON exam_security_events
    FOR EACH ROW
    EXECUTE FUNCTION update_attempt_security_score();

-- Add comments for documentation
COMMENT ON TABLE exam_sessions IS 'Secure exam sessions with integrity protection';
COMMENT ON TABLE exam_security_events IS 'Security events and violations during exams';
COMMENT ON TABLE exam_browser_info IS 'Browser security information tracking';
COMMENT ON TABLE exam_activity_log IS 'Detailed exam activity logging';
COMMENT ON TABLE exam_rate_limits IS 'Exam-specific rate limiting';
COMMENT ON TABLE exam_security_config IS 'Per-exam security configuration';

COMMENT ON FUNCTION calculate_security_score(VARCHAR) IS 'Calculates security score based on violations';
COMMENT ON FUNCTION cleanup_old_security_events() IS 'Maintenance function to clean old security data';
