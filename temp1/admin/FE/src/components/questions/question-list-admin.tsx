/**
 * Question List Admin Component
 * Wrapper cho QuestionTable với admin-specific features
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  Skeleton,
} from "@/components/ui";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  Archive,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * Question interface (simplified for admin display)
 */
interface Question {
  id: string;
  content: string;
  type: "MC" | "TF" | "SA" | "ES" | "MA";
  status: "ACTIVE" | "PENDING" | "INACTIVE" | "ARCHIVED";
  questionCodeId: string;
  creator: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  subcount?: string;
  source?: string;
}

/**
 * Props for QuestionListAdmin component
 */
interface QuestionListAdminProps {
  questions: Question[];
  loading?: boolean;
  selectedQuestions: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onQuestionEdit: (questionId: string) => void;
  onQuestionDelete: (questionId: string) => void;
  userRole: "GUEST" | "STUDENT" | "TUTOR" | "TEACHER" | "ADMIN";
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  onPaginationChange: (page: number, pageSize: number) => void;
  showBulkActions?: boolean;
}

/**
 * Question List Admin Component
 * Enhanced table display với admin-specific functionality
 */
export function QuestionListAdmin({
  questions,
  loading = false,
  selectedQuestions,
  onSelectionChange,
  onQuestionEdit,
  onQuestionDelete,
  userRole,
  pagination,
  onPaginationChange,
  showBulkActions = true,
}: QuestionListAdminProps) {
  const router = useRouter();

  // Permission checks
  const canEditAll = userRole === "ADMIN";
  const canDeleteAll = userRole === "ADMIN";
  const canViewAll = userRole === "ADMIN";

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
   * Get status badge variant
   */
  const getStatusBadge = (status: Question["status"]) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Hoạt động
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Chờ duyệt
          </Badge>
        );
      case "INACTIVE":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            Tạm ngưng
          </Badge>
        );
      case "ARCHIVED":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Lưu trữ
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  /**
   * Get question type badge
   */
  const getTypeBadge = (type: Question["type"]) => {
    const typeLabels = {
      MC: "Trắc nghiệm",
      TF: "Đúng/Sai",
      SA: "Trả lời ngắn",
      ES: "Tự luận",
      MA: "Ghép đôi",
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
   * Calculate pagination info
   */
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  const startItem = (pagination.page - 1) * pagination.pageSize + 1;
  const endItem = Math.min(pagination.page * pagination.pageSize, pagination.total);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {showBulkActions && (
                  <TableHead className="w-12">
                    <Skeleton className="h-4 w-4" />
                  </TableHead>
                )}
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-12" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {showBulkActions && (
                    <TableCell>
                      <Skeleton className="h-4 w-4" />
                    </TableCell>
                  )}
                  <TableCell>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Empty state
  if (!questions.length) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Không có câu hỏi nào</h3>
        <p className="text-muted-foreground mb-4">
          Chưa có câu hỏi nào được tạo hoặc không có kết quả phù hợp với bộ lọc.
        </p>
        <Button onClick={() => router.push("/admin/questions/create")}>Tạo câu hỏi đầu tiên</Button>
      </div>
    );
  }

  return (
    <div className="question-list-admin space-y-4">
      {/* Table */}
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
                    <p className="font-medium text-sm">{truncateContent(question.content)}</p>
                    {question.subcount && (
                      <p className="text-xs text-muted-foreground">{question.subcount}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getTypeBadge(question.type)}</TableCell>
                <TableCell>{getStatusBadge(question.status)}</TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    {question.questionCodeId}
                  </code>
                </TableCell>
                <TableCell className="text-sm">{question.creator}</TableCell>
                <TableCell className="text-sm">{question.usageCount}</TableCell>
                <TableCell className="text-sm">
                  {format(new Date(question.createdAt), "dd/MM/yyyy", { locale: vi })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onQuestionEdit(question.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Sao chép
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {canDeleteAll && (
                        <DropdownMenuItem
                          onClick={() => onQuestionDelete(question.id)}
                          className="text-red-600"
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

      {/* Simple Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Hiển thị {startItem}-{endItem} trong tổng số {pagination.total} câu hỏi
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              pagination.page > 1 && onPaginationChange(pagination.page - 1, pagination.pageSize)
            }
            disabled={pagination.page <= 1}
          >
            Trước
          </Button>

          <span className="text-sm">
            Trang {pagination.page} / {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              pagination.page < totalPages &&
              onPaginationChange(pagination.page + 1, pagination.pageSize)
            }
            disabled={pagination.page >= totalPages}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
