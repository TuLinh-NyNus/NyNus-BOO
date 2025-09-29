/**
 * MapID Tab Component
 * Tab xử lý MapID decoding cho câu hỏi
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
  Input,
  Button,
  Alert,
  AlertDescription,
  Badge,
  Label,
} from "@/components/ui";
import {
  Hash,
  Zap,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

// Import types từ lib/types
import { QuestionCode } from "@/types/question";

/**
 * Props for MapIdTab component
 */
interface MapIdTabProps {
  mapIdInput: string;
  onMapIdInputChange: (input: string) => void;
  decodedMapId: QuestionCode | null;
  onDecodedMapId: (result: QuestionCode | null) => void;
  onApplyToForm: (data: QuestionCode) => void;
}

/**
 * MapID Tab Component
 * Specialized component cho MapID processing
 */
export function MapIdTab({
  mapIdInput,
  onMapIdInputChange,
  decodedMapId,
  onDecodedMapId,
  onApplyToForm,
}: MapIdTabProps) {
  /**
   * Decode MapID
   */
  const handleDecodeMapId = () => {
    if (!mapIdInput.trim()) {
      onDecodedMapId(null);
      return;
    }

    try {
      // Mock MapID decoding logic
      const code = mapIdInput.trim().toUpperCase();
      
      if (code.length === 5) {
        // ID5 format: GSCLN (Grade, Subject, Chapter, Lesson, Level)
        const mockResult: QuestionCode = {
          code,
          format: 'ID5',
          grade: code[0],
          subject: code[1],
          chapter: code[2],
          lesson: code[3],
          level: code[4],
        };
        onDecodedMapId(mockResult);
      } else if (code.length === 6) {
        // ID6 format: GSCFLN (Grade, Subject, Chapter, Form, Lesson, Level)
        const mockResult: QuestionCode = {
          code,
          format: 'ID6',
          grade: code[0],
          subject: code[1],
          chapter: code[2],
          form: code[3],
          lesson: code[4],
          level: code[5],
        };
        onDecodedMapId(mockResult);
      } else {
        onDecodedMapId(null);
      }
    } catch (error) {
      console.error('MapID decoding error:', error);
      onDecodedMapId(null);
    }
  };

  /**
   * Apply decoded data to form
   */
  const handleApplyToForm = () => {
    if (decodedMapId) {
      onApplyToForm(decodedMapId);
    }
  };

  /**
   * Get description for mapping
   */
  const getDescription = (type: string, value: string) => {
    const mappings = {
      grade: { "2": "Lớp 12", "1": "Lớp 11", "0": "Lớp 10" },
      subject: { "P": "Toán", "L": "Vật lý", "H": "Hóa học", "S": "Sinh học" },
      level: { "N": "Nhận biết", "H": "Thông hiểu", "V": "Vận dụng", "C": "Vận dụng cao" },
    };
    
    const config = mappings[type as keyof typeof mappings];
    return config?.[value as keyof typeof config] || `Không xác định (${value})`;
  };

  return (
    <div className="space-y-4">
      {/* MapID Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Giải mã MapID
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mapid">Mã MapID (ID5 hoặc ID6)</Label>
            <Input
              id="mapid"
              placeholder="VD: 2P5VN hoặc 2P51VN"
              value={mapIdInput}
              onChange={(e) => onMapIdInputChange(e.target.value)}
              className="font-mono"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleDecodeMapId}
              disabled={!mapIdInput.trim()}
            >
              <Zap className="h-4 w-4 mr-2" />
              Giải mã
            </Button>
            
            {decodedMapId && (
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

      {/* Decode Result */}
      {decodedMapId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Kết quả giải mã
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Mã gốc</div>
                <div className="font-mono text-lg font-bold">{decodedMapId.code}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Định dạng</div>
                <Badge variant="outline">{decodedMapId.format}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Lớp</div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{decodedMapId.grade}</Badge>
                  <span className="text-sm">{getDescription("grade", decodedMapId.grade)}</span>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Môn học</div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{decodedMapId.subject}</Badge>
                  <span className="text-sm">{getDescription("subject", decodedMapId.subject)}</span>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Chương</div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{decodedMapId.chapter}</Badge>
                  <span className="text-sm">Chương {decodedMapId.chapter}</span>
                </div>
              </div>

              {decodedMapId.form && (
                <div>
                  <div className="text-sm text-muted-foreground">Dạng bài</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{decodedMapId.form}</Badge>
                    <span className="text-sm">Dạng {decodedMapId.form}</span>
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm text-muted-foreground">Bài học</div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{decodedMapId.lesson}</Badge>
                  <span className="text-sm">Bài {decodedMapId.lesson}</span>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Mức độ</div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{decodedMapId.level}</Badge>
                  <span className="text-sm">{getDescription("level", decodedMapId.level)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {mapIdInput.trim() && !decodedMapId && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Mã MapID không hợp lệ. Vui lòng nhập mã 5 hoặc 6 ký tự (VD: 2P5VN hoặc 2P51VN).
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
