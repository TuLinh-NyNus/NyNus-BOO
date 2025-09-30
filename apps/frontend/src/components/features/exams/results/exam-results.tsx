/**
 * ExamResults Component
 * Comprehensive exam results display với score breakdown, performance analytics
 * và detailed question-by-question analysis
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
  Button,
  Badge,
  Progress,
  Alert,
  AlertDescription,
} from "@/components/ui";

// Icons
import {
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Share2,
  RotateCcw,
  TrendingUp,
  Award,
  Calendar,
} from "lucide-react";

// Types
import { ExamResult, Exam, ExamAnswer } from "@/types/exam";
import { Question } from "@/types/question";

// Components
import { ResultsSummary } from "./results-summary";
import { ScoreBreakdown } from "./score-breakdown";

// ===== TYPES =====

export interface ExamResultsProps {
  /** Exam result data */
  result: ExamResult;
  
  /** Exam information */
  exam: Exam;
  
  /** Questions with answers */
  questions?: Question[];
  
  /** User answers */
  answers?: ExamAnswer[];
  
  /** Show detailed breakdown */
  showBreakdown?: boolean;
  
  /** Show question-by-question analysis */
  showQuestionAnalysis?: boolean;
  
  /** Allow result sharing */
  allowSharing?: boolean;
  
  /** Allow result download */
  allowDownload?: boolean;
  
  /** Event handlers */
  onRetakeExam?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onViewExam?: () => void;
  
  /** Additional CSS classes */
  className?: string;
}

// ===== HELPER FUNCTIONS =====

function getGradeInfo(percentage: number) {
  if (percentage >= 90) return { grade: 'A+', color: 'bg-green-500', textColor: 'text-green-700' };
  if (percentage >= 85) return { grade: 'A', color: 'bg-green-400', textColor: 'text-green-600' };
  if (percentage >= 80) return { grade: 'B+', color: 'bg-blue-500', textColor: 'text-blue-700' };
  if (percentage >= 75) return { grade: 'B', color: 'bg-blue-400', textColor: 'text-blue-600' };
  if (percentage >= 70) return { grade: 'C+', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
  if (percentage >= 65) return { grade: 'C', color: 'bg-yellow-400', textColor: 'text-yellow-600' };
  if (percentage >= 50) return { grade: 'D', color: 'bg-orange-500', textColor: 'text-orange-700' };
  return { grade: 'F', color: 'bg-red-500', textColor: 'text-red-700' };
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
}

// ===== MAIN COMPONENT =====

export function ExamResults({
  result,
  exam,
  questions = [],
  answers = [],
  showBreakdown = true,
  showQuestionAnalysis = true,
  allowSharing = true,
  allowDownload = true,
  onRetakeExam,
  onDownload,
  onShare,
  onViewExam,
  className,
}: ExamResultsProps) {
  
  // Calculate derived data
  const gradeInfo = useMemo(() => getGradeInfo(result.percentage), [result.percentage]);
  
  const totalQuestions = useMemo(() => 
    result.correctAnswers + result.incorrectAnswers + result.unansweredQuestions,
    [result.correctAnswers, result.incorrectAnswers, result.unansweredQuestions]
  );
  
  const accuracy = useMemo(() => {
    const answeredQuestions = result.correctAnswers + result.incorrectAnswers;
    return answeredQuestions > 0 ? (result.correctAnswers / answeredQuestions) * 100 : 0;
  }, [result.correctAnswers, result.incorrectAnswers]);
  
  const averageTimePerQuestion = useMemo(() => {
    return totalQuestions > 0 ? result.timeSpentSeconds / totalQuestions : 0;
  }, [result.timeSpentSeconds, totalQuestions]);
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Section */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            {result.passed ? (
              <div className="flex items-center space-x-2 text-green-600">
                <Trophy className="w-8 h-8" />
                <span className="text-2xl font-bold">Chúc mừng!</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-orange-600">
                <AlertCircle className="w-8 h-8" />
                <span className="text-2xl font-bold">Cần cải thiện</span>
              </div>
            )}
          </div>
          
          <CardTitle className="text-xl mb-2">{exam.title}</CardTitle>
          
          {/* Score Display */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {result.score}/{result.totalPoints}
              </div>
              <div className="text-sm text-gray-600">Điểm số</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {result.percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Phần trăm</div>
            </div>
            
            <div className="text-center">
              <Badge 
                className={cn(
                  "text-white text-lg px-4 py-2",
                  gradeInfo.color
                )}
              >
                {gradeInfo.grade}
              </Badge>
              <div className="text-sm text-gray-600 mt-1">Xếp loại</div>
            </div>
          </div>
          
          {/* Pass/Fail Status */}
          <div className="flex items-center justify-center">
            {result.passed ? (
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="w-4 h-4 mr-1" />
                Đạt yêu cầu ({exam.passPercentage}%)
              </Badge>
            ) : (
              <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                <XCircle className="w-4 h-4 mr-1" />
                Chưa đạt yêu cầu ({exam.passPercentage}%)
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-2xl font-bold text-green-600">
                {result.correctAnswers}
              </span>
            </div>
            <div className="text-sm text-gray-600">Câu đúng</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <XCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-2xl font-bold text-red-600">
                {result.incorrectAnswers}
              </span>
            </div>
            <div className="text-sm text-gray-600">Câu sai</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
              <span className="text-2xl font-bold text-orange-600">
                {result.unansweredQuestions}
              </span>
            </div>
            <div className="text-sm text-gray-600">Chưa trả lời</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-blue-600">
                {formatDuration(result.timeSpentSeconds)}
              </span>
            </div>
            <div className="text-sm text-gray-600">Thời gian</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Phân tích hiệu suất
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Độ chính xác</span>
              <span>{accuracy.toFixed(1)}%</span>
            </div>
            <Progress value={accuracy} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Tiến độ hoàn thành</span>
              <span>{((totalQuestions - result.unansweredQuestions) / totalQuestions * 100).toFixed(1)}%</span>
            </div>
            <Progress 
              value={(totalQuestions - result.unansweredQuestions) / totalQuestions * 100} 
              className="h-2" 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold">{averageTimePerQuestion.toFixed(1)}s</div>
              <div className="text-sm text-gray-600">Thời gian trung bình/câu</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold">
                {new Date(result.gradedAt).toLocaleDateString('vi-VN')}
              </div>
              <div className="text-sm text-gray-600">Ngày hoàn thành</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        {onRetakeExam && (
          <Button onClick={onRetakeExam} className="flex items-center">
            <RotateCcw className="w-4 h-4 mr-2" />
            Làm lại
          </Button>
        )}
        
        {onViewExam && (
          <Button variant="outline" onClick={onViewExam} className="flex items-center">
            <Award className="w-4 h-4 mr-2" />
            Xem đề thi
          </Button>
        )}
        
        {allowDownload && onDownload && (
          <Button variant="outline" onClick={onDownload} className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Tải xuống
          </Button>
        )}
        
        {allowSharing && onShare && (
          <Button variant="outline" onClick={onShare} className="flex items-center">
            <Share2 className="w-4 h-4 mr-2" />
            Chia sẻ
          </Button>
        )}
      </div>
      
      {/* Results Summary */}
      {showBreakdown && (
        <ResultsSummary
          result={result}
          exam={exam}
          questions={questions}
          answers={answers}
        />
      )}
      
      {/* Score Breakdown */}
      {showQuestionAnalysis && questions.length > 0 && (
        <ScoreBreakdown
          result={result}
          exam={exam}
          questions={questions}
          answers={answers}
        />
      )}
      
      {/* Feedback Section */}
      {result.feedback && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Nhận xét từ giáo viên
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription className="whitespace-pre-wrap">
                {result.feedback}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
