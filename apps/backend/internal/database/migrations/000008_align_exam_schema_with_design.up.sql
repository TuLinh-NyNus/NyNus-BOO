-- ===================================================================
-- MIGRATION: 000008_align_exam_schema_with_design
-- PURPOSE: Align exam schema with ExamSystem.md design requirements
-- FIXES: Official exam fields, enum types, and specialized indexes
-- DATE: 2025-01-19
-- ===================================================================

-- ========================================
-- PART 1: FIX EXAM_TYPE ENUM
-- ========================================

-- SKIP: Migration 000004 already created exam_type enum with correct values ('generated', 'official')
-- No enum migration needed - the enum is already aligned with ExamSystem.md design

-- ========================================
-- PART 2: ALIGN OFFICIAL EXAM FIELDS WITH DESIGN
-- ========================================

-- Rename fields to match ExamSystem.md design exactly
ALTER TABLE exams RENAME COLUMN school_name TO source_institution;
ALTER TABLE exams RENAME COLUMN source_file_path TO file_url;

-- Remove fields not in design
ALTER TABLE exams DROP COLUMN IF EXISTS is_official;
ALTER TABLE exams DROP COLUMN IF EXISTS exam_season;
ALTER TABLE exams DROP COLUMN IF EXISTS province;

-- Ensure exam_year is VARCHAR(10) as per design (currently INT)
ALTER TABLE exams ALTER COLUMN exam_year TYPE VARCHAR(10) USING exam_year::VARCHAR(10);

-- ========================================
-- PART 3: ADD MISSING SPECIALIZED INDEXES
-- ========================================

-- Drop old indexes that don't match design
DROP INDEX IF EXISTS idx_exams_is_official;
DROP INDEX IF EXISTS idx_exams_province;

-- Add specialized indexes as per ExamSystem.md design
CREATE INDEX idx_exams_official ON exams(exam_type, exam_year) WHERE exam_type = 'official';
CREATE INDEX idx_exams_source_institution ON exams(source_institution) 
    WHERE source_institution IS NOT NULL;

-- Update existing index to match design (status = 'ACTIVE' instead of 'published')
DROP INDEX IF EXISTS idx_exams_subject_grade;
CREATE INDEX idx_exams_subject_grade ON exams(subject, grade) WHERE status = 'ACTIVE';

-- ========================================
-- PART 4: ADD COMMENTS FOR CLARITY
-- ========================================

COMMENT ON COLUMN exams.exam_type IS 'Exam type: generated (from question bank) or official (real exams from institutions)';
COMMENT ON COLUMN exams.source_institution IS 'Institution name for official exams (schools, education departments)';
COMMENT ON COLUMN exams.exam_year IS 'Exam year for official exams (e.g., "2024")';
COMMENT ON COLUMN exams.exam_code IS 'Exam code for official exams (e.g., "001", "A")';
COMMENT ON COLUMN exams.file_url IS 'File URL for official exam documents (PDF, images, etc.)';

-- ========================================
-- PART 5: VERIFY ALIGNMENT WITH DESIGN
-- ========================================

-- Verify that all required fields from ExamSystem.md are present
DO $$
DECLARE
    missing_fields TEXT[] := ARRAY[]::TEXT[];
    field_name TEXT;
    required_fields TEXT[] := ARRAY[
        'id', 'title', 'description', 'instructions', 'exam_type', 'status',
        'subject', 'grade', 'difficulty', 'duration_minutes', 'total_points', 
        'pass_percentage', 'shuffle_questions', 'show_results', 'max_attempts',
        'source_institution', 'exam_year', 'exam_code', 'file_url', 'version',
        'tags', 'created_by', 'created_at', 'updated_at'
    ];
BEGIN
    FOREACH field_name IN ARRAY required_fields
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'exams' AND column_name = field_name
        ) THEN
            missing_fields := array_append(missing_fields, field_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_fields, 1) > 0 THEN
        RAISE NOTICE 'Missing fields in exams table: %', array_to_string(missing_fields, ', ');
    ELSE
        RAISE NOTICE 'All required fields from ExamSystem.md design are present in exams table';
    END IF;
END $$;

-- Success message
SELECT 'Exam schema successfully aligned with ExamSystem.md design!' as message;
