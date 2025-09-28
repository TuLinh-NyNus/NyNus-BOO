package user

import (
	"context"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
)

// UserService defines the consolidated user service interface
// This merges functionality from domain_service/user and service_mgmt/user
type UserService interface {
	// CRUD Operations
	CreateUser(ctx context.Context, userData *entity.User) (*entity.User, error)
	GetUser(ctx context.Context, userID string) (*entity.User, error)
	UpdateUser(ctx context.Context, userID string, updates *entity.User) error
	DeleteUser(ctx context.Context, userID string) error
	
	// Query Operations
	ListUsers(ctx context.Context, offset, limit int) (total int, users []entity.User, err error)
	GetUsersByRole(ctx context.Context, role string) ([]entity.User, error)
	GetStudentsByPaging(ctx context.Context, offset, limit int) (total int, users []entity.User, err error)
	
	// Domain Logic
	ValidateUserData(user *entity.User) error
	CalculateUserStats(ctx context.Context, userID string) (*UserStats, error)
	GetUserPreferences(ctx context.Context, userID string) (*repository.UserPreference, error)
	UpdateUserPreferences(ctx context.Context, userID string, preferences *repository.UserPreference) error

	// Enrollment Operations
	EnrollUserInCourse(ctx context.Context, userID, courseID string) error
	GetUserEnrollments(ctx context.Context, userID string) ([]repository.Enrollment, error)
	UnenrollUserFromCourse(ctx context.Context, userID, courseID string) error
}

// UserStats represents user statistics
type UserStats struct {
	TotalExamsTaken    int     `json:"total_exams_taken"`
	AverageScore       float64 `json:"average_score"`
	TotalTimeSpent     int     `json:"total_time_spent_minutes"`
	CompletionRate     float64 `json:"completion_rate"`
	LastActivityDate   string  `json:"last_activity_date"`
	StreakDays         int     `json:"streak_days"`
	TotalQuestions     int     `json:"total_questions_answered"`
	CorrectAnswers     int     `json:"correct_answers"`
	IncorrectAnswers   int     `json:"incorrect_answers"`
}

// UserRepository defines the repository interface for user operations
type UserRepository interface {
	// Basic CRUD
	Create(ctx context.Context, db database.QueryExecer, user *entity.User) error
	GetByID(ctx context.Context, db database.QueryExecer, id string) (*entity.User, error)
	GetByEmail(ctx context.Context, db database.QueryExecer, email string) (*entity.User, error)
	Update(ctx context.Context, db database.QueryExecer, user *entity.User) error
	Delete(ctx context.Context, db database.QueryExecer, id string) error
	
	// Query operations
	GetAll(ctx context.Context, db database.QueryExecer) ([]entity.User, error)
	GetByRole(ctx context.Context, db database.QueryExecer, role string) ([]entity.User, error)
	GetUsersByPaging(ctx context.Context, db database.QueryExecer, offset, limit int) (total int, users []entity.User, err error)
	
	// Preferences
	GetUserPreferences(ctx context.Context, db database.QueryExecer, userID string) (*repository.UserPreference, error)
	UpdateUserPreferences(ctx context.Context, db database.QueryExecer, userID string, preferences *repository.UserPreference) error

	// Enrollments
	CreateEnrollment(ctx context.Context, db database.QueryExecer, enrollment *repository.Enrollment) error
	GetUserEnrollments(ctx context.Context, db database.QueryExecer, userID string) ([]repository.Enrollment, error)
	DeleteEnrollment(ctx context.Context, db database.QueryExecer, userID, courseID string) error
}
