'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';

import {
  Button
} from '@/components/ui';
import { useToast } from '@/components/ui/feedback/use-toast';
import { ErrorBoundary } from '@/components/common/error-boundary';

// Import IntegratedQuestionForm từ components
import { IntegratedQuestionForm } from '@/components/admin/questions/forms';

import {
  Question,
  QuestionStatus,
  QuestionType,
  QuestionDifficulty
} from '@/types/question';
import { QuestionService } from '@/services/grpc/question.service';
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
   * Load question data from QuestionService
   */
  const loadQuestionData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const response = await QuestionService.getQuestion({ id: questionId });

      if (!response.success) {
        setLoadError(response.message || 'Không thể tải câu hỏi');
        toast({
          title: 'Lỗi',
          description: response.message || 'Không thể tải câu hỏi',
          variant: 'destructive'
        });
        return;
      }

      if (response.question) {
        // Map protobuf question to frontend Question type
        const mappedQuestion: Question = {
          id: response.question.id,
          content: response.question.content,
          rawContent: response.question.raw_content,
          type: response.question.type as QuestionType,
          tag: response.question.tag || [],
          questionCodeId: response.question.question_code_id,
          status: response.question.status as QuestionStatus,
          difficulty: response.question.difficulty as QuestionDifficulty,
          source: response.question.source || '',
          solution: response.question.solution || '',
          subcount: response.question.subcount || '',
          usageCount: response.question.usage_count || 0,
          creator: response.question.creator || '',
          feedback: response.question.feedback || 0,
          createdAt: response.question.created_at || new Date().toISOString(),
          updatedAt: response.question.updated_at || new Date().toISOString(),
          // Map structured_answers to answers
          answers: response.question.structured_answers?.map((a: { id: string; content: string; is_correct: boolean; explanation?: string }) => ({
            id: a.id,
            content: a.content,
            isCorrect: a.is_correct,
            explanation: a.explanation || ''
          })) || []
        };

        setOriginalQuestion(mappedQuestion);
      }
    } catch (error) {
      console.error('Lỗi khi tải câu hỏi:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải dữ liệu câu hỏi';
      setLoadError(errorMessage);
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]); // ✅ Remove toast dependency to prevent infinite loop

  /**
   * Load question data khi component mount
   */
  useEffect(() => {
    loadQuestionData();
  }, [loadQuestionData]);

  /**
   * Handle submit form - cập nhật câu hỏi
   * Uses QuestionService.updateQuestion to update question via gRPC
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
        id: answer.id || `answer-${index + 1}`,
        content: answer.content,
        is_correct: answer.isCorrect,
        explanation: answer.explanation || ''
      }));

      // Prepare update data for QuestionService
      const updateData = {
        id: questionId,
        raw_content: data.content,
        content: data.content,
        subcount: originalQuestion?.subcount || '',
        type: data.type,
        source: data.source || '',
        structured_answers: answersWithId,
        solution: data.solution || '',
        tag: data.tag || [],
        question_code_id: data.questionCodeId || originalQuestion?.questionCodeId || '',
        status: data.status || QuestionStatus.PENDING,
        difficulty: data.difficulty || originalQuestion?.difficulty || QuestionDifficulty.MEDIUM
      };

      const response = await QuestionService.updateQuestion(updateData);

      if (response.success) {
        toast({
          title: 'Thành công',
          description: response.message || 'Câu hỏi đã được cập nhật thành công',
          variant: 'success'
        });
        router.push(ADMIN_PATHS.QUESTIONS);
      } else {
        throw new Error(response.message || 'Không thể cập nhật câu hỏi');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật câu hỏi:', error);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể cập nhật câu hỏi',
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
