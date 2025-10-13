package repository

import (
	"context"
	"database/sql"
	"fmt"
	"regexp"
	"time"

	"github.com/sirupsen/logrus"
)

// UserPreference represents user preferences
type UserPreference struct {
	ID                  string
	UserID              string
	EmailNotifications  bool
	PushNotifications   bool
	SmsNotifications    bool
	AutoPlayVideos      bool
	DefaultVideoQuality string  // 480p, 720p, 1080p
	PlaybackSpeed       float32 // 0.5, 0.75, 1.0, 1.25, 1.5, 2.0
	ProfileVisibility   string  // PUBLIC, FRIENDS, PRIVATE
	ShowOnlineStatus    bool
	AllowDirectMessages bool
	Timezone            string
	Language            string
	DateFormat          string
	TimeFormat          string // 12h, 24h
	Theme               string // light, dark, auto
	FontSize            string // small, medium, large
	HighContrast        bool
	ReducedMotion       bool
	ScreenReaderMode    bool
	KeyboardShortcuts   bool
	TwoFactorEnabled    bool
	LoginAlerts         bool
	MarketingEmails     bool
	ProductUpdates      bool
	SecurityAlerts      bool
	WeeklyDigest        bool
	UpdatedAt           time.Time
}

// UserPreferenceRepository handles user preference data access
type UserPreferenceRepository interface {
	Create(ctx context.Context, pref *UserPreference) error
	GetByUserID(ctx context.Context, userID string) (*UserPreference, error)
	Update(ctx context.Context, pref *UserPreference) error
	UpdateField(ctx context.Context, userID, field string, value interface{}) error
	Delete(ctx context.Context, userID string) error
}

var (
	// Validation regex patterns
	ulidRegexPref = regexp.MustCompile(`^[0-9A-HJKMNP-TV-Z]{26}$`)
)

// Validation helpers for user preference repository
func validatePrefUserID(userID string) error {
	if userID == "" {
		return fmt.Errorf("user ID cannot be empty")
	}
	if !ulidRegexPref.MatchString(userID) {
		return fmt.Errorf("invalid user ID format: must be ULID")
	}
	return nil
}

func validatePrefField(field string) error {
	allowedFields := map[string]bool{
		"email_notifications":   true,
		"push_notifications":    true,
		"sms_notifications":     true,
		"auto_play_videos":      true,
		"default_video_quality": true,
		"playback_speed":        true,
		"profile_visibility":    true,
		"show_online_status":    true,
		"allow_direct_messages": true,
		"timezone":              true,
		"language":              true,
		"date_format":           true,
		"time_format":           true,
		"theme":                 true,
		"font_size":             true,
		"high_contrast":         true,
		"reduced_motion":        true,
		"screen_reader_mode":    true,
		"keyboard_shortcuts":    true,
		"two_factor_enabled":    true,
		"login_alerts":          true,
		"marketing_emails":      true,
		"product_updates":       true,
		"security_alerts":       true,
		"weekly_digest":         true,
	}

	if !allowedFields[field] {
		return ErrInvalidField
	}
	return nil
}

// userPreferenceRepository implements UserPreferenceRepository
type userPreferenceRepository struct {
	db     *sql.DB
	logger *logrus.Logger
}

// NewUserPreferenceRepository creates a new user preference repository with logger injection
func NewUserPreferenceRepository(db *sql.DB, logger *logrus.Logger) UserPreferenceRepository {
	// Create default logger if not provided
	if logger == nil {
		logger = logrus.New()
		logger.SetLevel(logrus.InfoLevel)
		logger.SetFormatter(&logrus.JSONFormatter{
			TimestampFormat: time.RFC3339,
			FieldMap: logrus.FieldMap{
				logrus.FieldKeyTime:  "timestamp",
				logrus.FieldKeyLevel: "level",
				logrus.FieldKeyMsg:   "message",
			},
		})
	}

	return &userPreferenceRepository{
		db:     db,
		logger: logger,
	}
}

// Create creates new user preferences
func (r *userPreferenceRepository) Create(ctx context.Context, pref *UserPreference) error {
	// Validate input
	if err := validatePrefUserID(pref.UserID); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "Create",
			"user_id":   pref.UserID,
		}).Error("Invalid user ID format")
		return fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "Create",
		"user_id":   pref.UserID,
		"language":  pref.Language,
		"theme":     pref.Theme,
	}).Info("Creating user preferences")

	query := `
		INSERT INTO user_preferences (
			id, user_id, email_notifications, push_notifications, sms_notifications,
			auto_play_videos, default_video_quality, playback_speed,
			profile_visibility, show_online_status, allow_direct_messages,
			timezone, language, date_format, time_format, theme, font_size,
			high_contrast, reduced_motion, screen_reader_mode,
			keyboard_shortcuts, two_factor_enabled, login_alerts,
			marketing_emails, product_updates, security_alerts, weekly_digest,
			updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
			$15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
		)
	`

	_, err := r.db.ExecContext(ctx, query,
		pref.ID,
		pref.UserID,
		pref.EmailNotifications,
		pref.PushNotifications,
		pref.SmsNotifications,
		pref.AutoPlayVideos,
		pref.DefaultVideoQuality,
		pref.PlaybackSpeed,
		pref.ProfileVisibility,
		pref.ShowOnlineStatus,
		pref.AllowDirectMessages,
		pref.Timezone,
		pref.Language,
		pref.DateFormat,
		pref.TimeFormat,
		pref.Theme,
		pref.FontSize,
		pref.HighContrast,
		pref.ReducedMotion,
		pref.ScreenReaderMode,
		pref.KeyboardShortcuts,
		pref.TwoFactorEnabled,
		pref.LoginAlerts,
		pref.MarketingEmails,
		pref.ProductUpdates,
		pref.SecurityAlerts,
		pref.WeeklyDigest,
		time.Now(),
	)

	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "Create",
			"user_id":   pref.UserID,
		}).WithError(err).Error("Failed to create user preferences")
		return fmt.Errorf("failed to create user preferences: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "Create",
		"user_id":   pref.UserID,
		"pref_id":   pref.ID,
	}).Info("User preferences created successfully")

	return nil
}

// GetByUserID gets preferences by user ID
func (r *userPreferenceRepository) GetByUserID(ctx context.Context, userID string) (*UserPreference, error) {
	// Validate input
	if err := validatePrefUserID(userID); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetByUserID",
			"user_id":   userID,
		}).Error("Invalid user ID format")
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "GetByUserID",
		"user_id":   userID,
	}).Debug("Fetching user preferences by user ID")

	query := `
		SELECT id, user_id, email_notifications, push_notifications, sms_notifications,
			   auto_play_videos, default_video_quality, playback_speed,
			   profile_visibility, show_online_status, allow_direct_messages,
			   timezone, language, date_format, time_format, theme, font_size,
			   high_contrast, reduced_motion, screen_reader_mode,
			   keyboard_shortcuts, two_factor_enabled, login_alerts,
			   marketing_emails, product_updates, security_alerts, weekly_digest,
			   updated_at
		FROM user_preferences
		WHERE user_id = $1
	`

	pref := &UserPreference{}
	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&pref.ID,
		&pref.UserID,
		&pref.EmailNotifications,
		&pref.PushNotifications,
		&pref.SmsNotifications,
		&pref.AutoPlayVideos,
		&pref.DefaultVideoQuality,
		&pref.PlaybackSpeed,
		&pref.ProfileVisibility,
		&pref.ShowOnlineStatus,
		&pref.AllowDirectMessages,
		&pref.Timezone,
		&pref.Language,
		&pref.DateFormat,
		&pref.TimeFormat,
		&pref.Theme,
		&pref.FontSize,
		&pref.HighContrast,
		&pref.ReducedMotion,
		&pref.ScreenReaderMode,
		&pref.KeyboardShortcuts,
		&pref.TwoFactorEnabled,
		&pref.LoginAlerts,
		&pref.MarketingEmails,
		&pref.ProductUpdates,
		&pref.SecurityAlerts,
		&pref.WeeklyDigest,
		&pref.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		// Create default preferences if not exists
		r.logger.WithFields(logrus.Fields{
			"operation": "GetByUserID",
			"user_id":   userID,
		}).Info("User preferences not found - creating default preferences")

		pref = &UserPreference{
			ID:                  GenerateID(),
			UserID:              userID,
			EmailNotifications:  true,
			PushNotifications:   true,
			SmsNotifications:    false,
			AutoPlayVideos:      true,
			DefaultVideoQuality: "720p",
			PlaybackSpeed:       1.0,
			ProfileVisibility:   "PUBLIC",
			ShowOnlineStatus:    true,
			AllowDirectMessages: true,
			Timezone:            "Asia/Ho_Chi_Minh",
			Language:            "vi",
			DateFormat:          "DD/MM/YYYY",
			TimeFormat:          "24h",
			Theme:               "light",
			FontSize:            "medium",
			HighContrast:        false,
			ReducedMotion:       false,
			ScreenReaderMode:    false,
			KeyboardShortcuts:   true,
			TwoFactorEnabled:    false,
			LoginAlerts:         true,
			MarketingEmails:     false,
			ProductUpdates:      true,
			SecurityAlerts:      true,
			WeeklyDigest:        false,
		}

		if err := r.Create(ctx, pref); err != nil {
			r.logger.WithFields(logrus.Fields{
				"operation": "GetByUserID",
				"user_id":   userID,
			}).WithError(err).Error("Failed to create default preferences")
			return nil, fmt.Errorf("failed to create default preferences: %w", err)
		}

		r.logger.WithFields(logrus.Fields{
			"operation": "GetByUserID",
			"user_id":   userID,
			"pref_id":   pref.ID,
		}).Info("Default preferences created successfully")

		return pref, nil
	}

	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "GetByUserID",
			"user_id":   userID,
		}).WithError(err).Error("Failed to get user preferences")
		return nil, fmt.Errorf("failed to get user preferences: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "GetByUserID",
		"user_id":   userID,
		"pref_id":   pref.ID,
		"language":  pref.Language,
		"theme":     pref.Theme,
	}).Debug("User preferences fetched successfully")

	return pref, nil
}

// Update updates user preferences
func (r *userPreferenceRepository) Update(ctx context.Context, pref *UserPreference) error {
	// Validate input
	if err := validatePrefUserID(pref.UserID); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "Update",
			"user_id":   pref.UserID,
		}).Error("Invalid user ID format")
		return fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "Update",
		"user_id":   pref.UserID,
		"pref_id":   pref.ID,
		"language":  pref.Language,
		"theme":     pref.Theme,
	}).Info("Updating user preferences")

	query := `
		UPDATE user_preferences
		SET email_notifications = $3, push_notifications = $4, sms_notifications = $5,
			auto_play_videos = $6, default_video_quality = $7, playback_speed = $8,
			profile_visibility = $9, show_online_status = $10, allow_direct_messages = $11,
			timezone = $12, language = $13, date_format = $14, time_format = $15,
			theme = $16, font_size = $17, high_contrast = $18, reduced_motion = $19,
			screen_reader_mode = $20, keyboard_shortcuts = $21, two_factor_enabled = $22,
			login_alerts = $23, marketing_emails = $24, product_updates = $25,
			security_alerts = $26, weekly_digest = $27, updated_at = $28
		WHERE user_id = $1 AND id = $2
	`

	_, err := r.db.ExecContext(ctx, query,
		pref.UserID,
		pref.ID,
		pref.EmailNotifications,
		pref.PushNotifications,
		pref.SmsNotifications,
		pref.AutoPlayVideos,
		pref.DefaultVideoQuality,
		pref.PlaybackSpeed,
		pref.ProfileVisibility,
		pref.ShowOnlineStatus,
		pref.AllowDirectMessages,
		pref.Timezone,
		pref.Language,
		pref.DateFormat,
		pref.TimeFormat,
		pref.Theme,
		pref.FontSize,
		pref.HighContrast,
		pref.ReducedMotion,
		pref.ScreenReaderMode,
		pref.KeyboardShortcuts,
		pref.TwoFactorEnabled,
		pref.LoginAlerts,
		pref.MarketingEmails,
		pref.ProductUpdates,
		pref.SecurityAlerts,
		pref.WeeklyDigest,
		time.Now(),
	)

	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "Update",
			"user_id":   pref.UserID,
			"pref_id":   pref.ID,
		}).WithError(err).Error("Failed to update user preferences")
		return fmt.Errorf("failed to update user preferences: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "Update",
		"user_id":   pref.UserID,
		"pref_id":   pref.ID,
	}).Info("User preferences updated successfully")

	return nil
}

// UpdateField updates a specific field in user preferences
func (r *userPreferenceRepository) UpdateField(ctx context.Context, userID, field string, value interface{}) error {
	// Validate input
	if err := validatePrefUserID(userID); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "UpdateField",
			"user_id":   userID,
			"field":     field,
		}).Error("Invalid user ID format")
		return fmt.Errorf("validation failed: %w", err)
	}

	if err := validatePrefField(field); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "UpdateField",
			"user_id":   userID,
			"field":     field,
		}).Error("Invalid field name")
		return err
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "UpdateField",
		"user_id":   userID,
		"field":     field,
		"value":     value,
	}).Info("Updating user preference field")

	// Build dynamic query - field name is validated above to prevent SQL injection
	query := `UPDATE user_preferences SET ` + field + ` = $2, updated_at = $3 WHERE user_id = $1`

	_, err := r.db.ExecContext(ctx, query, userID, value, time.Now())
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "UpdateField",
			"user_id":   userID,
			"field":     field,
		}).WithError(err).Error("Failed to update preference field")
		return fmt.Errorf("failed to update preference field: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "UpdateField",
		"user_id":   userID,
		"field":     field,
	}).Info("Preference field updated successfully")

	return nil
}

// Delete deletes user preferences
func (r *userPreferenceRepository) Delete(ctx context.Context, userID string) error {
	// Validate input
	if err := validatePrefUserID(userID); err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "Delete",
			"user_id":   userID,
		}).Error("Invalid user ID format")
		return fmt.Errorf("validation failed: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "Delete",
		"user_id":   userID,
	}).Warn("Deleting user preferences")

	query := `DELETE FROM user_preferences WHERE user_id = $1`
	_, err := r.db.ExecContext(ctx, query, userID)
	if err != nil {
		r.logger.WithFields(logrus.Fields{
			"operation": "Delete",
			"user_id":   userID,
		}).WithError(err).Error("Failed to delete user preferences")
		return fmt.Errorf("failed to delete user preferences: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"operation": "Delete",
		"user_id":   userID,
	}).Warn("User preferences deleted successfully")

	return nil
}
