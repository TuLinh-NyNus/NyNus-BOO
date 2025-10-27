package grpc

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
	
	pb "exam-bank-system/apps/backend/pkg/proto/v1"
	"exam-bank-system/apps/backend/pkg/proto/common"
)

// GetVersionHistory retrieves version history for a question
func (s *QuestionServiceServer) GetVersionHistory(
	ctx context.Context,
	req *pb.GetVersionHistoryRequest,
) (*pb.GetVersionHistoryResponse, error) {
	// Validate request
	if req.QuestionId == "" {
		return nil, status.Error(codes.InvalidArgument, "question_id is required")
	}
	
	questionID, err := uuid.Parse(req.QuestionId)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid question_id format")
	}
	
	// Get pagination params
	limit := int(req.Pagination.GetLimit())
	if limit <= 0 {
		limit = 20 // default
	}
	if limit > 100 {
		limit = 100 // max
	}
	
	page := int(req.Pagination.GetPage())
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * limit
	
	// Get version history from service
	items, total, err := s.versionService.GetVersionHistory(ctx, questionID, limit, offset)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get version history: %v", err)
	}
	
	// Convert to proto
	protoItems := make([]*pb.VersionHistoryItem, len(items))
	for i, item := range items {
		protoItem := &pb.VersionHistoryItem{
			VersionId:       item.VersionID.String(),
			VersionNumber:   item.VersionNumber,
			ChangedByUserId: item.ChangedByUserID.String(),
			ChangedAt:       timestamppb.New(item.ChangedAt),
		}
		
		if item.ChangedByName != nil {
			protoItem.ChangedByUserName = *item.ChangedByName
		}
		if item.ChangeReason != nil {
			protoItem.ChangeReason = *item.ChangeReason
		}
		if item.SummaryChanges != nil {
			protoItem.SummaryOfChanges = *item.SummaryChanges
		}
		
		protoItems[i] = protoItem
	}
	
	// Calculate total pages
	totalPages := (total + limit - 1) / limit
	
	return &pb.GetVersionHistoryResponse{
		Versions: protoItems,
		Pagination: &common.PaginationResponse{
			Page:       int32(page),
			Limit:      int32(limit),
			TotalCount: int32(total),
			TotalPages: int32(totalPages),
		},
		Response: &common.Response{
			Success: true,
			Message: fmt.Sprintf("Retrieved %d versions", len(items)),
		},
	}, nil
}

// GetVersion retrieves a specific version
func (s *QuestionServiceServer) GetVersion(
	ctx context.Context,
	req *pb.GetVersionRequest,
) (*pb.GetVersionResponse, error) {
	// Validate request
	if req.QuestionId == "" {
		return nil, status.Error(codes.InvalidArgument, "question_id is required")
	}
	if req.VersionNumber <= 0 {
		return nil, status.Error(codes.InvalidArgument, "version_number must be positive")
	}
	
	questionID, err := uuid.Parse(req.QuestionId)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid question_id format")
	}
	
	// Get version from service
	version, err := s.versionService.GetVersion(ctx, questionID, req.VersionNumber)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "version not found: %v", err)
	}
	
	// Convert to Question proto
	protoQuestion := &pb.Question{
		Id:      version.QuestionID.String(),
		Content: version.Content,
		// Map other fields as needed
	}
	
	if version.RawContent != nil {
		protoQuestion.RawContent = *version.RawContent
	}
	if version.Solution != nil {
		protoQuestion.Solution = *version.Solution
	}
	// Note: Type conversion needed - difficulty/status/type are strings in entity but enums in proto
	// For now, just skip these fields or use string values directly
	// TODO: Implement proper string to enum conversion
	if len(version.Tag) > 0 {
		protoQuestion.Tag = version.Tag
	}
	
	return &pb.GetVersionResponse{
		QuestionVersion: protoQuestion,
		Response: &common.Response{
			Success: true,
			Message: fmt.Sprintf("Version %d retrieved", req.VersionNumber),
		},
	}, nil
}

// CompareVersions compares two versions
func (s *QuestionServiceServer) CompareVersions(
	ctx context.Context,
	req *pb.CompareVersionsRequest,
) (*pb.CompareVersionsResponse, error) {
	// Validate request
	if req.QuestionId == "" {
		return nil, status.Error(codes.InvalidArgument, "question_id is required")
	}
	if req.VersionNumber_1 <= 0 || req.VersionNumber_2 <= 0 {
		return nil, status.Error(codes.InvalidArgument, "version numbers must be positive")
	}
	
	questionID, err := uuid.Parse(req.QuestionId)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid question_id format")
	}
	
	// Compare versions
	diffs, err := s.versionService.CompareVersions(ctx, questionID, req.VersionNumber_1, req.VersionNumber_2)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to compare versions: %v", err)
	}
	
	// Convert to proto
	protoDiffs := make([]*pb.VersionDiff, len(diffs))
	for i, diff := range diffs {
		protoDiffs[i] = &pb.VersionDiff{
			FieldName:  diff.FieldName,
			OldValue:   diff.OldValue,
			NewValue:   diff.NewValue,
			ChangeType: diff.ChangeType,
		}
	}
	
	return &pb.CompareVersionsResponse{
		Diffs: protoDiffs,
		Response: &common.Response{
			Success: true,
			Message: fmt.Sprintf("Found %d differences", len(diffs)),
		},
	}, nil
}

// RevertToVersion reverts a question to a specific version
func (s *QuestionServiceServer) RevertToVersion(
	ctx context.Context,
	req *pb.RevertToVersionRequest,
) (*pb.RevertToVersionResponse, error) {
	// Validate request
	if req.QuestionId == "" {
		return nil, status.Error(codes.InvalidArgument, "question_id is required")
	}
	if req.VersionNumber <= 0 {
		return nil, status.Error(codes.InvalidArgument, "version_number must be positive")
	}
	if req.RevertReason == "" || len(req.RevertReason) < 10 {
		return nil, status.Error(codes.InvalidArgument, "revert_reason must be at least 10 characters")
	}
	if req.UserId == "" {
		return nil, status.Error(codes.InvalidArgument, "user_id is required")
	}
	
	questionID, err := uuid.Parse(req.QuestionId)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid question_id format")
	}
	
	userID, err := uuid.Parse(req.UserId)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid user_id format")
	}
	
	// Revert version
	err = s.versionService.RevertToVersion(ctx, questionID, req.VersionNumber, req.RevertReason, userID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to revert version: %v", err)
	}
	
	return &pb.RevertToVersionResponse{
		Success: true,
		Message: fmt.Sprintf("Successfully reverted to version %d", req.VersionNumber),
		Response: &common.Response{
			Success: true,
			Message: "Revert successful",
		},
	}, nil
}

// BulkUpdateQuestions updates multiple questions at once
func (s *QuestionServiceServer) BulkUpdateQuestions(
	ctx context.Context,
	req *pb.BulkUpdateQuestionsRequest,
) (*pb.BulkUpdateQuestionsResponse, error) {
	// Validate request
	if len(req.QuestionIds) == 0 {
		return nil, status.Error(codes.InvalidArgument, "question_ids cannot be empty")
	}
	if len(req.QuestionIds) > 100 {
		return nil, status.Error(codes.InvalidArgument, "cannot update more than 100 questions at once")
	}
	
	// Track results
	successCount := 0
	failedIDs := make([]string, 0)
	
	// Update each question
	for _, questionID := range req.QuestionIds {
		question, err := s.questionService.GetQuestionByID(ctx, questionID)
		if err != nil {
			failedIDs = append(failedIDs, questionID)
			continue
		}
		
		// Apply updates
		updated := false
		
		if req.Status != "" && req.Status != "NO_CHANGE" {
			// Convert string to pgtype.Text
			question.Status.Set(req.Status)
			updated = true
		}
		
		if req.Difficulty != "" && req.Difficulty != "NO_CHANGE" {
			// Convert string to pgtype.Text
			question.Difficulty.Set(req.Difficulty)
			updated = true
		}
		
		// Only update if something changed
		if updated {
			err = s.questionService.UpdateQuestion(ctx, &question)
			if err != nil {
				failedIDs = append(failedIDs, questionID)
				continue
			}
			successCount++
		} else {
			successCount++
		}
	}
	
	message := fmt.Sprintf("Updated %d/%d questions successfully", successCount, len(req.QuestionIds))
	if len(failedIDs) > 0 {
		message += fmt.Sprintf(", %d failed", len(failedIDs))
	}
	
	return &pb.BulkUpdateQuestionsResponse{
		SuccessCount: int32(successCount),
		FailedCount:  int32(len(failedIDs)),
		FailedIds:    failedIDs,
		Response: &common.Response{
			Success: len(failedIDs) == 0,
			Message: message,
		},
	}, nil
}

// BulkDeleteQuestions deletes multiple questions at once
func (s *QuestionServiceServer) BulkDeleteQuestions(
	ctx context.Context,
	req *pb.BulkDeleteQuestionsRequest,
) (*pb.BulkDeleteQuestionsResponse, error) {
	// Validate request
	if len(req.QuestionIds) == 0 {
		return nil, status.Error(codes.InvalidArgument, "question_ids cannot be empty")
	}
	if len(req.QuestionIds) > 100 {
		return nil, status.Error(codes.InvalidArgument, "cannot delete more than 100 questions at once")
	}
	
	// Track results
	successCount := 0
	failedIDs := make([]string, 0)
	
	// Delete each question
	for _, questionID := range req.QuestionIds {
		err := s.questionService.DeleteQuestion(ctx, questionID)
		if err != nil {
			failedIDs = append(failedIDs, questionID)
			continue
		}
		successCount++
	}
	
	message := fmt.Sprintf("Deleted %d/%d questions successfully", successCount, len(req.QuestionIds))
	if len(failedIDs) > 0 {
		message += fmt.Sprintf(", %d failed", len(failedIDs))
	}
	
	return &pb.BulkDeleteQuestionsResponse{
		SuccessCount: int32(successCount),
		FailedCount:  int32(len(failedIDs)),
		FailedIds:    failedIDs,
		Response: &common.Response{
			Success: len(failedIDs) == 0,
			Message: message,
		},
	}, nil
}

