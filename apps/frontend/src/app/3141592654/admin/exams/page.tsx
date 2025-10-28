/**
 * Admin Exam Management Page
 * Comprehensive exam management interface for administrators
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// UI Components removed - not used in current implementation

// Hooks
import { useToast } from '@/hooks';

// Types
import { Exam, ExamFilters } from '@/types/exam';

// Services
import { ExamService } from '@/services/grpc/exam.service';

// Components
import { ExamGrid } from '@/components/features/exams/management/exam-grid';
import { BulkOperations } from '@/components/features/exams/management/bulk-operations';

// Paths
import { ADMIN_PATHS } from '@/lib/admin-paths';

// ===== TYPES =====

export type ExamViewMode = 'grid' | 'list';

interface AdminExamPageState {
  exams: Exam[];
  loading: boolean;
  error: string | null;
  selectedIds: string[];
  totalItems: number;
  currentPage: number;
  viewMode: ExamViewMode;
}

// ===== CONSTANTS =====

const DEFAULT_FILTERS: ExamFilters = {
  search: '',
  page: 1,
  limit: 20,
};

const DEFAULT_STATE: AdminExamPageState = {
  exams: [],
  loading: false,
  error: null,
  selectedIds: [],
  totalItems: 0,
  currentPage: 1,
  viewMode: 'grid', // Default to grid view
};

// ===== MAIN COMPONENT =====

/**
 * Admin Exam Management Page Component
 * Main page for comprehensive exam management
 */
export default function AdminExamPage() {
  const router = useRouter();
  const { toast } = useToast();

  // ===== STATE =====

  // ✅ Separate filters state to prevent infinite loop
  const [filters, setFilters] = useState<ExamFilters>(DEFAULT_FILTERS);
  const [state, setState] = useState<AdminExamPageState>(DEFAULT_STATE);

  // ===== HANDLERS =====

  const loadExams = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // ✅ Use separate filters state instead of state.filters
      const response = await ExamService.listExams(filters);
      
      // Debug: Log response to check data
      console.log('ExamService.listExams response:', {
        examsCount: response.exams.length,
        total: response.total,
        page: response.page,
        pageSize: response.pageSize
      });

      setState(prev => ({
        ...prev,
        exams: response.exams,
        totalItems: response.total || response.exams.length,
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to load exams:', error);
      setState(prev => ({
        ...prev,
        error: 'Không thể tải danh sách đề thi',
        loading: false,
      }));

      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách đề thi',
        variant: 'destructive',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]); // ✅ toast is stable, no need in deps

  // ===== EFFECTS =====

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  const handleCreateExam = () => {
    router.push(ADMIN_PATHS.EXAMS_CREATE);
  };

  const handleEditExam = (exam: Exam) => {
    router.push(ADMIN_PATHS.EXAMS_EDIT(exam.id));
  };

  const handleViewExam = (exam: Exam) => {
    router.push(ADMIN_PATHS.EXAMS_VIEW(exam.id));
  };

  const handleDeleteExam = async (exam: Exam) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa đề thi "${exam.title}"?`)) {
      return;
    }

    try {
      await ExamService.deleteExam(exam.id);
      
      toast({
        title: 'Thành công',
        description: 'Đã xóa đề thi thành công',
      });
      
      loadExams();
    } catch (error) {
      console.error('Failed to delete exam:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa đề thi',
        variant: 'destructive',
      });
    }
  };

  const handlePublishExam = async (exam: Exam) => {
    try {
      await ExamService.publishExam(exam.id);
      
      toast({
        title: 'Thành công',
        description: 'Đã xuất bản đề thi thành công',
      });
      
      loadExams();
    } catch (error) {
      console.error('Failed to publish exam:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xuất bản đề thi',
        variant: 'destructive',
      });
    }
  };

  const handleArchiveExam = async (exam: Exam) => {
    try {
      await ExamService.archiveExam(exam.id);
      
      toast({
        title: 'Thành công',
        description: 'Đã lưu trữ đề thi thành công',
      });
      
      loadExams();
    } catch (error) {
      console.error('Failed to archive exam:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu trữ đề thi',
        variant: 'destructive',
      });
    }
  };

  const handleFiltersChange = (newFilters: ExamFilters) => {
    // ✅ Update separate filters state instead of state.filters
    setFilters({ ...filters, ...newFilters, page: 1 });
    setState(prev => ({
      ...prev,
      currentPage: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    // ✅ Update separate filters state instead of state.filters
    setFilters({ ...filters, page });
    setState(prev => ({
      ...prev,
      currentPage: page,
    }));
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setState(prev => ({ ...prev, selectedIds }));
  };

  const handleViewModeChange = (mode: ExamViewMode) => {
    setState(prev => ({ ...prev, viewMode: mode }));
    // Optionally persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('exam-view-mode', mode);
    }
  };

  const handleBulkDelete = async (examIds: string[]) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa ${examIds.length} đề thi đã chọn?`)) {
      return;
    }

    try {
      await Promise.all(examIds.map(id => ExamService.deleteExam(id)));
      
      toast({
        title: 'Thành công',
        description: `Đã xóa ${examIds.length} đề thi thành công`,
      });
      
      setState(prev => ({ ...prev, selectedIds: [] }));
      loadExams();
    } catch (error) {
      console.error('Failed to bulk delete exams:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa các đề thi đã chọn',
        variant: 'destructive',
      });
    }
  };

  const handleBulkPublish = async (examIds: string[]) => {
    try {
      await Promise.all(examIds.map(id => ExamService.publishExam(id)));
      
      toast({
        title: 'Thành công',
        description: `Đã xuất bản ${examIds.length} đề thi thành công`,
      });
      
      setState(prev => ({ ...prev, selectedIds: [] }));
      loadExams();
    } catch (error) {
      console.error('Failed to bulk publish exams:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xuất bản các đề thi đã chọn',
        variant: 'destructive',
      });
    }
  };

  const handleBulkArchive = async (examIds: string[]) => {
    try {
      await Promise.all(examIds.map(id => ExamService.archiveExam(id)));
      
      toast({
        title: 'Thành công',
        description: `Đã lưu trữ ${examIds.length} đề thi thành công`,
      });
      
      setState(prev => ({ ...prev, selectedIds: [] }));
      loadExams();
    } catch (error) {
      console.error('Failed to bulk archive exams:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu trữ các đề thi đã chọn',
        variant: 'destructive',
      });
    }
  };

  const handleExport = () => {
    // This will be handled by BulkOperations component
    console.log('Export handled by BulkOperations');
  };

  const handleImport = () => {
    // This will trigger the import dialog in BulkOperations
    // For now, just log - actual implementation will be in BulkOperations
    console.log('Import triggered from header button');
  };

  // Analytics and Settings handlers removed - not used in current implementation

  // ===== RENDER =====

  return (
    <div className="space-y-6">
      {/* Bulk Operations */}
      <BulkOperations
        selectedExams={state.exams.filter(exam => state.selectedIds.includes(exam.id))}
        onClearSelection={() => setState(prev => ({ ...prev, selectedIds: [] }))}
        onBulkDelete={handleBulkDelete}
        onBulkPublish={handleBulkPublish}
        onBulkArchive={handleBulkArchive}
        onImportComplete={(count) => {
          toast({
            title: 'Thành công',
            description: `Đã nhập ${count} đề thi thành công`,
          });
          loadExams();
        }}
      />

      {/* Exam Grid */}
      <ExamGrid
        exams={state.exams}
        loading={state.loading}
        error={state.error}
        viewMode={state.viewMode}
        totalItems={state.totalItems}
        currentPage={state.currentPage}
        selectedIds={state.selectedIds}
        showFilters={true}
        showSearch={true}
        showBulkActions={false} // Handled by BulkOperations component
        showCreateButton={true} // Show create button in grid header
        onViewModeChange={handleViewModeChange}
        onFiltersChange={handleFiltersChange}
        onPageChange={handlePageChange}
        onSelectionChange={handleSelectionChange}
        onCreateExam={handleCreateExam}
        onEditExam={handleEditExam}
        onDeleteExam={handleDeleteExam}
        onViewExam={handleViewExam}
        onPublishExam={handlePublishExam}
        onArchiveExam={handleArchiveExam}
        onBulkDelete={handleBulkDelete}
        onBulkPublish={handleBulkPublish}
        onBulkArchive={handleBulkArchive}
        onExport={handleExport}
        onImport={handleImport}
      />
    </div>
  );
}
