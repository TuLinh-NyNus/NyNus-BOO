/**
 * Admin Questions Input Auto Page
 * Trang nhập câu hỏi tự động từ file trong admin panel
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Upload,
  FileText,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  File,
  X,
} from "lucide-react";

// Import types
import { EnhancedQuestion, QuestionType, QuestionDifficulty } from "@/types/question";

// Import mock service
import { mockQuestionsService } from "@/lib/services/mock/questions";

// Import admin paths
import { ADMIN_PATHS } from "@/lib/admin-paths";

/**
 * Input Auto Page Component
 */
export default function InputAutoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<Partial<EnhancedQuestion>[]>([]);
  const [processError, setProcessError] = useState<string | null>(null);

  /**
   * Handle file selection
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['.tex', '.txt', '.csv'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        toast({
          title: "Lỗi",
          description: "Chỉ hỗ trợ file .tex, .txt, .csv",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Lỗi",
          description: "File không được vượt quá 10MB",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      setParsedQuestions([]);
      setProcessError(null);
    }
  };

  /**
   * Handle file upload and processing
   */
  const handleProcessFile = async () => {
    if (!selectedFile) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file để xử lý",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      setProcessError(null);

      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      const fileType = fileExtension === 'tex' ? 'latex' : fileExtension as 'txt' | 'csv' | 'latex';

      const response = await mockQuestionsService.uploadFile({
        file: selectedFile,
        type: fileType
      });

      if (response.success && response.questions) {
        setParsedQuestions(response.questions);
        toast({
          title: "Thành công",
          description: `Đã phân tích ${response.questions.length} câu hỏi từ file`,
          variant: "success"
        });
      } else {
        setProcessError(response.errors?.[0] || "Có lỗi xảy ra khi xử lý file");
        setParsedQuestions([]);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      setProcessError("Có lỗi xảy ra khi xử lý file");
      setParsedQuestions([]);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle save all questions
   */
  const handleSaveAllQuestions = async () => {
    if (parsedQuestions.length === 0) {
      toast({
        title: "Lỗi",
        description: "Không có câu hỏi để lưu",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      let savedCount = 0;
      let errorCount = 0;

      for (const question of parsedQuestions) {
        try {
          await mockQuestionsService.createQuestion({
            content: question.content || "",
            rawContent: question.rawContent || "",
            type: question.type || QuestionType.MC,
            difficulty: question.difficulty || QuestionDifficulty.MEDIUM,
            source: question.source,
            answers: question.answers,
            correctAnswer: question.correctAnswer,
            solution: question.solution,
            tag: question.tag || [],
            questionCodeId: question.questionCodeId || `AUTO-${Date.now()}-${savedCount}`,
          });
          savedCount++;
        } catch (error) {
          console.error("Error saving question:", error);
          errorCount++;
        }
      }

      if (errorCount === 0) {
        toast({
          title: "Thành công",
          description: `Đã lưu thành công ${savedCount} câu hỏi`,
          variant: "success"
        });
      } else {
        toast({
          title: "Hoàn thành với lỗi",
          description: `Đã lưu ${savedCount} câu hỏi, ${errorCount} câu hỏi lỗi`,
          variant: "destructive"
        });
      }

      // Reset form
      setSelectedFile(null);
      setParsedQuestions([]);
      setProcessError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Error saving questions:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi lưu câu hỏi",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
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
    setSelectedFile(null);
    setParsedQuestions([]);
    setProcessError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Format file size
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="input-auto-page space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Nhập câu hỏi tự động</h1>
            <p className="text-muted-foreground">
              Upload file để tự động tạo nhiều câu hỏi cùng lúc
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
        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload File
            </CardTitle>
            <CardDescription>
              Chọn file .tex, .txt hoặc .csv chứa câu hỏi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Input */}
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".tex,.txt,.csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                  <span className="font-medium">Nhấn để chọn file</span>
                  <br />
                  hoặc kéo thả file vào đây
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Hỗ trợ: .tex, .txt, .csv (tối đa 10MB)
                </p>
              </label>
            </div>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <File className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Process Button */}
            <Button 
              onClick={handleProcessFile} 
              disabled={isProcessing || !selectedFile}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Xử lý file
                </>
              )}
            </Button>

            {/* Process Error */}
            {processError && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                <div className="text-sm text-destructive">
                  <p className="font-medium">Lỗi xử lý file:</p>
                  <p>{processError}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Kết quả xử lý
            </CardTitle>
            <CardDescription>
              Danh sách câu hỏi được tạo từ file
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ) : parsedQuestions.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-start gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                  <div className="text-sm text-success">
                    <p className="font-medium">Xử lý thành công!</p>
                    <p>Đã tạo {parsedQuestions.length} câu hỏi từ file</p>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {parsedQuestions.map((question, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-muted/25">
                      <div className="space-y-2">
                        <p className="text-sm font-medium line-clamp-2">
                          {question.content || `Câu hỏi ${index + 1}`}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="outline">{question.type || "MC"}</Badge>
                          <Badge variant="outline">{question.difficulty || "MEDIUM"}</Badge>
                          {question.questionCodeId && (
                            <Badge variant="outline">{question.questionCodeId}</Badge>
                          )}
                        </div>
                        {question.tag && question.tag.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {question.tag.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {question.tag.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{question.tag.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={handleSaveAllQuestions} 
                  disabled={isProcessing}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Lưu tất cả câu hỏi ({parsedQuestions.length})
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chưa có kết quả</h3>
                <p className="text-muted-foreground">
                  Chọn file và nhấn &quot;Xử lý file&quot; để xem kết quả
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
