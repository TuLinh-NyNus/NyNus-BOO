"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Plus,
  Search,
  Grid3x3,
  List,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Users,
  Clock,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context-grpc";
import { UserRole } from "@/generated/common/common_pb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/form/select";
import { useToast } from "@/hooks";

// Disable static generation
export const dynamic = 'force-dynamic';

// ===== TYPES =====

interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  status: 'draft' | 'published' | 'archived';
  students: number;
  completionRate: number;
  lastUpdated: Date;
  thumbnail?: string;
}

interface CourseFilters {
  search: string;
  subject: string;
  grade: string;
  status: string;
}

// ===== MOCK DATA =====

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Đại số 12 - Chương 1: Hàm số',
    description: 'Khóa học về hàm số lớp 12, bao gồm các dạng hàm số cơ bản và nâng cao',
    subject: 'Toán',
    grade: '12',
    status: 'published',
    students: 45,
    completionRate: 78,
    lastUpdated: new Date('2025-01-15'),
  },
  {
    id: '2',
    title: 'Hình học 11 - Chương 2: Đường thẳng và mặt phẳng',
    description: 'Khóa học về quan hệ song song và vuông góc trong không gian',
    subject: 'Toán',
    grade: '11',
    status: 'published',
    students: 38,
    completionRate: 65,
    lastUpdated: new Date('2025-01-10'),
  },
  {
    id: '3',
    title: 'Đại số 10 - Chương 3: Phương trình và bất phương trình',
    description: 'Khóa học về giải phương trình và bất phương trình bậc nhất, bậc hai',
    subject: 'Toán',
    grade: '10',
    status: 'draft',
    students: 0,
    completionRate: 0,
    lastUpdated: new Date('2025-01-18'),
  },
];

// ===== COMPONENT =====

export default function TeacherCoursesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // State
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<CourseFilters>({
    search: '',
    subject: 'all',
    grade: 'all',
    status: 'all',
  });

  // Handlers (MUST BE BEFORE EARLY RETURN)
  const handleFilterChange = useCallback((key: keyof CourseFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCourses(mockCourses);
    setIsLoading(false);
    toast({
      title: "Đã làm mới",
      description: "Danh sách khóa học đã được cập nhật",
    });
  }, [toast]);

  const handleCreateCourse = useCallback(() => {
    router.push('/teacher/courses/create');
  }, [router]);

  const handleEditCourse = useCallback((courseId: string) => {
    router.push(`/teacher/courses/${courseId}/edit`);
  }, [router]);

  const handleViewCourse = useCallback((courseId: string) => {
    router.push(`/teacher/courses/${courseId}`);
  }, [router]);

  const handleDeleteCourse = useCallback((_courseId: string) => {
    toast({
      title: "Xóa khóa học",
      description: "Tính năng đang được phát triển",
    });
  }, [toast]);

  // Check authentication (AFTER ALL HOOKS)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== UserRole.USER_ROLE_TEACHER && user.role !== UserRole.USER_ROLE_ADMIN)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Không có quyền truy cập
            </CardTitle>
            <CardDescription>
              Bạn cần có quyền giáo viên để truy cập trang này.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Về Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter courses
  const filteredCourses = courses.filter(course => {
    if (filters.search && !course.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.subject !== 'all' && course.subject !== filters.subject) {
      return false;
    }
    if (filters.grade !== 'all' && course.grade !== filters.grade) {
      return false;
    }
    if (filters.status !== 'all' && course.status !== filters.status) {
      return false;
    }
    return true;
  });

  // Stats
  const stats = {
    total: courses.length,
    published: courses.filter(c => c.status === 'published').length,
    draft: courses.filter(c => c.status === 'draft').length,
    totalStudents: courses.reduce((sum, c) => sum + c.students, 0),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-primary" />
                Quản lý Khóa học
              </h1>
              <p className="text-muted-foreground mt-2">
                Tạo và quản lý nội dung khóa học của bạn
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
              <Button onClick={handleCreateCourse}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo khóa học mới
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Tổng khóa học</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-primary/50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Đã xuất bản</p>
                      <p className="text-2xl font-bold">{stats.published}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500/50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Bản nháp</p>
                      <p className="text-2xl font-bold">{stats.draft}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-500/50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Tổng học sinh</p>
                      <p className="text-2xl font-bold">{stats.totalStudents}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500/50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm khóa học..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Subject Filter */}
              <Select
                value={filters.subject}
                onValueChange={(value) => handleFilterChange('subject', value)}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Môn học" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả môn</SelectItem>
                  <SelectItem value="Toán">Toán</SelectItem>
                  <SelectItem value="Lý">Lý</SelectItem>
                  <SelectItem value="Hóa">Hóa</SelectItem>
                </SelectContent>
              </Select>

              {/* Grade Filter */}
              <Select
                value={filters.grade}
                onValueChange={(value) => handleFilterChange('grade', value)}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Khối lớp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khối</SelectItem>
                  <SelectItem value="10">Lớp 10</SelectItem>
                  <SelectItem value="11">Lớp 11</SelectItem>
                  <SelectItem value="12">Lớp 12</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="published">Đã xuất bản</SelectItem>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                  <SelectItem value="archived">Đã lưu trữ</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid/List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-40 bg-muted rounded-lg mb-4"></div>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-full mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy khóa học</h3>
              <p className="text-muted-foreground mb-4">
                Thử thay đổi bộ lọc hoặc tạo khóa học mới
              </p>
              <Button onClick={handleCreateCourse}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo khóa học mới
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge
                        variant={
                          course.status === 'published'
                            ? 'default'
                            : course.status === 'draft'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {course.status === 'published'
                          ? 'Đã xuất bản'
                          : course.status === 'draft'
                          ? 'Bản nháp'
                          : 'Đã lưu trữ'}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewCourse(course.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditCourse(course.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteCourse(course.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{course.students} học sinh</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{course.completionRate}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          Cập nhật: {course.lastUpdated.toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{course.subject}</Badge>
                        <Badge variant="outline">Lớp {course.grade}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                            {course.title}
                          </h3>
                          <Badge
                            variant={
                              course.status === 'published'
                                ? 'default'
                                : course.status === 'draft'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {course.status === 'published'
                              ? 'Đã xuất bản'
                              : course.status === 'draft'
                              ? 'Bản nháp'
                              : 'Đã lưu trữ'}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{course.students} học sinh</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>Hoàn thành: {course.completionRate}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              Cập nhật: {course.lastUpdated.toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Badge variant="outline">{course.subject}</Badge>
                          <Badge variant="outline">Lớp {course.grade}</Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewCourse(course.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditCourse(course.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteCourse(course.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

