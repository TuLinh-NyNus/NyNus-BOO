/**
 * LaTeX Content Component
 * Component cho rendering mixed content với text và LaTeX expressions
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useMemo, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import {
  parseLatexExpressions,
  renderMixedContent,
  hasLatexContent,
  getLatexStats,
  LaTeXRenderOptions,
  LaTeXParseResult,
  LaTeXExpression
} from "@/lib/utils/latex-rendering";
import { LaTeXRenderer, SafeLaTeX } from "./latex-renderer";

// ===== TYPES =====

export interface LaTeXContentProps {
  /** Content với mixed text và LaTeX */
  content: string;
  
  /** Custom render options cho LaTeX expressions */
  options?: Partial<LaTeXRenderOptions>;
  
  /** Enable safe rendering (fallback on errors) */
  safeMode?: boolean;
  
  /** Show rendering statistics */
  showStats?: boolean;
  
  /** Custom error handling */
  onError?: (errors: string[], expressions: LaTeXExpression[]) => void;
  
  /** Callback khi render complete */
  onRenderComplete?: (result: LaTeXParseResult) => void;
  
  /** Custom CSS classes */
  className?: string;
  
  /** Inline styles */
  style?: React.CSSProperties;
  
  /** Truncate content length */
  maxLength?: number;
  
  /** Show "read more" cho long content */
  expandable?: boolean;
}

// ===== MAIN COMPONENT =====

export function LaTeXContent({
  content,
  options = {},
  safeMode = true,
  showStats = false,
  onError,
  onRenderComplete,
  className = "",
  style,
  maxLength,
  expandable = false
}: LaTeXContentProps) {
  // ===== STATE =====
  
  const [isExpanded, setIsExpanded] = useState(false);
  
  // ===== MEMOIZED VALUES =====
  
  const processedContent = useMemo(() => {
    if (!content) return { expressions: [], stats: null, shouldTruncate: false };
    
    let workingContent = content;
    
    // Truncate nếu cần
    const shouldTruncate = maxLength && content.length > maxLength && !isExpanded;
    if (shouldTruncate) {
      workingContent = content.substring(0, maxLength) + '...';
    }
    
    const expressions = parseLatexExpressions(workingContent);
    const stats = showStats ? getLatexStats(workingContent) : null;
    
    return { expressions, stats, shouldTruncate };
  }, [content, maxLength, isExpanded, showStats]);
  
  // ===== RENDER FUNCTIONS =====
  
  const renderExpression = useCallback((expr: LaTeXExpression, index: number) => {
    const key = `expr-${index}-${expr.startIndex}`;
    
    if (expr.type === 'text') {
      // Render plain text với proper line breaks
      return (
        <span key={key} className="latex-text">
          {expr.content.split('\n').map((line, lineIndex) => (
            <React.Fragment key={lineIndex}>
              {line}
              {lineIndex < expr.content.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </span>
      );
    }
    
    // Render LaTeX expression
    const RendererComponent = safeMode ? SafeLaTeX : LaTeXRenderer;
    
    return (
      <RendererComponent
        key={key}
        latex={expr.content}
        displayMode={expr.type === 'display'}
        options={options}
        onError={(error) => {
          expr.error = error;
          expr.isValid = false;
        }}
      />
    );
  }, [options, safeMode]);
  
  const renderContent = useCallback(() => {
    const { expressions } = processedContent;
    
    if (expressions.length === 0) {
      return <span className="latex-empty">No content</span>;
    }
    
    return (
      <div className="latex-expressions">
        {expressions.map(renderExpression)}
      </div>
    );
  }, [processedContent, renderExpression]);
  
  const renderStats = useCallback(() => {
    const { stats } = processedContent;
    if (!stats || !showStats) return null;
    
    return (
      <div className="latex-stats mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
        <div className="flex gap-4">
          <span>📊 {stats.totalExpressions} expressions</span>
          <span>📝 {stats.inlineCount} inline</span>
          <span>🖼️ {stats.displayCount} display</span>
          <span>📏 {stats.textLength + stats.latexLength} chars</span>
        </div>
      </div>
    );
  }, [processedContent, showStats]);
  
  const renderExpandButton = useCallback(() => {
    const { shouldTruncate } = processedContent;
    
    if (!expandable || !shouldTruncate) return null;
    
    return (
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="latex-expand-btn mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
      >
        {isExpanded ? 'Thu gọn' : 'Xem thêm'}
      </button>
    );
  }, [processedContent, expandable, isExpanded]);
  
  // ===== EFFECTS =====
  
  React.useEffect(() => {
    if (!content) return;
    
    const result = renderMixedContent(content, options);
    onRenderComplete?.(result);
    
    if (!result.isValid && onError) {
      const errors = result.expressions
        .filter(expr => expr.error)
        .map(expr => expr.error!);
      onError(errors, result.expressions);
    }
  }, [content, options, onRenderComplete, onError]);
  
  // ===== MAIN RENDER =====
  
  const containerClasses = cn(
    "latex-content",
    {
      "latex-has-math": hasLatexContent(content),
      "latex-truncated": processedContent.shouldTruncate,
      "latex-expanded": isExpanded
    },
    className
  );
  
  return (
    <div className={containerClasses} style={style}>
      {renderContent()}
      {renderExpandButton()}
      {renderStats()}
    </div>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Compact LaTeX content cho lists
 */
export function CompactLaTeXContent(props: Omit<LaTeXContentProps, 'showStats' | 'expandable'>) {
  return (
    <LaTeXContent
      {...props}
      showStats={false}
      expandable={false}
      maxLength={props.maxLength || 100}
      className={cn("latex-compact text-sm", props.className)}
    />
  );
}

/**
 * Full LaTeX content với all features
 */
export function FullLaTeXContent(props: LaTeXContentProps) {
  return (
    <LaTeXContent
      {...props}
      showStats={true}
      expandable={true}
      safeMode={true}
      className={cn("latex-full", props.className)}
    />
  );
}

/**
 * LaTeX content cho question preview
 */
export function QuestionLaTeXContent({ 
  content, 
  className = "",
  ...props 
}: LaTeXContentProps) {
  return (
    <LaTeXContent
      {...props}
      content={content}
      safeMode={true}
      expandable={true}
      maxLength={500}
      className={cn(
        "question-latex-content",
        "prose prose-sm max-w-none",
        "leading-relaxed",
        className
      )}
    />
  );
}

// ===== UTILITY COMPONENTS =====

/**
 * LaTeX content với loading state
 */
export function LaTeXContentWithLoading({
  content,
  isLoading = false,
  ...props
}: LaTeXContentProps & { isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="latex-loading-content">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }
  
  return <LaTeXContent content={content} {...props} />;
}

/**
 * LaTeX content với error boundary
 */
export function SafeLaTeXContent(props: LaTeXContentProps) {
  const [hasError, setHasError] = useState(false);
  
  const handleError = useCallback((errors: string[]) => {
    setHasError(true);
    console.warn('LaTeX content errors:', errors);
  }, []);
  
  if (hasError) {
    return (
      <div className="latex-error-fallback p-3 bg-red-50 border border-red-200 rounded">
        <p className="text-red-700 text-sm">
          ⚠️ Không thể hiển thị nội dung LaTeX. Hiển thị text gốc:
        </p>
        <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
          {props.content}
        </pre>
      </div>
    );
  }
  
  return <LaTeXContent {...props} onError={handleError} safeMode={true} />;
}

// ===== HOOKS =====

/**
 * Hook cho LaTeX content analysis
 */
export function useLatexContent(content: string) {
  return useMemo(() => {
    if (!content) {
      return {
        hasLatex: false,
        expressions: [],
        stats: null,
        isValid: true
      };
    }
    
    const hasLatex = hasLatexContent(content);
    const expressions = parseLatexExpressions(content);
    const stats = getLatexStats(content);
    const isValid = expressions.every(expr => expr.type === 'text' || expr.isValid !== false);
    
    return {
      hasLatex,
      expressions,
      stats,
      isValid
    };
  }, [content]);
}

/**
 * Hook cho LaTeX content validation
 */
export function useLatexValidation(content: string) {
  const { expressions } = useLatexContent(content);

  return useMemo(() => {
    const latexExpressions = expressions.filter(expr => expr.type !== 'text');

    const validationResults = latexExpressions.map(expr => ({
      expression: expr.content,
      isValid: expr.isValid ?? true,
      error: expr.error
    }));

    const hasErrors = validationResults.some(result => !result.isValid);
    const errorCount = validationResults.filter(result => !result.isValid).length;

    return {
      isValid: !hasErrors,
      errorCount,
      totalExpressions: latexExpressions.length,
      validationResults
    };
  }, [expressions]);
}
