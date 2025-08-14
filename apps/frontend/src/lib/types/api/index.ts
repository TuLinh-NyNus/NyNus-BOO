/**
 * API Types
 * Centralized API response and error types
 */

// ===== CORE API RESPONSE TYPES =====

/**
 * Standard API Response Wrapper
 * Consistent response format for all API calls
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date;
  requestId?: string;
}

/**
 * Paginated API Response
 * Response format for paginated data
 */
export interface PaginatedApiResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  timestamp: Date;
  requestId?: string;
}

/**
 * API Error Response
 * Standardized error response format
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  errorCode?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  requestId?: string;
  stack?: string; // Only in development
}

// ===== HTTP STATUS TYPES =====

/**
 * HTTP Status Codes
 * Common HTTP status codes used in the application
 */
export type HttpStatusCode = 
  | 200 // OK
  | 201 // Created
  | 204 // No Content
  | 400 // Bad Request
  | 401 // Unauthorized
  | 403 // Forbidden
  | 404 // Not Found
  | 409 // Conflict
  | 422 // Unprocessable Entity
  | 429 // Too Many Requests
  | 500 // Internal Server Error
  | 502 // Bad Gateway
  | 503; // Service Unavailable

/**
 * API Request Configuration
 * Configuration for API requests
 */
export interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  data?: unknown;
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

// ===== VALIDATION TYPES =====

/**
 * Validation Error
 * Field-level validation errors
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  value?: unknown;
}

/**
 * Validation Error Response
 * Response format for validation errors
 */
export interface ValidationErrorResponse extends ApiErrorResponse {
  errorCode: 'VALIDATION_ERROR';
  details: {
    errors: ValidationError[];
    failedFields: string[];
  };
}

// ===== LOADING STATES =====

/**
 * API Loading State
 * Loading state for API operations
 */
export interface ApiLoadingState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error?: string;
  lastFetch?: Date;
}

/**
 * Async Operation State
 * State for async operations with data
 */
export interface AsyncOperationState<T = unknown> {
  data?: T;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error?: string;
  lastFetch?: Date;
  refetch: () => Promise<void>;
}

// ===== UTILITY TYPES =====

/**
 * API Success Response Helper
 * Helper type for successful API responses
 */
export type ApiSuccessResponse<T> = ApiResponse<T> & {
  success: true;
  data: T;
};

/**
 * API Error Response Helper
 * Helper type for error API responses
 */
export type ApiErrorResponseType = ApiResponse<never> & {
  success: false;
  error: string;
};

/**
 * API Result Union Type
 * Union type for API responses
 */
export type ApiResult<T> = ApiSuccessResponse<T> | ApiErrorResponseType;

// ===== CONSTANTS =====

/**
 * API Constants
 * Common constants for API operations
 */
export const API_CONSTANTS = {
  DEFAULT_TIMEOUT: 30000,
  DEFAULT_RETRIES: 3,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  CACHE_DURATION: 300000, // 5 minutes
} as const;

/**
 * HTTP Status Messages
 * Human-readable messages for HTTP status codes
 */
export const HTTP_STATUS_MESSAGES: Record<HttpStatusCode, string> = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable'
} as const;
