package oauth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/auth"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/common"
	pb "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/v1"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// OAuthService handles OAuth authentication
type OAuthService struct {
	userRepo         repository.IUserRepository
	oauthAccountRepo repository.OAuthAccountRepository
	sessionRepo      repository.SessionRepository
	googleClient     *GoogleClient
	jwtService       JWTService
	sessionService   SessionService // Add session service for proper session management
}

// SessionService interface for session management
type SessionService interface {
	CreateSession(ctx context.Context, userID, sessionToken, ipAddress, userAgent, deviceFingerprint string) (*repository.Session, error)
	ValidateSession(ctx context.Context, sessionToken string) (*repository.Session, error)
	InvalidateAllUserSessions(ctx context.Context, userID string) error
}

// JWTService interface for JWT operations
type JWTService interface {
	GenerateAccessToken(userID string, role string) (string, error)
	GenerateRefreshToken(userID string) (string, error)
	ValidateRefreshToken(token string) (string, error)
}

// NewOAuthService creates a new OAuth service
func NewOAuthService(
	userRepo repository.IUserRepository,
	oauthAccountRepo repository.OAuthAccountRepository,
	sessionRepo repository.SessionRepository,
	jwtService JWTService,
	sessionService SessionService,
	googleClientID, googleClientSecret, redirectURI string,
) *OAuthService {
	return &OAuthService{
		userRepo:         userRepo,
		oauthAccountRepo: oauthAccountRepo,
		sessionRepo:      sessionRepo,
		jwtService:       jwtService,
		sessionService:   sessionService,
		googleClient:     NewGoogleClient(googleClientID, googleClientSecret, redirectURI),
	}
}

// GooglePayload represents the Google ID token payload
type GooglePayload struct {
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	Sub           string `json:"sub"` // Google user ID
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
}

// GoogleLogin handles Google OAuth authentication
func (s *OAuthService) GoogleLogin(ctx context.Context, idToken string, ipAddress string) (*pb.LoginResponse, error) {
	// Validate Google ID token
	payload, err := s.verifyGoogleIDToken(ctx, idToken)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "invalid Google ID token: %v", err)
	}

	// Check if user exists with this Google ID
	user, err := s.userRepo.GetByGoogleID(ctx, payload.Sub)
	if err != nil && !errors.Is(err, repository.ErrUserNotFound) {
		return nil, status.Errorf(codes.Internal, "failed to check user: %v", err)
	}

	// If user doesn't exist, check by email
	if user == nil {
		user, err = s.userRepo.GetByEmail(ctx, payload.Email)
		if err != nil && !errors.Is(err, repository.ErrUserNotFound) {
			return nil, status.Errorf(codes.Internal, "failed to check user by email: %v", err)
		}
	}

	// Create new user if doesn't exist
	if user == nil {
		user, err = s.createUserFromGoogle(ctx, payload)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to create user: %v", err)
		}
	} else {
		// Update Google ID if not set
		if user.GoogleID == "" {
			user.GoogleID = payload.Sub
			if err := s.userRepo.UpdateGoogleID(ctx, user.ID, payload.Sub); err != nil {
				return nil, status.Errorf(codes.Internal, "failed to update Google ID: %v", err)
			}
		}

		// Update avatar if changed
		if payload.Picture != "" && user.Avatar != payload.Picture {
			user.Avatar = payload.Picture
			if err := s.userRepo.UpdateAvatar(ctx, user.ID, payload.Picture); err != nil {
				// Log error but don't fail login
				fmt.Printf("Failed to update avatar: %v\n", err)
			}
		}
	}

	// Check if user is active
	if user.Status != "ACTIVE" {
		return nil, status.Errorf(codes.PermissionDenied, "user account is %s", user.Status)
	}

	// Create or update OAuth account record
	if err := s.upsertOAuthAccount(ctx, user.ID, payload); err != nil {
		// Log error but don't fail login
		fmt.Printf("Failed to upsert OAuth account: %v\n", err)
	}

	// Create session using SessionService (handles 24h sliding window and 3-device limit)
	var sessionToken string
	if s.sessionService != nil {
		// Generate session token
		sessionToken = s.generateSessionToken()

		// Get user agent from context if available
		userAgent := "Google OAuth Client"
		deviceFingerprint := fmt.Sprintf("google-oauth-%s", ipAddress)

		// Create session with 24h sliding window
		_, err = s.sessionService.CreateSession(ctx, user.ID, sessionToken, ipAddress, userAgent, deviceFingerprint)
		if err != nil {
			// Log error but don't fail login
			fmt.Printf("Failed to create session: %v\n", err)
			sessionToken = "" // Continue without session token
		}
	} else {
		// Fallback to direct session creation if SessionService not available
		// Check concurrent sessions
		activeSessions, err := s.sessionRepo.GetActiveSessions(ctx, user.ID)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to check sessions: %v", err)
		}

		// If exceeded max sessions, terminate oldest
		maxSessions := 3
		if user.MaxConcurrentSessions > 0 {
			maxSessions = user.MaxConcurrentSessions
		}

		if len(activeSessions) >= maxSessions {
			// Terminate oldest session
			oldestSession := activeSessions[0]
			for _, session := range activeSessions {
				if session.CreatedAt.Before(oldestSession.CreatedAt) {
					oldestSession = session
				}
			}
			if err := s.sessionRepo.TerminateSession(ctx, oldestSession.ID); err != nil {
				fmt.Printf("Failed to terminate old session: %v\n", err)
			}
		}

		// Create new session with 24h sliding window
		sessionToken = s.generateSessionToken()
		session := &repository.Session{
			UserID:       user.ID,
			SessionToken: sessionToken,
			IPAddress:    ipAddress,
			IsActive:     true,
			ExpiresAt:    time.Now().Add(24 * time.Hour), // 24 hours sliding window
		}

		if err := s.sessionRepo.CreateSession(ctx, session); err != nil {
			return nil, status.Errorf(codes.Internal, "failed to create session: %v", err)
		}
	}

	// Generate JWT tokens with full user details
	// Try to use the enhanced method if available
	var accessToken string
	if jwtAdapter, ok := s.jwtService.(*auth.JWTAdapter); ok {
		// Use enhanced method with email and level
		accessToken, err = jwtAdapter.GenerateAccessTokenWithDetails(user.ID, user.Email, string(user.Role), user.Level)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to generate access token: %v", err)
		}
	} else {
		// Fallback to basic method
		accessToken, err = s.jwtService.GenerateAccessToken(user.ID, string(user.Role))
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to generate access token: %v", err)
		}
	}

	refreshToken, err := s.jwtService.GenerateRefreshToken(user.ID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to generate refresh token: %v", err)
	}

	// Update last login
	if err := s.userRepo.UpdateLastLogin(ctx, user.ID, ipAddress); err != nil {
		// Log error but don't fail login
		fmt.Printf("Failed to update last login: %v\n", err)
	}

	// Convert to proto user
	protoUser := s.userToProto(user)

	return &pb.LoginResponse{
		Response: &common.Response{
			Success: true,
			Message: "Login successful",
		},
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		SessionToken: sessionToken, // Include session token for stateful session management
		User:         protoUser,
	}, nil
}

// verifyGoogleIDToken validates Google ID token
func (s *OAuthService) verifyGoogleIDToken(ctx context.Context, idToken string) (*GooglePayload, error) {
	// Sử dụng GoogleClient để verify ID token
	userInfo, err := s.googleClient.VerifyIDToken(ctx, idToken)
	if err != nil {
		return nil, fmt.Errorf("failed to validate ID token: %w", err)
	}

	// Convert GoogleUserInfo sang GooglePayload
	payload := &GooglePayload{
		Email:         userInfo.Email,
		EmailVerified: userInfo.EmailVerified,
		Name:          userInfo.Name,
		Picture:       userInfo.Picture,
		Sub:           userInfo.ID, // GoogleUserInfo.ID maps to GooglePayload.Sub
		GivenName:     userInfo.GivenName,
		FamilyName:    userInfo.FamilyName,
	}

	return payload, nil
}

// createUserFromGoogle creates a new user from Google profile
func (s *OAuthService) createUserFromGoogle(ctx context.Context, payload *GooglePayload) (*repository.User, error) {
	// Generate username from email
	username := payload.Email[:len(payload.Email)-len("@gmail.com")]

	// Check if username exists and make it unique
	existingUser, _ := s.userRepo.GetByUsername(ctx, username)
	if existingUser != nil {
		// Add random suffix
		username = fmt.Sprintf("%s_%d", username, time.Now().Unix()%1000)
	}

	user := &repository.User{
		Email:         payload.Email,
		GoogleID:      payload.Sub,
		Username:      username,
		FirstName:     payload.GivenName,
		LastName:      payload.FamilyName,
		Avatar:        payload.Picture,
		Role:          common.UserRole_USER_ROLE_STUDENT,
		Status:        "ACTIVE",
		EmailVerified: payload.EmailVerified,
		PasswordHash:  "", // No password for OAuth users
	}

	// Create user
	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

// upsertOAuthAccount creates or updates OAuth account record
func (s *OAuthService) upsertOAuthAccount(ctx context.Context, userID string, payload *GooglePayload) error {
	account := &repository.OAuthAccount{
		UserID:            userID,
		Provider:          "google",
		ProviderAccountID: payload.Sub,
		Type:              "oauth",
	}

	return s.oauthAccountRepo.Upsert(ctx, account)
}

// generateSessionToken generates a secure random session token
func (s *OAuthService) generateSessionToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return base64.URLEncoding.EncodeToString(b)
}

// userToProto converts repository user to proto user
func (s *OAuthService) userToProto(user *repository.User) *pb.User {
	return &pb.User{
		Id:            user.ID,
		Email:         user.Email,
		FirstName:     user.FirstName,
		LastName:      user.LastName,
		Role:          user.Role,
		IsActive:      user.IsActive,
		Level:         int32(user.Level),
		Username:      user.Username,
		Avatar:        user.Avatar,
		Status:        s.userStatusToProto(user.Status),
		EmailVerified: user.EmailVerified,
		GoogleId:      user.GoogleID,
	}
}

// userStatusToProto converts string status to proto enum
func (s *OAuthService) userStatusToProto(status string) common.UserStatus {
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

// RefreshToken refreshes the access token using refresh token
func (s *OAuthService) RefreshToken(ctx context.Context, refreshToken string) (*pb.RefreshTokenResponse, error) {
	// Validate refresh token
	userID, err := s.jwtService.ValidateRefreshToken(refreshToken)
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
	newAccessToken, err := s.jwtService.GenerateAccessToken(user.ID, string(user.Role))
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to generate access token: %v", err)
	}

	newRefreshToken, err := s.jwtService.GenerateRefreshToken(user.ID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to generate refresh token: %v", err)
	}

	return &pb.RefreshTokenResponse{
		Response: &common.Response{
			Success: true,
			Message: "Token refreshed successfully",
		},
		AccessToken:  newAccessToken,
		RefreshToken: newRefreshToken,
	}, nil
}
