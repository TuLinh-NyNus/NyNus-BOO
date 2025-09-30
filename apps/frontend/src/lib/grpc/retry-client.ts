/**
 * gRPC Retry Client with Exponential Backoff
 * Provides resilient gRPC calls with automatic retry logic
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { RpcError } from 'grpc-web';
import { GrpcErrorHandler, GrpcStatusCode } from './error-handler';

/**
 * Retry configuration options
 */
export interface RetryConfig {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries?: number;

  /**
   * Base delay in milliseconds for exponential backoff
   * @default 1000 (1 second)
   */
  baseDelay?: number;

  /**
   * Maximum delay in milliseconds
   * @default 30000 (30 seconds)
   */
  maxDelay?: number;

  /**
   * Exponential backoff multiplier
   * @default 2
   */
  backoffMultiplier?: number;

  /**
   * Whether to add random jitter to delay
   * @default true
   */
  useJitter?: boolean;

  /**
   * Custom function to determine if error is retryable
   * @default Uses GrpcErrorHandler.isRetryable
   */
  isRetryable?: (error: RpcError) => boolean;

  /**
   * Callback function called before each retry
   */
  onRetry?: (attempt: number, error: RpcError, delay: number) => void;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  useJitter: true,
  isRetryable: (error: RpcError) => GrpcErrorHandler.isRetryable(error),
  onRetry: () => {}, // No-op by default
};

/**
 * Retryable gRPC status codes
 */
const RETRYABLE_STATUS_CODES: GrpcStatusCode[] = [
  GrpcStatusCode.UNAVAILABLE,
  GrpcStatusCode.DEADLINE_EXCEEDED,
  GrpcStatusCode.INTERNAL,
  GrpcStatusCode.UNKNOWN,
];

/**
 * gRPC Retry Client
 */
export class GrpcRetryClient {
  private config: Required<RetryConfig>;

  constructor(config?: RetryConfig) {
    this.config = {
      ...DEFAULT_RETRY_CONFIG,
      ...config,
    };
  }

  /**
   * Execute gRPC call with retry logic
   * @param fn - gRPC function to call
   * @param customConfig - Optional custom retry configuration for this call
   * @returns Promise that resolves with result or rejects with error
   */
  async call<T>(
    fn: () => Promise<T>,
    customConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const config = {
      ...this.config,
      ...customConfig,
    };

    let lastError: RpcError | null = null;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        // First attempt or retry
        return await fn();
      } catch (error) {
        // Check if error is RpcError
        if (!(error instanceof Error && 'code' in error)) {
          throw error;
        }

        const rpcError = error as RpcError;
        lastError = rpcError;

        // Check if error is retryable
        const isRetryable = config.isRetryable(rpcError);
        const isLastAttempt = attempt === config.maxRetries;

        // If not retryable or last attempt, throw error
        if (!isRetryable || isLastAttempt) {
          throw rpcError;
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt, config);

        // Call onRetry callback
        config.onRetry(attempt + 1, rpcError, delay);

        // Log retry attempt (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.log(`[gRPC Retry] Attempt ${attempt + 1}/${config.maxRetries} after ${delay}ms`, {
            error: rpcError.message,
            code: rpcError.code,
          });
        }

        // Wait before retry
        await this.sleep(delay);
      }
    }

    // This should never be reached, but TypeScript requires it
    throw lastError || new Error('Unknown error during retry');
  }

  /**
   * Calculate delay for exponential backoff
   * @param attempt - Current attempt number (0-based)
   * @param config - Retry configuration
   * @returns Delay in milliseconds
   */
  private calculateDelay(attempt: number, config: Required<RetryConfig>): number {
    // Calculate exponential delay
    let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);

    // Apply maximum delay cap
    delay = Math.min(delay, config.maxDelay);

    // Add random jitter if enabled
    if (config.useJitter) {
      // Add ±25% random jitter
      const jitter = delay * 0.25 * (Math.random() * 2 - 1);
      delay += jitter;
    }

    return Math.floor(delay);
  }

  /**
   * Sleep for specified milliseconds
   * @param ms - Milliseconds to sleep
   * @returns Promise that resolves after delay
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if error is retryable based on status code
   * @param error - RpcError to check
   * @returns True if error is retryable
   */
  static isRetryableError(error: RpcError): boolean {
    const code = error.code as unknown as GrpcStatusCode;
    return RETRYABLE_STATUS_CODES.includes(code);
  }
}

/**
 * Global retry client instance with default configuration
 */
export const defaultRetryClient = new GrpcRetryClient();

/**
 * Utility function to call gRPC with retry logic
 * @param fn - gRPC function to call
 * @param config - Optional retry configuration
 * @returns Promise that resolves with result or rejects with error
 */
export async function callWithRetry<T>(
  fn: () => Promise<T>,
  config?: RetryConfig
): Promise<T> {
  return defaultRetryClient.call(fn, config);
}

/**
 * Utility function to create a retry client with custom configuration
 * @param config - Retry configuration
 * @returns New GrpcRetryClient instance
 */
export function createRetryClient(config: RetryConfig): GrpcRetryClient {
  return new GrpcRetryClient(config);
}

/**
 * Example usage:
 * 
 * ```typescript
 * import { callWithRetry } from '@/lib/grpc/retry-client';
 * import { AuthService } from '@/services/grpc/auth.service';
 * 
 * // Simple retry with default config
 * const user = await callWithRetry(() => 
 *   AuthService.getCurrentUser()
 * );
 * 
 * // Custom retry config
 * const user = await callWithRetry(
 *   () => AuthService.getCurrentUser(),
 *   {
 *     maxRetries: 5,
 *     baseDelay: 2000,
 *     onRetry: (attempt, error, delay) => {
 *       console.log(`Retrying... Attempt ${attempt}, delay ${delay}ms`);
 *     }
 *   }
 * );
 * 
 * // Create custom retry client
 * const aggressiveRetryClient = createRetryClient({
 *   maxRetries: 10,
 *   baseDelay: 500,
 *   maxDelay: 60000,
 * });
 * 
 * const result = await aggressiveRetryClient.call(() => 
 *   someGrpcCall()
 * );
 * ```
 */

