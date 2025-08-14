/**
 * LaTeX Renderer Component
 * Core component cho rendering LaTeX expressions trong questions
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useMemo } from 'react';
import { LaTeXErrorBoundary, LaTeXErrorFallback } from './LaTeXErrorBoundary';
import { 
  processQuestionContent,
  validateLatexExpression,
  cleanLatexContent 
} from '@/lib/utils/question-latex';

/**
 * Props cho LaTeX Renderer
 */
interface LaTeXRendererProps {
  /** LaTeX content cần render */
  content: string;
  /** Display mode (inline hoặc block) */
  displayMode?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Show error details khi có lỗi */
  showErrorDetails?: boolean;
  /** Fallback content khi có lỗi */
  errorFallback?: React.ReactNode;
  /** Callback khi có lỗi rendering */
  onError?: (error: string) => void;
  /** Enable content cleaning */
  cleanContent?: boolean;
}

/**
 * LaTeX Renderer Component
 * Render LaTeX content với error handling và optimization
 */
export function LaTeXRenderer({
  content,
  displayMode = false,
  className = '',
  showErrorDetails = false,
  errorFallback,
  onError,
  cleanContent = true
}: LaTeXRendererProps) {
  /**
   * Process và validate LaTeX content
   */
  const processedContent = useMemo(() => {
    if (!content?.trim()) return '';
    
    try {
      // Clean content nếu được enable
      const cleanedContent = cleanContent ? cleanLatexContent(content) : content;
      
      // Validate LaTeX trước khi render
      const validation = validateLatexExpression(cleanedContent);
      if (!validation.isValid && validation.error) {
        console.warn('LaTeX validation failed:', validation.error);
        onError?.(validation.error);
        return null;
      }
      
      // Process content với KaTeX
      return processQuestionContent(cleanedContent);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('LaTeX processing error:', errorMessage);
      onError?.(errorMessage);
      return null;
    }
  }, [content, cleanContent, onError]);

  /**
   * Render error fallback
   */
  const renderErrorFallback = (error?: string) => {
    if (errorFallback) {
      return errorFallback;
    }
    
    return (
      <LaTeXErrorFallback 
        error={error} 
        resetError={() => window.location.reload()} 
      />
    );
  };

  // Handle empty hoặc invalid content
  if (!content?.trim()) {
    return null;
  }

  // Handle processing errors
  if (processedContent === null) {
    return renderErrorFallback('Processing failed');
  }

  // Handle empty processed content
  if (!processedContent) {
    return <span className={`latex-empty ${className}`}>No content</span>;
  }

  return (
    <LaTeXErrorBoundary
      showErrorDetails={showErrorDetails}
      fallback={renderErrorFallback()}
      onError={(error) => onError?.(error.message)}
    >
      <div
        className={`latex-content ${displayMode ? 'display-mode' : 'inline-mode'} ${className}`}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </LaTeXErrorBoundary>
  );
}

/**
 * Inline LaTeX Component
 * Shorthand cho inline math rendering
 */
export function InlineLaTeX({
  children,
  className = '',
  ...props
}: Omit<LaTeXRendererProps, 'content' | 'displayMode'> & {
  children: string;
}) {
  return (
    <LaTeXRenderer
      content={children}
      displayMode={false}
      className={`inline-latex ${className}`}
      {...props}
    />
  );
}

/**
 * Display LaTeX Component
 * Shorthand cho display math rendering
 */
export function DisplayLaTeX({
  children,
  className = '',
  ...props
}: Omit<LaTeXRendererProps, 'content' | 'displayMode'> & {
  children: string;
}) {
  return (
    <LaTeXRenderer
      content={children}
      displayMode={true}
      className={`display-latex ${className}`}
      {...props}
    />
  );
}

/**
 * LaTeX Preview Component
 * Cho live preview trong forms
 */
export function LaTeXPreview({
  content,
  title = 'Preview',
  className = ''
}: {
  content: string;
  title?: string;
  className?: string;
}) {
  if (!content?.trim()) {
    return (
      <div className={`latex-preview-empty ${className}`}>
        <span className="text-gray-400 italic">No content to preview</span>
      </div>
    );
  }

  return (
    <div className={`latex-preview ${className}`}>
      {title && (
        <div className="latex-preview-title text-sm font-medium text-gray-600 mb-2">
          {title}
        </div>
      )}
      <div className="latex-preview-content border rounded p-3 bg-gray-50">
        <LaTeXRenderer
          content={content}
          showErrorDetails={true}
          className="preview-content"
        />
      </div>
    </div>
  );
}
