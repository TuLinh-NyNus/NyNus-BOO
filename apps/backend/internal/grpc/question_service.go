package grpc

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/latex"
	"exam-bank-system/apps/backend/internal/middleware"
	"exam-bank-system/apps/backend/internal/service/question"
	"exam-bank-system/apps/backend/internal/util"
	"exam-bank-system/apps/backend/pkg/proto/common"
	v1 "exam-bank-system/apps/backend/pkg/proto/v1"
	"github.com/google/uuid"
	"github.com/jackc/pgtype"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

// QuestionServiceServer implements the QuestionService gRPC server
type QuestionServiceServer struct {
	v1.UnimplementedQuestionServiceServer
	questionService *question.QuestionService
	versionService  *question.VersionService
}

// NewQuestionServiceServer creates a new QuestionServiceServer
func NewQuestionServiceServer(
	questionService *question.QuestionService,
	versionService *question.VersionService,
) *QuestionServiceServer {
	return &QuestionServiceServer{
		questionService: questionService,
		versionService:  versionService,
	}
}

// CreateQuestion creates a new question
func (s *QuestionServiceServer) CreateQuestion(ctx context.Context, req *v1.CreateQuestionRequest) (*v1.CreateQuestionResponse, error) {
	// Get user from context for authorization
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate required fields
	if req.GetContent() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "content is required")
	}
	if req.GetType() == common.QuestionType_QUESTION_TYPE_UNSPECIFIED {
		return nil, status.Errorf(codes.InvalidArgument, "question type is required")
	}
	if req.GetQuestionCodeId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "question_code_id is required")
	}

	// Convert protobuf request to entity.Question
	entityQuestion := &entity.Question{
		ID:         util.StringToPgText(uuid.New().String()),
		RawContent: util.StringToPgText(req.GetRawContent()),
		Content:    util.StringToPgText(req.GetContent()),
		Subcount:   util.StringToPgText(req.GetSubcount()),
		Type:       util.StringToPgText(convertProtoQuestionTypeToString(req.GetType())),
		Source:     util.StringToPgText(req.GetSource()),
		Solution:   util.StringToPgText(req.GetSolution()),
		Tag:        util.StringSliceToPgTextArray(req.GetTag()),

		// Optional classification fields
		Grade:   util.StringToPgText(req.GetGrade()),
		Subject: util.StringToPgText(req.GetSubject()),
		Chapter: util.StringToPgText(req.GetChapter()),
		Level:   util.StringToPgText(req.GetLevel()),

		// Usage tracking
		Creator:        util.StringToPgText(req.GetCreator()),
		Status:         util.StringToPgText(convertProtoQuestionStatusToString(req.GetStatus())),
		Difficulty:     util.StringToPgText(convertProtoDifficultyToString(req.GetDifficulty())),
		QuestionCodeID: util.StringToPgText(req.GetQuestionCodeId()),
	}

	// Convert answers (oneof field)
	entityQuestion.Answers = convertAnswersToJSONB(req)

	// Convert correct answer (oneof field)
	entityQuestion.CorrectAnswer = convertCorrectAnswerToJSONB(req)

	// Override creator with authenticated userID
	if userID != "" {
		entityQuestion.Creator = util.StringToPgText(userID)
	}

	// Create question through service layer
	err = s.questionService.CreateQuestion(ctx, entityQuestion)
	if err != nil {
		// Check for specific errors
		if strings.Contains(err.Error(), "does not exist") {
			return nil, status.Errorf(codes.InvalidArgument, err.Error())
		}
		return nil, status.Errorf(codes.Internal, "failed to create question: %v", err)
	}

	// Get created question to return with all fields populated
	createdQuestion, err := s.questionService.GetQuestionByID(ctx, entityQuestion.ID.String)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get created question: %v", err)
	}

	// Convert entity back to proto
	protoQuestion := convertQuestionToProto(&createdQuestion)

	return &v1.CreateQuestionResponse{
		Response: &common.Response{
			Success: true,
			Message: "Question created successfully",
		},
		Question: protoQuestion,
	}, nil
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
	question, err := s.questionService.GetQuestionByID(ctx, req.GetId())
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

// UpdateQuestion updates an existing question
func (s *QuestionServiceServer) UpdateQuestion(ctx context.Context, req *v1.UpdateQuestionRequest) (*v1.UpdateQuestionResponse, error) {
	// Get user from context for authorization
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate required fields
	if req.GetId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "question ID is required")
	}

	// Get existing question
	existingQuestion, err := s.questionService.GetQuestionByID(ctx, req.GetId())
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "question not found: %v", err)
	}

	// Convert protobuf request to entity.Question for update
	// Start with existing question and update fields from request
	updatedQuestion := &existingQuestion

	// Update content fields
	if req.GetRawContent() != "" {
		updatedQuestion.RawContent = util.StringToPgText(req.GetRawContent())
	}
	if req.GetContent() != "" {
		updatedQuestion.Content = util.StringToPgText(req.GetContent())
	}
	if req.GetSubcount() != "" {
		updatedQuestion.Subcount = util.StringToPgText(req.GetSubcount())
	}
	if req.GetType() != common.QuestionType_QUESTION_TYPE_UNSPECIFIED {
		updatedQuestion.Type = util.StringToPgText(convertProtoQuestionTypeToString(req.GetType()))
	}
	if req.GetSource() != "" {
		updatedQuestion.Source = util.StringToPgText(req.GetSource())
	}
	if req.GetSolution() != "" {
		updatedQuestion.Solution = util.StringToPgText(req.GetSolution())
	}

	// Update answers if provided
	if req.GetAnswerData() != nil {
		updatedQuestion.Answers = convertAnswersToJSONBForUpdate(req)
	}

	// Update correct answer if provided
	if req.GetCorrectAnswerData() != nil {
		updatedQuestion.CorrectAnswer = convertCorrectAnswerToJSONBForUpdate(req)
	}

	// Update tags if provided
	if len(req.GetTag()) > 0 {
		updatedQuestion.Tag = util.StringSliceToPgTextArray(req.GetTag())
	}

	// Update optional classification fields
	if req.GetGrade() != "" {
		updatedQuestion.Grade = util.StringToPgText(req.GetGrade())
	}
	if req.GetSubject() != "" {
		updatedQuestion.Subject = util.StringToPgText(req.GetSubject())
	}
	if req.GetChapter() != "" {
		updatedQuestion.Chapter = util.StringToPgText(req.GetChapter())
	}
	if req.GetLevel() != "" {
		updatedQuestion.Level = util.StringToPgText(req.GetLevel())
	}

	// Update question code if provided
	if req.GetQuestionCodeId() != "" {
		updatedQuestion.QuestionCodeID = util.StringToPgText(req.GetQuestionCodeId())
	}

	// Update status if provided
	if req.GetStatus() != common.QuestionStatus_QUESTION_STATUS_UNSPECIFIED {
		updatedQuestion.Status = util.StringToPgText(convertProtoQuestionStatusToString(req.GetStatus()))
	}

	// Update difficulty if provided
	if req.GetDifficulty() != common.DifficultyLevel_DIFFICULTY_LEVEL_UNSPECIFIED {
		updatedQuestion.Difficulty = util.StringToPgText(convertProtoDifficultyToString(req.GetDifficulty()))
	}

	// Note: Creator is not updated - preserve original creator
	_ = userID // userID is for audit trail, not for updating creator field

	// Update question through service layer
	err = s.questionService.UpdateQuestion(ctx, updatedQuestion)
	if err != nil {
		// Check for specific errors
		if strings.Contains(err.Error(), "not found") {
			return nil, status.Errorf(codes.NotFound, err.Error())
		}
		if strings.Contains(err.Error(), "does not exist") {
			return nil, status.Errorf(codes.InvalidArgument, err.Error())
		}
		return nil, status.Errorf(codes.Internal, "failed to update question: %v", err)
	}

	// Get updated question to return with all fields populated
	updatedQuestionEntity, err := s.questionService.GetQuestionByID(ctx, req.GetId())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get updated question: %v", err)
	}

	// Convert entity back to proto
	protoQuestion := convertQuestionToProto(&updatedQuestionEntity)

	return &v1.UpdateQuestionResponse{
		Response: &common.Response{
			Success: true,
			Message: "Question updated successfully",
		},
		Question: protoQuestion,
	}, nil
}

// DeleteQuestion deletes a question
func (s *QuestionServiceServer) DeleteQuestion(ctx context.Context, req *v1.DeleteQuestionRequest) (*v1.DeleteQuestionResponse, error) {
	// Get user from context for authorization
	_, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "question ID is required")
	}

	// Delete question through service layer
	err = s.questionService.DeleteQuestion(ctx, req.GetId())
	if err != nil {
		// Check for specific errors
		if strings.Contains(err.Error(), "not found") {
			return nil, status.Errorf(codes.NotFound, err.Error())
		}
		return nil, status.Errorf(codes.Internal, "failed to delete question: %v", err)
	}

	return &v1.DeleteQuestionResponse{
		Response: &common.Response{
			Success: true,
			Message: "Question deleted successfully",
		},
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

	// Call QuestionService to get questions list with paging
	total, questions, err := s.questionService.GetQuestionsByPaging(offset, int(limit))
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

	// Call QuestionService to import questions
	result, err := s.questionService.ImportQuestions(ctx, serviceReq)
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
	var createdAt *timestamppb.Timestamp
	if question.CreatedAt.Status == pgtype.Present {
		ts := timestamppb.New(question.CreatedAt.Time)
		if ts.IsValid() {
			createdAt = ts
		}
	}

	var updatedAt *timestamppb.Timestamp
	if question.UpdatedAt.Status == pgtype.Present {
		ts := timestamppb.New(question.UpdatedAt.Time)
		if ts.IsValid() {
			updatedAt = ts
		}
	}

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
		IsFavorite:     question.IsFavorite.Bool,
		QuestionCodeId: util.PgTextToString(question.QuestionCodeID),
		CreatedAt:      createdAt,
		UpdatedAt:      updatedAt,
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
			existingCode, _ := s.questionService.GetQuestionCodeByID(ctx, code)
			if existingCode == nil {
				// Create new question code (parsedCode is already entity.QuestionCode)
				newCode := &parsedCode
				err := s.questionService.CreateQuestionCode(ctx, newCode)
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
			existingCode, err := s.questionService.GetQuestionCodeByID(ctx, questionCodeID)
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
		err := s.questionService.CreateQuestion(ctx, entityQuestion)
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
			createdCode, err := s.questionService.GetQuestionCodeByID(ctx, code)
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
			existingCode, _ := s.questionService.GetQuestionCodeByID(ctx, code)
			if existingCode == nil {
				// Create new question code
				err := s.questionService.CreateQuestionCode(ctx, questionCode)
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
			existingCode, err := s.questionService.GetQuestionCodeByID(ctx, questionCodeID)
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
				existingQuestions, _, err := s.questionService.SearchQuestions(ctx, &question.SearchOptions{
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

					err = s.questionService.UpdateQuestion(ctx, existingQuestion)
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
		err = s.questionService.CreateQuestion(ctx, entityQuestion)
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

// ToggleFavorite toggles the favorite status of a question
func (s *QuestionServiceServer) ToggleFavorite(ctx context.Context, req *v1.ToggleFavoriteRequest) (*v1.ToggleFavoriteResponse, error) {
	// Validate request
	if req.GetQuestionId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "question_id is required")
	}

	// Toggle favorite status
	err := s.questionService.ToggleFavorite(ctx, req.GetQuestionId(), req.GetIsFavorite())
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			return nil, status.Errorf(codes.NotFound, err.Error())
		}
		return nil, status.Errorf(codes.Internal, "failed to toggle favorite: %v", err)
	}

	return &v1.ToggleFavoriteResponse{
		Success:    true,
		IsFavorite: req.GetIsFavorite(),
		Response: &common.Response{
			Success: true,
			Message: fmt.Sprintf("Question favorite status updated to %v", req.GetIsFavorite()),
		},
	}, nil
}

// ListFavoriteQuestions lists all favorite questions with pagination
func (s *QuestionServiceServer) ListFavoriteQuestions(ctx context.Context, req *v1.ListFavoriteQuestionsRequest) (*v1.ListFavoriteQuestionsResponse, error) {
	// Get pagination parameters
	page := req.GetPagination().GetPage()
	pageSize := req.GetPagination().GetLimit()

	// Set defaults
	if pageSize == 0 {
		pageSize = 20
	}
	if page == 0 {
		page = 1
	}

	// Calculate offset
	offset := int((page - 1) * pageSize)
	limit := int(pageSize)

	// Get favorite questions
	questions, total, err := s.questionService.GetFavoriteQuestions(ctx, offset, limit)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get favorite questions: %v", err)
	}

	// Convert to proto
	protoQuestions := make([]*v1.Question, len(questions))
	for i, q := range questions {
		protoQuestions[i] = convertQuestionToProto(q)
	}

	// Calculate pagination info
	totalPages := int32((total + limit - 1) / limit)

	return &v1.ListFavoriteQuestionsResponse{
		Response: &common.Response{
			Success: true,
			Message: fmt.Sprintf("Retrieved %d favorite questions", len(questions)),
		},
		Questions: protoQuestions,
		Pagination: &common.PaginationResponse{
			Page:       page,
			Limit:      pageSize,
			TotalCount: int32(total),
			TotalPages: totalPages,
		},
	}, nil
}

// Helper functions for converting protobuf enums to strings

// convertProtoQuestionTypeToString converts protobuf QuestionType to string
func convertProtoQuestionTypeToString(t common.QuestionType) string {
	switch t {
	case common.QuestionType_QUESTION_TYPE_MULTIPLE_CHOICE:
		return "MC"
	case common.QuestionType_QUESTION_TYPE_TRUE_FALSE:
		return "TF"
	case common.QuestionType_QUESTION_TYPE_SHORT_ANSWER:
		return "SA"
	case common.QuestionType_QUESTION_TYPE_ESSAY:
		return "ES"
	case common.QuestionType_QUESTION_TYPE_MATCHING:
		return "MA"
	default:
		return "MC" // Default to MC if unspecified
	}
}

// convertProtoQuestionStatusToString converts protobuf QuestionStatus to string
func convertProtoQuestionStatusToString(s common.QuestionStatus) string {
	switch s {
	case common.QuestionStatus_QUESTION_STATUS_ACTIVE:
		return "ACTIVE"
	case common.QuestionStatus_QUESTION_STATUS_PENDING:
		return "PENDING"
	case common.QuestionStatus_QUESTION_STATUS_INACTIVE:
		return "INACTIVE"
	case common.QuestionStatus_QUESTION_STATUS_ARCHIVED:
		return "ARCHIVED"
	default:
		return "PENDING" // Default to PENDING if unspecified
	}
}

// convertProtoDifficultyToString converts protobuf DifficultyLevel to string
func convertProtoDifficultyToString(d common.DifficultyLevel) string {
	switch d {
	case common.DifficultyLevel_DIFFICULTY_LEVEL_EASY:
		return "EASY"
	case common.DifficultyLevel_DIFFICULTY_LEVEL_MEDIUM:
		return "MEDIUM"
	case common.DifficultyLevel_DIFFICULTY_LEVEL_HARD:
		return "HARD"
	case common.DifficultyLevel_DIFFICULTY_LEVEL_EXPERT:
		return "EXPERT"
	default:
		return "MEDIUM" // Default to MEDIUM if unspecified
	}
}

// convertAnswersToJSONB converts protobuf answer data to pgtype.JSONB
func convertAnswersToJSONB(req *v1.CreateQuestionRequest) pgtype.JSONB {
	switch answerData := req.GetAnswerData().(type) {
	case *v1.CreateQuestionRequest_StructuredAnswers:
		// Convert AnswerList to JSON bytes
		if answerData.StructuredAnswers != nil {
			jsonBytes, err := json.Marshal(answerData.StructuredAnswers)
			if err != nil {
				return pgtype.JSONB{Status: pgtype.Null}
			}
			return util.BytesToPgJSONB(jsonBytes)
		}
		return pgtype.JSONB{Status: pgtype.Null}

	case *v1.CreateQuestionRequest_JsonAnswers:
		// Use JSON string directly
		if answerData.JsonAnswers != "" {
			return util.BytesToPgJSONB([]byte(answerData.JsonAnswers))
		}
		return pgtype.JSONB{Status: pgtype.Null}

	default:
		return pgtype.JSONB{Status: pgtype.Null}
	}
}

// convertCorrectAnswerToJSONB converts protobuf correct answer data to pgtype.JSONB
func convertCorrectAnswerToJSONB(req *v1.CreateQuestionRequest) pgtype.JSONB {
	switch correctData := req.GetCorrectAnswerData().(type) {
	case *v1.CreateQuestionRequest_StructuredCorrect:
		// Convert CorrectAnswer to JSON bytes
		if correctData.StructuredCorrect != nil {
			jsonBytes, err := json.Marshal(correctData.StructuredCorrect)
			if err != nil {
				return pgtype.JSONB{Status: pgtype.Null}
			}
			return util.BytesToPgJSONB(jsonBytes)
		}
		return pgtype.JSONB{Status: pgtype.Null}

	case *v1.CreateQuestionRequest_JsonCorrectAnswer:
		// Use JSON string directly
		if correctData.JsonCorrectAnswer != "" {
			return util.BytesToPgJSONB([]byte(correctData.JsonCorrectAnswer))
		}
		return pgtype.JSONB{Status: pgtype.Null}

	default:
		return pgtype.JSONB{Status: pgtype.Null}
	}
}

// convertAnswersToJSONBForUpdate converts protobuf answer data to pgtype.JSONB for UpdateQuestionRequest
func convertAnswersToJSONBForUpdate(req *v1.UpdateQuestionRequest) pgtype.JSONB {
	switch answerData := req.GetAnswerData().(type) {
	case *v1.UpdateQuestionRequest_StructuredAnswers:
		// Convert AnswerList to JSON bytes
		if answerData.StructuredAnswers != nil {
			jsonBytes, err := json.Marshal(answerData.StructuredAnswers)
			if err != nil {
				return pgtype.JSONB{Status: pgtype.Null}
			}
			return util.BytesToPgJSONB(jsonBytes)
		}
		return pgtype.JSONB{Status: pgtype.Null}

	case *v1.UpdateQuestionRequest_JsonAnswers:
		// Use JSON string directly
		if answerData.JsonAnswers != "" {
			return util.BytesToPgJSONB([]byte(answerData.JsonAnswers))
		}
		return pgtype.JSONB{Status: pgtype.Null}

	default:
		return pgtype.JSONB{Status: pgtype.Null}
	}
}

// convertCorrectAnswerToJSONBForUpdate converts protobuf correct answer data to pgtype.JSONB for UpdateQuestionRequest
func convertCorrectAnswerToJSONBForUpdate(req *v1.UpdateQuestionRequest) pgtype.JSONB {
	switch correctData := req.GetCorrectAnswerData().(type) {
	case *v1.UpdateQuestionRequest_StructuredCorrect:
		// Convert CorrectAnswer to JSON bytes
		if correctData.StructuredCorrect != nil {
			jsonBytes, err := json.Marshal(correctData.StructuredCorrect)
			if err != nil {
				return pgtype.JSONB{Status: pgtype.Null}
			}
			return util.BytesToPgJSONB(jsonBytes)
		}
		return pgtype.JSONB{Status: pgtype.Null}

	case *v1.UpdateQuestionRequest_JsonCorrectAnswer:
		// Use JSON string directly
		if correctData.JsonCorrectAnswer != "" {
			return util.BytesToPgJSONB([]byte(correctData.JsonCorrectAnswer))
		}
		return pgtype.JSONB{Status: pgtype.Null}

	default:
		return pgtype.JSONB{Status: pgtype.Null}
	}
}
