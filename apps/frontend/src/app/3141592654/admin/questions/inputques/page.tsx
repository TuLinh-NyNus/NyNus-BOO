'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Play, Save, Eye, Loader2, Copy } from 'lucide-react';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
  Label,
  Alert,
  AlertDescription,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import { useToast } from '@/components/ui/feedback/use-toast';
import { ErrorBoundary } from '@/components/ui/feedback/error-boundary';

import {
  Question,
  QuestionType,
  QuestionDifficulty,
  QuestionStatus,
  AnswerOption
} from '@/lib/types/question';
import { MockQuestionsService } from '@/lib/services/mock/questions';
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
   * Handle LaTeX parsing
   */
  const handleParseLatex = async () => {
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

      const result = await MockQuestionsService.parseLatexContent(latexContent);
      
      if (result.error) {
        setParseError(result.error);
        setParsedQuestion(null);
      } else if (result.data) {
        setParsedQuestion(result.data);
        setParseError(null);
        toast({
          title: 'Thành công',
          description: 'Đã phân tích LaTeX thành công',
          variant: 'success'
        });
      }
    } catch (error) {
      console.error('Lỗi khi phân tích LaTeX:', error);
      setParseError('Không thể phân tích nội dung LaTeX');
      setParsedQuestion(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle save parsed question
   */
  const handleSaveQuestion = async () => {
    if (!parsedQuestion) {
      toast({
        title: 'Lỗi',
        description: 'Chưa có câu hỏi để lưu',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);

      const questionData = {
        content: parsedQuestion?.content || 'Nội dung từ LaTeX',
        rawContent: latexContent,
        type: parsedQuestion?.type || QuestionType.MC,
        tag: parsedQuestion?.tag || ['LaTeX'],
        questionCodeId: parsedQuestion?.questionCodeId || 'AUTO_GENERATED',
        status: QuestionStatus.PENDING,
        usageCount: 0,
        creator: 'current-user',
        answers: parsedQuestion?.answers,
        correctAnswer: parsedQuestion?.correctAnswer,
        solution: parsedQuestion?.solution,
        source: parsedQuestion?.source,
        difficulty: parsedQuestion?.difficulty,
        subcount: parsedQuestion?.subcount
      };

      await MockQuestionsService.createQuestion(questionData);

      toast({
        title: 'Thành công',
        description: 'Câu hỏi đã được lưu thành công',
        variant: 'success'
      });

      // Reset form
      setLatexContent('');
      setParsedQuestion(null);
      setParseError(null);
    } catch (error) {
      console.error('Lỗi khi lưu câu hỏi:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu câu hỏi',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle copy sample LaTeX
   */
  const handleCopySample = () => {
    setLatexContent(sampleLatex);
    toast({
      title: 'Đã sao chép',
      description: 'Đã sao chép mẫu LaTeX vào editor',
      variant: 'success'
    });
  };

  /**
   * Handle copy to clipboard
   */
  const handleCopyToClipboard = async (text: string) => {
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
  };

  /**
   * Render question type badge
   */
  const renderQuestionTypeBadge = (type?: QuestionType) => {
    if (!type) return null;

    const typeLabels = {
      [QuestionType.MC]: 'Trắc nghiệm',
      [QuestionType.TF]: 'Đúng/Sai',
      [QuestionType.SA]: 'Tự luận ngắn',
      [QuestionType.ES]: 'Tự luận',
      [QuestionType.MA]: 'Ghép đôi'
    };

    return (
      <Badge variant="outline">
        {typeLabels[type]}
      </Badge>
    );
  };

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
              <h1 className="text-3xl font-bold text-foreground">Nhập câu hỏi LaTeX</h1>
              <p className="text-muted-foreground mt-1">
                Nhập và phân tích câu hỏi từ định dạng LaTeX
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => router.push(ADMIN_PATHS.QUESTIONS)}
            >
              Danh sách câu hỏi
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LaTeX Input */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Nhập LaTeX
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCopySample}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Sao chép mẫu
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="latexInput">Nội dung LaTeX</Label>
                <Textarea
                  id="latexInput"
                  placeholder="Nhập nội dung LaTeX..."
                  value={latexContent}
                  onChange={(e) => setLatexContent(e.target.value)}
                  rows={12}
                  className="mt-1 font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleParseLatex}
                  disabled={isLoading || !latexContent.trim()}
                  className="flex-1"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Phân tích LaTeX
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCopyToClipboard(latexContent)}
                  disabled={!latexContent.trim()}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {/* LaTeX syntax help */}
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <strong>Cú pháp LaTeX:</strong>
                  <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                    <li><code>\begin{'{ex}'}</code> - Bắt đầu câu hỏi</li>
                    <li><code>\choice</code> - Danh sách đáp án</li>
                    <li><code>\True</code> - Đáp án đúng</li>
                    <li><code>\loigiai{'{...}'}</code> - Lời giải</li>
                    <li><code>\end{'{ex}'}</code> - Kết thúc câu hỏi</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Preview & Result */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Kết quả phân tích
              </CardTitle>
            </CardHeader>
            <CardContent>
              {parseError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{parseError}</AlertDescription>
                </Alert>
              )}

              {!parsedQuestion && !parseError && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nhập nội dung LaTeX và nhấn &quot;Phân tích LaTeX&quot; để xem kết quả</p>
                </div>
              )}

              {parsedQuestion && (
                <div className="space-y-4">
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
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSaveQuestion}
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Lưu câu hỏi
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`${ADMIN_PATHS.QUESTIONS_CREATE}?from=latex`)}
                    >
                      Chỉnh sửa
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* LaTeX Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Ví dụ LaTeX</CardTitle>
          </CardHeader>
          <CardContent>
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
                  >
                    <Copy className="h-4 w-4 mr-2" />
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
                  >
                    <Copy className="h-4 w-4 mr-2" />
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
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Sao chép
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}
