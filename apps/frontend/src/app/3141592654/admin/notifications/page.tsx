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
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/form/label";
import { Textarea } from "@/components/ui/form/textarea";

import {
  Bell,
  Send,
  Users,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Search,

  RefreshCw,
  Plus,
  TrendingUp,
  Settings,
  BarChart3,
  Zap,
  UserCog,
  Target,
} from "lucide-react";

// Import mockdata
import {
  mockSystemNotifications,
  mockNotificationStats,
  type SystemNotification,
  type NotificationStats,
} from "@/lib/mockdata/notifications";

/**
 * Notification Management Page
 * Trang quản lý thông báo cho Admin
 */
export default function NotificationManagementPage() {
  // State management cho notifications và statistics
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isBroadcastDialogOpen, setIsBroadcastDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Broadcast form state cho gửi thông báo hàng loạt
  const [broadcastForm, setBroadcastForm] = useState({
    type: "SYSTEM_MESSAGE",
    title: "",
    message: "",
    targetAudience: "all",
    targetRole: "",
    expiresAt: "",
  });

  /**
   * Fetch notifications data từ mockdata
   * Thay thế API calls bằng mockdata trong quá trình migration
   */
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Use mockdata instead of API calls
      setNotifications(mockSystemNotifications);
      setStats(mockNotificationStats);
    } catch (error) {
      console.error("Failed to fetch notifications data:", error);
      
      // Fallback to mockdata
      setNotifications(mockSystemNotifications);
      setStats(mockNotificationStats);
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
   * Lấy icon cho từng loại notification
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
   * Lấy badge màu cho từng loại notification
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
    return <Badge variant={colors[type as keyof typeof colors] as "destructive" | "default" | "secondary" | "outline"}>{type}</Badge>;
  };

  /**
   * Format time ago
   * Format thời gian hiển thị dạng "x phút trước"
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
   * Xử lý gửi thông báo hàng loạt
   */
  const handleBroadcast = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful broadcast
      const sentCount = broadcastForm.targetAudience === "all" ? 150 : 75;
      alert(`Đã gửi thông báo thành công cho ${sentCount} người dùng`);

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

  // Filter notifications based on search and filters
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch = searchTerm === "" ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.userName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || notification.type === filterType;
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "read" && notification.isRead) ||
      (filterStatus === "unread" && !notification.isRead);

    return matchesSearch && matchesType && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải dữ liệu thông báo...</span>
      </div>
    );
  }

  // Tab configuration cho navigation
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
                    {filteredNotifications.map((notification) => (
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

                {filteredNotifications.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Không tìm thấy thông báo nào phù hợp với bộ lọc
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Placeholder tabs for other features */}
        {activeTab === "history" && (
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử Thông báo</CardTitle>
              <CardDescription>Chi tiết lịch sử gửi thông báo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Tính năng lịch sử thông báo sẽ được phát triển trong phiên bản tiếp theo
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "statistics" && (
          <Card>
            <CardHeader>
              <CardTitle>Thống kê Thông báo</CardTitle>
              <CardDescription>Phân tích hiệu quả thông báo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Dashboard thống kê sẽ được phát triển trong phiên bản tiếp theo
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "triggers" && (
          <Card>
            <CardHeader>
              <CardTitle>Triggers Tự động</CardTitle>
              <CardDescription>Cấu hình trigger gửi thông báo tự động</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Tính năng triggers sẽ được phát triển trong phiên bản tiếp theo
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "preferences" && (
          <Card>
            <CardHeader>
              <CardTitle>Preferences Người dùng</CardTitle>
              <CardDescription>Quản lý preferences thông báo của người dùng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Tính năng preferences sẽ được phát triển trong phiên bản tiếp theo
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "priority" && (
          <Card>
            <CardHeader>
              <CardTitle>Priority Management</CardTitle>
              <CardDescription>Quản lý mức độ ưu tiên thông báo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Tính năng priority management sẽ được phát triển trong phiên bản tiếp theo
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "settings" && (
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt Thông báo</CardTitle>
              <CardDescription>Cài đặt âm thanh và hiển thị thông báo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Tính năng cài đặt sẽ được phát triển trong phiên bản tiếp theo
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
