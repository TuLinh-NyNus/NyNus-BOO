package question_mgmt

import (
	"context"
	"encoding/base64"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"strconv"
	"strings"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/jackc/pgtype"
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

	// Check required fields - updated for formatted CSV with snake_case headers
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

		// Handle QuestionTags if provided
		if questionData.QuestionTags != "" {
			tagNames := strings.Split(questionData.QuestionTags, ";")
			for i, tag := range tagNames {
				tagNames[i] = strings.TrimSpace(tag)
			}

			// Create QuestionTag repository and save tags
			questionTagRepo := &repository.QuestionTagRepository{}
			if err := questionTagRepo.CreateMultiple(ctx, q.DB, question.ID.String, tagNames); err != nil {
				// Log error but don't fail the import for tag issues
				fmt.Printf("Warning: Failed to create tags for question %s: %v\n", question.ID.String, err)
			}
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

// parseCSVRow parses a CSV row into QuestionData - updated for comprehensive CSV format
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

	// All other fields from formatted CSV - using snake_case field names
	data.ID = getField("id")
	data.RawContent = getField("raw_content")
	if data.RawContent == "" {
		data.RawContent = data.Content // Default to content if raw_content is empty
	}

	data.Subcount = getField("subcount")
	data.Source = getField("source")
	data.Answers = getField("answers")
	data.CorrectAnswer = getField("correct_answer")
	data.Solution = getField("solution")
	data.UsageCount = getField("usage_count")
	data.Creator = getField("creator")
	data.Status = getField("status")
	data.Feedback = getField("feedback")
	data.Difficulty = getField("difficulty")
	data.CreatedAt = getField("created_at")
	data.UpdatedAt = getField("updated_at")
	data.GeneratedTags = getField("generated_tags")
	data.Code = getField("code")
	data.Format = getField("format")
	data.Grade = getField("grade")
	data.Subject = getField("subject")
	data.Chapter = getField("chapter")
	data.Lesson = getField("lesson")
	data.Level = getField("level")
	data.Form = getField("form")
	data.QuestionTags = getField("question_tags")
	data.TagCount = getField("tag_count")

	// Parse tag array field (comma-separated)
	tagsStr := getField("tag")
	if tagsStr != "" {
		data.Tag = strings.Split(tagsStr, ",")
		for i, tag := range data.Tag {
			data.Tag[i] = strings.TrimSpace(tag)
		}
	}

	return data, nil
}

// createQuestionEntity creates a Question entity from parsed data - updated for comprehensive CSV
func (q *QuestionMgmt) createQuestionEntity(data *QuestionData, questionCode *entity.QuestionCode) (*entity.Question, error) {
	// Create Question entity with proper initialization
	question := &entity.Question{}

	// Initialize all pgtype fields to avoid "status undefined" errors
	question.ID.Status = pgtype.Null
	question.RawContent.Status = pgtype.Null
	question.Content.Status = pgtype.Null
	question.Subcount.Status = pgtype.Null
	question.Type.Status = pgtype.Null
	question.Source.Status = pgtype.Null
	question.Answers.Status = pgtype.Null
	question.CorrectAnswer.Status = pgtype.Null
	question.Solution.Status = pgtype.Null
	question.Tag.Status = pgtype.Null
	question.UsageCount.Status = pgtype.Null
	question.Creator.Status = pgtype.Null
	question.Status.Status = pgtype.Null
	question.Feedback.Status = pgtype.Null
	question.Difficulty.Status = pgtype.Null
	question.CreatedAt.Status = pgtype.Null
	question.UpdatedAt.Status = pgtype.Null
	question.QuestionCodeID.Status = pgtype.Null

	// Set ID if provided, otherwise generate
	if data.ID != "" {
		if err := question.ID.Set(data.ID); err != nil {
			return nil, fmt.Errorf("failed to set id: %w", err)
		}
	}

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

	// Set all other fields from CSV
	if data.Subcount != "" {
		if err := question.Subcount.Set(data.Subcount); err != nil {
			return nil, fmt.Errorf("failed to set subcount: %w", err)
		}
	} else {
		// Set NULL for empty subcount
		question.Subcount.Status = pgtype.Null
	}

	if data.Source != "" {
		if err := question.Source.Set(data.Source); err != nil {
			return nil, fmt.Errorf("failed to set source: %w", err)
		}
	}

	// Convert answers and correctAnswer strings to JSONB arrays
	if data.Answers != "" {
		// Split semicolon-separated string into array
		answers := strings.Split(data.Answers, ";")
		for i, answer := range answers {
			answers[i] = strings.TrimSpace(answer)
		}
		answersJSON, err := json.Marshal(answers)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal answers: %w", err)
		}
		if err := question.Answers.Set(answersJSON); err != nil {
			return nil, fmt.Errorf("failed to set answers: %w", err)
		}
	}

	if data.CorrectAnswer != "" {
		// Split semicolon-separated string into array
		correctAnswers := strings.Split(data.CorrectAnswer, ";")
		for i, answer := range correctAnswers {
			correctAnswers[i] = strings.TrimSpace(answer)
		}
		correctAnswersJSON, err := json.Marshal(correctAnswers)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal correct_answer: %w", err)
		}
		if err := question.CorrectAnswer.Set(correctAnswersJSON); err != nil {
			return nil, fmt.Errorf("failed to set correct_answer: %w", err)
		}
	}

	if data.Solution != "" {
		if err := question.Solution.Set(data.Solution); err != nil {
			return nil, fmt.Errorf("failed to set solution: %w", err)
		}
	}

	// Set tag array
	if len(data.Tag) > 0 {
		if err := question.Tag.Set(data.Tag); err != nil {
			return nil, fmt.Errorf("failed to set tag: %w", err)
		}
	}

	// Set numeric fields
	if data.UsageCount != "" {
		if usageCountInt, err := strconv.Atoi(data.UsageCount); err == nil {
			if err := question.UsageCount.Set(int32(usageCountInt)); err != nil {
				return nil, fmt.Errorf("failed to set usage_count: %w", err)
			}
		}
	}

	if data.Feedback != "" {
		if feedbackInt, err := strconv.Atoi(data.Feedback); err == nil {
			if err := question.Feedback.Set(int32(feedbackInt)); err != nil {
				return nil, fmt.Errorf("failed to set feedback: %w", err)
			}
		}
	}

	// Set string fields
	if data.Creator != "" {
		if err := question.Creator.Set(data.Creator); err != nil {
			return nil, fmt.Errorf("failed to set creator: %w", err)
		}
	}

	if data.Status != "" {
		if err := question.Status.Set(data.Status); err != nil {
			return nil, fmt.Errorf("failed to set status: %w", err)
		}
	}

	if data.Difficulty != "" {
		if err := question.Difficulty.Set(data.Difficulty); err != nil {
			return nil, fmt.Errorf("failed to set difficulty: %w", err)
		}
	}

	return question, nil
}
