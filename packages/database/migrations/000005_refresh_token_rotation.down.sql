-- Rollback Refresh Token Rotation Migration
-- Removes refresh token table and related functions

-- ========================================
-- DROP TRIGGERS
-- ========================================

DROP TRIGGER IF EXISTS refresh_tokens_update_last_used ON refresh_tokens;

-- ========================================
-- DROP FUNCTIONS
-- ========================================

DROP FUNCTION IF EXISTS update_token_last_used();
DROP FUNCTION IF EXISTS detect_token_reuse(TEXT);
DROP FUNCTION IF EXISTS cleanup_expired_refresh_tokens();
DROP FUNCTION IF EXISTS revoke_token_family(TEXT, TEXT);

-- ========================================
-- DROP TABLE
-- ========================================

DROP TABLE IF EXISTS refresh_tokens;