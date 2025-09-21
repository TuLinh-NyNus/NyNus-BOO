package repository

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"
)

// RefreshToken represents a server-side stored refresh token
type RefreshToken struct {
	ID                string
	UserID            string
	TokenHash         string
	TokenFamily       string
	IsActive          bool
	IPAddress         string
	UserAgent         string
	DeviceFingerprint string
	ParentTokenHash   string
	RevokedAt         *time.Time
	RevokedReason     string
	LastUsedAt        *time.Time
	ExpiresAt         time.Time
	CreatedAt         time.Time
}

// RefreshTokenRepository handles refresh token database operations
type RefreshTokenRepository struct {
	db *sql.DB
}

// NewRefreshTokenRepository creates a new refresh token repository
func NewRefreshTokenRepository(db *sql.DB) *RefreshTokenRepository {
	return &RefreshTokenRepository{db: db}
}

// HashToken creates SHA-256 hash of a token for secure storage
func (r *RefreshTokenRepository) HashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

// GenerateTokenFamily creates a new token family ID
func (r *RefreshTokenRepository) GenerateTokenFamily() string {
	return util.ULIDNow()
}

// StoreRefreshToken stores a new refresh token in the database
func (r *RefreshTokenRepository) StoreRefreshToken(ctx context.Context, token *RefreshToken) error {
	query := `
		INSERT INTO refresh_tokens (
			id, user_id, token_hash, token_family, is_active, 
			ip_address, user_agent, device_fingerprint, parent_token_hash, 
			expires_at, created_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
		)`

	if token.ID == "" {
		token.ID = util.ULIDNow()
	}

	_, err := r.db.ExecContext(ctx, query,
		token.ID,
		token.UserID,
		token.TokenHash,
		token.TokenFamily,
		token.IsActive,
		token.IPAddress,
		token.UserAgent,
		token.DeviceFingerprint,
		nullString(token.ParentTokenHash),
		token.ExpiresAt,
		token.CreatedAt,
	)

	return err
}

// GetRefreshTokenByHash retrieves a refresh token by its hash
func (r *RefreshTokenRepository) GetRefreshTokenByHash(ctx context.Context, tokenHash string) (*RefreshToken, error) {
	query := `
		SELECT id, user_id, token_hash, token_family, is_active,
			   ip_address, user_agent, device_fingerprint, parent_token_hash,
			   revoked_at, revoked_reason, last_used_at, expires_at, created_at
		FROM refresh_tokens 
		WHERE token_hash = $1`

	row := r.db.QueryRowContext(ctx, query, tokenHash)

	token := &RefreshToken{}
	var revokedAt sql.NullTime
	var revokedReason, parentTokenHash, userAgent, deviceFingerprint sql.NullString
	var lastUsedAt sql.NullTime

	err := row.Scan(
		&token.ID,
		&token.UserID,
		&token.TokenHash,
		&token.TokenFamily,
		&token.IsActive,
		&token.IPAddress,
		&userAgent,
		&deviceFingerprint,
		&parentTokenHash,
		&revokedAt,
		&revokedReason,
		&lastUsedAt,
		&token.ExpiresAt,
		&token.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrRefreshTokenNotFound
		}
		return nil, err
	}

	// Handle nullable fields
	if revokedAt.Valid {
		token.RevokedAt = &revokedAt.Time
	}
	if revokedReason.Valid {
		token.RevokedReason = revokedReason.String
	}
	if parentTokenHash.Valid {
		token.ParentTokenHash = parentTokenHash.String
	}
	if userAgent.Valid {
		token.UserAgent = userAgent.String
	}
	if deviceFingerprint.Valid {
		token.DeviceFingerprint = deviceFingerprint.String
	}
	if lastUsedAt.Valid {
		token.LastUsedAt = &lastUsedAt.Time
	}

	return token, nil
}

// ValidateAndUseRefreshToken validates a refresh token and marks it as used
// Returns the token details and whether reuse was detected
func (r *RefreshTokenRepository) ValidateAndUseRefreshToken(ctx context.Context, tokenHash string) (*RefreshToken, bool, error) {
	// Begin transaction for atomic operation
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, false, err
	}
	defer tx.Rollback()

	// Check if token reuse is detected using the database function
	var reuseDetected bool
	err = tx.QueryRowContext(ctx, "SELECT detect_token_reuse($1)", tokenHash).Scan(&reuseDetected)
	if err != nil {
		return nil, false, fmt.Errorf("failed to check token reuse: %w", err)
	}

	// Get token details
	token, err := r.getRefreshTokenByHashTx(ctx, tx, tokenHash)
	if err != nil {
		return nil, false, err
	}

	// If reuse detected, revoke entire token family
	if reuseDetected {
		_, err = tx.ExecContext(ctx, "SELECT revoke_token_family($1, $2)", token.TokenFamily, "reuse_detected")
		if err != nil {
			return nil, false, fmt.Errorf("failed to revoke token family: %w", err)
		}

		if err = tx.Commit(); err != nil {
			return nil, false, err
		}

		return token, true, nil
	}

	// Check if token is expired
	if time.Now().After(token.ExpiresAt) {
		// Revoke expired token
		_, err = tx.ExecContext(ctx,
			`UPDATE refresh_tokens 
			 SET is_active = FALSE, revoked_at = NOW(), revoked_reason = $2
			 WHERE token_hash = $1`,
			tokenHash, "expired")
		if err != nil {
			return nil, false, fmt.Errorf("failed to revoke expired token: %w", err)
		}

		if err = tx.Commit(); err != nil {
			return nil, false, err
		}

		return token, false, ErrRefreshTokenExpired
	}

	// Check if token is active
	if !token.IsActive || token.RevokedAt != nil {
		if err = tx.Commit(); err != nil {
			return nil, false, err
		}
		return token, false, ErrRefreshTokenRevoked
	}

	// Update last_used_at
	_, err = tx.ExecContext(ctx,
		"UPDATE refresh_tokens SET last_used_at = NOW() WHERE token_hash = $1",
		tokenHash)
	if err != nil {
		return nil, false, fmt.Errorf("failed to update last used time: %w", err)
	}

	if err = tx.Commit(); err != nil {
		return nil, false, err
	}

	return token, false, nil
}

// RotateRefreshToken creates a new refresh token and revokes the old one
func (r *RefreshTokenRepository) RotateRefreshToken(ctx context.Context, oldTokenHash string, newToken *RefreshToken) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Get old token to inherit family
	oldToken, err := r.getRefreshTokenByHashTx(ctx, tx, oldTokenHash)
	if err != nil {
		return err
	}

	// Set new token properties
	newToken.TokenFamily = oldToken.TokenFamily
	newToken.ParentTokenHash = oldTokenHash
	newToken.UserID = oldToken.UserID

	// Revoke old token
	_, err = tx.ExecContext(ctx,
		`UPDATE refresh_tokens 
		 SET is_active = FALSE, revoked_at = NOW(), revoked_reason = $2
		 WHERE token_hash = $1`,
		oldTokenHash, "token_rotated")
	if err != nil {
		return fmt.Errorf("failed to revoke old token: %w", err)
	}

	// Store new token
	err = r.storeRefreshTokenTx(ctx, tx, newToken)
	if err != nil {
		return fmt.Errorf("failed to store new token: %w", err)
	}

	return tx.Commit()
}

// RevokeAllUserTokens revokes all active tokens for a user
func (r *RefreshTokenRepository) RevokeAllUserTokens(ctx context.Context, userID string, reason string) error {
	query := `
		UPDATE refresh_tokens 
		SET is_active = FALSE, revoked_at = NOW(), revoked_reason = $2
		WHERE user_id = $1 AND is_active = TRUE`

	_, err := r.db.ExecContext(ctx, query, userID, reason)
	return err
}

// RevokeTokenFamily revokes all tokens in a token family
func (r *RefreshTokenRepository) RevokeTokenFamily(ctx context.Context, tokenFamily string, reason string) error {
	_, err := r.db.ExecContext(ctx, "SELECT revoke_token_family($1, $2)", tokenFamily, reason)
	return err
}

// CleanupExpiredTokens removes expired and old revoked tokens
func (r *RefreshTokenRepository) CleanupExpiredTokens(ctx context.Context) (int, error) {
	var deletedCount int
	err := r.db.QueryRowContext(ctx, "SELECT cleanup_expired_refresh_tokens()").Scan(&deletedCount)
	if err != nil {
		return 0, err
	}
	return deletedCount, nil
}

// GetActiveTokensForUser returns all active tokens for a user
func (r *RefreshTokenRepository) GetActiveTokensForUser(ctx context.Context, userID string) ([]*RefreshToken, error) {
	query := `
		SELECT id, user_id, token_hash, token_family, is_active,
			   ip_address, user_agent, device_fingerprint, parent_token_hash,
			   revoked_at, revoked_reason, last_used_at, expires_at, created_at
		FROM refresh_tokens 
		WHERE user_id = $1 AND is_active = TRUE AND expires_at > NOW()
		ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tokens []*RefreshToken
	for rows.Next() {
		token := &RefreshToken{}
		var revokedAt sql.NullTime
		var revokedReason, parentTokenHash, userAgent, deviceFingerprint sql.NullString
		var lastUsedAt sql.NullTime

		err := rows.Scan(
			&token.ID,
			&token.UserID,
			&token.TokenHash,
			&token.TokenFamily,
			&token.IsActive,
			&token.IPAddress,
			&userAgent,
			&deviceFingerprint,
			&parentTokenHash,
			&revokedAt,
			&revokedReason,
			&lastUsedAt,
			&token.ExpiresAt,
			&token.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Handle nullable fields
		if revokedAt.Valid {
			token.RevokedAt = &revokedAt.Time
		}
		if revokedReason.Valid {
			token.RevokedReason = revokedReason.String
		}
		if parentTokenHash.Valid {
			token.ParentTokenHash = parentTokenHash.String
		}
		if userAgent.Valid {
			token.UserAgent = userAgent.String
		}
		if deviceFingerprint.Valid {
			token.DeviceFingerprint = deviceFingerprint.String
		}
		if lastUsedAt.Valid {
			token.LastUsedAt = &lastUsedAt.Time
		}

		tokens = append(tokens, token)
	}

	return tokens, rows.Err()
}

// Helper functions for transactions

func (r *RefreshTokenRepository) getRefreshTokenByHashTx(ctx context.Context, tx *sql.Tx, tokenHash string) (*RefreshToken, error) {
	query := `
		SELECT id, user_id, token_hash, token_family, is_active,
			   ip_address, user_agent, device_fingerprint, parent_token_hash,
			   revoked_at, revoked_reason, last_used_at, expires_at, created_at
		FROM refresh_tokens 
		WHERE token_hash = $1`

	row := tx.QueryRowContext(ctx, query, tokenHash)

	token := &RefreshToken{}
	var revokedAt sql.NullTime
	var revokedReason, parentTokenHash, userAgent, deviceFingerprint sql.NullString
	var lastUsedAt sql.NullTime

	err := row.Scan(
		&token.ID,
		&token.UserID,
		&token.TokenHash,
		&token.TokenFamily,
		&token.IsActive,
		&token.IPAddress,
		&userAgent,
		&deviceFingerprint,
		&parentTokenHash,
		&revokedAt,
		&revokedReason,
		&lastUsedAt,
		&token.ExpiresAt,
		&token.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrRefreshTokenNotFound
		}
		return nil, err
	}

	// Handle nullable fields
	if revokedAt.Valid {
		token.RevokedAt = &revokedAt.Time
	}
	if revokedReason.Valid {
		token.RevokedReason = revokedReason.String
	}
	if parentTokenHash.Valid {
		token.ParentTokenHash = parentTokenHash.String
	}
	if userAgent.Valid {
		token.UserAgent = userAgent.String
	}
	if deviceFingerprint.Valid {
		token.DeviceFingerprint = deviceFingerprint.String
	}
	if lastUsedAt.Valid {
		token.LastUsedAt = &lastUsedAt.Time
	}

	return token, nil
}

func (r *RefreshTokenRepository) storeRefreshTokenTx(ctx context.Context, tx *sql.Tx, token *RefreshToken) error {
	query := `
		INSERT INTO refresh_tokens (
			id, user_id, token_hash, token_family, is_active, 
			ip_address, user_agent, device_fingerprint, parent_token_hash, 
			expires_at, created_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
		)`

	if token.ID == "" {
		token.ID = util.ULIDNow()
	}

	_, err := tx.ExecContext(ctx, query,
		token.ID,
		token.UserID,
		token.TokenHash,
		token.TokenFamily,
		token.IsActive,
		token.IPAddress,
		token.UserAgent,
		token.DeviceFingerprint,
		nullString(token.ParentTokenHash),
		token.ExpiresAt,
		token.CreatedAt,
	)

	return err
}

// Helper function to handle nullable strings
func nullString(s string) sql.NullString {
	if s == "" {
		return sql.NullString{Valid: false}
	}
	return sql.NullString{String: s, Valid: true}
}
