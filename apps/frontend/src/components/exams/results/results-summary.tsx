/**
 * ResultsSummary Component
 * Overall performance summary với strengths, areas for improvement, và recommendations
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-22
 */

"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
} from "@/components/ui";

// Icons
import {
  TrendingUp,
  TrendingDown,
  Target,
  BookOpen,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Star,
  Brain,
} from "lucide-react";

// Types
import { ExamResult, Exam, ExamAnswer } from "@/lib/types/exam";
import { Question, QuestionType, QuestionDifficulty } from "@/lib/types/question";

// ===== TYPES =====

interface PerformanceAnalysis {
  correct: number;
  total: number;
}

type DifficultyAnalysis = Record<QuestionDifficulty, PerformanceAnalysis>;
type TypeAnalysis = Record<QuestionType, PerformanceAnalysis>;

export interface ResultsSummaryProps {
  /** Exam result data */
  result: ExamResult;

  /** Exam information */
  exam: Exam;

  /** Questions for analysis */
  questions?: Question[];

  /** User answers for detailed analysis */
  answers?: ExamAnswer[];

  /** Show recommendations */
  showRecommendations?: boolean;

  /** Additional CSS classes */
  className?: string;
}

// ===== HELPER FUNCTIONS =====

function analyzePerformanceByDifficulty(questions: Question[], answers: ExamAnswer[]): DifficultyAnalysis {
  const analysis: DifficultyAnalysis = {
    [QuestionDifficulty.EASY]: { correct: 0, total: 0 },
    [QuestionDifficulty.MEDIUM]: { correct: 0, total: 0 },
    [QuestionDifficulty.HARD]: { correct: 0, total: 0 },
    [QuestionDifficulty.EXPERT]: { correct: 0, total: 0 },
  };

  questions.forEach((question) => {
    const answer = answers.find(a => a.questionId === question.id);
    const difficulty = question.difficulty || QuestionDifficulty.MEDIUM;

    analysis[difficulty].total++;
    if (answer?.isCorrect) {
      analysis[difficulty].correct++;
    }
  });

  return analysis;
}

function analyzePerformanceByType(questions: Question[], answers: ExamAnswer[]): TypeAnalysis {
  const analysis: TypeAnalysis = {
    [QuestionType.MC]: { correct: 0, total: 0 },
    [QuestionType.TF]: { correct: 0, total: 0 },
    [QuestionType.SA]: { correct: 0, total: 0 },
    [QuestionType.ES]: { correct: 0, total: 0 },
    [QuestionType.MA]: { correct: 0, total: 0 },
  };

  questions.forEach((question) => {
    const answer = answers.find(a => a.questionId === question.id);

    analysis[question.type].total++;
    if (answer?.isCorrect) {
      analysis[question.type].correct++;
    }
  });

  return analysis;
}

function generateStrengths(result: ExamResult, difficultyAnalysis: DifficultyAnalysis, typeAnalysis: TypeAnalysis): string[] {
  const strengths: string[] = [];
  
  // Check overall performance
  if (result.percentage >= 80) {
    strengths.push("Hiểu biết tổng thể về môn học rất tốt");
  } else if (result.percentage >= 70) {
    strengths.push("Nắm vững kiến thức cơ bản của môn học");
  }
  
  // Check difficulty performance
  Object.entries(difficultyAnalysis).forEach(([difficulty, data]: [string, PerformanceAnalysis]) => {
    if (data.total > 0) {
      const percentage = (data.correct / data.total) * 100;
      if (percentage >= 80) {
        const difficultyName = {
          [QuestionDifficulty.EASY]: 'cơ bản',
          [QuestionDifficulty.MEDIUM]: 'trung bình',
          [QuestionDifficulty.HARD]: 'khó',
          [QuestionDifficulty.EXPERT]: 'nâng cao'
        }[difficulty as QuestionDifficulty];
        strengths.push(`Xuất sắc với câu hỏi mức độ ${difficultyName}`);
      }
    }
  });
  
  // Check question type performance
  Object.entries(typeAnalysis).forEach(([type, data]: [string, PerformanceAnalysis]) => {
    if (data.total > 0) {
      const percentage = (data.correct / data.total) * 100;
      if (percentage >= 85) {
        const typeName = {
          [QuestionType.MC]: 'trắc nghiệm',
          [QuestionType.TF]: 'đúng/sai',
          [QuestionType.SA]: 'trả lời ngắn',
          [QuestionType.ES]: 'tự luận',
          [QuestionType.MA]: 'ghép đôi'
        }[type as QuestionType];
        strengths.push(`Thành thạo với câu hỏi ${typeName}`);
      }
    }
  });
  
  // Time management
  if (result.timeSpentSeconds < (result.exam?.durationMinutes || 60) * 60 * 0.8) {
    strengths.push("Quản lý thời gian hiệu quả");
  }
  
  return strengths.length > 0 ? strengths : ["Hoàn thành bài thi đầy đủ"];
}

function generateImprovementAreas(result: ExamResult, difficultyAnalysis: DifficultyAnalysis, typeAnalysis: TypeAnalysis): string[] {
  const areas: string[] = [];
  
  // Check overall performance
  if (result.percentage < 50) {
    areas.push("Cần ôn tập lại kiến thức cơ bản");
  } else if (result.percentage < 70) {
    areas.push("Cần củng cố thêm kiến thức nền tảng");
  }
  
  // Check difficulty performance
  Object.entries(difficultyAnalysis).forEach(([difficulty, data]: [string, PerformanceAnalysis]) => {
    if (data.total > 0) {
      const percentage = (data.correct / data.total) * 100;
      if (percentage < 60) {
        const difficultyName = {
          [QuestionDifficulty.EASY]: 'cơ bản',
          [QuestionDifficulty.MEDIUM]: 'trung bình',
          [QuestionDifficulty.HARD]: 'khó',
          [QuestionDifficulty.EXPERT]: 'nâng cao'
        }[difficulty as QuestionDifficulty];
        areas.push(`Cần luyện tập thêm với câu hỏi mức độ ${difficultyName}`);
      }
    }
  });
  
  // Check question type performance
  Object.entries(typeAnalysis).forEach(([type, data]: [string, PerformanceAnalysis]) => {
    if (data.total > 0) {
      const percentage = (data.correct / data.total) * 100;
      if (percentage < 60) {
        const typeName = {
          [QuestionType.MC]: 'trắc nghiệm',
          [QuestionType.TF]: 'đúng/sai',
          [QuestionType.SA]: 'trả lời ngắn',
          [QuestionType.ES]: 'tự luận',
          [QuestionType.MA]: 'ghép đôi'
        }[type as QuestionType];
        areas.push(`Cần cải thiện kỹ năng làm bài ${typeName}`);
      }
    }
  });
  
  // Unanswered questions
  if (result.unansweredQuestions > 0) {
    areas.push("Cần quản lý thời gian tốt hơn để hoàn thành tất cả câu hỏi");
  }
  
  return areas;
}

function generateRecommendations(result: ExamResult, _exam: Exam, _areas: string[]): string[] {
  const recommendations: string[] = [];
  
  if (result.percentage < 50) {
    recommendations.push("Ôn tập lại từ đầu với tài liệu cơ bản");
    recommendations.push("Tham gia lớp học bổ trợ hoặc tìm gia sư");
    recommendations.push("Làm nhiều bài tập cơ bản để củng cố kiến thức");
  } else if (result.percentage < 70) {
    recommendations.push("Tập trung ôn tập các chủ đề yếu");
    recommendations.push("Làm thêm bài tập nâng cao");
    recommendations.push("Tham khảo thêm tài liệu học tập");
  } else if (result.percentage < 85) {
    recommendations.push("Luyện tập với đề thi khó hơn");
    recommendations.push("Tìm hiểu sâu hơn về các chủ đề nâng cao");
    recommendations.push("Chia sẻ kiến thức với bạn bè để củng cố");
  } else {
    recommendations.push("Tiếp tục duy trì phong độ học tập tốt");
    recommendations.push("Thử thách bản thân với các đề thi khó hơn");
    recommendations.push("Hỗ trợ bạn bè trong học tập");
  }
  
  // Time management recommendations
  if (result.unansweredQuestions > 0) {
    recommendations.push("Luyện tập quản lý thời gian khi làm bài");
    recommendations.push("Ưu tiên làm câu dễ trước, câu khó sau");
  }
  
  return recommendations;
}

// ===== MAIN COMPONENT =====

export function ResultsSummary({
  result,
  exam,
  questions = [],
  answers = [],
  showRecommendations = true,
  className,
}: ResultsSummaryProps) {
  
  // Analyze performance
  const difficultyAnalysis = useMemo(() => 
    analyzePerformanceByDifficulty(questions, answers),
    [questions, answers]
  );
  
  const typeAnalysis = useMemo(() => 
    analyzePerformanceByType(questions, answers),
    [questions, answers]
  );
  
  const strengths = useMemo(() => 
    generateStrengths(result, difficultyAnalysis, typeAnalysis),
    [result, difficultyAnalysis, typeAnalysis]
  );
  
  const improvementAreas = useMemo(() => 
    generateImprovementAreas(result, difficultyAnalysis, typeAnalysis),
    [result, difficultyAnalysis, typeAnalysis]
  );
  
  const recommendations = useMemo(() => 
    generateRecommendations(result, exam, improvementAreas),
    [result, exam, improvementAreas]
  );
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Performance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Phân tích hiệu suất chi tiết
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Performance by Difficulty */}
          {questions.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Hiệu suất theo độ khó
              </h4>
              <div className="space-y-3">
                {Object.entries(difficultyAnalysis).map(([difficulty, data]: [string, PerformanceAnalysis]) => {
                  if (data.total === 0) return null;
                  
                  const percentage = (data.correct / data.total) * 100;
                  const difficultyName = {
                    [QuestionDifficulty.EASY]: 'Cơ bản',
                    [QuestionDifficulty.MEDIUM]: 'Trung bình',
                    [QuestionDifficulty.HARD]: 'Khó',
                    [QuestionDifficulty.EXPERT]: 'Nâng cao'
                  }[difficulty as QuestionDifficulty];
                  
                  return (
                    <div key={difficulty}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{difficultyName}</span>
                        <span>{data.correct}/{data.total} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Performance by Question Type */}
          {questions.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                Hiệu suất theo loại câu hỏi
              </h4>
              <div className="space-y-3">
                {Object.entries(typeAnalysis).map(([type, data]: [string, PerformanceAnalysis]) => {
                  if (data.total === 0) return null;
                  
                  const percentage = (data.correct / data.total) * 100;
                  const typeName = {
                    [QuestionType.MC]: 'Trắc nghiệm',
                    [QuestionType.TF]: 'Đúng/Sai',
                    [QuestionType.SA]: 'Trả lời ngắn',
                    [QuestionType.ES]: 'Tự luận',
                    [QuestionType.MA]: 'Ghép đôi'
                  }[type as QuestionType];
                  
                  return (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{typeName}</span>
                        <span>{data.correct}/{data.total} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-green-700">
            <TrendingUp className="w-5 h-5 mr-2" />
            Điểm mạnh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {strengths.map((strength, index) => (
              <div key={index} className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{strength}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Areas for Improvement */}
      {improvementAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-orange-700">
              <TrendingDown className="w-5 h-5 mr-2" />
              Cần cải thiện
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {improvementAreas.map((area, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{area}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Recommendations */}
      {showRecommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700">
              <Lightbulb className="w-5 h-5 mr-2" />
              Gợi ý học tập
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Star className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
