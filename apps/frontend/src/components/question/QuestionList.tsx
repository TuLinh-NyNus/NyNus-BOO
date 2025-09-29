/**
 * Question List Component
 * =======================
 * Comprehensive question list with table view, pagination, search and filters
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useQuestionManagement, QuestionFilters } from '@/hooks/question/use-question-management';
import { QuestionDetail, QuestionType, QuestionStatus, QuestionDifficulty } from '@/types/question.types';
import { QuestionHelpers } from '@/services/grpc/question.service';
import { QuestionFilterHelpers } from '@/services/grpc/question-filter.service';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Icons
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

// ========================================
// INTERFACES
// ========================================

interface QuestionListProps {
  onQuestionSelect?: (question: QuestionDetail) => void;
  onQuestionEdit?: (question: QuestionDetail) => void;
  onQuestionDelete?: (questionId: string) => void;
  onCreateNew?: () => void;
  showActions?: boolean;
  selectable?: boolean;
  className?: string;
}

interface FilterPanelProps {
  filters: QuestionFilters;
  onFiltersChange: (filters: QuestionFilters) => void;
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

// ========================================
// FILTER PANEL COMPONENT
// ========================================

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClear,
  isOpen,
  onToggle
}) => {
  const handleFilterChange = (key: keyof QuestionFilters, value: string | string[]) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="flex items-center gap-2"
      >
        <Filter className="h-4 w-4" />
        Bộ lọc
      </Button>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Bộ lọc câu hỏi</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
            >
              Xóa lọc
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
            >
              Đóng
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Question Type Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Loại câu hỏi</label>
            <Select
              value={filters.type?.[0] || ''}
              onValueChange={(value) => handleFilterChange('type', value ? [value as QuestionType] : [])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả loại</SelectItem>
                {QuestionHelpers.getTypeOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Trạng thái</label>
            <Select
              value={filters.status?.[0] || ''}
              onValueChange={(value) => handleFilterChange('status', value ? [value as QuestionStatus] : [])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả trạng thái</SelectItem>
                {QuestionHelpers.getStatusOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Độ khó</label>
            <Select
              value={filters.difficulty?.[0] || ''}
              onValueChange={(value) => handleFilterChange('difficulty', value ? [value as QuestionDifficulty] : [])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả độ khó" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả độ khó</SelectItem>
                {QuestionHelpers.getDifficultyOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grade Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Lớp</label>
            <Select
              value={filters.grades?.[0] || ''}
              onValueChange={(value) => handleFilterChange('grades', value ? [value] : [])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả lớp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả lớp</SelectItem>
                {QuestionFilterHelpers.getGradeOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Subject Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Môn học</label>
            <Select
              value={filters.subjects?.[0] || ''}
              onValueChange={(value) => handleFilterChange('subjects', value ? [value] : [])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả môn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả môn</SelectItem>
                {QuestionFilterHelpers.getSubjectOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Creator Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Người tạo</label>
            <Input
              placeholder="Nhập tên người tạo..."
              value={filters.creator || ''}
              onChange={(e) => handleFilterChange('creator', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ========================================
// MAIN COMPONENT
// ========================================

export const QuestionList: React.FC<QuestionListProps> = ({
  onQuestionSelect,
  onQuestionEdit,
  onQuestionDelete,
  onCreateNew,
  showActions = true,
  selectable = false,
  className = ''
}) => {
  // Hook state
  const {
    questions,
    totalCount,
    currentPage,
    totalPages,
    pageSize,
    isLoading,
    isRefreshing,
    error,
    searchQuery,
    filters,
    setSearchQuery,
    setCurrentPage,
    setPageSize,
    searchQuestions,
    applyFilters,
    clearFilters,
    refreshQuestions,
    clearError
  } = useQuestionManagement();

  // Local state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ===== HANDLERS =====

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchQuestions(query);
    }
  };

  const handleFiltersChange = (newFilters: QuestionFilters) => {
    applyFilters(newFilters);
  };

  const handleClearFilters = () => {
    clearFilters();
    setIsFilterOpen(false);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(parseInt(size));
  };

  const handleSelectQuestion = (id: string) => {
    if (!selectable) return;

    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === questions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questions.map(q => q.id)));
    }
  };

  // ===== COMPUTED VALUES =====

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => 
      Array.isArray(value) ? value.length > 0 : Boolean(value)
    );
  }, [filters]);

  const paginationInfo = useMemo(() => {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalCount);
    return { start, end };
  }, [currentPage, pageSize, totalCount]);

  // ===== UTILITY FUNCTIONS =====

  const getTypeBadgeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'MC': return 'default';
      case 'TF': return 'secondary';
      case 'SA': return 'outline';
      case 'ES': return 'destructive';
      case 'MA': return 'default';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'PENDING': return 'secondary';
      case 'INACTIVE': return 'outline';
      case 'ARCHIVED': return 'destructive';
      default: return 'outline';
    }
  };

  const getDifficultyBadgeVariant = (difficulty: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (difficulty) {
      case 'EASY': return 'secondary';
      case 'MEDIUM': return 'default';
      case 'HARD': return 'destructive';
      default: return 'outline';
    }
  };

  // ===== RENDER =====

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Danh sách câu hỏi</h2>
          <p className="text-muted-foreground">
            {totalCount.toLocaleString()} câu hỏi
            {hasActiveFilters && ' (đã lọc)'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {onCreateNew && (
            <Button onClick={onCreateNew} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tạo câu hỏi
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshQuestions}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Làm mới
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="ml-2 h-auto p-0 text-xs underline"
            >
              Đóng
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm câu hỏi..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <FilterPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClear={handleClearFilters}
          isOpen={isFilterOpen}
          onToggle={() => setIsFilterOpen(!isFilterOpen)}
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {selectable && (
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === questions.length && questions.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </TableHead>
                  )}
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Độ khó</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Người tạo</TableHead>
                  <TableHead>Lượt sử dụng</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  {showActions && <TableHead className="text-right">Hành động</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={selectable ? 9 : 8} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Đang tải dữ liệu...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : questions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={selectable ? 9 : 8} className="h-24 text-center text-muted-foreground">
                      Không tìm thấy câu hỏi nào
                    </TableCell>
                  </TableRow>
                ) : (
                  questions.map((question) => (
                    <TableRow key={question.id} className="hover:bg-muted/50">
                      {selectable && (
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(question.id)}
                            onChange={() => handleSelectQuestion(question.id)}
                            className="rounded"
                          />
                        </TableCell>
                      )}
                      <TableCell className="max-w-xs">
                        <div 
                          className="truncate cursor-pointer hover:text-primary"
                          onClick={() => onQuestionSelect?.(question)}
                          title={question.content}
                        >
                          {question.content || question.rawContent}
                        </div>
                        {question.subcountText && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {question.subcountText}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeBadgeVariant(question.type)}>
                          {QuestionHelpers.getTypeDisplayName(question.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getDifficultyBadgeVariant(question.difficulty)}>
                          {QuestionHelpers.getDifficultyDisplayName(question.difficulty)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(question.status || 'ACTIVE')}>
                          {QuestionHelpers.getStatusDisplayName(question.status || 'ACTIVE')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {question.createdBy || 'Không rõ'}
                      </TableCell>
                      <TableCell className="text-center">
                        {question.usageCount || 0}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(question.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      {showActions && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onQuestionSelect?.(question)}
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {onQuestionEdit && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onQuestionEdit(question)}
                                title="Chỉnh sửa"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {onQuestionDelete && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onQuestionDelete(question.id)}
                                className="text-destructive hover:text-destructive"
                                title="Xóa"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Hiển thị {paginationInfo.start} - {paginationInfo.end} trong {totalCount.toLocaleString()} câu hỏi
            </span>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span>/ trang</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1 mx-2">
              <span className="text-sm">Trang</span>
              <Input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value) || 1;
                  handlePageChange(page);
                }}
                className="w-16 h-8 text-center"
              />
              <span className="text-sm">/ {totalPages}</span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Selected Items Actions */}
      {selectable && selectedIds.size > 0 && (
        <div className="fixed bottom-4 right-4 bg-background border rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              Đã chọn {selectedIds.size} câu hỏi
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Xuất
              </Button>
              <Button size="sm" variant="outline">
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setSelectedIds(new Set())}
              >
                Hủy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionList;