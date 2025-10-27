-- Rename tables to align with design specification (docs/arch/LIBRARY_IMPLEMENT.md)
ALTER TABLE IF EXISTS library_book_metadata RENAME TO book_metadata;
ALTER TABLE IF EXISTS library_tags RENAME TO tags;
ALTER TABLE IF EXISTS library_item_tags RENAME TO item_tags;
ALTER TABLE IF EXISTS library_download_history RENAME TO download_history;

-- Rename related indexes to match new table names
ALTER INDEX IF EXISTS idx_library_book_metadata_author RENAME TO idx_book_metadata_author;
ALTER INDEX IF EXISTS idx_library_book_metadata_isbn RENAME TO idx_book_metadata_isbn;
ALTER INDEX IF EXISTS idx_library_download_history_item RENAME TO idx_download_history_item;

-- Ensure created_at/updated_at columns exist on renamed tables (already present in migration 000015)

-- Create Exam Metadata table per design
CREATE TABLE IF NOT EXISTS exam_metadata (
    id TEXT PRIMARY KEY,
    library_item_id TEXT NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    grade TEXT NOT NULL,
    province TEXT,
    school TEXT,
    academic_year TEXT NOT NULL,
    semester TEXT,
    exam_duration INTEGER,
    question_count INTEGER,
    difficulty_level TEXT CHECK (difficulty_level IN ('easy','medium','hard')),
    exam_type TEXT NOT NULL,
    required_role TEXT DEFAULT 'STUDENT' CHECK (required_role IN ('GUEST','STUDENT','TUTOR','TEACHER','ADMIN')),
    required_level INTEGER CHECK (required_level >= 1 AND required_level <= 9),
    target_roles TEXT[] DEFAULT ARRAY['STUDENT'],
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Video Metadata table per design
CREATE TABLE IF NOT EXISTS video_metadata (
    id TEXT PRIMARY KEY,
    library_item_id TEXT NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
    youtube_url TEXT NOT NULL,
    youtube_id TEXT NOT NULL,
    duration INTEGER,
    quality TEXT DEFAULT '720p',
    instructor_name TEXT,
    related_exam_id TEXT REFERENCES library_items(id),
    subject TEXT NOT NULL,
    grade TEXT NOT NULL,
    required_role TEXT DEFAULT 'STUDENT' CHECK (required_role IN ('GUEST','STUDENT','TUTOR','TEACHER','ADMIN')),
    required_level INTEGER CHECK (required_level >= 1 AND required_level <= 9),
    target_roles TEXT[] DEFAULT ARRAY['STUDENT','TUTOR','TEACHER'],
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Item Ratings table
CREATE TABLE IF NOT EXISTS item_ratings (
    id TEXT PRIMARY KEY,
    library_item_id TEXT NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (library_item_id, user_id)
);

-- Create User Bookmarks table
CREATE TABLE IF NOT EXISTS user_bookmarks (
    id TEXT PRIMARY KEY,
    library_item_id TEXT NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (library_item_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_exam_metadata_item ON exam_metadata(library_item_id);
CREATE INDEX IF NOT EXISTS idx_exam_metadata_subject_grade ON exam_metadata(subject, grade);
CREATE INDEX IF NOT EXISTS idx_exam_metadata_difficulty ON exam_metadata(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_exam_metadata_exam_type ON exam_metadata(exam_type);
CREATE INDEX IF NOT EXISTS idx_video_metadata_item ON video_metadata(library_item_id);
CREATE INDEX IF NOT EXISTS idx_video_metadata_youtube_id ON video_metadata(youtube_id);
CREATE INDEX IF NOT EXISTS idx_item_ratings_item ON item_ratings(library_item_id);
CREATE INDEX IF NOT EXISTS idx_item_ratings_user ON item_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_item ON user_bookmarks(library_item_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user ON user_bookmarks(user_id);

-- Triggers to maintain updated_at
DROP TRIGGER IF EXISTS update_library_items_updated_at ON library_items;
CREATE TRIGGER update_library_items_updated_at
    BEFORE UPDATE ON library_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_book_metadata_updated_at ON book_metadata;
CREATE TRIGGER update_book_metadata_updated_at
    BEFORE UPDATE ON book_metadata
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_exam_metadata_updated_at ON exam_metadata;
CREATE TRIGGER update_exam_metadata_updated_at
    BEFORE UPDATE ON exam_metadata
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_video_metadata_updated_at ON video_metadata;
CREATE TRIGGER update_video_metadata_updated_at
    BEFORE UPDATE ON video_metadata
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
