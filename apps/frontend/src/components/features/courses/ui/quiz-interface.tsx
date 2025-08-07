'use client';

import { motion } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Flag,
  RotateCcw
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { Button } from '@/components/ui/form/button';
import { Progress } from '@/components/ui/display/progress';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Label } from "@/components/ui/form/label";
import { cn } from '@/lib/utils';

// Mock Quiz interfaces tương thích
interface MockQuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

interface MockQuiz {
  id: string;
  title: string;
  description: string;
  questions: MockQuizQuestion[];
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  attempts: number;
  isCompleted: boolean;
  bestScore?: number;
}

interface QuizInterfaceProps {
  quiz: MockQuiz;
  onSubmit?: (answers: Record<string, string>, score: number) => void;
  onExit?: () => void;
  className?: string;
}

interface QuizState {
  currentQuestionIndex: number;
  answers: Record<string, string>;
  timeRemaining: number;
  isSubmitted: boolean;
  showResults: boolean;
  score: number;
  flaggedQuestions: Set<string>;
}

/**
 * QuizInterface Component
 * Giao diện làm bài quiz với timer, navigation, flagging
 */
export function QuizInterface({ 
  quiz, 
  onSubmit,
  onExit,
  className 
}: QuizInterfaceProps): JSX.Element {
  const [state, setState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    timeRemaining: quiz.timeLimit * 60, // Convert to seconds
    isSubmitted: false,
    showResults: false,
    score: 0,
    flaggedQuestions: new Set()
  });

  const currentQuestion = quiz.questions[state.currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progress = ((state.currentQuestionIndex + 1) / totalQuestions) * 100;

  const calculateScore = useCallback(() => {
    const correct = Object.entries(state.answers).reduce((acc, [questionId, answer]) => {
      const question = quiz.questions.find(q => q.id === questionId);
      if (question && answer === question.correctAnswer) {
        return acc + 1;
      }
      return acc;
    }, 0);
    return Math.round((correct / totalQuestions) * 100);
  }, [state.answers, quiz.questions, totalQuestions]);

  const handleSubmitQuiz = useCallback(() => {
    const finalScore = calculateScore();
    setState(prev => ({
      ...prev,
      isSubmitted: true,
      showResults: true,
      score: finalScore
    }));
    onSubmit?.(state.answers, finalScore);
  }, [state.answers, onSubmit, calculateScore]);

  // Timer countdown
  useEffect(() => {
    if (state.isSubmitted || state.timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setState(prev => {
        const newTime = prev.timeRemaining - 1;
        if (newTime <= 0) {
          handleSubmitQuiz();
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isSubmitted, state.timeRemaining, handleSubmitQuiz]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer }
    }));
  };

  const handleNextQuestion = () => {
    if (state.currentQuestionIndex < totalQuestions - 1) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    }
  };

  const handlePreviousQuestion = () => {
    if (state.currentQuestionIndex > 0) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));
    }
  };

  const toggleFlag = (questionId: string) => {
    setState(prev => {
      const newFlagged = new Set(prev.flaggedQuestions);
      if (newFlagged.has(questionId)) {
        newFlagged.delete(questionId);
      } else {
        newFlagged.add(questionId);
      }
      return { ...prev, flaggedQuestions: newFlagged };
    });
  };



  const handleRetry = () => {
    setState({
      currentQuestionIndex: 0,
      answers: {},
      timeRemaining: quiz.timeLimit * 60,
      isSubmitted: false,
      showResults: false,
      score: 0,
      flaggedQuestions: new Set()
    });
  };

  // Results view
  if (state.showResults) {
    return (
      <div className={cn("space-y-6", className)}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-slate-800/50 border-slate-700 text-center">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Kết quả bài tập</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="text-6xl font-bold text-purple-400">
                  {state.score}%
                </div>
                <div className="space-y-2">
                  <p className="text-xl text-white">
                    {state.score >= quiz.passingScore ? 'Chúc mừng! Bạn đã vượt qua bài tập' : 'Bạn chưa đạt điểm tối thiểu'}
                  </p>
                  <p className="text-slate-400">
                    Điểm tối thiểu: {quiz.passingScore}%
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  onClick={handleRetry}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Làm lại
                </Button>
                <Button
                  variant="outline"
                  onClick={onExit}
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  Thoát
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Quiz Header */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-white">{quiz.title}</CardTitle>
              <p className="text-slate-400 mt-1">{quiz.description}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg",
                state.timeRemaining <= 300 ? "bg-red-900/50" : "bg-slate-700/50"
              )}>
                <Clock className={cn(
                  "h-4 w-4",
                  state.timeRemaining <= 300 ? "text-red-400" : "text-white"
                )} />
                <span className={cn(
                  "font-mono font-semibold",
                  state.timeRemaining <= 300 ? "text-red-400" : "text-white"
                )}>
                  {formatTime(state.timeRemaining)}
                </span>
              </div>
              
              {/* Exit Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={onExit}
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                Thoát
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-400">
          <span>Câu hỏi {state.currentQuestionIndex + 1} / {totalQuestions}</span>
          <span>{Math.round(progress)}% hoàn thành</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Question Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    Câu {state.currentQuestionIndex + 1}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {currentQuestion.points} điểm
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  {currentQuestion.question}
                </h3>
              </div>
              
              {/* Flag Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleFlag(currentQuestion.id)}
                className={cn(
                  "border-slate-600 hover:bg-slate-700",
                  state.flaggedQuestions.has(currentQuestion.id) 
                    ? "text-yellow-400 border-yellow-400" 
                    : "text-white"
                )}
              >
                <Flag className="h-4 w-4" />
              </Button>
            </div>

            {/* Answer Options */}
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      state.answers[currentQuestion.id] === option
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-slate-600 hover:border-slate-500 hover:bg-slate-700/30"
                    )}
                    onClick={() => handleAnswerChange(currentQuestion.id, option)}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      state.answers[currentQuestion.id] === option
                        ? "border-purple-500 bg-purple-500"
                        : "border-slate-400"
                    )}>
                      {state.answers[currentQuestion.id] === option && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <Label className="text-white cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          disabled={state.currentQuestionIndex === 0}
          className="border-slate-600 text-white hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Câu trước
        </Button>

        <div className="flex gap-2">
          {state.currentQuestionIndex === totalQuestions - 1 ? (
            <Button
              onClick={handleSubmitQuiz}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Nộp bài
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Câu tiếp
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Export types for external use
export type { MockQuiz, MockQuizQuestion };
