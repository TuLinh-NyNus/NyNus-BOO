/**
 * Selected Questions Preview Component
 * Displays selected questions trong exam form với order management và editing capabilities
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-22
 */

"use client";

import React, { useState, useCallback } from "react";
import {
  Trash2,
  Eye,
  Plus,
  ChevronUp,
  ChevronDown,
  Settings,
  FileQuestion,
  Sparkles
} from "lucide-react";

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Switch,
  Label,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";

// Types
import { SelectedQuestion } from "./question-selector";
import { QuestionType, QuestionDifficulty } from "@/types/question";

// Utils
import { cn } from "@/lib/utils";

// ===== TYPES =====

export interface SelectedQuestionsPreviewProps {
  /** Selected questions array */
  questions: SelectedQuestion[];
  
  /** Update question handler */
  onQuestionUpdate: (questionId: string, updates: Partial<SelectedQuestion>) => void;
  
  /** Remove question handler */
  onQuestionRemove: (questionId: string) => void;
  
  /** Reorder questions handler */
  onQuestionsReorder: (questions: SelectedQuestion[]) => void;
  
  /** Open question selector handler */
  onOpenSelector: () => void;
  
  /** View question details handler */
  onViewQuestion?: (questionId: string) => void;
  
  /** Edit question handler */
  onEditQuestion?: (questionId: string) => void;
  
  /** Whether editing is allowed */
  allowEdit?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const QUESTION_TYPE_LABELS = {
  [QuestionType.MC]: 'Trắc nghiệm',
  [QuestionType.MULTIPLE_CHOICE]: 'Trắc nghiệm',
  [QuestionType.TF]: 'Đúng/Sai',
  [QuestionType.SA]: 'Trả lời ngắn',
  [QuestionType.ES]: 'Tự luận',
  [QuestionType.MA]: 'Ghép đôi',
};

const DIFFICULTY_LABELS = {
  [QuestionDifficulty.EASY]: 'Dễ',
  [QuestionDifficulty.MEDIUM]: 'Trung bình',
  [QuestionDifficulty.HARD]: 'Khó',
  [QuestionDifficulty.EXPERT]: 'Chuyên gia',
};

// ===== MAIN COMPONENT =====

export function SelectedQuestionsPreview({
  questions,
  onQuestionUpdate,
  onQuestionRemove,
  onQuestionsReorder,
  onOpenSelector,
  onViewQuestion,
  onEditQuestion: _onEditQuestion,
  allowEdit = true,
  className,
}: SelectedQuestionsPreviewProps) {
  
  // ===== STATE =====
  
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  
  // ===== COMPUTED VALUES =====
  
  const totalQuestions = questions.length;
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const bonusQuestions = questions.filter(q => q.isBonus).length;
  
  // ===== HANDLERS =====
  
  const handleToggleExpanded = useCallback((questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  }, []);
  
  const handleMoveQuestion = useCallback((questionId: string, direction: 'up' | 'down') => {
    const currentIndex = questions.findIndex(q => q.id === questionId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;
    
    const newQuestions = [...questions];
    [newQuestions[currentIndex], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[currentIndex]];
    
    // Update order numbers
    const reorderedQuestions = newQuestions.map((q, index) => ({
      ...q,
      orderNumber: index + 1,
    }));
    
    onQuestionsReorder(reorderedQuestions);
  }, [questions, onQuestionsReorder]);
  
  const handlePointsChange = useCallback((questionId: string, points: number) => {
    onQuestionUpdate(questionId, { points: Math.max(0, Math.min(10, points)) });
  }, [onQuestionUpdate]);
  
  const handleBonusToggle = useCallback((questionId: string, isBonus: boolean) => {
    onQuestionUpdate(questionId, { isBonus });
  }, [onQuestionUpdate]);
  
  // ===== RENDER HELPERS =====
  
  const renderQuestionCard = (question: SelectedQuestion, index: number) => {
    const isExpanded = expandedQuestions.has(question.id);
    const canMoveUp = index > 0;
    const canMoveDown = index < questions.length - 1;
    
    return (
      <Card key={question.id} className="relative">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Order Number */}
            <div className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              question.isBonus 
                ? "bg-orange-100 text-orange-700 border-2 border-orange-300" 
                : "bg-primary text-primary-foreground"
            )}>
              {question.orderNumber}
            </div>
            
            {/* Question Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium line-clamp-2">
                    {question.content || question.rawContent}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {QUESTION_TYPE_LABELS[question.type]}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {DIFFICULTY_LABELS[question.difficulty || QuestionDifficulty.MEDIUM]}
                    </Badge>
                    {question.isBonus && (
                      <Badge variant="secondary" className="text-xs">
                        Bonus
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1">
                  {/* Points Input */}
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={question.points}
                      onChange={(e) => handlePointsChange(question.id, parseInt(e.target.value) || 0)}
                      className="w-16 h-8 text-center"
                      disabled={!allowEdit}
                    />
                    <span className="text-xs text-muted-foreground">đ</span>
                  </div>
                  
                  {/* Move Buttons */}
                  {allowEdit && (
                    <div className="flex flex-col">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveQuestion(question.id, 'up')}
                        disabled={!canMoveUp}
                        className="h-4 w-6 p-0"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveQuestion(question.id, 'down')}
                        disabled={!canMoveDown}
                        className="h-4 w-6 p-0"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleExpanded(question.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Cài đặt câu hỏi</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {onViewQuestion && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewQuestion(question.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Xem chi tiết</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    
                    {allowEdit && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onQuestionRemove(question.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Xóa câu hỏi</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Expanded Settings */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`bonus-${question.id}`}
                      checked={question.isBonus}
                      onCheckedChange={(checked) => handleBonusToggle(question.id, checked)}
                      disabled={!allowEdit}
                    />
                    <Label htmlFor={`bonus-${question.id}`} className="text-sm">
                      Câu hỏi bonus (không tính vào điểm chính)
                    </Label>
                  </div>
                  
                  {question.subcount && (
                    <div className="text-xs text-muted-foreground">
                      Mã câu hỏi: {question.subcount}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // ===== MAIN RENDER =====
  
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Câu hỏi trong đề thi</CardTitle>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span>{totalQuestions} câu hỏi</span>
              <span>Tổng {totalPoints} điểm</span>
              {bonusQuestions > 0 && (
                <span>{bonusQuestions} câu bonus</span>
              )}
            </div>
          </div>
          
          <Button onClick={onOpenSelector} disabled={!allowEdit}>
            <Plus className="w-4 h-4 mr-2" />
            Chọn câu hỏi
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {totalQuestions === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="relative mb-4">
              <FileQuestion className="w-16 h-16 text-muted-foreground/40" />
              <Sparkles className="w-6 h-6 text-primary absolute -top-1 -right-1" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Chưa có câu hỏi nào
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Thêm câu hỏi từ ngân hàng để tạo đề thi. Bạn có thể chọn nhiều câu hỏi cùng lúc và sắp xếp thứ tự sau.
            </p>
            <Button 
              onClick={onOpenSelector} 
              disabled={!allowEdit}
              size="lg"
              className="gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm câu hỏi ngay
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((question, index) => renderQuestionCard(question, index))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
