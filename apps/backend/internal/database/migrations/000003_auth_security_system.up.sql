-- ===================================================================
-- MIGRATION: 000003_auth_security_system
-- PURPOSE: Complete Authentication & Security System
-- CONSOLIDATES: 000004_enhanced_auth + 000005 (all versions) + 000006-000008
-- DATE: 2025-09-22
-- ===================================================================

-- ========================================
-- PART 1: OAUTH ACCOUNTS TABLE
-- ========================================

CREATE TABLE oauth_accounts (
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

-- ========================================
-- PART 2: USER SESSIONS TABLE
-- ========================================

CREATE TABLE user_sessions (
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

-- ========================================
-- PART 3: REFRESH TOKENS TABLE
-- ========================================

CREATE TABLE refresh_tokens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Token Management
    token_hash TEXT UNIQUE NOT NULL,              -- SHA-256 hash of the actual token
    token_family TEXT NOT NULL,                   -- Family ID to group related tokens  
    is_active BOOLEAN NOT NULL DEFAULT TRUE,      -- Active status
    
    -- Token Metadata
    ip_address TEXT NOT NULL,                     -- IP where token was issued
    user_agent TEXT,                              -- Client user agent
    device_fingerprint TEXT,                      -- Device fingerprint
    
    -- Security & Rotation
    parent_token_hash TEXT,                       -- Hash of the parent token (for rotation chain)
    revoked_at TIMESTAMPTZ,                       -- When token was revoked
    revoked_reason TEXT,                          -- Reason for revocation (reuse, logout, etc.)
    last_used_at TIMESTAMPTZ,                     -- Last time token was used
    
    -- Lifecycle
    expires_at TIMESTAMPTZ NOT NULL,              -- Token expiry (7 days)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- PART 4: EMAIL VERIFICATION TOKENS
-- ========================================

CREATE TABLE email_verification_tokens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- PART 5: LOGIN ATTEMPTS TABLE
-- ========================================

CREATE TABLE login_attempts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT,
    email TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT FALSE,
    failure_reason TEXT,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Foreign key (optional - user might not exist)
    CONSTRAINT fk_login_attempt_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- ========================================
-- PART 5B: ACCOUNT LOCKS TABLE
-- ========================================

CREATE TABLE account_locks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL UNIQUE,
    locked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    locked_until TIMESTAMPTZ NOT NULL,
    lock_reason VARCHAR(255),
    failed_attempts INT DEFAULT 0,
    unlocked_at TIMESTAMPTZ,
    unlocked_by TEXT,

    -- Foreign key
    CONSTRAINT fk_account_lock_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_account_lock_unlocker
        FOREIGN KEY (unlocked_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- ========================================
-- PART 6: PASSWORD RESET TOKENS
-- ========================================

CREATE TABLE password_reset_tokens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- PART 7: NOTIFICATIONS TABLE
-- ========================================

CREATE TABLE notifications (
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

-- ========================================
-- PART 8: USER PREFERENCES TABLE
-- ========================================

CREATE TABLE user_preferences (
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

-- ========================================
-- PART 9: AUDIT LOGS TABLE
-- ========================================

CREATE TABLE audit_logs (
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
-- PART 10: RESOURCE ACCESS TABLE
-- ========================================

CREATE TABLE resource_access (
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

-- ========================================
-- PART 11: COURSE ENROLLMENTS TABLE
-- ========================================

CREATE TABLE course_enrollments (
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

-- ========================================
-- PART 12: INDEXES FOR PERFORMANCE
-- ========================================

-- OAuth Accounts indexes
CREATE UNIQUE INDEX idx_oauth_provider_account ON oauth_accounts(provider, provider_account_id);
CREATE INDEX idx_oauth_user_id ON oauth_accounts(user_id);

-- User Sessions indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Refresh Tokens indexes
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_family ON refresh_tokens(token_family);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_active ON refresh_tokens(is_active);

-- Email Verification indexes
CREATE INDEX idx_verification_token ON email_verification_tokens(token);
CREATE INDEX idx_verification_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_verification_expires_at ON email_verification_tokens(expires_at) WHERE used = FALSE;

-- Login Attempts indexes
CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_attempted_at ON login_attempts(attempted_at DESC);
CREATE INDEX idx_login_attempts_user_id ON login_attempts(user_id) WHERE user_id IS NOT NULL;

-- Account Locks indexes
CREATE INDEX idx_account_locks_active ON account_locks(user_id) WHERE unlocked_at IS NULL;
CREATE INDEX idx_account_locks_user_id ON account_locks(user_id);

-- Password Reset indexes
CREATE INDEX idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_expires_at ON password_reset_tokens(expires_at) WHERE used = FALSE;

-- Notifications indexes
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created ON notifications(created_at);
CREATE INDEX idx_notifications_expires ON notifications(expires_at);

-- Audit Logs indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Resource Access indexes
CREATE INDEX idx_resource_access_user_id ON resource_access(user_id);
CREATE INDEX idx_resource_access_resource ON resource_access(resource_type, resource_id);
CREATE INDEX idx_resource_access_risk ON resource_access(risk_score);

-- Course Enrollments indexes
CREATE UNIQUE INDEX idx_course_enrollments_user_course ON course_enrollments(user_id, course_id);
CREATE INDEX idx_course_enrollments_status ON course_enrollments(status);

-- ========================================
-- PART 13: CONSTRAINTS & BUSINESS RULES
-- ========================================

-- Refresh tokens constraints
ALTER TABLE refresh_tokens
    ADD CONSTRAINT refresh_tokens_revoked_reason_check
    CHECK (
        (revoked_at IS NULL AND revoked_reason IS NULL) OR
        (revoked_at IS NOT NULL AND revoked_reason IS NOT NULL)
    );

ALTER TABLE refresh_tokens
    ADD CONSTRAINT refresh_tokens_revoked_reason_values_check
    CHECK (
        revoked_reason IS NULL OR
        revoked_reason IN ('reuse_detected', 'user_logout', 'admin_revoke', 'expired', 'security_breach')
    );

-- ========================================
-- PART 14: TRIGGERS
-- ========================================

-- Update triggers for updated_at columns
CREATE TRIGGER update_oauth_accounts_updated_at
    BEFORE UPDATE ON oauth_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_enrollments_updated_at
    BEFORE UPDATE ON course_enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- PART 15: SECURITY FUNCTIONS
-- ========================================

-- Function to revoke all tokens in a family (cascade revocation)
CREATE OR REPLACE FUNCTION revoke_token_family(family_id TEXT, reason TEXT DEFAULT 'security_breach')
RETURNS INTEGER AS $$
DECLARE
    revoked_count INTEGER;
BEGIN
    UPDATE refresh_tokens
    SET
        is_active = FALSE,
        revoked_at = NOW(),
        revoked_reason = reason
    WHERE
        token_family = family_id
        AND is_active = TRUE;

    GET DIAGNOSTICS revoked_count = ROW_COUNT;
    RETURN revoked_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_refresh_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM refresh_tokens
    WHERE
        expires_at < NOW() - INTERVAL '30 days'  -- Keep for 30 days after expiry for audit
        OR (revoked_at IS NOT NULL AND revoked_at < NOW() - INTERVAL '7 days');  -- Clean revoked tokens after 7 days

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PART 16: COMMENTS
-- ========================================

COMMENT ON TABLE oauth_accounts IS 'OAuth provider accounts linked to users';
COMMENT ON TABLE user_sessions IS 'Active user sessions for multi-device support (max 3)';
COMMENT ON TABLE refresh_tokens IS 'Server-side storage for refresh tokens with rotation support';
COMMENT ON TABLE resource_access IS 'Track and monitor resource access for anti-piracy';
COMMENT ON TABLE course_enrollments IS 'User course enrollments with access control';
COMMENT ON TABLE notifications IS 'User notifications and alerts';
COMMENT ON TABLE user_preferences IS 'User personalization settings';
COMMENT ON TABLE audit_logs IS 'System audit trail for compliance';

-- Success message
SELECT 'Complete Authentication & Security System created successfully!' as message;
