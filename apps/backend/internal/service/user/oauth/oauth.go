package oauth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/repository"
	"exam-bank-system/apps/backend/internal/service/auth"
	"exam-bank-system/apps/backend/pkg/proto/common"
	pb "exam-bank-system/apps/backend/pkg/proto/v1"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// OAuthService handles OAuth authentication vá»›i structured logging vÃ  validation
//
// Business Logic:
// - Xá»­ lÃ½ Google OAuth authentication flow
// - Táº¡o hoáº·c update user tá»« Google account
// - Generate JWT tokens vÃ  session tokens
// - Quáº£n lÃ½ concurrent sessions (max 3 devices)
// - Track login attempts vÃ  security events
type OAuthService struct {
	userRepo         repository.IUserRepository
	oauthAccountRepo repository.OAuthAccountRepository
	sessionRepo      repository.SessionRepository
	googleClient     *GoogleClient
	jwtService       auth.IJWTService // REFACTORED: Use IJWTService interface
	sessionService   SessionService   // Session management vá»›i 24h sliding window
	logger           *logrus.Logger   // Structured logging
}

// SessionService interface for session management
//
// Business Logic:
// - CreateSession: Táº¡o session má»›i vá»›i 24h sliding window
// - ValidateSession: Validate session token vÃ  extend expiry
// - InvalidateAllUserSessions: Revoke táº¥t cáº£ sessions cá»§a user (logout all devices)
type SessionService interface {
	CreateSession(ctx context.Context, userID, sessionToken, ipAddress, userAgent, deviceFingerprint string) (*repository.Session, error)
	ValidateSession(ctx context.Context, sessionToken string) (*repository.Session, error)
	InvalidateAllUserSessions(ctx context.Context, userID string) error
}

// NewOAuthService creates a new OAuth service vá»›i dependency injection
//
// Parameters:
//   - userRepo: User repository cho database operations
//   - oauthAccountRepo: OAuth account repository
//   - sessionRepo: Session repository
//   - jwtService: IJWTService implementation (UnifiedJWTService)
//   - sessionService: Session service cho session management
//   - googleClientID: Google OAuth client ID
//   - googleClientSecret: Google OAuth client secret
//   - redirectURI: OAuth redirect URI
//
// Returns:
//   - *OAuthService: Configured OAuth service instance
func NewOAuthService(
	userRepo repository.IUserRepository,
	oauthAccountRepo repository.OAuthAccountRepository,
	sessionRepo repository.SessionRepository,
	jwtService auth.IJWTService,
	sessionService SessionService,
	googleClientID, googleClientSecret, redirectURI string,
	logger *logrus.Logger,
) *OAuthService {
	// Create default logger if not provided
	if logger == nil {
		logger = logrus.New()
		logger.SetLevel(logrus.InfoLevel)
		logger.SetFormatter(&logrus.JSONFormatter{
			TimestampFormat: time.RFC3339,
		})
	}

	return &OAuthService{
		userRepo:         userRepo,
		oauthAccountRepo: oauthAccountRepo,
		sessionRepo:      sessionRepo,
		jwtService:       jwtService,
		sessionService:   sessionService,
		googleClient:     NewGoogleClient(googleClientID, googleClientSecret, redirectURI, logger),
		logger:           logger,
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

// GoogleLogin handles Google OAuth authentication vá»›i validation vÃ  logging
//
// Business Logic:
// - Validate Google ID token
// - Táº¡o user má»›i náº¿u chÆ°a tá»“n táº¡i
// - Update Google ID vÃ  avatar náº¿u cáº§n
// - Generate JWT tokens vÃ  session tokens
// - Track login activity
//
// Parameters:
//   - ctx: Context vá»›i timeout vÃ  cancellation
//   - idToken: Google ID token tá»« frontend
//   - ipAddress: IP address cá»§a user (for security tracking)
//
// Returns:
//   - *pb.LoginResponse: Response vá»›i access_token, refresh_token, session_token, user info
//   - error: gRPC error vá»›i appropriate code
func (s *OAuthService) GoogleLogin(ctx context.Context, idToken string, ipAddress string) (*pb.LoginResponse, error) {
	// Validate input parameters
	if idToken == "" {
		s.logger.Error("Empty ID token provided")
		return nil, status.Errorf(codes.InvalidArgument, "ID token cannot be empty")
	}
	if ipAddress == "" {
		s.logger.Warn("Empty IP address provided, using default")
		ipAddress = "unknown"
	}

	s.logger.WithFields(logrus.Fields{
		"operation":  "GoogleLogin",
		"ip_address": ipAddress,
	}).Info("Google OAuth login attempt")

	// Validate Google ID token
	payload, err := s.verifyGoogleIDToken(ctx, idToken)
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "GoogleLogin",
			"error":     err.Error(),
		}).Error("Invalid Google ID token")
		return nil, status.Errorf(codes.Unauthenticated, "invalid Google ID token: %v", err)
	}

	s.logger.WithFields(logrus.Fields{
		"operation": "GoogleLogin",
		"email":     payload.Email,
		"google_id": payload.Sub,
	}).Debug("Google ID token validated successfully")

	// Check if user exists with this Google ID
	user, err := s.userRepo.GetByGoogleID(ctx, payload.Sub)
	if err != nil && !errors.Is(err, repository.ErrUserNotFound) {
		s.logger.WithFields(logrus.Fields{
			"operation": "GoogleLogin",
			"google_id": payload.Sub,
			"error":     err.Error(),
		}).Error("Failed to check user by Google ID")
		return nil, status.Errorf(codes.Internal, "failed to check user: %v", err)
	}

	// If user doesn't exist, check by email
	if user == nil {
		user, err = s.userRepo.GetByEmail(ctx, payload.Email)
		if err != nil && !errors.Is(err, repository.ErrUserNotFound) {
			s.logger.WithFields(logrus.Fields{
				"operation": "GoogleLogin",
				"email":     payload.Email,
				"error":     err.Error(),
			}).Error("Failed to check user by email")
			return nil, status.Errorf(codes.Internal, "failed to check user by email: %v", err)
		}
	}

	// Create new user if doesn't exist
	if user == nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "GoogleLogin",
			"email":     payload.Email,
		}).Info("Creating new user from Google account")

		user, err = s.createUserFromGoogle(ctx, payload)
		if err != nil {
			s.logger.WithFields(logrus.Fields{
				"operation": "GoogleLogin",
				"email":     payload.Email,
				"error":     err.Error(),
			}).Error("Failed to create user from Google")
			return nil, status.Errorf(codes.Internal, "failed to create user: %v", err)
		}
	} else {
		// Update Google ID if not set
		if user.GoogleID == "" {
			user.GoogleID = payload.Sub
			if err := s.userRepo.UpdateGoogleID(ctx, user.ID, payload.Sub); err != nil {
				s.logger.WithFields(logrus.Fields{
					"operation": "GoogleLogin",
					"user_id":   user.ID,
					"google_id": payload.Sub,
					"error":     err.Error(),
				}).Error("Failed to update Google ID")
				return nil, status.Errorf(codes.Internal, "failed to update Google ID: %v", err)
			}
		}

		// Update avatar if changed
		if payload.Picture != "" && user.Avatar != payload.Picture {
			user.Avatar = payload.Picture
			if err := s.userRepo.UpdateAvatar(ctx, user.ID, payload.Picture); err != nil {
				// Log error but don't fail login
				s.logger.WithFields(logrus.Fields{
					"operation": "GoogleLogin",
					"user_id":   user.ID,
					"error":     err.Error(),
				}).Warn("Failed to update avatar")
			}
		}
	}

	// Check if user is active
	if user.Status != "ACTIVE" {
		s.logger.WithFields(logrus.Fields{
			"operation": "GoogleLogin",
			"user_id":   user.ID,
			"status":    user.Status,
		}).Warn("User account is not active")
		return nil, status.Errorf(codes.PermissionDenied, "user account is %s", user.Status)
	}

	// Create or update OAuth account record
	if err := s.upsertOAuthAccount(ctx, user.ID, payload); err != nil {
		// Log error but don't fail login
		s.logger.WithFields(logrus.Fields{
			"operation": "GoogleLogin",
			"user_id":   user.ID,
			"error":     err.Error(),
		}).Warn("Failed to upsert OAuth account")
	}

	// Create session using SessionService (handles 24h sliding window and 3-device limit)
	var sessionToken string
	if s.sessionService != nil {
		// Generate session token
		sessionToken = s.generateSessionToken()

		// Get user agent from context if available
		userAgent := "Google OAuth Client"
		deviceFingerprint := fmt.Sprintf("google-oauth-%s", ipAddress)

		s.logger.WithFields(logrus.Fields{
			"operation":          "GoogleLogin",
			"user_id":            user.ID,
			"device_fingerprint": deviceFingerprint,
		}).Debug("Creating session with SessionService")

		// Create session with 24h sliding window
		_, err = s.sessionService.CreateSession(ctx, user.ID, sessionToken, ipAddress, userAgent, deviceFingerprint)
		if err != nil {
			// Log error but don't fail login
			s.logger.WithFields(logrus.Fields{
				"operation": "GoogleLogin",
				"user_id":   user.ID,
				"error":     err.Error(),
			}).Warn("Failed to create session")
			sessionToken = "" // Continue without session token
		}
	} else {
		// Fallback to direct session creation if SessionService not available
		s.logger.WithFields(logrus.Fields{
			"operation": "GoogleLogin",
			"user_id":   user.ID,
		}).Debug("SessionService not available, using direct session creation")

		// Check concurrent sessions
		activeSessions, err := s.sessionRepo.GetActiveSessions(ctx, user.ID)
		if err != nil {
			s.logger.WithFields(logrus.Fields{
				"operation": "GoogleLogin",
				"user_id":   user.ID,
				"error":     err.Error(),
			}).Error("Failed to check active sessions")
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
				s.logger.WithFields(logrus.Fields{
					"operation":  "GoogleLogin",
					"user_id":    user.ID,
					"session_id": oldestSession.ID,
					"error":      err.Error(),
				}).Warn("Failed to terminate old session")
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
			s.logger.WithFields(logrus.Fields{
				"operation": "GoogleLogin",
				"user_id":   user.ID,
				"error":     err.Error(),
			}).Error("Failed to create session")
			return nil, status.Errorf(codes.Internal, "failed to create session: %v", err)
		}
	}

	// Generate JWT tokens with full user details using IJWTService
	s.logger.WithFields(logrus.Fields{
		"operation": "GoogleLogin",
		"user_id":   user.ID,
		"email":     user.Email,
		"role":      string(user.Role),
		"level":     user.Level,
	}).Debug("Generating JWT tokens")

	accessToken, err := s.jwtService.GenerateAccessToken(user.ID, user.Email, string(user.Role), user.Level)
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "GoogleLogin",
			"user_id":   user.ID,
			"error":     err.Error(),
		}).Error("Failed to generate access token")
		return nil, status.Errorf(codes.Internal, "failed to generate access token: %v", err)
	}

	refreshToken, err := s.jwtService.GenerateRefreshToken(user.ID)
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "GoogleLogin",
			"user_id":   user.ID,
			"error":     err.Error(),
		}).Error("Failed to generate refresh token")
		return nil, status.Errorf(codes.Internal, "failed to generate refresh token: %v", err)
	}

	// Update last login
	if err := s.userRepo.UpdateLastLogin(ctx, user.ID, ipAddress); err != nil {
		// Log error but don't fail login
		s.logger.WithFields(logrus.Fields{
			"operation": "GoogleLogin",
			"user_id":   user.ID,
			"error":     err.Error(),
		}).Warn("Failed to update last login")
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
	// Sá»­ dá»¥ng GoogleClient Ä‘á»ƒ verify ID token
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

// RefreshToken refreshes the access token using refresh token vá»›i validation vÃ  logging
//
// Business Logic:
// - Validate refresh token
// - Check user status (must be ACTIVE)
// - Generate new access token vÃ  refresh token
// - Return new tokens
//
// Parameters:
//   - ctx: Context vá»›i timeout vÃ  cancellation
//   - refreshToken: Refresh token tá»« client
//
// Returns:
//   - *pb.RefreshTokenResponse: Response vá»›i new access_token vÃ  refresh_token
//   - error: gRPC error vá»›i appropriate code
func (s *OAuthService) RefreshToken(ctx context.Context, refreshToken string) (*pb.RefreshTokenResponse, error) {
	// Validate input
	if refreshToken == "" {
		s.logger.Error("Empty refresh token provided")
		return nil, status.Errorf(codes.InvalidArgument, "refresh token cannot be empty")
	}

	s.logger.WithFields(logrus.Fields{
		"operation": "RefreshToken",
	}).Debug("Refresh token request")

	// Validate refresh token
	userID, err := s.jwtService.ValidateRefreshToken(refreshToken)
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "RefreshToken",
			"error":     err.Error(),
		}).Warn("Invalid refresh token")
		return nil, status.Errorf(codes.Unauthenticated, "invalid refresh token: %v", err)
	}

	// Get user
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "RefreshToken",
			"user_id":   userID,
			"error":     err.Error(),
		}).Error("User not found")
		return nil, status.Errorf(codes.NotFound, "user not found")
	}

	// Check if user is active
	if user.Status != "ACTIVE" {
		s.logger.WithFields(logrus.Fields{
			"operation": "RefreshToken",
			"user_id":   user.ID,
			"status":    user.Status,
		}).Warn("User account is not active")
		return nil, status.Errorf(codes.PermissionDenied, "user account is %s", user.Status)
	}

	// Generate new tokens vá»›i full user details
	s.logger.WithFields(logrus.Fields{
		"operation": "RefreshToken",
		"user_id":   user.ID,
		"email":     user.Email,
		"role":      string(user.Role),
		"level":     user.Level,
	}).Debug("Generating new tokens")

	newAccessToken, err := s.jwtService.GenerateAccessToken(user.ID, user.Email, string(user.Role), user.Level)
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "RefreshToken",
			"user_id":   user.ID,
			"error":     err.Error(),
		}).Error("Failed to generate access token")
		return nil, status.Errorf(codes.Internal, "failed to generate access token: %v", err)
	}

	newRefreshToken, err := s.jwtService.GenerateRefreshToken(user.ID)
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"operation": "RefreshToken",
			"user_id":   user.ID,
			"error":     err.Error(),
		}).Error("Failed to generate refresh token")
		return nil, status.Errorf(codes.Internal, "failed to generate refresh token: %v", err)
	}

	s.logger.WithFields(logrus.Fields{
		"operation": "RefreshToken",
		"user_id":   user.ID,
	}).Info("Token refreshed successfully")

	return &pb.RefreshTokenResponse{
		Response: &common.Response{
			Success: true,
			Message: "Token refreshed successfully",
		},
		AccessToken:  newAccessToken,
		RefreshToken: newRefreshToken,
	}, nil
}
