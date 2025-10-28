/**
 * Question List Component
 * Bảng hiển thị danh sách câu hỏi với tính năng chọn dòng và phân trang
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Skeleton,
} from "@/components/ui";
import { FileText } from "lucide-react";

// Import components
import { QuestionListTable } from "./questionListTable";
import { QuestionListPagination } from "./questionListPagination";

// Import types từ lib/types
import {
  Question,
  QuestionPagination
} from "@/types/question";

/**
 * Props for QuestionList component
 */
interface QuestionListProps {
  questions: Question[];
  loading?: boolean;
  selectedQuestions: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onQuestionEdit: (questionId: string) => void;
  onQuestionDelete: (questionId: string) => void;
  userRole: "GUEST" | "STUDENT" | "TUTOR" | "TEACHER" | "ADMIN";
  pagination: QuestionPagination;
  onPaginationChange: (page: number, pageSize: number) => void;
  showBulkActions?: boolean;
}

/**
 * Question List Component
 * Enhanced table display với admin-specific functionality
 */
export function QuestionList({
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
}: QuestionListProps) {
  const router = useRouter();

  // Permission checks - chỉ admin mới có quyền đầy đủ
  // const canEditAll = userRole === "ADMIN";
  // const canDeleteAll = userRole === "ADMIN";
  // const canViewAll = userRole === "ADMIN";



  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {showBulkActions && <TableHead className="w-12"><Skeleton className="h-4 w-4" /></TableHead>}
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead className="w-12"><Skeleton className="h-4 w-4" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {showBulkActions && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
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
        <Button onClick={() => router.push("/3141592654/admin/questions/create")}>
          Tạo câu hỏi đầu tiên
        </Button>
      </div>
    );
  }

  return (
    <div className="question-list space-y-4">
      {/* Table */}
      <QuestionListTable
        questions={questions}
        selectedQuestions={selectedQuestions}
        onSelectionChange={onSelectionChange}
        onQuestionEdit={onQuestionEdit}
        onQuestionDelete={onQuestionDelete}
        userRole={userRole}
        showBulkActions={showBulkActions}
      />

      {/* Pagination */}
      <QuestionListPagination
        pagination={pagination}
        onPaginationChange={onPaginationChange}
      />
    </div>
  );
}
