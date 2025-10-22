package repository

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"regexp"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"
	"github.com/sirupsen/logrus"
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

var (
	// Validation regex patterns
	ulidRegexToken = regexp.MustCompile(`^[0-9A-HJKMNP-TV-Z]{26}$`)
	uuidRegexToken = regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)
	// TEXT ID pattern for legacy/test accounts: student-001, admin-001, teacher-001, tutor-001
	textIDRegexToken = regexp.MustCompile(`^(student|admin|teacher|tutor)-\d{3}$`)
)

// Validation helpers for refresh token repository
// validateTokenUserID validates user ID format (ULID, UUID, or TEXT ID)
// Accepts:
// - ULID (26 chars): 01K7NCGGHBPQQCBMY1BPHENDBF
// - UUID (36 chars): 0082957e-7fd7-485b-a64a-b302251e380b
// - TEXT ID (pattern-NNN): student-001, admin-001, teacher-001, tutor-001
func validateTokenUserID(userID string) error {
	if userID == "" {
		return fmt.Errorf("user ID cannot be empty")
	}
	// Accept ULID, UUID, or TEXT ID formats
	isULID := len(userID) == 26 && ulidRegexToken.MatchString(userID)
	isUUID := len(userID) == 36 && uuidRegexToken.MatchString(userID)
	isTextID := textIDRegexToken.MatchString(userID)

	if !isULID && !isUUID && !isTextID {
		return fmt.Errorf("invalid user ID format: must be ULID, UUID, or TEXT ID (e.g., student-001)")
	}
	return nil
}

func validateTokenHash(tokenHash string) error {
	if tokenHash == "" {
		return fmt.Errorf("token hash cannot be empty")
	}
	// SHA-256 hash is 64 hex characters
	if len(tokenHash) != 64 {
		return fmt.Errorf("invalid token hash format: must be 64 hex characters")
	}
	return nil
}

func validateTokenFamily(tokenFamily string) error {
	if tokenFamily == "" {
		return fmt.Errorf("token family cannot be empty")
	}
	if !ulidRegexToken.MatchString(tokenFamily) {
		return fmt.Errorf("invalid token family format: must be ULID")
	}
	return nil
}

// RefreshTokenRepository handles refresh token database operations
type RefreshTokenRepository struct {
	db     *sql.DB
	logger *logrus.Logger
}

// NewRefreshTokenRepository creates a new refresh token repository with logger injection
func NewRefreshTokenRepository(db *sql.DB, logger *logrus.Logger) *RefreshTokenRepository {
	// Create default logger if not provided
	if logger == nil {
		logger = logrus.New()
		logger.SetLevel(logrus.InfoLevel)
		logger.SetFormatter(&logrus.JSONFormatter{
			TimestampFormat: time.RFC3339,
			FieldMap: logrus.FieldMap{
				logrus.FieldKeyTime:  "timestamp",
				logrus.FieldKeyLevel: "level",
				logrus.FieldKeyMsg:   "message",
			},
		})
	}

	return &RefreshTokenRepository{
		db:     db,
		logger: logger,
	}
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
	// Validate input
	if err := validateTokenUserID(token.UserID); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "StoreRefreshToken",
			"user_id":   token.UserID,
		}).Error("Invalid user ID format")
		return fmt.Errorf("validation failed: %w", err)
	}
	if err := validateTokenHash(token.TokenHash); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "StoreRefreshToken",
			"user_id":   token.UserID,
		}).Error("Invalid token hash format")
		return fmt.Errorf("validation failed: %w", err)
	}
	if err := validateTokenFamily(token.TokenFamily); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation":    "StoreRefreshToken",
			"user_id":      token.UserID,
			"token_family": token.TokenFamily,
		}).Error("Invalid token family format")
		return fmt.Errorf("validation failed: %w", err)
	}

	// Generate ID if not provided
	if token.ID == "" {
		token.ID = util.ULIDNow()
	}

	r.logger.WithFields(logrus.Fields{
		"operation":    "StoreRefreshToken",
		"token_id":     token.ID,
		"user_id":      token.UserID,
		"token_family": token.TokenFamily,
		"ip_address":   token.IPAddress,
		"expires_at":   token.ExpiresAt,
	}).Info("Storing refresh token")

	query := `
		INSERT INTO refresh_tokens (
			id, user_id, token_hash, token_family, is_active,
			ip_address, user_agent, device_fingerprint, parent_token_hash,
			expires_at, created_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
		)`

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

	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation":    "StoreRefreshToken",
			"token_id":     token.ID,
			"user_id":      token.UserID,
			"token_family": token.TokenFamily,
		}).WithError(err).Error("Failed to store refresh token")
		return fmt.Errorf("failed to store refresh token: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":    "StoreRefreshToken",
		"token_id":     token.ID,
		"user_id":      token.UserID,
		"token_family": token.TokenFamily,
	}).Info("Refresh token stored successfully")

	return nil
}

// GetRefreshTokenByHash retrieves a refresh token by its hash
func (r *RefreshTokenRepository) GetRefreshTokenByHash(ctx context.Context, tokenHash string) (*RefreshToken, error) {
	// Validate input
	if err := validateTokenHash(tokenHash); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetRefreshTokenByHash",
		}).Error("Invalid token hash format")
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "GetRefreshTokenByHash",
	}).Debug("Fetching refresh token by hash")

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
			r.logger.WithFields(logrus.Fields{
				"operation": "GetRefreshTokenByHash",
			}).Warn("Refresh token not found")
			return nil, ErrRefreshTokenNotFound
		}
		r.logger.WithFields(logrus.Fields{
			"operation": "GetRefreshTokenByHash",
		}).WithError(err).Error("Failed to get refresh token by hash")
		return nil, fmt.Errorf("failed to get refresh token: %w", err)
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

	r.logger.WithFields(logrus.Fields{
		"operation":    "GetRefreshTokenByHash",
		"token_id":     token.ID,
		"user_id":      token.UserID,
		"token_family": token.TokenFamily,
		"is_active":    token.IsActive,
	}).Debug("Refresh token fetched successfully")

	return token, nil
}

// ValidateAndUseRefreshToken validates a refresh token and marks it as used
// Returns the token details and whether reuse was detected
func (r *RefreshTokenRepository) ValidateAndUseRefreshToken(ctx context.Context, tokenHash string) (*RefreshToken, bool, error) {
	// Validate input
	if err := validateTokenHash(tokenHash); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "ValidateAndUseRefreshToken",
		}).Error("Invalid token hash format")
		return nil, false, fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "ValidateAndUseRefreshToken",
	}).Debug("Validating refresh token")

	// Begin transaction for atomic operation
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "ValidateAndUseRefreshToken",
		}).WithError(err).Error("Failed to begin transaction")
		return nil, false, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Check if token reuse is detected using the database function
	var reuseDetected bool
	err = tx.QueryRowContext(ctx, "SELECT detect_token_reuse($1)", tokenHash).Scan(&reuseDetected)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "ValidateAndUseRefreshToken",
		}).WithError(err).Error("Failed to check token reuse")
		return nil, false, fmt.Errorf("failed to check token reuse: %w", err)
	}

	// Get token details
	token, err := r.getRefreshTokenByHashTx(ctx, tx, tokenHash)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "ValidateAndUseRefreshToken",
		}).WithError(err).Error("Failed to get token details")
		return nil, false, err
	}

	// If reuse detected, revoke entire token family
	if reuseDetected {
		r.logger.WithFields(logrus.Fields{
			"operation":    "ValidateAndUseRefreshToken",
			"user_id":      token.UserID,
			"token_family": token.TokenFamily,
		}).Warn("Token reuse detected - revoking entire token family")

		_, err = tx.ExecContext(ctx, "SELECT revoke_token_family($1, $2)", token.TokenFamily, "reuse_detected")
		if err != nil {
			r.logger.WithFields(logrus.Fields{
				"operation":    "ValidateAndUseRefreshToken",
				"token_family": token.TokenFamily,
			}).WithError(err).Error("Failed to revoke token family")
			return nil, false, fmt.Errorf("failed to revoke token family: %w", err)
		}

		if err = tx.Commit(); err != nil {
			return nil, false, err
		}

		return token, true, nil
	}

	// Check if token is expired
	if time.Now().After(token.ExpiresAt) {
		r.logger.WithFields(logrus.Fields{
			"operation":  "ValidateAndUseRefreshToken",
			"token_id":   token.ID,
			"user_id":    token.UserID,
			"expires_at": token.ExpiresAt,
		}).Warn("Token expired - revoking")

		// Revoke expired token
		_, err = tx.ExecContext(ctx,
			`UPDATE refresh_tokens
			 SET is_active = FALSE, revoked_at = NOW(), revoked_reason = $2
			 WHERE token_hash = $1`,
			tokenHash, "expired")
		if err != nil {
			r.logger.WithFields(logrus.Fields{
				"operation": "ValidateAndUseRefreshToken",
				"token_id":  token.ID,
			}).WithError(err).Error("Failed to revoke expired token")
			return nil, false, fmt.Errorf("failed to revoke expired token: %w", err)
		}

		if err = tx.Commit(); err != nil {
			return nil, false, err
		}

		return token, false, ErrRefreshTokenExpired
	}

	// Check if token is active
	if !token.IsActive || token.RevokedAt != nil {
		r.logger.WithFields(logrus.Fields{
			"operation":  "ValidateAndUseRefreshToken",
			"token_id":   token.ID,
			"user_id":    token.UserID,
			"is_active":  token.IsActive,
			"revoked_at": token.RevokedAt,
		}).Warn("Token is inactive or revoked")

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
		r.logger.WithFields(logrus.Fields{
			"operation": "ValidateAndUseRefreshToken",
			"token_id":  token.ID,
		}).WithError(err).Error("Failed to update last used time")
		return nil, false, fmt.Errorf("failed to update last used time: %w", err)
	}

	if err = tx.Commit(); err != nil {
		return nil, false, err
	}

	r.logger.WithFields(logrus.Fields{
		"operation":    "ValidateAndUseRefreshToken",
		"token_id":     token.ID,
		"user_id":      token.UserID,
		"token_family": token.TokenFamily,
	}).Info("Token validated successfully")

	return token, false, nil
}

// RotateRefreshToken creates a new refresh token and revokes the old one
func (r *RefreshTokenRepository) RotateRefreshToken(ctx context.Context, oldTokenHash string, newToken *RefreshToken) error {
	// Validate input
	if err := validateTokenHash(oldTokenHash); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "RotateRefreshToken",
		}).Error("Invalid old token hash format")
		return fmt.Errorf("validation failed: %w", err)
	}
	if err := validateTokenHash(newToken.TokenHash); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "RotateRefreshToken",
		}).Error("Invalid new token hash format")
		return fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "RotateRefreshToken",
	}).Info("Rotating refresh token")

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "RotateRefreshToken",
		}).WithError(err).Error("Failed to begin transaction")
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Get old token to inherit family
	oldToken, err := r.getRefreshTokenByHashTx(ctx, tx, oldTokenHash)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "RotateRefreshToken",
		}).WithError(err).Error("Failed to get old token")
		return err
	}

	// Set new token properties
	newToken.TokenFamily = oldToken.TokenFamily
	newToken.ParentTokenHash = oldTokenHash
	newToken.UserID = oldToken.UserID

	r.logger.WithFields(logrus.Fields{
		"operation":    "RotateRefreshToken",
		"user_id":      oldToken.UserID,
		"token_family": oldToken.TokenFamily,
	}).Info("Revoking old token and storing new token")

	// Revoke old token
	_, err = tx.ExecContext(ctx,
		`UPDATE refresh_tokens
		 SET is_active = FALSE, revoked_at = NOW(), revoked_reason = $2
		 WHERE token_hash = $1`,
		oldTokenHash, "token_rotated")
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "RotateRefreshToken",
			"user_id":   oldToken.UserID,
		}).WithError(err).Error("Failed to revoke old token")
		return fmt.Errorf("failed to revoke old token: %w", err)
	}

	// Store new token
	err = r.storeRefreshTokenTx(ctx, tx, newToken)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "RotateRefreshToken",
			"user_id":   oldToken.UserID,
		}).WithError(err).Error("Failed to store new token")
		return fmt.Errorf("failed to store new token: %w", err)
	}

	if err = tx.Commit(); err != nil {
		return err
	}

	r.logger.WithFields(logrus.Fields{
		"operation":    "RotateRefreshToken",
		"user_id":      oldToken.UserID,
		"token_family": oldToken.TokenFamily,
	}).Info("Token rotated successfully")

	return nil
}

// RevokeAllUserTokens revokes all active tokens for a user
func (r *RefreshTokenRepository) RevokeAllUserTokens(ctx context.Context, userID string, reason string) error {
	// Validate input
	if err := validateTokenUserID(userID); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "RevokeAllUserTokens",
			"user_id":   userID,
		}).Error("Invalid user ID format")
		return fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "RevokeAllUserTokens",
		"user_id":   userID,
		"reason":    reason,
	}).Warn("Revoking all user tokens")

	query := `
		UPDATE refresh_tokens
		SET is_active = FALSE, revoked_at = NOW(), revoked_reason = $2
		WHERE user_id = $1 AND is_active = TRUE`

	result, err := r.db.ExecContext(ctx, query, userID, reason)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "RevokeAllUserTokens",
			"user_id":   userID,
		}).WithError(err).Error("Failed to revoke user tokens")
		return fmt.Errorf("failed to revoke user tokens: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	r.logger.WithFields(logrus.Fields{
		"operation":     "RevokeAllUserTokens",
		"user_id":       userID,
		"tokens_revoked": rowsAffected,
	}).Warn("User tokens revoked successfully")

	return nil
}

// RevokeTokenFamily revokes all tokens in a token family
func (r *RefreshTokenRepository) RevokeTokenFamily(ctx context.Context, tokenFamily string, reason string) error {
	// Validate input
	if err := validateTokenFamily(tokenFamily); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation":    "RevokeTokenFamily",
			"token_family": tokenFamily,
		}).Error("Invalid token family format")
		return fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":    "RevokeTokenFamily",
		"token_family": tokenFamily,
		"reason":       reason,
	}).Warn("Revoking token family")

	_, err := r.db.ExecContext(ctx, "SELECT revoke_token_family($1, $2)", tokenFamily, reason)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation":    "RevokeTokenFamily",
			"token_family": tokenFamily,
		}).WithError(err).Error("Failed to revoke token family")
		return fmt.Errorf("failed to revoke token family: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":    "RevokeTokenFamily",
		"token_family": tokenFamily,
	}).Warn("Token family revoked successfully")

	return nil
}

// CleanupExpiredTokens removes expired and old revoked tokens
func (r *RefreshTokenRepository) CleanupExpiredTokens(ctx context.Context) (int, error) {
	r.logger.WithFields(logrus.Fields{
		"operation": "CleanupExpiredTokens",
	}).Info("Cleaning up expired tokens")

	var deletedCount int
	err := r.db.QueryRowContext(ctx, "SELECT cleanup_expired_refresh_tokens()").Scan(&deletedCount)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "CleanupExpiredTokens",
		}).WithError(err).Error("Failed to cleanup expired tokens")
		return 0, fmt.Errorf("failed to cleanup expired tokens: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":     "CleanupExpiredTokens",
		"deleted_count": deletedCount,
	}).Info("Expired tokens cleaned up successfully")

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
