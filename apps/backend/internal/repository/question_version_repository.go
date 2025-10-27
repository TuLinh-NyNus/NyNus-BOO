package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	
	"exam-bank-system/apps/backend/internal/entity"
)

// QuestionVersionRepository handles database operations for question versions
type QuestionVersionRepository interface {
	// CreateVersion manually creates a version (for special cases like reverts)
	CreateVersion(ctx context.Context, version *entity.QuestionVersion) error
	
	// GetVersionHistory retrieves all versions for a question
	GetVersionHistory(ctx context.Context, questionID uuid.UUID, limit, offset int) ([]*entity.VersionHistoryItem, int, error)
	
	// GetVersion retrieves a specific version
	GetVersion(ctx context.Context, questionID uuid.UUID, versionNumber int32) (*entity.QuestionVersion, error)
	
	// GetLatestVersionNumber gets the latest version number for a question
	GetLatestVersionNumber(ctx context.Context, questionID uuid.UUID) (int32, error)
	
	// CompareVersions compares two versions and returns differences
	CompareVersions(ctx context.Context, questionID uuid.UUID, version1, version2 int32) ([]*entity.VersionDiff, error)
	
	// CountVersions counts total versions for a question
	CountVersions(ctx context.Context, questionID uuid.UUID) (int, error)
}

type questionVersionRepository struct {
	db *sqlx.DB
}

// NewQuestionVersionRepository creates a new question version repository
func NewQuestionVersionRepository(db *sqlx.DB) QuestionVersionRepository {
	return &questionVersionRepository{db: db}
}

// CreateVersion manually creates a version
func (r *questionVersionRepository) CreateVersion(ctx context.Context, version *entity.QuestionVersion) error {
	query := `
		INSERT INTO question_versions (
			id, question_id, version_number, content, raw_content,
			structured_answers, json_answers, structured_correct, json_correct_answer,
			solution, tag, difficulty, status, question_type, source,
			changed_by, change_reason, changed_at, full_snapshot
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
		)
	`
	
	_, err := r.db.ExecContext(
		ctx, query,
		version.ID, version.QuestionID, version.VersionNumber,
		version.Content, version.RawContent,
		version.StructuredAnswers, version.JSONAnswers,
		version.StructuredCorrect, version.JSONCorrectAnswer,
		version.Solution, version.Tag, version.Difficulty,
		version.Status, version.QuestionType, version.Source,
		version.ChangedBy, version.ChangeReason, version.ChangedAt,
		version.FullSnapshot,
	)
	
	return err
}

// GetVersionHistory retrieves all versions for a question
func (r *questionVersionRepository) GetVersionHistory(
	ctx context.Context,
	questionID uuid.UUID,
	limit, offset int,
) ([]*entity.VersionHistoryItem, int, error) {
	// Get total count
	var totalCount int
	countQuery := `SELECT COUNT(*) FROM question_versions WHERE question_id = $1`
	err := r.db.GetContext(ctx, &totalCount, countQuery, questionID)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count versions: %w", err)
	}
	
	// Get versions with user info
	query := `
		SELECT 
			qv.id as version_id,
			qv.version_number,
			qv.changed_by as changed_by_user_id,
			u.name as changed_by_name,
			qv.change_reason,
			qv.changed_at
		FROM question_versions qv
		LEFT JOIN users u ON qv.changed_by = u.id
		WHERE qv.question_id = $1
		ORDER BY qv.version_number DESC
		LIMIT $2 OFFSET $3
	`
	
	var items []*entity.VersionHistoryItem
	err = r.db.SelectContext(ctx, &items, query, questionID, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get version history: %w", err)
	}
	
	return items, totalCount, nil
}

// GetVersion retrieves a specific version
func (r *questionVersionRepository) GetVersion(
	ctx context.Context,
	questionID uuid.UUID,
	versionNumber int32,
) (*entity.QuestionVersion, error) {
	query := `
		SELECT * FROM question_versions
		WHERE question_id = $1 AND version_number = $2
	`
	
	var version entity.QuestionVersion
	err := r.db.GetContext(ctx, &version, query, questionID, versionNumber)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("version not found")
		}
		return nil, fmt.Errorf("failed to get version: %w", err)
	}
	
	return &version, nil
}

// GetLatestVersionNumber gets the latest version number
func (r *questionVersionRepository) GetLatestVersionNumber(
	ctx context.Context,
	questionID uuid.UUID,
) (int32, error) {
	query := `
		SELECT COALESCE(MAX(version_number), 0)
		FROM question_versions
		WHERE question_id = $1
	`
	
	var versionNumber int32
	err := r.db.GetContext(ctx, &versionNumber, query, questionID)
	if err != nil {
		return 0, fmt.Errorf("failed to get latest version number: %w", err)
	}
	
	return versionNumber, nil
}

// CompareVersions compares two versions
func (r *questionVersionRepository) CompareVersions(
	ctx context.Context,
	questionID uuid.UUID,
	version1, version2 int32,
) ([]*entity.VersionDiff, error) {
	// Get both versions
	v1, err := r.GetVersion(ctx, questionID, version1)
	if err != nil {
		return nil, fmt.Errorf("failed to get version %d: %w", version1, err)
	}
	
	v2, err := r.GetVersion(ctx, questionID, version2)
	if err != nil {
		return nil, fmt.Errorf("failed to get version %d: %w", version2, err)
	}
	
	// Compare and generate diffs
	var diffs []*entity.VersionDiff
	
	// Compare content
	if v1.Content != v2.Content {
		diffs = append(diffs, &entity.VersionDiff{
			FieldName:  "content",
			OldValue:   v1.Content,
			NewValue:   v2.Content,
			ChangeType: "MODIFIED",
		})
	}
	
	// Compare difficulty
	if (v1.Difficulty == nil && v2.Difficulty != nil) ||
		(v1.Difficulty != nil && v2.Difficulty == nil) ||
		(v1.Difficulty != nil && v2.Difficulty != nil && *v1.Difficulty != *v2.Difficulty) {
		oldVal := ""
		newVal := ""
		if v1.Difficulty != nil {
			oldVal = *v1.Difficulty
		}
		if v2.Difficulty != nil {
			newVal = *v2.Difficulty
		}
		diffs = append(diffs, &entity.VersionDiff{
			FieldName:  "difficulty",
			OldValue:   oldVal,
			NewValue:   newVal,
			ChangeType: "MODIFIED",
		})
	}
	
	// Compare status
	if (v1.Status == nil && v2.Status != nil) ||
		(v1.Status != nil && v2.Status == nil) ||
		(v1.Status != nil && v2.Status != nil && *v1.Status != *v2.Status) {
		oldVal := ""
		newVal := ""
		if v1.Status != nil {
			oldVal = *v1.Status
		}
		if v2.Status != nil {
			newVal = *v2.Status
		}
		diffs = append(diffs, &entity.VersionDiff{
			FieldName:  "status",
			OldValue:   oldVal,
			NewValue:   newVal,
			ChangeType: "MODIFIED",
		})
	}
	
	// Compare tags
	if !equalStringArrays(v1.Tag, v2.Tag) {
		oldTags, _ := json.Marshal(v1.Tag)
		newTags, _ := json.Marshal(v2.Tag)
		diffs = append(diffs, &entity.VersionDiff{
			FieldName:  "tags",
			OldValue:   string(oldTags),
			NewValue:   string(newTags),
			ChangeType: "MODIFIED",
		})
	}
	
	return diffs, nil
}

// CountVersions counts total versions for a question
func (r *questionVersionRepository) CountVersions(ctx context.Context, questionID uuid.UUID) (int, error) {
	query := `SELECT COUNT(*) FROM question_versions WHERE question_id = $1`
	var count int
	err := r.db.GetContext(ctx, &count, query, questionID)
	return count, err
}

// Helper function to compare string arrays
func equalStringArrays(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

