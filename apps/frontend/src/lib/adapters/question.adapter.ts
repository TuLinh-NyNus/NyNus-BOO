/**
 * Question Adapter
 * Converts between domain models and gRPC types
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-21
 */

import {
  type Question as DomainQuestion,
  type QuestionDraft,
  type QuestionFilters,
  QuestionType as DomainQuestionType,
  QuestionStatus as DomainQuestionStatus,
  QuestionDifficulty as DomainQuestionDifficulty,
  type CorrectAnswer as DomainCorrectAnswer,
} from '@/types/question';

import {
  type Question as GrpcQuestion,
  type CreateQuestionRequest,
  type CreateQuestionResponse,
  type GetQuestionRequest,
  type GetQuestionResponse,
  type UpdateQuestionRequest,
  type UpdateQuestionResponse,
  type DeleteQuestionRequest,
  type DeleteQuestionResponse,
  type ListQuestionsRequest,
  type ListQuestionsResponse,
  type Answer,
  type CorrectAnswer as GrpcCorrectAnswer,
  type QuestionType as GrpcQuestionType,
  type QuestionStatus as GrpcQuestionStatus,
  type QuestionDifficulty as GrpcQuestionDifficulty,
} from '@/types/question.types';

// Type for protobuf questions with potential JSON methods
interface ProtobufQuestion extends GrpcQuestion {
  getJsonAnswers?: () => string;
  getJsonCorrectAnswer?: () => string;
}

// Type for protobuf responses with potential nested data
interface ProtobufListResponse {
  questions: DomainQuestion[];
  questionsList?: GrpcQuestion[];
  pagination?: {
    page?: number;
    limit?: number;
    totalCount?: number;
  };
}

interface ProtobufCreateResponse {
  success: boolean;
  data?: GrpcQuestion;
  id?: string;
}

interface ProtobufUpdateResponse {
  success: boolean;
  data?: GrpcQuestion;
}

interface _ProtobufDeleteResponse {
  success: boolean;
  data?: GrpcQuestion;
}

/**
 * Convert gRPC Question to Domain Question
 */
export function grpcQuestionToDomain(grpcQuestion: GrpcQuestion): DomainQuestion {
  const protobufQuestion = grpcQuestion as ProtobufQuestion;

  // Parse answers from JSON if needed
  let answers = grpcQuestion.answers;
  if (!answers && protobufQuestion.getJsonAnswers && typeof protobufQuestion.getJsonAnswers === 'function') {
    try {
      answers = JSON.parse(protobufQuestion.getJsonAnswers());
    } catch {
      answers = undefined;
    }
  }

  // Parse correct answer from JSON if needed
  let correctAnswer = grpcQuestion.correctAnswer;
  if (!correctAnswer && protobufQuestion.getJsonCorrectAnswer && typeof protobufQuestion.getJsonCorrectAnswer === 'function') {
    try {
      correctAnswer = JSON.parse(protobufQuestion.getJsonCorrectAnswer());
    } catch {
      correctAnswer = undefined;
    }
  }

  return {
    id: grpcQuestion.id,
    rawContent: grpcQuestion.rawContent,
    content: grpcQuestion.content,
    subcount: grpcQuestion.subcount,
    type: grpcQuestion.type as DomainQuestionType,
    source: grpcQuestion.source,
    answers,
    correctAnswer: correctAnswer as DomainCorrectAnswer | undefined, // Map to domain type
    solution: grpcQuestion.solution,
    explanation: grpcQuestion.solution, // Map solution to explanation
    tag: grpcQuestion.tag || [],
    usageCount: grpcQuestion.usageCount,
    creator: grpcQuestion.creator,
    status: grpcQuestion.status as DomainQuestionStatus,
    feedback: grpcQuestion.feedback,
    difficulty: grpcQuestion.difficulty as DomainQuestionDifficulty,
    questionCodeId: grpcQuestion.questionCodeId,
    createdAt: grpcQuestion.createdAt,
    updatedAt: grpcQuestion.updatedAt,
    
    // Optional fields
    points: undefined,
    timeLimit: undefined,
  };
}

/**
 * Convert Domain Question to gRPC Question
 */
export function domainQuestionToGrpc(domainQuestion: DomainQuestion): GrpcQuestion {
  return {
    id: domainQuestion.id,
    rawContent: domainQuestion.rawContent,
    content: domainQuestion.content,
    subcount: domainQuestion.subcount || '',
    type: domainQuestion.type as GrpcQuestionType,
    source: domainQuestion.source || '',
    answers: domainQuestion.answers as Answer[],
    // jsonAnswers will be set by protobuf if needed
    correctAnswer: domainQuestion.correctAnswer as GrpcCorrectAnswer,
    // jsonCorrectAnswer: domainQuestion.correctAnswer ? JSON.stringify(domainQuestion.correctAnswer) : undefined, // Not part of protobuf Question
    solution: domainQuestion.solution,
    tag: domainQuestion.tag || [],
    usageCount: domainQuestion.usageCount || 0,
    creator: domainQuestion.creator || '',
    status: (domainQuestion.status || 'PENDING') as GrpcQuestionStatus,
    feedback: domainQuestion.feedback || 0,
    difficulty: (domainQuestion.difficulty || 'MEDIUM') as GrpcQuestionDifficulty,
    questionCodeId: domainQuestion.questionCodeId,
    createdAt: domainQuestion.createdAt,
    updatedAt: domainQuestion.updatedAt,
  };
}

/**
 * Convert QuestionDraft to CreateQuestionRequest
 */
export function draftToCreateRequest(draft: QuestionDraft): CreateQuestionRequest {
  return {
    // rawContent: draft.rawContent || draft.content, // Not part of CreateQuestionRequest
    content: draft.content,
    // subcount: '', // Not part of CreateQuestionRequest
    type: draft.type as GrpcQuestionType,
    // source: draft.source || '', // Not part of CreateQuestionRequest
    answers: draft.answers as Answer[],
    // jsonAnswers will be set by protobuf if needed
    correctAnswer: draft.correctAnswer as GrpcCorrectAnswer,
    // jsonCorrectAnswer: draft.correctAnswer ? JSON.stringify(draft.correctAnswer) : undefined, // Not part of CreateQuestionRequest
    // solution: draft.explanation || '', // Not part of CreateQuestionRequest
    tags: draft.tags || [],
    // questionCodeId: draft.questionCodeId || '', // Not part of CreateQuestionRequest
    // status: 'PENDING' as GrpcQuestionStatus, // Not part of CreateQuestionRequest
    difficulty: (draft.difficulty || 'MEDIUM') as GrpcQuestionDifficulty,
    creator: '',
  };
}

/**
 * Create GetQuestionRequest from ID
 */
export function createGetRequest(id: string): GetQuestionRequest {
  return { id };
}

/**
 * Create UpdateQuestionRequest from ID and updates
 */
export function createUpdateRequest(id: string, updates: Partial<DomainQuestion>): UpdateQuestionRequest {
  const draft: QuestionDraft = {
    content: updates.content || '',
    rawContent: updates.rawContent,
    type: updates.type || DomainQuestionType.MC,
    difficulty: updates.difficulty,
    tags: updates.tag,
    timeLimit: updates.timeLimit,
    points: updates.points,
    explanation: updates.explanation,
    answers: updates.answers,
    correctAnswer: updates.correctAnswer,
    source: updates.source,
    questionCodeId: updates.questionCodeId,
  };

  return {
    id,
    ...draftToCreateRequest(draft),
  };
}

/**
 * Create DeleteQuestionRequest from ID
 */
export function createDeleteRequest(id: string): DeleteQuestionRequest {
  return { id };
}

/**
 * Create ListQuestionsRequest from filters and pagination
 */
export function createListRequest(
  _filters?: QuestionFilters,
  _page?: number,
  _pageSize?: number
): ListQuestionsRequest {
  return {
    // pagination: { // Not part of ListQuestionsRequest
    //   page: page || filters?.page || 1,
    //   limit: pageSize || filters?.pageSize || 20,
    //   sortBy: filters?.sortBy || 'created_at',
    //   sortOrder: filters?.sortDir || 'desc',
    // }
  } as ListQuestionsRequest;
}

/**
 * Parse ListQuestionsResponse to domain format
 */
export function parseListResponse(response: ListQuestionsResponse): {
  questions: DomainQuestion[];
  page: number;
  pageSize: number;
  total: number;
} {
  const protobufResponse = response as ProtobufListResponse;
  return {
    questions: (protobufResponse.questionsList || protobufResponse.questions || []).map(grpcQuestionToDomain),
    page: protobufResponse.pagination?.page || 1,
    pageSize: protobufResponse.pagination?.limit || 20,
    total: protobufResponse.pagination?.totalCount || 0,
  };
}

/**
 * Parse CreateQuestionResponse to domain format
 */
export function parseCreateResponse(response: CreateQuestionResponse): DomainQuestion | null {
  const protobufResponse = response as ProtobufCreateResponse;
  if (protobufResponse.success && protobufResponse.data) {
    return grpcQuestionToDomain(protobufResponse.data);
  }
  return null;
}

/**
 * Parse GetQuestionResponse to domain format
 */
export function parseGetResponse(response: GetQuestionResponse): DomainQuestion | null {
  const protobufResponse = response as unknown as ProtobufCreateResponse; // Same structure as create response
  if (protobufResponse.success && protobufResponse.data) {
    return grpcQuestionToDomain(protobufResponse.data);
  }
  return null;
}

/**
 * Parse UpdateQuestionResponse to domain format
 */
export function parseUpdateResponse(response: UpdateQuestionResponse): DomainQuestion | null {
  const protobufResponse = response as ProtobufUpdateResponse;
  if (protobufResponse.success && protobufResponse.data) {
    return grpcQuestionToDomain(protobufResponse.data);
  }
  return null;
}

/**
 * Parse DeleteQuestionResponse to boolean
 */
export function parseDeleteResponse(response: DeleteQuestionResponse): boolean {
  return response.success;
}