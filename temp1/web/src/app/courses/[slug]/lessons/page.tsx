'use client';

import { motion } from 'framer-motion';
import { 
  Play, 
  Clock, 
  CheckCircle, 
  Lock, 
  BookOpen, 
  ArrowLeft,
  BarChart3,
  Target,
  Trophy,
  Calendar
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { CourseNavigation, CourseBreadcrumb } from '@/components/features/courses/navigation/course-navigation';
import { MathBackground } from '@/components/features/courses/ui/math-background';
import { Button, Progress } from '@/components/ui';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Skeleton } from "@/components/ui/display/skeleton";
import { getChaptersByCourseId } from '@/lib/mock-data/course-details';
import { getCourseBySlug } from '@/lib/mock-data/courses';
import { MockCourse, MockChapter, MockLesson } from '@/lib/mock-data/types';
import logger from '@/lib/utils/logger';

export default function CourseLearningPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [course, setCourse] = useState<MockCourse | null>(null);
  const [chapters, setChapters] = useState<MockChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<string>('');

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setIsLoading(true);
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const courseData = getCourseBySlug(slug);
        if (!courseData) {
          router.push('/courses');
          return;
        }

        const chaptersData = getChaptersByCourseId(courseData.id);

        setCourse(courseData);
        setChapters(chaptersData);
        
        // Set first chapter as selected by default
        if (chaptersData.length > 0) {
          setSelectedChapter(chaptersData[0].id);
        }
      } catch (error) {
        logger.error('Error loading course data:', error);
        router.push('/courses');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      loadCourseData();
    }
  }, [slug, router]);

  const handleLessonClick = (lessonId: string) => {
    router.push(`/courses/${slug}/lessons/${lessonId}`);
  };

  const calculateProgress = () => {
    if (!chapters.length) return 0;
    
    const totalLessons = chapters.reduce((acc, chapter) => acc + chapter.lessons.length, 0);
    const completedLessons = chapters.reduce((acc, chapter) => 
      acc + chapter.lessons.filter(lesson => lesson.isCompleted).length, 0
    );
    
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  const getNextLesson = (): MockLesson | null => {
    for (const chapter of chapters) {
      const nextLesson = chapter.lessons.find(lesson => !lesson.isCompleted);
      if (nextLesson) return nextLesson;
    }
    return null;
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
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full bg-slate-700" />
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

  const progress = calculateProgress();
  const nextLesson = getNextLesson();

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
              <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
              <p className="text-slate-300">Tiến độ học tập của bạn</p>
            </div>
            
            {nextLesson && (
              <Button 
                onClick={() => handleLessonClick(nextLesson.id)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Tiếp tục học
              </Button>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Progress Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Tiến độ tổng quan</h2>
                    <span className="text-2xl font-bold text-purple-400">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3 mb-4" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">{chapters.length}</div>
                      <div className="text-sm text-slate-400">Chương</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)}
                      </div>
                      <div className="text-sm text-slate-400">Bài học</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        {chapters.reduce((acc, ch) => acc + ch.lessons.filter(l => l.isCompleted).length, 0)}
                      </div>
                      <div className="text-sm text-slate-400">Hoàn thành</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">
                        {Math.round(chapters.reduce((acc, ch) => acc + ch.lessons.length, 0) * 0.8)} {/* Estimated hours */}
                      </div>
                      <div className="text-sm text-slate-400">Giờ học</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Chapter Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap gap-2"
            >
              <Button
                variant={selectedChapter === '' ? 'default' : 'outline'}
                onClick={() => setSelectedChapter('')}
                className={selectedChapter === '' ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-600 hover:bg-slate-700'}
              >
                Tất cả chương
              </Button>
              {chapters.map((chapter) => (
                <Button
                  key={chapter.id}
                  variant={selectedChapter === chapter.id ? 'default' : 'outline'}
                  onClick={() => setSelectedChapter(chapter.id)}
                  className={selectedChapter === chapter.id ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-600 hover:bg-slate-700'}
                >
                  Chương {chapter.number}
                </Button>
              ))}
            </motion.div>

            {/* Lessons List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              {chapters
                .filter(chapter => selectedChapter === '' || chapter.id === selectedChapter)
                .map((chapter, chapterIndex) => (
                  <div key={chapter.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {chapter.number}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{chapter.title}</h3>
                        <p className="text-slate-400">{chapter.description}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {chapter.lessons.map((lesson, lessonIndex) => (
                        <motion.div
                          key={lesson.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: chapterIndex * 0.1 + lessonIndex * 0.05 }}
                        >
                          <Card
                            className={`bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 transition-all cursor-pointer ${
                              lesson.isCompleted ? 'border-green-500/30' : lesson.isFree ? 'border-purple-500/30' : 'border-slate-700'
                            }`}
                            onClick={() => handleLessonClick(lesson.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                  {lesson.isCompleted ? (
                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                      <CheckCircle className="h-6 w-6 text-white" />
                                    </div>
                                  ) : lesson.isFree ? (
                                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                      <Play className="h-6 w-6 text-white" />
                                    </div>
                                  ) : (
                                    <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                                      <Lock className="h-6 w-6 text-slate-400" />
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm text-slate-400">Bài {lesson.number}</span>
                                    {lesson.isFree && (
                                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
                                        Miễn phí
                                      </Badge>
                                    )}
                                  </div>
                                  <h4 className="font-semibold text-white mb-1">{lesson.title}</h4>
                                  <p className="text-sm text-slate-400 line-clamp-2">{lesson.description}</p>
                                </div>

                                <div className="flex-shrink-0 text-right">
                                  <div className="flex items-center gap-1 text-slate-400 text-sm mb-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{lesson.duration}</span>
                                  </div>
                                  {lesson.resources.length > 0 && (
                                    <div className="flex items-center gap-1 text-slate-400 text-sm">
                                      <BookOpen className="h-4 w-4" />
                                      <span>{lesson.resources.length} tài liệu</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Thống kê học tập
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tiến độ</span>
                    <span className="text-white font-semibold">{progress}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Thời gian học</span>
                    <span className="text-white font-semibold">12.5h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Điểm trung bình</span>
                    <span className="text-white font-semibold">8.5/10</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Learning Goals */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Mục tiêu tuần này
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-slate-300">Hoàn thành 3 bài học</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-slate-600 rounded-full"></div>
                    <span className="text-slate-300">Làm 2 bài kiểm tra</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-slate-600 rounded-full"></div>
                    <span className="text-slate-300">Ôn tập chương 1</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Thành tích
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      🏆
                    </div>
                    <div>
                      <div className="text-white font-medium">Học viên chăm chỉ</div>
                      <div className="text-xs text-slate-400">Học 7 ngày liên tiếp</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      📚
                    </div>
                    <div>
                      <div className="text-white font-medium">Người đọc sách</div>
                      <div className="text-xs text-slate-400">Đọc 10 tài liệu</div>
                    </div>
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
