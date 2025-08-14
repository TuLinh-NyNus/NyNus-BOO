/**
 * Question Sort Controls Component
 * Advanced sorting controls với multi-column support và visual indicators
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useCallback } from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Plus,
  RotateCcw,
  Settings
} from "lucide-react";

// Import types và utilities
import {
  SortColumn,
  SortConfig,
  SortDirection,
  QuestionSortKey,
  createSortColumn,
  toggleSortDirection,
  updateSortConfig,
  removeSortColumn,
  getSortSummary,
  SORT_PRESETS
} from "@/lib/utils/question-sorting";

// ===== TYPES =====

export interface QuestionSortControlsProps {
  sortConfig: SortConfig;
  onSortConfigChange: (config: SortConfig) => void;
  multiSort?: boolean;
  showPresets?: boolean;
  showAdvanced?: boolean;
  disabled?: boolean;
  className?: string;
}

// ===== CONSTANTS =====

const SORT_FIELD_LABELS: Record<QuestionSortKey, string> = {
  questionCode: 'Mã câu hỏi',
  content: 'Nội dung',
  type: 'Loại câu hỏi',
  difficulty: 'Độ khó',
  status: 'Trạng thái',
  grade: 'Khối',
  subject: 'Môn học',
  chapter: 'Chương',
  level: 'Cấp độ',
  lesson: 'Bài học',
  form: 'Dạng',
  creator: 'Người tạo',
  createdAt: 'Ngày tạo',
  updatedAt: 'Ngày cập nhật',
  usageCount: 'Lượt sử dụng',
  feedbackScore: 'Điểm đánh giá'
};

const SORT_PRESET_LABELS = {
  DEFAULT: 'Mặc định (Mã câu hỏi)',
  NEWEST_FIRST: 'Mới nhất trước',
  MOST_USED: 'Nhiều lượt sử dụng nhất',
  HIGHEST_RATED: 'Điểm đánh giá cao nhất',
  BY_DIFFICULTY: 'Theo độ khó',
  BY_SUBJECT: 'Theo môn học'
};

// ===== HELPER COMPONENTS =====

/**
 * Sort direction icon
 */
function SortDirectionIcon({ direction }: { direction: SortDirection }) {
  return direction === 'asc' ? (
    <ArrowUp className="h-3 w-3" />
  ) : (
    <ArrowDown className="h-3 w-3" />
  );
}

/**
 * Sort column badge
 */
function SortColumnBadge({
  column,
  onRemove,
  onToggleDirection,
  disabled = false
}: {
  column: SortColumn;
  onRemove: () => void;
  onToggleDirection: () => void;
  disabled?: boolean;
}) {
  const label = SORT_FIELD_LABELS[column.key as QuestionSortKey] || column.key;
  
  return (
    <Badge
      variant="secondary"
      className="flex items-center gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
      onClick={!disabled ? onToggleDirection : undefined}
    >
      <span className="text-xs font-medium">{column.priority + 1}</span>
      <span>{label}</span>
      <SortDirectionIcon direction={column.direction} />
      {!disabled && (
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </Badge>
  );
}

// ===== MAIN COMPONENT =====

export function QuestionSortControls({
  sortConfig,
  onSortConfigChange,
  multiSort = true,
  showPresets = true,
  showAdvanced = false,
  disabled = false,
  className = ""
}: QuestionSortControlsProps) {
  const [showAdvancedControls, setShowAdvancedControls] = useState(showAdvanced);

  // ===== HANDLERS =====

  /**
   * Handle adding new sort column
   */
  const handleAddSortColumn = useCallback((
    key: QuestionSortKey,
    direction: SortDirection = 'asc'
  ) => {
    const newColumn = createSortColumn(key, direction, 0);
    const newConfig = updateSortConfig(sortConfig, newColumn, multiSort);
    onSortConfigChange(newConfig);
  }, [sortConfig, onSortConfigChange, multiSort]);

  /**
   * Handle removing sort column
   */
  const handleRemoveSortColumn = useCallback((columnKey: string) => {
    const newConfig = removeSortColumn(sortConfig, columnKey);
    onSortConfigChange(newConfig);
  }, [sortConfig, onSortConfigChange]);

  /**
   * Handle toggling sort direction
   */
  const handleToggleSortDirection = useCallback((columnKey: string) => {
    const column = sortConfig.columns.find(col => col.key === columnKey);
    if (!column) return;

    const updatedColumn = {
      ...column,
      direction: toggleSortDirection(column.direction)
    };
    const newConfig = updateSortConfig(sortConfig, updatedColumn, multiSort);
    onSortConfigChange(newConfig);
  }, [sortConfig, onSortConfigChange, multiSort]);

  /**
   * Handle applying sort preset
   */
  const handleApplyPreset = useCallback((presetName: keyof typeof SORT_PRESETS) => {
    const presetColumns = SORT_PRESETS[presetName];
    const newConfig: SortConfig = {
      ...sortConfig,
      columns: presetColumns
    };
    onSortConfigChange(newConfig);
  }, [sortConfig, onSortConfigChange]);

  /**
   * Handle clearing all sorts
   */
  const handleClearAll = useCallback(() => {
    const newConfig: SortConfig = {
      ...sortConfig,
      columns: []
    };
    onSortConfigChange(newConfig);
  }, [sortConfig, onSortConfigChange]);

  // ===== RENDER HELPERS =====

  /**
   * Render sort field dropdown
   */
  const renderSortFieldDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Plus className="h-4 w-4 mr-1" />
          Thêm sắp xếp
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Chọn trường sắp xếp</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Basic fields */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Thông tin cơ bản
        </DropdownMenuLabel>
        {(['questionCode', 'content', 'type', 'difficulty', 'status'] as QuestionSortKey[]).map(key => (
          <DropdownMenuItem
            key={key}
            onClick={() => handleAddSortColumn(key, 'asc')}
            className="flex items-center justify-between"
          >
            <span>{SORT_FIELD_LABELS[key]}</span>
            <ArrowUpDown className="h-3 w-3" />
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        {/* QuestionCode components */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Thành phần mã câu hỏi
        </DropdownMenuLabel>
        {(['grade', 'subject', 'chapter', 'level', 'lesson', 'form'] as QuestionSortKey[]).map(key => (
          <DropdownMenuItem
            key={key}
            onClick={() => handleAddSortColumn(key, 'asc')}
            className="flex items-center justify-between"
          >
            <span>{SORT_FIELD_LABELS[key]}</span>
            <ArrowUpDown className="h-3 w-3" />
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        {/* Metadata fields */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Metadata
        </DropdownMenuLabel>
        {(['creator', 'createdAt', 'updatedAt', 'usageCount', 'feedbackScore'] as QuestionSortKey[]).map(key => (
          <DropdownMenuItem
            key={key}
            onClick={() => handleAddSortColumn(key, 'asc')}
            className="flex items-center justify-between"
          >
            <span>{SORT_FIELD_LABELS[key]}</span>
            <ArrowUpDown className="h-3 w-3" />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  /**
   * Render sort presets
   */
  const renderSortPresets = () => {
    if (!showPresets) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={disabled}>
            <Settings className="h-4 w-4 mr-1" />
            Sắp xếp nhanh
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Chọn kiểu sắp xếp</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {Object.entries(SORT_PRESET_LABELS).map(([key, label]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => handleApplyPreset(key as keyof typeof SORT_PRESETS)}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  /**
   * Render current sort columns
   */
  const renderCurrentSortColumns = () => {
    if (sortConfig.columns.length === 0) {
      return (
        <div className="text-sm text-muted-foreground">
          Chưa có sắp xếp nào được áp dụng
        </div>
      );
    }

    const sortedColumns = [...sortConfig.columns].sort((a, b) => a.priority - b.priority);

    return (
      <div className="flex flex-wrap gap-2">
        {sortedColumns.map((column) => (
          <SortColumnBadge
            key={column.key}
            column={column}
            onRemove={() => handleRemoveSortColumn(column.key)}
            onToggleDirection={() => handleToggleSortDirection(column.key)}
            disabled={disabled}
          />
        ))}
      </div>
    );
  };

  // ===== MAIN RENDER =====

  return (
    <div className={`question-sort-controls space-y-4 ${className}`}>
      {/* Controls header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {renderSortFieldDropdown()}
          {renderSortPresets()}
        </div>
        
        <div className="flex items-center gap-2">
          {multiSort && (
            <Badge variant="outline" className="text-xs">
              Multi-sort {sortConfig.columns.length > 0 && `(${sortConfig.columns.length})`}
            </Badge>
          )}
          
          {sortConfig.columns.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={disabled}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Xóa tất cả
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedControls(!showAdvancedControls)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Current sort columns */}
      <div>
        <h4 className="text-sm font-medium mb-2">Sắp xếp hiện tại:</h4>
        {renderCurrentSortColumns()}
      </div>

      {/* Sort summary */}
      {sortConfig.columns.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <strong>Tóm tắt:</strong> {getSortSummary(sortConfig)}
        </div>
      )}

      {/* Advanced controls */}
      {showAdvancedControls && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Cài đặt nâng cao</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Multi-column sorting:</span>
              <Badge variant={multiSort ? "default" : "secondary"}>
                {multiSort ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span>Active sort columns:</span>
              <Badge variant="outline">
                {sortConfig.columns.length}
              </Badge>
            </div>
            
            {sortConfig.columns.length > 1 && (
              <div className="text-xs text-muted-foreground">
                <strong>Thứ tự ưu tiên:</strong> Số nhỏ hơn có độ ưu tiên cao hơn
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
