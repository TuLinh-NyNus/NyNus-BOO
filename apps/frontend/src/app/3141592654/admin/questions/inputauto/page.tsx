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
  Download,
  Eye,
  Save
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Progress
} from '@/components/ui';
import { useToast } from '@/components/ui/feedback/use-toast';
import { ErrorBoundary } from '@/components/common/error-boundary';

import {
  Question,
  QuestionType,
  QuestionStatus
} from '@/types/question';
import { MockQuestionsService } from '@/services/mock/questions';
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
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
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
    setParsedQuestions([]);
  };

  /**
   * Handle file upload and processing
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

      const result = await MockQuestionsService.uploadAutoFile(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.error) {
        setUploadError(result.error);
        setParsedQuestions([]);
      } else if (result.data) {
        setParsedQuestions(result.data);
        setUploadError(null);
        toast({
          title: 'Thành công',
          description: `Đã phân tích ${result.data.length} câu hỏi từ file`,
          variant: 'success'
        });
      }
    } catch (error) {
      console.error('Lỗi khi upload file:', error);
      setUploadError('Không thể xử lý file');
      setParsedQuestions([]);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handle save all questions
   */
  const handleSaveAllQuestions = async () => {
    if (parsedQuestions.length === 0) return;

    try {
      setIsUploading(true);

      // Save each question
      for (const question of parsedQuestions) {
        await MockQuestionsService.createQuestion({
          ...question,
          status: QuestionStatus.PENDING,
          usageCount: 0,
          creator: 'current-user'
        });
      }

      toast({
        title: 'Thành công',
        description: `Đã lưu ${parsedQuestions.length} câu hỏi thành công`,
        variant: 'success'
      });

      // Reset form
      setSelectedFile(null);
      setParsedQuestions([]);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      router.push(ADMIN_PATHS.QUESTIONS);
    } catch (error) {
      console.error('Lỗi khi lưu câu hỏi:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu câu hỏi',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handle clear all
   */
  const handleClearAll = () => {
    setSelectedFile(null);
    setParsedQuestions([]);
    setUploadProgress(0);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Render question type badge
   */
  const renderQuestionTypeBadge = (type: QuestionType) => {
    const typeLabels = {
      [QuestionType.MC]: 'Trắc nghiệm',
      [QuestionType.MULTIPLE_CHOICE]: 'Trắc nghiệm',
      [QuestionType.TF]: 'Đúng/Sai',
      [QuestionType.SA]: 'Tự luận ngắn',
      [QuestionType.ES]: 'Tự luận',
      [QuestionType.MA]: 'Ghép đôi'
    };

    const typeColors = {
      [QuestionType.MC]: 'bg-blue-100 text-blue-800',
      [QuestionType.MULTIPLE_CHOICE]: 'bg-blue-100 text-blue-800',
      [QuestionType.TF]: 'bg-green-100 text-green-800',
      [QuestionType.SA]: 'bg-yellow-100 text-yellow-800',
      [QuestionType.ES]: 'bg-purple-100 text-purple-800',
      [QuestionType.MA]: 'bg-pink-100 text-pink-800'
    };

    return (
      <Badge className={typeColors[type]}>
        {typeLabels[type]}
      </Badge>
    );
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

        {/* Parsed questions preview */}
        {parsedQuestions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Kết quả phân tích ({parsedQuestions.length} câu hỏi)
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={handleClearAll}
                  >
                    Xóa tất cả
                  </Button>
                  <Button 
                    onClick={handleSaveAllQuestions}
                    disabled={isUploading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Lưu tất cả
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Nội dung</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Mã câu hỏi</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedQuestions.map((question, index) => (
                      <TableRow key={question.id}>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <p className="font-medium text-foreground truncate">
                              {question.content}
                            </p>
                            {question.source && (
                              <p className="text-sm text-gray-500 truncate">
                                Nguồn: {question.source}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {renderQuestionTypeBadge(question.type)}
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {question.questionCodeId}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {question.tag.slice(0, 2).map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {question.tag.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{question.tag.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              // Preview question logic
                              console.log('Preview question:', question.id);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
