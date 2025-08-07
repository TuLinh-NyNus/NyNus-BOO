/**
 * Notification Triggers Configuration Component
 * Component cấu hình triggers cho notification system
 *
 * Features:
 * - Event-based trigger configuration
 * - Condition-based trigger rules
 * - Integration với email templates system
 * - Real-time trigger testing
 * - Bulk trigger management
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
  Settings,
  Play,
  Pause,
  AlertTriangle,
  User,
  Server,
  Mail,
  Clock,
  Filter,
  TestTube,
  Save,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Trigger event types
 */
const TRIGGER_EVENTS = {
  security: [
    { id: "failed_login", name: "Đăng nhập thất bại", description: "Nhiều lần đăng nhập thất bại" },
    { id: "new_device", name: "Thiết bị mới", description: "Đăng nhập từ thiết bị mới" },
    {
      id: "suspicious_activity",
      name: "Hoạt động đáng nghi",
      description: "Phát hiện hoạt động bất thường",
    },
    {
      id: "admin_action_required",
      name: "Cần action admin",
      description: "Yêu cầu can thiệp admin",
    },
  ],
  user: [
    { id: "new_registration", name: "Đăng ký mới", description: "Người dùng đăng ký tài khoản" },
    { id: "role_promotion", name: "Nâng cấp role", description: "Thay đổi quyền người dùng" },
    { id: "level_advancement", name: "Thăng cấp level", description: "Người dùng lên level mới" },
    { id: "account_suspension", name: "Khóa tài khoản", description: "Tài khoản bị tạm khóa" },
  ],
  system: [
    { id: "performance_degradation", name: "Hiệu suất giảm", description: "Hệ thống chạy chậm" },
    { id: "error_rate_high", name: "Tỷ lệ lỗi cao", description: "Nhiều lỗi xảy ra" },
    { id: "server_resource_warning", name: "Cảnh báo tài nguyên", description: "CPU/Memory cao" },
    {
      id: "maintenance_notification",
      name: "Thông báo bảo trì",
      description: "Lịch bảo trì hệ thống",
    },
  ],
};

/**
 * Priority levels
 */
const PRIORITY_LEVELS = [
  { value: "LOW", label: "Thấp", color: "bg-gray-100 text-gray-800" },
  { value: "NORMAL", label: "Bình thường", color: "bg-blue-100 text-blue-800" },
  { value: "HIGH", label: "Cao", color: "bg-orange-100 text-orange-800" },
  { value: "CRITICAL", label: "Nghiêm trọng", color: "bg-red-100 text-red-800" },
];

/**
 * Mock trigger configurations (sẽ được thay thế bằng API call)
 */
const mockTriggers = [
  {
    id: "1",
    eventType: "failed_login",
    category: "security",
    enabled: true,
    priority: "HIGH",
    conditions: {
      attemptCount: 5,
      timeWindow: 15, // minutes
    },
    delayMinutes: 0,
    emailEnabled: true,
    pushEnabled: true,
  },
  {
    id: "2",
    eventType: "new_registration",
    category: "user",
    enabled: true,
    priority: "NORMAL",
    conditions: {},
    delayMinutes: 5,
    emailEnabled: true,
    pushEnabled: false,
  },
  // Add more mock data...
];

/**
 * Notification Triggers Component
 */
export function NotificationTriggers() {
  const [triggers, setTriggers] = useState(mockTriggers);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingTrigger, setEditingTrigger] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Get category icon
   */
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "security":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "user":
        return <User className="h-4 w-4 text-blue-500" />;
      case "system":
        return <Server className="h-4 w-4 text-gray-500" />;
      default:
        return <Settings className="h-4 w-4" />;
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
   * Get event info
   */
  const getEventInfo = (category: string, eventType: string) => {
    const events = TRIGGER_EVENTS[category as keyof typeof TRIGGER_EVENTS] || [];
    return events.find((e) => e.id === eventType);
  };

  /**
   * Toggle trigger enabled status
   */
  const toggleTrigger = async (triggerId: string) => {
    setLoading(true);
    try {
      setTriggers((prev) =>
        prev.map((trigger) =>
          trigger.id === triggerId ? { ...trigger, enabled: !trigger.enabled } : trigger
        )
      );

      toast.success("Cập nhật trigger thành công");
    } catch (error) {
      toast.error("Lỗi khi cập nhật trigger");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Test trigger
   */
  const testTrigger = async (triggerId: string) => {
    setLoading(true);
    try {
      // TODO: Implement trigger testing
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Test trigger thành công");
    } catch (error) {
      toast.error("Lỗi khi test trigger");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save trigger configuration
   */
  const saveTrigger = async (triggerId: string) => {
    setLoading(true);
    try {
      // TODO: Implement save trigger
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setEditingTrigger(null);
      toast.success("Lưu cấu hình trigger thành công");
    } catch (error) {
      toast.error("Lỗi khi lưu trigger");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter triggers by category
   */
  const filteredTriggers =
    selectedCategory === "all"
      ? triggers
      : triggers.filter((trigger) => trigger.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Chọn category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả categories</SelectItem>
              <SelectItem value="security">Bảo mật</SelectItem>
              <SelectItem value="user">Người dùng</SelectItem>
              <SelectItem value="system">Hệ thống</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="outline">{filteredTriggers.length} triggers</Badge>
          <Badge variant="outline" className="text-green-600">
            {filteredTriggers.filter((t) => t.enabled).length} active
          </Badge>
        </div>
      </div>

      {/* Triggers List */}
      <div className="grid gap-4">
        {filteredTriggers.map((trigger) => {
          const eventInfo = getEventInfo(trigger.category, trigger.eventType);
          const isEditing = editingTrigger === trigger.id;

          return (
            <Card
              key={trigger.id}
              className={`${trigger.enabled ? "border-green-200" : "border-gray-200"}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getCategoryIcon(trigger.category)}
                    <div>
                      <CardTitle className="text-lg">
                        {eventInfo?.name || trigger.eventType}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {eventInfo?.description || "Trigger tự động cho sự kiện này"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(trigger.priority)}
                    <Switch
                      checked={trigger.enabled}
                      onCheckedChange={() => toggleTrigger(trigger.id)}
                      disabled={loading}
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Trigger Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Priority */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mức độ ưu tiên</label>
                    {isEditing ? (
                      <Select defaultValue={trigger.priority}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITY_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div>{PRIORITY_LEVELS.find((p) => p.value === trigger.priority)?.label}</div>
                    )}
                  </div>

                  {/* Delay */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Delay (phút)</label>
                    {isEditing ? (
                      <Input type="number" defaultValue={trigger.delayMinutes} min={0} max={60} />
                    ) : (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{trigger.delayMinutes} phút</span>
                      </div>
                    )}
                  </div>

                  {/* Notification Types */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Loại thông báo</label>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span className="text-sm">Email</span>
                        <Switch
                          checked={trigger.emailEnabled}
                          onCheckedChange={() => {}}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <Settings className="h-3 w-3" />
                        <span className="text-sm">Push</span>
                        <Switch
                          checked={trigger.pushEnabled}
                          onCheckedChange={() => {}}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conditions */}
                {trigger.conditions && Object.keys(trigger.conditions).length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Điều kiện trigger</label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(trigger.conditions).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground">{key}:</span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testTrigger(trigger.id)}
                      disabled={loading || !trigger.enabled}
                      className="flex items-center space-x-1"
                    >
                      <TestTube className="h-3 w-3" />
                      <span>Test</span>
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isEditing ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setEditingTrigger(null)}>
                          Hủy
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => saveTrigger(trigger.id)}
                          disabled={loading}
                          className="flex items-center space-x-1"
                        >
                          <Save className="h-3 w-3" />
                          <span>Lưu</span>
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingTrigger(trigger.id)}
                        className="flex items-center space-x-1"
                      >
                        <Settings className="h-3 w-3" />
                        <span>Cấu hình</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTriggers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Không có trigger nào</h3>
            <p className="text-muted-foreground">
              {selectedCategory === "all"
                ? "Chưa có trigger nào được cấu hình"
                : `Không có trigger nào cho category "${selectedCategory}"`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
