package question_mgmt

import (
	"context"
	"encoding/base64"
	"encoding/csv"
	"fmt"
	"io"
	"strconv"
	"strings"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
)

// ImportQuestions handles the import questions operation following the payment system pattern
func (q *QuestionMgmt) ImportQuestions(ctx context.Context, req *ImportQuestionsRequest) (*ImportQuestionsResponse, error) {
	// Validate request
	if req.CsvDataBase64 == "" {
		return nil, fmt.Errorf("csv_data_base64 is required")
	}

	// Decode base64 CSV data
	csvData, err := base64.StdEncoding.DecodeString(req.CsvDataBase64)
	if err != nil {
		return nil, fmt.Errorf("failed to decode base64 CSV data: %w", err)
	}

	// Parse CSV
	reader := csv.NewReader(strings.NewReader(string(csvData)))
	reader.FieldsPerRecord = -1 // Allow variable number of fields

	// Read header
	header, err := reader.Read()
	if err != nil {
		return nil, fmt.Errorf("failed to read CSV header: %w", err)
	}

	// Validate header
	headerMap := make(map[string]int)
	for i, h := range header {
		headerMap[strings.ToLower(strings.TrimSpace(h))] = i
	}

	// Check required fields
	requiredFields := []string{"content", "type", "question_code_id"}
	for _, field := range requiredFields {
		if _, exists := headerMap[field]; !exists {
			return nil, fmt.Errorf("missing required field in CSV header: %s", field)
		}
	}

	// Process CSV rows
	return q.processCSVRows(ctx, reader, headerMap, req.UpsertMode)
}

// processCSVRows processes CSV rows and imports questions
func (q *QuestionMgmt) processCSVRows(ctx context.Context, reader *csv.Reader, headerMap map[string]int, upsertMode bool) (*ImportQuestionsResponse, error) {
	var (
		totalProcessed = int32(0)
		createdCount   = int32(0)
		updatedCount   = int32(0)
		errorCount     = int32(0)
		errors         []*ImportError
	)

	rowNumber := int32(1) // Start from 1 (header is row 0)

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			errorCount++
			errors = append(errors, &ImportError{
				RowNumber:    rowNumber,
				ErrorMessage: fmt.Sprintf("CSV parsing error: %v", err),
				RowData:      strings.Join(record, ","),
			})
			rowNumber++
			continue
		}

		totalProcessed++
		rowNumber++

		// Parse row data
		questionData, parseErr := q.parseCSVRow(record, headerMap)
		if parseErr != nil {
			errorCount++
			errors = append(errors, &ImportError{
				RowNumber:    rowNumber - 1,
				ErrorMessage: fmt.Sprintf("parsing error: %v", parseErr),
				RowData:      strings.Join(record, ","),
			})
			continue
		}

		// Process QuestionCode
		questionCodeResult, err := q.QuestionCodeService.ParseQuestionCodeFromImport(ctx, q.DB, questionData.QuestionCodeID)
		if err != nil || !questionCodeResult.Success {
			errorCount++
			errorMsg := fmt.Sprintf("QuestionCode error: %v", err)
			if questionCodeResult != nil && questionCodeResult.Error != "" {
				errorMsg = questionCodeResult.Error
			}
			errors = append(errors, &ImportError{
				RowNumber:    rowNumber - 1,
				ErrorMessage: errorMsg,
				RowData:      strings.Join(record, ","),
			})
			continue
		}

		// Create Question entity
		question, err := q.createQuestionEntity(questionData, questionCodeResult.QuestionCode)
		if err != nil {
			errorCount++
			errors = append(errors, &ImportError{
				RowNumber:    rowNumber - 1,
				ErrorMessage: fmt.Sprintf("question creation error: %v", err),
				RowData:      strings.Join(record, ","),
			})
			continue
		}

		// Check if question exists (for upsert mode)
		var isUpdate bool
		if upsertMode {
			// Try to find existing question by QuestionCode and content
			existingQuestions, err := q.QuestionService.GetByQuestionCode(ctx, q.DB, questionCodeResult.QuestionCode.Code.String)
			if err == nil {
				for _, existing := range existingQuestions {
					if existing.Content.String == question.Content.String {
						// Update existing question
						question.ID = existing.ID
						isUpdate = true
						break
					}
				}
			}
		}

		// Save question to database
		if isUpdate {
			if err := q.QuestionService.Update(ctx, q.DB, question); err != nil {
				errorCount++
				errors = append(errors, &ImportError{
					RowNumber:    rowNumber - 1,
					ErrorMessage: fmt.Sprintf("database update error: %v", err),
					RowData:      strings.Join(record, ","),
				})
				continue
			}
			updatedCount++
		} else {
			if err := q.QuestionService.Create(ctx, q.DB, question); err != nil {
				errorCount++
				errors = append(errors, &ImportError{
					RowNumber:    rowNumber - 1,
					ErrorMessage: fmt.Sprintf("database create error: %v", err),
					RowData:      strings.Join(record, ","),
				})
				continue
			}
			createdCount++
		}
	}

	// Generate summary
	summary := fmt.Sprintf("Import completed: %d processed, %d created, %d updated, %d errors",
		totalProcessed, createdCount, updatedCount, errorCount)

	return &ImportQuestionsResponse{
		TotalProcessed: totalProcessed,
		CreatedCount:   createdCount,
		UpdatedCount:   updatedCount,
		ErrorCount:     errorCount,
		Errors:         errors,
		Summary:        summary,
	}, nil
}

// parseCSVRow parses a CSV row into QuestionData
func (q *QuestionMgmt) parseCSVRow(record []string, headerMap map[string]int) (*QuestionData, error) {
	data := &QuestionData{}

	// Helper function to get field value safely
	getField := func(fieldName string) string {
		if idx, exists := headerMap[fieldName]; exists && idx < len(record) {
			return strings.TrimSpace(record[idx])
		}
		return ""
	}

	// Required fields
	data.Content = getField("content")
	if data.Content == "" {
		return nil, fmt.Errorf("content is required")
	}

	data.Type = getField("type")
	if data.Type == "" {
		return nil, fmt.Errorf("type is required")
	}

	data.QuestionCodeID = getField("question_code_id")
	if data.QuestionCodeID == "" {
		return nil, fmt.Errorf("question_code_id is required")
	}

	// Optional fields
	data.RawContent = getField("raw_content")
	if data.RawContent == "" {
		data.RawContent = data.Content // Default to content if raw_content is empty
	}

	data.Source = getField("source")
	data.Answers = getField("answers")
	data.CorrectAnswer = getField("correct_answer")
	data.Solution = getField("solution")
	data.Subcount = getField("subcount")

	// Parse tags (comma-separated)
	tagsStr := getField("tags")
	if tagsStr != "" {
		data.Tags = strings.Split(tagsStr, ",")
		for i, tag := range data.Tags {
			data.Tags[i] = strings.TrimSpace(tag)
		}
	}

	return data, nil
}

// createQuestionEntity creates a Question entity from parsed data
func (q *QuestionMgmt) createQuestionEntity(data *QuestionData, questionCode *entity.QuestionCode) (*entity.Question, error) {
	question := &entity.Question{}

	// Set required fields
	if err := question.Content.Set(data.Content); err != nil {
		return nil, fmt.Errorf("failed to set content: %w", err)
	}

	if err := question.RawContent.Set(data.RawContent); err != nil {
		return nil, fmt.Errorf("failed to set raw_content: %w", err)
	}

	if err := question.Type.Set(data.Type); err != nil {
		return nil, fmt.Errorf("failed to set type: %w", err)
	}

	// Set QuestionCode reference
	questionCodeID := questionCode.Code.String
	if err := question.QuestionCodeID.Set(questionCodeID); err != nil {
		return nil, fmt.Errorf("failed to set question_code_id: %w", err)
	}

	// Set optional fields
	if data.Source != "" {
		if err := question.Source.Set(data.Source); err != nil {
			return nil, fmt.Errorf("failed to set source: %w", err)
		}
	}

	if data.Answers != "" {
		if err := question.Answers.Set(data.Answers); err != nil {
			return nil, fmt.Errorf("failed to set answers: %w", err)
		}
	}

	if data.CorrectAnswer != "" {
		if err := question.CorrectAnswer.Set(data.CorrectAnswer); err != nil {
			return nil, fmt.Errorf("failed to set correct_answer: %w", err)
		}
	}

	if data.Solution != "" {
		if err := question.Solution.Set(data.Solution); err != nil {
			return nil, fmt.Errorf("failed to set solution: %w", err)
		}
	}

	if data.Subcount != "" {
		if subcountInt, err := strconv.Atoi(data.Subcount); err == nil {
			if err := question.Subcount.Set(int32(subcountInt)); err != nil {
				return nil, fmt.Errorf("failed to set subcount: %w", err)
			}
		}
	}

	return question, nil
}
