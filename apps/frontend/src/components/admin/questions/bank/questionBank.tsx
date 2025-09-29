/**
 * Question Bank Component
 * Hiển thị danh sách kiểu database
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@/components/ui";
import {
  Database,
  Download,
  Upload,
  Plus,
  Trash2,
} from "lucide-react";
import { useToast } from "@/components/ui/feedback/use-toast";

// Import components
import { QuestionBankFilters } from "./questionBankFilters";
import { QuestionBankTable } from "./questionBankTable";

// Import types từ lib/types
import { 
  Question,
  QuestionType, 
  QuestionStatus,
  QuestionDifficulty 
} from "@/types/question";

/**
 * Props for QuestionBank component
 */
interface QuestionBankProps {
  questions: Question[];
  onQuestionSelect?: (question: Question) => void;
  onQuestionEdit?: (questionId: string) => void;
  onQuestionDelete?: (questionId: string) => void;
  onBulkAction?: (action: string, questionIds: string[]) => void;
  selectable?: boolean;
  className?: string;
}

/**
 * Sort configuration
 */
type SortField = "content" | "type" | "status" | "createdAt" | "usageCount";
type SortDirection = "asc" | "desc";

/**
 * Question Bank Component
 * Database-style display với advanced filtering và sorting
 */
export function QuestionBank({
  questions,
  onQuestionSelect,
  onQuestionEdit,
  onQuestionDelete,
  onBulkAction,
  selectable = false,
  className = "",
}: QuestionBankProps) {
  const { toast } = useToast();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<QuestionType | "">("");
  const [statusFilter, setStatusFilter] = useState<QuestionStatus | "">("");
  const [difficultyFilter, setDifficultyFilter] = useState<QuestionDifficulty | "">("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  /**
   * Filter and sort questions
   */
  const filteredAndSortedQuestions = useMemo(() => {
    const filtered = questions.filter((question) => {
      // Search filter
      const matchesSearch = !searchTerm || 
        question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.questionCodeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (question.tag && question.tag.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ));

      // Type filter
      const matchesType = !typeFilter || question.type === typeFilter;

      // Status filter
      const matchesStatus = !statusFilter || question.status === statusFilter;

      // Difficulty filter
      const matchesDifficulty = !difficultyFilter || question.difficulty === difficultyFilter;

      return matchesSearch && matchesType && matchesStatus && matchesDifficulty;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortField) {
        case "content":
          aValue = a.content.toLowerCase();
          bValue = b.content.toLowerCase();
          break;
        case "type":
          aValue = a.type;
          bValue = b.type;
          break;
        case "status":
          aValue = a.status || "";
          bValue = b.status || "";
          break;
        case "createdAt":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case "usageCount":
          aValue = a.usageCount || 0;
          bValue = b.usageCount || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [questions, searchTerm, typeFilter, statusFilter, difficultyFilter, sortField, sortDirection]);

  /**
   * Handle sort change
   */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  /**
   * Handle selection
   */
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQuestions(filteredAndSortedQuestions.map(q => q.id));
    } else {
      setSelectedQuestions([]);
    }
  };

  const handleSelectQuestion = (questionId: string, checked: boolean) => {
    if (checked) {
      setSelectedQuestions(prev => [...prev, questionId]);
    } else {
      setSelectedQuestions(prev => prev.filter(id => id !== questionId));
    }
  };

  /**
   * Handle bulk actions
   */
  const handleBulkAction = (action: string) => {
    if (selectedQuestions.length === 0) {
      toast({
        title: "Thông báo",
        description: "Vui lòng chọn ít nhất một câu hỏi",
        variant: "default",
      });
      return;
    }

    if (onBulkAction) {
      onBulkAction(action, selectedQuestions);
    }
  };



  /**
   * Get status badge - Currently used in JSX
   */
  // const getStatusBadge = (status?: QuestionStatus) => {
  //   if (!status) return <Badge variant="secondary">Chưa xác định</Badge>;

  //   const statusConfig = {
  //     [QuestionStatus.ACTIVE]: { label: "Hoạt động", variant: "default" as const },
  //     [QuestionStatus.PENDING]: { label: "Chờ duyệt", variant: "secondary" as const },
  //     [QuestionStatus.INACTIVE]: { label: "Không hoạt động", variant: "outline" as const },
  //     [QuestionStatus.ARCHIVED]: { label: "Lưu trữ", variant: "destructive" as const },
  //   };

  //   const config = statusConfig[status];
  //   return <Badge variant={config.variant}>{config.label}</Badge>;
  // };



  return (
    <div className={`question-bank space-y-4 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Question Bank
              <Badge variant="secondary">{filteredAndSortedQuestions.length} câu hỏi</Badge>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Thêm câu hỏi
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <QuestionBankFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            difficultyFilter={difficultyFilter}
            onDifficultyFilterChange={setDifficultyFilter}
          />

          {/* Bulk Actions */}
          {selectable && selectedQuestions.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm text-blue-800">
                Đã chọn {selectedQuestions.length} câu hỏi
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("export")}>
                  <Download className="h-4 w-4 mr-2" />
                  Xuất
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("duplicate")}>
                  Sao chép
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleBulkAction("delete")}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <QuestionBankTable
            questions={filteredAndSortedQuestions}
            selectedQuestions={selectedQuestions}
            onSelectAll={handleSelectAll}
            onSelectQuestion={handleSelectQuestion}
            onQuestionSelect={onQuestionSelect}
            onQuestionEdit={onQuestionEdit}
            onQuestionDelete={onQuestionDelete}
            selectable={selectable}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </CardContent>
      </Card>
    </div>
  );
}
