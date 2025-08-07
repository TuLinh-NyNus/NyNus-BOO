/**
 * Admin Question Edit Page
 * Page cho chỉnh sửa câu hỏi trong admin panel
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  Skeleton,
} from "@/components/ui";
import {
  Save,
  Eye,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  History,
  Trash2,
} from "lucide-react";

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
  id: string;
  content: string;
  type: "MC" | "TF" | "SA" | "ES" | "MA";
  status: "ACTIVE" | "PENDING" | "INACTIVE" | "ARCHIVED";
  questionCodeId: string;
  answers: any[];
  explanation?: string;
  difficulty?: string;
  tags?: string[];
  source?: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

/**
 * Edit Question Page Component
 */
export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const questionId = params.id as string;
  const { user, isAuthenticated, hasRole } = useAdminAuth();

  // State management
  const [originalQuestion, setOriginalQuestion] = useState<QuestionData | null>(null);
  const [questionData, setQuestionData] = useState<Partial<QuestionData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Permission checks
  const canSetActiveStatus = hasRole("ADMIN");
  const canEditAllQuestions = hasRole("ADMIN");

  /**
   * Load question data
   */
  const loadQuestion = async () => {
    try {
      setIsLoading(true);

      // TODO: Replace với actual API call
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load question");
      }

      const question = await response.json();

      // Check if user can edit this question
      if (!canEditAllQuestions && question.creator !== user?.id) {
        toast.error("Bạn không có quyền chỉnh sửa câu hỏi này");
        router.push(toSecretPath("/admin/questions"));
        return;
      }

      setOriginalQuestion(question);
      setQuestionData(question);
    } catch (error) {
      console.error("Error loading question:", error);
      toast.error("Không thể tải thông tin câu hỏi");
      router.push(toSecretPath("/admin/questions"));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle form data change
   */
  const handleFormChange = (data: Partial<QuestionData>) => {
    setQuestionData((prev) => ({ ...prev, ...data }));
    setHasChanges(true);

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
   * Save question changes
   */
  const saveQuestion = async () => {
    try {
      setIsSaving(true);

      // Validate question data
      const errors = validateQuestion();
      if (errors.length > 0) {
        setValidationErrors(errors);
        toast.error("Vui lòng sửa các lỗi trước khi lưu");
        return;
      }

      // Prepare update data
      const updateData = {
        ...questionData,
        updatedAt: new Date().toISOString(),
      };

      // TODO: Replace với actual API call
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update question");
      }

      const updatedQuestion = await response.json();

      setOriginalQuestion(updatedQuestion);
      setQuestionData(updatedQuestion);
      setHasChanges(false);
      setLastSaved(new Date());

      toast.success("Đã cập nhật câu hỏi thành công");
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Không thể cập nhật câu hỏi");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Delete question
   */
  const deleteQuestion = async () => {
    if (!canEditAllQuestions) {
      toast.error("Bạn không có quyền xóa câu hỏi");
      return;
    }

    if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác.")) {
      return;
    }

    try {
      // TODO: Replace với actual API call
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete question");
      }

      toast.success("Đã xóa câu hỏi thành công");
      router.push(toSecretPath("/admin/questions"));
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Không thể xóa câu hỏi");
    }
  };

  /**
   * Reset changes
   */
  const resetChanges = () => {
    if (originalQuestion) {
      setQuestionData(originalQuestion);
      setHasChanges(false);
      setValidationErrors([]);
      toast.info("Đã khôi phục về phiên bản gốc");
    }
  };

  // Load question on mount
  useEffect(() => {
    if (isAuthenticated && questionId) {
      loadQuestion();
    }
  }, [isAuthenticated, questionId]);

  // Show loading state
  if (!isAuthenticated || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!originalQuestion) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Không tìm thấy câu hỏi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-question-page space-y-6">
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
            <h1 className="text-2xl font-bold">Chỉnh sửa câu hỏi</h1>
            <p className="text-muted-foreground">
              ID: {questionId} • Tạo bởi: {originalQuestion.creator}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Change Status */}
          {hasChanges && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
              <Clock className="h-3 w-3 mr-1" />
              Có thay đổi
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

          {hasChanges && (
            <Button variant="outline" size="sm" onClick={resetChanges}>
              <History className="h-4 w-4 mr-2" />
              Khôi phục
            </Button>
          )}

          {canEditAllQuestions && (
            <Button variant="destructive" size="sm" onClick={deleteQuestion}>
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa
            </Button>
          )}

          <Button
            size="sm"
            onClick={saveQuestion}
            disabled={isSaving || !hasChanges || validationErrors.length > 0}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      {/* Question Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Trạng thái:</span>
              <div className="mt-1">
                {originalQuestion.status === "ACTIVE" && (
                  <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
                )}
                {originalQuestion.status === "PENDING" && (
                  <Badge className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>
                )}
                {originalQuestion.status === "INACTIVE" && (
                  <Badge className="bg-red-100 text-red-800">Tạm ngưng</Badge>
                )}
                {originalQuestion.status === "ARCHIVED" && (
                  <Badge className="bg-gray-100 text-gray-800">Lưu trữ</Badge>
                )}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Loại:</span>
              <div className="mt-1 font-medium">{originalQuestion.type}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Sử dụng:</span>
              <div className="mt-1 font-medium">{originalQuestion.usageCount} lần</div>
            </div>
            <div>
              <span className="text-muted-foreground">Cập nhật:</span>
              <div className="mt-1 font-medium">
                {new Date(originalQuestion.updatedAt).toLocaleDateString("vi-VN")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
            <CardDescription>Chỉnh sửa nội dung và cấu hình câu hỏi</CardDescription>
          </CardHeader>
          <CardContent>
            <QuestionFormAdmin
              questionData={questionData}
              onChange={handleFormChange}
              userRole={user?.role || "GUEST"}
              canSetActiveStatus={canSetActiveStatus}
              validationErrors={validationErrors}
              isEditing={true}
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
        onSave={() => {
          // Auto-save as draft for edit mode
          console.log("Auto-saving changes...");
        }}
        interval={30000} // 30 seconds
        enabled={hasChanges}
      />
    </div>
  );
}
