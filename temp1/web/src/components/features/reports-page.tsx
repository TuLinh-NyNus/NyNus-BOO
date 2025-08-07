'use client';

import { 
  FileText, 
  Download, 
  Filter, 
  Calendar,
  Users,
  BookOpen,
  Target,
  TrendingUp,
  Eye,
  BarChart3,
  PieChart
} from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/**
 * Reports Page Component
 * 
 * Component trang báo cáo và thống kê
 * Placeholder component - cần implement đầy đủ functionality
 */

function ReportsPage(): JSX.Element {
  const [dateRange, setDateRange] = useState('last-30-days');
  const [selectedReport, setSelectedReport] = useState('overview');

  // Mock data - trong thực tế sẽ fetch từ API
  const mockReports = {
    overview: {
      totalUsers: 1250,
      newUsers: 156,
      totalCourses: 45,
      completedCourses: 892,
      totalExams: 128,
      averageScore: 85.2,
      completionRate: 78.5
    },
    userReports: [
      {
        id: '1',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        coursesEnrolled: 5,
        coursesCompleted: 3,
        averageScore: 88.5,
        lastActivity: '2024-06-15T10:30:00Z',
        status: 'active'
      },
      {
        id: '2',
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
        coursesEnrolled: 3,
        coursesCompleted: 2,
        averageScore: 92.1,
        lastActivity: '2024-06-14T15:20:00Z',
        status: 'active'
      },
      {
        id: '3',
        name: 'Lê Văn C',
        email: 'levanc@example.com',
        coursesEnrolled: 7,
        coursesCompleted: 4,
        averageScore: 76.8,
        lastActivity: '2024-06-13T09:45:00Z',
        status: 'inactive'
      }
    ],
    courseReports: [
      {
        id: '1',
        title: 'Toán học cơ bản',
        instructor: 'GS. Nguyễn Văn X',
        enrollments: 234,
        completions: 198,
        averageScore: 85.6,
        completionRate: 84.6,
        rating: 4.8
      },
      {
        id: '2',
        title: 'Vật lý nâng cao',
        instructor: 'TS. Trần Thị Y',
        enrollments: 189,
        completions: 136,
        averageScore: 78.9,
        completionRate: 72.0,
        rating: 4.6
      },
      {
        id: '3',
        title: 'Hóa học hữu cơ',
        instructor: 'PGS. Lê Văn Z',
        enrollments: 156,
        completions: 106,
        averageScore: 82.3,
        completionRate: 67.9,
        rating: 4.7
      }
    ],
    examReports: [
      {
        id: '1',
        title: 'Kiểm tra giữa kỳ - Toán học',
        course: 'Toán học cơ bản',
        attempts: 234,
        averageScore: 85.6,
        passRate: 89.3,
        duration: '90 phút',
        date: '2024-06-10T00:00:00Z'
      },
      {
        id: '2',
        title: 'Bài thi cuối kỳ - Vật lý',
        course: 'Vật lý nâng cao',
        attempts: 189,
        averageScore: 78.9,
        passRate: 76.2,
        duration: '120 phút',
        date: '2024-06-08T00:00:00Z'
      }
    ]
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge variant="default">Hoạt động</Badge>
      : <Badge variant="secondary">Không hoạt động</Badge>;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Báo cáo & Thống kê</h1>
              <p className="text-muted-foreground">Phân tích chi tiết về hoạt động học tập</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>
        </div>

        {/* Date Range Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Label>Khoảng thời gian:</Label>
              </div>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="last-7-days">7 ngày qua</option>
                <option value="last-30-days">30 ngày qua</option>
                <option value="last-3-months">3 tháng qua</option>
                <option value="last-6-months">6 tháng qua</option>
                <option value="last-year">1 năm qua</option>
                <option value="custom">Tùy chỉnh</option>
              </select>
              {dateRange === 'custom' && (
                <div className="flex space-x-2">
                  <Input type="date" className="w-40" />
                  <span className="text-muted-foreground">đến</span>
                  <Input type="date" className="w-40" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reports Tabs */}
        <Tabs value={selectedReport} onValueChange={setSelectedReport}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="users">Người dùng</TabsTrigger>
            <TabsTrigger value="courses">Khóa học</TabsTrigger>
            <TabsTrigger value="exams">Bài thi</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{mockReports.overview.totalUsers.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Tổng người dùng</p>
                      <p className="text-xs text-green-500">+{mockReports.overview.newUsers} mới</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{mockReports.overview.totalCourses}</p>
                      <p className="text-sm text-muted-foreground">Khóa học</p>
                      <p className="text-xs text-blue-500">{mockReports.overview.completedCourses} hoàn thành</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Target className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">{mockReports.overview.completionRate}%</p>
                      <p className="text-sm text-muted-foreground">Tỷ lệ hoàn thành</p>
                      <p className="text-xs text-green-500">+2.3% so với tháng trước</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold">{mockReports.overview.averageScore}</p>
                      <p className="text-sm text-muted-foreground">Điểm trung bình</p>
                      <p className="text-xs text-green-500">+1.2 điểm</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Xu hướng học tập</CardTitle>
                  <CardDescription>Số lượng người dùng hoạt động theo thời gian</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                      <p>Biểu đồ xu hướng học tập</p>
                      <p className="text-sm">Chart component sẽ được tích hợp</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Phân bố điểm số</CardTitle>
                  <CardDescription>Phân bố điểm số của học viên</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <PieChart className="h-12 w-12 mx-auto mb-2" />
                      <p>Biểu đồ phân bố điểm số</p>
                      <p className="text-sm">Chart component sẽ được tích hợp</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Báo cáo người dùng</CardTitle>
                <CardDescription>Chi tiết hoạt động của từng người dùng</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Khóa học đăng ký</TableHead>
                      <TableHead>Hoàn thành</TableHead>
                      <TableHead>Điểm TB</TableHead>
                      <TableHead>Hoạt động cuối</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockReports.userReports.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.firstName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.coursesEnrolled}</TableCell>
                        <TableCell>{user.coursesCompleted}</TableCell>
                        <TableCell>{user.averageScore}</TableCell>
                        <TableCell>
                          {new Date(user.lastActivity).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Báo cáo khóa học</CardTitle>
                <CardDescription>Hiệu suất và thống kê của từng khóa học</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên khóa học</TableHead>
                      <TableHead>Giảng viên</TableHead>
                      <TableHead>Đăng ký</TableHead>
                      <TableHead>Hoàn thành</TableHead>
                      <TableHead>Tỷ lệ hoàn thành</TableHead>
                      <TableHead>Điểm TB</TableHead>
                      <TableHead>Đánh giá</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockReports.courseReports.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{course.instructor}</TableCell>
                        <TableCell>{course.enrollments}</TableCell>
                        <TableCell>{course.completions}</TableCell>
                        <TableCell>{course.completionRate}%</TableCell>
                        <TableCell>{course.averageScore}</TableCell>
                        <TableCell>⭐ {course.rating}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Báo cáo bài thi</CardTitle>
                <CardDescription>Kết quả và thống kê của các bài thi</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên bài thi</TableHead>
                      <TableHead>Khóa học</TableHead>
                      <TableHead>Lượt thi</TableHead>
                      <TableHead>Điểm TB</TableHead>
                      <TableHead>Tỷ lệ đạt</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Ngày thi</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockReports.examReports.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">{exam.title}</TableCell>
                        <TableCell>{exam.course}</TableCell>
                        <TableCell>{exam.attempts}</TableCell>
                        <TableCell>{exam.averageScore}</TableCell>
                        <TableCell>{exam.passRate}%</TableCell>
                        <TableCell>{exam.duration}</TableCell>
                        <TableCell>
                          {new Date(exam.date).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Default export for lazy loading
export default ReportsPage;
