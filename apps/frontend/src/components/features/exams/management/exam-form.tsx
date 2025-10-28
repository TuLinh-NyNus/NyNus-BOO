/**
 * Exam Form Component
 * Create/edit exam form với validation, question selection, và exam settings
 * Supports both Generated và Official exam types với conditional fields
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-22
 */

"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { cn } from "@/lib/utils";

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
  Progress,
} from "@/components/ui";

// Icons
import {
  Save,
  X,
  Plus,
  Settings,
  BookOpen,
  School,
  FileText,
  Eye,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// Types
import {
  Exam,
  ExamFormData,
  ExamStatus,
  ExamType,
} from "@/types/exam";
import { QuestionDifficulty } from "@/types/question";

// Question Selection Components
import { QuestionSelector, SelectedQuestion } from "./question-selector";
import { SelectedQuestionsPreview } from "./selected-questions-preview";



// ===== TYPES =====

export interface ExamFormProps {
  /** Exam to edit (undefined for create mode) */
  exam?: Exam;
  
  /** Form mode */
  mode?: 'create' | 'edit';
  
  /** Loading state */
  loading?: boolean;
  
  /** Form submission loading */
  submitting?: boolean;
  
  /** Event handlers */
  onSubmit?: (data: ExamFormData) => void;
  onCancel?: () => void;
  onPreview?: (data: ExamFormData) => void;
  
  /** Additional CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const EXAM_TYPES = [
  { value: ExamType.GENERATED, label: 'Đề thi tạo từ ngân hàng câu hỏi' },
  { value: ExamType.OFFICIAL, label: 'Đề thi chính thức từ trường/sở' },
] as const;

const EXAM_STATUSES = [
  { value: ExamStatus.PENDING, label: 'Chờ duyệt' },
  { value: ExamStatus.ACTIVE, label: 'Đang hoạt động' },
  { value: ExamStatus.INACTIVE, label: 'Tạm ngưng' },
] as const;

const DIFFICULTIES = [
  { value: QuestionDifficulty.EASY, label: 'Dễ' },
  { value: QuestionDifficulty.MEDIUM, label: 'Trung bình' },
  { value: QuestionDifficulty.HARD, label: 'Khó' },
  { value: QuestionDifficulty.EXPERT, label: 'Chuyên gia' },
] as const;

const SUBJECTS = [
  'Toán học',
  'Vật lý',
  'Hóa học',
  'Sinh học',
  'Văn học',
  'Lịch sử',
  'Địa lý',
  'Tiếng Anh',
  'Tin học',
  'Giáo dục công dân',
] as const;

const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);

// ===== VALIDATION RULES =====

const validationRules = {
  title: {
    required: 'Tiêu đề đề thi là bắt buộc',
    minLength: { value: 5, message: 'Tiêu đề phải có ít nhất 5 ký tự' },
    maxLength: { value: 200, message: 'Tiêu đề không được quá 200 ký tự' },
  },
  description: {
    maxLength: { value: 1000, message: 'Mô tả không được quá 1000 ký tự' },
  },
  subject: {
    required: 'Môn học là bắt buộc',
  },
  durationMinutes: {
    required: 'Thời gian làm bài là bắt buộc',
    min: { value: 1, message: 'Thời gian phải lớn hơn 0' },
    max: { value: 480, message: 'Thời gian không được quá 8 giờ' },
  },
  totalPoints: {
    required: 'Tổng điểm là bắt buộc',
    min: { value: 1, message: 'Tổng điểm phải lớn hơn 0' },
    max: { value: 1000, message: 'Tổng điểm không được quá 1000' },
  },
  passPercentage: {
    required: 'Điểm đạt là bắt buộc',
    min: { value: 0, message: 'Điểm đạt phải từ 0%' },
    max: { value: 100, message: 'Điểm đạt không được quá 100%' },
  },
  maxAttempts: {
    required: 'Số lần làm bài là bắt buộc',
    min: { value: 1, message: 'Phải cho phép ít nhất 1 lần làm bài' },
    max: { value: 10, message: 'Không được quá 10 lần làm bài' },
  },
  sourceInstitution: {
    required: 'Tên trường/sở là bắt buộc cho đề thi chính thức',
    minLength: { value: 3, message: 'Tên trường/sở phải có ít nhất 3 ký tự' },
  },
  examYear: {
    required: 'Năm thi là bắt buộc cho đề thi chính thức',
    pattern: { value: /^\d{4}$/, message: 'Năm thi phải là 4 chữ số' },
  },
};

// ===== MAIN COMPONENT =====

export function ExamForm({
  exam,
  mode = 'create',
  loading = false,
  submitting = false,
  onSubmit,
  onCancel,
  onPreview,
  className,
}: ExamFormProps) {

  // ===== STATE =====

  const [activeTab, setActiveTab] = useState<'basic' | 'settings' | 'questions'>('basic');
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);
  const [isQuestionSelectorOpen, setIsQuestionSelectorOpen] = useState(false);

  // Form state
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, touchedFields },
    reset,
  } = useForm<ExamFormData>({
    defaultValues: exam ? {
      title: exam.title,
      description: exam.description,
      instructions: exam.instructions,
      durationMinutes: exam.durationMinutes,
      totalPoints: exam.totalPoints,
      passPercentage: exam.passPercentage,
      examType: exam.examType,
      status: exam.status,
      subject: exam.subject,
      grade: exam.grade,
      difficulty: exam.difficulty,
      tags: exam.tags,
      shuffleQuestions: exam.shuffleQuestions,
      showResults: exam.showResults,
      maxAttempts: exam.maxAttempts,
      sourceInstitution: exam.sourceInstitution,
      examYear: exam.examYear,
      examCode: exam.examCode,
      questionIds: exam.questionIds,
    } : {
      title: '',
      description: '',
      instructions: '',
      durationMinutes: 60,
      totalPoints: 100,
      passPercentage: 50,
      examType: ExamType.GENERATED,
      status: ExamStatus.PENDING,
      subject: '',
      difficulty: QuestionDifficulty.MEDIUM,
      tags: [],
      shuffleQuestions: true,
      showResults: true,
      maxAttempts: 3,
      questionIds: [],
    },
  });
  
  // Watch form values
  const examType = watch('examType');
  const questionIds = watch('questionIds');
  const tags = watch('tags');
  const title = watch('title');
  const subject = watch('subject');
  const durationMinutes = watch('durationMinutes');
  const totalPoints = watch('totalPoints');
  const passPercentage = watch('passPercentage');
  
  // Calculate progress for required fields - only count user-touched fields
  const requiredFields = [
    { name: 'title', value: title, label: 'Tiêu đề', isUserFilled: title && title.trim().length > 0 },
    { name: 'examType', value: examType, label: 'Loại đề thi', isUserFilled: touchedFields.examType && !!examType },
    { name: 'subject', value: subject, label: 'Môn học', isUserFilled: subject && subject.trim().length > 0 },
    { name: 'durationMinutes', value: durationMinutes, label: 'Thời gian', isUserFilled: touchedFields.durationMinutes && durationMinutes > 0 },
    { name: 'totalPoints', value: totalPoints, label: 'Tổng điểm', isUserFilled: touchedFields.totalPoints && totalPoints > 0 },
    { name: 'passPercentage', value: passPercentage, label: 'Điểm đạt', isUserFilled: touchedFields.passPercentage && passPercentage >= 0 },
  ];
  
  const completedRequiredFields = requiredFields.filter(field => field.isUserFilled).length;
  
  const progressPercentage = Math.round((completedRequiredFields / requiredFields.length) * 100);
  
  // Local state
  const [newTag, setNewTag] = useState('');
  
  // Effects
  useEffect(() => {
    if (exam) {
      reset({
        title: exam.title,
        description: exam.description,
        instructions: exam.instructions,
        durationMinutes: exam.durationMinutes,
        totalPoints: exam.totalPoints,
        passPercentage: exam.passPercentage,
        examType: exam.examType,
        status: exam.status,
        subject: exam.subject,
        grade: exam.grade,
        difficulty: exam.difficulty,
        tags: exam.tags,
        shuffleQuestions: exam.shuffleQuestions,
        showResults: exam.showResults,
        maxAttempts: exam.maxAttempts,
        sourceInstitution: exam.sourceInstitution,
        examYear: exam.examYear,
        examCode: exam.examCode,
        questionIds: exam.questionIds,
      });
    }
  }, [exam, reset]);
  
  // ===== HANDLERS =====

  const handleFormSubmit = (data: ExamFormData) => {
    // Include selected questions trong form data
    const formDataWithQuestions = {
      ...data,
      questionIds: selectedQuestions.map(q => q.id),
    };
    onSubmit?.(formDataWithQuestions);
  };

  const handleQuestionSelection = (questions: SelectedQuestion[]) => {
    setSelectedQuestions(questions);
    // Update form với question IDs
    setValue('questionIds', questions.map(q => q.id));
    setIsQuestionSelectorOpen(false);
  };

  const handleQuestionUpdate = (questionId: string, updates: Partial<SelectedQuestion>) => {
    setSelectedQuestions(prev =>
      prev.map(q => q.id === questionId ? { ...q, ...updates } : q)
    );
  };

  const handleQuestionRemove = (questionId: string) => {
    setSelectedQuestions(prev => {
      const filtered = prev.filter(q => q.id !== questionId);
      // Reorder remaining questions
      const reordered = filtered.map((q, index) => ({ ...q, orderNumber: index + 1 }));
      setValue('questionIds', reordered.map(q => q.id));
      return reordered;
    });
  };

  const handleQuestionsReorder = (questions: SelectedQuestion[]) => {
    setSelectedQuestions(questions);
    setValue('questionIds', questions.map(q => q.id));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setValue('tags', [...tags, newTag.trim()], { shouldDirty: true });
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', tags.filter(tag => tag !== tagToRemove), { shouldDirty: true });
  };
  
  const handlePreview = () => {
    const formData = watch();
    onPreview?.(formData);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }
  
  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {mode === 'create' ? 'Tạo đề thi mới' : 'Chỉnh sửa đề thi'}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1">
              {mode === 'create' 
                ? 'Tạo đề thi mới từ ngân hàng câu hỏi hoặc nhập đề thi chính thức'
                : 'Cập nhật thông tin và cài đặt đề thi'
              }
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              className="w-full sm:w-auto"
            >
              <Eye className="w-4 h-4 mr-2" />
              Xem trước
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto"
            >
              <X className="w-4 h-4 mr-2" />
              Hủy
            </Button>
            
            <Button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {mode === 'create' ? 'Tạo đề thi' : 'Cập nhật'}
            </Button>
          </div>
        </div>
        
        {/* Progress Indicator */}
        {progressPercentage < 100 && (
          <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {progressPercentage === 100 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Hoàn thành: {completedRequiredFields}/{requiredFields.length} trường bắt buộc
                    </span>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      {progressPercentage}%
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2 bg-slate-200 dark:bg-slate-700 [&>div]:bg-slate-600 dark:[&>div]:bg-slate-400" />
                  {progressPercentage < 100 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {requiredFields
                        .filter(field => !field.isUserFilled)
                        .map(field => (
                          <Badge key={field.name} variant="outline" className="text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                            {field.label}
                          </Badge>
                        ))
                      }
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Form Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'basic' | 'settings' | 'questions')}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <TabsTrigger value="basic" className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Thông tin cơ bản</span>
              <span className="sm:hidden">Thông tin</span>
            </TabsTrigger>
            <TabsTrigger value="metadata" className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
              <School className="w-4 h-4" />
              <span>Phân loại</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
              <Settings className="w-4 h-4" />
              <span>Cài đặt</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Câu hỏi ({questionIds.length})</span>
              <span className="sm:hidden">CH ({questionIds.length})</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin đề thi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Tiêu đề đề thi *</Label>
                  <Controller
                    name="title"
                    control={control}
                    rules={validationRules.title}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="title"
                        placeholder="Nhập tiêu đề đề thi..."
                        className={errors.title ? 'border-red-500' : ''}
                      />
                    )}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                  )}
                </div>
                
                {/* Description */}
                <div>
                  <Label htmlFor="description">Mô tả</Label>
                  <Controller
                    name="description"
                    control={control}
                    rules={validationRules.description}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id="description"
                        placeholder="Mô tả ngắn gọn về đề thi..."
                        rows={3}
                        className={errors.description ? 'border-red-500' : ''}
                      />
                    )}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                  )}
                </div>
                
                {/* Instructions */}
                <div>
                  <Label htmlFor="instructions">Hướng dẫn làm bài</Label>
                  <Controller
                    name="instructions"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id="instructions"
                        placeholder="Hướng dẫn chi tiết cho học sinh..."
                        rows={4}
                      />
                    )}
                  />
                </div>
                
                {/* Exam Type */}
                <div>
                  <Label htmlFor="examType">Loại đề thi *</Label>
                  <Controller
                    name="examType"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EXAM_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                
                {/* Official Exam Fields */}
                {examType === ExamType.OFFICIAL && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Thông tin đề thi chính thức</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Source Institution */}
                        <div>
                          <Label htmlFor="sourceInstitution">Tên trường/sở *</Label>
                          <Controller
                            name="sourceInstitution"
                            control={control}
                            rules={examType === ExamType.OFFICIAL ? validationRules.sourceInstitution : {}}
                            render={({ field }) => (
                              <Input
                                {...field}
                                id="sourceInstitution"
                                placeholder="VD: THPT Nguyễn Du"
                                className={errors.sourceInstitution ? 'border-red-500' : ''}
                              />
                            )}
                          />
                          {errors.sourceInstitution && (
                            <p className="text-sm text-red-600 mt-1">{errors.sourceInstitution.message}</p>
                          )}
                        </div>
                        
                        {/* Exam Year */}
                        <div>
                          <Label htmlFor="examYear">Năm thi *</Label>
                          <Controller
                            name="examYear"
                            control={control}
                            rules={examType === ExamType.OFFICIAL ? validationRules.examYear : {}}
                            render={({ field }) => (
                              <Input
                                {...field}
                                id="examYear"
                                placeholder="VD: 2024"
                                className={errors.examYear ? 'border-red-500' : ''}
                              />
                            )}
                          />
                          {errors.examYear && (
                            <p className="text-sm text-red-600 mt-1">{errors.examYear.message}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Exam Code */}
                      <div>
                        <Label htmlFor="examCode">Mã đề (tùy chọn)</Label>
                        <Controller
                          name="examCode"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              id="examCode"
                              placeholder="VD: 001, A, B..."
                            />
                          )}
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            <SelectedQuestionsPreview
              questions={selectedQuestions}
              onQuestionUpdate={handleQuestionUpdate}
              onQuestionRemove={handleQuestionRemove}
              onQuestionsReorder={handleQuestionsReorder}
              onOpenSelector={() => setIsQuestionSelectorOpen(true)}
              allowEdit={!loading && !submitting}
            />
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt đề thi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Duration and Points */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="durationMinutes">Thời gian (phút) *</Label>
                    <Controller
                      name="durationMinutes"
                      control={control}
                      rules={validationRules.durationMinutes}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="durationMinutes"
                          type="number"
                          min="1"
                          max="480"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className={errors.durationMinutes ? 'border-red-500' : ''}
                        />
                      )}
                    />
                    {errors.durationMinutes && (
                      <p className="text-sm text-red-600 mt-1">{errors.durationMinutes.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="totalPoints">Tổng điểm *</Label>
                    <Controller
                      name="totalPoints"
                      control={control}
                      rules={validationRules.totalPoints}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="totalPoints"
                          type="number"
                          min="1"
                          max="1000"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className={errors.totalPoints ? 'border-red-500' : ''}
                        />
                      )}
                    />
                    {errors.totalPoints && (
                      <p className="text-sm text-red-600 mt-1">{errors.totalPoints.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="passPercentage">Điểm đạt (%) *</Label>
                    <Controller
                      name="passPercentage"
                      control={control}
                      rules={validationRules.passPercentage}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="passPercentage"
                          type="number"
                          min="0"
                          max="100"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className={errors.passPercentage ? 'border-red-500' : ''}
                        />
                      )}
                    />
                    {errors.passPercentage && (
                      <p className="text-sm text-red-600 mt-1">{errors.passPercentage.message}</p>
                    )}
                  </div>
                </div>
                
                {/* Max Attempts */}
                <div>
                  <Label htmlFor="maxAttempts">Số lần làm bài tối đa *</Label>
                  <Controller
                    name="maxAttempts"
                    control={control}
                    rules={validationRules.maxAttempts}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="maxAttempts"
                        type="number"
                        min="1"
                        max="10"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className={cn("max-w-xs", errors.maxAttempts ? 'border-red-500' : '')}
                      />
                    )}
                  />
                  {errors.maxAttempts && (
                    <p className="text-sm text-red-600 mt-1">{errors.maxAttempts.message}</p>
                  )}
                </div>
                
                <Separator />
                
                {/* Exam Options */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Tùy chọn đề thi</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="shuffleQuestions">Xáo trộn câu hỏi</Label>
                        <p className="text-sm text-gray-600">Thay đổi thứ tự câu hỏi cho mỗi học sinh</p>
                      </div>
                      <Controller
                        name="shuffleQuestions"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            id="shuffleQuestions"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="showResults">Hiển thị kết quả</Label>
                        <p className="text-sm text-gray-600">Cho phép học sinh xem kết quả sau khi nộp bài</p>
                      </div>
                      <Controller
                        name="showResults"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            id="showResults"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Metadata Tab */}
          <TabsContent value="metadata" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Phân loại học thuật</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Subject and Grade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Môn học *</Label>
                    <Controller
                      name="subject"
                      control={control}
                      rules={validationRules.subject}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={errors.subject ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Chọn môn học" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUBJECTS.map(subject => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.subject && (
                      <p className="text-sm text-red-600 mt-1">{errors.subject.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="grade">Khối lớp</Label>
                    <Controller
                      name="grade"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value?.toString() || ''} onValueChange={(value) => field.onChange(value === '' ? undefined : parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn khối lớp" />
                          </SelectTrigger>
                          <SelectContent>
                            {GRADES.map(grade => (
                              <SelectItem key={grade} value={grade.toString()}>
                                Lớp {grade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
                
                {/* Difficulty */}
                <div>
                  <Label htmlFor="difficulty">Độ khó</Label>
                  <Controller
                    name="difficulty"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DIFFICULTIES.map(difficulty => (
                            <SelectItem key={difficulty.value} value={difficulty.value}>
                              {difficulty.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                
                {/* Tags */}
                <div>
                  <Label htmlFor="tags">Thẻ phân loại</Label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Nhập thẻ mới..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddTag}
                        disabled={!newTag.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center space-x-1"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Status */}
                <div>
                  <Label htmlFor="status">Trạng thái</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EXAM_STATUSES.map(status => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>

      {/* Question Selector Modal */}
      <QuestionSelector
        open={isQuestionSelectorOpen}
        onClose={() => setIsQuestionSelectorOpen(false)}
        onConfirm={handleQuestionSelection}
        initialSelected={selectedQuestions}
        maxQuestions={100}
        minQuestions={1}
        defaultPoints={1}
      />
    </div>
  );
}
