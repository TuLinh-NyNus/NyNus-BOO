'use client';

import { motion } from 'framer-motion';
import { 
  Play, 
  Clock, 
  CheckCircle, 
  Trophy,
  Target,
  ArrowLeft,
  BookOpen,
  BarChart3,
  Filter,
  Search,
  Star,
  Award,
  TrendingUp
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { CourseNavigation, CourseBreadcrumb } from '@/components/features/courses/navigation/course-navigation';
import { MathBackground } from '@/components/features/courses/ui/math-background';
import { Button, Progress, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Skeleton } from "@/components/ui/display/skeleton";
import { Input } from "@/components/ui/form/input";
import { getChaptersByCourseId, getQuizzesByCourseId } from '@/lib/mock-data/course-details';
import { getCourseBySlug } from '@/lib/mock-data/courses';
import { MockCourse, MockQuiz, MockChapter } from '@/lib/mock-data/types';
import logger from '@/lib/utils/logger';

export default function CourseQuizzesPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [course, setCourse] = useState<MockCourse | null>(null);
  const [quizzes, setQuizzes] = useState<MockQuiz[]>([]);
  const [chapters, setChapters] = useState<MockChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    const loadQuizData = async () => {
      try {
        setIsLoading(true);
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const courseData = getCourseBySlug(slug);
        if (!courseData) {
          router.push('/courses');
          return;
        }

        const chaptersData = getChaptersByCourseId(courseData.id);
        const quizzesData = getQuizzesByCourseId(courseData.id);

        setCourse(courseData);
        setChapters(chaptersData);
        setQuizzes(quizzesData);
      } catch (error) {
        logger.error('Error loading quiz data:', error);
        router.push('/courses');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      loadQuizData();
    }
  }, [slug, router]);

  const handleQuizClick = (quizId: string) => {
    router.push(`/courses/${slug}/exercises/${quizId}`);
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChapter = selectedChapter === 'all' || quiz.chapterId === selectedChapter;
    
    return matchesSearch && matchesChapter;
  });

  const calculateQuizStats = () => {
    const total = quizzes.length;
    const completed = quizzes.filter(quiz => quiz.isCompleted).length;
    const averageScore = quizzes
      .filter(quiz => quiz.bestScore !== undefined)
      .reduce((acc, quiz) => acc + (quiz.bestScore || 0), 0) / 
      Math.max(1, quizzes.filter(quiz => quiz.bestScore !== undefined).length);

    return {
      total,
      completed,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      averageScore: Math.round(averageScore)
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <MathBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <Skeleton className="h-8 w-64 bg-slate-700" />
              <Skeleton className="h-32 w-full bg-slate-700" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full bg-slate-700" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-40 w-full bg-slate-700" />
              <Skeleton className="h-60 w-full bg-slate-700" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <MathBackground />
        <div className="relative z-10 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Không tìm thấy khóa học</h1>
          <Button onClick={() => router.push('/courses')}>
            Quay lại danh sách khóa học
          </Button>
        </div>
      </div>
    );
  }

  const stats = calculateQuizStats();

  return (
    <div className="min-h-screen relative">
      <MathBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <CourseBreadcrumb />

        {/* Course Navigation */}
        <CourseNavigation />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.push(`/courses/${slug}`)}
              className="text-white hover:bg-slate-700/50"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Quay lại khóa học
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Bài tập & Kiểm tra</h1>
              <p className="text-slate-300">{course.title}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-3 mx-auto">
                        <BookOpen className="h-6 w-6 text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">{stats.total}</div>
                      <div className="text-sm text-slate-400">Tổng bài tập</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-3 mx-auto">
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">{stats.completed}</div>
                      <div className="text-sm text-slate-400">Đã hoàn thành</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mb-3 mx-auto">
                        <TrendingUp className="h-6 w-6 text-purple-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">{stats.progress}%</div>
                      <div className="text-sm text-slate-400">Tiến độ</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-yellow-500/20 rounded-full mb-3 mx-auto">
                        <Star className="h-6 w-6 text-yellow-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">{stats.averageScore}</div>
                      <div className="text-sm text-slate-400">Điểm TB</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm bài tập..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-600 text-white"
                />
              </div>
              
              <Select value={selectedChapter} onValueChange={setSelectedChapter}>
                <SelectTrigger className="w-full sm:w-48 bg-slate-800/50 border-slate-600 text-white">
                  <SelectValue placeholder="Chọn chương" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all">Tất cả chương</SelectItem>
                  {chapters.map((chapter) => (
                    <SelectItem key={chapter.id} value={chapter.id}>
                      Chương {chapter.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
