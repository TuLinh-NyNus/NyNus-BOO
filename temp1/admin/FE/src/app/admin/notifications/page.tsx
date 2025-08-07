/**
 * Admin Notifications Management Page
 * Trang quản lý notifications cho admin dashboard
 *
 * Features:
 * - Notification history viewer với filtering
 * - Real-time notification statistics
 * - Priority level management
 * - Sound settings configuration
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Textarea,
} from "@/components/ui";
import {
  NotificationHistory,
  NotificationSettings,
  NotificationStatistics,
  NotificationTriggers,
  NotificationPreferences,
  PriorityManagement,
} from "../../../components/admin/notification-management";
import {
  Bell,
  Send,
  Users,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  RefreshCw,
  Plus,
  TrendingUp,
  Settings,
  BarChart3,
  Zap,
  UserCog,
  Target,
} from "lucide-react";

/**
 * Notification Management Page
 * Trang quản lý thông báo cho Admin
 */

interface SystemNotification {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  type:
    | "SECURITY_ALERT"
    | "COURSE_UPDATE"
    | "SYSTEM_MESSAGE"
    | "ACHIEVEMENT"
    | "SOCIAL"
    | "PAYMENT";
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  expiresAt?: string;
}

interface NotificationStats {
  totalSentToday: number;
  totalUnread: number;
  notificationsByType: Record<string, number>;
  readRate: number;
  mostActiveType: string;
  averageReadTime: number;
  sentThisWeek: number;
  growthPercentage: number;
}

export default function NotificationManagementPage() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isBroadcastDialogOpen, setIsBroadcastDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Broadcast form state
  const [broadcastForm, setBroadcastForm] = useState({
    type: "SYSTEM_MESSAGE",
    title: "",
    message: "",
    targetAudience: "all",
    targetRole: "",
    expiresAt: "",
  });

  /**
   * Fetch notifications data từ API
   */
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: "1",
        limit: "50",
        ...(searchTerm && { search: searchTerm }),
        ...(filterType !== "all" && { type: filterType }),
        ...(filterStatus !== "all" && { isRead: filterStatus === "read" ? "true" : "false" }),
      });

      // Fetch real data from admin API
      const [notificationsResponse, statsResponse] = await Promise.all([
        fetch(`/api/admin/notifications?${queryParams}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        fetch("/api/admin/notifications/stats", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ]);

      if (!notificationsResponse.ok || !statsResponse.ok) {
        throw new Error("Failed to fetch notifications data");
      }

      const notificationsData = await notificationsResponse.json();
      const statsData = await statsResponse.json();

      setNotifications(notificationsData.notifications);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch notifications data:", error);

      // Fallback to mock data for development
      const mockStats: NotificationStats = {
        totalSentToday: 156,
        totalUnread: 89,
        notificationsByType: {
          SYSTEM_MESSAGE: 45,
          SECURITY_ALERT: 23,
          COURSE_UPDATE: 34,
          ACHIEVEMENT: 12,
          SOCIAL: 8,
          PAYMENT: 5,
        },
        readRate: 78,
        mostActiveType: "SYSTEM_MESSAGE",
        averageReadTime: 2.5,
        sentThisWeek: 567,
        growthPercentage: 12,
      };

      const mockNotifications: SystemNotification[] = [
        {
          id: "1",
          userId: "user1",
          userEmail: "john.doe@example.com",
          userName: "John Doe",
          type: "SYSTEM_MESSAGE",
          title: "Bảo trì hệ thống",
          message: "Hệ thống sẽ được bảo trì vào 2h sáng ngày mai",
          isRead: false,
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          userId: "user2",
          userEmail: "jane.smith@example.com",
          userName: "Jane Smith",
          type: "SECURITY_ALERT",
          title: "Đăng nhập từ thiết bị mới",
          message: "Tài khoản của bạn đã được đăng nhập từ thiết bị mới",
          isRead: true,
          readAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
      ];

      setStats(mockStats);
      setNotifications(mockNotifications);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  /**
   * Get notification type icon
   */
  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case "SECURITY_ALERT":
        return <AlertCircle className="h-4 w-4" />;
      case "COURSE_UPDATE":
        return <MessageSquare className="h-4 w-4" />;
      case "SYSTEM_MESSAGE":
        return <Bell className="h-4 w-4" />;
      case "ACHIEVEMENT":
        return <CheckCircle className="h-4 w-4" />;
      case "SOCIAL":
        return <Users className="h-4 w-4" />;
      case "PAYMENT":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  /**
   * Get notification type badge
   */
  const getTypeBadge = (type: string) => {
    const colors = {
      SECURITY_ALERT: "destructive",
      COURSE_UPDATE: "default",
      SYSTEM_MESSAGE: "secondary",
      ACHIEVEMENT: "outline",
      SOCIAL: "secondary",
      PAYMENT: "default",
    };
    return <Badge variant={colors[type as keyof typeof colors] as any}>{type}</Badge>;
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
   * Handle broadcast notification
   */
  const handleBroadcast = async () => {
    try {
      const response = await fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...broadcastForm,
          ...(broadcastForm.expiresAt && {
            expiresAt: new Date(broadcastForm.expiresAt).toISOString(),
          }),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to broadcast notification");
      }

      const result = await response.json();
      alert(`Đã gửi thông báo thành công cho ${result.sentCount} người dùng`);

      // Reset form and close dialog
      setBroadcastForm({
        type: "SYSTEM_MESSAGE",
        title: "",
        message: "",
        targetAudience: "all",
        targetRole: "",
        expiresAt: "",
      });
      setIsBroadcastDialogOpen(false);

      // Refresh data
      fetchNotifications();
    } catch (error) {
      console.error("Failed to broadcast notification:", error);
      alert("Gửi thông báo thất bại. Vui lòng thử lại.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải dữ liệu thông báo...</span>
      </div>
    );
  }

  // Tab configuration
  const tabs = [
    { id: "overview", label: "Tổng quan", icon: Bell, description: "Dashboard và thống kê" },
    { id: "history", label: "Lịch sử", icon: Search, description: "Lịch sử thông báo" },
    { id: "statistics", label: "Thống kê", icon: BarChart3, description: "Phân tích và báo cáo" },
    { id: "triggers", label: "Triggers", icon: Zap, description: "Cấu hình trigger tự động" },
    {
      id: "preferences",
      label: "Preferences",
      icon: UserCog,
      description: "Quản lý preferences người dùng",
    },
    { id: "priority", label: "Priority", icon: Target, description: "Quản lý priority levels" },
    {
      id: "settings",
      label: "Cài đặt",
      icon: Settings,
      description: "Cài đặt âm thanh và thông báo",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Thông báo</h1>
          <p className="text-muted-foreground">Quản lý và gửi thông báo hệ thống cho người dùng</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={fetchNotifications} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Dialog open={isBroadcastDialogOpen} onOpenChange={setIsBroadcastDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Gửi thông báo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Gửi thông báo hàng loạt</DialogTitle>
                <DialogDescription>
                  Tạo và gửi thông báo cho nhiều người dùng cùng lúc
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type">Loại thông báo</Label>
                  <Select
                    value={broadcastForm.type}
                    onValueChange={(value) =>
                      setBroadcastForm((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SYSTEM_MESSAGE">Thông báo hệ thống</SelectItem>
                      <SelectItem value="COURSE_UPDATE">Cập nhật khóa học</SelectItem>
                      <SelectItem value="SECURITY_ALERT">Cảnh báo bảo mật</SelectItem>
                      <SelectItem value="ACHIEVEMENT">Thành tích</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="title">Tiêu đề</Label>
                  <Input
                    id="title"
                    value={broadcastForm.title}
                    onChange={(e) =>
                      setBroadcastForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Nhập tiêu đề thông báo..."
                  />
                </div>
                <div>
                  <Label htmlFor="message">Nội dung</Label>
                  <Textarea
                    id="message"
                    value={broadcastForm.message}
                    onChange={(e) =>
                      setBroadcastForm((prev) => ({ ...prev, message: e.target.value }))
                    }
                    placeholder="Nhập nội dung thông báo..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="audience">Đối tượng</Label>
                  <Select
                    value={broadcastForm.targetAudience}
                    onValueChange={(value) =>
                      setBroadcastForm((prev) => ({ ...prev, targetAudience: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả người dùng</SelectItem>
                      <SelectItem value="role">Theo vai trò</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {broadcastForm.targetAudience === "role" && (
                  <div>
                    <Label htmlFor="role">Vai trò</Label>
                    <Select
                      value={broadcastForm.targetRole}
                      onValueChange={(value) =>
                        setBroadcastForm((prev) => ({ ...prev, targetRole: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STUDENT">Học viên</SelectItem>
                        <SelectItem value="TEACHER">Giáo viên</SelectItem>
                        <SelectItem value="TUTOR">Gia sư</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBroadcastDialogOpen(false)}>
                  Hủy
                </Button>
                <Button
                  onClick={handleBroadcast}
                  disabled={!broadcastForm.title || !broadcastForm.message}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Gửi thông báo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Notification Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gửi hôm nay</CardTitle>
                  <Send className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalSentToday}</div>
                  <p className="text-xs text-muted-foreground">{stats?.sentThisWeek} tuần này</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Chưa đọc</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUnread}</div>
                  <p className="text-xs text-muted-foreground">Cần chú ý</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tỷ lệ đọc</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.readRate}%</div>
                  <p className="text-xs text-muted-foreground">Hiệu quả thông báo</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tăng trưởng</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{stats?.growthPercentage}%</div>
                  <p className="text-xs text-muted-foreground">So với tuần trước</p>
                </CardContent>
              </Card>
            </div>

            {/* Notifications Table */}
            <Card>
              <CardHeader>
                <CardTitle>Danh sách Thông báo</CardTitle>
                <CardDescription>Quản lý tất cả thông báo hệ thống đã gửi</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm kiếm theo tiêu đề, nội dung hoặc email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Loại thông báo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả loại</SelectItem>
                      <SelectItem value="SYSTEM_MESSAGE">Hệ thống</SelectItem>
                      <SelectItem value="SECURITY_ALERT">Bảo mật</SelectItem>
                      <SelectItem value="COURSE_UPDATE">Khóa học</SelectItem>
                      <SelectItem value="ACHIEVEMENT">Thành tích</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="read">Đã đọc</SelectItem>
                      <SelectItem value="unread">Chưa đọc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Người nhận</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{notification.userName}</div>
                            <div className="text-sm text-muted-foreground">
                              {notification.userEmail}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getNotificationTypeIcon(notification.type)}
                            {getTypeBadge(notification.type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{notification.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {notification.message}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatTimeAgo(notification.createdAt)}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={notification.isRead ? "secondary" : "default"}>
                            {notification.isRead ? "Đã đọc" : "Chưa đọc"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {notifications.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Không tìm thấy thông báo nào phù hợp với bộ lọc
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "history" && <NotificationHistory />}
        {activeTab === "statistics" && <NotificationStatistics />}
        {activeTab === "triggers" && <NotificationTriggers />}
        {activeTab === "preferences" && <NotificationPreferences />}
        {activeTab === "priority" && <PriorityManagement />}
        {activeTab === "settings" && <NotificationSettings />}
      </div>
    </div>
  );
}
