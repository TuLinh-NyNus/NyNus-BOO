/**
 * Question LaTeX Display Component
 * Specialized component cho hiển thị LaTeX content trong questions
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from 'react';
import { LaTeXRenderer } from './LaTeXRenderer';
import { Badge } from '@/components/ui';
import { FileText, AlertCircle } from 'lucide-react';
import { QuestionType } from '@/types/question';

/**
 * Props cho Question LaTeX Display
 */
interface QuestionLaTeXDisplayProps {
  /** Question content với LaTeX */
  content: string;
  /** Question type để customize rendering */
  questionType?: QuestionType;
  /** Show question number/ID */
  questionNumber?: string;
  /** Additional CSS classes */
  className?: string;
  /** Show content preview mode */
  previewMode?: boolean;
  /** Max content length cho preview */
  maxPreviewLength?: number;
}

/**
 * Question LaTeX Display Component
 * Hiển thị question content với LaTeX rendering và type-specific formatting
 */
export function QuestionLaTeXDisplay({
  content,
  questionType,
  questionNumber,
  className = '',
  previewMode = false,
  maxPreviewLength = 200
}: QuestionLaTeXDisplayProps) {
  /**
   * Get question type styling
   */
  const getTypeStyles = (type?: QuestionType) => {
    const baseStyles = 'question-content';
    
    switch (type) {
      case QuestionType.MC:
        return `${baseStyles} multiple-choice`;
      case QuestionType.TF:
        return `${baseStyles} true-false`;
      case QuestionType.SA:
        return `${baseStyles} short-answer`;
      case QuestionType.ES:
        return `${baseStyles} essay`;
      case QuestionType.MA:
        return `${baseStyles} matching`;
      default:
        return baseStyles;
    }
  };

  /**
   * Get question type label
   */
  const getTypeLabel = (type?: QuestionType) => {
    const labels = {
      [QuestionType.MC]: 'Trắc nghiệm',
      [QuestionType.MULTIPLE_CHOICE]: 'Trắc nghiệm',
      [QuestionType.TF]: 'Đúng/Sai',
      [QuestionType.SA]: 'Trả lời ngắn',
      [QuestionType.ES]: 'Tự luận',
      [QuestionType.MA]: 'Ghép đôi'
    };
    return type ? labels[type] : undefined;
  };

  /**
   * Truncate content cho preview mode
   */
  const getTruncatedContent = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    
    // Tìm vị trí cắt hợp lý (không cắt giữa LaTeX expression)
    let cutIndex = maxLength;
    
    // Avoid cutting trong math expressions
    const beforeCut = text.substring(0, cutIndex);
    const dollarCount = (beforeCut.match(/\$/g) || []).length;
    
    // Nếu số $ lẻ, tìm $ tiếp theo hoặc cắt trước $
    if (dollarCount % 2 === 1) {
      const nextDollar = text.indexOf('$', cutIndex);
      const prevDollar = text.lastIndexOf('$', cutIndex - 1);
      
      if (nextDollar !== -1 && nextDollar - cutIndex < 50) {
        cutIndex = nextDollar + 1;
      } else if (prevDollar !== -1) {
        cutIndex = prevDollar;
      }
    }
    
    return text.substring(0, cutIndex) + '...';
  };

  // Handle empty content
  if (!content?.trim()) {
    return (
      <div className={`question-latex-empty ${className}`}>
        <div className="flex items-center gap-2 text-gray-400">
          <AlertCircle className="h-4 w-4" />
          <span className="italic">Không có nội dung câu hỏi</span>
        </div>
      </div>
    );
  }

  // Process content cho preview mode
  const displayContent = previewMode 
    ? getTruncatedContent(content, maxPreviewLength)
    : content;

  return (
    <div className={`question-latex-display ${className}`}>
      {/* Question header với type và number */}
      {(questionNumber || questionType) && (
        <div className="question-header flex items-center gap-2 mb-3">
          {questionNumber && (
            <div className="question-number flex items-center gap-1">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-600">
                Câu {questionNumber}
              </span>
            </div>
          )}
          
          {questionType && (
            <Badge variant="secondary" className="question-type-badge">
              {getTypeLabel(questionType)}
            </Badge>
          )}
        </div>
      )}

      {/* Question content với LaTeX rendering */}
      <div className={getTypeStyles(questionType)}>
        <LaTeXRenderer
          content={displayContent}
          className="question-latex-content"
          showErrorDetails={!previewMode}
          cleanContent={true}
        />
        
        {/* Preview truncation indicator */}
        {previewMode && content.length > maxPreviewLength && (
          <div className="preview-truncated mt-2">
            <span className="text-sm text-gray-500 italic">
              ... (nội dung đã được rút gọn)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Question Content Preview Component
 * Compact preview cho question lists
 */
export function QuestionContentPreview({
  content,
  questionType,
  maxLength = 100,
  className = ''
}: {
  content: string;
  questionType?: QuestionType;
  maxLength?: number;
  className?: string;
}) {
  return (
    <QuestionLaTeXDisplay
      content={content}
      questionType={questionType}
      previewMode={true}
      maxPreviewLength={maxLength}
      className={`question-preview ${className}`}
    />
  );
}

/**
 * Question Full Display Component
 * Full display cho question details
 */
export function QuestionFullDisplay({
  content,
  questionType,
  questionNumber,
  className = ''
}: {
  content: string;
  questionType?: QuestionType;
  questionNumber?: string;
  className?: string;
}) {
  return (
    <QuestionLaTeXDisplay
      content={content}
      questionType={questionType}
      questionNumber={questionNumber}
      previewMode={false}
      className={`question-full ${className}`}
    />
  );
}
