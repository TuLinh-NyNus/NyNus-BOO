-- ===================================================================
-- MIGRATION ROLLBACK: 000008_align_exam_schema_with_design
-- PURPOSE: Rollback exam schema alignment changes
-- DATE: 2025-01-19
-- ===================================================================

-- ========================================
-- PART 1: RESTORE ORIGINAL EXAM_TYPE ENUM
-- ========================================

-- Create original exam_type enum
CREATE TYPE exam_type_old AS ENUM ('PRACTICE', 'QUIZ', 'MIDTERM', 'FINAL', 'CUSTOM', 'GENERATED');

-- Migrate data back to old enum values
ALTER TABLE exams 
ALTER COLUMN exam_type TYPE exam_type_old 
USING CASE 
    WHEN exam_type::text = 'generated' THEN 'GENERATED'::exam_type_old
    WHEN exam_type::text = 'official' THEN 'PRACTICE'::exam_type_old  -- Map official back to practice
    ELSE 'PRACTICE'::exam_type_old  -- Default fallback
END;

-- Set old default
ALTER TABLE exams ALTER COLUMN exam_type SET DEFAULT 'PRACTICE';

-- Drop new enum
DROP TYPE exam_type;

-- Rename old enum back
ALTER TYPE exam_type_old RENAME TO exam_type;

-- ========================================
-- PART 2: RESTORE ORIGINAL FIELD NAMES
-- ========================================

-- Restore original field names
ALTER TABLE exams RENAME COLUMN source_institution TO school_name;
ALTER TABLE exams RENAME COLUMN file_url TO source_file_path;

-- Restore removed fields
ALTER TABLE exams ADD COLUMN is_official BOOLEAN DEFAULT false;
ALTER TABLE exams ADD COLUMN exam_season VARCHAR(20);
ALTER TABLE exams ADD COLUMN province VARCHAR(100);

-- Restore exam_year as INT
ALTER TABLE exams ALTER COLUMN exam_year TYPE INT USING exam_year::INT;

-- ========================================
-- PART 3: RESTORE ORIGINAL INDEXES
-- ========================================

-- Drop new indexes
DROP INDEX IF EXISTS idx_exams_official;
DROP INDEX IF EXISTS idx_exams_source_institution;

-- Restore original indexes
CREATE INDEX idx_exams_is_official ON exams(is_official);
CREATE INDEX idx_exams_province ON exams(province) WHERE province IS NOT NULL;

-- Restore original subject_grade index
DROP INDEX IF EXISTS idx_exams_subject_grade;
CREATE INDEX idx_exams_grade_subject ON exams(grade, subject);

-- ========================================
-- PART 4: RESTORE ORIGINAL COMMENTS
-- ========================================

COMMENT ON COLUMN exams.exam_type IS 'Exam type: PRACTICE, QUIZ, MIDTERM, FINAL, CUSTOM, GENERATED';
COMMENT ON COLUMN exams.school_name IS 'School name for official exams';
COMMENT ON COLUMN exams.exam_year IS 'Exam year as integer';
COMMENT ON COLUMN exams.exam_code IS 'Exam code for official exams';
COMMENT ON COLUMN exams.source_file_path IS 'Source file path for official exam documents';
COMMENT ON COLUMN exams.is_official IS 'True for official exams from schools/government';

-- Success message
SELECT 'Exam schema rollback completed successfully!' as message;
