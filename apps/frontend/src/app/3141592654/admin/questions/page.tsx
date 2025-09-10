'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  MoreHorizontal,
  FileText,
  Upload,
  Bookmark,
  Map,
  Loader2,
  AlertTriangle
} from 'lucide-react';

import {
  Button,
  Card,
  CardContent,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui';
import { useToast } from '@/components/ui/feedback/use-toast';
import { ErrorBoundary } from '@/components/ui/feedback/error-boundary';

import {
  Question,
  QuestionFilters,
  QuestionType,
  QuestionStatus
} from '@/lib/types/question';
// Removed unused imports - now using ComprehensiveQuestionFiltersNew
import { ComprehensiveQuestionFiltersNew } from '@/components/admin/questions/filters';
import { MockQuestionsService } from '@/lib/services/mock/questions';
import { ADMIN_PATHS } from '@/lib/admin-paths';

/**
 * Admin Questions List Page
 * Trang danh sách câu hỏi với filters, pagination và bulk actions
 */
export default function AdminQuestionsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // State management cho questions list
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<QuestionFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Ref để track previous values và tránh infinite loop
  const prevFiltersRef = useRef<QuestionFilters>({});
  const prevPageRef = useRef<number>(1);

  /**
   * Load questions data từ mock service
   */
  const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await MockQuestionsService.listQuestions({
        page: currentPage,
        pageSize,
        ...filters
      });

      setQuestions(response.data);
      setTotalQuestions(response.pagination.total);
    } catch (error) {
      console.error('Lỗi khi tải danh sách câu hỏi:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách câu hỏi',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, filters, toast]);

  // Initial load khi component mount
  useEffect(() => {
    loadQuestions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load questions khi dependencies thực sự thay đổi
  useEffect(() => {
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(prevFiltersRef.current);
    const pageChanged = currentPage !== prevPageRef.current;

    if (filtersChanged || pageChanged) {
      prevFiltersRef.current = filters;
      prevPageRef.current = currentPage;
      loadQuestions();
    }
  }, [filters, currentPage, loadQuestions]);

  /**
   * Handle filter changes
   */
  const handleFilterChange = useCallback((newFilters: Partial<QuestionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset về trang đầu khi filter
  }, []);

  /**
   * Handle selection changes
   */
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleToggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? questions.map(q => q.id) : []);
  };

  /**
   * Navigation handlers
   */
  const handleCreateQuestion = () => {
    router.push(ADMIN_PATHS.QUESTIONS_CREATE);
  };

  const handleEditQuestion = (id: string) => {
    router.push(`/3141592654/admin/questions/${id}/edit`);
  };

  const handleViewQuestion = (id: string) => {
    router.push(`/questions/${id}`);
  };

  /**
   * Bulk actions handlers
   */
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    try {
      await MockQuestionsService.bulkDelete(selectedIds);
      toast({
        title: 'Thành công',
        description: `Đã xóa ${selectedIds.length} câu hỏi`,
        variant: 'success'
      });
      setSelectedIds([]);
      loadQuestions();
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa câu hỏi',
        variant: 'destructive'
      });
    }
  };

  const handleBulkUpdateStatus = async () => {
    if (selectedIds.length === 0) return;

    try {
      await MockQuestionsService.bulkUpdateStatus(selectedIds);
      toast({
        title: 'Thành công',
        description: `Đã cập nhật trạng thái ${selectedIds.length} câu hỏi`,
        variant: 'success'
      });
      setSelectedIds([]);
      loadQuestions();
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái',
        variant: 'destructive'
      });
    }
  };

  /**
   * Render question type badge
   */
  const _renderQuestionTypeBadge = (type: QuestionType) => {
    const typeLabels = {
      [QuestionType.MC]: 'Trắc nghiệm',
      [QuestionType.TF]: 'Đúng/Sai',
      [QuestionType.SA]: 'Tự luận ngắn',
      [QuestionType.ES]: 'Tự luận',
      [QuestionType.MA]: 'Ghép đôi'
    };

    const typeColors = {
      [QuestionType.MC]: 'bg-badge-default text-badge-default-foreground border border-border',
      [QuestionType.TF]: 'bg-badge-success text-badge-success-foreground border border-border',
      [QuestionType.SA]: 'bg-badge-warning text-badge-warning-foreground border border-border',
      [QuestionType.ES]: 'bg-badge-secondary text-badge-secondary-foreground border border-border',
      [QuestionType.MA]: 'bg-badge-secondary text-badge-secondary-foreground border border-border'
    };

    return (
      <Badge className={typeColors[type]}>
        {typeLabels[type]}
      </Badge>
    );
  };

  /**
   * Render status badge
   */
  const renderStatusBadge = (status?: QuestionStatus) => {
    if (!status) return null;

    const statusLabels = {
      [QuestionStatus.ACTIVE]: 'Hoạt động',
      [QuestionStatus.PENDING]: 'Chờ duyệt',
      [QuestionStatus.INACTIVE]: 'Không hoạt động',
      [QuestionStatus.ARCHIVED]: 'Lưu trữ'
    };

    const statusColors = {
      [QuestionStatus.ACTIVE]: 'bg-badge-success text-badge-success-foreground border border-border',
      [QuestionStatus.PENDING]: 'bg-badge-warning text-badge-warning-foreground border border-border',
      [QuestionStatus.INACTIVE]: 'bg-muted text-muted-foreground border border-border',
      [QuestionStatus.ARCHIVED]: 'bg-badge-error text-badge-error-foreground border border-border'
    };

    return (
      <Badge className={statusColors[status]}>
        {statusLabels[status]}
      </Badge>
    );
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Quản lý câu hỏi</h1>
              <p className="text-muted-foreground mt-1">
                Tổng cộng {totalQuestions} câu hỏi
              </p>
            </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleCreateQuestion}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo mới
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push(ADMIN_PATHS.QUESTIONS_INPUT_LATEX)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Nhập LaTeX
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(ADMIN_PATHS.QUESTIONS_INPUT_AUTO)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Nhập tự động
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(ADMIN_PATHS.QUESTIONS_SAVED)}
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Đã lưu
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push(ADMIN_PATHS.QUESTIONS_MAP_ID)}
            >
              <Map className="h-4 w-4 mr-2" />
              Map ID
            </Button>
          </div>
        </div>

        {/* Comprehensive Filters System */}
        <ComprehensiveQuestionFiltersNew
          onFiltersChange={handleFilterChange}
          isLoading={isLoading}
          defaultFilters={{
            page: currentPage,
            pageSize: pageSize
          }}
        />

        {/* Bulk actions */}
        {selectedIds.length > 0 && (
          <Card className="border-primary/20 bg-primary/10 backdrop-blur-sm shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground font-medium">
                  Đã chọn {selectedIds.length} câu hỏi
                </span>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkUpdateStatus()}
                  >
                    Kích hoạt
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkUpdateStatus()}
                  >
                    Vô hiệu hóa
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={handleBulkDelete}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions table */}
        <Card className="shadow-sm border-border/60 bg-background/80 backdrop-blur-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-foreground font-medium">Đang tải...</span>
              </div>
            ) : questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Không có câu hỏi nào
                </h3>
                <p className="text-muted-foreground mb-4">
                  Không tìm thấy câu hỏi phù hợp với bộ lọc hiện tại
                </p>
                <Button onClick={handleCreateQuestion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo câu hỏi đầu tiên
                </Button>
              </div>
            ) : (
              <>
                {/* Container with fixed header like Users page */}
                <div
                  className="border border-border rounded-lg overflow-hidden bg-background"
                  style={{
                    maxHeight: '75vh',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Scrollable table with sticky header */}
                  <div className="flex-1 overflow-auto">
                    <Table>
                      <colgroup>
                        <col style={{ width: '48px' }} />
                        <col style={{ width: '64px' }} />
                        <col />
                        <col style={{ width: '160px' }} />
                        <col style={{ width: '48px' }} />
                      </colgroup>
                      <TableHeader className="sticky top-0 z-50 bg-background border-b-2 border-border">
                        <TableRow className="bg-background hover:bg-background">
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedIds.length === questions.length}
                              onCheckedChange={handleToggleSelectAll}
                            />
                          </TableHead>
                          <TableHead className="w-16 text-center font-semibold text-foreground">STT</TableHead>
                          <TableHead className="font-semibold text-foreground">Nội dung</TableHead>
                          <TableHead className="font-semibold w-40 text-center text-foreground">Trạng thái</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                  {questions.map((question, index) => (
                    <TableRow
                      key={question.id}
                      className={`
                        ${index % 2 === 0 ? 'bg-muted/30' : 'bg-background/50'}
                        hover:bg-muted/50 transition-colors duration-150
                      `}
                    >
                      <TableCell className="w-12 py-4">
                        <Checkbox
                          checked={selectedIds.includes(question.id)}
                          onCheckedChange={() => handleToggleSelect(question.id)}
                        />
                      </TableCell>
                      {/* STT thực tế theo trang và filter */}
                      <TableCell className="w-16 text-center text-sm text-muted-foreground py-4">
                        {(currentPage - 1) * pageSize + index + 1}
                      </TableCell>
                      <TableCell className="min-w-0 py-4">
                        <div className="max-w-2xl space-y-2">
                          <p className="font-medium text-foreground whitespace-normal break-words leading-relaxed">
                            {question.content}
                          </p>
                          {question.tag.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {question.tag.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {question.tag.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{question.tag.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="w-40 text-center py-4">
                        {renderStatusBadge(question.status)}
                      </TableCell>
                      <TableCell className="w-12 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewQuestion(question.id)}>
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditQuestion(question.id)}>
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleBulkDelete()}
                            >
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {!isLoading && questions.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalQuestions)} 
              trong tổng số {totalQuestions} câu hỏi
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Trước
              </Button>
                <span className="text-sm text-foreground">
                  Trang {currentPage} / {Math.ceil(totalQuestions / pageSize)}
                </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= Math.ceil(totalQuestions / pageSize)}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
