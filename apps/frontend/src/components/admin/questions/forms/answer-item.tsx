/**
 * Answer Item Component
 * Individual answer item component - separated to prevent infinite render loop
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { memo } from "react";
import { Control, useWatch } from "react-hook-form";
import { AnswerItemData } from "./answer-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Card,
  CardContent,
  CardHeader,
  Button,
  Checkbox,
  Textarea,
  Badge,
  Collapsible,
  CollapsibleContent,
} from "@/components/ui";
import {
  Eye,
  EyeOff,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Minus,
} from "lucide-react";
import { LaTeXPreview } from "@/components/common/latex";

// ===== TYPES =====

export interface AnswerItemProps {
  field: Record<"id", string>;
  index: number;
  control: Control<{ answers: AnswerItemData[] }>;
  isExpanded: boolean;
  hasPreview: boolean;
  minAnswers: number;
  fieldsLength: number;
  onToggleExpanded: (index: number) => void;
  onTogglePreview: (index: number) => void;
  onRemove: (index: number) => void;
}

// ===== COMPONENT =====

/**
 * Answer Item Component
 * Memoized to prevent unnecessary re-renders
 */
export const AnswerItem = memo(function AnswerItem({
  field,
  index,
  control,
  isExpanded,
  hasPreview,
  minAnswers,
  fieldsLength,
  onToggleExpanded,
  onTogglePreview,
  onRemove,
}: AnswerItemProps) {
  
  // Use useWatch to get current answer values without causing infinite render
  const currentAnswer = useWatch({
    control,
    name: `answers.${index}` as const
  });
  
  const isCorrect = currentAnswer?.isCorrect || false;
  const content = currentAnswer?.content || '';
  
  /**
   * Get answer label (A, B, C, D...)
   */
  const getAnswerLabel = (idx: number) => {
    return String.fromCharCode(65 + idx);
  };

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
            
            {isCorrect && (
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
              onClick={() => onTogglePreview(index)}
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
              onClick={() => onToggleExpanded(index)}
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
              onClick={() => onRemove(index)}
              disabled={fieldsLength <= minAnswers}
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
        {hasPreview && content && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Xem trước LaTeX:</h4>
            <LaTeXPreview
              latex={content}
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
});

