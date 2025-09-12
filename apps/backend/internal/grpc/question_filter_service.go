package grpc

import (
	"context"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/middleware"
	question_filter_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/question_filter"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/validation"
	v1 "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/v1"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// QuestionFilterServiceServer implements the QuestionFilterService gRPC interface
type QuestionFilterServiceServer struct {
	v1.UnimplementedQuestionFilterServiceServer
	questionFilterMgmt *question_filter_mgmt.QuestionFilterMgmt
	validator          *validation.QuestionFilterValidator
}

// NewQuestionFilterServiceServer creates a new QuestionFilterServiceServer
func NewQuestionFilterServiceServer(questionFilterMgmt *question_filter_mgmt.QuestionFilterMgmt) *QuestionFilterServiceServer {
	return &QuestionFilterServiceServer{
		questionFilterMgmt: questionFilterMgmt,
		validator:          validation.NewQuestionFilterValidator(),
	}
}

// ========================================
// QUESTION FILTER ENDPOINTS
// ========================================

// ListQuestionsByFilter lists questions with comprehensive filtering
func (s *QuestionFilterServiceServer) ListQuestionsByFilter(ctx context.Context, req *v1.ListQuestionsByFilterRequest) (*v1.ListQuestionsByFilterResponse, error) {
	// Get user from context for authorization
	_, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if err := s.validator.ValidateListQuestionsByFilterRequest(req); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "validation failed: %v", err)
	}

	// Call question filter management layer
	response, err := s.questionFilterMgmt.ListQuestionsByFilter(ctx, req)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to filter questions: %v", err)
	}

	return response, nil
}

// SearchQuestions performs full-text search with filters
func (s *QuestionFilterServiceServer) SearchQuestions(ctx context.Context, req *v1.SearchQuestionsRequest) (*v1.SearchQuestionsResponse, error) {
	// Get user from context for authorization
	_, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if err := s.validator.ValidateSearchQuestionsRequest(req); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "validation failed: %v", err)
	}

	// Call question filter management layer
	response, err := s.questionFilterMgmt.SearchQuestions(ctx, req)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to search questions: %v", err)
	}

	return response, nil
}

// GetQuestionsByQuestionCode gets questions by QuestionCode components
func (s *QuestionFilterServiceServer) GetQuestionsByQuestionCode(ctx context.Context, req *v1.GetQuestionsByQuestionCodeRequest) (*v1.GetQuestionsByQuestionCodeResponse, error) {
	// Get user from context for authorization
	_, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if err := s.validator.ValidateGetQuestionsByQuestionCodeRequest(req); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "validation failed: %v", err)
	}

	// Call question filter management layer
	response, err := s.questionFilterMgmt.GetQuestionsByQuestionCode(ctx, req)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get questions by QuestionCode: %v", err)
	}

	return response, nil
}
