'use client';

import {
  HelpCircle,
  Save,
  X,
  Plus,
  Trash2,
  Eye,
  Settings,
  AlertCircle
} from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/form/button';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import { Textarea } from "@/components/ui/form/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form/select';
import {
  useQuestionForm,
  useQuestionValidation,
  useQuestionTypeHandlers
} from '@/hooks';
import { type CreateQuestionFormValues } from '@/lib/validation/question-schemas';

/**
 * Question Form Component
 * 
 * Component form để tạo/chỉnh sửa câu hỏi
 * Placeholder component - cần implement đầy đủ functionality
 */

interface QuestionFormProps {
  QuestionID?: string;
  initialData?: Partial<CreateQuestionFormValues>;
  onSave?: (data: CreateQuestionFormValues) => void;
  onCancel?: () => void;
}

function QuestionForm({ QuestionID, initialData, onSave, onCancel }: QuestionFormProps): JSX.Element {
  const isEditing = !!QuestionID;

  // Use custom hooks for form management
  const {
    form,
    questionType,
    isSubmitting,
    submitError,
    optionFields,
    correctAnswerFields,
    addOption,
    removeOption,
    addcorrectAnswer,
    removecorrectAnswerByIndex,
    handleSubmit,
    isValid,
    errors
  } = useQuestionForm({ initialData, onSave });

  // Use validation hook
  const {
    formatFieldError,
    isFieldRequired
  } = useQuestionValidation({ questionType });

  // Use type handlers hook
  const {
    currentTypeConfig,
    shouldShowField,
    getFieldPlaceholder,
    getFieldLabel,
    handleTypeChange
  } = useQuestionTypeHandlers({
    questionType,
    setValue: form.setValue,
    watch: form.watch
  });

  const { control } = form;

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 max-w-4xl">
      <Card className="shadow-sm sm:shadow-md">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
            <div className="space-y-1">
              <CardTitle className="text-lg sm:text-xl md:text-2xl">
                {isEditing ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới'}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                {isEditing
                  ? 'Cập nhật thông tin câu hỏi'
                  : 'Điền thông tin để tạo câu hỏi mới'
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Error Alert */}
          {submitError && (
            <Alert variant="destructive" className="mb-4 sm:mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm sm:text-base">{submitError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Question Type */}
              <FormField
                control={control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{getFieldLabel('type')} *</FormLabel>
                    <Select onValueChange={handleTypeChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại câu hỏi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currentTypeConfig && (
                          <>
                            <SelectItem value="MC">Trắc nghiệm (Multiple Choice)</SelectItem>
                            <SelectItem value="TF">Đúng/Sai (True/False)</SelectItem>
                            <SelectItem value="SA">Câu trả lời ngắn (Short Answer)</SelectItem>
                            <SelectItem value="ES">Tự luận (Essay)</SelectItem>
                            <SelectItem value="MA">Nhiều đáp án (Multiple Answer)</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {currentTypeConfig.description}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Question Content */}
              <FormField
                control={control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{getFieldLabel('content')} *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={getFieldPlaceholder('content')}
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Nội dung chính của câu hỏi (10-2000 ký tự)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditional Fields Based on Question Type */}
              {shouldShowField('options') && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>{getFieldLabel('options')} *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                      disabled={optionFields.length >= 6}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm lựa chọn
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {optionFields.map((field, index) => (
                      <FormField
                        key={field.id}
                        control={control}
                        name={`options.${index}`}
                        render={({ field: inputField }) => (
                          <FormItem>
                            <div className="flex items-center space-x-3">
                              <FormField
                                control={control}
                                name="correctAnswer"
                                render={({ field: radioField }) => (
                                  <FormControl>
                                    <input
                                      type="radio"
                                      checked={radioField.value === index}
                                      onChange={() => radioField.onChange(index)}
                                      className="text-primary"
                                    />
                                  </FormControl>
                                )}
                              />
                              <Label className="text-sm font-medium">
                                {String.fromCharCode(65 + index)}
                              </Label>
                              <FormControl>
                                <Input
                                  {...inputField}
                                  placeholder={`Lựa chọn ${String.fromCharCode(65 + index)}`}
                                  className="flex-1"
                                />
                              </FormControl>
                              {optionFields.length > 2 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeOption(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}

              {shouldShowField('correctAnswer') && questionType === 'TF' && (
                <FormField
                  control={control}
                  name="correctAnswer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{getFieldLabel('correctAnswer')} *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={getFieldPlaceholder('correctAnswer')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Đúng</SelectItem>
                          <SelectItem value="false">Sai</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {shouldShowField('correctAnswer') && questionType === 'SA' && (
                <FormField
                  control={control}
                  name="correctAnswer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đáp án đúng *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nhập đáp án đúng..."
                          value={field.value as string || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Đáp án chính xác cho câu hỏi trả lời ngắn
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {shouldShowField('rubric') && (
                <FormField
                  control={control}
                  name="rubric"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu chí chấm điểm</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Nhập tiêu chí chấm điểm cho câu hỏi tự luận..."
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormDescription>
                        Hướng dẫn chấm điểm cho câu hỏi tự luận
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Additional Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <FormField
                  control={control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Độ khó</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-9 sm:h-10">
                            <SelectValue placeholder="Chọn độ khó" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EASY">Dễ</SelectItem>
                          <SelectItem value="MEDIUM">Trung bình</SelectItem>
                          <SelectItem value="HARD">Khó</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Điểm số</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="10"
                          className="h-9 sm:h-10"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="timeLimit"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2 lg:col-span-1">
                      <FormLabel className="text-sm sm:text-base">Thời gian (giây)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="10"
                          max="3600"
                          className="h-9 sm:h-10"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Solution */}
              <FormField
                control={control}
                name="solution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lời giải</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Nhập lời giải chi tiết..."
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormDescription>
                      Lời giải chi tiết cho câu hỏi (tùy chọn)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Source */}
              <FormField
                control={control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nguồn</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nguồn câu hỏi (sách, đề thi, v.v.)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 pt-4 sm:pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="order-2 sm:order-1 h-9 sm:h-10"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                  <span className="text-sm sm:text-base">Hủy</span>
                </Button>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 order-1 sm:order-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    className="h-9 sm:h-10"
                  >
                    <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                    <span className="text-sm sm:text-base">Xem trước</span>
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    className="h-9 sm:h-10"
                  >
                    {isSubmitting ? (
                      <>
                        <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 animate-spin" />
                        <span className="text-sm sm:text-base">Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                        <span className="text-sm sm:text-base">
                          {isEditing ? 'Cập nhật' : 'Tạo câu hỏi'}
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default QuestionForm;
