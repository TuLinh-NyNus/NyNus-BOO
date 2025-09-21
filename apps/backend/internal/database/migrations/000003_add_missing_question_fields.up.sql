-- Add Missing Question Fields Migration
-- This migration adds optional classification fields to the Question table

-- 1️⃣ Add EXPERT to QuestionDifficulty enum
ALTER TYPE QuestionDifficulty ADD VALUE 'EXPERT';

-- 2️⃣ Add MA (MATCHING) to QuestionType enum  
ALTER TYPE QuestionType ADD VALUE 'MA';

-- 3️⃣ Add optional classification fields to Question table
ALTER TABLE Question 
ADD COLUMN grade CHAR(1),            -- Lớp (0,1,2) - Optional classification
ADD COLUMN subject CHAR(1),          -- Môn học (P,L,H) - Optional classification  
ADD COLUMN chapter CHAR(1),          -- Chương (1-9) - Optional classification
ADD COLUMN level CHAR(1);            -- Mức độ (N,H,V,C,T,M) - Optional classification

-- 4️⃣ Create indexes for new classification fields
CREATE INDEX idx_question_grade ON Question(grade);
CREATE INDEX idx_question_subject ON Question(subject);
CREATE INDEX idx_question_chapter ON Question(chapter);  
CREATE INDEX idx_question_level ON Question(level);
CREATE INDEX idx_question_grade_subject ON Question(grade, subject);
CREATE INDEX idx_question_grade_subject_chapter ON Question(grade, subject, chapter);
CREATE INDEX idx_question_grade_level ON Question(grade, level);
CREATE INDEX idx_question_grade_subject_level ON Question(grade, subject, level);
CREATE INDEX idx_question_grade_subject_chapter_level ON Question(grade, subject, chapter, level);

-- Success message
SELECT 'Missing Question fields added successfully!' as message;