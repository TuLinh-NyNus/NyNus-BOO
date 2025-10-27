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

var allowedExamSortColumns = map[string]string{
	"created_at":     "li.created_at",
	"download_count": "li.download_count",
	"title":          "li.name",
}

// LibraryExamListFilters defines filtering options for listing exam resources.
type LibraryExamListFilters struct {
	Limit        int
	Offset       int
	Subjects     []string
	Grades       []string
	Province     string
	AcademicYear string
	Semester     string
	Difficulty   string
	ExamType     string
	OnlyActive   *bool
	Search       string
	SortBy       string
	SortOrder    string
}

// LibraryExamRepository exposes persistence operations for library exam resources.
type LibraryExamRepository interface {
	List(ctx context.Context, filters LibraryExamListFilters) ([]*entity.LibraryExam, int, error)
	GetByID(ctx context.Context, id string) (*entity.LibraryExam, error)
	IncrementDownloadCount(ctx context.Context, id string, userID *string, ipAddress, userAgent string) (int, error)
}

type libraryExamRepository struct {
	db *sql.DB
}

// NewLibraryExamRepository creates a new exam repository.
func NewLibraryExamRepository(db *sql.DB) LibraryExamRepository {
	return &libraryExamRepository{db: db}
}

// List returns exam resources that match the provided filters.
func (r *libraryExamRepository) List(ctx context.Context, filters LibraryExamListFilters) ([]*entity.LibraryExam, int, error) {
	if filters.Limit <= 0 || filters.Limit > 100 {
		filters.Limit = 20
	}
	if filters.Offset < 0 {
		filters.Offset = 0
	}

	args := []interface{}{}
	conditions := []string{"li.type = 'exam'"}

	if len(filters.Subjects) > 0 {
		args = append(args, pq.Array(filters.Subjects))
		conditions = append(conditions, fmt.Sprintf("em.subject = ANY($%d)", len(args)))
	}
	if len(filters.Grades) > 0 {
		args = append(args, pq.Array(filters.Grades))
		conditions = append(conditions, fmt.Sprintf("em.grade = ANY($%d)", len(args)))
	}
	if filters.Province != "" {
		args = append(args, filters.Province)
		conditions = append(conditions, fmt.Sprintf("em.province = $%d", len(args)))
	}
	if filters.AcademicYear != "" {
		args = append(args, filters.AcademicYear)
		conditions = append(conditions, fmt.Sprintf("em.academic_year = $%d", len(args)))
	}
	if filters.Semester != "" {
		args = append(args, filters.Semester)
		conditions = append(conditions, fmt.Sprintf("em.semester = $%d", len(args)))
	}
	if filters.Difficulty != "" {
		args = append(args, filters.Difficulty)
		conditions = append(conditions, fmt.Sprintf("em.difficulty_level = $%d", len(args)))
	}
	if filters.ExamType != "" {
		args = append(args, filters.ExamType)
		conditions = append(conditions, fmt.Sprintf("em.exam_type = $%d", len(args)))
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
		JOIN exam_metadata em ON li.id = em.library_item_id
		%s
	`, whereClause)

	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortColumn := allowedExamSortColumns["created_at"]
	if col, ok := allowedExamSortColumns[strings.ToLower(filters.SortBy)]; ok {
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
			em.subject,
			em.grade,
			em.province,
			em.school,
			em.academic_year,
			em.semester,
			em.exam_duration,
			em.question_count,
			em.difficulty_level,
			em.exam_type,
			em.required_role,
			em.required_level,
			em.target_roles,
			COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tags
		FROM library_items li
		JOIN exam_metadata em ON li.id = em.library_item_id
		LEFT JOIN item_tags it ON it.library_item_id = li.id
		LEFT JOIN tags t ON t.id = it.tag_id
		%s
		GROUP BY 
			li.id, li.name, li.description, li.category, li.file_url, li.file_id, li.thumbnail_url,
			li.file_size, li.upload_status, li.is_active, li.download_count, li.average_rating,
			li.review_count, li.uploaded_by, li.approved_by, li.created_at, li.updated_at,
			em.subject, em.grade, em.province, em.school, em.academic_year, em.semester,
			em.exam_duration, em.question_count, em.difficulty_level, em.exam_type,
			em.required_role, em.required_level, em.target_roles
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d
	`, whereClause, sortColumn, sortOrder, len(args)-1, len(args))

	rows, err := r.db.QueryContext(ctx, listQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	items := make([]*entity.LibraryExam, 0, filters.Limit)
	for rows.Next() {
		exam := &entity.LibraryExam{}
		var targetRoles pq.StringArray
		var tags pq.StringArray

		err := rows.Scan(
			&exam.ID,
			&exam.Title,
			&exam.Description,
			&exam.Category,
			&exam.FileURL,
			&exam.FileID,
			&exam.ThumbnailURL,
			&exam.FileSize,
			&exam.UploadStatus,
			&exam.IsActive,
			&exam.DownloadCount,
			&exam.AverageRating,
			&exam.ReviewCount,
			&exam.UploadedBy,
			&exam.ApprovedBy,
			&exam.CreatedAt,
			&exam.UpdatedAt,
			&exam.Subject,
			&exam.Grade,
			&exam.Province,
			&exam.School,
			&exam.AcademicYear,
			&exam.Semester,
			&exam.ExamDuration,
			&exam.QuestionCount,
			&exam.Difficulty,
			&exam.ExamType,
			&exam.RequiredRole,
			&exam.RequiredLevel,
			&targetRoles,
			&tags,
		)
		if err != nil {
			return nil, 0, err
		}

		exam.TargetRoles = append([]string(nil), targetRoles...)
		exam.Tags = append([]string(nil), tags...)
		items = append(items, exam)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return items, total, nil
}

// GetByID returns a single exam resource.
func (r *libraryExamRepository) GetByID(ctx context.Context, id string) (*entity.LibraryExam, error) {
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
			em.subject,
			em.grade,
			em.province,
			em.school,
			em.academic_year,
			em.semester,
			em.exam_duration,
			em.question_count,
			em.difficulty_level,
			em.exam_type,
			em.required_role,
			em.required_level,
			em.target_roles,
			COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tags
		FROM library_items li
		JOIN exam_metadata em ON li.id = em.library_item_id
		LEFT JOIN item_tags it ON it.library_item_id = li.id
		LEFT JOIN tags t ON t.id = it.tag_id
		WHERE li.id = $1 AND li.type = 'exam'
		GROUP BY 
			li.id, li.name, li.description, li.category, li.file_url, li.file_id, li.thumbnail_url,
			li.file_size, li.upload_status, li.is_active, li.download_count, li.average_rating,
			li.review_count, li.uploaded_by, li.approved_by, li.created_at, li.updated_at,
			em.subject, em.grade, em.province, em.school, em.academic_year, em.semester,
			em.exam_duration, em.question_count, em.difficulty_level, em.exam_type,
			em.required_role, em.required_level, em.target_roles
	`

	row := r.db.QueryRowContext(ctx, query, id)
	exam := &entity.LibraryExam{}
	var targetRoles pq.StringArray
	var tags pq.StringArray
	if err := row.Scan(
		&exam.ID,
		&exam.Title,
		&exam.Description,
		&exam.Category,
		&exam.FileURL,
		&exam.FileID,
		&exam.ThumbnailURL,
		&exam.FileSize,
		&exam.UploadStatus,
		&exam.IsActive,
		&exam.DownloadCount,
		&exam.AverageRating,
		&exam.ReviewCount,
		&exam.UploadedBy,
		&exam.ApprovedBy,
		&exam.CreatedAt,
		&exam.UpdatedAt,
		&exam.Subject,
		&exam.Grade,
		&exam.Province,
		&exam.School,
		&exam.AcademicYear,
		&exam.Semester,
		&exam.ExamDuration,
		&exam.QuestionCount,
		&exam.Difficulty,
		&exam.ExamType,
		&exam.RequiredRole,
		&exam.RequiredLevel,
		&targetRoles,
		&tags,
	); err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrNotFound
		}
		return nil, err
	}

	exam.TargetRoles = append([]string(nil), targetRoles...)
	exam.Tags = append([]string(nil), tags...)

	return exam, nil
}

// IncrementDownloadCount increments the download counter and logs download metadata.
func (r *libraryExamRepository) IncrementDownloadCount(ctx context.Context, id string, userID *string, ipAddress, userAgent string) (int, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	var newCount int
	if err := tx.QueryRowContext(ctx, `
		UPDATE library_items
		SET download_count = download_count + 1, updated_at = CURRENT_TIMESTAMP
		WHERE id = $1 AND type = 'exam'
		RETURNING download_count
	`, id).Scan(&newCount); err != nil {
		if err == sql.ErrNoRows {
			return 0, ErrNotFound
		}
		return 0, err
	}

	_, err = tx.ExecContext(ctx, `
		INSERT INTO download_history (
			id, library_item_id, user_id, ip_address, user_agent
		) VALUES ($1, $2, $3, $4, $5)
	`, util.ULIDNow(), id, stringValueOrNil(userID), stringValueOrNil(pointerFromString(ipAddress)), stringValueOrNil(pointerFromString(userAgent)))
	if err != nil {
		return 0, err
	}

	if err := tx.Commit(); err != nil {
		return 0, err
	}

	return newCount, nil
}
