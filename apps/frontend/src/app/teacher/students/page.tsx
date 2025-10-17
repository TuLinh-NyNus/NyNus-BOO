"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  Award,
  FileText,
  Search,
  Filter,
  Grid3x3,
  List,
  Eye,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  MoreHorizontal,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context-grpc";
import { UserRole } from "@/generated/common/common_pb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/overlay/dropdown-menu";

// Real backend hooks
import { useTeacherStudents, useInvalidateTeacherAnalytics } from "@/hooks/teacher/use-teacher-analytics";

// Disable static generation
export const dynamic = 'force-dynamic';

/**
 * Student Filters Interface
 */
interface StudentFilters {
  search: string;
  course: string;
  performance: 'all' | 'excellent' | 'good' | 'needs-improvement';
  status: 'all' | 'active' | 'inactive' | 'suspended';
  viewMode: 'grid' | 'list';
}

/**
 * Student Interface (simplified from AdminUser)
 */
interface Student {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  totalCourses: number;
  totalExamResults: number;
  averageScore: number;
  completionRate: number;
  status: 'active' | 'inactive' | 'suspended';
  lastActivity: Date;
}

/**
 * Teacher Students Page
 * Trang quản lý học sinh cho giáo viên
 */
export default function TeacherStudentsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // State
  const [filters, setFilters] = useState<StudentFilters>({
    search: '',
    course: 'all',
    performance: 'all',
    status: 'all',
    viewMode: 'grid',
  });

  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Real backend data
  const { data: studentsData, isLoading: studentsLoading, error, refetch } = useTeacherStudents(
    user?.id || '',
    page,
    pageSize,
    { enabled: !!user?.id }
  );

  const { invalidateStudents } = useInvalidateTeacherAnalytics();

  // Loading state
  if (authLoading || studentsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Authorization check
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Lỗi tải dữ liệu
            </CardTitle>
            <CardDescription>
              {error.message || 'Không thể tải danh sách học sinh. Vui lòng thử lại sau.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No data state
  if (!studentsData) {
    return null;
  }

  // Real students data from backend
  const students = studentsData.students.map(s => ({
    id: s.userId,
    email: s.email,
    firstName: s.firstName,
    lastName: s.lastName,
    avatar: undefined,
    totalCourses: s.totalCourses,
    totalExamResults: s.totalExamResults,
    averageScore: s.averageScore,
    completionRate: s.completionRate,
    status: s.status as 'active' | 'inactive' | 'suspended',
    lastActivity: s.lastActivity || new Date(),
  }));

  // Statistics from real data
  const stats = useMemo(() => {
    const activeStudents = students.filter(s => s.status === 'active').length;
    const totalScore = students.reduce((sum, s) => sum + s.averageScore, 0);
    const avgScore = students.length > 0 ? (totalScore / students.length).toFixed(1) : '0.0';
    const pendingGrading = 0; // TODO: Get from backend

    return {
      totalStudents: studentsData.total,
      activeStudents,
      averageScore: avgScore,
      pendingGrading,
    };
  }, [students, studentsData.total]);

  // Filter students (client-side filtering)
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch =
        student.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.email.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = filters.status === 'all' || student.status === filters.status;
      
      const matchesPerformance = filters.performance === 'all' || (() => {
        if (student.averageScore >= 8) return filters.performance === 'excellent';
        if (student.averageScore >= 6.5) return filters.performance === 'good';
        return filters.performance === 'needs-improvement';
      })();

      return matchesSearch && matchesStatus && matchesPerformance;
    });
  }, [mockStudents, filters]);

  // Handlers
  const handleFilterChange = useCallback((key: keyof StudentFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleViewStudent = useCallback((studentId: string) => {
    console.log('View student:', studentId);
    // TODO: Navigate to student detail page
  }, []);

  const handleGradeStudent = useCallback((studentId: string) => {
    console.log('Grade student:', studentId);
    // TODO: Open grading interface
  }, []);

  const handleMessageStudent = useCallback((studentId: string) => {
    console.log('Message student:', studentId);
    // TODO: Open messaging interface
  }, []);

  const handleRefresh = useCallback(() => {
    console.log('Refresh students');
    // TODO: Reload students from backend
  }, []);

  // Get performance badge
  const getPerformanceBadge = (score: number) => {
    if (score >= 8) return <Badge className="bg-green-500">Xuất sắc</Badge>;
    if (score >= 6.5) return <Badge className="bg-blue-500">Tốt</Badge>;
    return <Badge className="bg-yellow-500">Cần cải thiện</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Quản lý Học sinh</h1>
              <p className="text-muted-foreground mt-1">Theo dõi tiến độ và kết quả học tập của học sinh</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Làm mới
              </Button>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Thêm học sinh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Statistics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng số học sinh</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">Đang theo học</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500/50" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeStudents}</div>
                <p className="text-xs text-muted-foreground">Học sinh tích cực</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Điểm trung bình</CardTitle>
                <Award className="h-4 w-4 text-yellow-500/50" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageScore}</div>
                <p className="text-xs text-muted-foreground">Điểm TB toàn lớp</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chờ chấm điểm</CardTitle>
                <FileText className="h-4 w-4 text-orange-500/50" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingGrading}</div>
                <p className="text-xs text-muted-foreground">Bài thi cần chấm</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên, email..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Performance Filter */}
              <Select value={filters.performance} onValueChange={(value) => handleFilterChange('performance', value)}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Kết quả học tập" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="excellent">Xuất sắc (≥8.0)</SelectItem>
                  <SelectItem value="good">Tốt (6.5-7.9)</SelectItem>
                  <SelectItem value="needs-improvement">Cần cải thiện (&lt;6.5)</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                  <SelectItem value="suspended">Tạm ngưng</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={filters.viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => handleFilterChange('viewMode', 'grid')}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={filters.viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => handleFilterChange('viewMode', 'list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Display */}
        {filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy học sinh</h3>
              <p className="text-muted-foreground">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
            </CardContent>
          </Card>
        ) : filters.viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-xl transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>
                          {student.firstName[0]}{student.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">
                          {student.firstName} {student.lastName}
                        </CardTitle>
                        <CardDescription className="truncate">{student.email}</CardDescription>
                      </div>
                      {getPerformanceBadge(student.averageScore)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tiến độ học tập</span>
                        <span className="font-medium">{student.completionRate}%</span>
                      </div>
                      <Progress value={student.completionRate} className="h-2" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold">{student.totalCourses}</div>
                        <div className="text-xs text-muted-foreground">Khóa học</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold">{student.averageScore}</div>
                        <div className="text-xs text-muted-foreground">Điểm TB</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold">{student.totalExamResults}</div>
                        <div className="text-xs text-muted-foreground">Bài thi</div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleViewStudent(student.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Xem
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleGradeStudent(student.id)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Chấm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMessageStudent(student.id)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {filteredStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <Avatar className="h-16 w-16 flex-shrink-0">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>
                          {student.firstName[0]}{student.lastName[0]}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">
                          {student.firstName} {student.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {student.totalCourses} khóa học
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Điểm TB: {student.averageScore}
                          </Badge>
                          {getPerformanceBadge(student.averageScore)}
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="hidden md:block w-48 flex-shrink-0">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Tiến độ</span>
                          <span className="font-medium">{student.completionRate}%</span>
                        </div>
                        <Progress value={student.completionRate} className="h-2" />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewStudent(student.id)}
                          className="hidden sm:flex"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGradeStudent(student.id)}
                          className="hidden sm:flex"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Chấm
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewStudent(student.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleGradeStudent(student.id)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Chấm điểm
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMessageStudent(student.id)}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Gửi tin nhắn
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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

