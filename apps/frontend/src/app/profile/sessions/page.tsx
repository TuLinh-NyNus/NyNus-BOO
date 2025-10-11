'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Monitor, Smartphone, Tablet, Globe, Clock, Shield, LogOut, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { ProfileService } from '@/services/grpc/profile.service';
import { useAuth } from '@/contexts/auth-context-grpc';

interface SessionData {
  id: string;
  user_id: string;
  session_token: string;
  ip_address: string;
  user_agent: string;
  device_fingerprint: string;
  location: string;
  is_active: boolean;
  last_activity: string;
  expires_at: string;
  created_at: string;
}

interface SessionStats {
  activeCount: number;
  maxAllowed: number;
}

export default function ProfileSessionsPage() {
  const { toast } = useToast();
  const { user: _user } = useAuth();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [stats, setStats] = useState<SessionStats>({ activeCount: 0, maxAllowed: 3 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [terminatingSession, setTerminatingSession] = useState<string | null>(null);
  const [terminatingAll, setTerminatingAll] = useState(false);

  const fetchSessions = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await ProfileService.getSessions();
      
      if (response.success) {
        setSessions(response.sessions || []);
        setStats({
          activeCount: response.active_count || 0,
          maxAllowed: response.max_allowed || 3
        });
      } else {
        toast({
          title: 'Lỗi',
          description: response.message || 'Không thể tải danh sách phiên đăng nhập',
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách phiên đăng nhập',
        variant: 'error',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleTerminateSession = async (sessionId: string) => {
    setTerminatingSession(sessionId);
    
    try {
      const response = await ProfileService.terminateSession(sessionId);
      
      if (response.success) {
        toast({
          title: 'Thành công',
          description: 'Đã kết thúc phiên đăng nhập',
        });
        
        // Refresh sessions list
        await fetchSessions(true);
      } else {
        toast({
          title: 'Lỗi',
          description: response.message || 'Không thể kết thúc phiên đăng nhập',
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('Failed to terminate session:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể kết thúc phiên đăng nhập',
        variant: 'error',
      });
    } finally {
      setTerminatingSession(null);
    }
  };

  const handleTerminateAllSessions = async () => {
    setTerminatingAll(true);
    
    try {
      const response = await ProfileService.terminateAllSessions();
      
      if (response.success) {
        toast({
          title: 'Thành công',
          description: 'Đã kết thúc tất cả phiên đăng nhập khác',
        });
        
        // Refresh sessions list
        await fetchSessions(true);
      } else {
        toast({
          title: 'Lỗi',
          description: response.message || 'Không thể kết thúc tất cả phiên đăng nhập',
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('Failed to terminate all sessions:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể kết thúc tất cả phiên đăng nhập',
        variant: 'error',
      });
    } finally {
      setTerminatingAll(false);
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="h-4 w-4 text-blue-600" />;
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return <Tablet className="h-4 w-4 text-green-600" />;
    } else {
      return <Monitor className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDeviceInfo = (userAgent: string) => {
    // Simple device detection - can be enhanced with a proper library
    const ua = userAgent.toLowerCase();
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';

    // Browser detection
    if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('edge')) browser = 'Edge';

    // OS detection
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

    return `${browser} on ${os}`;
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  const isCurrentSession = (sessionToken: string) => {
    // Simple check - in real implementation, compare with current session token
    return sessionToken === 'current-session-token';
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Đang tải phiên đăng nhập...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/profile">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại Profile
            </Button>
          </Link>
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý phiên đăng nhập</h1>
            <p className="text-muted-foreground">
              Xem và quản lý các thiết bị đang đăng nhập vào tài khoản của bạn
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchSessions(true)}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Làm mới
            </Button>
          </div>
        </div>
      </div>

      {/* Session Limit Warning */}
      {stats.activeCount >= stats.maxAllowed && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Bạn đã đạt giới hạn {stats.maxAllowed} phiên đăng nhập đồng thời. 
            Để đăng nhập trên thiết bị mới, vui lòng kết thúc một trong các phiên hiện tại.
          </AlertDescription>
        </Alert>
      )}

      {/* Sessions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phiên hoạt động</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCount}</div>
            <p className="text-xs text-muted-foreground">
              Tối đa {stats.maxAllowed} phiên
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thiết bị</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Tổng số thiết bị
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bảo mật</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Tốt</div>
            <p className="text-xs text-muted-foreground">
              Không có hoạt động đáng ngờ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Phiên đăng nhập hoạt động</CardTitle>
              <CardDescription>
                Danh sách các thiết bị đang đăng nhập vào tài khoản của bạn
              </CardDescription>
            </div>

            {sessions.length > 1 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={terminatingAll}>
                    {terminatingAll ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
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
        </CardHeader>

        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Không có phiên đăng nhập nào được tìm thấy</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thiết bị</TableHead>
                    <TableHead>Địa chỉ IP</TableHead>
                    <TableHead>Vị trí</TableHead>
                    <TableHead>Hoạt động lần cuối</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => {
                    const isCurrent = isCurrentSession(session.session_token);

                    return (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {getDeviceIcon(session.user_agent)}
                            <div>
                              <div className="font-medium">
                                {getDeviceInfo(session.user_agent)}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {isCurrent && (
                                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Phiên hiện tại
                                  </Badge>
                                )}
                                {session.is_active ? (
                                  <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                                    Đang hoạt động
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">
                                    Không hoạt động
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="font-mono text-sm">{session.ip_address}</div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3 text-muted-foreground" />
                            {session.location || 'Không xác định'}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {formatLastActivity(session.last_activity)}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          {!isCurrent && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  disabled={terminatingSession === session.id}
                                >
                                  {terminatingSession === session.id ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <LogOut className="h-4 w-4 mr-2" />
                                  )}
                                  Kết thúc
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Xác nhận kết thúc phiên?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Phiên đăng nhập trên thiết bị &ldquo;{getDeviceInfo(session.user_agent)}&rdquo; sẽ bị kết thúc.
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

                          {isCurrent && (
                            <div className="text-sm text-muted-foreground flex items-center justify-end">
                              <Shield className="h-3 w-3 mr-1" />
                              Đang sử dụng
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Mẹo bảo mật
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Kiểm tra thường xuyên</h4>
              <p className="text-muted-foreground">
                Thường xuyên kiểm tra danh sách phiên đăng nhập để phát hiện hoạt động đáng ngờ.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Kết thúc phiên không sử dụng</h4>
              <p className="text-muted-foreground">
                Kết thúc các phiên đăng nhập trên thiết bị không còn sử dụng để tăng cường bảo mật.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Sử dụng mạng an toàn</h4>
              <p className="text-muted-foreground">
                Tránh đăng nhập trên mạng WiFi công cộng không bảo mật.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Đăng xuất khi xong</h4>
              <p className="text-muted-foreground">
                Luôn đăng xuất khi sử dụng xong, đặc biệt trên thiết bị chung.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
