/**
 * Question Form Component
 * =======================
 * Form component for creating and editing questions
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { 
  Question, 
  CreateQuestionRequest, 
  UpdateQuestionRequest,
  QuestionType, 
  QuestionStatus, 
  QuestionDifficulty,
  Answer
} from '@/types/question.types';
import { QuestionHelpers } from '@/services/grpc/question.service';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons
import {
  Plus,
  Trash2,
  Save,
  X,
  CheckCircle,
  Eye,
  FileText,
  Settings,
  Tags,
  Loader2
} from 'lucide-react';

// ========================================
// INTERFACES
// ========================================

interface QuestionFormData {
  raw_content: string;
  content: string;
  subcount: string;
  type: QuestionType;
  source: string;
  solution?: string;
  tag: string[];
  question_code_id: string;
  status: QuestionStatus;
  difficulty: QuestionDifficulty;
  creator: string;
  
  // Answer data
  answers: Answer[];
  correct_answers: string[]; // For multiple choice
  correct_answer_text?: string; // For short answer
}

interface QuestionFormProps {
  question?: Question; // For edit mode
  onSave: (data: CreateQuestionRequest | UpdateQuestionRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

// ========================================
// CONSTANTS
// ========================================

const DEFAULT_FORM_VALUES: Partial<QuestionFormData> = {
  type: 'MC',
  status: 'ACTIVE',
  difficulty: 'MEDIUM',
  source: '',
  subcount: '',
  tag: [],
  answers: [
    { id: '1', content: '', is_correct: false },
    { id: '2', content: '', is_correct: false },
    { id: '3', content: '', is_correct: false },
    { id: '4', content: '', is_correct: false },
  ],
  correct_answers: []
};

// ========================================
// MAIN COMPONENT
// ========================================

export const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  onSave,
  onCancel,
  isLoading = false,
  className = ''
}) => {
  // Form state
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<QuestionFormData>({
    defaultValues: question ? {
      raw_content: question.raw_content,
      content: question.content,
      subcount: question.subcount,
      type: question.type,
      source: question.source,
      solution: question.solution,
      tag: question.tag || [],
      question_code_id: question.question_code_id,
      status: question.status,
      difficulty: question.difficulty,
      creator: question.creator,
      answers: question.structured_answers || DEFAULT_FORM_VALUES.answers!,
      correct_answers: [],
    } : DEFAULT_FORM_VALUES
  });

  const { fields: answerFields, append: appendAnswer, remove: removeAnswer } = useFieldArray({
    control,
    name: 'answers'
  });

  // Local state
  const [activeTab, setActiveTab] = useState('content');
  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // Watched values
  const questionType = watch('type');
  const currentAnswers = watch('answers');
  const currentTags = watch('tag');

  // ===== EFFECTS =====

  useEffect(() => {
    // Adjust answers based on question type
    if (questionType === 'TF') {
      // True/False questions need exactly 2 answers
      const currentLength = currentAnswers?.length || 0;
      if (currentLength > 2) {
        for (let i = currentLength - 1; i >= 2; i--) {
          removeAnswer(i);
        }
      } else if (currentLength < 2) {
        appendAnswer({ id: '1', content: 'Đúng', is_correct: false });
        appendAnswer({ id: '2', content: 'Sai', is_correct: false });
      } else {
        // Update existing answers
        setValue('answers.0.content', 'Đúng');
        setValue('answers.1.content', 'Sai');
      }
    } else if (questionType === 'MC' || questionType === 'MA') {
      // Multiple choice needs at least 2 answers
      const currentLength = currentAnswers?.length || 0;
      if (currentLength < 2) {
        for (let i = currentLength; i < 4; i++) {
          appendAnswer({ id: (i + 1).toString(), content: '', is_correct: false });
        }
      }
    }
  }, [questionType, currentAnswers?.length, appendAnswer, removeAnswer, setValue]);

  // ===== HANDLERS =====

  const handleAddAnswer = () => {
    const newId = (currentAnswers.length + 1).toString();
    appendAnswer({ id: newId, content: '', is_correct: false });
  };

  const handleRemoveAnswer = (index: number) => {
    if (currentAnswers.length > 2) {
      removeAnswer(index);
    }
  };

  const handleCorrectAnswerChange = (index: number, isCorrect: boolean) => {
    setValue(`answers.${index}.is_correct`, isCorrect);

    if (questionType === 'MC' || questionType === 'TF') {
      // Single correct answer - uncheck others
      if (isCorrect) {
        currentAnswers.forEach((_, i) => {
          if (i !== index) {
            setValue(`answers.${i}.is_correct`, false);
          }
        });
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
      const newTags = [...currentTags, tagInput.trim()];
      setValue('tag', newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = currentTags.filter(tag => tag !== tagToRemove);
    setValue('tag', newTags);
  };

  const onSubmit = async (data: QuestionFormData) => {
    try {
      // Prepare request data
      const requestData: CreateQuestionRequest | UpdateQuestionRequest = {
        ...(question && { id: question.id }), // Add ID for update
        raw_content: data.raw_content,
        content: data.content || data.raw_content, // Use raw_content if content is empty
        subcount: data.subcount,
        type: data.type,
        source: data.source,
        solution: data.solution,
        tag: data.tag,
        question_code_id: data.question_code_id || 'DEFAULT', // Use default if empty
        status: data.status,
        difficulty: data.difficulty,
        creator: data.creator,
        structured_answers: data.answers.filter(answer => answer.content.trim() !== ''),
      };

      await onSave(requestData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // ===== VALIDATION HELPERS =====

  const isFormValid = () => {
    const values = getValues();
    return values.raw_content?.trim() && 
           values.type && 
           values.answers?.some(answer => answer.content.trim() !== '');
  };

  // ===== PREVIEW RENDER =====

  const renderPreview = () => {
    const values = getValues();
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Xem trước câu hỏi</span>
              <Badge variant="outline">{QuestionHelpers.getTypeDisplayName(values.type)}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Nội dung câu hỏi:</h4>
              <div className="p-3 bg-muted rounded-md">
                {values.content || values.raw_content || 'Chưa có nội dung'}
              </div>
            </div>

            {values.answers && values.answers.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Đáp án:</h4>
                <div className="space-y-2">
                  {values.answers.map((answer, index) => (
                    answer.content.trim() && (
                      <div 
                        key={index} 
                        className={`p-2 rounded border ${answer.is_correct ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{String.fromCharCode(65 + index)}.</span>
                          <span>{answer.content}</span>
                          {answer.is_correct && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {values.solution && (
              <div>
                <h4 className="font-medium mb-2">Lời giải:</h4>
                <div className="p-3 bg-muted rounded-md">
                  {values.solution}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // ===== MAIN RENDER =====

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {question ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới'}
          </h2>
          <p className="text-muted-foreground">
            {question ? `ID: ${question.id}` : 'Điền thông tin để tạo câu hỏi mới'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Chỉnh sửa' : 'Xem trước'}
          </Button>
        </div>
      </div>

      {previewMode ? (
        renderPreview()
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content">
                <FileText className="h-4 w-4 mr-2" />
                Nội dung
              </TabsTrigger>
              <TabsTrigger value="answers">
                <CheckCircle className="h-4 w-4 mr-2" />
                Đáp án
              </TabsTrigger>
              <TabsTrigger value="metadata">
                <Settings className="h-4 w-4 mr-2" />
                Thông tin
              </TabsTrigger>
              <TabsTrigger value="tags">
                <Tags className="h-4 w-4 mr-2" />
                Tags
              </TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Nội dung câu hỏi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="raw_content">Nội dung gốc (LaTeX/Raw)</Label>
                    <Textarea
                      id="raw_content"
                      placeholder="Nhập nội dung câu hỏi (có thể chứa LaTeX)..."
                      className="min-h-32"
                      {...register('raw_content', { required: 'Nội dung câu hỏi là bắt buộc' })}
                    />
                    {errors.raw_content && (
                      <p className="text-sm text-red-500 mt-1">{errors.raw_content.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="content">Nội dung đã xử lý (tùy chọn)</Label>
                    <Textarea
                      id="content"
                      placeholder="Nội dung đã được xử lý/làm sạch (để trống sẽ dùng nội dung gốc)..."
                      className="min-h-24"
                      {...register('content')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="solution">Lời giải (tùy chọn)</Label>
                    <Textarea
                      id="solution"
                      placeholder="Lời giải chi tiết cho câu hỏi..."
                      className="min-h-24"
                      {...register('solution')}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Answers Tab */}
            <TabsContent value="answers" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Đáp án</CardTitle>
                  {(questionType === 'MC' || questionType === 'MA') && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddAnswer}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm đáp án
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {answerFields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex items-center gap-2 min-w-fit">
                        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <Controller
                          control={control}
                          name={`answers.${index}.is_correct`}
                          render={({ field: checkField }) => (
                            <input
                              type="checkbox"
                              checked={checkField.value}
                              onChange={(e) => handleCorrectAnswerChange(index, e.target.checked)}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                          )}
                        />
                      </div>
                      
                      <div className="flex-1">
                        <Input
                          placeholder={`Đáp án ${String.fromCharCode(65 + index)}`}
                          {...register(`answers.${index}.content`, {
                            required: index < 2 ? 'Đáp án là bắt buộc' : false
                          })}
                        />
                        {errors.answers?.[index]?.content && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.answers[index]?.content?.message}
                          </p>
                        )}
                      </div>

                      {currentAnswers.length > 2 && (questionType === 'MC' || questionType === 'MA') && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveAnswer(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {questionType === 'SA' && (
                    <div className="mt-4">
                      <Label htmlFor="correct_answer_text">Đáp án đúng (cho câu hỏi trả lời ngắn)</Label>
                      <Input
                        id="correct_answer_text"
                        placeholder="Nhập đáp án đúng..."
                        {...register('correct_answer_text')}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Metadata Tab */}
            <TabsContent value="metadata" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin câu hỏi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Loại câu hỏi</Label>
                      <Controller
                        control={control}
                        name="type"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {QuestionHelpers.getTypeOptions().map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div>
                      <Label htmlFor="difficulty">Độ khó</Label>
                      <Controller
                        control={control}
                        name="difficulty"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {QuestionHelpers.getDifficultyOptions().map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div>
                      <Label htmlFor="status">Trạng thái</Label>
                      <Controller
                        control={control}
                        name="status"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {QuestionHelpers.getStatusOptions().map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div>
                      <Label htmlFor="source">Nguồn</Label>
                      <Input
                        id="source"
                        placeholder="Ví dụ: SGK Toán 12, Đề thi thử..."
                        {...register('source')}
                      />
                    </div>

                    <div>
                      <Label htmlFor="subcount">Subcount</Label>
                      <Input
                        id="subcount"
                        placeholder="Ví dụ: [XX.N]"
                        {...register('subcount')}
                      />
                    </div>

                    <div>
                      <Label htmlFor="creator">Người tạo</Label>
                      <Input
                        id="creator"
                        placeholder="Tên người tạo câu hỏi"
                        {...register('creator')}
                      />
                    </div>

                    <div>
                      <Label htmlFor="question_code_id">Mã câu hỏi</Label>
                      <Input
                        id="question_code_id"
                        placeholder="Mã phân loại câu hỏi"
                        {...register('question_code_id')}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tags Tab */}
            <TabsContent value="tags" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nhập tag mới..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {currentTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {currentTags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
            >
              Hủy
            </Button>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting || isLoading || !isFormValid()}
              >
                {(isSubmitting || isLoading) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                <Save className="h-4 w-4 mr-2" />
                {question ? 'Cập nhật' : 'Tạo câu hỏi'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default QuestionForm;