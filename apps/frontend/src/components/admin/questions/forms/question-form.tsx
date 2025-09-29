/**
 * Question Form Component
 * Comprehensive form cho creating/editing questions với validation
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
  Textarea,
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
  // Separator,
  Alert,
  AlertDescription,
} from "@/components/ui";
import {
  // Plus,
  // Minus,
  Save,
  Eye,
  AlertTriangle,
  CheckCircle,
  Loader2,
  BookOpen,
  Target,
  Hash
} from "lucide-react";

// Import types
import { Question, QuestionType, QuestionStatus, QuestionDifficulty } from "@/types/question";
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
    .max(1000, "Nội dung câu hỏi không được quá 1000 ký tự"),
  type: z.nativeEnum(QuestionType, {
    required_error: "Vui lòng chọn loại câu hỏi"
  }),
  difficulty: z.nativeEnum(QuestionDifficulty, {
    required_error: "Vui lòng chọn độ khó"
  }),
  status: z.nativeEnum(QuestionStatus).default(QuestionStatus.PENDING),
  answers: z.array(answerSchema).min(1, "Cần có ít nhất một đáp án"),
  explanation: z.string().optional(),
  solution: z.string().optional(),
  tag: z.array(z.string()).optional(), // Sửa từ 'tags' thành 'tag' để khớp với Question interface
  source: z.string().optional(),
  timeLimit: z.number().min(0).optional(),
  points: z.number().min(0).optional()
}).refine((data) => {
  // Validate multiple choice questions have at least 2 answers and 1 correct answer
  if (data.type === QuestionType.MC) {
    if (data.answers.length < 2) {
      return false;
    }
    if (!data.answers.some(answer => answer.isCorrect)) {
      return false;
    }
  }
  return true;
}, {
  message: "Câu hỏi trắc nghiệm cần ít nhất 2 đáp án và 1 đáp án đúng",
  path: ["answers"]
});

type QuestionFormData = z.infer<typeof questionFormSchema>;

// ===== TYPES =====

export interface QuestionFormProps {
  question?: Question;
  mode: 'create' | 'edit';
  onSubmit: (data: QuestionFormData) => Promise<void>;
  onCancel?: () => void;
  onPreview?: (data: QuestionFormData) => void;
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
  { value: QuestionDifficulty.EASY, label: "Dễ", color: "bg-badge-success text-badge-success-foreground" },
  { value: QuestionDifficulty.MEDIUM, label: "Trung bình", color: "bg-badge-warning text-badge-warning-foreground" },
  { value: QuestionDifficulty.HARD, label: "Khó", color: "bg-badge-error text-badge-error-foreground" }
];

const STATUS_OPTIONS = [
  { value: QuestionStatus.PENDING, label: "Bản nháp", color: "bg-badge-warning text-badge-warning-foreground" },
  { value: QuestionStatus.ACTIVE, label: "Hoạt động", color: "bg-badge-success text-badge-success-foreground" },
  { value: QuestionStatus.INACTIVE, label: "Không hoạt động", color: "bg-muted text-muted-foreground" },
  { value: QuestionStatus.ARCHIVED, label: "Lưu trữ", color: "bg-badge-error text-badge-error-foreground" }
];

// ===== MAIN COMPONENT =====

export function QuestionForm({
  question,
  mode,
  onSubmit,
  onCancel,
  onPreview,
  isLoading = false,
  className = ""
}: QuestionFormProps) {
  // ===== STATE =====
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<QuestionValidationResult | null>(null);
  
  // ===== FORM SETUP =====
  
  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionFormSchema),
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

  // Answer management is handled by AnswerForm component
  // useFieldArray is not needed here as AnswerForm has its own field array management
  
  // ===== EFFECTS =====
  
  // Validate form data on change
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (data.content && data.type) {
        const mockQuestion = {
          ...data,
          id: data.id || 'temp',
          rawContent: data.content || '', // Thêm rawContent property
          questionCodeId: data.questionCodeId || 'temp',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Question;
        
        const result = validateQuestion(mockQuestion);
        setValidationResult(result);
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
  
  const handlePreview = () => {
    const data = form.getValues();
    onPreview?.(data);
  };
  
  // Answer management is handled by AnswerForm component
  
  // ===== RENDER HELPERS =====
  
  const renderValidationStatus = () => {
    if (!validationResult) return null;
    
    const { isValid, errors, warnings, score } = validationResult;
    
    return (
      <Alert variant={isValid ? "default" : "destructive"} className="mb-4">
        <div className="flex items-center gap-2">
          {isValid ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <span className="font-medium">
            {isValid ? "Form hợp lệ" : "Form có lỗi"}
          </span>
          <Badge variant="outline">
            Điểm: {score}/100
          </Badge>
        </div>
        
        {errors.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium">Lỗi:</p>
            <ul className="text-sm list-disc list-inside">
              {errors.map((error: { message: string }, index: number) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </div>
        )}
        
        {warnings.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium">Cảnh báo:</p>
            <ul className="text-sm list-disc list-inside">
              {warnings.map((warning: { message: string }, index: number) => (
                <li key={index}>{warning.message}</li>
              ))}
            </ul>
          </div>
        )}
      </Alert>
    );
  };
  
  // ===== MAIN RENDER =====
  
  return (
    <Card className={`question-form ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {mode === 'create' ? 'Tạo câu hỏi mới' : 'Chỉnh sửa câu hỏi'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {renderValidationStatus()}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
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
                      Định dạng: [Khối][Môn][Chương][Loại][Số] (VD: 1A1N1)
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
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${level.color}`}>
                                {level.label}
                              </Badge>
                            </div>
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
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${status.color}`}>
                                {status.label}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
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
            
            {/* Question Content */}
            <FormField
              control={typedControl}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung câu hỏi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập nội dung câu hỏi (hỗ trợ LaTeX: $x^2 + y^2 = z^2$)"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Hỗ trợ LaTeX: sử dụng $...$ cho inline math, $$...$$ cho display math
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Answers Section - Will be implemented in separate component */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Đáp án</h3>
                <Badge variant="outline">
                  {form.watch("answers")?.length || 0} đáp án
                </Badge>
              </div>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Phần quản lý đáp án sẽ được implement trong component riêng
                </AlertDescription>
              </Alert>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4">
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
  );
}
