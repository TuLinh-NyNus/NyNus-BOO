'use client';

import React from 'react';

import {
  Info,
  Settings,
  Shield,
  Database,
  Server,
  Bell
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Interface cho một thông báo hệ thống
interface SystemNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system' | 'security';
  title: string; // Tiêu đề thông báo
  message: string; // Nội dung thông báo
  timestamp: string; // Thời gian thông báo
  priority: 'low' | 'medium' | 'high' | 'critical'; // Mức độ ưu tiên
  isRead: boolean; // Trạng thái đã đọc
  icon: React.ReactNode; // Icon tương ứng với loại thông báo
  iconBgColor: string; // Màu nền cho icon
  iconColor: string; // Màu icon
}

/**
 * Mock data cho các thông báo hệ thống
 * Bao gồm các loại thông báo khác nhau với mức độ ưu tiên khác nhau
 */
const mockSystemNotifications: SystemNotification[] = [
  {
    id: 'notification-001',
    type: 'system',
    title: 'Cập nhật hệ thống mới',
    message: 'Phiên bản 2.1.0 đã được triển khai thành công',
    timestamp: '1 giờ trước',
    priority: 'medium',
    isRead: false,
    icon: <Settings className="h-5 w-5" />,
    iconBgColor: 'bg-blue-100/80 dark:bg-blue-500/20',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'notification-002',
    type: 'security',
    title: 'Cảnh báo bảo mật',
    message: 'Phát hiện 3 lần đăng nhập thất bại từ IP lạ',
    timestamp: '2 giờ trước',
    priority: 'high',
    isRead: false,
    icon: <Shield className="h-5 w-5" />,
    iconBgColor: 'bg-red-100/80 dark:bg-red-500/20',
    iconColor: 'text-red-600 dark:text-red-400'
  },
  {
    id: 'notification-003',
    type: 'success',
    title: 'Sao lưu dữ liệu thành công',
    message: 'Backup tự động đã hoàn thành lúc 02:00 AM',
    timestamp: '3 giờ trước',
    priority: 'low',
    isRead: true,
    icon: <Database className="h-5 w-5" />,
    iconBgColor: 'bg-green-100/80 dark:bg-green-500/20',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  {
    id: 'notification-004',
    type: 'warning',
    title: 'Dung lượng server cao',
    message: 'Disk usage đạt 85%, cần kiểm tra và dọn dẹp',
    timestamp: '4 giờ trước',
    priority: 'medium',
    isRead: false,
    icon: <Server className="h-5 w-5" />,
    iconBgColor: 'bg-yellow-100/80 dark:bg-yellow-500/20',
    iconColor: 'text-yellow-600 dark:text-yellow-400'
  },
  {
    id: 'notification-005',
    type: 'info',
    title: 'Bảo trì định kỳ',
    message: 'Hệ thống sẽ bảo trì vào 2:00 AM ngày mai',
    timestamp: '6 giờ trước',
    priority: 'medium',
    isRead: true,
    icon: <Info className="h-5 w-5" />,
    iconBgColor: 'bg-indigo-100/80 dark:bg-indigo-500/20',
    iconColor: 'text-indigo-600 dark:text-indigo-400'
  }
];

/**
 * Hàm helper để lấy màu badge theo mức độ ưu tiên
 */
function getPriorityBadgeVariant(priority: SystemNotification['priority']) {
  switch (priority) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'destructive';
    case 'medium':
      return 'default';
    case 'low':
      return 'secondary';
    default:
      return 'secondary';
  }
}

/**
 * Hàm helper để lấy text hiển thị cho mức độ ưu tiên
 */
function getPriorityText(priority: SystemNotification['priority']) {
  switch (priority) {
    case 'critical':
      return 'Khẩn cấp';
    case 'high':
      return 'Cao';
    case 'medium':
      return 'Trung bình';
    case 'low':
      return 'Thấp';
    default:
      return 'Thấp';
  }
}

/**
 * Component SystemNotifications - Hiển thị danh sách thông báo hệ thống
 * Sử dụng trong dashboard admin để theo dõi trạng thái và sự kiện hệ thống
 */
export function SystemNotifications() {
  // Đếm số thông báo chưa đọc
  const unreadCount = mockSystemNotifications.filter(notification => !notification.isRead).length;

  return (
    <Card className="p-6 theme-bg theme-border border">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-white">
            Thông báo hệ thống
          </CardTitle>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount} mới
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="px-0 pb-0">
        <div className="space-y-4">
          {mockSystemNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`flex items-start gap-4 p-3 rounded-lg ${
                notification.isRead
                  ? 'bg-slate-100/50 dark:bg-slate-700/20'
                  : 'bg-slate-100/80 dark:bg-slate-700/30 border-l-4 border-blue-500'
              }`}
            >
              {/* Icon container với màu nền động */}
              <div className={`h-10 w-10 rounded-full ${notification.iconBgColor} flex items-center justify-center flex-shrink-0`}>
                <span className={notification.iconColor}>
                  {notification.icon}
                </span>
              </div>
              
              {/* Nội dung thông báo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className={`text-sm font-medium ${
                    notification.isRead
                      ? 'text-slate-600 dark:text-slate-400'
                      : 'text-slate-800 dark:text-white'
                  }`}>
                    {notification.title}
                  </p>
                  <Badge 
                    variant={getPriorityBadgeVariant(notification.priority)}
                    className="text-xs flex-shrink-0"
                  >
                    {getPriorityText(notification.priority)}
                  </Badge>
                </div>
                
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                  {notification.message}
                </p>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    {notification.timestamp}
                  </p>
                  {!notification.isRead && (
                    <div className="flex items-center gap-1">
                      <Bell className="h-3 w-3 text-blue-500" />
                      <span className="text-xs text-blue-500">Chưa đọc</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

