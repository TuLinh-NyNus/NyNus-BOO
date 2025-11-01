package websocket

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWTAuthenticator implements TokenAuthenticator interface for JWT validation.
type JWTAuthenticator struct {
	secret []byte
}

// NewJWTAuthenticator creates a new JWT authenticator.
func NewJWTAuthenticator(secret string) *JWTAuthenticator {
	return &JWTAuthenticator{
		secret: []byte(secret),
	}
}

// ValidateToken validates JWT token and returns user ID and role.
// Implements task 2.2.4: Validate JWT token.
func (a *JWTAuthenticator) ValidateToken(tokenString string) (userID string, role string, err error) {
	if tokenString == "" {
		return "", "", fmt.Errorf("token is empty")
	}

	// Parse token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Verify signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return a.secret, nil
	})

	if err != nil {
		return "", "", fmt.Errorf("failed to parse token: %w", err)
	}

	// Verify token is valid
	if !token.Valid {
		return "", "", fmt.Errorf("token is invalid")
	}

	// Extract claims
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", "", fmt.Errorf("invalid token claims")
	}

	// Get user ID
	userIDClaim, ok := claims["user_id"]
	if !ok {
		userIDClaim, ok = claims["sub"]
	}
	if !ok {
		return "", "", fmt.Errorf("user_id not found in token claims")
	}

	userID, ok = userIDClaim.(string)
	if !ok {
		return "", "", fmt.Errorf("user_id is not a string")
	}

	// Get role (optional)
	if roleClaim, ok := claims["role"]; ok {
		if roleStr, ok := roleClaim.(string); ok {
			role = roleStr
		}
	}

	// Check token expiration
	if exp, ok := claims["exp"].(float64); ok {
		expirationTime := time.Unix(int64(exp), 0)
		if time.Now().After(expirationTime) {
			return "", "", fmt.Errorf("token has expired")
		}
	}

	return userID, role, nil
}

// CreateToken creates a new JWT token (for testing purposes).
func (a *JWTAuthenticator) CreateToken(userID, role string, expiresIn time.Duration) (string, error) {
	now := time.Now()

	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"iat":     now.Unix(),
		"exp":     now.Add(expiresIn).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString(a.secret)
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}

	return tokenString, nil
}
