package analytics

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/sirupsen/logrus"
)

// DashboardService provides dashboard analytics functionality
type DashboardService struct {
	db       *sql.DB
	examRepo interfaces.ExamRepository
	logger   *logrus.Logger
}

// NewDashboardService creates a new dashboard service
func NewDashboardService(db *sql.DB, examRepo interfaces.ExamRepository, logger *logrus.Logger) *DashboardService {
	if logger == nil {
		logger = logrus.New()
		logger.SetFormatter(&logrus.TextFormatter{
			FullTimestamp: true,
		})
	}

	return &DashboardService{
		db:       db,
		examRepo: examRepo,
		logger:   logger,
	}
}

// DashboardOverview contains high-level dashboard metrics
type DashboardOverview struct {
	TotalExams         int                 `json:"total_exams"`
	ActiveExams        int                 `json:"active_exams"`
	TotalAttempts      int                 `json:"total_attempts"`
	TotalUsers         int                 `json:"total_users"`
	AverageScore       float64             `json:"average_score"`
	SystemPassRate     float64             `json:"system_pass_rate"`
	PopularSubjects    []*SubjectMetrics   `json:"popular_subjects"`
	RecentActivity     []*ActivityMetrics  `json:"recent_activity"`
	PerformanceTrends  []*PerformanceTrend `json:"performance_trends"`
	TopPerformingExams []*ExamPerformance  `json:"top_performing_exams"`
	GeneratedAt        time.Time           `json:"generated_at"`
}

// SubjectMetrics contains subject-specific metrics
type SubjectMetrics struct {
	Subject      string  `json:"subject"`
	ExamCount    int     `json:"exam_count"`
	AttemptCount int     `json:"attempt_count"`
	AverageScore float64 `json:"average_score"`
	PassRate     float64 `json:"pass_rate"`
}

// ActivityMetrics contains activity metrics for a time period
type ActivityMetrics struct {
	Date              string `json:"date"`
	ExamsCreated      int    `json:"exams_created"`
	AttemptsStarted   int    `json:"attempts_started"`
	AttemptsCompleted int    `json:"attempts_completed"`
	NewUsers          int    `json:"new_users"`
}

// PerformanceTrend contains performance trend data
type PerformanceTrend struct {
	Date         string  `json:"date"`
	AverageScore float64 `json:"average_score"`
	PassRate     float64 `json:"pass_rate"`
	AttemptCount int     `json:"attempt_count"`
}

// GetDashboardOverview returns comprehensive dashboard overview
func (s *DashboardService) GetDashboardOverview(ctx context.Context) (*DashboardOverview, error) {
	s.logger.Info("Generating dashboard overview")

	overview := &DashboardOverview{
		GeneratedAt: time.Now(),
	}

	// Get basic counts
	if err := s.getBasicCounts(ctx, overview); err != nil {
		return nil, fmt.Errorf("failed to get basic counts: %w", err)
	}

	// Get performance metrics
	if err := s.getPerformanceMetrics(ctx, overview); err != nil {
		return nil, fmt.Errorf("failed to get performance metrics: %w", err)
	}

	// Get popular subjects
	popularSubjects, err := s.getPopularSubjects(ctx)
	if err != nil {
		s.logger.WithError(err).Warn("Failed to get popular subjects")
		popularSubjects = []*SubjectMetrics{}
	}
	overview.PopularSubjects = popularSubjects

	// Get recent activity
	recentActivity, err := s.getRecentActivity(ctx)
	if err != nil {
		s.logger.WithError(err).Warn("Failed to get recent activity")
		recentActivity = []*ActivityMetrics{}
	}
	overview.RecentActivity = recentActivity

	// Get performance trends
	performanceTrends, err := s.getPerformanceTrends(ctx)
	if err != nil {
		s.logger.WithError(err).Warn("Failed to get performance trends")
		performanceTrends = []*PerformanceTrend{}
	}
	overview.PerformanceTrends = performanceTrends

	// Get top performing exams
	topExams, err := s.getTopPerformingExams(ctx)
	if err != nil {
		s.logger.WithError(err).Warn("Failed to get top performing exams")
		topExams = []*ExamPerformance{}
	}
	overview.TopPerformingExams = topExams

	s.logger.Info("Dashboard overview generated successfully")
	return overview, nil
}

// getBasicCounts retrieves basic count metrics
func (s *DashboardService) getBasicCounts(ctx context.Context, overview *DashboardOverview) error {
	query := `
		SELECT 
			(SELECT COUNT(*) FROM exams) as total_exams,
			(SELECT COUNT(*) FROM exams WHERE status = 'published') as active_exams,
			(SELECT COUNT(*) FROM exam_attempts) as total_attempts,
			(SELECT COUNT(DISTINCT user_id) FROM exam_attempts) as total_users
	`

	err := s.db.QueryRowContext(ctx, query).Scan(
		&overview.TotalExams,
		&overview.ActiveExams,
		&overview.TotalAttempts,
		&overview.TotalUsers,
	)
	if err != nil {
		return fmt.Errorf("failed to get basic counts: %w", err)
	}

	return nil
}

// getPerformanceMetrics retrieves performance metrics
func (s *DashboardService) getPerformanceMetrics(ctx context.Context, overview *DashboardOverview) error {
	query := `
		SELECT 
			COALESCE(AVG(percentage), 0) as average_score,
			COUNT(CASE WHEN passed = true THEN 1 END)::FLOAT / NULLIF(COUNT(*), 0) * 100 as pass_rate
		FROM exam_attempts
		WHERE status = 'submitted'
	`

	var avgScore, passRate sql.NullFloat64

	err := s.db.QueryRowContext(ctx, query).Scan(&avgScore, &passRate)
	if err != nil {
		return fmt.Errorf("failed to get performance metrics: %w", err)
	}

	if avgScore.Valid {
		overview.AverageScore = avgScore.Float64
	}
	if passRate.Valid {
		overview.SystemPassRate = passRate.Float64
	}

	return nil
}

// getPopularSubjects retrieves popular subjects metrics
func (s *DashboardService) getPopularSubjects(ctx context.Context) ([]*SubjectMetrics, error) {
	query := `
		SELECT 
			e.subject,
			COUNT(DISTINCT e.id) as exam_count,
			COUNT(ea.id) as attempt_count,
			COALESCE(AVG(CASE WHEN ea.status = 'submitted' THEN ea.percentage END), 0) as average_score,
			COUNT(CASE WHEN ea.passed = true THEN 1 END)::FLOAT / NULLIF(COUNT(CASE WHEN ea.status = 'submitted' THEN 1 END), 0) * 100 as pass_rate
		FROM exams e
		LEFT JOIN exam_attempts ea ON e.id = ea.exam_id
		WHERE e.subject IS NOT NULL AND e.subject != ''
		GROUP BY e.subject
		ORDER BY attempt_count DESC
		LIMIT 10
	`

	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query popular subjects: %w", err)
	}
	defer rows.Close()

	var subjects []*SubjectMetrics
	for rows.Next() {
		var subject SubjectMetrics
		var avgScore, passRate sql.NullFloat64

		err := rows.Scan(
			&subject.Subject,
			&subject.ExamCount,
			&subject.AttemptCount,
			&avgScore,
			&passRate,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan subject metrics: %w", err)
		}

		if avgScore.Valid {
			subject.AverageScore = avgScore.Float64
		}
		if passRate.Valid {
			subject.PassRate = passRate.Float64
		}

		subjects = append(subjects, &subject)
	}

	return subjects, nil
}

// getRecentActivity retrieves recent activity metrics
func (s *DashboardService) getRecentActivity(ctx context.Context) ([]*ActivityMetrics, error) {
	query := `
		SELECT 
			DATE(created_at) as date,
			COUNT(CASE WHEN created_at IS NOT NULL THEN 1 END) as exams_created,
			0 as attempts_started,
			0 as attempts_completed,
			0 as new_users
		FROM exams
		WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
		GROUP BY DATE(created_at)
		
		UNION ALL
		
		SELECT 
			DATE(started_at) as date,
			0 as exams_created,
			COUNT(*) as attempts_started,
			COUNT(CASE WHEN status = 'submitted' THEN 1 END) as attempts_completed,
			0 as new_users
		FROM exam_attempts
		WHERE started_at >= CURRENT_DATE - INTERVAL '30 days'
		GROUP BY DATE(started_at)
		
		ORDER BY date DESC
		LIMIT 30
	`

	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query recent activity: %w", err)
	}
	defer rows.Close()

	activityMap := make(map[string]*ActivityMetrics)
	for rows.Next() {
		var date time.Time
		var examsCreated, attemptsStarted, attemptsCompleted, newUsers int

		err := rows.Scan(&date, &examsCreated, &attemptsStarted, &attemptsCompleted, &newUsers)
		if err != nil {
			return nil, fmt.Errorf("failed to scan activity metrics: %w", err)
		}

		dateStr := date.Format("2006-01-02")
		if activity, exists := activityMap[dateStr]; exists {
			activity.ExamsCreated += examsCreated
			activity.AttemptsStarted += attemptsStarted
			activity.AttemptsCompleted += attemptsCompleted
			activity.NewUsers += newUsers
		} else {
			activityMap[dateStr] = &ActivityMetrics{
				Date:              dateStr,
				ExamsCreated:      examsCreated,
				AttemptsStarted:   attemptsStarted,
				AttemptsCompleted: attemptsCompleted,
				NewUsers:          newUsers,
			}
		}
	}

	// Convert map to slice
	var activities []*ActivityMetrics
	for _, activity := range activityMap {
		activities = append(activities, activity)
	}

	return activities, nil
}

// getPerformanceTrends retrieves performance trends
func (s *DashboardService) getPerformanceTrends(ctx context.Context) ([]*PerformanceTrend, error) {
	query := `
		SELECT 
			DATE(submitted_at) as date,
			AVG(percentage) as average_score,
			COUNT(CASE WHEN passed = true THEN 1 END)::FLOAT / COUNT(*) * 100 as pass_rate,
			COUNT(*) as attempt_count
		FROM exam_attempts
		WHERE status = 'submitted' AND submitted_at >= CURRENT_DATE - INTERVAL '30 days'
		GROUP BY DATE(submitted_at)
		ORDER BY date DESC
		LIMIT 30
	`

	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query performance trends: %w", err)
	}
	defer rows.Close()

	var trends []*PerformanceTrend
	for rows.Next() {
		var trend PerformanceTrend
		var date time.Time
		var avgScore, passRate sql.NullFloat64

		err := rows.Scan(&date, &avgScore, &passRate, &trend.AttemptCount)
		if err != nil {
			return nil, fmt.Errorf("failed to scan performance trend: %w", err)
		}

		trend.Date = date.Format("2006-01-02")
		if avgScore.Valid {
			trend.AverageScore = avgScore.Float64
		}
		if passRate.Valid {
			trend.PassRate = passRate.Float64
		}

		trends = append(trends, &trend)
	}

	return trends, nil
}

// getTopPerformingExams retrieves top performing exams
func (s *DashboardService) getTopPerformingExams(ctx context.Context) ([]*ExamPerformance, error) {
	query := `
		SELECT 
			e.id,
			e.title,
			COUNT(ea.id) as attempt_count,
			COALESCE(AVG(CASE WHEN ea.status = 'submitted' THEN ea.percentage END), 0) as average_score,
			COUNT(CASE WHEN ea.passed = true THEN 1 END)::FLOAT / NULLIF(COUNT(CASE WHEN ea.status = 'submitted' THEN 1 END), 0) * 100 as pass_rate
		FROM exams e
		LEFT JOIN exam_attempts ea ON e.id = ea.exam_id
		WHERE e.status = 'published'
		GROUP BY e.id, e.title
		HAVING COUNT(ea.id) >= 5  -- Only exams with at least 5 attempts
		ORDER BY average_score DESC, attempt_count DESC
		LIMIT 10
	`

	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query top performing exams: %w", err)
	}
	defer rows.Close()

	var exams []*ExamPerformance
	for rows.Next() {
		var exam ExamPerformance
		var avgScore, passRate sql.NullFloat64

		err := rows.Scan(
			&exam.ExamID,
			&exam.ExamTitle,
			&exam.AttemptCount,
			&avgScore,
			&passRate,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan exam performance: %w", err)
		}

		if avgScore.Valid {
			exam.AverageScore = avgScore.Float64
		}
		if passRate.Valid {
			exam.PassRate = passRate.Float64
		}

		exams = append(exams, &exam)
	}

	return exams, nil
}

