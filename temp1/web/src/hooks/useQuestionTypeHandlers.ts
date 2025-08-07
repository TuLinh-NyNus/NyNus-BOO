import { useCallback, useMemo } from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';

import {
  getDefaultQuestionValues,
  type CreateQuestionFormValues,
  type QuestionType,
  type Difficulty
} from '@/lib/validation/question-schemas';

/**
 * Custom hook for managing question type-specific handlers and logic
 * 
 * Extracts type-specific logic from question-form.tsx
 * Provides handlers for different question types, dynamic field management,
 * and type-specific form behavior
 * 
 * @param questionType - Current question type
 * @param setValue - React Hook Form setValue function
 * @param watch - React Hook Form watch function
 * @returns Type-specific handlers and utilities
 */

export interface UseQuestionTypeHandlersProps {
  questionType: QuestionType;
  setValue: UseFormSetValue<CreateQuestionFormValues>;
  watch: UseFormWatch<CreateQuestionFormValues>;
}

export interface QuestionTypeConfig {
  label: string;
  description: string;
  icon: string;
  hasOptions: boolean;
  hascorrectAnswer: boolean;
  hascorrectanswers: boolean;
  hasAcceptableanswers: boolean;
  hasRubric: boolean;
  hasMaxWords: boolean;
  minOptions?: number;
  maxOptions?: number;
}

export interface UseQuestionTypeHandlersReturn {
  // Type configuration
  currentTypeConfig: QuestionTypeConfig;
  availableTypes: QuestionTypeConfig[];
  
  // Type-specific handlers
  handleTypeChange: (newType: QuestionType) => void;
  resetToTypeDefaults: (type: QuestionType) => void;
  
  // Field visibility logic
  shouldShowField: (fieldName: keyof CreateQuestionFormValues) => boolean;
  getFieldPlaceholder: (fieldName: keyof CreateQuestionFormValues) => string;
  getFieldLabel: (fieldName: keyof CreateQuestionFormValues) => string;
  
  // Type-specific validation
  getMinOptionsForType: (type: QuestionType) => number;
  getMaxOptionsForType: (type: QuestionType) => number;
  isValidForType: (data: Partial<CreateQuestionFormValues>, type: QuestionType) => boolean;
  
  // Dynamic field management
  getRequiredFieldsForType: (type: QuestionType) => (keyof CreateQuestionFormValues)[];
  getOptionalFieldsForType: (type: QuestionType) => (keyof CreateQuestionFormValues)[];
  
  // Type-specific utilities
  formatcorrectAnswerForType: (answer: any, type: QuestionType) => any;
  getDefaultDifficultyForType: (type: QuestionType) => Difficulty;
}

export function useQuestionTypeHandlers({
  questionType,
  setValue,
  watch
}: UseQuestionTypeHandlersProps): UseQuestionTypeHandlersReturn {

  // Question type configurations
  const questionTypeConfigs: Record<QuestionType, QuestionTypeConfig> = useMemo(() => ({
    MC: {
      label: 'Trắc nghiệm (Multiple Choice)',
      description: 'Câu hỏi với nhiều lựa chọn, chỉ có một đáp án đúng',
      icon: '📝',
      hasOptions: true,
      hascorrectAnswer: true,
      hascorrectanswers: false,
      hasAcceptableanswers: false,
      hasRubric: false,
      hasMaxWords: false,
      minOptions: 2,
      maxOptions: 6
    },
    TF: {
      label: 'Đúng/Sai (True/False)',
      description: 'Câu hỏi với hai lựa chọn: Đúng hoặc Sai',
      icon: '✓',
      hasOptions: false,
      hascorrectAnswer: true,
      hascorrectanswers: false,
      hasAcceptableanswers: false,
      hasRubric: false,
      hasMaxWords: false
    },
    SA: {
      label: 'Câu trả lời ngắn (Short Answer)',
      description: 'Câu hỏi yêu cầu trả lời bằng văn bản ngắn',
      icon: '✏️',
      hasOptions: false,
      hascorrectAnswer: true,
      hascorrectanswers: false,
      hasAcceptableanswers: true,
      hasRubric: false,
      hasMaxWords: false
    },
    ES: {
      label: 'Tự luận (Essay)',
      description: 'Câu hỏi yêu cầu trả lời bằng văn bản dài',
      icon: '📄',
      hasOptions: false,
      hascorrectAnswer: false,
      hascorrectanswers: false,
      hasAcceptableanswers: false,
      hasRubric: true,
      hasMaxWords: true
    },
    MA: {
      label: 'Nhiều đáp án (Multiple Answer)',
      description: 'Câu hỏi với nhiều lựa chọn, có thể có nhiều đáp án đúng',
      icon: '☑️',
      hasOptions: true,
      hascorrectAnswer: false,
      hascorrectanswers: true,
      hasAcceptableanswers: false,
      hasRubric: false,
      hasMaxWords: false,
      minOptions: 2,
      maxOptions: 8
    }
  }), []);

  const currentTypeConfig = questionTypeConfigs[questionType];
  const availableTypes = Object.values(questionTypeConfigs);

  // Handle question type change - Updated to PascalCase
  const handleTypeChange = useCallback((newType: QuestionType) => {
    setValue('Type', newType);
    resetToTypeDefaults(newType);
  }, [setValue]);

  // Reset form to type defaults - Updated to PascalCase
  const resetToTypeDefaults = useCallback((type: QuestionType) => {
    const defaults = getDefaultQuestionValues(type);

    // Clear fields that don't apply to new type
    Object.entries(defaults).forEach(([key, value]) => {
      if (key !== 'Type') {
        setValue(key as keyof CreateQuestionFormValues, value as any);
      }
    });
  }, [setValue]);

  // Field visibility logic
  const shouldShowField = useCallback((fieldName: keyof CreateQuestionFormValues): boolean => {
    const config = currentTypeConfig;
    
    switch (fieldName) {
      case 'options':
        return config.hasOptions;
      case 'correctAnswer':
        return config.hascorrectAnswer;
      case 'correctanswers':
        return config.hascorrectanswers;
      case 'acceptableanswers':
        return config.hasAcceptableanswers;
      case 'rubric':
        return config.hasRubric;
      case 'maxWords':
        return config.hasMaxWords;
      default:
        return true; // Show common fields by default
    }
  }, [currentTypeConfig]);

  // Get field placeholder text
  const getFieldPlaceholder = useCallback((fieldName: keyof CreateQuestionFormValues): string => {
    const placeholders: Partial<Record<keyof CreateQuestionFormValues, string>> = {
      content: 'Nhập nội dung câu hỏi...',
      solution: 'Nhập lời giải (tùy chọn)...',
      source: 'Nhập nguồn câu hỏi (tùy chọn)...',
      Rubric: 'Nhập tiêu chí chấm điểm...',
      maxWords: '500'
    };

    // Type-specific placeholders
    switch (questionType) {
      case 'MC':
        if (fieldName === 'correctAnswer') return 'Chọn đáp án đúng';
        break;
      case 'TF':
        if (fieldName === 'correctAnswer') return 'Chọn Đúng hoặc Sai';
        break;
      case 'SA':
        if (fieldName === 'correctAnswer') return 'Nhập đáp án đúng';
        if (fieldName === 'acceptableanswers') return 'Nhập các đáp án chấp nhận được (tùy chọn)';
        break;
      case 'MA':
        if (fieldName === 'correctanswers') return 'Chọn các đáp án đúng';
        break;
    }

    return placeholders[fieldName] || '';
  }, [questionType]);

  // Get field label text
  const getFieldLabel = useCallback((fieldName: keyof CreateQuestionFormValues): string => {
    const labels: Partial<Record<keyof CreateQuestionFormValues, string>> = {
      content: 'Nội dung câu hỏi',
      type: 'Loại câu hỏi',
      difficulty: 'Độ khó',
      points: 'Điểm số',
      timeLimit: 'Thời gian (giây)',
      solution: 'Lời giải',
      source: 'Nguồn',
      tags: 'Tags',
      Options: 'Các lựa chọn',
      correctAnswer: 'Đáp án đúng',
      correctanswers: 'Các đáp án đúng',
      acceptableanswers: 'Đáp án chấp nhận được',
      Rubric: 'Tiêu chí chấm điểm',
      maxWords: 'Số từ tối đa'
    };

    return labels[fieldName] || fieldName;
  }, []);

  // Type-specific validation helpers
  const getMinOptionsForType = useCallback((type: QuestionType): number => {
    return questionTypeConfigs[type].minOptions || 0;
  }, [questionTypeConfigs]);

  const getMaxOptionsForType = useCallback((type: QuestionType): number => {
    return questionTypeConfigs[type].maxOptions || 10;
  }, [questionTypeConfigs]);

  const isValidForType = useCallback((
    data: Partial<CreateQuestionFormValues>, 
    type: QuestionType
  ): boolean => {
    const config = questionTypeConfigs[type];
    
    // Check required fields for type - Updated to PascalCase
    if (config.hasOptions && (!data.Options || data.Options.length < (config.minOptions || 2))) {
      return false;
    }

    if (config.hascorrectAnswer && data.correctAnswer === undefined) {
      return false;
    }

    if (config.hascorrectanswers && (!data.correctanswers || data.correctanswers.length === 0)) {
      return false;
    }
    
    return true;
  }, [questionTypeConfigs]);

  // Get required fields for type
  const getRequiredFieldsForType = useCallback((type: QuestionType): (keyof CreateQuestionFormValues)[] => {
    const baseRequired: (keyof CreateQuestionFormValues)[] = ['content', 'type'];
    const config = questionTypeConfigs[type];
    
    if (config.hasOptions) baseRequired.push('options');
    if (config.hascorrectAnswer) baseRequired.push('correctAnswer');
    if (config.hascorrectanswers) baseRequired.push('correctanswers');
    
    return baseRequired;
  }, [questionTypeConfigs]);

  // Get optional fields for type
  const getOptionalFieldsForType = useCallback((type: QuestionType): (keyof CreateQuestionFormValues)[] => {
    const allFields: (keyof CreateQuestionFormValues)[] = [
      'difficulty', 'points', 'timeLimit', 'solution', 'source', 'tags',
      'acceptableanswers', 'rubric', 'maxWords'
    ];
    
    const config = questionTypeConfigs[type];
    return allFields.filter(field => {
      switch (field) {
        case 'acceptableanswers':
          return config.hasAcceptableanswers;
        case 'rubric':
          return config.hasRubric;
        case 'maxWords':
          return config.hasMaxWords;
        default:
          return true;
      }
    });
  }, [questionTypeConfigs]);

  // Format correct answer for type
  const formatcorrectAnswerForType = useCallback((answer: any, type: QuestionType): any => {
    switch (type) {
      case 'MC':
        return typeof answer === 'number' ? answer : 0;
      case 'TF':
        return typeof answer === 'boolean' ? answer : true;
      case 'SA':
        return typeof answer === 'string' ? answer : '';
      case 'ES':
        return undefined; // Essay questions don't have correct answers
      case 'MA':
        return Array.isArray(answer) ? answer : [];
      default:
        return answer;
    }
  }, []);

  // Get default difficulty for type
  const getDefaultDifficultyForType = useCallback((type: QuestionType): Difficulty => {
    switch (type) {
      case 'TF':
        return 'EASY';
      case 'MC':
      case 'SA':
        return 'MEDIUM';
      case 'ES':
      case 'MA':
        return 'HARD';
      default:
        return 'MEDIUM';
    }
  }, []);

  return {
    // Type configuration
    currentTypeConfig,
    availableTypes,
    
    // Type-specific handlers
    handleTypeChange,
    resetToTypeDefaults,
    
    // Field visibility logic
    shouldShowField,
    getFieldPlaceholder,
    getFieldLabel,
    
    // Type-specific validation
    getMinOptionsForType,
    getMaxOptionsForType,
    isValidForType,
    
    // Dynamic field management
    getRequiredFieldsForType,
    getOptionalFieldsForType,
    
    // Type-specific utilities
    formatcorrectAnswerForType,
    getDefaultDifficultyForType,
  };
}
