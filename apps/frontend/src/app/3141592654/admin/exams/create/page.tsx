/**
 * Admin Create Exam Page
 * Enhanced exam creation interface for administrators
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, FileText } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';

// Types
import { ExamFormData, ExamStatus } from '@/lib/types/exam';

// Services
import { ExamService } from '@/services/grpc/exam.service';

// Components
import { ExamForm } from '@/components/exams/management/exam-form';
import { ExamPreview } from '@/components/exams/management/exam-preview';

// Hooks
import { useToast } from '@/hooks/use-toast';

// Paths
import { ADMIN_PATHS } from '@/lib/admin-paths';

// ===== MAIN COMPONENT =====

/**
 * Admin Create Exam Page Component
 * Enhanced exam creation with admin-specific features
 */
export default function AdminCreateExamPage() {
  const router = useRouter();
  const { toast } = useToast();

  // ===== STATE =====

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ===== HANDLERS =====

  const handleBack = () => {
    router.push(ADMIN_PATHS.EXAMS);
  };

  const handleSubmit = async (formData: ExamFormData) => {
    setSubmitting(true);
    
    try {
      // Create exam with active status (admin can publish immediately)
      const examData: ExamFormData = {
        ...formData,
        status: ExamStatus.ACTIVE
      };

      const createdExam = await ExamService.createExam(examData);

      toast({
        title: 'Thành công',
        description: 'Đã tạo đề thi thành công',
      });

      // Navigate to admin exam view
      router.push(ADMIN_PATHS.EXAMS_VIEW(createdExam.id));
    } catch (error) {
      console.error('Failed to create exam:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo đề thi',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(ADMIN_PATHS.EXAMS);
  };

  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<ExamFormData | null>(null);

  const handlePreview = (formData: ExamFormData) => {
    setPreviewData(formData);
    setShowPreview(true);
  };

  // ===== RENDER =====

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tạo đề thi mới</h1>
            <p className="text-muted-foreground">
              Tạo đề thi với quyền quản trị viên
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              toast({
                title: 'Thông báo',
                description: 'Tính năng lưu nháp đang được phát triển',
                variant: 'default'
              });
            }}
          >
            <Save className="h-4 w-4 mr-2" />
            Lưu nháp
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              toast({
                title: 'Thông báo',
                description: 'Tính năng xem trước đang được phát triển',
                variant: 'default'
              });
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            Xem trước
          </Button>
        </div>
      </div>

      {/* Admin Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Quyền quản trị viên</h3>
            <p className="text-sm text-blue-700 mt-1">
              Với quyền quản trị viên, bạn có thể:
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Tạo đề thi và xuất bản ngay lập tức</li>
              <li>• Truy cập tất cả câu hỏi trong hệ thống</li>
              <li>• Thiết lập cấu hình nâng cao</li>
              <li>• Quản lý quyền truy cập đề thi</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Exam Form */}
      <div className="bg-white rounded-lg border">
        <ExamForm
          mode="create"
          loading={loading}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onPreview={handlePreview}
        />
      </div>

      {/* Exam Preview */}
      <ExamPreview
        examData={previewData}
        questions={[]} // TODO: Get questions from form
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onEdit={() => {
          setShowPreview(false);
          // Focus back to form
        }}
        onPublish={() => {
          if (previewData) {
            handleSubmit(previewData);
          }
          setShowPreview(false);
        }}
      />
    </div>
  );
}
