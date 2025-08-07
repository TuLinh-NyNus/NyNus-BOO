/**
 * Notification History Component
 * Component hiển thị lịch sử notifications với filtering và pagination
 *
 * Features:
 * - Notification history table với sorting
 * - Advanced filtering (type, priority, date range)
 * - Pagination support
 * - Priority level indicators
 * - Real-time updates
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/layout/card";
import { Button } from "../../ui/forms/button";
import { Input } from "../../ui/forms/input";
import { Badge } from "../../ui/data-display/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/data-display/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/forms/select";
import {
  Calendar,
  Filter,
  Search,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Bell,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * Notification priority colors
 */
const PRIORITY_COLORS = {
  LOW: "bg-gray-100 text-gray-800 border-gray-300",
  NORMAL: "bg-blue-100 text-blue-800 border-blue-300",
  HIGH: "bg-orange-100 text-orange-800 border-orange-300",
  CRITICAL: "bg-red-100 text-red-800 border-red-300",
};

/**
 * Notification type icons
 */
const TYPE_ICONS = {
  SECURITY_ALERT: AlertTriangle,
  COURSE_UPDATE: Info,
  SYSTEM_MESSAGE: Bell,
  ACHIEVEMENT: CheckCircle,
  SOCIAL: User,
  PAYMENT: XCircle,
};

/**
 * Mock notification data (sẽ được thay thế bằng API call)
 */
const mockNotifications = [
  {
    id: "1",
    type: "SECURITY_ALERT",
    title: "Đăng nhập từ thiết bị mới",
    message: "Tài khoản được truy cập từ Chrome trên Windows",
    priority: "HIGH",
    user: {
      email: "student@nynus.com",
      firstName: "Nguyễn",
      lastName: "Văn A",
    },
    isRead: false,
    createdAt: new Date("2025-07-26T10:30:00Z"),
  },
  {
    id: "2",
    type: "COURSE_UPDATE",
    title: "Bài học mới có sẵn",
    message: 'Khóa học "React Advanced" có bài học mới',
    priority: "NORMAL",
    user: {
      email: "student2@nynus.com",
      firstName: "Trần",
      lastName: "Thị B",
    },
    isRead: true,
    createdAt: new Date("2025-07-26T09:15:00Z"),
  },
  // Add more mock data...
];

/**
 * Notification History Component
 */
export function NotificationHistory() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filteredNotifications, setFilteredNotifications] = useState(mockNotifications);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  /**
   * Apply filters to notifications
   */
  useEffect(() => {
    let filtered = notifications;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (notification) =>
          notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((notification) => notification.type === typeFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((notification) => notification.priority === priorityFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      const isRead = statusFilter === "read";
      filtered = filtered.filter((notification) => notification.isRead === isRead);
    }

    setFilteredNotifications(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [notifications, searchTerm, typeFilter, priorityFilter, statusFilter]);

  /**
   * Get paginated notifications
   */
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

  /**
   * Refresh notifications data
   */
  const handleRefresh = async () => {
    setLoading(true);
    // TODO: Implement API call to fetch notifications
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  /**
   * Get priority badge component
   */
  const getPriorityBadge = (priority: string) => {
    return (
      <Badge
        variant="outline"
        className={PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS]}
      >
        {priority}
      </Badge>
    );
  };

  /**
   * Get type icon component
   */
  const getTypeIcon = (type: string) => {
    const IconComponent = TYPE_ICONS[type as keyof typeof TYPE_ICONS] || Bell;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tiêu đề, nội dung hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Type Filter */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Loại thông báo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            <SelectItem value="SECURITY_ALERT">Bảo mật</SelectItem>
            <SelectItem value="COURSE_UPDATE">Khóa học</SelectItem>
            <SelectItem value="SYSTEM_MESSAGE">Hệ thống</SelectItem>
            <SelectItem value="ACHIEVEMENT">Thành tích</SelectItem>
            <SelectItem value="SOCIAL">Xã hội</SelectItem>
            <SelectItem value="PAYMENT">Thanh toán</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Mức độ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="LOW">Thấp</SelectItem>
            <SelectItem value="NORMAL">Bình thường</SelectItem>
            <SelectItem value="HIGH">Cao</SelectItem>
            <SelectItem value="CRITICAL">Nghiêm trọng</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="unread">Chưa đọc</SelectItem>
            <SelectItem value="read">Đã đọc</SelectItem>
          </SelectContent>
        </Select>

        {/* Refresh Button */}
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>Làm mới</span>
        </Button>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Hiển thị {paginatedNotifications.length} trong tổng số {filteredNotifications.length}{" "}
          thông báo
        </span>
        <span>
          Trang {currentPage} / {totalPages}
        </span>
      </div>

      {/* Notifications Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loại</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Người dùng</TableHead>
                <TableHead>Mức độ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedNotifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(notification.type)}
                      <span className="text-sm">{notification.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {notification.message}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {notification.user.firstName} {notification.user.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">{notification.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getPriorityBadge(notification.priority)}</TableCell>
                  <TableCell>
                    <Badge variant={notification.isRead ? "secondary" : "default"}>
                      {notification.isRead ? "Đã đọc" : "Chưa đọc"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {format(notification.createdAt, "dd/MM/yyyy HH:mm", { locale: vi })}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Trước
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
