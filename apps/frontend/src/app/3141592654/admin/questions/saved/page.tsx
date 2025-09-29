'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Bookmark, 
  Trash2, 
  Eye,
  Download,
  AlertTriangle,
  Plus
} from 'lucide-react';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Alert,
  AlertDescription
} from '@/components/ui';
import { useToast } from '@/components/ui/feedback/use-toast';
import { ErrorBoundary } from '@/components/ui/feedback/error-boundary';

import { 
  Question, 
  QuestionType, 
  QuestionDifficulty
} from '@/types/question';
import { ADMIN_PATHS } from '@/lib/admin-paths';
import { useSavedQuestions } from '@/hooks/useLocalStorage';

/**
 * Saved Questions Page
 * Trang xem câu hỏi đã lưu trong localStorage
 */
export default function SavedQuestionsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Sử dụng custom hook để quản lý saved questions
  const {
    questions: savedQuestions,
    removeQuestion,
    clearAll,
    exportToFile
  } = useSavedQuestions();

  // State cho selected question modal
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  /**
   * Handle delete saved question
   */
  const handleDeleteSavedQuestion = (questionId: string) => {
    try {
      removeQuestion(questionId);
      
      // Close modal if deleting selected question
      if (selectedQuestion?.id === questionId) {
        setSelectedQuestion(null);
      }
      
      toast({
        title: 'Thành công',
        description: 'Đã xóa câu hỏi khỏi danh sách lưu',
        variant: 'success'
      });
    } catch (error) {
      console.error('Lỗi khi xóa câu hỏi:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa câu hỏi',
        variant: 'destructive'
      });
    }
  };

  /**
   * Handle view question detail
   */
  const handleViewQuestion = (question: Question) => {
    setSelectedQuestion(question);
  };

  /**
   * Handle clear all saved questions
   */
  const handleClearAllSaved = () => {
    try {
      clearAll();
      setSelectedQuestion(null);
      
      toast({
        title: 'Thành công',
        description: 'Đã xóa tất cả câu hỏi đã lưu',
        variant: 'success'
      });
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa câu hỏi',
        variant: 'destructive'
      });
    }
  };

  /**
   * Handle export saved questions
   */
  const handleExportSaved = () => {
    const success = exportToFile();
    
    if (success) {
      toast({
        title: 'Thành công',
        description: 'Đã xuất file câu hỏi đã lưu',
        variant: 'success'
      });
    } else {
      toast({
        title: 'Lỗi',
        description: 'Không thể xuất file',
        variant: 'destructive'
      });
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
              <h1 className="text-3xl font-bold text-gray-900">Câu hỏi đã lưu</h1>
              <p className="text-gray-600 mt-1">
                Quản lý {savedQuestions.length} câu hỏi đã lưu trong localStorage
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {savedQuestions.length > 0 && (
              <>
                <Button 
                  variant="outline"
                  onClick={handleExportSaved}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Xuất file
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleClearAllSaved}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa tất cả
                </Button>
              </>
            )}
            <Button 
              onClick={() => router.push(ADMIN_PATHS.QUESTIONS)}
            >
              Quản lý câu hỏi
            </Button>
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              Danh sách câu hỏi đã lưu
            </CardTitle>
          </CardHeader>
          <CardContent>
            {savedQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bookmark className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có câu hỏi nào được lưu
                </h3>
                <p className="text-gray-600 mb-4">
                  Bạn chưa lưu câu hỏi nào vào localStorage
                </p>
                <Button
                  onClick={() => router.push(ADMIN_PATHS.QUESTIONS_INPUT_LATEX)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm câu hỏi mới
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nội dung</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Độ khó</TableHead>
                      <TableHead>Mã câu hỏi</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Ngày lưu</TableHead>
                      <TableHead className="w-24">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(savedQuestions as Question[]).map((question) => (
                      <TableRow key={(question as Question).id}>
                        <TableCell>
                          <div className="max-w-md">
                            <p className="font-medium text-gray-900 truncate">
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
                          {question.difficulty && (
                            <Badge variant="outline">
                              {question.difficulty === QuestionDifficulty.EASY && 'Dễ'}
                              {question.difficulty === QuestionDifficulty.MEDIUM && 'TB'}
                              {question.difficulty === QuestionDifficulty.HARD && 'Khó'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {question.questionCodeId}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(question as Question).tag.slice(0, 2).map((tag: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
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
                          <span className="text-sm text-gray-600">
                            {new Date(question.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewQuestion(question)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteSavedQuestion(question.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* localStorage info */}
        {savedQuestions.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Lưu ý:</strong> Câu hỏi được lưu trong localStorage của trình duyệt. 
              Dữ liệu sẽ bị mất nếu xóa cache hoặc dữ liệu trình duyệt. 
              Hãy xuất file để sao lưu dữ liệu quan trọng.
            </AlertDescription>
          </Alert>
        )}

        {/* Question detail modal */}
        {selectedQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Chi tiết câu hỏi</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedQuestion(null)}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Nội dung:</h3>
                    <p className="text-gray-700">{selectedQuestion.content}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-1">Loại:</h4>
                      {renderQuestionTypeBadge(selectedQuestion.type)}
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Độ khó:</h4>
                      {selectedQuestion.difficulty && (
                        <Badge variant="outline">
                          {selectedQuestion.difficulty === QuestionDifficulty.EASY && 'Dễ'}
                          {selectedQuestion.difficulty === QuestionDifficulty.MEDIUM && 'Trung bình'}
                          {selectedQuestion.difficulty === QuestionDifficulty.HARD && 'Khó'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {selectedQuestion.solution && (
                    <div>
                      <h4 className="font-medium mb-2">Lời giải:</h4>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-blue-800">{selectedQuestion.solution}</p>
                      </div>
                    </div>
                  )}

                  {selectedQuestion.tag.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Tags:</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedQuestion.tag.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={() => router.push(`/3141592654/admin/questions/${selectedQuestion.id}/edit`)}
                      className="flex-1"
                    >
                      Chỉnh sửa
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleDeleteSavedQuestion(selectedQuestion.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
