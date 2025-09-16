package auth

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWTService handles JWT token operations
type JWTService struct {
	accessSecret  string
	refreshSecret string
	accessExpiry  time.Duration
	refreshExpiry time.Duration
}

// NewJWTService creates a new JWT service
func NewJWTService(accessSecret, refreshSecret string) *JWTService {
	return &JWTService{
		accessSecret:  accessSecret,
		refreshSecret: refreshSecret,
		accessExpiry:  24 * time.Hour,       // 24 hours for access token
		refreshExpiry: 30 * 24 * time.Hour,  // 30 days for refresh token
	}
}

// AccessTokenClaims represents access token claims
type AccessTokenClaims struct {
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

// GenerateAccessToken generates a new access token
func (s *JWTService) GenerateAccessToken(userID, email, role string, level int) (string, error) {
	claims := &AccessTokenClaims{
		UserID: userID,
		Email:  email,
		Role:   role,
		Level:  level,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(s.accessExpiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "exam-bank-system",
			Subject:   userID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.accessSecret))
}

// GenerateRefreshToken generates a new refresh token
func (s *JWTService) GenerateRefreshToken(userID string) (string, error) {
	claims := &RefreshTokenClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(s.refreshExpiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "exam-bank-system",
			Subject:   userID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.refreshSecret))
}

// ValidateAccessToken validates an access token
func (s *JWTService) ValidateAccessToken(tokenString string) (*AccessTokenClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &AccessTokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.accessSecret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("invalid token: %w", err)
	}

	if claims, ok := token.Claims.(*AccessTokenClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token claims")
}

// ValidateRefreshToken validates a refresh token
func (s *JWTService) ValidateRefreshToken(tokenString string) (string, error) {
	token, err := jwt.ParseWithClaims(tokenString, &RefreshTokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.refreshSecret), nil
	})

	if err != nil {
		return "", fmt.Errorf("invalid refresh token: %w", err)
	}

	if claims, ok := token.Claims.(*RefreshTokenClaims); ok && token.Valid {
		return claims.UserID, nil
	}

	return "", fmt.Errorf("invalid refresh token claims")
}

// SetAccessExpiry sets custom access token expiry duration
func (s *JWTService) SetAccessExpiry(duration time.Duration) {
	s.accessExpiry = duration
}

// SetRefreshExpiry sets custom refresh token expiry duration
func (s *JWTService) SetRefreshExpiry(duration time.Duration) {
	s.refreshExpiry = duration
}

// RoleHierarchy defines the role hierarchy levels
var RoleHierarchy = map[string]int{
	"GUEST":   0,
	"STUDENT": 1,
	"TUTOR":   2,
	"TEACHER": 3,
	"ADMIN":   4,
}

// HasMinimumRole checks if a role has minimum required level
func HasMinimumRole(userRole, requiredRole string) bool {
	userLevel, userExists := RoleHierarchy[userRole]
	requiredLevel, reqExists := RoleHierarchy[requiredRole]
	
	if !userExists || !reqExists {
		return false
	}
	
	return userLevel >= requiredLevel
}

// IsValidRole checks if a role is valid
func IsValidRole(role string) bool {
	_, exists := RoleHierarchy[role]
	return exists
}

// GetRoleLevel returns the hierarchy level of a role
func GetRoleLevel(role string) int {
	level, exists := RoleHierarchy[role]
	if !exists {
		return -1
	}
	return level
}