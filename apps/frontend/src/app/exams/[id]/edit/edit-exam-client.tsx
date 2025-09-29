/**
 * Edit Exam Client Component
 * Client component cho edit exam page theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EXAM_DYNAMIC_ROUTES } from '@/lib/exam-paths';
import { ExamFormData, ExamStatus, ExamType } from '@/types/exam';
import { QuestionDifficulty } from '@/types/question';

// ===== TYPES =====
// Using centralized ExamFormData from @/lib/types/exam

/**
 * Component props interface
 */
interface EditExamClientProps {
  examId: string;
}

// ===== MAIN COMPONENT =====

/**
 * Edit Exam Client Component
 * Client component để chỉnh sửa đề thi với validation
 * 
 * Features:
 * - Load existing exam data
 * - Form validation
 * - Save changes
 * - Preview functionality
 * - Delete exam functionality
 * - Responsive design
 */
export default function EditExamClient({ examId }: EditExamClientProps) {
  const router = useRouter();
  
  // ===== STATE =====
  
  const [formData, setFormData] = useState<ExamFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ExamFormData, string>>>({});

  // ===== EFFECTS =====

  useEffect(() => {
    const loadExam = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual gRPC call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - will be replaced with actual API call
        const mockExam: ExamFormData = {
          title: 'Kiểm tra Toán 12 - Chương 1',
          description: 'Đề kiểm tra chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
          instructions: 'Thời gian làm bài: 45 phút. Không được sử dụng tài liệu.',
          durationMinutes: 45,
          totalPoints: 100,
          passPercentage: 60,
          examType: ExamType.GENERATED,
          status: ExamStatus.ACTIVE,
          difficulty: QuestionDifficulty.MEDIUM,
          subject: 'Toán',
          grade: 12,
          tags: ['đạo hàm', 'khảo sát hàm số'],
          shuffleQuestions: false,
          showResults: true,
          maxAttempts: 1,
          questionIds: [],
        };
        
        setFormData(mockExam);
      } catch (error) {
        console.error('Failed to load exam:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [examId]);

  // ===== HANDLERS =====

  const handleBack = () => {
    router.push(EXAM_DYNAMIC_ROUTES.DETAIL(examId));
  };

  const handleInputChange = (field: keyof ExamFormData, value: string | number | boolean | string[] | ExamType | ExamStatus | QuestionDifficulty) => {
    if (!formData) return;
    
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData) return false;

    const newErrors: Partial<Record<keyof ExamFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề đề thi là bắt buộc';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả đề thi là bắt buộc';
    }

    if (formData.durationMinutes <= 0) {
      newErrors.durationMinutes = 'Thời gian làm bài phải lớn hơn 0';
    }

    if (formData.passPercentage < 0 || formData.passPercentage > 100) {
      newErrors.passPercentage = 'Điểm đạt phải từ 0 đến 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      // TODO: Replace with actual gRPC call
      console.log('Updating exam:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to exam detail
      router.push(EXAM_DYNAMIC_ROUTES.DETAIL(examId));
    } catch (error) {
      console.error('Failed to update exam:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (!validateForm()) {
      return;
    }
    
    // TODO: Implement preview functionality
    console.log('Preview exam:', formData);
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa đề thi này? Hành động này không thể hoàn tác.')) {
      return;
    }

    setSaving(true);
    try {
      // TODO: Replace with actual gRPC call
      console.log('Deleting exam:', examId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to exams list
      router.push('/exams');
    } catch (error) {
      console.error('Failed to delete exam:', error);
    } finally {
      setSaving(false);
    }
  };

  // ===== RENDER =====

  if (loading || !formData) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-muted rounded w-2/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-48 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Chỉnh sửa đề thi</h1>
            <p className="text-muted-foreground">
              Cập nhật thông tin và cài đặt đề thi
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePreview} disabled={saving}>
            <Eye className="h-4 w-4 mr-2" />
            Xem trước
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={saving}>
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Thông tin cơ bản</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tiêu đề đề thi *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Nhập tiêu đề đề thi..."
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium">Mô tả *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Mô tả ngắn gọn về đề thi..."
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium">Hướng dẫn làm bài</label>
                <Textarea
                  value={formData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  placeholder="Hướng dẫn chi tiết cho học sinh..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Exam Settings */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Cài đặt đề thi</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Thời gian làm bài (phút) *</label>
                <Input
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => handleInputChange('durationMinutes', parseInt(e.target.value) || 0)}
                  min="1"
                  className={errors.durationMinutes ? 'border-red-500' : ''}
                />
                {errors.durationMinutes && (
                  <p className="text-sm text-red-500 mt-1">{errors.durationMinutes}</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium">Điểm đạt (%) *</label>
                <Input
                  type="number"
                  value={formData.passPercentage}
                  onChange={(e) => handleInputChange('passPercentage', parseInt(e.target.value) || 0)}
                  min="0"
                  max="100"
                  className={errors.passPercentage ? 'border-red-500' : ''}
                />
                {errors.passPercentage && (
                  <p className="text-sm text-red-500 mt-1">{errors.passPercentage}</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium">Độ khó</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="EASY">Dễ</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="HARD">Khó</option>
                  <option value="EXPERT">Chuyên gia</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="PENDING">Chờ duyệt</option>
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Không hoạt động</option>
                  <option value="ARCHIVED">Đã lưu trữ</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="shuffleQuestions"
                  checked={formData.shuffleQuestions}
                  onChange={(e) => handleInputChange('shuffleQuestions', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="shuffleQuestions" className="text-sm">
                  Trộn thứ tự câu hỏi
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showResults"
                  checked={formData.showResults}
                  onChange={(e) => handleInputChange('showResults', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="showResults" className="text-sm">
                  Hiển thị kết quả sau khi nộp bài
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Academic Info */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-4">Thông tin học thuật</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Môn học</label>
                <select
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Toán">Toán</option>
                  <option value="Lý">Vật lý</option>
                  <option value="Hóa">Hóa học</option>
                  <option value="Sinh">Sinh học</option>
                  <option value="Văn">Ngữ văn</option>
                  <option value="Anh">Tiếng Anh</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Khối lớp</label>
                <select
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', parseInt(e.target.value))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
                    <option key={grade} value={grade}>Lớp {grade}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Số lần làm tối đa</label>
                <Input
                  type="number"
                  value={formData.maxAttempts}
                  onChange={(e) => handleInputChange('maxAttempts', parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
