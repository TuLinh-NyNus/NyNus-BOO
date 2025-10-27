-- Rollback migration: Drop question_versions table

-- Drop trigger first
DROP TRIGGER IF EXISTS question_version_trigger ON questions;

-- Drop function
DROP FUNCTION IF EXISTS create_question_version();

-- Drop indexes
DROP INDEX IF EXISTS idx_question_versions_question_id;
DROP INDEX IF EXISTS idx_question_versions_changed_at;
DROP INDEX IF EXISTS idx_question_versions_changed_by;

-- Drop table
DROP TABLE IF EXISTS question_versions;

