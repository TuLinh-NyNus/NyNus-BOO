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
} from "@/components/ui/overlay/dialog";
import { Badge } from "@/components/ui/display/badge";
import { Button } from "@/components/ui/form/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/display/avatar";
import {
  User,
  Shield,
  Activity,
  Monitor,
  X,
  Edit,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";

// Removed unused UserRole import
import { toast } from "@/hooks/use-toast";
import {
  getProtobufRoleLabel,
  getProtobufStatusLabel,
  getProtobufRoleColor,
  getProtobufStatusColor
} from "@/lib/utils/type-converters";

// Import proper Tabs components
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/navigation/tabs";

// Import tab components (will be created)
import { UserOverviewTab } from "./user-overview-tab";
import { UserSecurityTab } from "./user-security-tab";
import { UserActivityTab } from "./user-activity-tab";
import { UserSessionsTab } from "./user-sessions-tab";

// Import AdminUser from canonical source
import { AdminUser } from '@/types/user';

/**
 * User detail modal props
 */
interface UserDetailModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate?: (user: AdminUser) => void;
}

// Removed USER_ROLE_LABELS and USER_ROLE_COLORS - using protobuf helpers instead

/**
 * Format time ago
 */
function formatTimeAgo(dateString?: string): string {
  if (!dateString) return "Chưa có";

  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return "Vừa xong";
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  if (diffInDays < 30) return `${diffInDays} ngày trước`;
  
  return date.toLocaleDateString("vi-VN");
}

/**
 * User Detail Modal Component
 */
export function UserDetailModal({
  user,
  isOpen,
  onClose,
  onUserUpdate,
}: UserDetailModalProps) {
  // State management
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Reset state when modal opens/closes
   */
  useEffect(() => {
    if (isOpen) {
      setActiveTab("overview");
      setIsEditing(false);
    }
  }, [isOpen]);

  /**
   * Get user display name
   */
  const getUserDisplayName = (user: AdminUser): string => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  };

  /**
   * Get user initials for avatar
   */
  const getUserInitials = (user: AdminUser): string => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  // Removed getStatusBadgeColor - using protobuf helpers instead

  /**
   * Handle user update
   */
  const handleUserUpdate = async (updatedUser: AdminUser) => {
    setIsLoading(true);
    try {
      // In real app, call API to update user
      // await updateUser(updatedUser);
      
      toast({
        title: "Cập nhật user thành công",
        description: `Đã cập nhật thông tin cho ${getUserDisplayName(updatedUser)}`,
      });

      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Lỗi cập nhật user",
        description: "Không thể cập nhật thông tin user. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={`/avatars/${user.id}.svg`} />
                <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl">{getUserDisplayName(user)}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`bg-${getProtobufRoleColor(user.role)}-100 text-${getProtobufRoleColor(user.role)}-700`}>
                    {getProtobufRoleLabel(user.role)}
                  </Badge>
                  <Badge className={`bg-${getProtobufStatusColor(user.status)}-100 text-${getProtobufStatusColor(user.status)}-700`}>
                    {getProtobufStatusLabel(user.status)}
                  </Badge>
                  {user.emailVerified ? (
                    <CheckCircle className="h-4 w-4 text-badge-success-foreground" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <Eye className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                {isEditing ? "Xem" : "Sửa"}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* User Quick Info */}
        <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/25">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{user.activeSessionsCount}</div>
            <div className="text-xs text-muted-foreground">Active Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-badge-success-foreground">{user.totalResourceAccess}</div>
            <div className="text-xs text-muted-foreground">Resource Access</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-badge-warning-foreground">{user.riskScore || 0}</div>
            <div className="text-xs text-muted-foreground">Risk Score</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">{user.lastLoginAt ? formatTimeAgo(user.lastLoginAt.toISOString()) : 'Chưa đăng nhập'}</div>
            <div className="text-xs text-muted-foreground">Last Login</div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Bảo mật
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Hoạt động
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Sessions
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto p-4">
            <TabsContent value="overview">
              <UserOverviewTab
                user={user}
                isEditing={isEditing}
                onUpdate={handleUserUpdate}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="security">
              <UserSecurityTab
                user={user}
                isEditing={isEditing}
                onUpdate={handleUserUpdate}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="activity">
              <UserActivityTab
                user={user}
              />
            </TabsContent>

            <TabsContent value="sessions">
              <UserSessionsTab
                user={user}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
