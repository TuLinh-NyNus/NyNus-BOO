package opensearch

import (
	"fmt"
	"time"
)

// Config holds OpenSearch configuration
type Config struct {
	// Connection settings
	URL      string `env:"OPENSEARCH_URL" envDefault:"http://localhost:9200"`
	Username string `env:"OPENSEARCH_USERNAME" envDefault:""`
	Password string `env:"OPENSEARCH_PASSWORD" envDefault:""`
	Enabled  bool   `env:"OPENSEARCH_ENABLED" envDefault:"true"`

	// Timeout settings
	Timeout     time.Duration `env:"OPENSEARCH_TIMEOUT" envDefault:"30s"`
	DialTimeout time.Duration `env:"OPENSEARCH_DIAL_TIMEOUT" envDefault:"5s"`
	KeepAlive   time.Duration `env:"OPENSEARCH_KEEP_ALIVE" envDefault:"30s"`

	// Retry settings
	MaxRetries   int           `env:"OPENSEARCH_MAX_RETRIES" envDefault:"3"`
	RetryBackoff time.Duration `env:"OPENSEARCH_RETRY_BACKOFF" envDefault:"100ms"`

	// Connection pool settings
	MaxIdleConns    int `env:"OPENSEARCH_MAX_IDLE_CONNS" envDefault:"10"`
	MaxConnsPerHost int `env:"OPENSEARCH_MAX_CONNS_PER_HOST" envDefault:"10"`

	// Index settings
	IndexPrefix     string `env:"OPENSEARCH_INDEX_PREFIX" envDefault:"questions"`
	IndexShards     int    `env:"OPENSEARCH_INDEX_SHARDS" envDefault:"1"`
	IndexReplicas   int    `env:"OPENSEARCH_INDEX_REPLICAS" envDefault:"0"`
	RefreshInterval string `env:"OPENSEARCH_REFRESH_INTERVAL" envDefault:"1s"`

	// Search settings
	DefaultSize   int           `env:"OPENSEARCH_DEFAULT_SIZE" envDefault:"20"`
	MaxSize       int           `env:"OPENSEARCH_MAX_SIZE" envDefault:"10000"`
	ScrollTimeout time.Duration `env:"OPENSEARCH_SCROLL_TIMEOUT" envDefault:"5m"`

	// Vietnamese analysis settings
	VietnameseEnabled bool   `env:"VIETNAMESE_ANALYSIS_ENABLED" envDefault:"true"`
	SynonymsFile      string `env:"VIETNAMESE_SYNONYMS_FILE" envDefault:"synonyms/vietnamese-education.txt"`
	StopWordsFile     string `env:"VIETNAMESE_STOPWORDS_FILE" envDefault:"analysis/vietnamese-stopwords.txt"`
	EducationSynonyms bool   `env:"EDUCATION_SYNONYMS_ENABLED" envDefault:"true"`
	PhoneticMatching  bool   `env:"PHONETIC_MATCHING_ENABLED" envDefault:"true"`

	// Performance settings
	BulkSize          int           `env:"OPENSEARCH_BULK_SIZE" envDefault:"1000"`
	BulkFlushInterval time.Duration `env:"OPENSEARCH_BULK_FLUSH_INTERVAL" envDefault:"5s"`
	BulkWorkers       int           `env:"OPENSEARCH_BULK_WORKERS" envDefault:"2"`

	// Logging settings
	LogLevel     string `env:"OPENSEARCH_LOG_LEVEL" envDefault:"INFO"`
	LogRequests  bool   `env:"OPENSEARCH_LOG_REQUESTS" envDefault:"false"`
	LogResponses bool   `env:"OPENSEARCH_LOG_RESPONSES" envDefault:"false"`
}

// Validate validates the OpenSearch configuration
func (c *Config) Validate() error {
	if !c.Enabled {
		return nil
	}

	if c.URL == "" {
		return fmt.Errorf("OpenSearch URL is required")
	}

	if c.IndexPrefix == "" {
		return fmt.Errorf("OpenSearch index prefix is required")
	}

	if c.Timeout <= 0 {
		return fmt.Errorf("OpenSearch timeout must be positive")
	}

	if c.MaxRetries < 0 {
		return fmt.Errorf("OpenSearch max retries must be non-negative")
	}

	if c.DefaultSize <= 0 || c.DefaultSize > c.MaxSize {
		return fmt.Errorf("OpenSearch default size must be positive and <= max size")
	}

	if c.BulkSize <= 0 {
		return fmt.Errorf("OpenSearch bulk size must be positive")
	}

	return nil
}

// GetIndexName returns the full index name with prefix
func (c *Config) GetIndexName(suffix string) string {
	if suffix == "" {
		return c.IndexPrefix
	}
	return fmt.Sprintf("%s-%s", c.IndexPrefix, suffix)
}

// GetQuestionsIndexName returns the questions index name
func (c *Config) GetQuestionsIndexName() string {
	return c.GetIndexName("v1")
}

// GetQuestionsAliasName returns the questions alias name
func (c *Config) GetQuestionsAliasName() string {
	return c.IndexPrefix
}

// IsVietnameseAnalysisEnabled returns true if Vietnamese analysis is enabled
func (c *Config) IsVietnameseAnalysisEnabled() bool {
	return c.Enabled && c.VietnameseEnabled
}

// GetAnalyzerName returns the appropriate analyzer name based on configuration
func (c *Config) GetAnalyzerName(analyzerType string) string {
	if !c.IsVietnameseAnalysisEnabled() {
		return "standard"
	}

	switch analyzerType {
	case "content":
		return "vietnamese_content_analyzer"
	case "search":
		return "vietnamese_search_analyzer"
	case "exact":
		return "vietnamese_exact_analyzer"
	default:
		return "vietnamese_content_analyzer"
	}
}

// GetSearchFields returns the default search fields for Vietnamese search
func (c *Config) GetSearchFields() []string {
	if c.IsVietnameseAnalysisEnabled() {
		return []string{
			"content^3",       // Highest boost for content
			"content.exact^2", // Exact match with medium boost
			"solution^2",      // Solution with medium boost
			"tags^1.5",        // Tags with slight boost
			"source",          // Source with default boost
		}
	}

	// Fallback to simple fields if Vietnamese analysis is disabled
	return []string{"content", "solution", "tags", "source"}
}

// GetHighlightFields returns fields to highlight in search results
func (c *Config) GetHighlightFields() map[string]interface{} {
	return map[string]interface{}{
		"content": map[string]interface{}{
			"fragment_size":       150,
			"number_of_fragments": 3,
			"pre_tags":            []string{"<mark>"},
			"post_tags":           []string{"</mark>"},
		},
		"solution": map[string]interface{}{
			"fragment_size":       100,
			"number_of_fragments": 2,
			"pre_tags":            []string{"<mark>"},
			"post_tags":           []string{"</mark>"},
		},
		"tags": map[string]interface{}{
			"fragment_size":       50,
			"number_of_fragments": 5,
			"pre_tags":            []string{"<mark>"},
			"post_tags":           []string{"</mark>"},
		},
	}
}

// GetSuggestFields returns fields for auto-completion suggestions
func (c *Config) GetSuggestFields() []string {
	return []string{"suggest"}
}

// DefaultConfig returns a default OpenSearch configuration
func DefaultConfig() *Config {
	return &Config{
		URL:               "http://localhost:9200",
		Enabled:           true,
		Timeout:           30 * time.Second,
		DialTimeout:       5 * time.Second,
		KeepAlive:         30 * time.Second,
		MaxRetries:        3,
		RetryBackoff:      100 * time.Millisecond,
		MaxIdleConns:      10,
		MaxConnsPerHost:   10,
		IndexPrefix:       "questions",
		IndexShards:       1,
		IndexReplicas:     0,
		RefreshInterval:   "1s",
		DefaultSize:       20,
		MaxSize:           10000,
		ScrollTimeout:     5 * time.Minute,
		VietnameseEnabled: true,
		SynonymsFile:      "synonyms/vietnamese-education.txt",
		StopWordsFile:     "analysis/vietnamese-stopwords.txt",
		EducationSynonyms: true,
		PhoneticMatching:  true,
		BulkSize:          1000,
		BulkFlushInterval: 5 * time.Second,
		BulkWorkers:       2,
		LogLevel:          "INFO",
		LogRequests:       false,
		LogResponses:      false,
	}
}
