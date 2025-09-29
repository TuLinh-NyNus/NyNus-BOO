/**
 * Question Answers Display Component
 * Hiển thị đáp án của câu hỏi
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@/components/ui";
import {
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  List,
} from "lucide-react";

// Import types từ lib/types
import { 
  Question, 
  QuestionType,
  AnswerOption 
} from "@/types/question";

/**
 * Props for QuestionAnswersDisplay component
 */
interface QuestionAnswersDisplayProps {
  question: Question;
  showAnswers: boolean;
  onToggleAnswers: () => void;
  showSolution: boolean;
  onToggleSolution: () => void;
}

/**
 * Question Answers Display Component
 * Specialized component cho answers display
 */
export function QuestionAnswersDisplay({
  question,
  showAnswers,
  onToggleAnswers,
  showSolution,
  onToggleSolution,
}: QuestionAnswersDisplayProps) {
  /**
   * Check if question has answers
   */
  const hasAnswers = question.type === QuestionType.MC || question.type === QuestionType.TF;

  /**
   * Get answer letter
   */
  const getAnswerLetter = (index: number) => {
    return String.fromCharCode(65 + index);
  };

  /**
   * Get correct answers count
   */
  const getCorrectAnswersCount = () => {
    if (!hasAnswers || !question.answers) return 0;
    return (question.answers as AnswerOption[]).filter(answer => answer.isCorrect).length;
  };

  if (!hasAnswers) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Đáp án
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Câu hỏi này không có đáp án trắc nghiệm
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Answers Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Đáp án
              <Badge variant="secondary" className="ml-2">
                {getCorrectAnswersCount()} đúng
              </Badge>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleAnswers}
            >
              {showAnswers ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Ẩn đáp án
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Hiện đáp án
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {question.answers && (question.answers as AnswerOption[]).length > 0 ? (
            <div className="space-y-3">
              {(question.answers as AnswerOption[]).map((answer, index) => (
                <div
                  key={answer.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    showAnswers && answer.isCorrect
                      ? "bg-green-50 border-green-200"
                      : showAnswers && !answer.isCorrect
                      ? "bg-red-50 border-red-200"
                      : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-sm font-medium">
                      {getAnswerLetter(index)}.
                    </span>
                    
                    {showAnswers && (
                      <div className="flex-shrink-0">
                        {answer.isCorrect ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`${
                      showAnswers && answer.isCorrect 
                        ? "font-medium text-green-800" 
                        : showAnswers && !answer.isCorrect
                        ? "text-red-800"
                        : ""
                    }`}>
                      {answer.content}
                    </p>
                  </div>

                  {showAnswers && answer.isCorrect && (
                    <Badge variant="default" className="bg-green-600">
                      Đúng
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Chưa có đáp án nào được thiết lập
            </p>
          )}
        </CardContent>
      </Card>

      {/* Solution Section */}
      {question.explanation && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Lời giải
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleSolution}
              >
                {showSolution ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Ẩn lời giải
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Hiện lời giải
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showSolution ? (
              <div className="prose prose-sm max-w-none">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="whitespace-pre-wrap">{question.explanation}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Nhấn &quot;Hiện lời giải&quot; để xem lời giải chi tiết
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
