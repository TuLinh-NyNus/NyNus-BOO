/**
 * True/False Answer Input Component
 * Clear True/False selection with visual indicators
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Check, X } from 'lucide-react';
import { LaTeXContent } from '@/components/common/latex';
import { BaseAnswerInput, BaseAnswerInputProps } from './base-answer-input';
import { AnswerOption } from '@/types/question';

// ===== TYPES =====

export interface TrueFalseInputProps extends Omit<BaseAnswerInputProps, 'value' | 'onChange'> {
  /** Answer options (should contain True/False options) */
  options?: AnswerOption[];
  
  /** Selected option ID */
  selectedOption?: string;
  
  /** Selection change handler */
  onSelectionChange?: (selectedOption: string | null) => void;
  
  /** Custom True/False labels */
  trueLabel?: string;
  falseLabel?: string;
  
  /** Show option explanations */
  showExplanations?: boolean;
}

// ===== CONSTANTS =====

const DEFAULT_TRUE_LABEL = 'Đúng';
const DEFAULT_FALSE_LABEL = 'Sai';

// ===== UTILITY FUNCTIONS =====

/**
 * Validate True/False selection
 */
function validateSelection(selectedOption: string | null): string | null {
  if (!selectedOption) {
    return 'Vui lòng chọn Đúng hoặc Sai';
  }
  return null;
}

/**
 * Get option styles based on selection state
 */
function getOptionStyles(
  isSelected: boolean, 
  isTrue: boolean, 
  readOnly: boolean
): string {
  return cn(
    'flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200',
    'cursor-pointer hover:bg-gray-50',
    {
      // Default state
      'border-gray-200 bg-white': !isSelected,
      
      // Selected states
      'border-green-300 bg-green-50': isSelected && isTrue,
      'border-red-300 bg-red-50': isSelected && !isTrue,
      
      // Read-only state
      'cursor-not-allowed opacity-60': readOnly,
      
      // Hover states
      'hover:border-gray-300': !isSelected && !readOnly,
      'hover:border-green-400': isSelected && isTrue && !readOnly,
      'hover:border-red-400': isSelected && !isTrue && !readOnly,
    }
  );
}

/**
 * Determine if option represents "True"
 */
function isOptionTrue(option: AnswerOption): boolean {
  const content = option.content.toLowerCase().trim();
  return content === 'đúng' || content === 'true' || content === '1' || option.isCorrect === true;
}

// ===== MAIN COMPONENT =====

/**
 * True/False Answer Input Component
 * Enhanced interface for True/False questions with clear visual indicators
 */
export function TrueFalseInput({
  questionId,
  options = [],
  selectedOption,
  onSelectionChange,
  trueLabel = DEFAULT_TRUE_LABEL,
  falseLabel = DEFAULT_FALSE_LABEL,
  showExplanations = false,
  readOnly = false,
  showValidation = true,
  autoSaveStatus = 'idle',
  className,
}: TrueFalseInputProps) {
  
  // Validation
  const validationError = useMemo(() => {
    if (!showValidation || readOnly) return null;
    return validateSelection(selectedOption || null);
  }, [selectedOption, showValidation, readOnly]);
  
  // Selection handler
  const handleOptionSelect = useCallback((optionId: string) => {
    if (readOnly) return;
    
    // Toggle selection - if same option clicked, deselect
    const newSelection = selectedOption === optionId ? null : optionId;
    onSelectionChange?.(newSelection);
  }, [selectedOption, readOnly, onSelectionChange]);
  
  // Prepare True/False options
  const trueFalseOptions = useMemo(() => {
    if (options.length >= 2) {
      // Use provided options
      return options.map(option => ({
        ...option,
        isTrue: isOptionTrue(option),
      }));
    } else {
      // Create default True/False options
      return [
        {
          id: 'true',
          content: trueLabel,
          isTrue: true,
        },
        {
          id: 'false',
          content: falseLabel,
          isTrue: false,
        },
      ];
    }
  }, [options, trueLabel, falseLabel]);
  
  // Render option
  const renderOption = useCallback((option: AnswerOption, index: number) => {
    const isSelected = selectedOption === option.id;
    const isTrue = (option as { isTrue?: boolean }).isTrue;
    
    return (
      <div
        key={option.id}
        className={getOptionStyles(isSelected, isTrue || false, readOnly)}
        onClick={() => handleOptionSelect(option.id)}
      >
        {/* Selection Indicator */}
        <div className="flex-shrink-0">
          {isSelected ? (
            <CheckCircle className={cn(
              'h-6 w-6',
              isTrue ? 'text-green-600' : 'text-red-600'
            )} />
          ) : (
            <Circle className="h-6 w-6 text-gray-400" />
          )}
        </div>
        
        {/* Option Icon */}
        <div className="flex-shrink-0">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            isTrue 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700',
            isSelected && (isTrue 
              ? 'bg-green-200 text-green-800' 
              : 'bg-red-200 text-red-800')
          )}>
            {isTrue ? (
              <Check className="h-5 w-5" />
            ) : (
              <X className="h-5 w-5" />
            )}
          </div>
        </div>
        
        {/* Option Label */}
        <div className="flex-shrink-0">
          <Badge 
            variant="outline" 
            className={cn(
              'px-3 py-1 font-bold',
              isSelected 
                ? (isTrue 
                    ? 'bg-green-100 border-green-300 text-green-700'
                    : 'bg-red-100 border-red-300 text-red-700')
                : 'bg-gray-100 border-gray-300'
            )}
          >
            {index === 0 ? 'A' : 'B'}
          </Badge>
        </div>
        
        {/* Option Content */}
        <div className="flex-1 min-w-0">
          <Label className="cursor-pointer">
            <div className="text-base font-medium">
              <LaTeXContent 
                content={option.content} 
                className="leading-relaxed"
              />
            </div>
            
            {/* Option Explanation */}
            {showExplanations && option.explanation && (
              <div className="mt-2 text-sm text-gray-600">
                <LaTeXContent content={option.explanation} />
              </div>
            )}
          </Label>
        </div>
      </div>
    );
  }, [selectedOption, readOnly, handleOptionSelect, showExplanations]);
  
  return (
    <BaseAnswerInput
      questionId={questionId}
      value={selectedOption}
      error={validationError}
      readOnly={readOnly}
      showValidation={showValidation}
      autoSaveStatus={autoSaveStatus}
      className={className}
    >
      {/* Instructions */}
      <div className="mb-4">
        <Label className="text-sm font-medium text-gray-700">
          Chọn Đúng hoặc Sai:
        </Label>
      </div>
      
      {/* True/False Options */}
      <div className="space-y-3">
        {trueFalseOptions.map((option, index) => renderOption(option, index))}
      </div>
      
      {/* Selection Summary */}
      {selectedOption && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-700">
            <span className="font-medium">Đã chọn:</span> {
              trueFalseOptions.find(opt => opt.id === selectedOption)?.content || selectedOption
            }
          </div>
        </div>
      )}
    </BaseAnswerInput>
  );
}

// ===== EXPORT =====

export default TrueFalseInput;
