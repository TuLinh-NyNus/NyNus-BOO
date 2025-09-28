package notification

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"
)

// NotificationType represents notification types
type NotificationType string

const (
	TypeSecurityAlert    NotificationType = "SECURITY_ALERT"
	TypeCourseUpdate     NotificationType = "COURSE_UPDATE"
	TypeSystemMessage    NotificationType = "SYSTEM_MESSAGE"
	TypeAccountActivity  NotificationType = "ACCOUNT_ACTIVITY"
	TypeNewContent       NotificationType = "NEW_CONTENT"
	TypeExamReminder     NotificationType = "EXAM_REMINDER"
	TypeLoginAlert       NotificationType = "LOGIN_ALERT"
	TypePasswordChange   NotificationType = "PASSWORD_CHANGE"
	TypeSessionExpired   NotificationType = "SESSION_EXPIRED"
	TypeEnrollmentUpdate NotificationType = "ENROLLMENT_UPDATE"
)

// NotificationPriority represents notification priority
type NotificationPriority string

const (
	PriorityHigh   NotificationPriority = "HIGH"
	PriorityMedium NotificationPriority = "MEDIUM"
	PriorityLow    NotificationPriority = "LOW"
)

// NotificationData represents additional notification data
type NotificationData struct {
	Priority   NotificationPriority   `json:"priority"`
	ActionURL  string                 `json:"action_url,omitempty"`
	ActionText string                 `json:"action_text,omitempty"`
	ImageURL   string                 `json:"image_url,omitempty"`
	Metadata   map[string]interface{} `json:"metadata,omitempty"`
}

// NotificationService handles notification operations
type NotificationService struct {
	notificationRepo repository.NotificationRepository
	userPrefRepo     repository.UserPreferenceRepository
}

// NewNotificationService creates a new notification service
func NewNotificationService(
	notificationRepo repository.NotificationRepository,
	userPrefRepo repository.UserPreferenceRepository,
) *NotificationService {
	return &NotificationService{
		notificationRepo: notificationRepo,
		userPrefRepo:     userPrefRepo,
	}
}

// CreateNotification creates a new notification
func (s *NotificationService) CreateNotification(
	ctx context.Context,
	userID string,
	notifType NotificationType,
	title string,
	message string,
	data *NotificationData,
	expiresIn *time.Duration,
) error {
	// Check user preferences
	if s.userPrefRepo != nil {
		prefs, err := s.userPrefRepo.GetByUserID(ctx, userID)
		if err == nil {
			// Check specific notification types against user preferences
			switch notifType {
			case TypeSecurityAlert, TypeLoginAlert, TypePasswordChange:
				// Security alerts are always sent if SecurityAlerts is enabled
				if !prefs.SecurityAlerts {
					return nil // User disabled security notifications
				}
			case TypeCourseUpdate, TypeNewContent:
				// Product updates check
				if !prefs.ProductUpdates {
					return nil
				}
			default:
				// General email notifications check
				if !prefs.EmailNotifications {
					// Still send if high priority
					if data == nil || data.Priority != PriorityHigh {
						return nil
					}
				}
			}
		}
	}

	// Prepare notification data
	var jsonData json.RawMessage
	if data != nil {
		dataBytes, err := json.Marshal(data)
		if err != nil {
			return fmt.Errorf("failed to marshal notification data: %w", err)
		}
		jsonData = dataBytes
	}

	// Calculate expiration
	var expiresAt *time.Time
	if expiresIn != nil {
		expiry := time.Now().Add(*expiresIn)
		expiresAt = &expiry
	}

	// Create notification
	notification := &repository.Notification{
		ID:        util.ULIDNow(),
		UserID:    userID,
		Type:      string(notifType),
		Title:     title,
		Message:   message,
		Data:      jsonData,
		IsRead:    false,
		CreatedAt: time.Now(),
		ExpiresAt: expiresAt,
	}

	return s.notificationRepo.Create(ctx, notification)
}

// CreateSecurityAlert creates a security alert notification
func (s *NotificationService) CreateSecurityAlert(
	ctx context.Context,
	userID string,
	title string,
	message string,
	ipAddress string,
	userAgent string,
) error {
	data := &NotificationData{
		Priority: PriorityHigh,
		Metadata: map[string]interface{}{
			"ip_address": ipAddress,
			"user_agent": userAgent,
			"timestamp":  time.Now().Format(time.RFC3339),
		},
	}

	// Security alerts expire in 30 days
	expiry := 30 * 24 * time.Hour
	return s.CreateNotification(ctx, userID, TypeSecurityAlert, title, message, data, &expiry)
}

// CreateLoginAlert creates a login alert notification
func (s *NotificationService) CreateLoginAlert(
	ctx context.Context,
	userID string,
	ipAddress string,
	userAgent string,
	location string,
) error {
	// Check if user wants login alerts
	if s.userPrefRepo != nil {
		prefs, err := s.userPrefRepo.GetByUserID(ctx, userID)
		if err == nil && !prefs.LoginAlerts {
			return nil // User disabled login alerts
		}
	}

	title := "Đăng nhập mới vào tài khoản của bạn"
	message := fmt.Sprintf("Phát hiện đăng nhập mới từ %s. Nếu không phải bạn, vui lòng đổi mật khẩu ngay.", location)

	data := &NotificationData{
		Priority:   PriorityMedium,
		ActionURL:  "/settings/security",
		ActionText: "Kiểm tra bảo mật",
		Metadata: map[string]interface{}{
			"ip_address": ipAddress,
			"user_agent": userAgent,
			"location":   location,
			"timestamp":  time.Now().Format(time.RFC3339),
		},
	}

	expiry := 7 * 24 * time.Hour
	return s.CreateNotification(ctx, userID, TypeLoginAlert, title, message, data, &expiry)
}

// CreateCourseUpdate creates a course update notification
func (s *NotificationService) CreateCourseUpdate(
	ctx context.Context,
	userID string,
	courseID string,
	courseName string,
	updateType string,
) error {
	title := fmt.Sprintf("Cập nhật khóa học: %s", courseName)
	message := fmt.Sprintf("Khóa học %s có %s mới", courseName, updateType)

	data := &NotificationData{
		Priority:   PriorityLow,
		ActionURL:  fmt.Sprintf("/courses/%s", courseID),
		ActionText: "Xem chi tiết",
		Metadata: map[string]interface{}{
			"course_id":   courseID,
			"course_name": courseName,
			"update_type": updateType,
		},
	}

	expiry := 14 * 24 * time.Hour
	return s.CreateNotification(ctx, userID, TypeCourseUpdate, title, message, data, &expiry)
}

// GetUserNotifications gets notifications for a user
func (s *NotificationService) GetUserNotifications(
	ctx context.Context,
	userID string,
	limit int,
	offset int,
) ([]*repository.Notification, error) {
	return s.notificationRepo.GetByUserID(ctx, userID, limit, offset)
}

// SendNotificationByChannel sends notifications through preferred channels
func (s *NotificationService) SendNotificationByChannel(
	ctx context.Context,
	userID string,
	title string,
	message string,
	notifType NotificationType,
) error {
	// Get user preferences to determine channels
	if s.userPrefRepo == nil {
		// No preference repo, send via default (in-app notification)
		return s.CreateNotification(ctx, userID, notifType, title, message, nil, nil)
	}

	prefs, err := s.userPrefRepo.GetByUserID(ctx, userID)
	if err != nil {
		// Error getting preferences, fallback to in-app
		return s.CreateNotification(ctx, userID, notifType, title, message, nil, nil)
	}

	// Always create in-app notification
	if err := s.CreateNotification(ctx, userID, notifType, title, message, nil, nil); err != nil {
		return fmt.Errorf("failed to create in-app notification: %w", err)
	}

	// Send via preferred channels
	var errors []error

	if prefs.EmailNotifications {
		// TODO: Integrate with email service
		// emailService.SendEmail(userID, title, message)
		fmt.Printf("[EMAIL] Would send to user %s: %s\n", userID, title)
	}

	if prefs.PushNotifications {
		// TODO: Integrate with push notification service (FCM, etc)
		// pushService.SendPush(userID, title, message)
		fmt.Printf("[PUSH] Would send to user %s: %s\n", userID, title)
	}

	if prefs.SmsNotifications {
		// TODO: Integrate with SMS service (Twilio, etc)
		// smsService.SendSMS(userID, message)
		fmt.Printf("[SMS] Would send to user %s: %s\n", userID, title)
	}

	// Return first error if any
	for _, err := range errors {
		if err != nil {
			return err
		}
	}

	return nil
}

// GetUnreadNotifications gets unread notifications for a user
func (s *NotificationService) GetUnreadNotifications(
	ctx context.Context,
	userID string,
) ([]*repository.Notification, error) {
	return s.notificationRepo.GetUnreadByUserID(ctx, userID)
}

// GetUnreadCount gets the count of unread notifications
func (s *NotificationService) GetUnreadCount(
	ctx context.Context,
	userID string,
) (int, error) {
	return s.notificationRepo.GetUnreadCount(ctx, userID)
}

// MarkAsRead marks a notification as read
func (s *NotificationService) MarkAsRead(
	ctx context.Context,
	notificationID string,
	userID string,
) error {
	// Verify notification belongs to user
	notification, err := s.notificationRepo.GetByID(ctx, notificationID)
	if err != nil {
		return err
	}

	if notification.UserID != userID {
		return fmt.Errorf("notification does not belong to user")
	}

	return s.notificationRepo.MarkAsRead(ctx, notificationID)
}

// MarkAllAsRead marks all notifications as read for a user
func (s *NotificationService) MarkAllAsRead(
	ctx context.Context,
	userID string,
) error {
	return s.notificationRepo.MarkAllAsRead(ctx, userID)
}

// DeleteNotification deletes a notification
func (s *NotificationService) DeleteNotification(
	ctx context.Context,
	notificationID string,
	userID string,
) error {
	// Verify notification belongs to user
	notification, err := s.notificationRepo.GetByID(ctx, notificationID)
	if err != nil {
		return err
	}

	if notification.UserID != userID {
		return fmt.Errorf("notification does not belong to user")
	}

	return s.notificationRepo.Delete(ctx, notificationID)
}

// DeleteAllNotifications deletes all notifications for a user
func (s *NotificationService) DeleteAllNotifications(
	ctx context.Context,
	userID string,
) error {
	return s.notificationRepo.DeleteAllByUserID(ctx, userID)
}

// CleanupExpiredNotifications removes expired notifications
func (s *NotificationService) CleanupExpiredNotifications(ctx context.Context) error {
	return s.notificationRepo.DeleteExpired(ctx)
}

// NotifyMultipleUsers sends notification to multiple users
func (s *NotificationService) NotifyMultipleUsers(
	ctx context.Context,
	userIDs []string,
	notifType NotificationType,
	title string,
	message string,
	data *NotificationData,
	expiresIn *time.Duration,
) error {
	for _, userID := range userIDs {
		if err := s.CreateNotification(ctx, userID, notifType, title, message, data, expiresIn); err != nil {
			// Log error but continue with other users
			fmt.Printf("Failed to create notification for user %s: %v\n", userID, err)
		}
	}
	return nil
}

// CreateSystemBroadcast creates a system-wide notification for all users
func (s *NotificationService) CreateSystemBroadcast(
	ctx context.Context,
	title string,
	message string,
	data *NotificationData,
) error {
	// This would typically get all active users from user repository
	// For now, return nil as placeholder
	// TODO: Implement when user repository has ListAllActiveUsers method
	return nil
}
