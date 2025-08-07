'use client';

import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Filter,
  Pin,
  CheckCircle,
  Clock,
  User,
  ThumbsUp,
  MessageSquare,
  Eye
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { CourseNavigation, CourseBreadcrumb } from '@/components/features/courses/navigation/course-navigation';
import { MathBackground } from '@/components/features/courses/ui/math-background';
import { Button } from '@/components/ui';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/display/avatar";
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Skeleton } from "@/components/ui/display/skeleton";
import { Input } from "@/components/ui/form/input";
import { getDiscussionsByCourseId } from '@/lib/mock-data/course-details';
import { getCourseBySlug } from '@/lib/mock-data/courses';
import { MockCourse, MockDiscussion } from '@/lib/mock-data/types';
import logger from '@/lib/utils/logger';

export default function CourseDiscussionsPage(): JSX.Element | null {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [course, setCourse] = useState<MockCourse | null>(null);
  const [discussions, setDiscussions] = useState<MockDiscussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pinned' | 'resolved' | 'unresolved'>('all');

  useEffect(() => {
    const loadDiscussionData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const courseData = getCourseBySlug(slug);
        if (!courseData) {
          router.push('/courses');
          return;
        }

        const discussionsData = getDiscussionsByCourseId(courseData.id);

        setCourse(courseData);
        setDiscussions(discussionsData);
      } catch (error) {
        logger.error('Error loading discussion data:', error);
        router.push('/courses');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      loadDiscussionData();
    }
  }, [slug, router]);

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'pinned' && discussion.isPinned) ||
                         (filterType === 'resolved' && discussion.isResolved) ||
                         (filterType === 'unresolved' && !discussion.isResolved);
    
    return matchesSearch && matchesFilter;
  });

  const handleDiscussionClick = (discussionId: string) => {
    router.push(`/courses/${slug}/discussions/${discussionId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <MathBackground />
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-3/4 bg-slate-700" />
                      <Skeleton className="h-4 w-full bg-slate-700" />
                      <div className="flex gap-4">
                        <Skeleton className="h-4 w-20 bg-slate-700" />
                        <Skeleton className="h-4 w-16 bg-slate-700" />
                        <Skeleton className="h-4 w-24 bg-slate-700" />
                      </div>
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

  if (!course) {
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
                <h1 className="text-3xl font-bold text-white mb-2">Thảo luận khóa học</h1>
                <p className="text-slate-400">
                  Tham gia thảo luận, đặt câu hỏi và chia sẻ kiến thức với cộng đồng học viên
                </p>
              </div>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Tạo thảo luận mới
              </Button>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Tìm kiếm thảo luận..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { key: 'all', label: 'Tất cả' },
                      { key: 'pinned', label: 'Đã ghim' },
                      { key: 'resolved', label: 'Đã giải quyết' },
                      { key: 'unresolved', label: 'Chưa giải quyết' }
                    ].map((filter) => (
                      <Button
                        key={filter.key}
                        variant={filterType === filter.key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterType(filter.key as any)}
                        className={filterType === filter.key 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                        }
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Discussions List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {filteredDiscussions.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <MessageCircle className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {searchTerm || filterType !== 'all' ? 'Không tìm thấy thảo luận nào' : 'Chưa có thảo luận nào'}
                  </h3>
                  <p className="text-slate-400 mb-6">
                    {searchTerm || filterType !== 'all' 
                      ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                      : 'Hãy là người đầu tiên tạo thảo luận cho khóa học này'
                    }
                  </p>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo thảo luận đầu tiên
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredDiscussions.map((discussion, index) => (
                <motion.div
                  key={discussion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card 
                    className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 transition-all cursor-pointer group"
                    onClick={() => handleDiscussionClick(discussion.id)}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {discussion.isPinned && (
                                <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                                  <Pin className="h-3 w-3 mr-1" />
                                  Đã ghim
                                </Badge>
                              )}
                              {discussion.isResolved && (
                                <Badge variant="outline" className="text-green-400 border-green-400">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Đã giải quyết
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                              {discussion.title}
                            </h3>
                            <p className="text-slate-400 text-sm line-clamp-2 mt-1">
                              {discussion.content}
                            </p>
                          </div>
                        </div>

                        {/* Author and Stats */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={discussion.userAvatar} alt={discussion.userName} />
                              <AvatarFallback className="bg-purple-600 text-white text-xs">
                                {discussion.userName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                              <p className="text-white font-medium">{discussion.userName}</p>
                              <p className="text-slate-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(discussion.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              <span>{discussion.replies.length}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-4 w-4" />
                              <span>{discussion.likes}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
