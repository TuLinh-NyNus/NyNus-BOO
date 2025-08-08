/**
 * Admin Questions Create Page
 * Trang tạo câu hỏi mới trong admin panel
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/feedback/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import { Textarea } from "@/components/ui/form/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/form/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  X,
} from "lucide-react";

// Import types
import {
  CreateQuestionForm,
  QuestionType,
  QuestionDifficulty,
} from "@/types/question";

// Import mock service
import { mockQuestionsService } from "@/lib/services/mock/questions";

// Import admin paths
import { ADMIN_PATHS } from "@/lib/admin-paths";

/**
 * Create Question Page Component
 */
export default function CreateQuestionPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateQuestionForm>({
    content: "",
    rawContent: "",
    type: QuestionType.MC,
    difficulty: QuestionDifficulty.MEDIUM,
    source: "",
    answers: [],
    correctAnswer: "",
    solution: "",
    tag: [],
    questionCodeId: "",
  });

  // UI state
  const [newTag, setNewTag] = useState("");
  const [activeTab, setActiveTab] = useState("basic");

  /**
   * Handle form field changes
   */
  const handleFieldChange = (field: keyof CreateQuestionForm, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Handle tag management
   */
  const addTag = () => {
    if (newTag.trim() && !formData.tag.includes(newTag.trim())) {
      handleFieldChange("tag", [...formData.tag, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleFieldChange(
      "tag",
      formData.tag.filter((tag) => tag !== tagToRemove)
    );
  };

  /**
   * Handle multiple choice answers
   */
  const handleAnswersChange = (answers: string[]) => {
    handleFieldChange("answers", answers);
  };

  const addAnswer = () => {
    const currentAnswers = Array.isArray(formData.answers) ? formData.answers : [];
    handleAnswersChange([...currentAnswers, ""]);
  };

  const updateAnswer = (index: number, value: string) => {
    const currentAnswers = Array.isArray(formData.answers) ? formData.answers : [];
    const newAnswers = [...currentAnswers];
    newAnswers[index] = value;
    handleAnswersChange(newAnswers);
  };

  const removeAnswer = (index: number) => {
    const currentAnswers = Array.isArray(formData.answers) ? formData.answers : [];
    const newAnswers = currentAnswers.filter((_, i) => i !== index);
    handleAnswersChange(newAnswers);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Basic validation
      if (!formData.content.trim()) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập nội dung câu hỏi",
          variant: "destructive"
        });
        return;
      }

      if (!formData.questionCodeId.trim()) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập mã câu hỏi",
          variant: "destructive"
        });
        return;
      }

      // Create question
      await mockQuestionsService.createQuestion(formData);

      toast({
        title: "Thành công",
        description: "Tạo câu hỏi thành công!",
        variant: "success"
      });
      router.push(ADMIN_PATHS.QUESTIONS);
    } catch (error) {
      console.error("Error creating question:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tạo câu hỏi",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    router.push(ADMIN_PATHS.QUESTIONS);
  };

  return (
    <div className="create-question-page space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Tạo câu hỏi mới</h1>
            <p className="text-muted-foreground">
              Tạo câu hỏi mới cho ngân hàng câu hỏi
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setActiveTab("preview")}>
            <Eye className="h-4 w-4 mr-2" />
            Xem trước
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Đang lưu..." : "Lưu câu hỏi"}
          </Button>
        </div>
      </div>

      {/* Form Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin câu hỏi</CardTitle>
          <CardDescription>
            Nhập đầy đủ thông tin để tạo câu hỏi mới
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
              <TabsTrigger value="answers">Đáp án</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="preview">Xem trước</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="questionCodeId">Mã câu hỏi *</Label>
                  <Input
                    id="questionCodeId"
                    placeholder="VD: 2P5VN hoặc 0P1VH1"
                    value={formData.questionCodeId}
                    onChange={(e) => handleFieldChange("questionCodeId", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Nguồn</Label>
                  <Input
                    id="source"
                    placeholder="VD: Sách giáo khoa Toán 12"
                    value={formData.source}
                    onChange={(e) => handleFieldChange("source", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Nội dung câu hỏi *</Label>
                <Textarea
                  id="content"
                  placeholder="Nhập nội dung câu hỏi..."
                  rows={4}
                  value={formData.content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange("content", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Loại câu hỏi</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleFieldChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={QuestionType.MC}>Trắc nghiệm</SelectItem>
                      <SelectItem value={QuestionType.TF}>Đúng/Sai</SelectItem>
                      <SelectItem value={QuestionType.SA}>Trả lời ngắn</SelectItem>
                      <SelectItem value={QuestionType.ES}>Tự luận</SelectItem>
                      <SelectItem value={QuestionType.MA}>Ghép đôi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Độ khó</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => handleFieldChange("difficulty", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={QuestionDifficulty.EASY}>Dễ</SelectItem>
                      <SelectItem value={QuestionDifficulty.MEDIUM}>Trung bình</SelectItem>
                      <SelectItem value={QuestionDifficulty.HARD}>Khó</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Answers Tab */}
            <TabsContent value="answers" className="space-y-4">
              {formData.type === QuestionType.MC && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Các lựa chọn</Label>
                    <Button size="sm" onClick={addAnswer}>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm lựa chọn
                    </Button>
                  </div>
                  {Array.isArray(formData.answers) &&
                    formData.answers.map((answer, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder={`Lựa chọn ${index + 1}`}
                          value={answer}
                          onChange={(e) => updateAnswer(index, e.target.value)}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeAnswer(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  <div className="space-y-2">
                    <Label htmlFor="correctAnswer">Đáp án đúng</Label>
                    <Input
                      id="correctAnswer"
                      placeholder="Nhập đáp án đúng"
                      value={formData.correctAnswer as string}
                      onChange={(e) => handleFieldChange("correctAnswer", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {formData.type === QuestionType.SA && (
                <div className="space-y-2">
                  <Label htmlFor="correctAnswer">Đáp án đúng</Label>
                  <Input
                    id="correctAnswer"
                    placeholder="Nhập đáp án đúng"
                    value={formData.correctAnswer as string}
                    onChange={(e) => handleFieldChange("correctAnswer", e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="solution">Lời giải</Label>
                <Textarea
                  id="solution"
                  placeholder="Nhập lời giải chi tiết..."
                  rows={4}
                  value={formData.solution}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange("solution", e.target.value)}
                />
              </div>
            </TabsContent>

            {/* Metadata Tab */}
            <TabsContent value="metadata" className="space-y-4">
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Nhập tag mới"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                  />
                  <Button size="sm" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tag.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/50">
                <h3 className="font-semibold mb-2">Xem trước câu hỏi</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">Nội dung:</p>
                    <p className="text-muted-foreground">{formData.content || "Chưa có nội dung"}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>Loại: <Badge variant="outline">{formData.type}</Badge></span>
                    <span>Độ khó: <Badge variant="outline">{formData.difficulty}</Badge></span>
                    <span>Mã: <Badge variant="outline">{formData.questionCodeId || "Chưa có"}</Badge></span>
                  </div>
                  {formData.tag.length > 0 && (
                    <div>
                      <p className="font-medium mb-1">Tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {formData.tag.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
