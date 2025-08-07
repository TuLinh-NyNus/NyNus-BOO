'use client';

import { 
  BarChart3, 
  Users, 
  BookOpen, 
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  Award,
  Target,
  Activity
} from 'lucide-react';
import React from 'react';

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress
} from '@/components/ui';

/**
 * Analytics Dashboard Component
 * 
 * Component hiển thị dashboard phân tích và thống kê
 * Placeholder component - cần implement đầy đủ functionality
 */

function Dashboard(): JSX.Element {
  // Mock data - trong thực tế sẽ fetch từ API
  const mockStats = {
    totalUsers: 1250,
    totalCourses: 45,
    totalExams: 128,
    activeUsers: 890,
    completionRate: 78.5,
    averageScore: 85.2,
    monthlyGrowth: 12.5,
    recentActivity: [
      { id: 1, user: 'Nguyễn Văn A', action: 'Hoàn thành khóa học "Toán học cơ bản"', time: '2 phút trước' },
      { id: 2, user: 'Trần Thị B', action: 'Đăng ký khóa học "Vật lý nâng cao"', time: '5 phút trước' },
      { id: 3, user: 'Lê Văn C', action: 'Hoàn thành bài thi "Kiểm tra giữa kỳ"', time: '10 phút trước' },
      { id: 4, user: 'Phạm Thị D', action: 'Bắt đầu học bài "Đạo hàm và tích phân"', time: '15 phút trước' },
    ],
    topCourses: [
      { id: 1, title: 'Toán học cơ bản', students: 234, rating: 4.8, completion: 85 },
      { id: 2, title: 'Vật lý nâng cao', students: 189, rating: 4.6, completion: 72 },
      { id: 3, title: 'Hóa học hữu cơ', students: 156, rating: 4.7, completion: 68 },
      { id: 4, title: 'Ngữ văn 12', students: 298, rating: 4.9, completion: 91 },
    ]
  };

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Dashboard Phân tích</h1>
            <p className="text-muted-foreground">Tổng quan về hoạt động của hệ thống</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{mockStats.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Tổng người dùng</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">+{mockStats.monthlyGrowth}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{mockStats.totalCourses}</p>
                  <p className="text-sm text-muted-foreground">Khóa học</p>
                  <div className="flex items-center mt-1">
                    <Activity className="h-3 w-3 text-blue-500 mr-1" />
                    <span className="text-xs text-blue-500">{mockStats.activeUsers} đang học</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{mockStats.completionRate}%</p>
                  <p className="text-sm text-muted-foreground">Tỷ lệ hoàn thành</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">+2.3%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Award className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{mockStats.averageScore}</p>
                  <p className="text-sm text-muted-foreground">Điểm trung bình</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">+1.2 điểm</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Tăng trưởng người dùng</CardTitle>
              <CardDescription>Số lượng người dùng mới theo tháng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>Biểu đồ tăng trưởng người dùng</p>
                  <p className="text-sm">Chart component sẽ được tích hợp</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất khóa học</CardTitle>
              <CardDescription>Tỷ lệ hoàn thành theo khóa học</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                  <p>Biểu đồ hiệu suất khóa học</p>
                  <p className="text-sm">Chart component sẽ được tích hợp</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Khóa học hàng đầu</CardTitle>
              <CardDescription>Các khóa học được yêu thích nhất</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockStats.topCourses.map((course, index) => (
                  <div key={course.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{course.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{course.students} học viên</span>
                        <span>⭐ {course.rating}</span>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Hoàn thành</span>
                          <span>{course.completion}%</span>
                        </div>
                        <Progress value={course.completion} className="h-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động gần đây</CardTitle>
              <CardDescription>Các hoạt động mới nhất của người dùng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockStats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hệ thống</p>
                  <p className="text-lg font-semibold">Hoạt động bình thường</p>
                </div>
                <Badge variant="default" className="bg-green-500">
                  Online
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cơ sở dữ liệu</p>
                  <p className="text-lg font-semibold">Kết nối ổn định</p>
                </div>
                <Badge variant="default" className="bg-green-500">
                  Connected
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Backup</p>
                  <p className="text-lg font-semibold">Hoàn thành 2h trước</p>
                </div>
                <Badge variant="secondary">
                  Updated
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Default export for lazy loading
export default Dashboard;
