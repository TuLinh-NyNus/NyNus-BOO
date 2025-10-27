//go:build integration && user_service_integration

package grpc

import (
	"context"
	"testing"
	"time"

	"exam-bank-system/apps/backend/internal/repository"
	"exam-bank-system/apps/backend/internal/service/auth"
	"exam-bank-system/apps/backend/internal/service/user/oauth"
	"exam-bank-system/apps/backend/internal/service/user/session"
	"exam-bank-system/apps/backend/internal/services/email"
	"exam-bank-system/apps/backend/pkg/proto/common"
	v1 "exam-bank-system/apps/backend/pkg/proto/v1"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// Mock dependencies
type MockOAuthService struct {
	mock.Mock
}

func (m *MockOAuthService) VerifyGoogleIDToken(ctx context.Context, idToken string) (*oauth.GoogleUserInfo, error) {
	args := m.Called(ctx, idToken)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*oauth.GoogleUserInfo), args.Error(1)
}

type MockSessionService struct {
	mock.Mock
}

func (m *MockSessionService) CreateSession(ctx context.Context, userID, ipAddress, userAgent, deviceFingerprint string) (*session.Session, error) {
	args := m.Called(ctx, userID, ipAddress, userAgent, deviceFingerprint)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*session.Session), args.Error(1)
}

func (m *MockSessionService) GenerateEmailVerificationToken(ctx context.Context, userID string) (string, error) {
	args := m.Called(ctx, userID)
	return args.Get(0).(string), args.Error(1)
}

type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) GetByEmail(ctx context.Context, email string) (*repository.User, error) {
	args := m.Called(ctx, email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*repository.User), args.Error(1)
}

func (m *MockUserRepository) Create(ctx context.Context, user *repository.User) (*repository.User, error) {
	args := m.Called(ctx, user)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*repository.User), args.Error(1)
}

func (m *MockUserRepository) ResetLoginAttempts(ctx context.Context, userID string) error {
	args := m.Called(ctx, userID)
	return args.Error(0)
}

func (m *MockUserRepository) IncrementLoginAttempts(ctx context.Context, userID string) error {
	args := m.Called(ctx, userID)
	return args.Error(0)
}

type MockEmailService struct {
	mock.Mock
}

func (m *MockEmailService) SendVerificationEmail(email, userName, token string) error {
	args := m.Called(email, userName, token)
	return args.Error(0)
}

// Test setup helper vá»›i IJWTService interface
func createTestEnhancedUserService(t *testing.T) (*EnhancedUserServiceServer, *MockOAuthService, *MockSessionService, *MockUserRepository, *MockEmailService) {
	mockOAuth := &MockOAuthService{}
	mockSession := &MockSessionService{}
	mockUserRepo := &MockUserRepository{}
	mockEmail := &MockEmailService{}

	// Create test logger
	testLogger := logrus.New()
	testLogger.SetLevel(logrus.ErrorLevel) // Suppress logs during tests

	// Create UnifiedJWTService vá»›i logger
	jwtService, err := auth.NewUnifiedJWTService("test-secret", nil, testLogger)
	require.NoError(t, err, "Failed to create UnifiedJWTService for testing")

	service := NewEnhancedUserServiceServer(
		mockOAuth,
		mockSession,
		jwtService, // Pass IJWTService interface
		mockUserRepo,
		mockEmail,
		4, // Low bcrypt cost for faster tests
	)

	return service, mockOAuth, mockSession, mockUserRepo, mockEmail
}

func createTestRepositoryUser(email, password string, role common.UserRole) *repository.User {
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), 4)
	return &repository.User{
		ID:            "test-user-123",
		Email:         email,
		PasswordHash:  string(hashedPassword),
		FirstName:     "Test",
		LastName:      "User",
		Role:          role,
		Status:        "ACTIVE",
		Level:         1,
		EmailVerified: true,
		IsActive:      true,
		LockedUntil:   nil,
		LoginAttempts: 0,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}
}

func TestEnhancedUserServiceServer_Login_Success(t *testing.T) {
	service, _, mockSession, mockUserRepo, _ := createTestEnhancedUserService(t)

	testUser := createTestRepositoryUser("test@nynus.com", "password123", common.UserRole_USER_ROLE_STUDENT)

	// Setup mocks
	mockUserRepo.On("GetByEmail", mock.Anything, "test@nynus.com").Return(testUser, nil)
	mockUserRepo.On("ResetLoginAttempts", mock.Anything, "test-user-123").Return(nil)
	mockSession.On("CreateSession", mock.Anything, "test-user-123", mock.AnythingOfType("string"), mock.AnythingOfType("string"), mock.AnythingOfType("string")).Return(&session.Session{
		ID:        "session-123",
		UserID:    "test-user-123",
		Token:     "session-token-123",
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}, nil)

	// Create request
	req := &v1.LoginRequest{
		Email:    "test@nynus.com",
		Password: "password123",
	}

	// Test login
	resp, err := service.Login(context.Background(), req)

	// Assertions
	assert.NoError(t, err)
	assert.NotNil(t, resp)
	assert.NotEmpty(t, resp.GetAccessToken())
	assert.NotEmpty(t, resp.GetRefreshToken())
	assert.NotNil(t, resp.GetUser())
	assert.Equal(t, "test@nynus.com", resp.GetUser().GetEmail())
	assert.Equal(t, common.UserRole_USER_ROLE_STUDENT, resp.GetUser().GetRole())

	// Verify mocks were called
	mockUserRepo.AssertExpectations(t)
	mockSession.AssertExpectations(t)
}

func TestEnhancedUserServiceServer_Login_InvalidCredentials(t *testing.T) {
	service, _, _, mockUserRepo, _ := createTestEnhancedUserService(t)

	// Setup mock to return error (user not found)
	mockUserRepo.On("GetByEmail", mock.Anything, "nonexistent@nynus.com").Return(nil, assert.AnError)

	// Create request
	req := &v1.LoginRequest{
		Email:    "nonexistent@nynus.com",
		Password: "password123",
	}

	// Test login
	resp, err := service.Login(context.Background(), req)

	// Assertions
	assert.Error(t, err)
	assert.Nil(t, resp)

	// Check gRPC status
	st, ok := status.FromError(err)
	assert.True(t, ok)
	assert.Equal(t, codes.Unauthenticated, st.Code())

	mockUserRepo.AssertExpectations(t)
}

func TestEnhancedUserServiceServer_Login_WrongPassword(t *testing.T) {
	service, _, _, mockUserRepo, _ := createTestEnhancedUserService(t)

	testUser := createTestRepositoryUser("test@nynus.com", "correctpassword", common.UserRole_USER_ROLE_STUDENT)

	// Setup mocks
	mockUserRepo.On("GetByEmail", mock.Anything, "test@nynus.com").Return(testUser, nil)
	mockUserRepo.On("IncrementLoginAttempts", mock.Anything, "test-user-123").Return(nil)

	// Create request with wrong password
	req := &v1.LoginRequest{
		Email:    "test@nynus.com",
		Password: "wrongpassword",
	}

	// Test login
	resp, err := service.Login(context.Background(), req)

	// Assertions
	assert.Error(t, err)
	assert.Nil(t, resp)

	// Check gRPC status
	st, ok := status.FromError(err)
	assert.True(t, ok)
	assert.Equal(t, codes.Unauthenticated, st.Code())

	mockUserRepo.AssertExpectations(t)
}

func TestEnhancedUserServiceServer_Login_AccountLocked(t *testing.T) {
	service, _, _, mockUserRepo, _ := createTestEnhancedUserService(t)

	lockTime := time.Now().Add(time.Hour) // Locked for 1 hour
	testUser := createTestRepositoryUser("test@nynus.com", "password123", common.UserRole_USER_ROLE_STUDENT)
	testUser.LockedUntil = &lockTime

	// Setup mock
	mockUserRepo.On("GetByEmail", mock.Anything, "test@nynus.com").Return(testUser, nil)

	// Create request
	req := &v1.LoginRequest{
		Email:    "test@nynus.com",
		Password: "password123",
	}

	// Test login
	resp, err := service.Login(context.Background(), req)

	// Assertions
	assert.Error(t, err)
	assert.Nil(t, resp)

	// Check gRPC status
	st, ok := status.FromError(err)
	assert.True(t, ok)
	assert.Equal(t, codes.PermissionDenied, st.Code())
	assert.Contains(t, st.Message(), "account is locked")

	mockUserRepo.AssertExpectations(t)
}

func TestEnhancedUserServiceServer_Login_EmptyCredentials(t *testing.T) {
	service, _, _, _, _ := createTestEnhancedUserService(t)

	tests := []struct {
		name     string
		email    string
		password string
	}{
		{
			name:     "Empty email",
			email:    "",
			password: "password123",
		},
		{
			name:     "Empty password",
			email:    "test@nynus.com",
			password: "",
		},
		{
			name:     "Both empty",
			email:    "",
			password: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := &v1.LoginRequest{
				Email:    tt.email,
				Password: tt.password,
			}

			resp, err := service.Login(context.Background(), req)

			assert.Error(t, err)
			assert.Nil(t, resp)

			// Check gRPC status
			st, ok := status.FromError(err)
			assert.True(t, ok)
			assert.Equal(t, codes.InvalidArgument, st.Code())
		})
	}
}

func TestEnhancedUserServiceServer_Register_Success(t *testing.T) {
	service, _, _, mockUserRepo, _ := createTestEnhancedUserService(t)

	// Setup mock - user doesn't exist yet
	mockUserRepo.On("GetByEmail", mock.Anything, "newuser@nynus.com").Return(nil, assert.AnError)

	// Setup mock for user creation
	createdUser := createTestRepositoryUser("newuser@nynus.com", "password123", common.UserRole_USER_ROLE_STUDENT)
	mockUserRepo.On("Create", mock.Anything, mock.AnythingOfType("*repository.User")).Return(createdUser, nil)

	// Create request
	req := &v1.RegisterRequest{
		Email:     "newuser@nynus.com",
		Password:  "password123",
		FirstName: "New",
		LastName:  "User",
	}

	// Test register
	resp, err := service.Register(context.Background(), req)

	// Assertions
	assert.NoError(t, err)
	assert.NotNil(t, resp)
	assert.NotNil(t, resp.GetResponse())
	assert.True(t, resp.GetResponse().GetSuccess())
	assert.NotNil(t, resp.GetUser())
	assert.Equal(t, "newuser@nynus.com", resp.GetUser().GetEmail())

	mockUserRepo.AssertExpectations(t)
}

func TestEnhancedUserServiceServer_Register_UserAlreadyExists(t *testing.T) {
	service, _, _, mockUserRepo, _ := createTestEnhancedUserService(t)

	existingUser := createTestRepositoryUser("existing@nynus.com", "password123", common.UserRole_USER_ROLE_STUDENT)

	// Setup mock - user already exists
	mockUserRepo.On("GetByEmail", mock.Anything, "existing@nynus.com").Return(existingUser, nil)

	// Create request
	req := &v1.RegisterRequest{
		Email:     "existing@nynus.com",
		Password:  "password123",
		FirstName: "Existing",
		LastName:  "User",
	}

	// Test register
	resp, err := service.Register(context.Background(), req)

	// Assertions
	assert.Error(t, err)
	assert.Nil(t, resp)

	// Check gRPC status
	st, ok := status.FromError(err)
	assert.True(t, ok)
	assert.Equal(t, codes.AlreadyExists, st.Code())

	mockUserRepo.AssertExpectations(t)
}

func TestEnhancedUserServiceServer_Register_InvalidInput(t *testing.T) {
	service, _, _, _, _ := createTestEnhancedUserService(t)

	tests := []struct {
		name      string
		email     string
		password  string
		firstName string
		lastName  string
	}{
		{
			name:      "Empty email",
			email:     "",
			password:  "password123",
			firstName: "Test",
			lastName:  "User",
		},
		{
			name:      "Empty password",
			email:     "test@nynus.com",
			password:  "",
			firstName: "Test",
			lastName:  "User",
		},
		{
			name:      "Empty first name",
			email:     "test@nynus.com",
			password:  "password123",
			firstName: "",
			lastName:  "User",
		},
		{
			name:      "Empty last name",
			email:     "test@nynus.com",
			password:  "password123",
			firstName: "Test",
			lastName:  "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := &v1.RegisterRequest{
				Email:     tt.email,
				Password:  tt.password,
				FirstName: tt.firstName,
				LastName:  tt.lastName,
			}

			resp, err := service.Register(context.Background(), req)

			assert.Error(t, err)
			assert.Nil(t, resp)

			// Check gRPC status
			st, ok := status.FromError(err)
			assert.True(t, ok)
			assert.Equal(t, codes.InvalidArgument, st.Code())
		})
	}
}

func TestEnhancedUserServiceServer_SendVerificationEmail_Success(t *testing.T) {
	service, _, mockSession, mockUserRepo, mockEmail := createTestEnhancedUserService(t)

	testUser := createTestRepositoryUser("test@nynus.com", "password123", common.UserRole_USER_ROLE_STUDENT)
	testUser.EmailVerified = false // Not verified yet

	// Setup mocks
	mockUserRepo.On("GetByEmail", mock.Anything, "test@nynus.com").Return(testUser, nil)
	mockSession.On("GenerateEmailVerificationToken", mock.Anything, "test-user-123").Return("verification-token-123", nil)
	mockEmail.On("SendVerificationEmail", "test@nynus.com", "Test User", "verification-token-123").Return(nil)

	// Create request
	req := &v1.SendVerificationEmailRequest{
		Email: "test@nynus.com",
	}

	// Test send verification email
	resp, err := service.SendVerificationEmail(context.Background(), req)

	// Assertions
	assert.NoError(t, err)
	assert.NotNil(t, resp)
	assert.NotNil(t, resp.GetResponse())
	assert.True(t, resp.GetResponse().GetSuccess())

	// Verify mocks were called
	mockUserRepo.AssertExpectations(t)
	mockSession.AssertExpectations(t)
	mockEmail.AssertExpectations(t)
}
