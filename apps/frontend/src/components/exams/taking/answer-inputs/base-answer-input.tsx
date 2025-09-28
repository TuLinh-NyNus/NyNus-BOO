/**
 * Base Answer Input Component
 * Common interface and shared functionality for all answer input types
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Clock, Save } from 'lucide-react';

// ===== TYPES =====

export interface BaseAnswerInputProps {
  /** Question ID */
  questionId: string;
  
  /** Current answer value */
  value?: any;
  
  /** Answer change handler */
  onChange?: (value: any) => void;
  
  /** Validation error message */
  error?: string | null;
  
  /** Read-only mode */
  readOnly?: boolean;
  
  /** Show validation */
  showValidation?: boolean;
  
  /** Auto-save status */
  autoSaveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  
  /** Additional CSS classes */
  className?: string;
  
  /** Children components */
  children?: React.ReactNode;
}

export interface AnswerInputState {
  isAnswered: boolean;
  hasError: boolean;
  isDirty: boolean;
  lastSaved?: Date;
}

// ===== CONSTANTS =====

const AUTO_SAVE_STATUS_CONFIG = {
  idle: {
    icon: null,
    text: '',
    className: '',
  },
  saving: {
    icon: Clock,
    text: 'Đang lưu...',
    className: 'text-blue-600',
  },
  saved: {
    icon: CheckCircle,
    text: 'Đã lưu',
    className: 'text-green-600',
  },
  error: {
    icon: AlertCircle,
    text: 'Lỗi lưu',
    className: 'text-red-600',
  },
} as const;

// ===== UTILITY FUNCTIONS =====

/**
 * Get answer input state based on value and validation
 */
export function getAnswerInputState(
  value: any,
  error: string | null | undefined,
  hasChanged: boolean = false
): AnswerInputState {
  const isAnswered = Boolean(value && (
    (typeof value === 'string' && value.trim().length > 0) ||
    (Array.isArray(value) && value.length > 0) ||
    (typeof value === 'object' && value !== null)
  ));

  return {
    isAnswered,
    hasError: Boolean(error),
    isDirty: hasChanged,
  };
}

/**
 * Format character/word count display
 */
export function formatCountDisplay(
  current: number,
  max?: number,
  type: 'characters' | 'words' = 'characters'
): string {
  const unit = type === 'characters' ? 'ký tự' : 'từ';
  
  if (max) {
    return `${current}/${max} ${unit}`;
  }
  
  return `${current} ${unit}`;
}

/**
 * Get input container styles based on state
 */
export function getInputContainerStyles(
  state: AnswerInputState,
  readOnly: boolean = false
): string {
  return cn(
    'relative transition-all duration-200',
    'border rounded-lg p-4',
    'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-20',
    {
      // Default state
      'border-gray-200 bg-white': !state.hasError && !state.isAnswered,
      
      // Answered state
      'border-green-200 bg-green-50': state.isAnswered && !state.hasError,
      
      // Error state
      'border-red-200 bg-red-50': state.hasError,
      
      // Read-only state
      'border-gray-100 bg-gray-50': readOnly,
      
      // Dirty state (has unsaved changes)
      'border-blue-200': state.isDirty && !state.hasError,
    }
  );
}

// ===== MAIN COMPONENT =====

/**
 * Base Answer Input Component
 * Provides common layout and functionality for all answer input types
 */
export function BaseAnswerInput({
  questionId,
  value,
  onChange,
  error,
  readOnly = false,
  showValidation = true,
  autoSaveStatus = 'idle',
  className,
  children,
}: BaseAnswerInputProps) {
  
  // Calculate input state
  const inputState = getAnswerInputState(value, error);
  
  // Auto-save status config
  const saveStatusConfig = AUTO_SAVE_STATUS_CONFIG[autoSaveStatus];
  const SaveStatusIcon = saveStatusConfig.icon;
  
  return (
    <div className={cn('space-y-3', className)}>
      {/* Input Container */}
      <div className={getInputContainerStyles(inputState, readOnly)}>
        {/* Auto-save Status Indicator */}
        {autoSaveStatus !== 'idle' && SaveStatusIcon && (
          <div className={cn(
            'absolute top-2 right-2 flex items-center gap-1 text-xs',
            saveStatusConfig.className
          )}>
            <SaveStatusIcon className="h-3 w-3" />
            <span>{saveStatusConfig.text}</span>
          </div>
        )}
        
        {/* Answer Input Content */}
        <div className="space-y-3">
          {children}
        </div>
      </div>
      
      {/* Validation Error */}
      {error && showValidation && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}
      
      {/* Success Indicator */}
      {inputState.isAnswered && !error && showValidation && (
        <div className="flex items-center gap-2 text-sm text-green-700">
          <CheckCircle className="h-4 w-4" />
          <span>Đã trả lời</span>
        </div>
      )}
    </div>
  );
}
