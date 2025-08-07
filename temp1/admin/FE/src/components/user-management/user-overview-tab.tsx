/**
 * User Overview Tab Component
 * Component tab tổng quan user với profile và statistics
 */

"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Activity,
  TrendingUp,
  Clock,
  MapPin,
  Phone,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

import { AdminUser, USER_ROLE_LABELS, USER_STATUS_LABELS } from "../../types/admin-user";

/**
 * User Overview Tab Props
 * Props cho User Overview Tab component
 */
interface UserOverviewTabProps {
  user: AdminUser;
  isEditing?: boolean;
  onUserUpdate?: (updatedUser: AdminUser) => void;
  className?: string;
}

/**
 * Format date for display
 * Format date để hiển thị
 */
function formatDate(dateString?: string): string {
  if (!dateString) return "Chưa có thông tin";

  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format time ago
 * Format thời gian trước đây
 */
function formatTimeAgo(dateString?: string): string {
  if (!dateString) return "Chưa đăng nhập";

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
 * Get user level color
 * Lấy màu cho user level
 */
function getUserLevelColor(level?: number): string {
  if (!level) return "text-gray-500";

  if (level >= 8) return "text-purple-600";
  if (level >= 6) return "text-blue-600";
  if (level >= 4) return "text-green-600";
  if (level >= 2) return "text-yellow-600";
  return "text-gray-600";
}

/**
 * Get risk level info
 * Lấy thông tin risk level
 */
function getRiskLevelInfo(riskScore?: number) {
  if (!riskScore) return { level: "Thấp", color: "text-green-600", variant: "secondary" as const };

  if (riskScore >= 7)
    return { level: "Cao", color: "text-red-600", variant: "destructive" as const };
  if (riskScore >= 4)
    return { level: "Trung bình", color: "text-yellow-600", variant: "default" as const };
  return { level: "Thấp", color: "text-green-600", variant: "secondary" as const };
}

/**
 * User Overview Tab Component
 * Component tab tổng quan user
 */
export function UserOverviewTab({
  user,
  isEditing = false,
  onUserUpdate,
  className = "",
}: UserOverviewTabProps) {
  const [editedUser, setEditedUser] = useState<AdminUser>(user);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Handle field change
   * Xử lý thay đổi field
   */
  const handleFieldChange = (field: keyof AdminUser, value: any) => {
    setEditedUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Handle save changes
   * Xử lý lưu thay đổi
   */
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (onUserUpdate) {
        onUserUpdate(editedUser);
      }
    } catch (error) {
      console.error("Failed to update user:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const riskInfo = getRiskLevelInfo(user.riskScore);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Thông tin cơ bản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">Tên</Label>
              {isEditing ? (
                <Input
                  id="firstName"
                  value={editedUser.firstName || ""}
                  onChange={(e) => handleFieldChange("firstName", e.target.value)}
                  placeholder="Nhập tên..."
                />
              ) : (
                <div className="p-2 bg-muted rounded-md">{user.firstName || "Chưa cập nhật"}</div>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Họ</Label>
              {isEditing ? (
                <Input
                  id="lastName"
                  value={editedUser.lastName || ""}
                  onChange={(e) => handleFieldChange("lastName", e.target.value)}
                  placeholder="Nhập họ..."
                />
              ) : (
                <div className="p-2 bg-muted rounded-md">{user.lastName || "Chưa cập nhật"}</div>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-muted rounded-md flex-1">{user.email}</div>
                {user.emailVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                )}
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Vai trò</Label>
              {isEditing ? (
                <Select
                  value={editedUser.role}
                  onValueChange={(value) => handleFieldChange("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(USER_ROLE_LABELS).map(([role, label]) => (
                      <SelectItem key={role} value={role}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 bg-muted rounded-md">
                  <Badge variant="outline">{USER_ROLE_LABELS[user.role]}</Badge>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              {isEditing ? (
                <Select
                  value={editedUser.status}
                  onValueChange={(value) => handleFieldChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(USER_STATUS_LABELS).map(([status, label]) => (
                      <SelectItem key={status} value={status}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 bg-muted rounded-md">
                  <Badge variant="outline">{USER_STATUS_LABELS[user.status]}</Badge>
                </div>
              )}
            </div>

            {/* Level */}
            <div className="space-y-2">
              <Label htmlFor="level">Cấp độ</Label>
              <div className="p-2 bg-muted rounded-md">
                <span className={`font-semibold ${getUserLevelColor(user.level)}`}>
                  Level {user.level || 1}
                </span>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setEditedUser(user)}>
                <X className="h-3 w-3 mr-1" />
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-3 w-3 mr-1" />
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Sessions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Phiên hoạt động</p>
                <p className="text-2xl font-bold">{user.activeSessionsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resource Access */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Lượt truy cập</p>
                <p className="text-2xl font-bold">{user.totalResourceAccess}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Score */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Mức độ rủi ro</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{user.riskScore?.toFixed(1) || "0.0"}</p>
                  <Badge variant={riskInfo.variant} className="text-xs">
                    {riskInfo.level}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Age */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Thành viên từ</p>
                <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Hoạt động gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Đăng nhập cuối:</span>
              <span className="text-sm font-medium">{formatTimeAgo(user.lastLoginAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email xác thực:</span>
              <Badge variant={user.emailVerified ? "secondary" : "destructive"}>
                {user.emailVerified ? "Đã xác thực" : "Chưa xác thực"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tài khoản tạo:</span>
              <span className="text-sm font-medium">{formatDate(user.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
