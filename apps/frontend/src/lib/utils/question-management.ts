/**
 * Question Management Utilities
 * Advanced utilities cho question CRUD operations và management
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { Question, QuestionType, QuestionStatus } from '@/lib/types/question';

// ===== TYPES =====

export type QuestionOperation = 
  | 'create'
  | 'update'
  | 'delete'
  | 'duplicate'
  | 'archive'
  | 'restore'
  | 'publish'
  | 'unpublish';

export interface QuestionOperationRequest {
  operation: QuestionOperation;
  questionId?: string;
  questionIds?: string[];
  data?: Partial<Question>;
  options?: Record<string, unknown>;
}

export interface QuestionOperationResult {
  success: boolean;
  operation: QuestionOperation;
  processedCount: number;
  failedCount: number;
  results: QuestionOperationItemResult[];
  errors: string[];
  warnings: string[];
  metadata?: Record<string, unknown>;
}

export interface QuestionOperationItemResult {
  questionId: string;
  success: boolean;
  error?: string;
  data?: Partial<Question>;
}

export interface QuestionValidationResult {
  isValid: boolean;
  errors: QuestionValidationError[];
  warnings: QuestionValidationWarning[];
  score: number; // 0-100 quality score
}

export interface QuestionValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  code: string;
}

export interface QuestionValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
  code: string;
}

export interface QuestionDuplicationOptions {
  preserveId?: boolean;
  updateTitle?: boolean;
  updateCode?: boolean;
  copyAnswers?: boolean;
  copyExplanations?: boolean;
  targetStatus?: QuestionStatus;
}

export interface QuestionArchiveOptions {
  reason?: string;
  preserveUsage?: boolean;
  notifyUsers?: boolean;
  archiveDate?: Date;
}

// ===== VALIDATION FUNCTIONS =====

/**
 * Comprehensive question validation
 */
export function validateQuestion(question: Partial<Question>): QuestionValidationResult {
  const errors: QuestionValidationError[] = [];
  const warnings: QuestionValidationWarning[] = [];
  let score = 100;

  // Required fields validation
  if (!question.content || question.content.trim() === '') {
    errors.push({
      field: 'content',
      message: 'Nội dung câu hỏi không được để trống',
      severity: 'error',
      code: 'CONTENT_REQUIRED'
    });
    score -= 30;
  }

  if (!question.type) {
    errors.push({
      field: 'type',
      message: 'Loại câu hỏi không được để trống',
      severity: 'error',
      code: 'TYPE_REQUIRED'
    });
    score -= 20;
  }

  if (!question.questionCodeId) {
    errors.push({
      field: 'questionCodeId',
      message: 'Mã câu hỏi không được để trống',
      severity: 'error',
      code: 'CODE_REQUIRED'
    });
    score -= 15;
  }

  // Content quality validation
  if (question.content && question.content.length < 10) {
    warnings.push({
      field: 'content',
      message: 'Nội dung câu hỏi quá ngắn',
      suggestion: 'Nên có ít nhất 10 ký tự để đảm bảo rõ ràng',
      code: 'CONTENT_TOO_SHORT'
    });
    score -= 5;
  }

  if (question.content && question.content.length > 1000) {
    warnings.push({
      field: 'content',
      message: 'Nội dung câu hỏi quá dài',
      suggestion: 'Nên rút gọn xuống dưới 1000 ký tự',
      code: 'CONTENT_TOO_LONG'
    });
    score -= 5;
  }

  // QuestionCode format validation
  if (question.questionCodeId) {
    const codePattern = /^[0-9A-C][A-Z][1-9][NHVCTM][1-9A-Z](-[1-9])?$/;
    if (!codePattern.test(question.questionCodeId)) {
      errors.push({
        field: 'questionCodeId',
        message: 'Mã câu hỏi không đúng định dạng',
        severity: 'error',
        code: 'INVALID_CODE_FORMAT'
      });
      score -= 10;
    }
  }

  // Type-specific validation
  if (question.type === QuestionType.MC) {
    // Validate multiple choice specific fields
    if (!question.answers || question.answers.length < 2) {
      errors.push({
        field: 'answers',
        message: 'Câu hỏi trắc nghiệm cần ít nhất 2 đáp án',
        severity: 'error',
        code: 'INSUFFICIENT_ANSWERS'
      });
      score -= 15;
    }

    if (question.answers && !question.answers.some(a => 'isCorrect' in a && a.isCorrect)) {
      errors.push({
        field: 'answers',
        message: 'Cần có ít nhất một đáp án đúng',
        severity: 'error',
        code: 'NO_CORRECT_ANSWER'
      });
      score -= 20;
    }
  }

  // Difficulty validation
  if (question.difficulty && !['EASY', 'MEDIUM', 'HARD'].includes(question.difficulty)) {
    errors.push({
      field: 'difficulty',
      message: 'Độ khó không hợp lệ',
      severity: 'error',
      code: 'INVALID_DIFFICULTY'
    });
    score -= 5;
  }

  // Status validation
  if (question.status && !['ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED'].includes(question.status)) {
    errors.push({
      field: 'status',
      message: 'Trạng thái không hợp lệ',
      severity: 'error',
      code: 'INVALID_STATUS'
    });
    score -= 5;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score)
  };
}

/**
 * Validate question for specific operation
 */
export function validateQuestionForOperation(
  question: Question,
  operation: QuestionOperation
): QuestionValidationResult {
  const baseValidation = validateQuestion(question);
  const errors = [...baseValidation.errors];
  const warnings = [...baseValidation.warnings];

  switch (operation) {
    case 'publish':
      if (question.status === QuestionStatus.PENDING) {
        if (!question.explanation) {
          warnings.push({
            field: 'explanation',
            message: 'Nên có lời giải khi publish câu hỏi',
            suggestion: 'Thêm lời giải để tăng chất lượng',
            code: 'MISSING_EXPLANATION'
          });
        }
      }
      break;

    case 'archive':
      if (question.usageCount && question.usageCount > 0) {
        warnings.push({
          field: 'usageCount',
          message: 'Câu hỏi đang được sử dụng',
          suggestion: 'Cân nhắc thông báo trước khi archive',
          code: 'QUESTION_IN_USE'
        });
      }
      break;

    case 'delete':
      if (question.usageCount && question.usageCount > 0) {
        errors.push({
          field: 'usageCount',
          message: 'Không thể xóa câu hỏi đang được sử dụng',
          severity: 'error',
          code: 'CANNOT_DELETE_IN_USE'
        });
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: baseValidation.score
  };
}

// ===== OPERATION FUNCTIONS =====

/**
 * Duplicate question với options
 */
export function duplicateQuestion(
  question: Question,
  options: QuestionDuplicationOptions = {}
): Partial<Question> {
  const {
    preserveId = false,
    updateTitle = true,
    updateCode = true,
    copyAnswers = true,
    copyExplanations = true,
    targetStatus = QuestionStatus.PENDING
  } = options;

  const duplicated: Partial<Question> = {
    ...question,
    id: preserveId ? question.id : undefined, // Will be generated
    status: targetStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0,
    feedback: 0
  };

  // Update title if requested
  if (updateTitle && question.content) {
    duplicated.content = `${question.content} (Copy)`;
  }

  // Update code if requested
  if (updateCode && question.questionCodeId) {
    // Generate new code by incrementing or adding suffix
    const baseCode = question.questionCodeId.replace(/-\d+$/, '');
    const existingSuffix = question.questionCodeId.match(/-(\d+)$/);
    const newSuffix = existingSuffix ? parseInt(existingSuffix[1]) + 1 : 2;
    duplicated.questionCodeId = `${baseCode}-${newSuffix}`;
  }

  // Copy answers if requested
  if (!copyAnswers) {
    duplicated.answers = [];
  }

  // Copy explanations if requested
  if (!copyExplanations) {
    duplicated.explanation = '';
    duplicated.solution = '';
  }

  return duplicated;
}

/**
 * Archive question với metadata
 */
export function archiveQuestion(
  question: Question,
  options: QuestionArchiveOptions = {}
): Partial<Question> {
  const {
    reason: _reason = 'Manual archive',
    preserveUsage: _preserveUsage = true,
    archiveDate: _archiveDate = new Date()
  } = options;

  return {
    ...question,
    status: QuestionStatus.ARCHIVED,
    updatedAt: new Date().toISOString(),
    // metadata: {
    //   ...question.metadata,
    //   archiveInfo: {
    //     reason,
    //     archiveDate: archiveDate.toISOString(),
    //     preserveUsage,
    //     originalStatus: question.status
    //   }
    // }
  };
}

/**
 * Restore archived question
 */
export function restoreQuestion(question: Question): Partial<Question> {
  // const archiveInfo = question.metadata?.archiveInfo;
  const originalStatus = QuestionStatus.PENDING; // Default status when restoring

  return {
    ...question,
    status: originalStatus,
    updatedAt: new Date().toISOString(),
    // metadata: {
    //   ...question.metadata,
    //   restoreInfo: {
    //     restoreDate: new Date().toISOString(),
    //     restoredFrom: 'ARCHIVED',
    //     restoredTo: originalStatus
    //   }
    // }
  };
}

// ===== BATCH OPERATIONS =====

/**
 * Process batch question operations
 */
export async function processBatchQuestionOperations(
  requests: QuestionOperationRequest[]
): Promise<QuestionOperationResult[]> {
  const results: QuestionOperationResult[] = [];

  for (const request of requests) {
    try {
      const result = await processQuestionOperation(request);
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        operation: request.operation,
        processedCount: 0,
        failedCount: request.questionIds?.length || 1,
        results: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      });
    }
  }

  return results;
}

/**
 * Process single question operation
 */
export async function processQuestionOperation(
  request: QuestionOperationRequest
): Promise<QuestionOperationResult> {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));

  const { operation, questionId, questionIds, data, options: _options } = request;
  const targetIds = questionIds || (questionId ? [questionId] : []);

  const results: QuestionOperationItemResult[] = [];
  let processedCount = 0;
  let failedCount = 0;
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const id of targetIds) {
    try {
      // Simulate operation processing
      const success = Math.random() > 0.1; // 90% success rate

      if (success) {
        results.push({
          questionId: id,
          success: true,
          data: data
        });
        processedCount++;
      } else {
        results.push({
          questionId: id,
          success: false,
          error: `Failed to ${operation} question ${id}`
        });
        failedCount++;
        errors.push(`Failed to ${operation} question ${id}`);
      }
    } catch (error) {
      results.push({
        questionId: id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      failedCount++;
      errors.push(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  return {
    success: failedCount === 0,
    operation,
    processedCount,
    failedCount,
    results,
    errors,
    warnings
  };
}

// ===== UTILITY FUNCTIONS =====

/**
 * Generate question summary
 */
export function generateQuestionSummary(question: Question): string {
  const parts = [];

  if (question.questionCodeId) {
    parts.push(`[${question.questionCodeId}]`);
  }

  if (question.type) {
    parts.push(question.type);
  }

  if (question.difficulty) {
    parts.push(`(${question.difficulty})`);
  }

  if (question.content) {
    const content = question.content.length > 50 
      ? question.content.substring(0, 50) + '...'
      : question.content;
    parts.push(`- ${content}`);
  }

  return parts.join(' ');
}

/**
 * Calculate question quality score
 */
export function calculateQuestionQuality(question: Question): number {
  let score = 0;

  // Content quality (40 points)
  if (question.content) {
    if (question.content.length >= 20) score += 20;
    if (question.content.length <= 500) score += 10;
    if (question.content.includes('$')) score += 5; // Has LaTeX
    if (question.content.match(/[.!?]$/)) score += 5; // Proper ending
  }

  // Structure quality (30 points)
  if (question.answers && question.answers.length >= 2) score += 10;
  if (question.answers && question.answers.some(a => 'isCorrect' in a && a.isCorrect)) score += 10;
  if (question.explanation) score += 10;

  // Metadata quality (20 points)
  if (question.difficulty) score += 5;
  if (question.questionCodeId) score += 5;
  if (question.tag && question.tag.length > 0) score += 5;
  if (question.source) score += 5;

  // Usage quality (10 points)
  if (question.usageCount && question.usageCount > 0) score += 5;
  if (question.feedback && question.feedback >= 4) score += 5;

  return Math.min(100, score);
}
