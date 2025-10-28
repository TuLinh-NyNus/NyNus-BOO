/**
 * Integrated Question Form Component
 * Complete question form với tất cả features: LaTeX, validation, preview
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useMemo } from "react";
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
  Label,
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
  Separator,
  // Alert,
  // AlertDescription,
  // Dialog,
  // DialogContent,
  // DialogDescription,
  // DialogFooter,
  // DialogHeader,
  // DialogTitle,
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
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';

// Import form components
import { AnswerForm, AnswerItemData } from "./answer-form";
import { LaTeXEditor } from "./latex-editor";
import { LatexImporter } from "./latex-importer";

// Import management components removed - not used in current implementation

// Import preview modal
import { QuestionPreviewModal } from "../question-preview-modal";

// Import types
import { Question, QuestionType, QuestionStatus, QuestionDifficulty } from "@/types/question";
import { ParsedQuestion } from "@/services/grpc/question-latex.service";

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
  const [isParsed, setIsParsed] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

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

  // Tags state management (không dùng useFieldArray vì tag là array of strings)
  const currentTags = form.watch("tag") || [];

  const addTag = (newTag: string) => {
    const currentTags = form.getValues("tag") || [];
    if (!currentTags.includes(newTag)) {
      form.setValue("tag", [...currentTags, newTag]);
    }
  };

  const removeTag = (index: number) => {
    const currentTags = form.getValues("tag") || [];
    form.setValue("tag", currentTags.filter((_, i) => i !== index));
  };

  // ===== EFFECTS =====
  
  // No effects needed - validation is handled by QuestionValidationPanel component
  
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

  /**
   * Handle import từ LaTeX - tự động fill form với parsed data
   */
  const handleLatexImport = (parsedData: ParsedQuestion) => {
    try {
      // Parse answers
      let answersArray: { content: string; isCorrect: boolean; id?: string; explanation?: string; }[] = [];
      
      if (parsedData.answers) {
        // Answers có thể là string JSON hoặc array
        const answersData = typeof parsedData.answers === 'string' 
          ? JSON.parse(parsedData.answers) 
          : parsedData.answers;
        
        if (Array.isArray(answersData)) {
          answersArray = answersData.map((ans: Partial<AnswerItemData>, idx: number) => ({
            id: ans.id?.toString() || `answer-${idx}`,
            content: ans.content || '',
            isCorrect: ans.isCorrect || (ans as any).is_correct || false,
            explanation: ans.explanation || ''
          }));
        }
      }

      // Nếu không có answers, tạo 2 answers mặc định
      if (answersArray.length === 0) {
        answersArray = [
          { content: "", isCorrect: true },
          { content: "", isCorrect: false }
        ];
      }

      // Map question type
      const typeMap: Record<string, QuestionType> = {
        'MC': QuestionType.MC,
        'TF': QuestionType.TF,
        'SA': QuestionType.SA,
        'ES': QuestionType.ES,
        'MA': QuestionType.MA,
      };
      const questionType = typeMap[parsedData.type] || QuestionType.MC;

      // Set các giá trị vào form
      form.setValue('questionCodeId', parsedData.question_code || '');
      form.setValue('content', parsedData.content || '');
      form.setValue('type', questionType);
      form.setValue('answers', answersArray);
      form.setValue('solution', parsedData.solution || '');
      form.setValue('source', parsedData.source || '');

      // Chuyển sang tab "Cơ bản" sau khi import
      setIsParsed(true);

      console.log('LaTeX import successful:', parsedData);
    } catch (error) {
      console.error('Error importing LaTeX data:', error);
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
    // Validate before preview
    const currentData = form.getValues();
    if (!currentData.content || currentData.content.trim().length === 0) {
      // Show error toast if available
      console.warn('Cannot preview: No content');
      return;
    }
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

  /**
   * Render tags management
   */
  const renderTagsManagement = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Quản lý Tags</h3>

        {/* Current tags */}
        <div className="space-y-2">
          <Label>Tags hiện tại</Label>
          <div className="flex flex-wrap gap-2">
            {currentTags.map((tag, index) => (
              <div key={`tag-${index}`} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                <span className="text-sm">{tag}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => removeTag(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Add new tag */}
        <div className="flex gap-2">
          <Input
            placeholder="Thêm tag mới..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const value = e.currentTarget.value.trim();
                if (value) {
                  addTag(value);
                  e.currentTarget.value = '';
                }
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const input = document.querySelector('input[placeholder="Thêm tag mới..."]') as HTMLInputElement;
              const value = input?.value.trim();
              if (value) {
                addTag(value);
                input.value = '';
              }
            }}
          >
            Thêm
          </Button>
        </div>
      </div>
    </div>
  );

  // ===== MAIN RENDER =====
  
  // Use useMemo to prevent creating new mockQuestion object on every render
  // which causes infinite loop with QuestionValidationPanel
  const mockQuestion = useMemo(() => {
    const currentFormData = form.getValues();
    return {
      ...currentFormData,
      id: currentFormData.id || 'preview',
      rawContent: currentFormData.content || '',
      questionCodeId: currentFormData.questionCodeId || 'preview',
      createdAt: question?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creator: 'Current User'
    } as Question;
  }, [
    form.watch("content"),
    form.watch("type"),
    form.watch("answers"),
    form.watch("difficulty"),
    form.watch("status"),
    form.watch("questionCodeId"),
    form.watch("explanation"),
    form.watch("solution"),
    form.watch("tag"),
    question?.createdAt
  ]);
  
  return (
    <div className={`integrated-question-form ${className} h-full`}>
      <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        {/* Left Column: LaTeX Importer */}
        <div className="lg:col-span-1 h-full overflow-hidden">
          <LatexImporter
            onImportSuccess={handleLatexImport}
            disabled={isLoading || isSubmitting}
            onReset={() => setIsParsed(false)}
            onProcessing={setIsParsing}
          />
        </div>

        {/* Right Column: Parsed Results / Form */}
        <div className="lg:col-span-1 h-full overflow-hidden">
          {isParsing ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="flex-shrink-0">
                <Skeleton height={30} width={200} />
              </CardHeader>
              <CardContent className="flex-1 pt-6 space-y-4 overflow-hidden">
                <Skeleton count={3} height={40} />
                <Skeleton height={150} />
                <Skeleton count={2} height={40} />
              </CardContent>
            </Card>
          ) : !isParsed ? (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                  <FileText size={48} className="mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground">Kết quả phân tích</h3>
                  <p className="mt-2 text-sm max-w-xs">
                    Nhập nội dung LaTeX vào khung bên trái và nhấn &quot;Trích xuất&quot; để xem kết quả và tinh chỉnh câu hỏi tại đây.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Kiểm tra & Tinh chỉnh
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                      {renderBasicInfo()}
                      <Separator />
                      {renderQuestionContent()}
                      <Separator />
                      {renderAnswers()}
                      <Separator />
                      {renderExplanations()}
                      <Separator />
                      {renderTagsManagement()}
                    </div>

                    {/* Action Buttons - Fixed at bottom */}
                    <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t bg-background/95 backdrop-blur">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
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
                            size="sm"
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
                            size="sm"
                            onClick={onCancel}
                            disabled={isLoading || isSubmitting}
                          >
                            Hủy
                          </Button>
                        )}
                      </div>

                      <Button
                        type="submit"
                        size="sm"
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
          )}
        </div>
      </div>

      {/* Question Preview Modal - New Implementation */}
      <QuestionPreviewModal
        question={mockQuestion}
        isOpen={showPreviewDialog}
        onClose={() => setShowPreviewDialog(false)}
        title="Xem trước câu hỏi"
      />
    </div>
  );
}
