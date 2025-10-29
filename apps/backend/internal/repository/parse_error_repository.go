package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgtype"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/util"
)

// ParseErrorRepository handles parse error data operations
type ParseErrorRepository struct {
	db *pgxpool.Pool
}

// NewParseErrorRepository creates a new parse error repository
func NewParseErrorRepository(db *pgxpool.Pool) *ParseErrorRepository {
	return &ParseErrorRepository{db: db}
}

// SaveParseErrors saves multiple parse errors for a question
func (r *ParseErrorRepository) SaveParseErrors(ctx context.Context, questionID string, errors []entity.DetailedParseError) error {
	if len(errors) == 0 {
		return nil
	}

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Clear existing errors for this question
	_, err = tx.Exec(ctx, `
		DELETE FROM parse_errors 
		WHERE question_id = $1
	`, questionID)
	if err != nil {
		return fmt.Errorf("failed to clear existing errors: %w", err)
	}

	// Insert new errors
	for _, parseError := range errors {
		if parseError.ID.Status != pgtype.Present {
			parseError.ID = util.StringToPgText(uuid.New().String())
		}
		if parseError.CreatedAt.Status != pgtype.Present {
			parseError.CreatedAt = pgtype.Timestamptz{Time: time.Now(), Status: pgtype.Present}
		}

		_, err = tx.Exec(ctx, `
			INSERT INTO parse_errors (
				id, question_id, type, severity, message, field, 
				suggestion, context, line_number, column_start, 
				column_end, created_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		`,
			parseError.ID,
			questionID,
			parseError.Type,
			parseError.Severity,
			parseError.Message,
			parseError.Field,
			parseError.Suggestion,
			parseError.Context,
			parseError.LineNumber,
			parseError.ColumnStart,
			parseError.ColumnEnd,
			parseError.CreatedAt,
		)
		if err != nil {
			return fmt.Errorf("failed to insert parse error: %w", err)
		}
	}

	return tx.Commit(ctx)
}

// GetParseErrors retrieves all parse errors for a question
func (r *ParseErrorRepository) GetParseErrors(ctx context.Context, questionID string) ([]entity.DetailedParseError, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, type, severity, message, field, suggestion, 
			   context, line_number, column_start, column_end, created_at
		FROM parse_errors 
		WHERE question_id = $1
		ORDER BY created_at DESC
	`, questionID)
	if err != nil {
		return nil, fmt.Errorf("failed to query parse errors: %w", err)
	}
	defer rows.Close()

	var errors []entity.DetailedParseError
	for rows.Next() {
		var parseError entity.DetailedParseError
		err := rows.Scan(
			&parseError.ID,
			&parseError.Type,
			&parseError.Severity,
			&parseError.Message,
			&parseError.Field,
			&parseError.Suggestion,
			&parseError.Context,
			&parseError.LineNumber,
			&parseError.ColumnStart,
			&parseError.ColumnEnd,
			&parseError.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan parse error: %w", err)
		}
		errors = append(errors, parseError)
	}

	return errors, rows.Err()
}

// GetParseErrorsByType retrieves parse errors by type and severity
func (r *ParseErrorRepository) GetParseErrorsByType(ctx context.Context, questionID string, errorType entity.ParseErrorType, severity entity.ParseErrorSeverity) ([]entity.DetailedParseError, error) {
	query := `
		SELECT id, type, severity, message, field, suggestion, 
			   context, line_number, column_start, column_end, created_at
		FROM parse_errors 
		WHERE question_id = $1
	`
	args := []interface{}{questionID}

	if errorType != "" {
		query += " AND type = $2"
		args = append(args, errorType)
	}

	if severity != "" {
		if errorType != "" {
			query += " AND severity = $3"
		} else {
			query += " AND severity = $2"
		}
		args = append(args, severity)
	}

	query += " ORDER BY created_at DESC"

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query parse errors by type: %w", err)
	}
	defer rows.Close()

	var errors []entity.DetailedParseError
	for rows.Next() {
		var parseError entity.DetailedParseError
		err := rows.Scan(
			&parseError.ID,
			&parseError.Type,
			&parseError.Severity,
			&parseError.Message,
			&parseError.Field,
			&parseError.Suggestion,
			&parseError.Context,
			&parseError.LineNumber,
			&parseError.ColumnStart,
			&parseError.ColumnEnd,
			&parseError.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan parse error: %w", err)
		}
		errors = append(errors, parseError)
	}

	return errors, rows.Err()
}

// SaveParseHistory saves or updates parse history for a question
func (r *ParseErrorRepository) SaveParseHistory(ctx context.Context, questionID string, status string, lastError string) error {
	// Check if history exists
	var existingID string
	err := r.db.QueryRow(ctx, `
		SELECT id FROM parse_error_history 
		WHERE question_id = $1
	`, questionID).Scan(&existingID)

	now := time.Now()

	if err == pgx.ErrNoRows {
		// Create new history
		historyID := uuid.New().String()
		_, err = r.db.Exec(ctx, `
			INSERT INTO parse_error_history (
				id, question_id, attempt_count, last_attempt, 
				last_error, status, created_at, updated_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		`,
			historyID,
			questionID,
			1,
			pgtype.Timestamptz{Time: now, Status: pgtype.Present},
			util.StringToPgText(lastError),
			util.StringToPgText(status),
			pgtype.Timestamptz{Time: now, Status: pgtype.Present},
			pgtype.Timestamptz{Time: now, Status: pgtype.Present},
		)
		if err != nil {
			return fmt.Errorf("failed to insert parse history: %w", err)
		}
	} else if err != nil {
		return fmt.Errorf("failed to check existing parse history: %w", err)
	} else {
		// Update existing history
		_, err = r.db.Exec(ctx, `
			UPDATE parse_error_history 
			SET attempt_count = attempt_count + 1,
				last_attempt = $1,
				last_error = $2,
				status = $3,
				updated_at = $4
			WHERE question_id = $5
		`,
			pgtype.Timestamptz{Time: now, Status: pgtype.Present},
			util.StringToPgText(lastError),
			util.StringToPgText(status),
			pgtype.Timestamptz{Time: now, Status: pgtype.Present},
			questionID,
		)
		if err != nil {
			return fmt.Errorf("failed to update parse history: %w", err)
		}
	}

	return nil
}

// GetParseHistory retrieves parse history for a question
func (r *ParseErrorRepository) GetParseHistory(ctx context.Context, questionID string) (*entity.ParseErrorHistory, error) {
	var history entity.ParseErrorHistory
	err := r.db.QueryRow(ctx, `
		SELECT id, question_id, attempt_count, last_attempt, 
			   last_error, status, created_at, updated_at
		FROM parse_error_history 
		WHERE question_id = $1
	`, questionID).Scan(
		&history.ID,
		&history.QuestionID,
		&history.AttemptCount,
		&history.LastAttempt,
		&history.LastError,
		&history.Status,
		&history.CreatedAt,
		&history.UpdatedAt,
	)

	if err == pgx.ErrNoRows {
		return nil, nil
	} else if err != nil {
		return nil, fmt.Errorf("failed to get parse history: %w", err)
	}

	return &history, nil
}

// GetQuestionsWithParseErrors retrieves questions that have parse errors
func (r *ParseErrorRepository) GetQuestionsWithParseErrors(ctx context.Context, limit, offset int) ([]string, error) {
	rows, err := r.db.Query(ctx, `
		SELECT DISTINCT question_id 
		FROM parse_errors 
		WHERE severity = $1
		ORDER BY question_id
		LIMIT $2 OFFSET $3
	`, entity.ParseErrorSeverityError, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query questions with errors: %w", err)
	}
	defer rows.Close()

	var questionIDs []string
	for rows.Next() {
		var questionID string
		err := rows.Scan(&questionID)
		if err != nil {
			return nil, fmt.Errorf("failed to scan question ID: %w", err)
		}
		questionIDs = append(questionIDs, questionID)
	}

	return questionIDs, rows.Err()
}

// GetRetryableQuestions retrieves questions that can be retried
func (r *ParseErrorRepository) GetRetryableQuestions(ctx context.Context, maxAttempts int, limit int) ([]string, error) {
	rows, err := r.db.Query(ctx, `
		SELECT question_id 
		FROM parse_error_history 
		WHERE attempt_count < $1 
		  AND status = $2
		  AND last_attempt < $3
		ORDER BY last_attempt ASC
		LIMIT $4
	`,
		maxAttempts,
		string(entity.QuestionStatusPending),
		time.Now().Add(-time.Hour), // Only retry after 1 hour
		limit,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query retryable questions: %w", err)
	}
	defer rows.Close()

	var questionIDs []string
	for rows.Next() {
		var questionID string
		err := rows.Scan(&questionID)
		if err != nil {
			return nil, fmt.Errorf("failed to scan question ID: %w", err)
		}
		questionIDs = append(questionIDs, questionID)
	}

	return questionIDs, rows.Err()
}

// ClearParseErrors removes all parse errors for a question
func (r *ParseErrorRepository) ClearParseErrors(ctx context.Context, questionID string) error {
	_, err := r.db.Exec(ctx, `
		DELETE FROM parse_errors 
		WHERE question_id = $1
	`, questionID)
	if err != nil {
		return fmt.Errorf("failed to clear parse errors: %w", err)
	}

	return nil
}

// GetErrorStatistics retrieves error statistics
func (r *ParseErrorRepository) GetErrorStatistics(ctx context.Context) (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Count by error type
	rows, err := r.db.Query(ctx, `
		SELECT type, COUNT(*) as count
		FROM parse_errors 
		GROUP BY type
		ORDER BY count DESC
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to query error statistics: %w", err)
	}
	defer rows.Close()

	errorTypes := make(map[string]int)
	for rows.Next() {
		var errorType string
		var count int
		err := rows.Scan(&errorType, &count)
		if err != nil {
			return nil, fmt.Errorf("failed to scan error type stats: %w", err)
		}
		errorTypes[errorType] = count
	}
	stats["error_types"] = errorTypes

	// Count by severity
	rows, err = r.db.Query(ctx, `
		SELECT severity, COUNT(*) as count
		FROM parse_errors 
		GROUP BY severity
		ORDER BY count DESC
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to query severity statistics: %w", err)
	}
	defer rows.Close()

	severities := make(map[string]int)
	for rows.Next() {
		var severity string
		var count int
		err := rows.Scan(&severity, &count)
		if err != nil {
			return nil, fmt.Errorf("failed to scan severity stats: %w", err)
		}
		severities[severity] = count
	}
	stats["severities"] = severities

	// Total questions with errors
	var totalWithErrors int
	err = r.db.QueryRow(ctx, `
		SELECT COUNT(DISTINCT question_id) 
		FROM parse_errors
	`).Scan(&totalWithErrors)
	if err != nil {
		return nil, fmt.Errorf("failed to count questions with errors: %w", err)
	}
	stats["total_questions_with_errors"] = totalWithErrors

	return stats, nil
}

