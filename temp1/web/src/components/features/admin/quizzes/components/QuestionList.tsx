import { 
  Plus, 
  Trash2, 
  Edit, 
  Eye,
  HelpCircle
} from 'lucide-react';
import { memo } from 'react';

import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui';

interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'essay';
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation?: string;
  points: number;
}

interface QuestionListProps {
  questions: QuizQuestion[];
  onAddQuestion: (type: QuizQuestion['type']) => void;
  onEditQuestion: (question: QuizQuestion) => void;
  onDeleteQuestion: (QuestionID: string) => void;
  onPreviewQuestion?: (question: QuizQuestion) => void;
  className?: string;
}

const questionTypes = [
  { value: 'multiple-choice', label: 'Trắc nghiệm', icon: '○', color: 'bg-blue-500' },
  { value: 'true-false', label: 'Đúng/Sai', icon: '✓', color: 'bg-green-500' },
  { value: 'fill-blank', label: 'Điền từ', icon: '___', color: 'bg-yellow-500' },
  { value: 'essay', label: 'Tự luận', icon: '📝', color: 'bg-purple-500' }
];

/**
 * Question List Component
 * Extracted từ QuizBuilder để improve maintainability
 * Handles question display và management
 */
export const QuestionList = memo(function QuestionList({ 
  questions, 
  onAddQuestion, 
  onEditQuestion, 
  onDeleteQuestion,
  onPreviewQuestion,
  className = "" 
}: QuestionListProps) {
  
  const getQuestionTypeInfo = (type: QuizQuestion['type']) => {
    return questionTypes.find(qt => qt.value === type) || questionTypes[0];
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Danh sách câu hỏi ({questions.length})
          </CardTitle>
          <Badge variant="outline" className="text-sm">
            Tổng điểm: {totalPoints}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Question Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {questionTypes.map((type) => (
            <Button
              key={type.value}
              variant="outline"
              size="sm"
              onClick={() => onAddQuestion(type.value as QuizQuestion['type'])}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <span className="text-lg">{type.icon}</span>
              <span className="text-xs">{type.label}</span>
            </Button>
          ))}
        </div>

        {/* Questions List */}
        {questions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chưa có câu hỏi nào</p>
            <p className="text-sm">Nhấn vào các nút bên trên để thêm câu hỏi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((question, index) => {
              const typeInfo = getQuestionTypeInfo(question.type);
              
              return (
                <Card key={question.id} className="border border-slate-200 dark:border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="secondary" 
                            className={`${typeInfo.color} text-white text-xs`}
                          >
                            {typeInfo.icon} {typeInfo.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {question.points} điểm
                          </Badge>
                        </div>
                        
                        <h4 className="font-medium text-sm mb-2">
                          Câu {index + 1}: {truncateText(question.question)}
                        </h4>
                        
                        {/* Show options for multiple choice */}
                        {question.type === 'multiple-choice' && question.options && (
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            <span className="font-medium">Lựa chọn: </span>
                            {question.options.slice(0, 2).map((option, i) => (
                              <span key={i}>
                                {truncateText(option, 30)}
                                {i < Math.min(question.options!.length - 1, 1) && ', '}
                              </span>
                            ))}
                            {question.options.length > 2 && (
                              <span> và {question.options.length - 2} lựa chọn khác</span>
                            )}
                          </div>
                        )}
                        
                        {/* Show correct answer for true/false */}
                        {question.type === 'true-false' && (
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            <span className="font-medium">Đáp án: </span>
                            {question.options?.[question.correctAnswer as number] || 'Chưa chọn'}
                          </div>
                        )}
                        
                        {/* Show answer hint for other types */}
                        {(question.type === 'fill-blank' || question.type === 'essay') && question.correctAnswer && (
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            <span className="font-medium">
                              {question.type === 'fill-blank' ? 'Đáp án: ' : 'Gợi ý: '}
                            </span>
                            {truncateText(question.correctAnswer as string, 50)}
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        {onPreviewQuestion && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPreviewQuestion(question)}
                            className="h-8 w-8 p-0"
                            title="Xem trước"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditQuestion(question)}
                          className="h-8 w-8 p-0"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
                              onDeleteQuestion(question.id);
                            }
                          }}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

QuestionList.displayName = 'QuestionList';
