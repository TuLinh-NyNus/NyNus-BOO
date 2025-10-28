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
import { ArrowLeft } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';

// Types
import { ExamFormData, ExamStatus } from '@/types/exam';

// Services
import { ExamService } from '@/services/grpc/exam.service';

// Components
import { ExamForm } from '@/components/features/exams/management/exam-form';
import { ExamPreview } from '@/components/features/exams/management/exam-preview';

// Hooks
import { useToast } from '@/hooks';

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

  const [loading, _setLoading] = useState(false);
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
      {/* Simple Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBack}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </Button>

      {/* Exam Form - với header riêng của nó */}
      <ExamForm
        mode="create"
        loading={loading}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onPreview={handlePreview}
      />

      {/* Exam Preview */}
      <ExamPreview
        examData={previewData || undefined}
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
