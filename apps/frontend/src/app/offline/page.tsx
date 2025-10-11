/**
 * Offline Page
 * Trang hiển thị khi người dùng offline
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  WifiOff, 
  RefreshCw, 
  Home, 
  BookOpen, 
  Users, 
  HelpCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Check online status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      setLastChecked(new Date());
    };

    updateOnlineStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Auto-redirect when back online
  useEffect(() => {
    if (isOnline) {
      const timer = setTimeout(() => {
        window.location.href = '/';
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    try {
      // Try to fetch a small resource to test connectivity
      const response = await fetch('/manifest.json', { 
        cache: 'no-cache',
        method: 'HEAD'
      });
      
      if (response.ok) {
        window.location.href = '/';
      }
    } catch (_error) {
      console.log('Still offline');
    } finally {
      setIsRetrying(false);
      setLastChecked(new Date());
    }
  };

  const offlineFeatures = [
    {
      icon: BookOpen,
      title: 'Nội dung đã tải',
      description: 'Xem các bài học và tài liệu đã tải trước đó'
    },
    {
      icon: Users,
      title: 'Tiến độ học tập',
      description: 'Theo dõi tiến độ học tập đã lưu trên thiết bị'
    },
    {
      icon: HelpCircle,
      title: 'Câu hỏi đã lưu',
      description: 'Ôn tập với các câu hỏi đã tải về máy'
    }
  ];

  if (isOnline) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-green-900 mb-2">
            Đã kết nối lại!
          </h1>
          <p className="text-green-700 mb-4">
            Đang chuyển hướng về trang chủ...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Đang tải...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <WifiOff className="h-10 w-10 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Bạn đang offline</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Không thể kết nối internet. Vui lòng kiểm tra kết nối và thử lại.
          </p>
          {lastChecked && (
            <p className="text-sm text-muted-foreground mt-2">
              Kiểm tra lần cuối: {lastChecked.toLocaleTimeString('vi-VN')}
            </p>
          )}
        </div>

        {/* Connection Status */}
        <div className="max-w-md mx-auto mb-8">
          <Alert variant="destructive">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              Không có kết nối internet. Một số tính năng có thể không khả dụng.
            </AlertDescription>
          </Alert>
        </div>

        {/* Retry Button */}
        <div className="text-center mb-8">
          <Button 
            onClick={handleRetry}
            disabled={isRetrying}
            size="lg"
            className="min-w-[200px]"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Đang kiểm tra...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Thử lại
              </>
            )}
          </Button>
        </div>

        {/* Offline Features */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-center mb-6">
            Tính năng khả dụng offline
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {offlineFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Điều hướng</CardTitle>
              <CardDescription className="text-center">
                Truy cập các trang đã tải trước đó
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/">
                  <Button variant="outline" className="w-full h-auto flex-col py-4">
                    <Home className="h-6 w-6 mb-2" />
                    <span>Trang chủ</span>
                  </Button>
                </Link>
                
                <Link href="/courses">
                  <Button variant="outline" className="w-full h-auto flex-col py-4">
                    <BookOpen className="h-6 w-6 mb-2" />
                    <span>Khóa học</span>
                  </Button>
                </Link>
                
                <Link href="/practice">
                  <Button variant="outline" className="w-full h-auto flex-col py-4">
                    <HelpCircle className="h-6 w-6 mb-2" />
                    <span>Luyện đề</span>
                  </Button>
                </Link>
                
                <Link href="/questions">
                  <Button variant="outline" className="w-full h-auto flex-col py-4">
                    <Users className="h-6 w-6 mb-2" />
                    <span>Câu hỏi</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Mẹo sử dụng offline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Tải trước nội dung khi có internet để sử dụng offline</li>
                <li>• Tiến độ học tập sẽ được đồng bộ khi kết nối lại</li>
                <li>• Một số tính năng tương tác cần kết nối internet</li>
                <li>• Ứng dụng sẽ tự động thử kết nối lại định kỳ</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
