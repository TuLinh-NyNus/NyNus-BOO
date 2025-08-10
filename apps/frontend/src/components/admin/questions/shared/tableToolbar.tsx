/**
 * Table Toolbar Component
 * Toolbar with actions cho tables
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import { Button, Input, Badge } from "@/components/ui";
import { 
  Search, 
  Plus,
  Download,
  Upload,
  Filter,
  RotateCcw
} from "lucide-react";

/**
 * Props for TableToolbar component
 */
interface TableToolbarProps {
  title?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  totalCount?: number;
  filteredCount?: number;
  activeFiltersCount?: number;
  onCreateNew?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onResetFilters?: () => void;
  onToggleFilters?: () => void;
  createLabel?: string;
  showImport?: boolean;
  showExport?: boolean;
  showFilters?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Table Toolbar Component
 * Reusable toolbar cho các tables trong admin
 */
export function TableToolbar({
  title,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  totalCount,
  filteredCount,
  activeFiltersCount = 0,
  onCreateNew,
  onImport,
  onExport,
  onResetFilters,
  onToggleFilters,
  createLabel = "Tạo mới",
  showImport = false,
  showExport = false,
  showFilters = false,
  children,
  className = "",
}: TableToolbarProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Row */}
      <div className="flex items-center justify-between">
        {/* Title and Count */}
        <div className="flex items-center gap-3">
          {title && (
            <h2 className="text-xl font-semibold">{title}</h2>
          )}
          
          {(totalCount !== undefined || filteredCount !== undefined) && (
            <div className="flex items-center gap-2">
              {filteredCount !== undefined && totalCount !== undefined && filteredCount !== totalCount ? (
                <Badge variant="secondary">
                  {filteredCount} / {totalCount}
                </Badge>
              ) : totalCount !== undefined ? (
                <Badge variant="secondary">
                  {totalCount}
                </Badge>
              ) : null}
              
              {activeFiltersCount > 0 && (
                <Badge variant="outline">
                  {activeFiltersCount} bộ lọc
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {showImport && onImport && (
            <Button variant="outline" size="sm" onClick={onImport}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          )}
          
          {showExport && onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          
          {onCreateNew && (
            <Button size="sm" onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              {createLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filter Row */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        {onSearchChange && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          {showFilters && onToggleFilters && (
            <Button variant="outline" size="sm" onClick={onToggleFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          )}

          {activeFiltersCount > 0 && onResetFilters && (
            <Button variant="outline" size="sm" onClick={onResetFilters}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Đặt lại
            </Button>
          )}

          {/* Custom Actions */}
          {children}
        </div>
      </div>
    </div>
  );
}
