BEGIN;

-- Remove indexes introduced in the up migration
DROP INDEX IF EXISTS idx_download_history_user;
DROP INDEX IF EXISTS idx_item_tags_tag;
DROP INDEX IF EXISTS idx_exam_metadata_required_role;
DROP INDEX IF EXISTS idx_exam_metadata_required_level;
DROP INDEX IF EXISTS idx_book_metadata_required_role;
DROP INDEX IF EXISTS idx_book_metadata_required_level;
DROP INDEX IF EXISTS idx_book_metadata_subject_grade;
DROP INDEX IF EXISTS idx_book_metadata_book_type;
DROP INDEX IF EXISTS idx_video_metadata_required_role;
DROP INDEX IF EXISTS idx_video_metadata_required_level;
DROP INDEX IF EXISTS idx_video_metadata_subject_grade;
DROP INDEX IF EXISTS idx_video_metadata_quality;
DROP INDEX IF EXISTS idx_video_metadata_instructor;

-- Drop triggers and columns for audit support
DROP TRIGGER IF EXISTS update_item_ratings_updated_at ON item_ratings;
DROP TRIGGER IF EXISTS update_user_bookmarks_updated_at ON user_bookmarks;

ALTER TABLE user_bookmarks
    DROP COLUMN IF EXISTS updated_at;

ALTER TABLE item_ratings
    DROP COLUMN IF EXISTS updated_at;

COMMIT;
