/**
 * Priority Management Component
 * Component quản lý priority levels cho notification system
 *
 * Features:
 * - Priority-based notification filtering
 * - Priority escalation management
 * - Priority statistics dashboard
 * - Bulk priority operations
 * - Priority review queue
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/layout/card";
import { Button } from "../../ui/forms/button";
import { Badge } from "../../ui/data-display/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/forms/select";
import {
  TrendingUp,
  AlertTriangle,
  ArrowUp,
  Clock,
  Filter,
  BarChart3,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Users,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Priority levels với colors và descriptions
 */
const PRIORITY_LEVELS = [
  {
    value: "LOW",
    label: "Thấp",
    color: "bg-gray-100 text-gray-800 border-gray-300",
    description: "Thông báo thông thường, không cấp bách",
  },
  {
    value: "NORMAL",
    label: "Bình thường",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    description: "Thông báo quan trọng, cần chú ý",
  },
  {
    value: "HIGH",
    label: "Cao",
    color: "bg-orange-100 text-orange-800 border-orange-300",
    description: "Thông báo ưu tiên cao, cần xử lý sớm",
  },
  {
    value: "CRITICAL",
    label: "Nghiêm trọng",
    color: "bg-red-100 text-red-800 border-red-300",
    description: "Thông báo khẩn cấp, cần xử lý ngay lập tức",
  },
];

/**
 * Mock priority statistics data
 */
const mockPriorityStats = {
  period: "week",
  totalNotifications: 1234,
  priorityDistribution: {
    LOW: 456,
    NORMAL: 567,
    HIGH: 156,
    CRITICAL: 55,
  },
  criticalPercentage: "4.5",
  trends: {
    LOW: "+12%",
    NORMAL: "+8%",
    HIGH: "+25%",
    CRITICAL: "+45%",
  },
};

/**
 * Mock notifications requiring review
 */
const mockReviewQueue = [
  {
    id: "1",
    title: "Đăng nhập thất bại nhiều lần",
    message: "User student@nynus.com có 5 lần đăng nhập thất bại",
    priority: "HIGH",
    user: { email: "student@nynus.com", name: "Nguyễn Văn A" },
    createdAt: new Date("2025-07-25T10:30:00Z"),
    hoursOld: 26,
    isRead: false,
  },
  {
    id: "2",
    title: "Hiệu suất hệ thống giảm",
    message: "Response time trung bình tăng lên 2.5s",
    priority: "NORMAL",
    user: { email: "system@nynus.com", name: "System Monitor" },
    createdAt: new Date("2025-07-25T08:15:00Z"),
    hoursOld: 28,
    isRead: false,
  },
];

/**
 * Priority Management Component
 */
export function PriorityManagement() {
  const [priorityStats, setPriorityStats] = useState(mockPriorityStats);
  const [reviewQueue, setReviewQueue] = useState(mockReviewQueue);
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Load priority statistics
   */
  const loadPriorityStats = async (period: string) => {
    setLoading(true);
    try {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPriorityStats({ ...mockPriorityStats, period });
    } catch (error) {
      toast.error("Lỗi khi tải thống kê priority");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Escalate notification priority
   */
  const escalateNotification = async (notificationId: string) => {
    setLoading(true);
    try {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setReviewQueue((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                priority: getNextPriority(notification.priority),
              }
            : notification
        )
      );

      toast.success("Escalate priority thành công");
    } catch (error) {
      toast.error("Lỗi khi escalate priority");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Bulk update priorities
   */
  const bulkUpdatePriorities = async (priority: string) => {
    if (selectedNotifications.length === 0) {
      toast.error("Vui lòng chọn ít nhất một notification");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setReviewQueue((prev) =>
        prev.map((notification) =>
          selectedNotifications.includes(notification.id)
            ? { ...notification, priority }
            : notification
        )
      );

      setSelectedNotifications([]);
      toast.success(`Cập nhật priority cho ${selectedNotifications.length} notifications`);
    } catch (error) {
      toast.error("Lỗi khi cập nhật priority");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get next priority level for escalation
   */
  const getNextPriority = (currentPriority: string): string => {
    switch (currentPriority) {
      case "LOW":
        return "NORMAL";
      case "NORMAL":
        return "HIGH";
      case "HIGH":
        return "CRITICAL";
      case "CRITICAL":
        return "CRITICAL";
      default:
        return "NORMAL";
    }
  };

  /**
   * Get priority badge
   */
  const getPriorityBadge = (priority: string) => {
    const level = PRIORITY_LEVELS.find((p) => p.value === priority);
    return (
      <Badge className={level?.color || "bg-gray-100 text-gray-800"}>
        {level?.label || priority}
      </Badge>
    );
  };

  /**
   * Get trend indicator
   */
  const getTrendIndicator = (trend: string) => {
    const isPositive = trend.startsWith("+");
    const color = isPositive ? "text-red-600" : "text-green-600"; // Red for increase in notifications
    const Icon = isPositive ? TrendingUp : TrendingUp;

    return (
      <div className={`flex items-center space-x-1 ${color}`}>
        <Icon className="h-3 w-3" />
        <span className="text-xs font-medium">{trend}</span>
      </div>
    );
  };

  /**
   * Filter review queue by priority
   */
  const filteredReviewQueue =
    selectedPriority === "all"
      ? reviewQueue
      : reviewQueue.filter((notification) => notification.priority === selectedPriority);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select
            value={selectedPeriod}
            onValueChange={(period) => {
              setSelectedPeriod(period);
              loadPriorityStats(period);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Chọn khoảng thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">24 giờ qua</SelectItem>
              <SelectItem value="week">7 ngày qua</SelectItem>
              <SelectItem value="month">30 ngày qua</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => loadPriorityStats(selectedPeriod)}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Priority Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {PRIORITY_LEVELS.map((level) => {
          const count =
            priorityStats.priorityDistribution[
              level.value as keyof typeof priorityStats.priorityDistribution
            ];
          const percentage = ((count / priorityStats.totalNotifications) * 100).toFixed(1);
          const trend = priorityStats.trends[level.value as keyof typeof priorityStats.trends];

          return (
            <Card key={level.value}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{level.label}</CardTitle>
                <div className={`w-3 h-3 rounded-full ${level.color.split(" ")[0]}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count.toLocaleString()}</div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{percentage}% tổng số</p>
                  {getTrendIndicator(trend)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Priority Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Phân bố Priority</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {PRIORITY_LEVELS.map((level) => {
              const count =
                priorityStats.priorityDistribution[
                  level.value as keyof typeof priorityStats.priorityDistribution
                ];
              const percentage = ((count / priorityStats.totalNotifications) * 100).toFixed(1);

              return (
                <div key={level.value} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${level.color.split(" ")[0]}`} />
                      <span className="font-medium">{level.label}</span>
                      <span className="text-sm text-muted-foreground">({level.description})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{percentage}%</span>
                      <Badge variant="outline">{count.toLocaleString()}</Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${level.color.split(" ")[0]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Review Queue */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Queue cần review priority</span>
            </CardTitle>

            <div className="flex items-center space-x-2">
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Lọc theo priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {PRIORITY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Badge variant="outline">{filteredReviewQueue.length} notifications</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-blue-100">
                  {selectedNotifications.length} được chọn
                </Badge>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Cập nhật priority:</span>
                  {PRIORITY_LEVELS.map((level) => (
                    <Button
                      key={level.value}
                      variant="outline"
                      size="sm"
                      onClick={() => bulkUpdatePriorities(level.value)}
                      disabled={loading}
                      className="text-xs"
                    >
                      {level.label}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setSelectedNotifications([])}>
                    Hủy
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredReviewQueue.map((notification) => (
              <div key={notification.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedNotifications((prev) => [...prev, notification.id]);
                        } else {
                          setSelectedNotifications((prev) =>
                            prev.filter((id) => id !== notification.id)
                          );
                        }
                      }}
                      className="mt-1 rounded"
                    />

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{notification.title}</h4>
                        {getPriorityBadge(notification.priority)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>User: {notification.user.name}</span>
                        <span>Email: {notification.user.email}</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{notification.hoursOld}h ago</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => escalateNotification(notification.id)}
                      disabled={loading || notification.priority === "CRITICAL"}
                      className="flex items-center space-x-1"
                    >
                      <ArrowUp className="h-3 w-3" />
                      <span>Escalate</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredReviewQueue.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Không có notification nào cần review</h3>
              <p className="text-muted-foreground">
                Tất cả notifications đều được xử lý đúng priority
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
