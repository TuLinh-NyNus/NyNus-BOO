/**
 * Table Empty State Component
 * Empty state component cho tables
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import { Button } from "@/components/ui";
import { FileText, Plus, Search, Filter } from "lucide-react";

/**
 * Props for TableEmpty component
 */
interface TableEmptyProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  showSearchSuggestion?: boolean;
  showFilterSuggestion?: boolean;
  className?: string;
}

/**
 * Table Empty State Component
 * Reusable empty state cho các tables trong admin
 */
export function TableEmpty({
  title = "Không có dữ liệu",
  description = "Chưa có dữ liệu nào được tạo hoặc không có kết quả phù hợp với bộ lọc.",
  actionLabel = "Tạo mới",
  onAction,
  icon: Icon = FileText,
  showSearchSuggestion = true,
  showFilterSuggestion = true,
  className = "",
}: TableEmptyProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {description}
      </p>

      {/* Suggestions */}
      {(showSearchSuggestion || showFilterSuggestion) && (
        <div className="mb-6 space-y-2">
          <p className="text-sm text-muted-foreground">Gợi ý:</p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
            {showSearchSuggestion && (
              <div className="flex items-center gap-1">
                <Search className="h-3 w-3" />
                <span>Thử từ khóa khác</span>
              </div>
            )}
            {showFilterSuggestion && (
              <div className="flex items-center gap-1">
                <Filter className="h-3 w-3" />
                <span>Điều chỉnh bộ lọc</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      {onAction && (
        <Button onClick={onAction}>
          <Plus className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
