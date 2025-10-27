/**
 * Question Metadata Display Component
 * Hiển thị metadata của câu hỏi
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
  Badge,
  Label,
} from "@/components/ui";
import {
  Info,
  Calendar,
  User,
  Hash,
  Tag,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Import types từ lib/types
import { 
  Question, 
  QuestionType, 
  QuestionStatus,
  QuestionDifficulty 
} from "@/types/question";

/**
 * Props for QuestionMetadataDisplay component
 */
interface QuestionMetadataDisplayProps {
  question: Question;
}

/**
 * Question Metadata Display Component
 * Specialized component cho metadata display
 */
export function QuestionMetadataDisplay({
  question,
}: QuestionMetadataDisplayProps) {
  /**
   * Get type badge
   */
  const getTypeBadge = (type: QuestionType) => {
    const typeLabels = {
      [QuestionType.MC]: "Trắc nghiệm",
      [QuestionType.MULTIPLE_CHOICE]: "Trắc nghiệm",
      [QuestionType.TF]: "Đúng/Sai",
      [QuestionType.SA]: "Trả lời ngắn",
      [QuestionType.ES]: "Tự luận",
      [QuestionType.MA]: "Ghép đôi",
    };

    return <Badge variant="outline">{typeLabels[type] || type}</Badge>;
  };

  /**
   * Get status badge
   */
  const getStatusBadge = (status: QuestionStatus) => {
    const configs = {
      [QuestionStatus.ACTIVE]: { label: "Hoạt động", variant: "default" as const },
      [QuestionStatus.PENDING]: { label: "Chờ duyệt", variant: "secondary" as const },
      [QuestionStatus.INACTIVE]: { label: "Không hoạt động", variant: "outline" as const },
      [QuestionStatus.ARCHIVED]: { label: "Lưu trữ", variant: "destructive" as const },
      [QuestionStatus.DRAFT]: { label: "Bản nháp", variant: "secondary" as const },
    };

    const config = configs[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  /**
   * Get difficulty badge
   */
  const getDifficultyBadge = (difficulty: QuestionDifficulty) => {
    const configs = {
      [QuestionDifficulty.EASY]: { label: "Dễ", variant: "secondary" as const },
      [QuestionDifficulty.MEDIUM]: { label: "Trung bình", variant: "default" as const },
      [QuestionDifficulty.HARD]: { label: "Khó", variant: "destructive" as const },
      [QuestionDifficulty.EXPERT]: { label: "Chuyên gia", variant: "outline" as const },
    };

    const config = configs[difficulty] || { label: "Chưa xác định", variant: "secondary" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  /**
   * Format date safely
   */
  const formatDate = (dateValue: string | Date | null | undefined, formatString: string = "dd/MM/yyyy HH:mm") => {
    if (!dateValue) return "N/A";
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return "N/A";
      return format(date, formatString, { locale: vi });
    } catch {
      return "N/A";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Thông tin câu hỏi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Loại câu hỏi</Label>
            <div>{getTypeBadge(question.type)}</div>
          </div>

          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Trạng thái</Label>
            <div>{question.status && getStatusBadge(question.status)}</div>
          </div>

          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Độ khó</Label>
            <div>{question.difficulty && getDifficultyBadge(question.difficulty)}</div>
          </div>

          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Mã câu hỏi</Label>
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <code className="text-sm bg-muted px-1 py-0.5 rounded">
                {question.questionCodeId}
              </code>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Điểm</Label>
            <div className="flex items-center gap-2">
              <span className="font-medium">{question.points || 10}</span>
              <span className="text-sm text-muted-foreground">điểm</span>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Thời gian</Label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{question.timeLimit || 60}s</span>
            </div>
          </div>
        </div>

        {/* Creator and Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Người tạo</Label>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{question.creator}</span>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Ngày tạo</Label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {formatDate(question.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Source */}
        {question.source && (
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Nguồn</Label>
            <p className="text-sm">{question.source}</p>
          </div>
        )}

        {/* Tags */}
        {question.tag && question.tag.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </Label>
            <div className="flex flex-wrap gap-1">
              {question.tag.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Số lần sử dụng</Label>
            <span className="font-medium">{question.usageCount || 0}</span>
          </div>

          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Cập nhật lần cuối</Label>
            <span className="text-sm">
              {question.updatedAt ? formatDate(question.updatedAt) : "Chưa cập nhật"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
