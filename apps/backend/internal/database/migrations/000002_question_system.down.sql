-- ===================================================================
-- ROLLBACK: 000002_question_bank_system
-- PURPOSE: Remove complete Question Bank System
-- DATE: 2025-09-22
-- ===================================================================

-- Drop views first
DROP VIEW IF EXISTS question_stats CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS update_question_code_updated_at ON question_code;
DROP TRIGGER IF EXISTS update_question_updated_at ON question;
DROP TRIGGER IF EXISTS update_question_image_updated_at ON question_image;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS question_feedback CASCADE;
DROP TABLE IF EXISTS question_tag CASCADE;
DROP TABLE IF EXISTS question_image CASCADE;
DROP TABLE IF EXISTS question CASCADE;
DROP TABLE IF EXISTS question_code CASCADE;

-- Drop enums
DROP TYPE IF EXISTS FeedbackType;
DROP TYPE IF EXISTS ImageStatus;
DROP TYPE IF EXISTS ImageType;
DROP TYPE IF EXISTS QuestionDifficulty;
DROP TYPE IF EXISTS QuestionStatus;
DROP TYPE IF EXISTS QuestionType;
DROP TYPE IF EXISTS CodeFormat;

SELECT 'Question Bank System rollback completed!' as message;
