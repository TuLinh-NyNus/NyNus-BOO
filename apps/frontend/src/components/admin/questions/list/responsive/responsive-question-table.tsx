/**
 * Responsive Question Table Component
 * Adaptive table layout cho different screen sizes
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useMemo } from "react";
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  Hash,
  Clock,
  User
} from "lucide-react";

// Import components
import { QuestionActionsDropdown } from "../../actions/question-actions-dropdown";
import { QuestionMobileCard } from "./question-mobile-card";
import { LaTeXContent } from "@/components/latex";

// Import types
import { Question } from "@/lib/types/question";
import { SortColumn, QuestionSortKey } from "@/lib/utils/question-sorting";

// ===== TYPES =====

export type ResponsiveLayout = 'desktop' | 'tablet' | 'mobile';

export interface ResponsiveQuestionTableProps {
  questions: Question[];
  selectedQuestions: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onQuestionView?: (questionId: string) => void;
  onQuestionEdit?: (questionId: string) => void;
  onQuestionDelete?: (questionId: string) => void;
  onQuestionDuplicate?: (questionId: string) => void;
  
  // Sorting
  sortConfig?: { columns: SortColumn[] };
  onSortChange?: (key: QuestionSortKey, direction: 'asc' | 'desc') => void;
  
  // Layout
  layout?: ResponsiveLayout;
  forceLayout?: ResponsiveLayout;
  
  // Display options
  showActions?: boolean;
  showSelection?: boolean;
  userRole?: "GUEST" | "STUDENT" | "TUTOR" | "TEACHER" | "ADMIN";
  
  className?: string;
}

// ===== COLUMN DEFINITIONS =====

interface ColumnDefinition {
  key: QuestionSortKey;
  label: string;
  sortable: boolean;
  priority: 'high' | 'medium' | 'low'; // Priority cho responsive hiding
  minWidth?: string;
  render: (question: Question) => React.ReactNode;
}

const COLUMN_DEFINITIONS: ColumnDefinition[] = [
  {
    key: 'questionCode',
    label: 'Mã câu hỏi',
    sortable: true,
    priority: 'high',
    minWidth: '120px',
    render: (question) => (
      <div className="flex items-center gap-1">
        <Hash className="h-3 w-3 text-muted-foreground" />
        <span className="font-mono text-xs">{question.questionCodeId}</span>
      </div>
    )
  },
  {
    key: 'content',
    label: 'Nội dung',
    sortable: true,
    priority: 'high',
    minWidth: '200px',
    render: (question) => (
      <div className="max-w-xs">
        <LaTeXContent
          content={question.content || 'Không có nội dung'}
          maxLength={100}
          safeMode={true}
          className="text-sm"
        />
      </div>
    )
  },
  {
    key: 'type',
    label: 'Loại',
    sortable: true,
    priority: 'medium',
    minWidth: '100px',
    render: (question) => {
      const typeMap = {
        'MULTIPLE_CHOICE': 'Trắc nghiệm',
        'TRUE_FALSE': 'Đúng/Sai',
        'SHORT_ANSWER': 'Trả lời ngắn',
        'ESSAY': 'Tự luận',
        'MATCHING': 'Ghép đôi'
      };
      return (
        <Badge variant="outline" className="text-xs">
          {(question.type && typeMap[question.type as unknown as keyof typeof typeMap]) || question.type || 'Không xác định'}
        </Badge>
      );
    }
  },
  {
    key: 'difficulty',
    label: 'Độ khó',
    sortable: true,
    priority: 'medium',
    minWidth: '80px',
    render: (question) => {
      const colorMap = {
        'EASY': 'bg-green-100 text-green-800',
        'MEDIUM': 'bg-yellow-100 text-yellow-800',
        'HARD': 'bg-red-100 text-red-800'
      };
      return question.difficulty ? (
        <Badge className={`text-xs ${colorMap[question.difficulty as keyof typeof colorMap] || 'bg-gray-100 text-gray-800'}`}>
          {question.difficulty}
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground">-</span>
      );
    }
  },
  {
    key: 'status',
    label: 'Trạng thái',
    sortable: true,
    priority: 'low',
    minWidth: '100px',
    render: (question) => {
      const statusMap = {
        'ACTIVE': { label: 'Hoạt động', color: 'bg-green-100 text-green-800' },
        'INACTIVE': { label: 'Không hoạt động', color: 'bg-gray-100 text-gray-800' },
        'DRAFT': { label: 'Bản nháp', color: 'bg-yellow-100 text-yellow-800' },
        'ARCHIVED': { label: 'Lưu trữ', color: 'bg-red-100 text-red-800' }
      };
      const status = statusMap[question.status as keyof typeof statusMap];
      return status ? (
        <Badge className={`text-xs ${status.color}`}>
          {status.label}
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground">-</span>
      );
    }
  },
  {
    key: 'creator',
    label: 'Người tạo',
    sortable: true,
    priority: 'low',
    minWidth: '100px',
    render: (question) => (
      <div className="flex items-center gap-1">
        <User className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs">{question.creator || 'Không xác định'}</span>
      </div>
    )
  },
  {
    key: 'createdAt',
    label: 'Ngày tạo',
    sortable: true,
    priority: 'low',
    minWidth: '100px',
    render: (question) => (
      <div className="flex items-center gap-1">
        <Clock className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs">
          {new Date(question.createdAt).toLocaleDateString('vi-VN')}
        </span>
      </div>
    )
  },
  {
    key: 'usageCount',
    label: 'Lượt dùng',
    sortable: true,
    priority: 'low',
    minWidth: '80px',
    render: (question) => (
      <span className="text-xs font-mono">
        {question.usageCount || 0}
      </span>
    )
  }
];

// ===== HELPER FUNCTIONS =====

/**
 * Get visible columns dựa trên layout
 */
function getVisibleColumns(layout: ResponsiveLayout): ColumnDefinition[] {
  switch (layout) {
    case 'mobile':
      return []; // Mobile sẽ dùng card layout
    case 'tablet':
      return COLUMN_DEFINITIONS.filter(col => 
        col.priority === 'high' || col.priority === 'medium'
      );
    case 'desktop':
    default:
      return COLUMN_DEFINITIONS;
  }
}

/**
 * Get sort direction icon
 */
function getSortIcon(column: ColumnDefinition, sortConfig?: { columns: SortColumn[] }) {
  if (!sortConfig) return <ArrowUpDown className="h-3 w-3" />;
  
  const sortColumn = sortConfig.columns.find(col => col.key === column.key);
  if (!sortColumn) return <ArrowUpDown className="h-3 w-3" />;
  
  return sortColumn.direction === 'asc' 
    ? <ArrowUp className="h-3 w-3" />
    : <ArrowDown className="h-3 w-3" />;
}

// ===== MAIN COMPONENT =====

export function ResponsiveQuestionTable({
  questions,
  selectedQuestions,
  onSelectionChange,
  onQuestionView,
  onQuestionEdit,
  onQuestionDelete,
  onQuestionDuplicate,
  sortConfig,
  onSortChange,
  layout = 'desktop',
  forceLayout,
  showActions = true,
  showSelection = true,
  userRole = "GUEST",
  className = ""
}: ResponsiveQuestionTableProps) {
  // ===== COMPUTED VALUES =====
  
  const currentLayout = forceLayout || layout;
  const visibleColumns = useMemo(() => getVisibleColumns(currentLayout), [currentLayout]);
  
  const isAllSelected = questions.length > 0 && selectedQuestions.length === questions.length;
  const isPartiallySelected = selectedQuestions.length > 0 && selectedQuestions.length < questions.length;
  
  // ===== HANDLERS =====
  
  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(questions.map(q => q.id));
    }
  };
  
  const handleSelectQuestion = (questionId: string, selected: boolean) => {
    if (selected) {
      onSelectionChange([...selectedQuestions, questionId]);
    } else {
      onSelectionChange(selectedQuestions.filter(id => id !== questionId));
    }
  };
  
  const handleSort = (columnKey: QuestionSortKey) => {
    if (!onSortChange) return;
    
    const currentSort = sortConfig?.columns.find(col => col.key === columnKey);
    const newDirection = currentSort?.direction === 'asc' ? 'desc' : 'asc';
    
    onSortChange(columnKey, newDirection);
  };
  
  // ===== RENDER MOBILE LAYOUT =====
  
  if (currentLayout === 'mobile') {
    return (
      <div className={`responsive-question-table mobile-layout space-y-3 ${className}`}>
        {questions.map((question) => (
          <QuestionMobileCard
            key={question.id}
            question={question}
            isSelected={selectedQuestions.includes(question.id)}
            onSelectionChange={handleSelectQuestion}
            onView={onQuestionView}
            onEdit={onQuestionEdit}
            onDelete={onQuestionDelete}
            onDuplicate={onQuestionDuplicate}
            showActions={showActions}
            showSelection={showSelection}
            userRole={userRole}
          />
        ))}
      </div>
    );
  }
  
  // ===== RENDER TABLE LAYOUT =====
  
  return (
    <div className={`responsive-question-table table-layout ${className}`}>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Selection header */}
              {showSelection && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    className={isPartiallySelected ? 'data-[state=checked]:bg-primary/50' : ''}
                  />
                </TableHead>
              )}
              
              {/* Column headers */}
              {visibleColumns.map((column) => (
                <TableHead
                  key={column.key}
                  className="min-w-0"
                  style={{ minWidth: column.minWidth }}
                >
                  {column.sortable && onSortChange ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort(column.key)}
                    >
                      <span className="mr-1">{column.label}</span>
                      {getSortIcon(column, sortConfig)}
                    </Button>
                  ) : (
                    <span className="font-medium">{column.label}</span>
                  )}
                </TableHead>
              ))}
              
              {/* Actions header */}
              {showActions && (
                <TableHead className="w-20">
                  <span className="font-medium">Hành động</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {questions.map((question) => (
              <TableRow
                key={question.id}
                className={selectedQuestions.includes(question.id) ? 'bg-muted/50' : ''}
              >
                {/* Selection cell */}
                {showSelection && (
                  <TableCell>
                    <Checkbox
                      checked={selectedQuestions.includes(question.id)}
                      onCheckedChange={(checked) => 
                        handleSelectQuestion(question.id, checked as boolean)
                      }
                    />
                  </TableCell>
                )}
                
                {/* Data cells */}
                {visibleColumns.map((column) => (
                  <TableCell key={column.key} className="min-w-0">
                    {column.render(question)}
                  </TableCell>
                ))}
                
                {/* Actions cell */}
                {showActions && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onQuestionView?.(question.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {userRole !== 'GUEST' && userRole !== 'STUDENT' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onQuestionEdit?.(question.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <QuestionActionsDropdown
                        question={question}
                        onView={onQuestionView}
                        onEdit={onQuestionEdit}
                        onDelete={onQuestionDelete}
                        onDuplicate={onQuestionDuplicate}
                        userRole={userRole}
                        className="h-8 w-8"
                      />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
