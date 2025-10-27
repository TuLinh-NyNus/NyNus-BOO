'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Save, Eye, Loader2, Copy } from 'lucide-react';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Alert,
  AlertDescription,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Skeleton,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui';
import { useToast } from '@/components/ui/feedback/use-toast';
import { ErrorBoundary } from '@/components/common/error-boundary';

// Import LaTeXEditor component
import { LaTeXEditor } from '@/components/admin/questions/forms/latex-editor';

import {
  Question,
  QuestionType,
  QuestionDifficulty,
  AnswerOption
} from '@/types/question';
import { QuestionLatexService } from '@/services/grpc/question-latex.service';
import { ADMIN_PATHS } from '@/lib/admin-paths';

/**
 * Input LaTeX Questions Page
 * Trang nhập câu hỏi bằng LaTeX với preview và parse functionality
 */
export default function InputLatexQuestionsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // State cho LaTeX input
  const [latexContent, setLatexContent] = useState('');
  const [parsedQuestion, setParsedQuestion] = useState<Partial<Question> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(true);
  const [isQuestionCreated, setIsQuestionCreated] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('latex-question-draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.content && parsed.timestamp) {
          // Only load if less than 7 days old
          const daysSinceLastEdit = (Date.now() - parsed.timestamp) / (1000 * 60 * 60 * 24);
          if (daysSinceLastEdit < 7) {
            setLatexContent(parsed.content);
            toast({
              title: 'Đã khôi phục bản nháp',
              description: 'Đã tải lại nội dung bản nháp từ lần trước',
              variant: 'default'
            });
          }
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, [toast]);

  // Auto-save draft to localStorage (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (latexContent.trim()) {
        try {
          localStorage.setItem('latex-question-draft', JSON.stringify({
            content: latexContent,
            timestamp: Date.now()
          }));
          setIsDraftSaved(true);
        } catch (error) {
          console.error('Failed to save draft:', error);
        }
      }
    }, 1000); // Debounce 1 second

    setIsDraftSaved(false);
    return () => clearTimeout(timeoutId);
  }, [latexContent]);

  /**
   * Validate parsed question
   * Returns array of validation warnings
   */
  const validateQuestion = useCallback((question: Partial<Question>): string[] => {
    const warnings: string[] = [];

    // Check if question has content
    if (!question.content || question.content.trim().length === 0) {
      warnings.push('Câu hỏi không có nội dung');
    }

    // Check question type
    if (!question.type) {
      warnings.push('Câu hỏi chưa có loại (type)');
    }

    // Validate answers for multiple choice
    if (question.type === QuestionType.MC || question.type === QuestionType.MULTIPLE_CHOICE) {
      const answers = question.answers as AnswerOption[] | undefined;
      
      if (!answers || answers.length < 2) {
        warnings.push('Câu trắc nghiệm phải có ít nhất 2 đáp án');
      }

      if (answers && !answers.some(a => a.isCorrect)) {
        warnings.push('Phải có ít nhất 1 đáp án đúng');
      }

      if (answers && answers.filter(a => a.isCorrect).length > 1) {
        warnings.push('Câu trắc nghiệm đơn chỉ nên có 1 đáp án đúng');
      }
    }

    // Check if content is too short
    if (question.content && question.content.trim().length < 10) {
      warnings.push('Nội dung câu hỏi quá ngắn (< 10 ký tự)');
    }

    // Check if content is too long
    if (question.content && question.content.length > 5000) {
      warnings.push('Nội dung câu hỏi quá dài (> 5000 ký tự)');
    }

    return warnings;
  }, []);

  // Sample LaTeX template
  const sampleLatex = `\\begin{ex}%[Nguồn: "Sách giáo khoa Toán 12"]%[2P5VN]
[TL.100022]
Tìm giá trị lớn nhất của hàm số $f(x) = x^3 - 3x^2 + 2$ trên đoạn $[0, 3]$.
\\choice
{$-2$}
{$0$}
{\\True $2$}
{$6$}
\\loigiai{
    Tính đạo hàm $f'(x) = 3x^2 - 6x = 3x(x-2)$.
    $f'(x) = 0 \\Leftrightarrow x = 0$ hoặc $x = 2$.
    Tính $f(0) = 2$, $f(2) = -2$, $f(3) = 2$.
    Vậy giá trị lớn nhất là $2$.
}
\\end{ex}`;

  /**
   * Handle LaTeX parsing (Step 1: Parse only, no creation)
   * Memoized to prevent unnecessary re-creation
   */
  const handleParseLatex = useCallback(async () => {
    if (!latexContent.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập nội dung LaTeX',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      setParseError(null);
      setIsQuestionCreated(false);

      // Use parseLatex to only parse, not create
      const result = await QuestionLatexService.parseLatex({
        latex_content: latexContent,
        is_base64: false
      });

      if (!result.success) {
        setParseError(result.errors[0] || 'Không thể phân tích LaTeX');
        setParsedQuestion(null);
        toast({
          title: 'Lỗi phân tích',
          description: result.errors[0] || 'Không thể phân tích LaTeX',
          variant: 'destructive'
        });
      } else {
        // Parsing successful, show preview for review
        const firstQuestion = result.questions[0];
        
        if (firstQuestion) {
          setParsedQuestion(firstQuestion as Partial<Question>);
          setParseError(null);

          const warningMessage = result.warnings.length > 0
            ? `Đã phân tích thành công. Cảnh báo: ${result.warnings.join(', ')}`
            : 'Đã phân tích LaTeX thành công. Vui lòng kiểm tra và nhấn "Tạo câu hỏi" để lưu.';

          toast({
            title: 'Phân tích thành công',
            description: warningMessage,
            variant: 'default'
          });
        }
      }
    } catch (error) {
      console.error('Lỗi khi phân tích LaTeX:', error);
      setParseError('Không thể phân tích nội dung LaTeX');
      setParsedQuestion(null);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể phân tích LaTeX',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [latexContent, toast]);

  /**
   * Handle create question (Step 2: Actually create after review)
   * Memoized to prevent unnecessary re-creation
   */
  const handleCreateQuestion = useCallback(async () => {
    if (!parsedQuestion || !latexContent.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Chưa có câu hỏi để tạo',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsCreating(true);

      // Use createFromLatex to actually create the question
      const result = await QuestionLatexService.createFromLatex({
        latex_content: latexContent,
        auto_create_codes: true
      });

      if (!result.success) {
        toast({
          title: 'Lỗi',
          description: result.error || 'Không thể tạo câu hỏi',
          variant: 'destructive'
        });
      } else {
        setIsQuestionCreated(true);
        
        // Update parsed question with created ID
        const firstQuestion = result.created_questions[0];
        const firstCode = result.created_codes[0];

        setParsedQuestion({
          ...parsedQuestion,
          id: firstQuestion?.id,
          questionCodeId: firstCode?.id
        } as Partial<Question>);

        toast({
          title: 'Thành công',
          description: `Đã tạo ${result.created_count} câu hỏi thành công`,
          variant: 'success'
        });

        // Clear draft after successful creation
        localStorage.removeItem('latex-question-draft');

        // Auto redirect after 2 seconds
        setTimeout(() => {
          router.push(ADMIN_PATHS.QUESTIONS);
        }, 2000);
      }
    } catch (error) {
      console.error('Lỗi khi tạo câu hỏi:', error);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể tạo câu hỏi',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  }, [parsedQuestion, latexContent, toast, router]);

  /**
   * Handle view created question details
   * Memoized to prevent unnecessary re-creation
   */
  const handleViewQuestion = useCallback(() => {
    if (!parsedQuestion?.id) {
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy ID câu hỏi',
        variant: 'destructive'
      });
      return;
    }

    // Redirect to question detail page
    router.push(`${ADMIN_PATHS.QUESTIONS}/${parsedQuestion.id}`);
  }, [parsedQuestion, toast, router]);

  /**
   * Handle copy sample LaTeX
   * Memoized to prevent unnecessary re-creation
   */
  const handleCopySample = useCallback(() => {
    setLatexContent(sampleLatex);
    toast({
      title: 'Đã sao chép',
      description: 'Đã sao chép mẫu LaTeX vào editor',
      variant: 'success'
    });
  }, [sampleLatex, toast]);

  /**
   * Handle copy to clipboard
   * Memoized to prevent unnecessary re-creation
   */
  const handleCopyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Đã sao chép',
        description: 'Đã sao chép vào clipboard',
        variant: 'success'
      });
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể sao chép',
        variant: 'destructive'
      });
    }
  }, [toast]);

  /**
   * Question type labels mapping
   * Memoized constant to prevent re-creation
   */
  const typeLabels = useMemo(() => ({
    [QuestionType.MC]: 'Trắc nghiệm',
    [QuestionType.MULTIPLE_CHOICE]: 'Trắc nghiệm',
    [QuestionType.TF]: 'Đúng/Sai',
    [QuestionType.SA]: 'Tự luận ngắn',
    [QuestionType.ES]: 'Tự luận',
    [QuestionType.MA]: 'Ghép đôi'
  }), []);

  /**
   * Render question type badge
   * Memoized to prevent unnecessary re-renders
   */
  const renderQuestionTypeBadge = useCallback((type?: QuestionType) => {
    if (!type) return null;

    return (
      <Badge variant="outline">
        {typeLabels[type]}
      </Badge>
    );
  }, [typeLabels]);

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header - Responsive */}
        <header 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          role="banner"
        >
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
              className="shrink-0"
              aria-label="Quay lại trang trước"
            >
              <ArrowLeft className="h-4 w-4 sm:mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">Quay lại</span>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Nhập câu hỏi LaTeX</h1>
                {latexContent.trim() && (
                  <Badge variant={isDraftSaved ? "outline" : "secondary"} className="text-xs">
                    {isDraftSaved ? '✓ Đã lưu nháp' : 'Đang lưu...'}
                  </Badge>
                )}
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Nhập và phân tích câu hỏi từ định dạng LaTeX
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => router.push(ADMIN_PATHS.QUESTIONS)}
              className="w-full sm:w-auto"
              aria-label="Xem danh sách câu hỏi"
            >
              <span className="hidden sm:inline">Danh sách câu hỏi</span>
              <span className="sm:hidden">Danh sách</span>
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* LaTeX Input using LaTeXEditor component */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Nhập LaTeX
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCopySample}
                    aria-label="Sao chép mẫu LaTeX vào editor"
                  >
                    <Copy className="h-4 w-4 mr-2" aria-hidden="true" />
                    Sao chép mẫu
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    aria-label={showPreview ? 'Ẩn xem trước LaTeX' : 'Hiện xem trước LaTeX'}
                    aria-pressed={showPreview}
                  >
                    <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                    {showPreview ? 'Ẩn Preview' : 'Hiện Preview'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Use LaTeXEditor component - Responsive height */}
              <LaTeXEditor
                value={latexContent}
                onChange={setLatexContent}
                showPreview={showPreview}
                height="300px"
                className="sm:h-[400px]"
                placeholder="Nhập nội dung LaTeX..."
              />

              <div className="flex gap-2">
                <Button 
                  onClick={handleParseLatex}
                  disabled={isLoading || !latexContent.trim()}
                  className="flex-1"
                  aria-label="Phân tích nội dung LaTeX"
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
                  )}
                  Phân tích LaTeX
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCopyToClipboard(latexContent)}
                  disabled={!latexContent.trim()}
                  aria-label="Sao chép nội dung LaTeX vào clipboard"
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview & Result */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" aria-hidden="true" />
                Kết quả phân tích
              </CardTitle>
            </CardHeader>
            <CardContent role="region" aria-label="Kết quả phân tích câu hỏi" aria-live="polite">
              {parseError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{parseError}</AlertDescription>
                </Alert>
              )}

              {isLoading && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <div className="mt-4">
                        <Skeleton className="h-20 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {!parsedQuestion && !parseError && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nhập nội dung LaTeX và nhấn &quot;Phân tích & Tạo câu hỏi&quot; để xem kết quả</p>
                </div>
              )}

              {parsedQuestion && (
                <div className="space-y-4">
                  {/* Validation warnings */}
                  {(() => {
                    const validationWarnings = validateQuestion(parsedQuestion);
                    return validationWarnings.length > 0 && (
                      <Alert variant="warning" className="mb-4">
                        <AlertDescription>
                          <div className="space-y-1">
                            <p className="font-medium">⚠️ Cảnh báo validation:</p>
                            {validationWarnings.map((warning, index) => (
                              <div key={index} className="text-sm">
                                • {warning}
                              </div>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    );
                  })()}

                  {/* Question preview */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {parsedQuestion.content || 'Nội dung câu hỏi'}
                        </CardTitle>
                        <div className="flex gap-2">
                          {renderQuestionTypeBadge(parsedQuestion.type)}
                          {parsedQuestion.difficulty && (
                            <Badge variant="outline">
                              {parsedQuestion.difficulty === QuestionDifficulty.EASY && 'Dễ'}
                              {parsedQuestion.difficulty === QuestionDifficulty.MEDIUM && 'Trung bình'}
                              {parsedQuestion.difficulty === QuestionDifficulty.HARD && 'Khó'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Answers for multiple choice */}
                      {parsedQuestion.type === QuestionType.MC && parsedQuestion.answers && (
                        <div className="space-y-2">
                          {(parsedQuestion.answers as AnswerOption[]).map((answer, index) => (
                            <div 
                              key={answer.id} 
                              className={`p-3 border rounded ${answer.isCorrect ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}
                            >
                              <span className="font-medium mr-2">
                                {String.fromCharCode(65 + index)}.
                              </span>
                              {answer.content}
                              {answer.isCorrect && (
                                <Badge className="ml-2 bg-green-600">Đúng</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Solution */}
                      {parsedQuestion.solution && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                          <h4 className="font-medium text-blue-900 mb-2">Lời giải:</h4>
                          <p className="text-blue-800">{parsedQuestion.solution}</p>
                        </div>
                      )}

                      {/* Tags */}
                      {parsedQuestion.tag && parsedQuestion.tag.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Tags:</h4>
                          <div className="flex flex-wrap gap-1">
                            {parsedQuestion.tag.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {!isQuestionCreated ? (
                      <>
                        <Button 
                          onClick={handleCreateQuestion}
                          disabled={isCreating}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          aria-label="Tạo câu hỏi vào hệ thống"
                          aria-busy={isCreating}
                        >
                          {isCreating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" aria-hidden="true" />
                          )}
                          Tạo câu hỏi
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setParsedQuestion(null);
                            setParseError(null);
                            setIsQuestionCreated(false);
                          }}
                          className="flex-1"
                          aria-label="Hủy và phân tích lại"
                          disabled={isCreating}
                        >
                          <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
                          Phân tích lại
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          onClick={handleViewQuestion}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          aria-label="Xem chi tiết câu hỏi đã tạo"
                        >
                          <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                          Xem chi tiết
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setParsedQuestion(null);
                            setParseError(null);
                            setIsQuestionCreated(false);
                            setLatexContent('');
                          }}
                          className="flex-1"
                          aria-label="Tạo câu hỏi mới"
                        >
                          <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
                          Tạo câu hỏi mới
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* LaTeX Examples - Collapsible */}
        <Card>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="examples" className="border-0">
              <CardHeader className="pb-0">
                <AccordionTrigger className="hover:no-underline py-4">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Ví dụ LaTeX
                    <Badge variant="outline" className="ml-2">
                      Nhấn để xem
                    </Badge>
                  </CardTitle>
                </AccordionTrigger>
              </CardHeader>
              <AccordionContent>
                <CardContent className="pt-4">
                  <Tabs defaultValue="multiple-choice">
              <TabsList>
                <TabsTrigger value="multiple-choice">Trắc nghiệm</TabsTrigger>
                <TabsTrigger value="true-false">Đúng/Sai</TabsTrigger>
                <TabsTrigger value="essay">Tự luận</TabsTrigger>
              </TabsList>

              <TabsContent value="multiple-choice" className="mt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
{`\\begin{ex}%[Nguồn: "Sách giáo khoa Toán 12"]%[2P5VN]
[TL.100022]
Tìm giá trị lớn nhất của hàm số $f(x) = x^3 - 3x^2 + 2$ trên đoạn $[0, 3]$.
\\choice
{$-2$}
{$0$}
{\\True $2$}
{$6$}
\\loigiai{
    Tính đạo hàm $f'(x) = 3x^2 - 6x = 3x(x-2)$.
    $f'(x) = 0 \\Leftrightarrow x = 0$ hoặc $x = 2$.
    Tính $f(0) = 2$, $f(2) = -2$, $f(3) = 2$.
    Vậy giá trị lớn nhất là $2$.
}
\\end{ex}`}
                  </pre>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => handleCopyToClipboard(sampleLatex)}
                    aria-label="Sao chép ví dụ câu hỏi trắc nghiệm"
                  >
                    <Copy className="h-4 w-4 mr-2" aria-hidden="true" />
                    Sao chép
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="true-false" className="mt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
{`\\begin{ex}%[Nguồn: "Sách giáo khoa Toán 8"]%[T8C5B1M1]
[SC006]
Phát biểu: "Trong tam giác vuông, bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông." Đúng hay sai?
\\choice
{\\True Đúng}
{Sai}
\\loigiai{
    Đây chính là định lý Pythagoras.
}
\\end{ex}`}
                  </pre>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => handleCopyToClipboard(`\\begin{ex}%[Nguồn: "Sách giáo khoa Toán 8"]%[T8C5B1M1]
[SC006]
Phát biểu: "Trong tam giác vuông, bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông." Đúng hay sai?
\\choice
{\\True Đúng}
{Sai}
\\loigiai{
    Đây chính là định lý Pythagoras.
}
\\end{ex}`)}
                    aria-label="Sao chép ví dụ câu hỏi đúng sai"
                  >
                    <Copy className="h-4 w-4 mr-2" aria-hidden="true" />
                    Sao chép
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="essay" className="mt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
{`\\begin{ex}%[Nguồn: "Đề thi THPT QG 2023"]%[2P3VH2]
[TL.200045]
Giải phương trình: $\\log_2(x+1) + \\log_2(x-1) = 3$
\\loigiai{
    Điều kiện: $x > 1$
    
    Phương trình tương đương:
    $\\log_2[(x+1)(x-1)] = 3$
    $\\log_2(x^2-1) = 3$
    $x^2-1 = 2^3 = 8$
    $x^2 = 9$
    $x = \\pm 3$
    
    Kết hợp điều kiện $x > 1$, ta có $x = 3$.
}
\\end{ex}`}
                  </pre>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => handleCopyToClipboard(`\\begin{ex}%[Nguồn: "Đề thi THPT QG 2023"]%[2P3VH2]
[TL.200045]
Giải phương trình: $\\log_2(x+1) + \\log_2(x-1) = 3$
\\loigiai{
    Điều kiện: $x > 1$
    
    Phương trình tương đương:
    $\\log_2[(x+1)(x-1)] = 3$
    $\\log_2(x^2-1) = 3$
    $x^2-1 = 2^3 = 8$
    $x^2 = 9$
    $x = \\pm 3$
    
    Kết hợp điều kiện $x > 1$, ta có $x = 3$.
}
\\end{ex}`)}
                    aria-label="Sao chép ví dụ câu hỏi tự luận"
                  >
                    <Copy className="h-4 w-4 mr-2" aria-hidden="true" />
                    Sao chép
                  </Button>
                </div>
              </TabsContent>
                  </Tabs>
                </CardContent>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </div>
    </ErrorBoundary>
  );
}
