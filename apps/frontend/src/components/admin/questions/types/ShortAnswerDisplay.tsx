/**
 * Short Answer Display Component
 * Specialized rendering cho Short Answer questions
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from 'react';
import { Card, CardContent, Badge, Button, Input } from '@/components/ui';
import { CheckCircle, AlertCircle, Eye, EyeOff, FileText } from 'lucide-react';
import { LaTeXRenderer } from '@/components/ui/latex';

/**
 * Props cho Short Answer Display
 */
interface ShortAnswerDisplayProps {
  /** Correct answers (có thể có nhiều đáp án đúng) */
  correctAnswers?: string[];
  /** User's answer */
  userAnswer?: string;
  /** Show correct answers */
  showCorrect?: boolean;
  /** Interactive mode */
  interactive?: boolean;
  /** Answer input handler */
  onAnswerChange?: (answer: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Answer validation */
  caseSensitive?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Short Answer Display Component
 * Hiển thị câu hỏi trả lời ngắn với validation
 */
export function ShortAnswerDisplay({
  correctAnswers = [],
  userAnswer = '',
  showCorrect = false,
  interactive = false,
  onAnswerChange,
  placeholder = 'Nhập câu trả lời...',
  caseSensitive = false,
  className = ''
}: ShortAnswerDisplayProps) {
  const [showAnswers, setShowAnswers] = useState(showCorrect);
  const [localAnswer, setLocalAnswer] = useState(userAnswer);

  /**
   * Handle answer change
   */
  const handleAnswerChange = (value: string) => {
    setLocalAnswer(value);
    onAnswerChange?.(value);
  };

  /**
   * Check if answer is correct
   */
  const isAnswerCorrect = (answer: string) => {
    if (!answer.trim() || correctAnswers.length === 0) return false;
    
    const normalizedAnswer = caseSensitive ? answer.trim() : answer.trim().toLowerCase();
    
    return correctAnswers.some(correct => {
      const normalizedCorrect = caseSensitive ? correct.trim() : correct.trim().toLowerCase();
      return normalizedAnswer === normalizedCorrect;
    });
  };

  /**
   * Get input styling based on correctness
   */
  const getInputStyles = () => {
    if (!showAnswers || !localAnswer.trim()) {
      return '';
    }
    
    return isAnswerCorrect(localAnswer) 
      ? 'border-green-500 bg-green-50' 
      : 'border-red-500 bg-red-50';
  };

  /**
   * Get validation icon
   */
  const getValidationIcon = () => {
    if (!showAnswers || !localAnswer.trim()) return null;
    
    return isAnswerCorrect(localAnswer) ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <AlertCircle className="h-5 w-5 text-red-600" />
    );
  };

  const currentAnswer = localAnswer || userAnswer;

  return (
    <div className={`short-answer-display space-y-4 ${className}`}>
      {/* Header với toggle answers */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
          Trả lời ngắn
        </Badge>
        
        {!interactive && correctAnswers.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnswers(!showAnswers)}
            className="flex items-center gap-2"
          >
            {showAnswers ? (
              <>
                <EyeOff className="h-4 w-4" />
                Ẩn đáp án
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Hiện đáp án
              </>
            )}
          </Button>
        )}
      </div>

      {/* Answer input */}
      <div className="space-y-2">
        <div className="relative">
          <Input
            type="text"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={placeholder}
            disabled={!interactive}
            className={`pr-10 ${getInputStyles()}`}
          />
          
          {/* Validation icon */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getValidationIcon()}
          </div>
        </div>

        {/* Answer guidelines */}
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>
              {caseSensitive ? 'Phân biệt chữ hoa/thường' : 'Không phân biệt chữ hoa/thường'}
            </span>
          </div>
        </div>
      </div>

      {/* Answer feedback */}
      {showAnswers && currentAnswer.trim() && (
        <Card className={isAnswerCorrect(currentAnswer) ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              {getValidationIcon()}
              <div className="text-sm">
                {isAnswerCorrect(currentAnswer) ? (
                  <div className="text-green-800">
                    <div className="font-medium">Chính xác!</div>
                    <div>Câu trả lời của bạn đúng.</div>
                  </div>
                ) : (
                  <div className="text-red-800">
                    <div className="font-medium">Chưa chính xác</div>
                    <div>Hãy thử lại với câu trả lời khác.</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Correct answers display */}
      {showAnswers && correctAnswers.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="text-sm">
              <div className="font-medium text-blue-800 mb-2">
                Đáp án đúng {correctAnswers.length > 1 ? '(có thể có nhiều cách trả lời)' : ''}:
              </div>
              <div className="space-y-1">
                {correctAnswers.map((answer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <LaTeXRenderer
                      content={answer}
                      className="answer-content text-blue-800"
                      showErrorDetails={false}
                      cleanContent={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive mode instructions */}
      {interactive && !showAnswers && (
        <div className="text-sm text-muted-foreground text-center py-2">
          Nhập câu trả lời vào ô bên trên
        </div>
      )}

      {/* Answer statistics (if available) */}
      {showAnswers && correctAnswers.length > 1 && (
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>Câu hỏi này có {correctAnswers.length} đáp án được chấp nhận</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Short Answer Preview Component
 * Compact preview cho lists
 */
export function ShortAnswerPreview({
  correctAnswers = [],
  className = ''
}: {
  correctAnswers?: string[];
  className?: string;
}) {
  return (
    <div className={`short-answer-preview ${className}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="outline" className="text-xs">SA</Badge>
        <span>Trả lời ngắn</span>
        {correctAnswers.length > 0 && (
          <>
            <span>•</span>
            <span>{correctAnswers.length} đáp án</span>
          </>
        )}
      </div>
    </div>
  );
}
