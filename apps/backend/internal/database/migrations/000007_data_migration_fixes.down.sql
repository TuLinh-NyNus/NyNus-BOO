-- ===================================================================
-- ROLLBACK: 000007_data_migration_fixes
-- PURPOSE: Remove data fixes and system info
-- DATE: 2025-09-22
-- ===================================================================

-- Drop system info table
DROP TABLE IF EXISTS system_info CASCADE;

-- Note: Data corrections cannot be easily rolled back
-- This migration primarily contains data validations and corrections
-- Rolling back would require restoring from backup

SELECT 'Data migration fixes rollback completed!' as message;
SELECT 'Note: Data corrections cannot be automatically rolled back' as warning;
