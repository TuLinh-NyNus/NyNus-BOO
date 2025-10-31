-- ===================================================================
-- MIGRATION: 000041_mapcode_hierarchical_context
-- PURPOSE: Add hierarchical context to MapCode translations
-- DATE: 2025-01-19
-- ===================================================================

-- Add hierarchical context columns to mapcode_translations
ALTER TABLE mapcode_translations
ADD COLUMN IF NOT EXISTS hierarchy_path TEXT,          -- Full path: "Lớp 10 > NGÂN HÀNG CHÍNH > Mệnh đề"
ADD COLUMN IF NOT EXISTS parent_context JSONB;         -- Parent context for disambiguation

-- Index for hierarchy search (requires pg_trgm extension)
-- Check if extension exists first
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    CREATE EXTENSION pg_trgm;
  END IF;
END$$;

-- Index for hierarchy search using GIN with pg_trgm
CREATE INDEX IF NOT EXISTS idx_mapcode_translations_hierarchy 
ON mapcode_translations USING GIN(hierarchy_path gin_trgm_ops);

-- Index for parent context queries
CREATE INDEX IF NOT EXISTS idx_mapcode_translations_parent_context 
ON mapcode_translations USING GIN(parent_context);

-- Add comments for documentation
COMMENT ON COLUMN mapcode_translations.hierarchy_path IS 
'Full hierarchical path for breadcrumb navigation (e.g., "Lớp 10 > NGÂN HÀNG CHÍNH > Mệnh đề")';

COMMENT ON COLUMN mapcode_translations.parent_context IS 
'JSON object storing parent grade/subject/chapter for disambiguation: {"grade": "0", "subject": "P", "chapter": "1"}';

-- Success message
SELECT 'Hierarchical context support added to mapcode_translations' as message;




