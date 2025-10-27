package repository

import (
	"context"
	"database/sql"
	"fmt"
	"regexp"
	"time"

	"exam-bank-system/apps/backend/internal/database"
	"exam-bank-system/apps/backend/internal/util"
	"github.com/sirupsen/logrus"
)

var (
	// Validation regex patterns
	ulidRegexOAuth = regexp.MustCompile(`^[0-9A-HJKMNP-TV-Z]{26}$`)
)

// Validation helpers for OAuth account repository
func validateOAuthUserID(userID string) error {
	if userID == "" {
		return fmt.Errorf("user ID cannot be empty")
	}
	if !ulidRegexOAuth.MatchString(userID) {
		return fmt.Errorf("invalid user ID format: must be ULID")
	}
	return nil
}

func validateOAuthAccountID(accountID string) error {
	if accountID == "" {
		return fmt.Errorf("account ID cannot be empty")
	}
	if !ulidRegexOAuth.MatchString(accountID) {
		return fmt.Errorf("invalid account ID format: must be ULID")
	}
	return nil
}

func validateProvider(provider string) error {
	if provider == "" {
		return fmt.Errorf("provider cannot be empty")
	}
	// Valid providers: google, facebook, github
	validProviders := map[string]bool{
		"google":   true,
		"facebook": true,
		"github":   true,
	}
	if !validProviders[provider] {
		return fmt.Errorf("invalid provider: must be google, facebook, or github")
	}
	return nil
}

func validateProviderAccountID(providerAccountID string) error {
	if providerAccountID == "" {
		return fmt.Errorf("provider account ID cannot be empty")
	}
	if len(providerAccountID) < 5 {
		return fmt.Errorf("provider account ID too short: minimum 5 characters")
	}
	return nil
}

// oauthAccountRepository implementation
type oauthAccountRepository struct {
	db     database.QueryExecer
	logger *logrus.Logger
}

// NewOAuthAccountRepository creates a new OAuth account repository with logger injection
func NewOAuthAccountRepository(db database.QueryExecer, logger *logrus.Logger) OAuthAccountRepository {
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

	return &oauthAccountRepository{
		db:     db,
		logger: logger,
	}
}

// Create creates a new OAuth account
func (r *oauthAccountRepository) Create(ctx context.Context, account *OAuthAccount) error {
	// Validate input
	if err := validateOAuthUserID(account.UserID); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "Create",
			"user_id":   account.UserID,
		}).Error("Invalid user ID format")
		return fmt.Errorf("validation failed: %w", err)
	}
	if err := validateProvider(account.Provider); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "Create",
			"user_id":   account.UserID,
			"provider":  account.Provider,
		}).Error("Invalid provider")
		return fmt.Errorf("validation failed: %w", err)
	}
	if err := validateProviderAccountID(account.ProviderAccountID); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation":           "Create",
			"user_id":             account.UserID,
			"provider":            account.Provider,
			"provider_account_id": account.ProviderAccountID,
		}).Error("Invalid provider account ID")
		return fmt.Errorf("validation failed: %w", err)
	}

	// Generate ID and timestamps
	account.ID = util.ULIDNow()
	account.CreatedAt = time.Now()
	account.UpdatedAt = time.Now()

	r.logger.WithFields(logrus.Fields{
		"operation":           "Create",
		"account_id":          account.ID,
		"user_id":             account.UserID,
		"provider":            account.Provider,
		"provider_account_id": account.ProviderAccountID,
	}).Info("Creating OAuth account")

	query := `
		INSERT INTO oauth_accounts (
			id, user_id, provider, provider_account_id, type,
			scope, access_token, refresh_token, id_token,
			expires_at, token_type, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`

	_, err := r.db.ExecContext(ctx, query,
		account.ID,
		account.UserID,
		account.Provider,
		account.ProviderAccountID,
		account.Type,
		account.Scope,
		account.AccessToken,
		account.RefreshToken,
		account.IDToken,
		account.ExpiresAt,
		account.TokenType,
		account.CreatedAt,
		account.UpdatedAt,
	)

	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation":  "Create",
			"account_id": account.ID,
			"user_id":    account.UserID,
			"provider":   account.Provider,
		}).WithError(err).Error("Failed to create OAuth account")
		return fmt.Errorf("failed to create OAuth account: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":  "Create",
		"account_id": account.ID,
		"user_id":    account.UserID,
		"provider":   account.Provider,
	}).Info("OAuth account created successfully")

	return nil
}

// GetByProviderAccountID gets an OAuth account by provider and account ID
func (r *oauthAccountRepository) GetByProviderAccountID(ctx context.Context, provider, providerAccountID string) (*OAuthAccount, error) {
	// Validate input
	if err := validateProvider(provider); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetByProviderAccountID",
			"provider":  provider,
		}).Error("Invalid provider")
		return nil, fmt.Errorf("validation failed: %w", err)
	}
	if err := validateProviderAccountID(providerAccountID); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation":           "GetByProviderAccountID",
			"provider":            provider,
			"provider_account_id": providerAccountID,
		}).Error("Invalid provider account ID")
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":           "GetByProviderAccountID",
		"provider":            provider,
		"provider_account_id": providerAccountID,
	}).Debug("Fetching OAuth account by provider account ID")

	query := `
		SELECT id, user_id, provider, provider_account_id, type,
			   scope, access_token, refresh_token, id_token,
			   expires_at, token_type, created_at, updated_at
		FROM oauth_accounts
		WHERE provider = $1 AND provider_account_id = $2`

	account := &OAuthAccount{}
	err := r.db.QueryRowContext(ctx, query, provider, providerAccountID).Scan(
		&account.ID,
		&account.UserID,
		&account.Provider,
		&account.ProviderAccountID,
		&account.Type,
		&account.Scope,
		&account.AccessToken,
		&account.RefreshToken,
		&account.IDToken,
		&account.ExpiresAt,
		&account.TokenType,
		&account.CreatedAt,
		&account.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			r.logger.WithFields(logrus.Fields{
				"operation":           "GetByProviderAccountID",
				"provider":            provider,
				"provider_account_id": providerAccountID,
			}).Warn("OAuth account not found")
			return nil, ErrNotFound
		}
		r.logger.WithFields(logrus.Fields{
			"operation":           "GetByProviderAccountID",
			"provider":            provider,
			"provider_account_id": providerAccountID,
		}).WithError(err).Error("Failed to get OAuth account")
		return nil, fmt.Errorf("failed to get OAuth account: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":  "GetByProviderAccountID",
		"account_id": account.ID,
		"user_id":    account.UserID,
		"provider":   provider,
	}).Debug("OAuth account fetched successfully")

	return account, nil
}

// GetByUserID gets all OAuth accounts for a user
func (r *oauthAccountRepository) GetByUserID(ctx context.Context, userID string) ([]*OAuthAccount, error) {
	// Validate input
	if err := validateOAuthUserID(userID); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetByUserID",
			"user_id":   userID,
		}).Error("Invalid user ID format")
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "GetByUserID",
		"user_id":   userID,
	}).Debug("Fetching OAuth accounts by user ID")

	query := `
		SELECT id, user_id, provider, provider_account_id, type,
			   scope, access_token, refresh_token, id_token,
			   expires_at, token_type, created_at, updated_at
		FROM oauth_accounts
		WHERE user_id = $1
		ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetByUserID",
			"user_id":   userID,
		}).WithError(err).Error("Failed to get user OAuth accounts")
		return nil, fmt.Errorf("failed to get user OAuth accounts: %w", err)
	}
	defer rows.Close()

	var accounts []*OAuthAccount
	for rows.Next() {
		account := &OAuthAccount{}
		err := rows.Scan(
			&account.ID,
			&account.UserID,
			&account.Provider,
			&account.ProviderAccountID,
			&account.Type,
			&account.Scope,
			&account.AccessToken,
			&account.RefreshToken,
			&account.IDToken,
			&account.ExpiresAt,
			&account.TokenType,
			&account.CreatedAt,
			&account.UpdatedAt,
		)
		if err != nil {
			r.logger.WithFields(logrus.Fields{
				"operation": "GetByUserID",
				"user_id":   userID,
			}).WithError(err).Error("Failed to scan OAuth account")
			return nil, fmt.Errorf("failed to scan OAuth account: %w", err)
		}
		accounts = append(accounts, account)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":      "GetByUserID",
		"user_id":        userID,
		"account_count":  len(accounts),
	}).Debug("OAuth accounts fetched successfully")

	return accounts, nil
}

// Update updates an OAuth account
func (r *oauthAccountRepository) Update(ctx context.Context, account *OAuthAccount) error {
	// Validate input
	if err := validateOAuthAccountID(account.ID); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation":  "Update",
			"account_id": account.ID,
		}).Error("Invalid account ID format")
		return fmt.Errorf("validation failed: %w", err)
	}

	account.UpdatedAt = time.Now()

	r.logger.WithFields(logrus.Fields{
		"operation":  "Update",
		"account_id": account.ID,
		"user_id":    account.UserID,
		"provider":   account.Provider,
	}).Info("Updating OAuth account")

	query := `
		UPDATE oauth_accounts
		SET access_token = $1, refresh_token = $2, id_token = $3,
			expires_at = $4, token_type = $5, scope = $6, updated_at = $7
		WHERE id = $8`

	result, err := r.db.ExecContext(ctx, query,
		account.AccessToken,
		account.RefreshToken,
		account.IDToken,
		account.ExpiresAt,
		account.TokenType,
		account.Scope,
		account.UpdatedAt,
		account.ID,
	)

	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation":  "Update",
			"account_id": account.ID,
		}).WithError(err).Error("Failed to update OAuth account")
		return fmt.Errorf("failed to update OAuth account: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		r.logger.WithFields(logrus.Fields{
			"operation":  "Update",
			"account_id": account.ID,
		}).Warn("OAuth account not found")
		return ErrNotFound
	}

	r.logger.WithFields(logrus.Fields{
		"operation":  "Update",
		"account_id": account.ID,
		"user_id":    account.UserID,
	}).Info("OAuth account updated successfully")

	return nil
}

// Upsert creates or updates an OAuth account
func (r *oauthAccountRepository) Upsert(ctx context.Context, account *OAuthAccount) error {
	// Validate input
	if err := validateProvider(account.Provider); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "Upsert",
			"provider":  account.Provider,
		}).Error("Invalid provider")
		return fmt.Errorf("validation failed: %w", err)
	}
	if err := validateProviderAccountID(account.ProviderAccountID); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation":           "Upsert",
			"provider":            account.Provider,
			"provider_account_id": account.ProviderAccountID,
		}).Error("Invalid provider account ID")
		return fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":           "Upsert",
		"user_id":             account.UserID,
		"provider":            account.Provider,
		"provider_account_id": account.ProviderAccountID,
	}).Info("Upserting OAuth account")

	// Check if account exists
	existing, err := r.GetByProviderAccountID(ctx, account.Provider, account.ProviderAccountID)
	if err != nil && err != ErrNotFound {
		r.logger.WithFields(logrus.Fields{
			"operation": "Upsert",
			"provider":  account.Provider,
		}).WithError(err).Error("Failed to check existing account")
		return err
	}

	if existing != nil {
		// Update existing account
		r.logger.WithFields(logrus.Fields{
			"operation":  "Upsert",
			"account_id": existing.ID,
			"provider":   account.Provider,
		}).Info("Updating existing OAuth account")

		account.ID = existing.ID
		account.CreatedAt = existing.CreatedAt
		return r.Update(ctx, account)
	}

	// Create new account
	r.logger.WithFields(logrus.Fields{
		"operation": "Upsert",
		"provider":  account.Provider,
	}).Info("Creating new OAuth account")

	return r.Create(ctx, account)
}

// Delete deletes an OAuth account
func (r *oauthAccountRepository) Delete(ctx context.Context, id string) error {
	// Validate input
	if err := validateOAuthAccountID(id); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation":  "Delete",
			"account_id": id,
		}).Error("Invalid account ID format")
		return fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation":  "Delete",
		"account_id": id,
	}).Warn("Deleting OAuth account")

	query := `DELETE FROM oauth_accounts WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation":  "Delete",
			"account_id": id,
		}).WithError(err).Error("Failed to delete OAuth account")
		return fmt.Errorf("failed to delete OAuth account: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		r.logger.WithFields(logrus.Fields{
			"operation":  "Delete",
			"account_id": id,
		}).Warn("OAuth account not found")
		return ErrNotFound
	}

	r.logger.WithFields(logrus.Fields{
		"operation":  "Delete",
		"account_id": id,
	}).Warn("OAuth account deleted successfully")

	return nil
}

