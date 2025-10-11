/**
 * API Response Helper
 * Standardized response formatting cho Next.js API routes
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

import { NextResponse } from 'next/server';
import { handlePrismaError } from '@/lib/prisma/error-handler';
import type { ApiErrorResponse, ApiSuccessResponse } from '@/types/api';

// ===== TYPES =====

/**
 * Success Response Options
 */
export interface SuccessResponseOptions<T = unknown> {
  data: T;
  message?: string;
  status?: number;
  meta?: Record<string, unknown>;
}

/**
 * Error Response Options
 */
export interface ErrorResponseOptions {
  error: unknown;
  customMessage?: string;
  status?: number;
  includeTechnicalDetails?: boolean;
}

/**
 * Pagination Metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ===== SUCCESS RESPONSES =====

/**
 * Create success response
 */
export function successResponse<T>(
  options: SuccessResponseOptions<T>
): NextResponse<ApiSuccessResponse<T>> {
  const { data, message, status = 200, meta } = options;

  return NextResponse.json(
    {
      success: true,
      data,
      message,
      meta,
      timestamp: new Date(),
    },
    { status }
  );
}

/**
 * Create success response with pagination
 */
export function successResponseWithPagination<T>(
  data: T[],
  pagination: PaginationMeta,
  message?: string
): NextResponse<ApiSuccessResponse<{ items: T[]; pagination: PaginationMeta }>> {
  return successResponse({
    data: {
      items: data,
      pagination,
    },
    message,
    status: 200,
  });
}

/**
 * Create created response (201)
 */
export function createdResponse<T>(
  data: T,
  message = 'Tạo mới thành công'
): NextResponse<ApiSuccessResponse<T>> {
  return successResponse({
    data,
    message,
    status: 201,
  });
}

/**
 * Create no content response (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

// ===== ERROR RESPONSES =====

/**
 * Create error response
 */
export function errorResponse(
  options: ErrorResponseOptions
): NextResponse<ApiErrorResponse> {
  const {
    error,
    customMessage,
    status,
    includeTechnicalDetails = process.env.NODE_ENV === 'development',
  } = options;

  // Handle Prisma errors
  const errorDetails = handlePrismaError(error, {
    customMessage,
    includeTechnicalDetails,
    logError: true,
  });

  const response: ApiErrorResponse = {
    success: false,
    error: errorDetails.userMessage,
    errorCode: errorDetails.code,
    timestamp: new Date(),
  };

  // Add technical details in development
  if (includeTechnicalDetails) {
    response.details = {
      type: errorDetails.type,
      message: errorDetails.message,
      meta: errorDetails.meta,
    };

    // Add stack trace for unknown errors
    if (error instanceof Error && errorDetails.type === 'UNKNOWN') {
      response.stack = error.stack;
    }
  }

  return NextResponse.json(response, {
    status: status || errorDetails.httpStatus,
  });
}

/**
 * Create validation error response (400)
 */
export function validationErrorResponse(
  message: string,
  details?: Record<string, unknown>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      errorCode: 'VALIDATION_ERROR',
      details,
      timestamp: new Date(),
    },
    { status: 400 }
  );
}

/**
 * Create not found error response (404)
 */
export function notFoundResponse(
  resource = 'Dữ liệu'
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: `${resource} không tồn tại`,
      errorCode: 'NOT_FOUND',
      timestamp: new Date(),
    },
    { status: 404 }
  );
}

/**
 * Create unauthorized error response (401)
 */
export function unauthorizedResponse(
  message = 'Vui lòng đăng nhập để tiếp tục'
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      errorCode: 'UNAUTHORIZED',
      timestamp: new Date(),
    },
    { status: 401 }
  );
}

/**
 * Create forbidden error response (403)
 */
export function forbiddenResponse(
  message = 'Bạn không có quyền truy cập tài nguyên này'
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      errorCode: 'FORBIDDEN',
      timestamp: new Date(),
    },
    { status: 403 }
  );
}

/**
 * Create conflict error response (409)
 */
export function conflictResponse(
  message: string,
  details?: Record<string, unknown>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      errorCode: 'CONFLICT',
      details,
      timestamp: new Date(),
    },
    { status: 409 }
  );
}

/**
 * Create rate limit error response (429)
 */
export function rateLimitResponse(
  message = 'Quá nhiều yêu cầu, vui lòng thử lại sau'
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      errorCode: 'RATE_LIMIT_EXCEEDED',
      timestamp: new Date(),
    },
    { status: 429 }
  );
}

/**
 * Create internal server error response (500)
 */
export function internalServerErrorResponse(
  message = 'Đã xảy ra lỗi hệ thống'
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      errorCode: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date(),
    },
    { status: 500 }
  );
}

// ===== UTILITY FUNCTIONS =====

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Parse pagination params from request
 */
export function parsePaginationParams(searchParams: URLSearchParams): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Wrap API route handler with error handling
 */
export function withErrorHandling<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ApiErrorResponse>> {
  return handler().catch((error) => {
    return errorResponse({ error });
  });
}

