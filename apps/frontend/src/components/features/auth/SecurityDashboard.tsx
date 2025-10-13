/**
 * Security Dashboard Component
 * Real-time security monitoring dashboard cho user authentication
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  Eye,
  EyeOff,
  LogOut,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context-grpc';
import { authToast, toastSuccess } from '@/components/ui/feedback/enhanced-toast';
import { formatDistanceToNow } from 'date-fns';
import { logger } from '@/lib/utils/logger';
import { vi } from 'date-fns/locale';

// ===== TYPES =====

export interface SecurityDashboardProps {
  className?: string;
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'suspicious_activity';
  timestamp: Date;
  location: string;
  ipAddress: string;
  userAgent: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  success: boolean;
  description: string;
}

interface ActiveSession {
  id: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  deviceName: string;
  location: string;
  ipAddress: string;
  lastActivity: Date;
  isCurrent: boolean;
  userAgent: string;
}

interface SecurityMetrics {
  totalLogins: number;
  failedAttempts: number;
  activeSessions: number;
  lastPasswordChange: Date | null;
  twoFactorEnabled: boolean;
  riskScore: number;
}

// ===== MOCK DATA =====

const generateMockSecurityEvents = (): SecurityEvent[] => [
  {
    id: '1',
    type: 'login',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    location: 'Hồ Chí Minh, Việt Nam',
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome 120.0.0.0',
    deviceType: 'desktop',
    success: true,
    description: 'Đăng nhập thành công từ Chrome trên Desktop'
  },
  {
    id: '2',
    type: 'failed_login',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    location: 'Hà Nội, Việt Nam',
    ipAddress: '192.168.1.50',
    userAgent: 'Safari 17.0',
    deviceType: 'mobile',
    success: false,
    description: 'Thử đăng nhập thất bại từ Safari trên iPhone'
  },
  {
    id: '3',
    type: 'login',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    location: 'Đà Nẵng, Việt Nam',
    ipAddress: '192.168.1.200',
    userAgent: 'Firefox 121.0',
    deviceType: 'tablet',
    success: true,
    description: 'Đăng nhập thành công từ Firefox trên Tablet'
  }
];

const generateMockActiveSessions = (): ActiveSession[] => [
  {
    id: 'session-1',
    deviceType: 'desktop',
    deviceName: 'Chrome trên Windows',
    location: 'Hồ Chí Minh, Việt Nam',
    ipAddress: '192.168.1.100',
    lastActivity: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    isCurrent: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: 'session-2',
    deviceType: 'mobile',
    deviceName: 'Safari trên iPhone',
    location: 'Hà Nội, Việt Nam',
    ipAddress: '192.168.1.50',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isCurrent: false,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
  }
];

const generateMockSecurityMetrics = (): SecurityMetrics => ({
  totalLogins: 45,
  failedAttempts: 3,
  activeSessions: 2,
  lastPasswordChange: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
  twoFactorEnabled: false,
  riskScore: 25 // Low risk
});

// ===== MAIN COMPONENT =====

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
  className
}) => {
  // ===== STATE =====

  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const { user } = useAuth();

  // ===== HANDLERS =====

  /**
   * Load security data from backend
   * Business Logic: Tải security events, active sessions, và security metrics
   * Security: Hiển thị lịch sử đăng nhập, thiết bị đang hoạt động, và mức độ rủi ro
   */
  const loadSecurityData = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real gRPC service calls
      // const [events, sessions, metrics] = await Promise.all([
      //   SecurityService.getSecurityEvents(),
      //   SecurityService.getActiveSessions(),
      //   SecurityService.getSecurityMetrics()
      // ]);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSecurityEvents(generateMockSecurityEvents());
      setActiveSessions(generateMockActiveSessions());
      setSecurityMetrics(generateMockSecurityMetrics());
    } catch (error) {
      logger.error('[SecurityDashboard] Failed to load security data', {
        operation: 'loadSecurityData',
        userId: user?.id,
        error: error instanceof Error ? error.message : String(error),
      });
      authToast.loginError('Không thể tải dữ liệu bảo mật');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // ===== EFFECTS =====

  useEffect(() => {
    if (user) {
      loadSecurityData();
    }
  }, [user, loadSecurityData]);

  /**
   * Terminate an active session
   * Business Logic: Kết thúc phiên đăng nhập trên thiết bị khác
   * Security: User có thể logout các thiết bị không nhận ra để bảo vệ tài khoản
   */
  const handleTerminateSession = useCallback(async (sessionId: string) => {
    try {
      // TODO: Replace with real gRPC service call
      // await SecurityService.terminateSession(sessionId);

      setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
      toastSuccess('Đã kết thúc phiên', 'Phiên đăng nhập đã được kết thúc');
    } catch (error) {
      logger.error('[SecurityDashboard] Failed to terminate session', {
        operation: 'terminateSession',
        userId: user?.id,
        sessionId,
        error: error instanceof Error ? error.message : String(error),
      });
      authToast.loginError('Không thể kết thúc phiên đăng nhập');
    }
  }, [user?.id]);

  // ===== RENDER FUNCTIONS =====

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default: return Monitor;
    }
  };

  const getEventIcon = (eventType: string, success: boolean) => {
    if (eventType === 'failed_login' || !success) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    if (eventType === 'suspicious_activity') {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getRiskScoreColor = (score: number) => {
    if (score < 30) return 'text-green-600 bg-green-100';
    if (score < 70) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskScoreLabel = (score: number) => {
    if (score < 30) return 'Thấp';
    if (score < 70) return 'Trung bình';
    return 'Cao';
  };

  const renderSecurityMetrics = () => {
    if (!securityMetrics) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng đăng nhập</p>
                <p className="text-2xl font-bold">{securityMetrics.totalLogins}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Thất bại</p>
                <p className="text-2xl font-bold text-red-600">{securityMetrics.failedAttempts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Phiên hoạt động</p>
                <p className="text-2xl font-bold text-green-600">{securityMetrics.activeSessions}</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mức độ rủi ro</p>
                <Badge className={cn('text-xs', getRiskScoreColor(securityMetrics.riskScore))}>
                  {getRiskScoreLabel(securityMetrics.riskScore)}
                </Badge>
              </div>
              <div className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center',
                getRiskScoreColor(securityMetrics.riskScore)
              )}>
                <span className="text-sm font-bold">{securityMetrics.riskScore}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderActiveSessions = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Phiên đăng nhập hoạt động
        </CardTitle>
        <CardDescription>
          Quản lý các thiết bị đang đăng nhập vào tài khoản
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeSessions.map((session) => {
            const DeviceIcon = getDeviceIcon(session.deviceType);
            return (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{session.deviceName}</span>
                      {session.isCurrent && (
                        <Badge variant="secondary" className="text-xs">
                          Hiện tại
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.location}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        Hoạt động {formatDistanceToNow(session.lastActivity, { 
                          addSuffix: true, 
                          locale: vi 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                {!session.isCurrent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTerminateSession(session.id)}
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Kết thúc
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const renderSecurityEvents = () => {
    const eventsToShow = showAllEvents ? securityEvents : securityEvents.slice(0, 5);

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Hoạt động bảo mật
              </CardTitle>
              <CardDescription>
                Lịch sử các hoạt động đăng nhập và bảo mật gần đây
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllEvents(!showAllEvents)}
            >
              {showAllEvents ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Ẩn bớt
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Xem tất cả
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {eventsToShow.map((event, index) => (
              <div key={event.id}>
                <div className="flex items-start gap-3">
                  {getEventIcon(event.type, event.success)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{event.description}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(event.timestamp, { 
                          addSuffix: true, 
                          locale: vi 
                        })}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                        <span>IP: {event.ipAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {index < eventsToShow.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // ===== MAIN RENDER =====

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Đang tải dữ liệu bảo mật...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Bảo mật</h2>
          <p className="text-muted-foreground">
            Theo dõi và quản lý bảo mật tài khoản của bạn
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadSecurityData}
          disabled={isLoading}
        >
          <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
          Làm mới
        </Button>
      </div>

      {securityMetrics && (
        <>
          {renderSecurityMetrics()}
          
          {securityMetrics.riskScore > 50 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Cảnh báo bảo mật:</strong> Tài khoản của bạn có mức độ rủi ro cao. 
                Hãy xem xét bật xác thực hai lớp và thay đổi mật khẩu.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {renderActiveSessions()}
      {renderSecurityEvents()}
    </div>
  );
};

export default SecurityDashboard;
