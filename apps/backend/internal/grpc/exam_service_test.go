package grpc_test

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/grpc"
	pb "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/v1"
)

// MockExamMgmt is a mock implementation of ExamMgmt service
type MockExamMgmt struct {
	mock.Mock
}

func (m *MockExamMgmt) CreateExam(ctx context.Context, exam *entity.Exam) (*entity.Exam, error) {
	args := m.Called(ctx, exam)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.Exam), args.Error(1)
}

func (m *MockExamMgmt) GetExamByID(ctx context.Context, id string) (*entity.Exam, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.Exam), args.Error(1)
}

func (m *MockExamMgmt) UpdateExam(ctx context.Context, exam *entity.Exam) (*entity.Exam, error) {
	args := m.Called(ctx, exam)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.Exam), args.Error(1)
}

func (m *MockExamMgmt) DeleteExam(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockExamMgmt) ListExams(ctx context.Context, filters map[string]interface{}, limit, offset int) ([]*entity.Exam, int, error) {
	args := m.Called(ctx, filters, limit, offset)
	return args.Get(0).([]*entity.Exam), args.Int(1), args.Error(2)
}

func (m *MockExamMgmt) PublishExam(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockExamMgmt) ArchiveExam(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockExamMgmt) AddQuestionToExam(ctx context.Context, examID, questionID string, orderNumber int) error {
	args := m.Called(ctx, examID, questionID, orderNumber)
	return args.Error(0)
}

func (m *MockExamMgmt) RemoveQuestionFromExam(ctx context.Context, examID, questionID string) error {
	args := m.Called(ctx, examID, questionID)
	return args.Error(0)
}

func (m *MockExamMgmt) GetExamQuestions(ctx context.Context, examID string) ([]*entity.Question, error) {
	args := m.Called(ctx, examID)
	return args.Get(0).([]*entity.Question), args.Error(1)
}

func (m *MockExamMgmt) ReorderExamQuestions(ctx context.Context, examID string, questionOrders map[string]int) error {
	args := m.Called(ctx, examID, questionOrders)
	return args.Error(0)
}

// Test Suite
type ExamServiceTestSuite struct {
	examMgmt *MockExamMgmt
	service  *grpc.ExamService
	ctx      context.Context
}

func setupExamServiceTestSuite(t *testing.T) *ExamServiceTestSuite {
	examMgmt := &MockExamMgmt{}
	service := grpc.NewExamService(examMgmt)
	
	return &ExamServiceTestSuite{
		examMgmt: examMgmt,
		service:  service,
		ctx:      context.Background(),
	}
}

// ===== CREATE EXAM TESTS =====

func TestExamService_CreateExam_Success(t *testing.T) {
	suite := setupExamServiceTestSuite(t)

	// Arrange
	req := &pb.CreateExamRequest{
		Title:           "Test Exam",
		Description:     "Test Description",
		Instructions:    "Test Instructions",
		DurationMinutes: 60,
		TotalPoints:     100,
		PassPercentage:  70,
		ExamType:        pb.ExamType_EXAM_TYPE_GENERATED,
		Difficulty:      pb.Difficulty_DIFFICULTY_MEDIUM,
		Subject:         "Math",
		Grade:           12,
		Tags:            []string{"algebra", "calculus"},
		QuestionIds:     []string{"q1", "q2"},
	}

	mockExam := &entity.Exam{
		ID:              "exam-123",
		Title:           req.Title,
		Description:     req.Description,
		Instructions:    req.Instructions,
		DurationMinutes: int(req.DurationMinutes),
		TotalPoints:     int(req.TotalPoints),
		PassPercentage:  int(req.PassPercentage),
		ExamType:        entity.ExamTypeGenerated,
		Status:          entity.ExamStatusPending,
		Difficulty:      "MEDIUM",
		Subject:         req.Subject,
		Grade:           int(req.Grade),
		CreatedBy:       "test-user",
	}

	suite.examMgmt.On("CreateExam", suite.ctx, mock.AnythingOfType("*entity.Exam")).Return(mockExam, nil)

	// Act
	resp, err := suite.service.CreateExam(suite.ctx, req)

	// Assert
	require.NoError(t, err)
	assert.NotNil(t, resp)
	assert.True(t, resp.Response.Success)
	assert.Equal(t, "exam-123", resp.Exam.Id)
	assert.Equal(t, req.Title, resp.Exam.Title)
	assert.Equal(t, req.Description, resp.Exam.Description)
	assert.Equal(t, pb.ExamStatus_EXAM_STATUS_PENDING, resp.Exam.Status)
	
	suite.examMgmt.AssertExpectations(t)
}

func TestExamService_CreateExam_ValidationError(t *testing.T) {
	suite := setupExamServiceTestSuite(t)

	// Arrange
	req := &pb.CreateExamRequest{
		Title:           "", // Empty title
		Description:     "Test Description",
		DurationMinutes: 60,
	}

	// Act
	resp, err := suite.service.CreateExam(suite.ctx, req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, resp)
	
	st, ok := status.FromError(err)
	require.True(t, ok)
	assert.Equal(t, codes.InvalidArgument, st.Code())
	assert.Contains(t, st.Message(), "title is required")
}

func TestExamService_CreateExam_ServiceError(t *testing.T) {
	suite := setupExamServiceTestSuite(t)

	// Arrange
	req := &pb.CreateExamRequest{
		Title:           "Test Exam",
		Description:     "Test Description",
		DurationMinutes: 60,
	}

	suite.examMgmt.On("CreateExam", suite.ctx, mock.AnythingOfType("*entity.Exam")).Return((*entity.Exam)(nil), assert.AnError)

	// Act
	resp, err := suite.service.CreateExam(suite.ctx, req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, resp)
	
	st, ok := status.FromError(err)
	require.True(t, ok)
	assert.Equal(t, codes.Internal, st.Code())
	
	suite.examMgmt.AssertExpectations(t)
}

// ===== GET EXAM TESTS =====

func TestExamService_GetExam_Success(t *testing.T) {
	suite := setupExamServiceTestSuite(t)

	// Arrange
	req := &pb.GetExamRequest{
		Id: "exam-123",
	}

	mockExam := &entity.Exam{
		ID:              "exam-123",
		Title:           "Test Exam",
		Description:     "Test Description",
		DurationMinutes: 60,
		TotalPoints:     100,
		PassPercentage:  70,
		ExamType:        entity.ExamTypeGenerated,
		Status:          entity.ExamStatusActive,
		Difficulty:      "MEDIUM",
		Subject:         "Math",
		Grade:           12,
	}

	suite.examMgmt.On("GetExamByID", suite.ctx, "exam-123").Return(mockExam, nil)

	// Act
	resp, err := suite.service.GetExam(suite.ctx, req)

	// Assert
	require.NoError(t, err)
	assert.NotNil(t, resp)
	assert.True(t, resp.Response.Success)
	assert.Equal(t, "exam-123", resp.Exam.Id)
	assert.Equal(t, "Test Exam", resp.Exam.Title)
	assert.Equal(t, pb.ExamStatus_EXAM_STATUS_ACTIVE, resp.Exam.Status)
	
	suite.examMgmt.AssertExpectations(t)
}

func TestExamService_GetExam_NotFound(t *testing.T) {
	suite := setupExamServiceTestSuite(t)

	// Arrange
	req := &pb.GetExamRequest{
		Id: "nonexistent-exam",
	}

	suite.examMgmt.On("GetExamByID", suite.ctx, "nonexistent-exam").Return((*entity.Exam)(nil), assert.AnError)

	// Act
	resp, err := suite.service.GetExam(suite.ctx, req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, resp)
	
	st, ok := status.FromError(err)
	require.True(t, ok)
	assert.Equal(t, codes.NotFound, st.Code())
	
	suite.examMgmt.AssertExpectations(t)
}

// ===== PUBLISH EXAM TESTS =====

func TestExamService_PublishExam_Success(t *testing.T) {
	suite := setupExamServiceTestSuite(t)

	// Arrange
	req := &pb.PublishExamRequest{
		Id: "exam-123",
	}

	suite.examMgmt.On("PublishExam", suite.ctx, "exam-123").Return(nil)

	// Act
	resp, err := suite.service.PublishExam(suite.ctx, req)

	// Assert
	require.NoError(t, err)
	assert.NotNil(t, resp)
	assert.True(t, resp.Response.Success)
	assert.Equal(t, "Exam published successfully", resp.Response.Message)
	
	suite.examMgmt.AssertExpectations(t)
}

func TestExamService_PublishExam_ValidationError(t *testing.T) {
	suite := setupExamServiceTestSuite(t)

	// Arrange
	req := &pb.PublishExamRequest{
		Id: "exam-123",
	}

	suite.examMgmt.On("PublishExam", suite.ctx, "exam-123").Return(assert.AnError)

	// Act
	resp, err := suite.service.PublishExam(suite.ctx, req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, resp)
	
	st, ok := status.FromError(err)
	require.True(t, ok)
	assert.Equal(t, codes.FailedPrecondition, st.Code())
	
	suite.examMgmt.AssertExpectations(t)
}

// ===== QUESTION MANAGEMENT TESTS =====

func TestExamService_AddQuestionToExam_Success(t *testing.T) {
	suite := setupExamServiceTestSuite(t)

	// Arrange
	req := &pb.AddQuestionToExamRequest{
		ExamId:      "exam-123",
		QuestionId:  "question-456",
		OrderNumber: 1,
	}

	suite.examMgmt.On("AddQuestionToExam", suite.ctx, "exam-123", "question-456", 1).Return(nil)

	// Act
	resp, err := suite.service.AddQuestionToExam(suite.ctx, req)

	// Assert
	require.NoError(t, err)
	assert.NotNil(t, resp)
	assert.True(t, resp.Response.Success)
	assert.Equal(t, "Question added to exam successfully", resp.Response.Message)
	
	suite.examMgmt.AssertExpectations(t)
}

func TestExamService_AddQuestionToExam_InvalidRequest(t *testing.T) {
	suite := setupExamServiceTestSuite(t)

	// Arrange
	req := &pb.AddQuestionToExamRequest{
		ExamId:      "", // Empty exam ID
		QuestionId:  "question-456",
		OrderNumber: 1,
	}

	// Act
	resp, err := suite.service.AddQuestionToExam(suite.ctx, req)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, resp)
	
	st, ok := status.FromError(err)
	require.True(t, ok)
	assert.Equal(t, codes.InvalidArgument, st.Code())
	assert.Contains(t, st.Message(), "exam_id is required")
}

// ===== LIST EXAMS TESTS =====

func TestExamService_ListExams_Success(t *testing.T) {
	suite := setupExamServiceTestSuite(t)

	// Arrange
	req := &pb.ListExamsRequest{
		Limit:  10,
		Offset: 0,
		Status: pb.ExamStatus_EXAM_STATUS_ACTIVE,
	}

	mockExams := []*entity.Exam{
		{
			ID:     "exam-1",
			Title:  "Exam 1",
			Status: entity.ExamStatusActive,
		},
		{
			ID:     "exam-2",
			Title:  "Exam 2",
			Status: entity.ExamStatusActive,
		},
	}

	suite.examMgmt.On("ListExams", suite.ctx, mock.AnythingOfType("map[string]interface {}"), 10, 0).Return(mockExams, 2, nil)

	// Act
	resp, err := suite.service.ListExams(suite.ctx, req)

	// Assert
	require.NoError(t, err)
	assert.NotNil(t, resp)
	assert.True(t, resp.Response.Success)
	assert.Len(t, resp.Exams, 2)
	assert.Equal(t, int32(2), resp.Total)
	assert.Equal(t, "exam-1", resp.Exams[0].Id)
	assert.Equal(t, "exam-2", resp.Exams[1].Id)
	
	suite.examMgmt.AssertExpectations(t)
}
