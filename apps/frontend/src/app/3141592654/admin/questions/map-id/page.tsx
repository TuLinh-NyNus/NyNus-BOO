'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Map, 
  Search, 
  Copy,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Info
} from 'lucide-react';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Badge,
  Alert,
  AlertDescription,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';
import { useToast } from '@/components/ui/feedback/use-toast';
import { ErrorBoundary } from '@/components/ui/feedback/error-boundary';

import { QuestionCode } from '@/types/question';
import { MockQuestionsService } from '@/services/mock/questions';
import { ADMIN_PATHS } from '@/lib/admin-paths';

/**
 * Map ID Questions Page
 * Trang công cụ tra cứu và giải mã MapID, gợi ý questionCodeId
 */
export default function MapIdQuestionsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // State cho Map ID decoder
  const [inputCode, setInputCode] = useState('');
  const [decodedResult, setDecodedResult] = useState<QuestionCode | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodeError, setDecodeError] = useState<string | null>(null);

  /**
   * Handle decode Map ID
   */
  const handleDecodeMapId = async () => {
    if (!inputCode.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập mã câu hỏi',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsDecoding(true);
      setDecodeError(null);

      const result = await MockQuestionsService.decodeMapId(inputCode.trim());
      
      if (result.error) {
        setDecodeError(result.error);
        setDecodedResult(null);
      } else if (result.data) {
        setDecodedResult(result.data);
        setDecodeError(null);
        toast({
          title: 'Thành công',
          description: 'Đã giải mã thành công',
          variant: 'success'
        });
      }
    } catch (error) {
      console.error('Lỗi khi giải mã Map ID:', error);
      setDecodeError('Không thể giải mã mã câu hỏi');
      setDecodedResult(null);
    } finally {
      setIsDecoding(false);
    }
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
   * Handle use sample code
   */
  const handleUseSampleCode = (code: string) => {
    setInputCode(code);
    setDecodedResult(null);
    setDecodeError(null);
  };

  // Sample codes for testing
  const sampleCodes = [
    { code: '0P1VH1', description: 'Lớp 10, Toán, Chương 1, Bài V, Dạng 1, Thông hiểu' },
    { code: '2P5VN', description: 'Lớp 12, Toán, Chương 5, Bài V, Nhận biết' },
    { code: '1L3HC2', description: 'Lớp 11, Vật lý, Chương 3, Bài H, Dạng 2, Vận dụng cao' }
  ];

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
              <h1 className="text-3xl font-bold text-gray-900">Map ID Decoder</h1>
              <p className="text-gray-600 mt-1">
                Công cụ tra cứu và giải mã mã câu hỏi (Question Code ID)
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => router.push(ADMIN_PATHS.QUESTIONS)}
            >
              Quản lý câu hỏi
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Decoder input */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Giải mã Map ID
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="mapIdInput">Mã câu hỏi (Question Code ID)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="mapIdInput"
                      placeholder="Ví dụ: 0P1VH1"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleDecodeMapId();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleDecodeMapId}
                      disabled={isDecoding || !inputCode.trim()}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Giải mã
                    </Button>
                  </div>
                </div>

                {/* Sample codes */}
                <div>
                  <Label className="text-sm font-medium">Mã mẫu:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sampleCodes.map((sample, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleUseSampleCode(sample.code)}
                      >
                        {sample.code}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Decode error */}
                {decodeError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{decodeError}</AlertDescription>
                  </Alert>
                )}

                {/* Format guide */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Định dạng mã:</strong>
                    <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                      <li><strong>ID5:</strong> [Grade][Subject][Chapter][Lesson][Level] (5 ký tự)</li>
                      <li><strong>ID6:</strong> [Grade][Subject][Chapter][Lesson][Form][Level] (6 ký tự)</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Encoding guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Hướng dẫn mã hóa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Lớp (Grade):</h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <span>0 = Lớp 10</span>
                      <span>1 = Lớp 11</span>
                      <span>2 = Lớp 12</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Môn học (Subject):</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span>P = Toán học</span>
                      <span>L = Vật lý</span>
                      <span>H = Hóa học</span>
                      <span>S = Sinh học</span>
                      <span>V = Văn học</span>
                      <span>A = Tiếng Anh</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Mức độ (Level):</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span>N = Nhận biết</span>
                      <span>H = Thông hiểu</span>
                      <span>V = Vận dụng</span>
                      <span>C = Vận dụng cao</span>
                      <span>T = VIP</span>
                      <span>M = Note</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Decode result */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Kết quả giải mã
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!decodedResult && !decodeError && (
                  <div className="text-center py-8 text-gray-500">
                    <Map className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nhập mã câu hỏi và nhấn &quot;Giải mã&quot; để xem kết quả</p>
                  </div>
                )}

                {decodedResult && (
                  <div className="space-y-4">
                    {/* Decoded information */}
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-green-900">
                          Mã: {decodedResult.code}
                        </h3>
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            {decodedResult.format}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyToClipboard(decodedResult.code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Lớp:</TableCell>
                            <TableCell>
                              Lớp {decodedResult.grade === '0' ? '10' : decodedResult.grade === '1' ? '11' : '12'}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Môn học:</TableCell>
                            <TableCell>
                              {decodedResult.subject === 'P' && 'Toán học'}
                              {decodedResult.subject === 'L' && 'Vật lý'}
                              {decodedResult.subject === 'H' && 'Hóa học'}
                              {decodedResult.subject === 'S' && 'Sinh học'}
                              {decodedResult.subject === 'V' && 'Văn học'}
                              {decodedResult.subject === 'A' && 'Tiếng Anh'}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Chương:</TableCell>
                            <TableCell>Chương {decodedResult.chapter}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Bài học:</TableCell>
                            <TableCell>Bài {decodedResult.lesson}</TableCell>
                          </TableRow>
                          {decodedResult.form && (
                            <TableRow>
                              <TableCell className="font-medium">Dạng bài:</TableCell>
                              <TableCell>Dạng {decodedResult.form}</TableCell>
                            </TableRow>
                          )}
                          <TableRow>
                            <TableCell className="font-medium">Mức độ:</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {decodedResult.level === 'N' && 'Nhận biết'}
                                {decodedResult.level === 'H' && 'Thông hiểu'}
                                {decodedResult.level === 'V' && 'Vận dụng'}
                                {decodedResult.level === 'C' && 'Vận dụng cao'}
                                {decodedResult.level === 'T' && 'VIP'}
                                {decodedResult.level === 'M' && 'Note'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => router.push(`${ADMIN_PATHS.QUESTIONS_CREATE}?code=${decodedResult.code}`)}
                        className="flex-1"
                      >
                        Tạo câu hỏi với mã này
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`${ADMIN_PATHS.QUESTIONS}?codePrefix=${decodedResult.code}`)}
                      >
                        Tìm câu hỏi tương tự
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Examples table */}
        <Card>
          <CardHeader>
            <CardTitle>Ví dụ mã câu hỏi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã</TableHead>
                    <TableHead>Định dạng</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleCodes.map((sample, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {sample.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {sample.code.length === 5 ? 'ID5' : 'ID6'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {sample.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUseSampleCode(sample.code)}
                          >
                            Sử dụng
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyToClipboard(sample.code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}
