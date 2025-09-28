/**
 * Question Card Component
 * Beautiful question card layout với modern design
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from 'react';
import { Card, CardContent, CardHeader, Badge } from '@/components/ui';
import { FileText, Hash, User, Calendar, BarChart3 } from 'lucide-react';
import { QuestionLaTeXDisplay, SolutionLaTeXDisplay } from '@/components/ui/latex';
import { QuestionActions } from './QuestionActions';
import { Question, QuestionType, QuestionStatus, QuestionDifficulty } from '@/lib/types/question';

/**
 * Props cho Question Card
 */
interface QuestionCardProps {
  /** Question data */
  question: Question;
  /** Card variant */
  variant?: 'default' | 'compact' | 'detailed';
  /** Show solution by default */
  showSolution?: boolean;
  /** Show metadata */
  showMetadata?: boolean;
  /** Show actions */
  showActions?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Question Card Component
 * Modern, responsive question card với beautiful design
 */
export function QuestionCard({
  question,
  variant = 'default',
  showSolution = false,
  showMetadata = true,
  showActions = true,
  onClick,
  className = ''
}: QuestionCardProps) {
  // Solution visibility is handled by SolutionLaTeXDisplay component

  /**
   * Get question type styling
   */
  const getTypeStyles = (type: QuestionType) => {
    const styles = {
      [QuestionType.MC]: 'border-l-primary bg-primary/10',
      [QuestionType.TF]: 'border-l-badge-success bg-badge-success/10',
      [QuestionType.SA]: 'border-l-badge-warning bg-badge-warning/10',
      [QuestionType.ES]: 'border-l-accent bg-accent/10',
      [QuestionType.MA]: 'border-l-secondary bg-secondary/10'
    };
    return styles[type] || 'border-l-muted-foreground bg-muted/30';
  };

  /**
   * Get question type label
   */
  const getTypeLabel = (type: QuestionType) => {
    const labels = {
      [QuestionType.MC]: 'Trắc nghiệm',
      [QuestionType.TF]: 'Đúng/Sai',
      [QuestionType.SA]: 'Trả lời ngắn',
      [QuestionType.ES]: 'Tự luận',
      [QuestionType.MA]: 'Ghép đôi'
    };
    return labels[type] || type;
  };

  /**
   * Get difficulty config
   */
  const getDifficultyConfig = (difficulty?: QuestionDifficulty) => {
    if (!difficulty) return { label: 'Chưa xác định', color: 'bg-secondary' };
    
    const configs = {
      [QuestionDifficulty.EASY]: { label: 'Dễ', color: 'bg-badge-success' },
      [QuestionDifficulty.MEDIUM]: { label: 'Trung bình', color: 'bg-badge-warning' },
      [QuestionDifficulty.HARD]: { label: 'Khó', color: 'bg-destructive' },
      [QuestionDifficulty.EXPERT]: { label: 'Chuyên gia', color: 'bg-purple-500' }
    };
    return configs[difficulty] || { label: difficulty, color: 'bg-secondary' };
  };

  /**
   * Get status badge
   */
  const getStatusBadge = (status?: QuestionStatus) => {
    if (!status) return null;

    const statusConfig = {
      [QuestionStatus.ACTIVE]: { label: 'Hoạt động', variant: 'default' as const },
      [QuestionStatus.PENDING]: { label: 'Chờ duyệt', variant: 'secondary' as const },
      [QuestionStatus.INACTIVE]: { label: 'Không hoạt động', variant: 'outline' as const },
      [QuestionStatus.ARCHIVED]: { label: 'Đã lưu trữ', variant: 'destructive' as const },
      [QuestionStatus.DRAFT]: { label: 'Bản nháp', variant: 'secondary' as const }
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const difficultyConfig = getDifficultyConfig(question.difficulty);
  const typeStyles = getTypeStyles(question.type);

  // Compact variant cho lists
  if (variant === 'compact') {
    return (
      <Card 
        className={`question-card-compact border-l-4 ${typeStyles} hover:shadow-md transition-shadow cursor-pointer ${className}`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {getTypeLabel(question.type)}
                </Badge>
                <code className="text-xs text-muted-foreground bg-muted px-1 py-0.5 rounded">
                  {question.questionCodeId}
                </code>
                {question.status && getStatusBadge(question.status)}
              </div>

              {/* Content preview */}
              <div className="mb-2">
                <QuestionLaTeXDisplay
                  content={question.content}
                  questionType={question.type}
                  previewMode={true}
                  maxPreviewLength={150}
                  className="text-sm"
                />
              </div>

              {/* Metadata */}
              {showMetadata && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                  <Badge className={`text-primary-foreground text-xs ${difficultyConfig.color}`}>
                      {difficultyConfig.label}
                    </Badge>
                  </div>
                  {question.usageCount !== undefined && (
                    <span>Sử dụng: {question.usageCount}</span>
                  )}
                  <span>{formatDate(question.updatedAt)}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            {showActions && (
              <QuestionActions question={question} compact={true} />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default và detailed variants
  return (
    <Card 
      className={`question-card border-l-4 ${typeStyles} hover:shadow-lg transition-all duration-200 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Question header */}
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <Badge variant="outline">
                {getTypeLabel(question.type)}
              </Badge>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {question.questionCodeId}
              </code>
              {question.status && getStatusBadge(question.status)}
            </div>

            {/* Metadata grid */}
            {showMetadata && variant === 'detailed' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <Badge className={`text-primary-foreground ${difficultyConfig.color}`}>
                    {difficultyConfig.label}
                  </Badge>
                </div>
                {question.creator && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{question.creator}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(question.updatedAt)}</span>
                </div>
                {question.usageCount !== undefined && (
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span>Sử dụng: {question.usageCount}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <QuestionActions question={question} compact={false} />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Question content */}
        <div className="question-content">
          <QuestionLaTeXDisplay
            content={question.content}
            questionType={question.type}
            previewMode={variant !== 'detailed'}
            maxPreviewLength={variant === 'detailed' ? undefined : 300}
          />
        </div>

        {/* Solution */}
        {question.solution && (
          <SolutionLaTeXDisplay
            solution={question.solution}
            explanation={question.explanation}
            defaultVisible={showSolution}
            collapsible={true}
            title="Lời giải"
            showSteps={true}
          />
        )}

        {/* Tags */}
        {question.tag && question.tag.length > 0 && variant === 'detailed' && (
          <div className="flex flex-wrap gap-1">
            {question.tag.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
