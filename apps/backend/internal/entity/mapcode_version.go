package entity

import (
	"time"

	"github.com/jackc/pgtype"
)

// MapCodeVersion represents a version of MapCode configuration
type MapCodeVersion struct {
	ID          pgtype.Text        `json:"id"`          // UUID primary key
	Version     pgtype.Text        `json:"version"`     // Version string (e.g., "v2025-09-22")
	Name        pgtype.Text        `json:"name"`        // Display name
	Description pgtype.Text        `json:"description"` // Version description
	FilePath    pgtype.Text        `json:"file_path"`   // Path to MapCode file
	IsActive    pgtype.Bool        `json:"is_active"`   // Whether this is the active version
	CreatedBy   pgtype.Text        `json:"created_by"`  // User who created this version
	CreatedAt   pgtype.Timestamptz `json:"created_at"`  // Creation timestamp
	UpdatedAt   pgtype.Timestamptz `json:"updated_at"`  // Last update timestamp
}

// MapCodeTranslation represents a cached translation result
type MapCodeTranslation struct {
	ID           pgtype.Text        `json:"id"`            // UUID primary key
	VersionID    pgtype.Text        `json:"version_id"`    // Reference to MapCodeVersion
	QuestionCode pgtype.Text        `json:"question_code"` // Question code (e.g., "0P1N1")
	Translation  pgtype.Text        `json:"translation"`   // Human-readable translation
	Grade        pgtype.Text        `json:"grade"`         // Parsed grade
	Subject      pgtype.Text        `json:"subject"`       // Parsed subject
	Chapter      pgtype.Text        `json:"chapter"`       // Parsed chapter
	Level        pgtype.Text        `json:"level"`         // Parsed level
	Lesson       pgtype.Text        `json:"lesson"`        // Parsed lesson
	Form         pgtype.Text        `json:"form"`          // Parsed form (nullable)
	
	// Hierarchical context (NEW)
	HierarchyPath  pgtype.Text `json:"hierarchy_path"`  // Full hierarchical path for breadcrumbs
	ParentContext  pgtype.JSONB `json:"parent_context"` // Parent context for disambiguation
	
	CreatedAt    pgtype.Timestamptz `json:"created_at"`    // Creation timestamp
	UpdatedAt    pgtype.Timestamptz `json:"updated_at"`    // Last update timestamp
}

// MapCodeParentContext represents parent context for disambiguation
type MapCodeParentContext struct {
	Grade   string `json:"grade"`
	Subject string `json:"subject"`
	Chapter string `json:"chapter"`
}

// MapCodeConfig represents the parsed configuration from a MapCode file
type MapCodeConfig struct {
	Version     string            `json:"version"`
	Name        string            `json:"name"`
	Description string            `json:"description"`
	Grades      map[string]string `json:"grades"`
	Subjects    map[string]string `json:"subjects"`
	Chapters    map[string]string `json:"chapters"`
	Levels      map[string]string `json:"levels"`
	Lessons     map[string]string `json:"lessons"`
	Forms       map[string]string `json:"forms"`
	CreatedAt   time.Time         `json:"created_at"`
}

// MapCodeVersionStatus represents the status of version operations
type MapCodeVersionStatus string

const (
	MapCodeVersionStatusActive   MapCodeVersionStatus = "ACTIVE"
	MapCodeVersionStatusInactive MapCodeVersionStatus = "INACTIVE"
	MapCodeVersionStatusDraft    MapCodeVersionStatus = "DRAFT"
	MapCodeVersionStatusArchived MapCodeVersionStatus = "ARCHIVED"
)

// MapCodeStorageInfo represents storage information
type MapCodeStorageInfo struct {
	TotalVersions  int  `json:"total_versions"`
	MaxVersions    int  `json:"max_versions"`
	AvailableSlots int  `json:"available_slots"`
	WarningLevel   int  `json:"warning_level"` // Warning when reaching this number
	IsNearLimit    bool `json:"is_near_limit"`
	IsAtLimit      bool `json:"is_at_limit"`
}

// NewMapCodeStorageInfo creates storage info with default limits
func NewMapCodeStorageInfo(totalVersions int) *MapCodeStorageInfo {
	const maxVersions = 20
	const warningLevel = 18

	return &MapCodeStorageInfo{
		TotalVersions:  totalVersions,
		MaxVersions:    maxVersions,
		AvailableSlots: maxVersions - totalVersions,
		WarningLevel:   warningLevel,
		IsNearLimit:    totalVersions >= warningLevel,
		IsAtLimit:      totalVersions >= maxVersions,
	}
}

// CanCreateNewVersion checks if new version can be created
func (info *MapCodeStorageInfo) CanCreateNewVersion() bool {
	return !info.IsAtLimit
}

// GetWarningMessage returns appropriate warning message
func (info *MapCodeStorageInfo) GetWarningMessage() string {
	if info.IsAtLimit {
		return "ÄÃ£ Ä‘áº¡t giá»›i háº¡n tá»‘i Ä‘a 20 versions. Vui lÃ²ng xÃ³a versions cÅ© trÆ°á»›c khi táº¡o má»›i."
	}
	if info.IsNearLimit {
		return "Sáº¯p Ä‘áº¡t giá»›i háº¡n versions. CÃ²n láº¡i " + string(rune(info.AvailableSlots)) + " slots."
	}
	return ""
}
