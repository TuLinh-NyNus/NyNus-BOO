/**
 * Question Preview Component
 * Xem trước nội dung câu hỏi và đáp án
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Alert
} from "@/components/ui";
import { 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Clock,
  Hash,
  User,
  Calendar,
  BarChart3
} from "lucide-react";

// Import types từ lib/types
import { 
  Question,
  QuestionType, 
  QuestionStatus,
  QuestionDifficulty,
  AnswerOption 
} from "@/lib/types/question";

/**
 * Props for QuestionPreview component
 */
interface QuestionPreviewProps {
  question: Question;
  showMetadata?: boolean;
  showAnswers?: boolean;
  showSolution?: boolean;
  className?: string;
}

/**
 * Question Preview Component
 * Enhanced preview component với LaTeX rendering support
 */
export function QuestionPreview({
  question,
  showMetadata = true,
  showAnswers = true,
  showSolution = true,
  className = "",
}: QuestionPreviewProps) {
  // UI state
  const [showAnswersState, setShowAnswersState] = useState(showAnswers);
  const [showSolutionState, setShowSolutionState] = useState(false);

  /**
   * Get question type label
   */
  const getTypeLabel = (type: QuestionType) => {
    const typeLabels = {
      [QuestionType.MC]: "Trắc nghiệm",
      [QuestionType.TF]: "Đúng/Sai",
      [QuestionType.SA]: "Trả lời ngắn",
      [QuestionType.ES]: "Tự luận",
      [QuestionType.MA]: "Ghép đôi",
    };
    return typeLabels[type] || type;
  };

  /**
   * Get difficulty label and color
   */
  const getDifficultyConfig = (difficulty?: QuestionDifficulty) => {
    if (!difficulty) return { label: "Chưa xác định", color: "bg-gray-500" };
    
    const configs = {
      [QuestionDifficulty.EASY]: { label: "Dễ", color: "bg-green-500" },
      [QuestionDifficulty.MEDIUM]: { label: "Trung bình", color: "bg-yellow-500" },
      [QuestionDifficulty.HARD]: { label: "Khó", color: "bg-red-500" },
      [QuestionDifficulty.EXPERT]: { label: "Chuyên gia", color: "bg-purple-500" },
    };
    return configs[difficulty] || { label: difficulty, color: "bg-gray-500" };
  };

  /**
   * Get status badge
   */
  const getStatusBadge = (status?: QuestionStatus) => {
    if (!status) return null;

    const statusConfig = {
      [QuestionStatus.ACTIVE]: {
        label: "Hoạt động",
        variant: "default" as const,
        icon: CheckCircle,
      },
      [QuestionStatus.PENDING]: {
        label: "Chờ duyệt",
        variant: "secondary" as const,
        icon: Clock,
      },
      [QuestionStatus.INACTIVE]: {
        label: "Không hoạt động",
        variant: "outline" as const,
        icon: XCircle,
      },
      [QuestionStatus.ARCHIVED]: {
        label: "Lưu trữ",
        variant: "destructive" as const,
        icon: AlertCircle,
      },
      [QuestionStatus.DRAFT]: {
        label: "Bản nháp",
        variant: "secondary" as const,
        icon: Clock,
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const difficultyConfig = getDifficultyConfig(question.difficulty);

  return (
    <div className={`question-preview space-y-4 ${className}`}>
      {/* Metadata Section */}
      {showMetadata && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Thông tin câu hỏi</CardTitle>
              {question.status && getStatusBadge(question.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Question Type */}
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Loại:</span>{" "}
                  <Badge variant="outline">{getTypeLabel(question.type)}</Badge>
                </span>
              </div>

              {/* Difficulty */}
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Độ khó:</span>{" "}
                  <Badge className={`text-white ${difficultyConfig.color}`}>
                    {difficultyConfig.label}
                  </Badge>
                </span>
              </div>

              {/* Question Code */}
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Mã:</span>{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    {question.questionCodeId}
                  </code>
                </span>
              </div>

              {/* Usage Count */}
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Sử dụng:</span>{" "}
                  {question.usageCount || 0} lần
                </span>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              {/* Creator */}
              {question.creator && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="text-muted-foreground">Người tạo:</span>{" "}
                    {question.creator}
                  </span>
                </div>
              )}

              {/* Created Date */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Ngày tạo:</span>{" "}
                  {formatDate(question.createdAt)}
                </span>
              </div>
            </div>

            {/* Tags */}
            {question.tag && question.tag.length > 0 && (
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-muted-foreground">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {question.tag.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Source */}
            {question.source && (
              <div className="pt-2 border-t">
                <span className="text-sm">
                  <span className="text-muted-foreground">Nguồn:</span>{" "}
                  {question.source}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Question Content */}
      <Card>
        <CardHeader>
          <CardTitle>Nội dung câu hỏi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div className="p-4 bg-muted/50 rounded-lg">
              {question.content || "Không có nội dung"}
            </div>
            
            {question.subcount && (
              <div className="mt-2">
                <code className="text-xs text-muted-foreground">
                  Subcount: {question.subcount}
                </code>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Answers Section */}
      {(question.type === QuestionType.MC || question.type === QuestionType.TF) && 
       question.answers && (question.answers as AnswerOption[]).length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Đáp án</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnswersState(!showAnswersState)}
              >
                {showAnswersState ? (
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
            {showAnswersState ? (
              <div className="space-y-2">
                {(question.answers as AnswerOption[]).map((answer, index) => (
                  <div 
                    key={answer.id} 
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      answer.isCorrect ? "bg-green-50 border-green-200" : "bg-gray-50"
                    }`}
                  >
                    <span className="font-mono text-sm font-medium">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="flex-1">{answer.content}</span>
                    {answer.isCorrect && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <div>Đáp án đã được ẩn. Nhấn &quot;Hiện đáp án&quot; để xem.</div>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Solution Section */}
      {question.solution && showSolution && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lời giải</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSolutionState(!showSolutionState)}
              >
                {showSolutionState ? (
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
            {showSolutionState ? (
              <div className="prose prose-sm max-w-none">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  {question.solution}
                </div>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <div>Lời giải đã được ẩn. Nhấn &quot;Hiện lời giải&quot; để xem.</div>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
