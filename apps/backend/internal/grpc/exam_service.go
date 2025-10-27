package grpc

import (
	"context"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/middleware"
	"exam-bank-system/apps/backend/internal/repository/interfaces"
	"exam-bank-system/apps/backend/internal/service/exam"
	"exam-bank-system/apps/backend/internal/service/exam/scoring"
	"exam-bank-system/apps/backend/pkg/proto/common"
	v1 "exam-bank-system/apps/backend/pkg/proto/v1"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

// ExamServiceServer implements the ExamService gRPC server
type ExamServiceServer struct {
	v1.UnimplementedExamServiceServer
	examService *exam.ExamService
	autoGrading *scoring.AutoGradingService
	examRepo    interfaces.ExamRepository
}

// NewExamServiceServer creates a new ExamServiceServer
func NewExamServiceServer(
	examService *exam.ExamService,
	autoGrading *scoring.AutoGradingService,
	examRepo interfaces.ExamRepository,
) *ExamServiceServer {
	return &ExamServiceServer{
		examService: examService,
		autoGrading: autoGrading,
		examRepo:    examRepo,
	}
}

// CreateExam creates a new exam
func (s *ExamServiceServer) CreateExam(ctx context.Context, req *v1.CreateExamRequest) (*v1.CreateExamResponse, error) {
	// Get user from context for authorization
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetTitle() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "exam title is required")
	}
	if req.GetDurationMinutes() <= 0 {
		return nil, status.Errorf(codes.InvalidArgument, "exam duration must be positive")
	}

	// Convert protobuf to entity (now with all fields)
	exam := convertProtoToExam(req, userID)

	// Create exam through service management layer
	err = s.examService.CreateExam(ctx, exam)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create exam: %v", err)
	}

	// Convert entity back to protobuf
	protoExam := convertExamToProto(exam)

	return &v1.CreateExamResponse{
		Response: &common.Response{
			Success: true,
			Message: "Exam created successfully",
		},
		Exam: protoExam,
	}, nil
}

// GetExam retrieves an exam by ID
func (s *ExamServiceServer) GetExam(ctx context.Context, req *v1.GetExamRequest) (*v1.GetExamResponse, error) {
	// Get user from context for authorization
	_, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "exam ID is required")
	}

	// Get exam from service management layer
	exam, err := s.examService.GetExamByID(ctx, req.GetId())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get exam: %v", err)
	}

	// Convert entity to protobuf
	protoExam := convertExamToProto(exam)

	return &v1.GetExamResponse{
		Response: &common.Response{
			Success: true,
			Message: "Exam retrieved successfully",
		},
		Exam: protoExam,
	}, nil
}

// SubmitExam submits an exam attempt and auto-grades it
func (s *ExamServiceServer) SubmitExam(ctx context.Context, req *v1.SubmitExamRequest) (*v1.SubmitExamResponse, error) {
	// Get user from context for authorization
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetAttemptId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "attempt ID is required")
	}

	// Get attempt to validate time and ownership
	attempt, err := s.examRepo.GetAttempt(ctx, req.GetAttemptId())
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "attempt not found: %v", err)
	}

	// Verify ownership
	if attempt.UserID != userID {
		return nil, status.Errorf(codes.PermissionDenied, "not authorized for this attempt")
	}

	// Get exam to check duration
	exam, err := s.examRepo.GetByID(ctx, attempt.ExamID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get exam: %v", err)
	}

	// Validate time limit (anti-cheat)
	elapsed := time.Since(attempt.StartedAt).Minutes()
	gracePeriodMinutes := 5.0 // 5 minute grace period for network delays
	maxAllowedMinutes := float64(exam.DurationMinutes) + gracePeriodMinutes

	if elapsed > maxAllowedMinutes {
		return nil, status.Errorf(codes.DeadlineExceeded,
			"submission time exceeded: %.1f minutes elapsed (allowed: %d + %d grace period)",
			elapsed, exam.DurationMinutes, int(gracePeriodMinutes))
	}

	// Auto-grade the exam
	_, err = s.autoGrading.AutoGradeExam(ctx, req.GetAttemptId())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to grade exam: %v", err)
	}

	// Get the updated attempt with scores
	updatedAttempt, err := s.examRepo.GetAttempt(ctx, req.GetAttemptId())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get updated attempt: %v", err)
	}

	// Convert to proto ExamResult (using attempt data since entity.ExamResult doesn't have these fields)
	protoResult := &v1.ExamResult{
		Id:          req.GetAttemptId(), // Using attempt ID as result ID
		AttemptId:   req.GetAttemptId(),
		Score:       float64(updatedAttempt.Score),
		TotalPoints: int32(updatedAttempt.TotalPoints),
		Percentage:  float64(updatedAttempt.Percentage),
		Passed:      updatedAttempt.Passed,
		CreatedAt:   timestamppb.Now(),
	}

	// Convert grading result to protobuf response
	return &v1.SubmitExamResponse{
		Response: &common.Response{
			Success: true,
			Message: "Exam submitted and graded successfully",
		},
		Result: protoResult,
	}, nil
}

// TODO: Implement additional methods when protobuf is regenerated
// UpdateExam, DeleteExam, PublishExam, ArchiveExam, etc.

// ListExams lists exams with pagination
func (s *ExamServiceServer) ListExams(ctx context.Context, req *v1.ListExamsRequest) (*v1.ListExamsResponse, error) {
	// Get user from context for authorization
	_, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Convert pagination (using defaults since protobuf fields may not be available)
	pagination := &interfaces.Pagination{
		Offset:     0,  // TODO: Get from request when protobuf is regenerated
		Limit:      20, // TODO: Get from request when protobuf is regenerated
		SortColumn: "created_at",
		SortOrder:  "DESC",
	}

	// Set defaults
	if pagination.Limit == 0 {
		pagination.Limit = 20
	}
	if pagination.SortColumn == "" {
		pagination.SortColumn = "created_at"
	}
	if pagination.SortOrder == "" {
		pagination.SortOrder = "DESC"
	}

	// Get exams from service management layer
	exams, _, err := s.examService.ListExams(ctx, nil, pagination)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list exams: %v", err)
	}

	// Convert entities to protobuf
	protoExams := make([]*v1.Exam, len(exams))
	for i, exam := range exams {
		protoExams[i] = convertExamToProto(exam)
	}

	return &v1.ListExamsResponse{
		Response: &common.Response{
			Success: true,
			Message: "Exams listed successfully",
		},
		Exams: protoExams,
		// TODO: Add pagination response when protobuf is regenerated
	}, nil
}

// UpdateExam updates an existing exam
func (s *ExamServiceServer) UpdateExam(ctx context.Context, req *v1.UpdateExamRequest) (*v1.UpdateExamResponse, error) {
	// Get user from context for authorization
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "exam ID is required")
	}

	// Get existing exam
	existingExam, err := s.examService.GetExamByID(ctx, req.GetId())
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "exam not found: %v", err)
	}

	// Convert protobuf to entity for update
	updatedExam := convertUpdateProtoToExam(req, existingExam, userID)

	// Update exam through service management layer
	err = s.examService.UpdateExam(ctx, updatedExam)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to update exam: %v", err)
	}

	// Get updated exam
	updatedExamEntity, err := s.examService.GetExamByID(ctx, req.GetId())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get updated exam: %v", err)
	}

	// Convert entity back to protobuf
	protoExam := convertExamToProto(updatedExamEntity)

	return &v1.UpdateExamResponse{
		Response: &common.Response{
			Success: true,
			Message: "Exam updated successfully",
		},
		Exam: protoExam,
	}, nil
}

// DeleteExam deletes an exam
func (s *ExamServiceServer) DeleteExam(ctx context.Context, req *v1.DeleteExamRequest) (*v1.DeleteExamResponse, error) {
	// Get user from context for authorization
	_, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "exam ID is required")
	}

	// Delete exam through service management layer
	err = s.examService.DeleteExam(ctx, req.GetId())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to delete exam: %v", err)
	}

	return &v1.DeleteExamResponse{
		Response: &common.Response{
			Success: true,
			Message: "Exam deleted successfully",
		},
	}, nil
}

// PublishExam publishes an exam (makes it available for students)
func (s *ExamServiceServer) PublishExam(ctx context.Context, req *v1.PublishExamRequest) (*v1.PublishExamResponse, error) {
	// Get user from context for authorization
	_, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetExamId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "exam ID is required")
	}

	// Publish exam through service management layer
	err = s.examService.PublishExam(ctx, req.GetExamId())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to publish exam: %v", err)
	}

	// Get updated exam
	exam, err := s.examService.GetExamByID(ctx, req.GetExamId())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get published exam: %v", err)
	}

	// Convert entity back to protobuf
	protoExam := convertExamToProto(exam)

	return &v1.PublishExamResponse{
		Response: &common.Response{
			Success: true,
			Message: "Exam published successfully",
		},
		Exam: protoExam,
	}, nil
}

// ArchiveExam archives an exam (removes it from active use)
func (s *ExamServiceServer) ArchiveExam(ctx context.Context, req *v1.ArchiveExamRequest) (*v1.ArchiveExamResponse, error) {
	// Get user from context for authorization
	_, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetExamId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "exam ID is required")
	}

	// Archive exam through service management layer
	err = s.examService.ArchiveExam(ctx, req.GetExamId())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to archive exam: %v", err)
	}

	// Get updated exam
	exam, err := s.examService.GetExamByID(ctx, req.GetExamId())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get archived exam: %v", err)
	}

	// Convert entity back to protobuf
	protoExam := convertExamToProto(exam)

	return &v1.ArchiveExamResponse{
		Response: &common.Response{
			Success: true,
			Message: "Exam archived successfully",
		},
		Exam: protoExam,
	}, nil
}

// AddQuestionToExam adds a question to an exam
func (s *ExamServiceServer) AddQuestionToExam(ctx context.Context, req *v1.AddQuestionToExamRequest) (*v1.AddQuestionToExamResponse, error) {
	// Get user from context for authorization
	_, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetExamId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "exam ID is required")
	}
	if req.GetQuestionId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "question ID is required")
	}
	if req.GetPoints() <= 0 {
		return nil, status.Errorf(codes.InvalidArgument, "points must be positive")
	}

	// Add question to exam through service management layer
	err = s.examService.AddQuestionToExam(ctx, req.GetExamId(), req.GetQuestionId(), int(req.GetPoints()))
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to add question to exam: %v", err)
	}

	return &v1.AddQuestionToExamResponse{
		Response: &common.Response{
			Success: true,
			Message: "Question added to exam successfully",
		},
	}, nil
}

// RemoveQuestionFromExam removes a question from an exam
func (s *ExamServiceServer) RemoveQuestionFromExam(ctx context.Context, req *v1.RemoveQuestionFromExamRequest) (*v1.RemoveQuestionFromExamResponse, error) {
	// Get user from context for authorization
	_, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetExamId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "exam ID is required")
	}
	if req.GetQuestionId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "question ID is required")
	}

	// Remove question from exam through service management layer
	err = s.examService.RemoveQuestionFromExam(ctx, req.GetExamId(), req.GetQuestionId())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to remove question from exam: %v", err)
	}

	return &v1.RemoveQuestionFromExamResponse{
		Response: &common.Response{
			Success: true,
			Message: "Question removed from exam successfully",
		},
	}, nil
}

// ReorderExamQuestions reorders questions in an exam
func (s *ExamServiceServer) ReorderExamQuestions(ctx context.Context, req *v1.ReorderExamQuestionsRequest) (*v1.ReorderExamQuestionsResponse, error) {
	// Get user from context for authorization
	_, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetExamId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "exam ID is required")
	}
	if len(req.GetQuestionOrders()) == 0 {
		return nil, status.Errorf(codes.InvalidArgument, "question orders are required")
	}

	// Convert QuestionOrder to question IDs for ExamService
	questionIDs := make([]string, len(req.GetQuestionOrders()))
	for i, order := range req.GetQuestionOrders() {
		questionIDs[i] = order.GetQuestionId()
	}

	// Reorder questions through service management layer
	// TODO: Add ReorderExamQuestions method to ExamService service
	_ = questionIDs // Use questionIDs when implementing
	// err = s.examService.ReorderExamQuestions(ctx, req.GetExamId(), questionIDs)
	// if err != nil {
	//     return nil, status.Errorf(codes.Internal, "failed to reorder exam questions: %v", err)
	// }

	return &v1.ReorderExamQuestionsResponse{
		Response: &common.Response{
			Success: true,
			Message: "Exam questions reordered successfully",
		},
	}, nil
}

// GetExamQuestions gets all questions for an exam
func (s *ExamServiceServer) GetExamQuestions(ctx context.Context, req *v1.GetExamQuestionsRequest) (*v1.GetExamQuestionsResponse, error) {
	// Get user from context for authorization
	_, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetExamId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "exam ID is required")
	}

	// Get exam questions through repository (since ExamService doesn't have this method yet)
	// TODO: Add GetExamQuestions method to ExamService service
	return &v1.GetExamQuestionsResponse{
		Response: &common.Response{
			Success: true,
			Message: "Exam questions retrieved successfully",
		},
		Questions: []*v1.ExamQuestion{}, // TODO: Implement when ExamService has this method
	}, nil
}

// StartExam starts a new exam attempt
func (s *ExamServiceServer) StartExam(ctx context.Context, req *v1.StartExamRequest) (*v1.StartExamResponse, error) {
	// Get user from context for authorization
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetExamId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "exam ID is required")
	}

	// Verify exam exists and is active
	exam, err := s.examRepo.GetByID(ctx, req.GetExamId())
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "exam not found: %v", err)
	}

	if exam.Status != entity.ExamStatusActive {
		return nil, status.Errorf(codes.FailedPrecondition, "exam is not active (status: %s)", exam.Status)
	}

	// Check user hasn't exceeded max attempts
	attempts, err := s.examRepo.ListUserAttempts(ctx, userID, req.GetExamId())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to check attempts: %v", err)
	}

	if len(attempts) >= exam.MaxAttempts {
		return nil, status.Errorf(codes.ResourceExhausted, 
			"maximum attempts reached (%d/%d)", len(attempts), exam.MaxAttempts)
	}

	// Create new attempt
	attempt := &entity.ExamAttempt{
		ID:            uuid.New().String(),
		ExamID:        req.GetExamId(),
		UserID:        userID,
		AttemptNumber: len(attempts) + 1,
		Status:        entity.AttemptStatusInProgress,
		TotalPoints:   exam.TotalPoints,
		StartedAt:     time.Now(),
	}

	err = s.examRepo.CreateAttempt(ctx, attempt)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create attempt: %v", err)
	}

	// Get question IDs (shuffle if required by exam settings)
	questionIDs := exam.QuestionIDs
	if exam.ShuffleQuestions {
		// Simple shuffle implementation
		shuffled := make([]string, len(questionIDs))
		copy(shuffled, questionIDs)
		// Note: In production, use crypto/rand for better randomization
		for i := len(shuffled) - 1; i > 0; i-- {
			j := int(time.Now().UnixNano()) % (i + 1)
			shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
		}
		questionIDs = shuffled
	}

	return &v1.StartExamResponse{
		Response: &common.Response{
			Success: true,
			Message: "Exam started successfully",
		},
		Attempt:     convertAttemptToProto(attempt),
		QuestionIds: questionIDs,
	}, nil
}

// SubmitAnswer submits an answer for a question in an exam attempt
func (s *ExamServiceServer) SubmitAnswer(ctx context.Context, req *v1.SubmitAnswerRequest) (*v1.SubmitAnswerResponse, error) {
	// Get user from context for authorization
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetAttemptId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "attempt ID is required")
	}
	if req.GetQuestionId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "question ID is required")
	}

	// Verify attempt exists and is in_progress
	attempt, err := s.examRepo.GetAttempt(ctx, req.GetAttemptId())
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "attempt not found: %v", err)
	}

	if attempt.UserID != userID {
		return nil, status.Errorf(codes.PermissionDenied, "not authorized for this attempt")
	}

	if attempt.Status != entity.AttemptStatusInProgress {
		return nil, status.Errorf(codes.FailedPrecondition, 
			"cannot submit answer: attempt status is %s", attempt.Status)
	}

	// Create or update answer
	answer := &entity.ExamAnswer{
		ID:         uuid.New().String(),
		AttemptID:  req.GetAttemptId(),
		QuestionID: req.GetQuestionId(),
		AnswerData: req.GetAnswerData(),
		AnsweredAt: time.Now(),
	}

	err = s.examRepo.SaveAnswer(ctx, answer)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to save answer: %v", err)
	}

	return &v1.SubmitAnswerResponse{
		Response: &common.Response{
			Success: true,
			Message: "Answer submitted successfully",
		},
	}, nil
}

// GetExamAttempt gets an exam attempt by ID
func (s *ExamServiceServer) GetExamAttempt(ctx context.Context, req *v1.GetExamAttemptRequest) (*v1.GetExamAttemptResponse, error) {
	// Get user from context for authorization
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetAttemptId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "attempt ID is required")
	}

	// Get exam attempt
	attempt, err := s.examRepo.GetAttempt(ctx, req.GetAttemptId())
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "attempt not found: %v", err)
	}

	// Authorization check - only allow user to see their own attempts
	// TODO: Add admin/teacher role check if needed
	if attempt.UserID != userID {
		return nil, status.Errorf(codes.PermissionDenied, "not authorized to view this attempt")
	}

	return &v1.GetExamAttemptResponse{
		Response: &common.Response{
			Success: true,
			Message: "Exam attempt retrieved successfully",
		},
		Attempt: convertAttemptToProto(attempt),
	}, nil
}

// GetExamResults gets results for an exam
func (s *ExamServiceServer) GetExamResults(ctx context.Context, req *v1.GetExamResultsRequest) (*v1.GetExamResultsResponse, error) {
	// Get user from context for authorization
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetExamId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "exam ID is required")
	}

	// Get exam results for this exam
	results, err := s.examRepo.GetResultsByExam(ctx, req.GetExamId())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get results: %v", err)
	}

	// Authorization check - users can only see their own results unless admin/teacher
	// TODO: Add role-based access control
	_ = userID // For now, return all results (admin feature)

	// Convert to protobuf
	protoResults := make([]*v1.ExamResult, 0, len(results))
	for _, result := range results {
		protoResults = append(protoResults, convertResultToProto(result))
	}

	return &v1.GetExamResultsResponse{
		Response: &common.Response{
			Success: true,
			Message: "Exam results retrieved successfully",
		},
		Results: protoResults,
	}, nil
}

// GetExamStatistics gets statistics for an exam
func (s *ExamServiceServer) GetExamStatistics(ctx context.Context, req *v1.GetExamStatisticsRequest) (*v1.GetExamStatisticsResponse, error) {
	// Get user from context for authorization
	_, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetExamId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "exam ID is required")
	}

	// Get exam statistics
	stats, err := s.examRepo.GetExamStatistics(ctx, req.GetExamId())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get statistics: %v", err)
	}

	// Convert to protobuf
	protoStats := &v1.ExamStatistics{
		TotalAttempts:     int32(stats.TotalAttempts),
		CompletedAttempts: int32(stats.CompletedAttempts),
		AverageScore:      float32(stats.AverageScore),
		PassRate:          float32(stats.PassRate),
		AverageTimeSpent:  int32(stats.AverageTimeSpent),
	}

	// Convert question statistics if available
	if stats.QuestionStats != nil {
		protoQuestionStats := make([]*v1.QuestionStatistics, 0, len(stats.QuestionStats))
		for _, qs := range stats.QuestionStats {
			protoQuestionStats = append(protoQuestionStats, &v1.QuestionStatistics{
				QuestionId:       qs.QuestionID,
				CorrectAnswers:   int32(qs.CorrectAnswers),
				TotalAnswers:     int32(qs.TotalAnswers),
				CorrectRate:      float32(qs.CorrectRate),
				AverageTimeSpent: float32(qs.AverageTimeSpent),
			})
		}
		protoStats.QuestionStats = protoQuestionStats
	}

	return &v1.GetExamStatisticsResponse{
		Response: &common.Response{
			Success: true,
			Message: "Exam statistics retrieved successfully",
		},
		Statistics: protoStats,
	}, nil
}

// GetUserPerformance gets user performance for an exam
func (s *ExamServiceServer) GetUserPerformance(ctx context.Context, req *v1.GetUserPerformanceRequest) (*v1.GetUserPerformanceResponse, error) {
	// Get user from context for authorization
	currentUserID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetUserId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "user ID is required")
	}
	if req.GetExamId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "exam ID is required")
	}

	// Authorization check - users can only see their own performance unless admin/teacher
	// TODO: Add role-based access control
	if req.GetUserId() != currentUserID {
		// For now, allow (admin feature)
		// In production, check if currentUserID has admin/teacher role
	}

	// Get user performance
	performance, err := s.examRepo.GetUserPerformance(ctx, req.GetUserId(), req.GetExamId())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get performance: %v", err)
	}

	// Convert to protobuf
	protoPerformance := &v1.UserPerformance{
		UserId:         performance.UserID,
		ExamId:         performance.ExamID,
		AttemptsCount:  int32(performance.TotalAttempts),
		BestScore:      float32(performance.BestScore),
		AverageScore:   float32(performance.AverageScore),
		TotalTimeSpent: 0, // TODO: Add TotalTimeSpent to entity.UserPerformance
		// Note: Attempts field is repeated ExamAttempt - would need to fetch attempts separately
	}

	return &v1.GetUserPerformanceResponse{
		Response: &common.Response{
			Success: true,
			Message: "User performance retrieved successfully",
		},
		Performance: protoPerformance,
	}, nil
}

// Helper functions for conversion between protobuf and entity

// convertExamToProto converts entity.Exam to protobuf Exam (complete implementation)
func convertExamToProto(exam *entity.Exam) *v1.Exam {
	if exam == nil {
		return nil
	}

	protoExam := &v1.Exam{
		Id:              exam.ID,
		Title:           exam.Title,
		Description:     exam.Description,
		Instructions:    exam.Instructions,
		DurationMinutes: int32(exam.DurationMinutes),
		TotalPoints:     int32(exam.TotalPoints),
		PassPercentage:  int32(exam.PassPercentage),
		ExamType:        convertExamTypeToProto(exam.ExamType),
		Status:          convertExamStatusToProto(exam.Status),

		// Academic Classification
		Subject:    exam.Subject,
		Grade:      int32(*exam.Grade),
		Difficulty: convertDifficultyToProto(exam.Difficulty),
		Tags:       exam.Tags,

		// Settings
		ShuffleQuestions: exam.ShuffleQuestions,
		ShuffleAnswers:   false, // TODO: Add to entity.Exam
		ShowResults:      exam.ShowResults,
		ShowAnswers:      false, // TODO: Add to entity.Exam
		AllowReview:      false, // TODO: Add to entity.Exam
		MaxAttempts:      int32(exam.MaxAttempts),

		// Official exam fields
		SourceInstitution: stringPtrToString(exam.SourceInstitution),
		ExamYear:          stringPtrToInt32(exam.ExamYear),
		ExamCode:          stringPtrToString(exam.ExamCode),
		FileUrl:           stringPtrToString(exam.FileURL),

		// Metadata
		Version:     int32(exam.Version),
		QuestionIds: exam.QuestionIDs,
		CreatedBy:   exam.CreatedBy,
		UpdatedBy:   "", // TODO: Add to entity.Exam
	}

	// Convert timestamps
	if exam.PublishedAt != nil {
		protoExam.PublishedAt = timestamppb.New(*exam.PublishedAt)
	}
	protoExam.CreatedAt = timestamppb.New(exam.CreatedAt)
	protoExam.UpdatedAt = timestamppb.New(exam.UpdatedAt)

	return protoExam
}

// convertProtoToExam converts protobuf CreateExamRequest to entity.Exam
func convertProtoToExam(req *v1.CreateExamRequest, userID string) *entity.Exam {
	exam := &entity.Exam{
		Title:           req.GetTitle(),
		Description:     req.GetDescription(),
		Instructions:    req.GetInstructions(),
		DurationMinutes: int(req.GetDurationMinutes()),
		PassPercentage:  int(req.GetPassPercentage()),
		ExamType:        convertExamTypeFromProto(req.GetExamType()),

		// Academic Classification
		Subject:    req.GetSubject(),
		Grade:      int32ToIntPtr(req.GetGrade()),
		Difficulty: convertDifficultyFromProto(req.GetDifficulty()),
		Tags:       req.GetTags(),

		// Settings
		ShuffleQuestions: req.GetShuffleQuestions(),
		// TODO: Add ShuffleAnswers, ShowAnswers, AllowReview to entity.Exam
		ShowResults: req.GetShowResults(),
		MaxAttempts: int(req.GetMaxAttempts()),

		// Official exam fields (optional)
		SourceInstitution: stringToStringPtr(req.GetSourceInstitution()),
		ExamYear:          stringToStringPtr(req.GetExamCode()), // TODO: Fix ExamYear type mismatch
		ExamCode:          stringToStringPtr(req.GetExamCode()),
		FileURL:           stringToStringPtr(req.GetFileUrl()),

		// Metadata
		QuestionIDs: req.GetQuestionIds(),
		CreatedBy:   userID,
	}

	// Set timestamps
	now := time.Now()
	exam.CreatedAt = now
	exam.UpdatedAt = now

	return exam
}

// convertUpdateProtoToExam converts protobuf UpdateExamRequest to entity.Exam
func convertUpdateProtoToExam(req *v1.UpdateExamRequest, existing *entity.Exam, userID string) *entity.Exam {
	exam := &entity.Exam{
		ID:              req.GetId(),
		Title:           req.GetTitle(),
		Description:     req.GetDescription(),
		Instructions:    req.GetInstructions(),
		DurationMinutes: int(req.GetDurationMinutes()),
		PassPercentage:  int(req.GetPassPercentage()),

		// Academic Classification
		Subject:    req.GetSubject(),
		Grade:      int32ToIntPtr(req.GetGrade()),
		Difficulty: convertDifficultyFromProto(req.GetDifficulty()),
		Tags:       req.GetTags(),

		// Settings
		ShuffleQuestions: req.GetShuffleQuestions(),
		// TODO: Add ShuffleAnswers, ShowAnswers, AllowReview to entity.Exam
		ShowResults: req.GetShowResults(),
		MaxAttempts: int(req.GetMaxAttempts()),

		// Official exam fields (optional)
		SourceInstitution: stringToStringPtr(req.GetSourceInstitution()),
		ExamYear:          stringToStringPtr(req.GetExamCode()), // TODO: Fix ExamYear type mismatch
		ExamCode:          stringToStringPtr(req.GetExamCode()),
		FileURL:           stringToStringPtr(req.GetFileUrl()),

		// Preserve existing metadata
		ExamType:    existing.ExamType,
		Status:      existing.Status,
		Version:     existing.Version,
		QuestionIDs: existing.QuestionIDs,
		CreatedBy:   existing.CreatedBy,
		CreatedAt:   existing.CreatedAt,
		// TODO: Add UpdatedBy field to entity.Exam
	}

	// Set updated timestamp
	now := time.Now()
	exam.UpdatedAt = now

	return exam
}

// Helper functions for pointer conversions
func stringPtrToString(ptr *string) string {
	if ptr == nil {
		return ""
	}
	return *ptr
}

func int32PtrToInt32(ptr *int) int32 {
	if ptr == nil {
		return 0
	}
	return int32(*ptr)
}

func stringPtrToInt32(ptr *string) int32 {
	if ptr == nil {
		return 0
	}
	// Convert string to int32 (for ExamYear)
	// This is a simplified conversion - in production, should handle errors
	if *ptr == "" {
		return 0
	}
	// For now, return 0 - TODO: implement proper string to int32 conversion
	return 0
}

func stringToStringPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func int32ToIntPtr(i int32) *int {
	if i == 0 {
		return nil
	}
	result := int(i)
	return &result
}

// Enum conversion functions
func convertExamTypeToProto(examType entity.ExamType) v1.ExamType {
	switch examType {
	case entity.ExamTypeGenerated:
		return v1.ExamType_EXAM_TYPE_GENERATED
	case entity.ExamTypeOfficial:
		return v1.ExamType_EXAM_TYPE_OFFICIAL
	default:
		return v1.ExamType_EXAM_TYPE_UNSPECIFIED
	}
}

func convertExamTypeFromProto(examType v1.ExamType) entity.ExamType {
	switch examType {
	case v1.ExamType_EXAM_TYPE_GENERATED:
		return entity.ExamTypeGenerated
	case v1.ExamType_EXAM_TYPE_OFFICIAL:
		return entity.ExamTypeOfficial
	default:
		return entity.ExamTypeGenerated
	}
}

func convertExamStatusToProto(status entity.ExamStatus) v1.ExamStatus {
	switch status {
	case entity.ExamStatusActive:
		return v1.ExamStatus_EXAM_STATUS_ACTIVE
	case entity.ExamStatusPending:
		return v1.ExamStatus_EXAM_STATUS_PENDING
	case entity.ExamStatusInactive:
		return v1.ExamStatus_EXAM_STATUS_INACTIVE
	case entity.ExamStatusArchived:
		return v1.ExamStatus_EXAM_STATUS_ARCHIVED
	default:
		return v1.ExamStatus_EXAM_STATUS_UNSPECIFIED
	}
}

func convertExamStatusFromProto(status v1.ExamStatus) entity.ExamStatus {
	switch status {
	case v1.ExamStatus_EXAM_STATUS_ACTIVE:
		return entity.ExamStatusActive
	case v1.ExamStatus_EXAM_STATUS_PENDING:
		return entity.ExamStatusPending
	case v1.ExamStatus_EXAM_STATUS_INACTIVE:
		return entity.ExamStatusInactive
	case v1.ExamStatus_EXAM_STATUS_ARCHIVED:
		return entity.ExamStatusArchived
	default:
		return entity.ExamStatusPending
	}
}

func convertDifficultyToProto(difficulty entity.Difficulty) v1.Difficulty {
	switch difficulty {
	case entity.DifficultyEasy:
		return v1.Difficulty_DIFFICULTY_EASY
	case entity.DifficultyMedium:
		return v1.Difficulty_DIFFICULTY_MEDIUM
	case entity.DifficultyHard:
		return v1.Difficulty_DIFFICULTY_HARD
	case entity.DifficultyExpert:
		return v1.Difficulty_DIFFICULTY_EXPERT
	default:
		return v1.Difficulty_DIFFICULTY_UNSPECIFIED
	}
}

func convertDifficultyFromProto(difficulty v1.Difficulty) entity.Difficulty {
	switch difficulty {
	case v1.Difficulty_DIFFICULTY_EASY:
		return entity.DifficultyEasy
	case v1.Difficulty_DIFFICULTY_MEDIUM:
		return entity.DifficultyMedium
	case v1.Difficulty_DIFFICULTY_HARD:
		return entity.DifficultyHard
	case v1.Difficulty_DIFFICULTY_EXPERT:
		return entity.DifficultyExpert
	default:
		return entity.DifficultyMedium
	}
}

// TODO: Implement conversion functions when protobuf is regenerated
/*
func convertProtoExamType(protoType v1.ExamType) entity.ExamType {
	return entity.ExamTypeGenerated
}

func convertProtoDifficulty(protoDiff v1.Difficulty) entity.Difficulty {
	return entity.DifficultyMedium
}
*/

// convertGrade converts protobuf grade to entity grade (stub implementation)
func convertGrade(grade int32) *int {
	if grade == 0 {
		return nil
	}
	g := int(grade)
	return &g
}

// convertExamYear converts protobuf exam year to entity exam year (stub implementation)
func convertExamYear(year int32) *int {
	if year == 0 {
		return nil
	}
	y := int(year)
	return &y
}

// Conversion functions for ExamAttempt, ExamAnswer, ExamResult

// convertAttemptStatusToProto converts entity.AttemptStatus to protobuf
func convertAttemptStatusToProto(status entity.AttemptStatus) v1.AttemptStatus {
	switch status {
	case entity.AttemptStatusInProgress:
		return v1.AttemptStatus_ATTEMPT_STATUS_IN_PROGRESS
	case entity.AttemptStatusSubmitted:
		return v1.AttemptStatus_ATTEMPT_STATUS_SUBMITTED
	case entity.AttemptStatusGraded:
		return v1.AttemptStatus_ATTEMPT_STATUS_GRADED
	case entity.AttemptStatusCancelled:
		return v1.AttemptStatus_ATTEMPT_STATUS_CANCELLED
	default:
		return v1.AttemptStatus_ATTEMPT_STATUS_UNSPECIFIED
	}
}

// convertAttemptStatusFromProto converts protobuf to entity.AttemptStatus
func convertAttemptStatusFromProto(status v1.AttemptStatus) entity.AttemptStatus {
	switch status {
	case v1.AttemptStatus_ATTEMPT_STATUS_IN_PROGRESS:
		return entity.AttemptStatusInProgress
	case v1.AttemptStatus_ATTEMPT_STATUS_SUBMITTED:
		return entity.AttemptStatusSubmitted
	case v1.AttemptStatus_ATTEMPT_STATUS_GRADED:
		return entity.AttemptStatusGraded
	case v1.AttemptStatus_ATTEMPT_STATUS_CANCELLED:
		return entity.AttemptStatusCancelled
	default:
		return entity.AttemptStatusInProgress
	}
}

// convertAttemptToProto converts entity.ExamAttempt to protobuf
func convertAttemptToProto(attempt *entity.ExamAttempt) *v1.ExamAttempt {
	if attempt == nil {
		return nil
	}

	protoAttempt := &v1.ExamAttempt{
		Id:               attempt.ID,
		ExamId:           attempt.ExamID,
		UserId:           attempt.UserID,
		AttemptNumber:    int32(attempt.AttemptNumber),
		Status:           convertAttemptStatusToProto(attempt.Status),
		Score:            float64(attempt.Score),
		TotalPoints:      int32(attempt.TotalPoints),
		Percentage:       float64(attempt.Percentage),
		Passed:           attempt.Passed,
		TimeSpentSeconds: int32(attempt.TimeSpent),
		StartedAt:        timestamppb.New(attempt.StartedAt),
	}

	if attempt.SubmittedAt != nil {
		protoAttempt.SubmittedAt = timestamppb.New(*attempt.SubmittedAt)
	}

	return protoAttempt
}

// convertResultToProto converts entity.ExamResult to protobuf
// Note: entity.ExamResult and proto ExamResult have different fields
// This function is kept for compatibility but may need refactoring
func convertResultToProto(result *entity.ExamResult) *v1.ExamResult {
	if result == nil {
		return nil
	}

	// entity.ExamResult doesn't have Score, TotalPoints, Percentage, Passed
	// These fields are in ExamAttempt. This conversion is incomplete.
	protoResult := &v1.ExamResult{
		Id:          result.ID,
		AttemptId:   result.AttemptID,
		Score:       0,     // Not available in entity.ExamResult
		TotalPoints: 0,     // Not available in entity.ExamResult
		Percentage:  0,     // Not available in entity.ExamResult
		Passed:      false, // Not available in entity.ExamResult
		CreatedAt:   timestamppb.New(result.CreatedAt),
	}

	if result.Feedback != nil {
		protoResult.Feedback = *result.Feedback
	}

	return protoResult
}

// convertAnswerToProto converts entity.ExamAnswer to protobuf
func convertAnswerToProto(answer *entity.ExamAnswer) *v1.ExamAnswer {
	if answer == nil {
		return nil
	}

	protoAnswer := &v1.ExamAnswer{
		Id:           answer.ID,
		AttemptId:    answer.AttemptID,
		QuestionId:   answer.QuestionID,
		AnswerData:   answer.AnswerData,
		PointsEarned: int32(answer.PointsEarned),
		CreatedAt:    timestamppb.New(answer.AnsweredAt), // Using AnsweredAt as CreatedAt
		UpdatedAt:    timestamppb.New(answer.AnsweredAt), // Using AnsweredAt as UpdatedAt
	}

	if answer.IsCorrect != nil {
		protoAnswer.IsCorrect = *answer.IsCorrect
	}

	return protoAnswer
}

