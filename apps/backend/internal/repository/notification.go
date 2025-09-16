package repository

import (
	"context"
	"database/sql"
	"encoding/json"
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