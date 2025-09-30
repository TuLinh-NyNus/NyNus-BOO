/**
 * Drag and Drop Question List Component
 * Provides drag-and-drop functionality for reordering questions in exam creation
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuestionType, AnswerOption } from '@/types/question';
import { 
  GripVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Copy,
  ChevronUp,
  ChevronDown,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Question } from '@/types/exam';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface DragDropQuestionListProps {
  questions: Question[];
  onReorder: (questions: Question[]) => void;
  onEdit?: (question: Question) => void;
  onDelete?: (question: Question) => void;
  onDuplicate?: (question: Question) => void;
  onPreview?: (question: Question) => void;
  className?: string;
  disabled?: boolean;
}

interface DragState {
  isDragging: boolean;
  draggedIndex: number | null;
  dragOverIndex: number | null;
  dragOffset: { x: number; y: number };
}

export function DragDropQuestionList({
  questions,
  onReorder,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview,
  className,
  disabled = false
}: DragDropQuestionListProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedIndex: null,
    dragOverIndex: null,
    dragOffset: { x: 0, y: 0 }
  });

  const listRef = useRef<HTMLDivElement>(null);
  const _dragElementRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((index: number, event: React.DragEvent) => {
    if (disabled) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    setDragState({
      isDragging: true,
      draggedIndex: index,
      dragOverIndex: null,
      dragOffset: { x: offsetX, y: offsetY }
    });

    // Set drag data
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', index.toString());

    // Create drag image
    const dragImage = event.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.transform = 'rotate(5deg)';
    dragImage.style.opacity = '0.8';
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, offsetX, offsetY);
    
    // Clean up drag image after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  }, [disabled]);

  const handleDragOver = useCallback((index: number, event: React.DragEvent) => {
    if (disabled || dragState.draggedIndex === null) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    setDragState(prev => ({
      ...prev,
      dragOverIndex: index
    }));
  }, [disabled, dragState.draggedIndex]);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    // Only clear dragOverIndex if we're leaving the entire list
    const rect = listRef.current?.getBoundingClientRect();
    if (rect) {
      const { clientX, clientY } = event;
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        setDragState(prev => ({
          ...prev,
          dragOverIndex: null
        }));
      }
    }
  }, []);

  const handleDrop = useCallback((index: number, event: React.DragEvent) => {
    if (disabled || dragState.draggedIndex === null) return;

    event.preventDefault();

    const fromIndex = dragState.draggedIndex;
    const toIndex = index;

    if (fromIndex !== toIndex) {
      const newQuestions = [...questions];
      const [movedQuestion] = newQuestions.splice(fromIndex, 1);
      newQuestions.splice(toIndex, 0, movedQuestion);

      // Update order numbers
      const reorderedQuestions = newQuestions.map((q, idx) => ({
        ...q,
        order_number: idx + 1
      }));

      onReorder(reorderedQuestions);
    }

    setDragState({
      isDragging: false,
      draggedIndex: null,
      dragOverIndex: null,
      dragOffset: { x: 0, y: 0 }
    });
  }, [disabled, dragState.draggedIndex, questions, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedIndex: null,
      dragOverIndex: null,
      dragOffset: { x: 0, y: 0 }
    });
  }, []);

  const moveQuestion = useCallback((fromIndex: number, direction: 'up' | 'down') => {
    if (disabled) return;

    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    
    if (toIndex < 0 || toIndex >= questions.length) return;

    const newQuestions = [...questions];
    const [movedQuestion] = newQuestions.splice(fromIndex, 1);
    newQuestions.splice(toIndex, 0, movedQuestion);

    const reorderedQuestions = newQuestions.map((q, idx) => ({
      ...q,
      order_number: idx + 1
    }));

    onReorder(reorderedQuestions);
  }, [disabled, questions, onReorder]);

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return 'bg-blue-100 text-blue-800';
      case 'TRUE_FALSE':
        return 'bg-green-100 text-green-800';
      case 'SHORT_ANSWER':
        return 'bg-yellow-100 text-yellow-800';
      case 'ESSAY':
        return 'bg-purple-100 text-purple-800';
      case 'MATCHING':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return 'Trắc nghiệm';
      case 'TRUE_FALSE':
        return 'Đúng/Sai';
      case 'SHORT_ANSWER':
        return 'Tự luận ngắn';
      case 'ESSAY':
        return 'Tự luận dài';
      case 'MATCHING':
        return 'Ghép đôi';
      default:
        return type;
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HARD':
        return 'bg-red-100 text-red-800';
      case 'EXPERT':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'Dễ';
      case 'MEDIUM':
        return 'Trung bình';
      case 'HARD':
        return 'Khó';
      case 'EXPERT':
        return 'Rất khó';
      default:
        return 'Không xác định';
    }
  };

  if (questions.length === 0) {
    return (
      <div className={cn("text-center py-12 text-muted-foreground", className)}>
        <p>Chưa có câu hỏi nào được thêm vào đề thi</p>
        <p className="text-sm mt-2">Thêm câu hỏi để bắt đầu tạo đề thi</p>
      </div>
    );
  }

  return (
    <div 
      ref={listRef}
      className={cn("space-y-3", className)}
      onDragLeave={handleDragLeave}
    >
      {questions.map((question, index) => {
        const isDragged = dragState.draggedIndex === index;
        const isDragOver = dragState.dragOverIndex === index;
        const showDropIndicator = isDragOver && dragState.draggedIndex !== null && dragState.draggedIndex !== index;

        return (
          <div key={question.id} className="relative">
            {/* Drop indicator */}
            {showDropIndicator && (
              <div className="absolute -top-1 left-0 right-0 h-0.5 bg-primary rounded-full z-10" />
            )}

            <Card
              className={cn(
                "transition-all duration-200",
                isDragged && "opacity-50 scale-105 rotate-2 shadow-lg",
                isDragOver && !isDragged && "ring-2 ring-primary/50",
                disabled && "opacity-60"
              )}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(index, e)}
              onDragOver={(e) => handleDragOver(index, e)}
              onDrop={(e) => handleDrop(index, e)}
              onDragEnd={handleDragEnd}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Drag Handle */}
                  <div 
                    className={cn(
                      "flex flex-col items-center gap-1 pt-1",
                      disabled ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing"
                    )}
                  >
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2 mb-2">
                          {question.content}
                        </p>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", getQuestionTypeColor(question.type))}
                          >
                            {getQuestionTypeLabel(question.type)}
                          </Badge>
                          
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getDifficultyColor(question.difficulty))}
                          >
                            {getDifficultyLabel(question.difficulty)}
                          </Badge>
                          
                          <span className="text-xs text-muted-foreground">
                            {question.points || 0} điểm
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        {/* Move buttons for accessibility */}
                        <div className="flex flex-col gap-0.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => moveQuestion(index, 'up')}
                            disabled={disabled || index === 0}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => moveQuestion(index, 'down')}
                            disabled={disabled || index === questions.length - 1}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* More actions dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onPreview && (
                              <DropdownMenuItem onClick={() => onPreview(question)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Xem trước
                              </DropdownMenuItem>
                            )}
                            {onEdit && (
                              <DropdownMenuItem onClick={() => onEdit(question)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                            )}
                            {onDuplicate && (
                              <DropdownMenuItem onClick={() => onDuplicate(question)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Nhân bản
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => onDelete(question)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Xóa
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Question Options Preview (for multiple choice) */}
                    {question.type === QuestionType.MC && question.answers && question.answers.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {(question.answers as AnswerOption[]).slice(0, 2).map((answer: AnswerOption, answerIndex: number) => (
                          <div key={answerIndex} className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="font-medium">
                              {String.fromCharCode(65 + answerIndex)}.
                            </span>
                            <span className="line-clamp-1">{answer.content}</span>
                          </div>
                        ))}
                        {question.answers.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            ... và {question.answers.length - 2} đáp án khác
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}

      {/* Final drop zone */}
      {dragState.isDragging && (
        <div 
          className="h-12 border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center text-sm text-muted-foreground bg-primary/5"
          onDragOver={(e) => handleDragOver(questions.length, e)}
          onDrop={(e) => handleDrop(questions.length, e)}
        >
          Thả câu hỏi vào đây để đặt ở cuối danh sách
        </div>
      )}
    </div>
  );
}
