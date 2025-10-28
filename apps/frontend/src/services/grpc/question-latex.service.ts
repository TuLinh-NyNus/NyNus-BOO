/**
 * Question LaTeX Service Client
 * ==============================
 * Real gRPC implementation for LaTeX parsing and creation
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { QuestionServiceClient } from '@/generated/v1/QuestionServiceClientPb';
import {
  ParseLatexQuestionRequest,
  ParseLatexQuestionResponse,
  CreateQuestionFromLatexRequest,
  CreateQuestionFromLatexResponse,
  ImportLatexRequest as ImportLatexRequestPb,
  ImportLatexResponse as ImportLatexResponsePb,
  Question,
  QuestionCode,
} from '@/generated/v1/question_pb';
import { RpcError } from 'grpc-web';
import { GRPC_WEB_HOST } from './config';
import { getAuthMetadata } from './client';
import { latexAnalytics, measureParseTime } from '@/lib/analytics/latex-analytics';

// gRPC client configuration
// Uses GRPC_WEB_HOST which routes through API proxy (/api/grpc) by default
// ✅ FIX: Add format option to match proto generation config (mode=grpcwebtext)
const questionServiceClient = new QuestionServiceClient(GRPC_WEB_HOST, null, {
  format: 'text', // Use text format for consistency with proto generation
  withCredentials: false,
  unaryInterceptors: [],
  streamInterceptors: []
});

// Enhanced error handling with detailed error information
function handleGrpcError(error: RpcError): { message: string; code: number; retryable: boolean } {
  console.error('gRPC Error:', {
    code: error.code,
    message: error.message,
    metadata: error.metadata,
    timestamp: new Date().toISOString()
  });

  const errorInfo = {
    code: error.code,
    retryable: false,
    message: ''
  };

  switch (error.code) {
    case 3: // INVALID_ARGUMENT
      errorInfo.message = error.message || 'Dữ liệu đầu vào không hợp lệ. Vui lòng kiểm tra định dạng LaTeX.';
      break;
    case 5: // NOT_FOUND
      errorInfo.message = 'Không tìm thấy tài nguyên được yêu cầu';
      break;
    case 7: // PERMISSION_DENIED
      errorInfo.message = 'Bạn không có quyền thực hiện thao tác này. Vui lòng liên hệ quản trị viên.';
      break;
    case 8: // RESOURCE_EXHAUSTED
      errorInfo.message = 'Hệ thống đang quá tải. Vui lòng thử lại sau ít phút.';
      errorInfo.retryable = true;
      break;
    case 14: // UNAVAILABLE
      errorInfo.message = 'Dịch vụ tạm thời không khả dụng. Đang thử kết nối lại...';
      errorInfo.retryable = true;
      break;
    case 16: // UNAUTHENTICATED
      errorInfo.message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      break;
    case 4: // DEADLINE_EXCEEDED
      errorInfo.message = 'Quá trình xử lý mất quá nhiều thời gian. Vui lòng thử lại.';
      errorInfo.retryable = true;
      break;
    default:
      errorInfo.message = error.message || 'Đã xảy ra lỗi không xác định. Vui lòng thử lại hoặc liên hệ hỗ trợ.';
      errorInfo.retryable = error.code >= 500; // Server errors are generally retryable
  }

  return errorInfo;
}

// Retry mechanism for retryable errors
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const errorInfo = handleGrpcError(error as RpcError);
      
      // Don't retry if error is not retryable or we've exhausted retries
      if (!errorInfo.retryable || attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`, errorInfo);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Input validation for LaTeX content
function validateLatexInput(content: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!content || content.trim().length === 0) {
    errors.push('Nội dung LaTeX không được để trống');
  }
  
  if (content.length > 50000) { // 50KB limit
    errors.push('Nội dung LaTeX quá dài (tối đa 50,000 ký tự)');
  }
  
  // Check for required LaTeX structure
  if (!content.includes('\\begin{ex}')) {
    errors.push('Nội dung phải chứa cấu trúc \\begin{ex}...\\end{ex}');
  }
  
  // Check for balanced braces
  const openBraces = (content.match(/\\begin\{ex\}/g) || []).length;
  const closeBraces = (content.match(/\\end\{ex\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push('Cấu trúc \\begin{ex} và \\end{ex} không cân bằng');
  }
  
  // Check for potentially dangerous content
  const dangerousPatterns = [
    /\\input\{/,
    /\\include\{/,
    /\\write/,
    /\\immediate/
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      errors.push('Nội dung chứa lệnh LaTeX không được phép');
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Types for LaTeX operations (Frontend interfaces)
export interface ParseLatexRequest {
  latex_content: string;
  is_base64?: boolean;
}

export interface ParsedQuestion {
  id?: string;
  raw_content: string;
  content: string;
  subcount?: string;
  type: string;
  source?: string;
  answers?: any;
  correct_answer?: any;
  solution?: string;
  question_code?: string;
  warnings: string[];
}

export interface ParseLatexResponse {
  success: boolean;
  questions: ParsedQuestion[];
  question_codes: Array<{
    id: string;
    prefix: string;
    main_code: string;
    extend_code: string;
    num_part: string;
    description: string;
  }>;
  errors: string[];
  warnings: string[];
}

export interface CreateFromLatexRequest {
  latex_content: string;
  is_base64?: boolean;
  auto_create_codes: boolean;
}

export interface CreateFromLatexResponse {
  success: boolean;
  created_questions: ParsedQuestion[];
  created_codes: Array<{
    id: string;
    prefix: string;
    main_code: string;
    extend_code: string;
    num_part: string;
    description: string;
  }>;
  created_count: number;
  failed_count: number;
  warnings: string[];
  error?: string;
}

export interface ImportLatexRequest {
  latex_content?: string;
  is_base64?: boolean;
  upsert_mode: boolean;
  auto_create_codes: boolean;
}

export interface ImportLatexResponse {
  total_processed: number;
  created_count: number;
  updated_count: number;
  skipped_count: number;
  errors: ImportError[];
  created_codes: string[];
}

export interface ImportError {
  row_number: number;
  field_name: string;
  error_message: string;
  row_data: string;
}

// Helper functions to map proto to frontend types
function mapQuestionFromPb(q: Question): ParsedQuestion {
  return {
    id: q.getId() || undefined,
    raw_content: q.getRawContent(),
    content: q.getContent(),
    subcount: q.getSubcount() || undefined,
    type: q.getType().toString(),
    source: q.getSource() || undefined,
    answers: q.getJsonAnswers() || undefined,
    correct_answer: q.getJsonCorrectAnswer() || undefined,
    solution: q.getSolution() || undefined,
    question_code: q.getQuestionCodeId() || undefined,
    warnings: [],
  };
}

function mapQuestionCodeFromPb(qc: QuestionCode) {
  return {
    id: qc.getId(),
    prefix: qc.getPrefix(),
    main_code: qc.getMainCode(),
    extend_code: qc.getExtendCode(),
    num_part: qc.getNumPart(),
    description: qc.getDescription(),
  };
}

// Export service functions
export const QuestionLatexService = {
  /**
   * Parse LaTeX content to extract question data
   */
  parseLatex: async (params: ParseLatexRequest): Promise<ParseLatexResponse> => {
    // Input validation
    const validation = validateLatexInput(params.latex_content);
    if (!validation.isValid) {
      return {
        success: false,
        questions: [],
        question_codes: [],
        errors: validation.errors,
        warnings: [],
      };
    }

    return withRetry(async () => {
      const { result, parseTimeMs } = await measureParseTime(async () => {
        const request = new ParseLatexQuestionRequest();
        request.setLatexContent(params.latex_content);
        request.setIsBase64(params.is_base64 || false);

        const response: ParseLatexQuestionResponse = await questionServiceClient.parseLatexQuestion(
          request,
          getAuthMetadata()
        );

        const responseObj = response.getResponse();
        const success = responseObj?.getSuccess() || false;
        const message = responseObj?.getMessage() || '';

        const parseResult = {
          success,
          questions: response.getQuestionsList().map(mapQuestionFromPb),
          question_codes: response.getQuestionCodesList().map(mapQuestionCodeFromPb),
          errors: success ? [] : [message],
          warnings: response.getWarningsList(),
        };

        // Ghi lại analytics
        latexAnalytics.recordParseEvent({
          contentLength: params.latex_content.length,
          parseTimeMs,
          success,
          questionCount: parseResult.questions.length,
          warningCount: parseResult.warnings.length,
          errorMessage: success ? undefined : message
        });

        return parseResult;
      }, params.latex_content.length);

      return result;
    });
  },

  /**
   * Create a question from LaTeX content
   */
  createFromLatex: async (params: CreateFromLatexRequest): Promise<CreateFromLatexResponse> => {
    try {
      const request = new CreateQuestionFromLatexRequest();
      request.setLatexContent(params.latex_content);
      request.setIsBase64(params.is_base64 || false);
      request.setAutoCreateCodes(params.auto_create_codes);

      const response: CreateQuestionFromLatexResponse = await questionServiceClient.createQuestionFromLatex(
        request,
        getAuthMetadata()
      );

      const responseObj = response.getResponse();
      const success = responseObj?.getSuccess() || false;
      const message = responseObj?.getMessage() || '';

      return {
        success,
        created_questions: response.getCreatedQuestionsList().map(mapQuestionFromPb),
        created_codes: response.getCreatedCodesList().map(mapQuestionCodeFromPb),
        created_count: response.getCreatedCount(),
        failed_count: response.getFailedCount(),
        warnings: response.getWarningsList(),
        error: success ? undefined : message,
      };
    } catch (error) {
      const errorInfo = handleGrpcError(error as RpcError);
      return {
        success: false,
        created_questions: [],
        created_codes: [],
        created_count: 0,
        failed_count: 0,
        warnings: [],
        error: errorInfo.message,
      };
    }
  },

  /**
   * Import multiple questions from LaTeX content
   */
  importLatex: async (params: ImportLatexRequest): Promise<ImportLatexResponse> => {
    try {
      const request = new ImportLatexRequestPb();
      request.setLatexContent(params.latex_content || '');
      request.setIsBase64(params.is_base64 || false);
      request.setUpsertMode(params.upsert_mode);
      request.setAutoCreateCodes(params.auto_create_codes);

      const response: ImportLatexResponsePb = await questionServiceClient.importLatex(
        request,
        getAuthMetadata()
      );

      return {
        total_processed: response.getTotalProcessed(),
        created_count: response.getCreatedCount(),
        updated_count: response.getUpdatedCount(),
        skipped_count: response.getSkippedCount(),
        errors: response.getErrorsList().map((err) => ({
          row_number: err.getRowNumber(),
          field_name: err.getFieldName(),
          error_message: err.getErrorMessage(),
          row_data: err.getRowData(),
        })),
        created_codes: response.getQuestionCodesCreatedList(),
      };
    } catch (error) {
      const errorInfo = handleGrpcError(error as RpcError);
      return {
        total_processed: 0,
        created_count: 0,
        updated_count: 0,
        skipped_count: 0,
        errors: [{
          row_number: 0,
          field_name: 'general',
          error_message: errorInfo.message,
          row_data: '',
        }],
        created_codes: [],
      };
    }
  },
};

export default QuestionLatexService;