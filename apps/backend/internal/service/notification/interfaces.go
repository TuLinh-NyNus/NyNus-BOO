package notification

import (
	"context"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
)

// NotificationService defines the consolidated notification service interface
// This handles all notification-related operations including email, push, and in-app notifications
type NotificationService interface {
	// Basic Notification Operations
	CreateNotification(ctx context.Context, notification *repository.Notification) error
	GetNotification(ctx context.Context, notificationID string) (*repository.Notification, error)
	UpdateNotification(ctx context.Context, notification *repository.Notification) error
	DeleteNotification(ctx context.Context, notificationID string) error

	// User Notification Operations
	GetUserNotifications(ctx context.Context, userID string, offset, limit int) ([]repository.Notification, int, error)
	GetUnreadNotifications(ctx context.Context, userID string) ([]repository.Notification, error)
	MarkNotificationAsRead(ctx context.Context, notificationID string) error
	MarkAllNotificationsAsRead(ctx context.Context, userID string) error
	DeleteUserNotification(ctx context.Context, userID, notificationID string) error

	// Bulk Notification Operations
	SendBulkNotification(ctx context.Context, notification *BulkNotification) error
	SendNotificationToRole(ctx context.Context, role string, notification *repository.Notification) error
	SendNotificationToUsers(ctx context.Context, userIDs []string, notification *repository.Notification) error
	
	// Email Notification Operations
	SendEmailNotification(ctx context.Context, email *EmailNotification) error
	SendWelcomeEmail(ctx context.Context, userID, email string) error
	SendPasswordResetEmail(ctx context.Context, userID, email, resetToken string) error
	SendExamResultEmail(ctx context.Context, userID, examID string, result *entity.ExamResult) error
	
	// Push Notification Operations
	SendPushNotification(ctx context.Context, push *PushNotification) error
	RegisterDeviceToken(ctx context.Context, userID, deviceToken, platform string) error
	UnregisterDeviceToken(ctx context.Context, userID, deviceToken string) error
	
	// Template Operations
	CreateNotificationTemplate(ctx context.Context, template *NotificationTemplate) error
	GetNotificationTemplate(ctx context.Context, templateID string) (*NotificationTemplate, error)
	UpdateNotificationTemplate(ctx context.Context, template *NotificationTemplate) error
	DeleteNotificationTemplate(ctx context.Context, templateID string) error
	ListNotificationTemplates(ctx context.Context, offset, limit int) ([]NotificationTemplate, int, error)
	
	// Preference Operations
	GetUserNotificationPreferences(ctx context.Context, userID string) (*NotificationPreferences, error)
	UpdateUserNotificationPreferences(ctx context.Context, userID string, preferences *NotificationPreferences) error
	
	// Analytics Operations
	GetNotificationAnalytics(ctx context.Context, dateFrom, dateTo string) (*NotificationAnalytics, error)
	GetUserEngagementStats(ctx context.Context, userID string) (*UserEngagementStats, error)
	GetNotificationDeliveryStats(ctx context.Context, notificationID string) (*DeliveryStats, error)
}

// BulkNotification represents a notification to be sent to multiple users
type BulkNotification struct {
	Title       string            `json:"title"`
	Message     string            `json:"message"`
	Type        string            `json:"type"`
	Priority    string            `json:"priority"`
	UserIDs     []string          `json:"user_ids"`
	Roles       []string          `json:"roles"`
	Metadata    map[string]string `json:"metadata"`
	ScheduledAt string            `json:"scheduled_at"`
	ExpiresAt   string            `json:"expires_at"`
}

// EmailNotification represents an email notification
type EmailNotification struct {
	To          []string          `json:"to"`
	CC          []string          `json:"cc"`
	BCC         []string          `json:"bcc"`
	Subject     string            `json:"subject"`
	Body        string            `json:"body"`
	BodyHTML    string            `json:"body_html"`
	TemplateID  string            `json:"template_id"`
	Variables   map[string]string `json:"variables"`
	Attachments []EmailAttachment `json:"attachments"`
	Priority    string            `json:"priority"`
	ScheduledAt string            `json:"scheduled_at"`
}

// EmailAttachment represents an email attachment
type EmailAttachment struct {
	Filename    string `json:"filename"`
	ContentType string `json:"content_type"`
	Data        []byte `json:"data"`
	Size        int64  `json:"size"`
}

// PushNotification represents a push notification
type PushNotification struct {
	UserIDs     []string          `json:"user_ids"`
	Title       string            `json:"title"`
	Body        string            `json:"body"`
	Icon        string            `json:"icon"`
	Sound       string            `json:"sound"`
	Badge       int               `json:"badge"`
	Data        map[string]string `json:"data"`
	ClickAction string            `json:"click_action"`
	Priority    string            `json:"priority"`
	TTL         int               `json:"ttl"`
	CollapseKey string            `json:"collapse_key"`
}

// NotificationTemplate represents a notification template
type NotificationTemplate struct {
	ID          string            `json:"id"`
	Name        string            `json:"name"`
	Type        string            `json:"type"` // email, push, in_app
	Subject     string            `json:"subject"`
	Body        string            `json:"body"`
	BodyHTML    string            `json:"body_html"`
	Variables   []string          `json:"variables"`
	Metadata    map[string]string `json:"metadata"`
	IsActive    bool              `json:"is_active"`
	CreatedAt   string            `json:"created_at"`
	UpdatedAt   string            `json:"updated_at"`
	CreatedBy   string            `json:"created_by"`
}

// NotificationPreferences represents user notification preferences
type NotificationPreferences struct {
	UserID              string `json:"user_id"`
	EmailEnabled        bool   `json:"email_enabled"`
	PushEnabled         bool   `json:"push_enabled"`
	InAppEnabled        bool   `json:"in_app_enabled"`
	ExamReminders       bool   `json:"exam_reminders"`
	ResultNotifications bool   `json:"result_notifications"`
	NewsletterEnabled   bool   `json:"newsletter_enabled"`
	MarketingEnabled    bool   `json:"marketing_enabled"`
	SecurityAlerts      bool   `json:"security_alerts"`
	SystemUpdates       bool   `json:"system_updates"`
	Frequency           string `json:"frequency"` // immediate, daily, weekly
	QuietHoursStart     string `json:"quiet_hours_start"`
	QuietHoursEnd       string `json:"quiet_hours_end"`
	Timezone            string `json:"timezone"`
}

// NotificationAnalytics represents notification analytics
type NotificationAnalytics struct {
	DateFrom            string             `json:"date_from"`
	DateTo              string             `json:"date_to"`
	TotalSent           int                `json:"total_sent"`
	TotalDelivered      int                `json:"total_delivered"`
	TotalOpened         int                `json:"total_opened"`
	TotalClicked        int                `json:"total_clicked"`
	TotalFailed         int                `json:"total_failed"`
	DeliveryRate        float64            `json:"delivery_rate"`
	OpenRate            float64            `json:"open_rate"`
	ClickRate           float64            `json:"click_rate"`
	FailureRate         float64            `json:"failure_rate"`
	TypeBreakdown       map[string]int     `json:"type_breakdown"`
	PlatformBreakdown   map[string]int     `json:"platform_breakdown"`
	DailyStats          map[string]DailyNotificationStats `json:"daily_stats"`
}

// DailyNotificationStats represents daily notification statistics
type DailyNotificationStats struct {
	Date      string `json:"date"`
	Sent      int    `json:"sent"`
	Delivered int    `json:"delivered"`
	Opened    int    `json:"opened"`
	Clicked   int    `json:"clicked"`
	Failed    int    `json:"failed"`
}

// UserEngagementStats represents user engagement with notifications
type UserEngagementStats struct {
	UserID              string  `json:"user_id"`
	TotalReceived       int     `json:"total_received"`
	TotalOpened         int     `json:"total_opened"`
	TotalClicked        int     `json:"total_clicked"`
	OpenRate            float64 `json:"open_rate"`
	ClickRate           float64 `json:"click_rate"`
	LastEngagement      string  `json:"last_engagement"`
	PreferredType       string  `json:"preferred_type"`
	PreferredTime       string  `json:"preferred_time"`
	EngagementScore     float64 `json:"engagement_score"`
}

// DeliveryStats represents delivery statistics for a specific notification
type DeliveryStats struct {
	NotificationID string                    `json:"notification_id"`
	TotalTargets   int                       `json:"total_targets"`
	Delivered      int                       `json:"delivered"`
	Failed         int                       `json:"failed"`
	Pending        int                       `json:"pending"`
	DeliveryRate   float64                   `json:"delivery_rate"`
	FailureReasons map[string]int            `json:"failure_reasons"`
	DeliveryTimes  map[string]DeliveryTiming `json:"delivery_times"`
}

// DeliveryTiming represents delivery timing information
type DeliveryTiming struct {
	SentAt      string `json:"sent_at"`
	DeliveredAt string `json:"delivered_at"`
	OpenedAt    string `json:"opened_at"`
	ClickedAt   string `json:"clicked_at"`
	Duration    int    `json:"duration_seconds"`
}

// NotificationRepository defines the repository interface for notification operations
type NotificationRepository interface {
	// Basic CRUD
	Create(ctx context.Context, db database.QueryExecer, notification *repository.Notification) error
	GetByID(ctx context.Context, db database.QueryExecer, id string) (*repository.Notification, error)
	Update(ctx context.Context, db database.QueryExecer, notification *repository.Notification) error
	Delete(ctx context.Context, db database.QueryExecer, id string) error

	// User notifications
	GetUserNotifications(ctx context.Context, db database.QueryExecer, userID string, offset, limit int) ([]repository.Notification, int, error)
	GetUnreadNotifications(ctx context.Context, db database.QueryExecer, userID string) ([]repository.Notification, error)
	MarkAsRead(ctx context.Context, db database.QueryExecer, notificationID string) error
	MarkAllAsRead(ctx context.Context, db database.QueryExecer, userID string) error
	
	// Templates
	CreateTemplate(ctx context.Context, db database.QueryExecer, template *NotificationTemplate) error
	GetTemplate(ctx context.Context, db database.QueryExecer, id string) (*NotificationTemplate, error)
	UpdateTemplate(ctx context.Context, db database.QueryExecer, template *NotificationTemplate) error
	DeleteTemplate(ctx context.Context, db database.QueryExecer, id string) error
	ListTemplates(ctx context.Context, db database.QueryExecer, offset, limit int) ([]NotificationTemplate, int, error)
	
	// Preferences
	GetUserPreferences(ctx context.Context, db database.QueryExecer, userID string) (*NotificationPreferences, error)
	UpdateUserPreferences(ctx context.Context, db database.QueryExecer, userID string, preferences *NotificationPreferences) error
	
	// Device tokens
	CreateDeviceToken(ctx context.Context, db database.QueryExecer, userID, token, platform string) error
	DeleteDeviceToken(ctx context.Context, db database.QueryExecer, userID, token string) error
	GetUserDeviceTokens(ctx context.Context, db database.QueryExecer, userID string) ([]string, error)
	
	// Analytics
	GetAnalytics(ctx context.Context, db database.QueryExecer, dateFrom, dateTo string) (*NotificationAnalytics, error)
	GetUserEngagementStats(ctx context.Context, db database.QueryExecer, userID string) (*UserEngagementStats, error)
	GetDeliveryStats(ctx context.Context, db database.QueryExecer, notificationID string) (*DeliveryStats, error)
}
