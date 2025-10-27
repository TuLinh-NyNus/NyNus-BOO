/**
 * Question List Table Component
 * Table display cho danh sách câu hỏi
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
  Badge,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Archive,
  HelpCircle,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Import types từ lib/types
import { 
  Question, 
  QuestionType, 
  QuestionStatus 
} from "@/types/question";

/**
 * Props for QuestionListTable component
 */
interface QuestionListTableProps {
  questions: Question[];
  selectedQuestions: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onQuestionEdit: (questionId: string) => void;
  onQuestionDelete: (questionId: string) => void;
  userRole: "GUEST" | "STUDENT" | "TUTOR" | "TEACHER" | "ADMIN";
  showBulkActions?: boolean;
}

/**
 * Question List Table Component
 * Optimized table display với helper functions < 20 lines
 */
export function QuestionListTable({
  questions,
  selectedQuestions,
  onSelectionChange,
  onQuestionEdit,
  onQuestionDelete,
  userRole,
  showBulkActions = true,
}: QuestionListTableProps) {
  // Permission checks
  const canDeleteAll = userRole === "ADMIN";

  /**
   * Handle select all checkbox
   */
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = questions.map((q) => q.id);
      onSelectionChange(allIds);
    } else {
      onSelectionChange([]);
    }
  };

  /**
   * Handle individual question selection
   */
  const handleQuestionSelect = (questionId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedQuestions, questionId]);
    } else {
      onSelectionChange(selectedQuestions.filter((id) => id !== questionId));
    }
  };

  /**
   * Get status badge
   */
  const getStatusBadge = (status: QuestionStatus) => {
    const configs = {
      [QuestionStatus.ACTIVE]: { label: "Hoạt động", variant: "default" as const, icon: CheckCircle },
      [QuestionStatus.PENDING]: { label: "Chờ duyệt", variant: "secondary" as const, icon: Clock },
      [QuestionStatus.INACTIVE]: { label: "Không hoạt động", variant: "outline" as const, icon: XCircle },
      [QuestionStatus.ARCHIVED]: { label: "Lưu trữ", variant: "destructive" as const, icon: Archive },
      [QuestionStatus.DRAFT]: { label: "Bản nháp", variant: "secondary" as const, icon: Clock },
    };

    const config = configs[status];
    if (!config) {
      const FallbackIcon = HelpCircle;
      return (
        <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground">
          <FallbackIcon className="h-3 w-3" />
          {status || "Khong xac dinh"}
        </Badge>
      );
    }
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  /**
   * Get question type badge
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
   * Truncate content for display
   */
  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  /**
   * Format date safely
   */
  const formatDate = (dateValue: string | Date | null | undefined) => {
    if (!dateValue) return "N/A";
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return "N/A";
      return format(date, "dd/MM/yyyy", { locale: vi });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {showBulkActions && (
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedQuestions.length === questions.length}
                  onCheckedChange={handleSelectAll}
                  aria-label="Chọn tất cả"
                />
              </TableHead>
            )}
            <TableHead>Nội dung</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Mã câu hỏi</TableHead>
            <TableHead>Người tạo</TableHead>
            <TableHead>Sử dụng</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="w-12">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => (
            <TableRow key={question.id} className="hover:bg-muted/50">
              {showBulkActions && (
                <TableCell>
                  <Checkbox
                    checked={selectedQuestions.includes(question.id)}
                    onCheckedChange={(checked) =>
                      handleQuestionSelect(question.id, checked as boolean)
                    }
                    aria-label={`Chọn câu hỏi ${question.id}`}
                  />
                </TableCell>
              )}
              <TableCell className="max-w-md">
                <div className="space-y-1">
                  <p className="font-medium">{truncateContent(question.content)}</p>
                  {question.subcount && (
                    <code className="text-xs text-muted-foreground">{question.subcount}</code>
                  )}
                </div>
              </TableCell>
              <TableCell>{getTypeBadge(question.type)}</TableCell>
              <TableCell>{question.status && getStatusBadge(question.status)}</TableCell>
              <TableCell>
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  {question.questionCodeId}
                </code>
              </TableCell>
              <TableCell className="text-sm">{question.creator}</TableCell>
              <TableCell className="text-sm">{question.usageCount || 0}</TableCell>
              <TableCell className="text-sm">
                {formatDate(question.createdAt)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  {/*
                    Technical: Fixed nested button issue causing "Maximum update depth exceeded" error
                    Root cause: DropdownMenuTrigger automatically renders a button element
                    When we put <Button> inside it → nested buttons → hydration error → infinite loop
                    Solution: Style DropdownMenuTrigger directly without Button component (inside Array.map)
                    Note: Cannot use asChild inside Array.map due to ref callback infinite loop
                  */}
                  <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Mở menu hành động</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onQuestionEdit(question.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      Xem trước
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Sao chép
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {canDeleteAll && (
                      <DropdownMenuItem
                        onClick={() => onQuestionDelete(question.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
