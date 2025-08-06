package questioncode

import (
	"context"
	"fmt"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"
)

// QuestionCodeService handles business logic for QuestionCode operations
type QuestionCodeService struct {
	repo   *repository.QuestionCodeRepository
	parser *util.QuestionCodeParser
}

// NewQuestionCodeService creates a new QuestionCode service
func NewQuestionCodeService() *QuestionCodeService {
	return &QuestionCodeService{
		parser: util.NewQuestionCodeParser(),
	}
}

// ParseAndValidate parses a QuestionCode string and validates its format
func (s *QuestionCodeService) ParseAndValidate(questionCode string) (*util.QuestionCodeComponents, error) {
	return s.parser.Parse(questionCode)
}

// GetOrCreateQuestionCode gets an existing QuestionCode or creates a new one
func (s *QuestionCodeService) GetOrCreateQuestionCode(ctx context.Context, db database.QueryExecer, questionCodeStr string) (*entity.QuestionCode, error) {
	// Parse the QuestionCode
	components, err := s.parser.Parse(questionCodeStr)
	if err != nil {
		return nil, fmt.Errorf("failed to parse QuestionCode %s: %w", questionCodeStr, err)
	}

	// Initialize repository if not set
	if s.repo == nil {
		s.repo = &repository.QuestionCodeRepository{}
	}

	// Get or create QuestionCode
	questionCode, err := s.repo.GetOrCreate(ctx, db, questionCodeStr, components)
	if err != nil {
		return nil, fmt.Errorf("failed to get or create QuestionCode: %w", err)
	}

	return questionCode, nil
}

// FindQuestionCodes finds QuestionCodes by filter criteria
func (s *QuestionCodeService) FindQuestionCodes(ctx context.Context, db database.QueryExecer, filter repository.QuestionCodeFilter) ([]entity.QuestionCode, error) {
	if s.repo == nil {
		s.repo = &repository.QuestionCodeRepository{}
	}

	return s.repo.FindByFilter(ctx, db, filter)
}

// GetQuestionCodesByPaging retrieves QuestionCodes with pagination
func (s *QuestionCodeService) GetQuestionCodesByPaging(db database.QueryExecer, offset int, limit int) (total int, questionCodes []entity.QuestionCode, err error) {
	if s.repo == nil {
		s.repo = &repository.QuestionCodeRepository{}
	}

	return s.repo.GetQuestionCodesByPaging(db, offset, limit)
}

// GenerateFolderPath generates the Google Drive folder path for a QuestionCode
func (s *QuestionCodeService) GenerateFolderPath(questionCodeStr string) (string, error) {
	components, err := s.parser.Parse(questionCodeStr)
	if err != nil {
		return "", fmt.Errorf("failed to parse QuestionCode: %w", err)
	}

	return s.parser.GenerateFolderPath(components), nil
}

// GetHumanReadableInfo returns human-readable information about a QuestionCode
func (s *QuestionCodeService) GetHumanReadableInfo(questionCodeStr string) (*QuestionCodeInfo, error) {
	components, err := s.parser.Parse(questionCodeStr)
	if err != nil {
		return nil, fmt.Errorf("failed to parse QuestionCode: %w", err)
	}

	return &QuestionCodeInfo{
		Code:       questionCodeStr,
		Grade:      s.parser.GetGradeName(components.Grade),
		Subject:    s.parser.GetSubjectName(components.Subject),
		Chapter:    components.Chapter,
		Level:      s.parser.GetLevelName(components.Level),
		Lesson:     components.Lesson,
		Form:       components.Form,
		FolderPath: s.parser.GenerateFolderPath(components),
		IsID6:      components.IsID6,
		Components: components,
	}, nil
}

// ValidateQuestionCodeFormat validates if a string is a valid QuestionCode format
func (s *QuestionCodeService) ValidateQuestionCodeFormat(questionCode string) error {
	_, err := s.parser.Parse(questionCode)
	return err
}

// ParseQuestionCodeFromImport handles QuestionCode parsing during import process
func (s *QuestionCodeService) ParseQuestionCodeFromImport(ctx context.Context, db database.QueryExecer, questionCodeStr string) (*ImportQuestionCodeResult, error) {
	// Parse and validate
	components, err := s.parser.Parse(questionCodeStr)
	if err != nil {
		return &ImportQuestionCodeResult{
			Success: false,
			Error:   fmt.Sprintf("Invalid QuestionCode format: %v", err),
		}, nil
	}

	// Get or create QuestionCode in database
	questionCode, err := s.GetOrCreateQuestionCode(ctx, db, questionCodeStr)
	if err != nil {
		return &ImportQuestionCodeResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to process QuestionCode: %v", err),
		}, nil
	}

	// Get human-readable info
	info, err := s.GetHumanReadableInfo(questionCodeStr)
	if err != nil {
		return &ImportQuestionCodeResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to get QuestionCode info: %v", err),
		}, nil
	}

	return &ImportQuestionCodeResult{
		Success:      true,
		QuestionCode: questionCode,
		Components:   components,
		Info:         info,
	}, nil
}

// GenerateQuestionCodeSuggestions generates QuestionCode suggestions based on partial input
func (s *QuestionCodeService) GenerateQuestionCodeSuggestions(ctx context.Context, db database.QueryExecer, partial string) ([]string, error) {
	// This could be enhanced to provide intelligent suggestions
	// For now, return basic format examples
	suggestions := []string{
		"0P1N1",   // ID5 example
		"0P1N1-1", // ID6 example
		"1L2V3",   // Different grade/subject
		"2H3C2-2", // High level example
	}

	return suggestions, nil
}

// QuestionCodeInfo represents human-readable QuestionCode information
type QuestionCodeInfo struct {
	Code       string                       `json:"code"`
	Grade      string                       `json:"grade"`
	Subject    string                       `json:"subject"`
	Chapter    string                       `json:"chapter"`
	Level      string                       `json:"level"`
	Lesson     string                       `json:"lesson"`
	Form       string                       `json:"form"`
	FolderPath string                       `json:"folder_path"`
	IsID6      bool                         `json:"is_id6"`
	Components *util.QuestionCodeComponents `json:"components"`
}

// ImportQuestionCodeResult represents the result of QuestionCode processing during import
type ImportQuestionCodeResult struct {
	Success      bool                         `json:"success"`
	QuestionCode *entity.QuestionCode         `json:"question_code,omitempty"`
	Components   *util.QuestionCodeComponents `json:"components,omitempty"`
	Info         *QuestionCodeInfo            `json:"info,omitempty"`
	Error        string                       `json:"error,omitempty"`
}

// QuestionCodeStats represents statistics about QuestionCodes
type QuestionCodeStats struct {
	TotalCodes int            `json:"total_codes"`
	ByGrade    map[string]int `json:"by_grade"`
	BySubject  map[string]int `json:"by_subject"`
	ByLevel    map[string]int `json:"by_level"`
	ID5Count   int            `json:"id5_count"`
	ID6Count   int            `json:"id6_count"`
}

// GetQuestionCodeStats returns statistics about QuestionCodes in the system
func (s *QuestionCodeService) GetQuestionCodeStats(ctx context.Context, db database.QueryExecer) (*QuestionCodeStats, error) {
	if s.repo == nil {
		s.repo = &repository.QuestionCodeRepository{}
	}

	// Get all QuestionCodes
	allCodes, err := s.repo.FindByFilter(ctx, db, repository.QuestionCodeFilter{})
	if err != nil {
		return nil, fmt.Errorf("failed to get QuestionCodes for stats: %w", err)
	}

	stats := &QuestionCodeStats{
		TotalCodes: len(allCodes),
		ByGrade:    make(map[string]int),
		BySubject:  make(map[string]int),
		ByLevel:    make(map[string]int),
	}

	// Calculate statistics
	for _, qc := range allCodes {
		// Grade stats
		gradeStr := fmt.Sprintf("%d", qc.Grade.Int)
		stats.ByGrade[gradeStr]++

		// Subject stats
		stats.BySubject[qc.Subject.String]++

		// Level stats
		stats.ByLevel[qc.Level.String]++

		// ID5/ID6 count
		if qc.Form.Int == 0 {
			stats.ID5Count++
		} else {
			stats.ID6Count++
		}
	}

	return stats, nil
}
