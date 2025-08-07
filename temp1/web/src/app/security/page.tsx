'use client';

import { 
  Shield, 
  Lock, 
  Monitor, 
  AlertTriangle,
  CheckCircle,
  Key
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import SessionManagement from '@/components/features/auth/session-management';
import TwoFactorSetup from '@/components/features/auth/two-factor-setup';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import { useAuth } from '@/contexts/auth-context';
import { SessionData } from '@/lib/types/course-progress';

/**
 * Security Settings Page
 * 
 * Trang này cung cấp:
 * - 2FA management
 * - Session management
 * - Security overview
 * - Device trust management
 */

interface SecurityOverview {
  twoFactorEnabled: boolean;
  activeSessions: number;
  trustedDevices: number;
  lastPasswordChange?: Date;
  accountAge: number; // days
  riskScore: number;
}

export default function SecurityPage(): JSX.Element {
  const { user } = useAuth();
  const [overview, setOverview] = useState<SecurityOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Enhanced null safety check with user ID validation
    if (user?.id) {
      loadSecurityOverview();
    }
  }, [user]);

  const loadSecurityOverview = async () => {
    // Additional null safety check at function start
    if (!user?.id) {
      setError('Không tìm thấy thông tin người dùng');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load security overview data
      const [statusResponse, sessionsResponse] = await Promise.all([
        fetch('/api/auth/2fa/status', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
          },
        }),
        fetch('/api/auth/sessions', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
          },
        }),
      ]);

      if (!statusResponse.ok || !sessionsResponse.ok) {
        throw new Error('Không thể tải thông tin bảo mật');
      }

      const [statusData, sessionsData] = await Promise.all([
        statusResponse.json(),
        sessionsResponse.json(),
      ]);

      // Calculate account age với enhanced null safety
      const accountCreatedTime = user?.createdAt ? new Date(user.createdAt) : new Date();
      // Kiểm tra validity của date
      const accountCreated = isNaN(accountCreatedTime.getTime()) ? new Date() : accountCreatedTime;
      const accountAge = Math.floor((Date.now() - accountCreated.getTime()) / (1000 * 60 * 60 * 24));

      // Calculate risk score
      let riskScore = 0;
      if (!statusData.enabled) riskScore += 40; // No 2FA
      if (sessionsData.sessions?.length > 5) riskScore += 20; // Too many sessions
      if (accountAge < 30) riskScore += 15; // New account
      
      const trustedDevices = sessionsData.sessions?.filter((s: { isTrusted: boolean }) => s.isTrusted)?.length || 0;
      if (trustedDevices === 0) riskScore += 25; // No trusted devices

      setOverview({
        twoFactorEnabled: statusData.enabled,
        activeSessions: sessionsData.sessions?.length || 0,
        trustedDevices,
        lastPasswordChange: user?.lastPasswordChange ? (() => {
          const date = new Date(user.lastPasswordChange);
          return isNaN(date.getTime()) ? undefined : date;
        })() : undefined,
        accountAge,
        riskScore: Math.min(riskScore, 100),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const getSecurityLevel = (riskScore: number) => {
    if (riskScore < 30) {
      return { level: 'Cao', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    } else if (riskScore < 60) {
      return { level: 'Trung bình', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    } else {
      return { level: 'Thấp', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt bảo mật</CardTitle>
            <CardDescription>Vui lòng đăng nhập để xem cài đặt bảo mật</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Cài đặt bảo mật</h1>
          <p className="text-muted-foreground">
            Quản lý và tăng cường bảo mật tài khoản của bạn
          </p>
        </div>
      </div>

      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Security Overview */}
      {overview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Tổng quan bảo mật
            </CardTitle>
            <CardDescription>
              Đánh giá tổng thể về mức độ bảo mật tài khoản
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Xác thực 2 yếu tố</span>
                </div>
                <Badge variant={overview.twoFactorEnabled ? 'default' : 'secondary'}>
                  {overview.twoFactorEnabled ? 'Đã bật' : 'Chưa bật'}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Phiên đăng nhập</span>
                </div>
                <p className="text-2xl font-bold">{overview.activeSessions}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Thiết bị tin cậy</span>
                </div>
                <p className="text-2xl font-bold">{overview.trustedDevices}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Mức độ bảo mật</span>
                </div>
                <Badge className={getSecurityLevel(overview.riskScore).color}>
                  {getSecurityLevel(overview.riskScore).level}
                </Badge>
              </div>
            </div>

            {overview.riskScore > 50 && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Tài khoản của bạn có mức độ bảo mật thấp. Hãy kích hoạt 2FA và quản lý phiên đăng nhập để tăng cường bảo mật.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security Settings Tabs */}
      <Tabs defaultValue="2fa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="2fa" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Xác thực 2 yếu tố
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Quản lý phiên
          </TabsTrigger>
        </TabsList>

        <TabsContent value="2fa">
          <TwoFactorSetup userId={user?.id || ''} />
        </TabsContent>

        <TabsContent value="sessions">
          <SessionManagement
            userId={user?.id || ''}
            currentSessionId={user?.currentSessionId || ''}
          />
        </TabsContent>
      </Tabs>

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Mẹo bảo mật</CardTitle>
          <CardDescription>
            Các khuyến nghị để tăng cường bảo mật tài khoản
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Kích hoạt xác thực 2 yếu tố</h4>
                <p className="text-sm text-muted-foreground">
                  Thêm lớp bảo mật bổ sung cho tài khoản của bạn
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Sử dụng mật khẩu mạnh</h4>
                <p className="text-sm text-muted-foreground">
                  Mật khẩu nên có ít nhất 8 ký tự với sự kết hợp của chữ, số và ký tự đặc biệt
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Kiểm tra phiên đăng nhập thường xuyên</h4>
                <p className="text-sm text-muted-foreground">
                  Thu hồi các phiên đăng nhập không cần thiết hoặc đáng ngờ
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Đánh dấu thiết bị tin cậy</h4>
                <p className="text-sm text-muted-foreground">
                  Đánh dấu các thiết bị thường xuyên sử dụng để giảm rủi ro bảo mật
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
