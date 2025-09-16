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
} from '@/lib/types/question';

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

/**
 * Convert gRPC Question to Domain Question
 */
export function grpcQuestionToDomain(grpcQuestion: GrpcQuestion): DomainQuestion {
  // Parse answers from JSON if needed
  let answers = grpcQuestion.structured_answers;
  if (!answers && grpcQuestion.json_answers) {
    try {
      answers = JSON.parse(grpcQuestion.json_answers);
    } catch {
      answers = undefined;
    }
  }

  // Parse correct answer from JSON if needed
  let correctAnswer = grpcQuestion.structured_correct;
  if (!correctAnswer && grpcQuestion.json_correct_answer) {
    try {
      correctAnswer = JSON.parse(grpcQuestion.json_correct_answer);
    } catch {
      correctAnswer = undefined;
    }
  }

  return {
    id: grpcQuestion.id,
    rawContent: grpcQuestion.raw_content,
    content: grpcQuestion.content,
    subcount: grpcQuestion.subcount,
    type: grpcQuestion.type as DomainQuestionType,
    source: grpcQuestion.source,
    answers,
    correctAnswer: correctAnswer as DomainCorrectAnswer | undefined, // Map to domain type
    solution: grpcQuestion.solution,
    explanation: grpcQuestion.solution, // Map solution to explanation
    tag: grpcQuestion.tag || [],
    usageCount: grpcQuestion.usage_count,
    creator: grpcQuestion.creator,
    status: grpcQuestion.status as DomainQuestionStatus,
    feedback: grpcQuestion.feedback,
    difficulty: grpcQuestion.difficulty as DomainQuestionDifficulty,
    questionCodeId: grpcQuestion.question_code_id,
    createdAt: grpcQuestion.created_at,
    updatedAt: grpcQuestion.updated_at,
    
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
    raw_content: domainQuestion.rawContent,
    content: domainQuestion.content,
    subcount: domainQuestion.subcount || '',
    type: domainQuestion.type as GrpcQuestionType,
    source: domainQuestion.source || '',
    structured_answers: domainQuestion.answers as Answer[],
    json_answers: domainQuestion.answers ? JSON.stringify(domainQuestion.answers) : undefined,
    structured_correct: domainQuestion.correctAnswer as GrpcCorrectAnswer,
    json_correct_answer: domainQuestion.correctAnswer ? JSON.stringify(domainQuestion.correctAnswer) : undefined,
    solution: domainQuestion.solution,
    tag: domainQuestion.tag || [],
    usage_count: domainQuestion.usageCount || 0,
    creator: domainQuestion.creator || '',
    status: (domainQuestion.status || 'PENDING') as GrpcQuestionStatus,
    feedback: domainQuestion.feedback || 0,
    difficulty: (domainQuestion.difficulty || 'MEDIUM') as GrpcQuestionDifficulty,
    question_code_id: domainQuestion.questionCodeId,
    created_at: domainQuestion.createdAt,
    updated_at: domainQuestion.updatedAt,
  };
}

/**
 * Convert QuestionDraft to CreateQuestionRequest
 */
export function draftToCreateRequest(draft: QuestionDraft): CreateQuestionRequest {
  return {
    raw_content: draft.rawContent || draft.content,
    content: draft.content,
    subcount: '',
    type: draft.type as GrpcQuestionType,
    source: draft.source || '',
    structured_answers: draft.answers as Answer[],
    json_answers: draft.answers ? JSON.stringify(draft.answers) : undefined,
    structured_correct: draft.correctAnswer as GrpcCorrectAnswer,
    json_correct_answer: draft.correctAnswer ? JSON.stringify(draft.correctAnswer) : undefined,
    solution: draft.explanation || '',
    tag: draft.tags || [],
    question_code_id: draft.questionCodeId || '',
    status: 'PENDING' as GrpcQuestionStatus,
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
  filters?: QuestionFilters,
  page?: number,
  pageSize?: number
): ListQuestionsRequest {
  return {
    pagination: {
      page: page || filters?.page || 1,
      limit: pageSize || filters?.pageSize || 20,
      sort_by: filters?.sortBy || 'created_at',
      sort_order: filters?.sortDir || 'desc',
    },
  };
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
  return {
    questions: response.questions.map(grpcQuestionToDomain),
    page: response.pagination?.page || 1,
    pageSize: response.pagination?.limit || 20,
    total: response.pagination?.total_count || 0,
  };
}

/**
 * Parse CreateQuestionResponse to domain format
 */
export function parseCreateResponse(response: CreateQuestionResponse): DomainQuestion | null {
  if (response.success && response.question) {
    return grpcQuestionToDomain(response.question);
  }
  return null;
}

/**
 * Parse GetQuestionResponse to domain format
 */
export function parseGetResponse(response: GetQuestionResponse): DomainQuestion | null {
  if (response.success && response.question) {
    return grpcQuestionToDomain(response.question);
  }
  return null;
}

/**
 * Parse UpdateQuestionResponse to domain format
 */
export function parseUpdateResponse(response: UpdateQuestionResponse): DomainQuestion | null {
  if (response.success && response.question) {
    return grpcQuestionToDomain(response.question);
  }
  return null;
}

/**
 * Parse DeleteQuestionResponse to boolean
 */
export function parseDeleteResponse(response: DeleteQuestionResponse): boolean {
  return response.success;
}