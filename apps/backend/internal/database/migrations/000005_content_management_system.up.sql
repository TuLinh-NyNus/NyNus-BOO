-- ===================================================================
-- MIGRATION: 000005_content_management_system
-- PURPOSE: Content management features (MapCode, Parse Errors, Newsletter)
-- CONSOLIDATES: 000010 + 000011 + 000012 + 000005_newsletter
-- DATE: 2025-09-22
-- ===================================================================

-- ========================================
-- PART 1: MAPCODE MANAGEMENT SYSTEM
-- ========================================

-- MapCode Versions table
CREATE TABLE mapcode_versions (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version           VARCHAR(50) NOT NULL UNIQUE,           -- e.g., "v2025-09-22"
    name              VARCHAR(255) NOT NULL,                 -- Display name
    description       TEXT,                                  -- Version description
    file_path         VARCHAR(500) NOT NULL,                 -- Path to MapCode file
    is_active         BOOLEAN NOT NULL DEFAULT false,        -- Only one can be active
    created_by        VARCHAR(255) NOT NULL DEFAULT 'ADMIN', -- User who created
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MapCode Translations table (caching)
CREATE TABLE mapcode_translations (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_id        UUID NOT NULL REFERENCES mapcode_versions(id) ON DELETE CASCADE,
    question_code     VARCHAR(10) NOT NULL,                  -- Question code (ID5/ID6)
    translation       TEXT NOT NULL,                         -- Human-readable translation

    -- Parsed components for efficient querying
    grade             CHAR(1),                               -- Parsed grade
    subject           CHAR(1),                               -- Parsed subject
    chapter           CHAR(1),                               -- Parsed chapter
    level             CHAR(1),                               -- Parsed level
    lesson            CHAR(1),                               -- Parsed lesson
    form              CHAR(1),                               -- Parsed form (nullable)

    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(version_id, question_code)
);

-- Indexes for MapCode system
CREATE INDEX idx_mapcode_versions_is_active ON mapcode_versions(is_active);
CREATE INDEX idx_mapcode_versions_version ON mapcode_versions(version);
CREATE INDEX idx_mapcode_versions_created_at ON mapcode_versions(created_at DESC);
CREATE INDEX idx_mapcode_translations_version_id ON mapcode_translations(version_id);
CREATE INDEX idx_mapcode_translations_question_code ON mapcode_translations(question_code);
CREATE INDEX idx_mapcode_translations_lookup ON mapcode_translations(version_id, question_code);

-- Ensure only one active version at a time
CREATE UNIQUE INDEX idx_mapcode_versions_single_active
ON mapcode_versions(is_active)
WHERE is_active = true;

-- ========================================
-- PART 2: PARSE ERROR SYSTEM
-- ========================================

-- Parse errors table for storing detailed parsing errors
CREATE TABLE parse_errors (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('VALIDATION', 'MISSING_FIELD', 'INVALID_FORMAT', 'UNSUPPORTED', 'STRUCTURAL')),
    severity TEXT NOT NULL CHECK (severity IN ('ERROR', 'WARNING', 'INFO')),
    message TEXT NOT NULL,
    field TEXT,
    suggestion TEXT,
    context TEXT,
    line_number INTEGER,
    column_start INTEGER,
    column_end INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for parse errors
CREATE INDEX idx_parse_errors_question_id ON parse_errors(question_id);
CREATE INDEX idx_parse_errors_type ON parse_errors(type);
CREATE INDEX idx_parse_errors_severity ON parse_errors(severity);
CREATE INDEX idx_parse_errors_created_at ON parse_errors(created_at DESC);

-- ========================================
-- PART 3: BULK IMPORT ERROR SYSTEM
-- ========================================

-- Bulk import errors table
CREATE TABLE bulk_import_errors (
    id TEXT PRIMARY KEY,
    import_session_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    line_number INTEGER,
    error_type TEXT NOT NULL CHECK (error_type IN ('PARSE_ERROR', 'VALIDATION_ERROR', 'DUPLICATE_ERROR', 'SYSTEM_ERROR')),
    error_message TEXT NOT NULL,
    raw_content TEXT,
    suggested_fix TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for bulk import errors
CREATE INDEX idx_bulk_import_errors_session_id ON bulk_import_errors(import_session_id);
CREATE INDEX idx_bulk_import_errors_file_name ON bulk_import_errors(file_name);
CREATE INDEX idx_bulk_import_errors_error_type ON bulk_import_errors(error_type);
CREATE INDEX idx_bulk_import_errors_is_resolved ON bulk_import_errors(is_resolved);
CREATE INDEX idx_bulk_import_errors_created_at ON bulk_import_errors(created_at DESC);

-- ========================================
-- PART 4: NEWSLETTER SYSTEM
-- ========================================

-- Contact submissions table
CREATE TABLE contact_submissions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    message TEXT NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(255),
    status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
    response TEXT,
    responded_at TIMESTAMPTZ,
    responded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Newsletter subscriptions table
CREATE TABLE newsletter_subscriptions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'UNSUBSCRIBED', 'BOUNCED')),
    subscription_source TEXT, -- 'website', 'contact_form', 'manual', etc.
    preferences JSONB, -- Subscription preferences
    confirmed_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for newsletter system
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_priority ON contact_submissions(priority);
CREATE INDEX idx_contact_submissions_assigned_to ON contact_submissions(assigned_to);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

CREATE INDEX idx_newsletter_subscriptions_status ON newsletter_subscriptions(status);
CREATE INDEX idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);
CREATE INDEX idx_newsletter_subscriptions_created_at ON newsletter_subscriptions(created_at DESC);

-- ========================================
-- PART 5: TRIGGERS
-- ========================================

-- Trigger to update updated_at timestamp for MapCode
CREATE OR REPLACE FUNCTION update_mapcode_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mapcode_versions_updated_at
    BEFORE UPDATE ON mapcode_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_mapcode_updated_at();

CREATE TRIGGER trigger_mapcode_translations_updated_at
    BEFORE UPDATE ON mapcode_translations
    FOR EACH ROW
    EXECUTE FUNCTION update_mapcode_updated_at();

-- Update triggers for newsletter system
CREATE TRIGGER update_contact_submissions_updated_at 
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_subscriptions_updated_at 
    BEFORE UPDATE ON newsletter_subscriptions
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- PART 6: INITIAL DATA
-- ========================================

-- Insert default active MapCode version
INSERT INTO mapcode_versions (
    version, 
    name, 
    description, 
    file_path, 
    is_active, 
    created_by
) VALUES (
    'v2025-09-22',
    'Default MapCode Configuration',
    'Initial MapCode configuration for NyNus Question System',
    'docs/resources/latex/mapcode/current/active-mapcode.md',
    true,
    'SYSTEM'
);

-- ========================================
-- PART 7: COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE mapcode_versions IS 'Stores different versions of MapCode configurations with version control';
COMMENT ON TABLE mapcode_translations IS 'Caches translated question codes for performance';
COMMENT ON TABLE parse_errors IS 'Detailed parsing errors for question import/processing';
COMMENT ON TABLE bulk_import_errors IS 'Errors encountered during bulk import operations';
COMMENT ON TABLE contact_submissions IS 'Contact form submissions and support requests';
COMMENT ON TABLE newsletter_subscriptions IS 'Newsletter email subscriptions';

COMMENT ON COLUMN mapcode_versions.version IS 'Version identifier in format v{YYYY-MM-DD}';
COMMENT ON COLUMN mapcode_versions.file_path IS 'Relative path to MapCode markdown file';
COMMENT ON COLUMN mapcode_versions.is_active IS 'Only one version can be active system-wide';
COMMENT ON COLUMN mapcode_translations.question_code IS 'Question code in ID5 or ID6 format';
COMMENT ON COLUMN mapcode_translations.translation IS 'Human-readable translation like "Lớp 10 - Toán học - Chương 1"';

-- Success message
SELECT 'Complete Content Management System created successfully!' as message;
