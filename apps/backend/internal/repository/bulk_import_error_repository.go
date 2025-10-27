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

// BulkImportErrorRepository handles bulk import error data operations
type BulkImportErrorRepository struct {
	db *pgxpool.Pool
}

// NewBulkImportErrorRepository creates a new bulk import error repository
func NewBulkImportErrorRepository(db *pgxpool.Pool) *BulkImportErrorRepository {
	return &BulkImportErrorRepository{db: db}
}

// CreateImportSession creates a new import session
func (r *BulkImportErrorRepository) CreateImportSession(ctx context.Context, session *entity.BulkImportSession) error {
	if session.ID.Status != pgtype.Present {
		session.ID = util.StringToPgText(uuid.New().String())
	}
	if session.CreatedAt.Status != pgtype.Present {
		session.CreatedAt = util.TimestamptzToPgType(time.Now())
	}
	if session.UpdatedAt.Status != pgtype.Present {
		session.UpdatedAt = util.TimestamptzToPgType(time.Now())
	}

	_, err := r.db.Exec(ctx, `
		INSERT INTO bulk_import_sessions (
			id, type, status, total_rows, processed_rows, success_rows, 
			error_rows, warning_rows, start_time, end_time, creator, 
			file_name, file_size, options, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
	`,
		session.ID,
		session.Type,
		session.Status,
		session.TotalRows,
		session.ProcessedRows,
		session.SuccessRows,
		session.ErrorRows,
		session.WarningRows,
		session.StartTime,
		session.EndTime,
		session.Creator,
		session.FileName,
		session.FileSize,
		session.Options,
		session.CreatedAt,
		session.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create import session: %w", err)
	}

	return nil
}

// UpdateImportSession updates an import session
func (r *BulkImportErrorRepository) UpdateImportSession(ctx context.Context, session *entity.BulkImportSession) error {
	session.UpdatedAt = util.TimestamptzToPgType(time.Now())

	_, err := r.db.Exec(ctx, `
		UPDATE bulk_import_sessions 
		SET status = $1, processed_rows = $2, success_rows = $3, 
			error_rows = $4, warning_rows = $5, end_time = $6, updated_at = $7
		WHERE id = $8
	`,
		session.Status,
		session.ProcessedRows,
		session.SuccessRows,
		session.ErrorRows,
		session.WarningRows,
		session.EndTime,
		session.UpdatedAt,
		session.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update import session: %w", err)
	}

	return nil
}

// GetImportSession retrieves an import session by ID
func (r *BulkImportErrorRepository) GetImportSession(ctx context.Context, sessionID string) (*entity.BulkImportSession, error) {
	var session entity.BulkImportSession
	err := r.db.QueryRow(ctx, `
		SELECT id, type, status, total_rows, processed_rows, success_rows, 
			   error_rows, warning_rows, start_time, end_time, creator, 
			   file_name, file_size, options, created_at, updated_at
		FROM bulk_import_sessions 
		WHERE id = $1
	`, sessionID).Scan(
		&session.ID,
		&session.Type,
		&session.Status,
		&session.TotalRows,
		&session.ProcessedRows,
		&session.SuccessRows,
		&session.ErrorRows,
		&session.WarningRows,
		&session.StartTime,
		&session.EndTime,
		&session.Creator,
		&session.FileName,
		&session.FileSize,
		&session.Options,
		&session.CreatedAt,
		&session.UpdatedAt,
	)

	if err == pgx.ErrNoRows {
		return nil, nil
	} else if err != nil {
		return nil, fmt.Errorf("failed to get import session: %w", err)
	}

	return &session, nil
}

// SaveBulkImportError saves a bulk import error
func (r *BulkImportErrorRepository) SaveBulkImportError(ctx context.Context, importError *entity.BulkImportError) error {
	if importError.ID.Status != pgtype.Present {
		importError.ID = util.StringToPgText(uuid.New().String())
	}
	if importError.CreatedAt.Status != pgtype.Present {
		importError.CreatedAt = util.TimestamptzToPgType(time.Now())
	}

	_, err := r.db.Exec(ctx, `
		INSERT INTO bulk_import_errors (
			id, import_id, row_number, type, severity, message, 
			field, suggestion, context, row_data, question_id, 
			is_recoverable, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
	`,
		importError.ID,
		importError.ImportID,
		importError.RowNumber,
		importError.Type,
		importError.Severity,
		importError.Message,
		importError.Field,
		importError.Suggestion,
		importError.Context,
		importError.RowData,
		importError.QuestionID,
		importError.IsRecoverable,
		importError.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to save bulk import error: %w", err)
	}

	return nil
}

// SaveBulkImportErrors saves multiple bulk import errors in batch
func (r *BulkImportErrorRepository) SaveBulkImportErrors(ctx context.Context, errors []entity.BulkImportError) error {
	if len(errors) == 0 {
		return nil
	}

	// Prepare batch insert
	batch := &pgx.Batch{}
	for _, err := range errors {
		if err.ID.Status != pgtype.Present {
			err.ID = util.StringToPgText(uuid.New().String())
		}
		if err.CreatedAt.Status != pgtype.Present {
			err.CreatedAt = util.TimestamptzToPgType(time.Now())
		}

		batch.Queue(`
			INSERT INTO bulk_import_errors (
				id, import_id, row_number, type, severity, message, 
				field, suggestion, context, row_data, question_id, 
				is_recoverable, created_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		`,
			err.ID,
			err.ImportID,
			err.RowNumber,
			err.Type,
			err.Severity,
			err.Message,
			err.Field,
			err.Suggestion,
			err.Context,
			err.RowData,
			err.QuestionID,
			err.IsRecoverable,
			err.CreatedAt,
		)
	}

	// Execute batch
	batchResults := r.db.SendBatch(ctx, batch)
	defer batchResults.Close()

	for i := 0; i < len(errors); i++ {
		_, err := batchResults.Exec()
		if err != nil {
			return fmt.Errorf("failed to save bulk import error %d: %w", i, err)
		}
	}

	return nil
}

// GetImportErrors retrieves all errors for an import session
func (r *BulkImportErrorRepository) GetImportErrors(ctx context.Context, importID string) ([]entity.BulkImportError, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, import_id, row_number, type, severity, message, 
			   field, suggestion, context, row_data, question_id, 
			   is_recoverable, created_at
		FROM bulk_import_errors 
		WHERE import_id = $1
		ORDER BY row_number ASC, created_at ASC
	`, importID)
	if err != nil {
		return nil, fmt.Errorf("failed to query import errors: %w", err)
	}
	defer rows.Close()

	var errors []entity.BulkImportError
	for rows.Next() {
		var importError entity.BulkImportError
		err := rows.Scan(
			&importError.ID,
			&importError.ImportID,
			&importError.RowNumber,
			&importError.Type,
			&importError.Severity,
			&importError.Message,
			&importError.Field,
			&importError.Suggestion,
			&importError.Context,
			&importError.RowData,
			&importError.QuestionID,
			&importError.IsRecoverable,
			&importError.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan import error: %w", err)
		}
		errors = append(errors, importError)
	}

	return errors, rows.Err()
}

// GetImportErrorsByType retrieves errors by type for an import session
func (r *BulkImportErrorRepository) GetImportErrorsByType(ctx context.Context, importID string, errorType entity.BulkImportErrorType) ([]entity.BulkImportError, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, import_id, row_number, type, severity, message, 
			   field, suggestion, context, row_data, question_id, 
			   is_recoverable, created_at
		FROM bulk_import_errors 
		WHERE import_id = $1 AND type = $2
		ORDER BY row_number ASC
	`, importID, errorType)
	if err != nil {
		return nil, fmt.Errorf("failed to query import errors by type: %w", err)
	}
	defer rows.Close()

	var errors []entity.BulkImportError
	for rows.Next() {
		var importError entity.BulkImportError
		err := rows.Scan(
			&importError.ID,
			&importError.ImportID,
			&importError.RowNumber,
			&importError.Type,
			&importError.Severity,
			&importError.Message,
			&importError.Field,
			&importError.Suggestion,
			&importError.Context,
			&importError.RowData,
			&importError.QuestionID,
			&importError.IsRecoverable,
			&importError.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan import error: %w", err)
		}
		errors = append(errors, importError)
	}

	return errors, rows.Err()
}

// GetRecoverableErrors retrieves recoverable errors for an import session
func (r *BulkImportErrorRepository) GetRecoverableErrors(ctx context.Context, importID string) ([]entity.BulkImportError, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, import_id, row_number, type, severity, message, 
			   field, suggestion, context, row_data, question_id, 
			   is_recoverable, created_at
		FROM bulk_import_errors 
		WHERE import_id = $1 AND is_recoverable = true
		ORDER BY row_number ASC
	`, importID)
	if err != nil {
		return nil, fmt.Errorf("failed to query recoverable errors: %w", err)
	}
	defer rows.Close()

	var errors []entity.BulkImportError
	for rows.Next() {
		var importError entity.BulkImportError
		err := rows.Scan(
			&importError.ID,
			&importError.ImportID,
			&importError.RowNumber,
			&importError.Type,
			&importError.Severity,
			&importError.Message,
			&importError.Field,
			&importError.Suggestion,
			&importError.Context,
			&importError.RowData,
			&importError.QuestionID,
			&importError.IsRecoverable,
			&importError.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan recoverable error: %w", err)
		}
		errors = append(errors, importError)
	}

	return errors, rows.Err()
}

// GetImportStatistics retrieves comprehensive import statistics
func (r *BulkImportErrorRepository) GetImportStatistics(ctx context.Context) (*entity.BulkImportStatistics, error) {
	stats := &entity.BulkImportStatistics{
		ErrorsByType:     make(map[entity.BulkImportErrorType]int64),
		ErrorsBySeverity: make(map[entity.BulkImportErrorSeverity]int64),
		LastUpdated:      time.Now(),
	}

	// Get session statistics
	err := r.db.QueryRow(ctx, `
		SELECT 
			COUNT(*) as total_imports,
			COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as successful_imports,
			COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed_imports,
			COUNT(CASE WHEN status = 'PARTIAL' THEN 1 END) as partial_imports,
			COALESCE(SUM(success_rows), 0) as total_questions,
			COALESCE(AVG(EXTRACT(EPOCH FROM (end_time - start_time))), 0) as avg_processing_time
		FROM bulk_import_sessions
		WHERE end_time IS NOT NULL
	`).Scan(
		&stats.TotalImports,
		&stats.SuccessfulImports,
		&stats.FailedImports,
		&stats.PartialImports,
		&stats.TotalQuestions,
		&stats.AverageProcessingTime,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get session statistics: %w", err)
	}

	// Convert seconds to duration
	stats.AverageProcessingTime = time.Duration(stats.AverageProcessingTime) * time.Second

	// Get error type statistics
	rows, err := r.db.Query(ctx, `
		SELECT type, COUNT(*) as count
		FROM bulk_import_errors 
		GROUP BY type
		ORDER BY count DESC
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to query error type statistics: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var errorType string
		var count int64
		err := rows.Scan(&errorType, &count)
		if err != nil {
			return nil, fmt.Errorf("failed to scan error type stats: %w", err)
		}
		stats.ErrorsByType[entity.BulkImportErrorType(errorType)] = count
	}

	// Get error severity statistics
	rows, err = r.db.Query(ctx, `
		SELECT severity, COUNT(*) as count
		FROM bulk_import_errors 
		GROUP BY severity
		ORDER BY count DESC
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to query severity statistics: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var severity string
		var count int64
		err := rows.Scan(&severity, &count)
		if err != nil {
			return nil, fmt.Errorf("failed to scan severity stats: %w", err)
		}
		stats.ErrorsBySeverity[entity.BulkImportErrorSeverity(severity)] = count
	}

	return stats, nil
}

// GetRecentImportSessions retrieves recent import sessions
func (r *BulkImportErrorRepository) GetRecentImportSessions(ctx context.Context, limit int) ([]entity.BulkImportSession, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, type, status, total_rows, processed_rows, success_rows, 
			   error_rows, warning_rows, start_time, end_time, creator, 
			   file_name, file_size, options, created_at, updated_at
		FROM bulk_import_sessions 
		ORDER BY created_at DESC
		LIMIT $1
	`, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to query recent import sessions: %w", err)
	}
	defer rows.Close()

	var sessions []entity.BulkImportSession
	for rows.Next() {
		var session entity.BulkImportSession
		err := rows.Scan(
			&session.ID,
			&session.Type,
			&session.Status,
			&session.TotalRows,
			&session.ProcessedRows,
			&session.SuccessRows,
			&session.ErrorRows,
			&session.WarningRows,
			&session.StartTime,
			&session.EndTime,
			&session.Creator,
			&session.FileName,
			&session.FileSize,
			&session.Options,
			&session.CreatedAt,
			&session.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan import session: %w", err)
		}
		sessions = append(sessions, session)
	}

	return sessions, rows.Err()
}

// CleanupOldImportData removes old import sessions and errors
func (r *BulkImportErrorRepository) CleanupOldImportData(ctx context.Context, olderThan time.Time) error {
	// Delete old errors first (due to foreign key constraint)
	_, err := r.db.Exec(ctx, `
		DELETE FROM bulk_import_errors 
		WHERE import_id IN (
			SELECT id FROM bulk_import_sessions 
			WHERE created_at < $1
		)
	`, olderThan)
	if err != nil {
		return fmt.Errorf("failed to cleanup old import errors: %w", err)
	}

	// Delete old sessions
	_, err = r.db.Exec(ctx, `
		DELETE FROM bulk_import_sessions 
		WHERE created_at < $1
	`, olderThan)
	if err != nil {
		return fmt.Errorf("failed to cleanup old import sessions: %w", err)
	}

	return nil
}

