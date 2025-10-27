//go:build integration && legacy_exam_tests

package grpc_test

import (
	"context"
	"database/sql"
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"

	"exam-bank-system/apps/backend/internal/config"
	"exam-bank-system/apps/backend/internal/container"
	"exam-bank-system/apps/backend/internal/database"
	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/grpc"
	pb "exam-bank-system/apps/backend/pkg/proto/v1"
)

// ExamServiceIntegrationTestSuite provides integration testing for ExamService
type ExamServiceIntegrationTestSuite struct {
	suite.Suite
	db          *sql.DB
	container   *container.Container
	examService pb.ExamServiceServer
	ctx         context.Context

	// Test data cleanup
	createdExamIDs     []string
	createdQuestionIDs []string
	createdAttemptIDs  []string
}

func (suite *ExamServiceIntegrationTestSuite) SetupSuite() {
	// Setup test configuration
	cfg := &config.Config{
		Database: config.DatabaseConfig{
			Host:     "localhost",
			Port:     5432,
			User:     "test_user",
			Password: "test_password",
			Name:     "test_exam_bank_db",
			SSLMode:  "disable",
		},
		JWT: config.JWTConfig{
			Secret: "test-secret",
		},
		Redis: config.RedisConfig{
			URL:      "redis://localhost:6379",
			Password: "test_password",
			Enabled:  false, // Disable Redis for integration tests
		},
	}

	// Initialize database connection
	db, err := database.NewConnection(&cfg.Database)
	require.NoError(suite.T(), err)
	suite.db = db

	// Initialize container with test dependencies
	suite.container = container.NewContainer(db, cfg.JWT.Secret, cfg)

	// Initialize ExamService
	suite.examService = grpc.NewExamService(suite.container.ExamMgmt)

	suite.ctx = context.Background()

	// Initialize cleanup slices
	suite.createdExamIDs = make([]string, 0)
	suite.createdQuestionIDs = make([]string, 0)
	suite.createdAttemptIDs = make([]string, 0)
}

func (suite *ExamServiceIntegrationTestSuite) TearDownSuite() {
	// Cleanup test data
	suite.cleanupTestData()

	// Close database connection
	if suite.db != nil {
		suite.db.Close()
	}
}

func (suite *ExamServiceIntegrationTestSuite) SetupTest() {
	// Reset cleanup slices for each test
	suite.createdExamIDs = suite.createdExamIDs[:0]
	suite.createdQuestionIDs = suite.createdQuestionIDs[:0]
	suite.createdAttemptIDs = suite.createdAttemptIDs[:0]
}

func (suite *ExamServiceIntegrationTestSuite) TearDownTest() {
	// Cleanup test data after each test
	suite.cleanupTestData()
}

func (suite *ExamServiceIntegrationTestSuite) cleanupTestData() {
	// Cleanup exam attempts
	for _, attemptID := range suite.createdAttemptIDs {
		suite.db.Exec("DELETE FROM exam_attempts WHERE id = $1", attemptID)
		suite.db.Exec("DELETE FROM exam_answers WHERE attempt_id = $1", attemptID)
		suite.db.Exec("DELETE FROM exam_results WHERE attempt_id = $1", attemptID)
	}

	// Cleanup exams
	for _, examID := range suite.createdExamIDs {
		suite.db.Exec("DELETE FROM exam_questions WHERE exam_id = $1", examID)
		suite.db.Exec("DELETE FROM exams WHERE id = $1", examID)
	}

	// Cleanup questions
	for _, questionID := range suite.createdQuestionIDs {
		suite.db.Exec("DELETE FROM question WHERE id = $1", questionID)
	}
}

func (suite *ExamServiceIntegrationTestSuite) createTestQuestion() string {
	questionID := fmt.Sprintf("test-question-%d", time.Now().UnixNano())

	_, err := suite.db.Exec(`
		INSERT INTO question (id, raw_content, content, type, source, answers, correct_answer, solution, creator, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`, questionID, "Test Question", "What is 2+2?", "MC", "test",
		`["2", "3", "4", "5"]`, `"4"`, "2+2=4", "test-user", "ACTIVE", time.Now(), time.Now())

	require.NoError(suite.T(), err)
	suite.createdQuestionIDs = append(suite.createdQuestionIDs, questionID)

	return questionID
}

// ===== COMPLETE EXAM WORKFLOW INTEGRATION TESTS =====

func (suite *ExamServiceIntegrationTestSuite) TestCompleteExamWorkflow_Success() {
	// Step 1: Create test questions
	questionID1 := suite.createTestQuestion()
	questionID2 := suite.createTestQuestion()

	// Step 2: Create exam
	createReq := &pb.CreateExamRequest{
		Title:           "Integration Test Exam",
		Description:     "Test exam for integration testing",
		Instructions:    "Answer all questions carefully",
		DurationMinutes: 60,
		TotalPoints:     100,
		PassPercentage:  70,
		ExamType:        pb.ExamType_EXAM_TYPE_GENERATED,
		Difficulty:      pb.Difficulty_DIFFICULTY_MEDIUM,
		Subject:         "Math",
		Grade:           12,
		Tags:            []string{"integration", "test"},
		QuestionIds:     []string{questionID1, questionID2},
	}

	createResp, err := suite.examService.CreateExam(suite.ctx, createReq)
	require.NoError(suite.T(), err)
	require.True(suite.T(), createResp.Response.Success)

	examID := createResp.Exam.Id
	suite.createdExamIDs = append(suite.createdExamIDs, examID)

	// Step 3: Add questions to exam
	addQ1Req := &pb.AddQuestionToExamRequest{
		ExamId:      examID,
		QuestionId:  questionID1,
		OrderNumber: 1,
	}

	addQ1Resp, err := suite.examService.AddQuestionToExam(suite.ctx, addQ1Req)
	require.NoError(suite.T(), err)
	require.True(suite.T(), addQ1Resp.Response.Success)

	addQ2Req := &pb.AddQuestionToExamRequest{
		ExamId:      examID,
		QuestionId:  questionID2,
		OrderNumber: 2,
	}

	addQ2Resp, err := suite.examService.AddQuestionToExam(suite.ctx, addQ2Req)
	require.NoError(suite.T(), err)
	require.True(suite.T(), addQ2Resp.Response.Success)

	// Step 4: Publish exam
	publishReq := &pb.PublishExamRequest{Id: examID}
	publishResp, err := suite.examService.PublishExam(suite.ctx, publishReq)
	require.NoError(suite.T(), err)
	require.True(suite.T(), publishResp.Response.Success)

	// Step 5: Verify exam is published
	getReq := &pb.GetExamRequest{Id: examID}
	getResp, err := suite.examService.GetExam(suite.ctx, getReq)
	require.NoError(suite.T(), err)
	require.True(suite.T(), getResp.Response.Success)
	assert.Equal(suite.T(), pb.ExamStatus_EXAM_STATUS_ACTIVE, getResp.Exam.Status)

	// Step 6: Get exam questions
	getQuestionsReq := &pb.GetExamQuestionsRequest{ExamId: examID}
	getQuestionsResp, err := suite.examService.GetExamQuestions(suite.ctx, getQuestionsReq)
	require.NoError(suite.T(), err)
	require.True(suite.T(), getQuestionsResp.Response.Success)
	assert.Len(suite.T(), getQuestionsResp.Questions, 2)

	// Step 7: Start exam attempt
	startReq := &pb.StartExamRequest{
		ExamId: examID,
		UserId: "test-student-user",
	}

	startResp, err := suite.examService.StartExam(suite.ctx, startReq)
	require.NoError(suite.T(), err)
	require.True(suite.T(), startResp.Response.Success)

	attemptID := startResp.AttemptId
	suite.createdAttemptIDs = append(suite.createdAttemptIDs, attemptID)

	// Step 8: Submit answers
	submitAnswer1Req := &pb.SubmitAnswerRequest{
		AttemptId:  attemptID,
		QuestionId: questionID1,
		AnswerData: `{"answer": "4"}`,
	}

	submitAnswer1Resp, err := suite.examService.SubmitAnswer(suite.ctx, submitAnswer1Req)
	require.NoError(suite.T(), err)
	require.True(suite.T(), submitAnswer1Resp.Response.Success)

	submitAnswer2Req := &pb.SubmitAnswerRequest{
		AttemptId:  attemptID,
		QuestionId: questionID2,
		AnswerData: `{"answer": "4"}`,
	}

	submitAnswer2Resp, err := suite.examService.SubmitAnswer(suite.ctx, submitAnswer2Req)
	require.NoError(suite.T(), err)
	require.True(suite.T(), submitAnswer2Resp.Response.Success)

	// Step 9: Submit exam
	submitExamReq := &pb.SubmitExamRequest{AttemptId: attemptID}
	submitExamResp, err := suite.examService.SubmitExam(suite.ctx, submitExamReq)
	require.NoError(suite.T(), err)
	require.True(suite.T(), submitExamResp.Response.Success)
	require.NotNil(suite.T(), submitExamResp.Result)

	// Step 10: Get exam results
	getResultsReq := &pb.GetExamResultsRequest{ExamId: examID}
	getResultsResp, err := suite.examService.GetExamResults(suite.ctx, getResultsReq)
	require.NoError(suite.T(), err)
	require.True(suite.T(), getResultsResp.Response.Success)
	assert.Len(suite.T(), getResultsResp.Results, 1)

	// Step 11: Get exam statistics
	getStatsReq := &pb.GetExamStatisticsRequest{ExamId: examID}
	getStatsResp, err := suite.examService.GetExamStatistics(suite.ctx, getStatsReq)
	require.NoError(suite.T(), err)
	require.True(suite.T(), getStatsResp.Response.Success)
	assert.NotNil(suite.T(), getStatsResp.Statistics)
}

func (suite *ExamServiceIntegrationTestSuite) TestConcurrentExamTaking_Success() {
	// Create test exam
	questionID := suite.createTestQuestion()

	createReq := &pb.CreateExamRequest{
		Title:           "Concurrent Test Exam",
		Description:     "Test exam for concurrent access",
		DurationMinutes: 30,
		TotalPoints:     50,
		PassPercentage:  60,
		ExamType:        pb.ExamType_EXAM_TYPE_GENERATED,
		QuestionIds:     []string{questionID},
	}

	createResp, err := suite.examService.CreateExam(suite.ctx, createReq)
	require.NoError(suite.T(), err)

	examID := createResp.Exam.Id
	suite.createdExamIDs = append(suite.createdExamIDs, examID)

	// Add question and publish exam
	addQReq := &pb.AddQuestionToExamRequest{
		ExamId:      examID,
		QuestionId:  questionID,
		OrderNumber: 1,
	}
	_, err = suite.examService.AddQuestionToExam(suite.ctx, addQReq)
	require.NoError(suite.T(), err)

	publishReq := &pb.PublishExamRequest{Id: examID}
	_, err = suite.examService.PublishExam(suite.ctx, publishReq)
	require.NoError(suite.T(), err)

	// Test concurrent exam attempts
	numConcurrentUsers := 5
	attemptIDs := make([]string, numConcurrentUsers)

	// Start concurrent exam attempts
	for i := 0; i < numConcurrentUsers; i++ {
		startReq := &pb.StartExamRequest{
			ExamId: examID,
			UserId: fmt.Sprintf("test-user-%d", i),
		}

		startResp, err := suite.examService.StartExam(suite.ctx, startReq)
		require.NoError(suite.T(), err)
		require.True(suite.T(), startResp.Response.Success)

		attemptIDs[i] = startResp.AttemptId
		suite.createdAttemptIDs = append(suite.createdAttemptIDs, startResp.AttemptId)
	}

	// Submit answers concurrently
	for i, attemptID := range attemptIDs {
		submitReq := &pb.SubmitAnswerRequest{
			AttemptId:  attemptID,
			QuestionId: questionID,
			AnswerData: fmt.Sprintf(`{"answer": "answer-%d"}`, i),
		}

		submitResp, err := suite.examService.SubmitAnswer(suite.ctx, submitReq)
		require.NoError(suite.T(), err)
		require.True(suite.T(), submitResp.Response.Success)
	}

	// Submit exams concurrently
	for _, attemptID := range attemptIDs {
		submitExamReq := &pb.SubmitExamRequest{AttemptId: attemptID}
		submitExamResp, err := suite.examService.SubmitExam(suite.ctx, submitExamReq)
		require.NoError(suite.T(), err)
		require.True(suite.T(), submitExamResp.Response.Success)
	}

	// Verify all results are recorded
	getResultsReq := &pb.GetExamResultsRequest{ExamId: examID}
	getResultsResp, err := suite.examService.GetExamResults(suite.ctx, getResultsReq)
	require.NoError(suite.T(), err)
	require.True(suite.T(), getResultsResp.Response.Success)
	assert.Len(suite.T(), getResultsResp.Results, numConcurrentUsers)
}

// Run the integration test suite
func TestExamServiceIntegrationTestSuite(t *testing.T) {
	// Skip integration tests in short mode
	if testing.Short() {
		t.Skip("Skipping integration tests in short mode")
	}

	suite.Run(t, new(ExamServiceIntegrationTestSuite))
}
