package util

import (
	"context"
	"fmt"
	"log"
	"time"
)

// Span represents a tracing span
type Span struct {
	OperationName string
	StartTime     time.Time
	ctx           context.Context
}

// StartSpan starts a new tracing span
func StartSpan(ctx context.Context, operationName string) (*Span, context.Context) {
	span := &Span{
		OperationName: operationName,
		StartTime:     time.Now(),
		ctx:           ctx,
	}

	// Log the start of the operation
	log.Printf("[TRACE] Starting operation: %s", operationName)

	// In a real implementation, this would integrate with a tracing system like Jaeger or OpenTelemetry
	spanCtx := context.WithValue(ctx, "span", span)

	return span, spanCtx
}

// Finish finishes the span and logs the duration
func (s *Span) Finish() {
	duration := time.Since(s.StartTime)
	log.Printf("[TRACE] Finished operation: %s (duration: %v)", s.OperationName, duration)
}

// FinishWithError finishes the span with an error
func (s *Span) FinishWithError(err error) {
	duration := time.Since(s.StartTime)
	log.Printf("[TRACE] Finished operation: %s with error: %v (duration: %v)", s.OperationName, err, duration)
}

// SetTag sets a tag on the span (placeholder for real tracing implementation)
func (s *Span) SetTag(key string, value interface{}) {
	log.Printf("[TRACE] %s: %s = %v", s.OperationName, key, value)
}

// LogFields logs fields to the span (placeholder for real tracing implementation)
func (s *Span) LogFields(fields ...interface{}) {
	log.Printf("[TRACE] %s: %v", s.OperationName, fmt.Sprint(fields...))
}
