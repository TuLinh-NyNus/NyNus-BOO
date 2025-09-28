package exam

import (
	"context"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
)

// ExamService defines the consolidated exam service interface
// This merges functionality from service_mgmt/exam_mgmt, domain_service/exam, and domain_service/scoring
type ExamService interface {
	// CRUD Operations
	CreateExam(ctx context.Context, exam *entity.Exam) error
	GetExam(ctx context.Context, examID string) (*entity.Exam, error)
	UpdateExam(ctx context.Context, exam *entity.Exam) error
	DeleteExam(ctx context.Context, examID string) error
	
	// Query Operations
	ListExams(ctx context.Context, offset, limit int) (total int, exams []entity.Exam, err error)
	GetExamsByCreator(ctx context.Context, creatorID string, offset, limit int) ([]entity.Exam, int, error)
	GetExamsBySubject(ctx context.Context, subject string, offset, limit int) ([]entity.Exam, int, error)
	
	// Exam Execution Operations
	StartExam(ctx context.Context, examID, userID string) (*entity.ExamAttempt, error)
	SubmitAnswer(ctx context.Context, attemptID string, questionID string, answer *entity.Answer) error
	FinishExam(ctx context.Context, attemptID string) (*entity.ExamResult, error)
	GetExamAttempt(ctx context.Context, attemptID string) (*entity.ExamAttempt, error)
	
	// Scoring & Grading Operations
	AutoGradeExam(ctx context.Context, attemptID string) (*entity.ExamResult, error)
	ManualGradeAnswer(ctx context.Context, answerID string, score float64, feedback string) error
	CalculateExamScore(ctx context.Context, attemptID string) (*ScoreCalculation, error)
	GetExamResults(ctx context.Context, examID string, offset, limit int) ([]entity.ExamResult, int, error)
	
	// Question Management for Exams
	AddQuestionToExam(ctx context.Context, examID, questionID string, points float64) error
	RemoveQuestionFromExam(ctx context.Context, examID, questionID string) error
	UpdateQuestionPoints(ctx context.Context, examID, questionID string, points float64) error
	GetExamQuestions(ctx context.Context, examID string) ([]ExamQuestion, error)
	
	// Exam Analytics
	GetExamStatistics(ctx context.Context, examID string) (*ExamStatistics, error)
	GetUserExamHistory(ctx context.Context, userID string, offset, limit int) ([]entity.ExamAttempt, int, error)
	GetExamPerformanceReport(ctx context.Context, examID string) (*PerformanceReport, error)
	
	// Exam Configuration
	UpdateExamSettings(ctx context.Context, examID string, settings *ExamSettings) error
	GetExamSettings(ctx context.Context, examID string) (*ExamSettings, error)
	ValidateExamConfiguration(ctx context.Context, exam *entity.Exam) error
}

// ScoreCalculation represents exam score calculation details
type ScoreCalculation struct {
	TotalPoints      float64            `json:"total_points"`
	EarnedPoints     float64            `json:"earned_points"`
	Percentage       float64            `json:"percentage"`
	Grade            string             `json:"grade"`
	QuestionScores   []QuestionScore    `json:"question_scores"`
	TimeTaken        int                `json:"time_taken_minutes"`
	CompletionStatus string             `json:"completion_status"`
}

// QuestionScore represents individual question scoring
type QuestionScore struct {
	QuestionID    string  `json:"question_id"`
	MaxPoints     float64 `json:"max_points"`
	EarnedPoints  float64 `json:"earned_points"`
	IsCorrect     bool    `json:"is_correct"`
	TimeTaken     int     `json:"time_taken_seconds"`
	Feedback      string  `json:"feedback"`
}

// ExamQuestion represents a question in an exam with its configuration
type ExamQuestion struct {
	ExamID       string  `json:"exam_id"`
	QuestionID   string  `json:"question_id"`
	Question     entity.Question `json:"question"`
	Points       float64 `json:"points"`
	Order        int     `json:"order"`
	IsRequired   bool    `json:"is_required"`
	TimeLimit    int     `json:"time_limit_seconds"`
}

// ExamStatistics represents exam statistics
type ExamStatistics struct {
	ExamID              string  `json:"exam_id"`
	TotalAttempts       int     `json:"total_attempts"`
	CompletedAttempts   int     `json:"completed_attempts"`
	AverageScore        float64 `json:"average_score"`
	HighestScore        float64 `json:"highest_score"`
	LowestScore         float64 `json:"lowest_score"`
	AverageTimeSpent    int     `json:"average_time_spent_minutes"`
	PassRate            float64 `json:"pass_rate"`
	CompletionRate      float64 `json:"completion_rate"`
	AverageTime         float64 `json:"average_time"`
	QuestionStats       []QuestionStatistic `json:"question_stats"`
}

// QuestionStatistic represents statistics for a specific question in an exam
type QuestionStatistic struct {
	QuestionID       string  `json:"question_id"`
	TotalAnswers     int     `json:"total_answers"`
	CorrectAnswers   int     `json:"correct_answers"`
	IncorrectAnswers int     `json:"incorrect_answers"`
	SkippedAnswers   int     `json:"skipped_answers"`
	AverageScore     float64 `json:"average_score"`
	Difficulty       float64 `json:"calculated_difficulty"`
}

// PerformanceReport represents detailed exam performance report
type PerformanceReport struct {
	ExamID              string                    `json:"exam_id"`
	GeneratedAt         string                    `json:"generated_at"`
	TotalParticipants   int                       `json:"total_participants"`
	AverageScore        float64                   `json:"average_score"`
	MedianScore         float64                   `json:"median_score"`
	StandardDeviation   float64                   `json:"standard_deviation"`
	ScoreDistribution   []ScoreRange              `json:"score_distribution"`
	Summary             ExamStatistics            `json:"summary"`
	TopPerformers       []UserPerformance         `json:"top_performers"`
	QuestionAnalysis    []QuestionAnalysis        `json:"question_analysis"`
	TimeAnalysis        TimeAnalysis              `json:"time_analysis"`
	Recommendations     []string                  `json:"recommendations"`
}

// ScoreRange represents a score range for distribution analysis
type ScoreRange struct {
	MinScore float64 `json:"min_score"`
	MaxScore float64 `json:"max_score"`
	Count    int     `json:"count"`
	Label    string  `json:"label"`
}

// UserPerformance represents individual user performance
type UserPerformance struct {
	UserID       string  `json:"user_id"`
	UserName     string  `json:"user_name"`
	Score        float64 `json:"score"`
	Percentage   float64 `json:"percentage"`
	TimeTaken    int     `json:"time_taken_minutes"`
	CompletedAt  string  `json:"completed_at"`
	Rank         int     `json:"rank"`
}

// QuestionAnalysis represents detailed question analysis
type QuestionAnalysis struct {
	QuestionID          string            `json:"question_id"`
	QuestionText        string            `json:"question_text"`
	Statistics          QuestionStatistic `json:"statistics"`
	CommonMistakes      []string          `json:"common_mistakes"`
	RecommendedActions  []string          `json:"recommended_actions"`
}

// TimeAnalysis represents time-based analysis
type TimeAnalysis struct {
	AverageTimePerQuestion int                    `json:"average_time_per_question_seconds"`
	QuestionTimeBreakdown  []QuestionTimeAnalysis `json:"question_time_breakdown"`
	TimeDistribution       map[string]int         `json:"time_distribution"`
}

// QuestionTimeAnalysis represents time analysis for individual questions
type QuestionTimeAnalysis struct {
	QuestionID   string `json:"question_id"`
	AverageTime  int    `json:"average_time_seconds"`
	MinTime      int    `json:"min_time_seconds"`
	MaxTime      int    `json:"max_time_seconds"`
	TimeoutCount int    `json:"timeout_count"`
}

// ExamSettings represents exam configuration settings
type ExamSettings struct {
	ExamID              string  `json:"exam_id"`
	TimeLimit           int     `json:"time_limit_minutes"`
	PassingScore        float64 `json:"passing_score_percentage"`
	MaxAttempts         int     `json:"max_attempts"`
	ShuffleQuestions    bool    `json:"shuffle_questions"`
	ShuffleAnswers      bool    `json:"shuffle_answers"`
	ShowResults         bool    `json:"show_results_immediately"`
	AllowReview         bool    `json:"allow_review"`
	RequireProctoring   bool    `json:"require_proctoring"`
	RequirePassword     bool    `json:"require_password"`
	Password            string  `json:"password"`
	AntiCheatEnabled    bool    `json:"anti_cheat_enabled"`
	QuestionTimeLimit   int     `json:"question_time_limit_seconds"`
	LatePenalty         float64 `json:"late_penalty_percentage"`
}

// ExamRepository defines the repository interface for exam operations
type ExamRepository interface {
	// Basic CRUD
	Create(ctx context.Context, db database.QueryExecer, exam *entity.Exam) error
	GetByID(ctx context.Context, db database.QueryExecer, id string) (*entity.Exam, error)
	Update(ctx context.Context, db database.QueryExecer, exam *entity.Exam) error
	Delete(ctx context.Context, db database.QueryExecer, id string) error
	
	// Query operations
	GetAll(ctx context.Context, db database.QueryExecer, offset, limit int) ([]entity.Exam, error)
	GetByCreator(ctx context.Context, db database.QueryExecer, creatorID string, offset, limit int) ([]entity.Exam, int, error)
	GetBySubject(ctx context.Context, db database.QueryExecer, subject string, offset, limit int) ([]entity.Exam, int, error)
	Count(ctx context.Context, db database.QueryExecer) (int, error)
	
	// Exam attempts
	CreateAttempt(ctx context.Context, db database.QueryExecer, attempt *entity.ExamAttempt) error
	GetAttempt(ctx context.Context, db database.QueryExecer, attemptID string) (*entity.ExamAttempt, error)
	UpdateAttempt(ctx context.Context, db database.QueryExecer, attempt *entity.ExamAttempt) error
	GetUserAttempts(ctx context.Context, db database.QueryExecer, userID string, offset, limit int) ([]entity.ExamAttempt, int, error)
	
	// Exam results
	CreateResult(ctx context.Context, db database.QueryExecer, result *entity.ExamResult) error
	GetResult(ctx context.Context, db database.QueryExecer, resultID string) (*entity.ExamResult, error)
	GetExamResults(ctx context.Context, db database.QueryExecer, examID string, offset, limit int) ([]entity.ExamResult, int, error)
	
	// Question management
	AddQuestionToExam(ctx context.Context, db database.QueryExecer, examID, questionID string, points float64, order int) error
	RemoveQuestionFromExam(ctx context.Context, db database.QueryExecer, examID, questionID string) error
	GetExamQuestions(ctx context.Context, db database.QueryExecer, examID string) ([]ExamQuestion, error)
	
	// Statistics
	GetExamStatistics(ctx context.Context, db database.QueryExecer, examID string) (*ExamStatistics, error)
}
