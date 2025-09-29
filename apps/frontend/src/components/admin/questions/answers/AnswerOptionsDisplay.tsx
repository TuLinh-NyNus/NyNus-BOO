/**
 * Answer Options Display Component
 * Universal component cho hiển thị answer options của tất cả question types
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from 'react';
import { Question, QuestionType, AnswerOption, MatchingPair } from '@/types/question';
import { 
  MultipleChoiceDisplay, 
  TrueFalseDisplay, 
  ShortAnswerDisplay, 
  EssayDisplay, 
  MatchingDisplay 
} from '../types';

/**
 * Props cho Answer Options Display
 */
interface AnswerOptionsDisplayProps {
  /** Question data */
  question: Question;
  /** Selected answers */
  selectedAnswers?: string[] | boolean | string | MatchingPair[];
  /** Show correct answers */
  showCorrect?: boolean;
  /** Interactive mode */
  interactive?: boolean;
  /** Answer selection handlers */
  onAnswerSelect?: (answer: string[] | boolean | string | MatchingPair[]) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Answer Options Display Component
 * Renders appropriate answer interface based on question type
 */
export function AnswerOptionsDisplay({
  question,
  selectedAnswers,
  showCorrect = false,
  interactive = false,
  onAnswerSelect,
  className = ''
}: AnswerOptionsDisplayProps) {
  /**
   * Parse correct answer based on question type
   */
  const parseCorrectAnswer = () => {
    if (!question.correctAnswer) return undefined;

    switch (question.correctAnswer.kind) {
      case 'MC':
        return question.correctAnswer.values;
      case 'TF':
        return question.correctAnswer.values[0] === 'true';
      case 'SA':
        return question.correctAnswer.values;
      case 'ES':
        return question.correctAnswer.values[0]; // Sample answer
      case 'MA':
        return question.correctAnswer.pairs;
      default:
        return undefined;
    }
  };

  const correctAnswer = parseCorrectAnswer();

  // Render based on question type
  switch (question.type) {
    case QuestionType.MC:
      return (
        <MultipleChoiceDisplay
          options={question.answers as AnswerOption[] || []}
          selectedAnswers={selectedAnswers as string[]}
          showCorrect={showCorrect}
          interactive={interactive}
          onAnswerSelect={onAnswerSelect}
          className={className}
        />
      );

    case QuestionType.TF:
      return (
        <TrueFalseDisplay
          options={question.answers as AnswerOption[] || []}
          selectedAnswers={selectedAnswers as string[]}
          showCorrect={showCorrect}
          interactive={interactive}
          onAnswerSelect={(answerId: string) => {
            if (onAnswerSelect) {
              const currentSelected = (selectedAnswers as string[]) || [];
              const isSelected = currentSelected.includes(answerId);
              if (isSelected) {
                onAnswerSelect(currentSelected.filter((id: string) => id !== answerId));
              } else {
                onAnswerSelect([...currentSelected, answerId]);
              }
            }
          }}
          explanation={question.explanation}
          className={className}
        />
      );

    case QuestionType.SA:
      return (
        <ShortAnswerDisplay
          correctAnswers={correctAnswer as string[] || []}
          userAnswer={selectedAnswers as string}
          showCorrect={showCorrect}
          interactive={interactive}
          onAnswerChange={onAnswerSelect}
          className={className}
        />
      );

    case QuestionType.ES:
      return (
        <EssayDisplay
          sampleAnswer={correctAnswer as string}
          userAnswer={selectedAnswers as string}
          showSample={showCorrect}
          interactive={interactive}
          onAnswerChange={onAnswerSelect}
          wordLimit={question.points ? question.points * 50 : undefined} // Estimate based on points
          className={className}
        />
      );

    case QuestionType.MA:
      return (
        <MatchingDisplay
          correctPairs={correctAnswer as MatchingPair[] || []}
          selectedPairs={selectedAnswers as MatchingPair[]}
          showCorrect={showCorrect}
          interactive={interactive}
          onPairSelect={(left, right) => {
            if (onAnswerSelect) {
              const newPair = { left, right };
              const currentPairs = (selectedAnswers as MatchingPair[]) || [];
              const updatedPairs = currentPairs.filter((p: MatchingPair) => p.left !== left);
              updatedPairs.push(newPair);
              onAnswerSelect(updatedPairs);
            }
          }}
          className={className}
        />
      );

    default:
      return (
        <div className={`answer-options-unsupported ${className}`}>
          <div className="text-center text-muted-foreground py-8">
            <p>Question type &quot;{question.type}&quot; is not supported yet.</p>
          </div>
        </div>
      );
  }
}

/**
 * Answer Preview Component
 * Compact preview cho answer options trong lists
 */
export function AnswerPreview({
  question,
  className = ''
}: {
  question: Question;
  className?: string;
}) {
  const getAnswerSummary = () => {
    switch (question.type) {
      case QuestionType.MC:
        const mcOptions = question.answers as AnswerOption[] || [];
        const correctCount = mcOptions.filter(opt => opt.isCorrect).length;
        return `${mcOptions.length} lựa chọn, ${correctCount} đúng`;

      case QuestionType.TF:
        const tfCorrect = question.correctAnswer?.kind === 'TF' 
          ? question.correctAnswer.values[0] === 'true' ? 'Đúng' : 'Sai'
          : 'Chưa xác định';
        return `Đáp án: ${tfCorrect}`;

      case QuestionType.SA:
        const saAnswers = question.correctAnswer?.kind === 'SA' 
          ? question.correctAnswer.values.length 
          : 0;
        return `${saAnswers} đáp án được chấp nhận`;

      case QuestionType.ES:
        return question.correctAnswer?.kind === 'ES' && question.correctAnswer.values[0]
          ? 'Có câu trả lời mẫu'
          : 'Chấm điểm thủ công';

      case QuestionType.MA:
        const maPairs = question.correctAnswer?.kind === 'MA' 
          ? question.correctAnswer.pairs.length 
          : 0;
        return `${maPairs} cặp ghép`;

      default:
        return 'Không xác định';
    }
  };

  return (
    <div className={`answer-preview text-sm text-muted-foreground ${className}`}>
      {getAnswerSummary()}
    </div>
  );
}

/**
 * Answer Statistics Component
 * Hiển thị thống kê về answers (nếu có data)
 */
export function AnswerStatistics({
  answerStats,
  className = ''
}: {
  answerStats?: Record<string, number>;
  className?: string;
}) {
  if (!answerStats || Object.keys(answerStats).length === 0) {
    return null;
  }

  const total = Object.values(answerStats).reduce((sum, count) => sum + count, 0);

  return (
    <div className={`answer-statistics ${className}`}>
      <div className="text-sm font-medium text-muted-foreground mb-2">
        Thống kê lựa chọn ({total} lượt trả lời):
      </div>
      <div className="space-y-1">
        {Object.entries(answerStats).map(([answer, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={answer} className="flex items-center gap-2 text-sm">
              <div className="w-16 text-right">{answer}:</div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="w-12 text-right text-muted-foreground">
                {percentage.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
