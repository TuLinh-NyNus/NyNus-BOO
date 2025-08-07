/**
 * Admin Question Create Page
 * Page cho tạo câu hỏi mới trong admin panel
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Alert,
} from "@/components/ui";
import { Save, Eye, ArrowLeft, AlertCircle, CheckCircle, Clock, FileText } from "lucide-react";

// Import admin-specific question components
import { QuestionFormAdmin } from "@/components/questions/question-form-admin";
import { QuestionPreviewAdmin } from "@/components/questions/question-preview-admin";
import { QuestionAutoSave } from "@/components/questions/question-auto-save";

// Import hooks và utilities
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { toSecretPath } from "@/lib/admin-paths";

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
 * Create Question Page Component
 */
export default function CreateQuestionPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasRole } = useAdminAuth();

  // State management
  const [questionData, setQuestionData] = useState<Partial<QuestionData>>({
    content: "",
    type: "MC",
    status: "PENDING",
    answers: [],
  });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Permission checks
  const canSetActiveStatus = hasRole("ADMIN");
  const canCreateQuestions = hasRole("ADMIN") || hasRole("TEACHER");

  /**
   * Handle form data change
   */
  const handleFormChange = (data: Partial<QuestionData>) => {
    setQuestionData((prev) => ({ ...prev, ...data }));
    setIsDraft(true);

    // Clear validation errors when user makes changes
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  /**
   * Validate question data
   */
  const validateQuestion = (): string[] => {
    const errors: string[] = [];

    if (!questionData.content?.trim()) {
      errors.push("Nội dung câu hỏi không được để trống");
    }

    if (!questionData.questionCodeId?.trim()) {
      errors.push("Mã câu hỏi không được để trống");
    }

    if (!questionData.answers || questionData.answers.length === 0) {
      errors.push("Câu hỏi phải có ít nhất một đáp án");
    }

    // Validate based on question type
    if (questionData.type === "MC" && questionData.answers) {
      const hasCorrectAnswer = questionData.answers.some((answer) => answer.isCorrect);
      if (!hasCorrectAnswer) {
        errors.push("Câu hỏi trắc nghiệm phải có ít nhất một đáp án đúng");
      }
    }

    return errors;
  };

  /**
   * Save question as draft
   */
  const saveDraft = async () => {
    try {
      // TODO: Implement actual draft save API
      const draftData = {
        ...questionData,
        isDraft: true,
        lastModified: new Date().toISOString(),
      };

      // Save to localStorage as backup
      localStorage.setItem("question_draft", JSON.stringify(draftData));

      setLastSaved(new Date());
      setIsDraft(false);

      console.log("Draft saved:", draftData);
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Không thể lưu bản nháp");
    }
  };

  /**
   * Save question
   */
  const saveQuestion = async (asDraft: boolean = false) => {
    try {
      setIsSaving(true);

      // Validate question data
      const errors = validateQuestion();
      if (errors.length > 0 && !asDraft) {
        setValidationErrors(errors);
        toast.error("Vui lòng sửa các lỗi trước khi lưu");
        return;
      }

      // Prepare question data
      const questionToSave = {
        ...questionData,
        creator: user?.id,
        status: asDraft ? "PENDING" : questionData.status,
        isDraft: asDraft,
      };

      // TODO: Replace với actual API call
      const response = await fetch("/api/admin/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify(questionToSave),
      });

      if (!response.ok) {
        throw new Error("Failed to save question");
      }

      const savedQuestion = await response.json();

      // Clear draft from localStorage
      localStorage.removeItem("question_draft");

      setIsDraft(false);
      setLastSaved(new Date());

      toast.success(asDraft ? "Đã lưu bản nháp" : "Đã tạo câu hỏi thành công");

      // Redirect to question list or edit page
      if (!asDraft) {
        router.push(toSecretPath("/admin/questions"));
      }
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error("Không thể lưu câu hỏi");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Load draft from localStorage on mount
   */
  useEffect(() => {
    const savedDraft = localStorage.getItem("question_draft");
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setQuestionData(draftData);
        setIsDraft(true);
        toast.info("Đã khôi phục bản nháp trước đó");
      } catch (error) {
        console.error("Error loading draft:", error);
        localStorage.removeItem("question_draft");
      }
    }
  }, []);

  // Show loading state
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  // Check permissions
  if (!canCreateQuestions) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Bạn không có quyền tạo câu hỏi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-question-page space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(toSecretPath("/admin/questions"))}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>

          <div>
            <h1 className="text-2xl font-bold">Tạo câu hỏi mới</h1>
            <p className="text-muted-foreground">Tạo câu hỏi mới từ nội dung LaTeX</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Draft Status */}
          {isDraft && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
              <Clock className="h-3 w-3 mr-1" />
              Chưa lưu
            </Badge>
          )}

          {lastSaved && (
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              Đã lưu {lastSaved.toLocaleTimeString()}
            </Badge>
          )}

          {/* Action Buttons */}
          <Button variant="outline" size="sm" onClick={() => setIsPreviewMode(!isPreviewMode)}>
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? "Chỉnh sửa" : "Xem trước"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => saveQuestion(true)}
            disabled={isSaving}
          >
            <FileText className="h-4 w-4 mr-2" />
            Lưu nháp
          </Button>

          <Button
            size="sm"
            onClick={() => saveQuestion(false)}
            disabled={isSaving || validationErrors.length > 0}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Đang lưu..." : "Tạo câu hỏi"}
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium mb-2">Có lỗi cần sửa:</h4>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card className={isPreviewMode ? "lg:col-span-1" : "lg:col-span-2"}>
          <CardHeader>
            <CardTitle>Thông tin câu hỏi</CardTitle>
            <CardDescription>Nhập nội dung và cấu hình câu hỏi</CardDescription>
          </CardHeader>
          <CardContent>
            <QuestionFormAdmin
              questionData={questionData}
              onChange={handleFormChange}
              userRole={user?.role || "GUEST"}
              canSetActiveStatus={canSetActiveStatus}
              validationErrors={validationErrors}
            />
          </CardContent>
        </Card>

        {/* Preview Section */}
        {isPreviewMode && (
          <Card>
            <CardHeader>
              <CardTitle>Xem trước câu hỏi</CardTitle>
              <CardDescription>Xem câu hỏi như học viên sẽ thấy</CardDescription>
            </CardHeader>
            <CardContent>
              <QuestionPreviewAdmin questionData={questionData} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Auto-save Component */}
      <QuestionAutoSave
        questionData={questionData}
        onSave={saveDraft}
        interval={30000} // 30 seconds
        enabled={isDraft}
      />
    </div>
  );
}
