'use client';

import { TrendingUp, Users, Globe, AlertTriangle, Clock, Monitor, Smartphone, Tablet } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';

import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";

interface SessionAnalyticsData {
  totalActiveSessions: number;
  uniqueActiveUsers: number;
  uniqueActiveIPs: number;
  averageSessionDuration: number;
  recentViolations: number;
  sessionsOverTime: Array<{
    time: string;
    sessions: number;
    violations: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
  ipViolations: Array<{
    userId: string;
    userName: string;
    ipCount: number;
    violationTime: string;
  }>;
  topActiveUsers: Array<{
    userId: string;
    userName: string;
    sessionCount: number;
    ipCount: number;
    lastActivity: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function SessionAnalyticsDashboard() {
  const [data, setData] = useState<SessionAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Mock data for development
      const mockData: SessionAnalyticsData = {
        totalActiveSessions: 247,
        uniqueActiveUsers: 189,
        uniqueActiveIPs: 156,
        averageSessionDuration: 42,
        recentViolations: 8,
        sessionsOverTime: [
          { time: '00:00', sessions: 45, violations: 0 },
          { time: '02:00', sessions: 32, violations: 1 },
          { time: '04:00', sessions: 28, violations: 0 },
          { time: '06:00', sessions: 41, violations: 2 },
          { time: '08:00', sessions: 89, violations: 1 },
          { time: '10:00', sessions: 156, violations: 3 },
          { time: '12:00', sessions: 203, violations: 2 },
          { time: '14:00', sessions: 247, violations: 1 },
          { time: '16:00', sessions: 234, violations: 0 },
          { time: '18:00', sessions: 198, violations: 1 },
          { time: '20:00', sessions: 167, violations: 2 },
          { time: '22:00', sessions: 134, violations: 0 },
        ],
        deviceBreakdown: [
          { device: 'Desktop', count: 98, percentage: 39.7 },
          { device: 'Mobile', count: 89, percentage: 36.0 },
          { device: 'Tablet', count: 35, percentage: 14.2 },
          { device: 'Unknown', count: 25, percentage: 10.1 },
        ],
        ipViolations: [
          { userId: '1', userName: 'Nguyễn Văn A', ipCount: 5, violationTime: '2024-06-18T14:30:00Z' },
          { userId: '2', userName: 'Trần Thị B', ipCount: 4, violationTime: '2024-06-18T13:45:00Z' },
          { userId: '3', userName: 'Lê Văn C', ipCount: 6, violationTime: '2024-06-18T12:15:00Z' },
        ],
        topActiveUsers: [
          { userId: '1', userName: 'Nguyễn Văn A', sessionCount: 5, ipCount: 3, lastActivity: '2024-06-18T14:45:00Z' },
          { userId: '2', userName: 'Trần Thị B', sessionCount: 4, ipCount: 2, lastActivity: '2024-06-18T14:30:00Z' },
          { userId: '3', userName: 'Lê Văn C', sessionCount: 3, ipCount: 3, lastActivity: '2024-06-18T14:15:00Z' },
          { userId: '4', userName: 'Phạm Thị D', sessionCount: 3, ipCount: 2, lastActivity: '2024-06-18T14:00:00Z' },
          { userId: '5', userName: 'Hoàng Văn E', sessionCount: 2, ipCount: 2, lastActivity: '2024-06-18T13:45:00Z' },
        ],
      };
      
      setData(mockData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      case 'desktop':
        return Monitor;
      default:
        return Globe;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Không thể tải dữ liệu analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Session Analytics</h2>
          <p className="text-muted-foreground">
            Thống kê và phân tích sessions trong hệ thống
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">1 giờ qua</SelectItem>
            <SelectItem value="24h">24 giờ qua</SelectItem>
            <SelectItem value="7d">7 ngày qua</SelectItem>
            <SelectItem value="30d">30 ngày qua</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Sessions hoạt động</p>
                <p className="text-2xl font-bold">{data.totalActiveSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Users hoạt động</p>
                <p className="text-2xl font-bold">{data.uniqueActiveUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Globe className="h-4 w-4 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">IP addresses</p>
                <p className="text-2xl font-bold">{data.uniqueActiveIPs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Thời lượng TB</p>
                <p className="text-2xl font-bold">{data.averageSessionDuration}m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Vi phạm IP</p>
                <p className="text-2xl font-bold">{data.recentViolations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sessions Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Sessions theo thời gian</CardTitle>
            <CardDescription>
              Số lượng sessions và vi phạm IP trong {timeRange === '24h' ? '24 giờ' : timeRange} qua
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.sessionsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="sessions" 
                  stackId="1"
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                  name="Sessions"
                />
                <Area 
                  type="monotone" 
                  dataKey="violations" 
                  stackId="2"
                  stroke="#ff7300" 
                  fill="#ff7300" 
                  fillOpacity={0.8}
                  name="Vi phạm"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bố thiết bị</CardTitle>
            <CardDescription>
              Tỷ lệ sessions theo loại thiết bị
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.deviceBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ device, percentage }) => `${device} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.deviceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {data.deviceBreakdown.map((item, index) => {
                const DeviceIcon = getDeviceIcon(item.device);
                return (
                  <div key={item.device} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{item.device}</span>
                    <span className="text-sm font-medium ml-auto">{item.count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent IP Violations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Vi phạm IP gần đây
            </CardTitle>
            <CardDescription>
              Users có nhiều IP đồng thời vượt giới hạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.ipViolations.map((violation) => (
                <div key={violation.userId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{violation.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {violation.ipCount} IP addresses • {formatDate(violation.violationTime)}
                    </p>
                  </div>
                  <Badge variant="destructive">
                    Vi phạm
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Active Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Users hoạt động nhiều nhất
            </CardTitle>
            <CardDescription>
              Top 5 users có nhiều sessions nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topActiveUsers.map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{user.userName}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.sessionCount} sessions • {user.ipCount} IPs
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {formatDate(user.lastActivity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
