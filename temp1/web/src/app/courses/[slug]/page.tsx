'use client';

import { motion } from 'framer-motion';
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  Award, 
  Download,
  Heart,
  Share2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Lock
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import { getChaptersByCourseId, getReviewsByCourseId } from '@/lib/mock-data/course-details';
import { getCourseBySlug } from '@/lib/mock-data/courses';
import { MockCourse, MockChapter, MockReview } from '@/lib/mock-data/types';
import logger from '@/lib/utils/logger';

export default function CourseDetailPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [course, setCourse] = useState<MockCourse | null>(null);
  const [chapters, setChapters] = useState<MockChapter[]>([]);
  const [reviews, setReviews] = useState<MockReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const courseData = getCourseBySlug(slug);
        if (!courseData) {
          router.push('/courses');
          return;
        }

        const chaptersData = getChaptersByCourseId(courseData.id);
        const reviewsData = getReviewsByCourseId(courseData.id);

        setCourse(courseData);
        setChapters(chaptersData);
        setReviews(reviewsData);
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

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const handleEnrollCourse = () => {
    // Navigate to learning page
    router.push(`/courses/${slug}/lessons`);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <MathBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full bg-slate-700" />
              <Skeleton className="h-8 w-3/4 bg-slate-700" />
              <Skeleton className="h-4 w-full bg-slate-700" />
              <Skeleton className="h-4 w-2/3 bg-slate-700" />
            </div>
            
            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              <Skeleton className="h-80 w-full bg-slate-700" />
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

  return (
    <div className="min-h-screen relative">
      <MathBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <CourseBreadcrumb />

        {/* Course Navigation */}
        <CourseNavigation />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Course Image */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900 to-blue-900">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button size="lg" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm">
                    <Play className="h-6 w-6 mr-2" />
                    Xem giới thiệu
                  </Button>
                </div>
              </div>

              {/* Course Title & Meta */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-500/20 text-purple-200">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                  {course.title}
                </h1>

                <p className="text-lg text-slate-300 leading-relaxed">
                  {course.description}
                </p>

                {/* Course Stats */}
                <div className="flex flex-wrap items-center gap-6 text-slate-300">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="font-semibold">{course.rating}</span>
                    <span>({reviews.length} đánh giá)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>{course.students.toLocaleString()} học viên</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    <span>{course.totalLessons} bài học</span>
                  </div>
                </div>

                {/* Instructor */}
                <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl backdrop-blur-sm">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={course.instructorAvatar} alt={course.instructor} />
                    <AvatarFallback>{course.instructor.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-white">Giảng viên: {course.instructor}</p>
                    <p className="text-sm text-slate-400">{course.instructorBio}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Course Content Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Tabs defaultValue="curriculum" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
                  <TabsTrigger value="curriculum">Nội dung</TabsTrigger>
                  <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
                  <TabsTrigger value="instructor">Giảng viên</TabsTrigger>
                  <TabsTrigger value="faq">FAQ</TabsTrigger>
                </TabsList>

                <TabsContent value="curriculum" className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-4">Nội dung khóa học</h3>
                  <div className="space-y-4">
                    {chapters.map((chapter) => (
                      <Card key={chapter.id} className="bg-slate-800/50 border-slate-700">
                        <CardHeader
                          className="cursor-pointer hover:bg-slate-700/50 transition-colors"
                          onClick={() => toggleChapter(chapter.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {chapter.number}
                              </div>
                              <div>
                                <CardTitle className="text-white text-lg">{chapter.title}</CardTitle>
                                <p className="text-slate-400 text-sm">{chapter.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-slate-400">{chapter.totalDuration}</span>
                              {expandedChapters.has(chapter.id) ? (
                                <ChevronUp className="h-5 w-5 text-slate-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-slate-400" />
                              )}
                            </div>
                          </div>
                        </CardHeader>

                        {expandedChapters.has(chapter.id) && (
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              {chapter.lessons.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center gap-3 p-3 hover:bg-slate-700/30 rounded-lg transition-colors cursor-pointer group"
                                  onClick={() => router.push(`/courses/${slug}/lessons/${lesson.id}`)}
                                >
                                  <div className="flex-shrink-0">
                                    {lesson.isCompleted ? (
                                      <CheckCircle className="h-5 w-5 text-green-400" />
                                    ) : lesson.isFree ? (
                                      <Play className="h-5 w-5 text-purple-400 group-hover:text-purple-300" />
                                    ) : (
                                      <Lock className="h-5 w-5 text-slate-500" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-white font-medium group-hover:text-purple-300 transition-colors">{lesson.title}</p>
                                    <p className="text-slate-400 text-sm">{lesson.description}</p>
                                  </div>
                                  <span className="text-sm text-slate-400">{lesson.duration}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Đánh giá từ học viên</h3>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="text-white font-semibold">{course.rating}</span>
                      <span className="text-slate-400">({reviews.length} đánh giá)</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id} className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarImage src={review.userAvatar} alt={review.userName} />
                              <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-white">{review.userName}</span>
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-slate-600'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-slate-300 mb-2">{review.comment}</p>
                              <p className="text-sm text-slate-500">{review.helpful} người thấy hữu ích</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="instructor" className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={course.instructorAvatar} alt={course.instructor} />
                      <AvatarFallback className="text-2xl">{course.instructor.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{course.instructor}</h3>
                      <p className="text-slate-300">{course.instructorBio}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="faq" className="space-y-6">
                  <h3 className="text-xl font-bold text-white">Câu hỏi thường gặp</h3>
                  <div className="space-y-4">
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-6">
                        <h4 className="font-semibold text-white mb-2">Tôi có thể học khóa học này mà không có kiến thức nền không?</h4>
                        <p className="text-slate-300">Khóa học này yêu cầu kiến thức cơ bản về Toán lớp 11. Nếu bạn chưa có nền tảng, hãy tham khảo khóa học Toán 11 trước.</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-slate-800/50 border-slate-700 sticky top-8">
                <CardContent className="p-6 space-y-6">
                  {/* Price */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-3xl font-bold text-white">{course.price}</span>
                      {course.originalPrice && (
                        <span className="text-lg text-slate-400 line-through">{course.originalPrice}</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">Truy cập trọn đời</p>
                  </div>

                  {/* Progress */}
                  {course.progress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Tiến độ</span>
                        <span className="text-white">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleEnrollCourse}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      size="lg"
                    >
                      {course.progress > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-slate-600 hover:bg-slate-700"
                        onClick={handleWishlist}
                      >
                        <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? 'fill-current text-red-400' : ''}`} />
                        Yêu thích
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 border-slate-600 hover:bg-slate-700">
                        <Share2 className="h-4 w-4 mr-2" />
                        Chia sẻ
                      </Button>
                    </div>
                  </div>

                  {/* Course Features */}
                  <div className="space-y-3 pt-4 border-t border-slate-700">
                    <h4 className="font-semibold text-white">Khóa học bao gồm:</h4>
                    <div className="space-y-2 text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration} video</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.totalLessons} bài học</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        <span>Tài liệu tải về</span>
                      </div>
                      {course.hasCertificate && (
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          <span>Chứng chỉ hoàn thành</span>
                        </div>
                      )}
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
