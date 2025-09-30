'use client';

import { motion } from 'framer-motion';
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  Award, 
  Heart,
  Share2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Lock
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { MathBackground } from '@/components/features/courses/ui';
import { CourseInfo } from '@/components/features/courses/content';
import { Button } from '@/components/ui/form/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/display/avatar";
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import { getChaptersByCourseId, getReviewsByCourseId } from '@/lib/mockdata/courses/course-details';
import { getCourseBySlug } from '@/lib/mockdata';
import { MockCourse, MockChapter, MockReview } from '@/lib/mockdata/courses/courses-types';

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
        console.error('Error loading course data:', error);
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
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Đang tải khóa học...</div>
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

  return (
    <div className="min-h-screen relative">
      <MathBackground />
      
      <div className="relative z-10">
        {/* Course Header */}
        <div className="bg-gradient-to-b from-slate-900/80 to-slate-900/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Course Info - Left Side */}
              <div className="lg:col-span-2">
                <div className="mb-4">
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-200">
                    {course.category}
                  </Badge>
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  {course.title}
                </h1>
                
                <p className="text-lg text-purple-200 mb-6 leading-relaxed">
                  {course.description}
                </p>

                {/* Course Stats */}
                <div className="flex flex-wrap items-center gap-6 mb-6">
                  <div className="flex items-center text-white">
                    <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                    <span className="font-semibold">{course.rating}</span>
                    <span className="text-purple-200 ml-1">({reviews.length} đánh giá)</span>
                  </div>
                  
                  <div className="flex items-center text-white">
                    <Users className="w-5 h-5 text-purple-400 mr-1" />
                    <span>{course.students.toLocaleString()} học sinh</span>
                  </div>
                  
                  <div className="flex items-center text-white">
                    <Clock className="w-5 h-5 text-purple-400 mr-1" />
                    <span>{course.duration}</span>
                  </div>
                  
                  <div className="flex items-center text-white">
                    <BookOpen className="w-5 h-5 text-purple-400 mr-1" />
                    <span>{course.totalLessons} bài học</span>
                  </div>
                </div>

                {/* Instructor */}
                <div className="flex items-center mb-6">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={course.instructorAvatar} alt={course.instructor} />
                    <AvatarFallback>
                      {course.instructor.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-white font-semibold">{course.instructor}</div>
                    <div className="text-purple-200 text-sm">{course.instructorBio}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={handleEnrollCourse}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Bắt đầu học
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleWishlist}
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Heart className={`w-5 h-5 mr-2 ${isWishlisted ? 'fill-current text-red-400' : ''}`} />
                    {isWishlisted ? 'Đã yêu thích' : 'Yêu thích'}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Chia sẻ
                  </Button>
                </div>
              </div>

              {/* Course Card - Right Side */}
              <div className="lg:col-span-1">
                <Card className="bg-slate-800/50 border-slate-700 sticky top-8">
                  <CardContent className="p-6">
                    <CourseInfo course={course} />
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Course Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Tabs defaultValue="curriculum" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
              <TabsTrigger value="curriculum">Chương trình học</TabsTrigger>
              <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
              <TabsTrigger value="instructor">Giảng viên</TabsTrigger>
            </TabsList>
            
            <TabsContent value="curriculum" className="mt-8">
              <div className="space-y-4">
                {chapters.map((chapter) => (
                  <Card key={chapter.id} className="bg-slate-800/30 border-slate-700">
                    <CardHeader 
                      className="cursor-pointer"
                      onClick={() => toggleChapter(chapter.id)}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">
                          Chương {chapter.number}: {chapter.title}
                        </CardTitle>
                        {expandedChapters.has(chapter.id) ? (
                          <ChevronUp className="w-5 h-5 text-purple-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-purple-400" />
                        )}
                      </div>
                      <p className="text-purple-200 text-sm">{chapter.description}</p>
                    </CardHeader>
                    
                    {expandedChapters.has(chapter.id) && (
                      <CardContent>
                        <div className="space-y-3">
                          {chapter.lessons.map((lesson) => (
                            <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                              <div className="flex items-center">
                                {lesson.isFree ? (
                                  <Play className="w-4 h-4 text-green-400 mr-3" />
                                ) : (
                                  <Lock className="w-4 h-4 text-slate-400 mr-3" />
                                )}
                                <div>
                                  <div className="text-white font-medium">{lesson.title}</div>
                                  <div className="text-purple-200 text-sm">{lesson.duration}</div>
                                </div>
                              </div>
                              {lesson.isCompleted && (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-8">
              <div className="space-y-6">
                {reviews.map((review) => (
                  <Card key={review.id} className="bg-slate-800/30 border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage src={review.userAvatar} alt={review.userName} />
                          <AvatarFallback>
                            {review.userName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-white font-semibold">{review.userName}</div>
                            <div className="flex items-center">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-purple-200">{review.comment}</p>
                          <div className="text-sm text-slate-400 mt-2">
                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="instructor" className="mt-8">
              <Card className="bg-slate-800/30 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={course.instructorAvatar} alt={course.instructor} />
                      <AvatarFallback className="text-2xl">
                        {course.instructor.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{course.instructor}</h3>
                      <p className="text-purple-200 mb-4">{course.instructorBio}</p>
                      <div className="flex items-center space-x-6 text-sm text-slate-400">
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-1" />
                          <span>15+ khóa học</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>10,000+ học sinh</span>
                        </div>
                        <div className="flex items-center">
                          <Award className="w-4 h-4 mr-1" />
                          <span>5+ năm kinh nghiệm</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
