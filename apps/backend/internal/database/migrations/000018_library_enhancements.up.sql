-- Migration runner already wraps this in a transaction
-- No need for explicit BEGIN/COMMIT

-- Ensure item_ratings has audit column and trigger
ALTER TABLE item_ratings
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE item_ratings
SET updated_at = created_at
WHERE updated_at IS DISTINCT FROM created_at;

DROP TRIGGER IF EXISTS update_item_ratings_updated_at ON item_ratings;
CREATE TRIGGER update_item_ratings_updated_at
    BEFORE UPDATE ON item_ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ensure user_bookmarks has audit column and trigger
ALTER TABLE user_bookmarks
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE user_bookmarks
SET updated_at = created_at
WHERE updated_at IS DISTINCT FROM created_at;

DROP TRIGGER IF EXISTS update_user_bookmarks_updated_at ON user_bookmarks;
CREATE TRIGGER update_user_bookmarks_updated_at
    BEFORE UPDATE ON user_bookmarks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add filter indexes for video metadata lookups
CREATE INDEX IF NOT EXISTS idx_video_metadata_subject_grade ON video_metadata(subject, grade);
CREATE INDEX IF NOT EXISTS idx_video_metadata_quality ON video_metadata(quality);
CREATE INDEX IF NOT EXISTS idx_video_metadata_instructor ON video_metadata(instructor_name);
CREATE INDEX IF NOT EXISTS idx_video_metadata_required_role ON video_metadata(required_role);
CREATE INDEX IF NOT EXISTS idx_video_metadata_required_level ON video_metadata(required_level);

-- Add filter indexes for book metadata lookups
CREATE INDEX IF NOT EXISTS idx_book_metadata_subject_grade ON book_metadata(subject, grade);
CREATE INDEX IF NOT EXISTS idx_book_metadata_book_type ON book_metadata(book_type);
CREATE INDEX IF NOT EXISTS idx_book_metadata_required_role ON book_metadata(required_role);
CREATE INDEX IF NOT EXISTS idx_book_metadata_required_level ON book_metadata(required_level);

-- Strengthen exam metadata filtering options
CREATE INDEX IF NOT EXISTS idx_exam_metadata_required_role ON exam_metadata(required_role);
CREATE INDEX IF NOT EXISTS idx_exam_metadata_required_level ON exam_metadata(required_level);

-- Tag filtering support
CREATE INDEX IF NOT EXISTS idx_item_tags_tag ON item_tags(tag_id);

-- Download history lookup by user
CREATE INDEX IF NOT EXISTS idx_download_history_user ON download_history(user_id);
