/**
 * Question Form Admin Component
 * Wrapper cho QuestionForm với admin-specific features
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Badge,
  Alert,
} from "@/components/ui";
import { AlertCircle, Plus, Trash2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

/**
 * Question data interface
 */
interface QuestionData {
  content: string;
  type: "MC" | "TF" | "SA" | "ES" | "MA";
  status: "ACTIVE" | "PENDING" | "INACTIVE" | "ARCHIVED";
  questionCodeId: string;
  answers: any[];
  explanation?: string;
  difficulty?: string;
  tags?: string[];
  source?: string;
}

/**
 * Props for QuestionFormAdmin component
 */
interface QuestionFormAdminProps {
  questionData: Partial<QuestionData>;
  onChange: (data: Partial<QuestionData>) => void;
  userRole: "GUEST" | "STUDENT" | "TUTOR" | "TEACHER" | "ADMIN";
  canSetActiveStatus?: boolean;
  validationErrors?: string[];
  isEditing?: boolean;
}

/**
 * Question Form Admin Component
 * Enhanced form với admin-specific features
 */
export function QuestionFormAdmin({
  questionData,
  onChange,
  userRole,
  canSetActiveStatus = false,
  validationErrors = [],
  isEditing = false,
}: QuestionFormAdminProps) {
  // Local state for form fields
  const [showLatexPreview, setShowLatexPreview] = useState(false);
  const [answers, setAnswers] = useState(questionData.answers || []);

  /**
   * Handle field change
   */
  const handleFieldChange = (field: string, value: any) => {
    const updatedData = { ...questionData, [field]: value };
    onChange(updatedData);
  };

  /**
   * Handle answer changes
   */
  const handleAnswerChange = (index: number, field: string, value: any) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = { ...updatedAnswers[index], [field]: value };
    setAnswers(updatedAnswers);
    handleFieldChange("answers", updatedAnswers);
  };

  /**
   * Add new answer
   */
  const addAnswer = () => {
    const newAnswer = {
      id: Date.now().toString(),
      content: "",
      isCorrect: false,
    };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    handleFieldChange("answers", updatedAnswers);
  };

  /**
   * Remove answer
   */
  const removeAnswer = (index: number) => {
    const updatedAnswers = answers.filter((_, i) => i !== index);
    setAnswers(updatedAnswers);
    handleFieldChange("answers", updatedAnswers);
  };

  /**
   * Get available statuses based on user role
   */
  const getAvailableStatuses = () => {
    if (canSetActiveStatus) {
      return [
        { value: "ACTIVE", label: "Hoạt động", color: "bg-green-100 text-green-800" },
        { value: "PENDING", label: "Chờ duyệt", color: "bg-yellow-100 text-yellow-800" },
        { value: "INACTIVE", label: "Tạm ngưng", color: "bg-red-100 text-red-800" },
        { value: "ARCHIVED", label: "Lưu trữ", color: "bg-gray-100 text-gray-800" },
      ];
    } else {
      return [{ value: "PENDING", label: "Chờ duyệt", color: "bg-yellow-100 text-yellow-800" }];
    }
  };

  /**
   * Get question type options
   */
  const getQuestionTypes = () => [
    { value: "MC", label: "Trắc nghiệm (Multiple Choice)" },
    { value: "TF", label: "Đúng/Sai (True/False)" },
    { value: "SA", label: "Trả lời ngắn (Short Answer)" },
    { value: "ES", label: "Tự luận (Essay)" },
    { value: "MA", label: "Ghép đôi (Matching)" },
  ];

  // Update local answers when questionData changes
  useEffect(() => {
    if (questionData.answers) {
      setAnswers(questionData.answers);
    }
  }, [questionData.answers]);

  return (
    <div className="question-form-admin space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Question Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Loại câu hỏi *</Label>
          <Select
            value={questionData.type || "MC"}
            onValueChange={(value) => handleFieldChange("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại câu hỏi" />
            </SelectTrigger>
            <SelectContent>
              {getQuestionTypes().map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Trạng thái *</Label>
          <Select
            value={questionData.status || "PENDING"}
            onValueChange={(value) => handleFieldChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {getAvailableStatuses().map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  <div className="flex items-center gap-2">
                    <Badge className={status.color}>{status.label}</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Question Code */}
      <div className="space-y-2">
        <Label htmlFor="questionCodeId">Mã câu hỏi *</Label>
        <Input
          id="questionCodeId"
          placeholder="VD: 0P1N1 (Lớp 10, Toán, Chương 1, Nhận biết, Câu 1)"
          value={questionData.questionCodeId || ""}
          onChange={(e) => handleFieldChange("questionCodeId", e.target.value)}
          className={
            validationErrors.some((error) => error.includes("Mã câu hỏi")) ? "border-red-500" : ""
          }
        />
        <p className="text-xs text-muted-foreground">
          Format: [Lớp][Môn][Chương][Mức độ][Số thứ tự]
        </p>
      </div>

      {/* Question Content */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="content">Nội dung câu hỏi *</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLatexPreview(!showLatexPreview)}
          >
            {showLatexPreview ? (
              <EyeOff className="h-4 w-4 mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            {showLatexPreview ? "Ẩn preview" : "Xem preview"}
          </Button>
        </div>
        <textarea
          id="content"
          placeholder="Nhập nội dung câu hỏi (hỗ trợ LaTeX)..."
          value={questionData.content || ""}
          onChange={(e) => handleFieldChange("content", e.target.value)}
          className={`w-full min-h-[120px] p-3 border rounded-md resize-y ${
            validationErrors.some((error) => error.includes("Nội dung câu hỏi"))
              ? "border-red-500"
              : "border-gray-300"
          }`}
        />

        {/* LaTeX Preview */}
        {showLatexPreview && questionData.content && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">LaTeX Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-gray-50 rounded border">
                {/* TODO: Implement actual LaTeX rendering */}
                <div
                  dangerouslySetInnerHTML={{ __html: questionData.content.replace(/\n/g, "<br>") }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Answers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Đáp án *</Label>
          <Button variant="outline" size="sm" onClick={addAnswer}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm đáp án
          </Button>
        </div>

        {answers.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <div>
              <p className="font-medium">Chưa có đáp án</p>
              <p className="text-sm text-muted-foreground">Thêm ít nhất một đáp án cho câu hỏi</p>
            </div>
          </Alert>
        )}

        {answers.map((answer, index) => (
          <Card key={answer.id || index}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                {/* Correct Answer Checkbox */}
                <div className="flex items-center pt-2">
                  <input
                    type={questionData.type === "MC" ? "radio" : "checkbox"}
                    name="correctAnswer"
                    checked={answer.isCorrect || false}
                    onChange={(e) => {
                      if (questionData.type === "MC") {
                        // For multiple choice, only one answer can be correct
                        const updatedAnswers = answers.map((a, i) => ({
                          ...a,
                          isCorrect: i === index ? e.target.checked : false,
                        }));
                        setAnswers(updatedAnswers);
                        handleFieldChange("answers", updatedAnswers);
                      } else {
                        handleAnswerChange(index, "isCorrect", e.target.checked);
                      }
                    }}
                    className="h-4 w-4"
                  />
                </div>

                {/* Answer Content */}
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder={`Đáp án ${index + 1}`}
                    value={answer.content || ""}
                    onChange={(e) => handleAnswerChange(index, "content", e.target.value)}
                  />

                  {/* Answer Explanation (optional) */}
                  <Input
                    placeholder="Giải thích (tùy chọn)"
                    value={answer.explanation || ""}
                    onChange={(e) => handleAnswerChange(index, "explanation", e.target.value)}
                    className="text-sm"
                  />
                </div>

                {/* Correct Indicator */}
                <div className="flex items-center gap-2 pt-2">
                  {answer.isCorrect ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}

                  {/* Remove Answer */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAnswer(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Explanation */}
        <div className="space-y-2">
          <Label htmlFor="explanation">Giải thích</Label>
          <textarea
            id="explanation"
            placeholder="Giải thích chi tiết cho câu hỏi..."
            value={questionData.explanation || ""}
            onChange={(e) => handleFieldChange("explanation", e.target.value)}
            className="w-full min-h-[80px] p-3 border border-gray-300 rounded-md resize-y"
          />
        </div>

        {/* Source */}
        <div className="space-y-2">
          <Label htmlFor="source">Nguồn</Label>
          <Input
            id="source"
            placeholder="Nguồn câu hỏi (sách, đề thi, ...)"
            value={questionData.source || ""}
            onChange={(e) => handleFieldChange("source", e.target.value)}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          placeholder="Nhập tags, cách nhau bằng dấu phẩy"
          value={questionData.tags?.join(", ") || ""}
          onChange={(e) => {
            const tags = e.target.value
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag);
            handleFieldChange("tags", tags);
          }}
        />
        {questionData.tags && questionData.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {questionData.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium mb-1">Có lỗi cần sửa:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </Alert>
      )}
    </div>
  );
}
