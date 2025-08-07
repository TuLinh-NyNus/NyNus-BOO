/**
 * Admin Retry Manager
 * Quản lý retry cho admin API với exponential backoff và circuit breaker
 */

/**
 * Retry configuration
 * Cấu hình retry
 */
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * Circuit breaker state
 * Trạng thái circuit breaker
 */
enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

/**
 * Circuit breaker configuration
 * Cấu hình circuit breaker
 */
interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

/**
 * Request queue item
 * Item trong queue request
 */
interface QueuedRequest {
  id: string;
  request: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  priority: number;
  timestamp: number;
  retryCount: number;
}

/**
 * Admin Retry Manager Class
 * Class quản lý retry admin
 */
export class AdminRetryManager {
  private circuitBreakers = new Map<
    string,
    {
      state: CircuitState;
      failureCount: number;
      lastFailureTime: number;
      config: CircuitBreakerConfig;
    }
  >();

  private requestQueue: QueuedRequest[] = [];
  private isProcessingQueue = false;
  private maxQueueSize = 1000;

  private defaultRetryConfig: RetryConfig;

  private defaultCircuitConfig: CircuitBreakerConfig = {
    failureThreshold: 5,
    recoveryTimeout: 60000,
    monitoringPeriod: 300000,
  };

  constructor() {
    this.defaultRetryConfig = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitter: true,
      retryCondition: this.defaultRetryCondition,
    };
  }

  /**
   * Retry function with exponential backoff
   * Retry function với exponential backoff
   */
  async retry<T>(fn: () => Promise<T>, config: Partial<RetryConfig> = {}): Promise<T> {
    const retryConfig = { ...this.defaultRetryConfig, ...config };
    let lastError: any;

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        const result = await fn();
        return result;
      } catch (error) {
        lastError = error;

        // Check if we should retry
        if (attempt === retryConfig.maxAttempts || !retryConfig.retryCondition!(error)) {
          throw error;
        }

        // Call onRetry callback
        if (retryConfig.onRetry) {
          retryConfig.onRetry(attempt, error);
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt, retryConfig);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Retry with circuit breaker
   * Retry với circuit breaker
   */
  async retryWithCircuitBreaker<T>(
    key: string,
    fn: () => Promise<T>,
    retryConfig: Partial<RetryConfig> = {},
    circuitConfig: Partial<CircuitBreakerConfig> = {}
  ): Promise<T> {
    const circuit = this.getOrCreateCircuitBreaker(key, circuitConfig);

    // Check circuit breaker state
    if (circuit.state === CircuitState.OPEN) {
      if (Date.now() - circuit.lastFailureTime < circuit.config.recoveryTimeout) {
        throw new Error(`Circuit breaker is OPEN for ${key}. Service temporarily unavailable.`);
      } else {
        // Move to half-open state
        circuit.state = CircuitState.HALF_OPEN;
      }
    }

    try {
      const result = await this.retry(fn, retryConfig);

      // Success - reset circuit breaker
      if (circuit.state === CircuitState.HALF_OPEN) {
        circuit.state = CircuitState.CLOSED;
        circuit.failureCount = 0;
      }

      return result;
    } catch (error) {
      // Failure - update circuit breaker
      circuit.failureCount++;
      circuit.lastFailureTime = Date.now();

      if (circuit.failureCount >= circuit.config.failureThreshold) {
        circuit.state = CircuitState.OPEN;
      }

      throw error;
    }
  }

  /**
   * Add request to queue for rate-limited operations
   * Thêm request vào queue cho operations bị rate limit
   */
  async queueRequest<T>(request: () => Promise<T>, priority: number = 0): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.requestQueue.length >= this.maxQueueSize) {
        reject(new Error("Request queue is full"));
        return;
      }

      const queuedRequest: QueuedRequest = {
        id: this.generateRequestId(),
        request,
        resolve,
        reject,
        priority,
        timestamp: Date.now(),
        retryCount: 0,
      };

      // Insert request based on priority
      this.insertByPriority(queuedRequest);

      // Start processing queue if not already running
      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    });
  }

  /**
   * Process request queue
   * Xử lý queue request
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const queuedRequest = this.requestQueue.shift()!;

      try {
        const result = await queuedRequest.request();
        queuedRequest.resolve(result);
      } catch (error) {
        // Retry logic for queued requests
        if (queuedRequest.retryCount < 2 && this.defaultRetryCondition(error)) {
          queuedRequest.retryCount++;
          this.insertByPriority(queuedRequest);

          // Add delay before retry
          await this.sleep(1000 * queuedRequest.retryCount);
        } else {
          queuedRequest.reject(error);
        }
      }

      // Add small delay between requests to avoid overwhelming
      await this.sleep(100);
    }

    this.isProcessingQueue = false;
  }

  /**
   * Calculate delay with exponential backoff
   * Tính toán delay với exponential backoff
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);

    // Apply maximum delay limit
    delay = Math.min(delay, config.maxDelay);

    // Add jitter to avoid thundering herd
    if (config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
  }

  /**
   * Default retry condition
   * Điều kiện retry mặc định
   */
  private defaultRetryCondition = (error: any): boolean => {
    // Retry on network errors, timeouts, and 5xx server errors
    if (error?.code === "NETWORK_ERROR" || error?.code === "ECONNABORTED") {
      return true;
    }

    if (error?.response?.status) {
      const status = error.response.status;
      return status >= 500 || status === 429; // Server errors or rate limiting
    }

    return false;
  };

  /**
   * Get or create circuit breaker
   * Lấy hoặc tạo circuit breaker
   */
  private getOrCreateCircuitBreaker(key: string, config: Partial<CircuitBreakerConfig>) {
    if (!this.circuitBreakers.has(key)) {
      this.circuitBreakers.set(key, {
        state: CircuitState.CLOSED,
        failureCount: 0,
        lastFailureTime: 0,
        config: { ...this.defaultCircuitConfig, ...config },
      });
    }

    return this.circuitBreakers.get(key)!;
  }

  /**
   * Insert request by priority
   * Chèn request theo priority
   */
  private insertByPriority(request: QueuedRequest): void {
    let insertIndex = this.requestQueue.length;

    for (let i = 0; i < this.requestQueue.length; i++) {
      if (this.requestQueue[i].priority < request.priority) {
        insertIndex = i;
        break;
      }
    }

    this.requestQueue.splice(insertIndex, 0, request);
  }

  /**
   * Generate unique request ID
   * Tạo ID request duy nhất
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sleep utility
   * Utility sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get circuit breaker status
   * Lấy trạng thái circuit breaker
   */
  getCircuitBreakerStatus(key: string): {
    state: CircuitState;
    failureCount: number;
    lastFailureTime: number;
  } | null {
    const circuit = this.circuitBreakers.get(key);
    if (!circuit) return null;

    return {
      state: circuit.state,
      failureCount: circuit.failureCount,
      lastFailureTime: circuit.lastFailureTime,
    };
  }

  /**
   * Reset circuit breaker
   * Reset circuit breaker
   */
  resetCircuitBreaker(key: string): void {
    const circuit = this.circuitBreakers.get(key);
    if (circuit) {
      circuit.state = CircuitState.CLOSED;
      circuit.failureCount = 0;
      circuit.lastFailureTime = 0;
    }
  }

  /**
   * Get queue status
   * Lấy trạng thái queue
   */
  getQueueStatus(): {
    size: number;
    isProcessing: boolean;
    oldestRequest: number | null;
  } {
    return {
      size: this.requestQueue.length,
      isProcessing: this.isProcessingQueue,
      oldestRequest:
        this.requestQueue.length > 0
          ? Date.now() - this.requestQueue[this.requestQueue.length - 1].timestamp
          : null,
    };
  }

  /**
   * Clear request queue
   * Xóa queue request
   */
  clearQueue(): void {
    this.requestQueue.forEach((request) => {
      request.reject(new Error("Request queue cleared"));
    });
    this.requestQueue = [];
    this.isProcessingQueue = false;
  }

  /**
   * Get retry statistics
   * Lấy thống kê retry
   */
  getRetryStats(): {
    circuitBreakers: Array<{
      key: string;
      state: CircuitState;
      failureCount: number;
      lastFailureTime: number;
    }>;
    queueStatus: {
      size: number;
      isProcessing: boolean;
      oldestRequest: number | null;
    };
  } {
    const circuitBreakers = Array.from(this.circuitBreakers.entries()).map(([key, circuit]) => ({
      key,
      state: circuit.state,
      failureCount: circuit.failureCount,
      lastFailureTime: circuit.lastFailureTime,
    }));

    return {
      circuitBreakers,
      queueStatus: this.getQueueStatus(),
    };
  }
}

/**
 * Predefined retry configurations for common admin operations
 * Cấu hình retry được định nghĩa trước cho operations admin thường dùng
 */
export const ADMIN_RETRY_CONFIGS = {
  /**
   * Quick operations (user actions, settings updates)
   * Operations nhanh (thao tác user, cập nhật settings)
   */
  QUICK_OPERATION: {
    maxAttempts: 2,
    baseDelay: 500,
    maxDelay: 2000,
    backoffMultiplier: 2,
    jitter: true,
  },

  /**
   * Standard operations (data fetching, CRUD operations)
   * Operations tiêu chuẩn (fetch data, CRUD operations)
   */
  STANDARD_OPERATION: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true,
  },

  /**
   * Heavy operations (exports, reports, analytics)
   * Operations nặng (export, reports, analytics)
   */
  HEAVY_OPERATION: {
    maxAttempts: 5,
    baseDelay: 2000,
    maxDelay: 30000,
    backoffMultiplier: 1.5,
    jitter: true,
  },

  /**
   * Critical operations (authentication, security)
   * Operations quan trọng (authentication, security)
   */
  CRITICAL_OPERATION: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 5000,
    backoffMultiplier: 2,
    jitter: false,
  },
} as const;

/**
 * Default admin retry manager instance
 * Instance retry manager admin mặc định
 */
export const adminRetryManager = new AdminRetryManager();
