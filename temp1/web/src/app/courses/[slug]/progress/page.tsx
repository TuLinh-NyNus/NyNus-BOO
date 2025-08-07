'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  Award, 
  Target,
  BookOpen,
  CheckCircle,
  Star,
  Calendar,
  BarChart3,
  Trophy,
  Flame,
  ArrowRight,
  Play,
  RotateCcw
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { CourseNavigation, CourseBreadcrumb } from '@/components/features/courses/navigation/course-navigation';
import { MathBackground } from '@/components/features/courses/ui/math-background';
import { Button, Progress } from '@/components/ui';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/display/avatar";
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Skeleton } from "@/components/ui/display/skeleton";
import {
  getProgressByCourseId,
  getLessonsByCourseId,
  getQuizzesByCourseId,
  getEnhancedProgressData,
  getLearningStats
} from '@/lib/mock-data/course-details';
import { getCourseBySlug } from '@/lib/mock-data/courses';
import { MockCourse } from '@/lib/mock-data/types';
import {
  EnhancedProgressData,
  LearningStats,
  Achievement,
  ChapterProgress,
  DayProgress,
  Recommendation,
  SessionData
} from '@/lib/types/course-progress';
import logger from '@/lib/utils/logger';

export default function CourseProgressPage(): JSX.Element | null {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [course, setCourse] = useState<MockCourse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progressData, setProgressData] = useState<{
    totalProgress?: number;
    completedLessons?: string[];
    timeSpent?: number;
    lastAccessed?: string;
    [key: string]: unknown;
  } | null>(null);
  const [enhancedData, setEnhancedData] = useState<EnhancedProgressData | null>(null);
  const [learningStats, setLearningStats] = useState<LearningStats | null>(null);

  useEffect(() => {
    const loadProgressData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const courseData = getCourseBySlug(slug);
        if (!courseData) {
          router.push('/courses');
          return;
        }

        const progress = getProgressByCourseId(courseData.id);
        const enhanced = getEnhancedProgressData(courseData.id);
        const stats = getLearningStats();
        const lessons = getLessonsByCourseId(courseData.id);
        const quizzes = getQuizzesByCourseId(courseData.id);

        setCourse(courseData);
        // Convert MockProgress to compatible format
        setProgressData(progress ? {
          ...progress, // Include all properties from MockProgress
          // Ensure index signature compatibility
        } as {
          totalProgress?: number;
          completedLessons?: string[];
          timeSpent?: number;
          lastAccessed?: string;
          [key: string]: unknown;
        } : null);
        // Convert enhanced data to compatible format
        setEnhancedData({
          ...enhanced,
          gamification: {
            ...enhanced.gamification,
            leaderboard: enhanced.gamification.leaderboard.map((entry) => ({
              id: `user-${entry.rank}`,
              name: entry.name,
              points: entry.score, // Convert score to points
              rank: entry.rank,
              avatar: entry.avatar,
              isCurrentUser: entry.isCurrentUser
            }))
          }
        } as EnhancedProgressData);
        setLearningStats(stats);
      } catch (error) {
        logger.error('Error loading progress data:', error);
        router.push('/courses');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      loadProgressData();
    }
  }, [slug, router]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <MathBackground />
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-1/3 bg-slate-700" />
                      <Skeleton className="h-4 w-full bg-slate-700" />
                      <Skeleton className="h-8 w-full bg-slate-700" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course || !progressData || !enhancedData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <MathBackground />
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Tiến độ học tập</h1>
                <p className="text-slate-400">
                  Theo dõi quá trình học tập và đạt được mục tiêu của bạn
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Báo cáo chi tiết
                </Button>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Target className="h-4 w-4 mr-2" />
                  Đặt mục tiêu
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Overview Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* Overall Progress */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-400" />
                  </div>
                  <Badge variant="outline" className="text-purple-400 border-purple-400">
                    {progressData?.totalProgress || 0}%
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Tiến độ tổng thể</h3>
                <Progress value={progressData?.totalProgress || 0} className="mb-2" />
                <p className="text-sm text-slate-400">
                  {progressData?.completedLessons?.length || 0} bài học đã hoàn thành
                </p>
              </CardContent>
            </Card>

            {/* Time Spent */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-400" />
                  </div>
                  <Badge variant="outline" className="text-blue-400 border-blue-400">
                    {formatTime(progressData?.timeSpent || 0)}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Thời gian học</h3>
                <p className="text-sm text-slate-400">
                  Trung bình {Math.round((progressData?.timeSpent || 0) / 7)} phút/ngày
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Lần cuối: {formatDate(progressData?.lastAccessed || new Date().toISOString())}
                </p>
              </CardContent>
            </Card>

            {/* Current Streak */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Flame className="h-6 w-6 text-orange-400" />
                  </div>
                  <Badge variant="outline" className="text-orange-400 border-orange-400">
                    {learningStats?.currentStreak || 0} ngày
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Chuỗi học tập</h3>
                <p className="text-sm text-slate-400">
                  Kỷ lục: {learningStats?.longestStreak || 0} ngày
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Tiếp tục để duy trì chuỗi!
                </p>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Trophy className="h-6 w-6 text-green-400" />
                  </div>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    {enhancedData.gamification.achievements.filter((a: Achievement) => a.earned).length}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Thành tích</h3>
                <p className="text-sm text-slate-400">
                  Level {enhancedData.gamification.level} • {enhancedData.gamification.totalPoints} điểm
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Còn {enhancedData.gamification.nextLevelPoints - enhancedData.gamification.totalPoints} điểm để lên level
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Progress Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Chapter Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-purple-400" />
                      Tiến độ theo chương
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {enhancedData.chapterProgress.map((chapter: ChapterProgress, index: number) => (
                      <motion.div
                        key={chapter.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="p-4 bg-slate-700/30 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{chapter.name}</h4>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm text-slate-400">
                                Điểm TB: {chapter.averageScore}/10
                              </span>
                              <span className="text-sm text-slate-400">
                                Thời gian: {formatTime(chapter.timeSpent)}
                              </span>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={
                              chapter.status === 'completed'
                                ? 'text-green-400 border-green-400'
                                : chapter.status === 'in-progress'
                                ? 'text-yellow-400 border-yellow-400'
                                : 'text-slate-400 border-slate-400'
                            }
                          >
                            {chapter.status === 'completed' ? 'Hoàn thành' :
                             chapter.status === 'in-progress' ? 'Đang học' : 'Chưa bắt đầu'}
                          </Badge>
                        </div>
                        <Progress value={chapter.progress} className="mb-3" />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">{chapter.progress}% hoàn thành</span>
                          {chapter.status !== 'not-started' && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                              onClick={() => router.push(`/courses/${slug}/lessons`)}
                            >
                              {chapter.status === 'completed' ? 'Ôn tập' : 'Tiếp tục'}
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Weekly Progress Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-400" />
                      Tiến độ 7 ngày qua
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                      {enhancedData.weeklyProgress?.map((day: DayProgress, index: number) => (
                        <div key={index} className="text-center">
                          <div className="text-xs text-slate-400 mb-2">
                            {new Date(day.date).toLocaleDateString('vi-VN', { weekday: 'short' })}
                          </div>
                          <div 
                            className="bg-slate-700 rounded-lg p-2 relative overflow-hidden"
                            style={{ height: '80px' }}
                          >
                            <div 
                              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-600 to-blue-600 rounded-lg transition-all duration-500"
                              style={{ height: `${day.progress}%` }}
                            />
                            <div className="relative z-10 text-xs text-white font-medium mt-1">
                              {day.progress}%
                            </div>
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {formatTime(day.timeSpent)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Achievements & Next Steps */}
            <div className="space-y-6">
              {/* Next Steps */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-400" />
                      Bước tiếp theo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {enhancedData.insights.recommendations.slice(0, 3).map((rec: Recommendation, index: number) => (
                      <div key={index} className="p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className={`p-1 rounded-full ${
                            rec.priority === 'high' ? 'bg-red-500/20' :
                            rec.priority === 'medium' ? 'bg-yellow-500/20' : 'bg-green-500/20'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              rec.priority === 'high' ? 'bg-red-400' :
                              rec.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-white text-sm">{rec.title}</h4>
                            <p className="text-xs text-slate-400 mt-1">{rec.description}</p>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 mt-2 h-auto p-1"
                            >
                              {rec.action}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Achievements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-400" />
                      Thành tích gần đây
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {enhancedData.gamification.achievements.slice(0, 4).map((achievement: Achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
                        <div className={`p-2 rounded-lg ${
                          achievement.earned ? 'bg-yellow-500/20' : 'bg-slate-600/20'
                        }`}>
                          {achievement.earned ? (
                            <Trophy className="h-4 w-4 text-yellow-400" />
                          ) : (
                            <Star className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-medium text-sm ${achievement.earned ? 'text-white' : 'text-slate-400'}`}>
                            {achievement.title}
                          </h4>
                          <p className="text-xs text-slate-500">{achievement.description}</p>
                          {!achievement.earned && achievement.progress && (
                            <div className="mt-1">
                              <Progress value={(achievement.progress / (achievement.maxProgress || 1)) * 100} className="h-1" />
                              <span className="text-xs text-slate-500">
                                {achievement.progress}/{achievement.maxProgress}
                              </span>
                            </div>
                          )}
                        </div>
                        {achievement.earned && (
                          <Badge variant="outline" className="text-yellow-400 border-yellow-400 text-xs">
                            {formatDate(achievement.earnedDate || new Date().toISOString())}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Hành động nhanh</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      onClick={() => router.push(`/courses/${slug}/lessons`)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Tiếp tục học
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                      onClick={() => router.push(`/courses/${slug}/exercises`)}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Ôn tập bài kiểm tra
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
