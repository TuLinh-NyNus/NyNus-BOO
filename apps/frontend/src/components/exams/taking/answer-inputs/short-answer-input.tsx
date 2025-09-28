/**
 * Short Answer Input Component
 * Enhanced text input with character counting and validation
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { BaseAnswerInput, BaseAnswerInputProps, formatCountDisplay } from './base-answer-input';

// ===== TYPES =====

export interface ShortAnswerInputProps extends Omit<BaseAnswerInputProps, 'value' | 'onChange'> {
  /** Current answer text */
  answerText?: string;
  
  /** Text change handler */
  onTextChange?: (text: string) => void;
  
  /** Maximum character limit */
  maxLength?: number;
  
  /** Minimum character limit */
  minLength?: number;
  
  /** Case sensitive validation */
  caseSensitive?: boolean;
  
  /** Input placeholder */
  placeholder?: string;
  
  /** Show character count */
  showCharacterCount?: boolean;
  
  /** Input type (text, number, email, etc.) */
  inputType?: 'text' | 'number' | 'email' | 'url';
  
  /** Pattern validation (regex) */
  pattern?: string;
  
  /** Pattern description for user */
  patternDescription?: string;
}

// ===== CONSTANTS =====

const DEFAULT_MAX_LENGTH = 500;
const DEFAULT_PLACEHOLDER = 'Nhập câu trả lời của bạn...';

// ===== UTILITY FUNCTIONS =====

/**
 * Validate short answer input
 */
function validateShortAnswer(
  text: string,
  minLength?: number,
  maxLength?: number,
  pattern?: string,
  patternDescription?: string
): string | null {
  const trimmedText = text.trim();
  
  if (trimmedText.length === 0) {
    return 'Vui lòng nhập câu trả lời';
  }
  
  if (minLength && trimmedText.length < minLength) {
    return `Câu trả lời phải có ít nhất ${minLength} ký tự`;
  }
  
  if (maxLength && trimmedText.length > maxLength) {
    return `Câu trả lời không được quá ${maxLength} ký tự`;
  }
  
  if (pattern) {
    try {
      const regex = new RegExp(pattern);
      if (!regex.test(trimmedText)) {
        return patternDescription || 'Định dạng câu trả lời không hợp lệ';
      }
    } catch (error) {
      console.warn('Invalid regex pattern:', pattern);
    }
  }
  
  return null;
}

/**
 * Get input styles based on validation state
 */
function getInputStyles(
  hasError: boolean,
  isValid: boolean,
  readOnly: boolean
): string {
  return cn(
    'transition-all duration-200',
    {
      'border-red-300 focus:border-red-500 focus:ring-red-200': hasError,
      'border-green-300 focus:border-green-500 focus:ring-green-200': isValid && !hasError,
      'border-gray-300': !hasError && !isValid,
      'bg-gray-50 cursor-not-allowed': readOnly,
    }
  );
}

/**
 * Get character count color based on usage
 */
function getCharacterCountColor(current: number, max: number): string {
  const percentage = (current / max) * 100;
  
  if (percentage >= 95) return 'text-red-600';
  if (percentage >= 80) return 'text-orange-600';
  if (percentage >= 60) return 'text-yellow-600';
  return 'text-gray-500';
}

// ===== MAIN COMPONENT =====

/**
 * Short Answer Input Component
 * Enhanced text input with validation and character counting
 */
export function ShortAnswerInput({
  questionId,
  answerText = '',
  onTextChange,
  maxLength = DEFAULT_MAX_LENGTH,
  minLength,
  caseSensitive = false,
  placeholder = DEFAULT_PLACEHOLDER,
  showCharacterCount = true,
  inputType = 'text',
  pattern,
  patternDescription,
  readOnly = false,
  showValidation = true,
  autoSaveStatus = 'idle',
  className,
}: ShortAnswerInputProps) {
  
  // Local state for immediate feedback
  const [localText, setLocalText] = useState(answerText);
  const [isFocused, setIsFocused] = useState(false);
  
  // Sync with external value
  useEffect(() => {
    setLocalText(answerText);
  }, [answerText]);
  
  // Validation
  const validationError = useMemo(() => {
    if (!showValidation || readOnly) return null;
    return validateShortAnswer(localText, minLength, maxLength, pattern, patternDescription);
  }, [localText, minLength, maxLength, pattern, patternDescription, showValidation, readOnly]);
  
  // Character count
  const characterCount = localText.length;
  const isValid = localText.trim().length > 0 && !validationError;
  
  // Text change handler
  const handleTextChange = useCallback((value: string) => {
    // Apply case sensitivity
    const processedValue = caseSensitive ? value : value;
    
    setLocalText(processedValue);
    onTextChange?.(processedValue);
  }, [caseSensitive, onTextChange]);
  
  // Input handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleTextChange(e.target.value);
  }, [handleTextChange]);
  
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);
  
  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);
  
  return (
    <BaseAnswerInput
      questionId={questionId}
      value={localText}
      error={validationError}
      readOnly={readOnly}
      showValidation={showValidation}
      autoSaveStatus={autoSaveStatus}
      className={className}
    >
      {/* Instructions */}
      <div className="mb-4">
        <Label htmlFor={`short-answer-${questionId}`} className="text-sm font-medium text-gray-700">
          Câu trả lời ngắn:
        </Label>
        
        {/* Input guidelines */}
        <div className="mt-1 space-y-1">
          {maxLength && (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>Tối đa {maxLength} ký tự</span>
            </div>
          )}
          
          {!caseSensitive && (
            <div className="text-xs text-gray-500">
              Không phân biệt chữ hoa/thường
            </div>
          )}
          
          {patternDescription && (
            <div className="text-xs text-blue-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              <span>{patternDescription}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Input Field */}
      <div className="relative">
        <Input
          id={`short-answer-${questionId}`}
          type={inputType}
          value={localText}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={readOnly}
          className={cn(
            'pr-20', // Space for character count
            getInputStyles(Boolean(validationError), isValid, readOnly)
          )}
        />
        
        {/* Character Count */}
        {showCharacterCount && maxLength && (
          <div className={cn(
            'absolute right-3 top-1/2 transform -translate-y-1/2',
            'text-xs font-medium',
            getCharacterCountColor(characterCount, maxLength)
          )}>
            {formatCountDisplay(characterCount, maxLength)}
          </div>
        )}
        
        {/* Validation Icon */}
        {!showCharacterCount && (isValid || validationError) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValid ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
          </div>
        )}
      </div>
      
      {/* Character Count (below input when focused) */}
      {showCharacterCount && isFocused && (
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500">
            {minLength && `Tối thiểu ${minLength} ký tự`}
          </span>
          <span className={getCharacterCountColor(characterCount, maxLength)}>
            {formatCountDisplay(characterCount, maxLength)}
          </span>
        </div>
      )}
      
      {/* Input Type Badge */}
      {inputType !== 'text' && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {inputType === 'number' && 'Chỉ số'}
            {inputType === 'email' && 'Email'}
            {inputType === 'url' && 'URL'}
          </Badge>
        </div>
      )}
    </BaseAnswerInput>
  );
}

// ===== EXPORT =====

export default ShortAnswerInput;
