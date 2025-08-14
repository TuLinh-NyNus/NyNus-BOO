/**
 * Integrated Question Form Component
 * Complete question form với tất cả features: LaTeX, validation, preview
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import { useForm, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  // Alert,
  // AlertDescription,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import {
  Save,
  Eye,
  // AlertTriangle,
  // CheckCircle,
  Loader2,
  BookOpen,
  Target,
  Hash,
  // Settings,
  FileText,
  // Zap
} from "lucide-react";

// Import form components
import { AnswerForm } from "./answer-form";
import { LaTeXEditor } from "./latex-editor";

// Import management components
import {
  QuestionValidationPanel,
  // QuestionPreview,
  TeacherQuestionPreview
} from "../management";

// Import types
import { Question, QuestionType, QuestionStatus, QuestionDifficulty } from "@/lib/types/question";
import { validateQuestion, QuestionValidationResult } from "@/lib/utils/question-management";

// ===== VALIDATION SCHEMA =====

const answerSchema = z.object({
  id: z.string().optional(),
  content: z.string().min(1, "Nội dung đáp án không được để trống"),
  isCorrect: z.boolean().default(false),
  explanation: z.string().optional()
});

const questionFormSchema = z.object({
  id: z.string().optional(),
  questionCodeId: z.string()
    .min(1, "Mã câu hỏi không được để trống")
    .regex(/^[0-9A-C][A-Z][1-9][NHVCTM][1-9A-Z](-[1-9])?$/, "Mã câu hỏi không đúng định dạng"),
  content: z.string()
    .min(10, "Nội dung câu hỏi phải có ít nhất 10 ký tự")
    .max(2000, "Nội dung câu hỏi không được quá 2000 ký tự"),
  type: z.nativeEnum(QuestionType),
  difficulty: z.nativeEnum(QuestionDifficulty),
  status: z.nativeEnum(QuestionStatus).default(QuestionStatus.PENDING),
  answers: z.array(answerSchema).min(1, "Cần có ít nhất một đáp án"),
  explanation: z.string().optional(),
  solution: z.string().optional(),
  tag: z.array(z.string()).optional(), // Sửa từ 'tags' thành 'tag' để khớp với Question interface
  source: z.string().optional(),
  timeLimit: z.number().min(0).optional(),
  points: z.number().min(0).optional()
});

type QuestionFormData = z.infer<typeof questionFormSchema>;

// ===== TYPES =====

export interface IntegratedQuestionFormProps {
  question?: Question;
  mode: 'create' | 'edit';
  onSubmit: (data: QuestionFormData) => Promise<void>;
  onCancel?: () => void;
  onSaveDraft?: (data: QuestionFormData) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

// ===== CONSTANTS =====

const QUESTION_TYPES = [
  { value: QuestionType.MC, label: "Trắc nghiệm" },
  { value: QuestionType.TF, label: "Đúng/Sai" },
  { value: QuestionType.SA, label: "Trả lời ngắn" },
  { value: QuestionType.ES, label: "Tự luận" },
  { value: QuestionType.MA, label: "Ghép đôi" }
];

const DIFFICULTY_LEVELS = [
  { value: QuestionDifficulty.EASY, label: "Dễ", color: "bg-green-100 text-green-800" },
  { value: QuestionDifficulty.MEDIUM, label: "Trung bình", color: "bg-yellow-100 text-yellow-800" },
  { value: QuestionDifficulty.HARD, label: "Khó", color: "bg-red-100 text-red-800" }
];

const STATUS_OPTIONS = [
  { value: QuestionStatus.PENDING, label: "Bản nháp", color: "bg-yellow-100 text-yellow-800" },
  { value: QuestionStatus.ACTIVE, label: "Hoạt động", color: "bg-green-100 text-green-800" },
  { value: QuestionStatus.INACTIVE, label: "Không hoạt động", color: "bg-gray-100 text-gray-800" }
];

// ===== MAIN COMPONENT =====

export function IntegratedQuestionForm({
  question,
  mode,
  onSubmit,
  onCancel,
  onSaveDraft,
  isLoading = false,
  className = ""
}: IntegratedQuestionFormProps) {
  // ===== STATE =====
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [_validationResult, _setValidationResult] = useState<QuestionValidationResult | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  
  // ===== FORM SETUP =====
  
  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionFormSchema),
    mode: 'onChange',
    defaultValues: {
      id: question?.id || undefined,
      questionCodeId: question?.questionCodeId || "",
      content: question?.content || "",
      type: question?.type || QuestionType.MC,
      difficulty: question?.difficulty || QuestionDifficulty.MEDIUM,
      status: question?.status || QuestionStatus.PENDING,
      answers: (question?.answers as { content: string; isCorrect: boolean }[]) || [
        { content: "", isCorrect: true },
        { content: "", isCorrect: false }
      ],
      explanation: question?.explanation || "",
      solution: question?.solution || "",
      tag: question?.tag || [], // Sửa từ 'tags' thành 'tag'
      source: question?.source || "",
      timeLimit: question?.timeLimit || 0,
      points: question?.points || 1
    }
  });

  // Type-safe control for FormField components
  const typedControl = form.control;

  // ===== EFFECTS =====
  
  // Validate form data on change
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (data.content && data.type) {
        const mockQuestion = {
          ...data,
          id: data.id || 'temp',
          rawContent: data.content, // Thêm rawContent property
          questionCodeId: data.questionCodeId || 'temp',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Question;
        
        const result = validateQuestion(mockQuestion);
        _setValidationResult(result);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);
  
  // ===== HANDLERS =====
  
  const handleSubmit = async (data: QuestionFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;

    setIsSavingDraft(true);
    try {
      const data = form.getValues();
      await onSaveDraft({ ...data, status: QuestionStatus.PENDING });
    } catch (error) {
      console.error('Draft save error:', error);
    } finally {
      setIsSavingDraft(false);
    }
  };
  
  const handlePreview = () => {
    setShowPreviewDialog(true);
  };
  
  // ===== RENDER HELPERS =====
  
  const renderBasicInfo = () => (
    <div className="space-y-6">
      {/* Question Code and Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={typedControl}
          name="questionCodeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Mã câu hỏi
              </FormLabel>
              <FormControl>
                <Input placeholder="Ví dụ: 1A1N1" {...field} />
              </FormControl>
              <FormDescription>
                Định dạng: [Khối][Môn][Chương][Loại][Số]
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={typedControl}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại câu hỏi</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại câu hỏi" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {QUESTION_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Difficulty, Status, Points */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={typedControl}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Độ khó</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn độ khó" />
                  </SelectTrigger>
                </FormControl>
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
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={typedControl}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trạng thái</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                </FormControl>
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
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={typedControl}
          name="points"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Điểm số
              </FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  step="0.5"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
  
  const renderQuestionContent = () => (
    <div className="space-y-4">
      <FormField
        control={typedControl}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nội dung câu hỏi</FormLabel>
            <FormControl>
              <LaTeXEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="Nhập nội dung câu hỏi (hỗ trợ LaTeX)"
                height="300px"
                showPreview={true}
                showToolbar={true}
                showValidation={true}
              />
            </FormControl>
            <FormDescription>
              Sử dụng LaTeX cho công thức toán học. Ví dụ: $x^2 + y^2 = z^2$
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
  
  const renderAnswers = () => (
    <AnswerForm
      control={typedControl as unknown as Control<{ answers: { id?: string; content: string; isCorrect: boolean; explanation?: string; }[] }>}
      questionType={form.watch("type")}
    />
  );
  
  const renderExplanations = () => (
    <div className="space-y-6">
      <FormField
        control={typedControl}
        name="explanation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Giải thích</FormLabel>
            <FormControl>
              <LaTeXEditor
                value={field.value || ""}
                onChange={field.onChange}
                placeholder="Giải thích đáp án đúng..."
                height="200px"
                showPreview={true}
              />
            </FormControl>
            <FormDescription>
              Giải thích ngắn gọn tại sao đáp án này đúng
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={typedControl}
        name="solution"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lời giải chi tiết</FormLabel>
            <FormControl>
              <LaTeXEditor
                value={field.value || ""}
                onChange={field.onChange}
                placeholder="Lời giải chi tiết từng bước..."
                height="250px"
                showPreview={true}
              />
            </FormControl>
            <FormDescription>
              Hướng dẫn giải chi tiết từng bước
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
  
  // ===== MAIN RENDER =====
  
  const currentFormData = form.getValues();
  const mockQuestion = {
    ...currentFormData,
    id: currentFormData.id || 'preview',
    rawContent: currentFormData.content || '', // Thêm rawContent property
    questionCodeId: currentFormData.questionCodeId || 'preview',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: 'Current User'
  } as Question;
  
  return (
    <div className={`integrated-question-form ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {mode === 'create' ? 'Tạo câu hỏi mới' : 'Chỉnh sửa câu hỏi'}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic">Cơ bản</TabsTrigger>
                      <TabsTrigger value="content">Nội dung</TabsTrigger>
                      <TabsTrigger value="answers">Đáp án</TabsTrigger>
                      <TabsTrigger value="explanations">Lời giải</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="mt-6">
                      {renderBasicInfo()}
                    </TabsContent>
                    
                    <TabsContent value="content" className="mt-6">
                      {renderQuestionContent()}
                    </TabsContent>
                    
                    <TabsContent value="answers" className="mt-6">
                      {renderAnswers()}
                    </TabsContent>
                    
                    <TabsContent value="explanations" className="mt-6">
                      {renderExplanations()}
                    </TabsContent>
                  </Tabs>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t">
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
                      
                      {onSaveDraft && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handleSaveDraft}
                          disabled={isLoading || isSubmitting || isSavingDraft}
                        >
                          {isSavingDraft ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <FileText className="h-4 w-4 mr-2" />
                          )}
                          Lưu nháp
                        </Button>
                      )}
                      
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
                      disabled={isLoading || isSubmitting || !form.formState.isValid}
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
              </Form>
            </CardContent>
          </Card>
        </div>
        
        {/* Validation Panel */}
        <div className="lg:col-span-1">
          <QuestionValidationPanel
            question={mockQuestion}
            showQualityScore={true}
            showSuggestions={true}
            showDetails={true}
          />
        </div>
      </div>
      
      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Xem trước câu hỏi</DialogTitle>
            <DialogDescription>
              Xem trước câu hỏi như học sinh sẽ thấy
            </DialogDescription>
          </DialogHeader>
          
          <TeacherQuestionPreview
            question={mockQuestion}
            showAnswers={true}
            showExplanation={true}
            showMetadata={true}
            showQualityScore={true}
          />
          
          <DialogFooter>
            <Button onClick={() => setShowPreviewDialog(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
