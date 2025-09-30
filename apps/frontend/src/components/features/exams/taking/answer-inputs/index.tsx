/**
 * Answer Input Factory
 * Factory component to render appropriate input based on question type
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

'use client';

import React from 'react';
import { QuestionType } from '@/types/question';
import type { Question, AnswerOption } from '@/types/question';

// Import specialized input components
import { MultipleChoiceInput } from './multiple-choice-input';
import { TrueFalseInput } from './true-false-input';
import { ShortAnswerInput } from './short-answer-input';
import { EssayInput } from './essay-input';
import { BaseAnswerInput } from './base-answer-input';

// ===== TYPES =====

export interface ExamAnswerInput {
  questionId: string;
  answerText?: string;
  selectedOptions?: string[];
  isFlagged?: boolean;
  timeSpent?: number;
  isAnswered?: boolean;
}

export interface AnswerInputFactoryProps {
  /** Question data */
  question: Question;
  
  /** Current answer for this question */
  currentAnswer?: ExamAnswerInput;
  
  /** Answer change handler */
  onAnswerChange?: (answer: ExamAnswerInput) => void;
  
  /** Read-only mode (for review) */
  readOnly?: boolean;
  
  /** Show validation errors */
  showValidation?: boolean;
  
  /** Auto-save status */
  autoSaveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  
  /** Additional CSS classes */
  className?: string;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Create empty answer for a question
 */
function createEmptyAnswer(questionId: string): ExamAnswerInput {
  return {
    questionId,
    answerText: '',
    selectedOptions: [],
    isFlagged: false,
    timeSpent: 0,
    isAnswered: false,
  };
}

/**
 * Convert question answers to AnswerOption format
 */
function getAnswerOptions(question: Question): AnswerOption[] {
  if (!question.answers) return [];
  
  return question.answers.filter((answer): answer is AnswerOption => 
    typeof answer === 'object' && 
    'id' in answer && 
    'content' in answer
  );
}

// ===== MAIN COMPONENT =====

/**
 * Answer Input Factory Component
 * Renders the appropriate answer input component based on question type
 */
export function AnswerInputFactory({
  question,
  currentAnswer,
  onAnswerChange,
  readOnly = false,
  showValidation = true,
  autoSaveStatus = 'idle',
  className,
}: AnswerInputFactoryProps) {
  
  // Current answer with fallback
  const answer = currentAnswer || createEmptyAnswer(question.id);
  
  // Answer options
  const answerOptions = getAnswerOptions(question);
  
  // Common props for all input components
  const commonProps = {
    questionId: question.id,
    readOnly,
    showValidation,
    autoSaveStatus,
    className,
  };
  
  // Handle answer changes for different question types
  const handleMultipleChoiceChange = (selectedOptions: string[]) => {
    const updatedAnswer: ExamAnswerInput = {
      ...answer,
      selectedOptions,
      isAnswered: selectedOptions.length > 0,
    };
    onAnswerChange?.(updatedAnswer);
  };
  
  const handleTrueFalseChange = (selectedOption: string | null) => {
    const updatedAnswer: ExamAnswerInput = {
      ...answer,
      selectedOptions: selectedOption ? [selectedOption] : [],
      isAnswered: Boolean(selectedOption),
    };
    onAnswerChange?.(updatedAnswer);
  };
  
  const handleTextChange = (text: string) => {
    const updatedAnswer: ExamAnswerInput = {
      ...answer,
      answerText: text,
      isAnswered: text.trim().length > 0,
    };
    onAnswerChange?.(updatedAnswer);
  };
  
  // Render appropriate input based on question type
  switch (question.type) {
    case QuestionType.MC:
      return (
        <MultipleChoiceInput
          {...commonProps}
          options={answerOptions}
          selectedOptions={answer.selectedOptions || []}
          onSelectionChange={handleMultipleChoiceChange}
          allowMultiple={true}
          showLabels={true}
          minSelections={1}
          maxSelections={answerOptions.length}
        />
      );
      
    case QuestionType.TF:
      return (
        <TrueFalseInput
          {...commonProps}
          options={answerOptions}
          selectedOption={answer.selectedOptions?.[0]}
          onSelectionChange={handleTrueFalseChange}
          trueLabel="Đúng"
          falseLabel="Sai"
          showExplanations={false}
        />
      );
      
    case QuestionType.SA:
      return (
        <ShortAnswerInput
          {...commonProps}
          answerText={answer.answerText || ''}
          onTextChange={handleTextChange}
          maxLength={500}
          placeholder="Nhập câu trả lời của bạn..."
          showCharacterCount={true}
          inputType="text"
          caseSensitive={false}
        />
      );
      
    case QuestionType.ES:
      return (
        <EssayInput
          {...commonProps}
          essayText={answer.answerText || ''}
          onTextChange={handleTextChange}
          maxCharacters={5000}
          placeholder="Nhập bài làm của bạn..."
          showCharacterCount={true}
          showWordCount={true}
          minRows={8}
          allowFullscreen={true}
          autoResize={true}
        />
      );
      
    default:
      return (
        <BaseAnswerInput
          {...commonProps}
          value={answer as unknown as string | string[] | boolean | null}
          error="Loại câu hỏi không được hỗ trợ"
        >
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-600">
              <span className="text-sm">
                Loại câu hỏi &quot;{question.type}&quot; chưa được hỗ trợ
              </span>
            </div>
          </div>
        </BaseAnswerInput>
      );
  }
}

// ===== EXPORTS =====

export default AnswerInputFactory;

// Re-export all input components for direct use
export { MultipleChoiceInput } from './multiple-choice-input';
export { TrueFalseInput } from './true-false-input';
export { ShortAnswerInput } from './short-answer-input';
export { EssayInput } from './essay-input';
export { BaseAnswerInput } from './base-answer-input';

// Re-export types
export type { 
  BaseAnswerInputProps,
  AnswerInputState 
} from './base-answer-input';

export type { MultipleChoiceInputProps } from './multiple-choice-input';
export type { TrueFalseInputProps } from './true-false-input';
export type { ShortAnswerInputProps } from './short-answer-input';
export type { EssayInputProps } from './essay-input';
