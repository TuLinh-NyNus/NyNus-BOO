/**
 * MapID Decoder Component
 * Giải mã và hiển thị tham số từ code
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Button,
  Badge,
  Alert,
  AlertDescription,
  Label,
  Separator,
} from "@/components/ui";
import {
  Hash,
  Search,
  CheckCircle,
  Info,
  Copy,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/components/ui/feedback/use-toast";

// Import types từ lib/types
import { QuestionCode } from "@/lib/types/question";

/**
 * Props for MapIdDecoder component
 */
interface MapIdDecoderProps {
  code?: string;
  onDecode?: (result: QuestionCode) => void;
  className?: string;
}

/**
 * MapID Decoder Component
 * Comprehensive decoder cho MapID system với detailed explanations
 */
export function MapIdDecoder({
  code = "",
  onDecode,
  className = "",
}: MapIdDecoderProps) {
  const { toast } = useToast();

  // State management
  const [inputCode, setInputCode] = useState(code);
  const [decodedResult, setDecodedResult] = useState<QuestionCode | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [error, setError] = useState<string>("");

  /**
   * Mapping configurations cho decoding
   */
  const mappingConfig = {
    grade: {
      "0": "Lớp 10",
      "1": "Lớp 11", 
      "2": "Lớp 12",
      "A": "Lớp A",
      "B": "Lớp B",
      "C": "Lớp C",
    },
    subject: {
      "P": "Toán",
      "L": "Vật lý",
      "H": "Hóa học",
      "S": "Sinh học",
      "V": "Văn",
      "A": "Anh",
      "F": "Pháp",
      "R": "Nga",
      "G": "Địa lý",
      "T": "Lịch sử",
    },
    level: {
      "N": "Nhận biết",
      "H": "Thông hiểu", 
      "V": "Vận dụng",
      "C": "Vận dụng cao",
      "T": "VIP",
      "M": "Note",
    },
  };

  /**
   * Decode MapID function
   */
  const decodeMapId = useCallback(async (codeToDecod: string) => {
    if (!codeToDecod.trim()) {
      setError("Vui lòng nhập mã câu hỏi");
      return;
    }

    setIsDecoding(true);
    setError("");

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Parse code format
      const cleanCode = codeToDecod.trim().toUpperCase();
      
      // Validate code format (basic validation)
      if (cleanCode.length < 5) {
        throw new Error("Mã câu hỏi phải có ít nhất 5 ký tự");
      }

      // Determine format based on length and pattern
      let format: "ID5" | "ID6" = "ID5";
      let grade = "";
      let subject = "";
      let chapter = "";
      let lesson = "";
      let form = "";
      let level = "";

      if (cleanCode.length === 5) {
        // Format ID5: GSCLL (Grade-Subject-Chapter-Lesson-Level)
        format = "ID5";
        grade = cleanCode[0];
        subject = cleanCode[1];
        chapter = cleanCode[2];
        lesson = cleanCode[3];
        level = cleanCode[4];
      } else if (cleanCode.length === 6) {
        // Format ID6: GSCFLL (Grade-Subject-Chapter-Form-Lesson-Level)
        format = "ID6";
        grade = cleanCode[0];
        subject = cleanCode[1];
        chapter = cleanCode[2];
        form = cleanCode[3];
        lesson = cleanCode[4];
        level = cleanCode[5];
      } else {
        throw new Error("Định dạng mã câu hỏi không hợp lệ");
      }

      // Create decoded result
      const result: QuestionCode = {
        code: cleanCode,
        format,
        grade,
        subject,
        chapter,
        lesson,
        form: format === "ID6" ? form : undefined,
        level,
      };

      setDecodedResult(result);
      
      // Call callback if provided
      if (onDecode) {
        onDecode(result);
      }

      toast({
        title: "Thành công",
        description: "Đã giải mã MapID thành công",
        variant: "default",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Không thể giải mã MapID";
      setError(errorMessage);
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDecoding(false);
    }
  }, [onDecode, toast]);

  /**
   * Handle decode button click
   */
  const handleDecode = () => {
    decodeMapId(inputCode);
  };

  /**
   * Reset decoder
   */
  const resetDecoder = () => {
    setInputCode("");
    setDecodedResult(null);
    setError("");
  };

  /**
   * Copy code to clipboard
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Đã sao chép",
        description: "Mã câu hỏi đã được sao chép vào clipboard",
        variant: "default",
      });
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể sao chép vào clipboard",
        variant: "destructive",
      });
    }
  };

  /**
   * Get description for code component
   */
  const getDescription = (type: string, value: string) => {
    const config = mappingConfig[type as keyof typeof mappingConfig];
    return config?.[value as keyof typeof config] || `Không xác định (${value})`;
  };

  // Auto-decode when code prop changes
  useEffect(() => {
    if (code && code !== inputCode) {
      setInputCode(code);
      decodeMapId(code);
    }
  }, [code, inputCode, decodeMapId]);

  return (
    <div className={`mapid-decoder space-y-4 ${className}`}>
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            MapID Decoder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input Field */}
          <div className="space-y-2">
            <Label htmlFor="mapid-input">Mã câu hỏi</Label>
            <div className="flex gap-2">
              <Input
                id="mapid-input"
                placeholder="Nhập mã câu hỏi (VD: 2P5VN, 1L3HC2)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className={error ? "border-red-500" : ""}
              />
              <Button 
                onClick={handleDecode}
                disabled={isDecoding || !inputCode.trim()}
              >
                {isDecoding ? (
                  <>
                    <Search className="h-4 w-4 mr-2 animate-spin" />
                    Đang giải mã...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Giải mã
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={resetDecoder}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          {/* Format Info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p><strong>Format ID5:</strong> GSCLL (Lớp-Môn-Chương-Bài-Mức độ)</p>
                <p><strong>Format ID6:</strong> GSCFLL (Lớp-Môn-Chương-Dạng-Bài-Mức độ)</p>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Decoded Result */}
      {decodedResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Kết quả giải mã
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(decodedResult.code)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Sao chép
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Mã gốc</Label>
                <div className="font-mono text-lg font-bold">{decodedResult.code}</div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Định dạng</Label>
                <Badge variant="outline" className="ml-2">{decodedResult.format}</Badge>
              </div>
            </div>

            <Separator />

            {/* Detailed Breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium">Chi tiết thành phần:</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Grade */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Lớp</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{decodedResult.grade}</Badge>
                    <span className="text-sm">{getDescription("grade", decodedResult.grade)}</span>
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Môn học</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{decodedResult.subject}</Badge>
                    <span className="text-sm">{getDescription("subject", decodedResult.subject)}</span>
                  </div>
                </div>

                {/* Chapter */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Chương</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{decodedResult.chapter}</Badge>
                    <span className="text-sm">Chương {decodedResult.chapter}</span>
                  </div>
                </div>

                {/* Form (only for ID6) */}
                {decodedResult.form && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Dạng bài</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{decodedResult.form}</Badge>
                      <span className="text-sm">Dạng {decodedResult.form}</span>
                    </div>
                  </div>
                )}

                {/* Lesson */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Bài học</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{decodedResult.lesson}</Badge>
                    <span className="text-sm">Bài {decodedResult.lesson}</span>
                  </div>
                </div>

                {/* Level */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Mức độ</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{decodedResult.level}</Badge>
                    <span className="text-sm">{getDescription("level", decodedResult.level)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Tóm tắt:</strong> Câu hỏi {getDescription("subject", decodedResult.subject)} 
                {" "}{getDescription("grade", decodedResult.grade)}, Chương {decodedResult.chapter}
                {decodedResult.form && `, Dạng ${decodedResult.form}`}, Bài {decodedResult.lesson}
                {" "}({getDescription("level", decodedResult.level)})
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
