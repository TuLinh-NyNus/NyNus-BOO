/**
 * ScoreBreakdown Component
 * Detailed score analysis by question type, time analysis per question,
 * và difficulty level performance với question-by-question breakdown
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-22
 */

"use client";

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui";

// Icons
import {
  BarChart3,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,

  Timer,
  Award,

} from "lucide-react";

// Types
import { ExamResult, Exam, ExamAnswer } from "@/lib/types/exam";
import { Question, QuestionType, QuestionDifficulty } from "@/lib/types/question";

// ===== TYPES =====

export interface ScoreBreakdownProps {
  /** Exam result data */
  result: ExamResult;
  
  /** Exam information */
  exam: Exam;
  
  /** Questions for detailed analysis */
  questions: Question[];
  
  /** User answers for analysis */
  answers?: ExamAnswer[];
  
  /** Show question-by-question details */
  showQuestionDetails?: boolean;
  
  /** Show time analysis */
  showTimeAnalysis?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

interface QuestionAnalysis {
  question: Question;
  answer?: ExamAnswer;
  isCorrect: boolean;
  pointsEarned: number;
  timeSpent: number;
  status: 'correct' | 'incorrect' | 'unanswered';
}

// ===== HELPER FUNCTIONS =====

function analyzeQuestions(questions: Question[], answers: ExamAnswer[] = []): QuestionAnalysis[] {
  return questions.map((question, _index) => {
    const answer = answers.find(a => a.questionId === question.id);
    const isCorrect = answer?.isCorrect || false;
    const pointsEarned = answer?.pointsEarned || 0;
    const timeSpent = answer?.timeSpentSeconds || 0;
    
    let status: 'correct' | 'incorrect' | 'unanswered' = 'unanswered';
    if (answer) {
      status = isCorrect ? 'correct' : 'incorrect';
    }
    
    return {
      question,
      answer,
      isCorrect,
      pointsEarned,
      timeSpent,
      status,
    };
  });
}

function getQuestionTypeStats(analysis: QuestionAnalysis[]) {
  const stats: Record<QuestionType, { correct: number; total: number; points: number; maxPoints: number; avgTime: number }> = {
    [QuestionType.MC]: { correct: 0, total: 0, points: 0, maxPoints: 0, avgTime: 0 },
    [QuestionType.TF]: { correct: 0, total: 0, points: 0, maxPoints: 0, avgTime: 0 },
    [QuestionType.SA]: { correct: 0, total: 0, points: 0, maxPoints: 0, avgTime: 0 },
    [QuestionType.ES]: { correct: 0, total: 0, points: 0, maxPoints: 0, avgTime: 0 },
    [QuestionType.MA]: { correct: 0, total: 0, points: 0, maxPoints: 0, avgTime: 0 },
  };
  
  analysis.forEach(item => {
    const type = item.question.type;
    stats[type].total++;
    stats[type].points += item.pointsEarned;
    stats[type].maxPoints += item.question.points || 0;
    stats[type].avgTime += item.timeSpent;
    
    if (item.isCorrect) {
      stats[type].correct++;
    }
  });
  
  // Calculate average time
  Object.keys(stats).forEach(type => {
    const typeKey = type as QuestionType;
    if (stats[typeKey].total > 0) {
      stats[typeKey].avgTime = stats[typeKey].avgTime / stats[typeKey].total;
    }
  });
  
  return stats;
}

function getDifficultyStats(analysis: QuestionAnalysis[]) {
  const stats: Record<QuestionDifficulty, { correct: number; total: number; points: number; maxPoints: number; avgTime: number }> = {
    [QuestionDifficulty.EASY]: { correct: 0, total: 0, points: 0, maxPoints: 0, avgTime: 0 },
    [QuestionDifficulty.MEDIUM]: { correct: 0, total: 0, points: 0, maxPoints: 0, avgTime: 0 },
    [QuestionDifficulty.HARD]: { correct: 0, total: 0, points: 0, maxPoints: 0, avgTime: 0 },
    [QuestionDifficulty.EXPERT]: { correct: 0, total: 0, points: 0, maxPoints: 0, avgTime: 0 },
  };
  
  analysis.forEach(item => {
    const difficulty = item.question.difficulty || QuestionDifficulty.MEDIUM;
    stats[difficulty].total++;
    stats[difficulty].points += item.pointsEarned;
    stats[difficulty].maxPoints += item.question.points || 0;
    stats[difficulty].avgTime += item.timeSpent;
    
    if (item.isCorrect) {
      stats[difficulty].correct++;
    }
  });
  
  // Calculate average time
  Object.keys(stats).forEach(difficulty => {
    const difficultyKey = difficulty as QuestionDifficulty;
    if (stats[difficultyKey].total > 0) {
      stats[difficultyKey].avgTime = stats[difficultyKey].avgTime / stats[difficultyKey].total;
    }
  });
  
  return stats;
}

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  } else {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
}

// ===== MAIN COMPONENT =====

export function ScoreBreakdown({
  result,
  exam,
  questions,
  answers = [],
  showQuestionDetails = true,
  showTimeAnalysis = true,
  className,
}: ScoreBreakdownProps) {
  
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  
  // Analyze questions
  const questionAnalysis = useMemo(() => 
    analyzeQuestions(questions, answers),
    [questions, answers]
  );
  
  const typeStats = useMemo(() => 
    getQuestionTypeStats(questionAnalysis),
    [questionAnalysis]
  );
  
  const difficultyStats = useMemo(() => 
    getDifficultyStats(questionAnalysis),
    [questionAnalysis]
  );
  
  const toggleQuestionExpansion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };
  
  const getStatusIcon = (status: 'correct' | 'incorrect' | 'unanswered') => {
    switch (status) {
      case 'correct':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'incorrect':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'unanswered':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
    }
  };
  
  const getStatusBadge = (status: 'correct' | 'incorrect' | 'unanswered') => {
    switch (status) {
      case 'correct':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Đúng</Badge>;
      case 'incorrect':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Sai</Badge>;
      case 'unanswered':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Chưa trả lời</Badge>;
    }
  };
  
  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Phân tích chi tiết điểm số
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="by-type" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="by-type">Theo loại câu hỏi</TabsTrigger>
              <TabsTrigger value="by-difficulty">Theo độ khó</TabsTrigger>
              {showTimeAnalysis && (
                <TabsTrigger value="time-analysis">Phân tích thời gian</TabsTrigger>
              )}
            </TabsList>
            
            {/* By Question Type */}
            <TabsContent value="by-type" className="space-y-4">
              {Object.entries(typeStats).map(([type, stats]) => {
                if (stats.total === 0) return null;
                
                const percentage = (stats.correct / stats.total) * 100;
                const scorePercentage = stats.maxPoints > 0 ? (stats.points / stats.maxPoints) * 100 : 0;
                
                const typeName = {
                  [QuestionType.MC]: 'Trắc nghiệm',
                  [QuestionType.TF]: 'Đúng/Sai',
                  [QuestionType.SA]: 'Trả lời ngắn',
                  [QuestionType.ES]: 'Tự luận',
                  [QuestionType.MA]: 'Ghép đôi'
                }[type as QuestionType];
                
                return (
                  <Card key={type} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{typeName}</h4>
                      <Badge variant="outline">
                        {stats.correct}/{stats.total} câu
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Tỷ lệ đúng</span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Điểm số</span>
                          <span>{stats.points}/{stats.maxPoints} ({scorePercentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={scorePercentage} className="h-2" />
                      </div>
                      
                      {showTimeAnalysis && (
                        <div className="text-sm text-gray-600">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Thời gian trung bình: {formatTime(Math.round(stats.avgTime))}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </TabsContent>
            
            {/* By Difficulty */}
            <TabsContent value="by-difficulty" className="space-y-4">
              {Object.entries(difficultyStats).map(([difficulty, stats]) => {
                if (stats.total === 0) return null;
                
                const percentage = (stats.correct / stats.total) * 100;
                const scorePercentage = stats.maxPoints > 0 ? (stats.points / stats.maxPoints) * 100 : 0;
                
                const difficultyName = {
                  [QuestionDifficulty.EASY]: 'Cơ bản',
                  [QuestionDifficulty.MEDIUM]: 'Trung bình',
                  [QuestionDifficulty.HARD]: 'Khó',
                  [QuestionDifficulty.EXPERT]: 'Nâng cao'
                }[difficulty as QuestionDifficulty];
                
                const difficultyColor = {
                  [QuestionDifficulty.EASY]: 'text-green-600',
                  [QuestionDifficulty.MEDIUM]: 'text-blue-600',
                  [QuestionDifficulty.HARD]: 'text-orange-600',
                  [QuestionDifficulty.EXPERT]: 'text-red-600'
                }[difficulty as QuestionDifficulty];
                
                return (
                  <Card key={difficulty} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={cn("font-medium", difficultyColor)}>{difficultyName}</h4>
                      <Badge variant="outline">
                        {stats.correct}/{stats.total} câu
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Tỷ lệ đúng</span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Điểm số</span>
                          <span>{stats.points}/{stats.maxPoints} ({scorePercentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={scorePercentage} className="h-2" />
                      </div>
                      
                      {showTimeAnalysis && (
                        <div className="text-sm text-gray-600">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Thời gian trung bình: {formatTime(Math.round(stats.avgTime))}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </TabsContent>
            
            {/* Time Analysis */}
            {showTimeAnalysis && (
              <TabsContent value="time-analysis" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatTime(result.timeSpentSeconds)}
                    </div>
                    <div className="text-sm text-gray-600">Tổng thời gian</div>
                  </Card>
                  
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatTime(Math.round(result.timeSpentSeconds / questions.length))}
                    </div>
                    <div className="text-sm text-gray-600">Trung bình/câu</div>
                  </Card>
                  
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {((result.timeSpentSeconds / (exam.durationMinutes * 60)) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Thời gian sử dụng</div>
                  </Card>
                </div>
                
                {/* Time per question chart would go here */}
                <Card className="p-4">
                  <h4 className="font-medium mb-3">Thời gian theo từng câu hỏi</h4>
                  <div className="text-sm text-gray-600">
                    Biểu đồ thời gian chi tiết sẽ được hiển thị ở đây
                  </div>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Question-by-Question Breakdown */}
      {showQuestionDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Chi tiết từng câu hỏi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {questionAnalysis.map((item, index) => (
              <Collapsible key={item.question.id}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-3 h-auto"
                    onClick={() => toggleQuestionExpansion(item.question.id)}
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(item.status)}
                      <span className="font-medium">Câu {index + 1}</span>
                      {getStatusBadge(item.status)}
                      <span className="text-sm text-gray-600">
                        {item.pointsEarned}/{item.question.points || 0} điểm
                      </span>
                    </div>
                    {expandedQuestions.has(item.question.id) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="px-3 pb-3">
                  <div className="space-y-3 pt-3 border-t">
                    <div className="text-sm">
                      <strong>Nội dung:</strong> {item.question.content}
                    </div>
                    
                    {item.answer && (
                      <div className="text-sm">
                        <strong>Câu trả lời:</strong> {item.answer.answerData}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>
                        <Timer className="w-3 h-3 inline mr-1" />
                        {formatTime(item.timeSpent)}
                      </span>
                      <span>
                        <Award className="w-3 h-3 inline mr-1" />
                        {item.pointsEarned}/{item.question.points || 0} điểm
                      </span>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
