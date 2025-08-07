/**
 * Notification Preferences Management Component
 * Component quản lý preferences cho notification system
 *
 * Features:
 * - User-level notification preferences
 * - Bulk preference management for admins
 * - Channel-specific settings (email, push, SMS)
 * - Category-based preferences
 * - Default preference templates
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/layout/card";
import { Button } from "../../ui/forms/button";
import { Switch } from "../../ui/forms/switch";
import { Badge } from "../../ui/data-display/badge";
import { Input } from "../../ui/forms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/forms/select";
import {
  Users,
  User,
  Mail,
  Smartphone,
  MessageSquare,
  Settings,
  Save,
  RefreshCw,
  Search,
  Filter,
  Download,
  Upload,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Notification channels
 */
const NOTIFICATION_CHANNELS = [
  { id: "email", name: "Email", icon: Mail, description: "Email notifications" },
  { id: "push", name: "Push", icon: Smartphone, description: "Mobile push notifications" },
  { id: "sms", name: "SMS", icon: MessageSquare, description: "SMS text messages" },
];

/**
 * Notification categories
 */
const NOTIFICATION_CATEGORIES = [
  { id: "security", name: "Bảo mật", description: "Cảnh báo bảo mật và đăng nhập" },
  { id: "course", name: "Khóa học", description: "Cập nhật khóa học và bài học" },
  { id: "system", name: "Hệ thống", description: "Thông báo hệ thống và bảo trì" },
  { id: "social", name: "Xã hội", description: "Hoạt động xã hội và tương tác" },
  { id: "achievement", name: "Thành tích", description: "Thành tích và chứng chỉ" },
  { id: "payment", name: "Thanh toán", description: "Giao dịch và thanh toán" },
];

/**
 * User roles for preference templates
 */
const USER_ROLES = [
  { value: "STUDENT", label: "Học viên" },
  { value: "INSTRUCTOR", label: "Giảng viên" },
  { value: "ADMIN", label: "Quản trị viên" },
];

/**
 * Mock user preferences data
 */
const mockUserPreferences = [
  {
    userId: "user-1",
    email: "student1@nynus.com",
    name: "Nguyễn Văn A",
    role: "STUDENT",
    preferences: {
      email: {
        security: true,
        course: true,
        system: false,
        social: false,
        achievement: true,
        payment: true,
      },
      push: {
        security: true,
        course: false,
        system: false,
        social: false,
        achievement: true,
        payment: false,
      },
      sms: {
        security: true,
        course: false,
        system: false,
        social: false,
        achievement: false,
        payment: true,
      },
    },
    lastUpdated: new Date("2025-07-26T10:30:00Z"),
  },
  {
    userId: "user-2",
    email: "instructor1@nynus.com",
    name: "Trần Thị B",
    role: "INSTRUCTOR",
    preferences: {
      email: {
        security: true,
        course: true,
        system: true,
        social: true,
        achievement: true,
        payment: true,
      },
      push: {
        security: true,
        course: true,
        system: false,
        social: false,
        achievement: true,
        payment: false,
      },
      sms: {
        security: true,
        course: false,
        system: false,
        social: false,
        achievement: false,
        payment: true,
      },
    },
    lastUpdated: new Date("2025-07-26T09:15:00Z"),
  },
];

/**
 * Default preference templates
 */
const DEFAULT_TEMPLATES = {
  STUDENT: {
    email: {
      security: true,
      course: true,
      system: false,
      social: false,
      achievement: true,
      payment: true,
    },
    push: {
      security: true,
      course: false,
      system: false,
      social: false,
      achievement: true,
      payment: false,
    },
    sms: {
      security: true,
      course: false,
      system: false,
      social: false,
      achievement: false,
      payment: true,
    },
  },
  INSTRUCTOR: {
    email: {
      security: true,
      course: true,
      system: true,
      social: true,
      achievement: true,
      payment: true,
    },
    push: {
      security: true,
      course: true,
      system: false,
      social: false,
      achievement: true,
      payment: false,
    },
    sms: {
      security: true,
      course: false,
      system: false,
      social: false,
      achievement: false,
      payment: true,
    },
  },
  ADMIN: {
    email: {
      security: true,
      course: true,
      system: true,
      social: true,
      achievement: true,
      payment: true,
    },
    push: {
      security: true,
      course: true,
      system: true,
      social: false,
      achievement: true,
      payment: true,
    },
    sms: {
      security: true,
      course: false,
      system: true,
      social: false,
      achievement: false,
      payment: true,
    },
  },
};

/**
 * Notification Preferences Component
 */
export function NotificationPreferences() {
  const [userPreferences, setUserPreferences] = useState(mockUserPreferences);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Filter users by role and search term
   */
  const filteredUsers = userPreferences.filter((user) => {
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesSearch =
      searchTerm === "" ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesRole && matchesSearch;
  });

  /**
   * Update user preference
   */
  const updateUserPreference = async (
    userId: string,
    channel: string,
    category: string,
    enabled: boolean
  ) => {
    setLoading(true);
    try {
      setUserPreferences((prev) =>
        prev.map((user) =>
          user.userId === userId
            ? {
                ...user,
                preferences: {
                  ...user.preferences,
                  [channel]: {
                    ...user.preferences[channel as keyof typeof user.preferences],
                    [category]: enabled,
                  },
                },
                lastUpdated: new Date(),
              }
            : user
        )
      );

      toast.success("Cập nhật preference thành công");
    } catch (error) {
      toast.error("Lỗi khi cập nhật preference");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Apply template to selected users
   */
  const applyTemplate = async (role: string) => {
    if (selectedUsers.length === 0) {
      toast.error("Vui lòng chọn ít nhất một người dùng");
      return;
    }

    setLoading(true);
    try {
      const template = DEFAULT_TEMPLATES[role as keyof typeof DEFAULT_TEMPLATES];

      setUserPreferences((prev) =>
        prev.map((user) =>
          selectedUsers.includes(user.userId)
            ? { ...user, preferences: template, lastUpdated: new Date() }
            : user
        )
      );

      setSelectedUsers([]);
      toast.success(`Áp dụng template ${role} cho ${selectedUsers.length} người dùng`);
    } catch (error) {
      toast.error("Lỗi khi áp dụng template");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export preferences
   */
  const exportPreferences = () => {
    const data = JSON.stringify(userPreferences, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "notification-preferences.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Xuất preferences thành công");
  };

  /**
   * Get preference status summary
   */
  const getPreferenceSummary = (preferences: any) => {
    const channels = Object.keys(preferences);
    const totalSettings = channels.length * NOTIFICATION_CATEGORIES.length;
    const enabledSettings = channels.reduce((total, channel) => {
      return total + Object.values(preferences[channel]).filter(Boolean).length;
    }, 0);

    return { enabled: enabledSettings, total: totalSettings };
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search and Filter */}
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả roles</SelectItem>
              {USER_ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportPreferences}
            className="flex items-center space-x-1"
          >
            <Download className="h-4 w-4" />
            <span>Xuất</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            disabled={loading}
            className="flex items-center space-x-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-blue-100">
                  {selectedUsers.length} người dùng được chọn
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Áp dụng template:</span>
                {USER_ROLES.map((role) => (
                  <Button
                    key={role.value}
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate(role.value)}
                    disabled={loading}
                  >
                    {role.label}
                  </Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => setSelectedUsers([])}>
                  Hủy chọn
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => {
          const summary = getPreferenceSummary(user.preferences);
          const isSelected = selectedUsers.includes(user.userId);

          return (
            <Card key={user.userId} className={isSelected ? "border-blue-300 bg-blue-50" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers((prev) => [...prev, user.userId]);
                        } else {
                          setSelectedUsers((prev) => prev.filter((id) => id !== user.userId));
                        }
                      }}
                      className="rounded"
                    />

                    <User className="h-5 w-5 text-muted-foreground" />

                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {USER_ROLES.find((r) => r.value === user.role)?.label}
                    </Badge>
                    <Badge variant="outline" className="text-green-600">
                      {summary.enabled}/{summary.total} enabled
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Preferences Grid */}
                <div className="space-y-4">
                  {NOTIFICATION_CHANNELS.map((channel) => (
                    <div key={channel.id} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <channel.icon className="h-4 w-4" />
                        <span className="font-medium">{channel.name}</span>
                        <span className="text-sm text-muted-foreground">{channel.description}</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 ml-6">
                        {NOTIFICATION_CATEGORIES.map((category) => {
                          const channelPrefs = user.preferences[
                            channel.id as keyof typeof user.preferences
                          ] as any;
                          const isEnabled = channelPrefs?.[category.id];

                          return (
                            <div
                              key={category.id}
                              className="flex items-center justify-between p-2 border rounded"
                            >
                              <span className="text-sm">{category.name}</span>
                              <Switch
                                checked={isEnabled}
                                onCheckedChange={(enabled) =>
                                  updateUserPreference(
                                    user.userId,
                                    channel.id,
                                    category.id,
                                    enabled
                                  )
                                }
                                disabled={loading}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Last Updated */}
                <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                  Cập nhật lần cuối: {user.lastUpdated.toLocaleString("vi-VN")}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Không tìm thấy người dùng</h3>
            <p className="text-muted-foreground">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </CardContent>
        </Card>
      )}

      {/* Statistics Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Thống kê preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{filteredUsers.length}</div>
              <div className="text-sm text-muted-foreground">Tổng người dùng</div>
            </div>

            {NOTIFICATION_CHANNELS.map((channel) => {
              const enabledCount = filteredUsers.reduce((count, user) => {
                const channelPrefs = user.preferences[channel.id as keyof typeof user.preferences];
                const enabledCategories = Object.values(channelPrefs || {}).filter(Boolean).length;
                return count + (enabledCategories > 0 ? 1 : 0);
              }, 0);

              return (
                <div key={channel.id} className="text-center">
                  <div className="text-2xl font-bold">{enabledCount}</div>
                  <div className="text-sm text-muted-foreground">{channel.name} enabled</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
