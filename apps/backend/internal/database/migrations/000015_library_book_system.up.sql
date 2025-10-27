-- Migration runner already wraps this in a transaction
-- No need for explicit BEGIN/COMMIT

CREATE TABLE IF NOT EXISTS library_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('exam', 'book', 'video')),
    category TEXT,
    file_url TEXT,
    file_id TEXT,
    thumbnail_url TEXT,
    file_size BIGINT,
    file_type TEXT,
    upload_status TEXT NOT NULL DEFAULT 'pending' CHECK (upload_status IN ('pending', 'approved', 'rejected', 'archived')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    download_count INTEGER NOT NULL DEFAULT 0,
    average_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
    review_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by TEXT REFERENCES users(id),
    approved_by TEXT REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS library_book_metadata (
    id TEXT PRIMARY KEY,
    library_item_id TEXT NOT NULL UNIQUE REFERENCES library_items(id) ON DELETE CASCADE,
    subject TEXT,
    grade TEXT,
    book_type TEXT,
    author TEXT,
    publisher TEXT,
    publication_year INTEGER,
    publication_date DATE,
    isbn TEXT,
    page_count INTEGER,
    required_role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (required_role IN ('GUEST', 'STUDENT', 'TUTOR', 'TEACHER', 'ADMIN')),
    required_level INTEGER,
    target_roles TEXT[] NOT NULL DEFAULT ARRAY['STUDENT','TUTOR'],
    cover_image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS library_tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS library_item_tags (
    library_item_id TEXT NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES library_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (library_item_id, tag_id)
);

CREATE TABLE IF NOT EXISTS library_download_history (
    id TEXT PRIMARY KEY,
    library_item_id TEXT NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id),
    downloaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_library_items_type_active ON library_items(type, is_active);
CREATE INDEX IF NOT EXISTS idx_library_items_category ON library_items(category);
CREATE INDEX IF NOT EXISTS idx_library_book_metadata_author ON library_book_metadata(author);
CREATE INDEX IF NOT EXISTS idx_library_book_metadata_isbn ON library_book_metadata(isbn);
CREATE INDEX IF NOT EXISTS idx_library_download_history_item ON library_download_history(library_item_id);
