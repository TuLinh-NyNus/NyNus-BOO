BEGIN;

-- Drop additional indexes
DROP INDEX IF EXISTS idx_library_items_type_status;
DROP INDEX IF EXISTS idx_library_items_status;

-- Remove constraints introduced in the up migration
ALTER TABLE book_metadata
    DROP CONSTRAINT IF EXISTS book_metadata_required_level_check,
    DROP CONSTRAINT IF EXISTS book_metadata_book_type_check;

-- Relax NOT NULL constraints to previous optional state
ALTER TABLE book_metadata
    ALTER COLUMN book_type DROP NOT NULL,
    ALTER COLUMN grade DROP NOT NULL,
    ALTER COLUMN subject DROP NOT NULL;

COMMIT;
