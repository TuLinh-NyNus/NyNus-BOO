package grpc

import (
	"context"
	"fmt"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/middleware"
	question_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/question"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/common"
	v1 "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/v1"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// QuestionServiceServer implements the QuestionService gRPC interface
type QuestionServiceServer struct {
	v1.UnimplementedQuestionServiceServer
	questionMgmt *question_mgmt.QuestionMgmt
}

// NewQuestionServiceServer creates a new question service server
func NewQuestionServiceServer(questionMgmt *question_mgmt.QuestionMgmt) *QuestionServiceServer {
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

	// Validate request
	if req.GetCsvDataBase64() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "csv_data_base64 is required")
	}

	// Convert proto request to service request
	serviceReq := &question_mgmt.ImportQuestionsRequest{
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
		Id:          util.PgTextToString(question.ID),
		Text:        util.PgTextToString(question.Content),
		Type:        common.QuestionType_QUESTION_TYPE_MULTIPLE_CHOICE, // Default, should be mapped properly
		Difficulty:  common.DifficultyLevel_DIFFICULTY_LEVEL_MEDIUM,    // Default, should be mapped properly
		Explanation: util.PgTextToString(question.Solution),
		CreatedAt:   question.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   question.UpdatedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
	}
}
