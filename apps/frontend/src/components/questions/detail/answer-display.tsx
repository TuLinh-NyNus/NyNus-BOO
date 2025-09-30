/**
 * Answer Display Component
 * Dedicated component cho hiển thị answer options của tất cả question types theo RIPER-5 EXECUTE MODE
 * 
 * Features:
 * - Support Multiple Choice (MC), True/False (TF), Short Answer (SA), Essay (ES)
 * - LaTeX rendering cho answer content
 * - Correct answer highlighting và explanations
 * - Visibility toggle functionality
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
  Button,
  Alert,
  AlertDescription,
  Badge
} from '@/components/ui';
import {
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  FileText,
  MessageSquare
} from 'lucide-react';

// Import LaTeX components
import { LaTeXContent } from '@/components/common/latex';

// Import shared components
import { 
  PublicQuestionErrorBoundary,
  QuestionTypeBadge 
} from '@/components/questions/shared';

// Import types
import { PublicQuestion } from '@/types/public';
import { QuestionType } from '@/types/question';
import type { LaTeXExpression } from '@/lib/utils/latex-rendering';

// Import utils
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface AnswerDisplayProps {
  /** Question data với answers */
  question: PublicQuestion;
  
  /** Show answers initially (default: true) */
  showAnswers?: boolean;
  
  /** Show correctness indicators (default: true) */
  showCorrectness?: boolean;
  
  /** Display variant */
  variant?: 'default' | 'compact' | 'educational';
  
  /** Visibility toggle callback */
  onToggleVisibility?: (visible: boolean) => void;
  
  /** Error handler callback */
  onError?: (error: Error) => void;
  
  /** Custom CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const VARIANT_STYLES = {
  default: 'answer-display-default',
  compact: 'answer-display-compact',
  educational: 'answer-display-educational'
} as const;

// Note: QUESTION_TYPE_LABELS removed as not used in current implementation

// ===== MAIN COMPONENT =====

/**
 * Answer Display Component
 * Universal component cho hiển thị answers của tất cả question types
 */
export function AnswerDisplay({
  question,
  showAnswers = true,
  showCorrectness = true,
  variant = 'default',
  onToggleVisibility,
  onError,
  className = ""
}: AnswerDisplayProps) {
  // ===== STATE =====
  
  const [isVisible, setIsVisible] = useState(showAnswers);
  
  // ===== COMPUTED VALUES =====
  
  /**
   * Check if question has valid answers
   */
  const hasAnswers = useMemo(() => {
    return question?.answers && question.answers.length > 0;
  }, [question]);
  
  // Note: questionTypeLabel removed as not used in current implementation
  
  /**
   * Count correct answers
   */
  const correctAnswersCount = useMemo(() => {
    if (!hasAnswers) return 0;
    return question.answers?.filter(answer => answer.isCorrect).length || 0;
  }, [hasAnswers, question.answers]);
  
  // ===== HANDLERS =====
  
  /**
   * Toggle answers visibility
   */
  const handleToggleVisibility = useCallback(() => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    onToggleVisibility?.(newVisibility);
  }, [isVisible, onToggleVisibility]);
  
  /**
   * Handle LaTeX rendering errors
   */
  const handleLatexError = useCallback((errors: string[], _expressions?: LaTeXExpression[]) => {
    const errorMessage = errors.join(', ');
    console.warn('[AnswerDisplay] LaTeX rendering errors:', errors);
    onError?.(new Error(`Answer LaTeX rendering failed: ${errorMessage}`));
  }, [onError]);
  
  // ===== RENDER FUNCTIONS =====
  
  /**
   * Render answer header với toggle button
   */
  const renderAnswerHeader = () => {
    return (
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-foreground">Các đáp án</h3>
          {variant === 'educational' && (
            <QuestionTypeBadge 
              type={question.type} 
              variant="badge"
              size="sm"
            />
          )}
          {showCorrectness && correctAnswersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {correctAnswersCount} đúng
            </Badge>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleVisibility}
          className="text-sm"
        >
          {isVisible ? (
            <>
              <EyeOff className="h-4 w-4 mr-1" />
              Ẩn đáp án
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-1" />
              Hiện đáp án
            </>
          )}
        </Button>
      </div>
    );
  };
  
  /**
   * Render Multiple Choice answers
   */
  const renderMultipleChoiceAnswers = () => {
    if (!question.answers) return null;
    
    return (
      <div className="space-y-3">
        {question.answers.map((answer, index) => {
          const isCorrect = answer.isCorrect;
          const answerLabel = String.fromCharCode(65 + index); // A, B, C, D...
          
          return (
            <div
              key={answer.id || index}
              className={cn(
                "p-3 rounded-lg border-2 transition-colors",
                showCorrectness && isCorrect 
                  ? "border-green-200 bg-green-50 text-green-800" 
                  : "border-gray-200 bg-gray-50",
                variant === 'compact' && "p-2"
              )}
            >
              <div className="flex items-start gap-3">
                <span className={cn(
                  "font-medium min-w-[24px]",
                  variant === 'compact' ? "text-xs" : "text-sm"
                )}>
                  {answerLabel}.
                </span>
                
                <div className="flex-1">
                  <LaTeXContent
                    content={answer.content}
                    safeMode={true}
                    className={variant === 'compact' ? "text-xs" : "text-sm"}
                    onError={handleLatexError}
                  />
                  
                  {answer.explanation && showCorrectness && isCorrect && (
                    <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                      <div className="flex items-start gap-1">
                        <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <LaTeXContent
                          content={answer.explanation}
                          safeMode={true}
                          onError={handleLatexError}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {showCorrectness && isCorrect && (
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * Render True/False answers
   */
  const renderTrueFalseAnswers = () => {
    // For TF questions, we expect correctAnswer to be boolean or string
    const correctAnswer = question.correctAnswer;
    const isTrue = correctAnswer === 'true' || correctAnswer === 'Đúng' ||
                   (typeof correctAnswer === 'boolean' && correctAnswer === true);

    return (
      <div className="space-y-3">
        <div className={cn(
          "p-3 rounded-lg border-2 transition-colors",
          showCorrectness && isTrue
            ? "border-green-200 bg-green-50 text-green-800"
            : "border-gray-200 bg-gray-50"
        )}>
          <div className="flex items-center gap-3">
            <span className="font-medium text-sm min-w-[24px]">A.</span>
            <span className="flex-1">Đúng</span>
            {showCorrectness && isTrue && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </div>
        </div>

        <div className={cn(
          "p-3 rounded-lg border-2 transition-colors",
          showCorrectness && !isTrue
            ? "border-green-200 bg-green-50 text-green-800"
            : "border-gray-200 bg-gray-50"
        )}>
          <div className="flex items-center gap-3">
            <span className="font-medium text-sm min-w-[24px]">B.</span>
            <span className="flex-1">Sai</span>
            {showCorrectness && !isTrue && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </div>
        </div>

        {question.explanation && showCorrectness && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
              <div className="flex-1">
                <h4 className="font-medium text-sm text-blue-800 mb-1">Giải thích:</h4>
                <LaTeXContent
                  content={question.explanation}
                  safeMode={true}
                  className="text-sm text-blue-700"
                  onError={handleLatexError}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  /**
   * Render Short Answer answers
   */
  const renderShortAnswerAnswers = () => {
    // For SA questions, correctAnswer can be string or string[]
    const correctAnswers = Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : question.correctAnswer
        ? [question.correctAnswer as string]
        : [];

    if (correctAnswers.length === 0) {
      return (
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-800">
                Câu hỏi trả lời ngắn - đáp án sẽ được chấm thủ công
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 mt-0.5 text-green-600" />
            <div className="flex-1">
              <h4 className="font-medium text-sm text-green-800 mb-2">
                Đáp án được chấp nhận ({correctAnswers.length}):
              </h4>
              <div className="space-y-2">
                {correctAnswers.map((answer, index) => (
                  <div key={index} className="p-2 bg-white rounded border">
                    <LaTeXContent
                      content={answer}
                      safeMode={true}
                      className="text-sm"
                      onError={handleLatexError}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {question.explanation && showCorrectness && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
              <div className="flex-1">
                <h4 className="font-medium text-sm text-blue-800 mb-1">Hướng dẫn:</h4>
                <LaTeXContent
                  content={question.explanation}
                  safeMode={true}
                  className="text-sm text-blue-700"
                  onError={handleLatexError}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  /**
   * Render Essay answers
   */
  const renderEssayAnswers = () => {
    const sampleAnswer = typeof question.correctAnswer === 'string'
      ? question.correctAnswer
      : Array.isArray(question.correctAnswer)
        ? question.correctAnswer[0]
        : null;

    return (
      <div className="space-y-3">
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 mt-0.5 text-purple-600" />
            <div className="flex-1">
              <h4 className="font-medium text-sm text-purple-800 mb-2">
                Câu hỏi tự luận
              </h4>
              <p className="text-sm text-purple-700">
                Câu trả lời sẽ được chấm điểm thủ công bởi giáo viên
              </p>

              {question.points && (
                <p className="text-xs text-purple-600 mt-1">
                  Điểm tối đa: {question.points} điểm
                </p>
              )}
            </div>
          </div>
        </div>

        {sampleAnswer && showCorrectness && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
              <div className="flex-1">
                <h4 className="font-medium text-sm text-green-800 mb-2">
                  Câu trả lời mẫu:
                </h4>
                <div className="p-3 bg-white rounded border">
                  <LaTeXContent
                    content={sampleAnswer}
                    safeMode={true}
                    className="text-sm"
                    onError={handleLatexError}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {question.explanation && showCorrectness && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
              <div className="flex-1">
                <h4 className="font-medium text-sm text-blue-800 mb-1">Hướng dẫn chấm điểm:</h4>
                <LaTeXContent
                  content={question.explanation}
                  safeMode={true}
                  className="text-sm text-blue-700"
                  onError={handleLatexError}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  /**
   * Render answers based on question type
   */
  const renderAnswersByType = () => {
    if (!isVisible) return null;

    switch (question.type) {
      case QuestionType.MC:
        return renderMultipleChoiceAnswers();
      case QuestionType.TF:
        return renderTrueFalseAnswers();
      case QuestionType.SA:
        return renderShortAnswerAnswers();
      case QuestionType.ES:
        return renderEssayAnswers();
      default:
        return (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Loại câu hỏi &quot;{question.type}&quot; chưa được hỗ trợ hiển thị đáp án.
            </AlertDescription>
          </Alert>
        );
    }
  };

  /**
   * Get variant-specific styling
   */
  const getVariantStyles = () => {
    const baseStyles = "answer-display";
    const variantStyle = VARIANT_STYLES[variant];

    switch (variant) {
      case 'compact':
        return cn(baseStyles, variantStyle, "space-y-2");
      case 'educational':
        return cn(baseStyles, variantStyle, "space-y-4 p-4 bg-card rounded-lg border");
      default:
        return cn(baseStyles, variantStyle, "space-y-3");
    }
  };

  // ===== MAIN RENDER =====

  if (!question) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Không có dữ liệu câu hỏi để hiển thị đáp án
        </AlertDescription>
      </Alert>
    );
  }

  if (!hasAnswers && question.type !== QuestionType.TF && question.type !== QuestionType.SA && question.type !== QuestionType.ES) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Câu hỏi này không có đáp án để hiển thị
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <PublicQuestionErrorBoundary
      onError={onError}
      enableRetry={true}
      maxRetries={2}
      className="answer-display-error-boundary"
    >
      <div className={cn(getVariantStyles(), className)}>
        {/* Answer Header */}
        {renderAnswerHeader()}

        {/* Answer Content */}
        {renderAnswersByType()}
      </div>
    </PublicQuestionErrorBoundary>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Compact Answer Display
 * Simplified display cho dense layouts
 */
export function CompactAnswerDisplay(props: Omit<AnswerDisplayProps, 'variant'>) {
  return (
    <AnswerDisplay
      {...props}
      variant="compact"
      className={cn("compact-answer-display", props.className)}
    />
  );
}

/**
 * Educational Answer Display
 * Enhanced display với educational features
 */
export function EducationalAnswerDisplay(props: Omit<AnswerDisplayProps, 'variant'>) {
  return (
    <AnswerDisplay
      {...props}
      variant="educational"
      showCorrectness={true}
      className={cn("educational-answer-display", props.className)}
    />
  );
}

/**
 * Answer Display với custom visibility control
 */
export function ControlledAnswerDisplay(props: AnswerDisplayProps & {
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
}) {
  const { isVisible, onVisibilityChange, ...restProps } = props;

  return (
    <AnswerDisplay
      {...restProps}
      showAnswers={isVisible}
      onToggleVisibility={onVisibilityChange}
      className={cn("controlled-answer-display", props.className)}
    />
  );
}
