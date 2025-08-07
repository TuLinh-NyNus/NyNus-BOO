'use client';

import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play,
  Download,
  Share2,
  Heart
} from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/display/avatar";
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";

/**
 * Course Details Component
 * 
 * Component hiển thị chi tiết khóa học
 * Placeholder component - cần implement đầy đủ functionality
 */

interface CourseDetailsProps {
  courseId: string;
}

function CourseDetails({ courseId }: CourseDetailsProps): JSX.Element {
  // Mock data - trong thực tế sẽ fetch từ API
  const mockCourse = {
    id: courseId,
    title: 'Toán học cơ bản cho học sinh THPT',
    description: 'Khóa học toán học cơ bản dành cho học sinh trung học phổ thông với các bài giảng chi tiết và bài tập thực hành. Khóa học bao gồm các chủ đề từ cơ bản đến nâng cao, giúp học sinh nắm vững kiến thức toán học.',
    instructor: {
      name: 'Nguyễn Văn A',
      avatar: '',
      title: 'Thạc sĩ Toán học',
      experience: '10 năm kinh nghiệm'
    },
    duration: '120 phút',
    students: 1250,
    rating: 4.8,
    totalRatings: 324,
    price: 'Miễn phí',
    thumbnail: 'https://placehold.co/800x400/blue/white?text=Toán+học',
    category: 'Toán học',
    level: 'Cơ bản',
    createdAt: '2024-01-15',
    updatedAt: '2024-06-01',
    chapters: [
      { id: '1', title: 'Giới thiệu về Toán học', duration: '15 phút', completed: false },
      { id: '2', title: 'Số học cơ bản', duration: '25 phút', completed: false },
      { id: '3', title: 'Đại số', duration: '30 phút', completed: false },
      { id: '4', title: 'Hình học', duration: '35 phút', completed: false },
      { id: '5', title: 'Bài tập tổng hợp', duration: '15 phút', completed: false },
    ]
  };

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Header */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{mockCourse.category}</Badge>
                  <Badge variant="outline">{mockCourse.level}</Badge>
                </div>
                
                <h1 className="text-3xl font-bold">{mockCourse.title}</h1>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{mockCourse.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{mockCourse.students.toLocaleString()} học viên</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{mockCourse.rating}</span>
                    <span>({mockCourse.totalRatings} đánh giá)</span>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  {mockCourse.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Course Content */}
          <Card>
            <CardHeader>
              <CardTitle>Nội dung khóa học</CardTitle>
              <CardDescription>
                {mockCourse.chapters.length} chương • {mockCourse.duration}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockCourse.chapters.map((chapter, index) => (
                  <div 
                    key={chapter.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{chapter.title}</h4>
                        <p className="text-sm text-muted-foreground">{chapter.duration}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {mockCourse.price}
                  </div>
                </div>
                
                <Button className="w-full" size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  Bắt đầu học
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4 mr-2" />
                    Yêu thích
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Chia sẻ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructor Info */}
          <Card>
            <CardHeader>
              <CardTitle>Giảng viên</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={mockCourse.instructor.avatar} />
                  <AvatarFallback>
                    {mockCourse.instructor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">{mockCourse.instructor.name}</h4>
                  <p className="text-sm text-muted-foreground">{mockCourse.instructor.title}</p>
                  <p className="text-sm text-muted-foreground">{mockCourse.instructor.experience}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin khóa học</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày tạo:</span>
                  <span>{new Date(mockCourse.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cập nhật:</span>
                  <span>{new Date(mockCourse.updatedAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngôn ngữ:</span>
                  <span>Tiếng Việt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chứng chỉ:</span>
                  <span>Có</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Default export for lazy loading
export default CourseDetails;
