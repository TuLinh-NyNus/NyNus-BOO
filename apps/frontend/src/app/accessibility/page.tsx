/**
 * Accessibility Settings Page
 * Trang cài đặt accessibility cho NyNus system
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AccessibilityEnhancer } from '@/components/features/accessibility/AccessibilityEnhancer';
import { UserInterfacePerformanceOptimizer } from '@/components/features/performance/UserInterfacePerformanceOptimizer';
import { Eye, Zap, Settings, Info } from 'lucide-react';

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Accessibility Settings</h1>
              <p className="text-muted-foreground mt-2">
                Tùy chỉnh trải nghiệm NyNus cho nhu cầu accessibility của bạn
              </p>
            </div>
            <Badge variant="secondary" className="text-sm">
              <Settings className="h-4 w-4 mr-1" />
              Cài đặt nâng cao
            </Badge>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Về Accessibility trong NyNus
            </CardTitle>
            <CardDescription>
              NyNus cam kết tạo ra trải nghiệm học tập inclusive cho tất cả người dùng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">🎯 Mục tiêu</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Hỗ trợ người khiếm thị và khiếm thính</li>
                  <li>• Tối ưu cho người có khó khăn vận động</li>
                  <li>• Hỗ trợ người có khó khăn nhận thức</li>
                  <li>• Tuân thủ WCAG 2.1 AA standards</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">🛠️ Tính năng</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Screen reader optimization</li>
                  <li>• Keyboard navigation support</li>
                  <li>• High contrast mode</li>
                  <li>• Reduced motion options</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Accessibility Settings - Takes 2 columns */}
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Accessibility Controls
                </CardTitle>
                <CardDescription>
                  Điều chỉnh các tùy chọn accessibility theo nhu cầu của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AccessibilityEnhancer 
                  showControls={true}
                  autoDetect={true}
                  className="w-full"
                />
              </CardContent>
            </Card>
          </div>

          {/* Performance Monitoring - Takes 1 column */}
          <div className="xl:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance Impact
                </CardTitle>
                <CardDescription>
                  Monitor performance impact của accessibility features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserInterfacePerformanceOptimizer 
                  componentName="AccessibilitySettings"
                  enableAutoOptimization={true}
                  showDetailedMetrics={false}
                  className="w-full"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📚 Hướng dẫn sử dụng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm">Screen Reader</h4>
                  <p className="text-xs text-muted-foreground">
                    Sử dụng NVDA, JAWS, hoặc VoiceOver để điều hướng trang
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Keyboard Navigation</h4>
                  <p className="text-xs text-muted-foreground">
                    Tab để di chuyển, Enter để chọn, Escape để đóng
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">High Contrast</h4>
                  <p className="text-xs text-muted-foreground">
                    Tăng độ tương phản cho người khiếm thị
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🔧 Keyboard Shortcuts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Toggle Accessibility</span>
                  <Badge variant="outline" className="text-xs">Alt + A</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Search</span>
                  <Badge variant="outline" className="text-xs">Ctrl + K</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Skip to Content</span>
                  <Badge variant="outline" className="text-xs">Tab</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">High Contrast</span>
                  <Badge variant="outline" className="text-xs">Alt + H</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Cần hỗ trợ thêm? Liên hệ{' '}
            <a href="mailto:accessibility@nynus.edu.vn" className="text-primary hover:underline">
              accessibility@nynus.edu.vn
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
