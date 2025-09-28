package exam

import (
	"context"
	"fmt"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	repo_interfaces "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/sirupsen/logrus"
)

// ExamServiceImpl implements the ExamService interface
type ExamServiceImpl struct {
	examRepo     repo_interfaces.ExamRepository
	questionRepo repo_interfaces.QuestionRepository
	logger       *logrus.Logger
	db           database.QueryExecer
}

// NewExamService creates a new exam service
func NewExamService(
	examRepo repo_interfaces.ExamRepository,
	questionRepo repo_interfaces.QuestionRepository,
	logger *logrus.Logger,
) ExamService {
	return &ExamServiceImpl{
		examRepo:     examRepo,
		questionRepo: questionRepo,
		logger:       logger,
	}
}

// NewExamServiceWithDB creates a new exam service with database connection
func NewExamServiceWithDB(
	db database.QueryExecer,
	examRepo repo_interfaces.ExamRepository,
	questionRepo repo_interfaces.QuestionRepository,
	logger *logrus.Logger,
) ExamService {
	return &ExamServiceImpl{
		examRepo:     examRepo,
		questionRepo: questionRepo,
		logger:       logger,
		db:           db,
	}
}

// CRUD Operations
func (s *ExamServiceImpl) CreateExam(ctx context.Context, exam *entity.Exam) error {
	return s.examRepo.Create(ctx, exam)
}

func (s *ExamServiceImpl) GetExam(ctx context.Context, examID string) (*entity.Exam, error) {
	return s.examRepo.GetByID(ctx, examID)
}

func (s *ExamServiceImpl) UpdateExam(ctx context.Context, exam *entity.Exam) error {
	return s.examRepo.Update(ctx, exam)
}

func (s *ExamServiceImpl) DeleteExam(ctx context.Context, examID string) error {
	return s.examRepo.Delete(ctx, examID)
}

// Query Operations
func (s *ExamServiceImpl) ListExams(ctx context.Context, offset, limit int) (total int, exams []entity.Exam, err error) {
	// Create basic filters and pagination
	filters := &repo_interfaces.ExamFilters{}
	pagination := &repo_interfaces.Pagination{
		Offset: offset,
		Limit:  limit,
	}
	
	examPtrs, total, err := s.examRepo.List(ctx, filters, pagination)
	if err != nil {
		return 0, nil, err
	}
	
	// Convert []*entity.Exam to []entity.Exam
	exams = make([]entity.Exam, len(examPtrs))
	for i, e := range examPtrs {
		exams[i] = *e
	}
	
	return total, exams, nil
}

func (s *ExamServiceImpl) GetExamsByCreator(ctx context.Context, creatorID string, offset, limit int) ([]entity.Exam, int, error) {
	// Use FindByCreator method instead of filters
	pagination := &repo_interfaces.Pagination{
		Offset: offset,
		Limit:  limit,
	}

	examPtrs, total, err := s.examRepo.FindByCreator(ctx, creatorID, pagination)
	if err != nil {
		return nil, 0, err
	}

	// Convert []*entity.Exam to []entity.Exam
	exams := make([]entity.Exam, len(examPtrs))
	for i, e := range examPtrs {
		exams[i] = *e
	}

	return exams, total, nil
}

func (s *ExamServiceImpl) GetExamsBySubject(ctx context.Context, subject string, offset, limit int) ([]entity.Exam, int, error) {
	// Use FindBySubject method instead of filters
	pagination := &repo_interfaces.Pagination{
		Offset: offset,
		Limit:  limit,
	}

	examPtrs, total, err := s.examRepo.FindBySubject(ctx, subject, pagination)
	if err != nil {
		return nil, 0, err
	}

	// Convert []*entity.Exam to []entity.Exam
	exams := make([]entity.Exam, len(examPtrs))
	for i, e := range examPtrs {
		exams[i] = *e
	}

	return exams, total, nil
}

// Exam Execution Operations - placeholder implementations
func (s *ExamServiceImpl) StartExam(ctx context.Context, examID, userID string) (*entity.ExamAttempt, error) {
	// TODO: Implement exam start logic
	return nil, fmt.Errorf("start exam functionality not implemented yet")
}

func (s *ExamServiceImpl) SubmitAnswer(ctx context.Context, attemptID string, questionID string, answer *entity.Answer) error {
	// TODO: Implement answer submission logic
	return fmt.Errorf("submit answer functionality not implemented yet")
}

func (s *ExamServiceImpl) FinishExam(ctx context.Context, attemptID string) (*entity.ExamResult, error) {
	// TODO: Implement exam finish logic
	return nil, fmt.Errorf("finish exam functionality not implemented yet")
}

func (s *ExamServiceImpl) GetExamAttempt(ctx context.Context, attemptID string) (*entity.ExamAttempt, error) {
	// TODO: Implement get exam attempt logic
	return nil, fmt.Errorf("get exam attempt functionality not implemented yet")
}

// Scoring & Grading Operations - placeholder implementations
func (s *ExamServiceImpl) AutoGradeExam(ctx context.Context, attemptID string) (*entity.ExamResult, error) {
	// TODO: Implement auto grading logic
	return nil, fmt.Errorf("auto grade exam functionality not implemented yet")
}

func (s *ExamServiceImpl) ManualGradeAnswer(ctx context.Context, answerID string, score float64, feedback string) error {
	// TODO: Implement manual grading logic
	return fmt.Errorf("manual grade answer functionality not implemented yet")
}

func (s *ExamServiceImpl) CalculateExamScore(ctx context.Context, attemptID string) (*ScoreCalculation, error) {
	// TODO: Implement score calculation logic
	return nil, fmt.Errorf("calculate exam score functionality not implemented yet")
}

func (s *ExamServiceImpl) GetExamResults(ctx context.Context, examID string, offset, limit int) ([]entity.ExamResult, int, error) {
	// TODO: Implement get exam results logic
	return nil, 0, fmt.Errorf("get exam results functionality not implemented yet")
}

// Question Management for Exams
func (s *ExamServiceImpl) AddQuestionToExam(ctx context.Context, examID, questionID string, points float64) error {
	return s.examRepo.AddQuestion(ctx, &entity.ExamQuestion{
		ExamID:      examID,
		QuestionID:  questionID,
		Points:      int(points), // Convert float64 to int
		OrderNumber: 0, // Will be auto-calculated by repository
	})
}

func (s *ExamServiceImpl) RemoveQuestionFromExam(ctx context.Context, examID, questionID string) error {
	return s.examRepo.RemoveQuestion(ctx, examID, questionID)
}

func (s *ExamServiceImpl) UpdateQuestionPoints(ctx context.Context, examID, questionID string, points float64) error {
	return s.examRepo.UpdateQuestionPoints(ctx, examID, questionID, int(points))
}

func (s *ExamServiceImpl) GetExamQuestions(ctx context.Context, examID string) ([]ExamQuestion, error) {
	examQuestions, err := s.examRepo.GetQuestions(ctx, examID)
	if err != nil {
		return nil, err
	}

	// Convert entity ExamQuestion to service ExamQuestion
	questions := make([]ExamQuestion, len(examQuestions))
	for i, eq := range examQuestions {
		questions[i] = ExamQuestion{
			ExamID:     eq.ExamID,
			QuestionID: eq.QuestionID,
			Points:     float64(eq.Points), // Convert int to float64
			Order:      eq.OrderNumber,     // Use OrderNumber field
		}
	}

	return questions, nil
}

// Exam Analytics - placeholder implementations
func (s *ExamServiceImpl) GetExamStatistics(ctx context.Context, examID string) (*ExamStatistics, error) {
	// TODO: Implement exam statistics logic
	return &ExamStatistics{
		ExamID:           examID,
		TotalAttempts:    0,
		AverageScore:     0.0,
		PassRate:         0.0,
		CompletionRate:   0.0,
		AverageTime:      0.0,
		QuestionStats:    []QuestionStatistic{},
	}, nil
}

func (s *ExamServiceImpl) GetUserExamHistory(ctx context.Context, userID string, offset, limit int) ([]entity.ExamAttempt, int, error) {
	// TODO: Implement user exam history logic
	return []entity.ExamAttempt{}, 0, nil
}

func (s *ExamServiceImpl) GetExamPerformanceReport(ctx context.Context, examID string) (*PerformanceReport, error) {
	// TODO: Implement performance report logic
	return &PerformanceReport{
		ExamID:              examID,
		TotalParticipants:   0,
		AverageScore:        0.0,
		MedianScore:         0.0,
		StandardDeviation:   0.0,
		ScoreDistribution:   []ScoreRange{},
		QuestionAnalysis:    []QuestionAnalysis{},
		TimeAnalysis:        TimeAnalysis{},
	}, nil
}

// Exam Configuration - placeholder implementations
func (s *ExamServiceImpl) UpdateExamSettings(ctx context.Context, examID string, settings *ExamSettings) error {
	// TODO: Implement update exam settings logic
	return fmt.Errorf("update exam settings functionality not implemented yet")
}

func (s *ExamServiceImpl) GetExamSettings(ctx context.Context, examID string) (*ExamSettings, error) {
	// TODO: Implement get exam settings logic
	return &ExamSettings{
		ExamID:           examID,
		TimeLimit:        0,
		MaxAttempts:      1,
		ShuffleQuestions: false,
		ShuffleAnswers:   false,
		ShowResults:      true,
		AllowReview:      true,
		RequirePassword:  false,
		Password:         "",
	}, nil
}

func (s *ExamServiceImpl) ValidateExamConfiguration(ctx context.Context, exam *entity.Exam) error {
	// TODO: Implement exam configuration validation logic
	return nil
}
