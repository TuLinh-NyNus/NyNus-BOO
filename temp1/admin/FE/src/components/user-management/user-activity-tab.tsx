/**
 * User Activity Tab Component
 * Component tab hoạt động user với timeline và filtering
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import {
  Activity,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Shield,
  Mail,
  LogIn,
  LogOut,
  Settings,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MapPin,
  Monitor,
} from "lucide-react";

import { AdminUser } from "../../types/admin-user";

/**
 * User Activity Tab Props
 * Props cho User Activity Tab component
 */
interface UserActivityTabProps {
  user: AdminUser;
  className?: string;
}

/**
 * Activity interface
 * Interface cho activity
 */
interface UserActivity {
  id: string;
  type:
    | "login"
    | "logout"
    | "profile_update"
    | "password_change"
    | "email_change"
    | "permission_change"
    | "resource_access"
    | "security_event";
  action: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  resource?: string;
  details?: any;
  severity: "low" | "medium" | "high";
}

/**
 * Mock activity data
 * Mock activity data
 */
const mockActivities: UserActivity[] = [
  {
    id: "1",
    type: "login",
    action: "Đăng nhập",
    description: "Đăng nhập thành công vào hệ thống",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    ipAddress: "192.168.1.100",
    location: "Hà Nội, Việt Nam",
    userAgent: "Chrome 120.0.0.0",
    severity: "low",
  },
  {
    id: "2",
    type: "resource_access",
    action: "Truy cập tài nguyên",
    description: 'Truy cập khóa học "React Advanced"',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    resource: "course/react-advanced",
    severity: "low",
  },
  {
    id: "3",
    type: "profile_update",
    action: "Cập nhật hồ sơ",
    description: "Thay đổi thông tin cá nhân",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    details: { fields: ["firstName", "lastName"] },
    severity: "low",
  },
  {
    id: "4",
    type: "security_event",
    action: "Sự kiện bảo mật",
    description: "Đăng nhập thất bại - Sai mật khẩu",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    ipAddress: "192.168.1.105",
    location: "Hồ Chí Minh, Việt Nam",
    severity: "medium",
  },
  {
    id: "5",
    type: "password_change",
    action: "Đổi mật khẩu",
    description: "Thay đổi mật khẩu tài khoản",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    ipAddress: "192.168.1.100",
    severity: "medium",
  },
  {
    id: "6",
    type: "email_change",
    action: "Đổi email",
    description: "Thay đổi địa chỉ email",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    details: { oldEmail: "old@example.com", newEmail: "new@example.com" },
    severity: "high",
  },
];

/**
 * Activity type labels
 * Labels cho activity types
 */
const ACTIVITY_TYPE_LABELS = {
  login: "Đăng nhập",
  logout: "Đăng xuất",
  profile_update: "Cập nhật hồ sơ",
  password_change: "Đổi mật khẩu",
  email_change: "Đổi email",
  permission_change: "Thay đổi quyền",
  resource_access: "Truy cập tài nguyên",
  security_event: "Sự kiện bảo mật",
};

/**
 * Get activity icon
 * Lấy icon cho activity
 */
function getActivityIcon(type: string) {
  switch (type) {
    case "login":
      return <LogIn className="h-4 w-4 text-green-600" />;
    case "logout":
      return <LogOut className="h-4 w-4 text-gray-600" />;
    case "profile_update":
      return <User className="h-4 w-4 text-blue-600" />;
    case "password_change":
      return <Shield className="h-4 w-4 text-orange-600" />;
    case "email_change":
      return <Mail className="h-4 w-4 text-purple-600" />;
    case "permission_change":
      return <Settings className="h-4 w-4 text-red-600" />;
    case "resource_access":
      return <FileText className="h-4 w-4 text-indigo-600" />;
    case "security_event":
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    default:
      return <Activity className="h-4 w-4 text-gray-600" />;
  }
}

/**
 * Get severity badge
 * Lấy severity badge
 */
function getSeverityBadge(severity: string) {
  switch (severity) {
    case "high":
      return <Badge variant="destructive">Cao</Badge>;
    case "medium":
      return <Badge variant="default">Trung bình</Badge>;
    default:
      return <Badge variant="secondary">Thấp</Badge>;
  }
}

/**
 * Format time ago
 * Format thời gian trước đây
 */
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  } else if (diffMinutes < 1440) {
    return `${Math.floor(diffMinutes / 60)} giờ trước`;
  } else if (diffMinutes < 10080) {
    return `${Math.floor(diffMinutes / 1440)} ngày trước`;
  } else {
    return date.toLocaleDateString("vi-VN");
  }
}

/**
 * Format full date
 * Format ngày đầy đủ
 */
function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * User Activity Tab Component
 * Component tab hoạt động user
 */
export function UserActivityTab({ user, className = "" }: UserActivityTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  /**
   * Filter activities
   * Lọc activities
   */
  const filteredActivities = useMemo(() => {
    return mockActivities.filter((activity) => {
      // Search filter
      if (searchTerm && !activity.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Type filter
      if (filterType !== "all" && activity.type !== filterType) {
        return false;
      }

      // Severity filter
      if (filterSeverity !== "all" && activity.severity !== filterSeverity) {
        return false;
      }

      return true;
    });
  }, [searchTerm, filterType, filterSeverity]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Activity Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc hoạt động
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm hoạt động..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Loại hoạt động</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {Object.entries(ACTIVITY_TYPE_LABELS).map(([type, label]) => (
                    <SelectItem key={type} value={type}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Severity Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Mức độ</label>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="low">Thấp</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="high">Cao</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Lịch sử hoạt động
            <Badge variant="outline">{filteredActivities.length} hoạt động</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || filterType !== "all" || filterSeverity !== "all"
                  ? "Không tìm thấy hoạt động nào phù hợp với bộ lọc"
                  : "Chưa có hoạt động nào được ghi nhận"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity, index) => (
                <div key={activity.id} className="relative">
                  {/* Timeline line */}
                  {index < filteredActivities.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-border" />
                  )}

                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 bg-background border-2 border-border rounded-full flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{activity.action}</h4>
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                          </div>
                          {getSeverityBadge(activity.severity)}
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(activity.timestamp)}
                          </span>

                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatFullDate(activity.timestamp)}
                          </span>

                          {activity.ipAddress && (
                            <span className="flex items-center gap-1">
                              <Monitor className="h-3 w-3" />
                              {activity.ipAddress}
                            </span>
                          )}

                          {activity.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {activity.location}
                            </span>
                          )}

                          {activity.resource && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {activity.resource}
                            </span>
                          )}
                        </div>

                        {/* Additional Details */}
                        {activity.details && (
                          <div className="mt-3 p-2 bg-background rounded border">
                            <p className="text-xs text-muted-foreground">Chi tiết:</p>
                            <pre className="text-xs mt-1 whitespace-pre-wrap">
                              {JSON.stringify(activity.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Tổng hoạt động</p>
                <p className="text-2xl font-bold">{mockActivities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Sự kiện bảo mật</p>
                <p className="text-2xl font-bold">
                  {mockActivities.filter((a) => a.type === "security_event").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <LogIn className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Lần đăng nhập</p>
                <p className="text-2xl font-bold">
                  {mockActivities.filter((a) => a.type === "login").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
