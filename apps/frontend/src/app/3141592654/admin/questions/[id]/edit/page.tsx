'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Eye, FileText, Map, Loader2, AlertTriangle } from 'lucide-react';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Alert,
  AlertDescription
} from '@/components/ui';
import { useToast } from '@/components/ui/feedback/use-toast';
import { ErrorBoundary } from '@/components/ui/feedback/error-boundary';

import { 
  Question,
  QuestionDraft, 
  QuestionType, 
  QuestionDifficulty,
  AnswerOption 
} from '@/lib/types/question';
import { MockQuestionsService } from '@/lib/services/mock/questions';
import { ADMIN_PATHS } from '@/lib/admin-paths';

/**
 * Edit Question Page
 * Trang chỉnh sửa câu hỏi với form tabs tương tự create page
 */
export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const questionId = params.id as string;

  // State cho question data
  const [originalQuestion, setOriginalQuestion] = useState<Question | null>(null);
  const [questionDraft, setQuestionDraft] = useState<QuestionDraft>({
    content: '',
    type: QuestionType.MC,
    difficulty: QuestionDifficulty.MEDIUM,
    tags: [],
    timeLimit: 300,
    points: 10,
    answers: []
  });

  // State cho UI
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  /**
   * Load question data từ mock service
   */
  const loadQuestionData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const response = await MockQuestionsService.getQuestion(questionId);

      if (response.error) {
        setLoadError(response.error);
        return;
      }

      if (response.data) {
        setOriginalQuestion(response.data);

        // Convert Question to QuestionDraft
        setQuestionDraft({
          content: response.data.content,
          rawContent: response.data.rawContent,
          type: response.data.type,
          difficulty: response.data.difficulty,
          category: '', // Not in Question interface
          tags: response.data.tag,
          timeLimit: 300, // Default value
          points: 10, // Default value
          explanation: response.data.solution,
          answers: response.data.answers as AnswerOption[],
          source: response.data.source,
          questionCodeId: response.data.questionCodeId
        });
      }
    } catch (error) {
      console.error('Lỗi khi tải câu hỏi:', error);
      setLoadError('Không thể tải dữ liệu câu hỏi');
    } finally {
      setIsLoading(false);
    }
  }, [questionId]);

  /**
   * Load question data khi component mount
   */
  useEffect(() => {
    loadQuestionData();
  }, [loadQuestionData]);

  /**
   * Handle form field changes
   */
  const handleFieldChange = (field: keyof QuestionDraft, value: unknown) => {
    setQuestionDraft(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors khi user thay đổi
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  /**
   * Handle answer options changes cho multiple choice
   */
  const handleAnswerChange = (index: number, field: keyof AnswerOption, value: unknown) => {
    const newAnswers = [...(questionDraft.answers as AnswerOption[] || [])];
    if (newAnswers[index]) {
      newAnswers[index] = { ...newAnswers[index], [field]: value };
      handleFieldChange('answers', newAnswers);
    }
  };

  /**
   * Add new answer option
   */
  const addAnswerOption = () => {
    const newAnswers = [...(questionDraft.answers as AnswerOption[] || [])];
    newAnswers.push({
      id: `opt-${Date.now()}`,
      content: '',
      isCorrect: false
    });
    handleFieldChange('answers', newAnswers);
  };

  /**
   * Remove answer option
   */
  const removeAnswerOption = (index: number) => {
    const newAnswers = [...(questionDraft.answers as AnswerOption[] || [])];
    newAnswers.splice(index, 1);
    handleFieldChange('answers', newAnswers);
  };

  /**
   * Validate form data
   */
  const validateForm = (): string[] => {
    const validationErrors: string[] = [];

    if (!questionDraft.content.trim()) {
      validationErrors.push('Nội dung câu hỏi không được để trống');
    }

    if (questionDraft.content.length > 1000) {
      validationErrors.push('Nội dung câu hỏi không được vượt quá 1000 ký tự');
    }

    if (questionDraft.type === QuestionType.MC) {
      const answers = questionDraft.answers as AnswerOption[] || [];
      if (answers.length < 2) {
        validationErrors.push('Câu hỏi trắc nghiệm phải có ít nhất 2 đáp án');
      }

      const correctAnswers = answers.filter(a => a.isCorrect);
      if (correctAnswers.length === 0) {
        validationErrors.push('Phải có ít nhất 1 đáp án đúng');
      }

      const emptyAnswers = answers.filter(a => !a.content.trim());
      if (emptyAnswers.length > 0) {
        validationErrors.push('Tất cả đáp án phải có nội dung');
      }
    }

    return validationErrors;
  };

  /**
   * Handle update question
   */
  const handleUpdateQuestion = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSaving(true);

      // Prepare update data
      const updateData = {
        content: questionDraft.content,
        rawContent: questionDraft.rawContent || questionDraft.content,
        type: questionDraft.type,
        difficulty: questionDraft.difficulty,
        tag: questionDraft.tags || [],
        solution: questionDraft.explanation,
        answers: questionDraft.answers,
        source: questionDraft.source,
        questionCodeId: questionDraft.questionCodeId || originalQuestion?.questionCodeId
      };

      await MockQuestionsService.updateQuestion(questionId, updateData);

      toast({
        title: 'Thành công',
        description: 'Câu hỏi đã được cập nhật thành công',
        variant: 'success'
      });

      router.push(ADMIN_PATHS.QUESTIONS);
    } catch (error) {
      console.error('Lỗi khi cập nhật câu hỏi:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật câu hỏi',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle LaTeX parsing
   */
  const handleLatexParse = async (latexContent: string) => {
    try {
      const result = await MockQuestionsService.parseLatexContent(latexContent);
      if (result.data) {
        setQuestionDraft(prev => ({
          ...prev,
          ...result.data,
          rawContent: latexContent
        }));
        toast({
          title: 'Thành công',
          description: 'Đã phân tích LaTeX thành công',
          variant: 'success'
        });
      } else if (result.error) {
        toast({
          title: 'Lỗi',
          description: result.error,
          variant: 'destructive'
        });
      }
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể phân tích LaTeX',
        variant: 'destructive'
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Đang tải câu hỏi...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không thể tải câu hỏi
          </h3>
          <p className="text-gray-600 mb-4">{loadError}</p>
          <div className="flex gap-2">
            <Button onClick={loadQuestionData}>
              Thử lại
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa câu hỏi</h1>
              <p className="text-gray-600 mt-1">
                ID: {questionId}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveTab('preview')}>
              <Eye className="h-4 w-4 mr-2" />
              Xem trước
            </Button>
            <Button 
              onClick={handleUpdateQuestion}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Cập nhật câu hỏi
            </Button>
          </div>
        </div>

        {/* Validation errors */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Form tabs - Sử dụng lại logic từ create page */}
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b">
                <TabsList className="w-full justify-start rounded-none h-auto p-0 bg-transparent">
                  <TabsTrigger 
                    value="basic" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
                  >
                    Thông tin cơ bản
                  </TabsTrigger>
                  <TabsTrigger 
                    value="answers"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
                  >
                    Đáp án
                  </TabsTrigger>
                  <TabsTrigger 
                    value="latex"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    LaTeX
                  </TabsTrigger>
                  <TabsTrigger 
                    value="mapid"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
                  >
                    <Map className="h-4 w-4 mr-2" />
                    Map ID
                  </TabsTrigger>
                  <TabsTrigger 
                    value="preview"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Xem trước
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Basic tab */}
              <TabsContent value="basic" className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Question content */}
                  <div className="md:col-span-2">
                    <Label htmlFor="content">Nội dung câu hỏi *</Label>
                    <Textarea
                      id="content"
                      placeholder="Nhập nội dung câu hỏi..."
                      value={questionDraft.content}
                      onChange={(e) => handleFieldChange('content', e.target.value)}
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  {/* Question type */}
                  <div>
                    <Label htmlFor="type">Loại câu hỏi *</Label>
                    <Select 
                      value={questionDraft.type} 
                      onValueChange={(value) => handleFieldChange('type', value as QuestionType)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={QuestionType.MC}>Trắc nghiệm</SelectItem>
                        <SelectItem value={QuestionType.TF}>Đúng/Sai</SelectItem>
                        <SelectItem value={QuestionType.SA}>Tự luận ngắn</SelectItem>
                        <SelectItem value={QuestionType.ES}>Tự luận</SelectItem>
                        <SelectItem value={QuestionType.MA}>Ghép đôi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <Label htmlFor="difficulty">Độ khó</Label>
                    <Select 
                      value={questionDraft.difficulty} 
                      onValueChange={(value) => handleFieldChange('difficulty', value as QuestionDifficulty)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={QuestionDifficulty.EASY}>Dễ</SelectItem>
                        <SelectItem value={QuestionDifficulty.MEDIUM}>Trung bình</SelectItem>
                        <SelectItem value={QuestionDifficulty.HARD}>Khó</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Source */}
                  <div className="md:col-span-2">
                    <Label htmlFor="source">Nguồn</Label>
                    <Input
                      id="source"
                      placeholder="Nguồn câu hỏi (sách, đề thi, ...)"
                      value={questionDraft.source || ''}
                      onChange={(e) => handleFieldChange('source', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* Explanation */}
                  <div className="md:col-span-2">
                    <Label htmlFor="explanation">Giải thích</Label>
                    <Textarea
                      id="explanation"
                      placeholder="Giải thích đáp án..."
                      value={questionDraft.explanation || ''}
                      onChange={(e) => handleFieldChange('explanation', e.target.value)}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Answers tab */}
              <TabsContent value="answers" className="p-6 space-y-6">
                {questionDraft.type === QuestionType.MC && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Đáp án trắc nghiệm</h3>
                      <Button onClick={addAnswerOption} size="sm">
                        Thêm đáp án
                      </Button>
                    </div>

                    {(questionDraft.answers as AnswerOption[] || []).map((answer, index) => (
                      <div key={answer.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={answer.isCorrect || false}
                            onChange={(e) => {
                              // Uncheck all others first
                              const newAnswers = [...(questionDraft.answers as AnswerOption[] || [])];
                              newAnswers.forEach(a => a.isCorrect = false);
                              // Check current one
                              newAnswers[index].isCorrect = e.target.checked;
                              handleFieldChange('answers', newAnswers);
                            }}
                            className="mr-2"
                          />
                          <Label className="text-sm font-medium">
                            {String.fromCharCode(65 + index)}
                          </Label>
                        </div>
                        <Input
                          placeholder={`Đáp án ${String.fromCharCode(65 + index)}`}
                          value={answer.content}
                          onChange={(e) => handleAnswerChange(index, 'content', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeAnswerOption(index)}
                          disabled={(questionDraft.answers as AnswerOption[] || []).length <= 2}
                        >
                          Xóa
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {questionDraft.type !== QuestionType.MC && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Loại câu hỏi này không cần thiết lập đáp án trắc nghiệm.</p>
                  </div>
                )}
              </TabsContent>

              {/* LaTeX tab */}
              <TabsContent value="latex" className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="latexContent">Nội dung LaTeX</Label>
                    <Textarea
                      id="latexContent"
                      placeholder="Nhập nội dung LaTeX..."
                      value={questionDraft.rawContent || ''}
                      onChange={(e) => handleFieldChange('rawContent', e.target.value)}
                      rows={8}
                      className="mt-1 font-mono"
                    />
                  </div>
                  <Button 
                    onClick={() => handleLatexParse(questionDraft.rawContent || '')}
                    disabled={!questionDraft.rawContent?.trim()}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Phân tích LaTeX
                  </Button>
                </div>
              </TabsContent>

              {/* MapID tab */}
              <TabsContent value="mapid" className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="questionCodeId">Mã câu hỏi (Question Code ID)</Label>
                    <Input
                      id="questionCodeId"
                      placeholder="Ví dụ: 0P1VH1"
                      value={questionDraft.questionCodeId || ''}
                      onChange={(e) => handleFieldChange('questionCodeId', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Format: [Grade][Subject][Chapter][Lesson][Form][Level]</p>
                    <p>Ví dụ: 0P1VH1 = Lớp 10, Toán, Chương 1, Bài V, Dạng 1, Thông hiểu</p>
                  </div>
                </div>
              </TabsContent>

              {/* Preview tab */}
              <TabsContent value="preview" className="p-6">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Xem trước câu hỏi</h3>
                  
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {questionDraft.content || 'Chưa có nội dung câu hỏi'}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            {questionDraft.type === QuestionType.MC && 'Trắc nghiệm'}
                            {questionDraft.type === QuestionType.TF && 'Đúng/Sai'}
                            {questionDraft.type === QuestionType.SA && 'Tự luận ngắn'}
                            {questionDraft.type === QuestionType.ES && 'Tự luận'}
                            {questionDraft.type === QuestionType.MA && 'Ghép đôi'}
                          </Badge>
                          {questionDraft.difficulty && (
                            <Badge variant="outline">
                              {questionDraft.difficulty === QuestionDifficulty.EASY && 'Dễ'}
                              {questionDraft.difficulty === QuestionDifficulty.MEDIUM && 'Trung bình'}
                              {questionDraft.difficulty === QuestionDifficulty.HARD && 'Khó'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {questionDraft.type === QuestionType.MC && (
                        <div className="space-y-2">
                          {(questionDraft.answers as AnswerOption[] || []).map((answer, index) => (
                            <div 
                              key={answer.id} 
                              className={`p-3 border rounded ${answer.isCorrect ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}
                            >
                              <span className="font-medium mr-2">
                                {String.fromCharCode(65 + index)}.
                              </span>
                              {answer.content || `Đáp án ${String.fromCharCode(65 + index)}`}
                              {answer.isCorrect && (
                                <Badge className="ml-2 bg-green-600">Đúng</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {questionDraft.explanation && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                          <h4 className="font-medium text-blue-900 mb-2">Giải thích:</h4>
                          <p className="text-blue-800">{questionDraft.explanation}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}
