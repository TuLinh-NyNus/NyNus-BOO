-- ===================================================================
-- MIGRATION DOWN: 000041_mapcode_hierarchical_context
-- PURPOSE: Remove hierarchical context from MapCode translations
-- DATE: 2025-01-19
-- ===================================================================

-- Drop indexes
DROP INDEX IF EXISTS idx_mapcode_translations_hierarchy;
DROP INDEX IF EXISTS idx_mapcode_translations_parent_context;

-- Drop columns
ALTER TABLE mapcode_translations
DROP COLUMN IF EXISTS hierarchy_path,
DROP COLUMN IF EXISTS parent_context;

-- Success message
SELECT 'Hierarchical context removed from mapcode_translations' as message;





