'use client';

import { useState, useEffect, useCallback } from 'react';
import { Monitor, Smartphone, Tablet, Globe, MapPin, Clock, Shield, Trash2, LogOut, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ProfileService } from '@/services/grpc/profile.service';

interface Session {
  id: string;
  sessionToken: string;
  ipAddress: string;
  userAgent: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser: string;
  os: string;
  location: string;
  isActive: boolean;
  isCurrent: boolean;
  lastActivity: string;
  createdAt: string;
  expiresAt: string;
}

// Helper functions to parse user agent
const detectDeviceType = (userAgent: string): 'desktop' | 'mobile' | 'tablet' | 'unknown' => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile')) return 'mobile';
  if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet';
  return 'desktop';
};

const extractBrowser = (userAgent: string): string => {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
};

const extractOS = (userAgent: string): string => {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
};

export default function SessionsPage() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [terminatingSession, setTerminatingSession] = useState<string | null>(null);

  // Fetch sessions from backend - Real data from ProfileService.getSessions()
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ProfileService.getSessions();

      if (response.success && response.sessions) {
        // Map gRPC sessions to Session interface
        const mappedSessions: Session[] = response.sessions.map((s: Record<string, unknown>) => ({
          id: String(s.id || ''),
          sessionToken: String(s.session_token || ''),
          ipAddress: String(s.ip_address || ''),
          userAgent: String(s.user_agent || ''),
          deviceType: detectDeviceType(String(s.user_agent || '')),
          browser: extractBrowser(String(s.user_agent || '')),
          os: extractOS(String(s.user_agent || '')),
          location: String(s.location || 'Không xác định'),
          isActive: Boolean(s.is_active),
          isCurrent: Boolean(s.is_current),
          lastActivity: String(s.last_activity || ''),
          createdAt: String(s.created_at || ''),
          expiresAt: String(s.expires_at || ''),
        }));

        setSessions(mappedSessions);
      } else {
        throw new Error(response.message || 'Failed to fetch sessions');
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách phiên đăng nhập',
        variant: 'error' as const,
      });
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleTerminateSession = async (sessionId: string) => {
    setTerminatingSession(sessionId);
    try {
      // Call ProfileService.terminateSession() - Real backend data
      const response = await ProfileService.terminateSession(sessionId);

      if (response.success) {
        toast({
          title: 'Thành công',
          description: 'Đã kết thúc phiên đăng nhập',
        });

        // Refresh sessions list
        await fetchSessions();
      } else {
        throw new Error(response.message || 'Failed to terminate session');
      }
    } catch (error) {
      console.error('Failed to terminate session:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể kết thúc phiên đăng nhập',
        variant: 'error' as const,
      });
    } finally {
      setTerminatingSession(null);
    }
  };

  const handleTerminateAllSessions = async () => {
    setLoading(true);
    try {
      // Call ProfileService.terminateAllSessions() - Real backend data
      const response = await ProfileService.terminateAllSessions(true); // Keep current session

      if (response.success) {
        toast({
          title: 'Thành công',
          description: `Đã kết thúc ${response.terminated_count || 0} phiên đăng nhập khác`,
        });

        // Refresh sessions list
        await fetchSessions();
      } else {
        throw new Error(response.message || 'Failed to terminate all sessions');
      }
    } catch (error) {
      console.error('Failed to terminate all sessions:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể kết thúc các phiên đăng nhập',
        variant: 'error' as const,
      });
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Tablet className="h-5 w-5" />;
      case 'desktop':
        return <Monitor className="h-5 w-5" />;
      default:
        return <Globe className="h-5 w-5" />;
    }
  };

  const activeSessions = sessions.filter(s => s.isActive);
  const inactiveSessions = sessions.filter(s => !s.isActive);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quản lý phiên đăng nhập</h1>
        <p className="text-muted-foreground">
          Xem và quản lý các thiết bị đang đăng nhập vào tài khoản của bạn
        </p>
      </div>

      {/* Session Limit Warning */}
      {activeSessions.length >= 3 && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Bạn đã đạt giới hạn 3 phiên đăng nhập đồng thời. Để đăng nhập trên thiết bị mới, vui lòng kết thúc một trong các phiên hiện tại.
          </AlertDescription>
        </Alert>
      )}

      {/* Active Sessions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Phiên đang hoạt động ({activeSessions.length}/3)
          </h2>
          {activeSessions.length > 1 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  Kết thúc tất cả phiên khác
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận kết thúc tất cả phiên?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tất cả các phiên đăng nhập khác (trừ phiên hiện tại) sẽ bị kết thúc. 
                    Bạn sẽ cần đăng nhập lại trên các thiết bị đó.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={handleTerminateAllSessions}>
                    Kết thúc tất cả
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeSessions.map((session) => (
            <Card key={session.id} className={session.isCurrent ? 'border-primary' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getDeviceIcon(session.deviceType)}
                    <div>
                      <CardTitle className="text-base">{session.browser}</CardTitle>
                      <CardDescription className="text-xs">{session.os}</CardDescription>
                    </div>
                  </div>
                  {session.isCurrent && (
                    <Badge variant="default" className="text-xs">
                      Phiên hiện tại
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-2 pb-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-3 w-3" />
                  {session.location}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Globe className="mr-2 h-3 w-3" />
                  {session.ipAddress}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-3 w-3" />
                  Hoạt động{' '}
                  {formatDistanceToNow(new Date(session.lastActivity), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </div>
              </CardContent>

              <Separator />

              <CardFooter className="pt-3">
                {!session.isCurrent && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={terminatingSession === session.id}
                      >
                        {terminatingSession === session.id ? (
                          <span className="flex items-center">
                            <span className="animate-spin h-3 w-3 mr-2 border-2 border-red-600 border-t-transparent rounded-full" />
                            Đang kết thúc...
                          </span>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-3 w-3" />
                            Kết thúc phiên
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận kết thúc phiên?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Phiên đăng nhập trên thiết bị {session.browser} sẽ bị kết thúc.
                          Bạn sẽ cần đăng nhập lại trên thiết bị đó.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleTerminateSession(session.id)}>
                          Kết thúc
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                {session.isCurrent && (
                  <div className="w-full text-center text-sm text-muted-foreground">
                    <Shield className="inline-block mr-1 h-3 w-3" />
                    Đang sử dụng
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Inactive Sessions */}
      {inactiveSessions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Phiên đã kết thúc</h2>
          <div className="space-y-2">
            {inactiveSessions.map((session) => (
              <Card key={session.id} className="bg-gray-50">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-gray-400">
                      {getDeviceIcon(session.deviceType)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {session.browser} - {session.os}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.location} • Kết thúc{' '}
                        {formatDistanceToNow(new Date(session.lastActivity), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Đã kết thúc
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Security Tips */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center text-blue-900">
            <Shield className="mr-2 h-5 w-5" />
            Mẹo bảo mật
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Kiểm tra thường xuyên các phiên đăng nhập để phát hiện hoạt động bất thường</li>
            <li>• Kết thúc ngay các phiên mà bạn không nhận ra</li>
            <li>• Sử dụng xác thực 2 yếu tố để tăng cường bảo mật</li>
            <li>• Không chia sẻ tài khoản với người khác</li>
            <li>• Đăng xuất khi sử dụng thiết bị công cộng</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}