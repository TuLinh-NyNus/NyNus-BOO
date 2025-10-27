package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/util"

	"github.com/lib/pq"
)

var allowedVideoSortColumns = map[string]string{
	"created_at":     "li.created_at",
	"download_count": "li.download_count",
	"title":          "li.name",
}

// LibraryVideoListFilters defines filtering options for library videos.
type LibraryVideoListFilters struct {
	Limit      int
	Offset     int
	Subjects   []string
	Grades     []string
	Quality    string
	Instructor string
	OnlyActive *bool
	Search     string
	SortBy     string
	SortOrder  string
}

// LibraryVideoRepository provides persistence operations for library videos.
type LibraryVideoRepository interface {
	List(ctx context.Context, filters LibraryVideoListFilters) ([]*entity.LibraryVideo, int, error)
	GetByID(ctx context.Context, id string) (*entity.LibraryVideo, error)
	IncrementDownloadCount(ctx context.Context, id string, userID *string, ipAddress, userAgent string) (int, error)
}

type libraryVideoRepository struct {
	db *sql.DB
}

// NewLibraryVideoRepository constructs a new video repository instance.
func NewLibraryVideoRepository(db *sql.DB) LibraryVideoRepository {
	return &libraryVideoRepository{db: db}
}

func (r *libraryVideoRepository) List(ctx context.Context, filters LibraryVideoListFilters) ([]*entity.LibraryVideo, int, error) {
	if filters.Limit <= 0 || filters.Limit > 100 {
		filters.Limit = 20
	}
	if filters.Offset < 0 {
		filters.Offset = 0
	}

	args := []interface{}{}
	conditions := []string{"li.type = 'video'"}

	if len(filters.Subjects) > 0 {
		args = append(args, pq.Array(filters.Subjects))
		conditions = append(conditions, fmt.Sprintf("vm.subject = ANY($%d)", len(args)))
	}
	if len(filters.Grades) > 0 {
		args = append(args, pq.Array(filters.Grades))
		conditions = append(conditions, fmt.Sprintf("vm.grade = ANY($%d)", len(args)))
	}
	if filters.Quality != "" {
		args = append(args, filters.Quality)
		conditions = append(conditions, fmt.Sprintf("vm.quality = $%d", len(args)))
	}
	if filters.Instructor != "" {
		args = append(args, "%"+filters.Instructor+"%")
		conditions = append(conditions, fmt.Sprintf("vm.instructor_name ILIKE $%d", len(args)))
	}
	if filters.OnlyActive != nil {
		args = append(args, *filters.OnlyActive)
		conditions = append(conditions, fmt.Sprintf("li.is_active = $%d", len(args)))
	}
	if filters.Search != "" {
		search := "%" + filters.Search + "%"
		args = append(args, search, search)
		conditions = append(conditions, fmt.Sprintf("(li.name ILIKE $%d OR li.description ILIKE $%d)", len(args)-1, len(args)))
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM library_items li
		JOIN video_metadata vm ON li.id = vm.library_item_id
		%s
	`, whereClause)

	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortColumn := allowedVideoSortColumns["created_at"]
	if col, ok := allowedVideoSortColumns[strings.ToLower(filters.SortBy)]; ok {
		sortColumn = col
	}
	sortOrder := "DESC"
	if strings.EqualFold(filters.SortOrder, "asc") {
		sortOrder = "ASC"
	}

	args = append(args, filters.Limit, filters.Offset)
	listQuery := fmt.Sprintf(`
		SELECT 
			li.id,
			li.name,
			li.description,
			li.category,
			li.file_url,
			li.file_id,
			li.thumbnail_url,
			li.file_size,
			li.upload_status,
			li.is_active,
			li.download_count,
			li.average_rating,
			li.review_count,
			li.uploaded_by,
			li.approved_by,
			li.created_at,
			li.updated_at,
			vm.youtube_url,
			vm.youtube_id,
			vm.duration,
			vm.quality,
			vm.instructor_name,
			vm.related_exam_id,
			vm.subject,
			vm.grade,
			vm.required_role,
			vm.required_level,
			vm.target_roles,
			COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tags
		FROM library_items li
		JOIN video_metadata vm ON li.id = vm.library_item_id
		LEFT JOIN item_tags it ON it.library_item_id = li.id
		LEFT JOIN tags t ON t.id = it.tag_id
		%s
		GROUP BY 
			li.id, li.name, li.description, li.category, li.file_url, li.file_id, li.thumbnail_url,
			li.file_size, li.upload_status, li.is_active, li.download_count, li.average_rating,
			li.review_count, li.uploaded_by, li.approved_by, li.created_at, li.updated_at,
			vm.youtube_url, vm.youtube_id, vm.duration, vm.quality, vm.instructor_name,
			vm.related_exam_id, vm.subject, vm.grade, vm.required_role, vm.required_level, vm.target_roles
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d
	`, whereClause, sortColumn, sortOrder, len(args)-1, len(args))

	rows, err := r.db.QueryContext(ctx, listQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	videos := make([]*entity.LibraryVideo, 0, filters.Limit)
	for rows.Next() {
		video := &entity.LibraryVideo{}
		var targetRoles pq.StringArray
		var tags pq.StringArray

		err := rows.Scan(
			&video.ID,
			&video.Title,
			&video.Description,
			&video.Category,
			&video.FileURL,
			&video.FileID,
			&video.ThumbnailURL,
			&video.FileSize,
			&video.UploadStatus,
			&video.IsActive,
			&video.DownloadCount,
			&video.AverageRating,
			&video.ReviewCount,
			&video.UploadedBy,
			&video.ApprovedBy,
			&video.CreatedAt,
			&video.UpdatedAt,
			&video.YoutubeURL,
			&video.YoutubeID,
			&video.Duration,
			&video.Quality,
			&video.InstructorName,
			&video.RelatedExamID,
			&video.Subject,
			&video.Grade,
			&video.RequiredRole,
			&video.RequiredLevel,
			&targetRoles,
			&tags,
		)
		if err != nil {
			return nil, 0, err
		}

		video.TargetRoles = append([]string(nil), targetRoles...)
		video.Tags = append([]string(nil), tags...)
		videos = append(videos, video)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return videos, total, nil
}

func (r *libraryVideoRepository) GetByID(ctx context.Context, id string) (*entity.LibraryVideo, error) {
	query := `
		SELECT 
			li.id,
			li.name,
			li.description,
			li.category,
			li.file_url,
			li.file_id,
			li.thumbnail_url,
			li.file_size,
			li.upload_status,
			li.is_active,
			li.download_count,
			li.average_rating,
			li.review_count,
			li.uploaded_by,
			li.approved_by,
			li.created_at,
			li.updated_at,
			vm.youtube_url,
			vm.youtube_id,
			vm.duration,
			vm.quality,
			vm.instructor_name,
			vm.related_exam_id,
			vm.subject,
			vm.grade,
			vm.required_role,
			vm.required_level,
			vm.target_roles,
			COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tags
		FROM library_items li
		JOIN video_metadata vm ON li.id = vm.library_item_id
		LEFT JOIN item_tags it ON it.library_item_id = li.id
		LEFT JOIN tags t ON t.id = it.tag_id
		WHERE li.id = $1 AND li.type = 'video'
		GROUP BY 
			li.id, li.name, li.description, li.category, li.file_url, li.file_id, li.thumbnail_url,
			li.file_size, li.upload_status, li.is_active, li.download_count, li.average_rating,
			li.review_count, li.uploaded_by, li.approved_by, li.created_at, li.updated_at,
			vm.youtube_url, vm.youtube_id, vm.duration, vm.quality, vm.instructor_name,
			vm.related_exam_id, vm.subject, vm.grade, vm.required_role, vm.required_level, vm.target_roles
	`

	row := r.db.QueryRowContext(ctx, query, id)
	video := &entity.LibraryVideo{}
	var targetRoles pq.StringArray
	var tags pq.StringArray

	if err := row.Scan(
		&video.ID,
		&video.Title,
		&video.Description,
		&video.Category,
		&video.FileURL,
		&video.FileID,
		&video.ThumbnailURL,
		&video.FileSize,
		&video.UploadStatus,
		&video.IsActive,
		&video.DownloadCount,
		&video.AverageRating,
		&video.ReviewCount,
		&video.UploadedBy,
		&video.ApprovedBy,
		&video.CreatedAt,
		&video.UpdatedAt,
		&video.YoutubeURL,
		&video.YoutubeID,
		&video.Duration,
		&video.Quality,
		&video.InstructorName,
		&video.RelatedExamID,
		&video.Subject,
		&video.Grade,
		&video.RequiredRole,
		&video.RequiredLevel,
		&targetRoles,
		&tags,
	); err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrNotFound
		}
		return nil, err
	}

	video.TargetRoles = append([]string(nil), targetRoles...)
	video.Tags = append([]string(nil), tags...)

	return video, nil
}

func (r *libraryVideoRepository) IncrementDownloadCount(ctx context.Context, id string, userID *string, ipAddress, userAgent string) (int, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	var newCount int
	if err := tx.QueryRowContext(ctx, `
		UPDATE library_items
		SET download_count = download_count + 1, updated_at = CURRENT_TIMESTAMP
		WHERE id = $1 AND type = 'video'
		RETURNING download_count
	`, id).Scan(&newCount); err != nil {
		if err == sql.ErrNoRows {
			return 0, ErrNotFound
		}
		return 0, err
	}

	if _, err := tx.ExecContext(ctx, `
		INSERT INTO download_history (
			id, library_item_id, user_id, ip_address, user_agent
		) VALUES ($1, $2, $3, $4, $5)
	`, util.ULIDNow(), id, stringValueOrNil(userID), stringValueOrNil(pointerFromString(ipAddress)), stringValueOrNil(pointerFromString(userAgent))); err != nil {
		return 0, err
	}

	if err := tx.Commit(); err != nil {
		return 0, err
	}

	return newCount, nil
}
