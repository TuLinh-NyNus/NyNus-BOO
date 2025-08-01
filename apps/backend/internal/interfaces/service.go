package interfaces

import (
	"exam-bank-system/backend/internal/entity"
	"exam-bank-system/backend/internal/service"
)

// AuthServiceInterface defines the contract for authentication operations
type AuthServiceInterface interface {
	Login(email, password string) (*entity.User, string, error)
	Register(email, password, firstName, lastName string) (*entity.User, error)
	ValidateToken(tokenString string) (*service.Claims, error)
	IsAdmin(userID string) (bool, error)
	IsTeacherOrAdmin(userID string) (bool, error)
}

// UserServiceInterface defines the contract for user business operations
type UserServiceInterface interface {
	GetAllUsers(requestorUserID string) ([]entity.User, error)
	GetUserByID(userID string, requestorUserID string) (*entity.User, error)
	CreateUser(req service.CreateUserRequest, requestorUserID string) (*entity.User, error)
	UpdateUser(userID string, req service.UpdateUserRequest, requestorUserID string) (*entity.User, error)
	DeleteUser(userID string, requestorUserID string) error
	GetUserProfile(userID string) (*entity.User, error)
}

// QuestionServiceInterface defines the contract for question business operations
type QuestionServiceInterface interface {
	GetAllQuestions(requestorUserID string) ([]entity.Question, error)
	GetQuestionByID(questionID string, requestorUserID string) (*entity.Question, error)
	CreateQuestion(question *entity.Question, requestorUserID string) (*entity.Question, error)
	UpdateQuestion(questionID string, question *entity.Question, requestorUserID string) (*entity.Question, error)
	DeleteQuestion(questionID string, requestorUserID string) error
}

// ExamServiceInterface defines the contract for exam business operations
type ExamServiceInterface interface {
	GetAllExams(requestorUserID string) ([]entity.Exam, error)
	GetExamByID(examID string, requestorUserID string) (*entity.Exam, error)
	CreateExam(exam *entity.Exam, requestorUserID string) (*entity.Exam, error)
	UpdateExam(examID string, exam *entity.Exam, requestorUserID string) (*entity.Exam, error)
	DeleteExam(examID string, requestorUserID string) error
	StartExam(examID string, userID string) (*entity.ExamAttempt, error)
	SubmitExam(attemptID string, answers map[string]string, userID string) (*entity.ExamAttempt, error)
}
