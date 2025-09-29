/**
 * Question Display Component
 * Question content rendering với rich text support và answer input handling
 * Supports all question types (MC, TF, SA, ES) với proper validation
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-22
 */

"use client";

import React, { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@/components/ui";

// Icons
import {
  Flag,
  FlagOff,
  AlertCircle,
  CheckCircle,
  FileText,
  MessageSquare,
} from "lucide-react";

// LaTeX components
import { LaTeXContent } from "@/components/latex";

// Answer Input Components
import { AnswerInputFactory } from "./answer-inputs";

// Types
import { Question, QuestionType } from "@/types/question";


// Custom answer interface for exam taking
interface ExamAnswerInput {
  questionId: string;
  answerText?: string;
  selectedOptions?: string[];
  isFlagged?: boolean;
  timeSpent?: number;
  isAnswered?: boolean;
}

// Store integration
import { useExamAttemptStore } from "@/lib/stores/exam-attempt.store";

// ===== TYPES =====

export interface QuestionDisplayProps {
  /** Question data to display */
  question: Question;
  
  /** Question number in exam */
  questionNumber: number;
  
  /** Current answer for this question */
  currentAnswer?: ExamAnswerInput;
  
  /** Show question metadata */
  showMetadata?: boolean;
  
  /** Allow flagging questions */
  allowFlagging?: boolean;
  
  /** Read-only mode (for review) */
  readOnly?: boolean;
  
  /** Show validation errors */
  showValidation?: boolean;
  
  /** Event handlers */
  onAnswerChange?: (answer: ExamAnswerInput) => void;
  onFlag?: (questionId: string, flagged: boolean) => void;
  onValidationError?: (error: string) => void;
  
  /** Additional CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const QUESTION_TYPE_CONFIG = {
  [QuestionType.MC]: {
    label: 'Trắc nghiệm',
    icon: CheckCircle,
    color: 'bg-blue-100 text-blue-800',
  },
  [QuestionType.MULTIPLE_CHOICE]: {
    label: 'Trắc nghiệm',
    icon: CheckCircle,
    color: 'bg-blue-100 text-blue-800',
  },
  [QuestionType.TF]: {
    label: 'Đúng/Sai',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
  },
  [QuestionType.SA]: {
    label: 'Trả lời ngắn',
    icon: FileText,
    color: 'bg-orange-100 text-orange-800',
  },
  [QuestionType.ES]: {
    label: 'Tự luận',
    icon: MessageSquare,
    color: 'bg-purple-100 text-purple-800',
  },
  [QuestionType.MA]: {
    label: 'Ghép đôi',
    icon: FileText,
    color: 'bg-indigo-100 text-indigo-800',
  },
} as const;

// ===== UTILITY FUNCTIONS =====

function validateAnswer(question: Question, answer: ExamAnswerInput): string | null {
  switch (question.type) {
    case QuestionType.MC:
      if (!answer.selectedOptions || answer.selectedOptions.length === 0) {
        return 'Vui lòng chọn ít nhất một đáp án';
      }
      break;

    case QuestionType.TF:
      if (!answer.selectedOptions || answer.selectedOptions.length === 0) {
        return 'Vui lòng chọn Đúng hoặc Sai';
      }
      break;

    case QuestionType.SA:
      if (!answer.answerText || answer.answerText.trim().length === 0) {
        return 'Vui lòng nhập câu trả lời';
      }
      if (answer.answerText.trim().length > 500) {
        return 'Câu trả lời không được quá 500 ký tự';
      }
      break;

    case QuestionType.ES:
      if (!answer.answerText || answer.answerText.trim().length === 0) {
        return 'Vui lòng nhập bài làm';
      }
      if (answer.answerText.trim().length > 5000) {
        return 'Bài làm không được quá 5000 ký tự';
      }
      break;

    default:
      return 'Loại câu hỏi không được hỗ trợ';
  }

  return null;
}

function createEmptyAnswer(questionId: string): ExamAnswerInput {
  return {
    questionId,
    answerText: '',
    selectedOptions: [],
    isFlagged: false,
    timeSpent: 0,
    isAnswered: false,
  };
}

// ===== MAIN COMPONENT =====

export function QuestionDisplay({
  question,
  questionNumber,
  currentAnswer,
  showMetadata = true,
  allowFlagging = true,
  readOnly = false,
  showValidation = true,
  onAnswerChange,
  onFlag,
  onValidationError,
  className,
}: QuestionDisplayProps) {
  
  // Local state
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Store integration
  const updateActivity = useExamAttemptStore(state => state.updateActivity);
  
  // Current answer with fallback
  const answer = currentAnswer || createEmptyAnswer(question.id);
  
  // Question type config
  const typeConfig = QUESTION_TYPE_CONFIG[question.type];
  const TypeIcon = typeConfig.icon;
  
  // Validation
  const validationResult = useMemo(() => {
    if (!showValidation || readOnly) return null;
    return validateAnswer(question, answer);
  }, [question, answer, showValidation, readOnly]);
  
  // Update validation error
  React.useEffect(() => {
    setValidationError(validationResult);
    if (validationResult) {
      onValidationError?.(validationResult);
    }
  }, [validationResult, onValidationError]);
  
  // Handlers
  const handleAnswerChange = useCallback((newAnswer: Partial<ExamAnswerInput>) => {
    const updatedAnswer: ExamAnswerInput = {
      ...answer,
      ...newAnswer,
      isAnswered: true,
    };

    onAnswerChange?.(updatedAnswer);
    updateActivity();
  }, [answer, onAnswerChange, updateActivity]);
  
  const _handleTextChange = useCallback((text: string) => {
    handleAnswerChange({ answerText: text });
  }, [handleAnswerChange]);

  const _handleOptionSelect = useCallback((optionId: string, selected: boolean) => {
    const currentOptions = answer.selectedOptions || [];
    
    let newOptions: string[];
    if (question.type === QuestionType.MC) {
      // Multiple selection allowed
      if (selected) {
        newOptions = [...currentOptions, optionId];
      } else {
        newOptions = currentOptions.filter(id => id !== optionId);
      }
    } else {
      // Single selection (TF)
      newOptions = selected ? [optionId] : [];
    }
    
    handleAnswerChange({ selectedOptions: newOptions });
  }, [answer.selectedOptions, question.type, handleAnswerChange]);
  
  const handleFlag = useCallback(() => {
    const newFlagged = !answer.isFlagged;
    handleAnswerChange({ isFlagged: newFlagged });
    onFlag?.(question.id, newFlagged);
  }, [answer.isFlagged, question.id, handleAnswerChange, onFlag]);
  
  // Render answer input based on question type
  const renderAnswerInput = () => {
    if (readOnly) {
      return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Câu trả lời đã chọn:</p>
          {question.type === QuestionType.MC || question.type === QuestionType.TF ? (
            <div className="space-y-2">
              {answer.selectedOptions?.map(optionId => {
                const option = question.answers?.find(opt =>
                  'id' in opt ? opt.id === optionId : false
                );
                return option && 'content' in option ? (
                  <div key={optionId} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{option.content}</span>
                  </div>
                ) : null;
              })}
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{answer.answerText}</div>
          )}
        </div>
      );
    }

    // Use new specialized answer input components
    return (
      <AnswerInputFactory
        question={question}
        currentAnswer={answer}
        onAnswerChange={handleAnswerChange}
        readOnly={readOnly}
        showValidation={showValidation}
        autoSaveStatus="idle"
        className="mt-4"
      />
    );

  };
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <Badge variant="outline" className="text-sm">
                Câu {questionNumber}
              </Badge>
              
              {showMetadata && (
                <Badge variant="outline" className={cn("text-xs", typeConfig.color)}>
                  <TypeIcon className="w-3 h-3 mr-1" />
                  {typeConfig.label}
                </Badge>
              )}
              
              {answer.isFlagged && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  <Flag className="w-3 h-3 mr-1" />
                  Đã đánh dấu
                </Badge>
              )}
            </div>
            
            <CardTitle className="text-lg leading-relaxed">
              <LaTeXContent content={question.content} />
            </CardTitle>
          </div>
          
          {allowFlagging && !readOnly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFlag}
              className={cn(
                "ml-4",
                answer.isFlagged ? "text-orange-600" : "text-gray-400"
              )}
              title={answer.isFlagged ? "Bỏ đánh dấu" : "Đánh dấu để xem lại"}
            >
              {answer.isFlagged ? <Flag className="w-4 h-4" /> : <FlagOff className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Question Image/Media - Remove for now as imageUrl not in interface */}
        {/* {question.imageUrl && (
          <div className="mb-4">
            <img
              src={question.imageUrl}
              alt="Hình ảnh câu hỏi"
              className="max-w-full h-auto rounded-lg border"
            />
          </div>
        )} */}
        
        {/* Answer Input */}
        {renderAnswerInput()}
        
        {/* Validation Error */}
        {validationError && showValidation && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{validationError}</span>
            </div>
          </div>
        )}
        
        {/* Question Metadata */}
        {showMetadata && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Điểm: {question.points}</span>
              {question.difficulty && (
                <span>Độ khó: {question.difficulty}</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
