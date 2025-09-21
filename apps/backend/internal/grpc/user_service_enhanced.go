package grpc

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"log"
	"strings"

	"golang.org/x/crypto/bcrypt"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/middleware"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/auth"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/oauth"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/session"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/services/email"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/common"
	v1 "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/v1"
)

// EnhancedUserServiceServer implements the enhanced UserService with OAuth
type EnhancedUserServiceServer struct {
	v1.UnimplementedUserServiceServer
	oauthService   *oauth.OAuthService
	sessionService *session.SessionService
	jwtService     *auth.EnhancedJWTService // Enhanced JWT service with refresh token rotation
	userRepo       repository.IUserRepository
	emailService   *email.EmailService
	bcryptCost     int // Configurable bcrypt cost for password hashing
}

// NewEnhancedUserServiceServer creates a new enhanced user service
func NewEnhancedUserServiceServer(
	oauthService *oauth.OAuthService,
	sessionService *session.SessionService,
	jwtService *auth.EnhancedJWTService, // Enhanced JWT service parameter
	userRepo repository.IUserRepository,
	emailService *email.EmailService,
	bcryptCost int,
) *EnhancedUserServiceServer {
	if bcryptCost < 10 {
		bcryptCost = 12 // Default to secure cost
	}
	return &EnhancedUserServiceServer{
		oauthService:   oauthService,
		sessionService: sessionService,
		jwtService:     jwtService,
		userRepo:       userRepo,
		emailService:   emailService,
		bcryptCost:     bcryptCost,
	}
}

// Login handles traditional email/password authentication
func (s *EnhancedUserServiceServer) Login(ctx context.Context, req *v1.LoginRequest) (*v1.LoginResponse, error) {
	// Validate input
	if req.Email == "" || req.Password == "" {
		return nil, status.Errorf(codes.InvalidArgument, "email and password are required")
	}

	// Get user by email
	user, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "invalid email or password")
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "invalid email or password")
	}

	// Check if user is active
	if user.Status != "ACTIVE" {
		return nil, status.Errorf(codes.PermissionDenied, "user account is %s", user.Status)
	}

	// Get client context for token generation
	ipAddress := getClientIP(ctx)
	userAgent := getUserAgent(ctx)
	deviceFingerprint := generateDeviceFingerprint(userAgent)

	// Generate both access and refresh tokens with server-side storage
	tokenResponse, err := s.jwtService.GenerateRefreshTokenPair(ctx, user.ID, user.Email, string(user.Role), user.Level, ipAddress, userAgent, deviceFingerprint)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to generate tokens: %v", err)
	}

	// Generate session token for session management
	sessionTokenBytes := make([]byte, 32)
	if _, err := rand.Read(sessionTokenBytes); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to generate session token")
	}
	sessionToken := base64.URLEncoding.EncodeToString(sessionTokenBytes)

	// Create session using session service
	_, err = s.sessionService.CreateSession(ctx, user.ID, sessionToken, ipAddress, userAgent, deviceFingerprint)
	if err != nil {
		log.Printf("Failed to create session for user %s: %v", user.ID, err)
		// Don't fail login if session creation fails, just continue without session
		sessionToken = ""
	}

	// Update last login
	if err := s.userRepo.UpdateLastLogin(ctx, user.ID, ipAddress); err != nil {
		log.Printf("Failed to update last login for user %s: %v", user.ID, err)
	}

	// Convert to proto
	protoUser := &v1.User{
		Id:            user.ID,
		Email:         user.Email,
		FirstName:     user.FirstName,
		LastName:      user.LastName,
		Role:          user.Role,
		IsActive:      user.IsActive,
		Level:         int32(user.Level),
		Username:      user.Username,
		Avatar:        user.Avatar,
		Status:        convertStatusToProto(user.Status),
		EmailVerified: user.EmailVerified,
		GoogleId:      user.GoogleID,
	}

	return &v1.LoginResponse{
		Response: &common.Response{
			Success: true,
			Message: "Login successful",
		},
		AccessToken:  tokenResponse.AccessToken,
		RefreshToken: tokenResponse.RefreshToken,
		SessionToken: sessionToken,
		User:         protoUser,
	}, nil
}

// Register handles new user registration
func (s *EnhancedUserServiceServer) Register(ctx context.Context, req *v1.RegisterRequest) (*v1.RegisterResponse, error) {
	// Validate input
	if req.Email == "" || req.Password == "" {
		return nil, status.Errorf(codes.InvalidArgument, "email and password are required")
	}

	// Check if user already exists
	existing, _ := s.userRepo.GetByEmail(ctx, req.Email)
	if existing != nil {
		return nil, status.Errorf(codes.AlreadyExists, "email already registered")
	}

	// Hash password with configurable cost for better security
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), s.bcryptCost)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to hash password: %v", err)
	}

	// Create new user
	newUser := &repository.User{
		Email:                 req.Email,
		PasswordHash:          string(hashedPassword),
		FirstName:             req.FirstName,
		LastName:              req.LastName,
		Role:                  common.UserRole_USER_ROLE_STUDENT, // Default role
		Status:                "INACTIVE",                        // Need email verification
		Level:                 1,                                 // Start at level 1 for STUDENT
		EmailVerified:         false,
		MaxConcurrentSessions: 3, // Default 3 devices
	}

	// Create user in database
	err = s.userRepo.Create(ctx, newUser)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create user: %v", err)
	}

	// Get the created user to have all fields populated
	createdUser, err := s.userRepo.GetByEmail(ctx, newUser.Email)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get created user: %v", err)
	}

	// Send verification email
	if s.emailService != nil && s.sessionService != nil {
		token, err := s.sessionService.GenerateEmailVerificationToken(ctx, createdUser.ID)
		if err == nil {
			userName := createdUser.FirstName + " " + createdUser.LastName
			if err := s.emailService.SendVerificationEmail(createdUser.Email, userName, token); err != nil {
				log.Printf("Failed to send verification email to %s: %v", createdUser.Email, err)
			}
		}
	}

	// Convert to proto
	protoUser := &v1.User{
		Id:            createdUser.ID,
		Email:         createdUser.Email,
		FirstName:     createdUser.FirstName,
		LastName:      createdUser.LastName,
		Role:          createdUser.Role,
		IsActive:      createdUser.IsActive,
		Level:         int32(createdUser.Level),
		Username:      createdUser.Username,
		Avatar:        createdUser.Avatar,
		Status:        convertStatusToProto(createdUser.Status),
		EmailVerified: createdUser.EmailVerified,
	}

	return &v1.RegisterResponse{
		Response: &common.Response{
			Success: true,
			Message: "Registration successful. Please check your email for verification.",
		},
		User: protoUser,
	}, nil
}

// GoogleLogin handles Google OAuth authentication
func (s *EnhancedUserServiceServer) GoogleLogin(ctx context.Context, req *v1.GoogleLoginRequest) (*v1.LoginResponse, error) {
	// Get client IP from metadata
	ipAddress := getClientIP(ctx)

	// Call OAuth service
	response, err := s.oauthService.GoogleLogin(ctx, req.IdToken, ipAddress)
	if err != nil {
		return nil, err
	}

	return response, nil
}

// RefreshToken refreshes the access token with rotation for enhanced security
func (s *EnhancedUserServiceServer) RefreshToken(ctx context.Context, req *v1.RefreshTokenRequest) (*v1.RefreshTokenResponse, error) {
	// Get client IP and user agent from context for security tracking
	ipAddress := getClientIP(ctx)
	userAgent := getUserAgent(ctx)
	deviceFingerprint := generateDeviceFingerprint(userAgent)

	// Use enhanced JWT service with refresh token rotation
	tokenResponse, err := s.jwtService.RefreshTokenWithRotation(ctx, req.RefreshToken, ipAddress, userAgent, deviceFingerprint, s.userRepo)
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
			Message: "Token refreshed successfully",
		},
		AccessToken:  tokenResponse.AccessToken,
		RefreshToken: tokenResponse.RefreshToken,
	}, nil
}

// VerifyEmail verifies user email
func (s *EnhancedUserServiceServer) VerifyEmail(ctx context.Context, req *v1.VerifyEmailRequest) (*v1.VerifyEmailResponse, error) {
	// Verify token and get user ID
	userID, err := s.sessionService.VerifyEmailToken(ctx, req.Token)
	if err != nil {
		return &v1.VerifyEmailResponse{
			Response: &common.Response{
				Success: false,
				Message: "Invalid or expired verification token",
			},
		}, nil
	}

	// Update user's email_verified status
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return &v1.VerifyEmailResponse{
			Response: &common.Response{
				Success: false,
				Message: "User not found",
			},
		}, nil
	}

	user.EmailVerified = true
	if user.Status == "INACTIVE" {
		user.Status = "ACTIVE"
	}

	if err := s.userRepo.Update(ctx, user); err != nil {
		return &v1.VerifyEmailResponse{
			Response: &common.Response{
				Success: false,
				Message: "Failed to update user status",
			},
		}, nil
	}

	return &v1.VerifyEmailResponse{
		Response: &common.Response{
			Success: true,
			Message: "Email verified successfully",
		},
	}, nil
}

// ForgotPassword initiates password reset
func (s *EnhancedUserServiceServer) ForgotPassword(ctx context.Context, req *v1.ForgotPasswordRequest) (*v1.ForgotPasswordResponse, error) {
	// Check if user exists
	user, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		// Don't reveal if email exists or not
		return &v1.ForgotPasswordResponse{
			Response: &common.Response{
				Success: true,
				Message: "If the email exists, a reset link has been sent",
			},
		}, nil
	}

	// Generate reset token (valid for 1 hour)
	resetToken, err := s.sessionService.GeneratePasswordResetToken(ctx, user.ID)
	if err != nil {
		log.Printf("Failed to generate reset token for user %s: %v", user.Email, err)
		// Still return success to not reveal user existence
		return &v1.ForgotPasswordResponse{
			Response: &common.Response{
				Success: true,
				Message: "If the email exists, a reset link has been sent",
			},
		}, nil
	}

	// Send reset email
	if s.emailService != nil {
		if err := s.emailService.SendPasswordResetEmail(user.Email, user.FirstName+" "+user.LastName, resetToken); err != nil {
			log.Printf("Failed to send reset email to %s: %v", user.Email, err)
		}
	}

	return &v1.ForgotPasswordResponse{
		Response: &common.Response{
			Success: true,
			Message: "If the email exists, a reset link has been sent",
		},
	}, nil
}

// ResetPassword resets user password with token
func (s *EnhancedUserServiceServer) ResetPassword(ctx context.Context, req *v1.ResetPasswordRequest) (*v1.ResetPasswordResponse, error) {
	// Verify reset token and get user ID
	userID, err := s.sessionService.VerifyPasswordResetToken(ctx, req.Token)
	if err != nil {
		return &v1.ResetPasswordResponse{
			Response: &common.Response{
				Success: false,
				Message: "Invalid or expired reset token",
			},
		}, nil
	}

	// Get user
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return &v1.ResetPasswordResponse{
			Response: &common.Response{
				Success: false,
				Message: "User not found",
			},
		}, nil
	}

	// Hash new password with configurable cost
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), s.bcryptCost)
	if err != nil {
		return &v1.ResetPasswordResponse{
			Response: &common.Response{
				Success: false,
				Message: "Failed to hash password",
			},
		}, nil
	}

	// Update password
	user.PasswordHash = string(hashedPassword)
	if err := s.userRepo.Update(ctx, user); err != nil {
		return &v1.ResetPasswordResponse{
			Response: &common.Response{
				Success: false,
				Message: "Failed to update password",
			},
		}, nil
	}

	// Invalidate all existing sessions for security
	if err := s.sessionService.InvalidateAllUserSessions(ctx, userID); err != nil {
		log.Printf("Failed to invalidate sessions for user %s: %v", userID, err)
	}

	return &v1.ResetPasswordResponse{
		Response: &common.Response{
			Success: true,
			Message: "Password reset successfully",
		},
	}, nil
}

// GetCurrentUser gets the current authenticated user
func (s *EnhancedUserServiceServer) GetCurrentUser(ctx context.Context, req *v1.GetCurrentUserRequest) (*v1.GetUserResponse, error) {
	// Get user ID from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "user not authenticated")
	}

	// Get user from repository
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "user not found")
	}

	// Convert to proto
	protoUser := &v1.User{
		Id:            user.ID,
		Email:         user.Email,
		FirstName:     user.FirstName,
		LastName:      user.LastName,
		Role:          user.Role,
		IsActive:      user.IsActive,
		Level:         int32(user.Level),
		Username:      user.Username,
		Avatar:        user.Avatar,
		Status:        convertStatusToProto(user.Status),
		EmailVerified: user.EmailVerified,
		GoogleId:      user.GoogleID,
	}

	return &v1.GetUserResponse{
		Response: &common.Response{
			Success: true,
			Message: "User retrieved successfully",
		},
		User: protoUser,
	}, nil
}

// UpdateUser updates user information
func (s *EnhancedUserServiceServer) UpdateUser(ctx context.Context, req *v1.UpdateUserRequest) (*v1.UpdateUserResponse, error) {
	// Get user ID from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "user not authenticated")
	}

	// Check if updating own profile or has admin permission
	if req.Id != userID {
		// Check if user is admin
		requestingUser, err := s.userRepo.GetByID(ctx, userID)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to get requesting user")
		}

		if string(requestingUser.Role) != "ADMIN" {
			return nil, status.Errorf(codes.PermissionDenied, "only admin can update other users")
		}
	}

	// Get existing user
	user, err := s.userRepo.GetByID(ctx, req.Id)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "user not found")
	}

	// Update fields if provided
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

	// Update user in repository
	err = s.userRepo.Update(ctx, user)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to update user: %v", err)
	}

	return &v1.UpdateUserResponse{
		Response: &common.Response{
			Success: true,
			Message: "User updated successfully",
		},
		User: &v1.User{
			Id:            user.ID,
			Email:         user.Email,
			FirstName:     user.FirstName,
			LastName:      user.LastName,
			Role:          user.Role,
			IsActive:      user.IsActive,
			Level:         int32(user.Level),
			Username:      user.Username,
			Avatar:        user.Avatar,
			Status:        convertStatusToProto(user.Status),
			EmailVerified: user.EmailVerified,
			GoogleId:      user.GoogleID,
		},
	}, nil
}

// convertStatusToProto converts string status to proto enum
func convertStatusToProto(status string) common.UserStatus {
	switch status {
	case "ACTIVE":
		return common.UserStatus_USER_STATUS_ACTIVE
	case "INACTIVE":
		return common.UserStatus_USER_STATUS_INACTIVE
	case "SUSPENDED":
		return common.UserStatus_USER_STATUS_SUSPENDED
	default:
		return common.UserStatus_USER_STATUS_UNSPECIFIED
	}
}

// convertEnhancedRoleToProto converts string role to proto enum with 5 roles
func convertEnhancedRoleToProto(role string) common.UserRole {
	switch strings.ToUpper(role) {
	case "ADMIN":
		return common.UserRole_USER_ROLE_ADMIN
	case "TEACHER":
		return common.UserRole_USER_ROLE_TEACHER
	case "TUTOR":
		return common.UserRole_USER_ROLE_TUTOR
	case "STUDENT":
		return common.UserRole_USER_ROLE_STUDENT
	case "GUEST":
		return common.UserRole_USER_ROLE_GUEST
	default:
		return common.UserRole_USER_ROLE_UNSPECIFIED
	}
}

// SendVerificationEmail sends email verification token to user
func (s *EnhancedUserServiceServer) SendVerificationEmail(ctx context.Context, req *v1.SendVerificationEmailRequest) (*v1.SendVerificationEmailResponse, error) {
	// Get user by ID
	user, err := s.userRepo.GetByID(ctx, req.UserId)
	if err != nil {
		return &v1.SendVerificationEmailResponse{
			Response: &common.Response{
				Success: false,
				Message: "User not found",
			},
		}, nil
	}

	// Check if already verified
	if user.EmailVerified {
		return &v1.SendVerificationEmailResponse{
			Response: &common.Response{
				Success: false,
				Message: "Email already verified",
			},
		}, nil
	}

	// Generate verification token
	token, err := s.sessionService.GenerateEmailVerificationToken(ctx, user.ID)
	if err != nil {
		log.Printf("Failed to generate verification token for user %s: %v", user.Email, err)
		return &v1.SendVerificationEmailResponse{
			Response: &common.Response{
				Success: false,
				Message: "Failed to generate verification token",
			},
		}, nil
	}

	// Send email
	if s.emailService != nil {
		userName := user.FirstName + " " + user.LastName
		if err := s.emailService.SendVerificationEmail(user.Email, userName, token); err != nil {
			log.Printf("Failed to send verification email to %s: %v", user.Email, err)
			return &v1.SendVerificationEmailResponse{
				Response: &common.Response{
					Success: false,
					Message: "Failed to send verification email",
				},
			}, nil
		}
	}

	return &v1.SendVerificationEmailResponse{
		Response: &common.Response{
			Success: true,
			Message: "Verification email sent successfully",
		},
	}, nil
}

// getClientIP extracts client IP from context metadata
func getClientIP(ctx context.Context) string {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return ""
	}

	// Check common headers
	headers := []string{"x-real-ip", "x-forwarded-for", "x-client-ip"}
	for _, header := range headers {
		if values := md.Get(header); len(values) > 0 {
			// For x-forwarded-for, take the first IP
			ip := strings.Split(values[0], ",")[0]
			return strings.TrimSpace(ip)
		}
	}

	// Check grpc peer address
	if values := md.Get(":authority"); len(values) > 0 {
		// Extract IP from authority
		parts := strings.Split(values[0], ":")
		if len(parts) > 0 {
			return parts[0]
		}
	}

	return "unknown"
}

// getUserAgent extracts user agent from context metadata
func getUserAgent(ctx context.Context) string {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return ""
	}

	// Check user-agent header
	if values := md.Get("user-agent"); len(values) > 0 {
		return values[0]
	}

	return "unknown"
}

// generateDeviceFingerprint creates a simple fingerprint from user agent
func generateDeviceFingerprint(userAgent string) string {
	// Simple fingerprint based on user agent
	// In production, you might want to use more sophisticated fingerprinting
	if userAgent == "" || userAgent == "unknown" {
		return ""
	}

	// Extract browser and OS info from user agent
	// This is a simplified version
	return userAgent // For now, just use the user agent as fingerprint
}
