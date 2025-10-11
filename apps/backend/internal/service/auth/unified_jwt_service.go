package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"
	"github.com/golang-jwt/jwt/v5"
	"github.com/sirupsen/logrus"
)

// UnifiedJWTService handles all JWT token operations with unified secret management
// Consolidates functionality from AuthService, JWTService, and EnhancedJWTService
//
// Implementation Details:
// - Implements IJWTService interface
// - Uses structured logging với logrus
// - Validates all input parameters
// - Returns custom error types cho better error handling
type UnifiedJWTService struct {
	secret           string
	accessExpiry     time.Duration
	refreshExpiry    time.Duration
	issuer           string
	refreshTokenRepo *repository.RefreshTokenRepository
	logger           *logrus.Logger
}

// UnifiedClaims represents unified JWT token claims structure
// Combines Claims from AuthService and AccessTokenClaims from JWTService
type UnifiedClaims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	Level  int    `json:"level,omitempty"`
	jwt.RegisteredClaims
}

// RefreshTokenClaims represents refresh token claims
type RefreshTokenClaims struct {
	UserID string `json:"user_id"`
	jwt.RegisteredClaims
}

// RefreshTokenResponse represents the response from token generation/refresh
type RefreshTokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	UserID       string `json:"user_id"`
	Email        string `json:"email"`
	Role         string `json:"role"`
	Level        int    `json:"level"`
}

// NewUnifiedJWTService creates a new unified JWT service với validation và logging
//
// Business Logic:
// - Validate JWT secret không được empty
// - Initialize logger nếu không được provide
// - Configure token expiry times từ constants
// - Optional refresh token repository cho database-backed tokens
//
// Parameters:
//   - secret: JWT secret key for signing tokens (required, không được empty)
//   - refreshTokenRepo: Repository for refresh token storage (optional, có thể nil)
//   - logger: Structured logger (optional, sẽ tạo default nếu nil)
//
// Returns:
//   - *UnifiedJWTService: Configured JWT service instance
//   - error: Validation error nếu secret empty
//
// Example:
//
//	logger := logrus.New()
//	jwtService, err := NewUnifiedJWTService("my-secret-key", refreshTokenRepo, logger)
//	if err != nil {
//	  return err
//	}
func NewUnifiedJWTService(
	secret string,
	refreshTokenRepo *repository.RefreshTokenRepository,
	logger *logrus.Logger,
) (*UnifiedJWTService, error) {
	// Validate required parameters
	if secret == "" {
		return nil, errors.New("JWT secret cannot be empty")
	}

	// Use default logger if not provided
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

	service := &UnifiedJWTService{
		secret:           secret,
		accessExpiry:     AccessTokenExpiry,
		refreshExpiry:    RefreshTokenExpiry,
		issuer:           TokenIssuer,
		refreshTokenRepo: refreshTokenRepo,
		logger:           logger,
	}

	// Log service initialization
	logger.WithFields(logrus.Fields{
		"component":           "UnifiedJWTService",
		"access_expiry":       AccessTokenExpiry.String(),
		"refresh_expiry":      RefreshTokenExpiry.String(),
		"issuer":              TokenIssuer,
		"refresh_repo_enabled": refreshTokenRepo != nil,
	}).Info("JWT service initialized successfully")

	return service, nil
}

// GenerateToken generates a JWT token for a user (legacy AuthService compatibility)
//
// Note: Method này maintain backward compatibility với AuthService.generateToken()
// Nên sử dụng GenerateAccessToken cho new code
//
// Parameters:
//   - user: User entity
//
// Returns:
//   - string: JWT access token
//   - error: Generation error
func (s *UnifiedJWTService) GenerateToken(user *entity.User) (string, error) {
	userID := util.PgTextToString(user.ID)
	email := util.PgTextToString(user.Email)
	role := util.PgTextToString(user.Role)

	// Use default level 0 for legacy compatibility
	return s.GenerateAccessToken(userID, email, role, 0)
}

// GenerateAccessToken generates a new access token with full user details
//
// Business Logic:
// - Validate all input parameters (userID, email, role, level)
// - Create JWT claims với user information
// - Sign token với HS256 algorithm
// - Token expires after AccessTokenExpiry (15 minutes)
//
// Security:
// - Token signed với secret key
// - Claims include user_id, email, role, level
// - Standard JWT claims: exp, iat, nbf, iss, sub
//
// Parameters:
//   - userID: User ID (ULID format, required)
//   - email: User email (required)
//   - role: User role (GUEST, STUDENT, TUTOR, TEACHER, ADMIN)
//   - level: User level (0-9)
//
// Returns:
//   - string: JWT access token
//   - error: Validation error hoặc signing error
func (s *UnifiedJWTService) GenerateAccessToken(userID, email, role string, level int) (string, error) {
	// Validate input parameters
	if err := ValidateUserID(userID); err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "GenerateAccessToken",
			"error":     err.Error(),
		}).Error("Invalid user ID")
		return "", &JWTError{Op: "GenerateAccessToken", Err: err}
	}

	if err := ValidateEmail(email); err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "GenerateAccessToken",
			"user_id":   userID,
			"error":     err.Error(),
		}).Error("Invalid email")
		return "", &JWTError{Op: "GenerateAccessToken", UserID: userID, Err: err}
	}

	if err := ValidateRole(role); err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "GenerateAccessToken",
			"user_id":   userID,
			"role":      role,
			"error":     err.Error(),
		}).Error("Invalid role")
		return "", &JWTError{Op: "GenerateAccessToken", UserID: userID, Err: err}
	}

	if err := ValidateLevel(level); err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "GenerateAccessToken",
			"user_id":   userID,
			"level":     level,
			"error":     err.Error(),
		}).Error("Invalid level")
		return "", &JWTError{Op: "GenerateAccessToken", UserID: userID, Err: err}
	}

	// Create JWT claims
	now := time.Now()
	claims := &UnifiedClaims{
		UserID: userID,
		Email:  email,
		Role:   role,
		Level:  level,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(s.accessExpiry)),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			Issuer:    s.issuer,
			Subject:   userID,
		},
	}

	// Sign token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(s.secret))
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "GenerateAccessToken",
			"user_id":   userID,
			"error":     err.Error(),
		}).Error("Failed to sign access token")
		return "", &JWTError{Op: "GenerateAccessToken", UserID: userID, Err: err}
	}

	// Log success
	s.logger.WithFields(logrus.Fields{
		"operation": "GenerateAccessToken",
		"user_id":   userID,
		"email":     email,
		"role":      role,
		"level":     level,
		"expires_at": now.Add(s.accessExpiry).Format(time.RFC3339),
	}).Debug("Access token generated successfully")

	return tokenString, nil
}

// GenerateRefreshToken generates a new refresh token (DEPRECATED)
//
// Note: Method này chỉ tạo JWT-based refresh token, không store vào database
// Nên sử dụng GenerateRefreshTokenPair để có database-backed security
//
// Parameters:
//   - userID: User ID
//
// Returns:
//   - string: JWT refresh token
//   - error: Generation error
func (s *UnifiedJWTService) GenerateRefreshToken(userID string) (string, error) {
	// Validate user ID
	if err := ValidateUserID(userID); err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "GenerateRefreshToken",
			"error":     err.Error(),
		}).Error("Invalid user ID")
		return "", &JWTError{Op: "GenerateRefreshToken", Err: err}
	}

	// Create JWT claims
	now := time.Now()
	claims := &RefreshTokenClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(s.refreshExpiry)),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			Issuer:    s.issuer,
			Subject:   userID,
		},
	}

	// Sign token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(s.secret))
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "GenerateRefreshToken",
			"user_id":   userID,
			"error":     err.Error(),
		}).Error("Failed to sign refresh token")
		return "", &JWTError{Op: "GenerateRefreshToken", UserID: userID, Err: err}
	}

	s.logger.WithFields(logrus.Fields{
		"operation": "GenerateRefreshToken",
		"user_id":   userID,
		"expires_at": now.Add(s.refreshExpiry).Format(time.RFC3339),
	}).Debug("Refresh token generated successfully")

	return tokenString, nil
}

// ValidateToken validates a JWT token and returns claims (legacy compatibility)
//
// Note: Wrapper around ValidateAccessToken cho backward compatibility
//
// Parameters:
//   - tokenString: JWT token
//
// Returns:
//   - *UnifiedClaims: Token claims
//   - error: Validation error
func (s *UnifiedJWTService) ValidateToken(tokenString string) (*UnifiedClaims, error) {
	return s.ValidateAccessToken(tokenString)
}

// ValidateAccessToken validates an access token
//
// Business Logic:
// - Validate token string không empty
// - Parse JWT token với UnifiedClaims structure
// - Verify signature với secret key
// - Check token expiration
// - Validate signing method (chỉ accept HS256)
//
// Security:
// - Constant-time signature comparison
// - Reject tokens với invalid signing method
// - Check token expiration time
//
// Parameters:
//   - tokenString: JWT access token
//
// Returns:
//   - *UnifiedClaims: Token claims nếu valid
//   - error: Validation error
func (s *UnifiedJWTService) ValidateAccessToken(tokenString string) (*UnifiedClaims, error) {
	// Validate token string
	if err := ValidateTokenString(tokenString); err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "ValidateAccessToken",
			"error":     err.Error(),
		}).Error("Invalid token string")
		return nil, &JWTError{Op: "ValidateAccessToken", Err: err}
	}

	// Parse token với claims
	token, err := jwt.ParseWithClaims(tokenString, &UnifiedClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			s.logger.WithFields(logrus.Fields{
				"operation":      "ValidateAccessToken",
				"signing_method": token.Header["alg"],
			}).Error("Invalid signing method")
			return nil, ErrTokenInvalidMethod
		}
		return []byte(s.secret), nil
	})

	if err != nil {
		// Check if token expired
		if errors.Is(err, jwt.ErrTokenExpired) {
			s.logger.WithFields(logrus.Fields{
				"operation": "ValidateAccessToken",
				"error":     "token expired",
			}).Debug("Token validation failed: expired")
			return nil, &JWTError{Op: "ValidateAccessToken", Err: ErrTokenExpired}
		}

		s.logger.WithFields(logrus.Fields{
			"operation": "ValidateAccessToken",
			"error":     err.Error(),
		}).Error("Token parsing failed")
		return nil, &JWTError{Op: "ValidateAccessToken", Err: ErrTokenInvalidSignature}
	}

	// Extract and validate claims
	if claims, ok := token.Claims.(*UnifiedClaims); ok && token.Valid {
		s.logger.WithFields(logrus.Fields{
			"operation": "ValidateAccessToken",
			"user_id":   claims.UserID,
			"email":     claims.Email,
			"role":      claims.Role,
		}).Debug("Access token validated successfully")
		return claims, nil
	}

	s.logger.WithFields(logrus.Fields{
		"operation": "ValidateAccessToken",
		"error":     "invalid claims structure",
	}).Error("Token validation failed")
	return nil, &JWTError{Op: "ValidateAccessToken", Err: ErrTokenInvalidClaims}
}

// ValidateRefreshToken validates a refresh token
//
// Business Logic:
// - Validate token string không empty
// - Parse JWT token với RefreshTokenClaims structure
// - Verify signature với secret key
// - Check token expiration
// - Extract user_id từ claims
//
// Note: Method này chỉ validate JWT structure, không check database
// Để có full security với reuse detection, dùng RefreshTokenWithRotation
//
// Parameters:
//   - tokenString: JWT refresh token
//
// Returns:
//   - string: User ID nếu token valid
//   - error: Validation error
func (s *UnifiedJWTService) ValidateRefreshToken(tokenString string) (string, error) {
	// Validate token string
	if err := ValidateTokenString(tokenString); err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "ValidateRefreshToken",
			"error":     err.Error(),
		}).Error("Invalid token string")
		return "", &JWTError{Op: "ValidateRefreshToken", Err: err}
	}

	// Parse token với claims
	token, err := jwt.ParseWithClaims(tokenString, &RefreshTokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			s.logger.WithFields(logrus.Fields{
				"operation":      "ValidateRefreshToken",
				"signing_method": token.Header["alg"],
			}).Error("Invalid signing method")
			return nil, ErrTokenInvalidMethod
		}
		return []byte(s.secret), nil
	})

	if err != nil {
		// Check if token expired
		if errors.Is(err, jwt.ErrTokenExpired) {
			s.logger.WithFields(logrus.Fields{
				"operation": "ValidateRefreshToken",
				"error":     "token expired",
			}).Debug("Refresh token validation failed: expired")
			return "", &JWTError{Op: "ValidateRefreshToken", Err: ErrTokenExpired}
		}

		s.logger.WithFields(logrus.Fields{
			"operation": "ValidateRefreshToken",
			"error":     err.Error(),
		}).Error("Refresh token parsing failed")
		return "", &JWTError{Op: "ValidateRefreshToken", Err: ErrTokenInvalidSignature}
	}

	// Extract and validate claims
	if claims, ok := token.Claims.(*RefreshTokenClaims); ok && token.Valid {
		s.logger.WithFields(logrus.Fields{
			"operation": "ValidateRefreshToken",
			"user_id":   claims.UserID,
		}).Debug("Refresh token validated successfully")
		return claims.UserID, nil
	}

	s.logger.WithFields(logrus.Fields{
		"operation": "ValidateRefreshToken",
		"error":     "invalid claims structure",
	}).Error("Refresh token validation failed")
	return "", &JWTError{Op: "ValidateRefreshToken", Err: ErrTokenInvalidClaims}
}

// GenerateRefreshTokenPair generates both access and refresh tokens with database storage
//
// Business Logic:
// - Generate access token (JWT) với user claims
// - Generate refresh token (secure random string, không phải JWT)
// - Store refresh token vào database với SHA-256 hash
// - Create token family mới cho rotation tracking
// - Save device metadata (IP, user agent, fingerprint) cho security audit
//
// Security Measures:
// - Refresh token là cryptographically secure random (256 bits)
// - Token được hash với SHA-256 trước khi lưu database
// - Token family cho phép revoke toàn bộ family khi phát hiện reuse
// - Device fingerprinting để phát hiện suspicious login
//
// Parameters:
//   - ctx: Context for cancellation and timeout
//   - userID: User ID
//   - email: User email
//   - role: User role
//   - level: User level
//   - ipAddress: Client IP address (for audit logging)
//   - userAgent: Client user agent (for device tracking)
//   - deviceFingerprint: Client device fingerprint (for security)
//
// Returns:
//   - *RefreshTokenResponse: Contains access_token, refresh_token, user info
//   - error: Generation error hoặc database error
func (s *UnifiedJWTService) GenerateRefreshTokenPair(
	ctx context.Context,
	userID, email, role string,
	level int,
	ipAddress, userAgent, deviceFingerprint string,
) (*RefreshTokenResponse, error) {
	// Validate input parameters
	if err := ValidateUserID(userID); err != nil {
		return nil, &JWTError{Op: "GenerateRefreshTokenPair", Err: err}
	}
	if err := ValidateEmail(email); err != nil {
		return nil, &JWTError{Op: "GenerateRefreshTokenPair", UserID: userID, Err: err}
	}
	if err := ValidateRole(role); err != nil {
		return nil, &JWTError{Op: "GenerateRefreshTokenPair", UserID: userID, Err: err}
	}
	if err := ValidateLevel(level); err != nil {
		return nil, &JWTError{Op: "GenerateRefreshTokenPair", UserID: userID, Err: err}
	}
	if err := ValidateIPAddress(ipAddress); err != nil {
		return nil, &JWTError{Op: "GenerateRefreshTokenPair", UserID: userID, Err: err}
	}
	if err := ValidateDeviceFingerprint(deviceFingerprint); err != nil {
		return nil, &JWTError{Op: "GenerateRefreshTokenPair", UserID: userID, Err: err}
	}

	// Generate access token
	accessToken, err := s.GenerateAccessToken(userID, email, role, level)
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "GenerateRefreshTokenPair",
			"user_id":   userID,
			"error":     err.Error(),
		}).Error("Failed to generate access token")
		return nil, &JWTError{Op: "GenerateRefreshTokenPair", UserID: userID, Err: err}
	}

	// Generate raw refresh token (secure random string)
	rawRefreshToken, err := s.generateSecureRefreshToken()
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "GenerateRefreshTokenPair",
			"user_id":   userID,
			"error":     err.Error(),
		}).Error("Failed to generate secure refresh token")
		return nil, &JWTError{Op: "GenerateRefreshTokenPair", UserID: userID, Err: err}
	}

	// Database refresh token storage for enhanced security
	if s.refreshTokenRepo != nil {
		tokenHash := s.refreshTokenRepo.HashToken(rawRefreshToken)
		tokenFamily := s.refreshTokenRepo.GenerateTokenFamily()

		refreshTokenRecord := &repository.RefreshToken{
			UserID:            userID,
			TokenHash:         tokenHash,
			TokenFamily:       tokenFamily,
			IPAddress:         ipAddress,
			UserAgent:         userAgent,
			DeviceFingerprint: deviceFingerprint,
			IsActive:          true,
			ExpiresAt:         time.Now().Add(RefreshTokenExpiry),
			CreatedAt:         time.Now(),
		}

		if err := s.refreshTokenRepo.StoreRefreshToken(ctx, refreshTokenRecord); err != nil {
			s.logger.WithFields(logrus.Fields{
				"operation":    "GenerateRefreshTokenPair",
				"user_id":      userID,
				"token_family": tokenFamily,
				"error":        err.Error(),
			}).Error("Failed to store refresh token in database")
			return nil, &JWTError{Op: "GenerateRefreshTokenPair", UserID: userID, Err: ErrRefreshTokenStorageFailed}
		}

		s.logger.WithFields(logrus.Fields{
			"operation":    "GenerateRefreshTokenPair",
			"user_id":      userID,
			"token_family": tokenFamily,
			"ip_address":   ipAddress,
			"user_agent":   userAgent,
		}).Info("Refresh token stored in database successfully")
	} else {
		s.logger.WithFields(logrus.Fields{
			"operation": "GenerateRefreshTokenPair",
			"user_id":   userID,
		}).Warn("Refresh token repository not available - token not stored in database")
	}

	return &RefreshTokenResponse{
		AccessToken:  accessToken,
		RefreshToken: rawRefreshToken,
		UserID:       userID,
		Email:        email,
		Role:         role,
		Level:        level,
	}, nil
}

// RefreshTokenWithRotation validates and rotates a refresh token with database-backed security
//
// Business Logic:
// - Hash incoming refresh token và lookup trong database
// - Detect token reuse (nếu token đã được sử dụng trước đó)
// - Nếu reuse detected → revoke toàn bộ token family (security breach)
// - Nếu valid → generate new access token và new refresh token
// - Revoke old refresh token và store new token (rotation)
// - Inherit token family từ old token (tracking rotation chain)
//
// Security Measures:
// - Token reuse detection prevents replay attacks
// - Token family revocation prevents compromised token usage
// - Parent token hash tracking cho audit trail
// - User status check (ACTIVE/INACTIVE/SUSPENDED)
// - Device fingerprint validation
//
// Parameters:
//   - ctx: Context for cancellation and timeout
//   - refreshToken: Current refresh token (raw string, not hashed)
//   - ipAddress: Client IP address
//   - userAgent: Client user agent
//   - deviceFingerprint: Client device fingerprint
//   - userRepo: User repository for user lookup
//
// Returns:
//   - *RefreshTokenResponse: New access token và new refresh token
//   - error: ErrRefreshTokenReused, ErrRefreshTokenExpired, ErrUserInactive
func (s *UnifiedJWTService) RefreshTokenWithRotation(
	ctx context.Context,
	refreshToken, ipAddress, userAgent, deviceFingerprint string,
	userRepo repository.IUserRepository,
) (*RefreshTokenResponse, error) {
	// Validate input parameters
	if err := ValidateRefreshToken(refreshToken); err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "RefreshTokenWithRotation",
			"error":     err.Error(),
		}).Error("Invalid refresh token")
		return nil, &JWTError{Op: "RefreshTokenWithRotation", Err: err}
	}
	if err := ValidateIPAddress(ipAddress); err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "RefreshTokenWithRotation",
			"error":     err.Error(),
		}).Error("Invalid IP address")
		return nil, &JWTError{Op: "RefreshTokenWithRotation", Err: err}
	}
	if err := ValidateDeviceFingerprint(deviceFingerprint); err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "RefreshTokenWithRotation",
			"error":     err.Error(),
		}).Error("Invalid device fingerprint")
		return nil, &JWTError{Op: "RefreshTokenWithRotation", Err: err}
	}

	// Check if refresh token repository is available
	if s.refreshTokenRepo == nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "RefreshTokenWithRotation",
		}).Error("Refresh token repository not available")
		return nil, &JWTError{Op: "RefreshTokenWithRotation", Err: ErrRefreshTokenRepoNil}
	}

	// Hash incoming refresh token for database lookup
	tokenHash := s.refreshTokenRepo.HashToken(refreshToken)

	// SECURITY: Validate and use refresh token (detects reuse attacks)
	tokenRecord, reuseDetected, err := s.refreshTokenRepo.ValidateAndUseRefreshToken(ctx, tokenHash)
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "RefreshTokenWithRotation",
			"error":     err.Error(),
		}).Error("Refresh token validation failed")
		return nil, &JWTError{Op: "RefreshTokenWithRotation", Err: err}
	}

	// SECURITY: If token reuse detected, revoke entire token family
	if reuseDetected {
		s.logger.WithFields(logrus.Fields{
			"operation":    "RefreshTokenWithRotation",
			"user_id":      tokenRecord.UserID,
			"token_family": tokenRecord.TokenFamily,
			"ip_address":   ipAddress,
		}).Warn("Token reuse detected - revoking entire token family")
		return nil, &JWTError{
			Op:     "RefreshTokenWithRotation",
			UserID: tokenRecord.UserID,
			Err:    ErrRefreshTokenReused,
		}
	}

	// Get user details from database
	user, err := userRepo.GetByID(ctx, tokenRecord.UserID)
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "RefreshTokenWithRotation",
			"user_id":   tokenRecord.UserID,
			"error":     err.Error(),
		}).Error("User not found")
		return nil, &JWTError{
			Op:     "RefreshTokenWithRotation",
			UserID: tokenRecord.UserID,
			Err:    ErrUserNotFound,
		}
	}

	// Check if user is still active
	if user.Status != UserStatusActive {
		s.logger.WithFields(logrus.Fields{
			"operation": "RefreshTokenWithRotation",
			"user_id":   user.ID,
			"status":    user.Status,
		}).Warn("User account is not active")
		return nil, &JWTError{
			Op:     "RefreshTokenWithRotation",
			UserID: user.ID,
			Err:    ErrUserInactive,
		}
	}

	// Generate new access token
	newAccessToken, err := s.GenerateAccessToken(user.ID, user.Email, string(user.Role), user.Level)
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "RefreshTokenWithRotation",
			"user_id":   user.ID,
			"error":     err.Error(),
		}).Error("Failed to generate new access token")
		return nil, &JWTError{
			Op:     "RefreshTokenWithRotation",
			UserID: user.ID,
			Err:    err,
		}
	}

	// Generate new refresh token (secure random string)
	newRefreshToken, err := s.generateSecureRefreshToken()
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "RefreshTokenWithRotation",
			"user_id":   user.ID,
			"error":     err.Error(),
		}).Error("Failed to generate new refresh token")
		return nil, &JWTError{
			Op:     "RefreshTokenWithRotation",
			UserID: user.ID,
			Err:    err,
		}
	}

	// SECURITY: Rotate refresh token in database
	newTokenHash := s.refreshTokenRepo.HashToken(newRefreshToken)
	newTokenRecord := &repository.RefreshToken{
		UserID:            user.ID,
		TokenHash:         newTokenHash,
		TokenFamily:       tokenRecord.TokenFamily, // Inherit token family
		ParentTokenHash:   tokenHash,               // Track rotation chain
		IPAddress:         ipAddress,
		UserAgent:         userAgent,
		DeviceFingerprint: deviceFingerprint,
		IsActive:          true,
		ExpiresAt:         time.Now().Add(RefreshTokenExpiry),
		CreatedAt:         time.Now(),
	}

	if err := s.refreshTokenRepo.RotateRefreshToken(ctx, tokenHash, newTokenRecord); err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation":    "RefreshTokenWithRotation",
			"user_id":      user.ID,
			"token_family": tokenRecord.TokenFamily,
			"error":        err.Error(),
		}).Error("Failed to rotate refresh token in database")
		return nil, &JWTError{
			Op:     "RefreshTokenWithRotation",
			UserID: user.ID,
			Err:    ErrRefreshTokenRotationFailed,
		}
	}

	s.logger.WithFields(logrus.Fields{
		"operation":    "RefreshTokenWithRotation",
		"user_id":      user.ID,
		"token_family": tokenRecord.TokenFamily,
		"ip_address":   ipAddress,
	}).Info("Token rotated successfully")

	return &RefreshTokenResponse{
		AccessToken:  newAccessToken,
		RefreshToken: newRefreshToken,
		UserID:       user.ID,
		Email:        user.Email,
		Role:         string(user.Role),
		Level:        user.Level,
	}, nil
}

// RevokeRefreshToken revokes a specific refresh token và toàn bộ token family
//
// Business Logic:
// - Hash refresh token và lookup trong database
// - Get token record để lấy token family
// - Revoke toàn bộ token family (không chỉ token hiện tại)
// - Lưu revocation reason cho audit logging
//
// Use Cases:
// - User logout (revoke current session)
// - Security breach detected (revoke all related tokens)
// - Password change (revoke all tokens)
//
// Parameters:
//   - ctx: Context for cancellation and timeout
//   - refreshToken: Refresh token cần revoke
//   - reason: Lý do revoke (for audit logging)
//
// Returns:
//   - error: Database error hoặc token not found
func (s *UnifiedJWTService) RevokeRefreshToken(ctx context.Context, refreshToken, reason string) error {
	// Validate input
	if err := ValidateRefreshToken(refreshToken); err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "RevokeRefreshToken",
			"error":     err.Error(),
		}).Error("Invalid refresh token")
		return &JWTError{Op: "RevokeRefreshToken", Err: err}
	}

	if s.refreshTokenRepo == nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "RevokeRefreshToken",
		}).Error("Refresh token repository not available")
		return &JWTError{Op: "RevokeRefreshToken", Err: ErrRefreshTokenRepoNil}
	}

	tokenHash := s.refreshTokenRepo.HashToken(refreshToken)

	// Get token record
	tokenRecord, err := s.refreshTokenRepo.GetRefreshTokenByHash(ctx, tokenHash)
	if err != nil {
		if errors.Is(err, repository.ErrRefreshTokenNotFound) {
			// Token doesn't exist, consider it already revoked
			s.logger.WithFields(logrus.Fields{
				"operation": "RevokeRefreshToken",
			}).Debug("Token not found - already revoked")
			return nil
		}
		s.logger.WithFields(logrus.Fields{
			"operation": "RevokeRefreshToken",
			"error":     err.Error(),
		}).Error("Failed to get token record")
		return &JWTError{Op: "RevokeRefreshToken", Err: err}
	}

	// Revoke the entire token family for security
	if err := s.refreshTokenRepo.RevokeTokenFamily(ctx, tokenRecord.TokenFamily, reason); err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation":    "RevokeRefreshToken",
			"user_id":      tokenRecord.UserID,
			"token_family": tokenRecord.TokenFamily,
			"reason":       reason,
			"error":        err.Error(),
		}).Error("Failed to revoke token family")
		return &JWTError{
			Op:     "RevokeRefreshToken",
			UserID: tokenRecord.UserID,
			Err:    ErrRefreshTokenRevocationFailed,
		}
	}

	s.logger.WithFields(logrus.Fields{
		"operation":    "RevokeRefreshToken",
		"user_id":      tokenRecord.UserID,
		"token_family": tokenRecord.TokenFamily,
		"reason":       reason,
	}).Info("Token family revoked successfully")

	return nil
}

// RevokeAllUserRefreshTokens revokes all refresh tokens for a user
//
// Business Logic:
// - Revoke tất cả active tokens của user
// - Set is_active = FALSE và revoked_at = NOW()
// - Lưu revocation reason
//
// Use Cases:
// - User password change (force re-login on all devices)
// - Account compromise detected (revoke all sessions)
// - Admin action (suspend user account)
//
// Parameters:
//   - ctx: Context for cancellation and timeout
//   - userID: User ID
//   - reason: Lý do revoke (for audit logging)
//
// Returns:
//   - error: Database error
func (s *UnifiedJWTService) RevokeAllUserRefreshTokens(ctx context.Context, userID, reason string) error {
	// Validate input
	if err := ValidateUserID(userID); err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "RevokeAllUserRefreshTokens",
			"error":     err.Error(),
		}).Error("Invalid user ID")
		return &JWTError{Op: "RevokeAllUserRefreshTokens", Err: err}
	}

	if s.refreshTokenRepo == nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "RevokeAllUserRefreshTokens",
			"user_id":   userID,
		}).Error("Refresh token repository not available")
		return &JWTError{
			Op:     "RevokeAllUserRefreshTokens",
			UserID: userID,
			Err:    ErrRefreshTokenRepoNil,
		}
	}

	if err := s.refreshTokenRepo.RevokeAllUserTokens(ctx, userID, reason); err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "RevokeAllUserRefreshTokens",
			"user_id":   userID,
			"reason":    reason,
			"error":     err.Error(),
		}).Error("Failed to revoke all user tokens")
		return &JWTError{
			Op:     "RevokeAllUserRefreshTokens",
			UserID: userID,
			Err:    ErrRefreshTokenRevocationFailed,
		}
	}

	s.logger.WithFields(logrus.Fields{
		"operation": "RevokeAllUserRefreshTokens",
		"user_id":   userID,
		"reason":    reason,
	}).Info("All user tokens revoked successfully")

	return nil
}

// GetActiveRefreshTokensForUser returns all active refresh tokens for a user
//
// Business Logic:
// - Query tất cả tokens với is_active = TRUE
// - Filter by user_id
// - Order by created_at DESC
//
// Use Cases:
// - Display active sessions to user
// - Security audit (check for suspicious sessions)
// - Enforce concurrent session limits
//
// Parameters:
//   - ctx: Context for cancellation and timeout
//   - userID: User ID
//
// Returns:
//   - []*repository.RefreshToken: List of active tokens
//   - error: Database error
func (s *UnifiedJWTService) GetActiveRefreshTokensForUser(ctx context.Context, userID string) ([]*repository.RefreshToken, error) {
	// Validate input
	if err := ValidateUserID(userID); err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "GetActiveRefreshTokensForUser",
			"error":     err.Error(),
		}).Error("Invalid user ID")
		return nil, &JWTError{Op: "GetActiveRefreshTokensForUser", Err: err}
	}

	if s.refreshTokenRepo == nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "GetActiveRefreshTokensForUser",
			"user_id":   userID,
		}).Error("Refresh token repository not available")
		return nil, &JWTError{
			Op:     "GetActiveRefreshTokensForUser",
			UserID: userID,
			Err:    ErrRefreshTokenRepoNil,
		}
	}

	tokens, err := s.refreshTokenRepo.GetActiveTokensForUser(ctx, userID)
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "GetActiveRefreshTokensForUser",
			"user_id":   userID,
			"error":     err.Error(),
		}).Error("Failed to get active tokens")
		return nil, &JWTError{
			Op:     "GetActiveRefreshTokensForUser",
			UserID: userID,
			Err:    err,
		}
	}

	s.logger.WithFields(logrus.Fields{
		"operation":   "GetActiveRefreshTokensForUser",
		"user_id":     userID,
		"token_count": len(tokens),
	}).Debug("Retrieved active tokens successfully")

	return tokens, nil
}

// CleanupExpiredTokens removes expired and old revoked tokens
//
// Business Logic:
// - Delete tokens expired > 30 days ago (keep for audit)
// - Delete revoked tokens > 7 days ago
// - Return số lượng tokens đã cleanup
//
// Use Cases:
// - Scheduled cleanup job (daily/weekly)
// - Database maintenance
// - Reduce database size
//
// Parameters:
//   - ctx: Context for cancellation and timeout
//
// Returns:
//   - int: Số lượng tokens đã cleanup
//   - error: Database error
func (s *UnifiedJWTService) CleanupExpiredTokens(ctx context.Context) (int, error) {
	if s.refreshTokenRepo == nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "CleanupExpiredTokens",
		}).Error("Refresh token repository not available")
		return 0, &JWTError{Op: "CleanupExpiredTokens", Err: ErrRefreshTokenRepoNil}
	}

	count, err := s.refreshTokenRepo.CleanupExpiredTokens(ctx)
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "CleanupExpiredTokens",
			"error":     err.Error(),
		}).Error("Failed to cleanup expired tokens")
		return 0, &JWTError{Op: "CleanupExpiredTokens", Err: err}
	}

	s.logger.WithFields(logrus.Fields{
		"operation":     "CleanupExpiredTokens",
		"tokens_cleaned": count,
	}).Info("Expired tokens cleaned up successfully")

	return count, nil
}

// generateSecureRefreshToken generates a cryptographically secure random token
//
// Business Logic:
// - Generate 256 bits (32 bytes) of cryptographically secure random data
// - Encode to base64 URL-safe format for safe transport
// - Result: 44 characters base64 string
//
// Security:
// - Uses crypto/rand for cryptographically secure randomness
// - 256 bits provides sufficient entropy to prevent brute force attacks
// - Base64 URL encoding ensures safe transmission in URLs and headers
//
// Returns:
//   - string: Base64-encoded secure random token (44 characters)
//   - error: Error if random generation fails
func (s *UnifiedJWTService) generateSecureRefreshToken() (string, error) {
	// Generate secure random bytes (256 bits = 32 bytes)
	bytes := make([]byte, SecureRandomTokenSize)
	if _, err := rand.Read(bytes); err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "generateSecureRefreshToken",
			"error":     err.Error(),
		}).Error("Failed to generate secure random bytes")
		return "", &JWTError{Op: "generateSecureRefreshToken", Err: err}
	}

	// Encode to base64 URL-safe format for safe transport
	token := base64.URLEncoding.EncodeToString(bytes)

	s.logger.WithFields(logrus.Fields{
		"operation":    "generateSecureRefreshToken",
		"token_length": len(token),
	}).Debug("Secure refresh token generated successfully")

	return token, nil
}
