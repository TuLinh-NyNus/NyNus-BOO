package analytics

import (
	"context"
	"database/sql"
	"testing"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	_ "github.com/lib/pq"
)

// TestAnalyticsIntegration tests the complete analytics functionality
func TestAnalyticsIntegration(t *testing.T) {
	// Skip if no database connection available
	if testing.Short() {
		t.Skip("Skipping analytics integration test in short mode")
	}

	// Create test database connection
	db, err := sql.Open("postgres", "postgres://exam_bank_user:exam_bank_password@localhost:5439/exam_bank_db?sslmode=disable")
	if err != nil {
		t.Skipf("Skipping test - database not available: %v", err)
	}
	defer db.Close()

	// Test database connection
	if err := db.Ping(); err != nil {
		t.Skipf("Skipping test - database not reachable: %v", err)
	}

	logger := logrus.New()
	logger.SetLevel(logrus.WarnLevel) // Reduce noise in tests

	t.Run("DashboardService", func(t *testing.T) {
		dashboardService := NewDashboardService(db, nil, logger)
		assert.NotNil(t, dashboardService)

		ctx := context.Background()
		overview, err := dashboardService.GetDashboardOverview(ctx)
		require.NoError(t, err)
		assert.NotNil(t, overview)
		assert.GreaterOrEqual(t, overview.TotalExams, 0)
		assert.GreaterOrEqual(t, overview.TotalAttempts, 0)
		assert.NotNil(t, overview.PopularSubjects)
		assert.NotNil(t, overview.RecentActivity)
		assert.NotNil(t, overview.PerformanceTrends)
		assert.NotNil(t, overview.TopPerformingExams)
	})

	t.Run("MonitoringService", func(t *testing.T) {
		monitoringService := NewMonitoringService(db, nil, logger)
		assert.NotNil(t, monitoringService)

		ctx := context.Background()

		// Test start and stop
		err := monitoringService.Start(ctx)
		require.NoError(t, err)
		assert.True(t, monitoringService.IsRunning())

		// Test system health metrics
		metrics, err := monitoringService.GetSystemHealthMetrics(ctx)
		require.NoError(t, err)
		assert.NotNil(t, metrics)
		assert.GreaterOrEqual(t, metrics.ActiveUsers, 0)
		assert.GreaterOrEqual(t, metrics.TotalAttempts, 0)
		assert.NotEmpty(t, metrics.DatabaseHealth)

		// Test active exam monitors
		monitors := monitoringService.GetActiveExamMonitors()
		assert.NotNil(t, monitors)

		// Test stop
		err = monitoringService.Stop()
		require.NoError(t, err)
		assert.False(t, monitoringService.IsRunning())
	})

	t.Run("AnalyticsService", func(t *testing.T) {
		analyticsService := NewAnalyticsService(nil, logger)
		assert.NotNil(t, analyticsService)

		ctx := context.Background()

		// Test question difficulty analysis
		analysis, err := analyticsService.GetQuestionDifficultyAnalysis(ctx, "test-question-id")
		require.NoError(t, err)
		assert.NotNil(t, analysis)
		assert.Equal(t, "test-question-id", analysis.QuestionID)
		assert.NotEmpty(t, analysis.EstimatedDifficulty)
	})
}

// TestAnalyticsServiceRecommendations tests the recommendation engine
func TestAnalyticsServiceRecommendations(t *testing.T) {
	logger := logrus.New()
	logger.SetLevel(logrus.WarnLevel)

	service := NewAnalyticsService(nil, logger)

	t.Run("GenerateRecommendations", func(t *testing.T) {
		// Create mock analytics data
		analytics := &interfaces.ExamAnalytics{
			Statistics: &interfaces.ExamStatistics{
				PassRate:         30.0, // Low pass rate
				AverageScore:     45.0,
				TotalAttempts:    100,
				CompletedAttempts: 80,
			},
			DifficultyAnalysis: &interfaces.DifficultyAnalysis{
				EasyQuestions:   1,
				MediumQuestions: 2,
				HardQuestions:   7,
				ExpertQuestions: 5,
				OverallDifficulty: "Hard",
			},
			TimeAnalysis: &interfaces.TimeAnalysis{
				AverageCompletionTime: 4500, // 75 minutes
				FastestCompletion:     1800,
				SlowestCompletion:     7200,
			},
			PerformanceTrends: []*interfaces.PerformanceTrend{
				{
					Date:         "2024-01-02",
					AverageScore: 40.0,
					PassRate:     25.0,
					AttemptCount: 20,
				},
				{
					Date:         "2024-01-01",
					AverageScore: 50.0,
					PassRate:     35.0,
					AttemptCount: 15,
				},
			},
		}

		// Create mock question insights
		insights := []*QuestionInsight{
			{
				QuestionID:       "q1",
				CorrectRate:      20.0, // Problematic question
				PerformanceLevel: "problematic",
			},
			{
				QuestionID:       "q2",
				CorrectRate:      85.0, // Excellent question
				PerformanceLevel: "excellent",
			},
		}

		recommendations := service.generateRecommendations(analytics, insights)
		assert.NotEmpty(t, recommendations)

		// Should recommend reviewing difficulty due to low pass rate
		found := false
		for _, rec := range recommendations {
			if contains(rec, "pass rate") {
				found = true
				break
			}
		}
		assert.True(t, found, "Should recommend reviewing exam difficulty due to low pass rate")

		// Should recommend reviewing problematic questions
		found = false
		for _, rec := range recommendations {
			if contains(rec, "problematic") {
				found = true
				break
			}
		}
		assert.True(t, found, "Should recommend reviewing problematic questions")
	})

	t.Run("GenerateQuestionInsights", func(t *testing.T) {
		// Create mock question statistics
		questionStats := []*interfaces.QuestionStatistics{
			{
				QuestionID:       "q1",
				CorrectRate:      85.0,
				AverageTimeSpent: 120,
				TotalAnswers:     100,
				CorrectAnswers:   85,
			},
			{
				QuestionID:       "q2",
				CorrectRate:      30.0,
				AverageTimeSpent: 400,
				TotalAnswers:     100,
				CorrectAnswers:   30,
			},
			{
				QuestionID:       "q3",
				CorrectRate:      95.0,
				AverageTimeSpent: 15,
				TotalAnswers:     100,
				CorrectAnswers:   95,
			},
		}

		insights, err := service.generateQuestionInsights(context.Background(), questionStats)
		require.NoError(t, err)
		assert.Len(t, insights, 3)

		// Check first question (excellent performance)
		assert.Equal(t, "excellent", insights[0].PerformanceLevel)
		assert.Contains(t, insights[0].Recommendation, "performs well")

		// Check second question (problematic performance)
		assert.Equal(t, "problematic", insights[1].PerformanceLevel)
		assert.Contains(t, insights[1].Recommendation, "significant revision")
		assert.Contains(t, insights[1].Recommendation, "simplifying") // Due to high time

		// Check third question (excellent but too fast)
		assert.Equal(t, "excellent", insights[2].PerformanceLevel)
		assert.Contains(t, insights[2].Recommendation, "too easy") // Due to low time
	})
}

// TestMonitoringServiceAlerts tests the monitoring alert system
func TestMonitoringServiceAlerts(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping monitoring alerts test in short mode")
	}

	// Create test database connection
	db, err := sql.Open("postgres", "postgres://exam_bank_user:exam_bank_password@localhost:5439/exam_bank_db?sslmode=disable")
	if err != nil {
		t.Skipf("Skipping test - database not available: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		t.Skipf("Skipping test - database not reachable: %v", err)
	}

	logger := logrus.New()
	logger.SetLevel(logrus.WarnLevel)

	service := NewMonitoringService(db, nil, logger)

	t.Run("CollectSystemAlerts", func(t *testing.T) {
		// Create mock metrics with issues
		metrics := &SystemHealthMetrics{
			DatabaseHealth: "unhealthy",
			ResponseTime:   1500.0, // High response time
			SystemLoad:    0.9,     // High system load
		}

		alerts := service.collectSystemAlerts(context.Background(), metrics)
		assert.NotEmpty(t, alerts)

		// Should have database health alert
		found := false
		for _, alert := range alerts {
			if alert.Type == "system" && contains(alert.Message, "Database") {
				found = true
				assert.Equal(t, "critical", alert.Severity)
				break
			}
		}
		assert.True(t, found, "Should have database health alert")

		// Should have high response time alert
		found = false
		for _, alert := range alerts {
			if alert.Type == "performance" && contains(alert.Message, "response time") {
				found = true
				assert.Equal(t, "high", alert.Severity)
				break
			}
		}
		assert.True(t, found, "Should have high response time alert")
	})

	t.Run("RecordExamEvent", func(t *testing.T) {
		ctx := context.Background()
		metadata := map[string]interface{}{
			"question_count": 10,
			"duration":       30,
		}

		err := service.RecordExamEvent(ctx, "exam-123", "user-456", "exam_started", metadata)
		assert.NoError(t, err)
	})
}

// Helper function to check if a string contains a substring (case-insensitive)
func contains(s, substr string) bool {
	return len(s) >= len(substr) && 
		   (s == substr || 
		    (len(s) > len(substr) && 
		     (s[:len(substr)] == substr || 
		      s[len(s)-len(substr):] == substr || 
		      containsSubstring(s, substr))))
}

func containsSubstring(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
