/**
 * LaTeX Tab Component
 * Tab xử lý LaTeX parsing cho câu hỏi
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
  Button,
  Alert,
  AlertDescription,
  Badge,
} from "@/components/ui";
import {
  FileText,
  Zap,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

/**
 * LaTeX parse result interface
 */
interface LaTeXParseResult {
  content: string;
  type: string;
  answers?: Array<{ id: string; content: string; isCorrect: boolean }>;
  solution?: string;
  questionCodeId?: string;
  source?: string;
}

/**
 * Props for LaTeXTab component
 */
interface LaTeXTabProps {
  latexContent: string;
  onLatexContentChange: (content: string) => void;
  parseResult: LaTeXParseResult | null;
  onParseResult: (result: LaTeXParseResult | null) => void;
  onApplyToForm: (data: LaTeXParseResult) => void;
}

/**
 * LaTeX Tab Component
 * Specialized component cho LaTeX processing
 */
export function LaTeXTab({
  latexContent,
  onLatexContentChange,
  parseResult,
  onParseResult,
  onApplyToForm,
}: LaTeXTabProps) {
  /**
   * Parse LaTeX content
   */
  const handleParseLaTeX = () => {
    if (!latexContent.trim()) {
      onParseResult(null);
      return;
    }

    try {
      // Mock LaTeX parsing logic
      const mockResult: LaTeXParseResult = {
        content: latexContent.split('\n')[0] || '',
        type: 'MC',
        answers: [
          { id: '1', content: 'Đáp án A', isCorrect: true },
          { id: '2', content: 'Đáp án B', isCorrect: false },
          { id: '3', content: 'Đáp án C', isCorrect: false },
          { id: '4', content: 'Đáp án D', isCorrect: false },
        ],
        solution: 'Lời giải từ LaTeX',
        questionCodeId: '2P5VN',
        source: 'LaTeX Import',
      };

      onParseResult(mockResult);
    } catch (error) {
      console.error('LaTeX parsing error:', error);
      onParseResult(null);
    }
  };

  /**
   * Apply parsed data to form
   */
  const handleApplyToForm = () => {
    if (parseResult) {
      onApplyToForm(parseResult);
    }
  };

  return (
    <div className="space-y-4">
      {/* LaTeX Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Nhập LaTeX
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Dán nội dung LaTeX vào đây..."
            value={latexContent}
            onChange={(e) => onLatexContentChange(e.target.value)}
            rows={8}
            className="font-mono text-sm"
          />
          
          <div className="flex gap-2">
            <Button
              onClick={handleParseLaTeX}
              disabled={!latexContent.trim()}
            >
              <Zap className="h-4 w-4 mr-2" />
              Phân tích LaTeX
            </Button>
            
            {parseResult && (
              <Button
                variant="outline"
                onClick={handleApplyToForm}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Áp dụng vào form
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Parse Result */}
      {parseResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Kết quả phân tích
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Loại câu hỏi</div>
                <Badge variant="outline">{parseResult.type}</Badge>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Mã câu hỏi</div>
                <code className="text-sm bg-muted px-1 py-0.5 rounded">
                  {parseResult.questionCodeId}
                </code>
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">Nội dung câu hỏi</div>
              <div className="p-3 bg-muted/50 rounded-lg">
                {parseResult.content}
              </div>
            </div>

            {parseResult.answers && parseResult.answers.length > 0 && (
              <div>
                <div className="text-sm text-muted-foreground mb-2">Đáp án</div>
                <div className="space-y-2">
                  {parseResult.answers.map((answer, index) => (
                    <div key={answer.id} className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className={answer.isCorrect ? "font-medium text-green-600" : ""}>
                        {answer.content}
                      </span>
                      {answer.isCorrect && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {parseResult.solution && (
              <div>
                <div className="text-sm text-muted-foreground mb-2">Lời giải</div>
                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                  {parseResult.solution}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {latexContent.trim() && !parseResult && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Không thể phân tích nội dung LaTeX. Vui lòng kiểm tra lại định dạng.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
