/**
 * Notifications Page
 * Trang chính để quản lý notifications
 */

'use client';

import React, { useState } from 'react';
import { NotificationCenter } from '@/components/features/notifications/notification-center';
import { NotificationPreferences } from '@/components/features/notifications/notification-preferences';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Settings, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('notifications');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Trung tâm thông báo
            </h1>
            <p className="text-gray-600">
              Quản lý thông báo và cài đặt preferences
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Thông báo</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Cài đặt</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="notifications" className="mt-0">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="preferences" className="mt-0">
            <NotificationPreferences />
          </TabsContent>
        </Tabs>

        {/* Help section */}
        <div className="mt-12 max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-3">Hướng dẫn sử dụng</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <strong>Thông báo:</strong> Xem tất cả thông báo từ hệ thống, bao gồm cảnh báo bảo mật, 
                  cập nhật khóa học và thông báo hệ thống.
                </p>
                <p>
                  <strong>Cài đặt:</strong> Tùy chỉnh cách bạn nhận thông báo qua email, push notification 
                  hoặc SMS. Bạn có thể bật/tắt từng loại thông báo theo nhu cầu.
                </p>
                <p>
                  <strong>Real-time:</strong> Hệ thống sẽ tự động cập nhật thông báo mới khi có kết nối internet. 
                  Biểu tượng WiFi ở góc trên bên phải cho biết trạng thái kết nối.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
