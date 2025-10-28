'use client';

console.log('🔥 [FILE LOAD] AdminQuestionsPage file is being loaded');

import React, { useCallback, useMemo, useState, useEffect } from 'react';
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
// FIXED: Re-enable imports after fixing infinite loop
import { ComprehensiveQuestionFiltersNew } from '@/components/admin/questions/filters';
import { QuestionList } from '@/components/admin/questions/list';
import { BulkActionBar } from '@/components/admin/questions/bulk-action-bar';
import { BulkEditModal, BulkEditData } from '@/components/admin/questions/bulk-edit-modal';
import { BulkDeleteDialog } from '@/components/admin/questions/bulk-delete-dialog';
import { ExportDialog } from '@/components/admin/questions/export-dialog';
import { useQuestionStore, questionSelectors } from '@/lib/stores/question.store';
import { QuestionFilters } from '@/types/question';
import { useAdminAnalytics } from '@/hooks/use-analytics';

/**
 * Admin Questions Page
 * Trang quản lý câu hỏi sử dụng Question Store với gRPC
 */
export default function AdminQuestionsPage() {
  console.log('🚀 [AdminQuestionsPage] Component rendered/re-rendered');
  
  const router = useRouter();
  const { toast } = useToast();
  const { trackBulkOp } = useAdminAnalytics();
  
  // Favorite functionality removed - not used in current implementation

  // FIXED: Re-enable store hooks after fixing infinite loop
  // Store selectors
  const questions = useQuestionStore(questionSelectors.questions);
  const isLoading = useQuestionStore(questionSelectors.isLoading);
  const pagination = useQuestionStore(questionSelectors.pagination);
  // FIXED: selectedIds now returns Set instead of Array to prevent infinite loop
  const selectedIdsSet = useQuestionStore(questionSelectors.selectedIds);
  const lastAppliedFilters = useQuestionStore(questionSelectors.lastAppliedFilters);

  // Store actions
  const applyFilters = useQuestionStore((s) => s.applyFilters);
  const deleteQuestion = useQuestionStore((s) => s.deleteQuestion);
  const setPage = useQuestionStore((s) => s.setPage);
  const setPageSize = useQuestionStore((s) => s.setPageSize);
  const fetchQuestions = useQuestionStore((s) => s.fetchQuestions);
  const deselectAllQuestions = useQuestionStore((s) => s.deselectAllQuestions);
  const selectQuestion = useQuestionStore((s) => s.selectQuestion);

  // Convert Set to Array only when needed for component props
  const selectedIds = useMemo(() => Array.from(selectedIdsSet), [selectedIdsSet]);

  // Load questions on component mount
  useEffect(() => {
    console.log('🔍 [AdminQuestionsPage] useEffect triggered - ALWAYS RUNS');
    
    // Get fresh state each time
    const state = useQuestionStore.getState();
    console.log('📊 [AdminQuestionsPage] Current state:', {
      hasFetchedQuestions: state.hasFetchedQuestions,
      isLoading: state.isLoading,
      questionsLength: state.questions.length,
      error: state.error
    });
    
    // Always try to fetch if no questions and not loading
    if (state.questions.length === 0 && !state.isLoading) {
      console.log('🚀 [AdminQuestionsPage] Calling fetchQuestions - no questions found');
      fetchQuestions().catch(error => {
        console.error('❌ [AdminQuestionsPage] fetchQuestions failed:', error);
      });
    } else {
      console.log('⏭️ [AdminQuestionsPage] Skipping fetchQuestions', {
        questionsLength: state.questions.length,
        isLoading: state.isLoading,
        reason: state.questions.length > 0 ? 'questions already loaded' : 'currently loading'
      });
    }
  }, [fetchQuestions]); // ✅ Include fetchQuestions dependency

  // Separate useEffect to log when questions change
  useEffect(() => {
    console.log('📝 [AdminQuestionsPage] Questions updated:', {
      count: questions.length,
      isLoading,
      error: useQuestionStore.getState().error
    });
  }, [questions.length, isLoading]);

  // Bulk operations state
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isBulkOperationLoading, setIsBulkOperationLoading] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

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
    setShowExportDialog(true);
  };

  // TEMPORARY FIX: Stub handlers to avoid store dependencies
  // FIXED: Re-enable handlers after fixing infinite loop
  const handleFiltersChange = useCallback(async (filters: QuestionFilters) => {
    await applyFilters(filters);
  }, [applyFilters]);

  const handleSelectionChange = useCallback((ids: string[]) => {
    deselectAllQuestions();
    ids.forEach((id) => selectQuestion(id));
  }, [deselectAllQuestions, selectQuestion]);

  const handlePaginationChange = useCallback(async (page: number, pageSize: number) => {
    const pageSizeChanged = pageSize !== pagination.pageSize;
    const pageChanged = page !== pagination.page;

    if (!pageSizeChanged && !pageChanged) {
      return;
    }

    if (pageSizeChanged) {
      setPageSize(pageSize, { silent: true });
    }

    if (pageChanged || pageSizeChanged) {
      setPage(page, { silent: true });
    }

    await fetchQuestions(lastAppliedFilters || undefined);
  }, [pagination.page, pagination.pageSize, setPage, setPageSize, fetchQuestions, lastAppliedFilters]);

  const handleDelete = useCallback(async (id: string) => {
    const ok = await deleteQuestion(id);
    if (ok) {
      toast({ title: 'Thành công', description: 'Đã xóa câu hỏi', variant: 'default' });
      await fetchQuestions(lastAppliedFilters || undefined);
    } else {
      toast({ title: 'Lỗi', description: 'Không thể xóa câu hỏi', variant: 'destructive' });
    }
  }, [deleteQuestion, toast, fetchQuestions, lastAppliedFilters]);

  // Favorite handler removed - not used in current implementation

  // Bulk operation handlers
  const handleBulkEdit = useCallback(async (data: BulkEditData) => {
    setIsBulkOperationLoading(true);
    
    try {
      // TODO: Call bulk update API
      console.log('Bulk update:', {
        questionIds: selectedIds,
        data,
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      trackBulkOp('bulk_edit', selectedIds.length);
      
      toast({
        title: 'Thành công',
        description: `Đã cập nhật ${selectedIds.length} câu hỏi`,
        variant: 'default',
      });

      // Refresh questions
      await fetchQuestions(lastAppliedFilters || undefined);
      
      // Clear selection
      deselectAllQuestions();
      setShowBulkEditModal(false);
    } catch (error) {
      console.error('Bulk edit error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật câu hỏi',
        variant: 'destructive',
      });
    } finally {
      setIsBulkOperationLoading(false);
    }
  }, [selectedIds, trackBulkOp, toast, fetchQuestions, lastAppliedFilters, deselectAllQuestions]);

  const handleBulkDelete = useCallback(async () => {
    setIsBulkOperationLoading(true);
    
    try {
      // TODO: Call bulk delete API
      console.log('Bulk delete:', selectedIds);

      // Delete one by one (temporary until bulk API is ready)
      const deletePromises = selectedIds.map(id => deleteQuestion(id));
      const results = await Promise.all(deletePromises);
      
      const successCount = results.filter(Boolean).length;

      trackBulkOp('bulk_delete', successCount);
      
      toast({
        title: 'Thành công',
        description: `Đã xóa ${successCount}/${selectedIds.length} câu hỏi`,
        variant: successCount === selectedIds.length ? 'default' : 'destructive',
      });

      // Refresh questions
      await fetchQuestions(lastAppliedFilters || undefined);
      
      // Clear selection
      deselectAllQuestions();
      setShowBulkDeleteDialog(false);
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa câu hỏi',
        variant: 'destructive',
      });
    } finally {
      setIsBulkOperationLoading(false);
    }
  }, [selectedIds, deleteQuestion, trackBulkOp, toast, fetchQuestions, lastAppliedFilters, deselectAllQuestions]);

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

        {/* FIXED: Re-enable ComprehensiveQuestionFiltersNew after fixing infinite loop */}
        <ComprehensiveQuestionFiltersNew
          onFiltersChange={handleFiltersChange}
          isLoading={isLoading}
          defaultFilters={lastAppliedFilters || {}}
        />

        {/* FIXED: Re-enable QuestionList after fixing infinite loop */}
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

      {/* Bulk Action Bar - Floating at bottom */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        totalCount={pagination.total}
        onEdit={() => setShowBulkEditModal(true)}
        onDelete={() => setShowBulkDeleteDialog(true)}
        onClearSelection={deselectAllQuestions}
        disabled={isBulkOperationLoading}
      />

      {/* Bulk Edit Modal */}
      <BulkEditModal
        isOpen={showBulkEditModal}
        selectedCount={selectedIds.length}
        onClose={() => setShowBulkEditModal(false)}
        onSave={handleBulkEdit}
        isLoading={isBulkOperationLoading}
      />

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        isOpen={showBulkDeleteDialog}
        selectedCount={selectedIds.length}
        onClose={() => setShowBulkDeleteDialog(false)}
        onConfirm={handleBulkDelete}
        isLoading={isBulkOperationLoading}
      />

      {/* Export Dialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        questions={questions}
        selectedQuestions={selectedIds.length > 0 ? selectedIds : undefined}
      />
    </div>
  );
}
