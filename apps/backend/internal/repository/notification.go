package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"
)

// Notification represents a user notification
type Notification struct {
	ID        string
	UserID    string
	Type      string // SECURITY_ALERT, COURSE_UPDATE, SYSTEM_MESSAGE, etc.
	Title     string
	Message   string
	Data      json.RawMessage
	IsRead    bool
	ReadAt    *time.Time
	CreatedAt time.Time
	ExpiresAt *time.Time
}

// NotificationWithUser combines notification with user information
type NotificationWithUser struct {
	Notification *Notification
	UserEmail    string
	UserName     string
}

// NotificationStats contains notification statistics
type NotificationStats struct {
	TotalSentToday      int
	TotalUnread         int
	NotificationsByType map[string]int
	ReadRate            float64
	MostActiveType      string
	AverageReadTime     float64
	SentThisWeek        int
	GrowthPercentage    float64
}

// NotificationRepository handles notification data access
type NotificationRepository interface {
	Create(ctx context.Context, notification *Notification) error
	GetByID(ctx context.Context, id string) (*Notification, error)
	GetByUserID(ctx context.Context, userID string, limit, offset int) ([]*Notification, error)
	GetUnreadByUserID(ctx context.Context, userID string) ([]*Notification, error)
	MarkAsRead(ctx context.Context, id string) error
	MarkAllAsRead(ctx context.Context, userID string) error
	GetUnreadCount(ctx context.Context, userID string) (int, error)
	Delete(ctx context.Context, id string) error
	DeleteExpired(ctx context.Context) error
	DeleteAllByUserID(ctx context.Context, userID string) error

	// Admin methods
	GetAllNotifications(ctx context.Context, limit, offset int, notifType, userID string, unreadOnly bool) ([]*NotificationWithUser, error)
	GetAllNotificationsCount(ctx context.Context, notifType, userID string, unreadOnly bool) (int, error)
	SearchNotifications(ctx context.Context, query string, limit, offset int) ([]*NotificationWithUser, error)
	GetNotificationStats(ctx context.Context) (*NotificationStats, error)
}

// notificationRepository implements NotificationRepository
type notificationRepository struct {
	db *sql.DB
}

// NewNotificationRepository creates a new notification repository
func NewNotificationRepository(db *sql.DB) NotificationRepository {
	return &notificationRepository{db: db}
}

// Create creates a new notification
func (r *notificationRepository) Create(ctx context.Context, notification *Notification) error {
	query := `
		INSERT INTO notifications (
			id, user_id, type, title, message, data, 
			is_read, read_at, created_at, expires_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`

	_, err := r.db.ExecContext(ctx, query,
		notification.ID,
		notification.UserID,
		notification.Type,
		notification.Title,
		notification.Message,
		notification.Data,
		notification.IsRead,
		notification.ReadAt,
		notification.CreatedAt,
		notification.ExpiresAt,
	)

	return err
}

// GetByID gets a notification by ID
func (r *notificationRepository) GetByID(ctx context.Context, id string) (*Notification, error) {
	query := `
		SELECT id, user_id, type, title, message, data, 
			   is_read, read_at, created_at, expires_at
		FROM notifications
		WHERE id = $1
	`

	notification := &Notification{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&notification.ID,
		&notification.UserID,
		&notification.Type,
		&notification.Title,
		&notification.Message,
		&notification.Data,
		&notification.IsRead,
		&notification.ReadAt,
		&notification.CreatedAt,
		&notification.ExpiresAt,
	)

	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}

	return notification, err
}

// GetByUserID gets notifications for a user with pagination
func (r *notificationRepository) GetByUserID(ctx context.Context, userID string, limit, offset int) ([]*Notification, error) {
	query := `
		SELECT id, user_id, type, title, message, data, 
			   is_read, read_at, created_at, expires_at
		FROM notifications
		WHERE user_id = $1 
			AND (expires_at IS NULL OR expires_at > NOW())
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.QueryContext(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []*Notification
	for rows.Next() {
		notification := &Notification{}
		err := rows.Scan(
			&notification.ID,
			&notification.UserID,
			&notification.Type,
			&notification.Title,
			&notification.Message,
			&notification.Data,
			&notification.IsRead,
			&notification.ReadAt,
			&notification.CreatedAt,
			&notification.ExpiresAt,
		)
		if err != nil {
			return nil, err
		}
		notifications = append(notifications, notification)
	}

	return notifications, nil
}

// GetUnreadByUserID gets unread notifications for a user
func (r *notificationRepository) GetUnreadByUserID(ctx context.Context, userID string) ([]*Notification, error) {
	query := `
		SELECT id, user_id, type, title, message, data, 
			   is_read, read_at, created_at, expires_at
		FROM notifications
		WHERE user_id = $1 
			AND is_read = false
			AND (expires_at IS NULL OR expires_at > NOW())
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []*Notification
	for rows.Next() {
		notification := &Notification{}
		err := rows.Scan(
			&notification.ID,
			&notification.UserID,
			&notification.Type,
			&notification.Title,
			&notification.Message,
			&notification.Data,
			&notification.IsRead,
			&notification.ReadAt,
			&notification.CreatedAt,
			&notification.ExpiresAt,
		)
		if err != nil {
			return nil, err
		}
		notifications = append(notifications, notification)
	}

	return notifications, nil
}

// MarkAsRead marks a notification as read
func (r *notificationRepository) MarkAsRead(ctx context.Context, id string) error {
	query := `
		UPDATE notifications
		SET is_read = true, read_at = $2
		WHERE id = $1
	`

	_, err := r.db.ExecContext(ctx, query, id, time.Now())
	return err
}

// MarkAllAsRead marks all notifications as read for a user
func (r *notificationRepository) MarkAllAsRead(ctx context.Context, userID string) error {
	query := `
		UPDATE notifications
		SET is_read = true, read_at = $2
		WHERE user_id = $1 AND is_read = false
	`

	_, err := r.db.ExecContext(ctx, query, userID, time.Now())
	return err
}

// GetUnreadCount gets the count of unread notifications
func (r *notificationRepository) GetUnreadCount(ctx context.Context, userID string) (int, error) {
	query := `
		SELECT COUNT(*)
		FROM notifications
		WHERE user_id = $1 
			AND is_read = false
			AND (expires_at IS NULL OR expires_at > NOW())
	`

	var count int
	err := r.db.QueryRowContext(ctx, query, userID).Scan(&count)
	return count, err
}

// Delete deletes a notification
func (r *notificationRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM notifications WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// DeleteExpired deletes expired notifications
func (r *notificationRepository) DeleteExpired(ctx context.Context) error {
	query := `
		DELETE FROM notifications
		WHERE expires_at IS NOT NULL AND expires_at <= NOW()
	`

	_, err := r.db.ExecContext(ctx, query)
	return err
}

// DeleteAllByUserID deletes all notifications for a user
func (r *notificationRepository) DeleteAllByUserID(ctx context.Context, userID string) error {
	query := `DELETE FROM notifications WHERE user_id = $1`
	_, err := r.db.ExecContext(ctx, query, userID)
	return err
}

// GetAllNotifications gets all notifications with user info (admin method)
func (r *notificationRepository) GetAllNotifications(ctx context.Context, limit, offset int, notifType, userID string, unreadOnly bool) ([]*NotificationWithUser, error) {
	query := `
		SELECT n.id, n.user_id, n.type, n.title, n.message, n.data,
			   n.is_read, n.read_at, n.created_at, n.expires_at,
			   u.email, COALESCE(u.first_name || ' ' || u.last_name, u.email) as user_name
		FROM notifications n
		JOIN users u ON n.user_id = u.id
		WHERE (expires_at IS NULL OR expires_at > NOW())
	`

	args := []interface{}{}
	argCount := 1

	if notifType != "" {
		query += fmt.Sprintf(` AND n.type = $%d`, argCount)
		args = append(args, notifType)
		argCount++
	}

	if userID != "" {
		query += fmt.Sprintf(` AND n.user_id = $%d`, argCount)
		args = append(args, userID)
		argCount++
	}

	if unreadOnly {
		query += ` AND n.is_read = false`
	}

	query += fmt.Sprintf(` ORDER BY n.created_at DESC LIMIT $%d OFFSET $%d`, argCount, argCount+1)
	args = append(args, limit, offset)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []*NotificationWithUser
	for rows.Next() {
		n := &Notification{}
		nwu := &NotificationWithUser{Notification: n}

		err := rows.Scan(
			&n.ID, &n.UserID, &n.Type, &n.Title, &n.Message, &n.Data,
			&n.IsRead, &n.ReadAt, &n.CreatedAt, &n.ExpiresAt,
			&nwu.UserEmail, &nwu.UserName,
		)
		if err != nil {
			return nil, err
		}

		notifications = append(notifications, nwu)
	}

	return notifications, rows.Err()
}

// GetAllNotificationsCount gets total count of notifications (admin method)
func (r *notificationRepository) GetAllNotificationsCount(ctx context.Context, notifType, userID string, unreadOnly bool) (int, error) {
	query := `
		SELECT COUNT(*)
		FROM notifications n
		WHERE (expires_at IS NULL OR expires_at > NOW())
	`

	args := []interface{}{}
	argCount := 1

	if notifType != "" {
		query += fmt.Sprintf(` AND n.type = $%d`, argCount)
		args = append(args, notifType)
		argCount++
	}

	if userID != "" {
		query += fmt.Sprintf(` AND n.user_id = $%d`, argCount)
		args = append(args, userID)
		argCount++
	}

	if unreadOnly {
		query += ` AND n.is_read = false`
	}

	var count int
	err := r.db.QueryRowContext(ctx, query, args...).Scan(&count)
	return count, err
}

// SearchNotifications searches notifications by query (admin method)
func (r *notificationRepository) SearchNotifications(ctx context.Context, query string, limit, offset int) ([]*NotificationWithUser, error) {
	searchQuery := `
		SELECT n.id, n.user_id, n.type, n.title, n.message, n.data,
			   n.is_read, n.read_at, n.created_at, n.expires_at,
			   u.email, COALESCE(u.first_name || ' ' || u.last_name, u.email) as user_name
		FROM notifications n
		JOIN users u ON n.user_id = u.id
		WHERE (n.expires_at IS NULL OR n.expires_at > NOW())
			AND (
				n.title ILIKE $1
				OR n.message ILIKE $1
				OR u.email ILIKE $1
			)
		ORDER BY n.created_at DESC
		LIMIT $2 OFFSET $3
	`

	searchPattern := "%" + query + "%"
	rows, err := r.db.QueryContext(ctx, searchQuery, searchPattern, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []*NotificationWithUser
	for rows.Next() {
		n := &Notification{}
		nwu := &NotificationWithUser{Notification: n}

		err := rows.Scan(
			&n.ID, &n.UserID, &n.Type, &n.Title, &n.Message, &n.Data,
			&n.IsRead, &n.ReadAt, &n.CreatedAt, &n.ExpiresAt,
			&nwu.UserEmail, &nwu.UserName,
		)
		if err != nil {
			return nil, err
		}

		notifications = append(notifications, nwu)
	}

	return notifications, rows.Err()
}

// GetNotificationStats gets notification statistics (admin method)
func (r *notificationRepository) GetNotificationStats(ctx context.Context) (*NotificationStats, error) {
	stats := &NotificationStats{
		NotificationsByType: make(map[string]int),
	}

	// Total sent today
	err := r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM notifications
		WHERE DATE(created_at) = CURRENT_DATE
	`).Scan(&stats.TotalSentToday)
	if err != nil {
		return nil, err
	}

	// Total unread
	err = r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM notifications
		WHERE is_read = false AND (expires_at IS NULL OR expires_at > NOW())
	`).Scan(&stats.TotalUnread)
	if err != nil {
		return nil, err
	}

	// Notifications by type
	rows, err := r.db.QueryContext(ctx, `
		SELECT type, COUNT(*) as count
		FROM notifications
		WHERE (expires_at IS NULL OR expires_at > NOW())
		GROUP BY type
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	maxCount := 0
	for rows.Next() {
		var notifType string
		var count int
		if err := rows.Scan(&notifType, &count); err != nil {
			return nil, err
		}
		stats.NotificationsByType[notifType] = count
		if count > maxCount {
			maxCount = count
			stats.MostActiveType = notifType
		}
	}

	// Read rate
	var totalNotifs, readNotifs int
	err = r.db.QueryRowContext(ctx, `
		SELECT
			COUNT(*) as total,
			COUNT(CASE WHEN is_read = true THEN 1 END) as read_count
		FROM notifications
		WHERE (expires_at IS NULL OR expires_at > NOW())
	`).Scan(&totalNotifs, &readNotifs)
	if err != nil {
		return nil, err
	}

	if totalNotifs > 0 {
		stats.ReadRate = float64(readNotifs) / float64(totalNotifs) * 100
	}

	// Average read time (in hours)
	err = r.db.QueryRowContext(ctx, `
		SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (read_at - created_at)) / 3600), 0)
		FROM notifications
		WHERE is_read = true AND read_at IS NOT NULL
	`).Scan(&stats.AverageReadTime)
	if err != nil {
		return nil, err
	}

	// Sent this week
	err = r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM notifications
		WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)
	`).Scan(&stats.SentThisWeek)
	if err != nil {
		return nil, err
	}

	// Growth percentage (compare this week vs last week)
	var lastWeekCount int
	err = r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM notifications
		WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE - INTERVAL '7 days')
			AND created_at < DATE_TRUNC('week', CURRENT_DATE)
	`).Scan(&lastWeekCount)
	if err != nil {
		return nil, err
	}

	if lastWeekCount > 0 {
		stats.GrowthPercentage = float64(stats.SentThisWeek-lastWeekCount) / float64(lastWeekCount) * 100
	}

	return stats, nil
}
