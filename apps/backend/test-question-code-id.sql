-- Test query to check question_code_id data
-- Run this in PG Admin to verify data exists

-- Check total questions
SELECT COUNT(*) as total_questions FROM question;

-- Check questions with NULL or empty question_code_id
SELECT COUNT(*) as null_code_id 
FROM question 
WHERE question_code_id IS NULL OR question_code_id = '';

-- Sample questions with their code IDs
SELECT 
    id,
    LEFT(content, 50) as content_preview,
    question_code_id,
    type,
    difficulty,
    created_at
FROM question
ORDER BY created_at DESC
LIMIT 20;

-- Check if question_code table has data
SELECT COUNT(*) as total_codes FROM question_code;

-- Sample question codes
SELECT code, format, grade, subject, chapter, level
FROM question_code
LIMIT 20;

-- Check for questions whose code_id doesn't exist in question_code table
SELECT 
    q.id,
    q.question_code_id,
    qc.code as code_in_table
FROM question q
LEFT JOIN question_code qc ON q.question_code_id = qc.code
WHERE qc.code IS NULL
LIMIT 10;



