package repository

import (
	"context"
	"database/sql"
	"time"
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

// userPreferenceRepository implements UserPreferenceRepository
type userPreferenceRepository struct {
	db *sql.DB
}

// NewUserPreferenceRepository creates a new user preference repository
func NewUserPreferenceRepository(db *sql.DB) UserPreferenceRepository {
	return &userPreferenceRepository{db: db}
}

// Create creates new user preferences
func (r *userPreferenceRepository) Create(ctx context.Context, pref *UserPreference) error {
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

	return err
}

// GetByUserID gets preferences by user ID
func (r *userPreferenceRepository) GetByUserID(ctx context.Context, userID string) (*UserPreference, error) {
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
			return nil, err
		}

		return pref, nil
	}

	return pref, err
}

// Update updates user preferences
func (r *userPreferenceRepository) Update(ctx context.Context, pref *UserPreference) error {
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

	return err
}

// UpdateField updates a specific field in user preferences
func (r *userPreferenceRepository) UpdateField(ctx context.Context, userID, field string, value interface{}) error {
	// Build dynamic query - be careful with SQL injection
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

	query := `UPDATE user_preferences SET ` + field + ` = $2, updated_at = $3 WHERE user_id = $1`

	_, err := r.db.ExecContext(ctx, query, userID, value, time.Now())
	return err
}

// Delete deletes user preferences
func (r *userPreferenceRepository) Delete(ctx context.Context, userID string) error {
	query := `DELETE FROM user_preferences WHERE user_id = $1`
	_, err := r.db.ExecContext(ctx, query, userID)
	return err
}
