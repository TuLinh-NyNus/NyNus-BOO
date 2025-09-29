package interfaces

import (
	"context"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
)

// ExamRepository defines the interface for exam data access
// Based on ExamSystem.md design with comprehensive workflow support
type ExamRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, exam *entity.Exam) error
	Update(ctx context.Context, exam *entity.Exam) error
	Delete(ctx context.Context, examID string) error
	GetByID(ctx context.Context, examID string) (*entity.Exam, error)
	List(ctx context.Context, filters *ExamFilters, pagination *Pagination) ([]*entity.Exam, int, error)

	// Status management - Workflow operations
	Publish(ctx context.Context, examID string) error
	Archive(ctx context.Context, examID string) error
	UpdateStatus(ctx context.Context, examID string, status entity.ExamStatus) error

	// Question management - Exam composition
	AddQuestion(ctx context.Context, eq *entity.ExamQuestion) error
	RemoveQuestion(ctx context.Context, examID, questionID string) error
	ReorderQuestions(ctx context.Context, examID string, order map[string]int) error
	GetQuestions(ctx context.Context, examID string) ([]*entity.ExamQuestion, error)
	UpdateQuestionPoints(ctx context.Context, examID, questionID string, points int) error

	// Attempt management - Student exam taking
	CreateAttempt(ctx context.Context, attempt *entity.ExamAttempt) error
	GetAttempt(ctx context.Context, attemptID string) (*entity.ExamAttempt, error)
	ListUserAttempts(ctx context.Context, userID, examID string) ([]*entity.ExamAttempt, error)
	UpdateAttemptStatus(ctx context.Context, attemptID string, status entity.AttemptStatus) error
	SubmitAttempt(ctx context.Context, attemptID string, score, totalPoints int, percentage float64, passed bool) error

	// Answer management - Student responses
	SaveAnswer(ctx context.Context, answer *entity.ExamAnswer) error
	GetAnswers(ctx context.Context, attemptID string) ([]*entity.ExamAnswer, error)
	GetAnswer(ctx context.Context, attemptID, questionID string) (*entity.ExamAnswer, error)
	UpdateAnswer(ctx context.Context, answer *entity.ExamAnswer) error

	// Results management - Exam outcomes
	SaveResult(ctx context.Context, result *entity.ExamResult) error
	GetResult(ctx context.Context, attemptID string) (*entity.ExamResult, error)
	GetResultsByExam(ctx context.Context, examID string) ([]*entity.ExamResult, error)
	GetResultsByUser(ctx context.Context, userID string) ([]*entity.ExamResult, error)

	// Feedback management - Student feedback
	SaveFeedback(ctx context.Context, feedback *entity.ExamFeedback) error
	GetFeedback(ctx context.Context, examID, userID string) (*entity.ExamFeedback, error)
	ListFeedback(ctx context.Context, examID string) ([]*entity.ExamFeedback, error)

	// Statistics and analytics
	GetExamStatistics(ctx context.Context, examID string) (*ExamStatistics, error)
	GetUserPerformance(ctx context.Context, userID, examID string) (*UserPerformance, error)
	GetExamAnalytics(ctx context.Context, examID string) (*ExamAnalytics, error)

	// Batch operations
	CreateBatch(ctx context.Context, exams []*entity.Exam) error
	GetByIDs(ctx context.Context, examIDs []string) ([]*entity.Exam, error)

	// Search and filtering
	Search(ctx context.Context, searchCriteria *ExamSearchCriteria, filters *ExamFilters, pagination *Pagination) ([]*entity.Exam, int, error)
	FindByCreator(ctx context.Context, creatorID string, pagination *Pagination) ([]*entity.Exam, int, error)
	FindBySubject(ctx context.Context, subject string, pagination *Pagination) ([]*entity.Exam, int, error)
	FindByGrade(ctx context.Context, grade int, pagination *Pagination) ([]*entity.Exam, int, error)
	FindOfficialExams(ctx context.Context, filters *OfficialExamFilters, pagination *Pagination) ([]*entity.Exam, int, error)

	// Count operations
	Count(ctx context.Context, filters *ExamFilters) (int, error)
	CountByStatus(ctx context.Context, status entity.ExamStatus) (int, error)
	CountAttempts(ctx context.Context, examID string) (int, error)
}

// ExamFilters contains filter parameters for exam queries
type ExamFilters struct {
	// Basic filters
	Status    []entity.ExamStatus
	ExamType  []entity.ExamType
	CreatedBy []string

	// Academic filters
	Subjects   []string
	Grades     []int
	Difficulty []string
	Tags       []string

	// Official exam filters
	SourceInstitution []string
	ExamYear          []string
	ExamCode          []string

	// Date filters
	CreatedAfter    *string
	CreatedBefore   *string
	PublishedAfter  *string
	PublishedBefore *string

	// Numeric filters
	MinDuration *int
	MaxDuration *int
	MinPoints   *int
	MaxPoints   *int
}

// OfficialExamFilters contains specific filters for official exams
type OfficialExamFilters struct {
	SourceInstitution []string
	ExamYear          []string
	ExamCode          []string
	Subject           []string
	Grade             []int
}

// ExamSearchCriteria contains search parameters for exams
type ExamSearchCriteria struct {
	Query         string
	SearchIn      []string // title, description, instructions, tags
	ExactMatch    bool
	CaseSensitive bool
}

// Pagination contains pagination parameters
type Pagination struct {
	Offset     int
	Limit      int
	SortColumn string
	SortOrder  string // ASC, DESC
}

// ExamStatistics contains exam performance statistics
type ExamStatistics struct {
	ExamID            string
	TotalAttempts     int
	CompletedAttempts int
	AverageScore      float64
	PassRate          float64
	AverageTimeSpent  int // seconds
	QuestionStats     []*QuestionStatistics
}

// QuestionStatistics contains per-question statistics
type QuestionStatistics struct {
	QuestionID       string
	CorrectAnswers   int
	TotalAnswers     int
	CorrectRate      float64
	AverageTimeSpent int // seconds
}

// UserPerformance contains user performance data
type UserPerformance struct {
	UserID          string
	ExamID          string
	TotalAttempts   int
	BestScore       int
	BestPercentage  float64
	AverageScore    float64
	LastAttemptDate *string
	ImprovementRate float64
}

// ExamAnalytics contains comprehensive exam analytics
type ExamAnalytics struct {
	ExamID             string
	Statistics         *ExamStatistics
	DifficultyAnalysis *DifficultyAnalysis
	TimeAnalysis       *TimeAnalysis
	PerformanceTrends  []*PerformanceTrend
}

// DifficultyAnalysis contains difficulty-based analytics
type DifficultyAnalysis struct {
	EasyQuestions     int
	MediumQuestions   int
	HardQuestions     int
	ExpertQuestions   int
	OverallDifficulty string
}

// TimeAnalysis contains time-based analytics
type TimeAnalysis struct {
	AverageCompletionTime int
	FastestCompletion     int
	SlowestCompletion     int
	TimeDistribution      map[string]int // time ranges
}

// PerformanceTrend contains performance trend data
type PerformanceTrend struct {
	Date         string
	AttemptCount int
	AverageScore float64
	PassRate     float64
}
