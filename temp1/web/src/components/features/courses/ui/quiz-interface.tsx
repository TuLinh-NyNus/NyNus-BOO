'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  ArrowRight,
  Flag,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button, Progress, RadioGroup, RadioGroupItem } from '@/components/ui';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Label } from "@/components/ui/form/label";
import { MockQuiz, MockQuizQuestion } from '@/lib/mock-data/types';
import { cn } from '@/lib/utils';

interface QuizInterfaceProps {
  quiz: MockQuiz;
  onSubmit?: (Answers: Record<string, string>, score: number) => void;
  onExit?: () => void;
  className?: string;
}

interface QuizState {
  currentQuestionIndex: number;
  Answers: Record<string, string>;
  timeRemaining: number;
  isSubmitted: boolean;
  showResults: boolean;
  score: number;
  flaggedQuestions: Set<string>;
}

export function QuizInterface({ 
  quiz, 
  onSubmit,
  onExit,
  className 
}: QuizInterfaceProps): JSX.Element {
  const [state, setState] = useState<QuizState>({
    currentQuestionIndex: 0,
    Answers: {},
    timeRemaining: quiz.timeLimit * 60, // Convert to seconds
    isSubmitted: false,
    showResults: false,
    score: 0,
    flaggedQuestions: new Set()
  });

  const currentQuestion = quiz.questions[state.currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progress = ((state.currentQuestionIndex + 1) / totalQuestions) * 100;

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
  }, [state.isSubmitted, state.timeRemaining]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (QuestionID: string, answer: string) => {
    setState(prev => ({
      ...prev,
      Answers: { ...prev.Answers, [QuestionID]: answer }
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

  const handleQuestionNavigation = (index: number) => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: index
    }));
  };

  const toggleFlag = (QuestionID: string) => {
    setState(prev => {
      const newFlagged = new Set(prev.flaggedQuestions);
      if (newFlagged.has(QuestionID)) {
        newFlagged.delete(QuestionID);
      } else {
        newFlagged.add(QuestionID);
      }
      return { ...prev, flaggedQuestions: newFlagged };
    });
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach(question => {
      if (state.Answers[question._id] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / totalQuestions) * 100);
  };

  const handleSubmitQuiz = () => {
    const finalScore = calculateScore();
    setState(prev => ({
      ...prev,
      isSubmitted: true,
      showResults: true,
      score: finalScore
    }));
    onSubmit?.(state.Answers, finalScore);
  };

  const handleRetry = () => {
    setState({
      currentQuestionIndex: 0,
      Answers: {},
      timeRemaining: quiz.timeLimit * 60,
      isSubmitted: false,
      showResults: false,
      score: 0,
      flaggedQuestions: new Set()
    });
  };

  const getQuestionStatus = (index: number, QuestionID: string) => {
    if (state.isSubmitted) {
      const isCorrect = state.Answers[QuestionID] === quiz.questions[index].correctAnswer;
      return isCorrect ? 'correct' : 'incorrect';
    }
    if (state.Answers[QuestionID]) return 'answered';
    if (state.flaggedQuestions.has(QuestionID)) return 'flagged';
    return 'unanswered';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'correct': return 'bg-green-500';
      case 'incorrect': return 'bg-red-500';
      case 'answered': return 'bg-blue-500';
      case 'flagged': return 'bg-yellow-500';
      default: return 'bg-slate-600';
    }
  };

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
                    Điểm tối thiểu: {quiz.passingScore}% • 
                    Số câu đúng: {quiz.questions.filter(q => state.Answers[q.id] === q.correctAnswer).length}/{totalQuestions}
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Làm lại
                </Button>
                <Button
                  onClick={onExit}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Hoàn thành
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={onExit}
                  className="text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Thoát
                </Button>
                <div>
                  <h2 className="font-semibold text-white">{quiz.title}</h2>
                  <p className="text-sm text-slate-400">{quiz.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={cn(
                    "text-lg font-mono",
                    state.timeRemaining < 300 ? "text-red-400" : "text-white"
                  )}>
                    <Clock className="h-4 w-4 inline mr-1" />
                    {formatTime(state.timeRemaining)}
                  </div>
                  {state.timeRemaining < 300 && (
                    <p className="text-xs text-red-400">Sắp hết thời gian!</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Câu {state.currentQuestionIndex + 1} / {totalQuestions}</span>
                <span>{Math.round(progress)}% hoàn thành</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl text-white">
                      Câu {state.currentQuestionIndex + 1}: {currentQuestion.Question}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFlag(currentQuestion.id)}
                      className={cn(
                        "text-slate-400 hover:text-yellow-400",
                        state.flaggedQuestions.has(currentQuestion.id) && "text-yellow-400"
                      )}
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    {currentQuestion.Points} điểm
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                    <RadioGroup
                      value={state.Answers[currentQuestion.id] || ''}
                      onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                    >
                      {currentQuestion.options.map((option: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`option-${index}`} />
                          <Label 
                            htmlFor={`option-${index}`} 
                            className="text-white cursor-pointer flex-1 p-3 rounded-lg hover:bg-slate-700/50 transition-colors"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={handlePreviousQuestion}
                      disabled={state.currentQuestionIndex === 0}
                      className="border-slate-600 text-white hover:bg-slate-700"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Câu trước
                    </Button>

                    {state.currentQuestionIndex === totalQuestions - 1 ? (
                      <Button
                        onClick={handleSubmitQuiz}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={Object.keys(state.Answers).length === 0}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Nộp bài
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNextQuestion}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Câu tiếp theo
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Question Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Danh sách câu hỏi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {quiz.questions.map((question, index) => {
                  const status = getQuestionStatus(index, question._id);
                  return (
                    <button
                      key={question._id}
                      onClick={() => handleQuestionNavigation(index)}
                      className={cn(
                        "w-10 h-10 rounded-lg text-white font-medium transition-colors",
                        getStatusColor(status),
                        state.currentQuestionIndex === index && "ring-2 ring-purple-400"
                      )}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Đã trả lời</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Đánh dấu</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-600 rounded"></div>
                  <span>Chưa trả lời</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
