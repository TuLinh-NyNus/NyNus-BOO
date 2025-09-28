package system

import (
	"context"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
)

// SystemService defines the consolidated system service interface
// This includes validation, performance monitoring, security, and other system-level operations
type SystemService interface {
	// Validation Operations
	ValidateUserInput(ctx context.Context, input interface{}, rules ValidationRules) (*ValidationResult, error)
	ValidateExamData(ctx context.Context, exam *entity.Exam) (*ValidationResult, error)
	ValidateQuestionData(ctx context.Context, question *entity.Question) (*ValidationResult, error)
	ValidateEmailFormat(email string) bool
	ValidatePasswordStrength(password string) (*PasswordValidation, error)
	
	// Performance Monitoring Operations
	RecordPerformanceMetric(ctx context.Context, metric *PerformanceMetric) error
	GetPerformanceMetrics(ctx context.Context, service string, dateFrom, dateTo string) ([]PerformanceMetric, error)
	GetSystemHealth(ctx context.Context) (*SystemHealth, error)
	GetServiceStatus(ctx context.Context, serviceName string) (*ServiceStatus, error)
	
	// Security Operations
	LogSecurityEvent(ctx context.Context, event *SecurityEvent) error
	GetSecurityEvents(ctx context.Context, dateFrom, dateTo string, offset, limit int) ([]SecurityEvent, int, error)
	CheckRateLimit(ctx context.Context, userID, action string) (*RateLimitResult, error)
	UpdateRateLimit(ctx context.Context, userID, action string) error
	
	// System Configuration Operations
	GetSystemConfig(ctx context.Context, key string) (*SystemConfig, error)
	UpdateSystemConfig(ctx context.Context, config *SystemConfig) error
	ListSystemConfigs(ctx context.Context) ([]SystemConfig, error)
	
	// Audit Operations
	LogAuditEvent(ctx context.Context, event *AuditEvent) error
	GetAuditEvents(ctx context.Context, filter *AuditFilter, offset, limit int) ([]AuditEvent, int, error)
	GetUserAuditTrail(ctx context.Context, userID string, offset, limit int) ([]AuditEvent, int, error)
	
	// Cache Operations
	SetCache(ctx context.Context, key string, value interface{}, ttl int) error
	GetCache(ctx context.Context, key string) (interface{}, error)
	DeleteCache(ctx context.Context, key string) error
	ClearCachePattern(ctx context.Context, pattern string) error
	
	// File Operations
	UploadFile(ctx context.Context, file *FileUpload) (*FileUploadResult, error)
	DeleteFile(ctx context.Context, fileID string) error
	GetFileInfo(ctx context.Context, fileID string) (*FileInfo, error)
	GeneratePresignedURL(ctx context.Context, fileID string, expiry int) (string, error)
}

// ValidationRules defines validation rules for input data
type ValidationRules struct {
	Required    []string          `json:"required"`
	MinLength   map[string]int    `json:"min_length"`
	MaxLength   map[string]int    `json:"max_length"`
	Pattern     map[string]string `json:"pattern"`
	CustomRules map[string]string `json:"custom_rules"`
}

// ValidationResult represents the result of validation
type ValidationResult struct {
	IsValid bool                    `json:"is_valid"`
	Errors  []ValidationError       `json:"errors"`
	Warnings []ValidationWarning    `json:"warnings"`
	Summary string                  `json:"summary"`
}

// ValidationError represents a validation error
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
	Code    string `json:"code"`
	Value   string `json:"value"`
}

// ValidationWarning represents a validation warning
type ValidationWarning struct {
	Field   string `json:"field"`
	Message string `json:"message"`
	Code    string `json:"code"`
}

// PasswordValidation represents password validation result
type PasswordValidation struct {
	IsValid          bool     `json:"is_valid"`
	Score            int      `json:"score"` // 0-100
	Strength         string   `json:"strength"` // weak, medium, strong, very_strong
	Issues           []string `json:"issues"`
	Suggestions      []string `json:"suggestions"`
	HasUppercase     bool     `json:"has_uppercase"`
	HasLowercase     bool     `json:"has_lowercase"`
	HasNumbers       bool     `json:"has_numbers"`
	HasSpecialChars  bool     `json:"has_special_chars"`
	Length           int      `json:"length"`
	IsCommon         bool     `json:"is_common"`
}

// PerformanceMetric represents a performance metric
type PerformanceMetric struct {
	ID          string            `json:"id"`
	Service     string            `json:"service"`
	Operation   string            `json:"operation"`
	Duration    int64             `json:"duration_ms"`
	Success     bool              `json:"success"`
	ErrorCode   string            `json:"error_code"`
	Metadata    map[string]string `json:"metadata"`
	Timestamp   string            `json:"timestamp"`
	UserID      string            `json:"user_id"`
	RequestID   string            `json:"request_id"`
}

// SystemHealth represents overall system health
type SystemHealth struct {
	Status           string                    `json:"status"` // healthy, degraded, unhealthy
	Uptime           int64                     `json:"uptime_seconds"`
	Version          string                    `json:"version"`
	Services         map[string]ServiceStatus  `json:"services"`
	DatabaseStatus   DatabaseStatus            `json:"database_status"`
	CacheStatus      CacheStatus               `json:"cache_status"`
	MemoryUsage      MemoryUsage               `json:"memory_usage"`
	DiskUsage        DiskUsage                 `json:"disk_usage"`
	LastHealthCheck  string                    `json:"last_health_check"`
}

// ServiceStatus represents the status of a specific service
type ServiceStatus struct {
	Name            string  `json:"name"`
	Status          string  `json:"status"` // healthy, degraded, unhealthy
	ResponseTime    int64   `json:"response_time_ms"`
	ErrorRate       float64 `json:"error_rate"`
	LastCheck       string  `json:"last_check"`
	Dependencies    []string `json:"dependencies"`
	HealthEndpoint  string  `json:"health_endpoint"`
}

// DatabaseStatus represents database health status
type DatabaseStatus struct {
	Status           string `json:"status"`
	ConnectionCount  int    `json:"connection_count"`
	MaxConnections   int    `json:"max_connections"`
	QueryTime        int64  `json:"avg_query_time_ms"`
	SlowQueries      int    `json:"slow_queries"`
	LastCheck        string `json:"last_check"`
}

// CacheStatus represents cache health status
type CacheStatus struct {
	Status      string  `json:"status"`
	HitRate     float64 `json:"hit_rate"`
	MissRate    float64 `json:"miss_rate"`
	KeyCount    int     `json:"key_count"`
	MemoryUsage int64   `json:"memory_usage_bytes"`
	LastCheck   string  `json:"last_check"`
}

// MemoryUsage represents memory usage information
type MemoryUsage struct {
	Used        int64   `json:"used_bytes"`
	Available   int64   `json:"available_bytes"`
	Total       int64   `json:"total_bytes"`
	Percentage  float64 `json:"percentage"`
}

// DiskUsage represents disk usage information
type DiskUsage struct {
	Used        int64   `json:"used_bytes"`
	Available   int64   `json:"available_bytes"`
	Total       int64   `json:"total_bytes"`
	Percentage  float64 `json:"percentage"`
}

// SecurityEvent represents a security-related event
type SecurityEvent struct {
	ID          string            `json:"id"`
	Type        string            `json:"type"` // login_attempt, failed_login, suspicious_activity, etc.
	Severity    string            `json:"severity"` // low, medium, high, critical
	UserID      string            `json:"user_id"`
	IPAddress   string            `json:"ip_address"`
	UserAgent   string            `json:"user_agent"`
	Description string            `json:"description"`
	Metadata    map[string]string `json:"metadata"`
	Timestamp   string            `json:"timestamp"`
	Resolved    bool              `json:"resolved"`
	ResolvedBy  string            `json:"resolved_by"`
	ResolvedAt  string            `json:"resolved_at"`
}

// RateLimitResult represents rate limiting check result
type RateLimitResult struct {
	Allowed       bool   `json:"allowed"`
	Remaining     int    `json:"remaining"`
	ResetTime     string `json:"reset_time"`
	RetryAfter    int    `json:"retry_after_seconds"`
	WindowSize    int    `json:"window_size_seconds"`
	CurrentCount  int    `json:"current_count"`
	Limit         int    `json:"limit"`
}

// SystemConfig represents system configuration
type SystemConfig struct {
	Key         string `json:"key"`
	Value       string `json:"value"`
	Type        string `json:"type"` // string, int, bool, json
	Description string `json:"description"`
	IsSecret    bool   `json:"is_secret"`
	UpdatedBy   string `json:"updated_by"`
	UpdatedAt   string `json:"updated_at"`
}

// AuditEvent represents an audit event
type AuditEvent struct {
	ID          string            `json:"id"`
	Action      string            `json:"action"`
	Resource    string            `json:"resource"`
	ResourceID  string            `json:"resource_id"`
	UserID      string            `json:"user_id"`
	IPAddress   string            `json:"ip_address"`
	UserAgent   string            `json:"user_agent"`
	Changes     map[string]interface{} `json:"changes"`
	Metadata    map[string]string `json:"metadata"`
	Timestamp   string            `json:"timestamp"`
	Success     bool              `json:"success"`
	ErrorMessage string           `json:"error_message"`
}

// AuditFilter represents audit event filtering options
type AuditFilter struct {
	UserID     string   `json:"user_id"`
	Action     []string `json:"action"`
	Resource   []string `json:"resource"`
	DateFrom   string   `json:"date_from"`
	DateTo     string   `json:"date_to"`
	Success    *bool    `json:"success"`
	IPAddress  string   `json:"ip_address"`
}

// FileUpload represents a file upload request
type FileUpload struct {
	Filename    string            `json:"filename"`
	ContentType string            `json:"content_type"`
	Size        int64             `json:"size"`
	Data        []byte            `json:"data"`
	UserID      string            `json:"user_id"`
	Category    string            `json:"category"`
	Metadata    map[string]string `json:"metadata"`
}

// FileUploadResult represents file upload result
type FileUploadResult struct {
	FileID      string `json:"file_id"`
	URL         string `json:"url"`
	Filename    string `json:"filename"`
	Size        int64  `json:"size"`
	ContentType string `json:"content_type"`
	UploadedAt  string `json:"uploaded_at"`
}

// FileInfo represents file information
type FileInfo struct {
	ID          string            `json:"id"`
	Filename    string            `json:"filename"`
	ContentType string            `json:"content_type"`
	Size        int64             `json:"size"`
	URL         string            `json:"url"`
	UserID      string            `json:"user_id"`
	Category    string            `json:"category"`
	Metadata    map[string]string `json:"metadata"`
	CreatedAt   string            `json:"created_at"`
	UpdatedAt   string            `json:"updated_at"`
}

// SystemRepository defines the repository interface for system operations
type SystemRepository interface {
	// Performance metrics
	CreatePerformanceMetric(ctx context.Context, db database.QueryExecer, metric *PerformanceMetric) error
	GetPerformanceMetrics(ctx context.Context, db database.QueryExecer, service string, dateFrom, dateTo string) ([]PerformanceMetric, error)
	
	// Security events
	CreateSecurityEvent(ctx context.Context, db database.QueryExecer, event *SecurityEvent) error
	GetSecurityEvents(ctx context.Context, db database.QueryExecer, dateFrom, dateTo string, offset, limit int) ([]SecurityEvent, int, error)
	
	// System configuration
	GetSystemConfig(ctx context.Context, db database.QueryExecer, key string) (*SystemConfig, error)
	UpdateSystemConfig(ctx context.Context, db database.QueryExecer, config *SystemConfig) error
	ListSystemConfigs(ctx context.Context, db database.QueryExecer) ([]SystemConfig, error)
	
	// Audit events
	CreateAuditEvent(ctx context.Context, db database.QueryExecer, event *AuditEvent) error
	GetAuditEvents(ctx context.Context, db database.QueryExecer, filter *AuditFilter, offset, limit int) ([]AuditEvent, int, error)
	
	// File operations
	CreateFileRecord(ctx context.Context, db database.QueryExecer, file *FileInfo) error
	GetFileInfo(ctx context.Context, db database.QueryExecer, fileID string) (*FileInfo, error)
	DeleteFileRecord(ctx context.Context, db database.QueryExecer, fileID string) error
}
