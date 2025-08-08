/**
 * Admin Questions MapID Page
 * Trang công cụ tra cứu và giải mã MapID trong admin panel
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
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";

import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Map,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Copy,
  BookOpen,
} from "lucide-react";

// Import mock service
import { mockQuestionsService } from "@/lib/services/mock/questions";

// Import admin paths
import { ADMIN_PATHS } from "@/lib/admin-paths";

/**
 * MapID Page Component
 */
export default function MapIdPage() {
  const router = useRouter();
  const { toast } = useToast();

  // State management
  const [mapCode, setMapCode] = useState("");
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodedResult, setDecodedResult] = useState<{
    grade: string;
    subject: string;
    chapter: string;
    lesson: string;
    form?: string;
    level: string;
    description: string;
  } | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);

  // Sample MapID codes for reference
  const sampleCodes = [
    { code: "2P5VN", description: "Toán 12, Chương 5, Bài V, Mức độ Nhận biết" },
    { code: "0P1VH1", description: "Toán 10, Chương 1, Bài V, Mức độ Hiểu, Dạng 1" },
    { code: "1L3TM", description: "Vật lý 11, Chương 3, Bài T, Mức độ Vận dụng thấp" },
    { code: "2H2NC", description: "Hóa học 12, Chương 2, Bài N, Mức độ Vận dụng cao" },
  ];

  /**
   * Handle MapID decoding
   */
  const handleDecodeMapId = async () => {
    if (!mapCode.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã MapID",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsDecoding(true);
      setDecodeError(null);

      const response = await mockQuestionsService.decodeMapId({
        code: mapCode.trim().toUpperCase()
      });

      if (response.success && response.decoded) {
        setDecodedResult(response.decoded);
        toast({
          title: "Thành công",
          description: "Giải mã MapID thành công!",
          variant: "success"
        });
      } else {
        setDecodeError(response.error || "Không thể giải mã MapID");
        setDecodedResult(null);
      }
    } catch (error) {
      console.error("Error decoding MapID:", error);
      setDecodeError("Có lỗi xảy ra khi giải mã MapID");
      setDecodedResult(null);
    } finally {
      setIsDecoding(false);
    }
  };

  /**
   * Handle copy to clipboard
   */
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Thành công",
        description: "Đã sao chép vào clipboard",
        variant: "success"
      });
    }).catch(() => {
      toast({
        title: "Lỗi",
        description: "Không thể sao chép",
        variant: "destructive"
      });
    });
  };

  /**
   * Handle sample code click
   */
  const handleSampleCodeClick = (code: string) => {
    setMapCode(code);
    setDecodedResult(null);
    setDecodeError(null);
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
    setMapCode("");
    setDecodedResult(null);
    setDecodeError(null);
  };

  return (
    <div className="map-id-page space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Công cụ MapID</h1>
            <p className="text-muted-foreground">
              Tra cứu và giải mã mã câu hỏi MapID
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
        {/* MapID Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Nhập MapID
            </CardTitle>
            <CardDescription>
              Nhập mã MapID để giải mã thông tin câu hỏi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="map-code">Mã MapID</Label>
              <Input
                id="map-code"
                placeholder="VD: 2P5VN hoặc 0P1VH1"
                value={mapCode}
                onChange={(e) => setMapCode(e.target.value.toUpperCase())}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Định dạng: [Lớp][Môn][Chương][Mức độ][Bài][-Dạng] (tùy chọn)
              </p>
            </div>

            <Button 
              onClick={handleDecodeMapId} 
              disabled={isDecoding || !mapCode.trim()}
              className="w-full"
            >
              {isDecoding ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Đang giải mã...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Giải mã MapID
                </>
              )}
            </Button>

            {/* Decode Error */}
            {decodeError && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                <div className="text-sm text-destructive">
                  <p className="font-medium">Lỗi giải mã MapID:</p>
                  <p>{decodeError}</p>
                </div>
              </div>
            )}

            {/* Sample Codes */}
            <div className="space-y-2">
              <Label>Mã mẫu để thử nghiệm:</Label>
              <div className="space-y-2">
                {sampleCodes.map((sample) => (
                  <div
                    key={sample.code}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => handleSampleCodeClick(sample.code)}
                  >
                    <div>
                      <p className="font-mono font-medium">{sample.code}</p>
                      <p className="text-xs text-muted-foreground">{sample.description}</p>
                    </div>
                    <Button size="sm" variant="ghost">
                      Thử
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Decode Result */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Kết quả giải mã
            </CardTitle>
            <CardDescription>
              Thông tin chi tiết về mã MapID
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isDecoding ? (
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
            ) : decodedResult ? (
              <div className="space-y-4">
                <div className="flex items-start gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                  <div className="text-sm text-success">
                    <p className="font-medium">Giải mã thành công!</p>
                    <p>Mã {mapCode} đã được phân tích</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Lớp:</Label>
                      <p className="text-sm text-muted-foreground">{decodedResult.grade}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Môn học:</Label>
                      <p className="text-sm text-muted-foreground">{decodedResult.subject}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Chương:</Label>
                      <p className="text-sm text-muted-foreground">{decodedResult.chapter}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Bài học:</Label>
                      <p className="text-sm text-muted-foreground">{decodedResult.lesson}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Mức độ:</Label>
                      <p className="text-sm text-muted-foreground">{decodedResult.level}</p>
                    </div>
                    {decodedResult.form && (
                      <div>
                        <Label className="text-sm font-medium">Dạng bài:</Label>
                        <p className="text-sm text-muted-foreground">{decodedResult.form}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Mô tả đầy đủ:</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-muted-foreground flex-1">
                        {decodedResult.description}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyToClipboard(decodedResult.description)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Label className="text-sm font-medium">Cấu trúc mã:</Label>
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg font-mono text-sm">
                      <div className="grid grid-cols-5 gap-2 text-center">
                        <div className="p-2 bg-blue-100 rounded">
                          <div className="font-bold text-blue-800">{mapCode[0]}</div>
                          <div className="text-xs text-blue-600">Lớp</div>
                        </div>
                        <div className="p-2 bg-green-100 rounded">
                          <div className="font-bold text-green-800">{mapCode[1]}</div>
                          <div className="text-xs text-green-600">Môn</div>
                        </div>
                        <div className="p-2 bg-yellow-100 rounded">
                          <div className="font-bold text-yellow-800">{mapCode[2]}</div>
                          <div className="text-xs text-yellow-600">Chương</div>
                        </div>
                        <div className="p-2 bg-purple-100 rounded">
                          <div className="font-bold text-purple-800">{mapCode[3]}</div>
                          <div className="text-xs text-purple-600">Mức độ</div>
                        </div>
                        <div className="p-2 bg-red-100 rounded">
                          <div className="font-bold text-red-800">{mapCode[4]}</div>
                          <div className="text-xs text-red-600">Bài</div>
                        </div>
                      </div>
                      {mapCode.includes('-') && (
                        <div className="mt-2 text-center">
                          <div className="inline-block p-2 bg-orange-100 rounded">
                            <div className="font-bold text-orange-800">{mapCode.split('-')[1]}</div>
                            <div className="text-xs text-orange-600">Dạng</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chưa có kết quả</h3>
                <p className="text-muted-foreground">
                  Nhập mã MapID và nhấn &quot;Giải mã MapID&quot; để xem kết quả
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* MapID Format Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn định dạng MapID</CardTitle>
          <CardDescription>
            Cấu trúc và ý nghĩa của mã MapID
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Lớp (Vị trí 1)</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>0</span>
                  <span>Lớp 10</span>
                </div>
                <div className="flex justify-between">
                  <span>1</span>
                  <span>Lớp 11</span>
                </div>
                <div className="flex justify-between">
                  <span>2</span>
                  <span>Lớp 12</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Môn học (Vị trí 2)</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>P</span>
                  <span>Toán học</span>
                </div>
                <div className="flex justify-between">
                  <span>L</span>
                  <span>Vật lý</span>
                </div>
                <div className="flex justify-between">
                  <span>H</span>
                  <span>Hóa học</span>
                </div>
                <div className="flex justify-between">
                  <span>S</span>
                  <span>Sinh học</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Mức độ (Vị trí 4)</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>N</span>
                  <span>Nhận biết</span>
                </div>
                <div className="flex justify-between">
                  <span>H</span>
                  <span>Thông hiểu</span>
                </div>
                <div className="flex justify-between">
                  <span>V</span>
                  <span>Vận dụng thấp</span>
                </div>
                <div className="flex justify-between">
                  <span>C</span>
                  <span>Vận dụng cao</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Lưu ý:</strong> Vị trí 3 và 5 là số chương và bài học (1-9, A-Z).
              Dạng bài (tùy chọn) được thêm sau dấu gạch ngang (-).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
