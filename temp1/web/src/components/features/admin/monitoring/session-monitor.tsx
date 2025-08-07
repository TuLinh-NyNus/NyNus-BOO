'use client';

import { Monitor, Smartphone, Globe, Clock, MapPin, X, RefreshCw, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { useSessionWebSocket } from '@/hooks/use-session-websocket';
import { useToast } from '@/hooks/use-toast';
import { AdminUser } from '@/lib/api/admin-users.service';

interface SessionInfo {
  id: string;
  ipAddress: string;
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
    userAgent?: string;
  };
  userAgent?: string;
  isActive: boolean;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
}

interface SessionMonitorProps {
  user: AdminUser;
}

export function SessionMonitor({ user }: SessionMonitorProps) {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [terminateDialog, setTerminateDialog] = useState<{
    open: boolean;
    session?: SessionInfo;
    isAll?: boolean;
  }>({ open: false });
  const [terminating, setTerminating] = useState(false);
  const { toast } = useToast();

  // WebSocket connection for real-time updates
  const { isConnected, subscribeToUserSessions, unsubscribeFromUserSessions } = useSessionWebSocket({
    onSessionUpdate: (update) => {
      if (update.userId === user.id) {
        // Refresh sessions when there's an update for this user
        fetchSessions();
      }
    },
  });

  useEffect(() => {
    fetchSessions();

    // Subscribe to real-time updates for this user
    if (isConnected) {
      subscribeToUserSessions(user.id);
    }

    return () => {
      // Cleanup subscription
      if (isConnected) {
        unsubscribeFromUserSessions(user.id);
      }
    };
  }, [user.id, isConnected]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/sessions/user/${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      
      // Mock data for development
      const mockSessions: SessionInfo[] = [
        {
          id: '1',
          ipAddress: '192.168.1.100',
          deviceInfo: {
            browser: 'Chrome',
            os: 'Windows 10',
            device: 'Desktop',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          isActive: true,
          createdAt: '2024-06-18T10:30:00Z',
          lastActivity: '2024-06-18T14:45:00Z',
          expiresAt: '2024-06-19T10:30:00Z'
        },
        {
          id: '2',
          ipAddress: '192.168.1.101',
          deviceInfo: {
            browser: 'Safari',
            os: 'iOS 17',
            device: 'iPhone',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
          },
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
          isActive: true,
          createdAt: '2024-06-18T09:15:00Z',
          lastActivity: '2024-06-18T14:30:00Z',
          expiresAt: '2024-06-19T09:15:00Z'
        },
        {
          id: '3',
          ipAddress: '10.0.0.50',
          deviceInfo: {
            browser: 'Firefox',
            os: 'Ubuntu 22.04',
            device: 'Desktop',
            userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0)'
          },
          userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0)',
          isActive: true,
          createdAt: '2024-06-18T08:00:00Z',
          lastActivity: '2024-06-18T14:20:00Z',
          expiresAt: '2024-06-19T08:00:00Z'
        }
      ];
      
      setSessions(mockSessions);
      toast({
        title: 'Thông báo',
        description: 'Đang sử dụng dữ liệu mẫu (API chưa sẵn sàng)',
        variant: 'default',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSessions();
    setRefreshing(false);
  };

  const handleTerminateSession = async () => {
    if (!terminateDialog.session && !terminateDialog.isAll) return;

    try {
      setTerminating(true);
      
      let response;
      if (terminateDialog.isAll) {
        response = await fetch(`/api/admin/sessions/user/${user.id}/terminate-all`, {
          method: 'POST',
        });
      } else {
        response = await fetch(`/api/admin/sessions/${terminateDialog.session!.id}`, {
          method: 'DELETE',
        });
      }

      if (!response.ok) {
        throw new Error('Failed to terminate session(s)');
      }

      const result = await response.json();
      
      toast({
        title: 'Thành công',
        description: result.message,
      });

      // Refresh sessions list
      await fetchSessions();
      setTerminateDialog({ open: false });
    } catch (error) {
      console.error('Error terminating session:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể terminate session',
        variant: 'destructive',
      });
    } finally {
      setTerminating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDeviceIcon = (deviceInfo?: SessionInfo['deviceInfo']) => {
    if (!deviceInfo) return Globe;
    
    const device = deviceInfo.device?.toLowerCase() || '';
    if (device.includes('mobile') || device.includes('iphone') || device.includes('android')) {
      return Smartphone;
    }
    return Monitor;
  };

  const getSessionDuration = (createdAt: string, lastActivity: string) => {
    const start = new Date(createdAt);
    const end = new Date(lastActivity);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  const isSessionExpiringSoon = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours < 2; // Expiring within 2 hours
  };

  const uniqueIPs = new Set(sessions.map(s => s.ipAddress)).size;
  const isOverLimit = uniqueIPs > user.maxConcurrentIPs;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Sessions đang hoạt động
            </CardTitle>
            <CardDescription>
              Quản lý các phiên đăng nhập của {user.firstName} {user.lastName}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted">
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-red-600" />
                  <span className="text-xs text-red-600">Offline</span>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
            {sessions.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setTerminateDialog({ open: true, isAll: true })}
              >
                <X className="h-4 w-4 mr-2" />
                Terminate tất cả
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Session Summary */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{sessions.length}</div>
              <div className="text-sm text-muted-foreground">Sessions hoạt động</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${isOverLimit ? 'text-red-600' : ''}`}>
                {uniqueIPs}
              </div>
              <div className="text-sm text-muted-foreground">
                IP addresses ({user.maxConcurrentIPs} tối đa)
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {sessions.filter(s => isSessionExpiringSoon(s.expiresAt)).length}
              </div>
              <div className="text-sm text-muted-foreground">Sắp hết hạn</div>
            </CardContent>
          </Card>
        </div>

        {/* IP Limit Warning */}
        {isOverLimit && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Vượt quá giới hạn IP
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  User đang có {uniqueIPs} IP addresses hoạt động, vượt quá giới hạn {user.maxConcurrentIPs} IP.
                  Các sessions cũ nhất sẽ bị terminate tự động khi có IP mới.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sessions Table */}
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Đang tải sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Không có sessions hoạt động</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thiết bị</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => {
                const DeviceIcon = getDeviceIcon(session.deviceInfo);
                const expiringSoon = isSessionExpiringSoon(session.expiresAt);
                
                return (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {session.deviceInfo?.browser || 'Unknown Browser'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {session.deviceInfo?.os || 'Unknown OS'} • {session.deviceInfo?.device || 'Unknown Device'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{session.ipAddress}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>Bắt đầu: {formatDate(session.createdAt)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Hoạt động: {formatDate(session.lastActivity)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Thời lượng: {getSessionDuration(session.createdAt, session.lastActivity)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge className={session.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {session.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </Badge>
                        {expiringSoon && (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            Sắp hết hạn
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTerminateDialog({ open: true, session })}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Terminate
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Terminate Confirmation Dialog */}
      <Dialog open={terminateDialog.open} onOpenChange={(open) => setTerminateDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận terminate session</DialogTitle>
            <DialogDescription>
              {terminateDialog.isAll 
                ? `Bạn có chắc chắn muốn terminate tất cả ${sessions.length} sessions của ${user.firstName} ${user.lastName} không?`
                : `Bạn có chắc chắn muốn terminate session từ IP ${terminateDialog.session?.ipAddress} không?`
              }
            </DialogDescription>
          </DialogHeader>
          
          {terminateDialog.session && !terminateDialog.isAll && (
            <div className="space-y-2">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Chi tiết session:</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>IP:</strong> {terminateDialog.session.ipAddress}</div>
                  <div><strong>Thiết bị:</strong> {terminateDialog.session.deviceInfo?.device || 'Unknown'}</div>
                  <div><strong>Browser:</strong> {terminateDialog.session.deviceInfo?.browser || 'Unknown'}</div>
                  <div><strong>Bắt đầu:</strong> {formatDate(terminateDialog.session.createdAt)}</div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setTerminateDialog({ open: false })}
              disabled={terminating}
            >
              Hủy
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleTerminateSession}
              disabled={terminating}
            >
              {terminating ? 'Đang xử lý...' : 'Terminate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
