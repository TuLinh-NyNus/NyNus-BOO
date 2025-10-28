/**
 * Question Preview Content Component
 * Hiển thị nội dung câu hỏi trong preview modal
 * Matches exact layout của public question detail page
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-26
 */

'use client';

import React from 'react';
import { Question, QuestionType } from '@/types/question';
import { Badge } from '@/components/ui';
import {
  Eye,
  Star,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface QuestionPreviewContentProps {
  /** Question data */
  question: Partial<Question>;
  /** Whether to show solution */
  showSolution?: boolean;
  /** Device type for responsive adjustments */
  deviceType?: 'desktop' | 'tablet' | 'mobile';
  /** Optional custom class */
  className?: string;
}

// ===== HELPER FUNCTIONS =====

/**
 * Get difficulty badge styling
 */
function getDifficultyBadgeClass(difficulty?: string): string {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
    case 'dễ':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'medium':
    case 'trung bình':
    case 'tb':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'hard':
    case 'khó':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
}

/**
 * Get difficulty label
 */
function getDifficultyLabel(difficulty?: string): string {
  switch (difficulty?.toUpperCase()) {
    case 'EASY':
      return 'Dễ';
    case 'MEDIUM':
      return 'Trung bình';
    case 'HARD':
      return 'Khó';
    default:
      return difficulty || 'Chưa xác định';
  }
}

/**
 * Get question type label
 */
function getQuestionTypeLabel(type?: string): string {
  switch (type?.toUpperCase()) {
    case 'MC':
    case 'MULTIPLE_CHOICE':
      return 'Trắc nghiệm';
    case 'TF':
    case 'TRUE_FALSE':
      return 'Đúng/Sai';
    case 'SA':
    case 'SHORT_ANSWER':
      return 'Tự luận ngắn';
    case 'ES':
    case 'ESSAY':
      return 'Tự luận';
    case 'MA':
    case 'MATCHING':
      return 'Ghép đôi';
    default:
      return type || 'Chưa xác định';
  }
}

// ===== MAIN COMPONENT =====

/**
 * Question Preview Content Component
 * Hiển thị nội dung câu hỏi matching với public layout
 */
export function QuestionPreviewContent({
  question,
  showSolution = true,
  deviceType = 'desktop',
  className,
}: QuestionPreviewContentProps) {
  // ===== COMPUTED =====
  const isMobileView = deviceType === 'mobile';
  const hasAnswers = question.answers && question.answers.length > 0;
  const isMultipleChoice = question.type === QuestionType.MC || question.type === QuestionType.MULTIPLE_CHOICE;

  // ===== RENDER =====
  return (
    <div className={cn('question-preview-content', className)}>
      {/* Question Meta Section */}
      <section className="question-meta p-6 border-b dark:border-border">
        {/* Meta Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Category Badge */}
          {'category' in question && (question as Question & { category?: string }).category && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {String((question as Question & { category?: string }).category)}
            </Badge>
          )}

          {/* Difficulty Badge */}
          {question.difficulty && (
            <Badge
              variant="outline"
              className={cn(
                'border-0',
                getDifficultyBadgeClass(question.difficulty)
              )}
            >
              {getDifficultyLabel(question.difficulty)}
            </Badge>
          )}

          {/* Type Badge */}
          {question.type && (
            <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
              {getQuestionTypeLabel(question.type)}
            </Badge>
          )}
        </div>

        {/* Question Title/Code */}
        {question.questionCodeId && (
          <h2 className={cn(
            'font-bold text-foreground mb-2',
            isMobileView ? 'text-lg' : 'text-2xl'
          )}>
            Câu hỏi {question.questionCodeId}
          </h2>
        )}

        {/* Question Stats - Mock data for preview */}
        <div className={cn(
          'flex items-center gap-4 text-sm text-muted-foreground',
          isMobileView && 'flex-wrap gap-2'
        )}>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>0 lượt xem</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>0 đánh giá</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Vừa tạo</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="main-content p-6">
        {/* Question Content */}
        <div className="question-content bg-card dark:bg-card rounded-lg border dark:border-border p-6 mb-6">
          {question.content ? (
            <div className={cn(
              'prose dark:prose-invert max-w-none',
              isMobileView ? 'prose-sm' : 'prose-lg'
            )}>
              {/* Simple text rendering - LaTeX rendering sẽ được add sau */}
              <div className="whitespace-pre-wrap break-words">
                {question.content}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-sm">Chưa có nội dung câu hỏi</p>
            </div>
          )}
        </div>

        {/* Answers Section (for multiple choice) */}
        {hasAnswers && isMultipleChoice && (
          <div className="answers-section bg-card dark:bg-card rounded-lg border dark:border-border p-6 mb-6">
            <h3 className={cn(
              'font-semibold text-foreground mb-4',
              isMobileView ? 'text-base' : 'text-xl'
            )}>
              Các đáp án:
            </h3>
            <div className="space-y-3">
              {question.answers!.map((answer, index) => (
                <div
                  key={('id' in answer ? answer.id : undefined) || index}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-colors',
                    ('isCorrect' in answer ? answer.isCorrect : false)
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30'
                      : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/30'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Answer Letter */}
                    <span className={cn(
                      'font-bold flex-shrink-0',
                      ('isCorrect' in answer ? answer.isCorrect : false)
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-gray-700 dark:text-gray-400'
                    )}>
                      {String.fromCharCode(65 + index)}.
                    </span>

                    {/* Answer Content */}
                    <div className="flex-1 min-w-0">
                      <div className="whitespace-pre-wrap break-words">
                        {'content' in answer ? answer.content : `${answer.left} - ${answer.right}`}
                      </div>
                    </div>

                    {/* Correct Indicator */}
                    {('isCorrect' in answer ? answer.isCorrect : false) && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">
                          Đúng
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Answer Explanation (if available) */}
                  {('explanation' in answer ? answer.explanation : null) && showSolution && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Giải thích:</span> {'explanation' in answer ? answer.explanation : ''}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Solution Section */}
        {showSolution && question.solution && (
          <div className="solution-section bg-card dark:bg-card rounded-lg border dark:border-border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={cn(
                'font-semibold text-foreground',
                isMobileView ? 'text-base' : 'text-xl'
              )}>
                Lời giải chi tiết
              </h3>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                Giải pháp
              </Badge>
            </div>
            <div className={cn(
              'prose dark:prose-invert max-w-none',
              isMobileView ? 'prose-sm' : 'prose-lg'
            )}>
              <div className="whitespace-pre-wrap break-words text-foreground">
                {question.solution}
              </div>
            </div>
          </div>
        )}

        {/* Tags Section */}
        {question.tag && question.tag.length > 0 && (
          <div className="tags-section">
            <h4 className="text-sm font-medium text-foreground mb-2">Từ khóa:</h4>
            <div className="flex flex-wrap gap-2">
              {question.tag.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-muted"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!question.content && !hasAnswers && !question.solution && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Chưa có nội dung để hiển thị</p>
              <p className="text-sm">
                Hãy điền thông tin câu hỏi để xem preview
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// ===== EXPORTS =====
export default QuestionPreviewContent;

