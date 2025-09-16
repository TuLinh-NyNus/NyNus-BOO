package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"
)

// oauthAccountRepository implementation
type oauthAccountRepository struct {
	db database.QueryExecer
}

// NewOAuthAccountRepository creates a new OAuth account repository
func NewOAuthAccountRepository(db database.QueryExecer) OAuthAccountRepository {
	return &oauthAccountRepository{db: db}
}

// Create creates a new OAuth account
func (r *oauthAccountRepository) Create(ctx context.Context, account *OAuthAccount) error {
	account.ID = util.ULIDNow()
	account.CreatedAt = time.Now()
	account.UpdatedAt = time.Now()

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
		return fmt.Errorf("failed to create OAuth account: %w", err)
	}

	return nil
}

// GetByProviderAccountID gets an OAuth account by provider and account ID
func (r *oauthAccountRepository) GetByProviderAccountID(ctx context.Context, provider, providerAccountID string) (*OAuthAccount, error) {
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
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get OAuth account: %w", err)
	}

	return account, nil
}

// GetByUserID gets all OAuth accounts for a user
func (r *oauthAccountRepository) GetByUserID(ctx context.Context, userID string) ([]*OAuthAccount, error) {
	query := `
		SELECT id, user_id, provider, provider_account_id, type,
			   scope, access_token, refresh_token, id_token,
			   expires_at, token_type, created_at, updated_at
		FROM oauth_accounts
		WHERE user_id = $1
		ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
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
			return nil, fmt.Errorf("failed to scan OAuth account: %w", err)
		}
		accounts = append(accounts, account)
	}

	return accounts, nil
}

// Update updates an OAuth account
func (r *oauthAccountRepository) Update(ctx context.Context, account *OAuthAccount) error {
	account.UpdatedAt = time.Now()

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
		return fmt.Errorf("failed to update OAuth account: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

// Upsert creates or updates an OAuth account
func (r *oauthAccountRepository) Upsert(ctx context.Context, account *OAuthAccount) error {
	// Check if account exists
	existing, err := r.GetByProviderAccountID(ctx, account.Provider, account.ProviderAccountID)
	if err != nil && err != ErrNotFound {
		return err
	}

	if existing != nil {
		// Update existing account
		account.ID = existing.ID
		account.CreatedAt = existing.CreatedAt
		return r.Update(ctx, account)
	}

	// Create new account
	return r.Create(ctx, account)
}

// Delete deletes an OAuth account
func (r *oauthAccountRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM oauth_accounts WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete OAuth account: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}
