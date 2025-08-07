import { 
  Plus, 
  Trash2, 
  Save,
  X,
  HelpCircle,
  CheckCircle
} from 'lucide-react';
import { memo, useState, useEffect } from 'react';

import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea
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

interface QuestionEditorProps {
  question: QuizQuestion | null;
  isEditing: boolean;
  onSave: (question: QuizQuestion) => void;
  onCancel: () => void;
  className?: string;
}

const questionTypes = [
  { value: 'multiple-choice', label: 'Trắc nghiệm', icon: '○' },
  { value: 'true-false', label: 'Đúng/Sai', icon: '✓' },
  { value: 'fill-blank', label: 'Điền từ', icon: '___' },
  { value: 'essay', label: 'Tự luận', icon: '📝' }
];

/**
 * Question Editor Component
 * Extracted từ QuizBuilder để improve maintainability
 * Handles question creation và editing logic
 */
export const QuestionEditor = memo(function QuestionEditor({ 
  question, 
  isEditing, 
  onSave, 
  onCancel,
  className = "" 
}: QuestionEditorProps) {
  
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(question);

  useEffect(() => {
    setCurrentQuestion(question);
  }, [question]);

  if (!isEditing || !currentQuestion) {
    return null;
  }

  const handleQuestionChange = (field: keyof QuizQuestion, value: any) => {
    if (!currentQuestion) return;
    
    setCurrentQuestion(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleOptionChange = (index: number, value: string) => {
    if (!currentQuestion?.options) return;
    
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    handleQuestionChange('options', newOptions);
  };

  const addOption = () => {
    if (!currentQuestion?.options) return;
    
    const newOptions = [...currentQuestion.options, ''];
    handleQuestionChange('options', newOptions);
  };

  const removeOption = (index: number) => {
    if (!currentQuestion?.options || currentQuestion.options.length <= 2) return;
    
    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    handleQuestionChange('options', newOptions);
    
    // Adjust correct answer if necessary
    if (typeof currentQuestion.correctAnswer === 'number' && currentQuestion.correctAnswer >= index) {
      const newcorrectAnswer = currentQuestion.correctAnswer > index
        ? currentQuestion.correctAnswer - 1
        : currentQuestion.correctAnswer;
      handleQuestionChange('correctAnswer', newcorrectAnswer);
    }
  };

  const handleSave = () => {
    if (!currentQuestion) return;

    if (currentQuestion.question.trim() === '') {
      alert('Vui lòng nhập câu hỏi');
      return;
    }

    if (currentQuestion.type === 'multiple-choice' && currentQuestion.options) {
      const hasEmptyOptions = currentQuestion.options.some(opt => opt.trim() === '');
      if (hasEmptyOptions) {
        alert('Vui lòng điền đầy đủ các lựa chọn');
        return;
      }
    }

    onSave(currentQuestion);
  };

  const currentType = questionTypes.find(type => type.value === currentQuestion.type);

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          {currentType?.icon} {currentType?.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question Content */}
        <div>
          <Label htmlFor="question-content">Nội dung câu hỏi *</Label>
          <Textarea
            id="question-content"
            value={currentQuestion.question}
            onChange={(e) => handleQuestionChange('question', e.target.value)}
            placeholder="Nhập nội dung câu hỏi..."
            className="mt-1"
            rows={3}
          />
        </div>

        {/* Question Options (for multiple-choice and true-false) */}
        {(currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false') && (
          <div>
            <Label>Các lựa chọn</Label>
            <div className="space-y-2 mt-2">
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <div 
                      className={`w-4 h-4 rounded-full border-2 cursor-pointer ${
                        currentQuestion.correctAnswer === index
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300'
                      }`}
                      onClick={() => handleQuestionChange('correctAnswer', index)}
                    />
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Lựa chọn ${index + 1}`}
                      className="flex-1"
                    />
                  </div>
                  {currentQuestion.type === 'multiple-choice' && currentQuestion.options && currentQuestion.options.length > 2 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              {currentQuestion.type === 'multiple-choice' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm lựa chọn
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Correct Answer (for fill-blank and essay) */}
        {(currentQuestion.type === 'fill-blank' || currentQuestion.type === 'essay') && (
          <div>
            <Label htmlFor="correct-answer">
              {currentQuestion.type === 'fill-blank' ? 'Đáp án đúng' : 'Gợi ý đáp án'}
            </Label>
            <Textarea
              id="correct-answer"
              value={currentQuestion.correctAnswer as string}
              onChange={(e) => handleQuestionChange('correctAnswer', e.target.value)}
              placeholder={currentQuestion.type === 'fill-blank' ? 'Nhập đáp án đúng...' : 'Nhập gợi ý đáp án...'}
              className="mt-1"
              rows={2}
            />
          </div>
        )}

        {/* Points and Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="question-points">Điểm số</Label>
            <Input
              id="question-points"
              type="number"
              value={currentQuestion.points}
              onChange={(e) => handleQuestionChange('points', parseInt(e.target.value) || 1)}
              min="1"
              max="10"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="question-explanation">Giải thích (tùy chọn)</Label>
          <Textarea
            id="question-explanation"
            value={currentQuestion.explanation || ''}
            onChange={(e) => handleQuestionChange('explanation', e.target.value)}
            placeholder="Nhập giải thích cho câu hỏi..."
            className="mt-1"
            rows={2}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Lưu câu hỏi
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Hủy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

QuestionEditor.displayName = 'QuestionEditor';
