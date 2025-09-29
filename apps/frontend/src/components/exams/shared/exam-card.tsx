/**
 * Exam Card Component
 * Exam preview card với metadata, quick actions, và status indicators
 * Supports both Official và Generated exam types với proper differentiation
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-22
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Badge,
  Progress,
} from "@/components/ui";

// Icons
import {
  Edit,
  Trash2,
  Eye,
  Copy,
  Play,
  Archive,
  Clock,

  BookOpen,

  School,
  Calendar,
  Hash,
  MoreVertical,
} from "lucide-react";

// Types
import {
  Exam,
  ExamStatus,
  ExamType,
} from "@/types/exam";
import { QuestionDifficulty } from "@/types/question";

// ===== TYPES =====

export interface ExamCardProps {
  /** Exam data to display */
  exam: Exam;
  
  /** Card view mode */
  viewMode?: 'card' | 'compact' | 'detailed';
  
  /** Show quick actions */
  showActions?: boolean;
  
  /** Show progress indicators */
  showProgress?: boolean;
  
  /** Card size variant */
  size?: 'sm' | 'md' | 'lg';
  
  /** Loading state */
  loading?: boolean;
  
  /** Selection state */
  selected?: boolean;
  
  /** Event handlers */
  onEdit?: (exam: Exam) => void;
  onDelete?: (exam: Exam) => void;
  onView?: (exam: Exam) => void;
  onDuplicate?: (exam: Exam) => void;
  onPublish?: (exam: Exam) => void;
  onArchive?: (exam: Exam) => void;
  onTakeExam?: (exam: Exam) => void;
  onSelect?: (exam: Exam) => void;
  
  /** Additional CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const STATUS_CONFIG = {
  [ExamStatus.ACTIVE]: {
    label: 'Đang hoạt động',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: Play,
  },
  [ExamStatus.PENDING]: {
    label: 'Chờ duyệt',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  [ExamStatus.INACTIVE]: {
    label: 'Tạm ngưng',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: Archive,
  },
  [ExamStatus.ARCHIVED]: {
    label: 'Đã lưu trữ',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Archive,
  },
} as const;

const TYPE_CONFIG = {
  [ExamType.GENERATED]: {
    label: 'Đề thi tạo',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: BookOpen,
  },
  [ExamType.OFFICIAL]: {
    label: 'Đề thi chính thức',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: School,
  },
} as const;

const DIFFICULTY_CONFIG = {
  [QuestionDifficulty.EASY]: {
    label: 'Dễ',
    color: 'bg-green-100 text-green-700',
  },
  [QuestionDifficulty.MEDIUM]: {
    label: 'Trung bình',
    color: 'bg-yellow-100 text-yellow-700',
  },
  [QuestionDifficulty.HARD]: {
    label: 'Khó',
    color: 'bg-orange-100 text-orange-700',
  },
  [QuestionDifficulty.EXPERT]: {
    label: 'Chuyên gia',
    color: 'bg-red-100 text-red-700',
  },
} as const;

// ===== UTILITY FUNCTIONS =====

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} giờ`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function calculateProgress(exam: Exam): number {
  // Mock calculation - in real app, this would be based on actual data
  const hasQuestions = exam.questionIds.length > 0;
  const hasSettings = exam.durationMinutes > 0 && exam.passPercentage > 0;
  const isPublished = exam.status === ExamStatus.ACTIVE;
  
  let progress = 0;
  if (hasQuestions) progress += 40;
  if (hasSettings) progress += 30;
  if (isPublished) progress += 30;
  
  return Math.min(progress, 100);
}

// ===== MAIN COMPONENT =====

export function ExamCard({
  exam,
  viewMode = 'card',
  showActions = true,
  showProgress = true,
  size = 'md',
  loading = false,
  selected = false,
  onEdit,
  onDelete,
  onView,
  onDuplicate,
  onPublish,
  onArchive: _onArchive,
  onTakeExam,
  onSelect,
  className,
}: ExamCardProps) {
  
  // Loading state
  if (loading) {
    return (
      <Card className={cn(
        "animate-pulse",
        size === 'sm' && "h-48",
        size === 'md' && "h-56",
        size === 'lg' && "h-64",
        className
      )}>
        <CardHeader className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
          <div className="flex space-x-2">
            <div className="h-6 bg-gray-200 rounded w-16" />
            <div className="h-6 bg-gray-200 rounded w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusConfig = STATUS_CONFIG[exam.status];
  const typeConfig = TYPE_CONFIG[exam.examType];
  const difficultyConfig = DIFFICULTY_CONFIG[exam.difficulty];
  const progress = showProgress ? calculateProgress(exam) : 0;
  
  const StatusIcon = statusConfig.icon;
  const TypeIcon = typeConfig.icon;

  return (
    <Card 
      className={cn(
        "group relative transition-all duration-200 hover:shadow-md",
        "border border-gray-200 hover:border-gray-300",
        selected && "ring-2 ring-blue-500 border-blue-500",
        size === 'sm' && "h-48",
        size === 'md' && "h-56", 
        size === 'lg' && "h-64",
        viewMode === 'compact' && "h-auto",
        className
      )}
      onClick={() => onSelect?.(exam)}
    >
      {/* Header */}
      <CardHeader className={cn(
        "pb-3",
        viewMode === 'compact' && "pb-2"
      )}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-semibold text-gray-900 truncate",
              size === 'sm' && "text-sm",
              size === 'md' && "text-base",
              size === 'lg' && "text-lg"
            )}>
              {exam.title}
            </h3>
            
            {viewMode !== 'compact' && (
              <p className={cn(
                "text-gray-600 mt-1 line-clamp-2",
                size === 'sm' && "text-xs",
                size === 'md' && "text-sm",
                size === 'lg' && "text-base"
              )}>
                {exam.description}
              </p>
            )}
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(exam);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  // Show more actions menu
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge 
            variant="outline" 
            className={cn("text-xs", statusConfig.color)}
          >
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </Badge>
          
          <Badge 
            variant="outline" 
            className={cn("text-xs", typeConfig.color)}
          >
            <TypeIcon className="w-3 h-3 mr-1" />
            {typeConfig.label}
          </Badge>
          
          <Badge 
            variant="outline" 
            className={cn("text-xs", difficultyConfig.color)}
          >
            {difficultyConfig.label}
          </Badge>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className={cn(
        "pt-0",
        viewMode === 'compact' && "py-2"
      )}>
        {/* Metadata */}
        <div className={cn(
          "grid gap-2 text-sm text-gray-600",
          viewMode === 'compact' ? "grid-cols-2" : "grid-cols-1"
        )}>
          <div className="flex items-center">
            <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
            <span className="truncate">{exam.subject}</span>
            {exam.grade && (
              <span className="ml-1 text-gray-400">- Lớp {exam.grade}</span>
            )}
          </div>
          
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            <span>{formatDuration(exam.durationMinutes)}</span>
          </div>
          
          <div className="flex items-center">
            <Hash className="w-4 h-4 mr-2 text-gray-400" />
            <span>{exam.questionIds.length} câu hỏi</span>
          </div>
          
          {exam.examType === ExamType.OFFICIAL && exam.sourceInstitution && (
            <div className="flex items-center">
              <School className="w-4 h-4 mr-2 text-gray-400" />
              <span className="truncate">{exam.sourceInstitution}</span>
            </div>
          )}
          
          {exam.examType === ExamType.OFFICIAL && exam.examYear && (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>Năm {exam.examYear}</span>
            </div>
          )}
        </div>

        {/* Progress */}
        {showProgress && viewMode !== 'compact' && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Tiến độ hoàn thành</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
          <span>Tạo: {formatDate(exam.createdAt)}</span>
          {exam.creator && (
            <span className="truncate ml-2">bởi {exam.creator.name}</span>
          )}
        </div>
      </CardContent>

      {/* Quick Actions Overlay */}
      {showActions && viewMode !== 'compact' && (
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-white via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {exam.status === ExamStatus.ACTIVE && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTakeExam?.(exam);
                  }}
                >
                  <Play className="w-4 h-4 mr-1" />
                  Làm bài
                </Button>
              )}
              
              {exam.status === ExamStatus.PENDING && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPublish?.(exam);
                  }}
                >
                  <Play className="w-4 h-4 mr-1" />
                  Xuất bản
                </Button>
              )}
            </div>
            
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(exam);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate?.(exam);
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(exam);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
