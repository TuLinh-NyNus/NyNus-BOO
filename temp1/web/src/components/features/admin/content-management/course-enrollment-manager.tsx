'use client';

import { BookOpen, Users, Plus, Minus, Search, Filter, MoreHorizontal, Calendar, Clock, Award } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { Checkbox } from "@/components/ui/form/checkbox";
import { Input } from "@/components/ui/form/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { AdminUser } from '@/lib/api/admin-users.service';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: number; // in hours
  enrollmentCount: number;
  maxEnrollment: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  createdAt: string;
  price: number;
}

interface Enrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'SUSPENDED';
  progress: number;
  lastAccessedAt: string;
  completedAt?: string;
  grade?: number;
}

interface CourseEnrollmentManagerProps {
  user: AdminUser;
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Lập trình JavaScript cơ bản',
    description: 'Khóa học JavaScript từ cơ bản đến nâng cao',
    instructor: 'Nguyễn Văn A',
    category: 'Programming',
    level: 'BEGINNER',
    duration: 40,
    enrollmentCount: 150,
    maxEnrollment: 200,
    status: 'ACTIVE',
    createdAt: '2024-01-15',
    price: 500000,
  },
  {
    id: '2',
    title: 'React.js Advanced',
    description: 'Khóa học React.js nâng cao với hooks và context',
    instructor: 'Trần Thị B',
    category: 'Programming',
    level: 'ADVANCED',
    duration: 60,
    enrollmentCount: 80,
    maxEnrollment: 100,
    status: 'ACTIVE',
    createdAt: '2024-02-01',
    price: 800000,
  },
  {
    id: '3',
    title: 'UI/UX Design Fundamentals',
    description: 'Thiết kế giao diện người dùng cơ bản',
    instructor: 'Lê Văn C',
    category: 'Design',
    level: 'BEGINNER',
    duration: 30,
    enrollmentCount: 120,
    maxEnrollment: 150,
    status: 'ACTIVE',
    createdAt: '2024-01-20',
    price: 600000,
  },
];

const mockEnrollments: Enrollment[] = [
  {
    id: '1',
    courseId: '1',
    courseTitle: 'Lập trình JavaScript cơ bản',
    enrolledAt: '2024-01-20',
    status: 'ACTIVE',
    progress: 65,
    lastAccessedAt: '2024-06-15',
  },
  {
    id: '2',
    courseId: '3',
    courseTitle: 'UI/UX Design Fundamentals',
    enrolledAt: '2024-02-01',
    status: 'COMPLETED',
    progress: 100,
    lastAccessedAt: '2024-05-30',
    completedAt: '2024-05-30',
    grade: 85,
  },
];

const levelColors = {
  BEGINNER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  ADVANCED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  DROPPED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  SUSPENDED: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
};

export function CourseEnrollmentManager({ user }: CourseEnrollmentManagerProps) {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(mockEnrollments);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [enrollDialog, setEnrollDialog] = useState<{
    open: boolean;
    course?: Course;
  }>({ open: false });
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const handleEnrollUser = async (courseId: string) => {
    try {
      setLoading(true);
      
      // Check if already enrolled
      const alreadyEnrolled = enrollments.some(e => e.courseId === courseId);
      if (alreadyEnrolled) {
        toast({
          title: 'Thông báo',
          description: 'Người dùng đã đăng ký khóa học này',
          variant: 'default',
        });
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const course = courses.find(c => c.id === courseId);
      if (course) {
        const newEnrollment: Enrollment = {
          id: Date.now().toString(),
          courseId,
          courseTitle: course.title,
          enrolledAt: new Date().toISOString(),
          status: 'ACTIVE',
          progress: 0,
          lastAccessedAt: new Date().toISOString(),
        };

        setEnrollments(prev => [...prev, newEnrollment]);
        
        toast({
          title: 'Thành công',
          description: `Đã đăng ký ${user.firstName} ${user.lastName} vào khóa học ${course.title}`,
        });
      }
    } catch (error) {
      console.error('Error enrolling user:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể đăng ký khóa học',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setEnrollDialog({ open: false });
    }
  };

  const handleUnenrollUser = async (enrollmentId: string) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
      
      toast({
        title: 'Thành công',
        description: 'Đã hủy đăng ký khóa học',
      });
    } catch (error) {
      console.error('Error unenrolling user:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể hủy đăng ký khóa học',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkEnroll = async () => {
    if (selectedCourses.length === 0) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn ít nhất một khóa học',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newEnrollments: Enrollment[] = selectedCourses.map(courseId => {
        const course = courses.find(c => c.id === courseId);
        return {
          id: Date.now().toString() + courseId,
          courseId,
          courseTitle: course?.title || '',
          enrolledAt: new Date().toISOString(),
          status: 'ACTIVE' as const,
          progress: 0,
          lastAccessedAt: new Date().toISOString(),
        };
      });

      setEnrollments(prev => [...prev, ...newEnrollments]);
      setSelectedCourses([]);
      
      toast({
        title: 'Thành công',
        description: `Đã đăng ký ${selectedCourses.length} khóa học cho ${user.firstName} ${user.lastName}`,
      });
    } catch (error) {
      console.error('Error bulk enrolling:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể đăng ký hàng loạt',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Quản lý khóa học & đăng ký
          </CardTitle>
          <CardDescription>
            Quản lý việc đăng ký khóa học cho {user.firstName} {user.lastName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="enrollments" className="space-y-4">
            <TabsList>
              <TabsTrigger value="enrollments">Khóa học đã đăng ký</TabsTrigger>
              <TabsTrigger value="available">Khóa học có sẵn</TabsTrigger>
            </TabsList>

            <TabsContent value="enrollments" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Khóa học đã đăng ký ({enrollments.length})
                </h3>
              </div>

              {enrollments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa đăng ký khóa học nào</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Khóa học</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Tiến độ</TableHead>
                      <TableHead>Ngày đăng ký</TableHead>
                      <TableHead>Lần truy cập cuối</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{enrollment.courseTitle}</div>
                            {enrollment.grade && (
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Award className="h-3 w-3" />
                                Điểm: {enrollment.grade}/100
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[enrollment.status]}>
                            {enrollment.status === 'ACTIVE' && 'Đang học'}
                            {enrollment.status === 'COMPLETED' && 'Hoàn thành'}
                            {enrollment.status === 'DROPPED' && 'Đã bỏ'}
                            {enrollment.status === 'SUSPENDED' && 'Tạm dừng'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${enrollment.progress}%` }}
                              />
                            </div>
                            <span className="text-sm">{enrollment.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {formatDate(enrollment.enrolledAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {formatDate(enrollment.lastAccessedAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleUnenrollUser(enrollment.id)}
                                className="text-red-600"
                              >
                                Hủy đăng ký
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="available" className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Tìm kiếm khóa học..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="Programming">Lập trình</SelectItem>
                    <SelectItem value="Design">Thiết kế</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Mức độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="BEGINNER">Cơ bản</SelectItem>
                    <SelectItem value="INTERMEDIATE">Trung cấp</SelectItem>
                    <SelectItem value="ADVANCED">Nâng cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bulk Actions */}
              {selectedCourses.length > 0 && (
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <span className="text-sm">
                    Đã chọn {selectedCourses.length} khóa học
                  </span>
                  <Button size="sm" onClick={handleBulkEnroll} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Đăng ký hàng loạt
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCourses([])}
                  >
                    Bỏ chọn
                  </Button>
                </div>
              )}

              {/* Course List */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedCourses.length === filteredCourses.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCourses(filteredCourses.map(c => c.id));
                          } else {
                            setSelectedCourses([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Khóa học</TableHead>
                    <TableHead>Giảng viên</TableHead>
                    <TableHead>Mức độ</TableHead>
                    <TableHead>Thời lượng</TableHead>
                    <TableHead>Học viên</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => {
                    const isEnrolled = enrollments.some(e => e.courseId === course.id);
                    const isSelected = selectedCourses.includes(course.id);
                    
                    return (
                      <TableRow key={course.id}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCourses(prev => [...prev, course.id]);
                              } else {
                                setSelectedCourses(prev => prev.filter(id => id !== course.id));
                              }
                            }}
                            disabled={isEnrolled}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{course.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {course.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{course.instructor}</TableCell>
                        <TableCell>
                          <Badge className={levelColors[course.level]}>
                            {course.level === 'BEGINNER' && 'Cơ bản'}
                            {course.level === 'INTERMEDIATE' && 'Trung cấp'}
                            {course.level === 'ADVANCED' && 'Nâng cao'}
                          </Badge>
                        </TableCell>
                        <TableCell>{course.duration}h</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            {course.enrollmentCount}/{course.maxEnrollment}
                          </div>
                        </TableCell>
                        <TableCell>{formatPrice(course.price)}</TableCell>
                        <TableCell className="text-right">
                          {isEnrolled ? (
                            <Badge variant="outline">Đã đăng ký</Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => setEnrollDialog({ open: true, course })}
                              disabled={loading}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Đăng ký
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Enroll Confirmation Dialog */}
      <Dialog open={enrollDialog.open} onOpenChange={(open) => setEnrollDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận đăng ký khóa học</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn đăng ký {user.firstName} {user.lastName} vào khóa học này không?
            </DialogDescription>
          </DialogHeader>
          
          {enrollDialog.course && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium">{enrollDialog.course.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {enrollDialog.course.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span>Giảng viên: {enrollDialog.course.instructor}</span>
                  <span>Thời lượng: {enrollDialog.course.duration}h</span>
                  <span>Giá: {formatPrice(enrollDialog.course.price)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEnrollDialog({ open: false })}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button 
              onClick={() => enrollDialog.course && handleEnrollUser(enrollDialog.course.id)}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
