/**
 * Simple Question Form Component
 * Simplified form component để tránh TypeScript complexity issues
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Alert,
  AlertDescription,
} from "@/components/ui";
import {
  Save,
  Eye,
  AlertTriangle,
  Loader2,
  BookOpen,
  Target,
  Hash
} from "lucide-react";

// Import types
import { FormQuestion, FormAnswer } from "@/lib/types/form-compatibility";

// ===== TYPES =====

export interface SimpleQuestionFormProps {
  question?: FormQuestion;
  mode: 'create' | 'edit';
  onSubmit: (data: FormQuestion) => Promise<void>;
  onCancel?: () => void;
  onPreview?: (data: FormQuestion) => void;
  isLoading?: boolean;
  className?: string;
}

// Type for form field values
type FormFieldValue = string | number | boolean | string[] | FormAnswer[];

// Type for answer field values
type AnswerFieldValue = string | boolean;

// ===== CONSTANTS =====

const QUESTION_TYPES = [
  { value: "MULTIPLE_CHOICE", label: "Trắc nghiệm" },
  { value: "TRUE_FALSE", label: "Đúng/Sai" },
  { value: "SHORT_ANSWER", label: "Trả lời ngắn" },
  { value: "ESSAY", label: "Tự luận" },
  { value: "MATCHING", label: "Ghép đôi" }
];

const DIFFICULTY_LEVELS = [
  { value: "EASY", label: "Dễ", color: "bg-green-100 text-green-800" },
  { value: "MEDIUM", label: "Trung bình", color: "bg-yellow-100 text-yellow-800" },
  { value: "HARD", label: "Khó", color: "bg-red-100 text-red-800" }
];

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Bản nháp", color: "bg-yellow-100 text-yellow-800" },
  { value: "ACTIVE", label: "Hoạt động", color: "bg-green-100 text-green-800" },
  { value: "INACTIVE", label: "Không hoạt động", color: "bg-gray-100 text-gray-800" }
];

// ===== MAIN COMPONENT =====

export function SimpleQuestionForm({
  question,
  mode,
  onSubmit,
  onCancel,
  onPreview,
  isLoading = false,
  className = ""
}: SimpleQuestionFormProps) {
  // ===== STATE =====
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormQuestion>({
    id: question?.id,
    questionCodeId: question?.questionCodeId || "",
    rawContent: question?.rawContent || "",
    content: question?.content || "",
    type: question?.type || "MULTIPLE_CHOICE",
    difficulty: question?.difficulty || "MEDIUM",
    status: question?.status || "DRAFT",
    answers: question?.answers || [
      { content: "", isCorrect: true },
      { content: "", isCorrect: false }
    ],
    explanation: question?.explanation || "",
    solution: question?.solution || "",
    tag: question?.tag || [],
    source: question?.source || "",
    timeLimit: question?.timeLimit || 0,
    points: question?.points || 1,
    createdAt: question?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: question?.creator || "Current User",
    usageCount: question?.usageCount || 0,
    feedback: question?.feedback || 0
  });
  
  // ===== HANDLERS =====
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePreview = () => {
    onPreview?.(formData);
  };
  
  const handleInputChange = (field: keyof FormQuestion, value: FormFieldValue) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }));
  };
  
  const handleAnswerChange = (index: number, field: keyof FormAnswer, value: AnswerFieldValue) => {
    const newAnswers = [...(formData.answers || [])];
    newAnswers[index] = {
      ...newAnswers[index],
      [field]: value
    };
    handleInputChange('answers', newAnswers);
  };
  
  const addAnswer = () => {
    const newAnswers = [...(formData.answers || [])];
    newAnswers.push({ content: "", isCorrect: false });
    handleInputChange('answers', newAnswers);
  };
  
  const removeAnswer = (index: number) => {
    if ((formData.answers?.length || 0) > 1) {
      const newAnswers = formData.answers?.filter((_, i) => i !== index) || [];
      handleInputChange('answers', newAnswers);
    }
  };
  
  // ===== VALIDATION =====
  
  const isValid = formData.questionCodeId && formData.content && formData.type;
  const hasCorrectAnswer = formData.answers?.some(answer => answer.isCorrect) || false;
  
  // ===== RENDER =====
  
  return (
    <Card className={`simple-question-form ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {mode === 'create' ? 'Tạo câu hỏi mới' : 'Chỉnh sửa câu hỏi'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Hash className="h-4 w-4 inline mr-1" />
                Mã câu hỏi
              </label>
              <Input
                value={formData.questionCodeId}
                onChange={(e) => handleInputChange('questionCodeId', e.target.value)}
                placeholder="Ví dụ: 1A1N1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Định dạng: [Khối][Môn][Chương][Loại][Số]
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Loại câu hỏi</label>
              <Select
                value={formData.type}
                onValueChange={(value: string) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại câu hỏi" />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Độ khó</label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: string) => handleInputChange('difficulty', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn độ khó" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      <Badge className={`text-xs ${level.color}`}>
                        {level.label}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Trạng thái</label>
              <Select
                value={formData.status}
                onValueChange={(value: string) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      <Badge className={`text-xs ${status.color}`}>
                        {status.label}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                <Target className="h-4 w-4 inline mr-1" />
                Điểm số
              </label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={formData.points}
                onChange={(e) => handleInputChange('points', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          
          {/* Question Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Nội dung câu hỏi</label>
            <Textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Nhập nội dung câu hỏi (hỗ trợ LaTeX: $x^2 + y^2 = z^2$)"
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Hỗ trợ LaTeX: sử dụng $...$ cho inline math, $$...$$ cho display math
            </p>
          </div>
          
          {/* Answers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Đáp án</h3>
              <Button type="button" variant="outline" size="sm" onClick={addAnswer}>
                Thêm đáp án
              </Button>
            </div>
            
            {formData.answers?.map((answer, index) => (
              <div key={index} className="border rounded p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={answer.isCorrect}
                        onChange={(e) => handleAnswerChange(index, 'isCorrect', e.target.checked)}
                      />
                      <span className="text-sm">Đáp án đúng</span>
                    </label>
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAnswer(index)}
                    disabled={(formData.answers?.length || 0) <= 1}
                  >
                    Xóa
                  </Button>
                </div>
                
                <Textarea
                  value={answer.content}
                  onChange={(e) => handleAnswerChange(index, 'content', e.target.value)}
                  placeholder="Nhập nội dung đáp án"
                  className="min-h-[60px]"
                />
                
                <Textarea
                  value={answer.explanation || ""}
                  onChange={(e) => handleAnswerChange(index, 'explanation', e.target.value)}
                  placeholder="Giải thích (tùy chọn)"
                  className="min-h-[40px]"
                />
              </div>
            ))}
            
            {/* Validation */}
            {!hasCorrectAnswer && formData.type === 'MULTIPLE_CHOICE' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Cần có ít nhất một đáp án đúng cho câu hỏi trắc nghiệm
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreview}
                disabled={isLoading || isSubmitting}
              >
                <Eye className="h-4 w-4 mr-2" />
                Xem trước
              </Button>
              
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                  disabled={isLoading || isSubmitting}
                >
                  Hủy
                </Button>
              )}
            </div>
            
            <Button
              type="submit"
              disabled={isLoading || isSubmitting || !isValid}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {mode === 'create' ? 'Tạo câu hỏi' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
