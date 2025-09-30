/**
 * Notification Center Component
 * Component chính để hiển thị và quản lý notifications
 */

'use client';

import React, { useState } from 'react';
import { useBackendNotifications } from '@/hooks';
import { BackendNotification } from '@/services/grpc/notification.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  BellRing, 
  Check, 
  CheckCheck, 
  Trash2, 
  Settings, 
  Shield, 
  AlertTriangle,
  Info,
  BookOpen,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Notification Type Icon Component
 */
function NotificationTypeIcon({ type }: { type: string }) {
  const iconProps = { className: "h-4 w-4" };
  
  switch (type) {
    case 'SECURITY_ALERT':
      return <Shield {...iconProps} className="h-4 w-4 text-red-500" />;
    case 'SYSTEM_MESSAGE':
      return <AlertTriangle {...iconProps} className="h-4 w-4 text-yellow-500" />;
    case 'COURSE_UPDATE':
      return <BookOpen {...iconProps} className="h-4 w-4 text-blue-500" />;
    default:
      return <Info {...iconProps} className="h-4 w-4 text-gray-500" />;
  }
}

/**
 * Notification Type Badge Component
 */
function NotificationTypeBadge({ type }: { type: string }) {
  const typeConfig = {
    'SECURITY_ALERT': { label: 'Bảo mật', variant: 'destructive' as const },
    'SYSTEM_MESSAGE': { label: 'Hệ thống', variant: 'secondary' as const },
    'COURSE_UPDATE': { label: 'Khóa học', variant: 'default' as const },
  };

  const config = typeConfig[type as keyof typeof typeConfig] || { label: 'Khác', variant: 'outline' as const };
  return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
}

/**
 * Single Notification Item Component
 */
interface NotificationItemProps {
  notification: BackendNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAsRead = async () => {
    if (notification.isRead) return;
    
    setIsLoading(true);
    await onMarkAsRead(notification.id);
    setIsLoading(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    await onDelete(notification.id);
    setIsLoading(false);
  };

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: vi
  });

  return (
    <div className={`p-4 border-l-4 ${notification.isRead ? 'border-l-gray-200 bg-gray-50' : 'border-l-blue-500 bg-blue-50'} hover:bg-gray-100 transition-colors`}>
      <div className="flex items-start justify-between space-x-3">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0 mt-1">
            <NotificationTypeIcon type={notification.type} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className={`text-sm font-medium ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                {notification.title}
              </h4>
              <NotificationTypeBadge type={notification.type} />
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
              )}
            </div>
            
            <p className={`text-sm ${notification.isRead ? 'text-gray-500' : 'text-gray-700'} mb-2`}>
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{timeAgo}</span>
              
              {/* Additional data display */}
              {notification.data && Object.keys(notification.data).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {Object.entries(notification.data).slice(0, 2).map(([key, value]) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key}: {value}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 flex-shrink-0">
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAsRead}
              disabled={isLoading}
              title="Đánh dấu đã đọc"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isLoading}
            title="Xóa thông báo"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Notification Center Component
 */
export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshUnreadCount,
    isConnected
  } = useBackendNotifications();

  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const handleRefresh = () => {
    loadNotifications();
    refreshUnreadCount();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  const filteredNotifications = showUnreadOnly 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BellRing className="h-5 w-5" />
            <CardTitle>Thông báo</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Connection status */}
            <div className="flex items-center space-x-1">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-gray-400" />
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
            
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <CardDescription>
          Quản lý thông báo và cảnh báo bảo mật
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Action buttons */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={showUnreadOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            >
              <Bell className="h-4 w-4 mr-1" />
              {showUnreadOnly ? 'Tất cả' : 'Chưa đọc'}
            </Button>
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Notifications list */}
        <ScrollArea className="h-[500px]">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Đang tải thông báo...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mb-2 text-gray-300" />
              <p className="text-sm">
                {showUnreadOnly ? 'Không có thông báo chưa đọc' : 'Không có thông báo nào'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotifications.map((notification, index) => (
                <div key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                  />
                  {index < filteredNotifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Load more button */}
        {!showUnreadOnly && notifications.length > 0 && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => loadNotifications({ page: Math.floor(notifications.length / 20) + 1 })}
              disabled={loading}
            >
              Tải thêm
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Notification Bell Component
 * Component bell icon với unread count cho header
 */
interface NotificationBellProps {
  onClick?: () => void;
  className?: string;
}

export function NotificationBell({ onClick, className = "" }: NotificationBellProps) {
  const { unreadCount, isConnected } = useBackendNotifications();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`relative ${className}`}
      title={`Thông báo ${unreadCount > 0 ? `(${unreadCount} chưa đọc)` : ''}`}
    >
      <Bell className="h-5 w-5" />

      {/* Unread count badge */}
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}

      {/* Connection indicator */}
      {isConnected && (
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
      )}
    </Button>
  );
}
