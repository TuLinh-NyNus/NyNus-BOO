package grpc

import "time"

// Bcrypt Configuration Constants
// Định nghĩa các hằng số cho cấu hình bcrypt password hashing
const (
	// MinBcryptCost là chi phí tối thiểu cho bcrypt (10 rounds)
	// Giá trị thấp hơn không đủ an toàn theo OWASP recommendations
	MinBcryptCost = 10

	// DefaultBcryptCost là chi phí mặc định cho bcrypt (12 rounds)
	// Cân bằng giữa security và performance cho production
	DefaultBcryptCost = 12
)

// Account Security Constants
// Định nghĩa các hằng số cho bảo mật tài khoản
const (
	// MaxLoginAttempts là số lần đăng nhập sai tối đa trước khi khóa tài khoản
	// Sau 5 lần thất bại, tài khoản sẽ bị khóa tạm thời
	MaxLoginAttempts = 5

	// AccountLockDuration là thời gian khóa tài khoản sau khi vượt quá số lần đăng nhập sai
	// Khóa 30 phút để ngăn chặn brute force attacks
	AccountLockDuration = 30 * time.Minute
)

// Session Configuration Constants
// Định nghĩa các hằng số cho cấu hình session
const (
	// SessionTokenSize là kích thước của session token (32 bytes = 256 bits)
	// Đủ lớn để đảm bảo tính ngẫu nhiên và bảo mật
	SessionTokenSize = 32

	// DefaultConcurrentSessions là số lượng session đồng thời mặc định cho mỗi user
	// Cho phép user đăng nhập trên tối đa 3 thiết bị cùng lúc
	DefaultConcurrentSessions = 3

	// DefaultStudentLevel là level mặc định cho STUDENT role
	// Mọi student mới đều bắt đầu từ level 1
	DefaultStudentLevel = 1
)

// User Status Constants
// Định nghĩa các trạng thái của user account
const (
	// StatusActive - Tài khoản đang hoạt động bình thường
	StatusActive = "ACTIVE"

	// StatusInactive - Tài khoản chưa được kích hoạt (chưa verify email)
	StatusInactive = "INACTIVE"

	// StatusSuspended - Tài khoản bị tạm ngưng do vi phạm
	StatusSuspended = "SUSPENDED"
)

// User Role Constants
// Định nghĩa các vai trò trong hệ thống (theo role hierarchy)
const (
	// RoleAdmin - Quản trị viên hệ thống (level 5)
	RoleAdmin = "ADMIN"

	// RoleTeacher - Giáo viên (level 4)
	RoleTeacher = "TEACHER"

	// RoleTutor - Trợ giảng (level 3)
	RoleTutor = "TUTOR"

	// RoleStudent - Học sinh (level 2)
	RoleStudent = "STUDENT"

	// RoleGuest - Khách (level 1)
	RoleGuest = "GUEST"
)

// Error Messages
// Định nghĩa các thông báo lỗi chuẩn
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
// Định nghĩa các thông báo thành công chuẩn
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
