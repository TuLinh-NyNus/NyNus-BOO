package grpc

import (
	"context"
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
	jwtService     *auth.JWTService
	userRepo       repository.IUserRepository
	emailService   *email.EmailService
}

// NewEnhancedUserServiceServer creates a new enhanced user service
func NewEnhancedUserServiceServer(
	oauthService *oauth.OAuthService,
	sessionService *session.SessionService,
	jwtService *auth.JWTService,
	userRepo repository.IUserRepository,
) *EnhancedUserServiceServer {
	return &EnhancedUserServiceServer{
		oauthService:   oauthService,
		sessionService: sessionService,
		jwtService:     jwtService,
		userRepo:       userRepo,
	}
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

// RefreshToken refreshes the access token
func (s *EnhancedUserServiceServer) RefreshToken(ctx context.Context, req *v1.RefreshTokenRequest) (*v1.RefreshTokenResponse, error) {
	// Validate refresh token
	userID, err := s.jwtService.ValidateRefreshToken(req.RefreshToken)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "invalid refresh token: %v", err)
	}

	// Get user
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "user not found")
	}

	// Check if user is active
	if user.Status != "ACTIVE" {
		return nil, status.Errorf(codes.PermissionDenied, "user account is %s", user.Status)
	}

	// Generate new tokens
	newAccessToken, err := s.jwtService.GenerateAccessToken(user.ID, user.Email, string(user.Role), user.Level)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to generate access token: %v", err)
	}

	newRefreshToken, err := s.jwtService.GenerateRefreshToken(user.ID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to generate refresh token: %v", err)
	}

	return &v1.RefreshTokenResponse{
		Response: &common.Response{
			Success: true,
			Message: "Token refreshed successfully",
		},
		AccessToken:  newAccessToken,
		RefreshToken: newRefreshToken,
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

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
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