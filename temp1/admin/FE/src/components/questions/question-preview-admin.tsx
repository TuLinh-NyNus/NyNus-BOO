/**
 * Question Preview Admin Component
 * Enhanced preview component với LaTeX rendering
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Alert } from "@/components/ui";
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle, FileText, Clock } from "lucide-react";

/**
 * Question data interface
 */
interface QuestionData {
  content: string;
  type: "MC" | "TF" | "SA" | "ES" | "MA";
  status: "ACTIVE" | "PENDING" | "INACTIVE" | "ARCHIVED";
  questionCodeId: string;
  answers: any[];
  explanation?: string;
  difficulty?: string;
  tags?: string[];
  source?: string;
}

/**
 * Props for QuestionPreviewAdmin component
 */
interface QuestionPreviewAdminProps {
  questionData: Partial<QuestionData>;
}

/**
 * Question Preview Admin Component
 * Shows how the question will appear to students
 */
export function QuestionPreviewAdmin({ questionData }: QuestionPreviewAdminProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);

  /**
   * Handle answer selection
   */
  const handleAnswerSelect = (answerId: string) => {
    if (questionData.type === "MC" || questionData.type === "TF") {
      // Single selection
      setSelectedAnswers([answerId]);
    } else {
      // Multiple selection
      setSelectedAnswers((prev) =>
        prev.includes(answerId) ? prev.filter((id) => id !== answerId) : [...prev, answerId]
      );
    }
  };

  /**
   * Get question type label
   */
  const getQuestionTypeLabel = (type: string) => {
    const labels = {
      MC: "Trắc nghiệm",
      TF: "Đúng/Sai",
      SA: "Trả lời ngắn",
      ES: "Tự luận",
      MA: "Ghép đôi",
    };
    return labels[type as keyof typeof labels] || type;
  };

  /**
   * Get status badge
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>;
      case "INACTIVE":
        return <Badge className="bg-red-100 text-red-800">Tạm ngưng</Badge>;
      case "ARCHIVED":
        return <Badge className="bg-gray-100 text-gray-800">Lưu trữ</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  /**
   * Render LaTeX content (simplified)
   */
  const renderContent = (content: string) => {
    // TODO: Implement actual LaTeX rendering với KaTeX hoặc MathJax
    // For now, just render as HTML với basic formatting
    return (
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{
          __html: content
            .replace(/\n/g, "<br>")
            .replace(/\$\$(.*?)\$\$/g, '<span class="math-block bg-blue-50 p-2 rounded">$1</span>')
            .replace(/\$(.*?)\$/g, '<span class="math-inline bg-blue-50 px-1 rounded">$1</span>'),
        }}
      />
    );
  };

  // Show empty state if no content
  if (!questionData.content) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Chưa có nội dung</h3>
        <p className="text-muted-foreground">Nhập nội dung câu hỏi để xem preview</p>
      </div>
    );
  }

  return (
    <div className="question-preview-admin space-y-4">
      {/* Preview Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span className="font-medium">Preview câu hỏi</span>
        </div>
        <div className="flex items-center gap-2">
          {questionData.status && getStatusBadge(questionData.status)}
          {questionData.type && (
            <Badge variant="outline">{getQuestionTypeLabel(questionData.type)}</Badge>
          )}
        </div>
      </div>

      {/* Question Metadata */}
      {questionData.questionCodeId && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Mã câu hỏi:</span> {questionData.questionCodeId}
        </div>
      )}

      {/* Question Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Question Text */}
            <div className="question-content">{renderContent(questionData.content)}</div>

            {/* Answers */}
            {questionData.answers && questionData.answers.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Đáp án:</h4>
                <div className="space-y-2">
                  {questionData.answers.map((answer, index) => (
                    <div
                      key={answer.id || index}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedAnswers.includes(answer.id || index.toString())
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      } ${
                        showCorrectAnswers && answer.isCorrect ? "border-green-500 bg-green-50" : ""
                      } ${
                        showCorrectAnswers &&
                        !answer.isCorrect &&
                        selectedAnswers.includes(answer.id || index.toString())
                          ? "border-red-500 bg-red-50"
                          : ""
                      }`}
                      onClick={() => handleAnswerSelect(answer.id || index.toString())}
                    >
                      <div className="flex items-start gap-3">
                        {/* Answer Selection */}
                        <div className="flex items-center pt-1">
                          {questionData.type === "MC" || questionData.type === "TF" ? (
                            <div
                              className={`w-4 h-4 rounded-full border-2 ${
                                selectedAnswers.includes(answer.id || index.toString())
                                  ? "border-primary bg-primary"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedAnswers.includes(answer.id || index.toString()) && (
                                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                              )}
                            </div>
                          ) : (
                            <div
                              className={`w-4 h-4 rounded border-2 ${
                                selectedAnswers.includes(answer.id || index.toString())
                                  ? "border-primary bg-primary"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedAnswers.includes(answer.id || index.toString()) && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Answer Content */}
                        <div className="flex-1">
                          <div className="text-sm">{renderContent(answer.content || "")}</div>

                          {/* Answer Explanation */}
                          {answer.explanation && showCorrectAnswers && (
                            <div className="mt-2 text-xs text-muted-foreground italic">
                              {answer.explanation}
                            </div>
                          )}
                        </div>

                        {/* Correct Answer Indicator */}
                        {showCorrectAnswers && (
                          <div className="flex items-center pt-1">
                            {answer.isCorrect ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Show/Hide Correct Answers */}
            {questionData.answers && questionData.answers.length > 0 && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCorrectAnswers(!showCorrectAnswers)}
                >
                  {showCorrectAnswers ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Ẩn đáp án đúng
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Hiện đáp án đúng
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Question Explanation */}
      {questionData.explanation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Giải thích</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {renderContent(questionData.explanation)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {/* Source */}
        {questionData.source && (
          <div>
            <span className="font-medium text-muted-foreground">Nguồn:</span>
            <div className="mt-1">{questionData.source}</div>
          </div>
        )}

        {/* Tags */}
        {questionData.tags && questionData.tags.length > 0 && (
          <div>
            <span className="font-medium text-muted-foreground">Tags:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {questionData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preview Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <div>
          <p className="font-medium">Lưu ý về Preview</p>
          <p className="text-sm text-muted-foreground">
            Đây là bản xem trước câu hỏi. LaTeX sẽ được render đầy đủ trong môi trường thực tế.
          </p>
        </div>
      </Alert>
    </div>
  );
}
