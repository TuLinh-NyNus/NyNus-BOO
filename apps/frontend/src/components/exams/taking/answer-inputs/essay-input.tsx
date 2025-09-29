/**
 * Essay Answer Input Component
 * Rich text area with word counting, auto-save, and formatting
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import { Button } from '@/components/ui/button';
import {
  FileText,
  CheckCircle,
  Type,
  AlignLeft,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { BaseAnswerInput, BaseAnswerInputProps, formatCountDisplay } from './base-answer-input';

// ===== TYPES =====

export interface EssayInputProps extends Omit<BaseAnswerInputProps, 'value' | 'onChange'> {
  /** Current essay text */
  essayText?: string;
  
  /** Text change handler */
  onTextChange?: (text: string) => void;
  
  /** Maximum character limit */
  maxCharacters?: number;
  
  /** Maximum word limit */
  maxWords?: number;
  
  /** Minimum character limit */
  minCharacters?: number;
  
  /** Minimum word limit */
  minWords?: number;
  
  /** Input placeholder */
  placeholder?: string;
  
  /** Show character count */
  showCharacterCount?: boolean;
  
  /** Show word count */
  showWordCount?: boolean;
  
  /** Minimum textarea rows */
  minRows?: number;
  
  /** Allow fullscreen mode */
  allowFullscreen?: boolean;
  
  /** Auto-resize textarea */
  autoResize?: boolean;
}

// ===== CONSTANTS =====

const DEFAULT_MAX_CHARACTERS = 5000;
const DEFAULT_MIN_ROWS = 8;
const DEFAULT_PLACEHOLDER = 'Nhập bài làm của bạn...';

// ===== UTILITY FUNCTIONS =====

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Validate essay input
 */
function validateEssay(
  text: string,
  minCharacters?: number,
  maxCharacters?: number,
  minWords?: number,
  maxWords?: number
): string | null {
  const trimmedText = text.trim();
  const characterCount = trimmedText.length;
  const wordCount = countWords(trimmedText);
  
  if (characterCount === 0) {
    return 'Vui lòng nhập bài làm';
  }
  
  if (minCharacters && characterCount < minCharacters) {
    return `Bài làm phải có ít nhất ${minCharacters} ký tự`;
  }
  
  if (maxCharacters && characterCount > maxCharacters) {
    return `Bài làm không được quá ${maxCharacters} ký tự`;
  }
  
  if (minWords && wordCount < minWords) {
    return `Bài làm phải có ít nhất ${minWords} từ`;
  }
  
  if (maxWords && wordCount > maxWords) {
    return `Bài làm không được quá ${maxWords} từ`;
  }
  
  return null;
}

/**
 * Get count color based on usage percentage
 */
function getCountColor(current: number, max: number): string {
  const percentage = (current / max) * 100;
  
  if (percentage >= 95) return 'text-red-600';
  if (percentage >= 80) return 'text-orange-600';
  if (percentage >= 60) return 'text-yellow-600';
  return 'text-gray-500';
}

/**
 * Get textarea styles based on validation state
 */
function getTextareaStyles(
  hasError: boolean,
  isValid: boolean,
  readOnly: boolean,
  isFullscreen: boolean
): string {
  return cn(
    'transition-all duration-200 resize-y',
    {
      'border-red-300 focus:border-red-500 focus:ring-red-200': hasError,
      'border-green-300 focus:border-green-500 focus:ring-green-200': isValid && !hasError,
      'border-gray-300': !hasError && !isValid,
      'bg-gray-50 cursor-not-allowed': readOnly,
      'fixed inset-4 z-50 h-auto resize-none': isFullscreen,
    }
  );
}

// ===== MAIN COMPONENT =====

/**
 * Essay Answer Input Component
 * Rich text area with comprehensive features for essay writing
 */
export function EssayInput({
  questionId,
  essayText = '',
  onTextChange,
  maxCharacters = DEFAULT_MAX_CHARACTERS,
  maxWords,
  minCharacters,
  minWords,
  placeholder = DEFAULT_PLACEHOLDER,
  showCharacterCount = true,
  showWordCount = true,
  minRows = DEFAULT_MIN_ROWS,
  allowFullscreen = true,
  autoResize: _autoResize = true,
  readOnly = false,
  showValidation = true,
  autoSaveStatus = 'idle',
  className,
}: EssayInputProps) {
  
  // Local state
  const [localText, setLocalText] = useState(essayText);
  const [_isFocused, setIsFocused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Sync with external value
  useEffect(() => {
    setLocalText(essayText);
  }, [essayText]);
  
  // Counts
  const characterCount = localText.length;
  const wordCount = countWords(localText);
  
  // Validation
  const validationError = useMemo(() => {
    if (!showValidation || readOnly) return null;
    return validateEssay(localText, minCharacters, maxCharacters, minWords, maxWords);
  }, [localText, minCharacters, maxCharacters, minWords, maxWords, showValidation, readOnly]);
  
  const isValid = localText.trim().length > 0 && !validationError;
  
  // Text change handler
  const handleTextChange = useCallback((value: string) => {
    setLocalText(value);
    onTextChange?.(value);
  }, [onTextChange]);
  
  // Event handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleTextChange(e.target.value);
  }, [handleTextChange]);
  
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);
  
  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);
  
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);
  
  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isFullscreen) {
      setIsFullscreen(false);
    }
  }, [isFullscreen]);
  
  const textareaContent = (
    <div className={cn('space-y-3', isFullscreen && 'h-full flex flex-col')}>
      {/* Fullscreen Header */}
      {isFullscreen && (
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div>
            <h3 className="font-medium">Bài làm - Chế độ toàn màn hình</h3>
            <p className="text-sm text-gray-500">Nhấn ESC để thoát</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
          >
            <Minimize2 className="h-4 w-4 mr-2" />
            Thu nhỏ
          </Button>
        </div>
      )}
      
      {/* Instructions (only show when not fullscreen) */}
      {!isFullscreen && (
        <div className="mb-4">
          <Label htmlFor={`essay-${questionId}`} className="text-sm font-medium text-gray-700">
            Bài làm:
          </Label>
          
          {/* Guidelines */}
          <div className="mt-1 space-y-1">
            {maxCharacters && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Type className="h-3 w-3" />
                <span>Tối đa {maxCharacters.toLocaleString()} ký tự</span>
              </div>
            )}
            
            {maxWords && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>Tối đa {maxWords.toLocaleString()} từ</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Textarea */}
      <div className={cn('relative', isFullscreen && 'flex-1 flex flex-col')}>
        <Textarea
          id={`essay-${questionId}`}
          value={localText}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={isFullscreen ? undefined : minRows}
          maxLength={maxCharacters}
          disabled={readOnly}
          className={cn(
            getTextareaStyles(Boolean(validationError), isValid, readOnly, isFullscreen),
            isFullscreen && 'flex-1 min-h-0'
          )}
        />
        
        {/* Fullscreen Toggle */}
        {allowFullscreen && !readOnly && !isFullscreen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Statistics */}
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-4">
          {showCharacterCount && (
            <div className={cn(
              'flex items-center gap-1',
              maxCharacters && getCountColor(characterCount, maxCharacters)
            )}>
              <Type className="h-3 w-3" />
              <span>
                {formatCountDisplay(characterCount, maxCharacters)}
              </span>
            </div>
          )}
          
          {showWordCount && (
            <div className={cn(
              'flex items-center gap-1',
              maxWords && getCountColor(wordCount, maxWords)
            )}>
              <AlignLeft className="h-3 w-3" />
              <span>
                {formatCountDisplay(wordCount, maxWords, 'words')}
              </span>
            </div>
          )}
        </div>
        
        {/* Validation Status */}
        {isValid && (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-3 w-3" />
            <span>Hợp lệ</span>
          </div>
        )}
      </div>
    </div>
  );
  
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        {textareaContent}
      </div>
    );
  }
  
  return (
    <BaseAnswerInput
      questionId={questionId}
      value={localText}
      error={validationError}
      readOnly={readOnly}
      showValidation={showValidation}
      autoSaveStatus={autoSaveStatus}
      className={cn('group', className)}
    >
      {textareaContent}
    </BaseAnswerInput>
  );
}

// ===== EXPORT =====

export default EssayInput;
