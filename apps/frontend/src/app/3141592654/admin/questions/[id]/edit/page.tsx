'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';

import {
  Button
} from '@/components/ui';
import { useToast } from '@/components/ui/feedback/use-toast';
import { ErrorBoundary } from '@/components/ui/feedback/error-boundary';

// Import IntegratedQuestionForm từ components
import { IntegratedQuestionForm } from '@/components/admin/questions/forms';

import { 
  Question,
  QuestionStatus,
  QuestionType,
  QuestionDifficulty
} from '@/types/question';
import { MockQuestionsService } from '@/services/mock/questions';
import { ADMIN_PATHS } from '@/lib/admin-paths';

/**
 * Edit Question Page
 * Trang chỉnh sửa câu hỏi sử dụng IntegratedQuestionForm
 */
export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const questionId = params.id as string;

  // State cho question data
  const [originalQuestion, setOriginalQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  /**
   * Load question data từ mock service
   */
  const loadQuestionData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const response = await MockQuestionsService.getQuestion(questionId);

      if (response.error) {
        setLoadError(response.error);
        return;
      }

      if (response.data) {
        setOriginalQuestion(response.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải câu hỏi:', error);
      setLoadError('Không thể tải dữ liệu câu hỏi');
    } finally {
      setIsLoading(false);
    }
  }, [questionId]);

  /**
   * Load question data khi component mount
   */
  useEffect(() => {
    loadQuestionData();
  }, [loadQuestionData]);

  /**
   * Handle submit form - cập nhật câu hỏi
   */
  const handleSubmit = async (data: {
    content: string;
    type: QuestionType;
    answers: { content: string; isCorrect: boolean; id?: string; explanation?: string; }[];
    status: QuestionStatus;
    difficulty?: QuestionDifficulty;
    questionCodeId: string;
    explanation?: string;
    solution?: string;
    source?: string;
    timeLimit?: number;
    points?: number;
    tag?: string[];
  }) => {
    try {
      // Chuyển đổi answers để đảm bảo có id cho mỗi answer
      const answersWithId = data.answers.map((answer, index) => ({
        ...answer,
        id: answer.id || `answer-${index + 1}`
      }));
      
      // Prepare update data cho MockQuestionsService
      const updateData = {
        ...originalQuestion,
        content: data.content,
        rawContent: data.content,
        type: data.type,
        answers: answersWithId,
        tag: data.tag || [],
        questionCodeId: data.questionCodeId || originalQuestion?.questionCodeId || 'AUTO_GENERATED',
        status: data.status || QuestionStatus.PENDING,
        difficulty: data.difficulty || originalQuestion?.difficulty || QuestionDifficulty.MEDIUM,
        explanation: data.explanation || "",
        solution: data.solution || "",
        source: data.source || "",
        timeLimit: data.timeLimit || 0,
        points: data.points || 1,
        updatedAt: new Date().toISOString()
      };

      await MockQuestionsService.updateQuestion(questionId, updateData);

      toast({
        title: 'Thành công',
        description: 'Câu hỏi đã được cập nhật thành công',
        variant: 'success'
      });

      router.push(ADMIN_PATHS.QUESTIONS);
    } catch (error) {
      console.error('Lỗi khi cập nhật câu hỏi:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật câu hỏi',
        variant: 'destructive'
      });
      throw error; // Re-throw để form xử lý loading state
    }
  };

  /**
   * Handle save draft - lưu nháp
   */
  const handleSaveDraft = async (data: {
    content: string;
    type: QuestionType;
    answers: { content: string; isCorrect: boolean; id?: string; explanation?: string; }[];
    status: QuestionStatus;
    difficulty?: QuestionDifficulty;
    questionCodeId: string;
    explanation?: string;
    solution?: string;
    source?: string;
    timeLimit?: number;
    points?: number;
    tag?: string[];
  }) => {
    try {
      const draftData = {
        ...originalQuestion,
        ...data,
        rawContent: data.content,
        tag: data.tag || [],
        status: QuestionStatus.PENDING,
        updatedAt: new Date().toISOString()
      };

      // Lưu vào localStorage hoặc draft service
      const savedQuestions = JSON.parse(localStorage.getItem('saved_questions') || '{"questions": []}');
      const existingIndex = savedQuestions.questions.findIndex((q: Question) => q.id === questionId);
      
      if (existingIndex >= 0) {
        savedQuestions.questions[existingIndex] = draftData;
      } else {
        savedQuestions.questions.push(draftData);
      }
      
      savedQuestions.lastUpdated = new Date().toISOString();
      localStorage.setItem('saved_questions', JSON.stringify(savedQuestions));

      toast({
        title: 'Thành công',
        description: 'Đã lưu nháp câu hỏi',
        variant: 'success'
      });
    } catch (error) {
      console.error('Lỗi khi lưu nháp:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu nháp',
        variant: 'destructive'
      });
      throw error;
    }
  };

  /**
   * Handle cancel - quay lại danh sách
   */
  const handleCancel = () => {
    router.push(ADMIN_PATHS.QUESTIONS);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Đang tải câu hỏi...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Không thể tải câu hỏi
            </h3>
            <p className="text-muted-foreground mb-4">{loadError}</p>
            <div className="flex gap-2">
              <Button onClick={loadQuestionData}>
                Thử lại
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                Quay lại
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Chỉnh sửa câu hỏi</h1>
                <p className="text-muted-foreground mt-1">
                  ID: {questionId}
                </p>
              </div>
            </div>
          </div>

        {/* IntegratedQuestionForm with loaded question */}
        {originalQuestion && (
          <IntegratedQuestionForm
            question={originalQuestion}
            mode="edit"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onSaveDraft={handleSaveDraft}
          />
        )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
