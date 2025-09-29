package repository

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
)

// QuestionStatisticsRepository handles question statistics data operations
type QuestionStatisticsRepository struct {
	db *pgxpool.Pool
}

// NewQuestionStatisticsRepository creates a new question statistics repository
func NewQuestionStatisticsRepository(db *pgxpool.Pool) *QuestionStatisticsRepository {
	return &QuestionStatisticsRepository{db: db}
}

// GetOverallStatistics retrieves overall question statistics
func (r *QuestionStatisticsRepository) GetOverallStatistics(ctx context.Context, filter *entity.StatisticsFilter) (*entity.QuestionStatistics, error) {
	stats := &entity.QuestionStatistics{
		GradeDistribution:      make(map[string]int64),
		SubjectDistribution:    make(map[string]int64),
		ChapterDistribution:    make(map[string]int64),
		LevelDistribution:      make(map[string]int64),
		LessonDistribution:     make(map[string]int64),
		FormDistribution:       make(map[string]int64),
		TypeDistribution:       make(map[string]int64),
		DifficultyDistribution: make(map[string]int64),
		StatusDistribution:     make(map[string]int64),
		CreatorDistribution:    make(map[string]int64),
		LastUpdated:            time.Now(),
	}

	// Build WHERE clause based on filter
	whereClause, args := r.buildWhereClause(filter)

	// Get overall counts
	err := r.db.QueryRow(ctx, fmt.Sprintf(`
		SELECT 
			COUNT(*) as total_questions,
			COUNT(CASE WHEN q.status = 'ACTIVE' THEN 1 END) as active_questions,
			COUNT(CASE WHEN q.status = 'PENDING' THEN 1 END) as pending_questions,
			COUNT(CASE WHEN q.status = 'DRAFT' THEN 1 END) as draft_questions,
			COALESCE(SUM(q.usage_count), 0) as total_usage,
			COALESCE(AVG(q.usage_count), 0) as average_usage_count,
			COALESCE(AVG(CASE WHEN q.feedback > 0 THEN q.feedback END), 0) as average_feedback,
			COUNT(CASE WHEN q.feedback > 0 THEN 1 END) as questions_with_feedback
		FROM questions q
		JOIN question_codes qc ON q.question_code_id = qc.id
		%s
	`, whereClause), args...).Scan(
		&stats.TotalQuestions,
		&stats.ActiveQuestions,
		&stats.PendingQuestions,
		&stats.DraftQuestions,
		&stats.TotalUsage,
		&stats.AverageUsageCount,
		&stats.AverageFeedback,
		&stats.QuestionsWithFeedback,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get overall statistics: %w", err)
	}

	// Get time-based statistics
	err = r.getTimeBasedStatistics(ctx, stats, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get time-based statistics: %w", err)
	}

	// Get distribution statistics
	err = r.getDistributionStatistics(ctx, stats, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get distribution statistics: %w", err)
	}

	// Get usage and quality statistics
	err = r.getUsageAndQualityStatistics(ctx, stats, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get usage and quality statistics: %w", err)
	}

	// Get error statistics
	err = r.getErrorStatistics(ctx, stats, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get error statistics: %w", err)
	}

	return stats, nil
}

// getTimeBasedStatistics retrieves time-based statistics
func (r *QuestionStatisticsRepository) getTimeBasedStatistics(ctx context.Context, stats *entity.QuestionStatistics, filter *entity.StatisticsFilter) error {
	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	weekStart := today.AddDate(0, 0, -int(today.Weekday()))
	monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())

	whereClause, args := r.buildWhereClause(filter)

	err := r.db.QueryRow(ctx, fmt.Sprintf(`
		SELECT 
			COUNT(CASE WHEN q.created_at >= $%d THEN 1 END) as today_created,
			COUNT(CASE WHEN q.created_at >= $%d THEN 1 END) as week_created,
			COUNT(CASE WHEN q.created_at >= $%d THEN 1 END) as month_created
		FROM questions q
		JOIN question_codes qc ON q.question_code_id = qc.id
		%s
	`, len(args)+1, len(args)+2, len(args)+3, whereClause),
		append(args, today, weekStart, monthStart)...).Scan(
		&stats.QuestionsCreatedToday,
		&stats.QuestionsCreatedThisWeek,
		&stats.QuestionsCreatedThisMonth,
	)
	if err != nil {
		return fmt.Errorf("failed to get time-based statistics: %w", err)
	}

	return nil
}

// getDistributionStatistics retrieves distribution statistics
func (r *QuestionStatisticsRepository) getDistributionStatistics(ctx context.Context, stats *entity.QuestionStatistics, filter *entity.StatisticsFilter) error {
	whereClause, args := r.buildWhereClause(filter)

	// Grade distribution
	rows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT qc.grade, COUNT(*)
		FROM questions q
		JOIN question_codes qc ON q.question_code_id = qc.id
		%s
		GROUP BY qc.grade
		ORDER BY qc.grade
	`, whereClause), args...)
	if err != nil {
		return fmt.Errorf("failed to get grade distribution: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var grade string
		var count int64
		if err := rows.Scan(&grade, &count); err != nil {
			return fmt.Errorf("failed to scan grade distribution: %w", err)
		}
		stats.GradeDistribution[grade] = count
	}

	// Subject distribution
	rows, err = r.db.Query(ctx, fmt.Sprintf(`
		SELECT qc.subject, COUNT(*)
		FROM questions q
		JOIN question_codes qc ON q.question_code_id = qc.id
		%s
		GROUP BY qc.subject
		ORDER BY qc.subject
	`, whereClause), args...)
	if err != nil {
		return fmt.Errorf("failed to get subject distribution: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var subject string
		var count int64
		if err := rows.Scan(&subject, &count); err != nil {
			return fmt.Errorf("failed to scan subject distribution: %w", err)
		}
		stats.SubjectDistribution[subject] = count
	}

	// Chapter distribution
	rows, err = r.db.Query(ctx, fmt.Sprintf(`
		SELECT qc.chapter, COUNT(*)
		FROM questions q
		JOIN question_codes qc ON q.question_code_id = qc.id
		%s
		GROUP BY qc.chapter
		ORDER BY qc.chapter
	`, whereClause), args...)
	if err != nil {
		return fmt.Errorf("failed to get chapter distribution: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var chapter string
		var count int64
		if err := rows.Scan(&chapter, &count); err != nil {
			return fmt.Errorf("failed to scan chapter distribution: %w", err)
		}
		stats.ChapterDistribution[chapter] = count
	}

	// Level distribution
	rows, err = r.db.Query(ctx, fmt.Sprintf(`
		SELECT qc.level, COUNT(*)
		FROM questions q
		JOIN question_codes qc ON q.question_code_id = qc.id
		%s
		GROUP BY qc.level
		ORDER BY qc.level
	`, whereClause), args...)
	if err != nil {
		return fmt.Errorf("failed to get level distribution: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var level string
		var count int64
		if err := rows.Scan(&level, &count); err != nil {
			return fmt.Errorf("failed to scan level distribution: %w", err)
		}
		stats.LevelDistribution[level] = count
	}

	// Type distribution
	rows, err = r.db.Query(ctx, fmt.Sprintf(`
		SELECT q.type, COUNT(*)
		FROM questions q
		JOIN question_codes qc ON q.question_code_id = qc.id
		%s
		GROUP BY q.type
		ORDER BY q.type
	`, whereClause), args...)
	if err != nil {
		return fmt.Errorf("failed to get type distribution: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var qType string
		var count int64
		if err := rows.Scan(&qType, &count); err != nil {
			return fmt.Errorf("failed to scan type distribution: %w", err)
		}
		stats.TypeDistribution[qType] = count
	}

	// Difficulty distribution
	rows, err = r.db.Query(ctx, fmt.Sprintf(`
		SELECT q.difficulty, COUNT(*)
		FROM questions q
		JOIN question_codes qc ON q.question_code_id = qc.id
		%s
		GROUP BY q.difficulty
		ORDER BY q.difficulty
	`, whereClause), args...)
	if err != nil {
		return fmt.Errorf("failed to get difficulty distribution: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var difficulty string
		var count int64
		if err := rows.Scan(&difficulty, &count); err != nil {
			return fmt.Errorf("failed to scan difficulty distribution: %w", err)
		}
		stats.DifficultyDistribution[difficulty] = count
	}

	// Status distribution
	rows, err = r.db.Query(ctx, fmt.Sprintf(`
		SELECT q.status, COUNT(*)
		FROM questions q
		JOIN question_codes qc ON q.question_code_id = qc.id
		%s
		GROUP BY q.status
		ORDER BY q.status
	`, whereClause), args...)
	if err != nil {
		return fmt.Errorf("failed to get status distribution: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var status string
		var count int64
		if err := rows.Scan(&status, &count); err != nil {
			return fmt.Errorf("failed to scan status distribution: %w", err)
		}
		stats.StatusDistribution[status] = count
	}

	return nil
}

// getUsageAndQualityStatistics retrieves usage and quality statistics
func (r *QuestionStatisticsRepository) getUsageAndQualityStatistics(ctx context.Context, stats *entity.QuestionStatistics, filter *entity.StatisticsFilter) error {
	whereClause, args := r.buildWhereClause(filter)

	// Most used questions
	rows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT q.id, q.content, qc.code, q.usage_count, 
			   COALESCE(q.feedback, 0), q.type, q.difficulty, q.created_at
		FROM questions q
		JOIN question_codes qc ON q.question_code_id = qc.id
		%s
		ORDER BY q.usage_count DESC
		LIMIT 10
	`, whereClause), args...)
	if err != nil {
		return fmt.Errorf("failed to get most used questions: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var info entity.QuestionUsageInfo
		if err := rows.Scan(&info.QuestionID, &info.Content, &info.QuestionCode,
			&info.UsageCount, &info.Feedback, &info.Type, &info.Difficulty, &info.CreatedAt); err != nil {
			return fmt.Errorf("failed to scan most used question: %w", err)
		}
		stats.MostUsedQuestions = append(stats.MostUsedQuestions, info)
	}

	// High rated questions
	rows, err = r.db.Query(ctx, fmt.Sprintf(`
		SELECT q.id, q.content, qc.code, q.usage_count, 
			   q.feedback, q.type, q.difficulty, q.created_at
		FROM questions q
		JOIN question_codes qc ON q.question_code_id = qc.id
		%s AND q.feedback > 0
		ORDER BY q.feedback DESC
		LIMIT 10
	`, whereClause), args...)
	if err != nil {
		return fmt.Errorf("failed to get high rated questions: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var info entity.QuestionUsageInfo
		if err := rows.Scan(&info.QuestionID, &info.Content, &info.QuestionCode,
			&info.UsageCount, &info.Feedback, &info.Type, &info.Difficulty, &info.CreatedAt); err != nil {
			return fmt.Errorf("failed to scan high rated question: %w", err)
		}
		stats.HighRatedQuestions = append(stats.HighRatedQuestions, info)
	}

	// Top creators
	rows, err = r.db.Query(ctx, fmt.Sprintf(`
		SELECT q.creator, COUNT(*), 
			   COALESCE(AVG(CASE WHEN q.feedback > 0 THEN q.feedback END), 0),
			   MAX(q.created_at)
		FROM questions q
		JOIN question_codes qc ON q.question_code_id = qc.id
		%s
		GROUP BY q.creator
		ORDER BY COUNT(*) DESC
		LIMIT 10
	`, whereClause), args...)
	if err != nil {
		return fmt.Errorf("failed to get top creators: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var creator entity.CreatorInfo
		if err := rows.Scan(&creator.Creator, &creator.QuestionCount,
			&creator.AverageFeedback, &creator.LastActivity); err != nil {
			return fmt.Errorf("failed to scan creator info: %w", err)
		}
		stats.TopCreators = append(stats.TopCreators, creator)
	}

	return nil
}

// getErrorStatistics retrieves error statistics
func (r *QuestionStatisticsRepository) getErrorStatistics(ctx context.Context, stats *entity.QuestionStatistics, filter *entity.StatisticsFilter) error {
	whereClause, args := r.buildWhereClause(filter)

	// Get error counts from parse_errors table
	err := r.db.QueryRow(ctx, fmt.Sprintf(`
		SELECT 
			COUNT(DISTINCT pe.question_id) as questions_with_errors,
			COUNT(DISTINCT CASE WHEN pe.severity = 'WARNING' THEN pe.question_id END) as questions_with_warnings
		FROM parse_errors pe
		JOIN questions q ON pe.question_id = q.id
		JOIN question_codes qc ON q.question_code_id = qc.id
		%s
	`, whereClause), args...).Scan(
		&stats.QuestionsWithErrors,
		&stats.QuestionsWithWarnings,
	)
	if err != nil {
		// If parse_errors table doesn't exist or is empty, set to 0
		stats.QuestionsWithErrors = 0
		stats.QuestionsWithWarnings = 0
	}

	// Calculate parse error rate
	if stats.TotalQuestions > 0 {
		stats.ParseErrorRate = float64(stats.QuestionsWithErrors) / float64(stats.TotalQuestions) * 100
	}

	// Get image statistics
	err = r.db.QueryRow(ctx, fmt.Sprintf(`
		SELECT 
			COUNT(DISTINCT qi.question_id) as questions_with_images,
			COUNT(qi.id) as total_images
		FROM question_images qi
		JOIN questions q ON qi.question_id = q.id
		JOIN question_codes qc ON q.question_code_id = qc.id
		%s
	`, whereClause), args...).Scan(
		&stats.QuestionsWithImages,
		&stats.TotalImages,
	)
	if err != nil {
		// If question_images table doesn't exist or is empty, set to 0
		stats.QuestionsWithImages = 0
		stats.TotalImages = 0
	}

	// Calculate image upload success rate (simplified)
	if stats.TotalImages > 0 {
		successfulImages := stats.TotalImages // Assume all existing images are successful
		stats.ImageUploadSuccessRate = float64(successfulImages) / float64(stats.TotalImages) * 100
	} else {
		stats.ImageUploadSuccessRate = 100.0 // No images means 100% success rate
	}

	return nil
}

// buildWhereClause builds WHERE clause based on filter
func (r *QuestionStatisticsRepository) buildWhereClause(filter *entity.StatisticsFilter) (string, []interface{}) {
	if filter == nil {
		return "", []interface{}{}
	}

	var conditions []string
	var args []interface{}
	argIndex := 1

	// Time range filters
	if filter.StartDate != nil {
		conditions = append(conditions, fmt.Sprintf("q.created_at >= $%d", argIndex))
		args = append(args, *filter.StartDate)
		argIndex++
	}
	if filter.EndDate != nil {
		conditions = append(conditions, fmt.Sprintf("q.created_at <= $%d", argIndex))
		args = append(args, *filter.EndDate)
		argIndex++
	}

	// Question code filters
	if len(filter.Grade) > 0 {
		placeholders := make([]string, len(filter.Grade))
		for i, grade := range filter.Grade {
			placeholders[i] = fmt.Sprintf("$%d", argIndex)
			args = append(args, grade)
			argIndex++
		}
		conditions = append(conditions, fmt.Sprintf("qc.grade IN (%s)", strings.Join(placeholders, ",")))
	}

	if len(filter.Subject) > 0 {
		placeholders := make([]string, len(filter.Subject))
		for i, subject := range filter.Subject {
			placeholders[i] = fmt.Sprintf("$%d", argIndex)
			args = append(args, subject)
			argIndex++
		}
		conditions = append(conditions, fmt.Sprintf("qc.subject IN (%s)", strings.Join(placeholders, ",")))
	}

	// Question property filters
	if len(filter.Type) > 0 {
		placeholders := make([]string, len(filter.Type))
		for i, qType := range filter.Type {
			placeholders[i] = fmt.Sprintf("$%d", argIndex)
			args = append(args, qType)
			argIndex++
		}
		conditions = append(conditions, fmt.Sprintf("q.type IN (%s)", strings.Join(placeholders, ",")))
	}

	if len(filter.Status) > 0 {
		placeholders := make([]string, len(filter.Status))
		for i, status := range filter.Status {
			placeholders[i] = fmt.Sprintf("$%d", argIndex)
			args = append(args, status)
			argIndex++
		}
		conditions = append(conditions, fmt.Sprintf("q.status IN (%s)", strings.Join(placeholders, ",")))
	}

	// Usage filters
	if filter.MinUsage != nil {
		conditions = append(conditions, fmt.Sprintf("q.usage_count >= $%d", argIndex))
		args = append(args, *filter.MinUsage)
		argIndex++
	}
	if filter.MaxUsage != nil {
		conditions = append(conditions, fmt.Sprintf("q.usage_count <= $%d", argIndex))
		args = append(args, *filter.MaxUsage)
		argIndex++
	}

	// Feedback filters
	if filter.MinFeedback != nil {
		conditions = append(conditions, fmt.Sprintf("q.feedback >= $%d", argIndex))
		args = append(args, *filter.MinFeedback)
		argIndex++
	}
	if filter.MaxFeedback != nil {
		conditions = append(conditions, fmt.Sprintf("q.feedback <= $%d", argIndex))
		args = append(args, *filter.MaxFeedback)
		argIndex++
	}

	if len(conditions) == 0 {
		return "", args
	}

	return "WHERE " + strings.Join(conditions, " AND "), args
}

// GetQuestionTrends retrieves trending data for questions
func (r *QuestionStatisticsRepository) GetQuestionTrends(ctx context.Context, filter *entity.StatisticsFilter) (*entity.QuestionTrends, error) {
	trends := &entity.QuestionTrends{
		LastUpdated: time.Now(),
	}

	whereClause, args := r.buildWhereClause(filter)

	// Daily trends (last 30 days)
	rows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT DATE(q.created_at) as date, COUNT(*) as count
		FROM questions q
		JOIN question_codes qc ON q.question_code_id = qc.id
		%s AND q.created_at >= NOW() - INTERVAL '30 days'
		GROUP BY DATE(q.created_at)
		ORDER BY date
	`, whereClause), args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get daily trends: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var date time.Time
		var count int64
		if err := rows.Scan(&date, &count); err != nil {
			return nil, fmt.Errorf("failed to scan daily trend: %w", err)
		}
		trends.DailyCreation = append(trends.DailyCreation, entity.TrendData{
			Date:  date,
			Value: count,
			Label: date.Format("2006-01-02"),
		})
	}

	// Weekly trends (last 12 weeks)
	rows, err = r.db.Query(ctx, fmt.Sprintf(`
		SELECT DATE_TRUNC('week', q.created_at) as week, COUNT(*) as count
		FROM questions q
		JOIN question_codes qc ON q.question_code_id = qc.id
		%s AND q.created_at >= NOW() - INTERVAL '12 weeks'
		GROUP BY DATE_TRUNC('week', q.created_at)
		ORDER BY week
	`, whereClause), args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get weekly trends: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var week time.Time
		var count int64
		if err := rows.Scan(&week, &count); err != nil {
			return nil, fmt.Errorf("failed to scan weekly trend: %w", err)
		}
		trends.WeeklyCreation = append(trends.WeeklyCreation, entity.TrendData{
			Date:  week,
			Value: count,
			Label: week.Format("2006-W02"),
		})
	}

	// Monthly trends (last 12 months)
	rows, err = r.db.Query(ctx, fmt.Sprintf(`
		SELECT DATE_TRUNC('month', q.created_at) as month, COUNT(*) as count
		FROM questions q
		JOIN question_codes qc ON q.question_code_id = qc.id
		%s AND q.created_at >= NOW() - INTERVAL '12 months'
		GROUP BY DATE_TRUNC('month', q.created_at)
		ORDER BY month
	`, whereClause), args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get monthly trends: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var month time.Time
		var count int64
		if err := rows.Scan(&month, &count); err != nil {
			return nil, fmt.Errorf("failed to scan monthly trend: %w", err)
		}
		trends.MonthlyCreation = append(trends.MonthlyCreation, entity.TrendData{
			Date:  month,
			Value: count,
			Label: month.Format("2006-01"),
		})
	}

	// Calculate growth rates
	if len(trends.DailyCreation) >= 2 {
		recent := trends.DailyCreation[len(trends.DailyCreation)-1].Value
		previous := trends.DailyCreation[len(trends.DailyCreation)-2].Value
		if previous > 0 {
			trends.DailyGrowthRate = float64(recent-previous) / float64(previous) * 100
		}
	}

	if len(trends.WeeklyCreation) >= 2 {
		recent := trends.WeeklyCreation[len(trends.WeeklyCreation)-1].Value
		previous := trends.WeeklyCreation[len(trends.WeeklyCreation)-2].Value
		if previous > 0 {
			trends.WeeklyGrowthRate = float64(recent-previous) / float64(previous) * 100
		}
	}

	if len(trends.MonthlyCreation) >= 2 {
		recent := trends.MonthlyCreation[len(trends.MonthlyCreation)-1].Value
		previous := trends.MonthlyCreation[len(trends.MonthlyCreation)-2].Value
		if previous > 0 {
			trends.MonthlyGrowthRate = float64(recent-previous) / float64(previous) * 100
		}
	}

	return trends, nil
}

// GetDashboardSummary retrieves a summary for dashboard display
func (r *QuestionStatisticsRepository) GetDashboardSummary(ctx context.Context, filter *entity.StatisticsFilter) (*entity.DashboardSummary, error) {
	summary := &entity.DashboardSummary{
		LastUpdated: time.Now(),
	}

	whereClause, args := r.buildWhereClause(filter)

	// Get key metrics
	err := r.db.QueryRow(ctx, fmt.Sprintf(`
		SELECT
			COUNT(*) as total_questions,
			COUNT(CASE WHEN q.status = 'ACTIVE' THEN 1 END) as active_questions,
			COUNT(CASE WHEN DATE(q.created_at) = CURRENT_DATE THEN 1 END) as today_created,
			COALESCE(SUM(q.usage_count), 0) as total_usage,
			COALESCE(AVG(q.usage_count), 0) as average_usage,
			COALESCE(AVG(CASE WHEN q.feedback > 0 THEN q.feedback END), 0) as average_quality
		FROM questions q
		JOIN question_codes qc ON q.question_code_id = qc.id
		%s
	`, whereClause), args...).Scan(
		&summary.TotalQuestions,
		&summary.ActiveQuestions,
		&summary.TodayCreated,
		&summary.TotalUsage,
		&summary.AverageUsage,
		&summary.AverageQuality,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get dashboard summary: %w", err)
	}

	// Calculate completion rate (active questions / total questions)
	if summary.TotalQuestions > 0 {
		summary.CompletionRate = float64(summary.ActiveQuestions) / float64(summary.TotalQuestions) * 100
	}

	// Calculate popularity score (average usage normalized)
	if summary.AverageUsage > 0 {
		summary.PopularityScore = summary.AverageUsage / 10.0 // Normalize to 0-10 scale
		if summary.PopularityScore > 10 {
			summary.PopularityScore = 10
		}
	}

	// Get top distributions
	err = r.db.QueryRow(ctx, fmt.Sprintf(`
		SELECT
			(SELECT qc.grade FROM questions q JOIN question_codes qc ON q.question_code_id = qc.id %s GROUP BY qc.grade ORDER BY COUNT(*) DESC LIMIT 1) as top_grade,
			(SELECT qc.subject FROM questions q JOIN question_codes qc ON q.question_code_id = qc.id %s GROUP BY qc.subject ORDER BY COUNT(*) DESC LIMIT 1) as top_subject,
			(SELECT q.type FROM questions q JOIN question_codes qc ON q.question_code_id = qc.id %s GROUP BY q.type ORDER BY COUNT(*) DESC LIMIT 1) as top_type,
			(SELECT q.difficulty FROM questions q JOIN question_codes qc ON q.question_code_id = qc.id %s GROUP BY q.difficulty ORDER BY COUNT(*) DESC LIMIT 1) as top_difficulty
	`, whereClause, whereClause, whereClause, whereClause), args...).Scan(
		&summary.TopGrade,
		&summary.TopSubject,
		&summary.TopType,
		&summary.TopDifficulty,
	)
	if err != nil {
		// Set defaults if query fails
		summary.TopGrade = "N/A"
		summary.TopSubject = "N/A"
		summary.TopType = "N/A"
		summary.TopDifficulty = "N/A"
	}

	// Get recent questions
	rows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT q.id, q.content, qc.code, q.usage_count,
			   COALESCE(q.feedback, 0), q.type, q.difficulty, q.created_at
		FROM questions q
		JOIN question_codes qc ON q.question_code_id = qc.id
		%s
		ORDER BY q.created_at DESC
		LIMIT 5
	`, whereClause), args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent questions: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var info entity.QuestionUsageInfo
		if err := rows.Scan(&info.QuestionID, &info.Content, &info.QuestionCode,
			&info.UsageCount, &info.Feedback, &info.Type, &info.Difficulty, &info.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan recent question: %w", err)
		}
		summary.RecentQuestions = append(summary.RecentQuestions, info)
	}

	// Calculate weekly growth
	weekAgo := time.Now().AddDate(0, 0, -7)
	var questionsThisWeek, questionsLastWeek int64

	err = r.db.QueryRow(ctx, fmt.Sprintf(`
		SELECT
			COUNT(CASE WHEN q.created_at >= $%d THEN 1 END) as this_week,
			COUNT(CASE WHEN q.created_at >= $%d AND q.created_at < $%d THEN 1 END) as last_week
		FROM questions q
		JOIN question_codes qc ON q.question_code_id = qc.id
		%s
	`, len(args)+1, len(args)+2, len(args)+3, whereClause),
		append(args, weekAgo, weekAgo.AddDate(0, 0, -7), weekAgo)...).Scan(
		&questionsThisWeek,
		&questionsLastWeek,
	)
	if err == nil && questionsLastWeek > 0 {
		summary.WeeklyGrowth = float64(questionsThisWeek-questionsLastWeek) / float64(questionsLastWeek) * 100
	}

	return summary, nil
}

// GetQuestionCodeStatistics retrieves statistics grouped by question code parameters
func (r *QuestionStatisticsRepository) GetQuestionCodeStatistics(ctx context.Context, filter *entity.StatisticsFilter) ([]entity.QuestionCodeStatistics, error) {
	whereClause, args := r.buildWhereClause(filter)

	rows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT
			qc.grade, qc.subject, qc.chapter, qc.level,
			COALESCE(qc.lesson, '') as lesson, COALESCE(qc.form, '') as form,
			COUNT(*) as question_count,
			COUNT(CASE WHEN q.status = 'ACTIVE' THEN 1 END) as active_count,
			COUNT(CASE WHEN q.status = 'PENDING' THEN 1 END) as pending_count,
			COALESCE(SUM(q.usage_count), 0) as total_usage,
			COALESCE(AVG(q.usage_count), 0) as average_usage,
			COALESCE(AVG(CASE WHEN q.feedback > 0 THEN q.feedback END), 0) as average_feedback
		FROM questions q
		JOIN question_codes qc ON q.question_code_id = qc.id
		%s
		GROUP BY qc.grade, qc.subject, qc.chapter, qc.level, qc.lesson, qc.form
		ORDER BY qc.grade, qc.subject, qc.chapter, qc.level, qc.lesson, qc.form
	`, whereClause), args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get question code statistics: %w", err)
	}
	defer rows.Close()

	var statistics []entity.QuestionCodeStatistics
	for rows.Next() {
		var stat entity.QuestionCodeStatistics
		if err := rows.Scan(
			&stat.Grade, &stat.Subject, &stat.Chapter, &stat.Level,
			&stat.Lesson, &stat.Form, &stat.QuestionCount, &stat.ActiveCount,
			&stat.PendingCount, &stat.TotalUsage, &stat.AverageUsage, &stat.AverageFeedback,
		); err != nil {
			return nil, fmt.Errorf("failed to scan question code statistics: %w", err)
		}
		stat.LastUpdated = time.Now()
		statistics = append(statistics, stat)
	}

	return statistics, nil
}
