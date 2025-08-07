'use client';

import { 
  Shield, 
  Users, 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

import {
  Button,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import logger from '@/lib/utils/logger';


/**
 * Auth Monitoring Dashboard
 * 
 * Dashboard theo dõi và phân tích authentication:
 * - Real-time metrics
 * - Security alerts
 * - Performance monitoring
 * - User behavior analytics
 */

interface DashboardData {
  loginStats: {
    totalLogins: number;
    successfulLogins: number;
    failedLogins: number;
    uniqueUsers: number;
    averageSessionDuration: number;
    peakHours: Array<{ hour: number; count: number }>;
  };
  securityMetrics: {
    suspiciousActivities: number;
    blockedIPs: number;
    twoFactorUsage: number;
    passwordResets: number;
    accountLockouts: number;
    deviceTrustEvents: number;
  };
  userBehavior: {
    averageSessionsPerUser: number;
    mostActiveUsers: Array<{ userId: string; sessionCount: number }>;
    deviceDistribution: Record<string, number>;
    browserDistribution: Record<string, number>;
    geographicDistribution: Record<string, number>;
  };
  performance: {
    averageLoginTime: number;
    averageLogoutTime: number;
    slowestLogins: Array<{ userId: string; duration: number; timestamp: Date }>;
    apiResponseTimes: Record<string, number>;
  };
}

export function AuthDashboard(): JSX.Element {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  // Fetch dashboard data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockData: DashboardData = {
        loginStats: {
          totalLogins: 1250,
          successfulLogins: 1180,
          failedLogins: 70,
          uniqueUsers: 890,
          averageSessionDuration: 45.5,
          peakHours: [
            { hour: 9, count: 120 },
            { hour: 14, count: 95 },
            { hour: 20, count: 85 },
            { hour: 11, count: 75 },
            { hour: 16, count: 65 },
          ],
        },
        securityMetrics: {
          suspiciousActivities: 12,
          blockedIPs: 5,
          twoFactorUsage: 450,
          passwordResets: 23,
          accountLockouts: 8,
          deviceTrustEvents: 156,
        },
        userBehavior: {
          averageSessionsPerUser: 2.3,
          mostActiveUsers: [
            { userId: 'user123', sessionCount: 15 },
            { userId: 'user456', sessionCount: 12 },
            { userId: 'user789', sessionCount: 10 },
          ],
          deviceDistribution: {
            'Desktop': 650,
            'Mobile': 420,
            'Tablet': 180,
          },
          browserDistribution: {
            'Chrome': 580,
            'Firefox': 280,
            'Safari': 220,
            'Edge': 170,
          },
          geographicDistribution: {
            'Vietnam': 780,
            'USA': 180,
            'Japan': 120,
            'Singapore': 90,
            'Others': 80,
          },
        },
        performance: {
          averageLoginTime: 285,
          averageLogoutTime: 165,
          slowestLogins: [
            { userId: 'user1', duration: 1200, timestamp: new Date() },
            { userId: 'user2', duration: 1100, timestamp: new Date() },
          ],
          apiResponseTimes: {
            '/auth/login': 245,
            '/auth/logout': 155,
            '/auth/refresh': 125,
            '/auth/profile': 195,
          },
        },
      };

      setData(mockData);
      setLastUpdated(new Date());
    } catch (error) {
      logger.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải dữ liệu...</span>
      </div>
    );
  }

  const successRate = (data.loginStats.successfulLogins / data.loginStats.totalLogins) * 100;
  const twoFactorRate = (data.securityMetrics.twoFactorUsage / data.loginStats.successfulLogins) * 100;

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Auth Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            Cập nhật lần cuối: {lastUpdated.toLocaleTimeString('vi-VN')}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex space-x-2">
        {(['1h', '24h', '7d', '30d'] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range === '1h' ? '1 giờ' : range === '24h' ? '24 giờ' : range === '7d' ? '7 ngày' : '30 ngày'}
          </Button>
        ))}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đăng nhập</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.loginStats.totalLogins.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% so với hôm qua
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ thành công</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {data.loginStats.successfulLogins} / {data.loginStats.totalLogins} lần đăng nhập
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoạt động đáng ngờ</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {data.securityMetrics.suspiciousActivities}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.securityMetrics.blockedIPs} IP bị chặn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thời gian phiên TB</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.loginStats.averageSessionDuration.toFixed(1)}m</div>
            <p className="text-xs text-muted-foreground">
              Trung bình mỗi phiên đăng nhập
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
          <TabsTrigger value="behavior">Hành vi người dùng</TabsTrigger>
          <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Peak Hours Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Giờ cao điểm đăng nhập</CardTitle>
                <CardDescription>Phân bố đăng nhập theo giờ trong ngày</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.loginStats.peakHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Phân bố thiết bị</CardTitle>
                <CardDescription>Loại thiết bị được sử dụng để đăng nhập</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(data.userBehavior.deviceDistribution).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(data.userBehavior.deviceDistribution).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Security Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Metrics bảo mật</CardTitle>
                <CardDescription>Các chỉ số bảo mật quan trọng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Sử dụng 2FA</span>
                  <Badge variant="secondary">{twoFactorRate.toFixed(1)}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Reset mật khẩu</span>
                  <Badge variant="outline">{data.securityMetrics.passwordResets}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tài khoản bị khóa</span>
                  <Badge variant="destructive">{data.securityMetrics.accountLockouts}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Sự kiện tin cậy thiết bị</span>
                  <Badge variant="secondary">{data.securityMetrics.deviceTrustEvents}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Phân bố địa lý</CardTitle>
                <CardDescription>Vị trí đăng nhập theo quốc gia</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(data.userBehavior.geographicDistribution).map(([name, value]) => ({ name, value }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Most Active Users */}
            <Card>
              <CardHeader>
                <CardTitle>Người dùng hoạt động nhất</CardTitle>
                <CardDescription>Top người dùng có nhiều phiên đăng nhập nhất</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.userBehavior.mostActiveUsers.map((user, index) => (
                    <div key={user.userId} className="flex justify-between items-center">
                      <span className="font-medium">#{index + 1} {user.userId}</span>
                      <Badge variant="outline">{user.sessionCount} phiên</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Browser Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Phân bố trình duyệt</CardTitle>
                <CardDescription>Trình duyệt được sử dụng để đăng nhập</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(data.userBehavior.browserDistribution).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(data.userBehavior.browserDistribution).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* API Response Times */}
            <Card>
              <CardHeader>
                <CardTitle>Thời gian phản hồi API</CardTitle>
                <CardDescription>Hiệu suất các endpoint authentication</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(data.performance.apiResponseTimes).map(([name, value]) => ({ name, value }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}ms`, 'Thời gian phản hồi']} />
                    <Bar dataKey="value" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Tóm tắt hiệu suất</CardTitle>
                <CardDescription>Các chỉ số hiệu suất chính</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Thời gian đăng nhập TB</span>
                  <Badge variant="secondary">{data.performance.averageLoginTime}ms</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Thời gian đăng xuất TB</span>
                  <Badge variant="secondary">{data.performance.averageLogoutTime}ms</Badge>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium">Đăng nhập chậm nhất:</span>
                  {data.performance.slowestLogins.map((login, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span>{login.userId}</span>
                      <Badge variant="outline">{login.duration}ms</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
