package question

import (
	"context"
	"encoding/base64"
	"encoding/csv"
	"fmt"
	"regexp"
	"strings"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/latex"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/image_processing"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"
	"github.com/google/uuid"
	"github.com/jackc/pgtype"
	"github.com/sirupsen/logrus"
)

// LegacyQuestionMgmt manages question-related operations (legacy implementation)
type LegacyQuestionMgmt struct {
	questionRepo      interfaces.QuestionRepository
	questionCodeRepo  interfaces.QuestionCodeRepository
	questionImageRepo interfaces.QuestionImageRepository
	imageProcessor    *image_processing.ImageProcessingService
	imageWorkerPool   *image_processing.WorkerPool
	logger            *logrus.Logger
}

// NewLegacyQuestionMgmt creates a new question management service (legacy)
func NewLegacyQuestionMgmt(
	questionRepo interfaces.QuestionRepository,
	questionCodeRepo interfaces.QuestionCodeRepository,
	questionImageRepo interfaces.QuestionImageRepository,
	imageProcessor *image_processing.ImageProcessingService,
	logger *logrus.Logger,
) *LegacyQuestionMgmt {
	service := &LegacyQuestionMgmt{
		questionRepo:      questionRepo,
		questionCodeRepo:  questionCodeRepo,
		questionImageRepo: questionImageRepo,
		imageProcessor:    imageProcessor,
		logger:            logger,
	}

	// Initialize worker pool if image processor is available
	if imageProcessor != nil {
		service.imageWorkerPool = image_processing.NewWorkerPool(imageProcessor, logger, 5)
		service.imageWorkerPool.Start()
	}

	return service
}

// CreateQuestion creates a new question
func (m *LegacyQuestionMgmt) CreateQuestion(ctx context.Context, question *entity.Question) error {
	// Validate question code exists
	if question.QuestionCodeID.Status == pgtype.Present {
		exists, err := m.questionCodeRepo.Exists(ctx, question.QuestionCodeID.String)
		if err != nil {
			return fmt.Errorf("failed to validate question code: %v", err)
		}
		if !exists {
			return fmt.Errorf("question code '%s' does not exist", question.QuestionCodeID.String)
		}
	}

	// Generate ID if not provided
	if question.ID.Status != pgtype.Present || question.ID.String == "" {
		question.ID.Set(uuid.New().String())
	}

	// Set defaults
	if question.Status.Status != pgtype.Present {
		question.Status.Set("PENDING")
	}
	if question.Creator.Status != pgtype.Present {
		question.Creator.Set("ADMIN")
	}
	if question.Difficulty.Status != pgtype.Present {
		question.Difficulty.Set("MEDIUM")
	}
	if question.UsageCount.Status != pgtype.Present {
		question.UsageCount.Set(0)
	}
	if question.Feedback.Status != pgtype.Present {
		question.Feedback.Set(0)
	}

	return m.questionRepo.Create(ctx, question)
}

// GetQuestionByID retrieves a question by ID
func (m *LegacyQuestionMgmt) GetQuestionByID(ctx context.Context, id string) (entity.Question, error) {
	question, err := m.questionRepo.GetByID(ctx, id)
	if err != nil {
		return entity.Question{}, err
	}
	return *question, nil
}

// UpdateQuestion updates an existing question
func (m *LegacyQuestionMgmt) UpdateQuestion(ctx context.Context, question *entity.Question) error {
	// Validate question exists
	existing, err := m.questionRepo.GetByID(ctx, question.ID.String)
	if err != nil {
		return fmt.Errorf("question not found: %v", err)
	}

	// Validate question code if changed
	if question.QuestionCodeID.String != existing.QuestionCodeID.String {
		exists, err := m.questionCodeRepo.Exists(ctx, question.QuestionCodeID.String)
		if err != nil {
			return fmt.Errorf("failed to validate question code: %v", err)
		}
		if !exists {
			return fmt.Errorf("question code '%s' does not exist", question.QuestionCodeID.String)
		}
	}

	return m.questionRepo.Update(ctx, question)
}

// DeleteQuestion deletes a question
func (m *LegacyQuestionMgmt) DeleteQuestion(ctx context.Context, id string) error {
	return m.questionRepo.Delete(ctx, id)
}

// GetQuestionsByPaging retrieves questions with pagination
func (m *LegacyQuestionMgmt) GetQuestionsByPaging(offset, limit int) (int, []entity.Question, error) {
	ctx := context.Background()

	// Get total count
	total, err := m.questionRepo.Count(ctx)
	if err != nil {
		return 0, nil, err
	}

	// Get questions
	questions, err := m.questionRepo.GetAll(ctx, offset, limit)
	if err != nil {
		return 0, nil, err
	}

	// Convert to entity slice
	result := make([]entity.Question, len(questions))
	for i, q := range questions {
		result[i] = *q
	}

	return total, result, nil
}

// GetQuestionsByFilter retrieves questions with advanced filtering
func (m *LegacyQuestionMgmt) GetQuestionsByFilter(ctx context.Context, filterQuery map[string]interface{}, offset, limit int, sortColumn, sortOrder string) ([]entity.Question, int, error) {
	// Convert map to FilterCriteria
	criteria := m.mapToFilterCriteria(filterQuery)

	questions, total, err := m.questionRepo.FindWithFilters(ctx, criteria, offset, limit, sortColumn, sortOrder)
	if err != nil {
		return nil, 0, err
	}

	// Convert to entity slice
	result := make([]entity.Question, len(questions))
	for i, q := range questions {
		result[i] = *q
	}

	return result, total, nil
}

// SearchQuestions performs text search on questions
func (m *LegacyQuestionMgmt) SearchQuestions(ctx context.Context, searchOpts *SearchOptions, filterQuery map[string]interface{}, offset, limit int) ([]SearchResult, int, error) {
	searchCriteria := interfaces.SearchCriteria{
		Query:            searchOpts.Query,
		SearchInContent:  searchOpts.SearchInContent,
		SearchInSolution: searchOpts.SearchInSolution,
		SearchInTags:     searchOpts.SearchInTags,
		UseRegex:         searchOpts.UseRegex,
		CaseSensitive:    searchOpts.CaseSensitive,
	}

	var filterCriteria *interfaces.FilterCriteria
	if filterQuery != nil {
		filterCriteria = m.mapToFilterCriteria(filterQuery)
	}

	searchResults, total, err := m.questionRepo.Search(ctx, searchCriteria, filterCriteria, offset, limit)
	if err != nil {
		return nil, 0, err
	}

	// Convert to our SearchResult type
	results := make([]SearchResult, len(searchResults))
	for i, sr := range searchResults {
		results[i] = SearchResult{
			Question:    sr.Question,
			Score:       float64(sr.Score),
			Highlights:  sr.Matches,
			MatchFields: []string{}, // Map from sr.Snippet if needed
		}
	}

	return results, total, nil
}

// GetQuestionsByQuestionCode retrieves all questions for a specific question code
func (m *LegacyQuestionMgmt) GetQuestionsByQuestionCode(ctx context.Context, questionCodeID string) ([]entity.Question, error) {
	questions, err := m.questionRepo.FindByQuestionCodeID(ctx, questionCodeID)
	if err != nil {
		return nil, err
	}

	// Convert to entity slice
	result := make([]entity.Question, len(questions))
	for i, q := range questions {
		result[i] = *q
	}

	return result, nil
}

// GetQuestionCodeByID retrieves a question code by ID
func (m *LegacyQuestionMgmt) GetQuestionCodeByID(ctx context.Context, id string) (*entity.QuestionCode, error) {
	return m.questionCodeRepo.GetByID(ctx, id)
}

// CreateQuestionCode creates a new question code
func (m *LegacyQuestionMgmt) CreateQuestionCode(ctx context.Context, questionCode *entity.QuestionCode) error {
	// Check if question code already exists
	exists, err := m.questionCodeRepo.Exists(ctx, questionCode.Code.String)
	if err != nil {
		return fmt.Errorf("failed to check if question code exists: %v", err)
	}
	if exists {
		return fmt.Errorf("question code '%s' already exists", questionCode.Code.String)
	}

	// Create the question code
	return m.questionCodeRepo.Create(ctx, questionCode)
}

// CreateFromLatex creates a question from LaTeX content
func (m *LegacyQuestionMgmt) CreateFromLatex(ctx context.Context, rawLatex string, autoCreateCode bool, creator string) (*entity.Question, *entity.QuestionCode, []string, error) {
	var warnings []string

	// Import latex parser
	latexParser := latex.NewLaTeXQuestionParser()

	// Parse the LaTeX content
	question, questionCode, err := latexParser.ParseSingleQuestion(rawLatex)
	if err != nil {
		return nil, nil, nil, fmt.Errorf("failed to parse LaTeX: %v", err)
	}

	if question == nil {
		return nil, nil, nil, fmt.Errorf("no valid question found in LaTeX content")
	}

	// Check for MA (Matching) type - set to PENDING or reject
	questionType := util.PgTextToString(question.Type)
	if questionType == string(entity.QuestionTypeMA) {
		// Option 1: Set status to PENDING with warning
		question.Status = util.StringToPgText(string(entity.QuestionStatusPending))
		warnings = append(warnings, "Matching (MA) questions are not fully supported yet, status set to PENDING")
		// Option 2: Reject completely (uncomment if preferred)
		// return nil, nil, warnings, fmt.Errorf("Matching (MA) questions are not supported yet")
	}

	// Set creator if provided
	if creator != "" {
		question.Creator = util.StringToPgText(creator)
	}

	// Handle question code
	var createdCode *entity.QuestionCode
	if questionCode != nil {
		questionCodeID := util.PgTextToString(questionCode.Code)

		// Check if question code exists
		existingCode, _ := m.GetQuestionCodeByID(ctx, questionCodeID)

		if existingCode == nil {
			if autoCreateCode {
				// Create new question code
				err := m.CreateQuestionCode(ctx, questionCode)
				if err != nil {
					warnings = append(warnings, fmt.Sprintf("Failed to create question code: %v", err))
					// Continue without question code
					question.QuestionCodeID.Status = pgtype.Null
				} else {
					createdCode = questionCode
				}
			} else {
				// Question code doesn't exist and auto-create is disabled
				return nil, nil, warnings, fmt.Errorf("question code '%s' does not exist (enable auto-create to create it)", questionCodeID)
			}
		}
	}

	// Generate ID for the question
	question.ID.Set(uuid.New().String())

	// Set default status if not set
	if question.Status.Status != pgtype.Present {
		question.Status = util.StringToPgText(string(entity.QuestionStatusActive))
	}

	// Create the question
	err = m.CreateQuestion(ctx, question)
	if err != nil {
		return nil, createdCode, warnings, fmt.Errorf("failed to create question: %v", err)
	}

	// Process images if image processor is available
	if m.imageProcessor != nil && m.imageWorkerPool != nil {
		imageWarnings := m.processLatexImages(ctx, question.ID.String, rawLatex, createdCode)
		warnings = append(warnings, imageWarnings...)
	}

	return question, createdCode, warnings, nil
}

// processLatexImages detects and processes images in LaTeX content
func (m *LegacyQuestionMgmt) processLatexImages(ctx context.Context, questionID string, rawLatex string, questionCode *entity.QuestionCode) []string {
	var warnings []string

	// Detect TikZ pictures
	tikzRegex := regexp.MustCompile(`\\begin\{tikzpicture\}([\s\S]*?)\\end\{tikzpicture\}`)
	tikzMatches := tikzRegex.FindAllStringSubmatch(rawLatex, -1)

	// Detect includegraphics
	includeRegex := regexp.MustCompile(`\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}`)
	includeMatches := includeRegex.FindAllStringSubmatch(rawLatex, -1)

	// Determine subcount for naming
	subcount := m.extractSubcount(rawLatex)
	if subcount == "" {
		subcount = "Q" + strings.ReplaceAll(questionID, "-", "")
	}

	// Process TikZ pictures
	for i, match := range tikzMatches {
		if len(match) > 1 {
			tikzCode := match[1]
			imageType := "QUESTION" // Default, could be SOLUTION if in \loigiai
			if strings.Contains(rawLatex[:strings.Index(rawLatex, match[0])], "\\loigiai{") {
				imageType = "SOLUTION"
			}

			// Create job for TikZ processing
			job := &image_processing.Job{
				ID:         fmt.Sprintf("%s-tikz-%d", questionID, i),
				Type:       image_processing.JobTypeTikZ,
				Input:      tikzCode,
				OutputName: fmt.Sprintf("%s-%s-%d", subcount, imageType, i+1),
			}

			// Submit job to worker pool
			go m.submitImageJob(ctx, questionID, job, imageType)
		}
	}

	// Process includegraphics
	for i, match := range includeMatches {
		if len(match) > 1 {
			imagePath := match[1]
			imageType := "QUESTION"
			if strings.Contains(rawLatex[:strings.Index(rawLatex, match[0])], "\\loigiai{") {
				imageType = "SOLUTION"
			}

			// Create job for external image
			job := &image_processing.Job{
				ID:         fmt.Sprintf("%s-include-%d", questionID, i),
				Type:       image_processing.JobTypeIncludegraphics,
				Input:      imagePath,
				OutputName: fmt.Sprintf("%s-%s-ext-%d", subcount, imageType, i+1),
			}

			// Submit job to worker pool
			go m.submitImageJob(ctx, questionID, job, imageType)
		}
	}

	if len(tikzMatches) > 0 || len(includeMatches) > 0 {
		warnings = append(warnings, fmt.Sprintf("Found %d TikZ and %d external images, processing in background",
			len(tikzMatches), len(includeMatches)))
	}

	return warnings
}

// submitImageJob submits an image processing job and creates QuestionImage record
func (m *LegacyQuestionMgmt) submitImageJob(ctx context.Context, questionID string, job *image_processing.Job, imageType string) {
	// Create initial QuestionImage record with PENDING status
	questionImage := &entity.QuestionImage{
		ID:         pgtype.Text{String: uuid.New().String(), Status: pgtype.Present},
		QuestionID: pgtype.Text{String: questionID, Status: pgtype.Present},
		ImageType:  pgtype.Text{String: imageType, Status: pgtype.Present},
		Status:     pgtype.Text{String: "PENDING", Status: pgtype.Present},
	}

	if err := m.questionImageRepo.Create(ctx, questionImage); err != nil {
		m.logger.WithError(err).Error("Failed to create QuestionImage record")
		return
	}

	// Submit job to worker pool
	result, err := m.imageWorkerPool.SubmitJob(ctx, job)
	if err != nil {
		m.logger.WithError(err).Error("Failed to submit image processing job")
		// Update status to FAILED
		questionImage.Status = pgtype.Text{String: "FAILED", Status: pgtype.Present}
		m.questionImageRepo.Update(ctx, questionImage)
		return
	}

	if result.Error != nil {
		m.logger.WithError(result.Error).Error("Image processing failed")
		// Update status to FAILED
		questionImage.Status = pgtype.Text{String: "FAILED", Status: pgtype.Present}
		m.questionImageRepo.Update(ctx, questionImage)
		return
	}

	// Update QuestionImage with result
	questionImage.ImagePath = pgtype.Text{String: result.OutputPath, Status: pgtype.Present}
	questionImage.Status = pgtype.Text{String: "UPLOADED", Status: pgtype.Present}

	if err := m.questionImageRepo.Update(ctx, questionImage); err != nil {
		m.logger.WithError(err).Error("Failed to update QuestionImage record")
	}

	m.logger.WithFields(logrus.Fields{
		"question_id": questionID,
		"image_id":    questionImage.ID.String,
		"output_path": result.OutputPath,
	}).Info("Image processed successfully")
}

// extractSubcount extracts subcount from LaTeX content
func (m *LegacyQuestionMgmt) extractSubcount(rawLatex string) string {
	// Pattern: [XX.N] where XX are uppercase letters and N is a number
	subcountRegex := regexp.MustCompile(`\[([A-Z]{2}\.[0-9]+)\]`)
	matches := subcountRegex.FindStringSubmatch(rawLatex)
	if len(matches) > 1 {
		return matches[1]
	}
	return ""
}

// GetFilterStatistics gets statistics for filtered results
func (m *LegacyQuestionMgmt) GetFilterStatistics(ctx context.Context, filterQuery map[string]interface{}) (*FilterStatistics, error) {
	criteria := m.mapToFilterCriteria(filterQuery)

	stats, err := m.questionRepo.GetStatistics(ctx, criteria)
	if err != nil {
		return nil, err
	}

	return &FilterStatistics{
		TotalQuestions:         stats.TotalQuestions,
		TypeDistribution:       stats.TypeDistribution,
		DifficultyDistribution: stats.DifficultyDistribution,
		StatusDistribution:     stats.StatusDistribution,
		GradeDistribution:      stats.GradeDistribution,
		SubjectDistribution:    stats.SubjectDistribution,
		AverageUsageCount:      stats.AverageUsageCount,
		AverageFeedback:        stats.AverageFeedback,
	}, nil
}

// ImportQuestions imports questions from CSV
func (m *LegacyQuestionMgmt) ImportQuestions(ctx context.Context, req *ImportQuestionsRequest) (*ImportQuestionsResult, error) {
	// Decode base64 CSV data
	csvData, err := base64.StdEncoding.DecodeString(req.CsvDataBase64)
	if err != nil {
		return nil, fmt.Errorf("failed to decode CSV data: %v", err)
	}

	// Parse CSV
	reader := csv.NewReader(strings.NewReader(string(csvData)))
	records, err := reader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("failed to parse CSV: %v", err)
	}

	if len(records) < 2 {
		return nil, fmt.Errorf("CSV file must contain header and at least one data row")
	}

	result := &ImportQuestionsResult{
		TotalProcessed: 0,
		CreatedCount:   0,
		UpdatedCount:   0,
		ErrorCount:     0,
		Errors:         []ImportError{},
	}

	// Process each row (skip header)
	for i := 1; i < len(records); i++ {
		result.TotalProcessed++

		question, err := m.parseQuestionFromCSV(records[i], records[0])
		if err != nil {
			result.ErrorCount++
			result.Errors = append(result.Errors, ImportError{
				Row:     i + 1,
				Message: err.Error(),
				Value:   strings.Join(records[i], ","),
			})
			continue
		}

		// Check if question exists (for upsert mode)
		if req.UpsertMode && question.ID.Status == pgtype.Present {
			existing, err := m.questionRepo.GetByID(ctx, question.ID.String)
			if err == nil && existing != nil {
				// Update existing
				if err := m.questionRepo.Update(ctx, question); err != nil {
					result.ErrorCount++
					result.Errors = append(result.Errors, ImportError{
						Row:     i + 1,
						Message: fmt.Sprintf("failed to update: %v", err),
						Value:   strings.Join(records[i], ","),
					})
				} else {
					result.UpdatedCount++
				}
				continue
			}
		}

		// Create new question
		if err := m.CreateQuestion(ctx, question); err != nil {
			result.ErrorCount++
			result.Errors = append(result.Errors, ImportError{
				Row:     i + 1,
				Message: fmt.Sprintf("failed to create: %v", err),
				Value:   strings.Join(records[i], ","),
			})
		} else {
			result.CreatedCount++
		}
	}

	result.Summary = fmt.Sprintf(
		"Import completed: %d processed, %d created, %d updated, %d errors",
		result.TotalProcessed, result.CreatedCount, result.UpdatedCount, result.ErrorCount,
	)

	return result, nil
}

// parseQuestionFromCSV parses a question from CSV row
func (m *LegacyQuestionMgmt) parseQuestionFromCSV(row []string, header []string) (*entity.Question, error) {
	if len(row) != len(header) {
		return nil, fmt.Errorf("row has %d columns, expected %d", len(row), len(header))
	}

	question := &entity.Question{}

	// Map CSV columns to question fields
	for i, col := range header {
		value := strings.TrimSpace(row[i])
		if value == "" {
			continue
		}

		switch strings.ToLower(col) {
		case "id":
			question.ID.Set(value)
		case "raw_content", "rawcontent":
			question.RawContent.Set(value)
		case "content":
			question.Content.Set(value)
		case "type":
			question.Type.Set(value)
		case "question_code_id", "questioncodeid", "code":
			question.QuestionCodeID.Set(value)
		case "difficulty":
			question.Difficulty.Set(value)
		case "source":
			question.Source.Set(value)
		case "solution":
			question.Solution.Set(value)
		case "status":
			question.Status.Set(value)
		case "creator":
			question.Creator.Set(value)
		case "tags", "tag":
			tags := strings.Split(value, ";")
			tagElements := make([]pgtype.Text, len(tags))
			for j, tag := range tags {
				tagElements[j] = pgtype.Text{String: strings.TrimSpace(tag), Status: pgtype.Present}
			}
			question.Tag = pgtype.TextArray{
				Elements: tagElements,
				Status:   pgtype.Present,
			}
		}
	}

	// Validate required fields
	if question.Content.Status != pgtype.Present {
		return nil, fmt.Errorf("content is required")
	}
	if question.Type.Status != pgtype.Present {
		return nil, fmt.Errorf("type is required")
	}
	if question.QuestionCodeID.Status != pgtype.Present {
		return nil, fmt.Errorf("question_code_id is required")
	}

	return question, nil
}

// mapToFilterCriteria converts a map to FilterCriteria
func (m *LegacyQuestionMgmt) mapToFilterCriteria(filterQuery map[string]interface{}) *interfaces.FilterCriteria {
	if filterQuery == nil {
		return nil
	}

	criteria := &interfaces.FilterCriteria{}

	// Helper function to extract string slice
	getStringSlice := func(key string) []string {
		if val, ok := filterQuery[key]; ok {
			if slice, ok := val.([]string); ok {
				return slice
			}
			if slice, ok := val.([]interface{}); ok {
				result := make([]string, len(slice))
				for i, v := range slice {
					result[i] = fmt.Sprintf("%v", v)
				}
				return result
			}
		}
		return nil
	}

	// Map fields
	criteria.Grades = getStringSlice("grade")
	criteria.Subjects = getStringSlice("subject")
	criteria.Chapters = getStringSlice("chapter")
	criteria.Levels = getStringSlice("level")
	criteria.Lessons = getStringSlice("lesson")
	criteria.Forms = getStringSlice("form")
	criteria.Types = getStringSlice("type")
	criteria.Difficulties = getStringSlice("difficulty")
	criteria.Statuses = getStringSlice("status")
	criteria.Creators = getStringSlice("creator")
	criteria.Tags = getStringSlice("tags")
	criteria.QuestionCodeIDs = getStringSlice("question_code_id")

	// Boolean fields
	if val, ok := filterQuery["tag_match_all"]; ok {
		if b, ok := val.(bool); ok {
			criteria.TagMatchAll = b
		}
	}

	// Numeric ranges
	if val, ok := filterQuery["usage_count"]; ok {
		if rangeMap, ok := val.(map[string]int32); ok {
			criteria.MinUsageCount = rangeMap["min"]
			criteria.MaxUsageCount = rangeMap["max"]
		}
	}

	if val, ok := filterQuery["feedback"]; ok {
		if rangeMap, ok := val.(map[string]int32); ok {
			criteria.MinFeedback = rangeMap["min"]
			criteria.MaxFeedback = rangeMap["max"]
		}
	}

	// Date ranges
	if val, ok := filterQuery["created_at"]; ok {
		if rangeMap, ok := val.(map[string]string); ok {
			criteria.CreatedAfter = rangeMap["after"]
			criteria.CreatedBefore = rangeMap["before"]
		}
	}

	if val, ok := filterQuery["updated_at"]; ok {
		if rangeMap, ok := val.(map[string]string); ok {
			criteria.UpdatedAfter = rangeMap["after"]
			criteria.UpdatedBefore = rangeMap["before"]
		}
	}

	// Boolean filters
	if val, ok := filterQuery["has_solution"]; ok {
		if b, ok := val.(bool); ok {
			criteria.HasSolution = &b
		}
	}

	if val, ok := filterQuery["has_source"]; ok {
		if b, ok := val.(bool); ok {
			criteria.HasSource = &b
		}
	}

	return criteria
}

// Legacy types are now defined in interfaces.go
