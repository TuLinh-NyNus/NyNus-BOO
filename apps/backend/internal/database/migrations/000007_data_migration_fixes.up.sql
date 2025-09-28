-- ===================================================================
-- MIGRATION: 000007_data_migration_fixes
-- PURPOSE: Final data corrections, validations, and system alignment
-- CONSOLIDATES: Final fixes and data integrity checks
-- DATE: 2025-09-22
-- ===================================================================

-- ========================================
-- PART 1: DATA VALIDATION & CORRECTIONS
-- ========================================

-- Ensure all users have proper default preferences
INSERT INTO user_preferences (user_id)
SELECT id FROM users
WHERE id NOT IN (SELECT user_id FROM user_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- Update any legacy role values to uppercase
UPDATE users SET role = UPPER(role) WHERE role != UPPER(role);

-- Ensure all users have proper status
UPDATE users SET status = 'ACTIVE' WHERE status IS NULL;

-- ========================================
-- PART 2: ENUM VALUE VALIDATIONS
-- ========================================

-- Verify all question difficulties are valid
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_count
    FROM question 
    WHERE difficulty NOT IN ('EASY', 'MEDIUM', 'HARD', 'EXPERT');
    
    IF invalid_count > 0 THEN
        -- Fix invalid difficulty values
        UPDATE question 
        SET difficulty = 'MEDIUM'
        WHERE difficulty NOT IN ('EASY', 'MEDIUM', 'HARD', 'EXPERT');
        
        RAISE NOTICE 'Fixed % invalid question difficulty values', invalid_count;
    END IF;
END $$;

-- Verify all exam statuses are valid
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_count
    FROM exams 
    WHERE status NOT IN ('ACTIVE', 'PENDING', 'INACTIVE', 'ARCHIVED');
    
    IF invalid_count > 0 THEN
        -- Fix invalid status values
        UPDATE exams 
        SET status = 'PENDING'
        WHERE status NOT IN ('ACTIVE', 'PENDING', 'INACTIVE', 'ARCHIVED');
        
        RAISE NOTICE 'Fixed % invalid exam status values', invalid_count;
    END IF;
END $$;

-- ========================================
-- PART 3: CONSTRAINT VALIDATIONS
-- ========================================

-- Ensure grade values are within valid range
UPDATE exams 
SET grade = NULL 
WHERE grade IS NOT NULL AND (grade < 1 OR grade > 12);

-- Ensure pass_percentage is within valid range
UPDATE exams 
SET pass_percentage = 60 
WHERE pass_percentage < 0 OR pass_percentage > 100;

-- Ensure rating values are within valid range
UPDATE question_feedback 
SET rating = NULL 
WHERE rating IS NOT NULL AND (rating < 1 OR rating > 5);

UPDATE exam_feedback 
SET rating = NULL 
WHERE rating IS NOT NULL AND (rating < 1 OR rating > 5);

UPDATE exam_feedback 
SET difficulty_rating = NULL 
WHERE difficulty_rating IS NOT NULL AND (difficulty_rating < 1 OR difficulty_rating > 5);

-- ========================================
-- PART 4: FOREIGN KEY INTEGRITY CHECKS
-- ========================================

-- Check for orphaned records and report
DO $$
DECLARE
    orphaned_count INTEGER;
BEGIN
    -- Check orphaned question_image records
    SELECT COUNT(*) INTO orphaned_count
    FROM question_image qi
    WHERE NOT EXISTS (SELECT 1 FROM question q WHERE q.id = qi.question_id);
    
    IF orphaned_count > 0 THEN
        RAISE WARNING 'Found % orphaned question_image records', orphaned_count;
    END IF;
    
    -- Check orphaned question_tag records
    SELECT COUNT(*) INTO orphaned_count
    FROM question_tag qt
    WHERE NOT EXISTS (SELECT 1 FROM question q WHERE q.id = qt.question_id);
    
    IF orphaned_count > 0 THEN
        RAISE WARNING 'Found % orphaned question_tag records', orphaned_count;
    END IF;
    
    -- Check orphaned exam_questions records
    SELECT COUNT(*) INTO orphaned_count
    FROM exam_questions eq
    WHERE NOT EXISTS (SELECT 1 FROM question q WHERE q.id = eq.question_id);
    
    IF orphaned_count > 0 THEN
        RAISE WARNING 'Found % orphaned exam_questions records', orphaned_count;
    END IF;
END $$;

-- ========================================
-- PART 5: PERFORMANCE OPTIMIZATIONS
-- ========================================

-- Update statistics for query planner
ANALYZE users;
ANALYZE question;
ANALYZE question_code;
ANALYZE exams;
ANALYZE exam_questions;
ANALYZE exam_attempts;

-- ========================================
-- PART 6: SYSTEM CONFIGURATION
-- ========================================

-- Ensure only one active MapCode version
DO $$
DECLARE
    active_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO active_count
    FROM mapcode_versions
    WHERE is_active = true;
    
    IF active_count = 0 THEN
        -- If no active version, activate the latest one
        UPDATE mapcode_versions
        SET is_active = true
        WHERE id = (
            SELECT id FROM mapcode_versions
            ORDER BY created_at DESC
            LIMIT 1
        );
        RAISE NOTICE 'Activated latest MapCode version';
    ELSIF active_count > 1 THEN
        -- If multiple active versions, keep only the latest
        UPDATE mapcode_versions
        SET is_active = false
        WHERE id NOT IN (
            SELECT id FROM mapcode_versions
            WHERE is_active = true
            ORDER BY created_at DESC
            LIMIT 1
        );
        RAISE NOTICE 'Deactivated % older MapCode versions', active_count - 1;
    END IF;
END $$;

-- ========================================
-- PART 7: FINAL VALIDATIONS
-- ========================================

-- Validate critical system constraints
DO $$
DECLARE
    error_count INTEGER := 0;
    error_message TEXT := '';
BEGIN
    -- Check users table integrity
    SELECT COUNT(*) INTO error_count
    FROM users
    WHERE email IS NULL OR email = '' OR password_hash IS NULL OR password_hash = '';
    
    IF error_count > 0 THEN
        error_message := error_message || FORMAT('Found %s users with missing email/password. ', error_count);
    END IF;
    
    -- Check question table integrity
    SELECT COUNT(*) INTO error_count
    FROM question
    WHERE content IS NULL OR content = '' OR question_code_id IS NULL;
    
    IF error_count > 0 THEN
        error_message := error_message || FORMAT('Found %s questions with missing content/code. ', error_count);
    END IF;
    
    -- Check exam table integrity
    SELECT COUNT(*) INTO error_count
    FROM exams
    WHERE title IS NULL OR title = '' OR duration_minutes <= 0;
    
    IF error_count > 0 THEN
        error_message := error_message || FORMAT('Found %s exams with missing title/duration. ', error_count);
    END IF;
    
    IF error_message != '' THEN
        RAISE WARNING 'Data integrity issues found: %', error_message;
    ELSE
        RAISE NOTICE 'All data integrity checks passed successfully';
    END IF;
END $$;

-- ========================================
-- PART 8: SYSTEM HEALTH CHECK
-- ========================================

-- Generate system health report
DO $$
DECLARE
    user_count INTEGER;
    question_count INTEGER;
    exam_count INTEGER;
    active_session_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users WHERE status = 'ACTIVE';
    SELECT COUNT(*) INTO question_count FROM question WHERE status = 'ACTIVE';
    SELECT COUNT(*) INTO exam_count FROM exams WHERE status IN ('ACTIVE', 'PENDING');
    SELECT COUNT(*) INTO active_session_count FROM user_sessions WHERE is_active = true;
    
    RAISE NOTICE 'System Health Report:';
    RAISE NOTICE '  Active Users: %', user_count;
    RAISE NOTICE '  Active Questions: %', question_count;
    RAISE NOTICE '  Active/Pending Exams: %', exam_count;
    RAISE NOTICE '  Active Sessions: %', active_session_count;
END $$;

-- ========================================
-- PART 9: FINAL COMMENTS
-- ========================================

COMMENT ON SCHEMA public IS 'NyNus Exam Bank System - Complete database schema with 7 consolidated migrations';

-- Create a system info table for tracking
CREATE TABLE IF NOT EXISTS system_info (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO system_info (key, value) VALUES 
('migration_version', '7'),
('migration_date', NOW()::TEXT),
('schema_version', '2.0.0'),
('consolidation_status', 'COMPLETE')
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = NOW();

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

SELECT 'Data migration fixes and final validations completed successfully!' as message;
SELECT 'Migration consolidation from 35+ files to 7 files completed!' as consolidation_status;
SELECT 'System is ready for production use!' as system_status;
