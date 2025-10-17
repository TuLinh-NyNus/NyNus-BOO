/**
 * Exam Management Page (Teacher/Admin)
 * Comprehensive exam management interface for teachers and administrators
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
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

// UI Components
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';

// Hooks
import { useToast } from '@/hooks';
import { useAuth } from '@/contexts/auth-context-grpc';

// Types
import { Exam, ExamFilters } from '@/types/exam';
import { UserRole } from '@/types/user';

// Services
import { ExamService } from '@/services/grpc/exam.service';

// Components
import { ExamGrid } from '@/components/features/exams/management/exam-grid';
import { BulkOperations } from '@/components/features/exams/management/bulk-operations';

// Paths
import { EXAM_ROUTES } from '@/lib/exam-paths';

// ===== TYPES =====

interface ExamManagePageState {
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

const DEFAULT_STATE: ExamManagePageState = {
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
 * Exam Management Page Component
 * Main page for comprehensive exam management (Teacher/Admin only)
 */
export default function ExamManagePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  // ===== STATE =====

  const [state, setState] = useState<ExamManagePageState>(DEFAULT_STATE);

  // ===== ROLE CHECK =====

  // Check if user is teacher or admin
  if (!authLoading && (!user || (user.role !== UserRole.USER_ROLE_TEACHER && user.role !== UserRole.USER_ROLE_ADMIN))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-orange-500/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Không có quyền truy cập
            </CardTitle>
            <CardDescription>
              Bạn cần có quyền giáo viên hoặc quản trị viên để truy cập trang này.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Về Dashboard
            </Button>
            <Button onClick={() => router.push(EXAM_ROUTES.BROWSE)} variant="outline" className="w-full">
              Duyệt đề thi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  // ===== EFFECTS =====

  useEffect(() => {
    if (!authLoading && user) {
      loadExams();
    }
  }, [authLoading, user, loadExams]);

  const handleCreateExam = () => {
    router.push(EXAM_ROUTES.CREATE);
  };

  const handleEditExam = (exam: Exam) => {
    router.push(`/exams/${exam.id}/edit`);
  };

  const handleViewExam = (exam: Exam) => {
    router.push(`/exams/${exam.id}`);
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

  // Show loading state during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-orange-500/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // ===== RENDER =====

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-orange-500/20">
      <div className="container mx-auto py-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý đề thi</h1>
            <p className="text-muted-foreground">
              Tạo, chỉnh sửa và quản lý đề thi của bạn
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
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
          showBulkActions={false}
          showCreateButton={false}
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
    </div>
  );
}

