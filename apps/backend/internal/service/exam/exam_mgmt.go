package exam

import (
	"context"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	repo_interfaces "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/sirupsen/logrus"
)

// ExamMgmt provides management layer for exam operations
// This consolidates functionality from service_mgmt/exam_mgmt
type ExamMgmt struct {
	DB          database.QueryExecer
	ExamService ExamService
	examRepo    repo_interfaces.ExamRepository
	questionRepo repo_interfaces.QuestionRepository
	logger      *logrus.Logger
}

// NewExamMgmt creates a new exam management service
func NewExamMgmt(
	db database.QueryExecer,
	examRepo repo_interfaces.ExamRepository,
	questionRepo repo_interfaces.QuestionRepository,
	logger *logrus.Logger,
) *ExamMgmt {
	examService := NewExamServiceWithDB(
		db,
		examRepo,
		questionRepo,
		logger,
	)

	return &ExamMgmt{
		DB:          db,
		ExamService: examService,
		examRepo:    examRepo,
		questionRepo: questionRepo,
		logger:      logger,
	}
}

// CRUD Operations - delegate to ExamService
func (m *ExamMgmt) CreateExam(ctx context.Context, exam *entity.Exam) error {
	return m.ExamService.CreateExam(ctx, exam)
}

func (m *ExamMgmt) GetExam(ctx context.Context, examID string) (*entity.Exam, error) {
	return m.ExamService.GetExam(ctx, examID)
}

func (m *ExamMgmt) UpdateExam(ctx context.Context, exam *entity.Exam) error {
	return m.ExamService.UpdateExam(ctx, exam)
}

func (m *ExamMgmt) DeleteExam(ctx context.Context, examID string) error {
	return m.ExamService.DeleteExam(ctx, examID)
}

// Query Operations
func (m *ExamMgmt) ListExams(ctx context.Context, offset, limit int) (total int, exams []entity.Exam, err error) {
	return m.ExamService.ListExams(ctx, offset, limit)
}

func (m *ExamMgmt) GetExamsByCreator(ctx context.Context, creatorID string, offset, limit int) ([]entity.Exam, int, error) {
	return m.ExamService.GetExamsByCreator(ctx, creatorID, offset, limit)
}

func (m *ExamMgmt) GetExamsBySubject(ctx context.Context, subject string, offset, limit int) ([]entity.Exam, int, error) {
	return m.ExamService.GetExamsBySubject(ctx, subject, offset, limit)
}

// Exam Execution Operations
func (m *ExamMgmt) StartExam(ctx context.Context, examID, userID string) (*entity.ExamAttempt, error) {
	return m.ExamService.StartExam(ctx, examID, userID)
}

func (m *ExamMgmt) SubmitAnswer(ctx context.Context, attemptID string, questionID string, answer *entity.Answer) error {
	return m.ExamService.SubmitAnswer(ctx, attemptID, questionID, answer)
}

func (m *ExamMgmt) FinishExam(ctx context.Context, attemptID string) (*entity.ExamResult, error) {
	return m.ExamService.FinishExam(ctx, attemptID)
}

func (m *ExamMgmt) GetExamAttempt(ctx context.Context, attemptID string) (*entity.ExamAttempt, error) {
	return m.ExamService.GetExamAttempt(ctx, attemptID)
}

// Scoring & Grading Operations
func (m *ExamMgmt) AutoGradeExam(ctx context.Context, attemptID string) (*entity.ExamResult, error) {
	return m.ExamService.AutoGradeExam(ctx, attemptID)
}

func (m *ExamMgmt) ManualGradeAnswer(ctx context.Context, answerID string, score float64, feedback string) error {
	return m.ExamService.ManualGradeAnswer(ctx, answerID, score, feedback)
}

func (m *ExamMgmt) CalculateExamScore(ctx context.Context, attemptID string) (*ScoreCalculation, error) {
	return m.ExamService.CalculateExamScore(ctx, attemptID)
}

func (m *ExamMgmt) GetExamResults(ctx context.Context, examID string, offset, limit int) ([]entity.ExamResult, int, error) {
	return m.ExamService.GetExamResults(ctx, examID, offset, limit)
}

// Question Management for Exams
func (m *ExamMgmt) AddQuestionToExam(ctx context.Context, examID, questionID string, points float64) error {
	return m.ExamService.AddQuestionToExam(ctx, examID, questionID, points)
}

func (m *ExamMgmt) RemoveQuestionFromExam(ctx context.Context, examID, questionID string) error {
	return m.ExamService.RemoveQuestionFromExam(ctx, examID, questionID)
}

func (m *ExamMgmt) UpdateQuestionPoints(ctx context.Context, examID, questionID string, points float64) error {
	return m.ExamService.UpdateQuestionPoints(ctx, examID, questionID, points)
}

func (m *ExamMgmt) GetExamQuestions(ctx context.Context, examID string) ([]ExamQuestion, error) {
	return m.ExamService.GetExamQuestions(ctx, examID)
}

// Exam Analytics
func (m *ExamMgmt) GetExamStatistics(ctx context.Context, examID string) (*ExamStatistics, error) {
	return m.ExamService.GetExamStatistics(ctx, examID)
}

func (m *ExamMgmt) GetUserExamHistory(ctx context.Context, userID string, offset, limit int) ([]entity.ExamAttempt, int, error) {
	return m.ExamService.GetUserExamHistory(ctx, userID, offset, limit)
}

func (m *ExamMgmt) GetExamPerformanceReport(ctx context.Context, examID string) (*PerformanceReport, error) {
	return m.ExamService.GetExamPerformanceReport(ctx, examID)
}

// Exam Configuration
func (m *ExamMgmt) UpdateExamSettings(ctx context.Context, examID string, settings *ExamSettings) error {
	return m.ExamService.UpdateExamSettings(ctx, examID, settings)
}

func (m *ExamMgmt) GetExamSettings(ctx context.Context, examID string) (*ExamSettings, error) {
	return m.ExamService.GetExamSettings(ctx, examID)
}

func (m *ExamMgmt) ValidateExamConfiguration(ctx context.Context, exam *entity.Exam) error {
	return m.ExamService.ValidateExamConfiguration(ctx, exam)
}

// Legacy methods for backward compatibility with existing exam_mgmt
func (m *ExamMgmt) PublishExam(ctx context.Context, examID string) error {
	// Get exam and update status to active (published)
	exam, err := m.ExamService.GetExam(ctx, examID)
	if err != nil {
		return err
	}

	// Update status to active (published)
	exam.Status = entity.ExamStatusActive
	return m.ExamService.UpdateExam(ctx, exam)
}

func (m *ExamMgmt) ArchiveExam(ctx context.Context, examID string) error {
	// Get exam and update status to archived
	exam, err := m.ExamService.GetExam(ctx, examID)
	if err != nil {
		return err
	}
	
	// Update status to archived
	exam.Status = entity.ExamStatusArchived
	return m.ExamService.UpdateExam(ctx, exam)
}

// Legacy list method with filters and pagination
func (m *ExamMgmt) ListExamsWithFilters(ctx context.Context, filters *repo_interfaces.ExamFilters, pagination *repo_interfaces.Pagination) ([]*entity.Exam, int, error) {
	return m.examRepo.List(ctx, filters, pagination)
}

// Legacy get by ID method
func (m *ExamMgmt) GetExamByID(ctx context.Context, examID string) (*entity.Exam, error) {
	return m.ExamService.GetExam(ctx, examID)
}

// Legacy update status method
func (m *ExamMgmt) UpdateExamStatus(ctx context.Context, examID string, status entity.ExamStatus) error {
	return m.examRepo.UpdateStatus(ctx, examID, status)
}

// Legacy add question method with order
func (m *ExamMgmt) AddQuestionToExamWithOrder(ctx context.Context, examID, questionID string, points float64, order int) error {
	return m.examRepo.AddQuestion(ctx, &entity.ExamQuestion{
		ExamID:      examID,
		QuestionID:  questionID,
		Points:      int(points),
		OrderNumber: order,
	})
}

// Legacy reorder questions method
func (m *ExamMgmt) ReorderExamQuestions(ctx context.Context, examID string, questionOrder map[string]int) error {
	return m.examRepo.ReorderQuestions(ctx, examID, questionOrder)
}

// Legacy get questions method returning entity format
func (m *ExamMgmt) GetExamQuestionsRepo(ctx context.Context, examID string) ([]*entity.ExamQuestion, error) {
	return m.examRepo.GetQuestions(ctx, examID)
}
