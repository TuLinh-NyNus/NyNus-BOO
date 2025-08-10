/**
 * Question Form Component
 * Form tạo/chỉnh sửa câu hỏi cơ bản và đáp án
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
} from "@/components/ui";
import {
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/feedback/use-toast";

// Import components
import { QuestionAnswers } from "./questionAnswers";
import { QuestionBasicInfo } from "./questionBasicInfo";
import { QuestionMetadata } from "./questionMetadata";
import { QuestionPreviewSection } from "./questionPreviewSection";

// Import types từ lib/types
import {
  Question,
  QuestionDraft,
  QuestionType,
  QuestionDifficulty,
  AnswerOption
} from "@/lib/types/question";

/**
 * Props for QuestionForm component
 */
interface QuestionFormProps {
  initialData?: Partial<Question>;
  onSubmit: (data: QuestionDraft) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

/**
 * Question Form Component
 * Comprehensive form cho tạo và chỉnh sửa câu hỏi
 */
export function QuestionForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = "create",
}: QuestionFormProps) {
  const { toast } = useToast();

  // Form state - trạng thái form
  const [formData, setFormData] = useState<QuestionDraft>({
    content: initialData?.content || "",
    rawContent: initialData?.rawContent || "",
    type: initialData?.type || QuestionType.MC,
    difficulty: initialData?.difficulty || QuestionDifficulty.MEDIUM,
    category: "",
    tags: initialData?.tag || [],
    timeLimit: 300, // 5 minutes default
    points: 10,
    explanation: initialData?.solution || "",
    answers: (initialData?.answers as AnswerOption[]) || [],
    source: initialData?.source || "",
    questionCodeId: initialData?.questionCodeId || "",
  });

  // UI state
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Handle form field change
   */
  const handleFieldChange = useCallback((field: keyof QuestionDraft, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  }, [errors]);





  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.content.trim()) {
      newErrors.content = "Nội dung câu hỏi không được để trống";
    }

    if (!formData.questionCodeId || !formData.questionCodeId.trim()) {
      newErrors.questionCodeId = "Mã câu hỏi không được để trống";
    }

    // Validate answers for MC and TF types
    if (formData.type === QuestionType.MC || formData.type === QuestionType.TF) {
      const answers = formData.answers as AnswerOption[];
      
      if (!answers || answers.length < 2) {
        newErrors.answers = "Cần ít nhất 2 đáp án cho câu hỏi trắc nghiệm";
      } else {
        const hasCorrectAnswer = answers.some(answer => answer.isCorrect);
        if (!hasCorrectAnswer) {
          newErrors.answers = "Cần có ít nhất 1 đáp án đúng";
        }

        const emptyAnswers = answers.some(answer => !answer.content.trim());
        if (emptyAnswers) {
          newErrors.answers = "Tất cả đáp án phải có nội dung";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Lỗi validation",
        description: "Vui lòng kiểm tra lại thông tin đã nhập",
        variant: "destructive",
      });
      return;
    }

    try {
      await onSubmit(formData);
      
      toast({
        title: "Thành công",
        description: mode === "create" ? "Đã tạo câu hỏi mới" : "Đã cập nhật câu hỏi",
        variant: "default",
      });
    } catch {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi lưu câu hỏi",
        variant: "destructive",
      });
    }
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({
      content: "",
      rawContent: "",
      type: QuestionType.MC,
      difficulty: QuestionDifficulty.MEDIUM,
      category: "",
      tags: [],
      timeLimit: 300,
      points: 10,
      explanation: "",
      answers: [],
      source: "",
      questionCodeId: "",
    });
    setErrors({});
  };

  // Initialize answers for MC/TF types
  useEffect(() => {
    if ((formData.type === QuestionType.MC || formData.type === QuestionType.TF) &&
        (!formData.answers || formData.answers.length === 0)) {
      const defaultAnswers: AnswerOption[] = [
        { id: "answer-1", content: "", isCorrect: false },
        { id: "answer-2", content: "", isCorrect: false },
      ];

      if (formData.type === QuestionType.MC) {
        defaultAnswers.push(
          { id: "answer-3", content: "", isCorrect: false },
          { id: "answer-4", content: "", isCorrect: false }
        );
      }

      handleFieldChange("answers", defaultAnswers);
    }
  }, [formData.type, formData.answers, handleFieldChange]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <QuestionBasicInfo
        content={formData.content}
        onContentChange={(value) => handleFieldChange("content", value)}
        type={formData.type}
        onTypeChange={(value) => handleFieldChange("type", value)}
        difficulty={formData.difficulty || QuestionDifficulty.MEDIUM}
        onDifficultyChange={(value) => handleFieldChange("difficulty", value)}
        points={formData.points || 10}
        onPointsChange={(value) => handleFieldChange("points", value)}
        errors={errors}
      />

      {/* Metadata */}
      <QuestionMetadata
        questionCodeId={formData.questionCodeId || ""}
        onQuestionCodeIdChange={(value) => handleFieldChange("questionCodeId", value)}
        source={formData.source || ""}
        onSourceChange={(value) => handleFieldChange("source", value)}
        tags={formData.tags || []}
        onTagsChange={(tags) => handleFieldChange("tags", tags)}
        explanation={formData.explanation || ""}
        onExplanationChange={(value) => handleFieldChange("explanation", value)}
        errors={errors}
      />

      {/* Answers Section */}
      <QuestionAnswers
        questionType={formData.type}
        answers={(formData.answers as AnswerOption[]) || []}
        onAnswersChange={(answers) => handleFieldChange("answers", answers)}
        error={errors.answers}
      />

      {/* Preview Section */}
      {showPreview && (
        <QuestionPreviewSection
          content={formData.content}
          type={formData.type}
          answers={(formData.answers as AnswerOption[]) || []}
          explanation={formData.explanation || ""}
        />
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showPreview ? "Ẩn xem trước" : "Xem trước"}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Đặt lại
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Hủy
            </Button>
          )}
          
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            {mode === "create" ? "Tạo câu hỏi" : "Cập nhật"}
          </Button>
        </div>
      </div>
    </form>
  );
}
