-- Migration runner already wraps this in a transaction
-- No need for explicit BEGIN/COMMIT

-- Ensure book metadata mandatory columns are populated before enforcing constraints
UPDATE book_metadata
SET subject = COALESCE(NULLIF(TRIM(subject), ''), 'unspecified')
WHERE subject IS NULL OR TRIM(subject) = '';

UPDATE book_metadata
SET grade = COALESCE(NULLIF(TRIM(grade), ''), 'unspecified')
WHERE grade IS NULL OR TRIM(grade) = '';

UPDATE book_metadata
SET book_type = COALESCE(NULLIF(TRIM(book_type), ''), 'reference')
WHERE book_type IS NULL OR TRIM(book_type) = '';

-- Align book metadata schema with design constraints
ALTER TABLE book_metadata
    ALTER COLUMN subject SET NOT NULL,
    ALTER COLUMN grade SET NOT NULL,
    ALTER COLUMN book_type SET NOT NULL;

-- Drop constraints if they exist before adding
ALTER TABLE book_metadata DROP CONSTRAINT IF EXISTS book_metadata_book_type_check;
ALTER TABLE book_metadata DROP CONSTRAINT IF EXISTS book_metadata_required_level_check;

ALTER TABLE book_metadata
    ADD CONSTRAINT book_metadata_book_type_check
        CHECK (book_type IN ('textbook', 'workbook', 'reference'))
        NOT VALID;

ALTER TABLE book_metadata
    ADD CONSTRAINT book_metadata_required_level_check
        CHECK (required_level IS NULL OR (required_level >= 1 AND required_level <= 9))
        NOT VALID;

-- Validate the newly created constraints
ALTER TABLE book_metadata
    VALIDATE CONSTRAINT book_metadata_book_type_check;

ALTER TABLE book_metadata
    VALIDATE CONSTRAINT book_metadata_required_level_check;

-- Add indexes expected by the architecture document
CREATE INDEX IF NOT EXISTS idx_library_items_status ON library_items(upload_status);
CREATE INDEX IF NOT EXISTS idx_library_items_type_status ON library_items(type, upload_status);
