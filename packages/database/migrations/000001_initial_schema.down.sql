-- Drop tables in reverse order
DROP TABLE IF EXISTS exam_attempts;
DROP TABLE IF EXISTS exam_questions;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS answers;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS users;

-- Drop extension
DROP EXTENSION IF EXISTS "uuid-ossp";
