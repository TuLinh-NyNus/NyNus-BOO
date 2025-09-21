package interfaces

import (
	"context"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
)

// QuestionRepository defines the interface for question data access
type QuestionRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, question *entity.Question) error
	GetByID(ctx context.Context, id string) (*entity.Question, error)
	Update(ctx context.Context, question *entity.Question) error
	Delete(ctx context.Context, id string) error

	// Batch operations
	CreateBatch(ctx context.Context, questions []*entity.Question) error
	GetByIDs(ctx context.Context, ids []string) ([]*entity.Question, error)

	// Listing and pagination
	GetAll(ctx context.Context, offset, limit int) ([]*entity.Question, error)
	Count(ctx context.Context) (int, error)

	// Filtering
	FindWithFilters(ctx context.Context, criteria *FilterCriteria, offset, limit int, sortColumn, sortOrder string) ([]*entity.Question, int, error)

	// Search
	Search(ctx context.Context, searchCriteria SearchCriteria, filterCriteria *FilterCriteria, offset, limit int) ([]*SearchResult, int, error)

	// By QuestionCode
	FindByQuestionCodeID(ctx context.Context, questionCodeID string) ([]*entity.Question, error)
	CountByQuestionCodeID(ctx context.Context, questionCodeID string) (int, error)

	// Statistics
	GetStatistics(ctx context.Context, criteria *FilterCriteria) (*Statistics, error)

	// Status management
	UpdateStatus(ctx context.Context, id string, status string) error
	UpdateUsageCount(ctx context.Context, id string) error
	UpdateFeedback(ctx context.Context, id string, feedbackDelta int) error
}

// FilterCriteria contains all filter parameters
type FilterCriteria struct {
	// Classification filters
	Grades   []string
	Subjects []string
	Chapters []string
	Levels   []string
	Lessons  []string
	Forms    []string

	// Question properties
	Types        []string
	Difficulties []string
	Statuses     []string
	Creators     []string

	// Tags
	Tags        []string
	TagMatchAll bool // If true, match all tags; if false, match any

	// Numeric ranges
	MinUsageCount int32
	MaxUsageCount int32
	MinFeedback   int32
	MaxFeedback   int32

	// Date ranges
	CreatedAfter  string // RFC3339 format
	CreatedBefore string
	UpdatedAfter  string
	UpdatedBefore string

	// Boolean filters
	HasSolution *bool
	HasSource   *bool

	// Question code IDs
	QuestionCodeIDs []string
}

// SearchCriteria contains search parameters
type SearchCriteria struct {
	Query            string
	SearchInContent  bool
	SearchInSolution bool
	SearchInTags     bool
	UseRegex         bool
	CaseSensitive    bool
}

// SearchResult contains search results with relevance
type SearchResult struct {
	Question entity.Question
	Score    float32
	Matches  []string // Matched snippets
	Snippet  string   // Context snippet
}

// Statistics contains aggregated statistics
type Statistics struct {
	TotalQuestions         int
	TypeDistribution       map[string]int
	DifficultyDistribution map[string]int
	StatusDistribution     map[string]int
	GradeDistribution      map[string]int
	SubjectDistribution    map[string]int
	AverageUsageCount      float32
	AverageFeedback        float32
}

// QuestionCodeRepository defines the interface for question code data access
type QuestionCodeRepository interface {
	// Basic operations
	Create(ctx context.Context, code *entity.QuestionCode) error
	GetByID(ctx context.Context, id string) (*entity.QuestionCode, error)
	GetByCode(ctx context.Context, code string) (*entity.QuestionCode, error)
	Update(ctx context.Context, code *entity.QuestionCode) error
	Delete(ctx context.Context, id string) error

	// Batch operations
	CreateBatch(ctx context.Context, codes []*entity.QuestionCode) error
	GetByIDs(ctx context.Context, ids []string) ([]*entity.QuestionCode, error)

	// Listing
	GetAll(ctx context.Context, offset, limit int) ([]*entity.QuestionCode, error)
	Count(ctx context.Context) (int, error)

	// Filtering
	FindByGrade(ctx context.Context, grade string) ([]*entity.QuestionCode, error)
	FindBySubject(ctx context.Context, subject string) ([]*entity.QuestionCode, error)
	FindByGradeAndSubject(ctx context.Context, grade, subject string) ([]*entity.QuestionCode, error)

	// Validation
	Exists(ctx context.Context, code string) (bool, error)
}
