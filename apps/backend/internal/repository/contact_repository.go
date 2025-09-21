package repository

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

// ContactRepository handles database operations for contact submissions
type ContactRepository struct {
	db *sql.DB
}

// NewContactRepository creates a new contact repository instance
func NewContactRepository(db *sql.DB) *ContactRepository {
	return &ContactRepository{db: db}
}

// Create saves a new contact submission to the database
func (r *ContactRepository) Create(contact *entity.ContactSubmission) error {
	query := `
		INSERT INTO contact_submissions (
			name, email, subject, message, phone, status, 
			submission_id, ip_address, user_agent, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
		) RETURNING id, created_at, updated_at
	`

	// Generate submission ID if not provided
	if contact.SubmissionID == "" {
		contact.SubmissionID = generateSubmissionID()
	}

	// Set default status
	if contact.Status == "" {
		contact.Status = entity.ContactStatusPending
	}

	// Set timestamps
	now := time.Now()
	contact.CreatedAt = now
	contact.UpdatedAt = now

	// Prepare nullable fields
	var phone, ipAddress, userAgent sql.NullString
	if contact.Phone != nil {
		phone = sql.NullString{String: *contact.Phone, Valid: true}
	}
	if contact.IPAddress != nil {
		ipAddress = sql.NullString{String: *contact.IPAddress, Valid: true}
	}
	if contact.UserAgent != nil {
		userAgent = sql.NullString{String: *contact.UserAgent, Valid: true}
	}

	var id pgtype.UUID
	var createdAt, updatedAt time.Time
	err := r.db.QueryRow(
		query,
		contact.Name,
		contact.Email,
		contact.Subject,
		contact.Message,
		phone,
		string(contact.Status),
		contact.SubmissionID,
		ipAddress,
		userAgent,
		contact.CreatedAt,
		contact.UpdatedAt,
	).Scan(&id, &createdAt, &updatedAt)

	if err != nil {
		return fmt.Errorf("failed to create contact submission: %w", err)
	}

	// Update entity with database-generated values
	contact.ID = uuid.UUID(id.Bytes)
	contact.CreatedAt = createdAt
	contact.UpdatedAt = updatedAt

	return nil
}

// GetByID retrieves a contact submission by ID
func (r *ContactRepository) GetByID(id uuid.UUID) (*entity.ContactSubmission, error) {
	query := `
		SELECT 
			id, name, email, subject, message, phone, status,
			submission_id, ip_address, user_agent, created_at, updated_at,
			replied_at, reply_message, replied_by
		FROM contact_submissions
		WHERE id = $1
	`

	var dbModel entity.ContactSubmissionDB
	err := r.db.QueryRow(query, id).Scan(
		&dbModel.ID,
		&dbModel.Name,
		&dbModel.Email,
		&dbModel.Subject,
		&dbModel.Message,
		&dbModel.Phone,
		&dbModel.Status,
		&dbModel.SubmissionID,
		&dbModel.IPAddress,
		&dbModel.UserAgent,
		&dbModel.CreatedAt,
		&dbModel.UpdatedAt,
		&dbModel.RepliedAt,
		&dbModel.ReplyMessage,
		&dbModel.RepliedBy,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("contact submission not found")
		}
		return nil, fmt.Errorf("failed to get contact submission: %w", err)
	}

	return dbModel.ToEntity(), nil
}

// List retrieves contact submissions with filters and pagination
func (r *ContactRepository) List(status string, search string, offset, limit int) ([]*entity.ContactSubmission, int, error) {
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
		whereClauses = append(whereClauses, fmt.Sprintf(
			"(LOWER(name) LIKE $%d OR LOWER(email) LIKE $%d OR LOWER(subject) LIKE $%d)",
			argIndex, argIndex+1, argIndex+2,
		))
		args = append(args, searchPattern, searchPattern, searchPattern)
		argIndex += 3
	}

	whereClause := strings.Join(whereClauses, " AND ")

	// Count total records
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM contact_submissions WHERE %s", whereClause)
	var totalCount int
	err := r.db.QueryRow(countQuery, args...).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count contact submissions: %w", err)
	}

	// Get paginated records
	query := fmt.Sprintf(`
		SELECT 
			id, name, email, subject, message, phone, status,
			submission_id, ip_address, user_agent, created_at, updated_at,
			replied_at, reply_message, replied_by
		FROM contact_submissions
		WHERE %s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argIndex, argIndex+1)

	args = append(args, limit, offset)
	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list contact submissions: %w", err)
	}
	defer rows.Close()

	submissions := []*entity.ContactSubmission{}
	for rows.Next() {
		var dbModel entity.ContactSubmissionDB
		err := rows.Scan(
			&dbModel.ID,
			&dbModel.Name,
			&dbModel.Email,
			&dbModel.Subject,
			&dbModel.Message,
			&dbModel.Phone,
			&dbModel.Status,
			&dbModel.SubmissionID,
			&dbModel.IPAddress,
			&dbModel.UserAgent,
			&dbModel.CreatedAt,
			&dbModel.UpdatedAt,
			&dbModel.RepliedAt,
			&dbModel.ReplyMessage,
			&dbModel.RepliedBy,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan contact submission: %w", err)
		}
		submissions = append(submissions, dbModel.ToEntity())
	}

	return submissions, totalCount, nil
}

// UpdateStatus updates the status of a contact submission
func (r *ContactRepository) UpdateStatus(id uuid.UUID, status entity.ContactStatus) error {
	query := `
		UPDATE contact_submissions
		SET status = $2, updated_at = $3
		WHERE id = $1
	`

	result, err := r.db.Exec(query, id, string(status), time.Now())
	if err != nil {
		return fmt.Errorf("failed to update contact status: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("contact submission not found")
	}

	return nil
}

// Delete removes a contact submission from the database
func (r *ContactRepository) Delete(id uuid.UUID) error {
	query := "DELETE FROM contact_submissions WHERE id = $1"

	result, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete contact submission: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("contact submission not found")
	}

	return nil
}

// CountUnread returns the count of unread (pending) submissions
func (r *ContactRepository) CountUnread() (int, error) {
	query := "SELECT COUNT(*) FROM contact_submissions WHERE status = $1"

	var count int
	err := r.db.QueryRow(query, string(entity.ContactStatusPending)).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count unread submissions: %w", err)
	}

	return count, nil
}

// Helper function to generate submission ID
func generateSubmissionID() string {
	timestamp := time.Now().Unix()
	randomPart := uuid.New().String()[:8]
	return fmt.Sprintf("contact-%d-%s", timestamp, randomPart)
}
