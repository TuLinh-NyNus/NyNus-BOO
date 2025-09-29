/**
 * True/False Display Component
 * Specialized rendering cho True/False questions
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from 'react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { CheckCircle, Eye, EyeOff, AlertCircle, Circle } from 'lucide-react';
import { LaTeXRenderer } from '@/components/ui/latex';

import { AnswerOption } from '@/types/question';

/**
 * Props cho True/False Display
 */
interface TrueFalseDisplayProps {
  /** Answer options (4+ options) */
  options: AnswerOption[];
  /** Selected answer IDs */
  selectedAnswers?: string[];
  /** Show correct answers */
  showCorrect?: boolean;
  /** Interactive mode */
  interactive?: boolean;
  /** Answer selection handler */
  onAnswerSelect?: (answerId: string) => void;
  /** Additional explanation */
  explanation?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * True/False Display Component
 * Hiển thị câu hỏi đúng/sai với multiple options (4+)
 */
export function TrueFalseDisplay({
  options,
  selectedAnswers = [],
  showCorrect = false,
  interactive = false,
  onAnswerSelect,
  explanation,
  className = ''
}: TrueFalseDisplayProps) {
  const [showAnswers, setShowAnswers] = useState(showCorrect);

  /**
   * Handle answer selection
   */
  const handleAnswerSelect = (answerId: string) => {
    if (!interactive || !onAnswerSelect) return;
    onAnswerSelect(answerId);
  };

  /**
   * Get option styling
   */
  const getOptionStyles = (option: AnswerOption, isSelected: boolean) => {
    let baseStyles = 'border rounded-lg p-3 transition-all duration-200 cursor-pointer';
    
    if (!interactive) {
      baseStyles += ' cursor-default';
    }

    if (showAnswers) {
      if (option.isCorrect) {
        baseStyles += ' border-green-500 bg-green-50 text-green-800';
      } else if (isSelected) {
        baseStyles += ' border-red-500 bg-red-50 text-red-800';
      } else {
        baseStyles += ' border-gray-200 bg-gray-50';
      }
    } else {
      if (isSelected) {
        baseStyles += ' border-blue-500 bg-blue-50 text-blue-800';
      } else {
        baseStyles += ' border-gray-200 hover:border-gray-300 hover:bg-gray-50';
      }
    }

    return baseStyles;
  };

  /**
   * Get option icon
   */
  const getOptionIcon = (option: AnswerOption, isSelected: boolean) => {
    if (showAnswers) {
      if (option.isCorrect) {
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      } else if (isSelected) {
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      }
    }
    
    return isSelected ? 
      <CheckCircle className="h-5 w-5 text-blue-600" /> : 
      <Circle className="h-5 w-5 text-gray-400" />;
  };

  /**
   * Get option label (A, B, C, D...)
   */
  const getOptionLabel = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, D...
  };

  return (
    <div className={`true-false-display space-y-3 ${className}`}>
      {/* Header với toggle answers */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            Đúng/Sai
          </Badge>
          <span className="text-sm text-muted-foreground">
            {options.length} lựa chọn
          </span>
        </div>
        
        {!interactive && (
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

      {/* Options list */}
      <div className="space-y-2">
        {options.map((option, index) => {
          const isSelected = selectedAnswers.includes(option.id);
          const optionLabel = getOptionLabel(index);
          
          return (
            <div
              key={option.id}
              className={getOptionStyles(option, isSelected)}
              onClick={() => handleAnswerSelect(option.id)}
            >
              <div className="flex items-start gap-3">
                {/* Option icon */}
                <div className="flex-shrink-0 mt-1">
                  {getOptionIcon(option, isSelected)}
                </div>

                {/* Option label */}
                <div className="flex-shrink-0 mt-1">
                  <Badge 
                    variant="outline" 
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      showAnswers && option.isCorrect 
                        ? 'bg-green-100 border-green-300 text-green-700'
                        : isSelected 
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    {optionLabel}
                  </Badge>
                </div>

                {/* Option content */}
                <div className="flex-1 min-w-0">
                  <LaTeXRenderer
                    content={option.content}
                    className="option-content"
                    showErrorDetails={false}
                    cleanContent={true}
                  />
                </div>

                {/* Correct indicator */}
                {showAnswers && option.isCorrect && (
                  <div className="flex-shrink-0">
                    <Badge className="bg-green-500 text-white">
                      Đúng
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Answer summary */}
      {showAnswers && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="text-sm">
              <div className="font-medium text-blue-800 mb-1">Đáp án đúng:</div>
              <div className="flex flex-wrap gap-1">
                {options
                  .filter(option => option.isCorrect)
                  .map((option) => {
                    const optionIndex = options.findIndex(opt => opt.id === option.id);
                    return (
                      <Badge key={option.id} className="bg-green-500 text-white">
                        {getOptionLabel(optionIndex)}
                      </Badge>
                    );
                  })}
                {options.filter(option => option.isCorrect).length === 0 && (
                  <span className="text-gray-600 italic">Không có đáp án đúng</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Explanation */}
      {explanation && showAnswers && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-3">
            <div className="text-sm">
              <div className="font-medium text-yellow-800 mb-2">Giải thích:</div>
              <LaTeXRenderer
                content={explanation}
                className="explanation-content text-yellow-800"
                showErrorDetails={false}
                cleanContent={true}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive mode instructions */}
      {interactive && !showAnswers && (
        <div className="text-sm text-muted-foreground text-center py-2">
          Nhấn vào lựa chọn để chọn đáp án
        </div>
      )}
    </div>
  );
}

/**
 * True/False Preview Component
 * Compact preview cho lists
 */
export function TrueFalsePreview({
  options,
  className = ''
}: {
  options: AnswerOption[];
  className?: string;
}) {
  const correctCount = options.filter(opt => opt.isCorrect).length;
  
  return (
    <div className={`true-false-preview ${className}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="outline" className="text-xs">TF</Badge>
        <span>{options.length} lựa chọn</span>
        <span>•</span>
        <span>{correctCount} đáp án đúng</span>
      </div>
    </div>
  );
}
