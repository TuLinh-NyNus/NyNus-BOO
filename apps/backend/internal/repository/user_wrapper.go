package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/common"
)

// userRepositoryWrapper wraps UserRepository to implement IUserRepository
type userRepositoryWrapper struct {
	db       *sql.DB
	userRepo *UserRepository
}

// NewUserRepositoryWrapper creates a new wrapper
func NewUserRepositoryWrapper(db *sql.DB) IUserRepository {
	return &userRepositoryWrapper{
		db:       db,
		userRepo: &UserRepository{},
	}
}

// Create creates a new user
func (w *userRepositoryWrapper) Create(ctx context.Context, user *User) error {
	query := `
		INSERT INTO users (
			id, email, name, password_hash, role, level, 
			username, avatar, google_id, status, email_verified,
			max_concurrent_sessions, is_active, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
		)
	`
	
	name := user.FirstName + " " + user.LastName
	_, err := w.db.ExecContext(ctx, query,
		user.ID, user.Email, name, user.PasswordHash, 
		user.Role.String(), user.Level, user.Username, user.Avatar,
		user.GoogleID, user.Status, user.EmailVerified,
		user.MaxConcurrentSessions, user.IsActive, 
		user.CreatedAt, user.UpdatedAt,
	)
	
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}
	
	return nil
}

// GetByID gets user by ID
func (w *userRepositoryWrapper) GetByID(ctx context.Context, id string) (*User, error) {
	query := `
		SELECT 
			id, email, name, password_hash, role, level,
			username, avatar, google_id, status, email_verified,
			max_concurrent_sessions, last_login_at, last_login_ip,
			login_attempts, locked_until, is_active, created_at, updated_at
		FROM users
		WHERE id = $1
	`
	
	var user User
	var roleStr, statusStr, name string
	var lastLoginAt, lockedUntil sql.NullTime
	var lastLoginIPStr sql.NullString
	
	err := w.db.QueryRowContext(ctx, query, id).Scan(
		&user.ID, &user.Email, &name, &user.PasswordHash,
		&roleStr, &user.Level, &user.Username, &user.Avatar,
		&user.GoogleID, &statusStr, &user.EmailVerified,
		&user.MaxConcurrentSessions, &lastLoginAt, &lastLoginIPStr,
		&user.LoginAttempts, &lockedUntil, &user.IsActive,
		&user.CreatedAt, &user.UpdatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("failed to get user by ID: %w", err)
	}
	
	// Convert string to enum
	user.Role = parseUserRole(roleStr)
	user.Status = statusStr
	
	// Handle nullable fields
	if lastLoginAt.Valid {
		user.LastLoginAt = &lastLoginAt.Time
	}
	if lastLoginIPStr.Valid {
		user.LastLoginIP = lastLoginIPStr.String
	}
	if lockedUntil.Valid {
		user.LockedUntil = &lockedUntil.Time
	}
	
	return &user, nil
}

// GetByEmail gets user by email
func (w *userRepositoryWrapper) GetByEmail(ctx context.Context, email string) (*User, error) {
	query := `
		SELECT 
			id, email, name, password_hash, role, level,
			username, avatar, google_id, status, email_verified,
			max_concurrent_sessions, last_login_at, last_login_ip,
			login_attempts, locked_until, is_active, created_at, updated_at
		FROM users
		WHERE email = $1
	`
	
	var user User
	var roleStr, statusStr, name string
	var lastLoginAt, lockedUntil sql.NullTime
	var lastLoginIPStr sql.NullString
	
	err := w.db.QueryRowContext(ctx, query, email).Scan(
		&user.ID, &user.Email, &name, &user.PasswordHash,
		&roleStr, &user.Level, &user.Username, &user.Avatar,
		&user.GoogleID, &statusStr, &user.EmailVerified,
		&user.MaxConcurrentSessions, &lastLoginAt, &lastLoginIPStr,
		&user.LoginAttempts, &lockedUntil, &user.IsActive,
		&user.CreatedAt, &user.UpdatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}
	
	// Convert string to enum
	user.Role = parseUserRole(roleStr)
	user.Status = statusStr
	
	// Handle nullable fields
	if lastLoginAt.Valid {
		user.LastLoginAt = &lastLoginAt.Time
	}
	if lastLoginIPStr.Valid {
		user.LastLoginIP = lastLoginIPStr.String
	}
	if lockedUntil.Valid {
		user.LockedUntil = &lockedUntil.Time
	}
	
	return &user, nil
}

// GetByGoogleID gets user by Google ID
func (w *userRepositoryWrapper) GetByGoogleID(ctx context.Context, googleID string) (*User, error) {
	query := `
		SELECT 
			id, email, name, password_hash, role, level,
			username, avatar, google_id, status, email_verified,
			max_concurrent_sessions, last_login_at, last_login_ip,
			login_attempts, locked_until, is_active, created_at, updated_at
		FROM users
		WHERE google_id = $1
	`
	
	var user User
	var roleStr, statusStr, name string
	var lastLoginAt, lockedUntil sql.NullTime
	var lastLoginIPStr sql.NullString
	
	err := w.db.QueryRowContext(ctx, query, googleID).Scan(
		&user.ID, &user.Email, &name, &user.PasswordHash,
		&roleStr, &user.Level, &user.Username, &user.Avatar,
		&user.GoogleID, &statusStr, &user.EmailVerified,
		&user.MaxConcurrentSessions, &lastLoginAt, &lastLoginIPStr,
		&user.LoginAttempts, &lockedUntil, &user.IsActive,
		&user.CreatedAt, &user.UpdatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("failed to get user by Google ID: %w", err)
	}
	
	// Convert string to enum
	user.Role = parseUserRole(roleStr)
	user.Status = statusStr
	
	// Handle nullable fields
	if lastLoginAt.Valid {
		user.LastLoginAt = &lastLoginAt.Time
	}
	if lastLoginIPStr.Valid {
		user.LastLoginIP = lastLoginIPStr.String
	}
	if lockedUntil.Valid {
		user.LockedUntil = &lockedUntil.Time
	}
	
	return &user, nil
}

// GetByUsername gets user by username
func (w *userRepositoryWrapper) GetByUsername(ctx context.Context, username string) (*User, error) {
	query := `
		SELECT 
			id, email, name, password_hash, role, level,
			username, avatar, google_id, status, email_verified,
			max_concurrent_sessions, last_login_at, last_login_ip,
			login_attempts, locked_until, is_active, created_at, updated_at
		FROM users
		WHERE username = $1
	`
	
	var user User
	var roleStr, statusStr, name string
	var lastLoginAt, lockedUntil sql.NullTime
	var lastLoginIPStr sql.NullString
	
	err := w.db.QueryRowContext(ctx, query, username).Scan(
		&user.ID, &user.Email, &name, &user.PasswordHash,
		&roleStr, &user.Level, &user.Username, &user.Avatar,
		&user.GoogleID, &statusStr, &user.EmailVerified,
		&user.MaxConcurrentSessions, &lastLoginAt, &lastLoginIPStr,
		&user.LoginAttempts, &lockedUntil, &user.IsActive,
		&user.CreatedAt, &user.UpdatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("failed to get user by username: %w", err)
	}
	
	// Convert string to enum
	user.Role = parseUserRole(roleStr)
	user.Status = statusStr
	
	// Handle nullable fields
	if lastLoginAt.Valid {
		user.LastLoginAt = &lastLoginAt.Time
	}
	if lastLoginIPStr.Valid {
		user.LastLoginIP = lastLoginIPStr.String
	}
	if lockedUntil.Valid {
		user.LockedUntil = &lockedUntil.Time
	}
	
	return &user, nil
}

// Update updates a user
func (w *userRepositoryWrapper) Update(ctx context.Context, user *User) error {
	query := `
		UPDATE users SET
			email = $2,
			name = $3,
			password_hash = $4,
			role = $5,
			level = $6,
			username = $7,
			avatar = $8,
			google_id = $9,
			status = $10,
			email_verified = $11,
			max_concurrent_sessions = $12,
			is_active = $13,
			updated_at = NOW()
		WHERE id = $1
	`
	
	name := user.FirstName + " " + user.LastName
	_, err := w.db.ExecContext(ctx, query,
		user.ID, user.Email, name, user.PasswordHash,
		user.Role.String(), user.Level, user.Username, user.Avatar,
		user.GoogleID, user.Status, user.EmailVerified,
		user.MaxConcurrentSessions, user.IsActive,
	)
	
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}
	
	return nil
}

// UpdateGoogleID updates user's Google ID
func (w *userRepositoryWrapper) UpdateGoogleID(ctx context.Context, userID, googleID string) error {
	query := `
		UPDATE users 
		SET google_id = $2, updated_at = NOW()
		WHERE id = $1
	`
	
	_, err := w.db.ExecContext(ctx, query, userID, googleID)
	if err != nil {
		return fmt.Errorf("failed to update Google ID: %w", err)
	}
	
	return nil
}

// UpdateAvatar updates user's avatar
func (w *userRepositoryWrapper) UpdateAvatar(ctx context.Context, userID, avatar string) error {
	query := `
		UPDATE users 
		SET avatar = $2, updated_at = NOW()
		WHERE id = $1
	`
	
	_, err := w.db.ExecContext(ctx, query, userID, avatar)
	if err != nil {
		return fmt.Errorf("failed to update avatar: %w", err)
	}
	
	return nil
}

// UpdateLastLogin updates last login info
func (w *userRepositoryWrapper) UpdateLastLogin(ctx context.Context, userID, ipAddress string) error {
	query := `
		UPDATE users 
		SET 
			last_login_at = NOW(),
			last_login_ip = $2,
			login_attempts = 0,
			updated_at = NOW()
		WHERE id = $1
	`
	
	_, err := w.db.ExecContext(ctx, query, userID, ipAddress)
	if err != nil {
		return fmt.Errorf("failed to update last login: %w", err)
	}
	
	return nil
}

// IncrementLoginAttempts increments login attempts
func (w *userRepositoryWrapper) IncrementLoginAttempts(ctx context.Context, userID string) error {
	query := `
		UPDATE users 
		SET 
			login_attempts = login_attempts + 1,
			updated_at = NOW()
		WHERE id = $1
	`
	
	_, err := w.db.ExecContext(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("failed to increment login attempts: %w", err)
	}
	
	return nil
}

// ResetLoginAttempts resets login attempts
func (w *userRepositoryWrapper) ResetLoginAttempts(ctx context.Context, userID string) error {
	query := `
		UPDATE users 
		SET 
			login_attempts = 0,
			locked_until = NULL,
			updated_at = NOW()
		WHERE id = $1
	`
	
	_, err := w.db.ExecContext(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("failed to reset login attempts: %w", err)
	}
	
	return nil
}

// LockAccount locks user account
func (w *userRepositoryWrapper) LockAccount(ctx context.Context, userID string, until time.Time) error {
	query := `
		UPDATE users 
		SET 
			locked_until = $2,
			updated_at = NOW()
		WHERE id = $1
	`
	
	_, err := w.db.ExecContext(ctx, query, userID, until)
	if err != nil {
		return fmt.Errorf("failed to lock account: %w", err)
	}
	
	return nil
}

// Delete deletes a user
func (w *userRepositoryWrapper) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM users WHERE id = $1`
	
	_, err := w.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}
	
	return nil
}

// Helper functions to parse enums
func parseUserRole(role string) common.UserRole {
	switch role {
	case "GUEST":
		return common.UserRole_USER_ROLE_GUEST
	case "STUDENT":
		return common.UserRole_USER_ROLE_STUDENT
	case "TUTOR":
		return common.UserRole_USER_ROLE_TUTOR
	case "TEACHER":
		return common.UserRole_USER_ROLE_TEACHER
	case "ADMIN":
		return common.UserRole_USER_ROLE_ADMIN
	default:
		return common.UserRole_USER_ROLE_UNSPECIFIED
	}
}

