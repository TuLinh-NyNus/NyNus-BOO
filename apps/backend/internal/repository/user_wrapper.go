package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/common"
)

// userRepositoryWrapper wraps UserRepository to implement IUserRepository
type userRepositoryWrapper struct {
	db *sql.DB
}

// NewUserRepositoryWrapper creates a new wrapper
func NewUserRepositoryWrapper(db *sql.DB) IUserRepository {
	return &userRepositoryWrapper{
		db: db,
	}
}

// Create creates a new user
func (w *userRepositoryWrapper) Create(ctx context.Context, user *User) error {
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
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

// GetByID gets user by ID
func (w *userRepositoryWrapper) GetByID(ctx context.Context, id string) (*User, error) {
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
			return nil, ErrUserNotFound
		}
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

	return &user, nil
}

// GetByEmail gets user by email
func (w *userRepositoryWrapper) GetByEmail(ctx context.Context, email string) (*User, error) {
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
			return nil, ErrUserNotFound
		}
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

	return &user, nil
}

// GetByGoogleID gets user by Google ID
func (w *userRepositoryWrapper) GetByGoogleID(ctx context.Context, googleID string) (*User, error) {
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
			return nil, ErrUserNotFound
		}
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

	return &user, nil
}

// GetByUsername gets user by username
func (w *userRepositoryWrapper) GetByUsername(ctx context.Context, username string) (*User, error) {
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
			return nil, ErrUserNotFound
		}
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

	return &user, nil
}

// Update updates a user
func (w *userRepositoryWrapper) Update(ctx context.Context, user *User) error {
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

	var googleIDNull sql.NullString
	if googleID != "" {
		googleIDNull = sql.NullString{String: googleID, Valid: true}
	}

	_, err := w.db.ExecContext(ctx, query, userID, googleIDNull)
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

	var avatarNull sql.NullString
	if avatar != "" {
		avatarNull = sql.NullString{String: avatar, Valid: true}
	}

	_, err := w.db.ExecContext(ctx, query, userID, avatarNull)
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
