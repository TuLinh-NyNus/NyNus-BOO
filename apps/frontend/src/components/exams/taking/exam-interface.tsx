/**
 * Exam Interface Component
 * Main exam taking interface với responsive design, navigation, timer, và auto-save
 * Orchestrates ExamTimer, QuestionDisplay, và navigation components
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-22
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// UI Components
import {
  Card,
  CardContent,
  Button,
  Progress,
  Badge,
  Alert,
  AlertDescription,
} from "@/components/ui";

// Icons
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  Save,
  AlertTriangle,
  CheckCircle,

  List,
} from "lucide-react";

// Components
import { ExamTimer } from "./exam-timer";
import { QuestionDisplay } from "./question-display";

// Types
import { Exam } from "@/lib/types/exam";
import { Question } from "@/lib/types/question";

// Custom answer interface for exam taking
interface ExamAnswerInput {
  questionId: string;
  answerText?: string;
  selectedOptions?: string[];
  isFlagged?: boolean;
  timeSpent?: number;
  isAnswered?: boolean;
}

// Store integration
import { useExamAttemptStore } from "@/lib/stores/exam-attempt.store";

// ===== TYPES =====

export interface ExamInterfaceProps {
  /** Exam data */
  exam: Exam;
  
  /** Questions for this exam */
  questions: Question[];
  
  /** Initial question index */
  initialQuestionIndex?: number;
  
  /** Show navigation sidebar */
  showNavigation?: boolean;
  
  /** Auto-save interval in seconds */
  autoSaveInterval?: number;
  
  /** Event handlers */
  onSubmit?: () => void;
  onSave?: () => void;
  onExit?: () => void;
  
  /** Additional CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const _NAVIGATION_BREAKPOINT = 1024; // lg breakpoint

// ===== MAIN COMPONENT =====

export function ExamInterface({
  exam,
  questions,
  initialQuestionIndex = 0,
  showNavigation = true,
  autoSaveInterval: _autoSaveInterval = 30,
  onSubmit,
  onSave,
  onExit,
  className,
}: ExamInterfaceProps) {
  
  const _router = useRouter();

  // Store state
  const _currentAttempt = useExamAttemptStore(state => state.currentAttempt);
  const navigation = useExamAttemptStore(state => state.navigation);
  const answers = useExamAttemptStore(state => state.answers);
  const session = useExamAttemptStore(state => state.session);
  
  // Store actions
  const goToQuestion = useExamAttemptStore(state => state.goToQuestion);
  const updateAnswer = useExamAttemptStore(state => state.updateAnswer);
  const submitAttempt = useExamAttemptStore(state => state.submitAttempt);
  const forceAutoSave = useExamAttemptStore(state => state.forceAutoSave);
  const getProgress = useExamAttemptStore(state => state.getProgress);
  
  // Local state
  const [showNavigationSidebar, setShowNavigationSidebar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize auto-save (implement custom hook if needed)
  // useAutoSave(autoSaveInterval);
  
  // Current question
  const currentQuestion = questions[navigation.currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers.answers[currentQuestion.id] as ExamAnswerInput | undefined : undefined;
  
  // Progress calculation
  const progress = getProgress();
  
  // Navigation helpers
  const canGoPrevious = navigation.currentQuestionIndex > 0;
  const canGoNext = navigation.currentQuestionIndex < questions.length - 1;
  
  // Initialize question index
  useEffect(() => {
    if (initialQuestionIndex !== navigation.currentQuestionIndex) {
      goToQuestion(initialQuestionIndex);
    }
  }, [initialQuestionIndex, navigation.currentQuestionIndex, goToQuestion]);
  
  // Handlers
  const handlePreviousQuestion = useCallback(() => {
    if (canGoPrevious) {
      goToQuestion(navigation.currentQuestionIndex - 1);
    }
  }, [canGoPrevious, navigation.currentQuestionIndex, goToQuestion]);
  
  const handleNextQuestion = useCallback(() => {
    if (canGoNext) {
      goToQuestion(navigation.currentQuestionIndex + 1);
    }
  }, [canGoNext, navigation.currentQuestionIndex, goToQuestion]);
  
  const handleQuestionSelect = useCallback((questionIndex: number) => {
    goToQuestion(questionIndex);
    setShowNavigationSidebar(false);
  }, [goToQuestion]);
  
  const handleAnswerChange = useCallback((answer: ExamAnswerInput) => {
    if (currentQuestion) {
      updateAnswer(currentQuestion.id, answer);
    }
  }, [updateAnswer, currentQuestion]);
  
  const handleQuestionFlag = useCallback((questionId: string, flagged: boolean) => {
    // Implement flag functionality if needed
    console.log('Flag question:', questionId, flagged);
  }, []);
  
  const handleSave = useCallback(async () => {
    try {
      await forceAutoSave();
      onSave?.();
    } catch (error) {
      console.error('Failed to save:', error);
    }
  }, [forceAutoSave, onSave]);
  
  const handleSubmit = useCallback(async () => {
    if (!confirm('Bạn có chắc chắn muốn nộp bài? Bạn sẽ không thể thay đổi câu trả lời sau khi nộp.')) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await submitAttempt();
      onSubmit?.();
    } catch (error) {
      console.error('Failed to submit exam:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [submitAttempt, onSubmit]);
  
  const handleExit = useCallback(() => {
    if (confirm('Bạn có chắc chắn muốn thoát? Tiến độ hiện tại sẽ được lưu tự động.')) {
      onExit?.();
    }
  }, [onExit]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            handleSave();
            break;
          case 'ArrowLeft':
            event.preventDefault();
            handlePreviousQuestion();
            break;
          case 'ArrowRight':
            event.preventDefault();
            handleNextQuestion();
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handlePreviousQuestion, handleNextQuestion]);
  
  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Không tìm thấy câu hỏi. Vui lòng thử lại.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Exam Info */}
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {exam.title}
              </h1>
              <Badge variant="outline">
                Câu {navigation.currentQuestionIndex + 1}/{questions.length}
              </Badge>
            </div>
            
            {/* Timer */}
            <div className="flex items-center space-x-4">
              <ExamTimer
                variant="compact"
                size="sm"
                showControls={false}
                showWarnings={true}
              />
              
              {/* Navigation Toggle (Mobile) */}
              {showNavigation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNavigationSidebar(!showNavigationSidebar)}
                  className="lg:hidden"
                >
                  <List className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Navigation Sidebar */}
          {showNavigation && (
            <div className={cn(
              "w-80 space-y-4",
              "lg:block",
              showNavigationSidebar ? "block" : "hidden"
            )}>
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Tiến độ làm bài</h3>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Đã làm: {progress.answered}/{progress.total}</span>
                      <span>{progress.percentage}%</span>
                    </div>
                    <Progress value={progress.percentage} className="h-2" />
                  </div>
                  
                  {/* Question Grid */}
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((question, index) => {
                      const answer = answers.answers[question.id] as ExamAnswerInput | undefined;
                      const isAnswered = answer?.isAnswered || false;
                      const isFlagged = answer?.isFlagged || false;
                      const isCurrent = index === navigation.currentQuestionIndex;
                      
                      return (
                        <Button
                          key={question.id}
                          variant={isCurrent ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleQuestionSelect(index)}
                          className={cn(
                            "relative h-10 w-10 p-0",
                            isAnswered && !isCurrent && "bg-green-50 border-green-200 text-green-700",
                            isFlagged && "ring-2 ring-orange-300"
                          )}
                        >
                          {index + 1}
                          {isFlagged && (
                            <Flag className="absolute -top-1 -right-1 w-3 h-3 text-orange-500" />
                          )}
                          {isAnswered && !isCurrent && (
                            <CheckCircle className="absolute -bottom-1 -right-1 w-3 h-3 text-green-600" />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-4 space-y-2 text-xs text-gray-600">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-100 border border-green-200 rounded" />
                      <span>Đã trả lời</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 border-2 border-orange-300 rounded" />
                      <span>Đã đánh dấu</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded" />
                      <span>Câu hiện tại</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Auto-save Status */}
              {session.isAutoSaving && (
                <Alert>
                  <Save className="h-4 w-4" />
                  <AlertDescription>
                    Đang lưu tự động...
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Question Display */}
            <QuestionDisplay
              question={currentQuestion}
              questionNumber={navigation.currentQuestionIndex + 1}
              currentAnswer={currentAnswer}
              showMetadata={true}
              allowFlagging={true}
              readOnly={false}
              showValidation={true}
              onAnswerChange={handleAnswerChange}
              onFlag={handleQuestionFlag}
            />
            
            {/* Navigation Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={!canGoPrevious}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Câu trước
                  </Button>
                  
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={handleSave}
                      disabled={session.isAutoSaving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Lưu
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleExit}
                    >
                      Thoát
                    </Button>
                    
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={handleNextQuestion}
                    disabled={!canGoNext}
                  >
                    Câu sau
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
