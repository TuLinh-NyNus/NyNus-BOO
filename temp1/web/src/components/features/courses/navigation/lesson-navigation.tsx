'use client';

import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Play,
  Lock,
  Clock,
  BookOpen,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button, Progress } from '@/components/ui';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent } from "@/components/ui/display/card";
import { MockLesson, MockChapter } from '@/lib/mock-data/types';
import { cn } from '@/lib/utils';

interface LessonNavigationProps {
  currentLesson: MockLesson;
  chapters: MockChapter[];
  courseSlug: string;
  onLessonChange?: (lessonId: string) => void;
  className?: string;
}

export function LessonNavigation({ 
  currentLesson, 
  chapters, 
  courseSlug,
  onLessonChange,
  className 
}: LessonNavigationProps): JSX.Element {
  const router = useRouter();

  // Tìm tất cả lessons theo thứ tự
  const allLessons = chapters.flatMap(chapter => 
    chapter.lessons.map(lesson => ({
      ...lesson,
      chapterTitle: chapter.title,
      chapterNumber: chapter.number
    }))
  );

  const currentIndex = allLessons.findIndex(lesson => lesson.id === currentLesson.id);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Tính toán tiến độ
  const completedLessons = allLessons.filter(lesson => lesson.isCompleted).length;
  const totalLessons = allLessons.length;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const handleLessonClick = (lessonId: string) => {
    router.push(`/courses/${courseSlug}/lessons/${lessonId}`);
    onLessonChange?.(lessonId);
  };

  const handleBackToCourse = () => {
    router.push(`/courses/${courseSlug}/lessons`);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Button
          variant="ghost"
          onClick={handleBackToCourse}
          className="text-slate-400 hover:text-white hover:bg-slate-700/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách bài học
        </Button>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Tiến độ khóa học</h3>
                <span className="text-sm text-slate-400">
                  {completedLessons}/{totalLessons} bài học
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-sm text-slate-400">
                Bạn đã hoàn thành {Math.round(progressPercentage)}% khóa học
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Previous Lesson */}
        {previousLesson ? (
          <Button
            variant="outline"
            onClick={() => handleLessonClick(previousLesson.id)}
            className="h-auto p-4 bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 text-left justify-start"
          >
            <div className="flex items-center gap-3 w-full">
              <ChevronLeft className="h-5 w-5 text-purple-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400 mb-1">Bài trước</p>
                <p className="font-medium text-white truncate">{previousLesson.title}</p>
                <p className="text-xs text-slate-400">
                  Chương {previousLesson.chapterNumber}: {previousLesson.chapterTitle}
                </p>
              </div>
            </div>
          </Button>
        ) : (
          <div className="h-auto p-4 bg-slate-800/30 border border-slate-700 rounded-lg opacity-50">
            <div className="flex items-center gap-3">
              <ChevronLeft className="h-5 w-5 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500 mb-1">Bài trước</p>
                <p className="font-medium text-slate-500">Không có</p>
              </div>
            </div>
          </div>
        )}

        {/* Next Lesson */}
        {nextLesson ? (
          <Button
            variant="outline"
            onClick={() => handleLessonClick(nextLesson.id)}
            className="h-auto p-4 bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 text-right justify-end"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400 mb-1">Bài tiếp theo</p>
                <p className="font-medium text-white truncate">{nextLesson.title}</p>
                <p className="text-xs text-slate-400">
                  Chương {nextLesson.chapterNumber}: {nextLesson.chapterTitle}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-purple-400 flex-shrink-0" />
            </div>
          </Button>
        ) : (
          <div className="h-auto p-4 bg-slate-800/30 border border-slate-700 rounded-lg opacity-50">
            <div className="flex items-center gap-3 justify-end">
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-1">Bài tiếp theo</p>
                <p className="font-medium text-slate-500">Hoàn thành khóa học</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-500" />
            </div>
          </div>
        )}
      </motion.div>

      {/* Lessons List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Danh sách bài học
            </h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {chapters.map((chapter) => (
                <div key={chapter.id} className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs text-white">
                      {chapter.number}
                    </div>
                    {chapter.title}
                  </h4>
                  
                  <div className="space-y-1 ml-8">
                    {chapter.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors",
                          lesson.id === currentLesson.id
                            ? "bg-purple-600/20 border border-purple-600/30"
                            : "hover:bg-slate-700/50"
                        )}
                      >
                        <div className="flex-shrink-0">
                          {lesson.isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : lesson.isFree ? (
                            <Play className="h-4 w-4 text-purple-400" />
                          ) : (
                            <Lock className="h-4 w-4 text-slate-500" />
                          )}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <p className={cn(
                            "text-sm font-medium truncate",
                            lesson.id === currentLesson.id ? "text-purple-300" : "text-white"
                          )}>
                            {lesson.number}. {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Clock className="h-3 w-3" />
                            <span>{lesson.duration}</span>
                            {lesson.isFree && (
                              <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                                Miễn phí
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
