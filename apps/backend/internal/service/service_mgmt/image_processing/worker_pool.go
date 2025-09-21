package image_processing

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
)

// JobType defines the type of image processing job
type JobType string

const (
	JobTypeTikZ            JobType = "tikz"
	JobTypeIncludegraphics JobType = "includegraphics"
)

// Job represents an image processing job
type Job struct {
	ID         string
	Type       JobType
	Input      string // TikZ code or image path
	OutputName string
	RetryCount int
	MaxRetries int
	CreatedAt  time.Time
}

// JobResult represents the result of a job
type JobResult struct {
	JobID      string
	OutputPath string
	Error      error
	Duration   time.Duration
}

// WorkerPool manages concurrent image processing jobs
type WorkerPool struct {
	service     *ImageProcessingService
	logger      *logrus.Logger
	maxWorkers  int
	jobQueue    chan *Job
	resultQueue chan *JobResult
	workerWg    sync.WaitGroup
	ctx         context.Context
	cancel      context.CancelFunc
	retryPolicy *RetryPolicy
	metrics     *Metrics
}

// RetryPolicy defines retry behavior
type RetryPolicy struct {
	MaxRetries     int
	InitialBackoff time.Duration
	MaxBackoff     time.Duration
	BackoffFactor  float64
}

// Metrics tracks processing metrics
type Metrics struct {
	mu              sync.RWMutex
	TotalJobs       int64
	SuccessfulJobs  int64
	FailedJobs      int64
	RetryCount      int64
	TotalDuration   time.Duration
	AverageDuration time.Duration
}

// NewWorkerPool creates a new worker pool
func NewWorkerPool(service *ImageProcessingService, logger *logrus.Logger, maxWorkers int) *WorkerPool {
	if maxWorkers <= 0 {
		maxWorkers = 5
	}

	ctx, cancel := context.WithCancel(context.Background())

	return &WorkerPool{
		service:     service,
		logger:      logger,
		maxWorkers:  maxWorkers,
		jobQueue:    make(chan *Job, maxWorkers*2),
		resultQueue: make(chan *JobResult, maxWorkers*2),
		ctx:         ctx,
		cancel:      cancel,
		retryPolicy: &RetryPolicy{
			MaxRetries:     3,
			InitialBackoff: 1 * time.Second,
			MaxBackoff:     30 * time.Second,
			BackoffFactor:  2.0,
		},
		metrics: &Metrics{},
	}
}

// Start starts the worker pool
func (p *WorkerPool) Start() {
	p.logger.WithField("workers", p.maxWorkers).Info("Starting worker pool")

	// Start workers
	for i := 0; i < p.maxWorkers; i++ {
		p.workerWg.Add(1)
		go p.worker(i)
	}

	// Start result processor
	go p.processResults()
}

// Stop stops the worker pool
func (p *WorkerPool) Stop() {
	p.logger.Info("Stopping worker pool")

	// Cancel context to signal workers to stop
	p.cancel()

	// Close job queue
	close(p.jobQueue)

	// Wait for all workers to finish
	p.workerWg.Wait()

	// Close result queue
	close(p.resultQueue)

	// Cleanup service
	if err := p.service.Cleanup(); err != nil {
		p.logger.WithError(err).Error("Failed to cleanup service")
	}

	p.logger.Info("Worker pool stopped")
}

// SubmitJob submits a job to the worker pool
func (p *WorkerPool) SubmitJob(ctx context.Context, job *Job) (*JobResult, error) {
	// Check if pool is running
	select {
	case <-p.ctx.Done():
		return nil, fmt.Errorf("worker pool is stopped")
	default:
	}

	// Set defaults
	if job.MaxRetries == 0 {
		job.MaxRetries = p.retryPolicy.MaxRetries
	}
	job.CreatedAt = time.Now()

	// Submit job with timeout
	select {
	case p.jobQueue <- job:
		p.logger.WithFields(logrus.Fields{
			"job_id":   job.ID,
			"job_type": job.Type,
		}).Debug("Job submitted")
	case <-ctx.Done():
		return nil, fmt.Errorf("context cancelled while submitting job")
	case <-time.After(30 * time.Second):
		return nil, fmt.Errorf("timeout submitting job")
	}

	// Wait for result
	resultChan := make(chan *JobResult, 1)
	go func() {
		for result := range p.resultQueue {
			if result.JobID == job.ID {
				resultChan <- result
				return
			}
		}
	}()

	select {
	case result := <-resultChan:
		return result, nil
	case <-ctx.Done():
		return nil, fmt.Errorf("context cancelled while waiting for result")
	case <-time.After(2 * time.Minute):
		return nil, fmt.Errorf("timeout waiting for job result")
	}
}

// worker processes jobs from the queue
func (p *WorkerPool) worker(id int) {
	defer p.workerWg.Done()

	p.logger.WithField("worker_id", id).Debug("Worker started")

	for {
		select {
		case job, ok := <-p.jobQueue:
			if !ok {
				p.logger.WithField("worker_id", id).Debug("Worker stopping - queue closed")
				return
			}
			p.processJob(job)
		case <-p.ctx.Done():
			p.logger.WithField("worker_id", id).Debug("Worker stopping - context cancelled")
			return
		}
	}
}

// processJob processes a single job with retry logic
func (p *WorkerPool) processJob(job *Job) {
	startTime := time.Now()
	var lastError error

	for attempt := 0; attempt <= job.MaxRetries; attempt++ {
		if attempt > 0 {
			// Apply backoff
			backoff := p.calculateBackoff(attempt)
			p.logger.WithFields(logrus.Fields{
				"job_id":  job.ID,
				"attempt": attempt,
				"backoff": backoff,
			}).Debug("Retrying job after backoff")
			time.Sleep(backoff)

			p.updateMetrics(func(m *Metrics) {
				m.RetryCount++
			})
		}

		// Process based on job type
		result, err := p.executeJob(job)
		if err == nil {
			// Success
			duration := time.Since(startTime)
			p.resultQueue <- &JobResult{
				JobID:      job.ID,
				OutputPath: result,
				Error:      nil,
				Duration:   duration,
			}

			p.updateMetrics(func(m *Metrics) {
				m.TotalJobs++
				m.SuccessfulJobs++
				m.TotalDuration += duration
				m.AverageDuration = m.TotalDuration / time.Duration(m.SuccessfulJobs)
			})

			p.logger.WithFields(logrus.Fields{
				"job_id":   job.ID,
				"duration": duration,
				"output":   result,
			}).Info("Job completed successfully")
			return
		}

		lastError = err
		p.logger.WithFields(logrus.Fields{
			"job_id":  job.ID,
			"attempt": attempt,
			"error":   err,
		}).Warn("Job failed")
	}

	// All retries exhausted
	duration := time.Since(startTime)
	p.resultQueue <- &JobResult{
		JobID:      job.ID,
		OutputPath: "",
		Error:      fmt.Errorf("job failed after %d retries: %w", job.MaxRetries, lastError),
		Duration:   duration,
	}

	p.updateMetrics(func(m *Metrics) {
		m.TotalJobs++
		m.FailedJobs++
	})

	p.logger.WithFields(logrus.Fields{
		"job_id":      job.ID,
		"max_retries": job.MaxRetries,
		"error":       lastError,
	}).Error("Job failed after all retries")
}

// executeJob executes a job based on its type
func (p *WorkerPool) executeJob(job *Job) (string, error) {
	ctx, cancel := context.WithTimeout(p.ctx, 1*time.Minute)
	defer cancel()

	switch job.Type {
	case JobTypeTikZ:
		return p.service.ProcessTikZ(ctx, job.Input, job.OutputName)
	case JobTypeIncludegraphics:
		return p.service.ProcessIncludegraphics(ctx, job.Input, job.OutputName)
	default:
		return "", fmt.Errorf("unknown job type: %s", job.Type)
	}
}

// calculateBackoff calculates backoff duration for retry
func (p *WorkerPool) calculateBackoff(attempt int) time.Duration {
	backoff := float64(p.retryPolicy.InitialBackoff) *
		pow(p.retryPolicy.BackoffFactor, float64(attempt-1))

	if backoff > float64(p.retryPolicy.MaxBackoff) {
		backoff = float64(p.retryPolicy.MaxBackoff)
	}

	return time.Duration(backoff)
}

// pow calculates x^y for float64
func pow(x, y float64) float64 {
	if y == 0 {
		return 1
	}
	result := x
	for i := 1; i < int(y); i++ {
		result *= x
	}
	return result
}

// processResults processes job results
func (p *WorkerPool) processResults() {
	for result := range p.resultQueue {
		if result.Error != nil {
			p.logger.WithFields(logrus.Fields{
				"job_id": result.JobID,
				"error":  result.Error,
			}).Error("Job result with error")
		} else {
			p.logger.WithFields(logrus.Fields{
				"job_id":   result.JobID,
				"output":   result.OutputPath,
				"duration": result.Duration,
			}).Info("Job result success")
		}
	}
}

// updateMetrics safely updates metrics
func (p *WorkerPool) updateMetrics(update func(*Metrics)) {
	p.metrics.mu.Lock()
	defer p.metrics.mu.Unlock()
	update(p.metrics)
}

// GetMetrics returns current metrics (copy without mutex)
func (p *WorkerPool) GetMetrics() Metrics {
	p.metrics.mu.RLock()
	defer p.metrics.mu.RUnlock()

	// Return a copy without the mutex to avoid copying lock value
	return Metrics{
		TotalJobs:       p.metrics.TotalJobs,
		SuccessfulJobs:  p.metrics.SuccessfulJobs,
		FailedJobs:      p.metrics.FailedJobs,
		RetryCount:      p.metrics.RetryCount,
		TotalDuration:   p.metrics.TotalDuration,
		AverageDuration: p.metrics.AverageDuration,
	}
}

// SetRetryPolicy updates the retry policy
func (p *WorkerPool) SetRetryPolicy(policy *RetryPolicy) {
	p.retryPolicy = policy
}
