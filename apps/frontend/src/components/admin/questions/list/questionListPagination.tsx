/**
 * Question List Pagination Component
 * Pagination controls cho danh sách câu hỏi
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import { Button } from "@/components/ui";

// Import types từ lib/types
import { QuestionPagination } from "@/lib/types/question";

/**
 * Props for QuestionListPagination component
 */
interface QuestionListPaginationProps {
  pagination: QuestionPagination;
  onPaginationChange: (page: number, pageSize: number) => void;
}

/**
 * Question List Pagination Component
 * Optimized pagination với helper functions < 20 lines
 */
export function QuestionListPagination({
  pagination,
  onPaginationChange,
}: QuestionListPaginationProps) {
  /**
   * Calculate pagination info
   */
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  const startItem = (pagination.page - 1) * pagination.pageSize + 1;
  const endItem = Math.min(pagination.page * pagination.pageSize, pagination.total);

  /**
   * Handle pagination change
   */
  const handlePageChange = (newPage: number) => {
    onPaginationChange(newPage, pagination.pageSize);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Hiển thị {startItem} - {endItem} trong tổng số {pagination.total} câu hỏi
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page <= 1}
        >
          Trước
        </Button>
        
        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNumber = Math.max(1, pagination.page - 2) + i;
            if (pageNumber > totalPages) return null;
            
            return (
              <Button
                key={pageNumber}
                variant={pageNumber === pagination.page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNumber)}
                className="w-8 h-8 p-0"
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page >= totalPages}
        >
          Sau
        </Button>
      </div>
    </div>
  );
}
