/**
 * Filter Validation Utilities
 * Validation logic cho question filters với conflict resolution
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { QuestionFilters, QuestionType, QuestionDifficulty, QuestionStatus } from '@/lib/types/question';

// ===== INTERFACES =====

export interface FilterValidationResult {
  isValid: boolean;
  errors: FilterValidationError[];
  warnings: FilterValidationWarning[];
  suggestions: FilterSuggestion[];
}

export interface FilterValidationError {
  field: keyof QuestionFilters;
  message: string;
  severity: 'error' | 'warning';
  code: string;
}

export interface FilterValidationWarning {
  field: keyof QuestionFilters;
  message: string;
  code: string;
}

export interface FilterSuggestion {
  field: keyof QuestionFilters;
  message: string;
  action: 'remove' | 'modify' | 'add';
  suggestedValue?: unknown;
}

export interface FilterConflict {
  conflictingFields: (keyof QuestionFilters)[];
  description: string;
  resolution: 'remove_one' | 'modify_values' | 'user_choice';
  suggestions: FilterSuggestion[];
}

// ===== VALIDATION RULES =====

/**
 * Validate QuestionCode filter combinations
 */
function validateQuestionCodeFilters(filters: QuestionFilters): FilterValidationError[] {
  const errors: FilterValidationError[] = [];

  // Validate grade-subject combinations
  if (filters.grade?.length && filters.subject?.length) {
    // Check if grade-subject combinations are valid
    const invalidCombinations = [];
    for (const grade of filters.grade) {
      for (const subject of filters.subject) {
        // Validate specific combinations (ví dụ: grade 0-2 chỉ có certain subjects)
        if (grade === '0' && !['P', 'L', 'H', 'S', 'V', 'A'].includes(subject)) {
          invalidCombinations.push(`${grade}-${subject}`);
        }
      }
    }
    
    if (invalidCombinations.length > 0) {
      errors.push({
        field: 'subject',
        message: `Tổ hợp lớp-môn không hợp lệ: ${invalidCombinations.join(', ')}`,
        severity: 'error',
        code: 'INVALID_GRADE_SUBJECT_COMBINATION'
      });
    }
  }

  // Validate form field chỉ áp dụng cho ID6 format
  if (filters.form?.length && filters.format?.length && !filters.format.includes('ID6')) {
    errors.push({
      field: 'form',
      message: 'Trường "Dạng" chỉ áp dụng cho format ID6',
      severity: 'error',
      code: 'FORM_REQUIRES_ID6_FORMAT'
    });
  }

  // Validate chapter-lesson combinations
  if (filters.chapter?.length && filters.lesson?.length) {
    // Check if chapter có enough lessons
    const invalidLessons = [];
    for (const chapter of filters.chapter) {
      for (const lesson of filters.lesson) {
        // Validate lesson range cho each chapter
        const chapterNum = parseInt(chapter);
        const lessonNum = parseInt(lesson);
        if (!isNaN(chapterNum) && !isNaN(lessonNum) && lessonNum > chapterNum * 5) {
          invalidLessons.push(`Chapter ${chapter} - Lesson ${lesson}`);
        }
      }
    }
    
    if (invalidLessons.length > 0) {
      errors.push({
        field: 'lesson',
        message: `Tổ hợp chương-bài không hợp lệ: ${invalidLessons.join(', ')}`,
        severity: 'warning',
        code: 'INVALID_CHAPTER_LESSON_COMBINATION'
      });
    }
  }

  return errors;
}

/**
 * Validate metadata filter combinations
 */
function validateMetadataFilters(filters: QuestionFilters): FilterValidationError[] {
  const errors: FilterValidationError[] = [];

  // Validate type-difficulty combinations
  if (filters.type?.length && filters.difficulty?.length) {
    // Certain question types có limited difficulty options
    const restrictedCombinations = [];
    
    if (filters.type.includes(QuestionType.TF) && filters.difficulty.includes(QuestionDifficulty.HARD)) {
      restrictedCombinations.push('True/False - Hard');
    }
    
    if (restrictedCombinations.length > 0) {
      errors.push({
        field: 'difficulty',
        message: `Tổ hợp loại câu hỏi-độ khó không phổ biến: ${restrictedCombinations.join(', ')}`,
        severity: 'warning',
        code: 'UNCOMMON_TYPE_DIFFICULTY_COMBINATION'
      });
    }
  }

  // Validate status combinations
  if (filters.status?.length && filters.status.includes(QuestionStatus.ARCHIVED) && filters.status.length > 1) {
    errors.push({
      field: 'status',
      message: 'Không nên kết hợp trạng thái ARCHIVED với các trạng thái khác',
      severity: 'warning',
      code: 'ARCHIVED_STATUS_COMBINATION'
    });
  }

  return errors;
}

/**
 * Validate content filter combinations
 */
function validateContentFilters(filters: QuestionFilters): FilterValidationError[] {
  const errors: FilterValidationError[] = [];

  // Validate boolean filter conflicts
  const booleanFilters = [
    { field: 'hasAnswers', value: filters.hasAnswers },
    { field: 'hasSolution', value: filters.hasSolution },
    { field: 'hasImages', value: filters.hasImages }
  ];

  // Check for conflicting boolean values
  const conflictingBooleans = booleanFilters.filter(f => f.value === false);
  if (conflictingBooleans.length >= 2) {
    errors.push({
      field: 'hasAnswers',
      message: 'Quá nhiều điều kiện loại trừ có thể không trả về kết quả nào',
      severity: 'warning',
      code: 'TOO_MANY_EXCLUSIONS'
    });
  }

  // Validate subcount format
  if (filters.subcount && !/^\[?\d{1,2}\.\d{1,2}\]?$/.test(filters.subcount)) {
    errors.push({
      field: 'subcount',
      message: 'Format subcount không hợp lệ. Sử dụng format [XX.N] hoặc XX.N',
      severity: 'error',
      code: 'INVALID_SUBCOUNT_FORMAT'
    });
  }

  return errors;
}

/**
 * Validate usage filter ranges
 */
function validateUsageFilters(filters: QuestionFilters): FilterValidationError[] {
  const errors: FilterValidationError[] = [];

  // Validate usageCount range
  if (filters.usageCount) {
    const { min, max } = filters.usageCount;
    if (min !== undefined && max !== undefined && min > max) {
      errors.push({
        field: 'usageCount',
        message: 'Giá trị min không được lớn hơn max',
        severity: 'error',
        code: 'INVALID_USAGE_COUNT_RANGE'
      });
    }
    
    if (min !== undefined && min < 0) {
      errors.push({
        field: 'usageCount',
        message: 'Usage count không được âm',
        severity: 'error',
        code: 'NEGATIVE_USAGE_COUNT'
      });
    }
  }

  // Validate feedback range
  if (filters.feedback) {
    const { min, max } = filters.feedback;
    if (min !== undefined && max !== undefined && min > max) {
      errors.push({
        field: 'feedback',
        message: 'Giá trị min không được lớn hơn max',
        severity: 'error',
        code: 'INVALID_FEEDBACK_RANGE'
      });
    }
    
    if (min !== undefined && (min < 0 || min > 5)) {
      errors.push({
        field: 'feedback',
        message: 'Feedback score phải từ 0 đến 5',
        severity: 'error',
        code: 'INVALID_FEEDBACK_VALUE'
      });
    }
    
    if (max !== undefined && (max < 0 || max > 5)) {
      errors.push({
        field: 'feedback',
        message: 'Feedback score phải từ 0 đến 5',
        severity: 'error',
        code: 'INVALID_FEEDBACK_VALUE'
      });
    }
  }

  // Validate date range
  if (filters.dateRange) {
    const { from, to } = filters.dateRange;
    if (from && to && from > to) {
      errors.push({
        field: 'dateRange',
        message: 'Ngày bắt đầu không được sau ngày kết thúc',
        severity: 'error',
        code: 'INVALID_DATE_RANGE'
      });
    }
  }

  return errors;
}

/**
 * Validate search filter combinations
 */
function validateSearchFilters(filters: QuestionFilters): FilterValidationError[] {
  const errors: FilterValidationError[] = [];

  // Check for too many search terms
  const searchTerms = [
    filters.keyword,
    filters.solutionKeyword,
    filters.latexKeyword,
    filters.globalSearch
  ].filter(Boolean);

  if (searchTerms.length > 2) {
    errors.push({
      field: 'keyword',
      message: 'Quá nhiều từ khóa tìm kiếm có thể làm chậm hiệu suất',
      severity: 'warning',
      code: 'TOO_MANY_SEARCH_TERMS'
    });
  }

  // Validate search term length
  searchTerms.forEach((term, index) => {
    const fields = ['keyword', 'solutionKeyword', 'latexKeyword', 'globalSearch'];
    if (term && term.length < 2) {
      errors.push({
        field: fields[index] as keyof QuestionFilters,
        message: 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự',
        severity: 'warning',
        code: 'SEARCH_TERM_TOO_SHORT'
      });
    }
  });

  return errors;
}

// ===== MAIN VALIDATION FUNCTION =====

/**
 * Validate toàn bộ filter combination
 */
export function validateQuestionFilters(filters: QuestionFilters): FilterValidationResult {
  const allErrors: FilterValidationError[] = [
    ...validateQuestionCodeFilters(filters),
    ...validateMetadataFilters(filters),
    ...validateContentFilters(filters),
    ...validateUsageFilters(filters),
    ...validateSearchFilters(filters)
  ];

  const errors = allErrors.filter(e => e.severity === 'error');
  const warnings = allErrors.filter(e => e.severity === 'warning').map(w => ({
    field: w.field,
    message: w.message,
    code: w.code
  }));

  // Generate suggestions based on errors
  const suggestions: FilterSuggestion[] = [];
  
  errors.forEach(error => {
    switch (error.code) {
      case 'FORM_REQUIRES_ID6_FORMAT':
        suggestions.push({
          field: 'format',
          message: 'Thêm format ID6 để sử dụng trường Dạng',
          action: 'add',
          suggestedValue: ['ID6']
        });
        break;
        
      case 'INVALID_USAGE_COUNT_RANGE':
      case 'INVALID_FEEDBACK_RANGE':
      case 'INVALID_DATE_RANGE':
        suggestions.push({
          field: error.field,
          message: 'Điều chỉnh giá trị range để hợp lệ',
          action: 'modify'
        });
        break;
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

/**
 * Detect filter conflicts
 */
export function detectFilterConflicts(filters: QuestionFilters): FilterConflict[] {
  const conflicts: FilterConflict[] = [];

  // Conflict: Form filter without ID6 format
  if (filters.form?.length && (!filters.format?.length || !filters.format.includes('ID6'))) {
    conflicts.push({
      conflictingFields: ['form', 'format'],
      description: 'Trường "Dạng" yêu cầu format ID6',
      resolution: 'modify_values',
      suggestions: [
        {
          field: 'format',
          message: 'Thêm ID6 vào format',
          action: 'add',
          suggestedValue: ['ID6']
        }
      ]
    });
  }

  // Conflict: Too restrictive boolean filters
  const restrictiveBooleans = [
    filters.hasAnswers === false,
    filters.hasSolution === false,
    filters.hasImages === false
  ].filter(Boolean).length;

  if (restrictiveBooleans >= 2) {
    conflicts.push({
      conflictingFields: ['hasAnswers', 'hasSolution', 'hasImages'],
      description: 'Quá nhiều điều kiện loại trừ có thể không trả về kết quả',
      resolution: 'user_choice',
      suggestions: [
        {
          field: 'hasAnswers',
          message: 'Xem xét bỏ bớt điều kiện loại trừ',
          action: 'remove'
        }
      ]
    });
  }

  return conflicts;
}

/**
 * Auto-resolve filter conflicts
 */
export function autoResolveFilterConflicts(
  filters: QuestionFilters,
  conflicts: FilterConflict[]
): QuestionFilters {
  const resolvedFilters = { ...filters };

  conflicts.forEach(conflict => {
    if (conflict.resolution === 'modify_values') {
      conflict.suggestions.forEach(suggestion => {
        if (suggestion.action === 'add' && suggestion.field === 'format') {
          resolvedFilters.format = [...(resolvedFilters.format || []), 'ID6'];
        }
      });
    }
  });

  return resolvedFilters;
}

/**
 * Get filter validation summary
 */
export function getFilterValidationSummary(result: FilterValidationResult): string {
  if (result.isValid && result.warnings.length === 0) {
    return 'Tất cả filters hợp lệ';
  }
  
  const parts = [];
  
  if (result.errors.length > 0) {
    parts.push(`${result.errors.length} lỗi`);
  }
  
  if (result.warnings.length > 0) {
    parts.push(`${result.warnings.length} cảnh báo`);
  }
  
  return parts.join(', ');
}
