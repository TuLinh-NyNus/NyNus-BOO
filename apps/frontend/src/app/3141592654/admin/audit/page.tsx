"use client";

import { useState, useEffect, useCallback } from "react";
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
  RefreshCw,
  Download,
  Clock,
} from "lucide-react";

// Import mockdata thay vì API calls
import {
  getAuditLogs,
  getAuditStats,
  type AuditLog,
  type AuditStats
} from "@/lib/mockdata";

/**
 * Audit Trail Page
 * Trang audit trail cho Admin - Chuyển đổi từ temp1/admin/FE
 */

export default function AuditTrailPage() {
  // State management cho audit logs và statistics
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterResource, setFilterResource] = useState<string>("all");
  const [filterSuccess, setFilterSuccess] = useState<string>("all");

  /**
   * Fetch audit logs data từ mockdata
   * Thay thế API calls bằng mockdata functions
   */
  const fetchAuditLogs = useCallback(async () => {
    try {
      setIsLoading(true);

      // Sử dụng mockdata thay vì API calls
      const logsResponse = getAuditLogs({
        page: 1,
        limit: 50,
        search: searchTerm || undefined,
        action: filterAction !== "all" ? filterAction : undefined,
        resource: filterResource !== "all" ? filterResource : undefined,
        success: filterSuccess !== "all" ? filterSuccess : undefined,
      });

      const statsData = getAuditStats();

      setAuditLogs(logsResponse.auditLogs);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch audit logs data:", error);
      
      // Fallback to empty data
      setStats({
        totalLogsToday: 0,
        failedActionsToday: 0,
        mostCommonAction: "N/A",
        mostActiveUser: "N/A",
        successRate: 0,
        actionsByType: {},
        actionsByResource: {},
        recentFailures: []
      });
      setAuditLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filterAction, filterResource, filterSuccess]);

  // Fetch data on component mount và khi filters thay đổi
  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  /**
   * Get action icon
   * Lấy icon cho từng loại action
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
   * Lấy badge màu cho từng loại action
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
    return <Badge variant={colors[action as keyof typeof colors] as "secondary" | "outline" | "default" | "destructive"}>{action}</Badge>;
  };

  /**
   * Get success badge
   * Lấy badge cho trạng thái thành công/thất bại
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
   * Format thời gian thành dạng "x phút trước"
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
   * Xuất báo cáo audit (placeholder)
   */
  const handleExportReport = async () => {
    try {
      // Placeholder cho tính năng xuất báo cáo
      alert("Tính năng xuất báo cáo đang được phát triển");
    } catch (error) {
      console.error("Failed to export report:", error);
      alert("Xuất báo cáo thất bại. Vui lòng thử lại.");
    }
  };

  // Loading state
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
