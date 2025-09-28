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
import { 
  Plus, 
  Download, 
  Upload, 
  FileText, 
  BarChart3,
  Settings,
  Archive,
  Trash2
} from 'lucide-react';

// UI Components
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui';

// Hooks
import { useToast } from '@/hooks/use-toast';

// Types
import { Exam, ExamFilters } from '@/lib/types/exam';

// Services
import { ExamService } from '@/services/grpc/exam.service';

// Components
import { ExamGrid } from '@/components/exams/management/exam-grid';
import { BulkOperations } from '@/components/exams/management/bulk-operations';

// Paths
import { ADMIN_PATHS } from '@/lib/admin-paths';

// ===== TYPES =====

interface AdminExamPageState {
  exams: Exam[];
  loading: boolean;
  error: string | null;
  selectedIds: string[];
  filters: ExamFilters;
  totalItems: number;
  currentPage: number;
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
  filters: DEFAULT_FILTERS,
  totalItems: 0,
  currentPage: 1,
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

  const [state, setState] = useState<AdminExamPageState>(DEFAULT_STATE);

  // ===== EFFECTS =====

  useEffect(() => {
    loadExams();
  }, [state.filters]);

  // ===== HANDLERS =====

  const loadExams = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await ExamService.listExams(state.filters);
      
      setState(prev => ({
        ...prev,
        exams: response.exams,
        totalItems: response.total,
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
  }, [state.filters, toast]);

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

  const handleFiltersChange = (filters: ExamFilters) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters, page: 1 },
      currentPage: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, page },
      currentPage: page,
    }));
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setState(prev => ({ ...prev, selectedIds }));
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

  const handleAnalytics = () => {
    router.push(ADMIN_PATHS.EXAMS_ANALYTICS);
  };

  const handleSettings = () => {
    router.push(ADMIN_PATHS.EXAMS_SETTINGS);
  };

  // ===== RENDER =====

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý đề thi</h1>
          <p className="text-muted-foreground">
            Tạo, chỉnh sửa và quản lý đề thi trong hệ thống
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleAnalytics}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Thống kê
          </Button>
          
          <Button variant="outline" onClick={handleSettings}>
            <Settings className="h-4 w-4 mr-2" />
            Cài đặt
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Thao tác
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Xuất dữ liệu
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Upload className="h-4 w-4 mr-2" />
                Nhập dữ liệu
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Báo cáo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleCreateExam}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo đề thi
          </Button>
        </div>
      </div>

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
        totalItems={state.totalItems}
        currentPage={state.currentPage}
        selectedIds={state.selectedIds}
        showFilters={true}
        showSearch={true}
        showBulkActions={false} // Handled by BulkOperations component
        showCreateButton={false} // We have our own create button
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
      />
    </div>
  );
}
