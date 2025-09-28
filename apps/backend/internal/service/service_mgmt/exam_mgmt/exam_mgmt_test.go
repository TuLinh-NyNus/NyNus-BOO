package exam_mgmt_test

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/exam_mgmt"
)

// MockExamRepository is a mock implementation of ExamRepository
type MockExamRepository struct {
	mock.Mock
}

func (m *MockExamRepository) CreateExam(ctx context.Context, exam *entity.Exam) error {
	args := m.Called(ctx, exam)
	return args.Error(0)
}

func (m *MockExamRepository) GetExamByID(ctx context.Context, id string) (*entity.Exam, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*entity.Exam), args.Error(1)
}

func (m *MockExamRepository) UpdateExam(ctx context.Context, exam *entity.Exam) error {
	args := m.Called(ctx, exam)
	return args.Error(0)
}

func (m *MockExamRepository) DeleteExam(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockExamRepository) ListExams(ctx context.Context, filters map[string]interface{}, limit, offset int) ([]*entity.Exam, int, error) {
	args := m.Called(ctx, filters, limit, offset)
	return args.Get(0).([]*entity.Exam), args.Int(1), args.Error(2)
}

func (m *MockExamRepository) PublishExam(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockExamRepository) ArchiveExam(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockExamRepository) AddQuestionToExam(ctx context.Context, examID, questionID string, orderNumber int) error {
	args := m.Called(ctx, examID, questionID, orderNumber)
	return args.Error(0)
}

func (m *MockExamRepository) RemoveQuestionFromExam(ctx context.Context, examID, questionID string) error {
	args := m.Called(ctx, examID, questionID)
	return args.Error(0)
}

func (m *MockExamRepository) GetExamQuestions(ctx context.Context, examID string) ([]*entity.Question, error) {
	args := m.Called(ctx, examID)
	return args.Get(0).([]*entity.Question), args.Error(1)
}

func (m *MockExamRepository) ReorderExamQuestions(ctx context.Context, examID string, questionOrders map[string]int) error {
	args := m.Called(ctx, examID, questionOrders)
	return args.Error(0)
}

// MockQuestionRepository is a mock implementation of QuestionRepository
type MockQuestionRepository struct {
	mock.Mock
}

func (m *MockQuestionRepository) GetQuestionByID(ctx context.Context, id string) (*entity.Question, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.Question), args.Error(1)
}

// Test Suite
type ExamMgmtTestSuite struct {
	examRepo     *MockExamRepository
	questionRepo *MockQuestionRepository
	service      *exam_mgmt.ExamMgmt
	ctx          context.Context
}

func setupTestSuite(t *testing.T) *ExamMgmtTestSuite {
	examRepo := &MockExamRepository{}
	questionRepo := &MockQuestionRepository{}
	
	service := exam_mgmt.NewExamMgmt(examRepo, questionRepo)
	
	return &ExamMgmtTestSuite{
		examRepo:     examRepo,
		questionRepo: questionRepo,
		service:      service,
		ctx:          context.Background(),
	}
}

// ===== CREATE EXAM TESTS =====

func TestExamMgmt_CreateExam_Success(t *testing.T) {
	suite := setupTestSuite(t)

	// Arrange
	examData := &entity.Exam{
		Title:           "Test Exam",
		Description:     "Test Description",
		DurationMinutes: 60,
		TotalPoints:     100,
		PassPercentage:  70,
		ExamType:        entity.ExamTypeGenerated,
		Status:          entity.ExamStatusPending,
		CreatedBy:       "test-user",
	}

	suite.examRepo.On("CreateExam", suite.ctx, mock.AnythingOfType("*entity.Exam")).Return(nil)

	// Act
	result, err := suite.service.CreateExam(suite.ctx, examData)

	// Assert
	require.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, examData.Title, result.Title)
	assert.Equal(t, examData.Description, result.Description)
	assert.Equal(t, entity.ExamStatusPending, result.Status)
	assert.NotEmpty(t, result.ID)
	assert.NotZero(t, result.CreatedAt)
	
	suite.examRepo.AssertExpectations(t)
}

func TestExamMgmt_CreateExam_ValidationError(t *testing.T) {
	suite := setupTestSuite(t)

	testCases := []struct {
		name     string
		examData *entity.Exam
		wantErr  string
	}{
		{
			name: "Empty title",
			examData: &entity.Exam{
				Title:           "",
				Description:     "Test Description",
				DurationMinutes: 60,
			},
			wantErr: "title is required",
		},
		{
			name: "Invalid duration",
			examData: &entity.Exam{
				Title:           "Test Exam",
				Description:     "Test Description",
				DurationMinutes: 0,
			},
			wantErr: "duration must be greater than 0",
		},
		{
			name: "Invalid pass percentage",
			examData: &entity.Exam{
				Title:           "Test Exam",
				Description:     "Test Description",
				DurationMinutes: 60,
				PassPercentage:  150,
			},
			wantErr: "pass percentage must be between 0 and 100",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Act
			result, err := suite.service.CreateExam(suite.ctx, tc.examData)

			// Assert
			assert.Error(t, err)
			assert.Nil(t, result)
			assert.Contains(t, err.Error(), tc.wantErr)
		})
	}
}

// ===== QUESTION MANAGEMENT TESTS =====

func TestExamMgmt_AddQuestionToExam_Success(t *testing.T) {
	suite := setupTestSuite(t)

	// Arrange
	examID := "exam-123"
	questionID := "question-456"
	orderNumber := 1

	mockExam := &entity.Exam{
		ID:     examID,
		Status: entity.ExamStatusPending,
	}

	mockQuestion := &entity.Question{
		ID: questionID,
	}

	suite.examRepo.On("GetExamByID", suite.ctx, examID).Return(mockExam, nil)
	suite.questionRepo.On("GetQuestionByID", suite.ctx, questionID).Return(mockQuestion, nil)
	suite.examRepo.On("AddQuestionToExam", suite.ctx, examID, questionID, orderNumber).Return(nil)

	// Act
	err := suite.service.AddQuestionToExam(suite.ctx, examID, questionID, orderNumber)

	// Assert
	require.NoError(t, err)
	suite.examRepo.AssertExpectations(t)
	suite.questionRepo.AssertExpectations(t)
}

func TestExamMgmt_AddQuestionToExam_ExamNotFound(t *testing.T) {
	suite := setupTestSuite(t)

	// Arrange
	examID := "nonexistent-exam"
	questionID := "question-456"
	orderNumber := 1

	suite.examRepo.On("GetExamByID", suite.ctx, examID).Return((*entity.Exam)(nil), assert.AnError)

	// Act
	err := suite.service.AddQuestionToExam(suite.ctx, examID, questionID, orderNumber)

	// Assert
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "exam not found")
	suite.examRepo.AssertExpectations(t)
}

func TestExamMgmt_AddQuestionToExam_ExamPublished(t *testing.T) {
	suite := setupTestSuite(t)

	// Arrange
	examID := "exam-123"
	questionID := "question-456"
	orderNumber := 1

	mockExam := &entity.Exam{
		ID:     examID,
		Status: entity.ExamStatusActive, // Published exam
	}

	suite.examRepo.On("GetExamByID", suite.ctx, examID).Return(mockExam, nil)

	// Act
	err := suite.service.AddQuestionToExam(suite.ctx, examID, questionID, orderNumber)

	// Assert
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "cannot modify published exam")
	suite.examRepo.AssertExpectations(t)
}

// ===== WORKFLOW TESTS =====

func TestExamMgmt_PublishExam_Success(t *testing.T) {
	suite := setupTestSuite(t)

	// Arrange
	examID := "exam-123"
	mockExam := &entity.Exam{
		ID:     examID,
		Status: entity.ExamStatusPending,
		Title:  "Test Exam",
	}

	mockQuestions := []*entity.Question{
		{ID: "q1"},
		{ID: "q2"},
	}

	suite.examRepo.On("GetExamByID", suite.ctx, examID).Return(mockExam, nil)
	suite.examRepo.On("GetExamQuestions", suite.ctx, examID).Return(mockQuestions, nil)
	suite.examRepo.On("PublishExam", suite.ctx, examID).Return(nil)

	// Act
	err := suite.service.PublishExam(suite.ctx, examID)

	// Assert
	require.NoError(t, err)
	suite.examRepo.AssertExpectations(t)
}

func TestExamMgmt_PublishExam_NoQuestions(t *testing.T) {
	suite := setupTestSuite(t)

	// Arrange
	examID := "exam-123"
	mockExam := &entity.Exam{
		ID:     examID,
		Status: entity.ExamStatusPending,
		Title:  "Test Exam",
	}

	emptyQuestions := []*entity.Question{}

	suite.examRepo.On("GetExamByID", suite.ctx, examID).Return(mockExam, nil)
	suite.examRepo.On("GetExamQuestions", suite.ctx, examID).Return(emptyQuestions, nil)

	// Act
	err := suite.service.PublishExam(suite.ctx, examID)

	// Assert
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "exam must have at least one question")
	suite.examRepo.AssertExpectations(t)
}

func TestExamMgmt_PublishExam_AlreadyPublished(t *testing.T) {
	suite := setupTestSuite(t)

	// Arrange
	examID := "exam-123"
	mockExam := &entity.Exam{
		ID:     examID,
		Status: entity.ExamStatusActive, // Already published
		Title:  "Test Exam",
	}

	suite.examRepo.On("GetExamByID", suite.ctx, examID).Return(mockExam, nil)

	// Act
	err := suite.service.PublishExam(suite.ctx, examID)

	// Assert
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "exam is already published")
	suite.examRepo.AssertExpectations(t)
}
