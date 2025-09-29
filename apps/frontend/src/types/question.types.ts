/**
 * Question Types Compatibility
 * Re-exports from question.ts for backward compatibility
 */

// Re-export everything from question.ts
export * from './question';

// Import specific types for use in this file
import type { AnswerOption, CorrectAnswer, Question, QuestionFilters } from './question';

// Additional types that might be expected for API requests
export interface CreateQuestionRequest {
  content: string;
  type: string;
  difficulty: string;
  answers: AnswerOption[];
  correctAnswer: CorrectAnswer;
  tags?: string[];
  subject?: string;
  creator?: string; // Creator username field from protobuf
}

export interface UpdateQuestionRequest extends CreateQuestionRequest {
  id: string;
}

export interface CreateQuestionResponse {
  id: string;
  success: boolean;
  message?: string;
}

export interface UpdateQuestionResponse {
  success: boolean;
  message?: string;
}

export interface GetQuestionRequest {
  id: string;
}

export interface GetQuestionResponse {
  question: Question;
  success: boolean;
}

export interface DeleteQuestionRequest {
  id: string;
}

export interface DeleteQuestionResponse {
  success: boolean;
  message?: string;
}

export interface ListQuestionsRequest {
  page?: number;
  limit?: number;
  filters?: QuestionFilters;
}

export interface ListQuestionsResponse {
  questions: Question[];
  total: number;
  page: number;
  limit: number;
}

export interface ListQuestionsByFilterRequest extends ListQuestionsRequest {
  type?: string;
  difficulty?: string;
  subject?: string;
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface QuestionDetail {
  id: string;
  content: string;
  rawContent?: string;
  type: string;
  difficulty: string;
  answers: AnswerOption[];
  correctAnswer: CorrectAnswer;
  tags?: string[];
  subject?: string;
  subcountText?: string;
  status?: string;
  createdBy?: string;
  usageCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  id: string;
  content: string;
  isCorrect: boolean;
}
