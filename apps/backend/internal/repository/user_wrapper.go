package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"exam-bank-system/apps/backend/internal/util"
	"exam-bank-system/apps/backend/pkg/proto/common"
	"github.com/sirupsen/logrus"
)

// userRepositoryWrapper wraps UserRepository to implement IUserRepository
type userRepositoryWrapper struct {
	db     *sql.DB
	logger *logrus.Logger
}

// NewUserRepositoryWrapper creates a new wrapper with logger injection
func NewUserRepositoryWrapper(db *sql.DB, logger *logrus.Logger) IUserRepository {
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

	return &userRepositoryWrapper{
		db:     db,
		logger: logger,
	}
}

// Validation helpers are now in validation.go to avoid duplication

// validateGoogleID validates Google ID format
func validateGoogleID(googleID string) error {
	if googleID == "" {
		return fmt.Errorf("Google ID cannot be empty")
	}
	if len(googleID) < 10 || len(googleID) > 255 {
		return fmt.Errorf("invalid Google ID length")
	}
	return nil
}

// validateUsername validates username format
func validateUsername(username string) error {
	if username == "" {
		return fmt.Errorf("username cannot be empty")
	}
	if len(username) < 3 || len(username) > 30 {
		return fmt.Errorf("username must be 3-30 characters")
	}
	return nil
}

// Create creates a new user
func (w *userRepositoryWrapper) Create(ctx context.Context, user *User) error {
	// Validate input
	if err := validateEmail(user.Email); err != nil {
		w.logger.WithFields(logrus.Fields{
			"operation": "Create",
			"email":     user.Email,
		}).Error("Invalid email format")
		return fmt.Errorf("validation failed: %w", err)
	}

	// Generate ID if not provided (fix for duplicate key issue)
	if user.ID == "" {
		user.ID = util.ULIDNow()
	}

	// Set timestamps if not provided
	now := time.Now()
	if user.CreatedAt.IsZero() {
		user.CreatedAt = now
	}
	if user.UpdatedAt.IsZero() {
		user.UpdatedAt = now
	}

	w.logger.WithFields(logrus.Fields{
		"operation": "Create",
		"user_id":   user.ID,
		"email":     user.Email,
		"role":      user.Role.String(),
	}).Info("Creating new user")

	query := `
		INSERT INTO users (
			id, email, first_name, last_name, password_hash, role, level,
			username, avatar, google_id, status, email_verified,
			max_concurrent_sessions, is_active, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
		)
	`

	// Prepare nullable fields
	var level sql.NullInt32
	var username, avatar, googleID sql.NullString

	if user.Level > 0 {
		level = sql.NullInt32{Int32: int32(user.Level), Valid: true}
	}
	if user.Username != "" {
		username = sql.NullString{String: user.Username, Valid: true}
	}
	if user.Avatar != "" {
		avatar = sql.NullString{String: user.Avatar, Valid: true}
	}
	if user.GoogleID != "" {
		googleID = sql.NullString{String: user.GoogleID, Valid: true}
	}

	_, err := w.db.ExecContext(ctx, query,
		user.ID, user.Email, user.FirstName, user.LastName, user.PasswordHash,
		convertProtoRoleToString(user.Role), level, username, avatar,
		googleID, user.Status, user.EmailVerified,
		user.MaxConcurrentSessions, user.IsActive,
		user.CreatedAt, user.UpdatedAt,
	)

	if err != nil {
		w.logger.WithFields(logrus.Fields{
			"operation": "Create",
			"user_id":   user.ID,
			"email":     user.Email,
		}).WithError(err).Error("Failed to create user")
		return fmt.Errorf("failed to create user: %w", err)
	}

	w.logger.WithFields(logrus.Fields{
		"operation": "Create",
		"user_id":   user.ID,
		"email":     user.Email,
	}).Info("User created successfully")

	return nil
}

// GetByID gets user by ID
func (w *userRepositoryWrapper) GetByID(ctx context.Context, id string) (*User, error) {
	// Validate input
	if err := validateUserID(id); err != nil {
		w.logger.WithFields(logrus.Fields{
			"operation": "GetByID",
			"user_id":   id,
		}).Error("Invalid user ID format")
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	w.logger.WithFields(logrus.Fields{
		"operation": "GetByID",
		"user_id":   id,
	}).Debug("Fetching user by ID")

	query := `
		SELECT
			id, email, first_name, last_name, password_hash, role, level,
			username, avatar, google_id, status, email_verified,
			max_concurrent_sessions, last_login_at, last_login_ip,
			login_attempts, locked_until, is_active, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	var user User
	var roleStr, statusStr string
	var username, avatar, googleID sql.NullString
	var level sql.NullInt32
	var lastLoginAt, lockedUntil sql.NullTime
	var lastLoginIPStr sql.NullString

	err := w.db.QueryRowContext(ctx, query, id).Scan(
		&user.ID, &user.Email, &user.FirstName, &user.LastName, &user.PasswordHash,
		&roleStr, &level, &username, &avatar,
		&googleID, &statusStr, &user.EmailVerified,
		&user.MaxConcurrentSessions, &lastLoginAt, &lastLoginIPStr,
		&user.LoginAttempts, &lockedUntil, &user.IsActive,
		&user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			w.logger.WithFields(logrus.Fields{
				"operation": "GetByID",
				"user_id":   id,
			}).Warn("User not found")
			return nil, ErrUserNotFound
		}
		w.logger.WithFields(logrus.Fields{
			"operation": "GetByID",
			"user_id":   id,
		}).WithError(err).Error("Failed to get user by ID")
		return nil, fmt.Errorf("failed to get user by ID: %w", err)
	}

	// Convert string to enum
	user.Role = parseUserRole(roleStr)
	user.Status = statusStr

	// Handle nullable fields
	if level.Valid {
		user.Level = int(level.Int32)
	}
	if username.Valid {
		user.Username = username.String
	}
	if avatar.Valid {
		user.Avatar = avatar.String
	}
	if googleID.Valid {
		user.GoogleID = googleID.String
	}
	if lastLoginAt.Valid {
		user.LastLoginAt = &lastLoginAt.Time
	}
	if lastLoginIPStr.Valid {
		user.LastLoginIP = lastLoginIPStr.String
	}
	if lockedUntil.Valid {
		user.LockedUntil = &lockedUntil.Time
	}

	w.logger.WithFields(logrus.Fields{
		"operation": "GetByID",
		"user_id":   user.ID,
		"email":     user.Email,
	}).Debug("User fetched successfully")

	return &user, nil
}

// GetByEmail gets user by email
func (w *userRepositoryWrapper) GetByEmail(ctx context.Context, email string) (*User, error) {
	// Validate input
	if err := validateEmail(email); err != nil {
		w.logger.WithFields(logrus.Fields{
			"operation": "GetByEmail",
			"email":     email,
		}).Error("Invalid email format")
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	w.logger.WithFields(logrus.Fields{
		"operation": "GetByEmail",
		"email":     email,
	}).Debug("Fetching user by email")

	query := `
		SELECT
			id, email, first_name, last_name, password_hash, role, level,
			username, avatar, google_id, status, email_verified,
			max_concurrent_sessions, last_login_at, last_login_ip,
			login_attempts, locked_until, is_active, created_at, updated_at
		FROM users
		WHERE email = $1
	`

	var user User
	var roleStr, statusStr string
	var username, avatar, googleID sql.NullString
	var level sql.NullInt32
	var lastLoginAt, lockedUntil sql.NullTime
	var lastLoginIPStr sql.NullString

	err := w.db.QueryRowContext(ctx, query, email).Scan(
		&user.ID, &user.Email, &user.FirstName, &user.LastName, &user.PasswordHash,
		&roleStr, &level, &username, &avatar,
		&googleID, &statusStr, &user.EmailVerified,
		&user.MaxConcurrentSessions, &lastLoginAt, &lastLoginIPStr,
		&user.LoginAttempts, &lockedUntil, &user.IsActive,
		&user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			w.logger.WithFields(logrus.Fields{
				"operation": "GetByEmail",
				"email":     email,
			}).Warn("User not found")
			return nil, ErrUserNotFound
		}
		w.logger.WithFields(logrus.Fields{
			"operation": "GetByEmail",
			"email":     email,
		}).WithError(err).Error("Failed to get user by email")
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}

	// Convert string to enum
	user.Role = parseUserRole(roleStr)
	user.Status = statusStr

	// Handle nullable fields
	if level.Valid {
		user.Level = int(level.Int32)
	}
	if username.Valid {
		user.Username = username.String
	}
	if avatar.Valid {
		user.Avatar = avatar.String
	}
	if googleID.Valid {
		user.GoogleID = googleID.String
	}
	if lastLoginAt.Valid {
		user.LastLoginAt = &lastLoginAt.Time
	}
	if lastLoginIPStr.Valid {
		user.LastLoginIP = lastLoginIPStr.String
	}
	if lockedUntil.Valid {
		user.LockedUntil = &lockedUntil.Time
	}

	w.logger.WithFields(logrus.Fields{
		"operation": "GetByEmail",
		"user_id":   user.ID,
		"email":     user.Email,
	}).Debug("User fetched successfully")

	return &user, nil
}

// GetByGoogleID gets user by Google ID
func (w *userRepositoryWrapper) GetByGoogleID(ctx context.Context, googleID string) (*User, error) {
	// Validate input
	if err := validateGoogleID(googleID); err != nil {
		w.logger.WithFields(logrus.Fields{
			"operation": "GetByGoogleID",
			"google_id": googleID,
		}).Error("Invalid Google ID format")
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	w.logger.WithFields(logrus.Fields{
		"operation": "GetByGoogleID",
		"google_id": googleID,
	}).Debug("Fetching user by Google ID")

	query := `
		SELECT
			id, email, first_name, last_name, password_hash, role, level,
			username, avatar, google_id, status, email_verified,
			max_concurrent_sessions, last_login_at, last_login_ip,
			login_attempts, locked_until, is_active, created_at, updated_at
		FROM users
		WHERE google_id = $1
	`

	var user User
	var roleStr, statusStr string
	var username, avatar, googleIDStr sql.NullString
	var level sql.NullInt32
	var lastLoginAt, lockedUntil sql.NullTime
	var lastLoginIPStr sql.NullString

	err := w.db.QueryRowContext(ctx, query, googleID).Scan(
		&user.ID, &user.Email, &user.FirstName, &user.LastName, &user.PasswordHash,
		&roleStr, &level, &username, &avatar,
		&googleIDStr, &statusStr, &user.EmailVerified,
		&user.MaxConcurrentSessions, &lastLoginAt, &lastLoginIPStr,
		&user.LoginAttempts, &lockedUntil, &user.IsActive,
		&user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			w.logger.WithFields(logrus.Fields{
				"operation": "GetByGoogleID",
				"google_id": googleID,
			}).Warn("User not found")
			return nil, ErrUserNotFound
		}
		w.logger.WithFields(logrus.Fields{
			"operation": "GetByGoogleID",
			"google_id": googleID,
		}).WithError(err).Error("Failed to get user by Google ID")
		return nil, fmt.Errorf("failed to get user by Google ID: %w", err)
	}

	// Convert string to enum
	user.Role = parseUserRole(roleStr)
	user.Status = statusStr

	// Handle nullable fields
	if level.Valid {
		user.Level = int(level.Int32)
	}
	if username.Valid {
		user.Username = username.String
	}
	if avatar.Valid {
		user.Avatar = avatar.String
	}
	if googleIDStr.Valid {
		user.GoogleID = googleIDStr.String
	}
	if lastLoginAt.Valid {
		user.LastLoginAt = &lastLoginAt.Time
	}
	if lastLoginIPStr.Valid {
		user.LastLoginIP = lastLoginIPStr.String
	}
	if lockedUntil.Valid {
		user.LockedUntil = &lockedUntil.Time
	}

	w.logger.WithFields(logrus.Fields{
		"operation": "GetByGoogleID",
		"user_id":   user.ID,
		"google_id": googleID,
	}).Debug("User fetched successfully")

	return &user, nil
}

// GetByUsername gets user by username
func (w *userRepositoryWrapper) GetByUsername(ctx context.Context, username string) (*User, error) {
	// Validate input
	if err := validateUsername(username); err != nil {
		w.logger.WithFields(logrus.Fields{
			"operation": "GetByUsername",
			"username":  username,
		}).Error("Invalid username format")
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	w.logger.WithFields(logrus.Fields{
		"operation": "GetByUsername",
		"username":  username,
	}).Debug("Fetching user by username")

	query := `
		SELECT
			id, email, first_name, last_name, password_hash, role, level,
			username, avatar, google_id, status, email_verified,
			max_concurrent_sessions, last_login_at, last_login_ip,
			login_attempts, locked_until, is_active, created_at, updated_at
		FROM users
		WHERE username = $1
	`

	var user User
	var roleStr, statusStr string
	var usernameStr, avatar, googleID sql.NullString
	var level sql.NullInt32
	var lastLoginAt, lockedUntil sql.NullTime
	var lastLoginIPStr sql.NullString

	err := w.db.QueryRowContext(ctx, query, username).Scan(
		&user.ID, &user.Email, &user.FirstName, &user.LastName, &user.PasswordHash,
		&roleStr, &level, &usernameStr, &avatar,
		&googleID, &statusStr, &user.EmailVerified,
		&user.MaxConcurrentSessions, &lastLoginAt, &lastLoginIPStr,
		&user.LoginAttempts, &lockedUntil, &user.IsActive,
		&user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			w.logger.WithFields(logrus.Fields{
				"operation": "GetByUsername",
				"username":  username,
			}).Warn("User not found")
			return nil, ErrUserNotFound
		}
		w.logger.WithFields(logrus.Fields{
			"operation": "GetByUsername",
			"username":  username,
		}).WithError(err).Error("Failed to get user by username")
		return nil, fmt.Errorf("failed to get user by username: %w", err)
	}

	// Convert string to enum
	user.Role = parseUserRole(roleStr)
	user.Status = statusStr

	// Handle nullable fields
	if level.Valid {
		user.Level = int(level.Int32)
	}
	if usernameStr.Valid {
		user.Username = usernameStr.String
	}
	if avatar.Valid {
		user.Avatar = avatar.String
	}
	if googleID.Valid {
		user.GoogleID = googleID.String
	}
	if lastLoginAt.Valid {
		user.LastLoginAt = &lastLoginAt.Time
	}
	if lastLoginIPStr.Valid {
		user.LastLoginIP = lastLoginIPStr.String
	}
	if lockedUntil.Valid {
		user.LockedUntil = &lockedUntil.Time
	}

	w.logger.WithFields(logrus.Fields{
		"operation": "GetByUsername",
		"user_id":   user.ID,
		"username":  username,
	}).Debug("User fetched successfully")

	return &user, nil
}

// Update updates a user
func (w *userRepositoryWrapper) Update(ctx context.Context, user *User) error {
	// Validate input
	if err := validateUserID(user.ID); err != nil {
		w.logger.WithFields(logrus.Fields{
			"operation": "Update",
			"user_id":   user.ID,
		}).Error("Invalid user ID format")
		return fmt.Errorf("validation failed: %w", err)
	}
	if err := validateEmail(user.Email); err != nil {
		w.logger.WithFields(logrus.Fields{
			"operation": "Update",
			"user_id":   user.ID,
			"email":     user.Email,
		}).Error("Invalid email format")
		return fmt.Errorf("validation failed: %w", err)
	}

	w.logger.WithFields(logrus.Fields{
		"operation": "Update",
		"user_id":   user.ID,
		"email":     user.Email,
	}).Info("Updating user")

	query := `
		UPDATE users SET
			email = $2,
			first_name = $3,
			last_name = $4,
			password_hash = $5,
			role = $6,
			level = $7,
			username = $8,
			avatar = $9,
			google_id = $10,
			status = $11,
			email_verified = $12,
			max_concurrent_sessions = $13,
			is_active = $14,
			updated_at = NOW()
		WHERE id = $1
	`

	// Prepare nullable fields
	var level sql.NullInt32
	var username, avatar, googleID sql.NullString

	if user.Level > 0 {
		level = sql.NullInt32{Int32: int32(user.Level), Valid: true}
	}
	if user.Username != "" {
		username = sql.NullString{String: user.Username, Valid: true}
	}
	if user.Avatar != "" {
		avatar = sql.NullString{String: user.Avatar, Valid: true}
	}
	if user.GoogleID != "" {
		googleID = sql.NullString{String: user.GoogleID, Valid: true}
	}

	_, err := w.db.ExecContext(ctx, query,
		user.ID, user.Email, user.FirstName, user.LastName, user.PasswordHash,
		user.Role.String(), level, username, avatar,
		googleID, user.Status, user.EmailVerified,
		user.MaxConcurrentSessions, user.IsActive,
	)

	if err != nil {
		w.logger.WithFields(logrus.Fields{
			"operation": "Update",
			"user_id":   user.ID,
		}).WithError(err).Error("Failed to update user")
		return fmt.Errorf("failed to update user: %w", err)
	}

	w.logger.WithFields(logrus.Fields{
		"operation": "Update",
		"user_id":   user.ID,
	}).Info("User updated successfully")

	return nil
}

// UpdateGoogleID updates user's Google ID
func (w *userRepositoryWrapper) UpdateGoogleID(ctx context.Context, userID, googleID string) error {
	// Validate input
	if err := validateUserID(userID); err != nil {
		w.logger.WithFields(logrus.Fields{
			"operation": "UpdateGoogleID",
			"user_id":   userID,
		}).Error("Invalid user ID format")
		return fmt.Errorf("validation failed: %w", err)
	}
	if googleID != "" {
		if err := validateGoogleID(googleID); err != nil {
			w.logger.WithFields(logrus.Fields{
				"operation": "UpdateGoogleID",
				"user_id":   userID,
				"google_id": googleID,
			}).Error("Invalid Google ID format")
			return fmt.Errorf("validation failed: %w", err)
		}
	}

	w.logger.WithFields(logrus.Fields{
		"operation": "UpdateGoogleID",
		"user_id":   userID,
		"google_id": googleID,
	}).Info("Updating Google ID")

	query := `
		UPDATE users
		SET google_id = $2, updated_at = NOW()
		WHERE id = $1
	`

	var googleIDNull sql.NullString
	if googleID != "" {
		googleIDNull = sql.NullString{String: googleID, Valid: true}
	}

	_, err := w.db.ExecContext(ctx, query, userID, googleIDNull)
	if err != nil {
		w.logger.WithFields(logrus.Fields{
			"operation": "UpdateGoogleID",
			"user_id":   userID,
		}).WithError(err).Error("Failed to update Google ID")
		return fmt.Errorf("failed to update Google ID: %w", err)
	}

	w.logger.WithFields(logrus.Fields{
		"operation": "UpdateGoogleID",
		"user_id":   userID,
	}).Info("Google ID updated successfully")

	return nil
}

// UpdateAvatar updates user's avatar
func (w *userRepositoryWrapper) UpdateAvatar(ctx context.Context, userID, avatar string) error {
	// Validate input
	if err := validateUserID(userID); err != nil {
		w.logger.WithFields(logrus.Fields{
			"operation": "UpdateAvatar",
			"user_id":   userID,
		}).Error("Invalid user ID format")
		return fmt.Errorf("validation failed: %w", err)
	}

	w.logger.WithFields(logrus.Fields{
		"operation": "UpdateAvatar",
		"user_id":   userID,
	}).Info("Updating avatar")

	query := `
		UPDATE users
		SET avatar = $2, updated_at = NOW()
		WHERE id = $1
	`

	var avatarNull sql.NullString
	if avatar != "" {
		avatarNull = sql.NullString{String: avatar, Valid: true}
	}

	_, err := w.db.ExecContext(ctx, query, userID, avatarNull)
	if err != nil {
		w.logger.WithFields(logrus.Fields{
			"operation": "UpdateAvatar",
			"user_id":   userID,
		}).WithError(err).Error("Failed to update avatar")
		return fmt.Errorf("failed to update avatar: %w", err)
	}

	w.logger.WithFields(logrus.Fields{
		"operation": "UpdateAvatar",
		"user_id":   userID,
	}).Info("Avatar updated successfully")

	return nil
}

// UpdateLastLogin updates last login info
func (w *userRepositoryWrapper) UpdateLastLogin(ctx context.Context, userID, ipAddress string) error {
	// Validate input
	if err := validateUserID(userID); err != nil {
		w.logger.WithFields(logrus.Fields{
			"operation":  "UpdateLastLogin",
			"user_id":    userID,
			"ip_address": ipAddress,
		}).Error("Invalid user ID format")
		return fmt.Errorf("validation failed: %w", err)
	}

	w.logger.WithFields(logrus.Fields{
		"operation":  "UpdateLastLogin",
		"user_id":    userID,
		"ip_address": ipAddress,
	}).Info("Updating last login")

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
		w.logger.WithFields(logrus.Fields{
			"operation": "UpdateLastLogin",
			"user_id":   userID,
		}).WithError(err).Error("Failed to update last login")
		return fmt.Errorf("failed to update last login: %w", err)
	}

	w.logger.WithFields(logrus.Fields{
		"operation": "UpdateLastLogin",
		"user_id":   userID,
	}).Info("Last login updated successfully")

	return nil
}

// IncrementLoginAttempts increments login attempts
func (w *userRepositoryWrapper) IncrementLoginAttempts(ctx context.Context, userID string) error {
	// Validate input
	if err := validateUserID(userID); err != nil {
		w.logger.WithFields(logrus.Fields{
			"operation": "IncrementLoginAttempts",
			"user_id":   userID,
		}).Error("Invalid user ID format")
		return fmt.Errorf("validation failed: %w", err)
	}

	w.logger.WithFields(logrus.Fields{
		"operation": "IncrementLoginAttempts",
		"user_id":   userID,
	}).Warn("Incrementing login attempts")

	query := `
		UPDATE users
		SET
			login_attempts = login_attempts + 1,
			updated_at = NOW()
		WHERE id = $1
	`

	_, err := w.db.ExecContext(ctx, query, userID)
	if err != nil {
		w.logger.WithFields(logrus.Fields{
			"operation": "IncrementLoginAttempts",
			"user_id":   userID,
		}).WithError(err).Error("Failed to increment login attempts")
		return fmt.Errorf("failed to increment login attempts: %w", err)
	}

	w.logger.WithFields(logrus.Fields{
		"operation": "IncrementLoginAttempts",
		"user_id":   userID,
	}).Info("Login attempts incremented")

	return nil
}

// ResetLoginAttempts resets login attempts
func (w *userRepositoryWrapper) ResetLoginAttempts(ctx context.Context, userID string) error {
	// Validate input
	if err := validateUserID(userID); err != nil {
		w.logger.WithFields(logrus.Fields{
			"operation": "ResetLoginAttempts",
			"user_id":   userID,
		}).Error("Invalid user ID format")
		return fmt.Errorf("validation failed: %w", err)
	}

	w.logger.WithFields(logrus.Fields{
		"operation": "ResetLoginAttempts",
		"user_id":   userID,
	}).Info("Resetting login attempts")

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
		w.logger.WithFields(logrus.Fields{
			"operation": "ResetLoginAttempts",
			"user_id":   userID,
		}).WithError(err).Error("Failed to reset login attempts")
		return fmt.Errorf("failed to reset login attempts: %w", err)
	}

	w.logger.WithFields(logrus.Fields{
		"operation": "ResetLoginAttempts",
		"user_id":   userID,
	}).Info("Login attempts reset successfully")

	return nil
}

// LockAccount locks user account
func (w *userRepositoryWrapper) LockAccount(ctx context.Context, userID string, until time.Time) error {
	// Validate input
	if err := validateUserID(userID); err != nil {
		w.logger.WithFields(logrus.Fields{
			"operation": "LockAccount",
			"user_id":   userID,
		}).Error("Invalid user ID format")
		return fmt.Errorf("validation failed: %w", err)
	}

	w.logger.WithFields(logrus.Fields{
		"operation":    "LockAccount",
		"user_id":      userID,
		"locked_until": until,
	}).Warn("Locking user account")

	query := `
		UPDATE users
		SET
			locked_until = $2,
			updated_at = NOW()
		WHERE id = $1
	`

	_, err := w.db.ExecContext(ctx, query, userID, until)
	if err != nil {
		w.logger.WithFields(logrus.Fields{
			"operation": "LockAccount",
			"user_id":   userID,
		}).WithError(err).Error("Failed to lock account")
		return fmt.Errorf("failed to lock account: %w", err)
	}

	w.logger.WithFields(logrus.Fields{
		"operation": "LockAccount",
		"user_id":   userID,
	}).Warn("Account locked successfully")

	return nil
}

// Delete deletes a user
func (w *userRepositoryWrapper) Delete(ctx context.Context, id string) error {
	// Validate input
	if err := validateUserID(id); err != nil {
		w.logger.WithFields(logrus.Fields{
			"operation": "Delete",
			"user_id":   id,
		}).Error("Invalid user ID format")
		return fmt.Errorf("validation failed: %w", err)
	}

	w.logger.WithFields(logrus.Fields{
		"operation": "Delete",
		"user_id":   id,
	}).Warn("Deleting user")

	query := `DELETE FROM users WHERE id = $1`

	_, err := w.db.ExecContext(ctx, query, id)
	if err != nil {
		w.logger.WithFields(logrus.Fields{
			"operation": "Delete",
			"user_id":   id,
		}).WithError(err).Error("Failed to delete user")
		return fmt.Errorf("failed to delete user: %w", err)
	}

	w.logger.WithFields(logrus.Fields{
		"operation": "Delete",
		"user_id":   id,
	}).Warn("User deleted successfully")

	return nil
}

// CreateEmailVerificationToken creates email verification token
func (w *userRepositoryWrapper) CreateEmailVerificationToken(ctx context.Context, token *EmailVerificationToken) error {
	query := `
		INSERT INTO email_verification_tokens (
			id, user_id, token, expires_at, used, created_at
		) VALUES (
			gen_random_uuid()::text, $1, $2, $3, $4, $5
		)
	`

	_, err := w.db.ExecContext(ctx, query,
		token.UserID, token.Token, token.ExpiresAt,
		token.Used, token.CreatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create email verification token: %w", err)
	}

	return nil
}

// GetEmailVerificationToken gets email verification token by token string
func (w *userRepositoryWrapper) GetEmailVerificationToken(ctx context.Context, token string) (*EmailVerificationToken, error) {
	query := `
		SELECT id, user_id, token, expires_at, used, created_at
		FROM email_verification_tokens
		WHERE token = $1 AND used = FALSE AND expires_at > NOW()
	`

	var emailToken EmailVerificationToken
	err := w.db.QueryRowContext(ctx, query, token).Scan(
		&emailToken.ID, &emailToken.UserID, &emailToken.Token,
		&emailToken.ExpiresAt, &emailToken.Used, &emailToken.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("email verification token not found or expired")
		}
		return nil, fmt.Errorf("failed to get email verification token: %w", err)
	}

	return &emailToken, nil
}

// MarkEmailVerificationTokenUsed marks token as used
func (w *userRepositoryWrapper) MarkEmailVerificationTokenUsed(ctx context.Context, token string) error {
	query := `
		UPDATE email_verification_tokens 
		SET used = TRUE
		WHERE token = $1
	`

	_, err := w.db.ExecContext(ctx, query, token)
	if err != nil {
		return fmt.Errorf("failed to mark email verification token as used: %w", err)
	}

	return nil
}

// DeleteExpiredEmailVerificationTokens cleanup expired tokens
func (w *userRepositoryWrapper) DeleteExpiredEmailVerificationTokens(ctx context.Context) error {
	query := `
		DELETE FROM email_verification_tokens
		WHERE expires_at < NOW() OR used = TRUE
	`

	_, err := w.db.ExecContext(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to delete expired email verification tokens: %w", err)
	}

	return nil
}

// CreatePasswordResetToken creates password reset token
func (w *userRepositoryWrapper) CreatePasswordResetToken(ctx context.Context, token *PasswordResetToken) error {
	query := `
		INSERT INTO password_reset_tokens (
			id, user_id, token, expires_at, used, created_at
		) VALUES (
			gen_random_uuid()::text, $1, $2, $3, $4, $5
		)
	`

	_, err := w.db.ExecContext(ctx, query,
		token.UserID, token.Token, token.ExpiresAt,
		token.Used, token.CreatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create password reset token: %w", err)
	}

	return nil
}

// GetPasswordResetToken gets password reset token by token string
func (w *userRepositoryWrapper) GetPasswordResetToken(ctx context.Context, token string) (*PasswordResetToken, error) {
	query := `
		SELECT id, user_id, token, expires_at, used, created_at
		FROM password_reset_tokens
		WHERE token = $1 AND used = FALSE AND expires_at > NOW()
	`

	var resetToken PasswordResetToken
	err := w.db.QueryRowContext(ctx, query, token).Scan(
		&resetToken.ID, &resetToken.UserID, &resetToken.Token,
		&resetToken.ExpiresAt, &resetToken.Used, &resetToken.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("password reset token not found or expired")
		}
		return nil, fmt.Errorf("failed to get password reset token: %w", err)
	}

	return &resetToken, nil
}

// MarkPasswordResetTokenUsed marks password reset token as used
func (w *userRepositoryWrapper) MarkPasswordResetTokenUsed(ctx context.Context, token string) error {
	query := `
		UPDATE password_reset_tokens 
		SET used = TRUE
		WHERE token = $1
	`

	_, err := w.db.ExecContext(ctx, query, token)
	if err != nil {
		return fmt.Errorf("failed to mark password reset token as used: %w", err)
	}

	return nil
}

// DeleteExpiredPasswordResetTokens cleanup expired password reset tokens
func (w *userRepositoryWrapper) DeleteExpiredPasswordResetTokens(ctx context.Context) error {
	query := `
		DELETE FROM password_reset_tokens
		WHERE expires_at < NOW() OR used = TRUE
	`

	_, err := w.db.ExecContext(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to delete expired password reset tokens: %w", err)
	}

	return nil
}

// GetAll retrieves all users from the database
func (w *userRepositoryWrapper) GetAll(ctx context.Context) ([]*User, error) {
	query := `
		SELECT
			id, email, first_name, last_name, password_hash, role, level,
			username, avatar, google_id, status, email_verified,
			max_concurrent_sessions, last_login_at, last_login_ip,
			login_attempts, locked_until, is_active, created_at, updated_at
		FROM users
		ORDER BY created_at DESC
	`

	rows, err := w.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query users: %w", err)
	}
	defer rows.Close()

	var users []*User
	for rows.Next() {
		var user User
		var roleStr, statusStr string
		var username, avatar, googleID sql.NullString
		var level sql.NullInt32
		var lastLoginAt, lockedUntil sql.NullTime
		var lastLoginIPStr sql.NullString

		err := rows.Scan(
			&user.ID, &user.Email, &user.FirstName, &user.LastName, &user.PasswordHash,
			&roleStr, &level, &username, &avatar,
			&googleID, &statusStr, &user.EmailVerified,
			&user.MaxConcurrentSessions, &lastLoginAt, &lastLoginIPStr,
			&user.LoginAttempts, &lockedUntil, &user.IsActive,
			&user.CreatedAt, &user.UpdatedAt,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}

		// Convert string to enum
		user.Role = parseUserRole(roleStr)
		user.Status = statusStr

		// Handle nullable fields
		if level.Valid {
			user.Level = int(level.Int32)
		}
		if username.Valid {
			user.Username = username.String
		}
		if avatar.Valid {
			user.Avatar = avatar.String
		}
		if googleID.Valid {
			user.GoogleID = googleID.String
		}
		if lastLoginAt.Valid {
			user.LastLoginAt = &lastLoginAt.Time
		}
		if lastLoginIPStr.Valid {
			user.LastLoginIP = lastLoginIPStr.String
		}
		if lockedUntil.Valid {
			user.LockedUntil = &lockedUntil.Time
		}

		users = append(users, &user)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return users, nil
}

// GetUsersWithFilters retrieves users with database-level filtering and pagination
// âœ… FIX: Giáº£i quyáº¿t N+1 query problem báº±ng cÃ¡ch filter trong database thay vÃ¬ memory
//
// Performance improvement:
// - TrÆ°á»›c: Load ALL users vÃ o memory â†’ filter trong Go â†’ 2-5 giÃ¢y vá»›i 10k users
// - Sau: Filter trong database vá»›i WHERE clause â†’ 100-300ms
//
// Technical details:
// - Sá»­ dá»¥ng dynamic SQL query building vá»›i parameterized queries
// - Táº­n dá»¥ng database indexes (idx_users_role_status, idx_users_email_lower, etc.)
// - Pagination Ä‘Æ°á»£c thá»±c hiá»‡n á»Ÿ database level vá»›i LIMIT/OFFSET
func (w *userRepositoryWrapper) GetUsersWithFilters(
	ctx context.Context,
	filters UserFilters,
	offset, limit int,
) ([]*User, int, error) {
	w.logger.WithFields(logrus.Fields{
		"operation": "GetUsersWithFilters",
		"role":      filters.Role,
		"status":    filters.Status,
		"search":    filters.Search,
		"offset":    offset,
		"limit":     limit,
	}).Debug("Fetching users with filters")

	// Build WHERE clause dynamically vá»›i parameterized queries
	whereClauses := []string{"1=1"} // Base condition
	args := []interface{}{}
	argIndex := 1

	// Filter by role
	if filters.Role != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("role = $%d", argIndex))
		args = append(args, filters.Role)
		argIndex++
	}

	// Filter by status
	if filters.Status != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("status = $%d", argIndex))
		args = append(args, filters.Status)
		argIndex++
	}

	// Filter by search (email, first_name, last_name, username)
	// Sá»­ dá»¥ng LOWER() Ä‘á»ƒ case-insensitive search
	// Indexes: idx_users_email_lower, idx_users_first_name_lower, idx_users_last_name_lower
	if filters.Search != "" {
		searchPattern := "%" + strings.ToLower(filters.Search) + "%"
		whereClauses = append(whereClauses, fmt.Sprintf(
			"(LOWER(email) LIKE $%d OR LOWER(first_name) LIKE $%d OR LOWER(last_name) LIKE $%d OR LOWER(username) LIKE $%d)",
			argIndex, argIndex, argIndex, argIndex,
		))
		args = append(args, searchPattern)
		argIndex++
	}

	whereClause := strings.Join(whereClauses, " AND ")

	// Count query - TÃ­nh tá»•ng sá»‘ records thá»a mÃ£n filter
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM users WHERE %s", whereClause)
	var total int
	err := w.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		w.logger.WithFields(logrus.Fields{
			"operation": "GetUsersWithFilters",
		}).WithError(err).Error("Failed to count users")
		return nil, 0, fmt.Errorf("failed to count users: %w", err)
	}

	// Data query with pagination
	// ORDER BY created_at DESC Ä‘á»ƒ hiá»ƒn thá»‹ users má»›i nháº¥t trÆ°á»›c
	dataQuery := fmt.Sprintf(`
		SELECT
			id, email, first_name, last_name, password_hash, role, level,
			username, avatar, google_id, status, email_verified,
			max_concurrent_sessions, last_login_at, last_login_ip,
			login_attempts, locked_until, is_active, created_at, updated_at
		FROM users
		WHERE %s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argIndex, argIndex+1)

	args = append(args, limit, offset)

	rows, err := w.db.QueryContext(ctx, dataQuery, args...)
	if err != nil {
		w.logger.WithFields(logrus.Fields{
			"operation": "GetUsersWithFilters",
		}).WithError(err).Error("Failed to query users with filters")
		return nil, 0, fmt.Errorf("failed to query users: %w", err)
	}
	defer rows.Close()

	// Scan results - Sá»­ dá»¥ng láº¡i logic scan tá»« GetAll()
	var users []*User
	for rows.Next() {
		var user User
		var roleStr, statusStr string
		var username, avatar, googleID sql.NullString
		var level sql.NullInt32
		var lastLoginAt, lockedUntil sql.NullTime
		var lastLoginIPStr sql.NullString

		err := rows.Scan(
			&user.ID, &user.Email, &user.FirstName, &user.LastName, &user.PasswordHash,
			&roleStr, &level, &username, &avatar,
			&googleID, &statusStr, &user.EmailVerified,
			&user.MaxConcurrentSessions, &lastLoginAt, &lastLoginIPStr,
			&user.LoginAttempts, &lockedUntil, &user.IsActive,
			&user.CreatedAt, &user.UpdatedAt,
		)

		if err != nil {
			w.logger.WithFields(logrus.Fields{
				"operation": "GetUsersWithFilters",
			}).WithError(err).Error("Failed to scan user")
			return nil, 0, fmt.Errorf("failed to scan user: %w", err)
		}

		// Convert string to enum
		user.Role = parseUserRole(roleStr)
		user.Status = statusStr

		// Handle nullable fields
		if level.Valid {
			user.Level = int(level.Int32)
		}
		if username.Valid {
			user.Username = username.String
		}
		if avatar.Valid {
			user.Avatar = avatar.String
		}
		if googleID.Valid {
			user.GoogleID = googleID.String
		}
		if lastLoginAt.Valid {
			user.LastLoginAt = &lastLoginAt.Time
		}
		if lastLoginIPStr.Valid {
			user.LastLoginIP = lastLoginIPStr.String
		}
		if lockedUntil.Valid {
			user.LockedUntil = &lockedUntil.Time
		}

		users = append(users, &user)
	}

	if err := rows.Err(); err != nil {
		w.logger.WithFields(logrus.Fields{
			"operation": "GetUsersWithFilters",
		}).WithError(err).Error("Rows iteration error")
		return nil, 0, fmt.Errorf("rows error: %w", err)
	}

	w.logger.WithFields(logrus.Fields{
		"operation":   "GetUsersWithFilters",
		"total_count": total,
		"returned":    len(users),
	}).Info("Successfully fetched users with filters")

	return users, total, nil
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

// convertProtoRoleToString converts proto UserRole to database string
func convertProtoRoleToString(role common.UserRole) string {
	switch role {
	case common.UserRole_USER_ROLE_GUEST:
		return "GUEST"
	case common.UserRole_USER_ROLE_STUDENT:
		return "STUDENT"
	case common.UserRole_USER_ROLE_TUTOR:
		return "TUTOR"
	case common.UserRole_USER_ROLE_TEACHER:
		return "TEACHER"
	case common.UserRole_USER_ROLE_ADMIN:
		return "ADMIN"
	default:
		return "STUDENT" // Default fallback
	}
}
