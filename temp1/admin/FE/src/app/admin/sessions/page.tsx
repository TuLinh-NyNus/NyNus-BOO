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
  Users,
  Monitor,
  Clock,
  MapPin,
  Smartphone,
  Laptop,
  Tablet,
  RefreshCw,
  Search,
  Filter,
  X,
  AlertCircle,
} from "lucide-react";

/**
 * Session Management Page
 * Trang quản lý sessions cho Admin
 */

interface UserSession {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  deviceType: "DESKTOP" | "MOBILE" | "TABLET";
  deviceName: string;
  browser: string;
  ipAddress: string;
  location: string;
  isActive: boolean;
  lastActivity: string;
  createdAt: string;
  riskScore: number;
  deviceFingerprint: string;
}

interface SessionStats {
  totalActiveSessions: number;
  totalUsers: number;
  averageSessionDuration: number;
  suspiciousSessions: number;
  mobilePercentage: number;
  desktopPercentage: number;
}

export default function SessionManagementPage() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "suspicious">("all");
  const [filterDevice, setFilterDevice] = useState<"all" | "DESKTOP" | "MOBILE" | "TABLET">("all");

  /**
   * Fetch sessions data từ API
   */
  const fetchSessions = async () => {
    try {
      setIsLoading(true);

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: "1",
        limit: "50",
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== "all" && { isActive: filterStatus === "active" ? "true" : "false" }),
        ...(filterDevice !== "all" && { deviceType: filterDevice }),
      });

      // Fetch real data from admin API
      const [sessionsResponse, statsResponse] = await Promise.all([
        fetch(`/api/admin/sessions?${queryParams}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        fetch("/api/admin/sessions/stats", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ]);

      if (!sessionsResponse.ok || !statsResponse.ok) {
        throw new Error("Failed to fetch sessions data");
      }

      const sessionsData = await sessionsResponse.json();
      const statsData = await statsResponse.json();

      // Map stats data to component format
      const mappedStats: SessionStats = {
        totalActiveSessions: statsData.totalActiveSessions,
        totalUsers: statsData.totalActiveUsers,
        averageSessionDuration: statsData.averageSessionDuration,
        suspiciousSessions: statsData.suspiciousSessions,
        mobilePercentage: Math.round(
          ((statsData.sessionsByDevice?.Mobile || 0) / statsData.totalActiveSessions) * 100
        ),
        desktopPercentage: Math.round(
          ((statsData.sessionsByDevice?.Desktop || 0) / statsData.totalActiveSessions) * 100
        ),
      };

      // Map sessions data to component format
      const mappedSessions: UserSession[] = sessionsData.sessions.map((session: any) => ({
        id: session.id,
        userId: session.userId,
        userEmail: session.userEmail,
        userName: session.userName || "Unknown User",
        deviceType: session.deviceType || "DESKTOP",
        deviceName: session.userAgent || "Unknown Device",
        browser: session.userAgent?.split(" ")[0] || "Unknown Browser",
        ipAddress: session.ipAddress,
        location: session.location || "Unknown Location",
        isActive: session.isActive,
        lastActivity: session.lastActivity,
        createdAt: session.createdAt,
        riskScore: session.riskScore || 0,
        deviceFingerprint: session.deviceFingerprint || "",
      }));

      setStats(mappedStats);
      setSessions(mappedSessions);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchSessions();
  }, []);

  /**
   * Filter sessions based on search and filters
   */
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      searchTerm === "" ||
      session.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.ipAddress.includes(searchTerm);

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && session.isActive) ||
      (filterStatus === "suspicious" && session.riskScore > 0.7);

    const matchesDevice = filterDevice === "all" || session.deviceType === filterDevice;

    return matchesSearch && matchesStatus && matchesDevice;
  });

  /**
   * Get device icon
   */
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "DESKTOP":
        return <Laptop className="h-4 w-4" />;
      case "MOBILE":
        return <Smartphone className="h-4 w-4" />;
      case "TABLET":
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  /**
   * Get risk score badge
   */
  const getRiskBadge = (riskScore: number) => {
    if (riskScore >= 0.8) return <Badge variant="destructive">Cao</Badge>;
    if (riskScore >= 0.5) return <Badge variant="default">Trung bình</Badge>;
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

  /**
   * Terminate session
   */
  const terminateSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          reason: "Terminated by admin",
          notes: "Manual termination from admin dashboard",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to terminate session");
      }

      // Update local state
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, isActive: false } : s)));

      // Refresh data to get updated stats
      fetchSessions();
    } catch (error) {
      console.error("Failed to terminate session:", error);
      alert("Failed to terminate session. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải dữ liệu sessions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Sessions</h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý các phiên đăng nhập của người dùng
          </p>
        </div>
        <Button onClick={fetchSessions} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Session Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions đang hoạt động</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalActiveSessions}</div>
            <p className="text-xs text-muted-foreground">{stats?.totalUsers} người dùng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thời gian trung bình</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageSessionDuration}m</div>
            <p className="text-xs text-muted-foreground">Mỗi session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions đáng nghi</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.suspiciousSessions}</div>
            <p className="text-xs text-muted-foreground">Cần kiểm tra</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thiết bị</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.desktopPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              Desktop, {stats?.mobilePercentage}% Mobile
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Sessions</CardTitle>
          <CardDescription>Quản lý tất cả các phiên đăng nhập đang hoạt động</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo email, tên hoặc IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="suspicious">Đáng nghi</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDevice} onValueChange={(value: any) => setFilterDevice(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Thiết bị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="DESKTOP">Desktop</SelectItem>
                <SelectItem value="MOBILE">Mobile</SelectItem>
                <SelectItem value="TABLET">Tablet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sessions Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Thiết bị</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Hoạt động cuối</TableHead>
                <TableHead>Rủi ro</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{session.userName}</div>
                      <div className="text-sm text-muted-foreground">{session.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getDeviceIcon(session.deviceType)}
                      <div>
                        <div className="text-sm">{session.deviceName}</div>
                        <div className="text-xs text-muted-foreground">{session.browser}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{session.ipAddress}</div>
                      <div className="text-xs text-muted-foreground">{session.location}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatTimeAgo(session.lastActivity)}</div>
                  </TableCell>
                  <TableCell>{getRiskBadge(session.riskScore)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => terminateSession(session.id)}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Kết thúc
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSessions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy sessions nào phù hợp với bộ lọc
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
