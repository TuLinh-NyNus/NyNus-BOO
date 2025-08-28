-- Enhanced Auth System Migration Example
-- This file shows how to implement the AUTH_COMPLETE_GUIDE.md schema using SQL migrations
-- File: packages/database/migrations/000004_enhanced_auth_system.up.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing users table if needed (for development only)
-- DROP TABLE IF EXISTS users CASCADE;

-- Enhanced Users table for NyNus Auth System
CREATE TABLE IF NOT EXISTS users_enhanced (
    -- ===== CORE REQUIRED FIELDS (MVP) =====
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,    -- REQUIRED - Primary key (cuid)
    email TEXT UNIQUE NOT NULL,                             -- REQUIRED - Login identifier
    role TEXT NOT NULL DEFAULT 'STUDENT'                    -- REQUIRED - Authorization
        CHECK (role IN ('GUEST', 'STUDENT', 'TUTOR', 'TEACHER', 'ADMIN')),
    status TEXT NOT NULL DEFAULT 'ACTIVE'                   -- REQUIRED - Account control
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,          -- REQUIRED - Security
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),          -- REQUIRED - Audit trail
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),          -- REQUIRED - Audit trail

    -- ===== AUTHENTICATION FIELDS (IMPORTANT) =====
    google_id TEXT UNIQUE,                                  -- IMPORTANT - OAuth primary
    password_hash TEXT,                                     -- IMPORTANT - Fallback only (bcrypt)

    -- ===== CORE BUSINESS LOGIC (IMPORTANT) =====
    level INTEGER,                                          -- IMPORTANT - Hierarchy (1-9)
    max_concurrent_sessions INTEGER NOT NULL DEFAULT 3,     -- IMPORTANT - Anti-sharing

    -- ===== SECURITY TRACKING (IMPORTANT) =====
    last_login_at TIMESTAMPTZ,                             -- IMPORTANT - Security monitoring
    last_login_ip TEXT,                                    -- IMPORTANT - Suspicious detection
    login_attempts INTEGER NOT NULL DEFAULT 0,             -- IMPORTANT - Brute force protection
    locked_until TIMESTAMPTZ,                              -- IMPORTANT - Account locking

    -- ===== PROFILE INFORMATION (NICE-TO-HAVE) =====
    username TEXT UNIQUE,                                   -- OPTIONAL - Display name
    first_name TEXT,                                        -- OPTIONAL - From Google/manual
    last_name TEXT,                                         -- OPTIONAL - From Google/manual
    avatar TEXT,                                            -- OPTIONAL - From Google/upload
    bio TEXT,                                               -- OPTIONAL - User description
    phone TEXT,                                             -- OPTIONAL - Contact info
    address TEXT,                                           -- OPTIONAL - Simple address
    school TEXT,                                            -- OPTIONAL - Educational background
    date_of_birth DATE,                                     -- OPTIONAL - Age verification
    gender TEXT,                                            -- OPTIONAL - Analytics

    -- ===== METADATA =====
    resource_path TEXT                                      -- OPTIONAL - File storage path
);

-- OAuth Accounts table for Google/Social login support
CREATE TABLE IF NOT EXISTS oauth_accounts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users_enhanced(id) ON DELETE CASCADE,

    -- Provider Information
    provider TEXT NOT NULL,                                 -- google, facebook, github, etc.
    provider_account_id TEXT NOT NULL,                      -- ID người dùng từ provider

    -- OAuth Token Management
    type TEXT NOT NULL DEFAULT 'oauth',                     -- oauth, oidc
    scope TEXT,                                             -- OAuth scope
    access_token TEXT,                                      -- Token truy cập từ provider
    refresh_token TEXT,                                     -- Token làm mới từ provider
    id_token TEXT,                                          -- ID token từ provider
    expires_at INTEGER,                                     -- Thời gian hết hạn token (Unix timestamp)
    token_type TEXT,                                        -- Bearer, etc.

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Sessions table for multi-device session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users_enhanced(id) ON DELETE CASCADE,

    -- Session Identification
    session_token TEXT UNIQUE NOT NULL,                     -- Unique session identifier
    ip_address TEXT NOT NULL,                               -- Client IP address
    user_agent TEXT,                                        -- Browser/device info

    -- Device Fingerprinting (Browser + OS hash)
    device_fingerprint TEXT,                                -- Hash of browser + OS + screen
    location TEXT,                                          -- Thành phố, Quốc gia từ IP

    -- Session Status & Control
    is_active BOOLEAN NOT NULL DEFAULT TRUE,                -- Session active status
    last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),       -- Last activity timestamp
    expires_at TIMESTAMPTZ NOT NULL,                        -- Session expiry time

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Resource Access table for tracking and anti-piracy
CREATE TABLE IF NOT EXISTS resource_access (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users_enhanced(id) ON DELETE CASCADE,

    -- Resource Information
    resource_type TEXT NOT NULL,                            -- COURSE, LESSON, VIDEO, PDF, EXAM
    resource_id TEXT NOT NULL,                              -- ID của tài nguyên được truy cập

    -- Access Details
    action TEXT NOT NULL,                                   -- VIEW, DOWNLOAD, STREAM, START_EXAM
    ip_address TEXT NOT NULL,                               -- Client IP address
    user_agent TEXT,                                        -- Browser/device info
    session_token TEXT,                                     -- Liên kết đến phiên

    -- Simple Security - Logic cơ bản, không cần AI
    is_valid_access BOOLEAN NOT NULL DEFAULT TRUE,          -- Đánh dấu truy cập đáng nghi
    risk_score INTEGER NOT NULL DEFAULT 0,                  -- Điểm rủi ro 0-100 (tính toán đơn giản)

    -- Additional Data
    duration INTEGER,                                       -- Thời gian truy cập (giây)
    metadata JSONB,                                         -- Dữ liệu bổ sung (tùy chọn)

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Course Enrollments table for access control and progress tracking
CREATE TABLE IF NOT EXISTS course_enrollments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,

    -- Relations
    user_id TEXT NOT NULL REFERENCES users_enhanced(id),
    course_id TEXT NOT NULL,                                -- References courses table

    -- Access Control System
    status TEXT NOT NULL DEFAULT 'ACTIVE'                   -- ACTIVE, COMPLETED, DROPPED, SUSPENDED, EXPIRED
        CHECK (status IN ('ACTIVE', 'COMPLETED', 'DROPPED', 'SUSPENDED', 'EXPIRED')),
    access_level TEXT NOT NULL DEFAULT 'BASIC'              -- BASIC, PREMIUM, FULL
        CHECK (access_level IN ('BASIC', 'PREMIUM', 'FULL')),

    -- Resource Limits - Anti-Piracy Protection
    max_downloads INTEGER,                                  -- Giới hạn tải xuống mỗi đăng ký
    current_downloads INTEGER NOT NULL DEFAULT 0,           -- Theo dõi tải xuống hiện tại
    max_streams INTEGER,                                    -- Giới hạn stream đồng thời

    -- Time-based Access Control
    expires_at TIMESTAMPTZ,                                 -- Hết hạn truy cập khóa học

    -- Progress Tracking
    progress INTEGER NOT NULL DEFAULT 0,                    -- Phần trăm 0-100
    completed_at TIMESTAMPTZ,                               -- Thời gian hoàn thành
    last_accessed_at TIMESTAMPTZ,                           -- Theo dõi truy cập cuối

    -- Timestamps
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications table for user communication
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users_enhanced(id) ON DELETE CASCADE,

    -- Notification Content
    type TEXT NOT NULL                                      -- SECURITY_ALERT, COURSE_UPDATE, SYSTEM_MESSAGE, etc.
        CHECK (type IN ('SECURITY_ALERT', 'COURSE_UPDATE', 'SYSTEM_MESSAGE', 'ACHIEVEMENT', 'SOCIAL', 'PAYMENT')),
    title TEXT NOT NULL,                                    -- Notification title
    message TEXT NOT NULL,                                  -- Notification content
    data JSONB,                                             -- Additional payload

    -- Status Tracking
    is_read BOOLEAN NOT NULL DEFAULT FALSE,                 -- Read status
    read_at TIMESTAMPTZ,                                    -- When notification was read

    -- Lifecycle
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ                                  -- Auto-delete after expiry
);

-- User Preferences table for personalization
CREATE TABLE IF NOT EXISTS user_preferences (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT UNIQUE NOT NULL REFERENCES users_enhanced(id) ON DELETE CASCADE,

    -- ===== NOTIFICATION PREFERENCES =====
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,      -- Email alerts
    push_notifications BOOLEAN NOT NULL DEFAULT TRUE,       -- Mobile push
    sms_notifications BOOLEAN NOT NULL DEFAULT FALSE,       -- SMS alerts

    -- ===== LEARNING PREFERENCES =====
    auto_play_videos BOOLEAN NOT NULL DEFAULT TRUE,         -- Auto-play next video
    default_video_quality TEXT NOT NULL DEFAULT '720p'      -- 480p, 720p, 1080p
        CHECK (default_video_quality IN ('480p', '720p', '1080p')),
    playback_speed DECIMAL(3,2) NOT NULL DEFAULT 1.0,       -- Video playback speed

    -- ===== PRIVACY SETTINGS =====
    profile_visibility TEXT NOT NULL DEFAULT 'PUBLIC'       -- PUBLIC, FRIENDS, PRIVATE
        CHECK (profile_visibility IN ('PUBLIC', 'FRIENDS', 'PRIVATE')),
    show_online_status BOOLEAN NOT NULL DEFAULT TRUE,       -- Show online indicator
    allow_direct_messages BOOLEAN NOT NULL DEFAULT TRUE,    -- Allow DMs from others

    -- ===== LOCALIZATION =====
    timezone TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',      -- User timezone
    language TEXT NOT NULL DEFAULT 'vi',                    -- UI language
    date_format TEXT NOT NULL DEFAULT 'DD/MM/YYYY',         -- Date display format

    -- Timestamps
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit Logs table for compliance and security tracking
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT REFERENCES users_enhanced(id),             -- Nullable for system actions

    -- Action Information
    action TEXT NOT NULL,                                   -- LOGIN, LOGOUT, UPDATE_PROFILE, etc.
    resource TEXT,                                          -- USER, COURSE, ENROLLMENT, etc.
    resource_id TEXT,                                       -- ID of affected resource

    -- Change Tracking
    old_values JSONB,                                       -- Before change (for updates)
    new_values JSONB,                                       -- After change (for updates)

    -- Request Context
    ip_address TEXT NOT NULL,                               -- Client IP address
    user_agent TEXT,                                        -- Browser/device info
    session_id TEXT,                                        -- Link to user session

    -- Additional Context
    success BOOLEAN NOT NULL DEFAULT TRUE,                  -- Action success/failure
    error_message TEXT,                                     -- Error details if failed
    metadata JSONB,                                         -- Additional context data

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== PERFORMANCE INDEXES =====

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users_enhanced(email);                      -- CRITICAL - Login queries
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users_enhanced(google_id);              -- CRITICAL - OAuth queries
CREATE INDEX IF NOT EXISTS idx_users_role_level ON users_enhanced(role, level);           -- IMPORTANT - Permission queries
CREATE INDEX IF NOT EXISTS idx_users_status ON users_enhanced(status);                    -- IMPORTANT - Active user queries
CREATE INDEX IF NOT EXISTS idx_users_username ON users_enhanced(username);                -- NICE-TO-HAVE - Search queries
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users_enhanced(last_login_at);         -- IMPORTANT - Security queries

-- OAuth Accounts indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_oauth_provider_account ON oauth_accounts(provider, provider_account_id);
CREATE INDEX IF NOT EXISTS idx_oauth_user_id ON oauth_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_provider ON oauth_accounts(provider);

-- User Sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_activity ON user_sessions(last_activity);

-- Resource Access indexes
CREATE INDEX IF NOT EXISTS idx_resource_access_user_id ON resource_access(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_access_resource ON resource_access(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_access_created ON resource_access(created_at);
CREATE INDEX IF NOT EXISTS idx_resource_access_valid ON resource_access(is_valid_access);
CREATE INDEX IF NOT EXISTS idx_resource_access_risk ON resource_access(risk_score);
CREATE INDEX IF NOT EXISTS idx_resource_access_ip ON resource_access(ip_address);

-- Course Enrollments indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_course_enrollments_user_course ON course_enrollments(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_expires ON course_enrollments(expires_at);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_accessed ON course_enrollments(last_accessed_at);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);    -- Unread notifications query
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);           -- Recent notifications
CREATE INDEX IF NOT EXISTS idx_notifications_expires ON notifications(expires_at);           -- Cleanup expired notifications
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);                    -- Filter by type

-- User Preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Audit Logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);                    -- User activity queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);                      -- Action type queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource, resource_id);     -- Resource-specific queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);                 -- Time-based queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON audit_logs(success);                    -- Error tracking
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip ON audit_logs(ip_address);                      -- IP-based queries

-- ===== HELPER FUNCTIONS =====

-- Helper function to validate user role and level combination
CREATE OR REPLACE FUNCTION validate_user_role_level(role TEXT, level INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    -- GUEST and ADMIN should not have levels
    IF role IN ('GUEST', 'ADMIN') AND level IS NOT NULL THEN
        RETURN FALSE;
    END IF;

    -- STUDENT, TUTOR, TEACHER should have levels 1-9
    IF role IN ('STUDENT', 'TUTOR', 'TEACHER') AND (level IS NULL OR level < 1 OR level > 9) THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add constraint to users table for role-level validation
ALTER TABLE users_enhanced ADD CONSTRAINT chk_user_role_level
    CHECK (validate_user_role_level(role, level));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users_enhanced
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_oauth_accounts_updated_at
    BEFORE UPDATE ON oauth_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_course_enrollments_updated_at
    BEFORE UPDATE ON course_enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== SAMPLE DATA FOR TESTING =====

-- Insert sample users
INSERT INTO users_enhanced (id, email, role, status, email_verified, first_name, last_name, level) VALUES
('admin-001', 'admin@nynus.com', 'ADMIN', 'ACTIVE', true, 'Admin', 'User', NULL),
('teacher-001', 'teacher@nynus.com', 'TEACHER', 'ACTIVE', true, 'Teacher', 'User', 5),
('student-001', 'student@nynus.com', 'STUDENT', 'ACTIVE', true, 'Student', 'User', 3)
ON CONFLICT (id) DO NOTHING;

-- Insert sample user preferences
INSERT INTO user_preferences (user_id) VALUES
('admin-001'),
('teacher-001'),
('student-001')
ON CONFLICT (user_id) DO NOTHING;

-- Success message
SELECT 'Enhanced Auth System Migration completed successfully!' as message;
