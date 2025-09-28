/**
 * Exam Detail Client Component
 * Client component cho exam detail page theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Play, 
  Edit, 
  Share2, 
  Clock, 
  BookOpen, 
  Users, 
  BarChart3,
  Settings
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EXAM_ROUTES, EXAM_DYNAMIC_ROUTES } from '@/lib/exam-paths';

// ===== TYPES =====

/**
 * Exam interface (temporary - will be moved to types file)
 */
interface Exam {
  id: string;
  title: string;
  description: string;
  instructions: string;
  duration_minutes: number;
  total_questions: number;
  total_points: number;
  pass_percentage: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  subject: string;
  grade: number;
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  exam_type: 'GENERATED' | 'OFFICIAL';
  shuffle_questions: boolean;
  show_results: boolean;
  max_attempts: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  tags: string[];
}

/**
 * Component props interface
 */
interface ExamDetailClientProps {
  examId: string;
}

// ===== MAIN COMPONENT =====

/**
 * Exam Detail Client Component
 * Client component hiển thị chi tiết đề thi với interactive features
 * 
 * Features:
 * - Exam information display
 * - Take exam functionality
 * - Edit exam (role-based)
 * - Share exam
 * - View analytics (role-based)
 * - Responsive design
 * - Loading states
 */
export default function ExamDetailClient({ examId }: ExamDetailClientProps) {
  const router = useRouter();
  
  // ===== STATE =====
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ===== EFFECTS =====

  useEffect(() => {
    const loadExam = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // TODO: Replace with actual gRPC call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - will be replaced with actual API call
        const mockExam: Exam = {
          id: examId,
          title: 'Kiểm tra Toán 12 - Chương 1',
          description: 'Đề kiểm tra chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
          instructions: 'Thời gian làm bài: 45 phút. Không được sử dụng tài liệu. Làm bài trên giấy thi.',
          duration_minutes: 45,
          total_questions: 20,
          total_points: 100,
          pass_percentage: 60,
          difficulty: 'MEDIUM',
          subject: 'Toán',
          grade: 12,
          status: 'ACTIVE',
          exam_type: 'GENERATED',
          shuffle_questions: false,
          show_results: true,
          max_attempts: 1,
          created_by: 'teacher1',
          created_at: '2025-01-19T10:00:00Z',
          updated_at: '2025-01-19T10:00:00Z',
          tags: ['đạo hàm', 'khảo sát hàm số', 'toán 12'],
        };
        
        setExam(mockExam);
      } catch (err) {
        setError('Không thể tải thông tin đề thi');
        console.error('Failed to load exam:', err);
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [examId]);

  // ===== HANDLERS =====

  const handleBack = () => {
    router.push(EXAM_ROUTES.LANDING);
  };

  const handleTakeExam = () => {
    router.push(EXAM_DYNAMIC_ROUTES.TAKE(examId));
  };

  const handleEditExam = () => {
    router.push(EXAM_DYNAMIC_ROUTES.EDIT(examId));
  };

  const handleViewResults = () => {
    router.push(EXAM_DYNAMIC_ROUTES.RESULTS(examId));
  };

  const handleViewAnalytics = () => {
    router.push(EXAM_DYNAMIC_ROUTES.ANALYTICS(examId));
  };

  const handleShareExam = () => {
    // TODO: Implement share functionality
    navigator.clipboard.writeText(window.location.href);
    console.log('Exam link copied to clipboard');
  };

  // ===== RENDER HELPERS =====

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HARD': return 'bg-red-100 text-red-800';
      case 'EXPERT': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'Dễ';
      case 'MEDIUM': return 'Trung bình';
      case 'HARD': return 'Khó';
      case 'EXPERT': return 'Chuyên gia';
      default: return difficulty;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'ARCHIVED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Đang hoạt động';
      case 'PENDING': return 'Chờ duyệt';
      case 'INACTIVE': return 'Không hoạt động';
      case 'ARCHIVED': return 'Đã lưu trữ';
      default: return status;
    }
  };

  // ===== RENDER =====

  if (loading) {
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

  if (error || !exam) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Không thể tải đề thi</h1>
        <p className="text-muted-foreground mb-6">
          {error || 'Đề thi không tồn tại hoặc đã bị xóa'}
        </p>
        <Button onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
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
            <h1 className="text-2xl font-bold">{exam.title}</h1>
            <p className="text-muted-foreground">
              {exam.subject} - Lớp {exam.grade}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShareExam}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleEditExam}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button onClick={handleTakeExam} className="gap-2">
            <Play className="h-4 w-4" />
            Làm bài thi
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Mô tả</h2>
            <p className="text-muted-foreground leading-relaxed">
              {exam.description}
            </p>
          </div>

          {/* Instructions */}
          {exam.instructions && (
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Hướng dẫn làm bài</h2>
              <p className="text-muted-foreground leading-relaxed">
                {exam.instructions}
              </p>
            </div>
          )}

          {/* Tags */}
          {exam.tags.length > 0 && (
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Chủ đề</h2>
              <div className="flex flex-wrap gap-2">
                {exam.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Exam Info */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-4">Thông tin đề thi</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Trạng thái</span>
                <Badge className={getStatusColor(exam.status)}>
                  {getStatusText(exam.status)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Độ khó</span>
                <Badge className={getDifficultyColor(exam.difficulty)}>
                  {getDifficultyText(exam.difficulty)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Thời gian</span>
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="h-4 w-4" />
                  {exam.duration_minutes} phút
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Số câu hỏi</span>
                <div className="flex items-center gap-1 text-sm">
                  <BookOpen className="h-4 w-4" />
                  {exam.total_questions} câu
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tổng điểm</span>
                <span className="text-sm font-medium">{exam.total_points} điểm</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Điểm đạt</span>
                <span className="text-sm font-medium">{exam.pass_percentage}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Số lần làm</span>
                <span className="text-sm font-medium">{exam.max_attempts} lần</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-4">Hành động</h3>
            
            <div className="space-y-2">
              <Button onClick={handleTakeExam} className="w-full gap-2">
                <Play className="h-4 w-4" />
                Làm bài thi
              </Button>
              
              <Button variant="outline" onClick={handleViewResults} className="w-full gap-2">
                <BarChart3 className="h-4 w-4" />
                Xem kết quả
              </Button>
              
              <Button variant="outline" onClick={handleViewAnalytics} className="w-full gap-2">
                <Users className="h-4 w-4" />
                Thống kê
              </Button>
              
              <Button variant="outline" onClick={handleEditExam} className="w-full gap-2">
                <Settings className="h-4 w-4" />
                Chỉnh sửa
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
