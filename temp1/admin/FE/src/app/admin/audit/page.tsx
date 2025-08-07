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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import {
  FileText,
  Shield,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  RefreshCw,
  Download,
  Clock,
  MapPin,
} from "lucide-react";

/**
 * Audit Trail Page
 * Trang audit trail cho Admin
 */

interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress: string;
  userAgent?: string;
  sessionId?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: any;
  createdAt: string;
}

interface AuditStats {
  totalLogsToday: number;
  failedActionsToday: number;
  mostCommonAction: string;
  mostActiveUser: string;
  successRate: number;
  actionsByType: Record<string, number>;
  actionsByResource: Record<string, number>;
  recentFailures: Array<{
    action: string;
    resource?: string;
    userEmail?: string;
    errorMessage?: string;
    timestamp: string;
  }>;
}

export default function AuditTrailPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterResource, setFilterResource] = useState<string>("all");
  const [filterSuccess, setFilterSuccess] = useState<string>("all");

  /**
   * Fetch audit logs data từ API
   */
  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: "1",
        limit: "50",
        ...(searchTerm && { search: searchTerm }),
        ...(filterAction !== "all" && { action: filterAction }),
        ...(filterResource !== "all" && { resource: filterResource }),
        ...(filterSuccess !== "all" && { success: filterSuccess === "success" ? "true" : "false" }),
      });

      // Fetch real data from admin API
      const [logsResponse, statsResponse] = await Promise.all([
        fetch(`/api/admin/audit?${queryParams}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        fetch("/api/admin/audit/stats", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ]);

      if (!logsResponse.ok || !statsResponse.ok) {
        throw new Error("Failed to fetch audit logs data");
      }

      const logsData = await logsResponse.json();
      const statsData = await statsResponse.json();

      setAuditLogs(logsData.auditLogs);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch audit logs data:", error);

      // Fallback to mock data for development
      const mockStats: AuditStats = {
        totalLogsToday: 2456,
        failedActionsToday: 89,
        mostCommonAction: "LOGIN",
        mostActiveUser: "john.doe@example.com",
        successRate: 96,
        actionsByType: {
          LOGIN: 567,
          LOGOUT: 234,
          CREATE_USER: 89,
          UPDATE_USER: 156,
          DELETE_RESOURCE: 45,
          ACCESS_RESOURCE: 1234,
        },
        actionsByResource: {
          USER: 345,
          COURSE: 234,
          VIDEO: 189,
          EXAM: 67,
        },
        recentFailures: [
          {
            action: "LOGIN",
            userEmail: "suspicious@example.com",
            errorMessage: "Invalid credentials",
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          },
          {
            action: "ACCESS_RESOURCE",
            resource: "VIDEO",
            userEmail: "user@example.com",
            errorMessage: "Insufficient permissions",
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          },
        ],
      };

      const mockLogs: AuditLog[] = [
        {
          id: "1",
          userId: "user1",
          userEmail: "john.doe@example.com",
          userName: "John Doe",
          action: "LOGIN",
          resource: "USER",
          resourceId: "user1",
          ipAddress: "192.168.1.100",
          userAgent: "Chrome/120.0",
          sessionId: "session123",
          success: true,
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          metadata: { loginMethod: "email" },
        },
        {
          id: "2",
          userId: "user2",
          userEmail: "jane.smith@example.com",
          userName: "Jane Smith",
          action: "UPDATE_USER",
          resource: "USER",
          resourceId: "user2",
          ipAddress: "10.0.0.50",
          userAgent: "Safari/17.0",
          success: true,
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          oldValues: { firstName: "Jane" },
          newValues: { firstName: "Jane Updated" },
        },
        {
          id: "3",
          userEmail: "suspicious@example.com",
          action: "LOGIN",
          resource: "USER",
          ipAddress: "203.0.113.10",
          userAgent: "Firefox/121.0",
          success: false,
          errorMessage: "Invalid credentials",
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          metadata: { attempts: 5 },
        },
      ];

      setStats(mockStats);
      setAuditLogs(mockLogs);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAuditLogs();
  }, []);

  /**
   * Get action icon
   */
  const getActionIcon = (action: string) => {
    switch (action) {
      case "LOGIN":
      case "LOGOUT":
        return <User className="h-4 w-4" />;
      case "CREATE_USER":
      case "UPDATE_USER":
      case "DELETE_USER":
        return <User className="h-4 w-4" />;
      case "ACCESS_RESOURCE":
        return <FileText className="h-4 w-4" />;
      case "SECURITY_EVENT":
        return <Shield className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  /**
   * Get action badge
   */
  const getActionBadge = (action: string) => {
    const colors = {
      LOGIN: "secondary",
      LOGOUT: "outline",
      CREATE_USER: "default",
      UPDATE_USER: "default",
      DELETE_USER: "destructive",
      ACCESS_RESOURCE: "secondary",
      SECURITY_EVENT: "destructive",
    };
    return <Badge variant={colors[action as keyof typeof colors] as any}>{action}</Badge>;
  };

  /**
   * Get success badge
   */
  const getSuccessBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "secondary" : "destructive"}>
        {success ? (
          <>
            <CheckCircle className="h-3 w-3 mr-1" />
            Thành công
          </>
        ) : (
          <>
            <AlertTriangle className="h-3 w-3 mr-1" />
            Thất bại
          </>
        )}
      </Badge>
    );
  };

  /**
   * Format time ago
   */
  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} phút trước`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)} giờ trước`;
    } else {
      return date.toLocaleDateString("vi-VN");
    }
  };

  /**
   * Export audit report
   */
  const handleExportReport = async () => {
    try {
      // This would typically generate and download a report
      alert("Tính năng xuất báo cáo đang được phát triển");
    } catch (error) {
      console.error("Failed to export report:", error);
      alert("Xuất báo cáo thất bại. Vui lòng thử lại.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải dữ liệu audit logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Trail</h1>
          <p className="text-muted-foreground">
            Theo dõi và phân tích tất cả hoạt động trong hệ thống
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={fetchAuditLogs} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Audit Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logs hôm nay</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLogsToday.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Tổng hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hành động thất bại</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.failedActionsToday}</div>
            <p className="text-xs text-muted-foreground">Cần kiểm tra</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ thành công</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.successRate}%</div>
            <p className="text-xs text-muted-foreground">Hiệu suất hệ thống</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hành động phổ biến</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.mostCommonAction}</div>
            <p className="text-xs text-muted-foreground">Được thực hiện nhiều nhất</p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>Danh sách chi tiết tất cả hoạt động trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo hành động, tài nguyên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Hành động" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả hành động</SelectItem>
                <SelectItem value="LOGIN">Đăng nhập</SelectItem>
                <SelectItem value="LOGOUT">Đăng xuất</SelectItem>
                <SelectItem value="CREATE_USER">Tạo user</SelectItem>
                <SelectItem value="UPDATE_USER">Cập nhật user</SelectItem>
                <SelectItem value="ACCESS_RESOURCE">Truy cập tài nguyên</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterResource} onValueChange={setFilterResource}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tài nguyên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tài nguyên</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="COURSE">Khóa học</SelectItem>
                <SelectItem value="VIDEO">Video</SelectItem>
                <SelectItem value="EXAM">Bài thi</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSuccess} onValueChange={setFilterSuccess}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="success">Thành công</SelectItem>
                <SelectItem value="failed">Thất bại</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Hành động</TableHead>
                <TableHead>Tài nguyên</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.userName || log.userEmail || "System"}</div>
                      {log.userEmail && (
                        <div className="text-sm text-muted-foreground">{log.userEmail}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getActionIcon(log.action)}
                      {getActionBadge(log.action)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {log.resource && <div className="text-sm font-medium">{log.resource}</div>}
                      {log.resourceId && (
                        <div className="text-xs text-muted-foreground">{log.resourceId}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{log.ipAddress}</div>
                      {log.userAgent && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {log.userAgent}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{formatTimeAgo(log.createdAt)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getSuccessBadge(log.success)}
                    {!log.success && log.errorMessage && (
                      <div className="text-xs text-destructive mt-1">{log.errorMessage}</div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {auditLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy audit logs nào phù hợp với bộ lọc
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
