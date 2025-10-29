package repository

import (
	"context"
	"database/sql"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/util"
	"github.com/google/uuid"
	"github.com/jackc/pgtype"
)

// ImageUploadErrorRepository handles image upload error operations
type ImageUploadErrorRepository struct {
	db *sql.DB
}

// NewImageUploadErrorRepository creates a new image upload error repository
func NewImageUploadErrorRepository(db *sql.DB) *ImageUploadErrorRepository {
	return &ImageUploadErrorRepository{db: db}
}

// SaveImageUploadError saves an image upload error
func (r *ImageUploadErrorRepository) SaveImageUploadError(ctx context.Context, error *entity.ImageUploadError) error {
	query := `
		INSERT INTO image_upload_errors (
			id, image_id, type, severity, message, suggestion, context,
			local_path, remote_path, attempt_count, last_attempt, is_retryable,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
	`

	_, err := r.db.ExecContext(ctx, query,
		error.ID, error.ImageID, error.Type, error.Severity, error.Message,
		error.Suggestion, error.Context, error.LocalPath, error.RemotePath,
		error.AttemptCount, error.LastAttempt, error.IsRetryable,
		error.CreatedAt, error.UpdatedAt,
	)

	return err
}

// GetImageUploadErrors retrieves upload errors for an image
func (r *ImageUploadErrorRepository) GetImageUploadErrors(ctx context.Context, imageID string) ([]entity.ImageUploadError, error) {
	query := `
		SELECT id, image_id, type, severity, message, suggestion, context,
			   local_path, remote_path, attempt_count, last_attempt, is_retryable,
			   created_at, updated_at
		FROM image_upload_errors
		WHERE image_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, imageID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var errors []entity.ImageUploadError
	for rows.Next() {
		var error entity.ImageUploadError
		err := rows.Scan(
			&error.ID, &error.ImageID, &error.Type, &error.Severity, &error.Message,
			&error.Suggestion, &error.Context, &error.LocalPath, &error.RemotePath,
			&error.AttemptCount, &error.LastAttempt, &error.IsRetryable,
			&error.CreatedAt, &error.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		errors = append(errors, error)
	}

	return errors, rows.Err()
}

// GetLastImageUploadError retrieves the most recent upload error for an image
func (r *ImageUploadErrorRepository) GetLastImageUploadError(ctx context.Context, imageID string) (*entity.ImageUploadError, error) {
	query := `
		SELECT id, image_id, type, severity, message, suggestion, context,
			   local_path, remote_path, attempt_count, last_attempt, is_retryable,
			   created_at, updated_at
		FROM image_upload_errors
		WHERE image_id = $1
		ORDER BY created_at DESC
		LIMIT 1
	`

	var error entity.ImageUploadError
	err := r.db.QueryRowContext(ctx, query, imageID).Scan(
		&error.ID, &error.ImageID, &error.Type, &error.Severity, &error.Message,
		&error.Suggestion, &error.Context, &error.LocalPath, &error.RemotePath,
		&error.AttemptCount, &error.LastAttempt, &error.IsRetryable,
		&error.CreatedAt, &error.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &error, nil
}

// ClearImageUploadErrors clears all upload errors for an image
func (r *ImageUploadErrorRepository) ClearImageUploadErrors(ctx context.Context, imageID string) error {
	query := `DELETE FROM image_upload_errors WHERE image_id = $1`
	_, err := r.db.ExecContext(ctx, query, imageID)
	return err
}

// MarkErrorAsNonRetryable marks an error as non-retryable
func (r *ImageUploadErrorRepository) MarkErrorAsNonRetryable(ctx context.Context, errorID string, reason string) error {
	query := `
		UPDATE image_upload_errors 
		SET is_retryable = $1, suggestion = $2, updated_at = $3
		WHERE id = $4
	`

	now := pgtype.Timestamptz{Time: time.Now(), Status: pgtype.Present}
	isRetryable := pgtype.Bool{Bool: false, Status: pgtype.Present}
	suggestion := util.StringToPgText(reason)

	_, err := r.db.ExecContext(ctx, query, isRetryable, suggestion, now, errorID)
	return err
}

// GetImageUploadHistory retrieves upload history for an image
func (r *ImageUploadErrorRepository) GetImageUploadHistory(ctx context.Context, imageID string) (*entity.ImageUploadHistory, error) {
	// This is a placeholder implementation
	// In a real system, you would have a separate image_upload_history table
	errors, err := r.GetImageUploadErrors(ctx, imageID)
	if err != nil {
		return nil, err
	}

	if len(errors) == 0 {
		return nil, nil
	}

	// Create a simple history from the errors
	history := &entity.ImageUploadHistory{
		ID:           util.StringToPgText(uuid.New().String()),
		ImageID:      util.StringToPgText(imageID),
		AttemptCount: util.Int32ToPgInt4(int32(len(errors))),
		LastAttempt:  errors[0].LastAttempt, // Most recent error
		Status:       util.StringToPgText("FAILED"),
		LastError:    errors[0].Message,
		CreatedAt:    errors[len(errors)-1].CreatedAt, // First error
		UpdatedAt:    errors[0].UpdatedAt,             // Most recent error
	}

	return history, nil
}

// GetRetryableImageErrors retrieves retryable image upload errors
func (r *ImageUploadErrorRepository) GetRetryableImageErrors(ctx context.Context, limit int) ([]entity.ImageUploadError, error) {
	query := `
		SELECT id, image_id, type, severity, message, suggestion, context,
			   local_path, remote_path, attempt_count, last_attempt, is_retryable,
			   created_at, updated_at
		FROM image_upload_errors
		WHERE is_retryable = true
		ORDER BY created_at ASC
		LIMIT $1
	`

	rows, err := r.db.QueryContext(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var errors []entity.ImageUploadError
	for rows.Next() {
		var error entity.ImageUploadError
		err := rows.Scan(
			&error.ID, &error.ImageID, &error.Type, &error.Severity, &error.Message,
			&error.Suggestion, &error.Context, &error.LocalPath, &error.RemotePath,
			&error.AttemptCount, &error.LastAttempt, &error.IsRetryable,
			&error.CreatedAt, &error.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		errors = append(errors, error)
	}

	return errors, rows.Err()
}

// UpdateAttemptCount updates the attempt count for an error
func (r *ImageUploadErrorRepository) UpdateAttemptCount(ctx context.Context, errorID string, attemptCount int32) error {
	query := `
		UPDATE image_upload_errors
		SET attempt_count = $1, last_attempt = $2, updated_at = $3
		WHERE id = $4
	`

	now := pgtype.Timestamptz{Time: time.Now(), Status: pgtype.Present}
	count := util.Int32ToPgInt4(attemptCount)

	_, err := r.db.ExecContext(ctx, query, count, now, now, errorID)
	return err
}

// SaveImageUploadHistory saves upload history (placeholder implementation)
func (r *ImageUploadErrorRepository) SaveImageUploadHistory(ctx context.Context, history *entity.ImageUploadHistory) error {
	// This is a placeholder - in a real system you would have a separate table
	// For now, we'll just return nil as the history is derived from errors
	return nil
}

// GetImageUploadStatistics retrieves upload statistics
func (r *ImageUploadErrorRepository) GetImageUploadStatistics(ctx context.Context) (map[string]interface{}, error) {
	query := `
		SELECT
			COUNT(*) as total_errors,
			COUNT(CASE WHEN is_retryable = true THEN 1 END) as retryable_errors,
			COUNT(CASE WHEN severity = 'ERROR' THEN 1 END) as error_count,
			COUNT(CASE WHEN severity = 'WARNING' THEN 1 END) as warning_count
		FROM image_upload_errors
	`

	var totalErrors, retryableErrors, errorCount, warningCount int
	err := r.db.QueryRowContext(ctx, query).Scan(&totalErrors, &retryableErrors, &errorCount, &warningCount)
	if err != nil {
		return nil, err
	}

	stats := map[string]interface{}{
		"total_errors":     totalErrors,
		"retryable_errors": retryableErrors,
		"error_count":      errorCount,
		"warning_count":    warningCount,
	}

	return stats, nil
}
