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
} from "@/components/ui";
import {
  Shield,
  AlertTriangle,
  Activity,
  Users,
  Eye,
  Lock,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  Monitor,
  AlertCircle,
} from "lucide-react";
import { adminSecurityService } from "@/lib/api/services/admin.api";
import { SecurityMetricsWidget } from "@/components/admin/security-monitoring/SecurityMetricsWidget";
import { SecurityEventsList } from "@/components/admin/security-monitoring/SecurityEventsList";

/**
 * Security Monitoring Dashboard Page
 * Trang dashboard monitoring bảo mật cho Admin
 */

// Align với SecurityStatsResponse từ backend
interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  highSeverityEvents: number;
  eventsToday: number;
  eventsThisWeek: number;
  eventsThisMonth: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  topThreats: Array<{
    type: string;
    count: number;
    lastOccurrence: string;
  }>;
  riskScore: number;
  blockedIPs: number;
  suspiciousActivities: number;
}

// Align với SecurityEventResponse từ backend
interface SecurityEvent {
  id: string;
  userId: string;
  eventType: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  ipAddress: string;
  userAgent?: string;
  location?: string;
  deviceInfo?: Record<string, any>;
  metadata?: Record<string, any>;
  resourceId?: string;
  resourceType?: string;
  isProcessed: boolean;
  createdAt: string;
}

export default function SecurityMonitoringPage() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  /**
   * Fetch security metrics từ real API
   * Lấy metrics bảo mật từ API thực
   */
  const fetchSecurityMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch security statistics từ real API
      const securityStats = await adminSecurityService.getSecurityStats();

      // Fetch recent security events
      const eventsResponse = await adminSecurityService.getSecurityEvents({
        limit: 10,
        page: 1,
      });

      // Map backend response to frontend interface
      setMetrics(securityStats);
      setRecentEvents(eventsResponse.data || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Failed to fetch security metrics:", error);
      setError(error instanceof Error ? error.message : "Không thể tải dữ liệu bảo mật");

      // Fallback to empty data instead of mock data
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
          <SecurityEventsList
            events={recentEvents}
            isLoading={isLoading}
            onRefresh={fetchSecurityMetrics}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <SecurityMetricsWidget metrics={metrics} isLoading={isLoading} />
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
