'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import {
  Button
} from '@/components/ui';
import { useToast } from '@/components/ui/feedback/use-toast';
import { ErrorBoundary } from '@/components/ui/feedback/error-boundary';

// Import IntegratedQuestionForm từ components
import { IntegratedQuestionForm } from '@/components/admin/questions/forms';

import {
  QuestionStatus,
  QuestionType,
  QuestionDifficulty
} from '@/lib/types/question';
import { MockQuestionsService } from '@/lib/services/mock/questions';
import { ADMIN_PATHS } from '@/lib/admin-paths';

/**
 * Create Question Page  
 * Trang tạo câu hỏi mới sử dụng IntegratedQuestionForm
 */
export default function CreateQuestionPage() {
  const router = useRouter();
  const { toast } = useToast();

  /**
   * Handle submit form - tạo câu hỏi mới
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
      
      // Prepare question data cho MockQuestionsService
      const questionData = {
        content: data.content,
        rawContent: data.content, // Giữ rawContent giống content
        type: data.type,
        answers: answersWithId,
        tag: data.tag || [],
        questionCodeId: data.questionCodeId || 'AUTO_GENERATED',
        status: data.status || QuestionStatus.PENDING,
        difficulty: data.difficulty || QuestionDifficulty.MEDIUM,
        explanation: data.explanation || "",
        solution: data.solution || "",
        source: data.source || "",
        timeLimit: data.timeLimit || 0,
        points: data.points || 1,
        usageCount: 0,
        creator: 'current-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await MockQuestionsService.createQuestion(questionData);

      toast({
        title: 'Thành công',
        description: 'Câu hỏi đã được tạo thành công',
        variant: 'success'
      });

      router.push(ADMIN_PATHS.QUESTIONS);
    } catch (error) {
      console.error('Lỗi khi tạo câu hỏi:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo câu hỏi',
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
        ...data,
        rawContent: data.content,
        tag: data.tag || [],
        questionCodeId: data.questionCodeId || 'DRAFT_' + Date.now(),
        status: QuestionStatus.PENDING,
        usageCount: 0,
        creator: 'current-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Lưu vào localStorage hoặc draft service
      const savedQuestions = JSON.parse(localStorage.getItem('saved_questions') || '{"questions": []}');
      savedQuestions.questions.push(draftData);
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
                <h1 className="text-3xl font-bold text-foreground">Tạo câu hỏi mới</h1>
                <p className="text-muted-foreground mt-1">
                  Tạo câu hỏi mới cho ngân hàng đề thi
                </p>
              </div>
            </div>
          </div>

          {/* IntegratedQuestionForm */}
          <IntegratedQuestionForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onSaveDraft={handleSaveDraft}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
