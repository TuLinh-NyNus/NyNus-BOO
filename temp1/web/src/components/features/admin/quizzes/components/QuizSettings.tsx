import { Clock, Target, Shuffle } from 'lucide-react';
import { memo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import {
  Input,
  Label,
  Textarea,
  Switch
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

interface QuizSettingsProps {
  quizData: QuizData;
  onUpdate: (data: Partial<QuizData>) => void;
  className?: string;
}

/**
 * Quiz Settings Component
 * Extracted từ QuizBuilder để improve maintainability
 * Handles quiz metadata và configuration settings
 */
export const QuizSettings = memo(function QuizSettings({ 
  quizData, 
  onUpdate, 
  className = "" 
}: QuizSettingsProps) {
  
  const handleInputChange = (field: keyof QuizData, value: string | number | boolean) => {
    onUpdate({ [field]: value });
  };

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Cài đặt Quiz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="quiz-title">Tiêu đề Quiz *</Label>
            <Input
              id="quiz-title"
              value={quizData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Nhập tiêu đề quiz..."
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="quiz-description">Mô tả</Label>
            <Textarea
              id="quiz-description"
              value={quizData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Nhập mô tả quiz..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        {/* Time and Scoring Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="time-limit" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Thời gian (phút)
            </Label>
            <Input
              id="time-limit"
              type="number"
              value={quizData.timeLimit}
              onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value) || 0)}
              min="1"
              max="180"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="passing-score">Điểm đạt (%)</Label>
            <Input
              id="passing-score"
              type="number"
              value={quizData.passingScore}
              onChange={(e) => handleInputChange('passingScore', parseInt(e.target.value) || 0)}
              min="0"
              max="100"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="max-attempts">Số lần làm tối đa</Label>
            <Input
              id="max-attempts"
              type="number"
              value={quizData.maxAttempts}
              onChange={(e) => handleInputChange('maxAttempts', parseInt(e.target.value) || 1)}
              min="1"
              max="10"
              className="mt-1"
            />
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300">
            Cài đặt nâng cao
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shuffle className="h-4 w-4" />
                <Label htmlFor="shuffle-questions" className="text-sm">
                  Trộn thứ tự câu hỏi
                </Label>
              </div>
              <Switch
                id="shuffle-questions"
                checked={quizData.shuffleQuestions}
                onCheckedChange={(checked) => handleInputChange('shuffleQuestions', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="show-results" className="text-sm">
                Hiển thị kết quả ngay lập tức
              </Label>
              <Switch
                id="show-results"
                checked={quizData.showResults}
                onCheckedChange={(checked) => handleInputChange('showResults', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-review" className="text-sm">
                Cho phép xem lại đáp án
              </Label>
              <Switch
                id="allow-review"
                checked={quizData.allowReview}
                onCheckedChange={(checked) => handleInputChange('allowReview', checked)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

QuizSettings.displayName = 'QuizSettings';
