/**
 * Essay Display Component
 * Specialized rendering cho Essay questions
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from 'react';
import { Card, CardContent, Badge, Button, Textarea } from '@/components/ui';
import { FileText, Eye, EyeOff, Clock, BarChart3, AlertCircle } from 'lucide-react';
import { LaTeXRenderer } from '@/components/ui/latex';

/**
 * Props cho Essay Display
 */
interface EssayDisplayProps {
  /** Sample answer hoặc rubric */
  sampleAnswer?: string;
  /** User's essay answer */
  userAnswer?: string;
  /** Show sample answer */
  showSample?: boolean;
  /** Interactive mode */
  interactive?: boolean;
  /** Answer input handler */
  onAnswerChange?: (answer: string) => void;
  /** Word limit */
  wordLimit?: number;
  /** Time limit (in minutes) */
  timeLimit?: number;
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Essay Display Component
 * Hiển thị câu hỏi tự luận với rich text support
 */
export function EssayDisplay({
  sampleAnswer,
  userAnswer = '',
  showSample = false,
  interactive = false,
  onAnswerChange,
  wordLimit,
  timeLimit,
  placeholder = 'Nhập câu trả lời của bạn...',
  className = ''
}: EssayDisplayProps) {
  const [showSampleAnswer, setShowSampleAnswer] = useState(showSample);
  const [localAnswer, setLocalAnswer] = useState(userAnswer);

  /**
   * Handle answer change
   */
  const handleAnswerChange = (value: string) => {
    setLocalAnswer(value);
    onAnswerChange?.(value);
  };

  /**
   * Count words in text
   */
  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  /**
   * Get word count status
   */
  const getWordCountStatus = (text: string) => {
    if (!wordLimit) return null;
    
    const wordCount = countWords(text);
    const percentage = (wordCount / wordLimit) * 100;
    
    if (percentage > 100) {
      return { status: 'over', color: 'text-red-600', message: 'Vượt quá giới hạn' };
    } else if (percentage > 80) {
      return { status: 'warning', color: 'text-yellow-600', message: 'Gần đạt giới hạn' };
    } else {
      return { status: 'normal', color: 'text-green-600', message: 'Trong giới hạn' };
    }
  };

  const currentAnswer = localAnswer || userAnswer;
  const wordCount = countWords(currentAnswer);
  const wordCountStatus = getWordCountStatus(currentAnswer);

  return (
    <div className={`essay-display space-y-4 ${className}`}>
      {/* Header với toggle sample answer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
            Tự luận
          </Badge>
          
          {/* Constraints display */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {wordLimit && (
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>Tối đa {wordLimit} từ</span>
              </div>
            )}
            {timeLimit && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{timeLimit} phút</span>
              </div>
            )}
          </div>
        </div>
        
        {!interactive && sampleAnswer && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSampleAnswer(!showSampleAnswer)}
            className="flex items-center gap-2"
          >
            {showSampleAnswer ? (
              <>
                <EyeOff className="h-4 w-4" />
                Ẩn mẫu
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Xem mẫu
              </>
            )}
          </Button>
        )}
      </div>

      {/* Answer input */}
      <div className="space-y-2">
        <Textarea
          value={currentAnswer}
          onChange={(e) => handleAnswerChange(e.target.value)}
          placeholder={placeholder}
          disabled={!interactive}
          className="min-h-[200px] resize-y"
          rows={8}
        />
        
        {/* Word count và status */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className={wordCountStatus?.color || 'text-muted-foreground'}>
                {wordCount} từ
                {wordLimit && ` / ${wordLimit}`}
              </span>
            </div>
            
            {wordCountStatus && (
              <div className={`flex items-center gap-1 ${wordCountStatus.color}`}>
                <AlertCircle className="h-4 w-4" />
                <span>{wordCountStatus.message}</span>
              </div>
            )}
          </div>
          
          {/* Character count */}
          <div className="text-muted-foreground">
            {currentAnswer.length} ký tự
          </div>
        </div>
      </div>

      {/* Writing guidelines */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3">
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">Hướng dẫn viết:</div>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Trình bày ý tưởng một cách logic và có cấu trúc</li>
              <li>Sử dụng ví dụ cụ thể để minh họa</li>
              <li>Kiểm tra chính tả và ngữ pháp trước khi nộp</li>
              {wordLimit && <li>Tuân thủ giới hạn số từ: {wordLimit} từ</li>}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Sample answer display */}
      {showSampleAnswer && sampleAnswer && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="font-medium text-green-800 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Câu trả lời mẫu / Rubric chấm điểm:
              </div>
              <div className="prose prose-sm max-w-none">
                <LaTeXRenderer
                  content={sampleAnswer}
                  className="sample-answer-content text-green-800"
                  showErrorDetails={false}
                  cleanContent={true}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive mode instructions */}
      {interactive && !showSampleAnswer && (
        <div className="text-sm text-muted-foreground text-center py-2">
          Viết câu trả lời chi tiết vào ô bên trên
        </div>
      )}

      {/* Answer quality indicators */}
      {currentAnswer.trim() && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <Card className="p-3">
            <div className="text-center">
              <div className="font-medium text-muted-foreground">Độ dài</div>
              <div className={`text-lg font-bold ${wordCountStatus?.color || 'text-muted-foreground'}`}>
                {wordCount} từ
              </div>
            </div>
          </Card>
          
          <Card className="p-3">
            <div className="text-center">
              <div className="font-medium text-muted-foreground">Ký tự</div>
              <div className="text-lg font-bold text-muted-foreground">
                {currentAnswer.length}
              </div>
            </div>
          </Card>
          
          <Card className="p-3">
            <div className="text-center">
              <div className="font-medium text-muted-foreground">Đoạn văn</div>
              <div className="text-lg font-bold text-muted-foreground">
                {currentAnswer.split('\n\n').filter(p => p.trim()).length}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/**
 * Essay Preview Component
 * Compact preview cho lists
 */
export function EssayPreview({
  wordLimit,
  timeLimit,
  className = ''
}: {
  wordLimit?: number;
  timeLimit?: number;
  className?: string;
}) {
  return (
    <div className={`essay-preview ${className}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="outline" className="text-xs">ES</Badge>
        <span>Tự luận</span>
        {wordLimit && (
          <>
            <span>•</span>
            <span>Tối đa {wordLimit} từ</span>
          </>
        )}
        {timeLimit && (
          <>
            <span>•</span>
            <span>{timeLimit} phút</span>
          </>
        )}
      </div>
    </div>
  );
}
