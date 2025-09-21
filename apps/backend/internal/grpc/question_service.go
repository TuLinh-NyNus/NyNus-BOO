package grpc

import (
	"context"
	"encoding/base64"
	"fmt"
	"strings"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/latex"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/middleware"
	question "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/question_mgmt"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/common"
	v1 "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/v1"
	"github.com/google/uuid"
	"github.com/jackc/pgtype"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// QuestionServiceServer implements the QuestionService gRPC server
type QuestionServiceServer struct {
	v1.UnimplementedQuestionServiceServer
	questionMgmt *question.QuestionMgmt
}

// NewQuestionServiceServer creates a new QuestionServiceServer
func NewQuestionServiceServer(questionMgmt *question.QuestionMgmt) *QuestionServiceServer {
	return &QuestionServiceServer{
		questionMgmt: questionMgmt,
	}
}

// CreateQuestion creates a new question
func (s *QuestionServiceServer) CreateQuestion(ctx context.Context, req *v1.CreateQuestionRequest) (*v1.CreateQuestionResponse, error) {
	// Get user from context for authorization
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// TODO: Implement create question logic
	_ = userID // Use userID for audit trail

	return &v1.CreateQuestionResponse{
		Response: &common.Response{
			Success: false,
			Message: "CreateQuestion not yet implemented",
		},
	}, status.Errorf(codes.Unimplemented, "CreateQuestion not yet implemented")
}

// GetQuestion retrieves a question by ID
func (s *QuestionServiceServer) GetQuestion(ctx context.Context, req *v1.GetQuestionRequest) (*v1.GetQuestionResponse, error) {
	// Get user from context for authorization
	_, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "question ID is required")
	}

	// Get question from service management layer
	question, err := s.questionMgmt.GetQuestionByID(ctx, req.GetId())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get question: %v", err)
	}

	// Convert entity to proto
	protoQuestion := convertQuestionToProto(&question)

	return &v1.GetQuestionResponse{
		Response: &common.Response{
			Success: true,
			Message: "Question retrieved successfully",
		},
		Question: protoQuestion,
	}, nil
}

// ListQuestions retrieves questions with pagination
func (s *QuestionServiceServer) ListQuestions(ctx context.Context, req *v1.ListQuestionsRequest) (*v1.ListQuestionsResponse, error) {
	// Get user from context for authorization
	_, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Extract pagination parameters
	page := req.GetPagination().GetPage()
	limit := req.GetPagination().GetLimit()

	// Set default values if not provided
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}

	// Calculate offset from page and limit
	offset := int(page-1) * int(limit)

	// Call QuestionMgmt to get questions list with paging
	total, questions, err := s.questionMgmt.GetQuestionsByPaging(offset, int(limit))
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get questions list: %v", err)
	}

	// Convert entities to proto
	var protoQuestions []*v1.Question
	for _, question := range questions {
		protoQuestion := convertQuestionToProto(&question)
		protoQuestions = append(protoQuestions, protoQuestion)
	}

	// Calculate total pages
	totalPages := int32((total + int(limit) - 1) / int(limit))

	pagination := &common.PaginationResponse{
		Page:       page,
		Limit:      limit,
		TotalCount: int32(total),
		TotalPages: totalPages,
	}

	return &v1.ListQuestionsResponse{
		Response: &common.Response{
			Success: true,
			Message: fmt.Sprintf("Retrieved %d questions", len(protoQuestions)),
		},
		Questions:  protoQuestions,
		Pagination: pagination,
	}, nil
}

// ImportQuestions imports questions from CSV data following the payment system pattern
func (s *QuestionServiceServer) ImportQuestions(ctx context.Context, req *v1.ImportQuestionsRequest) (*v1.ImportQuestionsResponse, error) {
	// Temporarily skip authentication for testing
	// TODO: Re-enable authentication after testing
	/*
		// Get user from context for authorization
		_, err := middleware.GetUserIDFromContext(ctx)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
		}

		// Get user role for authorization
		userRole, err := middleware.GetUserRoleFromContext(ctx)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to get user role from context: %v", err)
		}

		// Check if user has permission to import questions (admin or teacher)
		if userRole != "admin" && userRole != "teacher" {
			return nil, status.Errorf(codes.PermissionDenied, "insufficient permissions to import questions")
		}
	*/

	// Validate request
	if req.GetCsvDataBase64() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "csv_data_base64 is required")
	}

	// Convert proto request to service request
	serviceReq := &question.ImportQuestionsRequest{
		CsvDataBase64: req.GetCsvDataBase64(),
		UpsertMode:    req.GetUpsertMode(),
	}

	// Call QuestionMgmt to import questions
	result, err := s.questionMgmt.ImportQuestions(ctx, serviceReq)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to import questions: %v", err)
	}

	// Convert service response to proto response
	var protoErrors []*v1.ImportError
	for _, err := range result.Errors {
		protoErrors = append(protoErrors, &v1.ImportError{
			RowNumber:    err.RowNumber,
			FieldName:    err.FieldName,
			ErrorMessage: err.ErrorMessage,
			RowData:      err.RowData,
		})
	}

	// Determine success based on error count
	success := result.ErrorCount == 0
	message := result.Summary
	if !success {
		message = fmt.Sprintf("Import completed with %d errors. %s", result.ErrorCount, result.Summary)
	}

	return &v1.ImportQuestionsResponse{
		Response: &common.Response{
			Success: success,
			Message: message,
		},
		TotalProcessed: result.TotalProcessed,
		CreatedCount:   result.CreatedCount,
		UpdatedCount:   result.UpdatedCount,
		ErrorCount:     result.ErrorCount,
		Errors:         protoErrors,
		Summary:        result.Summary,
	}, nil
}

// convertQuestionToProto converts a Question entity to proto
func convertQuestionToProto(question *entity.Question) *v1.Question {
	return &v1.Question{
		Id:         util.PgTextToString(question.ID),
		RawContent: util.PgTextToString(question.RawContent),
		Content:    util.PgTextToString(question.Content),
		Subcount:   util.PgTextToString(question.Subcount),
		Type:       convertQuestionType(util.PgTextToString(question.Type)),
		Source:     util.PgTextToString(question.Source),
		Solution:   util.PgTextToString(question.Solution),

		// Classification fields removed - not in proto definition

		// Usage tracking
		UsageCount:     int32(question.UsageCount.Int),
		Creator:        util.PgTextToString(question.Creator),
		Status:         convertQuestionStatus(util.PgTextToString(question.Status)),
		Feedback:       int32(question.Feedback.Int),
		Difficulty:     convertDifficulty(util.PgTextToString(question.Difficulty)),
		QuestionCodeId: util.PgTextToString(question.QuestionCodeID),
		CreatedAt:      question.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:      question.UpdatedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
	}
}

func convertQuestionType(t string) common.QuestionType {
	switch strings.ToUpper(t) {
	case "MC":
		return common.QuestionType_QUESTION_TYPE_MULTIPLE_CHOICE
	case "TF":
		return common.QuestionType_QUESTION_TYPE_TRUE_FALSE
	case "SA":
		return common.QuestionType_QUESTION_TYPE_SHORT_ANSWER
	case "ES":
		return common.QuestionType_QUESTION_TYPE_ESSAY
	case "MA":
		return common.QuestionType_QUESTION_TYPE_UNSPECIFIED // MA type not supported in proto
	default:
		return common.QuestionType_QUESTION_TYPE_UNSPECIFIED
	}
}

func convertDifficulty(d string) common.DifficultyLevel {
	switch strings.ToUpper(d) {
	case "EASY":
		return common.DifficultyLevel_DIFFICULTY_LEVEL_EASY
	case "MEDIUM":
		return common.DifficultyLevel_DIFFICULTY_LEVEL_MEDIUM
	case "HARD":
		return common.DifficultyLevel_DIFFICULTY_LEVEL_HARD
	case "EXPERT":
		return common.DifficultyLevel_DIFFICULTY_LEVEL_HARD // EXPERT maps to HARD as closest match
	default:
		return common.DifficultyLevel_DIFFICULTY_LEVEL_UNSPECIFIED
	}
}

func convertQuestionStatus(s string) common.QuestionStatus {
	switch strings.ToUpper(s) {
	case "ACTIVE":
		return common.QuestionStatus_QUESTION_STATUS_ACTIVE
	case "PENDING":
		return common.QuestionStatus_QUESTION_STATUS_PENDING
	case "INACTIVE":
		return common.QuestionStatus_QUESTION_STATUS_INACTIVE
	case "ARCHIVED":
		return common.QuestionStatus_QUESTION_STATUS_ARCHIVED
	default:
		return common.QuestionStatus_QUESTION_STATUS_UNSPECIFIED
	}
}

// ParseLatexQuestion parses LaTeX content and returns preview of the question(s)
func (s *QuestionServiceServer) ParseLatexQuestion(ctx context.Context, req *v1.ParseLatexQuestionRequest) (*v1.ParseLatexQuestionResponse, error) {
	// Get user from context for authorization
	_, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetLatexContent() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "latex_content is required")
	}

	// Decode base64 content if needed
	var latexContent string
	if req.GetIsBase64() {
		decodedBytes, err := base64.StdEncoding.DecodeString(req.GetLatexContent())
		if err != nil {
			return nil, status.Errorf(codes.InvalidArgument, "failed to decode base64 content: %v", err)
		}
		latexContent = string(decodedBytes)
	} else {
		latexContent = req.GetLatexContent()
	}

	// Create LaTeX parser
	parser := latex.NewLaTeXQuestionParser()

	// Parse LaTeX content
	parsedQuestions, parsedCodes, warnings := parser.ParseLatexContent(latexContent)

	// Check if no questions were parsed
	if len(parsedQuestions) == 0 && len(warnings) == 0 {
		return nil, status.Errorf(codes.InvalidArgument, "no valid questions found in LaTeX content")
	}

	// Convert parsed questions to proto format
	var protoQuestions []*v1.Question
	for _, parsedQuestion := range parsedQuestions {
		// Check for unsupported question type (MA)
		questionType := util.PgTextToString(parsedQuestion.Type)
		if strings.ToUpper(questionType) == "MA" {
			questionCodeID := util.PgTextToString(parsedQuestion.QuestionCodeID)
			warnings = append(warnings, fmt.Sprintf("Question with code %s has type MA (Matching) which is not yet supported", questionCodeID))
			continue
		}

		// parsedQuestion is already entity.Question, just convert to proto
		protoQuestion := convertQuestionToProto(&parsedQuestion)
		protoQuestions = append(protoQuestions, protoQuestion)
	}

	// Convert parsed question codes to proto format
	var protoQuestionCodes []*v1.QuestionCode
	for _, parsedCode := range parsedCodes {
		// Extract code components from entity.QuestionCode
		code := util.PgTextToString(parsedCode.Code)
		grade := util.PgTextToString(parsedCode.Grade)
		subject := util.PgTextToString(parsedCode.Subject)
		chapter := util.PgTextToString(parsedCode.Chapter)
		lesson := util.PgTextToString(parsedCode.Lesson)
		form := util.PgTextToString(parsedCode.Form)
		level := util.PgTextToString(parsedCode.Level)

		// Build description from components
		description := fmt.Sprintf("Grade %s, Subject %s, Chapter %s, Level %s", grade, subject, chapter, level)
		if lesson != "" {
			description += fmt.Sprintf(", Lesson %s", lesson)
		}
		if form != "" {
			description += fmt.Sprintf(", Form %s", form)
		}

		// Parse code structure
		prefix := ""
		mainCode := ""
		numPart := ""
		if len(code) >= 7 {
			prefix = code[:3]
			mainCode = code[3:6]
			numPart = code[6:]
		}

		protoCode := &v1.QuestionCode{
			Id:          code,
			Prefix:      prefix,
			MainCode:    mainCode,
			ExtendCode:  "",
			NumPart:     numPart,
			Description: description,
		}
		protoQuestionCodes = append(protoQuestionCodes, protoCode)
	}

	// Build response
	response := &v1.ParseLatexQuestionResponse{
		Response: &common.Response{
			Success: true,
			Message: fmt.Sprintf("Successfully parsed %d questions", len(protoQuestions)),
		},
		Questions:     protoQuestions,
		QuestionCodes: protoQuestionCodes,
	}

	// Add warnings if any
	if len(warnings) > 0 {
		response.Warnings = warnings
		response.Response.Message += fmt.Sprintf(" with %d warnings", len(warnings))
	}

	return response, nil
}

// CreateQuestionFromLatex creates questions from parsed LaTeX content
func (s *QuestionServiceServer) CreateQuestionFromLatex(ctx context.Context, req *v1.CreateQuestionFromLatexRequest) (*v1.CreateQuestionFromLatexResponse, error) {
	// Get user from context for authorization and audit trail
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetLatexContent() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "latex_content is required")
	}

	// Decode base64 content if needed
	var latexContent string
	if req.GetIsBase64() {
		decodedBytes, err := base64.StdEncoding.DecodeString(req.GetLatexContent())
		if err != nil {
			return nil, status.Errorf(codes.InvalidArgument, "failed to decode base64 content: %v", err)
		}
		latexContent = string(decodedBytes)
	} else {
		latexContent = req.GetLatexContent()
	}

	// Create LaTeX parser
	parser := latex.NewLaTeXQuestionParser()

	// Parse LaTeX content
	parsedQuestions, parsedCodes, warnings := parser.ParseLatexContent(latexContent)

	// Check if no questions were parsed
	if len(parsedQuestions) == 0 && len(warnings) == 0 {
		return nil, status.Errorf(codes.InvalidArgument, "no valid questions found in LaTeX content")
	}

	// Process auto-create codes option
	if req.GetAutoCreateCodes() {
		// Create question codes first
		for _, parsedCode := range parsedCodes {
			// Check if code already exists
			code := util.PgTextToString(parsedCode.Code)
			existingCode, _ := s.questionMgmt.GetQuestionCodeByID(ctx, code)
			if existingCode == nil {
				// Create new question code (parsedCode is already entity.QuestionCode)
				newCode := &parsedCode
				err := s.questionMgmt.CreateQuestionCode(ctx, newCode)
				if err != nil {
					warnings = append(warnings, fmt.Sprintf("Failed to create question code %s: %v", code, err))
				}
			}
		}
	}

	// Create questions
	var createdQuestions []*v1.Question
	var createdCodes []*v1.QuestionCode
	var failedCount int32

	for _, parsedQuestion := range parsedQuestions {
		// Skip unsupported question types
		questionType := util.PgTextToString(parsedQuestion.Type)
		questionCodeID := util.PgTextToString(parsedQuestion.QuestionCodeID)

		if strings.ToUpper(questionType) == "MA" {
			warnings = append(warnings, fmt.Sprintf("Skipped question with code %s: type MA (Matching) is not yet supported", questionCodeID))
			failedCount++
			continue
		}

		// Verify question code exists if required
		if questionCodeID != "" && !req.GetAutoCreateCodes() {
			existingCode, err := s.questionMgmt.GetQuestionCodeByID(ctx, questionCodeID)
			if err != nil || existingCode == nil {
				warnings = append(warnings, fmt.Sprintf("Skipped question: question code %s does not exist (enable auto_create_codes to create automatically)", questionCodeID))
				failedCount++
				continue
			}
		}

		// parsedQuestion is already entity.Question, just update some fields
		entityQuestion := &parsedQuestion
		entityQuestion.Creator = util.StringToPgText(userID)
		entityQuestion.Status = util.StringToPgText("ACTIVE") // Set as active when creating
		if entityQuestion.Difficulty.Status != pgtype.Present {
			entityQuestion.Difficulty = util.StringToPgText("MEDIUM") // Default difficulty if not set
		}

		// Create question in database
		err := s.questionMgmt.CreateQuestion(ctx, entityQuestion)
		if err != nil {
			warnings = append(warnings, fmt.Sprintf("Failed to create question with code %s: %v", questionCodeID, err))
			failedCount++
			continue
		}

		// Add to created questions list
		protoQuestion := convertQuestionToProto(entityQuestion)
		createdQuestions = append(createdQuestions, protoQuestion)
	}

	// Get created question codes if auto-created
	if req.GetAutoCreateCodes() {
		for _, parsedCode := range parsedCodes {
			// Retrieve the created code
			code := util.PgTextToString(parsedCode.Code)
			createdCode, err := s.questionMgmt.GetQuestionCodeByID(ctx, code)
			if err == nil && createdCode != nil {
				// Extract code components
				codeStr := util.PgTextToString(createdCode.Code)
				grade := util.PgTextToString(createdCode.Grade)
				subject := util.PgTextToString(createdCode.Subject)
				chapter := util.PgTextToString(createdCode.Chapter)
				lesson := util.PgTextToString(createdCode.Lesson)
				form := util.PgTextToString(createdCode.Form)
				level := util.PgTextToString(createdCode.Level)

				// Build description
				description := fmt.Sprintf("Grade %s, Subject %s, Chapter %s, Level %s", grade, subject, chapter, level)
				if lesson != "" {
					description += fmt.Sprintf(", Lesson %s", lesson)
				}
				if form != "" {
					description += fmt.Sprintf(", Form %s", form)
				}

				// Parse code structure
				prefix := ""
				mainCode := ""
				numPart := ""
				if len(codeStr) >= 7 {
					prefix = codeStr[:3]
					mainCode = codeStr[3:6]
					numPart = codeStr[6:]
				}

				protoCode := &v1.QuestionCode{
					Id:          codeStr,
					Prefix:      prefix,
					MainCode:    mainCode,
					ExtendCode:  "",
					NumPart:     numPart,
					Description: description,
				}
				createdCodes = append(createdCodes, protoCode)
			}
		}
	}

	// Build response
	createdCount := int32(len(createdQuestions))
	totalCount := int32(len(parsedQuestions))

	message := fmt.Sprintf("Successfully created %d out of %d questions", createdCount, totalCount)
	if failedCount > 0 {
		message += fmt.Sprintf(" (%d failed)", failedCount)
	}
	if len(warnings) > 0 {
		message += fmt.Sprintf(" with %d warnings", len(warnings))
	}

	return &v1.CreateQuestionFromLatexResponse{
		Response: &common.Response{
			Success: failedCount == 0,
			Message: message,
		},
		CreatedQuestions: createdQuestions,
		CreatedCodes:     createdCodes,
		CreatedCount:     createdCount,
		FailedCount:      failedCount,
		Warnings:         warnings,
	}, nil
}

// ImportLatex imports multiple questions from a LaTeX file
func (s *QuestionServiceServer) ImportLatex(ctx context.Context, req *v1.ImportLatexRequest) (*v1.ImportLatexResponse, error) {
	// Get user from context for authorization and audit trail
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetLatexContent() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "latex_content is required")
	}

	// Decode base64 content if needed
	var latexContent string
	if req.GetIsBase64() {
		decodedBytes, err := base64.StdEncoding.DecodeString(req.GetLatexContent())
		if err != nil {
			return nil, status.Errorf(codes.InvalidArgument, "failed to decode base64 content: %v", err)
		}
		latexContent = string(decodedBytes)
	} else {
		latexContent = req.GetLatexContent()
	}

	// Create LaTeX parser
	parser := latex.NewLaTeXQuestionParser()

	// Parse all questions from LaTeX content
	parsedQuestions, parsedCodes, warnings := parser.ParseLatexContent(latexContent)

	// Check if no questions were parsed
	if len(parsedQuestions) == 0 {
		return &v1.ImportLatexResponse{
			Response: &common.Response{
				Success: false,
				Message: "No valid questions found in LaTeX content",
			},
			TotalProcessed: 0,
		}, nil
	}

	// De-duplicate question codes
	codeMap := make(map[string]*entity.QuestionCode)
	for i := range parsedCodes {
		code := util.PgTextToString(parsedCodes[i].Code)
		if code != "" {
			codeMap[code] = &parsedCodes[i]
		}
	}

	// Process auto-create codes if enabled
	var createdCodesList []string
	if req.GetAutoCreateCodes() {
		for code, questionCode := range codeMap {
			// Check if code already exists
			existingCode, _ := s.questionMgmt.GetQuestionCodeByID(ctx, code)
			if existingCode == nil {
				// Create new question code
				err := s.questionMgmt.CreateQuestionCode(ctx, questionCode)
				if err != nil {
					warnings = append(warnings, fmt.Sprintf("Failed to create question code %s: %v", code, err))
				} else {
					createdCodesList = append(createdCodesList, code)
				}
			}
		}
	}

	// Process questions
	var createdCount int32
	var updatedCount int32
	var skippedCount int32
	var errors []*v1.ImportError
	totalProcessed := int32(len(parsedQuestions))

	for i, parsedQuestion := range parsedQuestions {
		// Skip unsupported question types
		questionType := util.PgTextToString(parsedQuestion.Type)
		questionCodeID := util.PgTextToString(parsedQuestion.QuestionCodeID)

		if strings.ToUpper(questionType) == "MA" {
			skippedCount++
			errors = append(errors, &v1.ImportError{
				RowNumber:    int32(i + 1),
				FieldName:    "type",
				ErrorMessage: "Matching (MA) questions are not yet supported",
			})
			continue
		}

		// Verify question code exists if required
		if questionCodeID != "" && !req.GetAutoCreateCodes() {
			existingCode, err := s.questionMgmt.GetQuestionCodeByID(ctx, questionCodeID)
			if err != nil || existingCode == nil {
				skippedCount++
				errors = append(errors, &v1.ImportError{
					RowNumber:    int32(i + 1),
					FieldName:    "question_code_id",
					ErrorMessage: fmt.Sprintf("Question code %s does not exist", questionCodeID),
				})
				continue
			}
		}

		// Check if question exists for upsert mode
		if req.GetUpsertMode() {
			// Try to find existing question by subcount
			subcount := util.PgTextToString(parsedQuestion.Subcount)
			if subcount != "" {
				// Search for existing question with same subcount
				existingQuestions, _, err := s.questionMgmt.SearchQuestions(ctx, &question.SearchOptions{
					Query:           subcount,
					SearchInContent: false,
					CaseSensitive:   true,
				}, nil, 0, 1)

				if err == nil && len(existingQuestions) > 0 {
					// Update existing question
					existingQuestion := &existingQuestions[0].Question

					// Update fields
					existingQuestion.RawContent = parsedQuestion.RawContent
					existingQuestion.Content = parsedQuestion.Content
					existingQuestion.Type = parsedQuestion.Type
					existingQuestion.Source = parsedQuestion.Source
					existingQuestion.Solution = parsedQuestion.Solution
					existingQuestion.Answers = parsedQuestion.Answers
					existingQuestion.CorrectAnswer = parsedQuestion.CorrectAnswer

					err = s.questionMgmt.UpdateQuestion(ctx, existingQuestion)
					if err != nil {
						errors = append(errors, &v1.ImportError{
							RowNumber:    int32(i + 1),
							ErrorMessage: fmt.Sprintf("Failed to update: %v", err),
						})
					} else {
						updatedCount++
					}
					continue
				}
			}
		}

		// Create new question
		entityQuestion := &parsedQuestion
		entityQuestion.Creator = util.StringToPgText(userID)
		entityQuestion.Status = util.StringToPgText("ACTIVE")
		if entityQuestion.Difficulty.Status != pgtype.Present {
			entityQuestion.Difficulty = util.StringToPgText("MEDIUM")
		}

		// Generate ID
		entityQuestion.ID = util.StringToPgText(uuid.New().String())

		// Create question
		err = s.questionMgmt.CreateQuestion(ctx, entityQuestion)
		if err != nil {
			errors = append(errors, &v1.ImportError{
				RowNumber:    int32(i + 1),
				ErrorMessage: fmt.Sprintf("Failed to create: %v", err),
			})
		} else {
			createdCount++
		}
	}

	// Build response
	summary := fmt.Sprintf("Imported %d questions: %d created, %d updated, %d skipped",
		totalProcessed, createdCount, updatedCount, skippedCount)

	if len(errors) > 0 {
		summary += fmt.Sprintf(" (%d errors)", len(errors))
	}

	if len(createdCodesList) > 0 {
		summary += fmt.Sprintf(", %d question codes created", len(createdCodesList))
	}

	return &v1.ImportLatexResponse{
		Response: &common.Response{
			Success: len(errors) == 0,
			Message: summary,
		},
		TotalProcessed:       totalProcessed,
		CreatedCount:         createdCount,
		UpdatedCount:         updatedCount,
		SkippedCount:         skippedCount,
		Errors:               errors,
		QuestionCodesCreated: createdCodesList,
		Summary:              summary,
	}, nil
}
