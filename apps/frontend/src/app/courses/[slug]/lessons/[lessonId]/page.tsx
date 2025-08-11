'use client';

import {
  ArrowLeft,
  CheckCircle,
  Clock,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  Volume2,
  Settings,
  Maximize,
  Download
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { MathBackground } from '@/components/features/courses/ui';
import { Button } from '@/components/ui/form/button';
import { Progress } from '@/components/ui/display/progress';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { getChaptersByCourseId } from '@/lib/mockdata/course-details';
import { getCourseBySlug } from '@/lib/mockdata';
import { MockCourse, MockLesson, MockChapter } from '@/lib/mockdata/courses-types';

export default function LessonDetailPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const lessonId = params.lessonId as string;

  const [course, setCourse] = useState<MockCourse | null>(null);
  const [lesson, setLesson] = useState<MockLesson | null>(null);
  const [chapters, setChapters] = useState<MockChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lessonProgress] = useState(0); // TODO: Implement setLessonProgress for video tracking
  const [isPlaying, setIsPlaying] = useState(false);

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

        // Load chapters data
        const chaptersData = getChaptersByCourseId(courseData.id);
        
        // Find lesson in chapters
        let lessonData: MockLesson | null = null;
        for (const chapter of chaptersData) {
          const foundLesson = chapter.lessons.find(l => l.id === lessonId);
          if (foundLesson) {
            lessonData = foundLesson;
            break;
          }
        }

        if (!lessonData) {
          router.push(`/courses/${slug}/lessons`);
          return;
        }

        setCourse(courseData);
        setLesson(lessonData);
        setChapters(chaptersData);
      } catch (error) {
        console.error('Error loading lesson data:', error);
        router.push('/courses');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug && lessonId) {
      loadLessonData();
    }
  }, [slug, lessonId, router]);

  // TODO: Implement video progress tracking
  // const handleVideoProgress = (progress: number) => {
  //   setLessonProgress(progress);
  //
  //   // Auto-mark as completed when reaching 90%
  //   if (progress >= 90 && lesson && !lesson.isCompleted) {
  //     handleLessonComplete();
  //   }
  // };

  const handleLessonComplete = () => {
    if (lesson) {
      // Update lesson completion status
      setLesson({ ...lesson, isCompleted: true });
      console.log('Lesson completed:', lesson.id);
    }
  };

  const getAdjacentLessons = () => {
    const allLessons: MockLesson[] = [];
    chapters.forEach(chapter => {
      allLessons.push(...chapter.lessons);
    });

    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    return {
      previous: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
      next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <MathBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Đang tải bài học...</div>
        </div>
      </div>
    );
  }

  if (!course || !lesson) {
    return (
      <div className="min-h-screen relative">
        <MathBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-white text-xl mb-4">Không tìm thấy bài học</div>
            <Button onClick={() => router.push(`/courses/${slug}/lessons`)}>
              Quay lại danh sách bài học
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { previous, next } = getAdjacentLessons();

  return (
    <div className="min-h-screen relative">
      <MathBackground />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-900/70 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-purple-200 mb-4">
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
              <button 
                onClick={() => router.push(`/courses/${slug}/lessons`)}
                className="hover:text-white transition-colors"
              >
                Bài học
              </button>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-white">{lesson.title}</span>
            </div>

            {/* Lesson Info */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{lesson.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-purple-200">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {lesson.duration}
                  </div>
                  {lesson.isFree && (
                    <Badge variant="outline" className="border-green-500/30 text-green-400">
                      Miễn phí
                    </Badge>
                  )}
                  {lesson.isCompleted && (
                    <Badge variant="outline" className="border-green-500/30 text-green-400">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Hoàn thành
                    </Badge>
                  )}
                </div>
              </div>

              <Button 
                variant="outline"
                onClick={() => router.push(`/courses/${slug}/lessons`)}
                className="border-white/30 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800/50 border-slate-700 mb-6">
                <CardContent className="p-0">
                  {/* Video Container */}
                  <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                          <Play className="w-8 h-8 text-purple-400" />
                        </div>
                        <p className="text-white text-lg font-medium mb-2">{lesson.title}</p>
                        <p className="text-purple-200">Video sẽ được tải ở đây</p>
                      </div>
                    </div>
                    
                    {/* Video Controls */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="text-white hover:bg-white/10"
                          >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                          </Button>
                          <div className="text-white text-sm">00:00 / {lesson.duration}</div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                            <Volume2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                            <Maximize className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-2">
                        <Progress value={lessonProgress} className="h-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lesson Description */}
              <Card className="bg-slate-800/30 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Mô tả bài học</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-200 leading-relaxed">
                    {lesson.description}
                  </p>
                  
                  {/* Resources */}
                  {lesson.resources && lesson.resources.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-white font-medium mb-3">Tài liệu đính kèm</h4>
                      <div className="space-y-2">
                        {lesson.resources.map((resource, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                            <div className="flex items-center">
                              <BookOpen className="w-4 h-4 text-purple-400 mr-3" />
                              <span className="text-white">{resource.title}</span>
                            </div>
                            <Button size="sm" variant="ghost" className="text-purple-400 hover:bg-purple-500/10">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Lesson Navigation */}
              <Card className="bg-slate-800/50 border-slate-700 mb-6">
                <CardHeader>
                  <CardTitle className="text-white">Điều hướng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {previous && (
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/courses/${slug}/lessons/${previous.id}`)}
                      className="w-full justify-start border-slate-600 text-white hover:bg-slate-700/50"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Bài trước: {previous.title}
                    </Button>
                  )}
                  
                  {next && (
                    <Button
                      onClick={() => router.push(`/courses/${slug}/lessons/${next.id}`)}
                      className="w-full justify-start bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Bài tiếp: {next.title}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                  
                  {!lesson.isCompleted && (
                    <Button
                      onClick={handleLessonComplete}
                      variant="outline"
                      className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Đánh dấu hoàn thành
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Course Progress */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Tiến độ khóa học</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-purple-200">Hoàn thành</span>
                        <span className="text-sm text-white font-semibold">
                          {Math.round((chapters.reduce((acc, ch) => acc + ch.lessons.filter(l => l.isCompleted).length, 0) / chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)) * 100) || 0}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.round((chapters.reduce((acc, ch) => acc + ch.lessons.filter(l => l.isCompleted).length, 0) / chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)) * 100) || 0} 
                        className="h-2" 
                      />
                    </div>
                    
                    <div className="text-sm text-purple-200">
                      {chapters.reduce((acc, ch) => acc + ch.lessons.filter(l => l.isCompleted).length, 0)} / {chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)} bài học
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
