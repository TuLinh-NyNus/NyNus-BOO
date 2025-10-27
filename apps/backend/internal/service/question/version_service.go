package question

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	
	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository"
	"exam-bank-system/apps/backend/internal/repository/interfaces"
)

// VersionService handles business logic for question versions
type VersionService struct {
	versionRepo  repository.QuestionVersionRepository
	questionRepo interfaces.QuestionRepository // Use interface from interfaces package
}

// NewVersionService creates a new version service
func NewVersionService(
	versionRepo repository.QuestionVersionRepository,
	questionRepo interfaces.QuestionRepository, // Use interface
) *VersionService {
	return &VersionService{
		versionRepo:  versionRepo,
		questionRepo: questionRepo,
	}
}

// GetVersionHistory retrieves version history for a question
func (s *VersionService) GetVersionHistory(
	ctx context.Context,
	questionID uuid.UUID,
	limit, offset int,
) ([]*entity.VersionHistoryItem, int, error) {
	// Validate question exists using string ID
	_, err := s.questionRepo.GetByID(ctx, questionID.String())
	if err != nil {
		return nil, 0, fmt.Errorf("question not found: %w", err)
	}
	
	// Get version history
	items, total, err := s.versionRepo.GetVersionHistory(ctx, questionID, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get version history: %w", err)
	}
	
	// Add summary of changes for each version
	for _, item := range items {
		if item.VersionNumber > 1 {
			// Get previous version to compare
			prevVersion, err := s.versionRepo.GetVersion(ctx, questionID, item.VersionNumber-1)
			if err == nil {
				currentVersion, err := s.versionRepo.GetVersion(ctx, questionID, item.VersionNumber)
				if err == nil {
					summary := s.generateChangeSummary(prevVersion, currentVersion)
					item.SummaryChanges = &summary
				}
			}
		}
	}
	
	return items, total, nil
}

// GetVersion retrieves a specific version
func (s *VersionService) GetVersion(
	ctx context.Context,
	questionID uuid.UUID,
	versionNumber int32,
) (*entity.QuestionVersion, error) {
	version, err := s.versionRepo.GetVersion(ctx, questionID, versionNumber)
	if err != nil {
		return nil, fmt.Errorf("failed to get version: %w", err)
	}
	
	return version, nil
}

// CompareVersions compares two versions
func (s *VersionService) CompareVersions(
	ctx context.Context,
	questionID uuid.UUID,
	version1, version2 int32,
) ([]*entity.VersionDiff, error) {
	// Validate versions exist
	_, err := s.versionRepo.GetVersion(ctx, questionID, version1)
	if err != nil {
		return nil, fmt.Errorf("version %d not found: %w", version1, err)
	}
	
	_, err = s.versionRepo.GetVersion(ctx, questionID, version2)
	if err != nil {
		return nil, fmt.Errorf("version %d not found: %w", version2, err)
	}
	
	// Compare versions
	diffs, err := s.versionRepo.CompareVersions(ctx, questionID, version1, version2)
	if err != nil {
		return nil, fmt.Errorf("failed to compare versions: %w", err)
	}
	
	return diffs, nil
}

// RevertToVersion reverts a question to a specific version
// NOTE: This is a simplified implementation. Full implementation should:
// 1. Unmarshal the full_snapshot JSONB to restore complete question data
// 2. Handle pgtype conversions properly
// 3. Use transactions for atomicity
func (s *VersionService) RevertToVersion(
	ctx context.Context,
	questionID uuid.UUID,
	versionNumber int32,
	revertReason string,
	userID uuid.UUID,
) error {
	// Validate revert reason
	if len(revertReason) < 10 {
		return fmt.Errorf("revert reason must be at least 10 characters")
	}
	
	// Get the version to revert to
	targetVersion, err := s.versionRepo.GetVersion(ctx, questionID, versionNumber)
	if err != nil {
		return fmt.Errorf("target version not found: %w", err)
	}
	
	// Get current question using string ID
	currentQuestion, err := s.questionRepo.GetByID(ctx, questionID.String())
	if err != nil {
		return fmt.Errorf("current question not found: %w", err)
	}
	
	// Create a version of current state before revert (for audit)
	latestVersion, err := s.versionRepo.GetLatestVersionNumber(ctx, questionID)
	if err != nil {
		return fmt.Errorf("failed to get latest version: %w", err)
	}
	
	// Prepare snapshot of current question
	snapshotJSON, err := json.Marshal(currentQuestion)
	if err != nil {
		return fmt.Errorf("failed to create snapshot: %w", err)
	}
	
	// Create version record for current state (before revert)
	// NOTE: This stores minimal data - full implementation should store all fields
	content := targetVersion.Content
	preRevertVersion := &entity.QuestionVersion{
		ID:            uuid.New(),
		QuestionID:    questionID,
		VersionNumber: latestVersion + 1,
		Content:       content,
		ChangedBy:     userID,
		ChangedAt:     time.Now(),
		FullSnapshot:  snapshotJSON,
	}
	
	reasonStr := revertReason
	preRevertVersion.ChangeReason = &reasonStr
	
	err = s.versionRepo.CreateVersion(ctx, preRevertVersion)
	if err != nil {
		return fmt.Errorf("failed to save pre-revert version: %w", err)
	}
	
	// TODO: Implement actual revert logic
	// This requires:
	// 1. Unmarshal targetVersion.FullSnapshot to Question entity
	// 2. Update currentQuestion with targetVersion data
	// 3. Call questionRepo.Update(ctx, currentQuestion)
	//
	// For now, return error indicating incomplete implementation
	return fmt.Errorf("revert implementation incomplete - requires full_snapshot unmarshaling and pgtype conversion")
}

// generateChangeSummary creates a human-readable summary of changes
func (s *VersionService) generateChangeSummary(prev, current *entity.QuestionVersion) string {
	var changes []string
	
	if prev.Content != current.Content {
		changes = append(changes, "Content updated")
	}
	
	if prev.Difficulty != nil && current.Difficulty != nil && *prev.Difficulty != *current.Difficulty {
		changes = append(changes, fmt.Sprintf("Difficulty changed: %s → %s", *prev.Difficulty, *current.Difficulty))
	}
	
	if prev.Status != nil && current.Status != nil && *prev.Status != *current.Status {
		changes = append(changes, fmt.Sprintf("Status changed: %s → %s", *prev.Status, *current.Status))
	}
	
	if len(prev.Tag) != len(current.Tag) {
		changes = append(changes, "Tags updated")
	}
	
	if len(changes) == 0 {
		return "Minor updates"
	}
	
	if len(changes) == 1 {
		return changes[0]
	}
	
	return fmt.Sprintf("%d changes", len(changes))
}

