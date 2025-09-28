/**
 * Question Bank Table Component
 * Table display cho Question Bank
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
  Checkbox,
} from "@/components/ui";
import {
  Eye,
  Edit,
  Trash2,
  SortAsc,
  SortDesc,
  Database,
} from "lucide-react";

// Import types từ lib/types
import {
  Question,
  QuestionType,
  QuestionStatus
} from "@/lib/types/question";

/**
 * Sort configuration
 */
type SortField = "content" | "type" | "status" | "createdAt" | "usageCount";
type SortDirection = "asc" | "desc";

/**
 * Props for QuestionBankTable component
 */
interface QuestionBankTableProps {
  questions: Question[];
  selectedQuestions: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectQuestion: (questionId: string, checked: boolean) => void;
  onQuestionSelect?: (question: Question) => void;
  onQuestionEdit?: (questionId: string) => void;
  onQuestionDelete?: (questionId: string) => void;
  selectable?: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

/**
 * Question Bank Table Component
 * Optimized table với helper functions < 20 lines
 */
export function QuestionBankTable({
  questions,
  selectedQuestions,
  onSelectAll,
  onSelectQuestion,
  onQuestionSelect,
  onQuestionEdit,
  onQuestionDelete,
  selectable = false,
  sortField,
  sortDirection,
  onSort,
}: QuestionBankTableProps) {
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
   * Get type badge
   */
  const getTypeBadge = (type: QuestionType) => {
    const typeLabels = {
      [QuestionType.MC]: "Trắc nghiệm",
      [QuestionType.TF]: "Đúng/Sai",
      [QuestionType.SA]: "Trả lời ngắn",
      [QuestionType.ES]: "Tự luận",
      [QuestionType.MA]: "Ghép đôi",
    };

    return <Badge variant="outline">{typeLabels[type] || type}</Badge>;
  };

  /**
   * Truncate content
   */
  const truncateContent = (content: string, maxLength: number = 80) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Không tìm thấy câu hỏi</h3>
        <p className="text-muted-foreground">
          Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {selectable && (
            <TableHead className="w-12">
              <Checkbox
                checked={selectedQuestions.length === questions.length}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
          )}
          <TableHead 
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onSort("content")}
          >
            <div className="flex items-center gap-1">
              Nội dung
              {sortField === "content" && (
                sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
              )}
            </div>
          </TableHead>
          <TableHead 
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onSort("type")}
          >
            <div className="flex items-center gap-1">
              Loại
              {sortField === "type" && (
                sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
              )}
            </div>
          </TableHead>
          <TableHead 
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onSort("status")}
          >
            <div className="flex items-center gap-1">
              Trạng thái
              {sortField === "status" && (
                sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
              )}
            </div>
          </TableHead>
          <TableHead>Mã</TableHead>
          <TableHead 
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onSort("usageCount")}
          >
            <div className="flex items-center gap-1">
              Sử dụng
              {sortField === "usageCount" && (
                sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
              )}
            </div>
          </TableHead>
          <TableHead 
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onSort("createdAt")}
          >
            <div className="flex items-center gap-1">
              Ngày tạo
              {sortField === "createdAt" && (
                sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
              )}
            </div>
          </TableHead>
          <TableHead className="w-12">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {questions.map((question) => (
          <TableRow 
            key={question.id} 
            className="hover:bg-muted/50 cursor-pointer"
            onClick={() => onQuestionSelect?.(question)}
          >
            {selectable && (
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedQuestions.includes(question.id)}
                  onCheckedChange={(checked) => 
                    onSelectQuestion(question.id, checked as boolean)
                  }
                />
              </TableCell>
            )}
            <TableCell className="max-w-md">
              <div className="space-y-1">
                <p className="font-medium">{truncateContent(question.content)}</p>
                {question.tag && question.tag.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {question.tag.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {question.tag.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{question.tag.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>{getTypeBadge(question.type)}</TableCell>
            <TableCell>{getStatusBadge(question.status ?? QuestionStatus.ACTIVE)}</TableCell>
            <TableCell>
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                {question.questionCodeId}
              </code>
            </TableCell>
            <TableCell>{question.usageCount || 0}</TableCell>
            <TableCell className="text-sm">
              {new Date(question.createdAt).toLocaleDateString("vi-VN")}
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => onQuestionSelect?.(question)}>
                  <Eye className="h-4 w-4" />
                </Button>
                {onQuestionEdit && (
                  <Button variant="ghost" size="sm" onClick={() => onQuestionEdit(question.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onQuestionDelete && (
                  <Button variant="ghost" size="sm" onClick={() => onQuestionDelete(question.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
