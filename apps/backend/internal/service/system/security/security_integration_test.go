package security

import (
	"context"
	"database/sql"
	"testing"

	_ "github.com/lib/pq"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestSecurityIntegration tests the complete security system integration
func TestSecurityIntegration(t *testing.T) {
	// Skip if no database connection
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	// Setup test database (this would be a test database)
	db, err := sql.Open("postgres", "postgres://test_user:test_pass@localhost:5432/test_db?sslmode=disable")
	if err != nil {
		t.Skip("Database not available for testing")
	}
	defer db.Close()

	// Test database connection
	if err := db.Ping(); err != nil {
		t.Skip("Database not available for testing")
	}

	logger := logrus.New()
	logger.SetLevel(logrus.WarnLevel) // Reduce noise in tests

	ctx := context.Background()

	t.Run("ExamSessionSecurity", func(t *testing.T) {
		testExamSessionSecurity(t, db, logger, ctx)
	})

	t.Run("AntiCheatService", func(t *testing.T) {
		testAntiCheatService(t, db, logger, ctx)
	})

	t.Run("ExamRateLimitService", func(t *testing.T) {
		testExamRateLimitService(t, db, logger, ctx)
	})

	t.Run("IntegratedWorkflow", func(t *testing.T) {
		testIntegratedSecurityWorkflow(t, db, logger, ctx)
	})
}

func testExamSessionSecurity(t *testing.T, db *sql.DB, logger *logrus.Logger, ctx context.Context) {
	service := NewExamSessionSecurity(db, logger)

	// Test session creation
	session, err := service.CreateExamSession(ctx, "exam-123", "user-456", "attempt-789", "192.168.1.1", "Mozilla/5.0")
	require.NoError(t, err)
	assert.NotEmpty(t, session.SessionID)
	assert.Equal(t, "exam-123", session.ExamID)
	assert.Equal(t, "user-456", session.UserID)
	assert.True(t, session.IsActive)

	// Test session validation
	validatedSession, err := service.ValidateSession(ctx, session.SessionID, session.SecurityToken)
	require.NoError(t, err)
	assert.Equal(t, session.SessionID, validatedSession.SessionID)

	// Test security event recording
	err = service.RecordSecurityEvent(ctx, session.SessionID, EventTabSwitch, SeverityMedium, "Test tab switch", nil)
	require.NoError(t, err)

	// Test session termination
	err = service.TerminateSession(ctx, session.SessionID, "Test completed")
	require.NoError(t, err)

	// Validate session is terminated
	_, err = service.ValidateSession(ctx, session.SessionID, session.SecurityToken)
	assert.Error(t, err)
}

func testAntiCheatService(t *testing.T, db *sql.DB, logger *logrus.Logger, ctx context.Context) {
	sessionSecurity := NewExamSessionSecurity(db, logger)
	antiCheat := NewAntiCheatService(db, sessionSecurity, logger)

	// Create a session first
	session, err := sessionSecurity.CreateExamSession(ctx, "exam-123", "user-456", "attempt-789", "192.168.1.1", "Mozilla/5.0")
	require.NoError(t, err)

	// Start activity tracking
	err = antiCheat.StartActivityTracking(ctx, session.SessionID, "user-456", "exam-123")
	require.NoError(t, err)

	// Record various activities
	activities := []struct {
		activityType string
		data         map[string]interface{}
	}{
		{"tab_switch", map[string]interface{}{"count": 1}},
		{"window_blur", map[string]interface{}{"count": 1}},
		{"copy_paste", map[string]interface{}{"type": "copy"}},
		{"question_view", map[string]interface{}{"question_id": "q1"}},
		{"answer_change", map[string]interface{}{"question_id": "q1", "new_answer": "A"}},
	}

	for _, activity := range activities {
		err = antiCheat.RecordActivity(ctx, session.SessionID, activity.activityType, activity.data)
		require.NoError(t, err)
	}

	// Get activity summary
	summary, err := antiCheat.GetActivitySummary(ctx, session.SessionID)
	require.NoError(t, err)
	assert.Equal(t, session.SessionID, summary.SessionID)
	assert.Greater(t, summary.TotalTabSwitches, 0)

	// Stop activity tracking
	err = antiCheat.StopActivityTracking(ctx, session.SessionID)
	require.NoError(t, err)
}

func testExamRateLimitService(t *testing.T, db *sql.DB, logger *logrus.Logger, ctx context.Context) {
	rateLimiter := NewExamRateLimitService(db, logger)

	userID := "user-456"
	examID := "exam-123"

	// Test normal rate limiting
	for i := 0; i < 5; i++ {
		result, err := rateLimiter.CheckRateLimit(ctx, userID, examID, ActionAnswerSubmit)
		require.NoError(t, err)
		assert.True(t, result.Allowed)
		assert.False(t, result.IsBlocked)
	}

	// Test rate limit status
	status, err := rateLimiter.GetRateLimitStatus(ctx, userID, examID)
	require.NoError(t, err)
	assert.Contains(t, status, ActionAnswerSubmit)

	// Test rate limit reset
	err = rateLimiter.ResetUserRateLimit(ctx, userID, examID)
	require.NoError(t, err)
}

func testIntegratedSecurityWorkflow(t *testing.T, db *sql.DB, logger *logrus.Logger, ctx context.Context) {
	// Initialize all security services
	sessionSecurity := NewExamSessionSecurity(db, logger)
	antiCheat := NewAntiCheatService(db, sessionSecurity, logger)
	rateLimiter := NewExamRateLimitService(db, logger)

	userID := "user-789"
	examID := "exam-456"
	attemptID := "attempt-123"

	// Step 1: Create secure exam session
	session, err := sessionSecurity.CreateExamSession(ctx, examID, userID, attemptID, "192.168.1.100", "Mozilla/5.0")
	require.NoError(t, err)

	// Step 2: Start activity tracking
	err = antiCheat.StartActivityTracking(ctx, session.SessionID, userID, examID)
	require.NoError(t, err)

	// Step 3: Simulate exam taking with security events
	examActivities := []struct {
		action       ActionType
		activityType string
		data         map[string]interface{}
	}{
		{ActionQuestionView, "question_view", map[string]interface{}{"question_id": "q1"}},
		{ActionAnswerSubmit, "answer_change", map[string]interface{}{"question_id": "q1", "answer": "A"}},
		{ActionNavigation, "navigation", map[string]interface{}{"from": "q1", "to": "q2"}},
		{ActionQuestionView, "question_view", map[string]interface{}{"question_id": "q2"}},
	}

	for _, activity := range examActivities {
		// Check rate limit
		rateLimitResult, err := rateLimiter.CheckRateLimit(ctx, userID, examID, activity.action)
		require.NoError(t, err)
		assert.True(t, rateLimitResult.Allowed)

		// Record activity
		err = antiCheat.RecordActivity(ctx, session.SessionID, activity.activityType, activity.data)
		require.NoError(t, err)
	}

	// Step 4: Simulate security violations
	securityViolations := []struct {
		activityType string
		data         map[string]interface{}
	}{
		{"tab_switch", map[string]interface{}{"count": 1}},
		{"copy_paste", map[string]interface{}{"type": "copy", "content": "test"}},
		{"window_blur", map[string]interface{}{"duration": 5000}},
	}

	for _, violation := range securityViolations {
		err = antiCheat.RecordActivity(ctx, session.SessionID, violation.activityType, violation.data)
		require.NoError(t, err)
	}

	// Step 5: Validate session still active (under violation limit)
	validatedSession, err := sessionSecurity.ValidateSession(ctx, session.SessionID, session.SecurityToken)
	require.NoError(t, err)
	assert.True(t, validatedSession.IsActive)

	// Step 6: Get comprehensive security status
	activitySummary, err := antiCheat.GetActivitySummary(ctx, session.SessionID)
	require.NoError(t, err)
	assert.Greater(t, activitySummary.TotalTabSwitches, 0)
	assert.Greater(t, activitySummary.CopyPasteAttempts, 0)

	rateLimitStatus, err := rateLimiter.GetRateLimitStatus(ctx, userID, examID)
	require.NoError(t, err)
	assert.NotEmpty(t, rateLimitStatus)

	// Step 7: Complete exam session
	err = antiCheat.StopActivityTracking(ctx, session.SessionID)
	require.NoError(t, err)

	err = sessionSecurity.TerminateSession(ctx, session.SessionID, "Exam completed")
	require.NoError(t, err)

	// Step 8: Verify session is terminated
	_, err = sessionSecurity.ValidateSession(ctx, session.SessionID, session.SecurityToken)
	assert.Error(t, err)
}

// BenchmarkSecurityServices benchmarks the security services performance
func BenchmarkSecurityServices(b *testing.B) {
	// Skip if no database connection
	if testing.Short() {
		b.Skip("Skipping benchmark in short mode")
	}

	db, err := sql.Open("postgres", "postgres://test_user:test_pass@localhost:5432/test_db?sslmode=disable")
	if err != nil {
		b.Skip("Database not available for benchmarking")
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		b.Skip("Database not available for benchmarking")
	}

	logger := logrus.New()
	logger.SetLevel(logrus.ErrorLevel) // Minimal logging for benchmarks

	ctx := context.Background()

	b.Run("SessionCreation", func(b *testing.B) {
		service := NewExamSessionSecurity(db, logger)
		b.ResetTimer()

		for i := 0; i < b.N; i++ {
			_, err := service.CreateExamSession(ctx, "exam-bench", "user-bench", "attempt-bench", "192.168.1.1", "Mozilla/5.0")
			if err != nil {
				b.Fatal(err)
			}
		}
	})

	b.Run("RateLimitCheck", func(b *testing.B) {
		service := NewExamRateLimitService(db, logger)
		b.ResetTimer()

		for i := 0; i < b.N; i++ {
			_, err := service.CheckRateLimit(ctx, "user-bench", "exam-bench", ActionAnswerSubmit)
			if err != nil {
				b.Fatal(err)
			}
		}
	})

	b.Run("ActivityRecording", func(b *testing.B) {
		sessionSecurity := NewExamSessionSecurity(db, logger)
		antiCheat := NewAntiCheatService(db, sessionSecurity, logger)

		session, err := sessionSecurity.CreateExamSession(ctx, "exam-bench", "user-bench", "attempt-bench", "192.168.1.1", "Mozilla/5.0")
		if err != nil {
			b.Fatal(err)
		}

		err = antiCheat.StartActivityTracking(ctx, session.SessionID, "user-bench", "exam-bench")
		if err != nil {
			b.Fatal(err)
		}

		b.ResetTimer()

		for i := 0; i < b.N; i++ {
			err := antiCheat.RecordActivity(ctx, session.SessionID, "question_view", map[string]interface{}{"question_id": "q1"})
			if err != nil {
				b.Fatal(err)
			}
		}
	})
}
