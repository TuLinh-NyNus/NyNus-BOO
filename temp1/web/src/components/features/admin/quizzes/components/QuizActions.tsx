import { 
  Save,
  X,
  Eye,
  RotateCcw
} from 'lucide-react';
import { memo } from 'react';

import {
  Button,
  Card,
  CardContent
} from '@/components/ui';

interface QuizData {
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  allowReview: boolean;
}

interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'essay';
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation?: string;
  points: number;
}

interface QuizActionsProps {
  quizData: QuizData;
  questions: QuizQuestion[];
  onSave: () => void;
  onCancel: () => void;
  onPreview?: () => void;
  onReset?: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Quiz Actions Component
 * Extracted từ QuizBuilder để improve maintainability
 * Handles quiz save, cancel, preview actions
 */
export const QuizActions = memo(function QuizActions({ 
  quizData, 
  questions, 
  onSave, 
  onCancel,
  onPreview,
  onReset,
  isLoading = false,
  className = "" 
}: QuizActionsProps) {
  
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const isValid = quizData.title.trim() !== '' && questions.length > 0;

  const handleSave = () => {
    if (!quizData.title.trim()) {
      alert('Vui lòng nhập tiêu đề quiz');
      return;
    }
    
    if (questions.length === 0) {
      alert('Vui lòng thêm ít nhất một câu hỏi');
      return;
    }

    onSave();
  };

  const handleReset = () => {
    if (confirm('Bạn có chắc chắn muốn reset toàn bộ quiz? Tất cả dữ liệu sẽ bị mất.')) {
      onReset?.();
    }
  };

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        {/* Quiz Summary */}
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Tóm tắt Quiz</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-600 dark:text-slate-400">
            <div>
              <span className="font-medium">Câu hỏi:</span> {questions.length}
            </div>
            <div>
              <span className="font-medium">Tổng điểm:</span> {totalPoints}
            </div>
            <div>
              <span className="font-medium">Thời gian:</span> {quizData.timeLimit} phút
            </div>
            <div>
              <span className="font-medium">Điểm đạt:</span> {quizData.passingScore}%
            </div>
          </div>
        </div>

        {/* Validation Messages */}
        {!isValid && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">Cần hoàn thiện:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                {!quizData.title.trim() && <li>Nhập tiêu đề quiz</li>}
                {questions.length === 0 && <li>Thêm ít nhất một câu hỏi</li>}
              </ul>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Primary Actions */}
          <div className="flex gap-2 flex-1">
            <Button 
              onClick={handleSave}
              disabled={!isValid || isLoading}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Đang lưu...' : 'Lưu Quiz'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="flex gap-2">
            {onPreview && (
              <Button 
                variant="outline" 
                onClick={onPreview}
                disabled={questions.length === 0}
                className="flex-1 sm:flex-none"
              >
                <Eye className="h-4 w-4 mr-2" />
                Xem trước
              </Button>
            )}
            
            {onReset && (
              <Button 
                variant="outline" 
                onClick={handleReset}
                disabled={isLoading}
                className="flex-1 sm:flex-none text-red-600 hover:text-red-700"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          <p>
            💡 <strong>Mẹo:</strong> Sử dụng "Xem trước" để kiểm tra quiz trước khi lưu. 
            Quiz sẽ được lưu với tất cả câu hỏi và cài đặt hiện tại.
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

QuizActions.displayName = 'QuizActions';
