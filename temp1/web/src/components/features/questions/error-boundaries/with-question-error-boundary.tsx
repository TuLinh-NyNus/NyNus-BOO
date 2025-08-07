'use client';

import React from 'react';

import { 
  QuestionErrorBoundary, 
  QuestionErrorBoundaryProps,
  QuestionErrorType,
  QuestionErrorContext
} from './question-error-boundary';

/**
 * Options for withQuestionErrorBoundary HOC
 */
export interface WithErrorBoundaryOptions {
  errorType?: QuestionErrorType;
  operation?: string;
  enableRetry?: boolean;
  enableReporting?: boolean;
  onError?: (error: Error, errorInfo: React.ErrorInfo, context?: QuestionErrorContext) => void;
  onRetry?: () => void;
  fallback?: React.ComponentType<any>;
}

/**
 * Higher-Order Component that wraps a component with QuestionErrorBoundary
 * 
 * @param Component - The component to wrap
 * @param options - Error boundary configuration options
 * @returns Wrapped component with error boundary
 */
export function withQuestionErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) {
  const {
    errorType = QuestionErrorType.UNKNOWN,
    operation,
    enableRetry = true,
    enableReporting = true,
    onError,
    onRetry,
    fallback
  } = options;

  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    const context: QuestionErrorContext = {
      type: errorType,
      operation: operation || Component.displayName || Component.name || 'unknown'
    };

    const errorBoundaryProps: QuestionErrorBoundaryProps = {
      context,
      enableRetry,
      enableReporting,
      onError,
      onRetry,
      fallback
    };

    return (
      <QuestionErrorBoundary {...errorBoundaryProps}>
        <Component {...props} ref={ref} />
      </QuestionErrorBoundary>
    );
  });

  // Set display name for debugging
  WrappedComponent.displayName = `withQuestionErrorBoundary(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WrappedComponent;
}

/**
 * Specialized HOCs for different question operations
 */

/**
 * Wrap component with form error boundary
 */
export function withFormErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<WithErrorBoundaryOptions, 'errorType'> = {}
) {
  return withQuestionErrorBoundary(Component, {
    ...options,
    errorType: QuestionErrorType.FORM_SUBMISSION
  });
}

/**
 * Wrap component with search error boundary
 */
export function withSearchErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<WithErrorBoundaryOptions, 'errorType'> = {}
) {
  return withQuestionErrorBoundary(Component, {
    ...options,
    errorType: QuestionErrorType.SEARCH
  });
}

/**
 * Wrap component with display error boundary
 */
export function withDisplayErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<WithErrorBoundaryOptions, 'errorType'> = {}
) {
  return withQuestionErrorBoundary(Component, {
    ...options,
    errorType: QuestionErrorType.DATA_LOADING
  });
}

/**
 * Wrap component with LaTeX error boundary
 */
export function withLaTeXErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<WithErrorBoundaryOptions, 'errorType'> = {}
) {
  return withQuestionErrorBoundary(Component, {
    ...options,
    errorType: QuestionErrorType.LATEX_PROCESSING
  });
}

/**
 * Wrap component with MapID error boundary
 */
export function withMapIDErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<WithErrorBoundaryOptions, 'errorType'> = {}
) {
  return withQuestionErrorBoundary(Component, {
    ...options,
    errorType: QuestionErrorType.MAPID_DECODING
  });
}

/**
 * Wrap component with file upload error boundary
 */
export function withFileUploadErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<WithErrorBoundaryOptions, 'errorType'> = {}
) {
  return withQuestionErrorBoundary(Component, {
    ...options,
    errorType: QuestionErrorType.FILE_UPLOAD
  });
}

/**
 * Wrap component with validation error boundary
 */
export function withValidationErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<WithErrorBoundaryOptions, 'errorType'> = {}
) {
  return withQuestionErrorBoundary(Component, {
    ...options,
    errorType: QuestionErrorType.VALIDATION
  });
}
