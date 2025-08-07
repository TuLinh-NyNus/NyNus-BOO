'use client';

import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  Star, 
  Users, 
  BookOpen,
  Play,
  FileText,
  Award,
  BarChart3
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";

interface ExamDetail {
  id: number;
  title: string;
  subject: string;
  topic: string;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  exams: number;
  rating: number;
  type: 'multiple' | 'essay' | 'mixed';
  teacherName: string;
  description: string;
  questionsCount: number;
  attemptsCount: number;
}

/**
 * Trang chi tiết bài thi
 */
export default function ExamDetailPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const examId = params.id as string;

  useEffect(() => {
    // Simulate loading exam data
    const loadExamData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock exam data - in real app, this would come from API
        const mockExam: ExamDetail = {
          id: parseInt(examId),
          title: `Đề thi số ${examId}`,
          subject: 'Toán',
          topic: 'Giải tích',
          duration: 120,
          difficulty: 'medium',
          exams: 1500,
          rating: 4.5,
          type: 'mixed',
          teacherName: 'Thầy Nguyễn Văn A',
          description: 'Đề thi thử THPT Quốc Gia môn Toán với các câu hỏi từ cơ bản đến nâng cao, giúp học sinh ôn tập và chuẩn bị tốt cho kỳ thi.',
          questionsCount: 50,
          attemptsCount: 2458
        };
        
        setExam(mockExam);
      } catch (error) {
        console.error('Error loading exam data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (examId) {
      loadExamData();
    }
  }, [examId]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      default: return 'Không xác định';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Đang tải thông tin bài thi...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Không tìm thấy bài thi</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Bài thi bạn đang tìm kiếm không tồn tại hoặc đã bị xóa</p>
          <Button onClick={() => router.push('/exams')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách bài thi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => router.push('/exams')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách bài thi
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Exam header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">{exam.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {exam.subject} - {exam.topic}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {exam.teacherName}
                        </span>
                      </div>
                    </div>
                    <Badge className={getDifficultyColor(exam.difficulty)}>
                      {getDifficultyText(exam.difficulty)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 dark:text-slate-300 mb-4">
                    {exam.description}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <Clock className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                      <div className="text-sm font-medium">{exam.duration} phút</div>
                      <div className="text-xs text-slate-500">Thời gian</div>
                    </div>
                    
                    <div className="text-center p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <FileText className="h-6 w-6 mx-auto mb-1 text-green-600" />
                      <div className="text-sm font-medium">{exam.questionsCount}</div>
                      <div className="text-xs text-slate-500">Câu hỏi</div>
                    </div>
                    
                    <div className="text-center p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <Star className="h-6 w-6 mx-auto mb-1 text-yellow-600" />
                      <div className="text-sm font-medium">{exam.rating}/5</div>
                      <div className="text-xs text-slate-500">Đánh giá</div>
                    </div>
                    
                    <div className="text-center p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <BarChart3 className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                      <div className="text-sm font-medium">{exam.attemptsCount}</div>
                      <div className="text-xs text-slate-500">Lượt thi</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bắt đầu làm bài</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" size="lg">
                    <Play className="h-4 w-4 mr-2" />
                    Bắt đầu làm bài
                  </Button>
                  
                  <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                    <div className="flex justify-between">
                      <span>Loại bài thi:</span>
                      <span className="font-medium">
                        {exam.type === 'multiple' ? 'Trắc nghiệm' : 
                         exam.type === 'essay' ? 'Tự luận' : 'Kết hợp'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thời gian:</span>
                      <span className="font-medium">{exam.duration} phút</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Số câu hỏi:</span>
                      <span className="font-medium">{exam.questionsCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thống kê</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Lượt thi:</span>
                    <span className="font-medium">{exam.attemptsCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Đánh giá:</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{exam.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Độ khó:</span>
                    <Badge className={getDifficultyColor(exam.difficulty)} variant="secondary">
                      {getDifficultyText(exam.difficulty)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
