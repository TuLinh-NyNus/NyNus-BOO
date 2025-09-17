package repository

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/lib/pq"
)

// NewsletterRepository handles database operations for newsletter subscriptions
type NewsletterRepository struct {
	db *sql.DB
}

// NewNewsletterRepository creates a new newsletter repository instance
func NewNewsletterRepository(db *sql.DB) *NewsletterRepository {
	return &NewsletterRepository{db: db}
}

// Subscribe creates a new newsletter subscription
func (r *NewsletterRepository) Subscribe(subscription *entity.NewsletterSubscription) error {
	// Check if email already exists
	var existingID pgtype.UUID
	checkQuery := "SELECT id FROM newsletter_subscriptions WHERE email = $1"
	err := r.db.QueryRow(checkQuery, subscription.Email).Scan(&existingID)
	
	if err == nil {
		// Email exists, check status
		var status string
		statusQuery := "SELECT status FROM newsletter_subscriptions WHERE email = $1"
		r.db.QueryRow(statusQuery, subscription.Email).Scan(&status)
		
		if status == string(entity.SubscriptionStatusActive) {
			return fmt.Errorf("email already subscribed")
		}
		
		// Reactivate subscription
		updateQuery := `
			UPDATE newsletter_subscriptions 
			SET status = $2, updated_at = $3, unsubscribed_at = NULL, unsubscribe_reason = NULL
			WHERE email = $1
			RETURNING id, subscription_id, created_at, updated_at
		`
		
		var id pgtype.UUID
		var subscriptionID string
		var createdAt, updatedAt time.Time
		
		err = r.db.QueryRow(
			updateQuery,
			subscription.Email,
			string(entity.SubscriptionStatusActive),
			time.Now(),
		).Scan(&id, &subscriptionID, &createdAt, &updatedAt)
		
		if err != nil {
			return fmt.Errorf("failed to reactivate subscription: %w", err)
		}
		
		subscription.ID = uuid.UUID(id.Bytes)
		subscription.SubscriptionID = subscriptionID
		subscription.CreatedAt = createdAt
		subscription.UpdatedAt = updatedAt
		subscription.Status = entity.SubscriptionStatusActive
		
		return nil
	}
	
	// New subscription
	query := `
		INSERT INTO newsletter_subscriptions (
			email, status, subscription_id, ip_address, source, 
			tags, metadata, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9
		) RETURNING id, created_at, updated_at
	`
	
	// Generate subscription ID if not provided
	if subscription.SubscriptionID == "" {
		subscription.SubscriptionID = generateNewsletterID()
	}
	
	// Set default values
	if subscription.Status == "" {
		subscription.Status = entity.SubscriptionStatusPending
	}
	if subscription.Source == "" {
		subscription.Source = "website"
	}
	
	// Set timestamps
	now := time.Now()
	subscription.CreatedAt = now
	subscription.UpdatedAt = now
	
	// Prepare nullable fields
	var ipAddress sql.NullString
	if subscription.IPAddress != nil {
		ipAddress = sql.NullString{String: *subscription.IPAddress, Valid: true}
	}
	
	// Prepare metadata JSON
	var metadataBytes []byte
	if subscription.Metadata != nil {
		metadataBytes, _ = json.Marshal(subscription.Metadata)
	} else {
		metadataBytes = []byte("{}")
	}
	
	var id pgtype.UUID
	var createdAt, updatedAt time.Time
	
	err = r.db.QueryRow(
		query,
		subscription.Email,
		string(subscription.Status),
		subscription.SubscriptionID,
		ipAddress,
		subscription.Source,
		pq.Array(subscription.Tags),
		metadataBytes,
		subscription.CreatedAt,
		subscription.UpdatedAt,
	).Scan(&id, &createdAt, &updatedAt)
	
	if err != nil {
		return fmt.Errorf("failed to create subscription: %w", err)
	}
	
	// Update entity with database-generated values
	subscription.ID = uuid.UUID(id.Bytes)
	subscription.CreatedAt = createdAt
	subscription.UpdatedAt = updatedAt
	
	return nil
}

// Unsubscribe marks a subscription as unsubscribed
func (r *NewsletterRepository) Unsubscribe(email string, reason string) error {
	query := `
		UPDATE newsletter_subscriptions
		SET status = $2, unsubscribed_at = $3, unsubscribe_reason = $4, updated_at = $5
		WHERE email = $1 AND status != $2
	`
	
	result, err := r.db.Exec(
		query,
		email,
		string(entity.SubscriptionStatusUnsubscribed),
		time.Now(),
		reason,
		time.Now(),
	)
	
	if err != nil {
		return fmt.Errorf("failed to unsubscribe: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("subscription not found or already unsubscribed")
	}
	
	return nil
}

// GetByEmail retrieves a subscription by email
func (r *NewsletterRepository) GetByEmail(email string) (*entity.NewsletterSubscription, error) {
	query := `
		SELECT 
			id, email, status, subscription_id, confirmed_at, 
			unsubscribed_at, unsubscribe_reason, ip_address, source,
			tags, metadata, created_at, updated_at
		FROM newsletter_subscriptions
		WHERE email = $1
	`
	
	var dbModel entity.NewsletterSubscriptionDB
	err := r.db.QueryRow(query, email).Scan(
		&dbModel.ID,
		&dbModel.Email,
		&dbModel.Status,
		&dbModel.SubscriptionID,
		&dbModel.ConfirmedAt,
		&dbModel.UnsubscribedAt,
		&dbModel.UnsubscribeReason,
		&dbModel.IPAddress,
		&dbModel.Source,
		&dbModel.Tags,
		&dbModel.Metadata,
		&dbModel.CreatedAt,
		&dbModel.UpdatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("subscription not found")
		}
		return nil, fmt.Errorf("failed to get subscription: %w", err)
	}
	
	return dbModel.ToEntity(), nil
}

// List retrieves subscriptions with filters and pagination
func (r *NewsletterRepository) List(status string, search string, tags []string, offset, limit int) ([]*entity.NewsletterSubscription, int, error) {
	// Build WHERE clause
	whereClauses := []string{"1=1"}
	args := []interface{}{}
	argIndex := 1
	
	if status != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("status = $%d", argIndex))
		args = append(args, status)
		argIndex++
	}
	
	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		whereClauses = append(whereClauses, fmt.Sprintf("LOWER(email) LIKE $%d", argIndex))
		args = append(args, searchPattern)
		argIndex++
	}
	
	if len(tags) > 0 {
		whereClauses = append(whereClauses, fmt.Sprintf("tags && $%d", argIndex))
		args = append(args, pq.Array(tags))
		argIndex++
	}
	
	whereClause := strings.Join(whereClauses, " AND ")
	
	// Count total records
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM newsletter_subscriptions WHERE %s", whereClause)
	var totalCount int
	err := r.db.QueryRow(countQuery, args...).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count subscriptions: %w", err)
	}
	
	// Get paginated records
	query := fmt.Sprintf(`
		SELECT 
			id, email, status, subscription_id, confirmed_at,
			unsubscribed_at, unsubscribe_reason, ip_address, source,
			tags, metadata, created_at, updated_at
		FROM newsletter_subscriptions
		WHERE %s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argIndex, argIndex+1)
	
	args = append(args, limit, offset)
	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list subscriptions: %w", err)
	}
	defer rows.Close()
	
	subscriptions := []*entity.NewsletterSubscription{}
	for rows.Next() {
		var dbModel entity.NewsletterSubscriptionDB
		err := rows.Scan(
			&dbModel.ID,
			&dbModel.Email,
			&dbModel.Status,
			&dbModel.SubscriptionID,
			&dbModel.ConfirmedAt,
			&dbModel.UnsubscribedAt,
			&dbModel.UnsubscribeReason,
			&dbModel.IPAddress,
			&dbModel.Source,
			&dbModel.Tags,
			&dbModel.Metadata,
			&dbModel.CreatedAt,
			&dbModel.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan subscription: %w", err)
		}
		subscriptions = append(subscriptions, dbModel.ToEntity())
	}
	
	return subscriptions, totalCount, nil
}

// UpdateTags updates the tags for a subscription
func (r *NewsletterRepository) UpdateTags(email string, tags []string) error {
	query := `
		UPDATE newsletter_subscriptions
		SET tags = $2, updated_at = $3
		WHERE email = $1
	`
	
	result, err := r.db.Exec(query, email, pq.Array(tags), time.Now())
	if err != nil {
		return fmt.Errorf("failed to update tags: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("subscription not found")
	}
	
	return nil
}

// Delete removes a subscription completely (admin only)
func (r *NewsletterRepository) Delete(id uuid.UUID) error {
	query := "DELETE FROM newsletter_subscriptions WHERE id = $1"
	
	result, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete subscription: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("subscription not found")
	}
	
	return nil
}

// GetStats returns subscription statistics
func (r *NewsletterRepository) GetStats() (map[string]int, error) {
	stats := make(map[string]int)
	
	// Count by status
	statusQuery := `
		SELECT status, COUNT(*) 
		FROM newsletter_subscriptions 
		GROUP BY status
	`
	rows, err := r.db.Query(statusQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to get status stats: %w", err)
	}
	defer rows.Close()
	
	for rows.Next() {
		var status string
		var count int
		if err := rows.Scan(&status, &count); err == nil {
			stats[status] = count
		}
	}
	
	// Count new this week
	weekQuery := `
		SELECT COUNT(*) 
		FROM newsletter_subscriptions 
		WHERE created_at >= $1
	`
	var weekCount int
	weekAgo := time.Now().AddDate(0, 0, -7)
	r.db.QueryRow(weekQuery, weekAgo).Scan(&weekCount)
	stats["new_this_week"] = weekCount
	
	// Count new this month
	monthQuery := `
		SELECT COUNT(*) 
		FROM newsletter_subscriptions 
		WHERE created_at >= $1
	`
	var monthCount int
	monthAgo := time.Now().AddDate(0, -1, 0)
	r.db.QueryRow(monthQuery, monthAgo).Scan(&monthCount)
	stats["new_this_month"] = monthCount
	
	return stats, nil
}

// ConfirmSubscription confirms a pending subscription
func (r *NewsletterRepository) ConfirmSubscription(email string) error {
	query := `
		UPDATE newsletter_subscriptions
		SET status = $2, confirmed_at = $3, updated_at = $4
		WHERE email = $1 AND status = $5
	`
	
	result, err := r.db.Exec(
		query,
		email,
		string(entity.SubscriptionStatusActive),
		time.Now(),
		time.Now(),
		string(entity.SubscriptionStatusPending),
	)
	
	if err != nil {
		return fmt.Errorf("failed to confirm subscription: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("subscription not found or already confirmed")
	}
	
	return nil
}

// Helper function to generate subscription ID
func generateNewsletterID() string {
	timestamp := time.Now().Unix()
	randomPart := uuid.New().String()[:8]
	return fmt.Sprintf("newsletter-%d-%s", timestamp, randomPart)
}