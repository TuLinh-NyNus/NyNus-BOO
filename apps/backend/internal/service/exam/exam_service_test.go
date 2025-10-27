package exam

import (
	"context"
	"errors"
	"testing"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

// mockExamRepository implements the subset of repository behavior used by ExamService.
type mockExamRepository struct {
	mock.Mock
}

func (m *mockExamRepository) Create(ctx context.Context, exam *entity.Exam) error {
	args := m.Called(ctx, exam)
	return args.Error(0)
}

func (m *mockExamRepository) GetByID(ctx context.Context, examID string) (*entity.Exam, error) {
	args := m.Called(ctx, examID)
	exam, _ := args.Get(0).(*entity.Exam)
	return exam, args.Error(1)
}

func (m *mockExamRepository) Update(ctx context.Context, exam *entity.Exam) error {
	args := m.Called(ctx, exam)
	return args.Error(0)
}

func (m *mockExamRepository) Delete(ctx context.Context, examID string) error {
	args := m.Called(ctx, examID)
	return args.Error(0)
}

func (m *mockExamRepository) List(ctx context.Context, filters *interfaces.ExamFilters, pagination *interfaces.Pagination) ([]*entity.Exam, int, error) {
	args := m.Called(ctx, filters, pagination)
	exams, _ := args.Get(0).([]*entity.Exam)
	return exams, args.Int(1), args.Error(2)
}

func (m *mockExamRepository) Publish(ctx context.Context, examID string) error {
	args := m.Called(ctx, examID)
	return args.Error(0)
}

func (m *mockExamRepository) Archive(ctx context.Context, examID string) error {
	args := m.Called(ctx, examID)
	return args.Error(0)
}

func (m *mockExamRepository) GetQuestions(ctx context.Context, examID string) ([]*entity.ExamQuestion, error) {
	args := m.Called(ctx, examID)
	questions, _ := args.Get(0).([]*entity.ExamQuestion)
	return questions, args.Error(1)
}

func (m *mockExamRepository) AddQuestion(ctx context.Context, eq *entity.ExamQuestion) error {
	args := m.Called(ctx, eq)
	return args.Error(0)
}

func (m *mockExamRepository) RemoveQuestion(ctx context.Context, examID, questionID string) error {
	args := m.Called(ctx, examID, questionID)
	return args.Error(0)
}

func (m *mockExamRepository) CountAttempts(ctx context.Context, examID string) (int, error) {
	args := m.Called(ctx, examID)
	return args.Int(0), args.Error(1)
}

func TestCreateExam_Success(t *testing.T) {
	ctx := context.Background()
	examRepo := &mockExamRepository{}
	logger := logrus.New()

	examInput := &entity.Exam{
		Title:           "Midterm",
		Subject:         "Math",
		DurationMinutes: 90,
	}

	examRepo.On("Create", ctx, examInput).Return(nil).Once()

	service := NewExamService(examRepo, nil, logger)

	err := service.CreateExam(ctx, examInput)

	require.NoError(t, err)
	examRepo.AssertExpectations(t)
	assert.Equal(t, entity.ExamStatusPending, examInput.Status)
	assert.Equal(t, entity.ExamTypeGenerated, examInput.ExamType)
	assert.Equal(t, entity.DifficultyMedium, examInput.Difficulty)
}

func TestCreateExam_ValidationErrors(t *testing.T) {
	ctx := context.Background()
	examRepo := &mockExamRepository{}
	service := NewExamService(examRepo, nil, logrus.New())

	tests := []struct {
		name        string
		exam        *entity.Exam
		expectedErr string
	}{
		{
			name:        "missing title",
			exam:        &entity.Exam{Subject: "Physics", DurationMinutes: 45},
			expectedErr: "exam title is required",
		},
		{
			name:        "missing subject",
			exam:        &entity.Exam{Title: "Quiz 1", DurationMinutes: 30},
			expectedErr: "exam subject is required",
		},
		{
			name:        "non positive duration",
			exam:        &entity.Exam{Title: "Quiz 2", Subject: "Chemistry", DurationMinutes: 0},
			expectedErr: "exam duration must be positive",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			err := service.CreateExam(ctx, tc.exam)

			require.Error(t, err)
			assert.Contains(t, err.Error(), tc.expectedErr)
		})
	}

	examRepo.AssertExpectations(t)
}

func TestDeleteExam_WithExistingAttempts(t *testing.T) {
	ctx := context.Background()
	examRepo := &mockExamRepository{}
	examID := "exam-123"

	examRepo.On("GetByID", ctx, examID).Return(&entity.Exam{
		ID:     examID,
		Status: entity.ExamStatusActive,
	}, nil).Once()
	examRepo.On("CountAttempts", ctx, examID).Return(2, nil).Once()

	service := NewExamService(examRepo, nil, logrus.New())

	err := service.DeleteExam(ctx, examID)

	require.Error(t, err)
	assert.Contains(t, err.Error(), "cannot delete exam with existing attempts")
	examRepo.AssertNotCalled(t, "Delete", ctx, examID)
	examRepo.AssertExpectations(t)
}

func TestPublishExam_NoQuestions(t *testing.T) {
	ctx := context.Background()
	examRepo := &mockExamRepository{}
	examID := "exam-123"

	examRepo.On("GetByID", ctx, examID).Return(&entity.Exam{
		ID:     examID,
		Status: entity.ExamStatusPending,
		Title:  "Final",
	}, nil).Once()
	examRepo.On("GetQuestions", ctx, examID).Return([]*entity.ExamQuestion{}, nil).Once()

	service := NewExamService(examRepo, nil, logrus.New())

	err := service.PublishExam(ctx, examID)

	require.Error(t, err)
	assert.Contains(t, err.Error(), "cannot publish exam without questions")
	examRepo.AssertExpectations(t)
}

func TestAddQuestionToExam_InvalidStates(t *testing.T) {
	ctx := context.Background()
	examRepo := &mockExamRepository{}
	examID := "exam-123"

	tests := []struct {
		name        string
		examStatus  entity.ExamStatus
		expectedErr string
	}{
		{
			name:        "published exam",
			examStatus:  entity.ExamStatusActive,
			expectedErr: "cannot modify published exam",
		},
		{
			name:        "archived exam",
			examStatus:  entity.ExamStatusArchived,
			expectedErr: "cannot modify archived exam",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			examRepo.ExpectedCalls = nil
			examRepo.On("GetByID", ctx, examID).Return(&entity.Exam{
				ID:     examID,
				Status: tc.examStatus,
			}, nil).Once()

			service := NewExamService(examRepo, nil, logrus.New())
			err := service.AddQuestionToExam(ctx, examID, "question-1", 10)

			require.Error(t, err)
			assert.Contains(t, err.Error(), tc.expectedErr)
			examRepo.AssertExpectations(t)
		})
	}
}

func TestAddQuestionToExam_Success(t *testing.T) {
	ctx := context.Background()
	examRepo := &mockExamRepository{}
	examID := "exam-123"

	examRepo.On("GetByID", ctx, examID).Return(&entity.Exam{
		ID:     examID,
		Status: entity.ExamStatusPending,
	}, nil).Once()
	examRepo.On("AddQuestion", ctx, mock.AnythingOfType("*entity.ExamQuestion")).Return(nil).Once()

	service := NewExamService(examRepo, nil, logrus.New())

	err := service.AddQuestionToExam(ctx, examID, "question-456", 5)

	require.NoError(t, err)
	examRepo.AssertExpectations(t)
}

func TestDeleteExam_RepositoryError(t *testing.T) {
	ctx := context.Background()
	examRepo := &mockExamRepository{}
	examID := "exam-456"
	repoErr := errors.New("db error")

	examRepo.On("GetByID", ctx, examID).Return(&entity.Exam{
		ID:     examID,
		Status: entity.ExamStatusActive,
	}, nil).Once()
	examRepo.On("CountAttempts", ctx, examID).Return(0, nil).Once()
	examRepo.On("Delete", ctx, examID).Return(repoErr).Once()

	service := NewExamService(examRepo, nil, logrus.New())

	err := service.DeleteExam(ctx, examID)

	require.Error(t, err)
	assert.Contains(t, err.Error(), "failed to delete exam")
	examRepo.AssertExpectations(t)
}
