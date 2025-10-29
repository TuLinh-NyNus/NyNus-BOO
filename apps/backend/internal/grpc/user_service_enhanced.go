package grpc

import (
	"context"
	"errors"
	"log"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"exam-bank-system/apps/backend/internal/middleware"
	"exam-bank-system/apps/backend/internal/repository"
	"exam-bank-system/apps/backend/internal/service/auth"
	"exam-bank-system/apps/backend/internal/service/user/oauth"
	"exam-bank-system/apps/backend/internal/service/user/session"
	"exam-bank-system/apps/backend/internal/services/email"
	"exam-bank-system/apps/backend/pkg/proto/common"
	v1 "exam-bank-system/apps/backend/pkg/proto/v1"
)

// EnhancedUserServiceServer implements the enhanced UserService with OAuth vÃ  IJWTService interface
// Service chÃ­nh xá»­ lÃ½ cÃ¡c gRPC requests liÃªn quan Ä‘áº¿n user authentication vÃ  management
//
// Business Logic:
// - Traditional email/password authentication (Login)
// - User registration vá»›i email verification
// - Google OAuth authentication
// - Token refresh vá»›i rotation
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

// NewEnhancedUserServiceServer creates a new enhanced user service vá»›i IJWTService interface
// Táº¡o instance má»›i cá»§a EnhancedUserServiceServer vá»›i Ä‘áº§y Ä‘á»§ dependencies vÃ  handlers
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

	// Initialize handlers vá»›i IJWTService interface
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
// Xá»­ lÃ½ Ä‘Äƒng nháº­p báº±ng email vÃ  password vá»›i cÃ¡c tÃ­nh nÄƒng báº£o máº­t nÃ¢ng cao
//
// Parameters:
//   - ctx: gRPC context
//   - req: Login request vá»›i email vÃ  password
//
// Returns:
//   - *v1.LoginResponse: Response chá»©a tokens vÃ  user info
//   - error: Error náº¿u Ä‘Äƒng nháº­p tháº¥t báº¡i
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
// Xá»­ lÃ½ Ä‘Äƒng kÃ½ user má»›i vá»›i email verification
//
// Parameters:
//   - ctx: gRPC context
//   - req: Registration request vá»›i email, password, vÃ  thÃ´ng tin cÃ¡ nhÃ¢n
//
// Returns:
//   - *v1.RegisterResponse: Response chá»©a user info
//   - error: Error náº¿u Ä‘Äƒng kÃ½ tháº¥t báº¡i
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
// Xá»­ lÃ½ Ä‘Äƒng nháº­p báº±ng Google OAuth
//
// Parameters:
//   - ctx: gRPC context
//   - req: Google login request vá»›i ID token
//
// Returns:
//   - *v1.LoginResponse: Response chá»©a tokens vÃ  user info
//   - error: Error náº¿u OAuth authentication tháº¥t báº¡i
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
// LÃ m má»›i access token vá»›i refresh token rotation Ä‘á»ƒ tÄƒng cÆ°á»ng báº£o máº­t
//
// Parameters:
//   - ctx: gRPC context
//   - req: Refresh token request
//
// Returns:
//   - *v1.RefreshTokenResponse: Response chá»©a access token vÃ  refresh token má»›i
//   - error: Error náº¿u refresh tháº¥t báº¡i
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
// XÃ¡c thá»±c email cá»§a user báº±ng verification token
//
// Parameters:
//   - ctx: gRPC context
//   - req: Verify email request vá»›i token
//
// Returns:
//   - *v1.VerifyEmailResponse: Response vá»›i success status
//   - error: LuÃ´n tráº£ vá» nil (errors Ä‘Æ°á»£c wrap trong response)
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
// Báº¯t Ä‘áº§u quÃ¡ trÃ¬nh reset password báº±ng cÃ¡ch gá»­i email vá»›i reset token
//
// Parameters:
//   - ctx: gRPC context
//   - req: Forgot password request vá»›i email
//
// Returns:
//   - *v1.ForgotPasswordResponse: Response luÃ´n success (khÃ´ng tiáº¿t lá»™ user existence)
//   - error: LuÃ´n tráº£ vá» nil
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
// Reset password cá»§a user báº±ng reset token vÃ  password má»›i
//
// Parameters:
//   - ctx: gRPC context
//   - req: Reset password request vá»›i token vÃ  new password
//
// Returns:
//   - *v1.ResetPasswordResponse: Response vá»›i success status
//   - error: LuÃ´n tráº£ vá» nil (errors Ä‘Æ°á»£c wrap trong response)
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
// Láº¥y thÃ´ng tin user hiá»‡n táº¡i Ä‘ang Ä‘Äƒng nháº­p
//
// Parameters:
//   - ctx: gRPC context (chá»©a user ID tá»« JWT token)
//   - req: Get current user request
//
// Returns:
//   - *v1.GetUserResponse: Response chá»©a user info
//   - error: Error náº¿u user khÃ´ng authenticated hoáº·c khÃ´ng tÃ¬m tháº¥y
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
// Cáº­p nháº­t thÃ´ng tin user (chá»‰ cho phÃ©p update own profile hoáº·c admin update others)
//
// Parameters:
//   - ctx: gRPC context (chá»©a user ID tá»« JWT token)
//   - req: Update user request vá»›i cÃ¡c fields cáº§n update
//
// Returns:
//   - *v1.UpdateUserResponse: Response chá»©a updated user info
//   - error: Error náº¿u khÃ´ng cÃ³ quyá»n hoáº·c update tháº¥t báº¡i
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
// Kiá»ƒm tra xem user cÃ³ quyá»n admin khÃ´ng
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
// Cáº­p nháº­t cÃ¡c fields cá»§a user tá»« request (chá»‰ update fields khÃ´ng rá»—ng)
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
// Gá»­i láº¡i email xÃ¡c thá»±c cho user
//
// Parameters:
//   - ctx: gRPC context
//   - req: Send verification email request vá»›i user ID
//
// Returns:
//   - *v1.SendVerificationEmailResponse: Response vá»›i success status
//   - error: LuÃ´n tráº£ vá» nil (errors Ä‘Æ°á»£c wrap trong response)
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
