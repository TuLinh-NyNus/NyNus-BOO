package interfaces

import "exam-bank-system/backend/internal/entity"

// UserRepositoryInterface defines the contract for user data access
type UserRepositoryInterface interface {
	GetAll() ([]entity.User, error)
	GetByID(id string) (*entity.User, error)
	GetByEmail(email string) (*entity.User, error)
	Create(user *entity.User) error
	Update(user *entity.User) error
	Delete(id string) error
}

// QuestionRepositoryInterface defines the contract for question data access
type QuestionRepositoryInterface interface {
	GetAll() ([]entity.Question, error)
	GetByID(id string) (*entity.Question, error)
	Create(question *entity.Question) error
	Update(question *entity.Question) error
	Delete(id string) error
}

// AnswerRepositoryInterface defines the contract for answer data access
type AnswerRepositoryInterface interface {
	GetByQuestionID(questionID string) ([]entity.Answer, error)
	GetByID(id string) (*entity.Answer, error)
	Create(answer *entity.Answer) error
	Update(answer *entity.Answer) error
	Delete(id string) error
	DeleteByQuestionID(questionID string) error
}

// ExamRepositoryInterface defines the contract for exam data access
type ExamRepositoryInterface interface {
	GetAll() ([]entity.Exam, error)
	GetByID(id string) (*entity.Exam, error)
	Create(exam *entity.Exam) error
	Update(exam *entity.Exam) error
	Delete(id string) error
}

// ExamAttemptRepositoryInterface defines the contract for exam attempt data access
type ExamAttemptRepositoryInterface interface {
	GetByID(id string) (*entity.ExamAttempt, error)
	GetByUserID(userID string) ([]entity.ExamAttempt, error)
	GetByExamID(examID string) ([]entity.ExamAttempt, error)
	Create(attempt *entity.ExamAttempt) error
	Update(attempt *entity.ExamAttempt) error
	Delete(id string) error
}
