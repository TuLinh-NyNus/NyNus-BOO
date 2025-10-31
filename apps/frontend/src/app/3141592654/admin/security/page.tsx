"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertDescription,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import {
  Shield,
  AlertTriangle,
  Activity,
  RefreshCw,
  Clock,
  MapPin,
  AlertCircle,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Import types from mockdata
import {
  type SecurityMetrics,
  type SecurityEvent
} from "@/lib/mockdata";
import { AdminService } from "@/services/grpc/admin.service";
import { getThreatDetectionEngine } from "@/lib/security/threat-detection-engine";
import { AutoResponseSystem } from "@/lib/security/auto-response-system";
import type { ThreatEvent, ThreatAnalysis } from "@/lib/security/threat-detection-engine";
import type { SecurityResponse } from "@/lib/security/auto-response-system";

/**
 * Security Monitoring Dashboard Page
 * Trang dashboard monitoring bảo mật cho Admin - Chuyển đổi từ temp1/admin/FE
 */

export default function SecurityMonitoringPage() {
  // State management cho security metrics và events
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // New state for integrated security systems
  const [activeThreats, setActiveThreats] = useState<ThreatEvent[]>([]);
  const [recentResponses, setRecentResponses] = useState<SecurityResponse[]>([]);
  const [threatTimeline, setThreatTimeline] = useState<Array<{hour: string, threats: number}>>([]);

  /**
   * Fetch security metrics từ real database via gRPC
   * Call AdminService.getSecurityAlerts() để lấy security events
   */
  const fetchSecurityMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Call real gRPC API
      const alertsResponse = await AdminService.getSecurityAlerts({
        pagination: {
          page: 1,
          limit: 10
        }
      });

      if (!alertsResponse.success) {
        throw new Error(alertsResponse.message || 'Failed to fetch security alerts');
      }

      // Map gRPC response to SecurityEvent format
      const mappedEvents: SecurityEvent[] = (alertsResponse.alerts || []).map((alert: Record<string, unknown>, index: number) => ({
        id: `event-${index + 1}`,
        timestamp: new Date().toISOString(), // TODO: Add timestamp from backend
        type: String(alert.alert_type || 'UNKNOWN'),
        severity: 'HIGH', // TODO: Add severity from backend
        userId: String(alert.user_id || ''),
        userEmail: String(alert.user_id || ''), // TODO: Get email from backend
        ipAddress: '0.0.0.0', // TODO: Add IP from backend
        action: String(alert.alert_type || ''),
        resource: 'SYSTEM',
        details: String(alert.details || alert.message || ''),
        status: 'UNRESOLVED' // TODO: Add status from backend
      }));

      // Calculate metrics from alerts (TODO: Add backend endpoint for metrics)
      const totalEvents = mappedEvents.length;
      const criticalEvents = mappedEvents.filter(e => e.severity === 'CRITICAL').length;
      const highSeverityEvents = mappedEvents.filter(e => e.severity === 'HIGH').length;

      setMetrics({
        totalEvents,
        criticalEvents,
        highSeverityEvents,
        eventsToday: totalEvents, // TODO: Filter by today
        eventsThisWeek: totalEvents, // TODO: Filter by this week
        eventsThisMonth: totalEvents, // TODO: Filter by this month
        eventsByType: {}, // TODO: Calculate from events
        eventsBySeverity: {
          CRITICAL: criticalEvents,
          HIGH: highSeverityEvents,
          MEDIUM: 0,
          LOW: 0
        },
        topThreats: [], // TODO: Calculate from events
        riskScore: criticalEvents + highSeverityEvents, // Simple calculation
        blockedIPs: 0, // TODO: Add from backend
        suspiciousActivities: totalEvents
      });
      setRecentEvents(mappedEvents);
      
      // Integrate with ThreatDetectionEngine
      const threatEngine = getThreatDetectionEngine();
      const threats = threatEngine.getDetectedThreats();
      setActiveThreats(threats.filter((t: ThreatEvent) => Date.now() - t.timestamp < 24 * 60 * 60 * 1000)); // Last 24h
      
      // Get threat timeline (hourly for last 24h)
      const now = new Date();
      const hourlyThreats = Array.from({ length: 24 }, (_, i) => {
        const hourStart = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
        hourStart.setMinutes(0, 0, 0);
        const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
        const count = threats.filter((t: ThreatEvent) => 
          t.timestamp >= hourStart.getTime() && t.timestamp < hourEnd.getTime()
        ).length;
        return {
          hour: `${i}h`,
          threats: count,
        };
      });
      setThreatTimeline(hourlyThreats);
      
      // Get recent responses
      const responseSystem = AutoResponseSystem.getInstance();
      const responses = responseSystem.getResponses();
      setRecentResponses(responses.slice(0, 10)); // Last 10 responses
      
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Failed to fetch security metrics:", error);
      setError(error instanceof Error ? error.message : "Không thể tải dữ liệu bảo mật");

      // Fallback to empty data
      setMetrics({
        totalEvents: 0,
        criticalEvents: 0,
        highSeverityEvents: 0,
        eventsToday: 0,
        eventsThisWeek: 0,
        eventsThisMonth: 0,
        eventsByType: {},
        eventsBySeverity: {},
        topThreats: [],
        riskScore: 0,
        blockedIPs: 0,
        suspiciousActivities: 0,
      });
      setRecentEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount và setup auto-refresh
  useEffect(() => {
    fetchSecurityMetrics();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSecurityMetrics, 30000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Get severity badge color
   * Lấy màu badge theo mức độ nghiêm trọng
   */
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "destructive";
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "default";
      case "LOW":
        return "secondary";
      default:
        return "secondary";
    }
  };

  /**
   * Format timestamp to Vietnamese relative time
   * Format timestamp thành thời gian tương đối tiếng Việt
   */
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 1) {
      return "Vừa xong";
    } else if (diffMinutes < 60) {
      return `${diffMinutes} phút trước`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)} giờ trước`;
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải dữ liệu bảo mật...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Giám sát Bảo mật</h1>
          <p className="text-muted-foreground">
            Theo dõi các sự kiện bảo mật và phát hiện mối đe dọa
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Cập nhật lần cuối: {lastRefresh.toLocaleTimeString("vi-VN")}
          </div>
          <Button onClick={fetchSecurityMetrics} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sự kiện</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalEvents.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.criticalEvents || 0} sự kiện nghiêm trọng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mức độ cao</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.highSeverityEvents || 0}</div>
            <p className="text-xs text-muted-foreground">Sự kiện mức độ cao</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm rủi ro</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.riskScore || 0}</div>
            <p className="text-xs text-muted-foreground">Điểm rủi ro hệ thống</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IP bị chặn</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.blockedIPs || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.suspiciousActivities || 0} hoạt động đáng nghi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Security Monitoring */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Sự kiện gần đây</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sự kiện bảo mật gần đây</CardTitle>
              <CardDescription>Danh sách các sự kiện bảo mật được phát hiện</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loại sự kiện</TableHead>
                    <TableHead>Mức độ</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" />
                          <span className="font-medium">{event.eventType}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(event.severity) as "default" | "secondary" | "destructive" | "outline"}>
                          {event.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{event.description}</div>
                          {event.location && (
                            <div className="text-xs text-muted-foreground">{event.location}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono">{event.ipAddress}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{formatTimestamp(event.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={event.isProcessed ? "secondary" : "destructive"}>
                          {event.isProcessed ? "Đã xử lý" : "Chưa xử lý"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {recentEvents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Không có sự kiện bảo mật nào gần đây
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Threat Timeline Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Threat Timeline (24h)
              </CardTitle>
              <CardDescription>Timeline của threats phát hiện được trong 24 giờ qua</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={threatTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="threats" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Active Threats & Response Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Threats Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Active Threats
                </CardTitle>
                <CardDescription>Mối đe dọa đang hoạt động (24h qua)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeThreats.length > 0 ? (
                    activeThreats.slice(0, 5).map((threat) => (
                      <div key={threat.id} className="border-l-4 border-destructive pl-3 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{threat.threatType}</span>
                          <Badge variant="destructive">{threat.severity}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{threat.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(threat.timestamp).toLocaleString('vi-VN')}</span>
                          <span className="ml-auto">Risk: {threat.riskScore}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-2 text-green-500" />
                      <p>Không phát hiện threat nào trong 24h qua</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Response Actions Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  Response Actions
                </CardTitle>
                <CardDescription>Các phản ứng tự động gần đây</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentResponses.length > 0 ? (
                    recentResponses.map((response) => (
                      <div key={response.id} className="border-l-4 border-blue-500 pl-3 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{response.action}</span>
                          <Badge variant={response.status === 'completed' ? 'default' : 'secondary'}>
                            {response.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{response.reason}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>Triggered by: {response.triggeredBy}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-2" />
                      <p>Chưa có response action nào</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt giám sát</CardTitle>
              <CardDescription>Cấu hình các tham số giám sát bảo mật</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Phát hiện ghi màn hình</p>
                    <p className="text-sm text-muted-foreground">
                      Tự động phát hiện hoạt động ghi màn hình
                    </p>
                  </div>
                  <Badge variant="secondary">Đã bật</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">CAPTCHA tự động</p>
                    <p className="text-sm text-muted-foreground">
                      Hiển thị CAPTCHA cho hoạt động đáng nghi
                    </p>
                  </div>
                  <Badge variant="secondary">Đã bật</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Rate limiting</p>
                    <p className="text-sm text-muted-foreground">Giới hạn số lượng requests</p>
                  </div>
                  <Badge variant="secondary">Đã bật</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
