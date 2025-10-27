package entity

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

// QuestionVersion represents a historical version of a question
type QuestionVersion struct {
	ID            uuid.UUID      `db:"id" json:"id"`
	QuestionID    uuid.UUID      `db:"question_id" json:"question_id"`
	VersionNumber int32          `db:"version_number" json:"version_number"`
	
	// Question data snapshot
	Content           string         `db:"content" json:"content"`
	RawContent        *string        `db:"raw_content" json:"raw_content,omitempty"`
	StructuredAnswers json.RawMessage `db:"structured_answers" json:"structured_answers,omitempty"`
	JSONAnswers       json.RawMessage `db:"json_answers" json:"json_answers,omitempty"`
	StructuredCorrect json.RawMessage `db:"structured_correct" json:"structured_correct,omitempty"`
	JSONCorrectAnswer json.RawMessage `db:"json_correct_answer" json:"json_correct_answer,omitempty"`
	Solution          *string        `db:"solution" json:"solution,omitempty"`
	Tag               pq.StringArray `db:"tag" json:"tag,omitempty"`
	Difficulty        *string        `db:"difficulty" json:"difficulty,omitempty"`
	Status            *string        `db:"status" json:"status,omitempty"`
	QuestionType      *string        `db:"question_type" json:"question_type,omitempty"`
	Source            *string        `db:"source" json:"source,omitempty"`
	
	// Version metadata
	ChangedBy     uuid.UUID  `db:"changed_by" json:"changed_by"`
	ChangeReason  *string    `db:"change_reason" json:"change_reason,omitempty"`
	ChangedAt     time.Time  `db:"changed_at" json:"changed_at"`
	
	// Full snapshot
	FullSnapshot  json.RawMessage `db:"full_snapshot" json:"full_snapshot"`
}

// TableName returns the table name for QuestionVersion
func (QuestionVersion) TableName() string {
	return "question_versions"
}

// VersionHistoryItem represents a summary of a version for listing
type VersionHistoryItem struct {
	VersionID       uuid.UUID  `json:"version_id"`
	VersionNumber   int32      `json:"version_number"`
	ChangedByUserID uuid.UUID  `json:"changed_by_user_id"`
	ChangedByName   *string    `json:"changed_by_name,omitempty"`
	ChangeReason    *string    `json:"change_reason,omitempty"`
	ChangedAt       time.Time  `json:"changed_at"`
	SummaryChanges  *string    `json:"summary_of_changes,omitempty"`
}

// VersionDiff represents the difference between two versions
type VersionDiff struct {
	FieldName string `json:"field_name"`
	OldValue  string `json:"old_value"`
	NewValue  string `json:"new_value"`
	ChangeType string `json:"change_type"` // ADDED, MODIFIED, DELETED
}

// RevertRequest represents a request to revert to a previous version
type RevertRequest struct {
	QuestionID    uuid.UUID `json:"question_id"`
	VersionNumber int32     `json:"version_number"`
	RevertReason  string    `json:"revert_reason"`
	UserID        uuid.UUID `json:"user_id"`
}

