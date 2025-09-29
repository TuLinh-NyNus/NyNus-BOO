/**
 * Multiple Choice Answer Input Component
 * Enhanced checkbox/radio interface for multiple choice questions
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/form/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle } from 'lucide-react';
import { LaTeXContent } from '@/components/latex';
import { BaseAnswerInput, BaseAnswerInputProps } from './base-answer-input';
import { AnswerOption } from '@/types/question';

// ===== TYPES =====

export interface MultipleChoiceInputProps extends Omit<BaseAnswerInputProps, 'value' | 'onChange'> {
  /** Answer options */
  options: AnswerOption[];
  
  /** Selected option IDs */
  selectedOptions?: string[];
  
  /** Allow multiple selections */
  allowMultiple?: boolean;
  
  /** Show option labels (A, B, C, D) */
  showLabels?: boolean;
  
  /** Selection change handler */
  onSelectionChange?: (selectedOptions: string[]) => void;
  
  /** Minimum required selections */
  minSelections?: number;
  
  /** Maximum allowed selections */
  maxSelections?: number;
}

// ===== CONSTANTS =====

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

// ===== UTILITY FUNCTIONS =====

/**
 * Validate multiple choice selection
 */
function validateSelection(
  selectedOptions: string[],
  minSelections?: number,
  maxSelections?: number,
  allowMultiple: boolean = true
): string | null {
  const count = selectedOptions.length;
  
  if (count === 0) {
    return 'Vui lòng chọn ít nhất một đáp án';
  }
  
  if (minSelections && count < minSelections) {
    return `Vui lòng chọn ít nhất ${minSelections} đáp án`;
  }
  
  if (maxSelections && count > maxSelections) {
    return `Chỉ được chọn tối đa ${maxSelections} đáp án`;
  }
  
  if (!allowMultiple && count > 1) {
    return 'Chỉ được chọn một đáp án';
  }
  
  return null;
}

/**
 * Get option styles based on selection state
 */
function getOptionStyles(isSelected: boolean, readOnly: boolean): string {
  return cn(
    'flex items-start gap-3 p-3 rounded-lg border-2 transition-all duration-200',
    'cursor-pointer hover:bg-gray-50',
    {
      'border-gray-200 bg-white': !isSelected,
      'border-blue-300 bg-blue-50': isSelected,
      'cursor-not-allowed opacity-60': readOnly,
      'hover:border-gray-300': !isSelected && !readOnly,
      'hover:border-blue-400': isSelected && !readOnly,
    }
  );
}

// ===== MAIN COMPONENT =====

/**
 * Multiple Choice Answer Input Component
 * Enhanced interface for multiple choice questions with visual feedback
 */
export function MultipleChoiceInput({
  questionId,
  options = [],
  selectedOptions = [],
  allowMultiple = true,
  showLabels = true,
  onSelectionChange,
  minSelections,
  maxSelections,
  readOnly = false,
  showValidation = true,
  autoSaveStatus = 'idle',
  className,
}: MultipleChoiceInputProps) {
  
  // Validation
  const validationError = useMemo(() => {
    if (!showValidation || readOnly) return null;
    return validateSelection(selectedOptions, minSelections, maxSelections, allowMultiple);
  }, [selectedOptions, minSelections, maxSelections, allowMultiple, showValidation, readOnly]);
  
  // Selection handler
  const handleOptionSelect = useCallback((optionId: string, selected: boolean) => {
    if (readOnly) return;
    
    let newSelection: string[];
    
    if (allowMultiple) {
      if (selected) {
        // Add to selection
        newSelection = [...selectedOptions, optionId];
      } else {
        // Remove from selection
        newSelection = selectedOptions.filter(id => id !== optionId);
      }
    } else {
      // Single selection mode
      newSelection = selected ? [optionId] : [];
    }
    
    // Check max selections limit
    if (maxSelections && newSelection.length > maxSelections) {
      return; // Don't allow selection beyond limit
    }
    
    onSelectionChange?.(newSelection);
  }, [selectedOptions, allowMultiple, maxSelections, readOnly, onSelectionChange]);
  
  // Render option
  const renderOption = useCallback((option: AnswerOption, index: number) => {
    const isSelected = selectedOptions.includes(option.id);
    const optionLabel = showLabels ? OPTION_LABELS[index] || `${index + 1}` : `${index + 1}`;
    
    return (
      <div
        key={option.id}
        className={getOptionStyles(isSelected, readOnly)}
        onClick={() => handleOptionSelect(option.id, !isSelected)}
      >
        {/* Selection Indicator */}
        <div className="flex-shrink-0 mt-1">
          {allowMultiple ? (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked: boolean) => handleOptionSelect(option.id, checked)}
              disabled={readOnly}
              className="pointer-events-none"
            />
          ) : (
            isSelected ? (
              <CheckCircle className="h-5 w-5 text-blue-600" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400" />
            )
          )}
        </div>
        
        {/* Option Label */}
        {showLabels && (
          <div className="flex-shrink-0 mt-1">
            <Badge 
              variant="outline" 
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center font-bold',
                isSelected 
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-gray-100 border-gray-300'
              )}
            >
              {optionLabel}
            </Badge>
          </div>
        )}
        
        {/* Option Content */}
        <div className="flex-1 min-w-0">
          <Label className="cursor-pointer">
            <LaTeXContent 
              content={option.content} 
              className="text-sm leading-relaxed"
            />
          </Label>
        </div>
      </div>
    );
  }, [selectedOptions, showLabels, allowMultiple, readOnly, handleOptionSelect]);
  
  return (
    <BaseAnswerInput
      questionId={questionId}
      value={selectedOptions}
      error={validationError}
      readOnly={readOnly}
      showValidation={showValidation}
      autoSaveStatus={autoSaveStatus}
      className={className}
    >
      {/* Instructions */}
      <div className="mb-4">
        <Label className="text-sm font-medium text-gray-700">
          {allowMultiple 
            ? 'Chọn đáp án (có thể chọn nhiều):' 
            : 'Chọn một đáp án:'
          }
        </Label>
        
        {/* Selection limits info */}
        {(minSelections || maxSelections) && (
          <div className="text-xs text-gray-500 mt-1">
            {minSelections && maxSelections ? (
              `Chọn từ ${minSelections} đến ${maxSelections} đáp án`
            ) : minSelections ? (
              `Chọn ít nhất ${minSelections} đáp án`
            ) : maxSelections ? (
              `Chọn tối đa ${maxSelections} đáp án`
            ) : null}
          </div>
        )}
      </div>
      
      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => renderOption(option, index))}
      </div>
      
      {/* Selection Summary */}
      {selectedOptions.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-700">
            <span className="font-medium">Đã chọn:</span> {selectedOptions.length} đáp án
            {allowMultiple && maxSelections && (
              <span className="text-blue-600 ml-2">
                (tối đa {maxSelections})
              </span>
            )}
          </div>
        </div>
      )}
    </BaseAnswerInput>
  );
}

// ===== EXPORT =====

export default MultipleChoiceInput;
