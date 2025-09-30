/**
 * Answer Form Component
 * Component cho managing question answers với LaTeX support
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from "react";
import { useFieldArray, Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  // Input,
  Textarea,
  Button,
  Card,
  CardContent,
  CardHeader,
  // CardTitle,
  Badge,
  Checkbox,
  Alert,
  AlertDescription,
  Collapsible,
  CollapsibleContent,
  // CollapsibleTrigger,
} from "@/components/ui";
import {
  Plus,
  Minus,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  // XCircle,
  AlertTriangle,
  Eye,
  EyeOff
} from "lucide-react";

// Import LaTeX components
import { LaTeXPreview } from "@/components/common/latex";

// ===== TYPES =====

export interface AnswerItemData {
  id?: string;
  content: string;
  isCorrect: boolean;
  explanation?: string;
}

// Create a specific interface for AnswerForm to avoid type conflicts
interface AnswerFormDataType {
  answers: AnswerItemData[];
}

export interface AnswerFormProps {
  control: Control<AnswerFormDataType>;
  questionType: string;
  className?: string;
}

// ===== MAIN COMPONENT =====

export function AnswerForm({
  control,
  questionType,
  className = ""
}: AnswerFormProps) {
  // ===== STATE =====
  
  const [expandedAnswers, setExpandedAnswers] = useState<Set<number>>(new Set());
  const [showPreview, setShowPreview] = useState<Set<number>>(new Set());
  
  // ===== FIELD ARRAY =====
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "answers"
  });
  
  // ===== COMPUTED VALUES =====
  
  const correctAnswersCount = fields.filter((_, index) => 
    control._getWatch(`answers.${index}.isCorrect`)
  ).length;
  
  const minAnswers = (questionType === 'MULTIPLE_CHOICE' || questionType === 'TRUE_FALSE') ? 4 : 1;
  const maxAnswers = 10; // Tất cả loại đều có thể có tối đa 10 answers
  
  // ===== HANDLERS =====
  
  const handleAddAnswer = () => {
    if (fields.length < maxAnswers) {
      append({
        content: "",
        isCorrect: false
      });
    }
  };
  
  const handleRemoveAnswer = (index: number) => {
    if (fields.length > minAnswers) {
      remove(index);
      // Remove from expanded/preview sets
      setExpandedAnswers(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
      setShowPreview(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };
  
  const handleToggleExpanded = (index: number) => {
    setExpandedAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };
  
  const handleTogglePreview = (index: number) => {
    setShowPreview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };
  
  // ===== RENDER HELPERS =====
  
  /**
   * Get answer label
   */
  const getAnswerLabel = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, D...
  };
  
  /**
   * Render answer item
   */
  const renderAnswerItem = (field: Record<"id", string>, index: number) => {
    const isExpanded = expandedAnswers.has(index);
    const hasPreview = showPreview.has(index);
    
    return (
      <Card key={field.id} className="answer-item">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                  {getAnswerLabel(index)}
                </div>
                
                <FormField
                  control={control}
                  name={`answers.${index}.isCorrect`}
                  render={({ field: checkboxField }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={checkboxField.value as boolean}
                          onCheckedChange={checkboxField.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Đáp án đúng
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              
              {control._getWatch(`answers.${index}.isCorrect`) && (
                <Badge variant="default" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Đúng
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleTogglePreview(index)}
              >
                {hasPreview ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleToggleExpanded(index)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveAnswer(index)}
                disabled={fields.length <= minAnswers}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Answer content */}
          <FormField
            control={control}
            name={`answers.${index}.content`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nội dung đáp án</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Nhập nội dung đáp án (hỗ trợ LaTeX)"
                    className="min-h-[80px]"
                    {...field}
                    value={field.value as string}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* LaTeX Preview */}
          {hasPreview && control._getWatch(`answers.${index}.content`) && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Xem trước LaTeX:</h4>
              <LaTeXPreview
                latex={control._getWatch(`answers.${index}.content`)}
                showValidation={true}
                className="border rounded p-3"
              />
            </div>
          )}
          
          {/* Expanded content */}
          <Collapsible open={isExpanded}>
            <CollapsibleContent className="space-y-4">
              <FormField
                control={control}
                name={`answers.${index}.explanation`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giải thích (tùy chọn)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Giải thích tại sao đây là/không phải đáp án đúng"
                        className="min-h-[60px]"
                        {...field}
                        value={field.value as string}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    );
  };
  
  // ===== VALIDATION ALERTS =====
  
  const renderValidationAlerts = () => {
    const alerts = [];
    
    // Check minimum answers
    if (fields.length < minAnswers) {
      alerts.push(
        <Alert key="min-answers" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Cần có ít nhất {minAnswers} đáp án cho loại câu hỏi này
          </AlertDescription>
        </Alert>
      );
    }
    
    // Check correct answers for multiple choice
    if (questionType === 'MULTIPLE_CHOICE') {
      if (correctAnswersCount === 0) {
        alerts.push(
          <Alert key="no-correct" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Câu hỏi trắc nghiệm cần có ít nhất một đáp án đúng
            </AlertDescription>
          </Alert>
        );
      } else if (correctAnswersCount > 1) {
        alerts.push(
          <Alert key="too-many-correct" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Câu hỏi trắc nghiệm chỉ được có đúng 1 đáp án đúng
            </AlertDescription>
          </Alert>
        );
      }
    }
    
    // Check minimum answers for true/false
    if (questionType === 'TRUE_FALSE' && fields.length < 4) {
      alerts.push(
        <Alert key="tf-min-answers" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Câu hỏi Đúng/Sai cần có ít nhất 4 đáp án
          </AlertDescription>
        </Alert>
      );
    }
    
    return alerts;
  };
  
  // ===== MAIN RENDER =====
  
  return (
    <div className={`answer-form space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-medium">Đáp án</h3>
          <Badge variant="outline">
            {fields.length} đáp án
          </Badge>
          {correctAnswersCount > 0 && (
            <Badge variant="default">
              {correctAnswersCount} đúng
            </Badge>
          )}
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddAnswer}
          disabled={fields.length >= maxAnswers}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm đáp án
        </Button>
      </div>
      
      {/* Validation alerts */}
      <div className="space-y-2">
        {renderValidationAlerts()}
      </div>
      
      {/* Answers list */}
      <div className="space-y-3">
        {fields.map((field, index) => renderAnswerItem(field, index))}
      </div>
      
      {/* Help text */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Hướng dẫn:</strong>
          <ul className="mt-1 text-sm list-disc list-inside space-y-1">
            <li>Sử dụng LaTeX cho công thức toán học: $x^2 + y^2 = z^2$</li>
            <li>Nhấn biểu tượng mắt để xem trước LaTeX</li>
            <li>Nhấn mũi tên để mở rộng và thêm giải thích</li>
            <li>Đánh dấu ít nhất một đáp án là đúng</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
