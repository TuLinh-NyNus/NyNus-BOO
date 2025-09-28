/**
 * Question Selector Component
 * Modal-based question selection interface cho exam creation/editing
 * Integrates với existing question browsing components và selection patterns
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-22
 */

"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Search, Filter, Check, X, Plus, Minus } from "lucide-react";

// UI Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Badge,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";

// Types
import { Question, QuestionType, QuestionDifficulty } from "@/lib/types/question";

// Utils
import { cn } from "@/lib/utils";

// ===== TYPES =====

export interface SelectedQuestion extends Question {
  /** Order in exam (1-based) */
  orderNumber: number;
  /** Points for this question in exam */
  points: number;
  /** Whether this is a bonus question */
  isBonus: boolean;
}

export interface QuestionSelectorProps {
  /** Whether the selector is open */
  open: boolean;
  
  /** Close handler */
  onClose: () => void;
  
  /** Selection confirmation handler */
  onConfirm: (selectedQuestions: SelectedQuestion[]) => void;
  
  /** Initially selected questions */
  initialSelected?: SelectedQuestion[];
  
  /** Maximum number of questions allowed */
  maxQuestions?: number;
  
  /** Minimum number of questions required */
  minQuestions?: number;
  
  /** Default points per question */
  defaultPoints?: number;
  
  /** Additional CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const DEFAULT_POINTS = 1;
const DEFAULT_MAX_QUESTIONS = 100;
const DEFAULT_MIN_QUESTIONS = 1;

// ===== MAIN COMPONENT =====

export function QuestionSelector({
  open,
  onClose,
  onConfirm,
  initialSelected = [],
  maxQuestions = DEFAULT_MAX_QUESTIONS,
  minQuestions = DEFAULT_MIN_QUESTIONS,
  defaultPoints = DEFAULT_POINTS,
  className,
}: QuestionSelectorProps) {
  
  // ===== STATE =====
  
  const [selectedQuestions, setSelectedQuestions] = useState<Map<string, SelectedQuestion>>(
    () => new Map(initialSelected.map(q => [q.id, q]))
  );
  
  const [activeTab, setActiveTab] = useState<'browse' | 'selected'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock questions data for now - in real implementation, this would come from API
  const [questions] = useState<Question[]>([]);
  const totalCount = questions.length;
  
  // ===== COMPUTED VALUES =====
  
  const selectedQuestionsArray = useMemo(() => 
    Array.from(selectedQuestions.values()).sort((a, b) => a.orderNumber - b.orderNumber),
    [selectedQuestions]
  );
  
  const canConfirm = selectedQuestionsArray.length >= minQuestions && 
                     selectedQuestionsArray.length <= maxQuestions;
  
  const totalPoints = selectedQuestionsArray.reduce((sum, q) => sum + q.points, 0);
  
  // ===== HANDLERS =====
  
  const handleQuestionToggle = useCallback((question: Question) => {
    setSelectedQuestions(prev => {
      const newMap = new Map(prev);

      if (newMap.has(question.id)) {
        // Remove question
        newMap.delete(question.id);
      } else {
        // Add question với next order number
        const maxOrder = Math.max(0, ...Array.from(newMap.values()).map(q => q.orderNumber));
        const selectedQuestion: SelectedQuestion = {
          ...question,
          orderNumber: maxOrder + 1,
          points: defaultPoints,
          isBonus: false,
        };
        newMap.set(question.id, selectedQuestion);
      }

      return newMap;
    });
  }, [defaultPoints]);
  
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // In real implementation, this would trigger API call
  }, []);
  
  const handleQuestionUpdate = useCallback((questionId: string, updates: Partial<SelectedQuestion>) => {
    setSelectedQuestions(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(questionId);
      if (existing) {
        newMap.set(questionId, { ...existing, ...updates });
      }
      return newMap;
    });
  }, []);
  
  const handleQuestionRemove = useCallback((questionId: string) => {
    setSelectedQuestions(prev => {
      const newMap = new Map(prev);
      newMap.delete(questionId);
      
      // Reorder remaining questions
      const remaining = Array.from(newMap.values())
        .sort((a, b) => a.orderNumber - b.orderNumber)
        .map((q, index) => ({ ...q, orderNumber: index + 1 }));
      
      return new Map(remaining.map(q => [q.id, q]));
    });
  }, []);
  
  const handleConfirm = useCallback(() => {
    if (canConfirm) {
      onConfirm(selectedQuestionsArray);
      onClose();
    }
  }, [canConfirm, selectedQuestionsArray, onConfirm, onClose]);
  

  
  // ===== RENDER HELPERS =====
  
  const renderQuestionGrid = () => (
    <div className="space-y-4">
      {/* Search */}
      <div className="space-y-4">
        <Input
          placeholder="Tìm kiếm câu hỏi để thêm vào đề thi..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Không tìm thấy câu hỏi nào</p>
          <p className="text-sm">Thử thay đổi từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {questions.map((question) => (
            <div
              key={question.id}
              className="flex items-start gap-3 p-3 border rounded-lg bg-card hover:bg-accent/50 cursor-pointer"
              onClick={() => handleQuestionToggle(question)}
            >
              <div className="flex-1">
                <p className="text-sm font-medium line-clamp-2">
                  {question.content || question.rawContent}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {question.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {question.difficulty}
                  </Badge>
                </div>
              </div>

              <Button
                variant={selectedQuestions.has(question.id) ? "default" : "outline"}
                size="sm"
              >
                {selectedQuestions.has(question.id) ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Đã chọn
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1" />
                    Chọn
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSelectedQuestions = () => (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Câu hỏi đã chọn</h3>
          <p className="text-sm text-muted-foreground">
            {selectedQuestionsArray.length} câu hỏi • Tổng {totalPoints} điểm
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={canConfirm ? "default" : "destructive"}
          >
            {selectedQuestionsArray.length}/{maxQuestions}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Selected Questions List */}
      {selectedQuestionsArray.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Chưa có câu hỏi nào được chọn</p>
          <p className="text-sm">Chuyển sang tab "Duyệt câu hỏi" để chọn câu hỏi</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {selectedQuestionsArray.map((question, index) => (
            <div
              key={question.id}
              className="flex items-start gap-3 p-3 border rounded-lg bg-card"
            >
              {/* Order Number */}
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                {question.orderNumber}
              </div>

              {/* Question Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-2">
                      {question.content || question.rawContent}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {question.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {question.difficulty}
                      </Badge>
                    </div>
                  </div>

                  {/* Points Input */}
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={question.points}
                      onChange={(e) => handleQuestionUpdate(question.id, {
                        points: Math.max(0, parseInt(e.target.value) || 0)
                      })}
                      className="w-16 h-8 text-center"
                    />
                    <span className="text-xs text-muted-foreground">điểm</span>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuestionRemove(question.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ===== MAIN RENDER =====

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-6xl h-[80vh] flex flex-col", className)}>
        <DialogHeader>
          <DialogTitle>Chọn câu hỏi cho đề thi</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'browse' | 'selected')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browse">
                Duyệt câu hỏi ({totalCount})
              </TabsTrigger>
              <TabsTrigger value="selected">
                Đã chọn ({selectedQuestionsArray.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="mt-4 h-full overflow-auto">
              {renderQuestionGrid()}
            </TabsContent>

            <TabsContent value="selected" className="mt-4 h-full overflow-auto">
              {renderSelectedQuestions()}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {selectedQuestionsArray.length < minQuestions && (
                <span className="text-destructive">
                  Cần ít nhất {minQuestions} câu hỏi
                </span>
              )}
              {selectedQuestionsArray.length > maxQuestions && (
                <span className="text-destructive">
                  Tối đa {maxQuestions} câu hỏi
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!canConfirm}
              >
                <Check className="w-4 h-4 mr-2" />
                Xác nhận ({selectedQuestionsArray.length} câu hỏi)
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
