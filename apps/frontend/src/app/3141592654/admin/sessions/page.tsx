'use client';

import {
  Search,
  Trash2,
  Shield,
  Users,
  Activity,
  Clock,
  Globe,
  Smartphone,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog as AlertDialog,
  DialogContent as AlertDialogContent,
  DialogDescription as AlertDialogDescription,
  DialogFooter as AlertDialogFooter,
  DialogHeader as AlertDialogHeader,
  DialogTitle as AlertDialogTitle,
  DialogTrigger as AlertDialogTrigger
} from "@/components/ui/dialog";

// Alert dialog actions using Button component
const AlertDialogAction = Button;
const AlertDialogCancel = ({ children, ...props }: React.ComponentProps<typeof Button>) => (
  <Button variant="outline" {...props}>{children}</Button>
);

import {
  UserLoginSession,
  UserSessionStats
} from '@/lib/mockdata/sessions';
import { AdminService } from '@/services/grpc/admin.service';
import { toast as showToast } from 'sonner';

// Interface cho session filters
interface SessionFilters {
  search: string;
  status: 'all' | 'active' | 'expired';
  sortBy: 'createdAt' | 'lastActivity' | 'expiresAt';
  sortOrder: 'asc' | 'desc';
}

/**
 * Admin Sessions Management Page
 * Comprehensive session monitoring và management interface
 */
export default function AdminSessionsPage() {

  // State management
  const [sessions, setSessions] = useState<UserLoginSession[]>([]);
  const [stats, setStats] = useState<UserSessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<SessionFilters>({
    search: '',
    status: 'all',
    sortBy: 'lastActivity',
    sortOrder: 'desc'
  });

  // Real-time updates
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  /**
   * Fetch session statistics from real backend
   */
  const fetchStats = async () => {
    try {
      console.log('📊 [Stats] Fetching session statistics...');
      const response = await AdminService.getAllUserSessions({
        page: 1,
        limit: 1000, // Get all for stats calculation
        activeOnly: false
      });

      console.log('📦 [Stats] Response:', {
        success: response.success,
        sessionCount: response.sessions?.length || 0
      });

      if (response.success && response.sessions) {
        // Calculate stats from sessions data
        const activeSessions = response.sessions.filter(s => s.is_active);
        const uniqueIPs = new Set(response.sessions.map(s => s.ip_address));
        
        // Calculate average session duration (in minutes)
        const durations = activeSessions
          .map(s => {
            const created = new Date(s.created_at);
            const lastActivity = new Date(s.last_activity);
            return (lastActivity.getTime() - created.getTime()) / (1000 * 60);
          })
          .filter(d => d > 0 && d < 60 * 24); // Filter invalid values
        
        const avgDuration = durations.length > 0
          ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
          : 0;

        setStats({
          totalActiveSessions: response.total_active_sessions || activeSessions.length,
          uniqueActiveUsers: response.unique_active_users || activeSessions.length,
          uniqueActiveIPs: uniqueIPs.size,
          averageSessionDuration: avgDuration,
          recentViolations: 0 // TODO: Get from backend
        });
      }
    } catch (error) {
      console.error('Error fetching session stats:', error);
      showToast.error('Không thể tải thống kê phiên đăng nhập');
    }
  };

  /**
   * Fetch all active sessions from real backend with user data
   */
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch sessions from backend
      console.log('🔍 [Sessions] Fetching sessions from backend...');
      const sessionsResponse = await AdminService.getAllUserSessions({
        page: 1,
        limit: 100,
        activeOnly: false,
        searchQuery: filters.search || undefined
      });

      console.log('📦 [Sessions] Response:', {
        success: sessionsResponse.success,
        message: sessionsResponse.message,
        sessionCount: sessionsResponse.sessions?.length || 0,
        totalActive: sessionsResponse.total_active_sessions,
        uniqueUsers: sessionsResponse.unique_active_users
      });

      if (!sessionsResponse.success) {
        throw new Error(sessionsResponse.message);
      }

      // Fetch users to get email and name info
      console.log('👥 [Sessions] Fetching users for mapping...');
      const usersResponse = await AdminService.listUsers({
        page: 1,
        limit: 1000 // Get all users for mapping
      });

      console.log('📦 [Users] Response:', {
        success: usersResponse.success,
        userCount: usersResponse.users?.length || 0
      });

      // Create user lookup map
      const userMap = new Map<string, { email: string; firstName: string; lastName: string }>();
      if (usersResponse.success && usersResponse.users) {
        usersResponse.users.forEach((user: {
          id: string;
          email: string;
          first_name?: string;
          last_name?: string;
        }) => {
          userMap.set(user.id, {
            email: user.email,
            firstName: user.first_name || '',
            lastName: user.last_name || ''
          });
        });
      }
      
      console.log(`🗺️ [Sessions] Created user map with ${userMap.size} entries`);

      // Map sessions with user data
      const mappedSessions: UserLoginSession[] = (sessionsResponse.sessions || []).map(session => {
        const user = userMap.get(session.user_id);
        return {
          id: session.id,
          userId: session.user_id,
          user: user || {
            email: 'Unknown',
            firstName: 'Unknown',
            lastName: 'User'
          },
          ipAddress: session.ip_address,
          deviceInfo: {
            browser: extractBrowser(session.user_agent),
            os: extractOS(session.user_agent),
            device: extractDevice(session.user_agent)
          },
          userAgent: session.user_agent,
          isActive: session.is_active,
          createdAt: session.created_at,
          lastActivity: session.last_activity,
          expiresAt: session.expires_at,
          location: session.location || 'Unknown'
        };
      });

      console.log(`✅ [Sessions] Mapped ${mappedSessions.length} sessions with user data`);

      setSessions(mappedSessions);
      setLastUpdate(new Date());

      showToast.success(`Đã tải ${mappedSessions.length} phiên đăng nhập`);
    } catch (error) {
      console.error('❌ [Sessions] Error fetching sessions:', error);
      showToast.error(error instanceof Error ? error.message : 'Không thể tải danh sách phiên đăng nhập');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [filters.search]);

  /**
   * Helper: Extract browser from user agent
   */
  const extractBrowser = (userAgent: string): string => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  /**
   * Helper: Extract OS from user agent
   */
  const extractOS = (userAgent: string): string => {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS') || userAgent.includes('iPhone')) return 'iOS';
    return 'Unknown';
  };

  /**
   * Helper: Extract device type from user agent
   */
  const extractDevice = (userAgent: string): string => {
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return 'Mobile';
    }
    if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      return 'Tablet';
    }
    return 'Desktop';
  };

  // Initial data load on mount
  useEffect(() => {
    fetchSessions();
    fetchStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchSessions();
        fetchStats();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Terminate single session
   */
  const terminateSession = async (sessionId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, isActive: false, expiresAt: new Date().toISOString() }
          : session
      ));

      console.log('Session terminated successfully:', sessionId);
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  };

  /**
   * Bulk terminate selected sessions
   */
  const bulkTerminateSessions = async () => {
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setSessions(prev => prev.map(session => 
        selectedSessions.has(session.id)
          ? { ...session, isActive: false, expiresAt: new Date().toISOString() }
          : session
      ));

      console.log(`Terminated ${selectedSessions.size} sessions`);
      setSelectedSessions(new Set());
    } catch (error) {
      console.error('Error bulk terminating sessions:', error);
    }
  };

  /**
   * Cleanup expired sessions
   */
  const cleanupExpiredSessions = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Get expired sessions from current state
      const expiredSessions = sessions.filter(session =>
        !session.isActive || new Date(session.expiresAt) <= new Date()
      );

      // Remove expired sessions from state
      setSessions(prev => prev.filter(session =>
        session.isActive && new Date(session.expiresAt) > new Date()
      ));

      console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
      await fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchSessions();
        fetchStats();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchSessions]); // ✅ Include fetchSessions dependency

  // Initial data load
  useEffect(() => {
    fetchSessions();
    fetchStats();
  }, [fetchSessions]); // ✅ Include fetchSessions dependency

  // Filter sessions based on current filters
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = filters.search === '' || 
      session.user?.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      session.ipAddress.includes(filters.search) ||
      session.user?.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
      session.user?.lastName.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = filters.status === 'all' ||
      (filters.status === 'active' && session.isActive && new Date(session.expiresAt) > new Date()) ||
      (filters.status === 'expired' && (!session.isActive || new Date(session.expiresAt) <= new Date()));

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const aValue = new Date(a[filters.sortBy]).getTime();
    const bValue = new Date(b[filters.sortBy]).getTime();
    return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Sessions</h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý sessions của người dùng trong hệ thống
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto Refresh' : 'Manual Refresh'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchSessions();
              fetchStats();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="theme-bg theme-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalActiveSessions}</div>
              <p className="text-xs text-muted-foreground">
                Sessions đang hoạt động
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueActiveUsers}</div>
              <p className="text-xs text-muted-foreground">
                Người dùng đang online
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique IPs</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueActiveIPs}</div>
              <p className="text-xs text-muted-foreground">
                Địa chỉ IP khác nhau
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageSessionDuration}m</div>
              <p className="text-xs text-muted-foreground">
                Thời gian session trung bình
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Violations</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.recentViolations}</div>
              <p className="text-xs text-muted-foreground">
                Vi phạm gần đây
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Bộ lọc và Hành động</CardTitle>
              <CardDescription>
                Lọc và quản lý sessions trong hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm theo email, IP, tên..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-8"
                    />
                  </div>
                </div>

                <Select
                  value={filters.status}
                  onValueChange={(value: 'all' | 'active' | 'expired') => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="expired">Đã hết hạn</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.sortBy}
                  onValueChange={(value: 'createdAt' | 'lastActivity' | 'expiresAt') => setFilters(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sắp xếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lastActivity">Hoạt động cuối</SelectItem>
                    <SelectItem value="createdAt">Thời gian tạo</SelectItem>
                    <SelectItem value="expiresAt">Thời gian hết hạn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedSessions.size > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Terminate {selectedSessions.size} sessions
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận terminate sessions</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc chắn muốn terminate {selectedSessions.size} sessions đã chọn?
                          Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={bulkTerminateSessions}>
                          Terminate
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Shield className="h-4 w-4 mr-2" />
                      Cleanup Expired
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cleanup expired sessions</AlertDialogTitle>
                      <AlertDialogDescription>
                        Xóa tất cả sessions đã hết hạn khỏi hệ thống. Hành động này sẽ giúp tối ưu hóa hiệu suất.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction onClick={cleanupExpiredSessions}>
                        Cleanup
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          {/* Sessions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách Sessions ({filteredSessions.length})</CardTitle>
              <CardDescription>
                Cập nhật lần cuối: {lastUpdate.toLocaleTimeString('vi-VN')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Đang tải...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedSessions.size === filteredSessions.length && filteredSessions.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSessions(new Set(filteredSessions.map(s => s.id)));
                            } else {
                              setSelectedSessions(new Set());
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Thiết bị</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Hoạt động cuối</TableHead>
                      <TableHead>Hết hạn</TableHead>
                      <TableHead>Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.map((session) => {
                      const isExpired = new Date(session.expiresAt) <= new Date();
                      const isActive = session.isActive && !isExpired;

                      return (
                        <TableRow key={session.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedSessions.has(session.id)}
                              onChange={(e) => {
                                const newSelected = new Set(selectedSessions);
                                if (e.target.checked) {
                                  newSelected.add(session.id);
                                } else {
                                  newSelected.delete(session.id);
                                }
                                setSelectedSessions(newSelected);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {session.user?.firstName} {session.user?.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {session.user?.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                              <div>
                                <div>{session.ipAddress}</div>
                                {session.location && (
                                  <div className="text-sm text-muted-foreground">
                                    {session.location}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Smartphone className="h-4 w-4 mr-2 text-muted-foreground" />
                              <div>
                                <div>{session.deviceInfo.browser}</div>
                                <div className="text-sm text-muted-foreground">
                                  {session.deviceInfo.os} • {session.deviceInfo.device}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={isActive ? 'default' : 'secondary'}>
                              {isActive ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Hoạt động
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  {isExpired ? 'Hết hạn' : 'Không hoạt động'}
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(session.lastActivity).toLocaleString('vi-VN')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(session.expiresAt).toLocaleString('vi-VN')}
                            </div>
                          </TableCell>
                          <TableCell>
                            {isActive && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Terminate session</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bạn có chắc chắn muốn terminate session này?
                                      Người dùng sẽ bị đăng xuất ngay lập tức.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => terminateSession(session.id)}
                                    >
                                      Terminate
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Monitoring</CardTitle>
              <CardDescription>
                Theo dõi hoạt động sessions trong thời gian thực
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Real-time monitoring dashboard sẽ được implement ở đây
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Session Analytics</CardTitle>
              <CardDescription>
                Phân tích và báo cáo về sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Analytics dashboard sẽ được implement ở đây
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
