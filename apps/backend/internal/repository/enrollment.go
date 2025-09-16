package repository

import (
	"context"
	"database/sql"
	"time"
)

// Enrollment represents a course enrollment
type Enrollment struct {
	ID                string
	UserID            string
	CourseID          string
	Status            string // ACTIVE, COMPLETED, DROPPED, SUSPENDED, EXPIRED
	AccessLevel       string // BASIC, PREMIUM, FULL
	MaxDownloads      int
	CurrentDownloads  int
	MaxStreams        int
	ExpiresAt         *time.Time
	Progress          int
	EnrolledAt        time.Time
	UpdatedAt         time.Time
}

// EnrollmentRepository handles enrollment data access
type EnrollmentRepository interface {
	Create(ctx context.Context, enrollment *Enrollment) error
	GetByID(ctx context.Context, id string) (*Enrollment, error)
	GetByUserID(ctx context.Context, userID string) ([]*Enrollment, error)
	GetByUserAndCourse(ctx context.Context, userID, courseID string) (*Enrollment, error)
	Update(ctx context.Context, enrollment *Enrollment) error
	UpdateStatus(ctx context.Context, id, status string) error
	IncrementDownloads(ctx context.Context, id string) error
	GetActiveEnrollments(ctx context.Context, userID string) ([]*Enrollment, error)
	GetExpiredEnrollments(ctx context.Context) ([]*Enrollment, error)
	Delete(ctx context.Context, id string) error
}

// enrollmentRepository implements EnrollmentRepository
type enrollmentRepository struct {
	db *sql.DB
}

// NewEnrollmentRepository creates a new enrollment repository
func NewEnrollmentRepository(db *sql.DB) EnrollmentRepository {
	return &enrollmentRepository{db: db}
}

// Create creates a new enrollment
func (r *enrollmentRepository) Create(ctx context.Context, enrollment *Enrollment) error {
	query := `
		INSERT INTO course_enrollments (
			id, user_id, course_id, status, access_level,
			max_downloads, current_downloads, max_streams,
			expires_at, progress, enrolled_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`
	
	_, err := r.db.ExecContext(ctx, query,
		enrollment.ID,
		enrollment.UserID,
		enrollment.CourseID,
		enrollment.Status,
		enrollment.AccessLevel,
		enrollment.MaxDownloads,
		enrollment.CurrentDownloads,
		enrollment.MaxStreams,
		enrollment.ExpiresAt,
		enrollment.Progress,
		enrollment.EnrolledAt,
		enrollment.UpdatedAt,
	)
	
	return err
}

// GetByID gets enrollment by ID
func (r *enrollmentRepository) GetByID(ctx context.Context, id string) (*Enrollment, error) {
	query := `
		SELECT id, user_id, course_id, status, access_level,
			   max_downloads, current_downloads, max_streams,
			   expires_at, progress, enrolled_at, updated_at
		FROM course_enrollments
		WHERE id = $1
	`
	
	enrollment := &Enrollment{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&enrollment.ID,
		&enrollment.UserID,
		&enrollment.CourseID,
		&enrollment.Status,
		&enrollment.AccessLevel,
		&enrollment.MaxDownloads,
		&enrollment.CurrentDownloads,
		&enrollment.MaxStreams,
		&enrollment.ExpiresAt,
		&enrollment.Progress,
		&enrollment.EnrolledAt,
		&enrollment.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	
	return enrollment, err
}

// GetByUserID gets all enrollments for a user
func (r *enrollmentRepository) GetByUserID(ctx context.Context, userID string) ([]*Enrollment, error) {
	query := `
		SELECT id, user_id, course_id, status, access_level,
			   max_downloads, current_downloads, max_streams,
			   expires_at, progress, enrolled_at, updated_at
		FROM course_enrollments
		WHERE user_id = $1
		ORDER BY enrolled_at DESC
	`
	
	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var enrollments []*Enrollment
	for rows.Next() {
		enrollment := &Enrollment{}
		err := rows.Scan(
			&enrollment.ID,
			&enrollment.UserID,
			&enrollment.CourseID,
			&enrollment.Status,
			&enrollment.AccessLevel,
			&enrollment.MaxDownloads,
			&enrollment.CurrentDownloads,
			&enrollment.MaxStreams,
			&enrollment.ExpiresAt,
			&enrollment.Progress,
			&enrollment.EnrolledAt,
			&enrollment.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		enrollments = append(enrollments, enrollment)
	}
	
	return enrollments, nil
}

// GetByUserAndCourse gets enrollment by user and course
func (r *enrollmentRepository) GetByUserAndCourse(ctx context.Context, userID, courseID string) (*Enrollment, error) {
	query := `
		SELECT id, user_id, course_id, status, access_level,
			   max_downloads, current_downloads, max_streams,
			   expires_at, progress, enrolled_at, updated_at
		FROM course_enrollments
		WHERE user_id = $1 AND course_id = $2
	`
	
	enrollment := &Enrollment{}
	err := r.db.QueryRowContext(ctx, query, userID, courseID).Scan(
		&enrollment.ID,
		&enrollment.UserID,
		&enrollment.CourseID,
		&enrollment.Status,
		&enrollment.AccessLevel,
		&enrollment.MaxDownloads,
		&enrollment.CurrentDownloads,
		&enrollment.MaxStreams,
		&enrollment.ExpiresAt,
		&enrollment.Progress,
		&enrollment.EnrolledAt,
		&enrollment.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	
	return enrollment, err
}

// Update updates an enrollment
func (r *enrollmentRepository) Update(ctx context.Context, enrollment *Enrollment) error {
	query := `
		UPDATE course_enrollments
		SET status = $2, access_level = $3, max_downloads = $4,
			current_downloads = $5, max_streams = $6, expires_at = $7,
			progress = $8, updated_at = $9
		WHERE id = $1
	`
	
	_, err := r.db.ExecContext(ctx, query,
		enrollment.ID,
		enrollment.Status,
		enrollment.AccessLevel,
		enrollment.MaxDownloads,
		enrollment.CurrentDownloads,
		enrollment.MaxStreams,
		enrollment.ExpiresAt,
		enrollment.Progress,
		time.Now(),
	)
	
	return err
}

// UpdateStatus updates enrollment status
func (r *enrollmentRepository) UpdateStatus(ctx context.Context, id, status string) error {
	query := `
		UPDATE course_enrollments
		SET status = $2, updated_at = $3
		WHERE id = $1
	`
	
	_, err := r.db.ExecContext(ctx, query, id, status, time.Now())
	return err
}

// IncrementDownloads increments download count
func (r *enrollmentRepository) IncrementDownloads(ctx context.Context, id string) error {
	query := `
		UPDATE course_enrollments
		SET current_downloads = current_downloads + 1, updated_at = $2
		WHERE id = $1
	`
	
	_, err := r.db.ExecContext(ctx, query, id, time.Now())
	return err
}

// GetActiveEnrollments gets active enrollments for a user
func (r *enrollmentRepository) GetActiveEnrollments(ctx context.Context, userID string) ([]*Enrollment, error) {
	query := `
		SELECT id, user_id, course_id, status, access_level,
			   max_downloads, current_downloads, max_streams,
			   expires_at, progress, enrolled_at, updated_at
		FROM course_enrollments
		WHERE user_id = $1 
			AND status = 'ACTIVE'
			AND (expires_at IS NULL OR expires_at > NOW())
		ORDER BY enrolled_at DESC
	`
	
	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var enrollments []*Enrollment
	for rows.Next() {
		enrollment := &Enrollment{}
		err := rows.Scan(
			&enrollment.ID,
			&enrollment.UserID,
			&enrollment.CourseID,
			&enrollment.Status,
			&enrollment.AccessLevel,
			&enrollment.MaxDownloads,
			&enrollment.CurrentDownloads,
			&enrollment.MaxStreams,
			&enrollment.ExpiresAt,
			&enrollment.Progress,
			&enrollment.EnrolledAt,
			&enrollment.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		enrollments = append(enrollments, enrollment)
	}
	
	return enrollments, nil
}

// GetExpiredEnrollments gets all expired enrollments
func (r *enrollmentRepository) GetExpiredEnrollments(ctx context.Context) ([]*Enrollment, error) {
	query := `
		SELECT id, user_id, course_id, status, access_level,
			   max_downloads, current_downloads, max_streams,
			   expires_at, progress, enrolled_at, updated_at
		FROM course_enrollments
		WHERE status = 'ACTIVE' 
			AND expires_at IS NOT NULL 
			AND expires_at <= NOW()
	`
	
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var enrollments []*Enrollment
	for rows.Next() {
		enrollment := &Enrollment{}
		err := rows.Scan(
			&enrollment.ID,
			&enrollment.UserID,
			&enrollment.CourseID,
			&enrollment.Status,
			&enrollment.AccessLevel,
			&enrollment.MaxDownloads,
			&enrollment.CurrentDownloads,
			&enrollment.MaxStreams,
			&enrollment.ExpiresAt,
			&enrollment.Progress,
			&enrollment.EnrolledAt,
			&enrollment.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		enrollments = append(enrollments, enrollment)
	}
	
	return enrollments, nil
}

// Delete deletes an enrollment
func (r *enrollmentRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM course_enrollments WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}