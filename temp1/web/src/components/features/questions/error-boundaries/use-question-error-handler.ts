'use client';

import { useCallback, useState } from 'react';

import logger from '@/lib/utils/logger';

import { QuestionErrorType, QuestionErrorContext } from './question-error-boundary';

/**
 * Error handler result
 */
export interface ErrorHandlerResult {
  hasError: boolean;
  error?: Error;
  context?: QuestionErrorContext;
  retryCount: number;
}

/**
 * Error handler options
 */
export interface ErrorHandlerOptions {
  maxRetries?: number;
  enableLogging?: boolean;
  enableReporting?: boolean;
  onError?: (error: Error, context?: QuestionErrorContext) => void;
  onRetry?: (retryCount: number) => void;
  onMaxRetriesReached?: (error: Error, context?: QuestionErrorContext) => void;
}

/**
 * Hook for handling errors in question components
 * 
 * Provides error state management, retry logic, and error reporting
 * for question-related operations
 */
export function useQuestionErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    maxRetries = 3,
    enableLogging = true,
    enableReporting = true,
    onError,
    onRetry,
    onMaxRetriesReached
  } = options;

  const [errorState, setErrorState] = useState<ErrorHandlerResult>({
    hasError: false,
    retryCount: 0
  });

  /**
   * Handle error with context
   */
  const handleError = useCallback((
    error: Error,
    context?: QuestionErrorContext
  ) => {
    // Log error if enabled
    if (enableLogging) {
      logger.error('Question error handled:', {
        error: error.message,
        stack: error.stack,
        context
      });
    }

    // Update error state
    setErrorState(prev => ({
      hasError: true,
      error,
      context,
      retryCount: prev.retryCount
    }));

    // Call custom error handler
    if (onError) {
      onError(error, context);
    }

    // Report error if enabled
    if (enableReporting) {
      reportError(error, context);
    }
  }, [enableLogging, enableReporting, onError]);

  /**
   * Retry the failed operation
   */
  const retry = useCallback(() => {
    const { retryCount, error, context } = errorState;

    if (retryCount >= maxRetries) {
      if (onMaxRetriesReached && error) {
        onMaxRetriesReached(error, context);
      }
      return false;
    }

    const newRetryCount = retryCount + 1;

    setErrorState(prev => ({
      ...prev,
      retryCount: newRetryCount
    }));

    if (onRetry) {
      onRetry(newRetryCount);
    }

    return true;
  }, [errorState, maxRetries, onRetry, onMaxRetriesReached]);

  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    setErrorState({
      hasError: false,
      retryCount: 0
    });
  }, []);

  /**
   * Check if can retry
   */
  const canRetry = errorState.retryCount < maxRetries;

  /**
   * Wrap async operation with error handling
   */
  const wrapAsync = useCallback(<T>(
    operation: () => Promise<T>,
    context?: QuestionErrorContext
  ) => {
    return async (): Promise<T | null> => {
      try {
        const result = await operation();
        // Reset error state on success
        if (errorState.hasError) {
          resetError();
        }
        return result;
      } catch (error) {
        handleError(error as Error, context);
        return null;
      }
    };
  }, [errorState.hasError, handleError, resetError]);

  /**
   * Wrap sync operation with error handling
   */
  const wrapSync = useCallback(<T>(
    operation: () => T,
    context?: QuestionErrorContext
  ) => {
    return (): T | null => {
      try {
        const result = operation();
        // Reset error state on success
        if (errorState.hasError) {
          resetError();
        }
        return result;
      } catch (error) {
        handleError(error as Error, context);
        return null;
      }
    };
  }, [errorState.hasError, handleError, resetError]);

  return {
    // Error state
    ...errorState,
    canRetry,

    // Error handling methods
    handleError,
    retry,
    resetError,

    // Operation wrappers
    wrapAsync,
    wrapSync
  };
}

/**
 * Report error to monitoring service
 */
function reportError(error: Error, context?: QuestionErrorContext) {
  // TODO: Implement error reporting to monitoring service
  // For now, just log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group('🚨 Question Error Report');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.log('Context:', context);
    console.groupEnd();
  }

  // In production, send to monitoring service
  // Example: Sentry, LogRocket, etc.
}

/**
 * Create error context for different question operations
 */
export const createQuestionErrorContext = {
  form: (questionId?: string, metadata?: Record<string, any>): QuestionErrorContext => ({
    type: QuestionErrorType.FORM_SUBMISSION,
    operation: 'question_form',
    questionId,
    metadata
  }),

  search: (metadata?: Record<string, any>): QuestionErrorContext => ({
    type: QuestionErrorType.SEARCH,
    operation: 'question_search',
    metadata
  }),

  display: (questionId?: string, metadata?: Record<string, any>): QuestionErrorContext => ({
    type: QuestionErrorType.DATA_LOADING,
    operation: 'question_display',
    questionId,
    metadata
  }),

  latex: (metadata?: Record<string, any>): QuestionErrorContext => ({
    type: QuestionErrorType.LATEX_PROCESSING,
    operation: 'latex_processing',
    metadata
  }),

  mapid: (mapId?: string, metadata?: Record<string, any>): QuestionErrorContext => ({
    type: QuestionErrorType.MAPID_DECODING,
    operation: 'mapid_processing',
    metadata: { mapId, ...metadata }
  }),

  upload: (fileName?: string, fileSize?: number, metadata?: Record<string, any>): QuestionErrorContext => ({
    type: QuestionErrorType.FILE_UPLOAD,
    operation: 'file_upload',
    metadata: { fileName, fileSize, ...metadata }
  }),

  validation: (questionId?: string, metadata?: Record<string, any>): QuestionErrorContext => ({
    type: QuestionErrorType.VALIDATION,
    operation: 'validation',
    questionId,
    metadata
  })
};
