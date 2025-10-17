'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Download
} from 'lucide-react';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Alert,
  AlertDescription,
  Badge,
  Progress
} from '@/components/ui';
import { useToast } from '@/components/ui/feedback/use-toast';
import { ErrorBoundary } from '@/components/common/error-boundary';

import { QuestionLatexService, ImportLatexResponse } from '@/services/grpc/question-latex.service';
import { ADMIN_PATHS } from '@/lib/admin-paths';

/**
 * Input Auto Questions Page
 * Trang upload file tự động để import câu hỏi hàng loạt
 */
export default function InputAutoQuestionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State cho file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportLatexResponse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  /**
   * Handle file selection
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['.txt', '.tex', '.csv', '.json'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: 'Lỗi',
        description: 'Chỉ hỗ trợ file .txt, .tex, .csv, .json',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Lỗi',
        description: 'File không được vượt quá 10MB',
        variant: 'destructive'
      });
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
    setImportResult(null);
  };

  /**
   * Handle file upload and processing
   * Uses QuestionLatexService.importLatex to import all questions at once
   */
  const handleUploadFile = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Read file content
      const fileContent = await selectedFile.text();

      // Import questions using QuestionLatexService
      const result = await QuestionLatexService.importLatex(
        { latex: fileContent },
        {
          upsertMode: false,      // Don't update existing questions
          autoCreateCodes: true,  // Auto-create question codes
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.error_count > 0) {
        const errorMessages = result.errors.map(e =>
          `Question ${e.index}: ${e.error}`
        ).join('\n');
        setUploadError(errorMessages);
        setImportResult(result);

        toast({
          title: 'Hoàn thành với lỗi',
          description: `Đã import ${result.created_count}/${result.total_processed} câu hỏi. ${result.error_count} lỗi.`,
          variant: 'destructive'
        });
      } else {
        setImportResult(result);
        setUploadError(null);

        const warningMessage = result.warnings.length > 0
          ? ` Cảnh báo: ${result.warnings.join(', ')}`
          : '';

        toast({
          title: 'Thành công',
          description: `Đã import ${result.created_count} câu hỏi từ file.${warningMessage}`,
          variant: 'success'
        });

        // Redirect to questions list after successful import
        setTimeout(() => {
          router.push(ADMIN_PATHS.QUESTIONS);
        }, 2000);
      }
    } catch (error) {
      console.error('Lỗi khi upload file:', error);
      setUploadError(error instanceof Error ? error.message : 'Không thể xử lý file');
      setImportResult(null);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể xử lý file',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handle save all questions
   * Note: Questions are already imported by handleUploadFile
   * This function just redirects to questions list
   */
  const handleSaveAllQuestions = async () => {
    if (!importResult) return;

    toast({
      title: 'Thành công',
      description: `Đã import ${importResult.created_count} câu hỏi thành công`,
      variant: 'success'
    });

    router.push(ADMIN_PATHS.QUESTIONS);
  };

  /**
   * Handle clear all
   */
  const handleClearAll = () => {
    setSelectedFile(null);
    setImportResult(null);
    setUploadProgress(0);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
              <h1 className="text-3xl font-bold text-foreground">Nhập tự động</h1>
              <p className="text-muted-foreground mt-1">
                Upload file để import câu hỏi hàng loạt
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

        {/* Upload section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload file câu hỏi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File input */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.tex,.csv,.json"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              
              {!selectedFile ? (
                <div>
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Chọn file để upload
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Hỗ trợ file .txt, .tex, .csv, .json (tối đa 10MB)
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Chọn file
                  </Button>
                </div>
              ) : (
                <div>
                  <FileText className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {selectedFile.name}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Kích thước: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      onClick={handleUploadFile}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Xử lý file
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Chọn file khác
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Upload progress */}
            {isUploading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Đang xử lý file...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {/* Upload error */}
            {uploadError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            {/* File format help */}
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>Định dạng file hỗ trợ:</strong>
                <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                  <li><strong>.txt</strong> - File text thuần với câu hỏi và đáp án</li>
                  <li><strong>.tex</strong> - File LaTeX với cú pháp \begin{`{ex}`}</li>
                  <li><strong>.csv</strong> - File CSV với cột: content, type, answers, correct_answer</li>
                  <li><strong>.json</strong> - File JSON với array của question objects</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Import Result Summary */}
        {importResult && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {importResult.error_count === 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  )}
                  Kết quả import
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleClearAll}
                  >
                    Xóa kết quả
                  </Button>
                  <Button
                    onClick={handleSaveAllQuestions}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Xem danh sách câu hỏi
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Summary Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Tổng số</p>
                    <p className="text-2xl font-bold text-blue-600">{importResult.total_processed}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Đã tạo</p>
                    <p className="text-2xl font-bold text-green-600">{importResult.created_count}</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600">Đã cập nhật</p>
                    <p className="text-2xl font-bold text-yellow-600">{importResult.updated_count}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600">Lỗi</p>
                    <p className="text-2xl font-bold text-red-600">{importResult.error_count}</p>
                  </div>
                </div>

                {/* Created Question Codes */}
                {importResult.created_codes.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Mã câu hỏi đã tạo:</h3>
                    <div className="flex flex-wrap gap-2">
                      {importResult.created_codes.map((code, index) => (
                        <Badge key={index} variant="outline">
                          {code}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {importResult.warnings.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Cảnh báo:</strong>
                      <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                        {importResult.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Errors */}
                {importResult.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Lỗi:</strong>
                      <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                        {importResult.errors.map((error, index) => (
                          <li key={index}>
                            Question {error.index}: {error.error}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sample files download */}
        <Card>
          <CardHeader>
            <CardTitle>File mẫu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <FileText className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-medium mb-1">sample.txt</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  File text với câu hỏi và đáp án
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Tải xuống
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <FileText className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-medium mb-1">sample.tex</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  File LaTeX với cú pháp chuẩn
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Tải xuống
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <FileText className="h-8 w-8 text-yellow-600 mb-2" />
                <h3 className="font-medium mb-1">sample.csv</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  File CSV với cấu trúc bảng
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Tải xuống
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <FileText className="h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-medium mb-1">sample.json</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  File JSON với object structure
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Tải xuống
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}
