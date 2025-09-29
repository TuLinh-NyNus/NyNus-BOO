/**
 * Question Viewer Component
 * Public question viewer adapted từ admin QuestionPreview theo RIPER-5 EXECUTE MODE
 * 
 * Features:
 * - Clean question display cho public users
 * - LaTeX rendering với performance optimization
 * - Answer options display (educational purposes)
 * - Solution/explanation với expandable functionality
 * - Error handling và loading states
 * - Responsive design và accessibility
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  Alert,
  AlertDescription
} from '@/components/ui';
import {
  AlertTriangle
} from 'lucide-react';

// Import LaTeX components
import { QuestionLaTeXContent } from '@/components/latex';
import type { LaTeXExpression } from '@/lib/utils/latex-rendering';

// Import shared components
import {
  PublicQuestionErrorBoundary
} from '@/components/questions/shared';

// Import detail components
import { AnswerDisplay } from './answer-display';
import { SolutionPanel } from './solution-panel';
import { MetadataDisplay } from './metadata-display';

// Import types
import { PublicQuestion } from '@/types/public';

// Import utils
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface QuestionViewerProps {
  /** Question data để display */
  question: PublicQuestion;
  
  /** Show answer options (default: true) */
  showAnswers?: boolean;
  
  /** Show explanation/solution (default: true) */
  showExplanation?: boolean;
  
  /** Show metadata badges (default: true) */
  showMetadata?: boolean;
  
  /** Display variant */
  variant?: 'default' | 'compact' | 'detailed';
  
  /** Error handler callback */
  onError?: (error: Error) => void;
  
  /** Custom CSS classes */
  className?: string;
}

// Note: QuestionViewerState interface removed as not used in current implementation

// ===== CONSTANTS =====

const VARIANT_STYLES = {
  default: 'question-viewer-default',
  compact: 'question-viewer-compact', 
  detailed: 'question-viewer-detailed'
} as const;

// ===== MAIN COMPONENT =====

/**
 * Question Viewer Component
 * Public question viewer với clean display và LaTeX support
 */
export function QuestionViewer({
  question,
  showAnswers = true,
  showExplanation = true,
  showMetadata = true,
  variant = 'default',
  onError,
  className = ""
}: QuestionViewerProps) {
  // ===== STATE =====
  
  const [showAnswersState, setShowAnswersState] = useState(showAnswers);
  const [showExplanationState, setShowExplanationState] = useState(false); // Start collapsed
  
  // ===== COMPUTED VALUES =====
  
  /**
   * Check if question has valid content
   */
  const hasValidContent = useMemo(() => {
    return question && question.content && question.content.trim().length > 0;
  }, [question]);
  
  // Note: hasAnswers removed as now handled by AnswerDisplay component
  
  // Note: hasSolution removed as now handled by SolutionPanel component
  
  // ===== HANDLERS =====
  
  // Note: handleToggleAnswers removed as now handled by AnswerDisplay component
  
  // Note: handleToggleExplanation removed as now handled by SolutionPanel component
  
  /**
   * Handle LaTeX rendering errors
   */
  const handleLatexError = useCallback((errors: string[], _expressions?: LaTeXExpression[]) => {
    const errorMessage = errors.join(', ');
    console.warn('[QuestionViewer] LaTeX rendering errors:', errors);
    onError?.(new Error(`LaTeX rendering failed: ${errorMessage}`));
  }, [onError]);
  
  // ===== RENDER FUNCTIONS =====
  
  /**
   * Render question metadata using MetadataDisplay component
   */
  const renderMetadata = () => {
    if (!showMetadata) return null;

    return (
      <MetadataDisplay
        question={question}
        showMetadata={showMetadata}
        showStatistics={variant === 'detailed'}
        variant={variant === 'compact' ? 'compact' : variant === 'detailed' ? 'detailed' : 'default'}
        layout={variant === 'compact' ? 'horizontal' : 'grid'}
        onError={onError}
        className="metadata-section"
      />
    );
  };
  
  /**
   * Render question content
   */
  const renderQuestionContent = () => {
    if (!hasValidContent) {
      return (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Nội dung câu hỏi không khả dụng
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <div className="question-content-section">
        <h3 className="font-medium mb-3 text-foreground">Nội dung câu hỏi</h3>
        <div className="p-4 border rounded-lg bg-card">
          <QuestionLaTeXContent 
            content={question.content}
            expandable={true}
            safeMode={true}
            onError={handleLatexError}
            className="text-base leading-relaxed"
          />
        </div>
      </div>
    );
  };
  
  /**
   * Render answer options using AnswerDisplay component
   */
  const renderAnswers = () => {
    if (!showAnswers) return null;

    return (
      <AnswerDisplay
        question={question}
        showAnswers={showAnswersState}
        showCorrectness={true}
        variant={variant === 'compact' ? 'compact' : variant === 'detailed' ? 'educational' : 'default'}
        onToggleVisibility={setShowAnswersState}
        onError={onError}
        className="answers-section"
      />
    );
  };

  /**
   * Render solution/explanation using SolutionPanel component
   */
  const renderSolution = () => {
    if (!showExplanation) return null;

    return (
      <SolutionPanel
        question={question}
        showSolution={showExplanation}
        defaultExpanded={showExplanationState}
        variant={variant === 'compact' ? 'compact' : variant === 'detailed' ? 'detailed' : 'default'}
        onToggle={setShowExplanationState}
        onError={onError}
        className="solution-section"
      />
    );
  };

  /**
   * Get variant-specific styling
   */
  const getVariantStyles = () => {
    const baseStyles = "question-viewer";
    const variantStyle = VARIANT_STYLES[variant];

    switch (variant) {
      case 'compact':
        return cn(baseStyles, variantStyle, "space-y-3");
      case 'detailed':
        return cn(baseStyles, variantStyle, "space-y-6");
      default:
        return cn(baseStyles, variantStyle, "space-y-4");
    }
  };

  // ===== MAIN RENDER =====

  if (!question) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Không có dữ liệu câu hỏi để hiển thị
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <PublicQuestionErrorBoundary
      onError={onError}
      enableRetry={true}
      maxRetries={2}
      className="question-viewer-error-boundary"
    >
      <Card className={cn(getVariantStyles(), className)}>
        <CardContent className="p-6">
          {/* Metadata */}
          {renderMetadata()}

          {/* Question Content */}
          {renderQuestionContent()}

          {/* Answer Options */}
          {renderAnswers()}

          {/* Solution/Explanation */}
          {renderSolution()}
        </CardContent>
      </Card>
    </PublicQuestionErrorBoundary>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Compact Question Viewer
 * Simplified viewer cho dense layouts
 */
export function CompactQuestionViewer(props: Omit<QuestionViewerProps, 'variant'>) {
  return (
    <QuestionViewer
      {...props}
      variant="compact"
      showMetadata={false}
      className={cn("compact-question-viewer", props.className)}
    />
  );
}

/**
 * Detailed Question Viewer
 * Full-featured viewer với all options
 */
export function DetailedQuestionViewer(props: Omit<QuestionViewerProps, 'variant'>) {
  return (
    <QuestionViewer
      {...props}
      variant="detailed"
      showAnswers={true}
      showExplanation={true}
      showMetadata={true}
      className={cn("detailed-question-viewer", props.className)}
    />
  );
}

/**
 * Educational Question Viewer
 * Viewer optimized cho educational purposes
 */
export function EducationalQuestionViewer(props: QuestionViewerProps) {
  return (
    <QuestionViewer
      {...props}
      showAnswers={true}
      showExplanation={true}
      showMetadata={true}
      variant="detailed"
      className={cn("educational-question-viewer", props.className)}
    />
  );
}
