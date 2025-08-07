/**
 * User Security Tab Component
 * Component tab bảo mật user với security metrics và edit capabilities
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
  Alert,
  AlertDescription,
} from "@/components/ui";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Key,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Mail,
  Smartphone,
  Clock,
  MapPin,
} from "lucide-react";

import { AdminUser } from "../../types/admin-user";

/**
 * User Security Tab Props
 * Props cho User Security Tab component
 */
interface UserSecurityTabProps {
  user: AdminUser;
  isEditing?: boolean;
  onUserUpdate?: (updatedUser: AdminUser) => void;
  className?: string;
}

/**
 * Security event interface
 * Interface cho security event
 */
interface SecurityEvent {
  id: string;
  type: "login" | "failed_login" | "password_change" | "email_change" | "permission_change";
  description: string;
  timestamp: string;
  ipAddress?: string;
  location?: string;
  severity: "low" | "medium" | "high";
}

/**
 * Mock security events
 * Mock security events data
 */
const mockSecurityEvents: SecurityEvent[] = [
  {
    id: "1",
    type: "login",
    description: "Đăng nhập thành công",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    ipAddress: "192.168.1.100",
    location: "Hà Nội, Việt Nam",
    severity: "low",
  },
  {
    id: "2",
    type: "failed_login",
    description: "Đăng nhập thất bại - Sai mật khẩu",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    ipAddress: "192.168.1.105",
    location: "Hồ Chí Minh, Việt Nam",
    severity: "medium",
  },
  {
    id: "3",
    type: "password_change",
    description: "Thay đổi mật khẩu",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    ipAddress: "192.168.1.100",
    location: "Hà Nội, Việt Nam",
    severity: "low",
  },
];

/**
 * Get security score color
 * Lấy màu cho security score
 */
function getSecurityScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

/**
 * Get security score variant
 * Lấy variant cho security score
 */
function getSecurityScoreVariant(score: number) {
  if (score >= 80) return "secondary" as const;
  if (score >= 60) return "default" as const;
  return "destructive" as const;
}

/**
 * Get event severity icon
 * Lấy icon cho event severity
 */
function getEventSeverityIcon(severity: string) {
  switch (severity) {
    case "high":
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    case "medium":
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    default:
      return <CheckCircle className="h-4 w-4 text-green-600" />;
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
  } else {
    return `${Math.floor(diffMinutes / 1440)} ngày trước`;
  }
}

/**
 * User Security Tab Component
 * Component tab bảo mật user
 */
export function UserSecurityTab({
  user,
  isEditing = false,
  onUserUpdate,
  className = "",
}: UserSecurityTabProps) {
  const [editedUser, setEditedUser] = useState<AdminUser>(user);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Calculate security score based on user data
  const securityScore = Math.min(
    100,
    Math.max(
      0,
      (user.emailVerified ? 30 : 0) +
        (user.riskScore ? Math.max(0, 50 - user.riskScore * 5) : 50) +
        (user.activeSessionsCount > 0 ? 10 : 0) +
        (user.lastLoginAt ? 10 : 0)
    )
  );

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

  /**
   * Handle reset password
   * Xử lý reset password
   */
  const handleResetPassword = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Email reset mật khẩu đã được gửi!");
    } catch (error) {
      console.error("Failed to reset password:", error);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Tổng quan bảo mật
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Security Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Điểm bảo mật</Label>
              <Badge variant={getSecurityScoreVariant(securityScore)}>{securityScore}/100</Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  securityScore >= 80
                    ? "bg-green-500"
                    : securityScore >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${securityScore}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {securityScore >= 80
                ? "Bảo mật tốt"
                : securityScore >= 60
                  ? "Bảo mật trung bình"
                  : "Cần cải thiện bảo mật"}
            </p>
          </div>

          {/* Security Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              {user.emailVerified ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">
                Email {user.emailVerified ? "đã xác thực" : "chưa xác thực"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {user.riskScore && user.riskScore > 5 ? (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              ) : (
                <ShieldCheck className="h-4 w-4 text-green-600" />
              )}
              <span className="text-sm">
                Mức độ rủi ro: {user.riskScore ? user.riskScore.toFixed(1) : "0.0"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {user.activeSessionsCount > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-sm">{user.activeSessionsCount} phiên hoạt động</span>
            </div>

            <div className="flex items-center gap-2">
              {user.lastLoginAt ? (
                <Clock className="h-4 w-4 text-blue-600" />
              ) : (
                <Clock className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-sm">
                {user.lastLoginAt ? formatTimeAgo(user.lastLoginAt) : "Chưa đăng nhập"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Cài đặt bảo mật
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email Verification */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Xác thực email</Label>
              <p className="text-sm text-muted-foreground">
                Trạng thái xác thực email của người dùng
              </p>
            </div>
            <Badge variant={user.emailVerified ? "secondary" : "destructive"}>
              {user.emailVerified ? "Đã xác thực" : "Chưa xác thực"}
            </Badge>
          </div>

          <div className="border-t my-4" />

          {/* Account Status */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Trạng thái tài khoản</Label>
              <p className="text-sm text-muted-foreground">Trạng thái hoạt động của tài khoản</p>
            </div>
            <Badge variant={user.status === "ACTIVE" ? "secondary" : "destructive"}>
              {user.status === "ACTIVE"
                ? "Hoạt động"
                : user.status === "SUSPENDED"
                  ? "Tạm ngưng"
                  : "Chờ xác thực"}
            </Badge>
          </div>

          <div className="border-t my-4" />

          {/* Password Reset */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Đặt lại mật khẩu</Label>
              <p className="text-sm text-muted-foreground">
                Gửi email đặt lại mật khẩu cho người dùng
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetPassword}
              disabled={!user.emailVerified}
            >
              <Key className="h-3 w-3 mr-1" />
              Gửi email reset
            </Button>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setEditedUser(user)}>
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Sự kiện bảo mật gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockSecurityEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                {getEventSeverityIcon(event.severity)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{event.description}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(event.timestamp)}
                    </span>
                    {event.ipAddress && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.ipAddress}
                      </span>
                    )}
                    {event.location && <span>{event.location}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      {securityScore < 80 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Khuyến nghị bảo mật:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {!user.emailVerified && <li>Yêu cầu người dùng xác thực email</li>}
              {user.riskScore && user.riskScore > 5 && (
                <li>Kiểm tra hoạt động đáng ngờ của tài khoản</li>
              )}
              {!user.lastLoginAt && <li>Tài khoản chưa từng đăng nhập</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
