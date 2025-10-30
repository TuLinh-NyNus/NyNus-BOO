/**
 * Batch Request Manager for gRPC Performance Optimization
 * =======================================================
 * 
 * Quản lý batching requests để cải thiện hiệu suất:
 * - Kết hợp nhiều requests thành batch để giảm latency
 * - Hỗ trợ priority-based execution
 * - Tự động flush batch khi đạt size hoặc timeout
 * - Theo dõi metrics hiệu suất
 * 
 * Business Logic:
 * - Requests được queue lại với timestamps
 * - Batch được execute khi: size >= threshold HOẶC time window expired
 * - Max 1-5 batches execute concurrently để tránh quá tải
 * - Memory được manage để không vượt quá limit
 * 
 * Performance Targets:
 * - Batch size >= 2 giảm latency 20%
 * - Throughput >= 100 requests/sec
 * - Memory overhead < 5MB
 * - Không mất request
 * 
 * @author NyNus Development Team
 * @version 1.0.0 - Phase 3 Performance Optimization
 */

import { logger } from '@/lib/logger';

/**
 * Single batched request object
 */
interface BatchedRequest<TRequest> {
  id: string;
  request: TRequest;
  priority: 'high' | 'normal' | 'low';
  timestamp: number;
  timeoutId?: NodeJS.Timeout;
}

/**
 * Batch object containing grouped requests
 */
interface RequestBatch<TRequest, TResponse> {
  id: string;
  requests: BatchedRequest<TRequest>[];
  createdAt: number;
  executeAt?: number;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  error?: Error;
  results?: Map<string, TResponse | Error>;
}

/**
 * Batching configuration
 */
interface BatchConfig {
  // Max items in a batch before auto-flush
  maxBatchSize: number;
  // Time window (ms) before auto-flush
  batchTimeWindow: number;
  // Max concurrent batches executing
  maxConcurrentBatches: number;
  // Memory limit in MB
  maxMemoryMB: number;
}

/**
 * Metrics for batch processing
 */
interface BatchMetrics {
  totalBatches: number;
  totalRequests: number;
  successfulBatches: number;
  failedBatches: number;
  avgBatchSize: number;
  avgLatency: number;
  memoryUsed: number;
  latencySavings: number; // Percentage
  successRate: number; // Percentage of successful batches
}

/**
 * BatchRequestManager - Centralized batch request handling
 * 
 * Quản lý batching requests để giảm latency và tăng throughput.
 * Supports priority-based execution, automatic flushing, và metrics collection.
 */
export class BatchRequestManager<TRequest, TResponse> {
  private queue: BatchedRequest<TRequest>[] = [];
  private batches: Map<string, RequestBatch<TRequest, TResponse>> = new Map();
  private config: BatchConfig;
  private metrics: BatchMetrics = {
    totalBatches: 0,
    totalRequests: 0,
    successfulBatches: 0,
    failedBatches: 0,
    avgBatchSize: 0,
    avgLatency: 0,
    memoryUsed: 0,
    latencySavings: 0,
    successRate: 0
  };
  private executingBatchCount = 0;
  private flushTimeoutId?: NodeJS.Timeout;
  private readonly executor: (batch: TRequest[]) => Promise<TResponse[]>;
  private readonly serviceName: string;

  /**
   * Initialize BatchRequestManager
   * 
   * @param executor - Function để execute batch requests
   * @param serviceName - Name của service (cho logging)
   * @param config - Optional batch configuration
   */
  constructor(
    executor: (batch: TRequest[]) => Promise<TResponse[]>,
    serviceName: string,
    config?: Partial<BatchConfig>
  ) {
    this.executor = executor;
    this.serviceName = serviceName;
    this.config = {
      maxBatchSize: config?.maxBatchSize ?? 10,
      batchTimeWindow: config?.batchTimeWindow ?? 50, // 50ms default
      maxConcurrentBatches: config?.maxConcurrentBatches ?? 3,
      maxMemoryMB: config?.maxMemoryMB ?? 5
    };

    logger.debug(`[BatchRequestManager] Initialized for ${serviceName}`, {
      config: this.config
    });
  }

  /**
   * Add request to queue
   * 
   * @param request - Request object
   * @param priority - Priority level
   * @returns Promise that resolves when batch completes
   */
  async enqueue(
    request: TRequest,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<TResponse | Error> {
    const requestId = this.generateId();
    
    const batchedRequest: BatchedRequest<TRequest> = {
      id: requestId,
      request,
      priority,
      timestamp: Date.now()
    };

    this.queue.push(batchedRequest);
    this.metrics.totalRequests++;

    // Check if we need to flush
    if (this.shouldFlush()) {
      await this.flush();
    } else {
      this.scheduleFlush();
    }

    // Wait for batch completion
    return this.waitForResult(requestId);
  }

  /**
   * Add multiple requests at once
   * 
   * @param requests - Array of requests
   * @param priority - Priority level for all
   * @returns Promise that resolves to array of results
   */
  async enqueueBatch(
    requests: TRequest[],
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<(TResponse | Error)[]> {
    const promises = requests.map(req => this.enqueue(req, priority));
    return Promise.all(promises);
  }

  /**
   * Determine if batch should be flushed
   */
  private shouldFlush(): boolean {
    // Check size
    if (this.queue.length >= this.config.maxBatchSize) {
      logger.debug(`[BatchRequestManager] Should flush: size threshold (${this.queue.length})`);
      return true;
    }

    // Check memory
    if (this.getMemoryUsage() > this.config.maxMemoryMB) {
      logger.debug(`[BatchRequestManager] Should flush: memory threshold`);
      return true;
    }

    return false;
  }

  /**
   * Schedule automatic flush after time window
   */
  private scheduleFlush(): void {
    // Clear existing timeout
    if (this.flushTimeoutId) {
      clearTimeout(this.flushTimeoutId);
    }

    // Schedule new flush
    this.flushTimeoutId = setTimeout(() => {
      this.flush().catch(err => {
        logger.error(`[BatchRequestManager] Scheduled flush failed`, { error: err });
      });
    }, this.config.batchTimeWindow);
  }

  /**
   * Flush current queue as batch(es)
   */
  private async flush(): Promise<void> {
    if (this.queue.length === 0) {
      return;
    }

    // Sort by priority (high > normal > low) then by timestamp
    const sortedRequests = this.queue.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp;
    });

    // Split into batches based on max concurrent
    const availableSlots = this.config.maxConcurrentBatches - this.executingBatchCount;
    const batchCount = Math.min(
      Math.ceil(sortedRequests.length / this.config.maxBatchSize),
      availableSlots
    );

    if (batchCount === 0) {
      logger.debug(`[BatchRequestManager] No available slots for batch execution`);
      this.scheduleFlush();
      return;
    }

    this.queue = [];

    // Create and execute batches
    const batchPromises: Promise<void>[] = [];
    for (let i = 0; i < batchCount; i++) {
      const startIdx = (i * sortedRequests.length) / batchCount;
      const endIdx = ((i + 1) * sortedRequests.length) / batchCount;
      const batchRequests = sortedRequests.slice(
        Math.floor(startIdx),
        Math.ceil(endIdx)
      );

      if (batchRequests.length > 0) {
        batchPromises.push(this.executeBatch(batchRequests));
      }
    }

    // Wait for all batches to complete
    await Promise.allSettled(batchPromises);

    // Reschedule if there are remaining requests
    if (this.queue.length > 0) {
      this.scheduleFlush();
    }
  }

  /**
   * Execute a single batch
   */
  private async executeBatch(
    requests: BatchedRequest<TRequest>[]
  ): Promise<void> {
    const batchId = this.generateId();
    const batch: RequestBatch<TRequest, TResponse> = {
      id: batchId,
      requests,
      createdAt: Date.now(),
      status: 'pending',
      results: new Map()
    };

    this.batches.set(batchId, batch);
    this.executingBatchCount++;

    try {
      batch.status = 'executing';
      batch.executeAt = Date.now();

      // Extract just the request objects
      const requestsToExecute = requests.map(r => r.request);

      // Execute batch
      const responses = await this.executor(requestsToExecute);

      // Map results back to request IDs
      responses.forEach((response, index) => {
        const requestId = requests[index].id;
        batch.results?.set(requestId, response);
      });

      batch.status = 'completed';
      this.metrics.successfulBatches++;

      logger.debug(`[BatchRequestManager] Batch ${batchId} completed`, {
        size: requests.length,
        duration: Date.now() - batch.executeAt!
      });
    } catch (error) {
      batch.error = error as Error;
      batch.status = 'failed';
      this.metrics.failedBatches++;

      // Store error for all requests in batch
      requests.forEach(req => {
        batch.results?.set(req.id, error as Error);
      });

      logger.error(`[BatchRequestManager] Batch ${batchId} failed`, {
        error: error instanceof Error ? error.message : String(error),
        size: requests.length
      });
    } finally {
      this.executingBatchCount--;
      this.updateMetrics();
    }
  }

  /**
   * Wait for request result
   */
  private async waitForResult(requestId: string, timeout = 30000): Promise<TResponse | Error> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      // Check all batches for this request
      for (const batch of this.batches.values()) {
        if (batch.results?.has(requestId)) {
          const result = batch.results.get(requestId);
          if (result instanceof Error) {
            return result;
          }
          return result as TResponse;
        }
      }

      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    return new Error(`Request ${requestId} timed out after ${timeout}ms`);
  }

  /**
   * Get current metrics
   */
  getMetrics(): BatchMetrics {
    return { ...this.metrics };
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    if (this.metrics.totalBatches === 0) return;

    // Calculate average batch size
    this.metrics.avgBatchSize = Math.round(
      this.metrics.totalRequests / this.metrics.totalBatches
    );

    // Estimate latency savings (rough calculation)
    // Assuming each individual request is ~100ms, batch saves 90% overhead
    const estimatedSavings = this.metrics.avgBatchSize >= 2
      ? ((this.metrics.avgBatchSize - 1) / this.metrics.avgBatchSize) * 100
      : 0;
    this.metrics.latencySavings = Math.round(estimatedSavings);

    // Calculate memory usage
    this.metrics.memoryUsed = this.getMemoryUsage();

    // Calculate success rate
    this.metrics.successRate = Math.round(
      (this.metrics.successfulBatches / this.metrics.totalBatches) * 100
    );
  }

  /**
   * Calculate current memory usage in MB
   */
  private getMemoryUsage(): number {
    let size = 0;

    // Queue size
    size += this.queue.length * 100; // Rough estimate per request

    // Batches size
    for (const batch of this.batches.values()) {
      size += batch.requests.length * 100;
      size += batch.results?.size ?? 0 * 50;
    }

    // Convert to MB
    return size / (1024 * 1024);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all pending requests and batches
   */
  clear(): void {
    this.queue = [];
    this.batches.clear();
    if (this.flushTimeoutId) {
      clearTimeout(this.flushTimeoutId);
    }
    logger.info(`[BatchRequestManager] Cleared ${this.serviceName}`);
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Get executing batch count
   */
  getExecutingBatchCount(): number {
    return this.executingBatchCount;
  }
}

/**
 * Export singleton factory for easy reuse
 */
export function createBatchRequestManager<TRequest, TResponse>(
  executor: (batch: TRequest[]) => Promise<TResponse[]>,
  serviceName: string,
  config?: Partial<BatchConfig>
): BatchRequestManager<TRequest, TResponse> {
  return new BatchRequestManager(executor, serviceName, config);
}
