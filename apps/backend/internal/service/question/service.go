package question

import (
	"fmt"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/auth"
)

// Service handles question business logic
type Service struct {
	repo        RepositoryInterface
	authService auth.ServiceInterface
	userService UserServiceInterface
}

// UserServiceInterface defines what we need from user service
type UserServiceInterface interface {
	ValidateUserExists(userID string) (bool, error)
	GetUserBasicInfo(userID string) (*entity.User, error)
}

// NewService creates a new question service
func NewService(repo RepositoryInterface, authService auth.ServiceInterface, userService UserServiceInterface) *Service {
	return &Service{
		repo:        repo,
		authService: authService,
		userService: userService,
	}
}

// GetAll returns all questions (teacher/admin only)
func (s *Service) GetAll(requestorUserID string) ([]entity.Question, error) {
	// Check if requestor has permission
	isAuthorized, err := s.authService.IsTeacherOrAdmin(requestorUserID)
	if err != nil {
		return nil, fmt.Errorf("failed to check authorization: %w", err)
	}
	if !isAuthorized {
		return nil, fmt.Errorf("insufficient permissions: only teachers and admins can list questions")
	}

	return s.repo.GetAll()
}

// GetByID returns a question by ID (teacher/admin only)
func (s *Service) GetByID(questionID string, requestorUserID string) (*entity.Question, error) {
	// Check if requestor has permission
	isAuthorized, err := s.authService.IsTeacherOrAdmin(requestorUserID)
	if err != nil {
		return nil, fmt.Errorf("failed to check authorization: %w", err)
	}
	if !isAuthorized {
		return nil, fmt.Errorf("insufficient permissions: only teachers and admins can view questions")
	}

	return s.repo.GetByID(questionID)
}

// Create creates a new question (teacher/admin only)
func (s *Service) Create(question *entity.Question, requestorUserID string) (*entity.Question, error) {
	// Check if requestor has permission
	isAuthorized, err := s.authService.IsTeacherOrAdmin(requestorUserID)
	if err != nil {
		return nil, fmt.Errorf("failed to check authorization: %w", err)
	}
	if !isAuthorized {
		return nil, fmt.Errorf("insufficient permissions: only teachers and admins can create questions")
	}

	// Validate question
	if err := s.validateQuestion(question); err != nil {
		return nil, err
	}

	// Set creator
	question.CreatedBy = requestorUserID

	// Save to database
	if err := s.repo.Create(question); err != nil {
		return nil, fmt.Errorf("failed to create question: %w", err)
	}

	return question, nil
}

// Update updates a question (teacher/admin only)
func (s *Service) Update(questionID string, question *entity.Question, requestorUserID string) (*entity.Question, error) {
	// Check if requestor has permission
	isAuthorized, err := s.authService.IsTeacherOrAdmin(requestorUserID)
	if err != nil {
		return nil, fmt.Errorf("failed to check authorization: %w", err)
	}
	if !isAuthorized {
		return nil, fmt.Errorf("insufficient permissions: only teachers and admins can update questions")
	}

	// Get existing question
	existingQuestion, err := s.repo.GetByID(questionID)
	if err != nil {
		return nil, fmt.Errorf("question not found: %w", err)
	}

	// Check if user can update this question (creator or admin)
	isAdmin, err := s.authService.IsAdmin(requestorUserID)
	if err != nil {
		return nil, fmt.Errorf("failed to check admin status: %w", err)
	}

	if !isAdmin && existingQuestion.CreatedBy != requestorUserID {
		return nil, fmt.Errorf("insufficient permissions: can only update your own questions")
	}

	// Validate question
	if err := s.validateQuestion(question); err != nil {
		return nil, err
	}

	// Update fields
	question.ID = questionID
	question.CreatedBy = existingQuestion.CreatedBy // Preserve original creator

	// Save changes
	if err := s.repo.Update(question); err != nil {
		return nil, fmt.Errorf("failed to update question: %w", err)
	}

	return question, nil
}

// Delete deletes a question (teacher/admin only)
func (s *Service) Delete(questionID string, requestorUserID string) error {
	// Check if requestor has permission
	isAuthorized, err := s.authService.IsTeacherOrAdmin(requestorUserID)
	if err != nil {
		return fmt.Errorf("failed to check authorization: %w", err)
	}
	if !isAuthorized {
		return fmt.Errorf("insufficient permissions: only teachers and admins can delete questions")
	}

	// Get existing question
	existingQuestion, err := s.repo.GetByID(questionID)
	if err != nil {
		return fmt.Errorf("question not found: %w", err)
	}

	// Check if user can delete this question (creator or admin)
	isAdmin, err := s.authService.IsAdmin(requestorUserID)
	if err != nil {
		return fmt.Errorf("failed to check admin status: %w", err)
	}

	if !isAdmin && existingQuestion.CreatedBy != requestorUserID {
		return fmt.Errorf("insufficient permissions: can only delete your own questions")
	}

	return s.repo.Delete(questionID)
}

// GetQuestionsByCreator returns questions created by a specific user
func (s *Service) GetQuestionsByCreator(creatorID string, requestorUserID string) ([]entity.Question, error) {
	// Check if requestor has permission
	isAuthorized, err := s.authService.IsTeacherOrAdmin(requestorUserID)
	if err != nil {
		return nil, fmt.Errorf("failed to check authorization: %w", err)
	}
	if !isAuthorized && creatorID != requestorUserID {
		return nil, fmt.Errorf("insufficient permissions: can only view your own questions")
	}

	// Validate creator exists using user service
	exists, err := s.userService.ValidateUserExists(creatorID)
	if err != nil {
		return nil, fmt.Errorf("failed to validate creator: %w", err)
	}
	if !exists {
		return nil, fmt.Errorf("creator user not found")
	}

	// TODO: Implement repository method to get questions by creator
	// For now, return empty slice
	return []entity.Question{}, nil
}

// ValidateQuestionExists checks if a question exists (for internal service use)
func (s *Service) ValidateQuestionExists(questionID string) (bool, error) {
	_, err := s.repo.GetByID(questionID)
	if err != nil {
		return false, nil // Question doesn't exist
	}
	return true, nil
}

// validateQuestion validates question data
func (s *Service) validateQuestion(question *entity.Question) error {
	if question.Text == "" {
		return fmt.Errorf("question text is required")
	}
	if question.Type == "" {
		return fmt.Errorf("question type is required")
	}
	if question.Points <= 0 {
		return fmt.Errorf("question points must be greater than 0")
	}
	return nil
}
