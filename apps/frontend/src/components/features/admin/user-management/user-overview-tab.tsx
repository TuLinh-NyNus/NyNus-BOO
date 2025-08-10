/**
 * User Overview Tab Component
 * Component tab tổng quan user với profile và statistics
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Badge } from "@/components/ui/display/badge";
import { Button } from "@/components/ui/form/button";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/form/select";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Activity,
  TrendingUp,
  Clock,
  MapPin,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

import { UserRole } from "@/lib/mockdata/core-types";

/**
 * Admin User interface (simplified)
 */
interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  status: string;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
  activeSessionsCount: number;
  totalResourceAccess: number;
  riskScore?: number;
  permissions?: string[];
  isActive?: boolean;
  maxConcurrentSessions?: number;
  lastLoginIp?: string;
  loginAttempts?: number;
  lockedUntil?: Date;
}

/**
 * User Overview Tab Props
 */
interface UserOverviewTabProps {
  user: AdminUser;
  isEditing?: boolean;
  onUpdate?: (updatedUser: AdminUser) => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * User role labels mapping
 */
const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.GUEST]: "Khách",
  [UserRole.STUDENT]: "Học viên",
  [UserRole.TUTOR]: "Trợ giảng",
  [UserRole.TEACHER]: "Giảng viên",
  [UserRole.ADMIN]: "Quản trị viên",
};

/**
 * User status labels mapping
 */
const USER_STATUS_LABELS: Record<string, string> = {
  'ACTIVE': "Hoạt động",
  'SUSPENDED': "Tạm khóa",
  'PENDING_VERIFICATION': "Chờ xác thực",
};

/**
 * Format date for display
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
 * User Overview Tab Component
 */
export function UserOverviewTab({
  user,
  isEditing = false,
  onUpdate,
  isLoading = false,
  className = "",
}: UserOverviewTabProps) {
  // State for editing
  const [editedUser, setEditedUser] = useState<AdminUser>(user);

  /**
   * Handle field change
   */
  const handleFieldChange = (field: keyof AdminUser, value: string | number | boolean) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Handle save changes
   */
  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editedUser);
    }
  };

  /**
   * Handle cancel editing
   */
  const handleCancel = () => {
    setEditedUser(user);
  };

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
            <div className="space-y-2">
              <Label>Họ</Label>
              {isEditing ? (
                <Input
                  value={editedUser.firstName || ""}
                  onChange={(e) => handleFieldChange("firstName", e.target.value)}
                  placeholder="Nhập họ..."
                />
              ) : (
                <div className="p-2 border rounded bg-muted/25">
                  {user.firstName || "Chưa có thông tin"}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tên</Label>
              {isEditing ? (
                <Input
                  value={editedUser.lastName || ""}
                  onChange={(e) => handleFieldChange("lastName", e.target.value)}
                  placeholder="Nhập tên..."
                />
              ) : (
                <div className="p-2 border rounded bg-muted/25">
                  {user.lastName || "Chưa có thông tin"}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="p-2 border rounded bg-muted/25 flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {user.email}
                {user.emailVerified && <CheckCircle className="h-4 w-4 text-green-500" />}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
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
                <div className="p-2 border rounded bg-muted/25">
                  <Badge variant="outline">{USER_ROLE_LABELS[user.role]}</Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Trạng thái</Label>
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
                <div className="p-2 border rounded bg-muted/25">
                  <Badge variant="outline">{USER_STATUS_LABELS[user.status] || user.status}</Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Max Concurrent Sessions</Label>
              {isEditing ? (
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={editedUser.maxConcurrentSessions || 3}
                  onChange={(e) => handleFieldChange("maxConcurrentSessions", parseInt(e.target.value))}
                />
              ) : (
                <div className="p-2 border rounded bg-muted/25">
                  {user.maxConcurrentSessions || 3} sessions
                </div>
              )}
            </div>
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex items-center gap-2 pt-4 border-t">
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Lưu thay đổi
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                <X className="h-4 w-4 mr-2" />
                Hủy
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Thông tin tài khoản
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Ngày tạo
              </Label>
              <div className="p-2 border rounded bg-muted/25">
                {formatDate(user.createdAt)}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Cập nhật cuối
              </Label>
              <div className="p-2 border rounded bg-muted/25">
                {formatDate(user.updatedAt)}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Đăng nhập cuối
              </Label>
              <div className="p-2 border rounded bg-muted/25">
                {formatDate(user.lastLoginAt)}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                IP đăng nhập cuối
              </Label>
              <div className="p-2 border rounded bg-muted/25">
                {user.lastLoginIp || "Chưa có thông tin"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Thống kê hoạt động
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-blue-600">{user.activeSessionsCount}</div>
              <div className="text-sm text-muted-foreground">Active Sessions</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-green-600">{user.totalResourceAccess}</div>
              <div className="text-sm text-muted-foreground">Resource Access</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-orange-600">{user.riskScore || 0}</div>
              <div className="text-sm text-muted-foreground">Risk Score</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-purple-600">{user.loginAttempts || 0}</div>
              <div className="text-sm text-muted-foreground">Login Attempts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      {user.permissions && user.permissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Quyền hạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.permissions.map((permission, index) => (
                <Badge key={index} variant="outline">
                  {permission}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Warnings */}
      {(user.status === 'SUSPENDED' || user.lockedUntil) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Cảnh báo tài khoản
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.status === 'SUSPENDED' && (
              <div className="text-red-600">
                Tài khoản đã bị tạm khóa. Liên hệ admin để được hỗ trợ.
              </div>
            )}
            {user.lockedUntil && (
              <div className="text-red-600">
                Tài khoản bị khóa đến: {formatDate(user.lockedUntil.toISOString())}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
