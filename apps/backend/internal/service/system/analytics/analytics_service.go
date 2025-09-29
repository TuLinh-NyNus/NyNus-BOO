package analytics

import (
	"context"
	"fmt"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/sirupsen/logrus"
)

// AnalyticsService provides analytics and monitoring functionality
type AnalyticsService struct {
	examRepo interfaces.ExamRepository
	logger   *logrus.Logger
}

// NewAnalyticsService creates a new analytics service
func NewAnalyticsService(examRepo interfaces.ExamRepository, logger *logrus.Logger) *AnalyticsService {
	if logger == nil {
		logger = logrus.New()
		logger.SetFormatter(&logrus.TextFormatter{
			FullTimestamp: true,
		})
	}

	return &AnalyticsService{
		examRepo: examRepo,
		logger:   logger,
	}
}

// ExamAnalyticsReport contains comprehensive exam analytics
type ExamAnalyticsReport struct {
	ExamID             string                         `json:"exam_id"`
	GeneratedAt        time.Time                      `json:"generated_at"`
	Statistics         *interfaces.ExamStatistics     `json:"statistics"`
	DifficultyAnalysis *interfaces.DifficultyAnalysis `json:"difficulty_analysis"`
	TimeAnalysis       *interfaces.TimeAnalysis       `json:"time_analysis"`
	PerformanceTrends  []*interfaces.PerformanceTrend `json:"performance_trends"`
	QuestionInsights   []*QuestionInsight             `json:"question_insights"`
	Recommendations    []string                       `json:"recommendations"`
}

// QuestionInsight provides insights about individual questions
type QuestionInsight struct {
	QuestionID       string  `json:"question_id"`
	DifficultyLevel  string  `json:"difficulty_level"`
	CorrectRate      float64 `json:"correct_rate"`
	AverageTime      int     `json:"average_time"`
	PerformanceLevel string  `json:"performance_level"` // "excellent", "good", "needs_review", "problematic"
	Recommendation   string  `json:"recommendation"`
}

// SystemAnalytics contains system-wide analytics
type SystemAnalytics struct {
	TotalExams          int                `json:"total_exams"`
	TotalAttempts       int                `json:"total_attempts"`
	AverageScore        float64            `json:"average_score"`
	SystemPassRate      float64            `json:"system_pass_rate"`
	PopularDifficulties map[string]int     `json:"popular_difficulties"`
	ActivityTrends      []*ActivityTrend   `json:"activity_trends"`
	TopPerformingExams  []*ExamPerformance `json:"top_performing_exams"`
	GeneratedAt         time.Time          `json:"generated_at"`
}

// ActivityTrend represents system activity over time
type ActivityTrend struct {
	Date         string `json:"date"`
	ExamsCreated int    `json:"exams_created"`
	Attempts     int    `json:"attempts"`
	NewUsers     int    `json:"new_users"`
}

// ExamPerformance represents exam performance metrics
type ExamPerformance struct {
	ExamID       string  `json:"exam_id"`
	ExamTitle    string  `json:"exam_title"`
	AttemptCount int     `json:"attempt_count"`
	AverageScore float64 `json:"average_score"`
	PassRate     float64 `json:"pass_rate"`
}

// GetExamAnalyticsReport generates a comprehensive analytics report for an exam
func (s *AnalyticsService) GetExamAnalyticsReport(ctx context.Context, examID string) (*ExamAnalyticsReport, error) {
	s.logger.WithField("exam_id", examID).Info("Generating exam analytics report")

	// Get comprehensive analytics
	analytics, err := s.examRepo.GetExamAnalytics(ctx, examID)
	if err != nil {
		return nil, fmt.Errorf("failed to get exam analytics: %w", err)
	}

	// Generate question insights
	questionInsights, err := s.generateQuestionInsights(ctx, analytics.Statistics.QuestionStats)
	if err != nil {
		s.logger.WithError(err).Warn("Failed to generate question insights")
		questionInsights = []*QuestionInsight{} // Continue with empty insights
	}

	// Generate recommendations
	recommendations := s.generateRecommendations(analytics, questionInsights)

	report := &ExamAnalyticsReport{
		ExamID:             examID,
		GeneratedAt:        time.Now(),
		Statistics:         analytics.Statistics,
		DifficultyAnalysis: analytics.DifficultyAnalysis,
		TimeAnalysis:       analytics.TimeAnalysis,
		PerformanceTrends:  analytics.PerformanceTrends,
		QuestionInsights:   questionInsights,
		Recommendations:    recommendations,
	}

	s.logger.WithField("exam_id", examID).Info("Exam analytics report generated successfully")
	return report, nil
}

// generateQuestionInsights analyzes individual question performance
func (s *AnalyticsService) generateQuestionInsights(ctx context.Context, questionStats []*interfaces.QuestionStatistics) ([]*QuestionInsight, error) {
	var insights []*QuestionInsight

	for _, stat := range questionStats {
		insight := &QuestionInsight{
			QuestionID:  stat.QuestionID,
			CorrectRate: stat.CorrectRate,
			AverageTime: stat.AverageTimeSpent,
		}

		// Determine performance level
		if stat.CorrectRate >= 80 {
			insight.PerformanceLevel = "excellent"
			insight.Recommendation = "Question performs well, consider using in future exams"
		} else if stat.CorrectRate >= 60 {
			insight.PerformanceLevel = "good"
			insight.Recommendation = "Good performance, minor review recommended"
		} else if stat.CorrectRate >= 40 {
			insight.PerformanceLevel = "needs_review"
			insight.Recommendation = "Review question clarity and difficulty level"
		} else {
			insight.PerformanceLevel = "problematic"
			insight.Recommendation = "Question needs significant revision or replacement"
		}

		// Analyze time spent
		if stat.AverageTimeSpent > 300 { // More than 5 minutes
			insight.Recommendation += ". Consider simplifying or breaking into smaller parts"
		} else if stat.AverageTimeSpent < 30 { // Less than 30 seconds
			insight.Recommendation += ". Question might be too easy or unclear"
		}

		insights = append(insights, insight)
	}

	return insights, nil
}

// generateRecommendations generates actionable recommendations based on analytics
func (s *AnalyticsService) generateRecommendations(analytics *interfaces.ExamAnalytics, insights []*QuestionInsight) []string {
	var recommendations []string

	// Analyze overall performance
	if analytics.Statistics.PassRate < 50 {
		recommendations = append(recommendations, "Consider reviewing exam difficulty - pass rate is below 50%")
	} else if analytics.Statistics.PassRate > 90 {
		recommendations = append(recommendations, "Exam might be too easy - consider adding more challenging questions")
	}

	// Analyze time performance
	if analytics.TimeAnalysis.AverageCompletionTime > 3600 { // More than 1 hour
		recommendations = append(recommendations, "Consider reducing exam length or extending time limit")
	} else if analytics.TimeAnalysis.AverageCompletionTime < 600 { // Less than 10 minutes
		recommendations = append(recommendations, "Exam might be too short - consider adding more questions")
	}

	// Analyze difficulty distribution
	totalQuestions := analytics.DifficultyAnalysis.EasyQuestions +
		analytics.DifficultyAnalysis.MediumQuestions +
		analytics.DifficultyAnalysis.HardQuestions +
		analytics.DifficultyAnalysis.ExpertQuestions

	if totalQuestions > 0 {
		easyPercent := float64(analytics.DifficultyAnalysis.EasyQuestions) / float64(totalQuestions) * 100
		hardPercent := float64(analytics.DifficultyAnalysis.HardQuestions+analytics.DifficultyAnalysis.ExpertQuestions) / float64(totalQuestions) * 100

		if easyPercent > 70 {
			recommendations = append(recommendations, "Consider adding more challenging questions for better assessment")
		} else if hardPercent > 60 {
			recommendations = append(recommendations, "Consider adding easier questions to improve accessibility")
		}
	}

	// Analyze problematic questions
	problematicCount := 0
	for _, insight := range insights {
		if insight.PerformanceLevel == "problematic" {
			problematicCount++
		}
	}

	if problematicCount > 0 {
		recommendations = append(recommendations, fmt.Sprintf("Review %d problematic questions that need revision", problematicCount))
	}

	// Performance trends analysis
	if len(analytics.PerformanceTrends) >= 2 {
		recent := analytics.PerformanceTrends[0]
		older := analytics.PerformanceTrends[len(analytics.PerformanceTrends)-1]

		if recent.AverageScore < older.AverageScore-10 {
			recommendations = append(recommendations, "Performance is declining - consider reviewing recent changes")
		} else if recent.AverageScore > older.AverageScore+10 {
			recommendations = append(recommendations, "Performance is improving - current approach is working well")
		}
	}

	if len(recommendations) == 0 {
		recommendations = append(recommendations, "Exam performance is within normal ranges")
	}

	return recommendations
}

// GetQuestionDifficultyAnalysis analyzes question difficulty based on performance data
func (s *AnalyticsService) GetQuestionDifficultyAnalysis(ctx context.Context, questionID string) (*QuestionDifficultyAnalysis, error) {
	// This would require additional repository methods to get question-specific analytics
	// For now, return a placeholder implementation
	return &QuestionDifficultyAnalysis{
		QuestionID:           questionID,
		EstimatedDifficulty:  "medium",
		PerformanceIndicator: "good",
		SuggestedAdjustment:  "none",
		AnalyzedAt:           time.Now(),
	}, nil
}

// QuestionDifficultyAnalysis contains difficulty analysis for a specific question
type QuestionDifficultyAnalysis struct {
	QuestionID           string    `json:"question_id"`
	EstimatedDifficulty  string    `json:"estimated_difficulty"`
	PerformanceIndicator string    `json:"performance_indicator"`
	SuggestedAdjustment  string    `json:"suggested_adjustment"`
	AnalyzedAt           time.Time `json:"analyzed_at"`
}
