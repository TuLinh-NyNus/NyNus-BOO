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

// Import types từ lib/types
import { 
  Question, 
  QuestionType, 
  QuestionStatus 
} from "@/types/question";
import { resolveQuestionCode } from "@/lib/utils/question-code";

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
   * Get status badge (icon only)
   */
  const getStatusBadge = (status: QuestionStatus | string | number) => {
    const configs: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
      // String enum values
      'ACTIVE': { label: "Hoạt động", color: "text-green-600", icon: CheckCircle },
      'PENDING': { label: "Chờ duyệt", color: "text-yellow-600", icon: Clock },
      'INACTIVE': { label: "Không hoạt động", color: "text-gray-600", icon: XCircle },
      'ARCHIVED': { label: "Lưu trữ", color: "text-red-600", icon: Archive },
      'DRAFT': { label: "Bản nháp", color: "text-blue-600", icon: Clock },
      // Numeric values from backend
      '1': { label: "Hoạt động", color: "text-green-600", icon: CheckCircle },
      '2': { label: "Chờ duyệt", color: "text-yellow-600", icon: Clock },
      '3': { label: "Không hoạt động", color: "text-gray-600", icon: XCircle },
      '4': { label: "Lưu trữ", color: "text-red-600", icon: Archive },
      '5': { label: "Bản nháp", color: "text-blue-600", icon: Clock },
    };

    const statusKey = String(status);
    const config = configs[statusKey];
    
    if (!config) {
      const FallbackIcon = HelpCircle;
      return (
        <div className="flex items-center justify-center" title="Không xác định">
          <FallbackIcon className="h-5 w-5 text-muted-foreground" />
        </div>
      );
    }
    const Icon = config.icon;

    return (
      <div className="flex items-center justify-center" title={config.label}>
        <Icon className={`h-5 w-5 ${config.color}`} />
      </div>
    );
  };

  /**
   * Get question type badge with abbreviations
   */
  const getTypeBadge = (type: QuestionType | string | number) => {
    const typeLabels: Record<string, string> = {
      // String enum values
      'MC': "MC",
      'MULTIPLE_CHOICE': "MC",
      'TF': "TF",
      'SA': "SA",
      'ES': "ES",
      'MA': "MA",
      // Numeric values from backend
      '1': "MC", // Trắc nghiệm
      '2': "TF", // Đúng/Sai
      '3': "ES", // Tự luận
      '4': "SA", // Trả lời ngắn
      '5': "MA", // Ghép đôi
    };

    const typeKey = String(type);
    return <Badge variant="outline">{typeLabels[typeKey] || type}</Badge>;
  };

  /**
   * Truncate content for display
   */
  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
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
            <TableHead>Sử dụng</TableHead>
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
                  {resolveQuestionCode(question) || 'N/A'}
                </code>
              </TableCell>
              <TableCell className="text-sm">{question.usageCount || 0}</TableCell>
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
