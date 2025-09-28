/**
 * Exam Results Client Component
 * Client component cho exam results page theo RIPER-5 EXECUTE MODE
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
  Download, 
  Share2, 
  Trophy, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EXAM_DYNAMIC_ROUTES } from '@/lib/exam-paths';

// ===== TYPES =====

/**
 * Exam result interface
 */
interface ExamResult {
  id: string;
  exam_id: string;
  user_id: string;
  attempt_id: string;
  score: number;
  total_points: number;
  percentage: number;
  passed: boolean;
  time_taken_minutes: number;
  submitted_at: string;
  graded_at: string;
  question_results: QuestionResult[];
}

/**
 * Question result interface
 */
interface QuestionResult {
  question_id: string;
  question_content: string;
  question_type: 'MULTIPLE_CHOICE' | 'ESSAY' | 'TRUE_FALSE';
  points: number;
  user_answer: string;
  correct_answer?: string;
  is_correct: boolean;
  points_earned: number;
  feedback?: string;
}

/**
 * Component props interface
 */
interface ExamResultsClientProps {
  examId: string;
}

// ===== MAIN COMPONENT =====

/**
 * Exam Results Client Component
 * Client component hiển thị kết quả thi chi tiết
 * 
 * Features:
 * - Overall score display
 * - Question-by-question breakdown
 * - Performance analytics
 * - Download results
 * - Share results
 * - Responsive design
 */
export default function ExamResultsClient({ examId }: ExamResultsClientProps) {
  const router = useRouter();
  
  // ===== STATE =====
  
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ===== EFFECTS =====

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // TODO: Replace with actual gRPC call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - will be replaced with actual API call
        const mockResult: ExamResult = {
          id: 'result-1',
          exam_id: examId,
          user_id: 'user-1',
          attempt_id: 'attempt-1',
          score: 85,
          total_points: 100,
          percentage: 85,
          passed: true,
          time_taken_minutes: 42,
          submitted_at: '2025-01-19T11:30:00Z',
          graded_at: '2025-01-19T11:35:00Z',
          question_results: [
            {
              question_id: '1',
              question_content: 'Tìm đạo hàm của hàm số f(x) = x³ + 2x² - 5x + 1',
              question_type: 'MULTIPLE_CHOICE',
              points: 5,
              user_answer: 'f\'(x) = 3x² + 4x - 5',
              correct_answer: 'f\'(x) = 3x² + 4x - 5',
              is_correct: true,
              points_earned: 5,
            },
            {
              question_id: '2',
              question_content: 'Giải thích ý nghĩa hình học của đạo hàm tại một điểm.',
              question_type: 'ESSAY',
              points: 10,
              user_answer: 'Đạo hàm tại một điểm có ý nghĩa hình học là hệ số góc của tiếp tuyến...',
              is_correct: true,
              points_earned: 8,
              feedback: 'Câu trả lời tốt nhưng có thể chi tiết hơn về ứng dụng thực tế.',
            },
          ],
        };
        
        setResult(mockResult);
      } catch (err) {
        setError('Không thể tải kết quả thi');
        console.error('Failed to load results:', err);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [examId]);

  // ===== HANDLERS =====

  const handleBack = () => {
    router.push(EXAM_DYNAMIC_ROUTES.DETAIL(examId));
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log('Download results');
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share results');
  };

  const handleRetakeExam = () => {
    router.push(EXAM_DYNAMIC_ROUTES.TAKE(examId));
  };

  // ===== RENDER HELPERS =====

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (passed: boolean) => {
    return passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} phút`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // ===== RENDER =====

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-muted rounded mb-6"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Không thể tải kết quả</h1>
        <p className="text-muted-foreground mb-6">
          {error || 'Kết quả thi không tồn tại hoặc chưa được chấm điểm'}
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
            <h1 className="text-2xl font-bold">Kết quả thi</h1>
            <p className="text-muted-foreground">
              Nộp bài lúc: {formatDate(result.submitted_at)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
          <Button onClick={handleRetakeExam} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Làm lại
          </Button>
        </div>
      </div>

      {/* Score Overview */}
      <div className="rounded-lg border bg-card p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Trophy className={`h-8 w-8 ${result.passed ? 'text-yellow-500' : 'text-gray-400'}`} />
            <Badge className={getScoreBadgeColor(result.passed)}>
              {result.passed ? 'ĐẠT' : 'KHÔNG ĐẠT'}
            </Badge>
          </div>
          
          <div>
            <div className={`text-4xl font-bold ${getScoreColor(result.percentage)}`}>
              {result.score}/{result.total_points}
            </div>
            <div className={`text-2xl font-semibold ${getScoreColor(result.percentage)}`}>
              {result.percentage}%
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Thời gian: {formatTime(result.time_taken_minutes)}
            </div>
            <div>
              Chấm điểm: {formatDate(result.graded_at)}
            </div>
          </div>
        </div>
      </div>

      {/* Question Results */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Chi tiết từng câu</h2>
        
        {result.question_results.map((questionResult, index) => (
          <div key={questionResult.question_id} className="rounded-lg border bg-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">Câu {index + 1}</h3>
                  <Badge variant="outline">
                    {questionResult.points_earned}/{questionResult.points} điểm
                  </Badge>
                  {questionResult.is_correct ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {questionResult.question_content}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Câu trả lời của bạn:</label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <p className="text-sm">{questionResult.user_answer}</p>
                </div>
              </div>
              
              {questionResult.correct_answer && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Đáp án đúng:</label>
                  <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">{questionResult.correct_answer}</p>
                  </div>
                </div>
              )}
              
              {questionResult.feedback && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nhận xét:</label>
                  <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">{questionResult.feedback}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold mb-4">Thống kê</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {result.question_results.filter(q => q.is_correct).length}
            </div>
            <div className="text-sm text-muted-foreground">Câu đúng</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {result.question_results.filter(q => !q.is_correct).length}
            </div>
            <div className="text-sm text-muted-foreground">Câu sai</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {result.question_results.length}
            </div>
            <div className="text-sm text-muted-foreground">Tổng câu</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(result.percentage)}`}>
              {result.percentage}%
            </div>
            <div className="text-sm text-muted-foreground">Tỷ lệ đúng</div>
          </div>
        </div>
      </div>
    </div>
  );
}
