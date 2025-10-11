/**
 * Security Enhancements Demo Page
 * Trang demo các tính năng bảo mật nâng cao
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  Eye,
  FileText,
  AlertTriangle,
  Activity,
  Database,
  Monitor,
  TrendingUp,
  CheckCircle,
  Info
} from 'lucide-react';

// Import security components
import RealTimeSecurityMonitor from '@/components/features/security/RealTimeSecurityMonitor';
import AdvancedAuditLogger from '@/components/features/security/AdvancedAuditLogger';
import SuspiciousActivityDetector from '@/components/features/security/SuspiciousActivityDetector';

// ===== TYPES =====

interface SecurityFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'ACTIVE' | 'INACTIVE' | 'TESTING';
  metrics: {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
  }[];
}

// ===== CONSTANTS =====

const SECURITY_FEATURES: SecurityFeature[] = [
  {
    id: 'real-time-monitoring',
    title: 'Giám sát bảo mật real-time',
    description: 'Theo dõi các sự kiện bảo mật và mối đe dọa trong thời gian thực',
    icon: Monitor,
    status: 'ACTIVE',
    metrics: [
      { label: 'Sự kiện/giờ', value: 1247, trend: 'up' },
      { label: 'Mối đe dọa phát hiện', value: 3, trend: 'stable' },
      { label: 'Tỷ lệ chặn', value: '94.2%', trend: 'up' }
    ]
  },
  {
    id: 'audit-logging',
    title: 'Audit Logs nâng cao',
    description: 'Ghi lại và phân tích chi tiết mọi hoạt động trong hệ thống',
    icon: FileText,
    status: 'ACTIVE',
    metrics: [
      { label: 'Logs/ngày', value: '45.2K', trend: 'up' },
      { label: 'Compliance score', value: '98.7%', trend: 'stable' },
      { label: 'Retention', value: '90 ngày', trend: 'stable' }
    ]
  },
  {
    id: 'suspicious-detection',
    title: 'Phát hiện hoạt động đáng nghi',
    description: 'AI phát hiện và phân tích các hành vi bất thường của người dùng',
    icon: AlertTriangle,
    status: 'ACTIVE',
    metrics: [
      { label: 'Độ chính xác', value: '96.8%', trend: 'up' },
      { label: 'False positive', value: '2.1%', trend: 'down' },
      { label: 'Thời gian phát hiện', value: '< 30s', trend: 'stable' }
    ]
  }
];

// ===== MAIN COMPONENT =====

export default function SecurityEnhancementsPage() {
  // ===== STATE =====

  const [activeTab, setActiveTab] = useState('overview');

  // ===== RENDER FUNCTIONS =====

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SECURITY_FEATURES.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <Card key={feature.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <IconComponent className="h-8 w-8 text-blue-600" />
                  <Badge variant={feature.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {feature.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {feature.metrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{metric.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{metric.value}</span>
                        {metric.trend && (
                          <TrendingUp 
                            className={`h-3 w-3 ${
                              metric.trend === 'up' ? 'text-green-500' :
                              metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Cảnh báo bảo mật
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Hệ thống bảo mật hoạt động bình thường</strong>
                <br />
                Tất cả các thành phần bảo mật đang hoạt động ổn định. Không có mối đe dọa nghiêm trọng nào được phát hiện trong 24 giờ qua.
              </AlertDescription>
            </Alert>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Cập nhật quy tắc bảo mật</strong>
                <br />
                3 quy tắc phát hiện mới đã được thêm vào hệ thống để tăng cường khả năng phát hiện các mối đe dọa mới.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hành động nhanh</CardTitle>
          <CardDescription>
            Các thao tác thường dùng để quản lý bảo mật hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto flex-col py-4"
              onClick={() => setActiveTab('monitoring')}
            >
              <Monitor className="h-6 w-6 mb-2" />
              <span className="text-sm">Giám sát real-time</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto flex-col py-4"
              onClick={() => setActiveTab('audit')}
            >
              <FileText className="h-6 w-6 mb-2" />
              <span className="text-sm">Xem audit logs</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto flex-col py-4"
              onClick={() => setActiveTab('detection')}
            >
              <AlertTriangle className="h-6 w-6 mb-2" />
              <span className="text-sm">Phát hiện đáng nghi</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto flex-col py-4"
            >
              <Database className="h-6 w-6 mb-2" />
              <span className="text-sm">Báo cáo tuân thủ</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Technical Implementation Details */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết kỹ thuật</CardTitle>
          <CardDescription>
            Thông tin về việc triển khai các tính năng bảo mật
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Backend Integration</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• gRPC services cho real-time monitoring</li>
                <li>• PostgreSQL audit logging với retention policies</li>
                <li>• Redis caching cho performance optimization</li>
                <li>• Background jobs cho threat analysis</li>
                <li>• Rate limiting và IP blocking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Frontend Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Real-time updates với WebSocket/SSE</li>
                <li>• Interactive dashboards với charts</li>
                <li>• Advanced filtering và search</li>
                <li>• Export functionality (CSV, PDF)</li>
                <li>• Mobile-responsive design</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ===== MAIN RENDER =====

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Security Enhancements</h1>
            <p className="text-muted-foreground">
              Hệ thống bảo mật nâng cao với giám sát real-time và phát hiện mối đe dọa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="default" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Phase 3 - Security Enhancements
          </Badge>
          <Badge variant="outline">
            Real-time Monitoring
          </Badge>
          <Badge variant="outline">
            AI-powered Detection
          </Badge>
          <Badge variant="outline">
            Compliance Ready
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Giám sát
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="detection" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Phát hiện
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="monitoring" className="mt-6">
          <RealTimeSecurityMonitor />
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <AdvancedAuditLogger />
        </TabsContent>

        <TabsContent value="detection" className="mt-6">
          <SuspiciousActivityDetector />
        </TabsContent>
      </Tabs>
    </div>
  );
}
