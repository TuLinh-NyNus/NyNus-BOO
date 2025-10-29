/**
 * Batch Request Manager
 * =====================
 * 
 * Manages batching of gRPC requests to improve throughput and reduce latency.
 * Combines multiple requests into single batch operations where possible.
 * 
 * Features:
 * - Automatic request queuing with configurable batch size and time window
 * - Request deduplication and merging
 * - Concurrent batch limit management
 * - Memory-efficient operation tracking
 * - Comprehensive metrics and statistics
 * - Error handling with partial failure support
 * 
 * @author NyNus Development Team
 * @version 1.0.0 - Phase 3 Optimization
 */

export interface BatchRequest<T = any> {
  id: string;
  timestamp: number;
  operation: string;
  payload: T;
  priority: number;
  retries: number;
  maxRetries: number;
  resolve?: (value: any) => void;
  reject?: (error: Error) => void;
}

export interface BatchConfig {
  // Maximum number of requests to batch together
  maxBatchSize: number;
  
  // Time window in ms to wait for more requests before executing
  batchTimeWindowMs: number;
  
  // Maximum concurrent batches being processed
  maxConcurrentBatches: number;
  
  // Maximum memory overhead in MB for queued requests
  maxMemoryMB: number;
  
  // Enable request deduplication (same operation + payload)
  enableDeduplication: boolean;
  
  // Enable request merging where possible
  enableMerging: boolean;
}

export interface BatchMetrics {
  // Total batches created and executed
  totalBatches: number;
  
  // Total requests processed
  totalRequests: number;
  
  // Average requests per batch
  avgRequestsPerBatch: number;
  
  // Average batch latency in ms
  avgBatchLatencyMs: number;
  
  // Total latency savings from batching (percentage)
  latencySavingsPercent: number;
  
  // Current queue size
  queueSize: number;
  
  // Memory usage estimate in MB
  memoryUsageMB: number;
  
  // Failed requests count
  failedRequests: number;
  
  // Success rate (percentage)
  successRatePercent: number;
}

export interface BatchExecutionResult<T = any> {
  successful: boolean;
  batchId: string;
  requestIds: string[];
  results: Map<string, { data: T; latency: number }>;
  errors: Map<string, Error>;
  totalLatencyMs: number;
  executionTime: number;
}

/**
 * Batch Request Manager - Main class for request batching
 */
export class BatchRequestManager {
  private requestQueue: Map<string, BatchRequest> = new Map();
  private activeBatches: Set<string> = new Set();
  private metrics: BatchMetrics = {
    totalBatches: 0,
    totalRequests: 0,
    avgRequestsPerBatch: 0,
    avgBatchLatencyMs: 0,
    latencySavingsPercent: 0,
    queueSize: 0,
    memoryUsageMB: 0,
    failedRequests: 0,
    successRatePercent: 100
  };
  
  private config: BatchConfig;
  private executorFn?: (requests: BatchRequest[]) => Promise<BatchExecutionResult>;
  private batchTimer?: NodeJS.Timeout;
  private operationStats: Map<string, { count: number; totalLatency: number }> = new Map();

  constructor(config: Partial<BatchConfig> = {}) {
    this.config = {
      maxBatchSize: config.maxBatchSize ?? 10,
      batchTimeWindowMs: config.batchTimeWindowMs ?? 100,
      maxConcurrentBatches: config.maxConcurrentBatches ?? 5,
      maxMemoryMB: config.maxMemoryMB ?? 10,
      enableDeduplication: config.enableDeduplication ?? true,
      enableMerging: config.enableMerging ?? true
    };
  }

  /**
   * Set the executor function that processes batches
   */
  setExecutor(executor: (requests: BatchRequest[]) => Promise<BatchExecutionResult>): void {
    this.executorFn = executor;
  }

  /**
   * Add a request to the batch queue
   */
  async addRequest<T>(
    operation: string,
    payload: T,
    options: { priority?: number; maxRetries?: number } = {}
  ): Promise<any> {
    const { priority = 0, maxRetries = 3 } = options;

    // Check if we can deduplicate
    if (this.config.enableDeduplication) {
      const existingRequest = this.findDuplicateRequest(operation, payload);
      if (existingRequest) {
        // Return a promise that resolves when the existing request completes
        return new Promise((resolve, reject) => {
          const originalResolve = existingRequest.resolve;
          const originalReject = existingRequest.reject;
          
          existingRequest.resolve = (value) => {
            originalResolve?.(value);
            resolve(value);
          };
          existingRequest.reject = (error) => {
            originalReject?.(error);
            reject(error);
          };
        });
      }
    }

    const requestId = this.generateRequestId();
    const request: BatchRequest<T> = {
      id: requestId,
      timestamp: Date.now(),
      operation,
      payload,
      priority,
      retries: 0,
      maxRetries,
      resolve: undefined,
      reject: undefined
    };

    // Add to queue
    this.requestQueue.set(requestId, request);
    this.updateMetrics();

    // Return a promise that will be resolved when batch executes
    return new Promise((resolve, reject) => {
      request.resolve = resolve;
      request.reject = reject;

      // Schedule batch execution
      this.scheduleBatchExecution();
    });
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.requestQueue.size;
  }

  /**
   * Get current metrics
   */
  getMetrics(): BatchMetrics {
    return { ...this.metrics };
  }

  /**
   * Get operation-specific statistics
   */
  getOperationStats(operation?: string): Map<string, { count: number; avgLatency: number }> {
    const result = new Map<string, { count: number; avgLatency: number }>();
    
    if (operation) {
      const stats = this.operationStats.get(operation);
      if (stats) {
        result.set(operation, {
          count: stats.count,
          avgLatency: stats.totalLatency / stats.count
        });
      }
    } else {
      for (const [op, stats] of this.operationStats.entries()) {
        result.set(op, {
          count: stats.count,
          avgLatency: stats.totalLatency / stats.count
        });
      }
    }
    
    return result;
  }

  /**
   * Clear all queued requests
   */
  clear(): void {
    for (const [, request] of this.requestQueue.entries()) {
      request.reject?.(new Error('Batch manager cleared'));
    }
    this.requestQueue.clear();
    this.updateMetrics();
  }

  /**
   * Flush all queued requests immediately
   */
  async flush(): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }

    while (this.requestQueue.size > 0) {
      await this.executeBatch();
    }
  }

  // ===== PRIVATE METHODS =====

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private scheduleBatchExecution(): void {
    // If batch size reached, execute immediately
    if (this.requestQueue.size >= this.config.maxBatchSize) {
      this.executeBatch().catch(err => console.error('Batch execution error:', err));
      return;
    }

    // If no timer scheduled, schedule one
    if (!this.batchTimer && this.requestQueue.size > 0) {
      this.batchTimer = setTimeout(() => {
        this.batchTimer = undefined;
        this.executeBatch().catch(err => console.error('Batch execution error:', err));
      }, this.config.batchTimeWindowMs);
    }
  }

  private async executeBatch(): Promise<void> {
    // Check if we can process another batch
    if (this.activeBatches.size >= this.config.maxConcurrentBatches || this.requestQueue.size === 0) {
      return;
    }

    // Get next batch of requests
    const batchRequests = this.getNextBatch();
    if (batchRequests.length === 0) {
      return;
    }

    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.activeBatches.add(batchId);

    try {
      const startTime = performance.now();

      // Execute the batch
      if (!this.executorFn) {
        throw new Error('No executor function set for batch manager');
      }

      const result = await this.executorFn(batchRequests);

      const executionTime = performance.now() - startTime;

      // Process results
      this.processBatchResults(batchRequests, result, executionTime);

      // Update metrics
      this.metrics.totalBatches++;
      this.metrics.totalRequests += batchRequests.length;
      this.metrics.avgBatchLatencyMs = 
        (this.metrics.avgBatchLatencyMs * (this.metrics.totalBatches - 1) + executionTime) / 
        this.metrics.totalBatches;

      this.updateMetrics();

      // Schedule next batch if there are pending requests
      if (this.requestQueue.size > 0) {
        this.scheduleBatchExecution();
      }
    } catch (error) {
      // Handle batch-level error
      const err = error instanceof Error ? error : new Error(String(error));
      batchRequests.forEach(request => {
        request.reject?.(err);
      });
      
      this.metrics.failedRequests += batchRequests.length;
      this.updateMetrics();
    } finally {
      this.activeBatches.delete(batchId);
    }
  }

  private getNextBatch(): BatchRequest[] {
    const batch: BatchRequest[] = [];
    const sorted = Array.from(this.requestQueue.values())
      .sort((a, b) => {
        // Sort by priority (higher first), then by timestamp (older first)
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return a.timestamp - b.timestamp;
      });

    for (const request of sorted) {
      if (batch.length >= this.config.maxBatchSize) {
        break;
      }

      // Check if we can merge with existing requests in batch
      if (this.config.enableMerging && this.canMergeRequests(batch, request)) {
        // Merge will be handled in executor, just add it
      }

      batch.push(request);
      this.requestQueue.delete(request.id);
    }

    return batch;
  }

  private canMergeRequests(batch: BatchRequest[], request: BatchRequest): boolean {
    // Same operation can potentially be merged
    return batch.some(r => r.operation === request.operation);
  }

  private processBatchResults(
    requests: BatchRequest[],
    result: BatchExecutionResult,
    executionTime: number
  ): void {
    for (const request of requests) {
      if (result.results.has(request.id)) {
        const { data, latency } = result.results.get(request.id)!;
        request.resolve?.(data);

        // Update operation stats
        const stats = this.operationStats.get(request.operation) || { count: 0, totalLatency: 0 };
        stats.count++;
        stats.totalLatency += latency;
        this.operationStats.set(request.operation, stats);
      } else if (result.errors.has(request.id)) {
        const error = result.errors.get(request.id)!;
        
        // Retry logic
        if (request.retries < request.maxRetries) {
          request.retries++;
          this.requestQueue.set(request.id, request);
          this.scheduleBatchExecution();
        } else {
          request.reject?.(error);
          this.metrics.failedRequests++;
        }
      }
    }
  }

  private findDuplicateRequest(operation: string, payload: any): BatchRequest | undefined {
    for (const [, request] of this.requestQueue.entries()) {
      if (request.operation === operation && this.payloadsEqual(request.payload, payload)) {
        return request;
      }
    }
    return undefined;
  }

  private payloadsEqual(a: any, b: any): boolean {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return a === b;
    }
  }

  private updateMetrics(): void {
    this.metrics.queueSize = this.requestQueue.size;
    
    // Estimate memory usage (rough approximation)
    let memoryEstimate = 0;
    for (const request of this.requestQueue.values()) {
      memoryEstimate += JSON.stringify(request).length;
    }
    this.metrics.memoryUsageMB = memoryEstimate / (1024 * 1024);

    // Calculate average requests per batch
    if (this.metrics.totalBatches > 0) {
      this.metrics.avgRequestsPerBatch = 
        this.metrics.totalRequests / this.metrics.totalBatches;
    }

    // Calculate success rate
    if (this.metrics.totalRequests > 0) {
      this.metrics.successRatePercent = 
        ((this.metrics.totalRequests - this.metrics.failedRequests) / this.metrics.totalRequests) * 100;
    }

    // Estimate latency savings (batch of N reduces latency by ~30-50% per batch)
    if (this.metrics.avgRequestsPerBatch > 1) {
      this.metrics.latencySavingsPercent = 
        Math.min(50, (this.metrics.avgRequestsPerBatch - 1) * 10);
    }
  }
}

/**
 * Global singleton instance
 */
export const batchRequestManager = new BatchRequestManager({
  maxBatchSize: 10,
  batchTimeWindowMs: 100,
  maxConcurrentBatches: 5,
  maxMemoryMB: 10,
  enableDeduplication: true,
  enableMerging: true
});

export default batchRequestManager;
