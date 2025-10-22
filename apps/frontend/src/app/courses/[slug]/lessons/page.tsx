'use client';

import { motion } from 'framer-motion';
import {
  Play,
  Clock,
  CheckCircle,
  Lock,
  BookOpen,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { MathBackground } from '@/components/features/courses/ui';
import { Button } from '@/components/ui/form/button';
import { Progress } from '@/components/ui/display/progress';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { getChaptersByCourseId } from '@/lib/mockdata/courses/course-details';
import { getCourseBySlug } from '@/lib/mockdata';
import { MockCourse, MockChapter, MockLesson } from '@/lib/mockdata/courses/courses-types';
import { useAuth } from '@/contexts/auth-context-grpc';
import { UserRole } from '@/generated/common/common_pb';

export default function CourseLearningPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const [course, setCourse] = useState<MockCourse | null>(null);
  const [chapters, setChapters] = useState<MockChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<string>('');

  // Client-side authentication check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Redirect to login with return URL
      router.push(`/login?callbackUrl=${encodeURIComponent(`/courses/${slug}/lessons`)}`);
    }
  }, [authLoading, isAuthenticated, router, slug]);

  useEffect(() => {
    const loadCourseData = async () => {
      // Don't load course data if not authenticated
      if (!isAuthenticated) return;

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
        console.error('Error loading course data:', error);
        router.push('/courses');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug && isAuthenticated) {
      loadCourseData();
    }
  }, [slug, router, isAuthenticated]);

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

  // Authentication loading state
  if (authLoading) {
    return (
      <div className="min-h-screen relative">
        <MathBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-white mx-auto" />
            <div className="text-white text-xl">Đang xác thực...</div>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated state (will redirect, but show message briefly)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative">
        <MathBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <Lock className="h-12 w-12 text-white mx-auto" />
            <div className="text-white text-xl">Yêu cầu đăng nhập</div>
            <div className="text-white/80">Đang chuyển hướng đến trang đăng nhập...</div>
          </div>
        </div>
      </div>
    );
  }

  // Role-based access check - FIX: Compare with enum numbers instead of strings
  const allowedRoles = [
    UserRole.USER_ROLE_STUDENT,
    UserRole.USER_ROLE_TUTOR,
    UserRole.USER_ROLE_TEACHER,
    UserRole.USER_ROLE_ADMIN
  ];

  if (user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen relative">
        <MathBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <Lock className="h-12 w-12 text-red-400 mx-auto" />
            <div className="text-white text-xl">Không có quyền truy cập</div>
            <div className="text-white/80">Bạn cần có tài khoản học viên để truy cập khóa học.</div>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-6 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Quay về Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Course loading state
  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <MathBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-white mx-auto" />
            <div className="text-white text-xl">Đang tải khóa học...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen relative">
        <MathBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-white text-xl mb-4">Không tìm thấy khóa học</div>
            <Button onClick={() => router.push('/courses')}>
              Quay lại danh sách khóa học
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const nextLesson = getNextLesson();

  return (
    <div className="min-h-screen relative">
      <MathBackground />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-b from-slate-900/80 to-slate-900/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-purple-200 mb-6">
              <button 
                onClick={() => router.push('/courses')}
                className="hover:text-white transition-colors"
              >
                Khóa học
              </button>
              <ChevronRight className="w-4 h-4 mx-2" />
              <button 
                onClick={() => router.push(`/courses/${slug}`)}
                className="hover:text-white transition-colors"
              >
                {course.title}
              </button>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-white">Bài học</span>
            </div>

            {/* Course Info */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
                <p className="text-purple-200 mb-4">Tiến độ học tập của bạn</p>
                
                {/* Progress */}
                <div className="flex items-center space-x-4">
                  <div className="flex-1 max-w-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-purple-200">Tiến độ</span>
                      <span className="text-sm text-white font-semibold">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-purple-200">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      <span>{chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)} bài học</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>{chapters.reduce((acc, ch) => acc + ch.lessons.filter(l => l.isCompleted).length, 0)} hoàn thành</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Continue Learning Button */}
              {nextLesson && (
                <Button 
                  onClick={() => handleLessonClick(nextLesson.id)}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Tiếp tục học
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Lessons Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Chapters Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800/50 border-slate-700 sticky top-8">
                <CardHeader>
                  <CardTitle className="text-white">Chương học</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {chapters.map((chapter) => (
                    <button
                      key={chapter.id}
                      onClick={() => setSelectedChapter(chapter.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedChapter === chapter.id
                          ? 'bg-purple-600/20 border border-purple-500/30'
                          : 'hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="text-white font-medium mb-1">
                        Chương {chapter.number}: {chapter.title}
                      </div>
                      <div className="text-sm text-purple-200">
                        {chapter.lessons.length} bài học • {chapter.totalDuration}
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Lessons List */}
            <div className="lg:col-span-3">
              {chapters
                .filter(chapter => !selectedChapter || chapter.id === selectedChapter)
                .map((chapter) => (
                  <motion.div
                    key={chapter.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-slate-800/30 border-slate-700 mb-6">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white">
                            Chương {chapter.number}: {chapter.title}
                          </CardTitle>
                          <Badge variant="secondary" className="bg-purple-500/20 text-purple-200">
                            {chapter.lessons.length} bài học
                          </Badge>
                        </div>
                        <p className="text-purple-200">{chapter.description}</p>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-3">
                          {chapter.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              onClick={() => handleLessonClick(lesson.id)}
                              className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 cursor-pointer transition-colors group"
                            >
                              <div className="flex items-center">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-600/50 mr-4">
                                  {lesson.isCompleted ? (
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                  ) : lesson.isFree ? (
                                    <Play className="w-5 h-5 text-purple-400" />
                                  ) : (
                                    <Lock className="w-5 h-5 text-slate-400" />
                                  )}
                                </div>
                                <div>
                                  <div className="text-white font-medium group-hover:text-purple-200 transition-colors">
                                    {lesson.number}. {lesson.title}
                                  </div>
                                  <div className="text-sm text-purple-200 flex items-center mt-1">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {lesson.duration}
                                    {lesson.isFree && (
                                      <Badge variant="outline" className="ml-2 text-xs border-green-500/30 text-green-400">
                                        Miễn phí
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
