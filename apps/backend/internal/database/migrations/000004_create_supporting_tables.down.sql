-- Rollback Supporting Tables Migration

-- 1️⃣ Drop view
DROP VIEW IF EXISTS question_stats;

-- 2️⃣ Drop tables in reverse order
DROP TABLE IF EXISTS QuestionFeedback CASCADE;
DROP TABLE IF EXISTS QuestionTag CASCADE;
DROP TABLE IF EXISTS QuestionImage CASCADE;

-- 3️⃣ Drop enums (only if not used elsewhere)
DROP TYPE IF EXISTS FeedbackType;
DROP TYPE IF EXISTS ImageStatus;  
DROP TYPE IF EXISTS ImageType;

-- Success message
SELECT 'Supporting tables rollback completed!' as message;