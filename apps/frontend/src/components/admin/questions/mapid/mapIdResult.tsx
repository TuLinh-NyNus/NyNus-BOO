/**
 * MapID Result Component
 * Hiển thị kết quả giải mã MapID
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
  Button,
  Badge,
  Label,
  Alert,
  AlertDescription,
  Separator,
} from "@/components/ui";
import {
  CheckCircle,
  Copy,
  Info,
} from "lucide-react";

// Import types từ lib/types
import { QuestionCode } from "@/types/question";

/**
 * Props for MapIdResult component
 */
interface MapIdResultProps {
  result: QuestionCode;
  onCopy: (code: string) => void;
}

/**
 * MapID Result Component
 * Specialized component cho result display
 */
export function MapIdResult({
  result,
  onCopy,
}: MapIdResultProps) {
  /**
   * Mapping configurations
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
      "E": "Anh",
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
   * Get description for mapping
   */
  const getDescription = (type: string, value: string) => {
    const config = mappingConfig[type as keyof typeof mappingConfig];
    return config?.[value as keyof typeof config] || `Không xác định (${value})`;
  };

  return (
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
            onClick={() => onCopy(result.code)}
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
            <div className="font-mono text-lg font-bold">{result.code}</div>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Định dạng</Label>
            <Badge variant="outline" className="ml-2">{result.format}</Badge>
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
                <Badge variant="secondary">{result.grade}</Badge>
                <span className="text-sm">{getDescription("grade", result.grade)}</span>
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Môn học</Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{result.subject}</Badge>
                <span className="text-sm">{getDescription("subject", result.subject)}</span>
              </div>
            </div>

            {/* Chapter */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Chương</Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{result.chapter}</Badge>
                <span className="text-sm">Chương {result.chapter}</span>
              </div>
            </div>

            {/* Form (only for ID6) */}
            {result.form && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Dạng bài</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{result.form}</Badge>
                  <span className="text-sm">Dạng {result.form}</span>
                </div>
              </div>
            )}

            {/* Lesson */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Bài học</Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{result.lesson}</Badge>
                <span className="text-sm">Bài {result.lesson}</span>
              </div>
            </div>

            {/* Level */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Mức độ</Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{result.level}</Badge>
                <span className="text-sm">{getDescription("level", result.level)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Tóm tắt:</strong> Câu hỏi {getDescription("subject", result.subject)} 
            {" "}{getDescription("grade", result.grade)}, Chương {result.chapter}
            {result.form && `, Dạng ${result.form}`}, Bài {result.lesson}
            {" "}({getDescription("level", result.level)})
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
