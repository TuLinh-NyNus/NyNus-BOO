'use client';

import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Star,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// Components
import { CourseBreadcrumb } from '@/components/features/courses/navigation/course-navigation';
import { MathBackground } from '@/components/features/courses/ui/math-background';
import { QuizInterface } from '@/components/features/courses/ui/quiz-interface';
import { Button } from '@/components/ui';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { useToast } from '@/hooks/use-toast';

// Mock Data
import { getQuizById } from '@/lib/mock-data/course-details';
import { getCourseBySlug } from '@/lib/mock-data/courses';
import { MockCourse, MockQuiz } from '@/lib/mock-data/types';
import logger from '@/lib/utils/logger';

export default function QuizDetailPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const quizId = params.quizId as string;
  const { toast } = useToast();

  const [course, setCourse] = useState<MockCourse | null>(null);
  const [quiz, setQuiz] = useState<MockQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuizInterface, setShowQuizInterface] = useState(false);
  const [quizAttempts, setQuizAttempts] = useState(0);

  useEffect(() => {
    const loadQuizData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Load course data
        const courseData = getCourseBySlug(slug);
        if (!courseData) {
          router.push('/courses');
          return;
        }

        // Load quiz data
        const quizData = getQuizById(quizId);
        if (!quizData) {
          router.push(`/courses/${slug}/exercises`);
          return;
        }

        setCourse(courseData);
        setQuiz(quizData);
        setQuizAttempts(quizData.attempts || 0);
      } catch (error) {
        logger.error('Error loading quiz data:', error);
        toast({
          title: 'Lỗi',
          description: 'Có lỗi xảy ra khi tải dữ liệu bài tập',
          variant: 'destructive'
        });
        router.push('/courses');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug && quizId) {
      loadQuizData();
    }
  }, [slug, quizId, router]);

  const handleStartQuiz = () => {
    setShowQuizInterface(true);
  };

  const handleQuizSubmit = (answers: Record<string, string>, score: number) => {
    // In real app, this would save to backend
    setQuizAttempts(prev => prev + 1);
    
    // Update quiz completion status
    if (quiz) {
      setQuiz(prev => prev ? {
        ...prev,
        isCompleted: true,
        bestScore: Math.max(prev.bestScore || 0, score)
      } : null);
    }

    toast({
      title: `Bài tập đã được nộp! Điểm số: ${score}%`,
      description: score >= (quiz?.passingScore || 70) ? 'Chúc mừng bạn đã vượt qua!' : 'Hãy thử lại để đạt điểm cao hơn',
      variant: 'success'
    });
  };

  const handleExitQuiz = () => {
    setShowQuizInterface(false);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} phút`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <MathBackground />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Đang tải bài tập...</h2>
          <p className="text-slate-400">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (!course || !quiz) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <MathBackground />
        <div className="relative z-10 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Không tìm thấy bài tập</h1>
          <p className="text-slate-400 mb-6">Bài tập bạn đang tìm kiếm không tồn tại hoặc đã bị xóa</p>
          <Button onClick={() => router.push('/courses')}>
            Quay lại danh sách khóa học
          </Button>
        </div>
      </div>
    );
  }

  if (showQuizInterface) {
    return (
      <div className="min-h-screen relative">
        <MathBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <QuizInterface
            quiz={quiz}
            onSubmit={handleQuizSubmit}
            onExit={handleExitQuiz}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <MathBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <CourseBreadcrumb />

        {/* Course Info Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => router.push(`/courses/${slug}/exercises`)}
                    className="text-slate-400 hover:text-white hover:bg-slate-700/50"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay lại bài tập
                  </Button>
                  <div>
                    <h1 className="text-xl font-semibold text-white">{course.title}</h1>
                    <p className="text-slate-400">Bài tập: {quiz.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students} học viên</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                  {course.level}
                </Badge>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                  {course.category}
                </Badge>
                {quiz.isCompleted && (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Đã hoàn thành
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quiz Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quiz Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">{quiz.title}</CardTitle>
                  <p className="text-slate-400 text-lg">{quiz.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Quiz Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400">{quiz.questions.length}</div>
                      <div className="text-sm text-slate-400">Câu hỏi</div>
                    </div>
                    <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">{formatDuration(quiz.timeLimit)}</div>
                      <div className="text-sm text-slate-400">Thời gian</div>
                    </div>
                    <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">{quiz.passingScore}%</div>
                      <div className="text-sm text-slate-400">Điểm đạt</div>
                    </div>
                    <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-400">{quizAttempts}</div>
                      <div className="text-sm text-slate-400">Lần làm</div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Hướng dẫn làm bài</h3>
                    <div className="space-y-2 text-slate-300">
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 mt-0.5 text-blue-400" />
                        <span>Thời gian làm bài: {formatDuration(quiz.timeLimit)}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Target className="h-4 w-4 mt-0.5 text-green-400" />
                        <span>Điểm tối thiểu để đạt: {quiz.passingScore}%</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <BarChart3 className="h-4 w-4 mt-0.5 text-purple-400" />
                        <span>Tổng số câu hỏi: {quiz.questions.length}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-400" />
                        <span>Bạn có thể làm lại bài tập nhiều lần</span>
                      </div>
                    </div>
                  </div>

                  {/* Best Score */}
                  {quiz.bestScore && quiz.bestScore > 0 && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-semibold">Điểm cao nhất: {quiz.bestScore}%</span>
                      </div>
                    </div>
                  )}

                  {/* Start Button */}
                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={handleStartQuiz}
                      size="lg"
                      className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3"
                    >
                      {quiz.isCompleted ? 'Làm lại bài tập' : 'Bắt đầu làm bài'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Thống kê nhanh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Trạng thái:</span>
                    <span className={quiz.isCompleted ? "text-green-400" : "text-yellow-400"}>
                      {quiz.isCompleted ? "Đã hoàn thành" : "Chưa làm"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Số lần làm:</span>
                    <span className="text-white">{quizAttempts}</span>
                  </div>
                  {quiz.bestScore && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Điểm cao nhất:</span>
                      <span className="text-green-400">{quiz.bestScore}%</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Độ khó:</span>
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
                      Trung bình
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Mẹo làm bài</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <span>Đọc kỹ đề bài trước khi chọn đáp án</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <span>Sử dụng tính năng đánh dấu cho câu khó</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <span>Quản lý thời gian hợp lý</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <span>Kiểm tra lại đáp án trước khi nộp</span>
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
