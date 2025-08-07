/**
 * Comprehensive error type definitions
 * Fixes TypeScript errors in error handling components
 */

// Base error interface
export interface BaseError {
  message: string;
  name?: string;
  stack?: string;
}

// HTTP error interface
export interface HttpError extends BaseError {
  status: number;
  statusCode?: number;
  statusText?: string;
  retryAfter?: number | string;
}

// Network error interface
export interface NetworkError extends BaseError {
  code?: string;
  errno?: number;
  syscall?: string;
  hostname?: string;
  port?: number;
}

// API error interface
export interface ApiError extends HttpError {
  response?: {
    data?: {
      message?: string;
      error?: string;
      statusCode?: number;
      details?: unknown;
    };
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
  };
  request?: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
  };
  config?: {
    timeout?: number;
    retries?: number;
  };
}

// Authentication error interface
export interface AuthError extends HttpError {
  code?: string;
  type?: 'INVALID_CREDENTIALS' | 'SESSION_EXPIRED' | 'TOKEN_INVALID' | 'ACCOUNT_LOCKED';
  requiresAuth?: boolean;
  requiresRefresh?: boolean;
}

// Validation error interface
export interface ValidationError extends BaseError {
  field?: string;
  value?: unknown;
  constraints?: Record<string, string>;
  children?: ValidationError[];
}

// Rate limit error interface
export interface RateLimitError extends HttpError {
  retryAfter: number | string;
  limit?: number;
  remaining?: number;
  reset?: number;
}

// Server error interface
export interface ServerError extends HttpError {
  code?: string;
  details?: unknown;
  requestId?: string;
  timestamp?: string;
}

// Union type for all possible error types
export type ErrorObject = 
  | BaseError
  | HttpError
  | NetworkError
  | ApiError
  | AuthError
  | ValidationError
  | RateLimitError
  | ServerError
  | Error
  | { message: string; status?: number; retryAfter?: number | string; [key: string]: unknown }
  | Record<string, unknown>;

// Type guards for error objects
export function isErrorObject(error: unknown): error is ErrorObject {
  return typeof error === 'object' && error !== null;
}

export function hasMessage(error: unknown): error is { message: string } {
  return isErrorObject(error) && typeof (error as Record<string, unknown>).message === 'string';
}

export function hasStatus(error: unknown): error is { status: number } {
  return isErrorObject(error) && typeof (error as Record<string, unknown>).status === 'number';
}

export function hasRetryAfter(error: unknown): error is { retryAfter: number | string } {
  return isErrorObject(error) && ((error as Record<string, unknown>).retryAfter !== undefined);
}

export function isHttpError(error: unknown): error is HttpError {
  return hasStatus(error) && hasMessage(error);
}

export function isApiError(error: unknown): error is ApiError {
  return isErrorObject(error) && 
         (hasStatus(error) || 
          ((error as any).response && typeof (error as any).response === 'object'));
}

export function isAuthError(error: unknown): error is AuthError {
  return isHttpError(error) && 
         (error.status === 401 || error.status === 403 || 
          (hasMessage(error) && 
           (error.message.toLowerCase().includes('auth') ||
            error.message.toLowerCase().includes('token') ||
            error.message.toLowerCase().includes('session'))));
}

export function isNetworkError(error: unknown): error is NetworkError {
  return hasMessage(error) && 
         (error.message.toLowerCase().includes('network') ||
          error.message.toLowerCase().includes('fetch') ||
          error.message.toLowerCase().includes('connection') ||
          (error as any).code === 'NETWORK_ERROR');
}

export function isValidationError(error: unknown): error is ValidationError {
  return hasMessage(error) && 
         (error.message.toLowerCase().includes('validation') ||
          error.message.toLowerCase().includes('invalid') ||
          (error as any).field !== undefined);
}

export function isRateLimitError(error: unknown): error is RateLimitError {
  return (hasStatus(error) && error.status === 429) || 
         (hasMessage(error) && error.message.toLowerCase().includes('rate limit')) ||
         hasRetryAfter(error);
}

export function isServerError(error: unknown): error is ServerError {
  return hasStatus(error) && error.status >= 500;
}

// Helper functions for safe property access
export function getErrorMessage(error: unknown): string {
  if (hasMessage(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
}

export function getErrorStatus(error: unknown): number | undefined {
  if (hasStatus(error)) {
    return error.status;
  }
  if (isApiError(error) && error.response?.status) {
    return error.response.status;
  }
  return undefined;
}

export function getErrorRetryAfter(error: unknown): number | string | undefined {
  if (hasRetryAfter(error)) {
    return error.retryAfter;
  }
  return undefined;
}

// Safe error property access
export function safeGetErrorProperty<T>(
  error: unknown, 
  property: string, 
  defaultValue: T
): T {
  if (isErrorObject(error) && property in error) {
    const value = (error as any)[property];
    return value !== undefined ? value : defaultValue;
  }
  return defaultValue;
}

// Error normalization
export function normalizeError(error: unknown): ErrorObject {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack
    };
  }
  
  if (isErrorObject(error)) {
    return error;
  }
  
  if (typeof error === 'string') {
    return { message: error };
  }
  
  return { message: 'Unknown error occurred' };
}

// Create typed error objects
export function createHttpError(
  status: number, 
  message: string, 
  options?: Partial<HttpError>
): HttpError {
  return {
    status,
    message,
    name: 'HttpError',
    ...options
  };
}

export function createApiError(
  status: number, 
  message: string, 
  response?: ApiError['response']
): ApiError {
  return {
    status,
    message,
    name: 'ApiError',
    response
  };
}

export function createAuthError(
  status: number, 
  message: string, 
  options?: Partial<AuthError>
): AuthError {
  return {
    status,
    message,
    name: 'AuthError',
    ...options
  };
}

export function createRateLimitError(
  retryAfter: number | string, 
  message?: string
): RateLimitError {
  return {
    status: 429,
    message: message || 'Too many requests',
    name: 'RateLimitError',
    retryAfter
  };
}

// Error type constants
export const ERROR_TYPES = {
  HTTP: 'HttpError',
  API: 'ApiError',
  AUTH: 'AuthError',
  NETWORK: 'NetworkError',
  VALIDATION: 'ValidationError',
  RATE_LIMIT: 'RateLimitError',
  SERVER: 'ServerError'
} as const;

export type ErrorTypeName = typeof ERROR_TYPES[keyof typeof ERROR_TYPES];
