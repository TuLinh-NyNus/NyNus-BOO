package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/util"
	"github.com/lib/pq"
)

// Allowed sort columns để tránh SQL injection
var allowedBookSortColumns = map[string]string{
	"created_at":     "li.created_at",
	"updated_at":     "li.updated_at",
	"download_count": "li.download_count",
	"rating":         "li.average_rating",
	"title":          "li.name",
}

// BookListFilters định nghĩa bộ lọc truy vấn sách
type BookListFilters struct {
	Limit     int
	Offset    int
	Category  string
	Author    string
	FileType  string
	IsActive  *bool
	Search    string
	SortBy    string
	SortOrder string
}

// BookRepository định nghĩa các thao tác dữ liệu cho BookService
type BookRepository interface {
	List(ctx context.Context, filters BookListFilters) ([]*entity.Book, int, error)
	GetByID(ctx context.Context, id string) (*entity.Book, error)
	Create(ctx context.Context, book *entity.Book) error
	Update(ctx context.Context, book *entity.Book) error
	SoftDelete(ctx context.Context, id string, archivedBy string) error
	IncrementDownloadCount(ctx context.Context, id string, userID *string, ipAddress, userAgent string) (int, error)
	CountActive(ctx context.Context) (int, error)
}

type bookRepository struct {
	db *sql.DB
}

// NewBookRepository tạo repository mới
func NewBookRepository(db *sql.DB) BookRepository {
	return &bookRepository{db: db}
}

// List trả về danh sách sách theo bộ lọc và tổng số bản ghi
func (r *bookRepository) List(ctx context.Context, filters BookListFilters) ([]*entity.Book, int, error) {
	if filters.Limit <= 0 || filters.Limit > 100 {
		filters.Limit = 20
	}
	if filters.Offset < 0 {
		filters.Offset = 0
	}

	args := []interface{}{}
	conditions := []string{"li.type = 'book'"}

	if filters.Category != "" {
		args = append(args, filters.Category)
		conditions = append(conditions, fmt.Sprintf("li.category = $%d", len(args)))
	}
	if filters.Author != "" {
		args = append(args, filters.Author)
		conditions = append(conditions, fmt.Sprintf("bm.author ILIKE $%d", len(args)))
	}
	if filters.FileType != "" {
		args = append(args, filters.FileType)
		conditions = append(conditions, fmt.Sprintf("li.file_type = $%d", len(args)))
	}
	if filters.IsActive != nil {
		args = append(args, *filters.IsActive)
		conditions = append(conditions, fmt.Sprintf("li.is_active = $%d", len(args)))
	}
	if filters.Search != "" {
		args = append(args, "%"+filters.Search+"%")
		conditions = append(conditions, fmt.Sprintf("(li.name ILIKE $%d OR li.description ILIKE $%d OR bm.author ILIKE $%d OR bm.publisher ILIKE $%d)", len(args), len(args), len(args), len(args)))
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	sortColumn := allowedBookSortColumns["created_at"]
	if col, ok := allowedBookSortColumns[filters.SortBy]; ok {
		sortColumn = col
	}
	sortOrder := "DESC"
	if strings.EqualFold(filters.SortOrder, "asc") {
		sortOrder = "ASC"
	}

	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM library_items li
		JOIN book_metadata bm ON li.id = bm.library_item_id
		%s
	`, whereClause)

	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
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
			li.file_type,
			bm.subject,
			bm.grade,
			bm.book_type,
			li.upload_status,
			li.is_active,
			li.download_count,
			li.average_rating,
			li.review_count,
			li.uploaded_by,
			li.approved_by,
			li.created_at,
			li.updated_at,
			bm.author,
			bm.publisher,
			bm.publication_year,
			bm.publication_date,
			bm.isbn,
			bm.page_count,
			bm.cover_image,
			bm.required_role,
			bm.required_level,
			bm.target_roles,
			COALESCE(array_agg(DISTINCT lt.name) FILTER (WHERE lt.name IS NOT NULL), '{}') AS tags
		FROM library_items li
		JOIN book_metadata bm ON li.id = bm.library_item_id
		LEFT JOIN item_tags lit ON lit.library_item_id = li.id
		LEFT JOIN tags lt ON lt.id = lit.tag_id
		%s
		GROUP BY 
			li.id, li.name, li.description, li.category, li.file_url, li.file_id, li.thumbnail_url,
			li.file_size, li.file_type,
			bm.subject, bm.grade, bm.book_type,
			li.upload_status, li.is_active, li.download_count,
			li.average_rating, li.review_count, li.uploaded_by, li.approved_by, li.created_at, li.updated_at,
			bm.author, bm.publisher, bm.publication_year, bm.publication_date, bm.isbn, bm.page_count,
			bm.cover_image, bm.required_role, bm.required_level, bm.target_roles
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d
	`, whereClause, sortColumn, sortOrder, len(args)-1, len(args))

	rows, err := r.db.QueryContext(ctx, listQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var books []*entity.Book
	for rows.Next() {
		book := &entity.Book{}
		var targetRoles pq.StringArray
		var tags pq.StringArray

		err := rows.Scan(
			&book.ID,
			&book.Title,
			&book.Description,
			&book.Category,
			&book.FileURL,
			&book.FileID,
			&book.ThumbnailURL,
			&book.FileSize,
			&book.FileType,
			&book.Subject,
			&book.Grade,
			&book.BookType,
			&book.UploadStatus,
			&book.IsActive,
			&book.DownloadCount,
			&book.AverageRating,
			&book.ReviewCount,
			&book.UploadedBy,
			&book.ApprovedBy,
			&book.CreatedAt,
			&book.UpdatedAt,
			&book.Author,
			&book.Publisher,
			&book.PublicationYear,
			&book.PublicationDate,
			&book.ISBN,
			&book.PageCount,
			&book.CoverImage,
			&book.RequiredRole,
			&book.RequiredLevel,
			&targetRoles,
			&tags,
		)
		if err != nil {
			return nil, 0, err
		}

		book.TargetRoles = append([]string(nil), targetRoles...)
		book.Tags = append([]string(nil), tags...)

		books = append(books, book)
	}

	return books, total, rows.Err()
}

// GetByID trả về sách theo ID
func (r *bookRepository) GetByID(ctx context.Context, id string) (*entity.Book, error) {
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
			li.file_type,
			bm.subject,
			bm.grade,
			bm.book_type,
			li.upload_status,
			li.is_active,
			li.download_count,
			li.average_rating,
			li.review_count,
			li.uploaded_by,
			li.approved_by,
			li.created_at,
			li.updated_at,
			bm.author,
			bm.publisher,
			bm.publication_year,
			bm.publication_date,
			bm.isbn,
			bm.page_count,
			bm.cover_image,
			bm.required_role,
			bm.required_level,
			bm.target_roles,
			COALESCE(array_agg(DISTINCT lt.name) FILTER (WHERE lt.name IS NOT NULL), '{}') AS tags
		FROM library_items li
		JOIN book_metadata bm ON li.id = bm.library_item_id
		LEFT JOIN item_tags lit ON lit.library_item_id = li.id
		LEFT JOIN tags lt ON lt.id = lit.tag_id
		WHERE li.type = 'book' AND li.id = $1
		GROUP BY 
			li.id, li.name, li.description, li.category, li.file_url, li.file_id, li.thumbnail_url,
			li.file_size, li.file_type,
			bm.subject, bm.grade, bm.book_type,
			li.upload_status, li.is_active, li.download_count,
			li.average_rating, li.review_count, li.uploaded_by, li.approved_by, li.created_at, li.updated_at,
			bm.author, bm.publisher, bm.publication_year, bm.publication_date, bm.isbn, bm.page_count,
			bm.cover_image, bm.required_role, bm.required_level, bm.target_roles
	`

	book := &entity.Book{}
	var targetRoles pq.StringArray
	var tags pq.StringArray

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&book.ID,
		&book.Title,
		&book.Description,
		&book.Category,
		&book.FileURL,
		&book.FileID,
		&book.ThumbnailURL,
		&book.FileSize,
		&book.FileType,
		&book.Subject,
		&book.Grade,
		&book.BookType,
		&book.UploadStatus,
		&book.IsActive,
		&book.DownloadCount,
		&book.AverageRating,
		&book.ReviewCount,
		&book.UploadedBy,
		&book.ApprovedBy,
		&book.CreatedAt,
		&book.UpdatedAt,
		&book.Author,
		&book.Publisher,
		&book.PublicationYear,
		&book.PublicationDate,
		&book.ISBN,
		&book.PageCount,
		&book.CoverImage,
		&book.RequiredRole,
		&book.RequiredLevel,
		&targetRoles,
		&tags,
	)

	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	book.TargetRoles = append([]string(nil), targetRoles...)
	book.Tags = append([]string(nil), tags...)

	return book, nil
}

// Create thêm sách mới
func (r *bookRepository) Create(ctx context.Context, book *entity.Book) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}

	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	now := time.Now()

	if _, err = tx.ExecContext(ctx, `
		INSERT INTO library_items (
			id, name, description, type, category, file_url, file_id, thumbnail_url,
			file_size, file_type, upload_status, is_active, download_count,
			average_rating, review_count, uploaded_by, approved_by, created_at, updated_at
		) VALUES (
			$1, $2, $3, 'book', $4, $5, $6, $7,
			$8, $9, $10, $11, $12,
			$13, $14, $15, $16, $17, $18
		)
	`,
		book.ID,
		book.Title,
		book.Description,
		book.Category,
		book.FileURL,
		book.FileID,
		book.ThumbnailURL,
		book.FileSize,
		book.FileType,
		book.UploadStatus,
		book.IsActive,
		book.DownloadCount,
		book.AverageRating,
		book.ReviewCount,
		book.UploadedBy,
		book.ApprovedBy,
		now,
		now,
	); err != nil {
		return fmt.Errorf("insert library_items: %w", err)
	}

	if _, err = tx.ExecContext(ctx, `
		INSERT INTO book_metadata (
			id, library_item_id, subject, grade, book_type, author, publisher,
			publication_year, publication_date, isbn, page_count, required_role,
			required_level, target_roles, cover_image, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7,
			$8, $9, $10, $11, $12,
			$13, $14, $15, $16, $17
		)
	`,
		util.ULIDNow(),
		book.ID,
		nilIfEmpty(book.Subject),
		nilIfEmpty(book.Grade),
		nilIfEmpty(book.BookType),
		book.Author,
		book.Publisher,
		nullInt32Value(book.PublicationYear),
		nullDateValue(book.PublicationDate),
		book.ISBN,
		nullInt32Value(book.PageCount),
		book.RequiredRole,
		nullInt32Value(book.RequiredLevel),
		pq.Array(book.TargetRoles),
		book.CoverImage,
		now,
		now,
	); err != nil {
		return fmt.Errorf("insert book_metadata: %w", err)
	}

	if err = upsertBookTags(ctx, tx, book.ID, book.Tags); err != nil {
		return err
	}

	if err = tx.Commit(); err != nil {
		return err
	}

	return nil
}

// Update chỉnh sửa thông tin sách
func (r *bookRepository) Update(ctx context.Context, book *entity.Book) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}

	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	now := time.Now()

	result, err := tx.ExecContext(ctx, `
		UPDATE library_items
		SET
			name = $2,
			description = $3,
			category = $4,
			file_url = $5,
			file_id = $6,
			thumbnail_url = $7,
			file_size = $8,
			file_type = $9,
			upload_status = $10,
			is_active = $11,
			download_count = $12,
			average_rating = $13,
			review_count = $14,
			approved_by = $15,
			updated_at = $16
		WHERE id = $1 AND type = 'book'
	`,
		book.ID,
		book.Title,
		book.Description,
		book.Category,
		book.FileURL,
		book.FileID,
		book.ThumbnailURL,
		book.FileSize,
		book.FileType,
		book.UploadStatus,
		book.IsActive,
		book.DownloadCount,
		book.AverageRating,
		book.ReviewCount,
		book.ApprovedBy,
		now,
	)
	if err != nil {
		return fmt.Errorf("update library_items: %w", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return ErrNotFound
	}

	result, err = tx.ExecContext(ctx, `
		UPDATE book_metadata
		SET
			subject = $2,
			grade = $3,
			book_type = $4,
			author = $5,
			publisher = $6,
			publication_year = $7,
			publication_date = $8,
			isbn = $9,
			page_count = $10,
			required_role = $11,
			required_level = $12,
			target_roles = $13,
			cover_image = $14,
			updated_at = $15
		WHERE library_item_id = $1
	`,
		book.ID,
		nilIfEmpty(book.Subject),
		nilIfEmpty(book.Grade),
		nilIfEmpty(book.BookType),
		book.Author,
		book.Publisher,
		nullInt32Value(book.PublicationYear),
		nullDateValue(book.PublicationDate),
		book.ISBN,
		nullInt32Value(book.PageCount),
		book.RequiredRole,
		nullInt32Value(book.RequiredLevel),
		pq.Array(book.TargetRoles),
		book.CoverImage,
		now,
	)
	if err != nil {
		return fmt.Errorf("update book_metadata: %w", err)
	}

	if rows, _ := result.RowsAffected(); rows == 0 {
		return ErrNotFound
	}

	if err = upsertBookTags(ctx, tx, book.ID, book.Tags); err != nil {
		return err
	}

	if err = tx.Commit(); err != nil {
		return err
	}

	return nil
}

// SoftDelete đặt sách về trạng thái archived để đảm bảo lịch sử
func (r *bookRepository) SoftDelete(ctx context.Context, id string, archivedBy string) error {
	result, err := r.db.ExecContext(ctx, `
		UPDATE library_items
		SET is_active = FALSE,
			upload_status = 'archived',
			approved_by = CASE WHEN $2 <> '' THEN $2 ELSE approved_by END,
			updated_at = NOW()
		WHERE id = $1 AND type = 'book'
	`, id, archivedBy)
	if err != nil {
		return err
	}

	if rows, _ := result.RowsAffected(); rows == 0 {
		return ErrNotFound
	}

	return nil
}

// IncrementDownloadCount tăng download_count và ghi lịch sử
func (r *bookRepository) IncrementDownloadCount(ctx context.Context, id string, userID *string, ipAddress, userAgent string) (int, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return 0, err
	}

	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	var newCount int
	err = tx.QueryRowContext(ctx, `
		UPDATE library_items
		SET download_count = download_count + 1,
			updated_at = NOW()
		WHERE id = $1 AND type = 'book'
		RETURNING download_count
	`, id).Scan(&newCount)
	if err == sql.ErrNoRows {
		return 0, ErrNotFound
	}
	if err != nil {
		return 0, err
	}

	_, err = tx.ExecContext(ctx, `
		INSERT INTO download_history (
			id, library_item_id, user_id, ip_address, user_agent
		) VALUES ($1, $2, $3, $4, $5)
	`,
		util.ULIDNow(),
		id,
		userID,
		nilIfEmptyString(ipAddress),
		nilIfEmptyString(userAgent),
	)
	if err != nil {
		return 0, err
	}

	if err = tx.Commit(); err != nil {
		return 0, err
	}

	return newCount, nil
}

// CountActive trả về tổng số sách đang active
func (r *bookRepository) CountActive(ctx context.Context) (int, error) {
	var total int
	err := r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) 
		FROM library_items 
		WHERE type = 'book' AND is_active = TRUE
	`).Scan(&total)

	return total, err
}

// upsertBookTags cập nhật quan hệ tag cho sách trong transaction
func upsertBookTags(ctx context.Context, tx *sql.Tx, itemID string, tags []string) error {
	cleanedTags := make([]string, 0, len(tags))
	for _, tag := range tags {
		tag = strings.TrimSpace(tag)
		if tag != "" {
			cleanedTags = append(cleanedTags, tag)
		}
	}

	if len(cleanedTags) == 0 {
		if _, err := tx.ExecContext(ctx, `DELETE FROM item_tags WHERE library_item_id = $1`, itemID); err != nil {
			return err
		}
		return nil
	}

	tagIDs := make([]string, 0, len(cleanedTags))
	for _, tag := range cleanedTags {
		var tagID string
		err := tx.QueryRowContext(ctx, `
			INSERT INTO tags (id, name)
			VALUES ($1, $2)
			ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
			RETURNING id
		`,
			util.ULIDNow(),
			tag,
		).Scan(&tagID)
		if err != nil {
			return fmt.Errorf("upsert tag %s: %w", tag, err)
		}
		tagIDs = append(tagIDs, tagID)
	}

	if len(tagIDs) > 0 {
		placeholders := make([]string, len(tagIDs))
		args := make([]interface{}, 0, len(tagIDs)+1)
		args = append(args, itemID)
		for i, id := range tagIDs {
			placeholders[i] = fmt.Sprintf("$%d", i+2)
			args = append(args, id)
		}

		// Remove tags không còn trong danh sách mới
		query := fmt.Sprintf(`
			DELETE FROM item_tags
			WHERE library_item_id = $1
			  AND tag_id NOT IN (%s)
		`, strings.Join(placeholders, ","))
		if _, err := tx.ExecContext(ctx, query, args...); err != nil {
			return err
		}

		// Thêm quan hệ mới
		for _, tagID := range tagIDs {
			if _, err := tx.ExecContext(ctx, `
				INSERT INTO item_tags (library_item_id, tag_id)
				VALUES ($1, $2)
				ON CONFLICT DO NOTHING
			`, itemID, tagID); err != nil {
				return err
			}
		}
	}

	return nil
}

func nilIfEmpty(value sql.NullString) interface{} {
	if value.Valid && value.String != "" {
		return value.String
	}
	return nil
}

func nilIfEmptyString(value string) interface{} {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	return value
}

func nullInt32Value(value sql.NullInt32) interface{} {
	if value.Valid {
		return value.Int32
	}
	return nil
}

func nullDateValue(value sql.NullTime) interface{} {
	if value.Valid {
		return value.Time
	}
	return nil
}
