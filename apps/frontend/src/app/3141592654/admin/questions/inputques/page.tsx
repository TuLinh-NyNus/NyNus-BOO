/**
 * Admin Questions Input LaTeX Page
 * Trang nhập câu hỏi từ LaTeX trong admin panel
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
import { Label } from "@/components/ui/form/label";
import { Textarea } from "@/components/ui/form/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  FileText,
  Eye,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

// Import types
import { EnhancedQuestion, QuestionType, QuestionDifficulty } from "@/types/question";

// Import mock service
import { mockQuestionsService } from "@/lib/services/mock/questions";

// Import admin paths
import { ADMIN_PATHS } from "@/lib/admin-paths";

/**
 * Input LaTeX Page Component
 */
export default function InputLatexPage() {
  const router = useRouter();
  const { toast } = useToast();

  // State management
  const [latexContent, setLatexContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedQuestion, setParsedQuestion] = useState<Partial<EnhancedQuestion> | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  /**
   * Handle LaTeX parsing
   */
  const handleParseLaTeX = async () => {
    if (!latexContent.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nội dung LaTeX",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      setParseError(null);

      const response = await mockQuestionsService.parseLatex({
        content: latexContent
      });

      if (response.success && response.question) {
        setParsedQuestion(response.question);
        toast({
          title: "Thành công",
          description: "Phân tích LaTeX thành công!",
          variant: "success"
        });
      } else {
        setParseError(response.errors?.[0] || "Có lỗi xảy ra khi phân tích LaTeX");
        setParsedQuestion(null);
      }
    } catch (error) {
      console.error("Error parsing LaTeX:", error);
      setParseError("Có lỗi xảy ra khi phân tích LaTeX");
      setParsedQuestion(null);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle save parsed question
   */
  const handleSaveQuestion = async () => {
    if (!parsedQuestion) {
      toast({
        title: "Lỗi",
        description: "Không có câu hỏi để lưu",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);

      await mockQuestionsService.createQuestion({
        content: parsedQuestion.content || "",
        rawContent: parsedQuestion.rawContent || latexContent,
        type: parsedQuestion.type || QuestionType.MC,
        difficulty: parsedQuestion.difficulty || QuestionDifficulty.MEDIUM,
        source: parsedQuestion.source,
        answers: parsedQuestion.answers,
        correctAnswer: parsedQuestion.correctAnswer,
        solution: parsedQuestion.solution,
        tag: parsedQuestion.tag || [],
        questionCodeId: parsedQuestion.questionCodeId || "UNKNOWN",
      });

      toast({
        title: "Thành công",
        description: "Lưu câu hỏi thành công!",
        variant: "success"
      });

      // Reset form
      setLatexContent("");
      setParsedQuestion(null);
      setParseError(null);
    } catch (error) {
      console.error("Error saving question:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi lưu câu hỏi",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    router.push(ADMIN_PATHS.QUESTIONS);
  };

  /**
   * Handle clear form
   */
  const handleClear = () => {
    setLatexContent("");
    setParsedQuestion(null);
    setParseError(null);
  };

  return (
    <div className="input-latex-page space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Nhập câu hỏi từ LaTeX</h1>
            <p className="text-muted-foreground">
              Nhập mã LaTeX để tự động tạo câu hỏi
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleClear}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Xóa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LaTeX Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Nhập LaTeX
            </CardTitle>
            <CardDescription>
              Dán mã LaTeX của câu hỏi vào ô bên dưới
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="latex-content">Nội dung LaTeX</Label>
              <Textarea
                id="latex-content"
                placeholder={`Ví dụ:
\\begin{ex}%[Nguồn: &quot;Sách giáo khoa Toán 12&quot;]%[2P5VN]
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
                rows={12}
                value={latexContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLatexContent(e.target.value)}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button 
                onClick={handleParseLaTeX} 
                disabled={isProcessing || !latexContent.trim()}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Đang phân tích...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Phân tích LaTeX
                  </>
                )}
              </Button>
            </div>

            {/* Parse Error */}
            {parseError && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                <div className="text-sm text-destructive">
                  <p className="font-medium">Lỗi phân tích LaTeX:</p>
                  <p>{parseError}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview Result */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Kết quả phân tích
            </CardTitle>
            <CardDescription>
              Xem trước câu hỏi được tạo từ LaTeX
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            ) : parsedQuestion ? (
              <div className="space-y-4">
                <div className="flex items-start gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                  <div className="text-sm text-success">
                    <p className="font-medium">Phân tích thành công!</p>
                    <p>Câu hỏi đã được tạo từ LaTeX</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Nội dung câu hỏi:</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {parsedQuestion.content || "Chưa có nội dung"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-sm font-medium">Loại:</Label>
                      <p className="text-muted-foreground">{parsedQuestion.type || "Chưa xác định"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Độ khó:</Label>
                      <p className="text-muted-foreground">{parsedQuestion.difficulty || "Chưa xác định"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Mã câu hỏi:</Label>
                      <p className="text-muted-foreground">{parsedQuestion.questionCodeId || "Chưa có"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Nguồn:</Label>
                      <p className="text-muted-foreground">{parsedQuestion.source || "Chưa có"}</p>
                    </div>
                  </div>

                  {parsedQuestion.tag && parsedQuestion.tag.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Tags:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {parsedQuestion.tag.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {parsedQuestion.solution && (
                    <div>
                      <Label className="text-sm font-medium">Lời giải:</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {parsedQuestion.solution}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <Button 
                    onClick={handleSaveQuestion} 
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Lưu câu hỏi
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chưa có kết quả</h3>
                <p className="text-muted-foreground">
                  Nhập mã LaTeX và nhấn &quot;Phân tích LaTeX&quot; để xem kết quả
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
