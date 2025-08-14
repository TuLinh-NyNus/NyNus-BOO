/**
 * True/False Display Component
 * Specialized rendering cho True/False questions
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from 'react';
import { Card, CardContent, Badge, Button, Switch } from '@/components/ui';
import { CheckCircle, XCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { LaTeXRenderer } from '@/components/ui/latex';

/**
 * Props cho True/False Display
 */
interface TrueFalseDisplayProps {
  /** Correct answer (true/false) */
  correctAnswer?: boolean;
  /** Selected answer */
  selectedAnswer?: boolean;
  /** Show correct answer */
  showCorrect?: boolean;
  /** Interactive mode */
  interactive?: boolean;
  /** Answer selection handler */
  onAnswerSelect?: (answer: boolean) => void;
  /** Additional explanation */
  explanation?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * True/False Display Component
 * Hiển thị câu hỏi đúng/sai với interactive UI
 */
export function TrueFalseDisplay({
  correctAnswer,
  selectedAnswer,
  showCorrect = false,
  interactive = false,
  onAnswerSelect,
  explanation,
  className = ''
}: TrueFalseDisplayProps) {
  const [showAnswers, setShowAnswers] = useState(showCorrect);
  const [localSelected, setLocalSelected] = useState<boolean | undefined>(selectedAnswer);

  /**
   * Handle answer selection
   */
  const handleAnswerSelect = (answer: boolean) => {
    if (!interactive) return;
    
    setLocalSelected(answer);
    onAnswerSelect?.(answer);
  };

  /**
   * Get option styling
   */
  const getOptionStyles = (optionValue: boolean, isSelected: boolean) => {
    let baseStyles = 'border-2 rounded-lg p-4 transition-all duration-200 cursor-pointer flex items-center justify-center gap-3';
    
    if (!interactive) {
      baseStyles += ' cursor-default';
    }

    if (showAnswers) {
      if (correctAnswer === optionValue) {
        baseStyles += ' border-green-500 bg-green-50 text-green-800';
      } else if (isSelected && correctAnswer !== optionValue) {
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
  const getOptionIcon = (optionValue: boolean, isSelected: boolean) => {
    if (showAnswers) {
      if (correctAnswer === optionValue) {
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      } else if (isSelected && correctAnswer !== optionValue) {
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      }
    }
    
    if (optionValue) {
      return isSelected ? 
        <CheckCircle className="h-6 w-6 text-blue-600" /> : 
        <CheckCircle className="h-6 w-6 text-gray-400" />;
    } else {
      return isSelected ? 
        <XCircle className="h-6 w-6 text-blue-600" /> : 
        <XCircle className="h-6 w-6 text-gray-400" />;
    }
  };

  const currentSelected = localSelected ?? selectedAnswer;

  return (
    <div className={`true-false-display space-y-4 ${className}`}>
      {/* Header với toggle answers */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          Đúng/Sai
        </Badge>
        
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

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* True option */}
        <div
          className={getOptionStyles(true, currentSelected === true)}
          onClick={() => handleAnswerSelect(true)}
        >
          {getOptionIcon(true, currentSelected === true)}
          <div className="text-center">
            <div className="font-bold text-lg">ĐÚNG</div>
            <div className="text-sm opacity-75">True</div>
          </div>
        </div>

        {/* False option */}
        <div
          className={getOptionStyles(false, currentSelected === false)}
          onClick={() => handleAnswerSelect(false)}
        >
          {getOptionIcon(false, currentSelected === false)}
          <div className="text-center">
            <div className="font-bold text-lg">SAI</div>
            <div className="text-sm opacity-75">False</div>
          </div>
        </div>
      </div>

      {/* Switch alternative (for compact display) */}
      {interactive && (
        <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
          <span className={`font-medium ${currentSelected === false ? 'text-blue-600' : 'text-gray-500'}`}>
            SAI
          </span>
          <Switch
            checked={currentSelected === true}
            onCheckedChange={(checked) => handleAnswerSelect(checked)}
            className="data-[state=checked]:bg-green-500"
          />
          <span className={`font-medium ${currentSelected === true ? 'text-blue-600' : 'text-gray-500'}`}>
            ĐÚNG
          </span>
        </div>
      )}

      {/* Answer summary */}
      {showAnswers && correctAnswer !== undefined && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="text-sm">
              <div className="font-medium text-blue-800 mb-1">Đáp án đúng:</div>
              <div className="flex items-center gap-2">
                {correctAnswer ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <Badge className="bg-green-500 text-white">ĐÚNG</Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <Badge className="bg-red-500 text-white">SAI</Badge>
                  </>
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
          Chọn ĐÚNG hoặc SAI
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
  correctAnswer,
  className = ''
}: {
  correctAnswer?: boolean;
  className?: string;
}) {
  return (
    <div className={`true-false-preview ${className}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="outline" className="text-xs">TF</Badge>
        <span>Đúng/Sai</span>
        {correctAnswer !== undefined && (
          <>
            <span>•</span>
            <div className="flex items-center gap-1">
              {correctAnswer ? (
                <>
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">Đúng</span>
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">Sai</span>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
