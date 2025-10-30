package grpc

import "time"

// Bcrypt Configuration Constants
// Äá»‹nh nghÄ©a cÃ¡c háº±ng sá»‘ cho cáº¥u hÃ¬nh bcrypt password hashing
const (
	// MinBcryptCost lÃ  chi phÃ­ tá»‘i thiá»ƒu cho bcrypt (10 rounds)
	// GiÃ¡ trá»‹ tháº¥p hÆ¡n khÃ´ng Ä‘á»§ an toÃ n theo OWASP recommendations
	MinBcryptCost = 10

	// DefaultBcryptCost lÃ  chi phÃ­ máº·c Ä‘á»‹nh cho bcrypt (12 rounds)
	// CÃ¢n báº±ng giá»¯a security vÃ  performance cho production
	DefaultBcryptCost = 12
)

// Account Security Constants
// Äá»‹nh nghÄ©a cÃ¡c háº±ng sá»‘ cho báº£o máº­t tÃ i khoáº£n
const (
	// MaxLoginAttempts lÃ  sá»‘ láº§n Ä‘Äƒng nháº­p sai tá»‘i Ä‘a trÆ°á»›c khi khÃ³a tÃ i khoáº£n
	// Sau 5 láº§n tháº¥t báº¡i, tÃ i khoáº£n sáº½ bá»‹ khÃ³a táº¡m thá»i
	MaxLoginAttempts = 5

	// AccountLockDuration lÃ  thá»i gian khÃ³a tÃ i khoáº£n sau khi vÆ°á»£t quÃ¡ sá»‘ láº§n Ä‘Äƒng nháº­p sai
	// KhÃ³a 30 phÃºt Ä‘á»ƒ ngÄƒn cháº·n brute force attacks
	AccountLockDuration = 30 * time.Minute
)

// Session Configuration Constants
// Äá»‹nh nghÄ©a cÃ¡c háº±ng sá»‘ cho cáº¥u hÃ¬nh session
const (
	// SessionTokenSize lÃ  kÃ­ch thÆ°á»›c cá»§a session token (32 bytes = 256 bits)
	// Äá»§ lá»›n Ä‘á»ƒ Ä‘áº£m báº£o tÃ­nh ngáº«u nhiÃªn vÃ  báº£o máº­t
	SessionTokenSize = 32

	// DefaultConcurrentSessions lÃ  sá»‘ lÆ°á»£ng session Ä‘á»“ng thá»i máº·c Ä‘á»‹nh cho má»—i user
	// Cho phÃ©p user Ä‘Äƒng nháº­p trÃªn tá»‘i Ä‘a 3 thiáº¿t bá»‹ cÃ¹ng lÃºc
	DefaultConcurrentSessions = 3

	// DefaultStudentLevel lÃ  level máº·c Ä‘á»‹nh cho STUDENT role
	// Má»i student má»›i Ä‘á»u báº¯t Ä‘áº§u tá»« level 1
	DefaultStudentLevel = 1
)

// User Status Constants
// Äá»‹nh nghÄ©a cÃ¡c tráº¡ng thÃ¡i cá»§a user account
const (
	// StatusActive - TÃ i khoáº£n Ä‘ang hoáº¡t Ä‘á»™ng bÃ¬nh thÆ°á»ng
	StatusActive = "ACTIVE"

	// StatusInactive - TÃ i khoáº£n chÆ°a Ä‘Æ°á»£c kÃ­ch hoáº¡t (chÆ°a verify email)
	StatusInactive = "INACTIVE"

	// StatusSuspended - TÃ i khoáº£n bá»‹ táº¡m ngÆ°ng do vi pháº¡m
	StatusSuspended = "SUSPENDED"
)

// User Role Constants
// Äá»‹nh nghÄ©a cÃ¡c vai trÃ² trong há»‡ thá»‘ng (theo role hierarchy)
const (
	// RoleAdmin - Quáº£n trá»‹ viÃªn há»‡ thá»‘ng (level 5)
	RoleAdmin = "ADMIN"

	// RoleTeacher - GiÃ¡o viÃªn (level 4)
	RoleTeacher = "TEACHER"

	// RoleTutor - Trá»£ giáº£ng (level 3)
	RoleTutor = "TUTOR"

	// RoleStudent - Há»c sinh (level 2)
	RoleStudent = "STUDENT"

	// RoleGuest - KhÃ¡ch (level 1)
	RoleGuest = "GUEST"
)

// Error Messages
// Äá»‹nh nghÄ©a cÃ¡c thÃ´ng bÃ¡o lá»—i chuáº©n
const (
	// Authentication errors
	ErrInvalidCredentials   = "invalid email or password"
	ErrAccountLocked        = "account is locked until %v"
	ErrAccountInactive      = "user account is %s"
	ErrTooManyLoginAttempts = "account has been locked due to too many failed login attempts. Try again after 30 minutes"
	ErrUserNotAuthenticated = "user not authenticated"
	ErrPermissionDenied     = "only admin can update other users"

	// Registration errors
	ErrEmailRequired      = "email and password are required"
	ErrEmailAlreadyExists = "email already registered"
	ErrUserNotFound       = "user not found"

	// Token errors
	ErrInvalidToken          = "invalid or expired verification token"
	ErrInvalidResetToken     = "invalid or expired reset token"
	ErrTokenGenerationFailed = "failed to generate tokens: %v"

	// Internal errors
	ErrPasswordHashFailed    = "failed to hash password: %v"
	ErrUserCreationFailed    = "failed to create user: %v"
	ErrUserUpdateFailed      = "failed to update user: %v"
	ErrSessionCreationFailed = "failed to generate session token"
)

// Success Messages
// Äá»‹nh nghÄ©a cÃ¡c thÃ´ng bÃ¡o thÃ nh cÃ´ng chuáº©n
const (
	MsgLoginSuccess           = "Login successful"
	MsgRegistrationSuccess    = "Registration successful. Please check your email for verification."
	MsgTokenRefreshSuccess    = "Token refreshed successfully"
	MsgEmailVerifiedSuccess   = "Email verified successfully"
	MsgPasswordResetEmailSent = "If the email exists, a reset link has been sent"
	MsgPasswordResetSuccess   = "Password reset successfully"
	MsgUserRetrievedSuccess   = "User retrieved successfully"
	MsgUserUpdatedSuccess     = "User updated successfully"
	MsgVerificationEmailSent  = "Verification email sent successfully"
)
