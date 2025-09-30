'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Download, 
  Upload, 
  FileText, 
  Bookmark,
  Map
} from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui';
import { useToast } from '@/hooks';
import { ADMIN_PATHS } from '@/lib/admin-paths';
import { ComprehensiveQuestionFiltersNew } from '@/components/admin/questions/filters';
import { QuestionList } from '@/components/admin/questions/list';
import { useQuestionStore, questionSelectors } from '@/lib/stores/question.store';
import { QuestionFilters } from '@/types/question';

/**
 * Admin Questions Page
 * Trang quản lý câu hỏi sử dụng Question Store với gRPC
 */
export default function AdminQuestionsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Store selectors
  const questions = useQuestionStore(questionSelectors.questions);
  const isLoading = useQuestionStore(questionSelectors.isLoading);
  const pagination = useQuestionStore(questionSelectors.pagination);
  const selectedIds = useQuestionStore(questionSelectors.selectedIds);
  const lastAppliedFilters = useQuestionStore(questionSelectors.lastAppliedFilters);

  // Store actions
  const applyFilters = useQuestionStore((s) => s.applyFilters);
  const deleteQuestion = useQuestionStore((s) => s.deleteQuestion);
  const setPage = useQuestionStore((s) => s.setPage);
  const setPageSize = useQuestionStore((s) => s.setPageSize);
  const fetchQuestions = useQuestionStore((s) => s.fetchQuestions);
  const deselectAllQuestions = useQuestionStore((s) => s.deselectAllQuestions);
  const selectQuestion = useQuestionStore((s) => s.selectQuestion);

  // Navigation handlers
  const handleCreateQuestion = () => {
    router.push(ADMIN_PATHS.QUESTIONS_CREATE);
  };

  const handleImportLatex = () => {
    router.push(ADMIN_PATHS.QUESTIONS_INPUT_LATEX);
  };

  const handleImportAuto = () => {
    router.push(ADMIN_PATHS.QUESTIONS_INPUT_AUTO);
  };

  const handleSavedQuestions = () => {
    router.push(ADMIN_PATHS.QUESTIONS_SAVED);
  };

  const handleMapId = () => {
    router.push(ADMIN_PATHS.QUESTIONS_MAP_ID);
  };

  const handleQuestionBank = () => {
    // Navigate to question bank
    router.push('/3141592654/admin/questions/bank');
  };

  const handleExport = () => {
    toast({
      title: 'Thông báo',
      description: 'Tính năng xuất câu hỏi đang được phát triển',
      variant: 'default'
    });
  };

  // Handlers mapping to list/filters components
  const handleFiltersChange = useCallback(async (filters: QuestionFilters) => {
    await applyFilters(filters);
  }, [applyFilters]);

  const handleSelectionChange = useCallback((ids: string[]) => {
    // Reset then select provided ids to sync with store
    deselectAllQuestions();
    ids.forEach((id) => selectQuestion(id));
  }, [deselectAllQuestions, selectQuestion]);

  const handlePaginationChange = useCallback(async (page: number, pageSize: number) => {
    setPageSize(pageSize);
    setPage(page);
    await fetchQuestions(lastAppliedFilters || undefined);
  }, [setPage, setPageSize, fetchQuestions, lastAppliedFilters]);

  const handleDelete = useCallback(async (id: string) => {
    const ok = await deleteQuestion(id);
    if (ok) {
      toast({ title: 'Thành công', description: 'Đã xóa câu hỏi', variant: 'success' });
      await fetchQuestions(lastAppliedFilters || undefined);
    } else {
      toast({ title: 'Lỗi', description: 'Không thể xóa câu hỏi', variant: 'destructive' });
    }
  }, [deleteQuestion, fetchQuestions, lastAppliedFilters, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Quản lý câu hỏi
            </h1>
            <p className="text-muted-foreground mt-1">
              Tạo, chỉnh sửa và quản lý ngân hàng câu hỏi
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Create Button */}
            <Button onClick={handleCreateQuestion}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo câu hỏi
            </Button>

            {/* Import Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Nhập câu hỏi
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleImportLatex}>
                  <FileText className="h-4 w-4 mr-2" />
                  Nhập từ LaTeX
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleImportAuto}>
                  <Upload className="h-4 w-4 mr-2" />
                  Nhập tự động
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleMapId}>
                  <Map className="h-4 w-4 mr-2" />
                  Map ID câu hỏi
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick Actions */}
            <Button variant="outline" onClick={handleSavedQuestions}>
              <Bookmark className="h-4 w-4 mr-2" />
              Đã lưu
            </Button>

            <Button variant="outline" onClick={handleQuestionBank}>
              <FileText className="h-4 w-4 mr-2" />
              Ngân hàng
            </Button>

            {/* Export */}
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Xuất file
            </Button>
          </div>
        </div>

        {/* Filters Component */}
        <ComprehensiveQuestionFiltersNew
          onFiltersChange={handleFiltersChange}
          isLoading={isLoading}
          defaultFilters={lastAppliedFilters || {}}
        />

        {/* Questions List Component */}
        <QuestionList
          questions={questions}
          loading={isLoading}
          selectedQuestions={selectedIds}
          onSelectionChange={handleSelectionChange}
          onQuestionEdit={(id) => router.push(`/3141592654/admin/questions/${id}/edit`)}
          onQuestionDelete={handleDelete}
          userRole="ADMIN"
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          showBulkActions
        />
      </div>
    </div>
  );
}