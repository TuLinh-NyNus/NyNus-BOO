package grpc

import (
	"context"

	"exam-bank-system/apps/backend/internal/middleware"
	"exam-bank-system/apps/backend/internal/service/question"
	v1 "exam-bank-system/apps/backend/pkg/proto/v1"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// QuestionFilterServiceServer implements the QuestionFilterService gRPC server
type QuestionFilterServiceServer struct {
	v1.UnimplementedQuestionFilterServiceServer
	questionFilterService *question.QuestionFilterService
}

// NewQuestionFilterServiceServer creates a new QuestionFilterServiceServer
func NewQuestionFilterServiceServer(questionFilterService *question.QuestionFilterService) *QuestionFilterServiceServer {
	return &QuestionFilterServiceServer{
		questionFilterService: questionFilterService,
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

	// TODO: Add validation
	// if err := s.validator.ValidateListQuestionsByFilterRequest(req); err != nil {
	//     return nil, status.Errorf(codes.InvalidArgument, "invalid request: %v", err)
	// }

	// Call question filter management layer
	response, err := s.questionFilterService.ListQuestionsByFilter(ctx, req)
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

	// TODO: Add validation
	// if err := s.validator.ValidateSearchQuestionsRequest(req); err != nil {
	//     return nil, status.Errorf(codes.InvalidArgument, "invalid request: %v", err)
	// }

	// Call question filter management layer
	response, err := s.questionFilterService.SearchQuestions(ctx, req)
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

	// TODO: Add validation
	// if err := s.validator.ValidateGetQuestionsByQuestionCodeRequest(req); err != nil {
	//     return nil, status.Errorf(codes.InvalidArgument, "invalid request: %v", err)
	// }

	// Call question filter management layer
	response, err := s.questionFilterService.GetQuestionsByQuestionCode(ctx, req)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get questions by QuestionCode: %v", err)
	}

	return response, nil
}

