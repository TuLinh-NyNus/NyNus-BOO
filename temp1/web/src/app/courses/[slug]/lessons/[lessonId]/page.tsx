'use client';

import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock,
  BookOpen,
  Users,
  Star
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// Components
import { LessonContent } from '@/components/features/courses/content/lesson-content';
import { VideoPlayer } from '@/components/features/courses/content/video-player';
import { CourseBreadcrumb } from '@/components/features/courses/navigation/course-navigation';
import { LessonNavigation } from '@/components/features/courses/navigation/lesson-navigation';
import { MathBackground } from '@/components/features/courses/ui/math-background';
import { Button } from '@/components/ui';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent } from "@/components/ui/display/card";
import { useToast } from '@/hooks/use-toast';

// Mock Data
import { getChaptersByCourseId } from '@/lib/mock-data/course-details';
import { getLessonsByCourseId } from '@/lib/mock-data/course-details';
import { getCourseBySlug } from '@/lib/mock-data/courses';
import { MockCourse, MockLesson, MockChapter, MockResource } from '@/lib/mock-data/types';
import logger from '@/lib/utils/logger';

export default function LessonDetailPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const lessonId = params.lessonId as string;
  const { toast } = useToast();

  const [course, setCourse] = useState<MockCourse | null>(null);
  const [lesson, setLesson] = useState<MockLesson | null>(null);
  const [chapters, setChapters] = useState<MockChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lessonProgress, setLessonProgress] = useState(0);

  useEffect(() => {
    const loadLessonData = async () => {
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

        // Load lesson data
        const allLessons = getLessonsByCourseId(courseData.id);
        const lessonData = allLessons.find(lesson => lesson.id === lessonId);
        if (!lessonData) {
          router.push(`/courses/${slug}/lessons`);
          return;
        }

        // Load chapters data
        const chaptersData = getChaptersByCourseId(courseData.id);

        setCourse(courseData);
        setLesson(lessonData);
        setChapters(chaptersData);
      } catch (error) {
        logger.error('Error loading lesson data:', error);
        toast({
          title: 'Lỗi',
          description: 'Có lỗi xảy ra khi tải dữ liệu bài học',
          variant: 'destructive'
        });
        router.push('/courses');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug && lessonId) {
      loadLessonData();
    }
  }, [slug, lessonId, router]);

  const handleVideoProgress = (progress: number) => {
    setLessonProgress(progress);
    
    // Auto-mark as completed when reaching 90%
    if (progress >= 90 && lesson && !lesson.isCompleted) {
      handleLessonComplete();
    }
  };

  const handleLessonComplete = () => {
    if (!lesson) return;
    
    // Update lesson completion status (in real app, this would be an API call)
    setLesson(prev => prev ? { ...prev, isCompleted: true } : null);
    
    toast({
      title: 'Chúc mừng! Bạn đã hoàn thành bài học này',
      description: 'Tiến độ của bạn đã được cập nhật',
      variant: 'success'
    });
  };

  const handleResourceDownload = (resource: MockResource) => {
    // In real app, this would trigger actual download
    toast({
      title: `Đang tải xuống: ${resource.title}`,
      description: `File ${resource.type.toUpperCase()} - ${resource.size || 'Unknown size'}`,
      variant: 'success'
    });
  };

  const handleNotesSave = (notes: string) => {
    // In real app, this would save to backend
    toast({
      title: 'Thành công',
      description: 'Ghi chú đã được lưu thành công',
      variant: 'success'
    });
  };

  const handleLessonChange = (newLessonId: string) => {
    // Navigation is handled by LessonNavigation component
    logger.info('Changing to lesson:', newLessonId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <MathBackground />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Đang tải bài học...</h2>
          <p className="text-slate-400">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (!course || !lesson) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <MathBackground />
        <div className="relative z-10 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Không tìm thấy bài học</h1>
          <p className="text-slate-400 mb-6">Bài học bạn đang tìm kiếm không tồn tại hoặc đã bị xóa</p>
          <Button onClick={() => router.push('/courses')}>
            Quay lại danh sách khóa học
          </Button>
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
                    onClick={() => router.push(`/courses/${slug}`)}
                    className="text-slate-400 hover:text-white hover:bg-slate-700/50"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {course.title}
                  </Button>
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
                <span className="text-slate-400">•</span>
                <span className="text-slate-400">{course.duration}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Video and Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Video Player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <VideoPlayer
                videoUrl={lesson.videoUrl}
                title={lesson.title}
                thumbnail={lesson.thumbnail}
                onProgress={handleVideoProgress}
                onComplete={handleLessonComplete}
                className="aspect-video"
              />
            </motion.div>

            {/* Lesson Content */}
            <LessonContent
              lesson={lesson}
              onResourceDownload={handleResourceDownload}
              onNotesSave={handleNotesSave}
            />
          </div>

          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <LessonNavigation
              currentLesson={lesson}
              chapters={chapters}
              courseSlug={slug}
              onLessonChange={handleLessonChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
