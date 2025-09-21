package entity

import (
	"github.com/jackc/pgtype"
)

// Enhanced User struct theo thiết kế AUTH_COMPLETE_GUIDE.md
type User struct {
	// ===== CORE REQUIRED FIELDS (MVP) =====
	ID           pgtype.Text        `json:"id"`
	Email        pgtype.Text        `json:"email"`
	PasswordHash pgtype.Text        `json:"-"` // Hidden from JSON
	FirstName    pgtype.Text        `json:"first_name"`
	LastName     pgtype.Text        `json:"last_name"`
	Role         pgtype.Text        `json:"role"`
	IsActive     pgtype.Bool        `json:"is_active"`
	CreatedAt    pgtype.Timestamptz `json:"created_at"`
	UpdatedAt    pgtype.Timestamptz `json:"updated_at"`

	// ===== AUTHENTICATION FIELDS (IMPORTANT) =====
	GoogleID pgtype.Text `json:"google_id,omitempty"` // OAuth primary
	Username pgtype.Text `json:"username,omitempty"`  // Display name
	Avatar   pgtype.Text `json:"avatar,omitempty"`    // Profile picture

	// ===== CORE BUSINESS LOGIC (IMPORTANT) =====
	Level                 pgtype.Int4 `json:"level,omitempty"`         // 1-9 for STUDENT/TUTOR/TEACHER
	Status                pgtype.Text `json:"status"`                  // ACTIVE, INACTIVE, SUSPENDED
	MaxConcurrentSessions pgtype.Int4 `json:"max_concurrent_sessions"` // Anti-sharing

	// ===== SECURITY TRACKING (IMPORTANT) =====
	EmailVerified pgtype.Bool        `json:"email_verified"`          // Security requirement
	LastLoginAt   pgtype.Timestamptz `json:"last_login_at,omitempty"` // Security monitoring
	LastLoginIP   pgtype.Text        `json:"last_login_ip,omitempty"` // Suspicious detection
	LoginAttempts pgtype.Int4        `json:"login_attempts"`          // Brute force protection
	LockedUntil   pgtype.Timestamptz `json:"locked_until,omitempty"`  // Account locking

	// ===== PROFILE INFORMATION (NICE-TO-HAVE) =====
	Bio         pgtype.Text `json:"bio,omitempty"`           // User description
	Phone       pgtype.Text `json:"phone,omitempty"`         // Contact info
	Address     pgtype.Text `json:"address,omitempty"`       // Simple address
	School      pgtype.Text `json:"school,omitempty"`        // Educational background
	DateOfBirth pgtype.Date `json:"date_of_birth,omitempty"` // Age verification
	Gender      pgtype.Text `json:"gender,omitempty"`        // Analytics
}

// FieldMap trả về field names và pointers cho database scanning
// Tất cả fields theo thứ tự trong enhanced database schema
func (e *User) FieldMap() ([]string, []interface{}) {
	return []string{
			// ===== CORE REQUIRED FIELDS =====
			"id",
			"email",
			"password_hash",
			"first_name",
			"last_name",
			"role",
			"is_active",
			"created_at",
			"updated_at",
			// ===== AUTHENTICATION FIELDS =====
			"google_id",
			"username",
			"avatar",
			// ===== CORE BUSINESS LOGIC =====
			"level",
			"status",
			"max_concurrent_sessions",
			// ===== SECURITY TRACKING =====
			"email_verified",
			"last_login_at",
			"last_login_ip",
			"login_attempts",
			"locked_until",
			// ===== PROFILE INFORMATION =====
			"bio",
			"phone",
			"address",
			"school",
			"date_of_birth",
			"gender",
		}, []interface{}{
			// ===== CORE REQUIRED FIELDS =====
			&e.ID,
			&e.Email,
			&e.PasswordHash,
			&e.FirstName,
			&e.LastName,
			&e.Role,
			&e.IsActive,
			&e.CreatedAt,
			&e.UpdatedAt,
			// ===== AUTHENTICATION FIELDS =====
			&e.GoogleID,
			&e.Username,
			&e.Avatar,
			// ===== CORE BUSINESS LOGIC =====
			&e.Level,
			&e.Status,
			&e.MaxConcurrentSessions,
			// ===== SECURITY TRACKING =====
			&e.EmailVerified,
			&e.LastLoginAt,
			&e.LastLoginIP,
			&e.LoginAttempts,
			&e.LockedUntil,
			// ===== PROFILE INFORMATION =====
			&e.Bio,
			&e.Phone,
			&e.Address,
			&e.School,
			&e.DateOfBirth,
			&e.Gender,
		}
}

func (e *User) TableName() string {
	return "users"
}
