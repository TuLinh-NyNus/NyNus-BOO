package performance

import (
	"context"
	"database/sql"
	"fmt"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
)

// BatchProcessor handles batch processing operations for performance optimization
type BatchProcessor struct {
	db              *sql.DB
	logger          *logrus.Logger
	processingMutex sync.Mutex
	isRunning       bool
	stopChan        chan struct{}
	wg              sync.WaitGroup
}

// NewBatchProcessor creates a new batch processor
func NewBatchProcessor(db *sql.DB, logger *logrus.Logger) *BatchProcessor {
	if logger == nil {
		logger = logrus.New()
		logger.SetFormatter(&logrus.TextFormatter{
			FullTimestamp: true,
		})
	}

	return &BatchProcessor{
		db:       db,
		logger:   logger,
		stopChan: make(chan struct{}),
	}
}

// ProcessingResult represents the result of a batch processing operation
type ProcessingResult struct {
	ProcessedCount   int       `json:"processed_count"`
	QuestionsUpdated int       `json:"questions_updated"`
	ProcessedAt      time.Time `json:"processed_at"`
	Duration         time.Duration `json:"duration"`
}

// Start starts the batch processor with specified interval
func (bp *BatchProcessor) Start(ctx context.Context, interval time.Duration) error {
	bp.processingMutex.Lock()
	defer bp.processingMutex.Unlock()

	if bp.isRunning {
		return fmt.Errorf("batch processor is already running")
	}

	bp.isRunning = true
	bp.logger.Printf("Starting batch processor with interval: %v", interval)

	bp.wg.Add(1)
	go bp.processingLoop(ctx, interval)

	return nil
}

// Stop stops the batch processor
func (bp *BatchProcessor) Stop() error {
	bp.processingMutex.Lock()
	defer bp.processingMutex.Unlock()

	if !bp.isRunning {
		return fmt.Errorf("batch processor is not running")
	}

	bp.logger.Println("Stopping batch processor...")
	close(bp.stopChan)
	bp.wg.Wait()
	bp.isRunning = false
	bp.logger.Println("Batch processor stopped")

	return nil
}

// IsRunning returns whether the batch processor is currently running
func (bp *BatchProcessor) IsRunning() bool {
	bp.processingMutex.Lock()
	defer bp.processingMutex.Unlock()
	return bp.isRunning
}

// processingLoop runs the main processing loop
func (bp *BatchProcessor) processingLoop(ctx context.Context, interval time.Duration) {
	defer bp.wg.Done()

	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			bp.logger.Println("Processing loop stopped due to context cancellation")
			return
		case <-bp.stopChan:
			bp.logger.Println("Processing loop stopped due to stop signal")
			return
		case <-ticker.C:
			if _, err := bp.processUsageQueue(ctx); err != nil {
				bp.logger.Printf("Error processing usage queue: %v", err)
			}
		}
	}
}

// ProcessUsageQueue processes the question usage queue
func (bp *BatchProcessor) ProcessUsageQueue(ctx context.Context) (*ProcessingResult, error) {
	return bp.processUsageQueue(ctx)
}

// processUsageQueue processes the question usage queue (internal)
func (bp *BatchProcessor) processUsageQueue(ctx context.Context) (*ProcessingResult, error) {
	startTime := time.Now()

	query := `SELECT processed_count, questions_updated FROM process_usage_queue()`

	var processedCount, questionsUpdated int
	err := bp.db.QueryRowContext(ctx, query).Scan(&processedCount, &questionsUpdated)
	if err != nil {
		return nil, fmt.Errorf("failed to process usage queue: %w", err)
	}

	duration := time.Since(startTime)

	result := &ProcessingResult{
		ProcessedCount:   processedCount,
		QuestionsUpdated: questionsUpdated,
		ProcessedAt:      startTime,
		Duration:         duration,
	}

	if processedCount > 0 {
		bp.logger.Printf("Processed %d usage entries, updated %d questions in %v",
			processedCount, questionsUpdated, duration)
	}

	return result, nil
}

// QueueQuestionUsage adds a question usage entry to the queue
func (bp *BatchProcessor) QueueQuestionUsage(ctx context.Context, questionID string, incrementValue int) error {
	query := `
		INSERT INTO question_usage_queue (question_id, increment_value)
		VALUES ($1, $2)
	`

	_, err := bp.db.ExecContext(ctx, query, questionID, incrementValue)
	if err != nil {
		return fmt.Errorf("failed to queue question usage: %w", err)
	}

	return nil
}

// GetQueueStats returns statistics about the usage queue
func (bp *BatchProcessor) GetQueueStats(ctx context.Context) (*QueueStats, error) {
	query := `
		SELECT 
			COUNT(*) as total_entries,
			COUNT(CASE WHEN processed = FALSE THEN 1 END) as unprocessed_entries,
			COUNT(CASE WHEN processed = TRUE THEN 1 END) as processed_entries,
			COALESCE(MIN(created_at), NOW()) as oldest_entry,
			COALESCE(MAX(created_at), NOW()) as newest_entry
		FROM question_usage_queue
	`

	var stats QueueStats
	err := bp.db.QueryRowContext(ctx, query).Scan(
		&stats.TotalEntries,
		&stats.UnprocessedEntries,
		&stats.ProcessedEntries,
		&stats.OldestEntry,
		&stats.NewestEntry,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get queue stats: %w", err)
	}

	return &stats, nil
}

// QueueStats represents statistics about the usage queue
type QueueStats struct {
	TotalEntries       int       `json:"total_entries"`
	UnprocessedEntries int       `json:"unprocessed_entries"`
	ProcessedEntries   int       `json:"processed_entries"`
	OldestEntry        time.Time `json:"oldest_entry"`
	NewestEntry        time.Time `json:"newest_entry"`
}

// CleanupProcessedEntries removes old processed entries from the queue
func (bp *BatchProcessor) CleanupProcessedEntries(ctx context.Context, olderThan time.Duration) (int, error) {
	query := `
		DELETE FROM question_usage_queue 
		WHERE processed = TRUE 
		AND created_at < $1
	`

	cutoffTime := time.Now().Add(-olderThan)
	result, err := bp.db.ExecContext(ctx, query, cutoffTime)
	if err != nil {
		return 0, fmt.Errorf("failed to cleanup processed entries: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected > 0 {
		bp.logger.Printf("Cleaned up %d processed entries older than %v", rowsAffected, olderThan)
	}

	return int(rowsAffected), nil
}

// BatchUsageUpdate represents a batch of usage updates
type BatchUsageUpdate struct {
	QuestionID      string `json:"question_id"`
	IncrementValue  int    `json:"increment_value"`
}

// QueueBatchUsageUpdates queues multiple usage updates in a single transaction
func (bp *BatchProcessor) QueueBatchUsageUpdates(ctx context.Context, updates []BatchUsageUpdate) error {
	if len(updates) == 0 {
		return nil
	}

	tx, err := bp.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	stmt, err := tx.PrepareContext(ctx, `
		INSERT INTO question_usage_queue (question_id, increment_value)
		VALUES ($1, $2)
	`)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	for _, update := range updates {
		_, err := stmt.ExecContext(ctx, update.QuestionID, update.IncrementValue)
		if err != nil {
			return fmt.Errorf("failed to queue usage update for question %s: %w", update.QuestionID, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	bp.logger.Printf("Queued %d usage updates in batch", len(updates))
	return nil
}

// GetProcessingHistory returns recent processing history
func (bp *BatchProcessor) GetProcessingHistory(ctx context.Context, limit int) ([]ProcessingResult, error) {
	// This would require a separate table to store processing history
	// For now, we'll return an empty slice
	// In a real implementation, you'd create a processing_history table
	return []ProcessingResult{}, nil
}

// ForceProcessing forces immediate processing of the queue
func (bp *BatchProcessor) ForceProcessing(ctx context.Context) (*ProcessingResult, error) {
	bp.logger.Println("Force processing usage queue...")
	return bp.processUsageQueue(ctx)
}
