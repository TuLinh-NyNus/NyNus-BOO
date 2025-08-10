/**
 * Question Form Tabs Component
 * Tabs tổ hợp Form/LaTeX/MapID/Preview
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
  Button,
  Alert,
  AlertDescription,
} from "@/components/ui";
import {
  FileText,
  Code,
  Hash,
  Eye,
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/feedback/use-toast";

// Import components
import { QuestionForm } from "./questionForm";

// Import types từ lib/types
import {
  Question,
  QuestionDraft,
  QuestionCode
} from "@/lib/types/question";

// Technical types for LaTeX parsing result (local to this component)
interface LatexAnswer {
  id: string;
  content: string;
  isCorrect: boolean;
}

interface LatexParseResult {
  content: string;
  type: string;
  answers?: LatexAnswer[];
  solution?: string;
  questionCodeId?: string;
  source?: string;
}

/**
 * Props for QuestionFormTabs component
 */
interface QuestionFormTabsProps {
  initialData?: Partial<Question>;
  onSubmit: (data: QuestionDraft) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

/**
 * Question Form Tabs Component
 * Comprehensive tabs interface cho question management
 */
export function QuestionFormTabs({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = "create",
}: QuestionFormTabsProps) {
  const { toast } = useToast();

  // Tab state
  const [activeTab, setActiveTab] = useState("form");
  
  // LaTeX state
  const [latexContent, setLatexContent] = useState(initialData?.rawContent || "");
  const [latexParseResult, setLatexParseResult] = useState<LatexParseResult | null>(null);
  const [isParsingLatex, setIsParsingLatex] = useState(false);

  // MapID state
  const [mapIdCode, setMapIdCode] = useState(initialData?.questionCodeId || "");
  const [mapIdResult, setMapIdResult] = useState<QuestionCode | null>(null);
  const [isDecodingMapId, setIsDecodingMapId] = useState(false);

  /**
   * Handle LaTeX parsing
   */
  const handleLatexParse = async () => {
    if (!latexContent.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nội dung LaTeX",
        variant: "destructive",
      });
      return;
    }

    setIsParsingLatex(true);
    
    try {
      // Mock LaTeX parsing - trong thực tế sẽ gọi API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResult: LatexParseResult = {
        content: "Tìm giá trị lớn nhất của hàm số f(x) = x³ - 3x² + 2 trên đoạn [0, 3]",
        type: "MC",
        answers: [
          { id: "1", content: "-2", isCorrect: false },
          { id: "2", content: "0", isCorrect: false },
          { id: "3", content: "2", isCorrect: true },
          { id: "4", content: "6", isCorrect: false },
        ],
        solution: "Tính đạo hàm f'(x) = 3x² - 6x = 3x(x-2)...",
        questionCodeId: "2P5VN",
        source: "Sách giáo khoa Toán 12",
      };

      setLatexParseResult(mockResult);
      
      toast({
        title: "Thành công",
        description: "Đã phân tích LaTeX thành công",
        variant: "default",
      });
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể phân tích LaTeX",
        variant: "destructive",
      });
    } finally {
      setIsParsingLatex(false);
    }
  };

  /**
   * Handle MapID decoding
   */
  const handleMapIdDecode = async () => {
    if (!mapIdCode.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã câu hỏi",
        variant: "destructive",
      });
      return;
    }

    setIsDecodingMapId(true);
    
    try {
      // Mock MapID decoding - trong thực tế sẽ gọi API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockResult: QuestionCode = {
        code: mapIdCode,
        format: "ID5",
        grade: "2",
        subject: "P",
        chapter: "5",
        lesson: "V",
        level: "N",
      };

      setMapIdResult(mockResult);
      
      toast({
        title: "Thành công",
        description: "Đã giải mã MapID thành công",
        variant: "default",
      });
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể giải mã MapID",
        variant: "destructive",
      });
    } finally {
      setIsDecodingMapId(false);
    }
  };

  /**
   * Apply LaTeX result to form
   */
  const applyLatexResult = () => {
    if (latexParseResult) {
      // Chuyển sang tab form và apply data
      setActiveTab("form");
      toast({
        title: "Thành công",
        description: "Đã áp dụng kết quả LaTeX vào form",
        variant: "default",
      });
    }
  };

  /**
   * Apply MapID result to form
   */
  const applyMapIdResult = () => {
    if (mapIdResult) {
      // Chuyển sang tab form và apply data
      setActiveTab("form");
      toast({
        title: "Thành công",
        description: "Đã áp dụng kết quả MapID vào form",
        variant: "default",
      });
    }
  };

  return (
    <div className="question-form-tabs">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="form" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Form
          </TabsTrigger>
          <TabsTrigger value="latex" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            LaTeX
          </TabsTrigger>
          <TabsTrigger value="mapid" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            MapID
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Form Tab */}
        <TabsContent value="form" className="space-y-4">
          <QuestionForm
            initialData={initialData}
            onSubmit={onSubmit}
            onCancel={onCancel}
            isLoading={isLoading}
            mode={mode}
          />
        </TabsContent>

        {/* LaTeX Tab */}
        <TabsContent value="latex" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nhập LaTeX</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Nhập nội dung LaTeX..."
                  value={latexContent}
                  onChange={(e) => setLatexContent(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleLatexParse}
                  disabled={isParsingLatex || !latexContent.trim()}
                >
                  {isParsingLatex ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Đang phân tích...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Phân tích LaTeX
                    </>
                  )}
                </Button>

                {latexParseResult && (
                  <Button variant="outline" onClick={applyLatexResult}>
                    <Download className="h-4 w-4 mr-2" />
                    Áp dụng vào Form
                  </Button>
                )}
              </div>

              {/* LaTeX Parse Result */}
              {latexParseResult && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p><strong>Nội dung:</strong> {latexParseResult.content}</p>
                      <p><strong>Loại:</strong> {latexParseResult.type}</p>
                      <p><strong>Số đáp án:</strong> {latexParseResult.answers?.length || 0}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* MapID Tab */}
        <TabsContent value="mapid" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Giải mã MapID</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Nhập mã câu hỏi (VD: 2P5VN)"
                  value={mapIdCode}
                  onChange={(e) => setMapIdCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleMapIdDecode}
                  disabled={isDecodingMapId || !mapIdCode.trim()}
                >
                  {isDecodingMapId ? (
                    <>
                      <Hash className="h-4 w-4 mr-2 animate-spin" />
                      Đang giải mã...
                    </>
                  ) : (
                    <>
                      <Hash className="h-4 w-4 mr-2" />
                      Giải mã MapID
                    </>
                  )}
                </Button>

                {mapIdResult && (
                  <Button variant="outline" onClick={applyMapIdResult}>
                    <Download className="h-4 w-4 mr-2" />
                    Áp dụng vào Form
                  </Button>
                )}
              </div>

              {/* MapID Decode Result */}
              {mapIdResult && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p><strong>Lớp:</strong> {mapIdResult.grade}</p>
                        <p><strong>Môn:</strong> {mapIdResult.subject}</p>
                        <p><strong>Chương:</strong> {mapIdResult.chapter}</p>
                      </div>
                      <div>
                        <p><strong>Bài:</strong> {mapIdResult.lesson}</p>
                        <p><strong>Mức độ:</strong> {mapIdResult.level}</p>
                        <p><strong>Format:</strong> {mapIdResult.format}</p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Xem trước câu hỏi</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Chức năng xem trước sẽ được triển khai trong phiên bản tiếp theo.
                  Hiện tại bạn có thể sử dụng chức năng xem trước trong tab Form.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
