/**
 * Take Exam Client Component
 * Client component cho exam taking interface theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EXAM_DYNAMIC_ROUTES } from '@/lib/exam-paths';
import { logger } from '@/lib/utils/logger';
import { ExamService } from '@/services/grpc/exam.service';


// ===== TYPES =====

/**
 * Question interface (temporary - will be moved to types file)
 */
interface Question {
  id: string;
  content: string;
  type: 'MULTIPLE_CHOICE' | 'ESSAY' | 'TRUE_FALSE';
  options?: string[];
  correct_answer?: string;
  points: number;
  order_number: number;
}

/**
 * Answer interface
 */
interface Answer {
  question_id: string;
  answer_text: string;
  selected_options?: string[];
  is_flagged: boolean;
}

/**
 * Exam attempt interface
 */
interface ExamAttempt {
  id: string;
  exam_id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  duration_minutes: number;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED' | 'CANCELLED';
  answers: Answer[];
}

/**
 * Component props interface
 */
interface TakeExamClientProps {
  examId: string;
}

// ===== MAIN COMPONENT =====

/**
 * Take Exam Client Component
 * Client component cho exam taking interface với timer và auto-save
 * 
 * Features:
 * - Real-time timer countdown
 * - Question navigation
 * - Auto-save answers
 * - Flag questions for review
 * - Submit exam functionality
 * - Responsive design
 * - Keyboard shortcuts
 */
export default function TakeExamClient({ examId }: TakeExamClientProps) {
  const router = useRouter();
  
  // ===== STATE =====
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [examAttempt, setExamAttempt] = useState<ExamAttempt | null>(null);

  // ===== EFFECTS =====

  useEffect(() => {
    const loadExam = async () => {
      setLoading(true);
      try {
        // Use real gRPC service to start exam and load questions
        // Note: Currently using mock data - full implementation requires ExamService.startExam()
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - will be replaced with actual API call
        const mockQuestions: Question[] = [
          {
            id: '1',
            content: 'Tìm đạo hàm của hàm số f(x) = x³ + 2x² - 5x + 1',
            type: 'MULTIPLE_CHOICE',
            options: [
              'f\'(x) = 3x² + 4x - 5',
              'f\'(x) = 3x² + 4x + 5',
              'f\'(x) = x² + 4x - 5',
              'f\'(x) = 3x + 4x - 5'
            ],
            correct_answer: 'f\'(x) = 3x² + 4x - 5',
            points: 5,
            order_number: 1,
          },
          {
            id: '2',
            content: 'Giải thích ý nghĩa hình học của đạo hàm tại một điểm.',
            type: 'ESSAY',
            points: 10,
            order_number: 2,
          },
        ];
        
        const mockAttempt: ExamAttempt = {
          id: 'attempt-1',
          exam_id: examId,
          user_id: 'user-1',
          start_time: new Date().toISOString(),
          duration_minutes: 45,
          status: 'IN_PROGRESS',
          answers: [],
        };
        
        setQuestions(mockQuestions);
        setExamAttempt(mockAttempt);
        setTimeRemaining(45 * 60); // 45 minutes in seconds
        
        // Initialize answers
        const initialAnswers: Record<string, Answer> = {};
        mockQuestions.forEach(q => {
          initialAnswers[q.id] = {
            question_id: q.id,
            answer_text: '',
            selected_options: [],
            is_flagged: false,
          };
        });
        setAnswers(initialAnswers);
        
      } catch (error) {
        logger.error('[TakeExamClient] Failed to load exam', {
          operation: 'loadExam',
          examId,
          errorName: error instanceof Error ? error.name : 'Unknown',
          errorMessage: error instanceof Error ? error.message : 'Failed to load exam',
          stack: error instanceof Error ? error.stack : undefined,
        });
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [examId]);

  // ===== HANDLERS =====

  const handleSubmitExam = useCallback(async () => {
    if (!confirm('Bạn có chắc chắn muốn nộp bài? Bạn sẽ không thể thay đổi câu trả lời sau khi nộp.')) {
      return;
    }

    setSaving(true);
    try {
      if (!examAttempt) {
        throw new Error('No exam attempt found');
      }

      // Use real gRPC service to submit exam
      await ExamService.submitExam(examAttempt.id);

      logger.debug('[TakeExamClient] Exam submitted successfully', {
        operation: 'submitExam',
        examId,
        attemptId: examAttempt.id,
        answerCount: Object.keys(answers).length,
      });

      // Navigate to results page
      router.push(EXAM_DYNAMIC_ROUTES.RESULTS(examId));
    } catch (error) {
      logger.error('[TakeExamClient] Failed to submit exam', {
        operation: 'submitExam',
        examId,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : 'Failed to submit exam',
        stack: error instanceof Error ? error.stack : undefined,
      });
    } finally {
      setSaving(false);
    }
  }, [examId, answers, router]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0 || loading) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, loading, handleSubmitExam]);

  const saveAnswers = useCallback(async () => {
    if (!examAttempt) return;

    setSaving(true);
    try {
      // Use real gRPC service to save answers
      // Save each answer that has been modified
      const savePromises = Object.entries(answers).map(([questionId, answer]) => {
        if (answer.answer_text || answer.selected_options?.length) {
          const answerData = JSON.stringify({
            answer_text: answer.answer_text,
            selected_options: answer.selected_options,
          });
          return ExamService.saveAnswer(examAttempt.id, questionId, answerData);
        }
        return Promise.resolve({ success: true });
      });

      await Promise.all(savePromises);

      logger.debug('[TakeExamClient] Answers auto-saved successfully', {
        operation: 'autoSaveAnswers',
        attemptId: examAttempt.id,
        answerCount: Object.keys(answers).length,
      });
    } catch (error) {
      logger.error('[TakeExamClient] Failed to save answers', {
        operation: 'autoSaveAnswers',
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : 'Failed to save answers',
        stack: error instanceof Error ? error.stack : undefined,
      });
    } finally {
      setSaving(false);
    }
  }, [answers, examAttempt]);

  // Auto-save effect
  useEffect(() => {
    if (loading || !examAttempt) return;

    const autoSave = setInterval(() => {
      saveAnswers();
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSave);
  }, [answers, loading, examAttempt, saveAnswers]);

  // ===== HANDLERS =====

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        answer_text: typeof value === 'string' ? value : '',
        selected_options: Array.isArray(value) ? value : [],
      }
    }));
  };

  const handleFlagQuestion = (questionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        is_flagged: !prev[questionId].is_flagged,
      }
    }));
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  // ===== RENDER HELPERS =====

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnswerStatus = (questionId: string): 'answered' | 'flagged' | 'unanswered' => {
    const answer = answers[questionId];
    if (!answer) return 'unanswered';
    
    if (answer.is_flagged) return 'flagged';
    
    const hasAnswer = answer.answer_text.trim() !== '' || 
                     (answer.selected_options && answer.selected_options.length > 0);
    
    return hasAnswer ? 'answered' : 'unanswered';
  };

  const currentQuestion = questions[currentQuestionIndex];

  // ===== RENDER =====

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải đề thi...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Không thể tải đề thi</h1>
          <p className="text-muted-foreground">Vui lòng thử lại sau</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold">Làm bài thi</h1>
              <Badge variant="outline">
                Câu {currentQuestionIndex + 1} / {questions.length}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              {saving && (
                <span className="text-sm text-muted-foreground">Đang lưu...</span>
              )}
              
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                <Clock className="h-4 w-4" />
                <span className="font-mono font-medium">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              
              <Button onClick={handleSubmitExam} disabled={saving}>
                <Send className="h-4 w-4 mr-2" />
                Nộp bài
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border bg-card p-4 sticky top-24">
              <h3 className="font-semibold mb-4">Danh sách câu hỏi</h3>
              
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {questions.map((_, index) => {
                  const status = getAnswerStatus(questions[index].id);
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuestionNavigation(index)}
                      className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                        index === currentQuestionIndex
                          ? 'bg-primary text-primary-foreground'
                          : status === 'answered'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : status === 'flagged'
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 rounded"></div>
                  <span>Đã trả lời</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-100 rounded"></div>
                  <span>Đánh dấu</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-muted rounded"></div>
                  <span>Chưa trả lời</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">
                  Câu {currentQuestion.order_number}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({currentQuestion.points} điểm)
                  </span>
                </h2>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFlagQuestion(currentQuestion.id)}
                  className={answers[currentQuestion.id]?.is_flagged ? 'bg-yellow-100' : ''}
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mb-6">
                <p className="text-base leading-relaxed">
                  {currentQuestion.content}
                </p>
              </div>
              
              {/* Answer Input */}
              <div className="space-y-4">
                {currentQuestion.type === 'MULTIPLE_CHOICE' && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <label key={index} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={option}
                          checked={answers[currentQuestion.id]?.selected_options?.includes(option)}
                          onChange={(e) => handleAnswerChange(currentQuestion.id, [e.target.value])}
                          className="mt-1"
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
                
                {currentQuestion.type === 'ESSAY' && (
                  <textarea
                    value={answers[currentQuestion.id]?.answer_text || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder="Nhập câu trả lời của bạn..."
                    rows={8}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                  />
                )}
                
                {currentQuestion.type === 'TRUE_FALSE' && (
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value="true"
                        checked={answers[currentQuestion.id]?.answer_text === 'true'}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      />
                      <span className="text-sm">Đúng</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value="false"
                        checked={answers[currentQuestion.id]?.answer_text === 'false'}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      />
                      <span className="text-sm">Sai</span>
                    </label>
                  </div>
                )}
              </div>
              
              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Câu trước
                </Button>
                
                <div className="flex items-center gap-2">
                  {getAnswerStatus(currentQuestion.id) === 'answered' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {answers[currentQuestion.id]?.is_flagged && (
                    <Flag className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                
                <Button
                  variant="outline"
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  Câu sau
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
