'use client';

import React from 'react';

import { Users, BookOpen, FileText, MessageSquare, GraduationCap } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Interface cho một hoạt động gần đây
interface RecentActivity {
  id: string;
  type: 'user_registration' | 'course_completion' | 'question_added' | 'forum_post' | 'exam_submitted';
  title: string; // Tiêu đề hoạt động
  description: string; // Mô tả chi tiết
  timestamp: string; // Thời gian thực hiện
  icon: React.ReactNode; // Icon tương ứng với loại hoạt động
  iconBgColor: string; // Màu nền cho icon
  iconColor: string; // Màu icon
}

/**
 * Mock data cho các hoạt động gần đây
 * Sử dụng để hiển thị các hoạt động mới nhất trong hệ thống
 */
const mockRecentActivities: RecentActivity[] = [
  {
    id: 'activity-001',
    type: 'user_registration',
    title: 'Người dùng mới đăng ký',
    description: 'Nguyễn Văn An đã tạo tài khoản mới',
    timestamp: '2 phút trước',
    icon: <Users className="h-5 w-5" />,
    iconBgColor: 'bg-accent/20',
    iconColor: 'text-accent-foreground'
  },
  {
    id: 'activity-002',
    type: 'course_completion',
    title: 'Hoàn thành khóa học',
    description: 'Trần Thị Bình đã hoàn thành "Toán học lớp 12"',
    timestamp: '5 phút trước',
    icon: <GraduationCap className="h-5 w-5" />,
    iconBgColor: 'bg-badge-success/20',
    iconColor: 'text-badge-success-foreground'
  },
  {
    id: 'activity-003',
    type: 'question_added',
    title: 'Câu hỏi mới được thêm',
    description: 'GV. Lê Văn Cường đã thêm 5 câu hỏi Vật lý',
    timestamp: '10 phút trước',
    icon: <FileText className="h-5 w-5" />,
    iconBgColor: 'bg-primary/20',
    iconColor: 'text-primary-foreground'
  },
  {
    id: 'activity-004',
    type: 'forum_post',
    title: 'Bài viết diễn đàn mới',
    description: 'Phạm Minh Đức đã đăng câu hỏi về Hóa học',
    timestamp: '15 phút trước',
    icon: <MessageSquare className="h-5 w-5" />,
    iconBgColor: 'bg-badge-warning/20',
    iconColor: 'text-badge-warning-foreground'
  },
  {
    id: 'activity-005',
    type: 'exam_submitted',
    title: 'Nộp bài kiểm tra',
    description: 'Võ Thị Lan đã nộp bài kiểm tra Tiếng Anh',
    timestamp: '20 phút trước',
    icon: <BookOpen className="h-5 w-5" />,
    iconBgColor: 'bg-secondary/20',
    iconColor: 'text-secondary-foreground'
  }
];

/**
 * Component RecentActivities - Hiển thị danh sách các hoạt động gần đây
 * Sử dụng trong dashboard admin để theo dõi hoạt động của hệ thống
 */
export function RecentActivities() {
  return (
    <Card className="p-6 theme-bg theme-border border">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg font-semibold text-foreground">
          Hoạt động gần đây
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-0 pb-0">
        <div className="space-y-4">
          {mockRecentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
            >
              {/* Icon container với màu nền động */}
              <div className={`h-10 w-10 rounded-full ${activity.iconBgColor} flex items-center justify-center`}>
                <span className={activity.iconColor}>
                  {activity.icon}
                </span>
              </div>
              
              {/* Nội dung hoạt động */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

