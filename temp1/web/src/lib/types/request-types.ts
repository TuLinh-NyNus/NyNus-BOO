/**
 * Comprehensive request type definitions
 * Fixes TypeScript errors in session fingerprint and request handling
 */

// Headers interface for Next.js requests
export interface RequestHeaders {
  get(name: string): string | null;
  has(name: string): boolean;
  forEach(callback: (value: string, key: string) => void): void;
  entries(): IterableIterator<[string, string]>;
  keys(): IterableIterator<string>;
  values(): IterableIterator<string>;
  [Symbol.iterator](): IterableIterator<[string, string]>;
}

// Next.js Request interface
export interface NextJSRequest {
  headers: RequestHeaders;
  method?: string;
  url?: string;
  ip?: string;
  body?: unknown;
  cookies?: Record<string, string>;
  query?: Record<string, string | string[]>;
  params?: Record<string, string>;
}

// Standard HTTP Request interface
export interface StandardRequest {
  headers: Record<string, string | string[] | undefined>;
  method?: string;
  url?: string;
  ip?: string;
  body?: unknown;
  cookies?: Record<string, string>;
  query?: Record<string, string | string[]>;
  params?: Record<string, string>;
}

// Union type for all possible request types
export type RequestObject = 
  | NextJSRequest
  | StandardRequest
  | { headers: RequestHeaders; [key: string]: unknown }
  | { headers: Record<string, string | string[] | undefined>; [key: string]: unknown }
  | Record<string, unknown>;

// Type guards for request objects
export function isRequestObject(request: unknown): request is RequestObject {
  return typeof request === 'object' && request !== null;
}

export function hasHeaders(request: unknown): request is { headers: unknown } {
  return isRequestObject(request) && 'headers' in request && request.headers !== null;
}

export function hasNextJSHeaders(request: unknown): request is { headers: RequestHeaders } {
  return hasHeaders(request) && 
         typeof request.headers === 'object' &&
         request.headers !== null &&
         typeof (request.headers as any).get === 'function';
}

export function hasStandardHeaders(request: unknown): request is { headers: Record<string, string | string[] | undefined> } {
  return hasHeaders(request) && 
         typeof request.headers === 'object' &&
         request.headers !== null &&
         typeof (request.headers as any).get !== 'function';
}

export function isNextJSRequest(request: unknown): request is NextJSRequest {
  return hasNextJSHeaders(request);
}

export function isStandardRequest(request: unknown): request is StandardRequest {
  return hasStandardHeaders(request);
}

// Safe header access functions
export function getHeaderValue(request: unknown, headerName: string): string | null {
  if (!hasHeaders(request)) {
    return null;
  }

  if (hasNextJSHeaders(request)) {
    // Next.js Request with Headers object
    return request.headers.get(headerName);
  }

  if (hasStandardHeaders(request)) {
    // Standard request with headers object
    const value = request.headers[headerName];
    if (typeof value === 'string') {
      return value;
    }
    if (Array.isArray(value) && value.length > 0) {
      return value[0];
    }
  }

  return null;
}

export function getAllHeaders(request: unknown): Record<string, string> {
  const headers: Record<string, string> = {};

  if (!hasHeaders(request)) {
    return headers;
  }

  if (hasNextJSHeaders(request)) {
    // Next.js Request with Headers object
    try {
      for (const [key, value] of request.headers.entries()) {
        headers[key] = value;
      }
    } catch (error) {
      // Fallback if entries() is not available
      // Try common headers
      const commonHeaders = [
        'user-agent', 'accept-language', 'accept-encoding', 'connection',
        'dnt', 'x-timezone', 'x-screen-resolution', 'x-color-depth',
        'x-platform', 'x-cookie-enabled'
      ];
      
      for (const headerName of commonHeaders) {
        const value = request.headers.get(headerName);
        if (value) {
          headers[headerName] = value;
        }
      }
    }
  } else if (hasStandardHeaders(request)) {
    // Standard request with headers object
    for (const [key, value] of Object.entries(request.headers)) {
      if (typeof value === 'string') {
        headers[key] = value;
      } else if (Array.isArray(value) && value.length > 0) {
        headers[key] = value[0];
      }
    }
  }

  return headers;
}

// Request property access helpers
export function getRequestMethod(request: unknown): string | undefined {
  if (isRequestObject(request) && 'method' in request) {
    return typeof request.method === 'string' ? request.method : undefined;
  }
  return undefined;
}

export function getRequestUrl(request: unknown): string | undefined {
  if (isRequestObject(request) && 'url' in request) {
    return typeof request.url === 'string' ? request.url : undefined;
  }
  return undefined;
}

export function getRequestIP(request: unknown): string | undefined {
  if (isRequestObject(request) && 'ip' in request) {
    return typeof request.ip === 'string' ? request.ip : undefined;
  }
  return undefined;
}

export function getRequestBody(request: unknown): unknown {
  if (isRequestObject(request) && 'body' in request) {
    return request.body;
  }
  return undefined;
}

export function getRequestCookies(request: unknown): Record<string, string> {
  if (isRequestObject(request) && 'cookies' in request) {
    const cookies = request.cookies;
    if (typeof cookies === 'object' && cookies !== null) {
      return cookies as Record<string, string>;
    }
  }
  return {};
}

export function getRequestQuery(request: unknown): Record<string, string | string[]> {
  if (isRequestObject(request) && 'query' in request) {
    const query = request.query;
    if (typeof query === 'object' && query !== null) {
      return query as Record<string, string | string[]>;
    }
  }
  return {};
}

export function getRequestParams(request: unknown): Record<string, string> {
  if (isRequestObject(request) && 'params' in request) {
    const params = request.params;
    if (typeof params === 'object' && params !== null) {
      return params as Record<string, string>;
    }
  }
  return {};
}

// Normalize request to standard format
export function normalizeRequest(request: unknown): StandardRequest {
  if (!isRequestObject(request)) {
    return {
      headers: {},
      method: undefined,
      url: undefined,
      ip: undefined,
      body: undefined,
      cookies: {},
      query: {},
      params: {}
    };
  }

  return {
    headers: getAllHeaders(request),
    method: getRequestMethod(request),
    url: getRequestUrl(request),
    ip: getRequestIP(request),
    body: getRequestBody(request),
    cookies: getRequestCookies(request),
    query: getRequestQuery(request),
    params: getRequestParams(request)
  };
}

// Create typed request from unknown
export function createTypedRequest(request: unknown): NextJSRequest | StandardRequest | null {
  if (!isRequestObject(request)) {
    return null;
  }

  if (isNextJSRequest(request)) {
    return request;
  }

  if (isStandardRequest(request)) {
    return request;
  }

  // Try to normalize
  return normalizeRequest(request);
}

// Request validation
export function validateRequest(request: unknown): boolean {
  return isRequestObject(request) && hasHeaders(request);
}

// Safe request property access with defaults
export function safeGetRequestProperty<T>(
  request: unknown,
  property: string,
  defaultValue: T
): T {
  if (isRequestObject(request) && property in request) {
    const value = (request as any)[property];
    return value !== undefined ? value : defaultValue;
  }
  return defaultValue;
}

// Request type constants
export const REQUEST_TYPES = {
  NEXTJS: 'NextJSRequest',
  STANDARD: 'StandardRequest',
  UNKNOWN: 'UnknownRequest'
} as const;

export type RequestTypeName = typeof REQUEST_TYPES[keyof typeof REQUEST_TYPES];

// Get request type
export function getRequestType(request: unknown): RequestTypeName {
  if (isNextJSRequest(request)) {
    return REQUEST_TYPES.NEXTJS;
  }
  if (isStandardRequest(request)) {
    return REQUEST_TYPES.STANDARD;
  }
  return REQUEST_TYPES.UNKNOWN;
}
