BEGIN;

-- Drop triggers created in the up migration
DROP TRIGGER IF EXISTS update_library_items_updated_at ON library_items;
DROP TRIGGER IF EXISTS update_book_metadata_updated_at ON book_metadata;
DROP TRIGGER IF EXISTS update_exam_metadata_updated_at ON exam_metadata;
DROP TRIGGER IF EXISTS update_video_metadata_updated_at ON video_metadata;

-- Drop indexes introduced in the up migration
DROP INDEX IF EXISTS idx_exam_metadata_item;
DROP INDEX IF EXISTS idx_exam_metadata_subject_grade;
DROP INDEX IF EXISTS idx_exam_metadata_difficulty;
DROP INDEX IF EXISTS idx_exam_metadata_exam_type;
DROP INDEX IF EXISTS idx_video_metadata_item;
DROP INDEX IF EXISTS idx_video_metadata_youtube_id;
DROP INDEX IF EXISTS idx_item_ratings_item;
DROP INDEX IF EXISTS idx_item_ratings_user;
DROP INDEX IF EXISTS idx_user_bookmarks_item;
DROP INDEX IF EXISTS idx_user_bookmarks_user;

-- Drop tables that were created in the up migration
DROP TABLE IF EXISTS exam_metadata;
DROP TABLE IF EXISTS video_metadata;
DROP TABLE IF EXISTS item_ratings;
DROP TABLE IF EXISTS user_bookmarks;

-- Rename indexes back to original names before renaming tables
ALTER INDEX IF EXISTS idx_book_metadata_author RENAME TO idx_library_book_metadata_author;
ALTER INDEX IF EXISTS idx_book_metadata_isbn RENAME TO idx_library_book_metadata_isbn;
ALTER INDEX IF EXISTS idx_download_history_item RENAME TO idx_library_download_history_item;

-- Rename tables back to their original names
ALTER TABLE IF EXISTS book_metadata RENAME TO library_book_metadata;
ALTER TABLE IF EXISTS tags RENAME TO library_tags;
ALTER TABLE IF EXISTS item_tags RENAME TO library_item_tags;
ALTER TABLE IF EXISTS download_history RENAME TO library_download_history;

COMMIT;
