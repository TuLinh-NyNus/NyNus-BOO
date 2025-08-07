/**
 * User Detail Modal Component
 * Component modal chi tiết user với tabbed interface
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Badge,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui";
import {
  User,
  Shield,
  Activity,
  Monitor,
  X,
  Edit,
  Save,
  AlertTriangle,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";

import { AdminUser } from "../../types/admin-user";
import { AdminUserService } from "../../lib/api/services/admin.api";
import { useErrorHandler } from "../../lib/hooks/use-error-handler";
import { UserOverviewTab } from "./user-overview-tab";
import { UserSecurityTab } from "./user-security-tab";
import { UserActivityTab } from "./user-activity-tab";
import { UserSessionsTab } from "./user-sessions-tab";

/**
 * User activity interface
 * Interface hoạt động user
 */
interface UserActivity {
  id: string;
  action: string;
  resource: string;
  timestamp: string;
  details: any;
}

/**
 * User detail modal props
 * Props cho user detail modal
 */
interface UserDetailModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate?: (user: AdminUser) => void;
}

/**
 * Format time ago
 * Format thời gian trước đây
 */
function formatTimeAgo(dateString?: string): string {
  if (!dateString) return "Chưa có";

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
}

/**
 * Format date
 * Format ngày tháng
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get role badge
 * Lấy badge role
 */
function getRoleBadge(role: string) {
  const roleConfig = {
    GUEST: { label: "Khách", variant: "secondary" as const },
    STUDENT: { label: "Học viên", variant: "default" as const },
    TUTOR: { label: "Trợ giảng", variant: "outline" as const },
    TEACHER: { label: "Giảng viên", variant: "default" as const },
    ADMIN: { label: "Quản trị", variant: "destructive" as const },
  };

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.GUEST;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

/**
 * Get status badge
 * Lấy badge status
 */
function getStatusBadge(status: string) {
  const statusConfig = {
    ACTIVE: { label: "Hoạt động", variant: "default" as const, icon: CheckCircle },
    SUSPENDED: { label: "Tạm ngưng", variant: "destructive" as const, icon: XCircle },
    PENDING_VERIFICATION: { label: "Chờ xác thực", variant: "secondary" as const, icon: Clock },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

/**
 * Get risk score color
 * Lấy màu risk score
 */
function getRiskScoreColor(score?: number): string {
  if (!score) return "text-green-600";
  if (score >= 0.8) return "text-red-600";
  if (score >= 0.6) return "text-orange-600";
  if (score >= 0.4) return "text-yellow-600";
  return "text-green-600";
}

/**
 * User Detail Modal Component
 * Component modal chi tiết user
 */
export function UserDetailModal({ user, isOpen, onClose, onUserUpdate }: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);

  /**
   * Reset state when modal opens/closes
   * Reset state khi modal mở/đóng
   */
  useEffect(() => {
    if (isOpen) {
      setActiveTab("overview");
      setIsEditing(false);
    }
  }, [isOpen]);

  /**
   * Handle tab change
   * Xử lý thay đổi tab
   */
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
  };

  /**
   * Handle user update
   * Xử lý cập nhật user
   */
  const handleUserUpdate = (updatedUser: AdminUser) => {
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={undefined} alt={user.firstName || user.email} />
                <AvatarFallback className="text-lg font-semibold">
                  {user.firstName ? user.firstName[0] : user.email[0]}
                </AvatarFallback>
              </Avatar>

              <div>
                <DialogTitle className="text-xl">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                  {!user.emailVerified && (
                    <Badge variant="outline" className="text-orange-600">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Chưa xác thực
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? (
                  <>
                    <Save className="h-3 w-3 mr-1" />
                    Lưu
                  </>
                ) : (
                  <>
                    <Edit className="h-3 w-3 mr-1" />
                    Chỉnh sửa
                  </>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
            {/* Tab Navigation */}
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Tổng quan</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Bảo mật</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Hoạt động</span>
              </TabsTrigger>
              <TabsTrigger value="sessions" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                <span className="hidden sm:inline">Phiên</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto">
              <TabsContent value="overview" className="mt-0 h-full">
                <UserOverviewTab
                  user={user}
                  isEditing={isEditing}
                  onUserUpdate={handleUserUpdate}
                />
              </TabsContent>

              <TabsContent value="security" className="mt-0 h-full">
                <UserSecurityTab
                  user={user}
                  isEditing={isEditing}
                  onUserUpdate={handleUserUpdate}
                />
              </TabsContent>

              <TabsContent value="activity" className="mt-0 h-full">
                <UserActivityTab user={user} />
              </TabsContent>

              <TabsContent value="sessions" className="mt-0 h-full">
                <UserSessionsTab user={user} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
