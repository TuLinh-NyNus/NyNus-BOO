BEGIN;

DROP INDEX IF EXISTS idx_library_download_history_item;
DROP INDEX IF EXISTS idx_library_book_metadata_isbn;
DROP INDEX IF EXISTS idx_library_book_metadata_author;
DROP INDEX IF EXISTS idx_library_items_category;
DROP INDEX IF EXISTS idx_library_items_type_active;

DROP TABLE IF EXISTS library_download_history;
DROP TABLE IF EXISTS library_item_tags;
DROP TABLE IF EXISTS library_tags;
DROP TABLE IF EXISTS library_book_metadata;
DROP TABLE IF EXISTS library_items;

COMMIT;
