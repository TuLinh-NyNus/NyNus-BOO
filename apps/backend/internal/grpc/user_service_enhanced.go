package grpc

import (
	"context"
	"errors"
	"log"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/middleware"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/auth"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/user/oauth"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/user/session"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/services/email"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/common"
	v1 "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/v1"
)

// EnhancedUserServiceServer implements the enhanced UserService with OAuth và IJWTService interface
// Service chính xử lý các gRPC requests liên quan đến user authentication và management
//
// Business Logic:
// - Traditional email/password authentication (Login)
// - User registration với email verification
// - Google OAuth authentication
// - Token refresh với rotation
// - Email verification
// - Password reset flow
// - User profile management (GetCurrentUser, UpdateUser)
type EnhancedUserServiceServer struct {
	v1.UnimplementedUserServiceServer
	oauthService         *oauth.OAuthService
	sessionService       *session.SessionService
	jwtService           auth.IJWTService // Use interface instead of concrete type
	userRepo             repository.IUserRepository
	emailService         *email.EmailService
	loginHandler         *LoginHandler
	registrationHandler  *RegistrationHandler
	passwordResetHandler *PasswordResetHandler
	bcryptCost           int
}

// NewEnhancedUserServiceServer creates a new enhanced user service với IJWTService interface
// Tạo instance mới của EnhancedUserServiceServer với đầy đủ dependencies và handlers
//
// Parameters:
//   - oauthService: OAuth service for Google login
//   - sessionService: Session management service
//   - jwtService: JWT service interface for token generation (accepts IJWTService)
//   - userRepo: User repository for database operations
//   - emailService: Email service for sending verification emails
//   - bcryptCost: Bcrypt cost for password hashing (min: 10, default: 12)
//
// Returns:
//   - *EnhancedUserServiceServer: Configured service instance
func NewEnhancedUserServiceServer(
	oauthService *oauth.OAuthService,
	sessionService *session.SessionService,
	jwtService auth.IJWTService, // Accept interface instead of concrete type
	userRepo repository.IUserRepository,
	emailService *email.EmailService,
	bcryptCost int,
) *EnhancedUserServiceServer {
	// Ensure bcrypt cost is secure
	if bcryptCost < MinBcryptCost {
		bcryptCost = DefaultBcryptCost
	}

	// Initialize handlers với IJWTService interface
	loginHandler := NewLoginHandler(userRepo, jwtService, sessionService)
	registrationHandler := NewRegistrationHandler(userRepo, emailService, sessionService, bcryptCost)
	passwordResetHandler := NewPasswordResetHandler(userRepo, emailService, sessionService, bcryptCost)

	return &EnhancedUserServiceServer{
		oauthService:         oauthService,
		sessionService:       sessionService,
		jwtService:           jwtService,
		userRepo:             userRepo,
		emailService:         emailService,
		loginHandler:         loginHandler,
		registrationHandler:  registrationHandler,
		passwordResetHandler: passwordResetHandler,
		bcryptCost:           bcryptCost,
	}
}

// Login handles traditional email/password authentication
// Xử lý đăng nhập bằng email và password với các tính năng bảo mật nâng cao
//
// Parameters:
//   - ctx: gRPC context
//   - req: Login request với email và password
//
// Returns:
//   - *v1.LoginResponse: Response chứa tokens và user info
//   - error: Error nếu đăng nhập thất bại
func (s *EnhancedUserServiceServer) Login(ctx context.Context, req *v1.LoginRequest) (*v1.LoginResponse, error) {
	// Validate input
	if req.Email == "" || req.Password == "" {
		log.Printf("DEBUG: Login - Missing email or password")
		return nil, status.Errorf(codes.InvalidArgument, ErrEmailRequired)
	}

	log.Printf("DEBUG: Login - Starting login for email: %s", req.Email)

	// Validate credentials
	user, err := s.loginHandler.ValidateCredentials(ctx, req.Email, req.Password)
	if err != nil {
		log.Printf("DEBUG: Login - ValidateCredentials failed: %v", err)
		return nil, err
	}

	log.Printf("DEBUG: Login - Credentials validated successfully for user: %s", user.ID)

	// Check account security (locked, inactive, suspended)
	if err := s.loginHandler.CheckAccountSecurity(ctx, user); err != nil {
		log.Printf("DEBUG: Login - CheckAccountSecurity failed: %v", err)
		return nil, err
	}

	log.Printf("DEBUG: Login - Account security check passed")

	// Reset login attempts after successful authentication
	_ = s.loginHandler.ResetLoginAttempts(ctx, user.ID)

	// Get client context for token generation
	ipAddress := getClientIP(ctx)
	userAgent := getUserAgent(ctx)
	deviceFingerprint := generateDeviceFingerprint(userAgent)

	log.Printf("DEBUG: Login - Generating tokens for user: %s, IP: %s", user.ID, ipAddress)

	// Generate tokens
	tokenResponse, err := s.loginHandler.GenerateTokens(ctx, user, ipAddress, userAgent, deviceFingerprint)
	if err != nil {
		log.Printf("DEBUG: Login - GenerateTokens failed: %v", err)
		return nil, err
	}

	log.Printf("DEBUG: Login - Tokens generated successfully")

	// Create session
	sessionToken, _ := s.loginHandler.CreateSession(ctx, user, ipAddress, userAgent, deviceFingerprint)

	log.Printf("DEBUG: Login - Session created: %s", sessionToken)

	// Update last login
	_ = s.loginHandler.UpdateLastLogin(ctx, user.ID, ipAddress)

	log.Printf("DEBUG: Login - Building response")

	// Build response
	return &v1.LoginResponse{
		Response: &common.Response{
			Success: true,
			Message: MsgLoginSuccess,
		},
		AccessToken:  tokenResponse.AccessToken,
		RefreshToken: tokenResponse.RefreshToken,
		SessionToken: sessionToken,
		User:         ConvertUserToProto(user),
	}, nil
}

// Register handles new user registration
// Xử lý đăng ký user mới với email verification
//
// Parameters:
//   - ctx: gRPC context
//   - req: Registration request với email, password, và thông tin cá nhân
//
// Returns:
//   - *v1.RegisterResponse: Response chứa user info
//   - error: Error nếu đăng ký thất bại
func (s *EnhancedUserServiceServer) Register(ctx context.Context, req *v1.RegisterRequest) (*v1.RegisterResponse, error) {
	// Validate input
	if req.Email == "" || req.Password == "" {
		return nil, status.Errorf(codes.InvalidArgument, ErrEmailRequired)
	}

	// Validate registration (check email not exists)
	if err := s.registrationHandler.ValidateRegistration(ctx, req.Email); err != nil {
		return nil, err
	}

	// Create user
	createdUser, err := s.registrationHandler.CreateUser(ctx, req)
	if err != nil {
		return nil, err
	}

	// Send verification email (non-blocking)
	_ = s.registrationHandler.SendVerificationEmail(ctx, createdUser)

	// Build response
	return &v1.RegisterResponse{
		Response: &common.Response{
			Success: true,
			Message: MsgRegistrationSuccess,
		},
		User: ConvertUserToProto(createdUser),
	}, nil
}

// GoogleLogin handles Google OAuth authentication
// Xử lý đăng nhập bằng Google OAuth
//
// Parameters:
//   - ctx: gRPC context
//   - req: Google login request với ID token
//
// Returns:
//   - *v1.LoginResponse: Response chứa tokens và user info
//   - error: Error nếu OAuth authentication thất bại
func (s *EnhancedUserServiceServer) GoogleLogin(ctx context.Context, req *v1.GoogleLoginRequest) (*v1.LoginResponse, error) {
	// Get client IP from metadata
	ipAddress := getClientIP(ctx)

	// Delegate to OAuth service
	response, err := s.oauthService.GoogleLogin(ctx, req.IdToken, ipAddress)
	if err != nil {
		return nil, err
	}

	return response, nil
}

// RefreshToken refreshes the access token with rotation for enhanced security
// Làm mới access token với refresh token rotation để tăng cường bảo mật
//
// Parameters:
//   - ctx: gRPC context
//   - req: Refresh token request
//
// Returns:
//   - *v1.RefreshTokenResponse: Response chứa access token và refresh token mới
//   - error: Error nếu refresh thất bại
func (s *EnhancedUserServiceServer) RefreshToken(ctx context.Context, req *v1.RefreshTokenRequest) (*v1.RefreshTokenResponse, error) {
	// Get client context for security tracking
	ipAddress := getClientIP(ctx)
	userAgent := getUserAgent(ctx)
	deviceFingerprint := generateDeviceFingerprint(userAgent)

	// Use enhanced JWT service with refresh token rotation
	tokenResponse, err := s.jwtService.RefreshTokenWithRotation(
		ctx,
		req.RefreshToken,
		ipAddress,
		userAgent,
		deviceFingerprint,
		s.userRepo,
	)
	if err != nil {
		// Convert error to appropriate gRPC status code
		if errors.Is(err, repository.ErrRefreshTokenNotFound) ||
			errors.Is(err, repository.ErrRefreshTokenExpired) ||
			errors.Is(err, repository.ErrRefreshTokenRevoked) {
			return nil, status.Errorf(codes.Unauthenticated, "invalid refresh token: %v", err)
		}
		if errors.Is(err, repository.ErrRefreshTokenReused) {
			return nil, status.Errorf(codes.PermissionDenied, "refresh token reuse detected - security breach")
		}
		return nil, status.Errorf(codes.Internal, "failed to refresh token: %v", err)
	}

	return &v1.RefreshTokenResponse{
		Response: &common.Response{
			Success: true,
			Message: MsgTokenRefreshSuccess,
		},
		AccessToken:  tokenResponse.AccessToken,
		RefreshToken: tokenResponse.RefreshToken,
	}, nil
}

// VerifyEmail verifies user email with token
// Xác thực email của user bằng verification token
//
// Parameters:
//   - ctx: gRPC context
//   - req: Verify email request với token
//
// Returns:
//   - *v1.VerifyEmailResponse: Response với success status
//   - error: Luôn trả về nil (errors được wrap trong response)
func (s *EnhancedUserServiceServer) VerifyEmail(ctx context.Context, req *v1.VerifyEmailRequest) (*v1.VerifyEmailResponse, error) {
	// Delegate to registration handler
	if err := s.registrationHandler.VerifyEmail(ctx, req.Token); err != nil {
		return &v1.VerifyEmailResponse{
			Response: &common.Response{
				Success: false,
				Message: ErrInvalidToken,
			},
		}, nil
	}

	return &v1.VerifyEmailResponse{
		Response: &common.Response{
			Success: true,
			Message: MsgEmailVerifiedSuccess,
		},
	}, nil
}

// ForgotPassword initiates password reset process
// Bắt đầu quá trình reset password bằng cách gửi email với reset token
//
// Parameters:
//   - ctx: gRPC context
//   - req: Forgot password request với email
//
// Returns:
//   - *v1.ForgotPasswordResponse: Response luôn success (không tiết lộ user existence)
//   - error: Luôn trả về nil
func (s *EnhancedUserServiceServer) ForgotPassword(ctx context.Context, req *v1.ForgotPasswordRequest) (*v1.ForgotPasswordResponse, error) {
	// Delegate to password reset handler (always returns nil for security)
	_ = s.passwordResetHandler.InitiatePasswordReset(ctx, req.Email)

	return &v1.ForgotPasswordResponse{
		Response: &common.Response{
			Success: true,
			Message: MsgPasswordResetEmailSent,
		},
	}, nil
}

// ResetPassword resets user password with token
// Reset password của user bằng reset token và password mới
//
// Parameters:
//   - ctx: gRPC context
//   - req: Reset password request với token và new password
//
// Returns:
//   - *v1.ResetPasswordResponse: Response với success status
//   - error: Luôn trả về nil (errors được wrap trong response)
func (s *EnhancedUserServiceServer) ResetPassword(ctx context.Context, req *v1.ResetPasswordRequest) (*v1.ResetPasswordResponse, error) {
	// Delegate to password reset handler
	if err := s.passwordResetHandler.ResetPassword(ctx, req.Token, req.NewPassword); err != nil {
		return &v1.ResetPasswordResponse{
			Response: &common.Response{
				Success: false,
				Message: err.Error(),
			},
		}, nil
	}

	return &v1.ResetPasswordResponse{
		Response: &common.Response{
			Success: true,
			Message: MsgPasswordResetSuccess,
		},
	}, nil
}

// GetCurrentUser gets the current authenticated user
// Lấy thông tin user hiện tại đang đăng nhập
//
// Parameters:
//   - ctx: gRPC context (chứa user ID từ JWT token)
//   - req: Get current user request
//
// Returns:
//   - *v1.GetUserResponse: Response chứa user info
//   - error: Error nếu user không authenticated hoặc không tìm thấy
func (s *EnhancedUserServiceServer) GetCurrentUser(ctx context.Context, req *v1.GetCurrentUserRequest) (*v1.GetUserResponse, error) {
	// Get user ID from context (injected by auth middleware)
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, ErrUserNotAuthenticated)
	}

	// Get user from repository
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, ErrUserNotFound)
	}

	return &v1.GetUserResponse{
		Response: &common.Response{
			Success: true,
			Message: MsgUserRetrievedSuccess,
		},
		User: ConvertUserToProto(user),
	}, nil
}

// UpdateUser updates user information
// Cập nhật thông tin user (chỉ cho phép update own profile hoặc admin update others)
//
// Parameters:
//   - ctx: gRPC context (chứa user ID từ JWT token)
//   - req: Update user request với các fields cần update
//
// Returns:
//   - *v1.UpdateUserResponse: Response chứa updated user info
//   - error: Error nếu không có quyền hoặc update thất bại
func (s *EnhancedUserServiceServer) UpdateUser(ctx context.Context, req *v1.UpdateUserRequest) (*v1.UpdateUserResponse, error) {
	// Get user ID from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, ErrUserNotAuthenticated)
	}

	// Check permission: own profile or admin
	if req.Id != userID {
		if err := s.checkAdminPermission(ctx, userID); err != nil {
			return nil, err
		}
	}

	// Get existing user
	user, err := s.userRepo.GetByID(ctx, req.Id)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, ErrUserNotFound)
	}

	// Update fields if provided
	s.updateUserFields(user, req)

	// Save changes
	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, status.Errorf(codes.Internal, ErrUserUpdateFailed, err)
	}

	return &v1.UpdateUserResponse{
		Response: &common.Response{
			Success: true,
			Message: MsgUserUpdatedSuccess,
		},
		User: ConvertUserToProto(user),
	}, nil
}

// checkAdminPermission checks if user has admin permission
// Kiểm tra xem user có quyền admin không
func (s *EnhancedUserServiceServer) checkAdminPermission(ctx context.Context, userID string) error {
	requestingUser, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return status.Errorf(codes.Internal, "failed to get requesting user")
	}

	if string(requestingUser.Role) != RoleAdmin {
		return status.Errorf(codes.PermissionDenied, ErrPermissionDenied)
	}

	return nil
}

// updateUserFields updates user fields from request
// Cập nhật các fields của user từ request (chỉ update fields không rỗng)
func (s *EnhancedUserServiceServer) updateUserFields(user *repository.User, req *v1.UpdateUserRequest) {
	if req.FirstName != "" {
		user.FirstName = req.FirstName
	}
	if req.LastName != "" {
		user.LastName = req.LastName
	}
	if req.Username != "" {
		user.Username = req.Username
	}
	if req.Avatar != "" {
		user.Avatar = req.Avatar
	}
	if req.Bio != "" {
		user.Bio = req.Bio
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}
	if req.Address != "" {
		user.Address = req.Address
	}
	if req.School != "" {
		user.School = req.School
	}
}

// SendVerificationEmail sends email verification token to user
// Gửi lại email xác thực cho user
//
// Parameters:
//   - ctx: gRPC context
//   - req: Send verification email request với user ID
//
// Returns:
//   - *v1.SendVerificationEmailResponse: Response với success status
//   - error: Luôn trả về nil (errors được wrap trong response)
func (s *EnhancedUserServiceServer) SendVerificationEmail(ctx context.Context, req *v1.SendVerificationEmailRequest) (*v1.SendVerificationEmailResponse, error) {
	// Delegate to registration handler
	if err := s.registrationHandler.ResendVerificationEmail(ctx, req.UserId); err != nil {
		return &v1.SendVerificationEmailResponse{
			Response: &common.Response{
				Success: false,
				Message: err.Error(),
			},
		}, nil
	}

	return &v1.SendVerificationEmailResponse{
		Response: &common.Response{
			Success: true,
			Message: MsgVerificationEmailSent,
		},
	}, nil
}
