-- Enhanced Auth System Migration
-- Implements 5-role system with Google OAuth support and session management
-- Based on AUTH_COMPLETE_GUIDE.md specification

-- ========================================
-- PART 1: UPDATE EXISTING USERS TABLE
-- ========================================

-- Add new columns to existing users table
ALTER TABLE users 
    -- OAuth fields
    ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS avatar TEXT,
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS school TEXT,
    ADD COLUMN IF NOT EXISTS date_of_birth DATE,
    ADD COLUMN IF NOT EXISTS gender TEXT,
    
    -- Role hierarchy fields
    ADD COLUMN IF NOT EXISTS level INTEGER,
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE',
    
    -- Security fields
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS max_concurrent_sessions INTEGER NOT NULL DEFAULT 3,
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_login_ip TEXT,
    ADD COLUMN IF NOT EXISTS login_attempts INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

-- Update role constraint to support 5 roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('GUEST', 'STUDENT', 'TUTOR', 'TEACHER', 'ADMIN'));

-- Add status constraint
ALTER TABLE users ADD CONSTRAINT users_status_check 
    CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'));

-- Update existing roles to uppercase
UPDATE users SET role = UPPER(role) WHERE role IS NOT NULL;

-- ========================================
-- PART 2: CREATE NEW TABLES
-- ========================================

-- OAuth Accounts table
CREATE TABLE IF NOT EXISTS oauth_accounts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'oauth',
    scope TEXT,
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    device_fingerprint TEXT,
    location TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Resource Access table
CREATE TABLE IF NOT EXISTS resource_access (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    action TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    session_token TEXT,
    is_valid_access BOOLEAN NOT NULL DEFAULT TRUE,
    risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    duration INTEGER,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Course Enrollments table
CREATE TABLE IF NOT EXISTS course_enrollments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' 
        CHECK (status IN ('ACTIVE', 'COMPLETED', 'DROPPED', 'SUSPENDED', 'EXPIRED')),
    access_level TEXT NOT NULL DEFAULT 'BASIC'
        CHECK (access_level IN ('BASIC', 'PREMIUM', 'FULL')),
    max_downloads INTEGER,
    current_downloads INTEGER NOT NULL DEFAULT 0,
    max_streams INTEGER,
    expires_at TIMESTAMPTZ,
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL 
        CHECK (type IN ('SECURITY_ALERT', 'COURSE_UPDATE', 'SYSTEM_MESSAGE', 'ACHIEVEMENT', 'SOCIAL', 'PAYMENT')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- User Preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Notification preferences
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    sms_notifications BOOLEAN NOT NULL DEFAULT FALSE,
    -- Learning preferences
    auto_play_videos BOOLEAN NOT NULL DEFAULT TRUE,
    default_video_quality TEXT NOT NULL DEFAULT '720p'
        CHECK (default_video_quality IN ('480p', '720p', '1080p')),
    playback_speed DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    -- Privacy settings
    profile_visibility TEXT NOT NULL DEFAULT 'PUBLIC'
        CHECK (profile_visibility IN ('PUBLIC', 'FRIENDS', 'PRIVATE')),
    show_online_status BOOLEAN NOT NULL DEFAULT TRUE,
    allow_direct_messages BOOLEAN NOT NULL DEFAULT TRUE,
    -- Localization
    timezone TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    language TEXT NOT NULL DEFAULT 'vi',
    date_format TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT REFERENCES users(id),
    action TEXT NOT NULL,
    resource TEXT,
    resource_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    session_id TEXT,
    success BOOLEAN NOT NULL DEFAULT TRUE,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- PART 3: CREATE INDEXES
-- ========================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_role_level ON users(role, level);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at);

-- OAuth Accounts indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_oauth_provider_account 
    ON oauth_accounts(provider, provider_account_id);
CREATE INDEX IF NOT EXISTS idx_oauth_user_id ON oauth_accounts(user_id);

-- User Sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Resource Access indexes
CREATE INDEX IF NOT EXISTS idx_resource_access_user_id ON resource_access(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_access_resource 
    ON resource_access(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_access_risk ON resource_access(risk_score);

-- Course Enrollments indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_course_enrollments_user_course 
    ON course_enrollments(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(status);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
    ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Audit Logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- ========================================
-- PART 4: CREATE FUNCTIONS & TRIGGERS
-- ========================================

-- Function to validate user role and level combination
CREATE OR REPLACE FUNCTION validate_user_role_level()
RETURNS TRIGGER AS $$
BEGIN
    -- GUEST and ADMIN should not have levels
    IF NEW.role IN ('GUEST', 'ADMIN') AND NEW.level IS NOT NULL THEN
        RAISE EXCEPTION 'Role % cannot have a level', NEW.role;
    END IF;
    
    -- STUDENT, TUTOR, TEACHER must have levels 1-9
    IF NEW.role IN ('STUDENT', 'TUTOR', 'TEACHER') THEN
        IF NEW.level IS NULL OR NEW.level < 1 OR NEW.level > 9 THEN
            RAISE EXCEPTION 'Role % must have a level between 1 and 9', NEW.role;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for role-level validation
CREATE TRIGGER trigger_validate_user_role_level
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION validate_user_role_level();

-- Update trigger for oauth_accounts
CREATE TRIGGER update_oauth_accounts_updated_at 
    BEFORE UPDATE ON oauth_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for course_enrollments
CREATE TRIGGER update_course_enrollments_updated_at 
    BEFORE UPDATE ON course_enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for user_preferences
CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- PART 5: MIGRATE EXISTING DATA
-- ========================================

-- Set default status for existing users
UPDATE users SET status = 'ACTIVE' WHERE status IS NULL;

-- Set email_verified for existing active users
UPDATE users SET email_verified = TRUE WHERE is_active = TRUE;

-- Create default preferences for existing users
INSERT INTO user_preferences (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;

-- ========================================
-- PART 6: ADD COMMENTS
-- ========================================

COMMENT ON TABLE oauth_accounts IS 'OAuth provider accounts linked to users';
COMMENT ON TABLE user_sessions IS 'Active user sessions for multi-device support (max 3)';
COMMENT ON TABLE resource_access IS 'Track and monitor resource access for anti-piracy';
COMMENT ON TABLE course_enrollments IS 'User course enrollments with access control';
COMMENT ON TABLE notifications IS 'User notifications and alerts';
COMMENT ON TABLE user_preferences IS 'User personalization settings';
COMMENT ON TABLE audit_logs IS 'System audit trail for compliance';

COMMENT ON COLUMN users.level IS 'Hierarchy level 1-9 for STUDENT, TUTOR, TEACHER roles';
COMMENT ON COLUMN users.google_id IS 'Google OAuth account ID';
COMMENT ON COLUMN users.max_concurrent_sessions IS 'Maximum concurrent sessions allowed (default 3)';
COMMENT ON COLUMN resource_access.risk_score IS 'Risk score 0-100 based on access patterns';