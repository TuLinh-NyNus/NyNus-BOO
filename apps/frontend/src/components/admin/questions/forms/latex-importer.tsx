/**
 * LaTeX Importer Component
 * ========================
 * Component để nhập LaTeX gốc và tự động trích xuất thông tin câu hỏi
 * 
 * Features:
 * - Nhập LaTeX content từ \begin{ex}...\end{ex}
 * - Parse tự động qua gRPC backend
 * - Preview kết quả parse
 * - Auto-fill form với dữ liệu đã parse
 * - Hiển thị warnings và errors
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Textarea,
  Alert,
  AlertDescription,
  Badge,
  Separator,
} from "@/components/ui";
import {
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Code,
  ArrowRight,
} from "lucide-react";

// Import service
import { QuestionLatexService, ParsedQuestion } from "@/services/grpc/question-latex.service";
import { QuestionType } from "@/types/question";

// ===== TYPES =====

export interface LatexImporterProps {
  onImportSuccess: (parsedData: ParsedQuestion) => void;
  disabled?: boolean;
  onReset?: () => void;
  onProcessing?: (isProcessing: boolean) => void;
}

// ===== COMPONENT =====

export function LatexImporter({
  onImportSuccess,
  disabled = false,
  onReset,
  onProcessing
}: LatexImporterProps) {
  // ===== STATE =====
  const [latexContent, setLatexContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedQuestion | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  // ===== HANDLERS =====

  /**
   * Xử lý parse LaTeX content với validation và error handling cải tiến
   */
  const handleParse = async () => {
    if (onProcessing) onProcessing(true);
    setIsProcessing(true);
    setErrors([]);
    setWarnings([]);
    setParsedData(null);

    try {
      // Call backend parse API với validation tự động
      const response = await QuestionLatexService.parseLatex({
        latex_content: latexContent,
        is_base64: false,
      });

      if (response.success && response.questions.length > 0) {
        const parsed = response.questions[0]; // Lấy câu hỏi đầu tiên
        setParsedData(parsed);
        setWarnings(response.warnings);

        // Thông báo thành công
        if (response.warnings.length === 0) {
          setErrors([]);
        }
      } else {
        // Hiển thị lỗi chi tiết từ validation hoặc parsing
        const errorMessages = response.errors.length > 0 
          ? response.errors 
          : ["Không thể phân tích LaTeX. Vui lòng kiểm tra định dạng."];
        setErrors(errorMessages);
      }
    } catch (error) {
      console.error("Parse error:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Đã xảy ra lỗi không xác định khi phân tích LaTeX";
      setErrors([errorMessage]);
    } finally {
      setIsProcessing(false);
      if (onProcessing) onProcessing(false);
    }
  };

  /**
   * Xử lý apply parsed data vào form
   */
  const handleApplyToForm = () => {
    if (parsedData) {
      onImportSuccess(parsedData);
    }
  };

  /**
   * Reset form
   */
  const handleReset = () => {
    setLatexContent("");
    setParsedData(null);
    setErrors([]);
    setWarnings([]);
    if (onReset) {
      onReset();
    }
  };

  // ===== RENDER HELPERS =====

  /**
   * Render preview của parsed data
   */
  const renderPreview = () => {
    if (!parsedData) return null;

    return (
      <div className="space-y-4 mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Kết quả trích xuất
          </h3>
          <Button
            onClick={handleApplyToForm}
            size="sm"
            className="gap-2"
            disabled={disabled}
          >
            <ArrowRight className="h-4 w-4" />
            Áp dụng vào form
          </Button>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Question Code */}
          {parsedData.question_code && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Mã câu hỏi
              </label>
              <div className="p-3 bg-secondary rounded-md">
                <Badge variant="outline" className="font-mono">
                  {parsedData.question_code}
                </Badge>
              </div>
            </div>
          )}

          {/* Question Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Loại câu hỏi
            </label>
            <div className="p-3 bg-secondary rounded-md">
              <Badge variant="default">
                {getQuestionTypeLabel(parsedData.type)}
              </Badge>
            </div>
          </div>

          {/* Content Preview */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-muted-foreground">
              Nội dung câu hỏi
            </label>
            <div className="p-3 bg-secondary rounded-md max-h-32 overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap font-mono">
                {parsedData.content.substring(0, 200)}
                {parsedData.content.length > 200 && "..."}
              </p>
            </div>
          </div>

          {/* Answers Count */}
          {parsedData.answers && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Số đáp án
              </label>
              <div className="p-3 bg-secondary rounded-md">
                <Badge variant="secondary">
                  {Array.isArray(parsedData.answers) 
                    ? parsedData.answers.length 
                    : typeof parsedData.answers === 'string' 
                      ? JSON.parse(parsedData.answers).length 
                      : 0} đáp án
                </Badge>
              </div>
            </div>
          )}

          {/* Source */}
          {parsedData.source && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Nguồn
              </label>
              <div className="p-3 bg-secondary rounded-md">
                <p className="text-sm truncate" title={parsedData.source}>
                  {parsedData.source}
                </p>
              </div>
            </div>
          )}

          {/* Solution */}
          {parsedData.solution && (
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">
                Lời giải
              </label>
              <div className="p-3 bg-secondary rounded-md max-h-32 overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap font-mono">
                  {parsedData.solution.substring(0, 200)}
                  {parsedData.solution.length > 200 && "..."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Render warnings
   */
  const renderWarnings = () => {
    if (warnings.length === 0) return null;

    return (
      <Alert className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-1">
            <p className="font-medium">Cảnh báo:</p>
            <ul className="list-disc list-inside space-y-1">
              {warnings.map((warning, idx) => (
                <li key={idx} className="text-sm">
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  /**
   * Render errors
   */
  const renderErrors = () => {
    if (errors.length === 0) return null;

    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-1">
            <p className="font-medium">Lỗi:</p>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, idx) => (
                <li key={idx} className="text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  // ===== MAIN RENDER =====

  return (
    <Card className="w-full h-full flex flex-col overflow-hidden">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Import từ LaTeX
        </CardTitle>
        <CardDescription>
          Nhập nội dung LaTeX gốc để tự động trích xuất thông tin câu hỏi.
          Định dạng: <code className="text-xs bg-muted px-1 py-0.5 rounded">\begin&#123;ex&#125;...\end&#123;ex&#125;</code>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
        {/* LaTeX Input */}
        <div className="flex-1 flex flex-col space-y-2 overflow-hidden">
          <label className="text-sm font-medium flex-shrink-0">
            Nội dung LaTeX gốc
          </label>
          <Textarea
            value={latexContent}
            onChange={(e) => setLatexContent(e.target.value)}
            placeholder={`Ví dụ:\n\\begin{ex}%[Nguồn: Đề thi thử 2024]%[1A1N1]\n    Tìm đạo hàm của hàm số $y = x^2 + 3x + 1$?\n    \\choice\n    {\\True $y' = 2x + 3$}\n    {$y' = 2x$}\n    {$y' = x + 3$}\n    {$y' = 2x^2$}\n    \\loigiai{\n        Áp dụng công thức đạo hàm: $(x^n)' = nx^{n-1}$\n    }\n\\end{ex}`}
            className="flex-1 font-mono text-sm resize-none overflow-auto"
            disabled={disabled || isProcessing}
          />
          <p className="text-xs text-muted-foreground flex-shrink-0">
            💡 Mẹo: Sao chép toàn bộ block <code>\begin&#123;ex&#125;</code> bao gồm cả metadata và lời giải
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={handleParse}
            disabled={disabled || isProcessing || !latexContent.trim()}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Trích xuất
              </>
            )}
          </Button>

          {(parsedData || errors.length > 0 || warnings.length > 0) && (
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={disabled || isProcessing}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Làm mới
            </Button>
          )}
        </div>

        {/* Errors */}
        {renderErrors()}

        {/* Warnings */}
        {renderWarnings()}

        {/* Preview */}
        {renderPreview()}
      </CardContent>
    </Card>
  );
}

// ===== HELPER FUNCTIONS =====

/**
 * Lấy label cho question type
 */
function getQuestionTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    [QuestionType.MC]: "Trắc nghiệm",
    [QuestionType.TF]: "Đúng/Sai",
    [QuestionType.SA]: "Trả lời ngắn",
    [QuestionType.ES]: "Tự luận",
    [QuestionType.MA]: "Ghép đôi",
  };
  return typeMap[type] || type;
}

