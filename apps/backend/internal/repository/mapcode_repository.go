package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"github.com/google/uuid"
	"github.com/jackc/pgtype"
)

// MapCodeRepository handles MapCode version operations
type MapCodeRepository struct {
	db *sql.DB
}

// NewMapCodeRepository creates a new MapCodeRepository
func NewMapCodeRepository(db *sql.DB) *MapCodeRepository {
	return &MapCodeRepository{db: db}
}

// CreateVersion creates a new MapCode version
func (r *MapCodeRepository) CreateVersion(ctx context.Context, version *entity.MapCodeVersion) error {
	query := `
		INSERT INTO mapcode_versions (
			id, version, name, description, file_path, is_active, created_by,
			created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9
		)
	`

	// Generate ID if not provided
	if version.ID.Status != pgtype.Present || version.ID.String == "" {
		version.ID.Set(uuid.New().String())
	}

	// Set timestamps
	now := time.Now()
	version.CreatedAt.Set(now)
	version.UpdatedAt.Set(now)

	_, err := r.db.ExecContext(ctx, query,
		version.ID.String,
		version.Version.String,
		version.Name.String,
		version.Description.String,
		version.FilePath.String,
		version.IsActive.Bool,
		version.CreatedBy.String,
		version.CreatedAt.Time,
		version.UpdatedAt.Time,
	)

	return err
}

// GetVersionByID retrieves a version by ID
func (r *MapCodeRepository) GetVersionByID(ctx context.Context, id string) (*entity.MapCodeVersion, error) {
	query := `
		SELECT 
			id, version, name, description, file_path, is_active, created_by,
			created_at, updated_at
		FROM mapcode_versions
		WHERE id = $1
	`

	var version entity.MapCodeVersion
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&version.ID.String,
		&version.Version.String,
		&version.Name.String,
		&version.Description.String,
		&version.FilePath.String,
		&version.IsActive.Bool,
		&version.CreatedBy.String,
		&version.CreatedAt.Time,
		&version.UpdatedAt.Time,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("mapcode version not found")
		}
		return nil, err
	}

	// Set status for all fields
	version.ID.Status = pgtype.Present
	version.Version.Status = pgtype.Present
	version.Name.Status = pgtype.Present
	version.Description.Status = pgtype.Present
	version.FilePath.Status = pgtype.Present
	version.IsActive.Status = pgtype.Present
	version.CreatedBy.Status = pgtype.Present
	version.CreatedAt.Status = pgtype.Present
	version.UpdatedAt.Status = pgtype.Present

	return &version, nil
}

// GetActiveVersion retrieves the currently active version
func (r *MapCodeRepository) GetActiveVersion(ctx context.Context) (*entity.MapCodeVersion, error) {
	query := `
		SELECT 
			id, version, name, description, file_path, is_active, created_by,
			created_at, updated_at
		FROM mapcode_versions
		WHERE is_active = true
		LIMIT 1
	`

	var version entity.MapCodeVersion
	err := r.db.QueryRowContext(ctx, query).Scan(
		&version.ID.String,
		&version.Version.String,
		&version.Name.String,
		&version.Description.String,
		&version.FilePath.String,
		&version.IsActive.Bool,
		&version.CreatedBy.String,
		&version.CreatedAt.Time,
		&version.UpdatedAt.Time,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("no active mapcode version found")
		}
		return nil, err
	}

	// Set status for all fields
	version.ID.Status = pgtype.Present
	version.Version.Status = pgtype.Present
	version.Name.Status = pgtype.Present
	version.Description.Status = pgtype.Present
	version.FilePath.Status = pgtype.Present
	version.IsActive.Status = pgtype.Present
	version.CreatedBy.Status = pgtype.Present
	version.CreatedAt.Status = pgtype.Present
	version.UpdatedAt.Status = pgtype.Present

	return &version, nil
}

// SetActiveVersion sets a version as active and deactivates others
func (r *MapCodeRepository) SetActiveVersion(ctx context.Context, versionID string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Deactivate all versions
	_, err = tx.ExecContext(ctx, "UPDATE mapcode_versions SET is_active = false, updated_at = $1", time.Now())
	if err != nil {
		return err
	}

	// Activate the specified version
	_, err = tx.ExecContext(ctx, "UPDATE mapcode_versions SET is_active = true, updated_at = $1 WHERE id = $2", time.Now(), versionID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

// GetAllVersions retrieves all versions with pagination
func (r *MapCodeRepository) GetAllVersions(ctx context.Context, offset, limit int) ([]*entity.MapCodeVersion, error) {
	query := `
		SELECT 
			id, version, name, description, file_path, is_active, created_by,
			created_at, updated_at
		FROM mapcode_versions
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var versions []*entity.MapCodeVersion
	for rows.Next() {
		var version entity.MapCodeVersion
		err := rows.Scan(
			&version.ID.String,
			&version.Version.String,
			&version.Name.String,
			&version.Description.String,
			&version.FilePath.String,
			&version.IsActive.Bool,
			&version.CreatedBy.String,
			&version.CreatedAt.Time,
			&version.UpdatedAt.Time,
		)
		if err != nil {
			return nil, err
		}

		// Set status for all fields
		version.ID.Status = pgtype.Present
		version.Version.Status = pgtype.Present
		version.Name.Status = pgtype.Present
		version.Description.Status = pgtype.Present
		version.FilePath.Status = pgtype.Present
		version.IsActive.Status = pgtype.Present
		version.CreatedBy.Status = pgtype.Present
		version.CreatedAt.Status = pgtype.Present
		version.UpdatedAt.Status = pgtype.Present

		versions = append(versions, &version)
	}

	return versions, rows.Err()
}

// CountVersions returns the total number of versions
func (r *MapCodeRepository) CountVersions(ctx context.Context) (int, error) {
	query := `SELECT COUNT(*) FROM mapcode_versions`
	var count int
	err := r.db.QueryRowContext(ctx, query).Scan(&count)
	return count, err
}

// DeleteVersion deletes a version (only if not active)
func (r *MapCodeRepository) DeleteVersion(ctx context.Context, versionID string) error {
	query := `DELETE FROM mapcode_versions WHERE id = $1 AND is_active = false`
	result, err := r.db.ExecContext(ctx, query, versionID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("cannot delete active version or version not found")
	}

	return nil
}

// GetStorageInfo returns storage information
func (r *MapCodeRepository) GetStorageInfo(ctx context.Context) (*entity.MapCodeStorageInfo, error) {
	count, err := r.CountVersions(ctx)
	if err != nil {
		return nil, err
	}

	return entity.NewMapCodeStorageInfo(count), nil
}
