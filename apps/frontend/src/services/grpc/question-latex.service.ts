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
import { getGrpcUrl } from '@/lib/config/endpoints';
import { getAuthMetadata } from './client';

// gRPC client configuration
const GRPC_ENDPOINT = getGrpcUrl();
const questionServiceClient = new QuestionServiceClient(GRPC_ENDPOINT);

// Helper to handle gRPC errors
function handleGrpcError(error: RpcError): string {
  console.error('gRPC Error:', error);
  switch (error.code) {
    case 3: return error.message || 'Dữ liệu không hợp lệ';
    case 5: return 'Không tìm thấy câu hỏi';
    case 7: return 'Bạn không có quyền thực hiện thao tác này';
    case 14: return 'Dịch vụ tạm thời không khả dụng';
    case 16: return 'Vui lòng đăng nhập để tiếp tục';
    default: return error.message || 'Đã xảy ra lỗi không xác định';
  }
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
    try {
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

      return {
        success,
        questions: response.getQuestionsList().map(mapQuestionFromPb),
        question_codes: response.getQuestionCodesList().map(mapQuestionCodeFromPb),
        errors: success ? [] : [message],
        warnings: response.getWarningsList(),
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        questions: [],
        question_codes: [],
        errors: [errorMessage],
        warnings: [],
      };
    }
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
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        created_questions: [],
        created_codes: [],
        created_count: 0,
        failed_count: 0,
        warnings: [],
        error: errorMessage,
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
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        total_processed: 0,
        created_count: 0,
        updated_count: 0,
        skipped_count: 0,
        errors: [{
          row_number: 0,
          field_name: 'general',
          error_message: errorMessage,
          row_data: '',
        }],
        created_codes: [],
      };
    }
  },
};

export default QuestionLatexService;