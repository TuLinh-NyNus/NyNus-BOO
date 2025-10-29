package middleware

// Auth Interceptor Constants
// Äá»‹nh nghÄ©a cÃ¡c háº±ng sá»‘ cho authentication interceptor

const (
	// Authorization header constants
	AuthorizationHeader = "authorization"
	BearerPrefix        = "Bearer "

	// Error messages
	ErrMetadataNotProvided        = "metadata is not provided"
	ErrAuthTokenNotProvided       = "authorization token is not provided"
	ErrInvalidAuthTokenFormat     = "invalid authorization token format"
	ErrInvalidToken               = "invalid token: %v"
	ErrInsufficientPermissions    = "insufficient permissions: user role '%s' is not allowed to access '%s'"
	ErrUserIDNotFoundInContext    = "user ID not found in context"
	ErrUserEmailNotFoundInContext = "user email not found in context"
	ErrUserRoleNotFoundInContext  = "user role not found in context"
	ErrUserLevelNotFoundInContext = "user level not found in context"
	ErrSessionTokenNotProvided    = "session token is not provided"
	ErrInvalidSessionToken        = "invalid session token: %v"
	ErrSessionExpired             = "session has expired"
	ErrTooManyConcurrentSessions  = "too many concurrent sessions"
	ErrCSRFTokenNotProvided       = "CSRF token is not provided"
	ErrInvalidCSRFToken           = "invalid CSRF token"
	ErrRateLimitExceeded          = "rate limit exceeded"
	ErrResourceAccessDenied       = "resource access denied"
)
