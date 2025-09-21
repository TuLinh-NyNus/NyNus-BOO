package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"
	"github.com/google/uuid"
	"github.com/jackc/pgtype"
)

// QuestionImageRepository implements the QuestionImageRepository interface
type QuestionImageRepository struct {
	db *sql.DB
}

// NewQuestionImageRepository creates a new question image repository
func NewQuestionImageRepository(db *sql.DB) interfaces.QuestionImageRepository {
	return &QuestionImageRepository{db: db}
}

// Create creates a new question image record
func (r *QuestionImageRepository) Create(ctx context.Context, image *entity.QuestionImage) error {
	// Generate ID if not provided
	if image.ID.Status != pgtype.Present || image.ID.String == "" {
		image.ID = util.StringToPgText(uuid.New().String())
	}

	// Set timestamps
	now := time.Now()
	image.CreatedAt = pgtype.Timestamptz{Time: now, Status: pgtype.Present}
	image.UpdatedAt = pgtype.Timestamptz{Time: now, Status: pgtype.Present}

	// Set default status if not provided
	if image.Status.Status != pgtype.Present {
		image.Status = util.StringToPgText(string(entity.ImageStatusPending))
	}

	query := `
		INSERT INTO question_image (
			id, question_id, image_type, image_path, 
			drive_url, drive_file_id, status, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`

	_, err := r.db.ExecContext(ctx, query,
		image.ID, image.QuestionID, image.ImageType, image.ImagePath,
		image.DriveURL, image.DriveFileID, image.Status,
		image.CreatedAt, image.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create question image: %w", err)
	}

	return nil
}

// GetByID retrieves a question image by ID
func (r *QuestionImageRepository) GetByID(ctx context.Context, id string) (*entity.QuestionImage, error) {
	query := `
		SELECT id, question_id, image_type, image_path, 
		       drive_url, drive_file_id, status, created_at, updated_at
		FROM question_image
		WHERE id = $1`

	var image entity.QuestionImage
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&image.ID, &image.QuestionID, &image.ImageType, &image.ImagePath,
		&image.DriveURL, &image.DriveFileID, &image.Status,
		&image.CreatedAt, &image.UpdatedAt)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get question image by ID: %w", err)
	}

	return &image, nil
}

// GetByQuestionID retrieves all images for a question
func (r *QuestionImageRepository) GetByQuestionID(ctx context.Context, questionID string) ([]*entity.QuestionImage, error) {
	query := `
		SELECT id, question_id, image_type, image_path, 
		       drive_url, drive_file_id, status, created_at, updated_at
		FROM question_image
		WHERE question_id = $1
		ORDER BY created_at`

	rows, err := r.db.QueryContext(ctx, query, questionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get question images: %w", err)
	}
	defer rows.Close()

	var images []*entity.QuestionImage
	for rows.Next() {
		var image entity.QuestionImage
		err := rows.Scan(
			&image.ID, &image.QuestionID, &image.ImageType, &image.ImagePath,
			&image.DriveURL, &image.DriveFileID, &image.Status,
			&image.CreatedAt, &image.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan question image: %w", err)
		}
		images = append(images, &image)
	}

	return images, nil
}

// Update updates an existing question image
func (r *QuestionImageRepository) Update(ctx context.Context, image *entity.QuestionImage) error {
	// Update timestamp
	image.UpdatedAt = pgtype.Timestamptz{Time: time.Now(), Status: pgtype.Present}

	query := `
		UPDATE question_image
		SET image_type = $2, image_path = $3, drive_url = $4,
		    drive_file_id = $5, status = $6, updated_at = $7
		WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query,
		image.ID, image.ImageType, image.ImagePath,
		image.DriveURL, image.DriveFileID, image.Status, image.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to update question image: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("question image not found")
	}

	return nil
}

// Delete deletes a question image by ID
func (r *QuestionImageRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM question_image WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete question image: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("question image not found")
	}

	return nil
}

// CreateBatch creates multiple question images in a transaction
func (r *QuestionImageRepository) CreateBatch(ctx context.Context, images []*entity.QuestionImage) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	stmt, err := tx.PrepareContext(ctx, `
		INSERT INTO question_image (
			id, question_id, image_type, image_path,
			drive_url, drive_file_id, status, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	now := time.Now()
	for _, image := range images {
		// Generate ID if not provided
		if image.ID.Status != pgtype.Present || image.ID.String == "" {
			image.ID = util.StringToPgText(uuid.New().String())
		}

		// Set timestamps
		image.CreatedAt = pgtype.Timestamptz{Time: now, Status: pgtype.Present}
		image.UpdatedAt = pgtype.Timestamptz{Time: now, Status: pgtype.Present}

		// Set default status
		if image.Status.Status != pgtype.Present {
			image.Status = util.StringToPgText(string(entity.ImageStatusPending))
		}

		_, err := stmt.ExecContext(ctx,
			image.ID, image.QuestionID, image.ImageType, image.ImagePath,
			image.DriveURL, image.DriveFileID, image.Status,
			image.CreatedAt, image.UpdatedAt)
		if err != nil {
			return fmt.Errorf("failed to insert image: %w", err)
		}
	}

	return tx.Commit()
}

// GetByQuestionIDs retrieves images for multiple questions
func (r *QuestionImageRepository) GetByQuestionIDs(ctx context.Context, questionIDs []string) (map[string][]*entity.QuestionImage, error) {
	if len(questionIDs) == 0 {
		return make(map[string][]*entity.QuestionImage), nil
	}

	// Build placeholders
	placeholders := make([]string, len(questionIDs))
	args := make([]interface{}, len(questionIDs))
	for i, id := range questionIDs {
		placeholders[i] = fmt.Sprintf("$%d", i+1)
		args[i] = id
	}

	query := fmt.Sprintf(`
		SELECT id, question_id, image_type, image_path,
		       drive_url, drive_file_id, status, created_at, updated_at
		FROM question_image
		WHERE question_id IN (%s)
		ORDER BY question_id, created_at`, strings.Join(placeholders, ","))

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get question images: %w", err)
	}
	defer rows.Close()

	result := make(map[string][]*entity.QuestionImage)
	for rows.Next() {
		var image entity.QuestionImage
		err := rows.Scan(
			&image.ID, &image.QuestionID, &image.ImageType, &image.ImagePath,
			&image.DriveURL, &image.DriveFileID, &image.Status,
			&image.CreatedAt, &image.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan question image: %w", err)
		}

		questionID := util.PgTextToString(image.QuestionID)
		result[questionID] = append(result[questionID], &image)
	}

	return result, nil
}

// DeleteByQuestionID deletes all images for a question
func (r *QuestionImageRepository) DeleteByQuestionID(ctx context.Context, questionID string) error {
	query := `DELETE FROM question_image WHERE question_id = $1`

	_, err := r.db.ExecContext(ctx, query, questionID)
	if err != nil {
		return fmt.Errorf("failed to delete question images: %w", err)
	}

	return nil
}

// UpdateStatus updates the status of a question image
func (r *QuestionImageRepository) UpdateStatus(ctx context.Context, id string, status string) error {
	query := `
		UPDATE question_image
		SET status = $2, updated_at = $3
		WHERE id = $1`

	now := time.Now()
	result, err := r.db.ExecContext(ctx, query, id, status, now)
	if err != nil {
		return fmt.Errorf("failed to update status: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("question image not found")
	}

	return nil
}

// GetByStatus retrieves images by status
func (r *QuestionImageRepository) GetByStatus(ctx context.Context, status string, limit int) ([]*entity.QuestionImage, error) {
	query := `
		SELECT id, question_id, image_type, image_path,
		       drive_url, drive_file_id, status, created_at, updated_at
		FROM question_image
		WHERE status = $1
		ORDER BY created_at
		LIMIT $2`

	rows, err := r.db.QueryContext(ctx, query, status, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get images by status: %w", err)
	}
	defer rows.Close()

	var images []*entity.QuestionImage
	for rows.Next() {
		var image entity.QuestionImage
		err := rows.Scan(
			&image.ID, &image.QuestionID, &image.ImageType, &image.ImagePath,
			&image.DriveURL, &image.DriveFileID, &image.Status,
			&image.CreatedAt, &image.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan question image: %w", err)
		}
		images = append(images, &image)
	}

	return images, nil
}

// GetPendingImages retrieves pending images
func (r *QuestionImageRepository) GetPendingImages(ctx context.Context, limit int) ([]*entity.QuestionImage, error) {
	return r.GetByStatus(ctx, string(entity.ImageStatusPending), limit)
}

// GetFailedImages retrieves failed images
func (r *QuestionImageRepository) GetFailedImages(ctx context.Context, limit int) ([]*entity.QuestionImage, error) {
	return r.GetByStatus(ctx, string(entity.ImageStatusFailed), limit)
}

// UpdateDriveInfo updates Google Drive information
func (r *QuestionImageRepository) UpdateDriveInfo(ctx context.Context, id string, driveURL string, driveFileID string) error {
	query := `
		UPDATE question_image
		SET drive_url = $2, drive_file_id = $3, 
		    status = $4, updated_at = $5
		WHERE id = $1`

	now := time.Now()
	result, err := r.db.ExecContext(ctx, query,
		id, driveURL, driveFileID,
		string(entity.ImageStatusUploaded), now)
	if err != nil {
		return fmt.Errorf("failed to update drive info: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("question image not found")
	}

	return nil
}

// GetImagesWithoutDrive retrieves images that haven't been uploaded to Drive
func (r *QuestionImageRepository) GetImagesWithoutDrive(ctx context.Context, limit int) ([]*entity.QuestionImage, error) {
	query := `
		SELECT id, question_id, image_type, image_path,
		       drive_url, drive_file_id, status, created_at, updated_at
		FROM question_image
		WHERE (drive_url IS NULL OR drive_url = '')
		  AND status != $1
		ORDER BY created_at
		LIMIT $2`

	rows, err := r.db.QueryContext(ctx, query, string(entity.ImageStatusFailed), limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get images without drive: %w", err)
	}
	defer rows.Close()

	var images []*entity.QuestionImage
	for rows.Next() {
		var image entity.QuestionImage
		err := rows.Scan(
			&image.ID, &image.QuestionID, &image.ImageType, &image.ImagePath,
			&image.DriveURL, &image.DriveFileID, &image.Status,
			&image.CreatedAt, &image.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan question image: %w", err)
		}
		images = append(images, &image)
	}

	return images, nil
}

// CountByStatus counts images by status
func (r *QuestionImageRepository) CountByStatus(ctx context.Context) (map[string]int, error) {
	query := `
		SELECT status, COUNT(*) as count
		FROM question_image
		GROUP BY status`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to count by status: %w", err)
	}
	defer rows.Close()

	result := make(map[string]int)
	for rows.Next() {
		var status pgtype.Text
		var count int
		err := rows.Scan(&status, &count)
		if err != nil {
			return nil, fmt.Errorf("failed to scan count: %w", err)
		}
		result[util.PgTextToString(status)] = count
	}

	return result, nil
}

// CountByQuestionID counts images for a specific question
func (r *QuestionImageRepository) CountByQuestionID(ctx context.Context, questionID string) (int, error) {
	query := `SELECT COUNT(*) FROM question_image WHERE question_id = $1`

	var count int
	err := r.db.QueryRowContext(ctx, query, questionID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count images: %w", err)
	}

	return count, nil
}
