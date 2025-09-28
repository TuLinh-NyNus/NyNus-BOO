package grpc

import (
	"context"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/middleware"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/user/session"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/common"
	v1 "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/v1"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// ProfileServiceServer implements the ProfileService
type ProfileServiceServer struct {
	v1.UnimplementedProfileServiceServer
	userRepo       repository.IUserRepository
	sessionService *session.SessionService
	preferenceRepo repository.UserPreferenceRepository
}

// NewProfileServiceServer creates a new profile service
func NewProfileServiceServer(
	userRepo repository.IUserRepository,
	sessionService *session.SessionService,
	preferenceRepo repository.UserPreferenceRepository,
) *ProfileServiceServer {
	return &ProfileServiceServer{
		userRepo:       userRepo,
		sessionService: sessionService,
		preferenceRepo: preferenceRepo,
	}
}

// GetProfile gets the user profile
func (s *ProfileServiceServer) GetProfile(ctx context.Context, req *v1.GetProfileRequest) (*v1.GetProfileResponse, error) {
	// Get user ID from context or use provided ID
	userID := req.UserId
	if userID == "" {
		var err error
		userID, err = middleware.GetUserIDFromContext(ctx)
		if err != nil {
			return nil, status.Errorf(codes.Unauthenticated, "user not authenticated")
		}
	}

	// Get user from repository
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "user not found")
	}

	// Convert to proto
	profile := &v1.UserProfile{
		Id:            user.ID,
		Email:         user.Email,
		FirstName:     user.FirstName,
		LastName:      user.LastName,
		Username:      user.Username,
		Avatar:        user.Avatar,
		Bio:           user.Bio,
		Phone:         user.Phone,
		Address:       user.Address,
		School:        user.School,
		Gender:        user.Gender,
		Role:          user.Role,
		Level:         int32(user.Level),
		Status:        convertStatusToProto(user.Status),
		EmailVerified: user.EmailVerified,
		CreatedAt:     user.CreatedAt.Format(time.RFC3339),
		UpdatedAt:     user.UpdatedAt.Format(time.RFC3339),
	}

	// Format dates
	if user.DateOfBirth != nil {
		profile.DateOfBirth = user.DateOfBirth.Format("2006-01-02")
	}

	return &v1.GetProfileResponse{
		Response: &common.Response{
			Success: true,
			Message: "Profile retrieved successfully",
		},
		Profile: profile,
	}, nil
}

// UpdateProfile updates the user profile
func (s *ProfileServiceServer) UpdateProfile(ctx context.Context, req *v1.UpdateProfileRequest) (*v1.UpdateProfileResponse, error) {
	// Get user ID from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "user not authenticated")
	}

	// Get existing user
	user, err := s.userRepo.GetByID(ctx, userID)
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
	if req.Gender != "" {
		user.Gender = req.Gender
	}
	if req.DateOfBirth != "" {
		// Parse date
		dob, err := time.Parse("2006-01-02", req.DateOfBirth)
		if err == nil {
			user.DateOfBirth = &dob
		}
	}

	// Update user in repository
	err = s.userRepo.Update(ctx, user)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to update profile: %v", err)
	}

	// Convert to proto
	profile := &v1.UserProfile{
		Id:            user.ID,
		Email:         user.Email,
		FirstName:     user.FirstName,
		LastName:      user.LastName,
		Username:      user.Username,
		Avatar:        user.Avatar,
		Bio:           user.Bio,
		Phone:         user.Phone,
		Address:       user.Address,
		School:        user.School,
		Gender:        user.Gender,
		Role:          user.Role,
		Level:         int32(user.Level),
		Status:        convertStatusToProto(user.Status),
		EmailVerified: user.EmailVerified,
		CreatedAt:     user.CreatedAt.Format(time.RFC3339),
		UpdatedAt:     user.UpdatedAt.Format(time.RFC3339),
	}

	if user.DateOfBirth != nil {
		profile.DateOfBirth = user.DateOfBirth.Format("2006-01-02")
	}

	return &v1.UpdateProfileResponse{
		Response: &common.Response{
			Success: true,
			Message: "Profile updated successfully",
		},
		Profile: profile,
	}, nil
}

// GetSessions gets user sessions
func (s *ProfileServiceServer) GetSessions(ctx context.Context, req *v1.GetSessionsRequest) (*v1.GetSessionsResponse, error) {
	// Get user ID from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "user not authenticated")
	}

	// Get sessions from service
	sessions, err := s.sessionService.GetActiveSessions(ctx, userID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get sessions: %v", err)
	}

	// Convert to proto
	var protoSessions []*v1.UserSession
	for _, session := range sessions {
		protoSession := &v1.UserSession{
			Id:                session.ID,
			UserId:            session.UserID,
			SessionToken:      session.SessionToken,
			IpAddress:         session.IPAddress,
			UserAgent:         session.UserAgent,
			DeviceFingerprint: session.DeviceFingerprint,
			Location:          session.Location,
			IsActive:          session.IsActive,
			LastActivity:      session.LastActivity.Format(time.RFC3339),
			ExpiresAt:         session.ExpiresAt.Format(time.RFC3339),
			CreatedAt:         session.CreatedAt.Format(time.RFC3339),
		}
		protoSessions = append(protoSessions, protoSession)
	}

	return &v1.GetSessionsResponse{
		Response: &common.Response{
			Success: true,
			Message: "Sessions retrieved successfully",
		},
		Sessions: protoSessions,
	}, nil
}

// TerminateSession terminates a specific session
func (s *ProfileServiceServer) TerminateSession(ctx context.Context, req *v1.TerminateSessionRequest) (*v1.TerminateSessionResponse, error) {
	// Get user ID from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "user not authenticated")
	}

	// Terminate session
	err = s.sessionService.TerminateSession(ctx, req.SessionId, userID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to terminate session: %v", err)
	}

	return &v1.TerminateSessionResponse{
		Response: &common.Response{
			Success: true,
			Message: "Session terminated successfully",
		},
	}, nil
}

// TerminateAllSessions terminates all user sessions
func (s *ProfileServiceServer) TerminateAllSessions(ctx context.Context, req *v1.TerminateAllSessionsRequest) (*v1.TerminateAllSessionsResponse, error) {
	// Get user ID from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "user not authenticated")
	}

	// Get session token from context to keep current session
	sessionToken := getSessionTokenFromContext(ctx)

	if req.KeepCurrent && sessionToken != "" {
		// Terminate all other sessions
		err = s.sessionService.TerminateOtherSessions(ctx, userID, sessionToken)
	} else {
		// Terminate all sessions
		err = s.sessionService.TerminateAllSessions(ctx, userID)
	}

	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to terminate sessions: %v", err)
	}

	return &v1.TerminateAllSessionsResponse{
		Response: &common.Response{
			Success: true,
			Message: "Sessions terminated successfully",
		},
	}, nil
}

// GetPreferences gets user preferences
func (s *ProfileServiceServer) GetPreferences(ctx context.Context, req *v1.GetPreferencesRequest) (*v1.GetPreferencesResponse, error) {
	// Get user ID from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "user not authenticated")
	}

	// Get preferences from repository (auto-creates if not exists)
	preferences, err := s.preferenceRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get preferences: %v", err)
	}

	// Convert to proto
	protoPreferences := &v1.UserPreferences{
		EmailNotifications:  preferences.EmailNotifications,
		PushNotifications:   preferences.PushNotifications,
		SmsNotifications:    preferences.SmsNotifications,
		AutoPlayVideos:      preferences.AutoPlayVideos,
		DefaultVideoQuality: preferences.DefaultVideoQuality,
		PlaybackSpeed:       preferences.PlaybackSpeed,
		ProfileVisibility:   preferences.ProfileVisibility,
		ShowOnlineStatus:    preferences.ShowOnlineStatus,
		AllowDirectMessages: preferences.AllowDirectMessages,
		Timezone:            preferences.Timezone,
		Language:            preferences.Language,
		DateFormat:          preferences.DateFormat,
		TimeFormat:          preferences.TimeFormat,
		Theme:               preferences.Theme,
		FontSize:            preferences.FontSize,
		HighContrast:        preferences.HighContrast,
		ReducedMotion:       preferences.ReducedMotion,
		ScreenReaderMode:    preferences.ScreenReaderMode,
		KeyboardShortcuts:   preferences.KeyboardShortcuts,
		TwoFactorEnabled:    preferences.TwoFactorEnabled,
		LoginAlerts:         preferences.LoginAlerts,
		MarketingEmails:     preferences.MarketingEmails,
		ProductUpdates:      preferences.ProductUpdates,
		SecurityAlerts:      preferences.SecurityAlerts,
		WeeklyDigest:        preferences.WeeklyDigest,
	}

	return &v1.GetPreferencesResponse{
		Response: &common.Response{
			Success: true,
			Message: "Preferences retrieved successfully",
		},
		Preferences: protoPreferences,
	}, nil
}

// UpdatePreferences updates user preferences
func (s *ProfileServiceServer) UpdatePreferences(ctx context.Context, req *v1.UpdatePreferencesRequest) (*v1.UpdatePreferencesResponse, error) {
	// Get user ID from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "user not authenticated")
	}

	if req.Preferences == nil {
		return nil, status.Errorf(codes.InvalidArgument, "preferences cannot be nil")
	}

	// Get existing preferences
	existingPrefs, err := s.preferenceRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get existing preferences: %v", err)
	}

	// Update fields from request
	existingPrefs.EmailNotifications = req.Preferences.EmailNotifications
	existingPrefs.PushNotifications = req.Preferences.PushNotifications
	existingPrefs.SmsNotifications = req.Preferences.SmsNotifications
	existingPrefs.AutoPlayVideos = req.Preferences.AutoPlayVideos
	existingPrefs.DefaultVideoQuality = req.Preferences.DefaultVideoQuality
	existingPrefs.PlaybackSpeed = req.Preferences.PlaybackSpeed
	existingPrefs.ProfileVisibility = req.Preferences.ProfileVisibility
	existingPrefs.ShowOnlineStatus = req.Preferences.ShowOnlineStatus
	existingPrefs.AllowDirectMessages = req.Preferences.AllowDirectMessages
	existingPrefs.Timezone = req.Preferences.Timezone
	existingPrefs.Language = req.Preferences.Language
	existingPrefs.DateFormat = req.Preferences.DateFormat
	existingPrefs.TimeFormat = req.Preferences.TimeFormat
	existingPrefs.Theme = req.Preferences.Theme
	existingPrefs.FontSize = req.Preferences.FontSize
	existingPrefs.HighContrast = req.Preferences.HighContrast
	existingPrefs.ReducedMotion = req.Preferences.ReducedMotion
	existingPrefs.ScreenReaderMode = req.Preferences.ScreenReaderMode
	existingPrefs.KeyboardShortcuts = req.Preferences.KeyboardShortcuts
	existingPrefs.TwoFactorEnabled = req.Preferences.TwoFactorEnabled
	existingPrefs.LoginAlerts = req.Preferences.LoginAlerts
	existingPrefs.MarketingEmails = req.Preferences.MarketingEmails
	existingPrefs.ProductUpdates = req.Preferences.ProductUpdates
	existingPrefs.SecurityAlerts = req.Preferences.SecurityAlerts
	existingPrefs.WeeklyDigest = req.Preferences.WeeklyDigest

	// Save updated preferences
	err = s.preferenceRepo.Update(ctx, existingPrefs)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to update preferences: %v", err)
	}

	return &v1.UpdatePreferencesResponse{
		Response: &common.Response{
			Success: true,
			Message: "Preferences updated successfully",
		},
		Preferences: req.Preferences,
	}, nil
}

// getSessionTokenFromContext extracts session token from context
func getSessionTokenFromContext(ctx context.Context) string {
	// TODO: Implement session token extraction from context
	return ""
}
