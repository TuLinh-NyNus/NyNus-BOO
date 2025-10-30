package auth

import "time"

// JWT Token Configuration Constants
// Äá»‹nh nghÄ©a cÃ¡c háº±ng sá»‘ cho cáº¥u hÃ¬nh JWT tokens

const (
	// AccessTokenExpiry lÃ  thá»i gian háº¿t háº¡n cá»§a access token (60 phÃºt)
	// Access token cÃ³ thá»i gian ngáº¯n Ä‘á»ƒ giáº£m thiá»ƒu rá»§i ro náº¿u bá»‹ Ä‘Ã¡nh cáº¯p
	// âœ… INCREASED: From 15 minutes to 60 minutes to reduce token expiry errors
	AccessTokenExpiry = 60 * time.Minute

	// RefreshTokenExpiry lÃ  thá»i gian háº¿t háº¡n cá»§a refresh token (7 ngÃ y)
	// Refresh token cÃ³ thá»i gian dÃ i hÆ¡n Ä‘á»ƒ user khÃ´ng pháº£i Ä‘Äƒng nháº­p láº¡i thÆ°á»ng xuyÃªn
	RefreshTokenExpiry = 7 * 24 * time.Hour

	// TokenIssuer lÃ  tÃªn issuer cho JWT tokens
	// ÄÆ°á»£c sá»­ dá»¥ng Ä‘á»ƒ xÃ¡c Ä‘á»‹nh nguá»“n gá»‘c cá»§a token
	TokenIssuer = "exam-bank-system"

	// SecureRandomTokenSize lÃ  kÃ­ch thÆ°á»›c cá»§a secure random token (32 bytes = 256 bits)
	// Äá»§ lá»›n Ä‘á»ƒ Ä‘áº£m báº£o tÃ­nh ngáº«u nhiÃªn vÃ  báº£o máº­t
	SecureRandomTokenSize = 32
)

// User Status Constants
// Äá»‹nh nghÄ©a cÃ¡c tráº¡ng thÃ¡i cá»§a user account (duplicate from grpc/constants.go for service layer)
const (
	// UserStatusActive - TÃ i khoáº£n Ä‘ang hoáº¡t Ä‘á»™ng bÃ¬nh thÆ°á»ng
	UserStatusActive = "ACTIVE"

	// UserStatusInactive - TÃ i khoáº£n chÆ°a Ä‘Æ°á»£c kÃ­ch hoáº¡t
	UserStatusInactive = "INACTIVE"

	// UserStatusSuspended - TÃ i khoáº£n bá»‹ táº¡m ngÆ°ng
	UserStatusSuspended = "SUSPENDED"
)

// JWT Error Messages
// Äá»‹nh nghÄ©a cÃ¡c thÃ´ng bÃ¡o lá»—i chuáº©n cho JWT operations
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
// Äá»‹nh nghÄ©a cÃ¡c thÃ´ng bÃ¡o thÃ nh cÃ´ng chuáº©n
const (
	MsgRefreshTokenStored      = "[JWT] âœ… Refresh token stored in database with family %s for user %s\n"
	MsgRefreshTokenRotated     = "[JWT] âœ… Token rotated successfully for user %s (family: %s)\n"
	MsgTokenReuseDetected      = "[SECURITY] ðŸš¨ Token reuse detected for user %s - revoking entire token family %s\n"
	MsgUserInactive            = "[JWT] âš ï¸  User %s is inactive - rejecting token refresh\n"
	MsgTokenValidationFailed   = "[JWT] âŒ Refresh token validation failed: %v\n"
	MsgRefreshTokenRepoWarning = "[JWT] âš ï¸  Warning: Refresh token repository not available - token not stored in database\n"
)
