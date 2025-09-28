package exam

import (
	"context"
	"fmt"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/sirupsen/logrus"
)

// LegacyExamMgmt provides business logic for exam management (legacy implementation)
// Following QuestionMgmt pattern for consistency
type LegacyExamMgmt struct {
	examRepo     interfaces.ExamRepository
	questionRepo interfaces.QuestionRepository
	logger       *logrus.Logger
}

// NewLegacyExamMgmt creates a new exam management service (legacy)
func NewLegacyExamMgmt(
	examRepo interfaces.ExamRepository,
	questionRepo interfaces.QuestionRepository,
	logger *logrus.Logger,
) *LegacyExamMgmt {
	return &LegacyExamMgmt{
		examRepo:     examRepo,
		questionRepo: questionRepo,
		logger:       logger,
	}
}

// CreateExam creates a new exam with business logic validation
func (m *LegacyExamMgmt) CreateExam(ctx context.Context, exam *entity.Exam) error {
	m.logger.WithFields(logrus.Fields{
		"exam_title": exam.Title,
		"exam_type":  exam.ExamType,
		"subject":    exam.Subject,
	}).Info("Creating new exam")

	// Validate required fields
	if exam.Title == "" {
		return fmt.Errorf("exam title is required")
	}
	if exam.Subject == "" {
		return fmt.Errorf("exam subject is required")
	}
	if exam.DurationMinutes <= 0 {
		return fmt.Errorf("exam duration must be positive")
	}

	// Set defaults if not provided
	if exam.Status == "" {
		exam.Status = entity.ExamStatusPending
	}
	if exam.ExamType == "" {
		exam.ExamType = entity.ExamTypeGenerated
	}
	if exam.Difficulty == "" {
		exam.Difficulty = entity.DifficultyMedium
	}
	if exam.PassPercentage == 0 {
		exam.PassPercentage = 60
	}
	if exam.MaxAttempts == 0 {
		exam.MaxAttempts = 1
	}

	// Create exam in repository
	err := m.examRepo.Create(ctx, exam)
	if err != nil {
		m.logger.WithError(err).Error("Failed to create exam")
		return fmt.Errorf("failed to create exam: %w", err)
	}

	m.logger.WithField("exam_id", exam.ID).Info("Exam created successfully")
	return nil
}

// GetExamByID retrieves an exam by ID
func (m *LegacyExamMgmt) GetExamByID(ctx context.Context, id string) (*entity.Exam, error) {
	m.logger.WithField("exam_id", id).Debug("Getting exam by ID")

	if id == "" {
		return nil, fmt.Errorf("exam ID is required")
	}

	exam, err := m.examRepo.GetByID(ctx, id)
	if err != nil {
		m.logger.WithError(err).WithField("exam_id", id).Error("Failed to get exam")
		return nil, fmt.Errorf("failed to get exam: %w", err)
	}

	return exam, nil
}

// UpdateExam updates an existing exam
func (m *LegacyExamMgmt) UpdateExam(ctx context.Context, exam *entity.Exam) error {
	m.logger.WithFields(logrus.Fields{
		"exam_id":    exam.ID,
		"exam_title": exam.Title,
	}).Info("Updating exam")

	// Validate exam exists
	existing, err := m.examRepo.GetByID(ctx, exam.ID)
	if err != nil {
		return fmt.Errorf("exam not found: %w", err)
	}

	// Validate business rules
	if existing.Status == entity.ExamStatusArchived {
		return fmt.Errorf("cannot update archived exam")
	}

	// Validate required fields
	if exam.Title == "" {
		return fmt.Errorf("exam title is required")
	}
	if exam.Subject == "" {
		return fmt.Errorf("exam subject is required")
	}

	err = m.examRepo.Update(ctx, exam)
	if err != nil {
		m.logger.WithError(err).Error("Failed to update exam")
		return fmt.Errorf("failed to update exam: %w", err)
	}

	m.logger.WithField("exam_id", exam.ID).Info("Exam updated successfully")
	return nil
}

// DeleteExam deletes an exam with dependency checks
func (m *LegacyExamMgmt) DeleteExam(ctx context.Context, examID string) error {
	m.logger.WithField("exam_id", examID).Info("Deleting exam")

	if examID == "" {
		return fmt.Errorf("exam ID is required")
	}

	// Check if exam exists
	exam, err := m.examRepo.GetByID(ctx, examID)
	if err != nil {
		return fmt.Errorf("exam not found: %w", err)
	}

	// Business rule: Cannot delete published exams with attempts
	if exam.Status == entity.ExamStatusActive {
		attemptCount, err := m.examRepo.CountAttempts(ctx, examID)
		if err != nil {
			return fmt.Errorf("failed to check exam attempts: %w", err)
		}
		if attemptCount > 0 {
			return fmt.Errorf("cannot delete exam with existing attempts")
		}
	}

	err = m.examRepo.Delete(ctx, examID)
	if err != nil {
		m.logger.WithError(err).Error("Failed to delete exam")
		return fmt.Errorf("failed to delete exam: %w", err)
	}

	m.logger.WithField("exam_id", examID).Info("Exam deleted successfully")
	return nil
}

// PublishExam publishes an exam (changes status to ACTIVE)
func (m *LegacyExamMgmt) PublishExam(ctx context.Context, examID string) error {
	m.logger.WithField("exam_id", examID).Info("Publishing exam")

	if examID == "" {
		return fmt.Errorf("exam ID is required")
	}

	// Validate exam exists and can be published
	exam, err := m.examRepo.GetByID(ctx, examID)
	if err != nil {
		return fmt.Errorf("exam not found: %w", err)
	}

	if exam.Status == entity.ExamStatusActive {
		return fmt.Errorf("exam is already published")
	}
	if exam.Status == entity.ExamStatusArchived {
		return fmt.Errorf("cannot publish archived exam")
	}

	// Business rule: Must have at least one question
	questions, err := m.examRepo.GetQuestions(ctx, examID)
	if err != nil {
		return fmt.Errorf("failed to check exam questions: %w", err)
	}
	if len(questions) == 0 {
		return fmt.Errorf("cannot publish exam without questions")
	}

	err = m.examRepo.Publish(ctx, examID)
	if err != nil {
		m.logger.WithError(err).Error("Failed to publish exam")
		return fmt.Errorf("failed to publish exam: %w", err)
	}

	m.logger.WithField("exam_id", examID).Info("Exam published successfully")
	return nil
}

// ArchiveExam archives an exam (changes status to ARCHIVED)
func (m *LegacyExamMgmt) ArchiveExam(ctx context.Context, examID string) error {
	m.logger.WithField("exam_id", examID).Info("Archiving exam")

	if examID == "" {
		return fmt.Errorf("exam ID is required")
	}

	err := m.examRepo.Archive(ctx, examID)
	if err != nil {
		m.logger.WithError(err).Error("Failed to archive exam")
		return fmt.Errorf("failed to archive exam: %w", err)
	}

	m.logger.WithField("exam_id", examID).Info("Exam archived successfully")
	return nil
}

// ListExams lists exams with pagination and filtering
func (m *LegacyExamMgmt) ListExams(ctx context.Context, filters *interfaces.ExamFilters, pagination *interfaces.Pagination) ([]*entity.Exam, int, error) {
	m.logger.Debug("Listing exams")

	exams, total, err := m.examRepo.List(ctx, filters, pagination)
	if err != nil {
		m.logger.WithError(err).Error("Failed to list exams")
		return nil, 0, fmt.Errorf("failed to list exams: %w", err)
	}

	m.logger.WithFields(logrus.Fields{
		"total_exams": total,
		"returned":    len(exams),
	}).Debug("Exams listed successfully")

	return exams, total, nil
}

// AddQuestionToExam adds a question to an exam
func (m *LegacyExamMgmt) AddQuestionToExam(ctx context.Context, examID, questionID string, points int) error {
	m.logger.WithFields(logrus.Fields{
		"exam_id":     examID,
		"question_id": questionID,
		"points":      points,
	}).Info("Adding question to exam")

	if examID == "" {
		return fmt.Errorf("exam ID is required")
	}
	if questionID == "" {
		return fmt.Errorf("question ID is required")
	}
	if points <= 0 {
		return fmt.Errorf("points must be positive")
	}

	// Validate exam exists and is editable
	exam, err := m.examRepo.GetByID(ctx, examID)
	if err != nil {
		return fmt.Errorf("exam not found: %w", err)
	}
	if exam.Status == entity.ExamStatusActive {
		return fmt.Errorf("cannot modify published exam")
	}
	if exam.Status == entity.ExamStatusArchived {
		return fmt.Errorf("cannot modify archived exam")
	}

	// Create ExamQuestion entity
	examQuestion := &entity.ExamQuestion{
		ExamID:      examID,
		QuestionID:  questionID,
		Points:      points,
		OrderNumber: 0, // Will be set by repository
	}

	err = m.examRepo.AddQuestion(ctx, examQuestion)
	if err != nil {
		m.logger.WithError(err).Error("Failed to add question to exam")
		return fmt.Errorf("failed to add question to exam: %w", err)
	}

	m.logger.WithFields(logrus.Fields{
		"exam_id":     examID,
		"question_id": questionID,
	}).Info("Question added to exam successfully")
	return nil
}

// RemoveQuestionFromExam removes a question from an exam
func (m *LegacyExamMgmt) RemoveQuestionFromExam(ctx context.Context, examID, questionID string) error {
	m.logger.WithFields(logrus.Fields{
		"exam_id":     examID,
		"question_id": questionID,
	}).Info("Removing question from exam")

	if examID == "" {
		return fmt.Errorf("exam ID is required")
	}
	if questionID == "" {
		return fmt.Errorf("question ID is required")
	}

	// Validate exam exists and is editable
	exam, err := m.examRepo.GetByID(ctx, examID)
	if err != nil {
		return fmt.Errorf("exam not found: %w", err)
	}
	if exam.Status == entity.ExamStatusActive {
		return fmt.Errorf("cannot modify published exam")
	}
	if exam.Status == entity.ExamStatusArchived {
		return fmt.Errorf("cannot modify archived exam")
	}

	err = m.examRepo.RemoveQuestion(ctx, examID, questionID)
	if err != nil {
		m.logger.WithError(err).Error("Failed to remove question from exam")
		return fmt.Errorf("failed to remove question from exam: %w", err)
	}

	m.logger.WithFields(logrus.Fields{
		"exam_id":     examID,
		"question_id": questionID,
	}).Info("Question removed from exam successfully")
	return nil
}

// GetExamQuestions retrieves all questions for an exam
func (m *LegacyExamMgmt) GetExamQuestions(ctx context.Context, examID string) ([]*entity.ExamQuestion, error) {
	m.logger.WithField("exam_id", examID).Debug("Getting exam questions")

	if examID == "" {
		return nil, fmt.Errorf("exam ID is required")
	}

	questions, err := m.examRepo.GetQuestions(ctx, examID)
	if err != nil {
		m.logger.WithError(err).Error("Failed to get exam questions")
		return nil, fmt.Errorf("failed to get exam questions: %w", err)
	}

	return questions, nil
}
