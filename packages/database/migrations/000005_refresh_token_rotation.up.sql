-- Refresh Token Rotation Migration
-- Implements server-side refresh token storage for security best practices
-- Enables detection of refresh token reuse attacks

-- ========================================
-- REFRESH TOKENS TABLE
-- ========================================

-- Refresh Tokens table for server-side token storage and rotation
CREATE TABLE IF NOT EXISTS refresh_tokens (
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
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family ON refresh_tokens(token_family);

-- Cleanup and security indexes
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_active ON refresh_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_revoked ON refresh_tokens(revoked_at);

-- Parent-child relationship for rotation chain
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_parent ON refresh_tokens(parent_token_hash);

-- ========================================
-- CONSTRAINTS & BUSINESS RULES
-- ========================================

-- Ensure revoked tokens have revoked_reason
ALTER TABLE refresh_tokens 
    ADD CONSTRAINT refresh_tokens_revoked_reason_check 
    CHECK (
        (revoked_at IS NULL AND revoked_reason IS NULL) OR 
        (revoked_at IS NOT NULL AND revoked_reason IS NOT NULL)
    );

-- Valid revocation reasons
ALTER TABLE refresh_tokens
    ADD CONSTRAINT refresh_tokens_revoked_reason_values_check
    CHECK (
        revoked_reason IS NULL OR 
        revoked_reason IN ('reuse_detected', 'user_logout', 'admin_revoke', 'expired', 'security_breach')
    );

-- ========================================
-- FUNCTIONS FOR TOKEN MANAGEMENT
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

-- Function to clean up expired tokens (for scheduled cleanup)
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

-- Function to detect potential token reuse
CREATE OR REPLACE FUNCTION detect_token_reuse(token_hash_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    token_record RECORD;
    family_active_count INTEGER;
BEGIN
    -- Get token details
    SELECT * INTO token_record
    FROM refresh_tokens 
    WHERE token_hash = token_hash_param;
    
    -- If token doesn't exist, it's not reuse (might be expired/cleaned)
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- If token is already revoked, it's definitely reuse
    IF token_record.revoked_at IS NOT NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Check for multiple active tokens in the same family (suspicious)
    SELECT COUNT(*) INTO family_active_count
    FROM refresh_tokens
    WHERE 
        token_family = token_record.token_family 
        AND is_active = TRUE
        AND id != token_record.id;
    
    -- If there are other active tokens in the family, it might be reuse
    IF family_active_count > 1 THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGERS FOR AUTOMATIC MANAGEMENT
-- ========================================

-- Auto-update last_used_at when token is accessed
CREATE OR REPLACE FUNCTION update_token_last_used()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_used_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for last_used_at updates
CREATE TRIGGER refresh_tokens_update_last_used
    BEFORE UPDATE ON refresh_tokens
    FOR EACH ROW
    WHEN (OLD.last_used_at IS DISTINCT FROM NEW.last_used_at)
    EXECUTE FUNCTION update_token_last_used();

-- ========================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE refresh_tokens IS 'Server-side storage for refresh tokens with rotation support';
COMMENT ON COLUMN refresh_tokens.token_hash IS 'SHA-256 hash of the actual refresh token for security';
COMMENT ON COLUMN refresh_tokens.token_family IS 'Groups related tokens in a rotation chain';
COMMENT ON COLUMN refresh_tokens.parent_token_hash IS 'Links to parent token in rotation chain';
COMMENT ON COLUMN refresh_tokens.revoked_reason IS 'Reason for token revocation: reuse_detected, user_logout, admin_revoke, expired, security_breach';

COMMENT ON FUNCTION revoke_token_family(TEXT, TEXT) IS 'Revokes all tokens in a family when reuse is detected';
COMMENT ON FUNCTION cleanup_expired_refresh_tokens() IS 'Cleanup function for expired and revoked tokens';
COMMENT ON FUNCTION detect_token_reuse(TEXT) IS 'Detects potential refresh token reuse attacks';