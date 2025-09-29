package performance

import (
	"context"
	"database/sql"
	"testing"
	"time"

	_ "github.com/lib/pq"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestPerformanceService tests the performance service functionality
func TestPerformanceService(t *testing.T) {
	// Skip if no database connection available
	if testing.Short() {
		t.Skip("Skipping performance service test in short mode")
	}

	// Create test database connection
	db, err := sql.Open("postgres", "postgres://exam_bank_user:exam_bank_password@localhost:5439/exam_bank_db?sslmode=disable")
	if err != nil {
		t.Skipf("Skipping test - database not available: %v", err)
	}
	defer db.Close()

	// Test database connection
	if err := db.Ping(); err != nil {
		t.Skipf("Skipping test - database not reachable: %v", err)
	}

	logger := logrus.New()
	logger.SetLevel(logrus.WarnLevel) // Reduce noise in tests

	t.Run("NewPerformanceService", func(t *testing.T) {
		config := DefaultConfig()
		service := NewPerformanceService(db, config, logger)

		assert.NotNil(t, service)
		assert.NotNil(t, service.GetOptimisticLockingService())
		assert.NotNil(t, service.GetBatchProcessor())
		assert.NotNil(t, service.GetPerformanceMonitor())
		assert.NotNil(t, service.GetConnectionPoolOptimizer())
		assert.False(t, service.IsRunning())
	})

	t.Run("StartAndStop", func(t *testing.T) {
		config := &Config{
			BatchProcessingInterval:     1 * time.Second,
			MetricsCollectionInterval:   1 * time.Second,
			PoolOptimizationInterval:    5 * time.Second,
			EnableAutomaticOptimization: false, // Disable to avoid interference
			EnableBatchProcessing:       true,
			EnableMetricsCollection:     true,
		}

		service := NewPerformanceService(db, config, logger)

		// Test start
		err := service.Start(config)
		require.NoError(t, err)
		assert.True(t, service.IsRunning())

		// Test double start (should fail)
		err = service.Start(config)
		assert.Error(t, err)

		// Wait a bit for services to initialize
		time.Sleep(2 * time.Second)

		// Test stop
		err = service.Stop()
		require.NoError(t, err)
		assert.False(t, service.IsRunning())

		// Test double stop (should fail)
		err = service.Stop()
		assert.Error(t, err)
	})

	t.Run("HealthCheck", func(t *testing.T) {
		config := DefaultConfig()
		service := NewPerformanceService(db, config, logger)

		ctx := context.Background()
		health, err := service.HealthCheck(ctx)
		require.NoError(t, err)
		assert.NotNil(t, health)
		assert.Contains(t, health.Services, "batch_processor")
		assert.Contains(t, health.Services, "performance_monitor")
		assert.Contains(t, health.Services, "connection_pool_optimizer")
	})

	t.Run("GetPerformanceSummary", func(t *testing.T) {
		config := DefaultConfig()
		service := NewPerformanceService(db, config, logger)

		ctx := context.Background()
		summary, err := service.GetPerformanceSummary(ctx)
		require.NoError(t, err)
		assert.NotNil(t, summary)
		assert.NotNil(t, summary.SystemMetrics)
	})
}

// TestOptimisticLocking tests optimistic locking functionality
func TestOptimisticLocking(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping optimistic locking test in short mode")
	}

	// Create test database connection
	db, err := sql.Open("postgres", "postgres://exam_bank_user:exam_bank_password@localhost:5439/exam_bank_db?sslmode=disable")
	if err != nil {
		t.Skipf("Skipping test - database not available: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		t.Skipf("Skipping test - database not reachable: %v", err)
	}

	service := NewOptimisticLockingService(db)
	ctx := context.Background()

	t.Run("GetExamVersion", func(t *testing.T) {
		// This test assumes there's at least one exam in the database
		// In a real test, you'd create test data first

		// For now, just test that the function doesn't crash
		_, err := service.GetExamVersion(ctx, "non-existent-id")
		assert.Error(t, err) // Should error for non-existent exam
	})

	t.Run("ConflictError", func(t *testing.T) {
		conflictErr := NewConflictError("exam", "test-id", 1, 2, "test conflict")
		assert.True(t, IsConflictError(conflictErr))
		assert.Contains(t, conflictErr.Error(), "optimistic locking conflict")

		regularErr := assert.AnError
		assert.False(t, IsConflictError(regularErr))
	})
}

// TestBatchProcessor tests batch processing functionality
func TestBatchProcessor(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping batch processor test in short mode")
	}

	// Create test database connection
	db, err := sql.Open("postgres", "postgres://exam_bank_user:exam_bank_password@localhost:5439/exam_bank_db?sslmode=disable")
	if err != nil {
		t.Skipf("Skipping test - database not available: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		t.Skipf("Skipping test - database not reachable: %v", err)
	}

	logger := logrus.New()
	logger.SetLevel(logrus.WarnLevel)

	processor := NewBatchProcessor(db, logger)
	ctx := context.Background()

	t.Run("StartAndStop", func(t *testing.T) {
		assert.False(t, processor.IsRunning())

		err := processor.Start(ctx, 1*time.Second)
		require.NoError(t, err)
		assert.True(t, processor.IsRunning())

		// Test double start
		err = processor.Start(ctx, 1*time.Second)
		assert.Error(t, err)

		err = processor.Stop()
		require.NoError(t, err)
		assert.False(t, processor.IsRunning())

		// Test double stop
		err = processor.Stop()
		assert.Error(t, err)
	})

	t.Run("GetQueueStats", func(t *testing.T) {
		stats, err := processor.GetQueueStats(ctx)
		require.NoError(t, err)
		assert.NotNil(t, stats)
		assert.GreaterOrEqual(t, stats.TotalEntries, 0)
	})

	t.Run("ProcessUsageQueue", func(t *testing.T) {
		result, err := processor.ProcessUsageQueue(ctx)
		require.NoError(t, err)
		assert.NotNil(t, result)
		assert.GreaterOrEqual(t, result.ProcessedCount, 0)
	})
}

// TestPerformanceMonitor tests performance monitoring functionality
func TestPerformanceMonitor(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping performance monitor test in short mode")
	}

	// Create test database connection
	db, err := sql.Open("postgres", "postgres://exam_bank_user:exam_bank_password@localhost:5439/exam_bank_db?sslmode=disable")
	if err != nil {
		t.Skipf("Skipping test - database not available: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		t.Skipf("Skipping test - database not reachable: %v", err)
	}

	logger := logrus.New()
	logger.SetLevel(logrus.WarnLevel)

	monitor := NewPerformanceMonitor(db, logger)
	ctx := context.Background()

	t.Run("CollectSystemMetrics", func(t *testing.T) {
		metrics := monitor.CollectSystemMetrics()
		assert.NotNil(t, metrics)
		assert.Greater(t, metrics.MemoryUsageBytes, uint64(0))
		assert.Greater(t, metrics.GoroutineCount, 0)
	})

	t.Run("RecordAndGetMetric", func(t *testing.T) {
		metric := &PerformanceMetric{
			Name:      "test_metric",
			Value:     123.45,
			Unit:      "ms",
			Context:   map[string]interface{}{"test": "value"},
			Timestamp: time.Now(),
		}

		err := monitor.RecordMetric(ctx, metric)
		require.NoError(t, err)

		// Get the metric back
		retrieved, err := monitor.GetMetric(ctx, "test_metric")
		require.NoError(t, err)
		assert.Equal(t, metric.Value, retrieved.Value)
		assert.Equal(t, metric.Unit, retrieved.Unit)
	})

	t.Run("RecordSystemMetrics", func(t *testing.T) {
		err := monitor.RecordSystemMetrics(ctx)
		require.NoError(t, err)
	})
}
