package bulk_import

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/latex"
	"exam-bank-system/apps/backend/internal/repository"
	"exam-bank-system/apps/backend/internal/service/system/parse_error"
	"exam-bank-system/apps/backend/internal/util"
)

// BulkImportMgmt manages bulk import operations with comprehensive error handling
type BulkImportMgmt struct {
	questionRepo     *repository.QuestionRepository
	questionCodeRepo *repository.QuestionCodeRepository
	bulkImportRepo   *repository.BulkImportErrorRepository
	parseErrorMgmt   *parse_error.ParseErrorMgmt
	logger           *logrus.Logger
}

// NewBulkImportMgmt creates a new bulk import management service
func NewBulkImportMgmt(
	questionRepo *repository.QuestionRepository,
	questionCodeRepo *repository.QuestionCodeRepository,
	bulkImportRepo *repository.BulkImportErrorRepository,
	parseErrorMgmt *parse_error.ParseErrorMgmt,
	logger *logrus.Logger,
) *BulkImportMgmt {
	return &BulkImportMgmt{
		questionRepo:     questionRepo,
		questionCodeRepo: questionCodeRepo,
		bulkImportRepo:   bulkImportRepo,
		parseErrorMgmt:   parseErrorMgmt,
		logger:           logger,
	}
}

// ImportLatexWithErrorHandling imports LaTeX content with comprehensive error handling
func (m *BulkImportMgmt) ImportLatexWithErrorHandling(ctx context.Context, latexContent string, options *entity.BulkImportOptions) (*entity.BulkImportResult, error) {
	startTime := time.Now()

	// Create import session
	session := &entity.BulkImportSession{
		ID:        util.StringToPgText(uuid.New().String()),
		Type:      util.StringToPgText("LATEX"),
		Status:    util.StringToPgText("PROCESSING"),
		StartTime: util.TimestamptzToPgType(startTime),
		Creator:   util.StringToPgText(options.Creator),
		FileName:  util.StringToPgText("latex_import.tex"),
		FileSize:  util.IntToPgInt8(int64(len(latexContent))),
	}

	// Serialize options to JSON
	optionsJSON, _ := json.Marshal(options)
	session.Options = util.StringToPgText(string(optionsJSON))

	err := m.bulkImportRepo.CreateImportSession(ctx, session)
	if err != nil {
		return nil, fmt.Errorf("failed to create import session: %w", err)
	}

	sessionID := util.PgTextToString(session.ID)
	result := &entity.BulkImportResult{
		ImportID:       sessionID,
		Success:        false,
		Errors:         []entity.BulkImportError{},
		Warnings:       []entity.BulkImportError{},
		ProcessingTime: 0,
		CanRetry:       true,
		PartialSuccess: false,
	}

	// Parse LaTeX content
	parser := latex.NewLaTeXQuestionParser()
	questions, questionCodes, _ := parser.ParseLatexContent(latexContent) // warnings not used in bulk import

	if len(questions) == 0 {
		// No questions found - create error
		importError := m.createBulkImportError(sessionID, 1, entity.BulkImportErrorTypeParseError,
			entity.BulkImportErrorSeverityError, "No valid questions found in LaTeX content",
			"", "Kiá»ƒm tra cÃº phÃ¡p LaTeX vÃ  Ä‘áº£m báº£o cÃ³ Ã­t nháº¥t má»™t cÃ¢u há»i há»£p lá»‡", latexContent, "", true)
		result.Errors = append(result.Errors, importError)
		m.saveBulkImportError(ctx, &importError)

		// Update session as failed
		session.Status = util.StringToPgText("FAILED")
		session.EndTime = util.TimestamptzToPgType(time.Now())
		session.ErrorRows = util.IntToPgInt4(1)
		m.bulkImportRepo.UpdateImportSession(ctx, session)

		result.ProcessingTime = time.Since(startTime)
		return result, nil
	}

	// Update session with total rows
	session.TotalRows = util.IntToPgInt4(int32(len(questions)))
	m.bulkImportRepo.UpdateImportSession(ctx, session)

	// Process each question
	successCount := int32(0)
	errorCount := int32(0)
	warningCount := int32(0)

	for i, question := range questions {
		rowNumber := int32(i + 1)
		session.ProcessedRows = util.IntToPgInt4(rowNumber)

		// Validate question
		validationErrors := m.validateQuestion(question, rowNumber)
		if len(validationErrors) > 0 {
			hasErrors := false
			for _, validationError := range validationErrors {
				if validationError.Severity == entity.BulkImportErrorSeverityError {
					hasErrors = true
					errorCount++
				} else {
					warningCount++
				}
				result.Errors = append(result.Errors, validationError)
				m.saveBulkImportError(ctx, &validationError)
			}

			if hasErrors {
				continue // Skip this question due to validation errors
			}
		}

		// Handle question code
		var questionCode *entity.QuestionCode
		if i < len(questionCodes) {
			questionCode = &questionCodes[i]
		}

		if questionCode != nil && !util.IsTextEmpty(questionCode.Code) {
			// Check for duplicates
			existing, err := m.questionCodeRepo.GetByCode(ctx, util.PgTextToString(questionCode.Code))
			if err == nil && existing != nil {
				if !options.UpsertMode {
					// Duplicate error
					duplicateError := m.createBulkImportError(sessionID, rowNumber, entity.BulkImportErrorTypeDuplicateError,
						entity.BulkImportErrorSeverityError, fmt.Sprintf("Question code %s already exists", util.PgTextToString(questionCode.Code)),
						"question_code", "Báº­t cháº¿ Ä‘á»™ upsert hoáº·c sá»­ dá»¥ng mÃ£ cÃ¢u há»i khÃ¡c", "", "", true)
					result.Errors = append(result.Errors, duplicateError)
					m.saveBulkImportError(ctx, &duplicateError)
					errorCount++
					continue
				}
			} else if options.AutoCreateCodes && questionCode == nil {
				// Auto-create question code logic would go here
			}
		}

		// Try to save question using parse error management
		parseResult, err := m.parseErrorMgmt.ParseWithErrorHandling(ctx, question.RawContent.String, options.Creator)
		if err != nil {
			// Database error
			dbError := m.createBulkImportError(sessionID, rowNumber, entity.BulkImportErrorTypeDatabaseError,
				entity.BulkImportErrorSeverityError, fmt.Sprintf("Failed to save question: %v", err),
				"", "Kiá»ƒm tra káº¿t ná»‘i database vÃ  thá»­ láº¡i", "", "", true)
			result.Errors = append(result.Errors, dbError)
			m.saveBulkImportError(ctx, &dbError)
			errorCount++
			continue
		}

		if parseResult.Success {
			successCount++
			// Add warnings if any
			for _, warning := range parseResult.Warnings {
				warningError := m.createBulkImportError(sessionID, rowNumber, entity.BulkImportErrorTypeParseError,
					entity.BulkImportErrorSeverityWarning, util.PgTextToString(warning.Message),
					util.PgTextToString(warning.Field), util.PgTextToString(warning.Suggestion), "", parseResult.Question.ID.String, true)
				result.Warnings = append(result.Warnings, warningError)
				m.saveBulkImportError(ctx, &warningError)
				warningCount++
			}
		} else {
			// Parse errors
			for _, parseError := range parseResult.Errors {
				importError := m.createBulkImportError(sessionID, rowNumber, entity.BulkImportErrorTypeParseError,
					entity.BulkImportErrorSeverityError, util.PgTextToString(parseError.Message),
					util.PgTextToString(parseError.Field), util.PgTextToString(parseError.Suggestion), "", "", true)
				result.Errors = append(result.Errors, importError)
				m.saveBulkImportError(ctx, &importError)
			}
			errorCount++
		}

		// Update session progress
		m.bulkImportRepo.UpdateImportSession(ctx, session)

		// Check if we should stop on first error
		if options.StopOnFirstError && errorCount > 0 {
			break
		}

		// Check max errors limit
		if options.MaxErrors > 0 && errorCount >= int32(options.MaxErrors) {
			break
		}
	}

	// Finalize session
	endTime := time.Now()
	session.EndTime = util.TimestamptzToPgType(endTime)
	session.SuccessRows = util.IntToPgInt4(successCount)
	session.ErrorRows = util.IntToPgInt4(errorCount)
	session.WarningRows = util.IntToPgInt4(warningCount)

	// Determine final status
	if errorCount == 0 && successCount > 0 {
		session.Status = util.StringToPgText("COMPLETED")
		result.Success = true
	} else if successCount > 0 && errorCount > 0 {
		session.Status = util.StringToPgText("PARTIAL")
		result.PartialSuccess = true
	} else {
		session.Status = util.StringToPgText("FAILED")
	}

	m.bulkImportRepo.UpdateImportSession(ctx, session)

	// Build result
	result.TotalProcessed = int32(len(questions))
	result.SuccessCount = successCount
	result.ErrorCount = errorCount
	result.WarningCount = warningCount
	result.ProcessingTime = endTime.Sub(startTime)
	result.Summary = fmt.Sprintf("Import completed: %d processed, %d success, %d errors, %d warnings",
		result.TotalProcessed, result.SuccessCount, result.ErrorCount, result.WarningCount)

	// Generate recovery actions
	result.RecoveryActions = m.generateRecoveryActions(result.Errors)

	// Generate detailed report
	result.DetailedReport = m.generateDetailedReport(result)

	return result, nil
}

// validateQuestion validates a question against business rules
func (m *BulkImportMgmt) validateQuestion(question entity.Question, rowNumber int32) []entity.BulkImportError {
	var errors []entity.BulkImportError
	sessionID := "" // Will be set by caller

	// Validate required fields
	if util.IsTextEmpty(question.Content) {
		errors = append(errors, m.createBulkImportError(sessionID, rowNumber, entity.BulkImportErrorTypeValidationError,
			entity.BulkImportErrorSeverityError, "Question content is required", "content",
			"Nháº­p ná»™i dung cÃ¢u há»i Ä‘áº§y Ä‘á»§", "", "", true))
	}

	// Validate content length
	content := util.PgTextToString(question.Content)
	if len(content) < 10 {
		errors = append(errors, m.createBulkImportError(sessionID, rowNumber, entity.BulkImportErrorTypeValidationError,
			entity.BulkImportErrorSeverityError, "Question content too short (minimum 10 characters)", "content",
			"Ná»™i dung cÃ¢u há»i pháº£i cÃ³ Ã­t nháº¥t 10 kÃ½ tá»±", "", "", true))
	}
	if len(content) > 5000 {
		errors = append(errors, m.createBulkImportError(sessionID, rowNumber, entity.BulkImportErrorTypeValidationError,
			entity.BulkImportErrorSeverityError, "Question content too long (maximum 5000 characters)", "content",
			"Ná»™i dung cÃ¢u há»i khÃ´ng Ä‘Æ°á»£c vÆ°á»£t quÃ¡ 5000 kÃ½ tá»±", "", "", true))
	}

	// Validate question type
	questionType := util.PgTextToString(question.Type)
	validTypes := []string{"MC", "TF", "SA", "ES", "MA"}
	isValidType := false
	for _, validType := range validTypes {
		if questionType == validType {
			isValidType = true
			break
		}
	}
	if !isValidType {
		errors = append(errors, m.createBulkImportError(sessionID, rowNumber, entity.BulkImportErrorTypeValidationError,
			entity.BulkImportErrorSeverityError, fmt.Sprintf("Invalid question type: %s", questionType), "type",
			"Chá»n loáº¡i cÃ¢u há»i há»£p lá»‡: MC, TF, SA, ES, hoáº·c MA", "", "", true))
	}

	return errors
}

// createBulkImportError creates a bulk import error entity
func (m *BulkImportMgmt) createBulkImportError(importID string, rowNumber int32, errorType entity.BulkImportErrorType,
	severity entity.BulkImportErrorSeverity, message, field, suggestion, rowData, questionID string, isRecoverable bool) entity.BulkImportError {
	return entity.BulkImportError{
		ID:            util.StringToPgText(uuid.New().String()),
		ImportID:      util.StringToPgText(importID),
		RowNumber:     util.IntToPgInt4(rowNumber),
		Type:          errorType,
		Severity:      severity,
		Message:       util.StringToPgText(message),
		Field:         util.StringToPgText(field),
		Suggestion:    util.StringToPgText(suggestion),
		Context:       util.StringToPgText("bulk_import"),
		RowData:       util.StringToPgText(rowData),
		QuestionID:    util.StringToPgText(questionID),
		IsRecoverable: util.BoolToPgBool(isRecoverable),
		CreatedAt:     util.TimestamptzToPgType(time.Now()),
	}
}

// saveBulkImportError saves a bulk import error to database
func (m *BulkImportMgmt) saveBulkImportError(ctx context.Context, importError *entity.BulkImportError) {
	err := m.bulkImportRepo.SaveBulkImportError(ctx, importError)
	if err != nil {
		m.logger.WithError(err).Error("Failed to save bulk import error")
	}
}

// generateRecoveryActions generates recovery actions based on errors
func (m *BulkImportMgmt) generateRecoveryActions(errors []entity.BulkImportError) []string {
	actions := entity.GetBulkImportRecoveryActions(errors)
	result := make([]string, len(actions))
	for i, action := range actions {
		result[i] = action.Action
	}
	return result
}

// generateDetailedReport generates a detailed import report
func (m *BulkImportMgmt) generateDetailedReport(result *entity.BulkImportResult) string {
	report := strings.Builder{}

	report.WriteString(fmt.Sprintf("=== BULK IMPORT REPORT ===\n"))
	report.WriteString(fmt.Sprintf("Import ID: %s\n", result.ImportID))
	report.WriteString(fmt.Sprintf("Processing Time: %v\n", result.ProcessingTime))
	report.WriteString(fmt.Sprintf("Total Processed: %d\n", result.TotalProcessed))
	report.WriteString(fmt.Sprintf("Success: %d\n", result.SuccessCount))
	report.WriteString(fmt.Sprintf("Errors: %d\n", result.ErrorCount))
	report.WriteString(fmt.Sprintf("Warnings: %d\n", result.WarningCount))

	if len(result.Errors) > 0 {
		report.WriteString("\n=== ERRORS ===\n")
		for _, err := range result.Errors {
			report.WriteString(fmt.Sprintf("Row %d: %s - %s\n",
				util.PgInt4ToInt32(err.RowNumber),
				util.PgTextToString(err.Message),
				util.PgTextToString(err.Suggestion)))
		}
	}

	if len(result.Warnings) > 0 {
		report.WriteString("\n=== WARNINGS ===\n")
		for _, warning := range result.Warnings {
			report.WriteString(fmt.Sprintf("Row %d: %s\n",
				util.PgInt4ToInt32(warning.RowNumber),
				util.PgTextToString(warning.Message)))
		}
	}

	if len(result.RecoveryActions) > 0 {
		report.WriteString("\n=== RECOVERY ACTIONS ===\n")
		for i, action := range result.RecoveryActions {
			report.WriteString(fmt.Sprintf("%d. %s\n", i+1, action))
		}
	}

	return report.String()
}

// ImportCSVWithErrorHandling imports CSV content with comprehensive error handling
func (m *BulkImportMgmt) ImportCSVWithErrorHandling(ctx context.Context, csvContent string, options *entity.BulkImportOptions) (*entity.BulkImportResult, error) {
	startTime := time.Now()

	// Create import session
	session := &entity.BulkImportSession{
		ID:        util.StringToPgText(uuid.New().String()),
		Type:      util.StringToPgText("CSV"),
		Status:    util.StringToPgText("PROCESSING"),
		StartTime: util.TimestamptzToPgType(startTime),
		Creator:   util.StringToPgText(options.Creator),
		FileName:  util.StringToPgText("csv_import.csv"),
		FileSize:  util.IntToPgInt8(int64(len(csvContent))),
	}

	// Serialize options to JSON
	optionsJSON, _ := json.Marshal(options)
	session.Options = util.StringToPgText(string(optionsJSON))

	err := m.bulkImportRepo.CreateImportSession(ctx, session)
	if err != nil {
		return nil, fmt.Errorf("failed to create import session: %w", err)
	}

	sessionID := util.PgTextToString(session.ID)
	result := &entity.BulkImportResult{
		ImportID:       sessionID,
		Success:        false,
		Errors:         []entity.BulkImportError{},
		Warnings:       []entity.BulkImportError{},
		ProcessingTime: 0,
		CanRetry:       true,
		PartialSuccess: false,
	}

	// Parse CSV
	reader := csv.NewReader(strings.NewReader(csvContent))
	records, err := reader.ReadAll()
	if err != nil {
		// CSV format error
		formatError := m.createBulkImportError(sessionID, 1, entity.BulkImportErrorTypeFormatError,
			entity.BulkImportErrorSeverityError, fmt.Sprintf("Failed to parse CSV: %v", err),
			"", "Kiá»ƒm tra Ä‘á»‹nh dáº¡ng CSV vÃ  encoding", csvContent, "", false)
		result.Errors = append(result.Errors, formatError)
		m.saveBulkImportError(ctx, &formatError)

		// Update session as failed
		session.Status = util.StringToPgText("FAILED")
		session.EndTime = util.TimestamptzToPgType(time.Now())
		session.ErrorRows = util.IntToPgInt4(1)
		m.bulkImportRepo.UpdateImportSession(ctx, session)

		result.ProcessingTime = time.Since(startTime)
		return result, nil
	}

	if len(records) < 2 {
		// No data rows
		formatError := m.createBulkImportError(sessionID, 1, entity.BulkImportErrorTypeFormatError,
			entity.BulkImportErrorSeverityError, "CSV file must contain header and at least one data row",
			"", "ThÃªm Ã­t nháº¥t má»™t dÃ²ng dá»¯ liá»‡u vÃ o file CSV", csvContent, "", false)
		result.Errors = append(result.Errors, formatError)
		m.saveBulkImportError(ctx, &formatError)

		// Update session as failed
		session.Status = util.StringToPgText("FAILED")
		session.EndTime = util.TimestamptzToPgType(time.Now())
		session.ErrorRows = util.IntToPgInt4(1)
		m.bulkImportRepo.UpdateImportSession(ctx, session)

		result.ProcessingTime = time.Since(startTime)
		return result, nil
	}

	// Update session with total rows (excluding header)
	dataRows := len(records) - 1
	session.TotalRows = util.IntToPgInt4(int32(dataRows))
	m.bulkImportRepo.UpdateImportSession(ctx, session)

	// Process each data row (skip header)
	header := records[0]
	successCount := int32(0)
	errorCount := int32(0)
	warningCount := int32(0)

	for i := 1; i < len(records); i++ {
		rowNumber := int32(i)
		session.ProcessedRows = util.IntToPgInt4(rowNumber)

		row := records[i]
		rowData := strings.Join(row, ",")

		// Validate row format
		if len(row) != len(header) {
			formatError := m.createBulkImportError(sessionID, rowNumber, entity.BulkImportErrorTypeFormatError,
				entity.BulkImportErrorSeverityError, fmt.Sprintf("Row has %d columns, expected %d", len(row), len(header)),
				"", "Äáº£m báº£o sá»‘ cá»™t trong má»—i dÃ²ng khá»›p vá»›i header", rowData, "", true)
			result.Errors = append(result.Errors, formatError)
			m.saveBulkImportError(ctx, &formatError)
			errorCount++
			continue
		}

		// Parse question from CSV row
		question, err := m.parseQuestionFromCSV(row, header, rowNumber)
		if err != nil {
			parseError := m.createBulkImportError(sessionID, rowNumber, entity.BulkImportErrorTypeParseError,
				entity.BulkImportErrorSeverityError, fmt.Sprintf("Failed to parse question: %v", err),
				"", "Kiá»ƒm tra Ä‘á»‹nh dáº¡ng dá»¯ liá»‡u trong dÃ²ng", rowData, "", true)
			result.Errors = append(result.Errors, parseError)
			m.saveBulkImportError(ctx, &parseError)
			errorCount++
			continue
		}

		// Validate question
		validationErrors := m.validateQuestion(*question, rowNumber)
		if len(validationErrors) > 0 {
			hasErrors := false
			for _, validationError := range validationErrors {
				// Update import ID for validation errors
				validationError.ImportID = util.StringToPgText(sessionID)
				validationError.RowData = util.StringToPgText(rowData)

				if validationError.Severity == entity.BulkImportErrorSeverityError {
					hasErrors = true
					errorCount++
				} else {
					warningCount++
				}
				result.Errors = append(result.Errors, validationError)
				m.saveBulkImportError(ctx, &validationError)
			}

			if hasErrors {
				continue // Skip this question due to validation errors
			}
		}

		// Check for duplicates if upsert mode is disabled
		if !options.UpsertMode && !util.IsTextEmpty(question.ID) {
			existing, err := m.questionRepo.GetByID(ctx, util.PgTextToString(question.ID))
			if err == nil && existing != nil {
				duplicateError := m.createBulkImportError(sessionID, rowNumber, entity.BulkImportErrorTypeDuplicateError,
					entity.BulkImportErrorSeverityError, fmt.Sprintf("Question ID %s already exists", util.PgTextToString(question.ID)),
					"id", "Báº­t cháº¿ Ä‘á»™ upsert hoáº·c sá»­ dá»¥ng ID khÃ¡c", rowData, "", true)
				result.Errors = append(result.Errors, duplicateError)
				m.saveBulkImportError(ctx, &duplicateError)
				errorCount++
				continue
			}
		}

		// Try to save question
		if options.UpsertMode && !util.IsTextEmpty(question.ID) {
			// Update existing question
			err = m.questionRepo.Update(ctx, question)
		} else {
			// Create new question
			err = m.questionRepo.Create(ctx, question)
		}

		if err != nil {
			// Database error
			dbError := m.createBulkImportError(sessionID, rowNumber, entity.BulkImportErrorTypeDatabaseError,
				entity.BulkImportErrorSeverityError, fmt.Sprintf("Failed to save question: %v", err),
				"", "Kiá»ƒm tra káº¿t ná»‘i database vÃ  thá»­ láº¡i", rowData, "", true)
			result.Errors = append(result.Errors, dbError)
			m.saveBulkImportError(ctx, &dbError)
			errorCount++
			continue
		}

		successCount++

		// Update session progress
		m.bulkImportRepo.UpdateImportSession(ctx, session)

		// Check if we should stop on first error
		if options.StopOnFirstError && errorCount > 0 {
			break
		}

		// Check max errors limit
		if options.MaxErrors > 0 && errorCount >= int32(options.MaxErrors) {
			break
		}
	}

	// Finalize session
	endTime := time.Now()
	session.EndTime = util.TimestamptzToPgType(endTime)
	session.SuccessRows = util.IntToPgInt4(successCount)
	session.ErrorRows = util.IntToPgInt4(errorCount)
	session.WarningRows = util.IntToPgInt4(warningCount)

	// Determine final status
	if errorCount == 0 && successCount > 0 {
		session.Status = util.StringToPgText("COMPLETED")
		result.Success = true
	} else if successCount > 0 && errorCount > 0 {
		session.Status = util.StringToPgText("PARTIAL")
		result.PartialSuccess = true
	} else {
		session.Status = util.StringToPgText("FAILED")
	}

	m.bulkImportRepo.UpdateImportSession(ctx, session)

	// Build result
	result.TotalProcessed = int32(dataRows)
	result.SuccessCount = successCount
	result.ErrorCount = errorCount
	result.WarningCount = warningCount
	result.ProcessingTime = endTime.Sub(startTime)
	result.Summary = fmt.Sprintf("CSV import completed: %d processed, %d success, %d errors, %d warnings",
		result.TotalProcessed, result.SuccessCount, result.ErrorCount, result.WarningCount)

	// Generate recovery actions
	result.RecoveryActions = m.generateRecoveryActions(result.Errors)

	// Generate detailed report
	result.DetailedReport = m.generateDetailedReport(result)

	return result, nil
}

// parseQuestionFromCSV parses a question from CSV row
func (m *BulkImportMgmt) parseQuestionFromCSV(row []string, header []string, rowNumber int32) (*entity.Question, error) {
	// Create a map for easier field access
	fieldMap := make(map[string]string)
	for i, field := range header {
		if i < len(row) {
			fieldMap[strings.ToLower(strings.TrimSpace(field))] = strings.TrimSpace(row[i])
		}
	}

	// Create question entity
	question := &entity.Question{
		ID:      util.StringToPgText(uuid.New().String()),
		Creator: util.StringToPgText("BULK_IMPORT"),
		Status:  util.StringToPgText(string(entity.QuestionStatusActive)),
	}

	// Map CSV fields to question fields
	if content, exists := fieldMap["content"]; exists {
		question.Content = util.StringToPgText(content)
	}
	if questionType, exists := fieldMap["type"]; exists {
		question.Type = util.StringToPgText(questionType)
	}
	if solution, exists := fieldMap["solution"]; exists {
		question.Solution = util.StringToPgText(solution)
	}
	if difficulty, exists := fieldMap["difficulty"]; exists {
		question.Difficulty = util.StringToPgText(difficulty)
	}

	// Validate required fields
	if util.IsTextEmpty(question.Content) {
		return nil, fmt.Errorf("content field is required")
	}
	if util.IsTextEmpty(question.Type) {
		return nil, fmt.Errorf("type field is required")
	}

	return question, nil
}

// GetImportSession retrieves an import session
func (m *BulkImportMgmt) GetImportSession(ctx context.Context, sessionID string) (*entity.BulkImportSession, error) {
	return m.bulkImportRepo.GetImportSession(ctx, sessionID)
}

// GetImportErrors retrieves errors for an import session
func (m *BulkImportMgmt) GetImportErrors(ctx context.Context, sessionID string) ([]entity.BulkImportError, error) {
	return m.bulkImportRepo.GetImportErrors(ctx, sessionID)
}

// GetImportStatistics retrieves comprehensive import statistics
func (m *BulkImportMgmt) GetImportStatistics(ctx context.Context) (*entity.BulkImportStatistics, error) {
	return m.bulkImportRepo.GetImportStatistics(ctx)
}

// RetryFailedImport retries a failed import with recoverable errors
func (m *BulkImportMgmt) RetryFailedImport(ctx context.Context, sessionID string, options *entity.BulkImportOptions) (*entity.BulkImportResult, error) {
	// Get original session
	session, err := m.bulkImportRepo.GetImportSession(ctx, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get import session: %w", err)
	}
	if session == nil {
		return nil, fmt.Errorf("import session not found")
	}

	// Get recoverable errors
	recoverableErrors, err := m.bulkImportRepo.GetRecoverableErrors(ctx, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get recoverable errors: %w", err)
	}

	if len(recoverableErrors) == 0 {
		return &entity.BulkImportResult{
			ImportID: sessionID,
			Success:  true,
			Summary:  "No recoverable errors found",
		}, nil
	}

	// For now, return information about recoverable errors
	// Full retry implementation would require storing original data
	result := &entity.BulkImportResult{
		ImportID:       sessionID,
		Success:        false,
		TotalProcessed: int32(len(recoverableErrors)),
		ErrorCount:     int32(len(recoverableErrors)),
		Errors:         recoverableErrors,
		Summary:        fmt.Sprintf("Found %d recoverable errors for retry", len(recoverableErrors)),
		CanRetry:       true,
	}

	return result, nil
}

// CleanupOldImportData removes old import data
func (m *BulkImportMgmt) CleanupOldImportData(ctx context.Context, olderThanDays int) error {
	cutoffTime := time.Now().AddDate(0, 0, -olderThanDays)
	return m.bulkImportRepo.CleanupOldImportData(ctx, cutoffTime)
}

