/**
 * Exam Preview Component
 * Provides comprehensive preview functionality for exams before publishing
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Eye, 
  Clock, 
  Users, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Play,
  Edit,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Exam, Question, ExamFormData } from '@/types/exam';
import { QuestionDisplay } from '@/components/exams/taking/question-display';
import { ExamTimer } from '@/components/exams/taking/exam-timer';

export interface ExamPreviewProps {
  exam?: Exam;
  examData?: ExamFormData;
  questions?: Question[];
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onPublish?: () => void;
  className?: string;
}

export interface ExamPreviewMode {
  mode: 'overview' | 'student' | 'instructor';
  fullscreen: boolean;
}

export function ExamPreview({
  exam,
  examData,
  questions = [],
  isOpen,
  onClose,
  onEdit,
  onPublish,
  className
}: ExamPreviewProps) {
  const [previewMode, setPreviewMode] = useState<ExamPreviewMode>({
    mode: 'overview',
    fullscreen: false
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showValidation, setShowValidation] = useState(false);

  // Use exam data or examData for preview
  const previewData = exam || examData;
  
  useEffect(() => {
    if (isOpen) {
      setShowValidation(true);
    }
  }, [isOpen]);

  if (!isOpen || !previewData) {
    return null;
  }

  // Validation checks
  const validationIssues = validateExam(previewData, questions);
  const hasErrors = validationIssues.some(issue => issue.type === 'error');
  const _hasWarnings = validationIssues.some(issue => issue.type === 'warning');

  const handleModeChange = (mode: ExamPreviewMode['mode']) => {
    setPreviewMode(prev => ({ ...prev, mode }));
    setCurrentQuestionIndex(0);
  };

  const handleFullscreenToggle = () => {
    setPreviewMode(prev => ({ ...prev, fullscreen: !prev.fullscreen }));
  };

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestionIndex(Math.max(0, Math.min(index, questions.length - 1)));
  };

  const renderOverviewMode = () => (
    <div className="space-y-6">
      {/* Exam Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Thông tin đề thi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tiêu đề</label>
              <p className="text-lg font-semibold">{previewData.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Môn học</label>
              <p>{previewData.subject}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Thời gian</label>
              <p className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {previewData.durationMinutes} phút
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Số câu hỏi</label>
              <p>{questions.length} câu</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Điểm tối đa</label>
              <p>{questions.reduce((sum, q) => sum + (q.points || 0), 0)} điểm</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Trạng thái</label>
              <Badge variant={previewData.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {previewData.status}
              </Badge>
            </div>
          </div>
          
          {previewData.description && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Mô tả</label>
              <p className="text-sm text-muted-foreground mt-1">{previewData.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Results */}
      {showValidation && validationIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {hasErrors ? (
                <AlertCircle className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle className="h-5 w-5 text-warning" />
              )}
              Kiểm tra đề thi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {validationIssues.map((issue, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-2 p-3 rounded-lg",
                    issue.type === 'error' && "bg-destructive/10 text-destructive",
                    issue.type === 'warning' && "bg-warning/10 text-warning",
                    issue.type === 'info' && "bg-blue-50 text-blue-700"
                  )}
                >
                  <div className="flex-1">
                    <p className="font-medium">{issue.title}</p>
                    <p className="text-sm opacity-90">{issue.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách câu hỏi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => handleModeChange('student')}
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">Câu {index + 1}</span>
                  <Badge variant="outline">{question.type}</Badge>
                  <span className="text-sm text-muted-foreground truncate max-w-md">
                    {question.content}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{question.points || 0} điểm</span>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStudentMode = () => (
    <div className="space-y-6">
      {/* Exam Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{previewData.title}</h2>
          <p className="text-muted-foreground">{previewData.subject}</p>
        </div>
        <ExamTimer
          variant="compact"
          showWarnings={false}
        />
      </div>

      {/* Question Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {questions.map((_, index) => (
          <Button
            key={index}
            variant={index === currentQuestionIndex ? 'default' : 'outline'}
            size="sm"
            className="min-w-[40px]"
            onClick={() => handleQuestionNavigation(index)}
          >
            {index + 1}
          </Button>
        ))}
      </div>

      {/* Current Question */}
      {questions[currentQuestionIndex] && (
        <Card>
          <CardContent className="p-6">
            <QuestionDisplay
              question={questions[currentQuestionIndex]}
              questionNumber={currentQuestionIndex + 1}
              currentAnswer={{
                questionId: questions[currentQuestionIndex].id,
                answerText: '',
                selectedOptions: [],
                isFlagged: false,
                timeSpent: 0,
                isAnswered: false
              }}
              onAnswerChange={() => {}}
              readOnly={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => handleQuestionNavigation(currentQuestionIndex - 1)}
          disabled={currentQuestionIndex === 0}
        >
          Câu trước
        </Button>
        
        <span className="text-sm text-muted-foreground">
          Câu {currentQuestionIndex + 1} / {questions.length}
        </span>
        
        <Button
          variant="outline"
          onClick={() => handleQuestionNavigation(currentQuestionIndex + 1)}
          disabled={currentQuestionIndex === questions.length - 1}
        >
          Câu tiếp
        </Button>
      </div>
    </div>
  );

  const renderInstructorMode = () => (
    <div className="space-y-6">
      {/* Instructor Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Ước tính thời gian</p>
                <p className="text-lg font-semibold">{previewData.durationMinutes} phút</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Độ khó trung bình</p>
                <p className="text-lg font-semibold">
                  {calculateAverageDifficulty(questions)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Tổng điểm</p>
                <p className="text-lg font-semibold">
                  {questions.reduce((sum, q) => sum + (q.points || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Phân tích câu hỏi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Câu {index + 1}</span>
                      <Badge variant="outline">{question.type}</Badge>
                      <Badge variant="secondary">{question.difficulty || 'MEDIUM'}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {question.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Điểm: {question.points || 0}</span>
                      <span>Thời gian ước tính: {estimateQuestionTime(question)} phút</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-background",
      previewMode.fullscreen ? "p-0" : "p-4",
      className
    )}>
      <div className={cn(
        "h-full flex flex-col",
        !previewMode.fullscreen && "max-w-6xl mx-auto border rounded-lg shadow-lg"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/50">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Xem trước đề thi</h1>
            
            {/* Mode Selector */}
            <div className="flex items-center gap-1 bg-background border rounded-lg p-1">
              <Button
                variant={previewMode.mode === 'overview' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleModeChange('overview')}
              >
                Tổng quan
              </Button>
              <Button
                variant={previewMode.mode === 'student' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleModeChange('student')}
              >
                Học sinh
              </Button>
              <Button
                variant={previewMode.mode === 'instructor' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleModeChange('instructor')}
              >
                Giảng viên
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFullscreenToggle}
            >
              {previewMode.fullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
            )}
            
            {onPublish && !hasErrors && (
              <Button size="sm" onClick={onPublish}>
                <Play className="h-4 w-4 mr-2" />
                Xuất bản
              </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          {previewMode.mode === 'overview' && renderOverviewMode()}
          {previewMode.mode === 'student' && renderStudentMode()}
          {previewMode.mode === 'instructor' && renderInstructorMode()}
        </ScrollArea>
      </div>
    </div>
  );
}

// Helper functions
function validateExam(examData: Exam | ExamFormData, questions: Question[]) {
  const issues: Array<{
    type: 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }> = [];

  if (!examData.title?.trim()) {
    issues.push({
      type: 'error',
      title: 'Thiếu tiêu đề',
      message: 'Đề thi cần có tiêu đề'
    });
  }

  if (questions.length === 0) {
    issues.push({
      type: 'error',
      title: 'Không có câu hỏi',
      message: 'Đề thi cần có ít nhất 1 câu hỏi'
    });
  }

  if (examData.durationMinutes < 5) {
    issues.push({
      type: 'warning',
      title: 'Thời gian ngắn',
      message: 'Thời gian thi có thể quá ngắn cho học sinh'
    });
  }

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
  if (totalPoints === 0) {
    issues.push({
      type: 'warning',
      title: 'Không có điểm',
      message: 'Các câu hỏi chưa được gán điểm'
    });
  }

  return issues;
}

function calculateAverageDifficulty(questions: Question[]): string {
  if (questions.length === 0) return 'N/A';
  
  const difficultyValues = { EASY: 1, MEDIUM: 2, HARD: 3, EXPERT: 4 };
  const average = questions.reduce((sum, q) => {
    return sum + (difficultyValues[q.difficulty as keyof typeof difficultyValues] || 2);
  }, 0) / questions.length;
  
  if (average <= 1.5) return 'Dễ';
  if (average <= 2.5) return 'Trung bình';
  if (average <= 3.5) return 'Khó';
  return 'Rất khó';
}

function estimateQuestionTime(question: Question): number {
  const baseTime = {
    MULTIPLE_CHOICE: 1.5,
    TRUE_FALSE: 1,
    SHORT_ANSWER: 3,
    ESSAY: 8,
    MATCHING: 2
  };
  
  return baseTime[question.type as keyof typeof baseTime] || 2;
}
