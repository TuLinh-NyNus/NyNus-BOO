package performance

import (
	"context"
	"database/sql"
	"fmt"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
)

// PerformanceService is the main service that coordinates all performance optimization components
type PerformanceService struct {
	db                      *sql.DB
	logger                  *logrus.Logger
	
	// Sub-services
	optimisticLocking       *OptimisticLockingService
	batchProcessor          *BatchProcessor
	performanceMonitor      *PerformanceMonitor
	connectionPoolOptimizer *ConnectionPoolOptimizer
	
	// Service state
	isRunning               bool
	mutex                   sync.RWMutex
	ctx                     context.Context
	cancel                  context.CancelFunc
	wg                      sync.WaitGroup
}

// Config represents performance service configuration
type Config struct {
	BatchProcessingInterval    time.Duration `json:"batch_processing_interval"`
	MetricsCollectionInterval  time.Duration `json:"metrics_collection_interval"`
	PoolOptimizationInterval   time.Duration `json:"pool_optimization_interval"`
	EnableAutomaticOptimization bool         `json:"enable_automatic_optimization"`
	EnableBatchProcessing      bool          `json:"enable_batch_processing"`
	EnableMetricsCollection    bool          `json:"enable_metrics_collection"`
}

// DefaultConfig returns default configuration
func DefaultConfig() *Config {
	return &Config{
		BatchProcessingInterval:     5 * time.Minute,
		MetricsCollectionInterval:   30 * time.Second,
		PoolOptimizationInterval:    15 * time.Minute,
		EnableAutomaticOptimization: true,
		EnableBatchProcessing:       true,
		EnableMetricsCollection:     true,
	}
}

// NewPerformanceService creates a new performance service
func NewPerformanceService(db *sql.DB, config *Config, logger *logrus.Logger) *PerformanceService {
	if config == nil {
		config = DefaultConfig()
	}
	
	if logger == nil {
		logger = logrus.New()
		logger.SetFormatter(&logrus.TextFormatter{
			FullTimestamp: true,
		})
	}

	ctx, cancel := context.WithCancel(context.Background())

	// Initialize sub-services
	performanceMonitor := NewPerformanceMonitor(db, logger)
	optimisticLocking := NewOptimisticLockingService(db)
	batchProcessor := NewBatchProcessor(db, logger)
	connectionPoolOptimizer := NewConnectionPoolOptimizer(db, performanceMonitor, logger)

	return &PerformanceService{
		db:                      db,
		logger:                  logger,
		optimisticLocking:       optimisticLocking,
		batchProcessor:          batchProcessor,
		performanceMonitor:      performanceMonitor,
		connectionPoolOptimizer: connectionPoolOptimizer,
		ctx:                     ctx,
		cancel:                  cancel,
	}
}

// Start starts all performance optimization services
func (ps *PerformanceService) Start(config *Config) error {
	ps.mutex.Lock()
	defer ps.mutex.Unlock()

	if ps.isRunning {
		return fmt.Errorf("performance service is already running")
	}

	ps.logger.Println("Starting performance service...")

	// Start batch processor
	if config.EnableBatchProcessing {
		if err := ps.batchProcessor.Start(ps.ctx, config.BatchProcessingInterval); err != nil {
			return fmt.Errorf("failed to start batch processor: %w", err)
		}
		ps.logger.Printf("Batch processor started with interval: %v", config.BatchProcessingInterval)
	}

	// Start metrics collection
	if config.EnableMetricsCollection {
		ps.wg.Add(1)
		go func() {
			defer ps.wg.Done()
			ps.performanceMonitor.StartPeriodicCollection(ps.ctx, config.MetricsCollectionInterval)
		}()
		ps.logger.Printf("Metrics collection started with interval: %v", config.MetricsCollectionInterval)
	}

	// Start connection pool optimization
	if config.EnableAutomaticOptimization {
		ps.wg.Add(1)
		go func() {
			defer ps.wg.Done()
			ps.connectionPoolOptimizer.StartPeriodicOptimization(ps.ctx, config.PoolOptimizationInterval)
		}()
		ps.logger.Printf("Connection pool optimization started with interval: %v", config.PoolOptimizationInterval)
	}

	ps.isRunning = true
	ps.logger.Println("Performance service started successfully")

	return nil
}

// Stop stops all performance optimization services
func (ps *PerformanceService) Stop() error {
	ps.mutex.Lock()
	defer ps.mutex.Unlock()

	if !ps.isRunning {
		return fmt.Errorf("performance service is not running")
	}

	ps.logger.Println("Stopping performance service...")

	// Cancel context to stop all goroutines
	ps.cancel()

	// Stop batch processor
	if err := ps.batchProcessor.Stop(); err != nil {
		ps.logger.Printf("Error stopping batch processor: %v", err)
	}

	// Wait for all goroutines to finish
	ps.wg.Wait()

	ps.isRunning = false
	ps.logger.Println("Performance service stopped")

	return nil
}

// IsRunning returns whether the service is currently running
func (ps *PerformanceService) IsRunning() bool {
	ps.mutex.RLock()
	defer ps.mutex.RUnlock()
	return ps.isRunning
}

// GetOptimisticLockingService returns the optimistic locking service
func (ps *PerformanceService) GetOptimisticLockingService() *OptimisticLockingService {
	return ps.optimisticLocking
}

// GetBatchProcessor returns the batch processor
func (ps *PerformanceService) GetBatchProcessor() *BatchProcessor {
	return ps.batchProcessor
}

// GetPerformanceMonitor returns the performance monitor
func (ps *PerformanceService) GetPerformanceMonitor() *PerformanceMonitor {
	return ps.performanceMonitor
}

// GetConnectionPoolOptimizer returns the connection pool optimizer
func (ps *PerformanceService) GetConnectionPoolOptimizer() *ConnectionPoolOptimizer {
	return ps.connectionPoolOptimizer
}

// HealthCheck performs a health check on all performance services
func (ps *PerformanceService) HealthCheck(ctx context.Context) (*HealthStatus, error) {
	status := &HealthStatus{
		Timestamp: time.Now(),
		Services:  make(map[string]ServiceHealth),
	}

	// Check batch processor
	status.Services["batch_processor"] = ServiceHealth{
		Status:  "healthy",
		Running: ps.batchProcessor.IsRunning(),
	}

	// Check performance monitor
	systemMetrics := ps.performanceMonitor.CollectSystemMetrics()
	if systemMetrics == nil {
		status.Services["performance_monitor"] = ServiceHealth{
			Status:  "unhealthy",
			Running: false,
			Error:   "failed to collect system metrics",
		}
	} else {
		status.Services["performance_monitor"] = ServiceHealth{
			Status:  "healthy",
			Running: true,
		}
	}

	// Check connection pool
	if _, err := ps.connectionPoolOptimizer.CollectCurrentMetrics(ctx); err != nil {
		status.Services["connection_pool_optimizer"] = ServiceHealth{
			Status:  "unhealthy",
			Running: false,
			Error:   err.Error(),
		}
	} else {
		status.Services["connection_pool_optimizer"] = ServiceHealth{
			Status:  "healthy",
			Running: true,
		}
	}

	// Overall status
	status.Overall = "healthy"
	for _, service := range status.Services {
		if service.Status != "healthy" {
			status.Overall = "degraded"
			break
		}
	}

	return status, nil
}

// HealthStatus represents the health status of the performance service
type HealthStatus struct {
	Overall   string                    `json:"overall"`
	Timestamp time.Time                 `json:"timestamp"`
	Services  map[string]ServiceHealth  `json:"services"`
}

// ServiceHealth represents the health of an individual service
type ServiceHealth struct {
	Status  string `json:"status"`
	Running bool   `json:"running"`
	Error   string `json:"error,omitempty"`
}

// GetPerformanceSummary returns a summary of current performance metrics
func (ps *PerformanceService) GetPerformanceSummary(ctx context.Context) (*PerformanceSummary, error) {
	summary := &PerformanceSummary{
		Timestamp: time.Now(),
	}

	// Get system metrics
	summary.SystemMetrics = ps.performanceMonitor.CollectSystemMetrics()

	// Get connection pool stats
	if poolStats, err := ps.connectionPoolOptimizer.CollectCurrentMetrics(ctx); err == nil {
		summary.ConnectionPoolStats = poolStats
	}

	// Get batch processing stats
	if queueStats, err := ps.batchProcessor.GetQueueStats(ctx); err == nil {
		summary.BatchProcessingStats = queueStats
	}

	return summary, nil
}

// PerformanceSummary represents a summary of performance metrics
type PerformanceSummary struct {
	Timestamp            time.Time            `json:"timestamp"`
	SystemMetrics        *SystemMetrics       `json:"system_metrics"`
	ConnectionPoolStats  *ConnectionPoolStats `json:"connection_pool_stats"`
	BatchProcessingStats *QueueStats          `json:"batch_processing_stats"`
}

// OptimizeNow performs immediate optimization of all components
func (ps *PerformanceService) OptimizeNow(ctx context.Context) (*OptimizationSummary, error) {
	ps.logger.Println("Performing immediate optimization...")

	summary := &OptimizationSummary{
		Timestamp: time.Now(),
		Results:   make(map[string]interface{}),
	}

	// Force batch processing
	if batchResult, err := ps.batchProcessor.ForceProcessing(ctx); err == nil {
		summary.Results["batch_processing"] = batchResult
	} else {
		summary.Results["batch_processing"] = fmt.Sprintf("Error: %v", err)
	}

	// Optimize connection pool
	if poolResult, err := ps.connectionPoolOptimizer.OptimizeAutomatically(ctx); err == nil {
		summary.Results["connection_pool"] = poolResult
	} else {
		summary.Results["connection_pool"] = fmt.Sprintf("Error: %v", err)
	}

	// Record system metrics
	if err := ps.performanceMonitor.RecordSystemMetrics(ctx); err == nil {
		summary.Results["metrics_collection"] = "Success"
	} else {
		summary.Results["metrics_collection"] = fmt.Sprintf("Error: %v", err)
	}

	ps.logger.Println("Immediate optimization completed")
	return summary, nil
}

// OptimizationSummary represents the result of immediate optimization
type OptimizationSummary struct {
	Timestamp time.Time              `json:"timestamp"`
	Results   map[string]interface{} `json:"results"`
}
