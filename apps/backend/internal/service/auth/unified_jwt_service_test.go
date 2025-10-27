package auth

import (
	"testing"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/util"
	"github.com/golang-jwt/jwt/v5"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// Test constants
const (
	testSecret = "test-jwt-secret-key-for-testing"
	testIssuer = "exam-bank-system" // Match actual issuer
)

// Test user data
var testUser = &entity.User{
	ID:    util.StringToPgText("student-123"),
	Email: util.StringToPgText("test@nynus.com"),
	Role:  util.StringToPgText("STUDENT"),
}

// createTestLogger creates a logger for testing
func createTestLogger() *logrus.Logger {
	logger := logrus.New()
	logger.SetLevel(logrus.ErrorLevel) // Suppress logs during tests
	return logger
}

func TestNewUnifiedJWTService(t *testing.T) {
	tests := []struct {
		name    string
		secret  string
		logger  *logrus.Logger
		wantErr bool
		errMsg  string
	}{
		{
			name:    "Valid secret with logger",
			secret:  testSecret,
			logger:  createTestLogger(),
			wantErr: false,
		},
		{
			name:    "Valid secret with nil logger (should create default)",
			secret:  testSecret,
			logger:  nil,
			wantErr: false,
		},
		{
			name:    "Empty secret should return error",
			secret:  "",
			logger:  createTestLogger(),
			wantErr: true,
			errMsg:  "secret cannot be empty",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			service, err := NewUnifiedJWTService(tt.secret, nil, tt.logger)

			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, service)
				if tt.errMsg != "" {
					assert.Contains(t, err.Error(), tt.errMsg)
				}
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, service)
				assert.Equal(t, tt.secret, service.secret)
				assert.Equal(t, testIssuer, service.issuer)
				assert.NotNil(t, service.logger) // Logger should always be set
			}
		})
	}
}

func TestUnifiedJWTService_GenerateToken(t *testing.T) {
	service, err := NewUnifiedJWTService(testSecret, nil, createTestLogger())
	require.NoError(t, err)

	tests := []struct {
		name    string
		user    *entity.User
		wantErr bool
	}{
		{
			name:    "Valid user",
			user:    testUser,
			wantErr: false,
		},
		{
			name:    "Missing user fields",
			user:    &entity.User{},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			token, err := service.GenerateToken(tt.user)

			if tt.wantErr {
				assert.Error(t, err)
				assert.Empty(t, token)
			} else {
				assert.NoError(t, err)
				assert.NotEmpty(t, token)

				// Verify token can be parsed
				parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
					return []byte(testSecret), nil
				})
				assert.NoError(t, err)
				assert.True(t, parsedToken.Valid)
			}
		})
	}
}

func TestUnifiedJWTService_GenerateAccessToken(t *testing.T) {
	service, err := NewUnifiedJWTService(testSecret, nil, createTestLogger())
	require.NoError(t, err)

	tests := []struct {
		name    string
		userID  string
		email   string
		role    string
		level   int
		wantErr bool
	}{
		{
			name:    "Valid parameters",
			userID:  "student-123",
			email:   "test@nynus.com",
			role:    "student",
			level:   1,
			wantErr: false,
		},
		{
			name:    "Empty userID",
			userID:  "",
			email:   "test@nynus.com",
			role:    "student",
			level:   1,
			wantErr: true, // Validation should fail
		},
		{
			name:    "Admin role with high level",
			userID:  "admin-456",
			email:   "admin@nynus.com",
			role:    "admin",
			level:   5,
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			token, err := service.GenerateAccessToken(tt.userID, tt.email, tt.role, tt.level)

			if tt.wantErr {
				assert.Error(t, err)
				assert.Empty(t, token)
			} else {
				assert.NoError(t, err)
				assert.NotEmpty(t, token)

				// Parse and verify claims
				claims, err := service.ValidateAccessToken(token)
				assert.NoError(t, err)
				assert.Equal(t, tt.userID, claims.UserID)
				assert.Equal(t, tt.email, claims.Email)
				assert.Equal(t, tt.role, claims.Role)
				assert.Equal(t, tt.level, claims.Level)
				assert.Equal(t, testIssuer, claims.Issuer)
			}
		})
	}
}

func TestUnifiedJWTService_GenerateRefreshToken(t *testing.T) {
	service, err := NewUnifiedJWTService(testSecret, nil, createTestLogger())
	require.NoError(t, err)

	tests := []struct {
		name    string
		userID  string
		wantErr bool
	}{
		{
			name:    "Valid userID",
			userID:  "student-123",
			wantErr: false,
		},
		{
			name:    "Empty userID",
			userID:  "",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			token, err := service.GenerateRefreshToken(tt.userID)

			if tt.wantErr {
				assert.Error(t, err)
				assert.Empty(t, token)
			} else {
				assert.NoError(t, err)
				assert.NotEmpty(t, token)

				// Verify refresh token can be validated
				userID, err := service.ValidateRefreshToken(token)
				assert.NoError(t, err)
				assert.Equal(t, tt.userID, userID)
			}
		})
	}
}

func TestUnifiedJWTService_ValidateToken(t *testing.T) {
	service, err := NewUnifiedJWTService(testSecret, nil, createTestLogger())
	require.NoError(t, err)

	// Generate a valid token first
	validToken, err := service.GenerateAccessToken("student-123", "test@nynus.com", "student", 1)
	require.NoError(t, err)

	tests := []struct {
		name    string
		token   string
		wantErr bool
	}{
		{
			name:    "Valid token",
			token:   validToken,
			wantErr: false,
		},
		{
			name:    "Empty token",
			token:   "",
			wantErr: true,
		},
		{
			name:    "Invalid token format",
			token:   "invalid.token.format",
			wantErr: true,
		},
		{
			name:    "Token with wrong secret",
			token:   generateTokenWithWrongSecret(t),
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			claims, err := service.ValidateToken(tt.token)

			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, claims)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, claims)
				assert.Equal(t, "student-123", claims.UserID)
				assert.Equal(t, "test@nynus.com", claims.Email)
				assert.Equal(t, "student", claims.Role)
			}
		})
	}
}

func TestUnifiedJWTService_ValidateAccessToken(t *testing.T) {
	service, err := NewUnifiedJWTService(testSecret, nil, createTestLogger())
	require.NoError(t, err)

	// Test expired token
	expiredService := &UnifiedJWTService{
		secret:        testSecret,
		accessExpiry:  -time.Hour, // Expired 1 hour ago
		refreshExpiry: 24 * time.Hour,
		issuer:        testIssuer,
		logger:        createTestLogger(),
	}

	expiredToken, err := expiredService.GenerateAccessToken("student-123", "test@nynus.com", "student", 1)
	require.NoError(t, err)

	tests := []struct {
		name    string
		token   string
		wantErr bool
		errMsg  string
	}{
		{
			name:    "Expired token",
			token:   expiredToken,
			wantErr: true,
			errMsg:  "token has expired",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			claims, err := service.ValidateAccessToken(tt.token)

			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, claims)
				if tt.errMsg != "" {
					assert.Contains(t, err.Error(), tt.errMsg)
				}
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, claims)
			}
		})
	}
}

func TestUnifiedJWTService_ValidateRefreshToken(t *testing.T) {
	service, err := NewUnifiedJWTService(testSecret, nil, createTestLogger())
	require.NoError(t, err)

	// Generate valid refresh token
	validRefreshToken, err := service.GenerateRefreshToken("student-123")
	require.NoError(t, err)

	tests := []struct {
		name       string
		token      string
		wantErr    bool
		wantUserID string
	}{
		{
			name:       "Valid refresh token",
			token:      validRefreshToken,
			wantErr:    false,
			wantUserID: "student-123",
		},
		{
			name:    "Empty refresh token",
			token:   "",
			wantErr: true,
		},
		{
			name:    "Invalid refresh token",
			token:   "invalid.refresh.token",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			userID, err := service.ValidateRefreshToken(tt.token)

			if tt.wantErr {
				assert.Error(t, err)
				assert.Empty(t, userID)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.wantUserID, userID)
			}
		})
	}
}

// Helper function to generate token with wrong secret for testing
func generateTokenWithWrongSecret(t *testing.T) string {
	wrongService, err := NewUnifiedJWTService("wrong-secret", nil, createTestLogger())
	require.NoError(t, err)
	token, err := wrongService.GenerateAccessToken("student-123", "test@nynus.com", "student", 1)
	require.NoError(t, err)
	return token
}
