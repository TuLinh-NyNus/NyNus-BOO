package auth

import (
	"context"
	"testing"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/constant"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

// Mock repositories for testing
type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) GetByEmail(email string, db database.QueryExecer) (*entity.User, error) {
	args := m.Called(email, db)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.User), args.Error(1)
}

func (m *MockUserRepository) GetByID(ctx context.Context, db database.QueryExecer, userID string) (entity.User, error) {
	args := m.Called(ctx, db, userID)
	if args.Get(0) == nil {
		return entity.User{}, args.Error(1)
	}
	// Handle both *entity.User and entity.User
	if user, ok := args.Get(0).(*entity.User); ok {
		return *user, args.Error(1)
	}
	return args.Get(0).(entity.User), args.Error(1)
}

func (m *MockUserRepository) Create(ctx context.Context, db database.QueryExecer, user *entity.User) error {
	args := m.Called(ctx, db, user)
	return args.Error(0)
}

type MockEnhancedUserRepository struct {
	mock.Mock
}

func (m *MockEnhancedUserRepository) GetByEmail(ctx context.Context, email string) (*repository.User, error) {
	args := m.Called(ctx, email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*repository.User), args.Error(1)
}

func (m *MockEnhancedUserRepository) IncrementLoginAttempts(ctx context.Context, userID string) error {
	args := m.Called(ctx, userID)
	return args.Error(0)
}

func (m *MockEnhancedUserRepository) ResetLoginAttempts(ctx context.Context, userID string) error {
	args := m.Called(ctx, userID)
	return args.Error(0)
}

func (m *MockEnhancedUserRepository) LockAccount(ctx context.Context, userID string, until time.Time) error {
	args := m.Called(ctx, userID, until)
	return args.Error(0)
}

func (m *MockEnhancedUserRepository) UpdateLastLogin(ctx context.Context, userID, ipAddress string) error {
	args := m.Called(ctx, userID, ipAddress)
	return args.Error(0)
}

// Test setup helpers
func createTestAuthService(t *testing.T) (*AuthService, *MockUserRepository, *MockEnhancedUserRepository) {
	mockUserRepo := &MockUserRepository{}
	mockEnhancedRepo := &MockEnhancedUserRepository{}
	mockPreferenceRepo := repository.NewUserPreferenceRepository(nil)

	// Create test logger
	testLogger := logrus.New()
	testLogger.SetLevel(logrus.ErrorLevel) // Suppress logs during tests

	// Create UnifiedJWTService with logger
	unifiedJWT, err := NewUnifiedJWTService("test-secret", nil, testLogger)
	require.NoError(t, err, "Failed to create UnifiedJWTService for testing")

	service := &AuthService{
		userRepo:     mockUserRepo,
		enhancedUserRepo: mockEnhancedRepo,
		preferenceRepo:   mockPreferenceRepo,
		jwtService:       unifiedJWT, // Use IJWTService interface
		bcryptCost:       4,          // Low cost for faster tests
	}

	return service, mockUserRepo, mockEnhancedRepo
}

func createTestUser(email, password, role string) *entity.User {
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), 4)
	return &entity.User{
		ID:            util.StringToPgText("test-user-123"),
		Email:         util.StringToPgText(email),
		PasswordHash:  util.StringToPgText(string(hashedPassword)),
		Role:          util.StringToPgText(role),
		FirstName:     util.StringToPgText("Test"),
		LastName:      util.StringToPgText("User"),
		IsActive:      util.BoolToPgBool(true), // Account is active
		Status:        util.StringToPgText("ACTIVE"),
		EmailVerified: util.BoolToPgBool(true), // Email is verified
	}
}

func TestAuthService_Login_Success(t *testing.T) {
	service, mockUserRepo, mockEnhancedRepo := createTestAuthService(t)

	testUser := createTestUser("test@nynus.com", "password123", constant.RoleStudent)

	// Setup mocks
	mockUserRepo.On("GetByEmail", "test@nynus.com", mock.Anything).Return(testUser, nil)
	mockEnhancedRepo.On("GetByEmail", mock.Anything, "test@nynus.com").Return(&repository.User{
		ID:          "test-user-123",
		Email:       "test@nynus.com",
		LockedUntil: nil, // Not locked
	}, nil)
	mockEnhancedRepo.On("ResetLoginAttempts", mock.Anything, "test-user-123").Return(nil)

	// Test login
	user, token, err := service.Login(nil, "test@nynus.com", "password123")

	// Assertions
	assert.NoError(t, err)
	assert.NotNil(t, user)
	assert.NotEmpty(t, token)
	assert.Equal(t, "test@nynus.com", util.PgTextToString(user.Email))

	// Verify mocks were called
	mockUserRepo.AssertExpectations(t)
	mockEnhancedRepo.AssertExpectations(t)
}

func TestAuthService_Login_InvalidCredentials(t *testing.T) {
	service, mockUserRepo, _ := createTestAuthService(t)

	// Setup mock to return error (user not found)
	mockUserRepo.On("GetByEmail", "nonexistent@nynus.com", mock.Anything).Return(nil, assert.AnError)

	// Test login with invalid email
	user, token, err := service.Login(nil, "nonexistent@nynus.com", "password123")

	// Assertions
	assert.Error(t, err)
	assert.Nil(t, user)
	assert.Empty(t, token)
	assert.Contains(t, err.Error(), "invalid credentials")

	mockUserRepo.AssertExpectations(t)
}

func TestAuthService_Login_WrongPassword(t *testing.T) {
	service, mockUserRepo, mockEnhancedRepo := createTestAuthService(t)

	testUser := createTestUser("test@nynus.com", "correctpassword", constant.RoleStudent)

	// Setup mocks
	mockUserRepo.On("GetByEmail", "test@nynus.com", mock.Anything).Return(testUser, nil)
	mockEnhancedRepo.On("GetByEmail", mock.Anything, "test@nynus.com").Return(&repository.User{
		ID:          "test-user-123",
		Email:       "test@nynus.com",
		LockedUntil: nil,
	}, nil)
	mockEnhancedRepo.On("IncrementLoginAttempts", mock.Anything, "test-user-123").Return(nil)

	// Test login with wrong password
	user, token, err := service.Login(nil, "test@nynus.com", "wrongpassword")

	// Assertions
	assert.Error(t, err)
	assert.Nil(t, user)
	assert.Empty(t, token)
	assert.Contains(t, err.Error(), "invalid credentials")

	mockUserRepo.AssertExpectations(t)
	mockEnhancedRepo.AssertExpectations(t)
}

func TestAuthService_Login_AccountLocked(t *testing.T) {
	service, mockUserRepo, mockEnhancedRepo := createTestAuthService(t)

	testUser := createTestUser("test@nynus.com", "password123", constant.RoleStudent)
	lockTime := time.Now().Add(time.Hour) // Locked for 1 hour

	// Setup mocks
	mockUserRepo.On("GetByEmail", "test@nynus.com", mock.Anything).Return(testUser, nil)
	mockEnhancedRepo.On("GetByEmail", mock.Anything, "test@nynus.com").Return(&repository.User{
		ID:          "test-user-123",
		Email:       "test@nynus.com",
		LockedUntil: &lockTime, // Account is locked
	}, nil)

	// Test login with locked account
	user, token, err := service.Login(nil, "test@nynus.com", "password123")

	// Assertions
	assert.Error(t, err)
	assert.Nil(t, user)
	assert.Empty(t, token)
	assert.Contains(t, err.Error(), "account is locked")

	mockUserRepo.AssertExpectations(t)
	mockEnhancedRepo.AssertExpectations(t)
}

func TestAuthService_ValidateToken(t *testing.T) {
	service, _, _ := createTestAuthService(t)

	// Generate a valid token using IJWTService.GenerateAccessToken
	token, err := service.jwtService.GenerateAccessToken(
		"test-user-123",
		"test@nynus.com",
		constant.RoleStudent,
		1, // level
	)
	require.NoError(t, err)

	tests := []struct {
		name    string
		token   string
		wantErr bool
	}{
		{
			name:    "Valid token",
			token:   token,
			wantErr: false,
		},
		{
			name:    "Empty token",
			token:   "",
			wantErr: true,
		},
		{
			name:    "Invalid token",
			token:   "invalid.token.here",
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
				assert.Equal(t, "test-user-123", claims.UserID)
				assert.Equal(t, "test@nynus.com", claims.Email)
			}
		})
	}
}

func TestAuthService_IsAdmin(t *testing.T) {
	service, mockUserRepo, _ := createTestAuthService(t)

	tests := []struct {
		name     string
		userRole string
		expected bool
		wantErr  bool
	}{
		{
			name:     "Admin user",
			userRole: constant.RoleAdmin,
			expected: true,
			wantErr:  false,
		},
		{
			name:     "Student user",
			userRole: constant.RoleStudent,
			expected: false,
			wantErr:  false,
		},
		{
			name:     "Teacher user",
			userRole: constant.RoleTeacher,
			expected: false,
			wantErr:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			testUser := createTestUser("test@nynus.com", "password123", tt.userRole)

			mockUserRepo.On("GetByID", mock.Anything, mock.Anything, "test-user-123").Return(testUser, nil)

			isAdmin, err := service.IsAdmin(nil, "test-user-123")

			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expected, isAdmin)
			}

			mockUserRepo.AssertExpectations(t)
			// Reset mock for next iteration
			mockUserRepo.ExpectedCalls = nil
		})
	}
}

func TestAuthService_IsTeacherOrAdmin(t *testing.T) {
	service, mockUserRepo, _ := createTestAuthService(t)

	tests := []struct {
		name     string
		userRole string
		expected bool
	}{
		{
			name:     "Admin user",
			userRole: constant.RoleAdmin,
			expected: true,
		},
		{
			name:     "Teacher user",
			userRole: constant.RoleTeacher,
			expected: true,
		},
		{
			name:     "Student user",
			userRole: constant.RoleStudent,
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			testUser := createTestUser("test@nynus.com", "password123", tt.userRole)

			mockUserRepo.On("GetByID", mock.Anything, mock.Anything, "test-user-123").Return(testUser, nil)

			result, err := service.IsTeacherOrAdmin(nil, "test-user-123")

			assert.NoError(t, err)
			assert.Equal(t, tt.expected, result)

			mockUserRepo.AssertExpectations(t)
			// Reset mock for next iteration
			mockUserRepo.ExpectedCalls = nil
		})
	}
}

func TestAuthService_GetUserRole(t *testing.T) {
	service, mockUserRepo, _ := createTestAuthService(t)

	testUser := createTestUser("test@nynus.com", "password123", constant.RoleTeacher)

	mockUserRepo.On("GetByID", mock.Anything, mock.Anything, "test-user-123").Return(testUser, nil)

	role, err := service.GetUserRole(nil, "test-user-123")

	assert.NoError(t, err)
	assert.Equal(t, constant.RoleTeacher, role)

	mockUserRepo.AssertExpectations(t)
}

func TestAuthService_getBcryptCost(t *testing.T) {
	tests := []struct {
		name           string
		configuredCost int
		expectedCost   int
	}{
		{
			name:           "Valid cost",
			configuredCost: 12,
			expectedCost:   12,
		},
		{
			name:           "Low cost should use secure default",
			configuredCost: 8,
			expectedCost:   12,
		},
		{
			name:           "Zero cost should use secure default",
			configuredCost: 0,
			expectedCost:   12,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			service := &AuthService{
				bcryptCost: tt.configuredCost,
			}

			cost := service.getBcryptCost()
			assert.Equal(t, tt.expectedCost, cost)
		})
	}
}
