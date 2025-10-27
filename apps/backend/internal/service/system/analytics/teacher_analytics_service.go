package analytics

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/repository"
	"exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/sirupsen/logrus"
	"google.golang.org/protobuf/types/known/timestamppb"
)

// TeacherAnalyticsService provides teacher-specific analytics functionality
type TeacherAnalyticsService struct {
	db         *sql.DB
	examRepo   interfaces.ExamRepository
	enrollRepo repository.EnrollmentRepository
	logger     *logrus.Logger
}

// NewTeacherAnalyticsService creates a new teacher analytics service
func NewTeacherAnalyticsService(
	db *sql.DB,
	examRepo interfaces.ExamRepository,
	enrollRepo repository.EnrollmentRepository,
	logger *logrus.Logger,
) *TeacherAnalyticsService {
	if logger == nil {
		logger = logrus.New()
		logger.SetFormatter(&logrus.TextFormatter{
			FullTimestamp: true,
		})
	}

	return &TeacherAnalyticsService{
		db:         db,
		examRepo:   examRepo,
		enrollRepo: enrollRepo,
		logger:     logger,
	}
}

// TeacherDashboardData contains teacher dashboard metrics
type TeacherDashboardData struct {
	TotalExams       int32
	TotalStudents    int32
	AverageScore     float64
	PassRate         float64
	ActiveStudents   int32
	CompletionRate   float64
	Trends           []*PerformanceTrend
	TopExams         []*ExamPerformance
}

// StudentData contains student information for teacher view
type StudentData struct {
	UserID            string
	Email             string
	FirstName         string
	LastName          string
	TotalCourses      int32
	TotalExamResults  int32
	AverageScore      float64
	CompletionRate    float64
	Status            string
	LastActivity      *timestamppb.Timestamp
}

// ExamData contains exam information for teacher view
type ExamData struct {
	ID              string
	Title           string
	Description     string
	Subject         string
	Grade           int32
	Difficulty      string
	ExamType        string
	Status          string
	DurationMinutes int32
	TotalPoints     int32
	PassPercentage  int32
	QuestionCount   int32
	AttemptCount    int32
	AverageScore    float64
	CreatedAt       *timestamppb.Timestamp
	PublishedAt     *timestamppb.Timestamp
}

// GetTeacherDashboard returns dashboard overview for a specific teacher
func (s *TeacherAnalyticsService) GetTeacherDashboard(ctx context.Context, teacherID string, timeRange string) (*TeacherDashboardData, error) {
	s.logger.WithFields(logrus.Fields{
		"teacher_id": teacherID,
		"time_range": timeRange,
	}).Info("Getting teacher dashboard")

	data := &TeacherDashboardData{}

	// Parse time range
	days := s.parseTimeRange(timeRange)

	// Get total exams created by teacher
	totalExams, err := s.getTotalExams(ctx, teacherID)
	if err != nil {
		return nil, fmt.Errorf("failed to get total exams: %w", err)
	}
	data.TotalExams = int32(totalExams)

	// Get total students (from course enrollments)
	totalStudents, err := s.getTotalStudents(ctx, teacherID)
	if err != nil {
		return nil, fmt.Errorf("failed to get total students: %w", err)
	}
	data.TotalStudents = int32(totalStudents)

	// Get average score and pass rate
	avgScore, passRate, activeStudents, err := s.getPerformanceMetrics(ctx, teacherID, days)
	if err != nil {
		return nil, fmt.Errorf("failed to get performance metrics: %w", err)
	}
	data.AverageScore = avgScore
	data.PassRate = passRate
	data.ActiveStudents = int32(activeStudents)

	// Get completion rate
	completionRate, err := s.getCompletionRate(ctx, teacherID)
	if err != nil {
		return nil, fmt.Errorf("failed to get completion rate: %w", err)
	}
	data.CompletionRate = completionRate

	// Get performance trends (last 30 days)
	trends, err := s.getPerformanceTrends(ctx, teacherID, 30)
	if err != nil {
		s.logger.WithError(err).Warn("Failed to get performance trends")
		trends = []*PerformanceTrend{}
	}
	data.Trends = trends

	// Get top performing exams
	topExams, err := s.getTopExams(ctx, teacherID, 5)
	if err != nil {
		s.logger.WithError(err).Warn("Failed to get top exams")
		topExams = []*ExamPerformance{}
	}
	data.TopExams = topExams

	return data, nil
}

// GetTeacherStudents returns list of students for a teacher
func (s *TeacherAnalyticsService) GetTeacherStudents(ctx context.Context, teacherID string, page, pageSize int32) ([]*StudentData, int32, error) {
	s.logger.WithFields(logrus.Fields{
		"teacher_id": teacherID,
		"page":       page,
		"page_size":  pageSize,
	}).Info("Getting teacher students")

	offset := (page - 1) * pageSize

	// Get total count
	var total int32
	countQuery := `
		SELECT COUNT(DISTINCT u.id)
		FROM users u
		INNER JOIN course_enrollments ce ON u.id = ce.user_id
		WHERE u.role = 'STUDENT'
		  AND ce.course_id IN (
			SELECT DISTINCT course_id 
			FROM course_enrollments 
			WHERE user_id = $1
		  )
	`
	err := s.db.QueryRowContext(ctx, countQuery, teacherID).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count students: %w", err)
	}

	// Get students with details
	query := `
		SELECT 
			u.id, u.email, u.first_name, u.last_name,
			COUNT(DISTINCT ce.course_id) as total_courses,
			COUNT(DISTINCT ea.id) as total_exam_results,
			COALESCE(AVG(ea.percentage), 0) as average_score,
			COALESCE(AVG(ce.progress), 0) as completion_rate,
			u.status,
			MAX(ea.submitted_at) as last_activity
		FROM users u
		LEFT JOIN course_enrollments ce ON u.id = ce.user_id
		LEFT JOIN exam_attempts ea ON u.id = ea.user_id
		WHERE u.role = 'STUDENT'
		  AND ce.course_id IN (
			SELECT DISTINCT course_id FROM course_enrollments WHERE user_id = $1
		  )
		GROUP BY u.id, u.email, u.first_name, u.last_name, u.status
		ORDER BY last_activity DESC NULLS LAST
		LIMIT $2 OFFSET $3
	`

	rows, err := s.db.QueryContext(ctx, query, teacherID, pageSize, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query students: %w", err)
	}
	defer rows.Close()

	students := []*StudentData{}
	for rows.Next() {
		student := &StudentData{}
		var lastActivity sql.NullTime

		err := rows.Scan(
			&student.UserID,
			&student.Email,
			&student.FirstName,
			&student.LastName,
			&student.TotalCourses,
			&student.TotalExamResults,
			&student.AverageScore,
			&student.CompletionRate,
			&student.Status,
			&lastActivity,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan student: %w", err)
		}

		if lastActivity.Valid {
			student.LastActivity = timestamppb.New(lastActivity.Time)
		}

		students = append(students, student)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating students: %w", err)
	}

	return students, total, nil
}

// GetTeacherExams returns list of exams created by teacher
func (s *TeacherAnalyticsService) GetTeacherExams(ctx context.Context, teacherID string, status string, page, pageSize int32) ([]*ExamData, int32, error) {
	s.logger.WithFields(logrus.Fields{
		"teacher_id": teacherID,
		"status":     status,
		"page":       page,
		"page_size":  pageSize,
	}).Info("Getting teacher exams")

	offset := (page - 1) * pageSize

	// Build status filter
	statusFilter := ""
	if status != "" && status != "all" {
		statusFilter = fmt.Sprintf("AND e.status = '%s'", status)
	}

	// Get total count
	var total int32
	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM exams e
		WHERE e.created_by = $1 %s
	`, statusFilter)
	err := s.db.QueryRowContext(ctx, countQuery, teacherID).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count exams: %w", err)
	}

	// Get exams with details
	query := fmt.Sprintf(`
		SELECT 
			e.id, e.title, COALESCE(e.description, ''), e.subject, e.grade,
			e.difficulty, e.exam_type, e.status, e.duration_minutes,
			e.total_points, e.pass_percentage,
			(SELECT COUNT(*) FROM exam_questions WHERE exam_id = e.id) as question_count,
			COUNT(ea.id) as attempt_count,
			COALESCE(AVG(ea.percentage), 0) as average_score,
			e.created_at, e.published_at
		FROM exams e
		LEFT JOIN exam_attempts ea ON e.id = ea.exam_id AND ea.status = 'submitted'
		WHERE e.created_by = $1 %s
		GROUP BY e.id
		ORDER BY e.created_at DESC
		LIMIT $2 OFFSET $3
	`, statusFilter)

	rows, err := s.db.QueryContext(ctx, query, teacherID, pageSize, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query exams: %w", err)
	}
	defer rows.Close()

	exams := []*ExamData{}
	for rows.Next() {
		exam := &ExamData{}
		var createdAt time.Time
		var publishedAt sql.NullTime

		err := rows.Scan(
			&exam.ID, &exam.Title, &exam.Description, &exam.Subject, &exam.Grade,
			&exam.Difficulty, &exam.ExamType, &exam.Status, &exam.DurationMinutes,
			&exam.TotalPoints, &exam.PassPercentage, &exam.QuestionCount,
			&exam.AttemptCount, &exam.AverageScore, &createdAt, &publishedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan exam: %w", err)
		}

		exam.CreatedAt = timestamppb.New(createdAt)
		if publishedAt.Valid {
			exam.PublishedAt = timestamppb.New(publishedAt.Time)
		}

		exams = append(exams, exam)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating exams: %w", err)
	}

	return exams, total, nil
}

// Helper methods

func (s *TeacherAnalyticsService) parseTimeRange(timeRange string) int {
	switch timeRange {
	case "7d":
		return 7
	case "30d":
		return 30
	case "90d":
		return 90
	case "1y":
		return 365
	default:
		return 30 // Default to 30 days
	}
}

func (s *TeacherAnalyticsService) getTotalExams(ctx context.Context, teacherID string) (int, error) {
	var count int
	query := "SELECT COUNT(*) FROM exams WHERE created_by = $1"
	err := s.db.QueryRowContext(ctx, query, teacherID).Scan(&count)
	return count, err
}

func (s *TeacherAnalyticsService) getTotalStudents(ctx context.Context, teacherID string) (int, error) {
	var count int
	query := `
		SELECT COUNT(DISTINCT user_id)
		FROM course_enrollments
		WHERE course_id IN (
			SELECT DISTINCT course_id FROM course_enrollments WHERE user_id = $1
		)
	`
	err := s.db.QueryRowContext(ctx, query, teacherID).Scan(&count)
	return count, err
}

func (s *TeacherAnalyticsService) getPerformanceMetrics(ctx context.Context, teacherID string, days int) (float64, float64, int, error) {
	query := `
		SELECT 
			COALESCE(AVG(ea.percentage), 0) as average_score,
			COALESCE(COUNT(CASE WHEN ea.passed = true THEN 1 END)::FLOAT / NULLIF(COUNT(*), 0) * 100, 0) as pass_rate,
			COUNT(DISTINCT ea.user_id) as active_students
		FROM exam_attempts ea
		JOIN exams e ON ea.exam_id = e.id
		WHERE e.created_by = $1 
		  AND ea.status = 'submitted'
		  AND ea.submitted_at >= NOW() - INTERVAL '1 day' * $2
	`

	var avgScore, passRate float64
	var activeStudents int
	err := s.db.QueryRowContext(ctx, query, teacherID, days).Scan(&avgScore, &passRate, &activeStudents)
	return avgScore, passRate, activeStudents, err
}

func (s *TeacherAnalyticsService) getCompletionRate(ctx context.Context, teacherID string) (float64, error) {
	var completionRate float64
	query := `
		SELECT COALESCE(AVG(progress), 0)
		FROM course_enrollments
		WHERE course_id IN (
			SELECT DISTINCT course_id FROM course_enrollments WHERE user_id = $1
		)
	`
	err := s.db.QueryRowContext(ctx, query, teacherID).Scan(&completionRate)
	return completionRate, err
}

func (s *TeacherAnalyticsService) getPerformanceTrends(ctx context.Context, teacherID string, days int) ([]*PerformanceTrend, error) {
	query := `
		SELECT 
			TO_CHAR(DATE(ea.submitted_at), 'YYYY-MM-DD') as date,
			AVG(ea.percentage) as average_score,
			COUNT(CASE WHEN ea.passed = true THEN 1 END)::FLOAT / NULLIF(COUNT(*), 0) * 100 as pass_rate,
			COUNT(*) as attempt_count
		FROM exam_attempts ea
		JOIN exams e ON ea.exam_id = e.id
		WHERE e.created_by = $1 
		  AND ea.status = 'submitted'
		  AND ea.submitted_at >= NOW() - INTERVAL '1 day' * $2
		GROUP BY DATE(ea.submitted_at)
		ORDER BY date DESC
	`

	rows, err := s.db.QueryContext(ctx, query, teacherID, days)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	trends := []*PerformanceTrend{}
	for rows.Next() {
		trend := &PerformanceTrend{}
		err := rows.Scan(&trend.Date, &trend.AverageScore, &trend.PassRate, &trend.AttemptCount)
		if err != nil {
			return nil, err
		}
		trends = append(trends, trend)
	}

	return trends, rows.Err()
}

func (s *TeacherAnalyticsService) getTopExams(ctx context.Context, teacherID string, limit int) ([]*ExamPerformance, error) {
	query := `
		SELECT 
			e.id, e.title,
			COUNT(ea.id) as attempt_count,
			COALESCE(AVG(ea.percentage), 0) as average_score,
			COALESCE(COUNT(CASE WHEN ea.passed = true THEN 1 END)::FLOAT / NULLIF(COUNT(*), 0) * 100, 0) as pass_rate
		FROM exams e
		LEFT JOIN exam_attempts ea ON e.id = ea.exam_id AND ea.status = 'submitted'
		WHERE e.created_by = $1
		GROUP BY e.id, e.title
		HAVING COUNT(ea.id) > 0
		ORDER BY average_score DESC, attempt_count DESC
		LIMIT $2
	`

	rows, err := s.db.QueryContext(ctx, query, teacherID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	exams := []*ExamPerformance{}
	for rows.Next() {
		exam := &ExamPerformance{}
		err := rows.Scan(&exam.ExamID, &exam.ExamTitle, &exam.AttemptCount, &exam.AverageScore, &exam.PassRate)
		if err != nil {
			return nil, err
		}
		exams = append(exams, exam)
	}

	return exams, rows.Err()
}


