package entity

import (
	"time"
)

// QuestionStatistics represents comprehensive question statistics
type QuestionStatistics struct {
	// Overall statistics
	TotalQuestions    int64                  `json:"total_questions"`
	ActiveQuestions   int64                  `json:"active_questions"`
	PendingQuestions  int64                  `json:"pending_questions"`
	DraftQuestions    int64                  `json:"draft_questions"`
	
	// Distribution by question code parameters
	GradeDistribution   map[string]int64     `json:"grade_distribution"`
	SubjectDistribution map[string]int64     `json:"subject_distribution"`
	ChapterDistribution map[string]int64     `json:"chapter_distribution"`
	LevelDistribution   map[string]int64     `json:"level_distribution"`
	LessonDistribution  map[string]int64     `json:"lesson_distribution"`
	FormDistribution    map[string]int64     `json:"form_distribution"`
	
	// Distribution by question properties
	TypeDistribution       map[string]int64  `json:"type_distribution"`
	DifficultyDistribution map[string]int64  `json:"difficulty_distribution"`
	StatusDistribution     map[string]int64  `json:"status_distribution"`
	
	// Usage statistics
	TotalUsage         int64   `json:"total_usage"`
	AverageUsageCount  float64 `json:"average_usage_count"`
	MostUsedQuestions  []QuestionUsageInfo `json:"most_used_questions"`
	
	// Quality metrics
	AverageFeedback    float64 `json:"average_feedback"`
	QuestionsWithFeedback int64 `json:"questions_with_feedback"`
	HighRatedQuestions []QuestionUsageInfo `json:"high_rated_questions"`
	
	// Time-based statistics
	QuestionsCreatedToday    int64 `json:"questions_created_today"`
	QuestionsCreatedThisWeek int64 `json:"questions_created_this_week"`
	QuestionsCreatedThisMonth int64 `json:"questions_created_this_month"`
	
	// Creator statistics
	TopCreators        []CreatorInfo `json:"top_creators"`
	CreatorDistribution map[string]int64 `json:"creator_distribution"`
	
	// Error and quality statistics
	QuestionsWithErrors   int64 `json:"questions_with_errors"`
	QuestionsWithWarnings int64 `json:"questions_with_warnings"`
	ParseErrorRate        float64 `json:"parse_error_rate"`
	
	// Image statistics
	QuestionsWithImages   int64 `json:"questions_with_images"`
	TotalImages          int64 `json:"total_images"`
	ImageUploadSuccessRate float64 `json:"image_upload_success_rate"`
	
	// Last updated
	LastUpdated time.Time `json:"last_updated"`
}

// QuestionUsageInfo represents usage information for a question
type QuestionUsageInfo struct {
	QuestionID    string  `json:"question_id"`
	Content       string  `json:"content"`
	QuestionCode  string  `json:"question_code"`
	UsageCount    int64   `json:"usage_count"`
	Feedback      float64 `json:"feedback"`
	Type          string  `json:"type"`
	Difficulty    string  `json:"difficulty"`
	CreatedAt     time.Time `json:"created_at"`
}

// CreatorInfo represents creator statistics
type CreatorInfo struct {
	Creator        string    `json:"creator"`
	QuestionCount  int64     `json:"question_count"`
	AverageFeedback float64  `json:"average_feedback"`
	LastActivity   time.Time `json:"last_activity"`
}

// QuestionCodeStatistics represents statistics grouped by question code parameters
type QuestionCodeStatistics struct {
	Grade   string `json:"grade"`
	Subject string `json:"subject"`
	Chapter string `json:"chapter"`
	Level   string `json:"level"`
	Lesson  string `json:"lesson"`
	Form    string `json:"form"`
	
	QuestionCount   int64   `json:"question_count"`
	ActiveCount     int64   `json:"active_count"`
	PendingCount    int64   `json:"pending_count"`
	TotalUsage      int64   `json:"total_usage"`
	AverageUsage    float64 `json:"average_usage"`
	AverageFeedback float64 `json:"average_feedback"`
	
	TypeBreakdown       map[string]int64 `json:"type_breakdown"`
	DifficultyBreakdown map[string]int64 `json:"difficulty_breakdown"`
	
	LastUpdated time.Time `json:"last_updated"`
}

// TrendData represents trend information over time
type TrendData struct {
	Date  time.Time `json:"date"`
	Value int64     `json:"value"`
	Label string    `json:"label"`
}

// QuestionTrends represents trending data for questions
type QuestionTrends struct {
	// Daily trends (last 30 days)
	DailyCreation []TrendData `json:"daily_creation"`
	DailyUsage    []TrendData `json:"daily_usage"`
	
	// Weekly trends (last 12 weeks)
	WeeklyCreation []TrendData `json:"weekly_creation"`
	WeeklyUsage    []TrendData `json:"weekly_usage"`
	
	// Monthly trends (last 12 months)
	MonthlyCreation []TrendData `json:"monthly_creation"`
	MonthlyUsage    []TrendData `json:"monthly_usage"`
	
	// Growth rates
	DailyGrowthRate   float64 `json:"daily_growth_rate"`
	WeeklyGrowthRate  float64 `json:"weekly_growth_rate"`
	MonthlyGrowthRate float64 `json:"monthly_growth_rate"`
	
	LastUpdated time.Time `json:"last_updated"`
}

// PopularityMetrics represents popularity metrics for questions
type PopularityMetrics struct {
	// Most popular by usage
	MostUsedQuestions []QuestionUsageInfo `json:"most_used_questions"`
	
	// Most popular by feedback
	HighestRatedQuestions []QuestionUsageInfo `json:"highest_rated_questions"`
	
	// Most popular by grade/subject
	PopularByGrade   map[string][]QuestionUsageInfo `json:"popular_by_grade"`
	PopularBySubject map[string][]QuestionUsageInfo `json:"popular_by_subject"`
	
	// Trending questions (high recent usage)
	TrendingQuestions []QuestionUsageInfo `json:"trending_questions"`
	
	LastUpdated time.Time `json:"last_updated"`
}

// QualityMetrics represents quality metrics for questions
type QualityMetrics struct {
	// Overall quality scores
	AverageQualityScore float64 `json:"average_quality_score"`
	HighQualityCount    int64   `json:"high_quality_count"`
	LowQualityCount     int64   `json:"low_quality_count"`
	
	// Quality by parameters
	QualityByGrade   map[string]float64 `json:"quality_by_grade"`
	QualityBySubject map[string]float64 `json:"quality_by_subject"`
	QualityByType    map[string]float64 `json:"quality_by_type"`
	
	// Error metrics
	ParseErrorCount    int64   `json:"parse_error_count"`
	ValidationErrorCount int64 `json:"validation_error_count"`
	ErrorRate          float64 `json:"error_rate"`
	
	// Improvement suggestions
	QuestionsNeedingReview []QuestionUsageInfo `json:"questions_needing_review"`
	
	LastUpdated time.Time `json:"last_updated"`
}

// DashboardSummary represents a summary for dashboard display
type DashboardSummary struct {
	// Key metrics
	TotalQuestions    int64   `json:"total_questions"`
	ActiveQuestions   int64   `json:"active_questions"`
	TodayCreated      int64   `json:"today_created"`
	WeeklyGrowth      float64 `json:"weekly_growth"`
	
	// Quality indicators
	AverageQuality    float64 `json:"average_quality"`
	ErrorRate         float64 `json:"error_rate"`
	CompletionRate    float64 `json:"completion_rate"`
	
	// Usage indicators
	TotalUsage        int64   `json:"total_usage"`
	AverageUsage      float64 `json:"average_usage"`
	PopularityScore   float64 `json:"popularity_score"`
	
	// Distribution highlights
	TopGrade          string  `json:"top_grade"`
	TopSubject        string  `json:"top_subject"`
	TopType           string  `json:"top_type"`
	TopDifficulty     string  `json:"top_difficulty"`
	
	// Recent activity
	RecentQuestions   []QuestionUsageInfo `json:"recent_questions"`
	RecentActivity    []ActivityInfo      `json:"recent_activity"`
	
	LastUpdated time.Time `json:"last_updated"`
}

// ActivityInfo represents recent activity information
type ActivityInfo struct {
	Type        string    `json:"type"` // "created", "updated", "used", "rated"
	Description string    `json:"description"`
	QuestionID  string    `json:"question_id"`
	Creator     string    `json:"creator"`
	Timestamp   time.Time `json:"timestamp"`
}

// StatisticsFilter represents filters for statistics queries
type StatisticsFilter struct {
	// Time range
	StartDate *time.Time `json:"start_date,omitempty"`
	EndDate   *time.Time `json:"end_date,omitempty"`
	
	// Question code filters
	Grade   []string `json:"grade,omitempty"`
	Subject []string `json:"subject,omitempty"`
	Chapter []string `json:"chapter,omitempty"`
	Level   []string `json:"level,omitempty"`
	Lesson  []string `json:"lesson,omitempty"`
	Form    []string `json:"form,omitempty"`
	
	// Question property filters
	Type       []string `json:"type,omitempty"`
	Difficulty []string `json:"difficulty,omitempty"`
	Status     []string `json:"status,omitempty"`
	
	// Creator filters
	Creator []string `json:"creator,omitempty"`
	
	// Quality filters
	MinFeedback *float64 `json:"min_feedback,omitempty"`
	MaxFeedback *float64 `json:"max_feedback,omitempty"`
	MinUsage    *int64   `json:"min_usage,omitempty"`
	MaxUsage    *int64   `json:"max_usage,omitempty"`
	
	// Special filters
	HasErrors   *bool `json:"has_errors,omitempty"`
	HasWarnings *bool `json:"has_warnings,omitempty"`
	HasImages   *bool `json:"has_images,omitempty"`
}

// DefaultStatisticsFilter returns a default statistics filter
func DefaultStatisticsFilter() *StatisticsFilter {
	return &StatisticsFilter{
		// Default to last 30 days
		StartDate: func() *time.Time { t := time.Now().AddDate(0, 0, -30); return &t }(),
		EndDate:   func() *time.Time { t := time.Now(); return &t }(),
	}
}

// StatisticsCache represents cached statistics data
type StatisticsCache struct {
	Key         string                 `json:"key"`
	Data        map[string]interface{} `json:"data"`
	ExpiresAt   time.Time             `json:"expires_at"`
	CreatedAt   time.Time             `json:"created_at"`
	LastAccessed time.Time            `json:"last_accessed"`
}

// IsExpired checks if the cache is expired
func (c *StatisticsCache) IsExpired() bool {
	return time.Now().After(c.ExpiresAt)
}

// UpdateLastAccessed updates the last accessed time
func (c *StatisticsCache) UpdateLastAccessed() {
	c.LastAccessed = time.Now()
}
