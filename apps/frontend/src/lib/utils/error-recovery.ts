/**
 * Error Recovery Utilities
 * Utilities cho error recovery và graceful degradation
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

// ===== TYPES =====

export interface ErrorRecoveryOptions<T = unknown> {
  /** Max retry attempts */
  maxRetries?: number;
  /** Retry delay (ms) */
  retryDelay?: number;
  /** Exponential backoff */
  exponentialBackoff?: boolean;
  /** Fallback value */
  fallbackValue?: T;
  /** Error callback */
  onError?: (error: Error, attempt: number) => void;
  /** Success callback */
  onSuccess?: (result: T, attempt: number) => void;
  /** Should retry predicate */
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

export interface RetryResult<T> {
  /** Success flag */
  success: boolean;
  /** Result data */
  data?: T;
  /** Error if failed */
  error?: Error;
  /** Number of attempts made */
  attempts: number;
  /** Total time taken */
  totalTime: number;
}

export interface CircuitBreakerOptions {
  /** Failure threshold */
  failureThreshold?: number;
  /** Reset timeout (ms) */
  resetTimeout?: number;
  /** Monitor window (ms) */
  monitorWindow?: number;
}

export interface CircuitBreakerState {
  /** Current state */
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  /** Failure count */
  failureCount: number;
  /** Last failure time */
  lastFailureTime: number;
  /** Success count */
  successCount: number;
}

// ===== CONSTANTS =====

const DEFAULT_RETRY_OPTIONS: Required<Omit<ErrorRecoveryOptions, 'fallbackValue' | 'onError' | 'onSuccess' | 'shouldRetry'>> = {
  maxRetries: 3,
  retryDelay: 1000,
  exponentialBackoff: true
};

const DEFAULT_CIRCUIT_BREAKER_OPTIONS: Required<CircuitBreakerOptions> = {
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
  monitorWindow: 300000 // 5 minutes
};

// ===== RETRY UTILITIES =====

/**
 * Retry function với exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: ErrorRecoveryOptions<T> = {}
): Promise<RetryResult<T>> {
  const {
    maxRetries = DEFAULT_RETRY_OPTIONS.maxRetries,
    retryDelay = DEFAULT_RETRY_OPTIONS.retryDelay,
    exponentialBackoff = DEFAULT_RETRY_OPTIONS.exponentialBackoff,
    fallbackValue,
    onError,
    onSuccess,
    shouldRetry = () => true
  } = options;

  const startTime = performance.now();
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const result = await fn();
      const totalTime = performance.now() - startTime;
      
      onSuccess?.(result, attempt);
      
      return {
        success: true,
        data: result,
        attempts: attempt,
        totalTime
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      onError?.(lastError, attempt);
      
      // Check if we should retry
      if (attempt > maxRetries || !shouldRetry(lastError, attempt)) {
        break;
      }
      
      // Calculate delay với exponential backoff
      const delay = exponentialBackoff 
        ? retryDelay * Math.pow(2, attempt - 1)
        : retryDelay;
      
      // Add jitter để avoid thundering herd
      const jitter = Math.random() * 0.1 * delay;
      const finalDelay = delay + jitter;
      
      await new Promise(resolve => setTimeout(resolve, finalDelay));
    }
  }
  
  const totalTime = performance.now() - startTime;
  
  return {
    success: false,
    data: fallbackValue,
    error: lastError!,
    attempts: maxRetries + 1,
    totalTime
  };
}

/**
 * Retry cho sync functions
 */
export function retrySyncWithBackoff<T>(
  fn: () => T,
  options: ErrorRecoveryOptions<T> = {}
): RetryResult<T> {
  const {
    maxRetries = DEFAULT_RETRY_OPTIONS.maxRetries,
    fallbackValue,
    onError,
    onSuccess,
    shouldRetry = () => true
  } = options;

  const startTime = performance.now();
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const result = fn();
      const totalTime = performance.now() - startTime;
      
      onSuccess?.(result, attempt);
      
      return {
        success: true,
        data: result,
        attempts: attempt,
        totalTime
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      onError?.(lastError, attempt);
      
      // Check if we should retry
      if (attempt > maxRetries || !shouldRetry(lastError, attempt)) {
        break;
      }
    }
  }
  
  const totalTime = performance.now() - startTime;
  
  return {
    success: false,
    data: fallbackValue,
    error: lastError!,
    attempts: maxRetries + 1,
    totalTime
  };
}

// ===== CIRCUIT BREAKER =====

/**
 * Circuit Breaker Class
 * Implements circuit breaker pattern cho error recovery
 */
export class CircuitBreaker {
  private state: CircuitBreakerState;
  private options: Required<CircuitBreakerOptions>;
  private failures: number[] = [];

  constructor(options: CircuitBreakerOptions = {}) {
    this.options = { ...DEFAULT_CIRCUIT_BREAKER_OPTIONS, ...options };
    this.state = {
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: 0,
      successCount: 0
    };
  }

  /**
   * Execute function với circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check circuit state
    if (this.state.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.state.successCount++;
    
    if (this.state.state === 'HALF_OPEN') {
      this.state.state = 'CLOSED';
      this.state.failureCount = 0;
      this.failures = [];
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    const now = Date.now();
    this.state.failureCount++;
    this.state.lastFailureTime = now;
    this.failures.push(now);
    
    // Clean old failures outside monitor window
    this.failures = this.failures.filter(
      time => now - time < this.options.monitorWindow
    );
    
    // Check if should open circuit
    if (this.failures.length >= this.options.failureThreshold) {
      this.state.state = 'OPEN';
    }
  }

  /**
   * Check if should attempt reset
   */
  private shouldAttemptReset(): boolean {
    return Date.now() - this.state.lastFailureTime > this.options.resetTimeout;
  }

  /**
   * Get current state
   */
  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.state = {
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: 0,
      successCount: 0
    };
    this.failures = [];
  }
}

// ===== GRACEFUL DEGRADATION =====

/**
 * Graceful degradation wrapper
 */
export async function withGracefulDegradation<T>(
  primaryFn: () => Promise<T>,
  fallbackFn: () => Promise<T> | T,
  options: ErrorRecoveryOptions<T> = {}
): Promise<T> {
  try {
    const result = await retryWithBackoff(primaryFn, options);
    if (result.success) {
      return result.data!;
    }
    throw result.error!;
  } catch (error) {
    console.warn('[GracefulDegradation] Primary function failed, using fallback:', error);
    return await fallbackFn();
  }
}

/**
 * Safe execution với fallback
 */
export function safeExecute<T>(
  fn: () => T,
  fallbackValue: T,
  onError?: (error: Error) => void
): T {
  try {
    return fn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
    return fallbackValue;
  }
}

/**
 * Safe async execution với fallback
 */
export async function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  fallbackValue: T,
  onError?: (error: Error) => void
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
    return fallbackValue;
  }
}

// ===== ERROR CLASSIFICATION =====

/**
 * Classify error types
 */
export function classifyError(error: Error): {
  type: 'network' | 'timeout' | 'validation' | 'permission' | 'server' | 'client' | 'unknown';
  isRetryable: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
} {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();
  
  // Network errors
  if (message.includes('network') || message.includes('fetch') || name.includes('networkerror')) {
    return { type: 'network', isRetryable: true, severity: 'medium' };
  }
  
  // Timeout errors
  if (message.includes('timeout') || name.includes('timeout')) {
    return { type: 'timeout', isRetryable: true, severity: 'medium' };
  }
  
  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || name.includes('validation')) {
    return { type: 'validation', isRetryable: false, severity: 'low' };
  }
  
  // Permission errors
  if (message.includes('unauthorized') || message.includes('forbidden') || message.includes('permission')) {
    return { type: 'permission', isRetryable: false, severity: 'high' };
  }
  
  // Server errors (5xx)
  if (message.includes('server') || message.includes('internal') || message.includes('5')) {
    return { type: 'server', isRetryable: true, severity: 'high' };
  }
  
  // Client errors (4xx)
  if (message.includes('client') || message.includes('bad request') || message.includes('4')) {
    return { type: 'client', isRetryable: false, severity: 'medium' };
  }
  
  // Unknown errors
  return { type: 'unknown', isRetryable: false, severity: 'medium' };
}

/**
 * Should retry based on error classification
 */
export function shouldRetryError(error: Error, attempt: number, maxRetries: number): boolean {
  if (attempt >= maxRetries) return false;
  
  const classification = classifyError(error);
  return classification.isRetryable;
}
