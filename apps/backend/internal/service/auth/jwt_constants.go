package auth

import "time"

// JWT Token Configuration Constants
// Định nghĩa các hằng số cho cấu hình JWT tokens

const (
	// AccessTokenExpiry là thời gian hết hạn của access token (60 phút)
	// Access token có thời gian ngắn để giảm thiểu rủi ro nếu bị đánh cắp
	// ✅ INCREASED: From 15 minutes to 60 minutes to reduce token expiry errors
	AccessTokenExpiry = 60 * time.Minute

	// RefreshTokenExpiry là thời gian hết hạn của refresh token (7 ngày)
	// Refresh token có thời gian dài hơn để user không phải đăng nhập lại thường xuyên
	RefreshTokenExpiry = 7 * 24 * time.Hour

	// TokenIssuer là tên issuer cho JWT tokens
	// Được sử dụng để xác định nguồn gốc của token
	TokenIssuer = "exam-bank-system"

	// SecureRandomTokenSize là kích thước của secure random token (32 bytes = 256 bits)
	// Đủ lớn để đảm bảo tính ngẫu nhiên và bảo mật
	SecureRandomTokenSize = 32
)

// User Status Constants
// Định nghĩa các trạng thái của user account (duplicate from grpc/constants.go for service layer)
const (
	// UserStatusActive - Tài khoản đang hoạt động bình thường
	UserStatusActive = "ACTIVE"

	// UserStatusInactive - Tài khoản chưa được kích hoạt
	UserStatusInactive = "INACTIVE"

	// UserStatusSuspended - Tài khoản bị tạm ngưng
	UserStatusSuspended = "SUSPENDED"
)

// JWT Error Messages
// Định nghĩa các thông báo lỗi chuẩn cho JWT operations
const (
	ErrAccessTokenGenerationFailed  = "failed to generate access token: %w"
	ErrRefreshTokenGenerationFailed = "failed to generate refresh token: %w"
	ErrRefreshTokenStorageFailed    = "failed to store refresh token: %w"
	ErrRefreshTokenValidationFailed = "invalid refresh token: %w"
	ErrRefreshTokenRotationFailed   = "failed to rotate refresh token: %w"
	ErrRefreshTokenRepoUnavailable  = "refresh token repository not available"
	ErrRefreshTokenReuseDetected    = "token reuse detected - security breach - all tokens in family revoked"
	ErrUserAccountInactive          = "user account is inactive"
	ErrUserNotFound                 = "failed to get user: %w"
	ErrInvalidToken                 = "invalid token: %w"
	ErrInvalidTokenClaims           = "invalid token claims"
	ErrInvalidRefreshToken          = "invalid refresh token: %w"
	ErrInvalidRefreshTokenClaims    = "invalid refresh token claims"
	ErrUnexpectedSigningMethod      = "unexpected signing method: %v"
)

// JWT Success Messages
// Định nghĩa các thông báo thành công chuẩn
const (
	MsgRefreshTokenStored      = "[JWT] ✅ Refresh token stored in database with family %s for user %s\n"
	MsgRefreshTokenRotated     = "[JWT] ✅ Token rotated successfully for user %s (family: %s)\n"
	MsgTokenReuseDetected      = "[SECURITY] 🚨 Token reuse detected for user %s - revoking entire token family %s\n"
	MsgUserInactive            = "[JWT] ⚠️  User %s is inactive - rejecting token refresh\n"
	MsgTokenValidationFailed   = "[JWT] ❌ Refresh token validation failed: %v\n"
	MsgRefreshTokenRepoWarning = "[JWT] ⚠️  Warning: Refresh token repository not available - token not stored in database\n"
)
