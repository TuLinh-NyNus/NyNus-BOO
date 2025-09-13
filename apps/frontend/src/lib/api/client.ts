/**
 * API Client
 * HTTP client chung với fetch wrapper cho tất cả API calls
 * Tự động gắn Authorization header và xử lý lỗi chuẩn
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

// ===== CONFIGURATION =====

/**
 * API base URL từ environment variables
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

/**
 * Default request timeout (ms)
 */
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * localStorage key cho auth token
 */
const AUTH_TOKEN_KEY = 'nynus-auth-token';

// ===== TYPES =====

/**
 * API Error interface
 */
export interface APIError {
  status: number;
  statusText: string;
  message: string;
  details?: unknown;
}

/**
 * Request options interface
 */
export interface APIRequestOptions extends Omit<RequestInit, 'method' | 'body'> {
  timeout?: number;
  skipAuth?: boolean;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Lấy token từ localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Tạo headers mặc định
 */
function createDefaultHeaders(skipAuth = false): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Thêm Authorization header nếu có token và không skip
  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Tạo timeout controller
 */
function createTimeoutController(timeoutMs: number): AbortController {
  const controller = new AbortController();
  
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  // Cleanup timeout nếu request hoàn thành trước
  controller.signal.addEventListener('abort', () => {
    clearTimeout(timeoutId);
  });

  return controller;
}

/**
 * Parse response body
 */
async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text();
}

/**
 * Tạo API error từ response
 */
async function createAPIError(response: Response): Promise<APIError> {
  let message = `HTTP ${response.status} ${response.statusText}`;
  let details: unknown = null;

  try {
    const body = await parseResponseBody(response);
    if (typeof body === 'string') {
      message += ` - ${body}`;
    } else if (body && typeof body === 'object') {
      details = body;
      // Tìm message trong response body
      if ('message' in body && typeof body.message === 'string') {
        message = body.message;
      } else if ('error' in body && typeof body.error === 'string') {
        message = body.error;
      }
    }
  } catch {
    // Ignore parse errors, use default message
  }

  return {
    status: response.status,
    statusText: response.statusText,
    message,
    details,
  };
}

// ===== MAIN API FUNCTIONS =====

/**
 * Generic API request function
 */
async function apiRequest<T = unknown>(
  path: string,
  method: string,
  body?: unknown,
  options: APIRequestOptions = {}
): Promise<T> {
  const {
    timeout = DEFAULT_TIMEOUT,
    skipAuth = false,
    headers: customHeaders = {},
    ...restOptions
  } = options;

  // Tạo URL đầy đủ
  const url = `${API_BASE_URL}${path}`;

  // Tạo headers
  const headers = {
    ...createDefaultHeaders(skipAuth),
    ...customHeaders,
  };

  // Tạo timeout controller
  const timeoutController = createTimeoutController(timeout);

  try {
    // Thực hiện request
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: timeoutController.signal,
      ...restOptions,
    });

    // Kiểm tra response status
    if (!response.ok) {
      throw await createAPIError(response);
    }

    // Parse response
    const data = await parseResponseBody(response);
    return data as T;

  } catch (error) {
    // Handle timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw {
        status: 0,
        statusText: 'Timeout',
        message: 'Request timeout',
        details: null,
      } as APIError;
    }

    // Handle network errors
    if (error instanceof Error && error.message === 'Failed to fetch') {
      throw {
        status: 0,
        statusText: 'Network Error',
        message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
        details: null,
      } as APIError;
    }

    // Re-throw API errors
    throw error;
  }
}

// ===== HTTP METHOD FUNCTIONS =====

/**
 * GET request
 */
export async function apiGet<T = unknown>(
  path: string,
  options?: APIRequestOptions
): Promise<T> {
  return apiRequest<T>(path, 'GET', undefined, options);
}

/**
 * POST request
 */
export async function apiPost<T = unknown>(
  path: string,
  body?: unknown,
  options?: APIRequestOptions
): Promise<T> {
  return apiRequest<T>(path, 'POST', body, options);
}

/**
 * PUT request
 */
export async function apiPut<T = unknown>(
  path: string,
  body?: unknown,
  options?: APIRequestOptions
): Promise<T> {
  return apiRequest<T>(path, 'PUT', body, options);
}

/**
 * DELETE request
 */
export async function apiDelete<T = unknown>(
  path: string,
  options?: APIRequestOptions
): Promise<T> {
  return apiRequest<T>(path, 'DELETE', undefined, options);
}

// ===== SIMPLIFIED HTTP CLIENT =====

/**
 * Simplified HTTP client for backward compatibility
 * Usage: httpClient('/api/endpoint', { method: 'POST', body: JSON.stringify(data) })
 */
export async function httpClient<T = unknown>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { method = 'GET', body, skipAuth = false, ...restOptions } = options;
  
  if (body && typeof body === 'string') {
    // Body already stringified, parse it back for apiRequest
    const parsedBody = JSON.parse(body);
    return apiRequest<T>(path, method, parsedBody, { skipAuth, ...restOptions });
  }
  
  return apiRequest<T>(path, method, body, { skipAuth, ...restOptions });
}

// ===== UTILITY EXPORTS =====

/**
 * Check if error is API error
 */
export function isAPIError(error: unknown): error is APIError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error
  );
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (isAPIError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Đã xảy ra lỗi không xác định';
}

/**
 * Check if error is authentication error
 */
export function isAuthError(error: unknown): boolean {
  return isAPIError(error) && (error.status === 401 || error.status === 403);
}

/**
 * Check if error is network error
 */
export function isNetworkError(error: unknown): boolean {
  return isAPIError(error) && error.status === 0;
}
