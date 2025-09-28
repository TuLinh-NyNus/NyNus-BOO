package question

import (
	"context"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
)

// QuestionService defines the consolidated question service interface
// This merges functionality from service_mgmt/question_mgmt and service_mgmt/question_filter
type QuestionService interface {
	// CRUD Operations
	CreateQuestion(ctx context.Context, question *entity.Question) error
	GetQuestion(ctx context.Context, questionID string) (*entity.Question, error)
	UpdateQuestion(ctx context.Context, question *entity.Question) error
	DeleteQuestion(ctx context.Context, questionID string) error
	
	// Query Operations
	ListQuestions(ctx context.Context, offset, limit int) (total int, questions []entity.Question, err error)
	GetQuestionsByPaging(ctx context.Context, offset, limit int) (total int, questions []entity.Question, err error)
	
	// Filtering & Search Operations
	FilterByDifficulty(ctx context.Context, difficulty string, offset, limit int) ([]entity.Question, int, error)
	FilterByCategory(ctx context.Context, category string, offset, limit int) ([]entity.Question, int, error)
	FilterBySubject(ctx context.Context, subject string, offset, limit int) ([]entity.Question, int, error)
	SearchQuestions(ctx context.Context, searchOpts *SearchOptions, offset, limit int) ([]SearchResult, int, error)
	
	// Bulk Operations
	BulkImportQuestions(ctx context.Context, questions []entity.Question) (*ImportResult, error)
	ExportQuestions(ctx context.Context, filter *QuestionFilter) ([]entity.Question, error)
	BulkUpdateQuestions(ctx context.Context, updates []QuestionUpdate) error
	BulkDeleteQuestions(ctx context.Context, questionIDs []string) error
	
	// Statistics Operations
	GetQuestionStatistics(ctx context.Context, filter *QuestionFilter) (*QuestionStatistics, error)
	GetUsageStatistics(ctx context.Context, questionID string) (*UsageStatistics, error)
	UpdateQuestionUsage(ctx context.Context, questionID string) error
	
	// Image Operations
	UploadQuestionImage(ctx context.Context, questionID string, imageData []byte) (*ImageUploadResult, error)
	DeleteQuestionImage(ctx context.Context, questionID, imageID string) error
	GetQuestionImages(ctx context.Context, questionID string) ([]entity.QuestionImage, error)
}

// SearchOptions defines search parameters
type SearchOptions struct {
	Query            string `json:"query"`
	SearchInContent  bool   `json:"search_in_content"`
	SearchInSolution bool   `json:"search_in_solution"`
	SearchInTags     bool   `json:"search_in_tags"`
	UseRegex         bool   `json:"use_regex"`
	CaseSensitive    bool   `json:"case_sensitive"`
}

// SearchResult represents a search result
type SearchResult struct {
	Question    entity.Question `json:"question"`
	Score       float64         `json:"score"`
	Highlights  []string        `json:"highlights"`
	MatchFields []string        `json:"match_fields"`
}

// QuestionFilter defines filtering parameters
type QuestionFilter struct {
	Difficulty   []string `json:"difficulty"`
	Category     []string `json:"category"`
	Subject      []string `json:"subject"`
	Type         []string `json:"type"`
	Status       []string `json:"status"`
	Creator      []string `json:"creator"`
	DateFrom     string   `json:"date_from"`
	DateTo       string   `json:"date_to"`
	UsageMin     int      `json:"usage_min"`
	UsageMax     int      `json:"usage_max"`
	FeedbackMin  float64  `json:"feedback_min"`
	FeedbackMax  float64  `json:"feedback_max"`
}

// ImportResult represents bulk import results
type ImportResult struct {
	TotalProcessed int           `json:"total_processed"`
	CreatedCount   int           `json:"created_count"`
	UpdatedCount   int           `json:"updated_count"`
	ErrorCount     int           `json:"error_count"`
	Errors         []ImportError `json:"errors"`
	Summary        string        `json:"summary"`
}

// ImportError represents an import error
type ImportError struct {
	Row     int    `json:"row"`
	Field   string `json:"field"`
	Message string `json:"message"`
	Value   string `json:"value"`
}

// QuestionUpdate represents a question update
type QuestionUpdate struct {
	ID      string                 `json:"id"`
	Updates map[string]interface{} `json:"updates"`
}

// QuestionStatistics represents question statistics
type QuestionStatistics struct {
	TotalQuestions         int                `json:"total_questions"`
	TypeDistribution       map[string]int     `json:"type_distribution"`
	DifficultyDistribution map[string]int     `json:"difficulty_distribution"`
	StatusDistribution     map[string]int     `json:"status_distribution"`
	CategoryDistribution   map[string]int     `json:"category_distribution"`
	SubjectDistribution    map[string]int     `json:"subject_distribution"`
	AverageUsageCount      float64            `json:"average_usage_count"`
	AverageFeedback        float64            `json:"average_feedback"`
}

// UsageStatistics represents question usage statistics
type UsageStatistics struct {
	QuestionID      string  `json:"question_id"`
	TotalUsage      int     `json:"total_usage"`
	CorrectAnswers  int     `json:"correct_answers"`
	IncorrectAnswers int    `json:"incorrect_answers"`
	AverageTime     float64 `json:"average_time_seconds"`
	Difficulty      float64 `json:"calculated_difficulty"`
	LastUsed        string  `json:"last_used"`
}

// ImageUploadResult represents image upload result
type ImageUploadResult struct {
	ImageID  string `json:"image_id"`
	URL      string `json:"url"`
	Filename string `json:"filename"`
	Size     int64  `json:"size"`
}

// Legacy types for backward compatibility
type FilterStatistics struct {
	TotalQuestions         int
	TypeDistribution       map[string]int
	DifficultyDistribution map[string]int
	StatusDistribution     map[string]int
	GradeDistribution      map[string]int
	SubjectDistribution    map[string]int
	AverageUsageCount      float32
	AverageFeedback        float32
}

type ImportQuestionsRequest struct {
	CsvDataBase64 string
	UpsertMode    bool
}

type ImportQuestionsResult struct {
	TotalProcessed int32
	CreatedCount   int32
	UpdatedCount   int32
	ErrorCount     int32
	Errors         []ImportError
	Summary        string
}

// QuestionRepository defines the repository interface for question operations
type QuestionRepository interface {
	// Basic CRUD
	Create(ctx context.Context, db database.QueryExecer, question *entity.Question) error
	GetByID(ctx context.Context, db database.QueryExecer, id string) (*entity.Question, error)
	Update(ctx context.Context, db database.QueryExecer, question *entity.Question) error
	Delete(ctx context.Context, db database.QueryExecer, id string) error
	
	// Query operations
	GetAll(ctx context.Context, db database.QueryExecer, offset, limit int) ([]entity.Question, error)
	Count(ctx context.Context, db database.QueryExecer) (int, error)
	
	// Filtering operations
	FilterByDifficulty(ctx context.Context, db database.QueryExecer, difficulty string, offset, limit int) ([]entity.Question, int, error)
	FilterByCategory(ctx context.Context, db database.QueryExecer, category string, offset, limit int) ([]entity.Question, int, error)
	FilterBySubject(ctx context.Context, db database.QueryExecer, subject string, offset, limit int) ([]entity.Question, int, error)
	
	// Search operations
	Search(ctx context.Context, db database.QueryExecer, criteria SearchOptions, offset, limit int) ([]SearchResult, int, error)
	
	// Bulk operations
	BulkCreate(ctx context.Context, db database.QueryExecer, questions []entity.Question) error
	BulkUpdate(ctx context.Context, db database.QueryExecer, updates []QuestionUpdate) error
	BulkDelete(ctx context.Context, db database.QueryExecer, ids []string) error
	
	// Statistics
	GetStatistics(ctx context.Context, db database.QueryExecer, filter *QuestionFilter) (*QuestionStatistics, error)
	GetUsageStatistics(ctx context.Context, db database.QueryExecer, questionID string) (*UsageStatistics, error)
	UpdateUsageCount(ctx context.Context, db database.QueryExecer, questionID string) error
}
