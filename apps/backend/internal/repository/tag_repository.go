package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"github.com/google/uuid"
)

// TagRepository handles tag-related database operations
type TagRepository interface {
	CreateTag(ctx context.Context, tag *entity.Tag) (*entity.Tag, error)
	GetTag(ctx context.Context, tagID string) (*entity.Tag, error)
	ListTags(ctx context.Context, filters TagListFilters) ([]*entity.Tag, error)
	UpdateTag(ctx context.Context, tag *entity.Tag) error
	DeleteTag(ctx context.Context, tagID string) error
	GetPopularTags(ctx context.Context, limit int) ([]*entity.Tag, error)
	IncrementUsageCount(ctx context.Context, tagID string) error
}

// TagListFilters represents filters for listing tags
type TagListFilters struct {
	Search     string
	IsTrending *bool
	Limit      int
	Offset     int
}

// tagRepository implements TagRepository
type tagRepository struct {
	db *sql.DB
}

// NewTagRepository creates a new tag repository
func NewTagRepository(db *sql.DB) TagRepository {
	return &tagRepository{db: db}
}

// CreateTag creates a new tag
func (r *tagRepository) CreateTag(ctx context.Context, tag *entity.Tag) (*entity.Tag, error) {
	tag.ID = uuid.New().String()
	tag.CreatedAt = time.Now()
	tag.UpdatedAt = time.Now()

	query := `
		INSERT INTO tags (id, name, description, color, is_trending, usage_count, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, name, description, color, is_trending, usage_count, created_at, updated_at
	`

	err := r.db.QueryRowContext(
		ctx,
		query,
		tag.ID,
		tag.Name,
		tag.Description,
		tag.Color,
		tag.IsTrending,
		tag.UsageCount,
		tag.CreatedAt,
		tag.UpdatedAt,
	).Scan(
		&tag.ID,
		&tag.Name,
		&tag.Description,
		&tag.Color,
		&tag.IsTrending,
		&tag.UsageCount,
		&tag.CreatedAt,
		&tag.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create tag: %w", err)
	}

	return tag, nil
}

// GetTag retrieves a tag by ID
func (r *tagRepository) GetTag(ctx context.Context, tagID string) (*entity.Tag, error) {
	query := `
		SELECT id, name, description, color, is_trending, usage_count, created_at, updated_at
		FROM tags
		WHERE id = $1
	`

	tag := &entity.Tag{}
	err := r.db.QueryRowContext(ctx, query, tagID).Scan(
		&tag.ID,
		&tag.Name,
		&tag.Description,
		&tag.Color,
		&tag.IsTrending,
		&tag.UsageCount,
		&tag.CreatedAt,
		&tag.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("tag not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get tag: %w", err)
	}

	return tag, nil
}

// ListTags retrieves tags with filters
func (r *tagRepository) ListTags(ctx context.Context, filters TagListFilters) ([]*entity.Tag, error) {
	var conditions []string
	var args []interface{}
	argCount := 1

	if filters.Search != "" {
		conditions = append(conditions, fmt.Sprintf("name ILIKE $%d", argCount))
		args = append(args, "%"+filters.Search+"%")
		argCount++
	}

	if filters.IsTrending != nil {
		conditions = append(conditions, fmt.Sprintf("is_trending = $%d", argCount))
		args = append(args, *filters.IsTrending)
		argCount++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := fmt.Sprintf(`
		SELECT id, name, description, color, is_trending, usage_count, created_at, updated_at
		FROM tags
		%s
		ORDER BY usage_count DESC, name ASC
	`, whereClause)

	if filters.Limit > 0 {
		query += fmt.Sprintf(" LIMIT $%d", argCount)
		args = append(args, filters.Limit)
		argCount++
	}

	if filters.Offset > 0 {
		query += fmt.Sprintf(" OFFSET $%d", argCount)
		args = append(args, filters.Offset)
	}

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list tags: %w", err)
	}
	defer rows.Close()

	var tags []*entity.Tag
	for rows.Next() {
		tag := &entity.Tag{}
		err := rows.Scan(
			&tag.ID,
			&tag.Name,
			&tag.Description,
			&tag.Color,
			&tag.IsTrending,
			&tag.UsageCount,
			&tag.CreatedAt,
			&tag.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan tag: %w", err)
		}
		tags = append(tags, tag)
	}

	return tags, nil
}

// UpdateTag updates a tag
func (r *tagRepository) UpdateTag(ctx context.Context, tag *entity.Tag) error {
	tag.UpdatedAt = time.Now()

	query := `
		UPDATE tags
		SET name = $1, description = $2, color = $3, is_trending = $4, updated_at = $5
		WHERE id = $6
	`

	result, err := r.db.ExecContext(
		ctx,
		query,
		tag.Name,
		tag.Description,
		tag.Color,
		tag.IsTrending,
		tag.UpdatedAt,
		tag.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update tag: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rows == 0 {
		return fmt.Errorf("tag not found")
	}

	return nil
}

// DeleteTag deletes a tag
func (r *tagRepository) DeleteTag(ctx context.Context, tagID string) error {
	query := `DELETE FROM tags WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, tagID)
	if err != nil {
		return fmt.Errorf("failed to delete tag: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rows == 0 {
		return fmt.Errorf("tag not found")
	}

	return nil
}

// GetPopularTags retrieves popular tags
func (r *tagRepository) GetPopularTags(ctx context.Context, limit int) ([]*entity.Tag, error) {
	query := `
		SELECT id, name, description, color, is_trending, usage_count, created_at, updated_at
		FROM tags
		ORDER BY usage_count DESC, name ASC
		LIMIT $1
	`

	rows, err := r.db.QueryContext(ctx, query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get popular tags: %w", err)
	}
	defer rows.Close()

	var tags []*entity.Tag
	for rows.Next() {
		tag := &entity.Tag{}
		err := rows.Scan(
			&tag.ID,
			&tag.Name,
			&tag.Description,
			&tag.Color,
			&tag.IsTrending,
			&tag.UsageCount,
			&tag.CreatedAt,
			&tag.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan tag: %w", err)
		}
		tags = append(tags, tag)
	}

	return tags, nil
}

// IncrementUsageCount increments the usage count of a tag
func (r *tagRepository) IncrementUsageCount(ctx context.Context, tagID string) error {
	query := `
		UPDATE tags
		SET usage_count = usage_count + 1, updated_at = $1
		WHERE id = $2
	`

	_, err := r.db.ExecContext(ctx, query, time.Now(), tagID)
	if err != nil {
		return fmt.Errorf("failed to increment usage count: %w", err)
	}

	return nil
}
