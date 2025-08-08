"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/display/card";
import { Button } from "../../../../components/ui/form/button";
import { Badge } from "../../../../components/ui/display/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/display/table";
import { Input } from "../../../../components/ui/form/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/form/select";
import {
  FileText,
  Video,
  Download,
  Eye,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  Users,
  Activity,
  AlertTriangle,
} from "lucide-react";
import {
  mockResourceAccessLogs,
  mockResourceAccessStats,
  getMockResourceAccessResponse,
  type ResourceAccess,
  type ResourceAccessStats,
} from "../../../../lib/mockdata";

/**
 * Resource Access Logs Page
 * Trang logs truy cập tài nguyên cho Admin
 */
export default function ResourceAccessPage() {
  const [accessLogs, setAccessLogs] = useState<ResourceAccess[]>([]);
  const [stats, setStats] = useState<ResourceAccessStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterResourceType, setFilterResourceType] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");

  /**
   * Fetch resource access data từ mockdata
   */
  const fetchResourceAccess = async () => {
    try {
      setIsLoading(true);

      // Sử dụng mockdata thay vì API calls
      const mockResponse = getMockResourceAccessResponse(1, 50, {
        search: searchTerm,
        resourceType: filterResourceType !== "all" ? filterResourceType : undefined,
        action: filterAction !== "all" ? filterAction : undefined,
      });

      setAccessLogs(mockResponse.data.accessLogs);
      setStats(mockResourceAccessStats);
    } catch (error) {
      console.error("Failed to fetch resource access data:", error);
      
      // Fallback to direct mockdata
      setStats(mockResourceAccessStats);
      setAccessLogs(mockResourceAccessLogs);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchResourceAccess();
  }, []);

  /**
   * Get resource type icon
   */
  const getResourceTypeIcon = (resourceType: string) => {
    switch (resourceType) {
      case "VIDEO":
        return <Video className="h-4 w-4" />;
      case "PDF":
        return <FileText className="h-4 w-4" />;
      case "COURSE":
        return <Activity className="h-4 w-4" />;
      case "LESSON":
        return <Eye className="h-4 w-4" />;
      case "EXAM":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  /**
   * Get action badge
   */
  const getActionBadge = (action: string) => {
    const colors: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      VIEW: "secondary",
      DOWNLOAD: "default",
      STREAM: "outline",
      START_EXAM: "destructive",
    };
    return <Badge variant={colors[action] || "default"}>{action}</Badge>;
  };

  /**
   * Get risk score badge
   */
  const getRiskBadge = (riskScore?: number) => {
    if (!riskScore) return <Badge variant="secondary">Thấp</Badge>;
    if (riskScore >= 80) return <Badge variant="destructive">Cao</Badge>;
    if (riskScore >= 50) return <Badge variant="default">Trung bình</Badge>;
    return <Badge variant="secondary">Thấp</Badge>;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải dữ liệu truy cập tài nguyên...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Logs Truy cập Tài nguyên</h1>
          <p className="text-muted-foreground">
            Theo dõi và phân tích việc truy cập tài nguyên học liệu
          </p>
        </div>
        <Button onClick={fetchResourceAccess} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Resource Access Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Truy cập hôm nay</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAccessToday.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats?.uniqueUsersToday} người dùng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loại tài nguyên phổ biến</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.mostAccessedResourceType}</div>
            <p className="text-xs text-muted-foreground">Được truy cập nhiều nhất</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm rủi ro trung bình</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageRiskScore}</div>
            <p className="text-xs text-muted-foreground">Trên thang điểm 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Truy cập rủi ro cao</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.highRiskAttempts}</div>
            <p className="text-xs text-muted-foreground">Cần kiểm tra</p>
          </CardContent>
        </Card>
      </div>

      {/* Resource Access Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Logs Truy cập Tài nguyên</CardTitle>
          <CardDescription>Danh sách chi tiết các lần truy cập tài nguyên học liệu</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo email, tên hoặc resource ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterResourceType} onValueChange={setFilterResourceType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Loại tài nguyên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="VIDEO">Video</SelectItem>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="COURSE">Khóa học</SelectItem>
                <SelectItem value="LESSON">Bài học</SelectItem>
                <SelectItem value="EXAM">Bài thi</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Hành động" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả hành động</SelectItem>
                <SelectItem value="VIEW">Xem</SelectItem>
                <SelectItem value="DOWNLOAD">Tải xuống</SelectItem>
                <SelectItem value="STREAM">Phát trực tuyến</SelectItem>
                <SelectItem value="START_EXAM">Bắt đầu thi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Tài nguyên</TableHead>
                <TableHead>Hành động</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Rủi ro</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accessLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.userName}</div>
                      <div className="text-sm text-muted-foreground">{log.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getResourceTypeIcon(log.resourceType)}
                      <div>
                        <div className="text-sm font-medium">{log.resourceType}</div>
                        <div className="text-xs text-muted-foreground">{log.resourceId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{log.ipAddress}</div>
                      <div className="text-xs text-muted-foreground">{log.location}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatTimeAgo(log.accessedAt)}</div>
                  </TableCell>
                  <TableCell>{getRiskBadge(log.riskScore)}</TableCell>
                  <TableCell>
                    <Badge variant={log.success ? "secondary" : "destructive"}>
                      {log.success ? "Thành công" : "Thất bại"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {accessLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy logs truy cập nào phù hợp với bộ lọc
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
