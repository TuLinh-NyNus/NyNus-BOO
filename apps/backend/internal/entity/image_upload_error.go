package entity

import (
	"time"

	"github.com/jackc/pgtype"
)

// ImageUploadErrorType represents different types of image upload errors
type ImageUploadErrorType string

const (
	ImageUploadErrorTypeNetwork    ImageUploadErrorType = "NETWORK"
	ImageUploadErrorTypeQuota      ImageUploadErrorType = "QUOTA"
	ImageUploadErrorTypePermission ImageUploadErrorType = "PERMISSION"
	ImageUploadErrorTypeFileSystem ImageUploadErrorType = "FILESYSTEM"
	ImageUploadErrorTypeConversion ImageUploadErrorType = "CONVERSION"
	ImageUploadErrorTypeValidation ImageUploadErrorType = "VALIDATION"
	ImageUploadErrorTypeTimeout    ImageUploadErrorType = "TIMEOUT"
	ImageUploadErrorTypeUnknown    ImageUploadErrorType = "UNKNOWN"
)

// ImageUploadErrorSeverity represents the severity level of upload errors
type ImageUploadErrorSeverity string

const (
	ImageUploadErrorSeverityError   ImageUploadErrorSeverity = "ERROR"
	ImageUploadErrorSeverityWarning ImageUploadErrorSeverity = "WARNING"
	ImageUploadErrorSeverityInfo    ImageUploadErrorSeverity = "INFO"
)

// ImageUploadError represents a detailed image upload error
type ImageUploadError struct {
	ID           pgtype.Text              `json:"id" db:"id"`
	ImageID      pgtype.Text              `json:"image_id" db:"image_id"`
	Type         ImageUploadErrorType     `json:"type" db:"type"`
	Severity     ImageUploadErrorSeverity `json:"severity" db:"severity"`
	Message      pgtype.Text              `json:"message" db:"message"`
	Suggestion   pgtype.Text              `json:"suggestion" db:"suggestion"`
	Context      pgtype.Text              `json:"context" db:"context"`
	LocalPath    pgtype.Text              `json:"local_path" db:"local_path"`
	RemotePath   pgtype.Text              `json:"remote_path" db:"remote_path"`
	FileSize     pgtype.Int8              `json:"file_size" db:"file_size"`
	AttemptCount pgtype.Int4              `json:"attempt_count" db:"attempt_count"`
	LastAttempt  pgtype.Timestamptz       `json:"last_attempt" db:"last_attempt"`
	NextRetryAt  pgtype.Timestamptz       `json:"next_retry_at" db:"next_retry_at"`
	IsRetryable  pgtype.Bool              `json:"is_retryable" db:"is_retryable"`
	CreatedAt    pgtype.Timestamptz       `json:"created_at" db:"created_at"`
	UpdatedAt    pgtype.Timestamptz       `json:"updated_at" db:"updated_at"`
}

// ImageUploadResult represents the result of an image upload operation
type ImageUploadResult struct {
	Success     bool               `json:"success"`
	Image       *QuestionImage     `json:"image,omitempty"`
	Errors      []ImageUploadError `json:"errors"`
	Warnings    []ImageUploadError `json:"warnings"`
	LocalPath   string             `json:"local_path"`
	RemotePath  string             `json:"remote_path"`
	FileSize    int64              `json:"file_size"`
	UploadTime  time.Duration      `json:"upload_time"`
	RetryCount  int                `json:"retry_count"`
	CanRetry    bool               `json:"can_retry"`
	NextRetryAt *time.Time         `json:"next_retry_at,omitempty"`
	Suggestions []string           `json:"suggestions"`
}

// ImageUploadRetryPolicy defines retry behavior for image uploads
type ImageUploadRetryPolicy struct {
	MaxRetries     int                    `json:"max_retries"`
	InitialBackoff time.Duration          `json:"initial_backoff"`
	MaxBackoff     time.Duration          `json:"max_backoff"`
	BackoffFactor  float64                `json:"backoff_factor"`
	RetryableTypes []ImageUploadErrorType `json:"retryable_types"`
}

// DefaultImageUploadRetryPolicy returns the default retry policy
func DefaultImageUploadRetryPolicy() *ImageUploadRetryPolicy {
	return &ImageUploadRetryPolicy{
		MaxRetries:     5,
		InitialBackoff: 2 * time.Second,
		MaxBackoff:     5 * time.Minute,
		BackoffFactor:  2.0,
		RetryableTypes: []ImageUploadErrorType{
			ImageUploadErrorTypeNetwork,
			ImageUploadErrorTypeQuota,
			ImageUploadErrorTypeTimeout,
			ImageUploadErrorTypeUnknown,
		},
	}
}

// IsRetryable checks if an error type is retryable
func (p *ImageUploadRetryPolicy) IsRetryable(errorType ImageUploadErrorType) bool {
	for _, retryableType := range p.RetryableTypes {
		if retryableType == errorType {
			return true
		}
	}
	return false
}

// CalculateNextRetryDelay calculates the next retry delay
func (p *ImageUploadRetryPolicy) CalculateNextRetryDelay(attemptCount int) time.Duration {
	if attemptCount <= 0 {
		return p.InitialBackoff
	}

	delay := time.Duration(float64(p.InitialBackoff) * pow(p.BackoffFactor, float64(attemptCount-1)))
	if delay > p.MaxBackoff {
		delay = p.MaxBackoff
	}

	return delay
}

// pow calculates x^y for float64
func pow(x, y float64) float64 {
	if y == 0 {
		return 1
	}
	result := x
	for i := 1; i < int(y); i++ {
		result *= x
	}
	return result
}

// ImageCacheCleanupPolicy defines cache cleanup behavior
type ImageCacheCleanupPolicy struct {
	MaxAge          time.Duration `json:"max_age"`
	MaxSize         int64         `json:"max_size"`
	CleanupInterval time.Duration `json:"cleanup_interval"`
	KeepSuccessful  bool          `json:"keep_successful"`
	KeepFailed      bool          `json:"keep_failed"`
	FailedRetention time.Duration `json:"failed_retention"`
}

// DefaultImageCacheCleanupPolicy returns the default cleanup policy
func DefaultImageCacheCleanupPolicy() *ImageCacheCleanupPolicy {
	return &ImageCacheCleanupPolicy{
		MaxAge:          24 * time.Hour,
		MaxSize:         1024 * 1024 * 1024, // 1GB
		CleanupInterval: 1 * time.Hour,
		KeepSuccessful:  false,              // Delete successful uploads immediately
		KeepFailed:      true,               // Keep failed uploads for debugging
		FailedRetention: 7 * 24 * time.Hour, // Keep failed for 7 days
	}
}

// ImageUploadStatistics represents upload statistics
type ImageUploadStatistics struct {
	TotalUploads      int64                              `json:"total_uploads"`
	SuccessfulUploads int64                              `json:"successful_uploads"`
	FailedUploads     int64                              `json:"failed_uploads"`
	RetryCount        int64                              `json:"retry_count"`
	AverageUploadTime time.Duration                      `json:"average_upload_time"`
	ErrorsByType      map[ImageUploadErrorType]int64     `json:"errors_by_type"`
	ErrorsBySeverity  map[ImageUploadErrorSeverity]int64 `json:"errors_by_severity"`
	LastUpdated       time.Time                          `json:"last_updated"`
}

// ImageUploadSuggestion represents a suggestion for fixing upload errors
type ImageUploadSuggestion struct {
	Type         string `json:"type"`
	Message      string `json:"message"`
	Action       string `json:"action"`
	Priority     int    `json:"priority"`
	Automated    bool   `json:"automated"`
	UserFriendly bool   `json:"user_friendly"`
}

// GetImageUploadSuggestions returns suggestions based on error type
func GetImageUploadSuggestions(errorType ImageUploadErrorType, context map[string]interface{}) []ImageUploadSuggestion {
	suggestions := []ImageUploadSuggestion{}

	switch errorType {
	case ImageUploadErrorTypeNetwork:
		suggestions = append(suggestions, ImageUploadSuggestion{
			Type:         "network",
			Message:      "Lá»—i káº¿t ná»‘i máº¡ng",
			Action:       "Kiá»ƒm tra káº¿t ná»‘i internet vÃ  thá»­ láº¡i",
			Priority:     1,
			Automated:    true,
			UserFriendly: true,
		})

	case ImageUploadErrorTypeQuota:
		suggestions = append(suggestions, ImageUploadSuggestion{
			Type:         "quota",
			Message:      "VÆ°á»£t quÃ¡ giá»›i háº¡n quota",
			Action:       "Chá» quota reset hoáº·c liÃªn há»‡ admin Ä‘á»ƒ tÄƒng quota",
			Priority:     2,
			Automated:    false,
			UserFriendly: true,
		})

	case ImageUploadErrorTypePermission:
		suggestions = append(suggestions, ImageUploadSuggestion{
			Type:         "permission",
			Message:      "KhÃ´ng cÃ³ quyá»n truy cáº­p",
			Action:       "Kiá»ƒm tra quyá»n truy cáº­p Google Drive hoáº·c liÃªn há»‡ admin",
			Priority:     1,
			Automated:    false,
			UserFriendly: true,
		})

	case ImageUploadErrorTypeFileSystem:
		suggestions = append(suggestions, ImageUploadSuggestion{
			Type:         "filesystem",
			Message:      "Lá»—i há»‡ thá»‘ng file",
			Action:       "Kiá»ƒm tra dung lÆ°á»£ng Ä‘Ä©a vÃ  quyá»n ghi file",
			Priority:     1,
			Automated:    false,
			UserFriendly: true,
		})

	case ImageUploadErrorTypeConversion:
		suggestions = append(suggestions, ImageUploadSuggestion{
			Type:         "conversion",
			Message:      "Lá»—i chuyá»ƒn Ä‘á»•i hÃ¬nh áº£nh",
			Action:       "Kiá»ƒm tra Ä‘á»‹nh dáº¡ng LaTeX TikZ hoáº·c thá»­ vá»›i hÃ¬nh áº£nh khÃ¡c",
			Priority:     1,
			Automated:    false,
			UserFriendly: true,
		})

	case ImageUploadErrorTypeValidation:
		suggestions = append(suggestions, ImageUploadSuggestion{
			Type:         "validation",
			Message:      "Dá»¯ liá»‡u khÃ´ng há»£p lá»‡",
			Action:       "Kiá»ƒm tra láº¡i thÃ´ng tin hÃ¬nh áº£nh vÃ  Ä‘á»‹nh dáº¡ng file",
			Priority:     1,
			Automated:    false,
			UserFriendly: true,
		})

	case ImageUploadErrorTypeTimeout:
		suggestions = append(suggestions, ImageUploadSuggestion{
			Type:         "timeout",
			Message:      "QuÃ¡ thá»i gian chá»",
			Action:       "Thá»­ láº¡i vá»›i file nhá» hÆ¡n hoáº·c kiá»ƒm tra káº¿t ná»‘i máº¡ng",
			Priority:     1,
			Automated:    true,
			UserFriendly: true,
		})

	case ImageUploadErrorTypeUnknown:
		suggestions = append(suggestions, ImageUploadSuggestion{
			Type:         "unknown",
			Message:      "Lá»—i khÃ´ng xÃ¡c Ä‘á»‹nh",
			Action:       "Thá»­ láº¡i hoáº·c liÃªn há»‡ support náº¿u váº¥n Ä‘á» tiáº¿p tá»¥c",
			Priority:     3,
			Automated:    true,
			UserFriendly: true,
		})
	}

	return suggestions
}

// ImageUploadHistory represents the history of upload attempts for an image
type ImageUploadHistory struct {
	ID           pgtype.Text        `json:"id" db:"id"`
	ImageID      pgtype.Text        `json:"image_id" db:"image_id"`
	AttemptCount pgtype.Int4        `json:"attempt_count" db:"attempt_count"`
	LastAttempt  pgtype.Timestamptz `json:"last_attempt" db:"last_attempt"`
	LastError    pgtype.Text        `json:"last_error" db:"last_error"`
	Status       pgtype.Text        `json:"status" db:"status"`
	TotalRetries pgtype.Int4        `json:"total_retries" db:"total_retries"`
	CreatedAt    pgtype.Timestamptz `json:"created_at" db:"created_at"`
	UpdatedAt    pgtype.Timestamptz `json:"updated_at" db:"updated_at"`
}
