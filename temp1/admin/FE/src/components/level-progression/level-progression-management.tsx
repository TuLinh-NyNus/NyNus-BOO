"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/forms/button";
import { Label } from "@/components/ui/forms/label";
import { Input } from "@/components/ui/forms/input";
import { Switch } from "@/components/ui/forms/switch";
import { Badge } from "@/components/ui/data-display/badge";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import {
  Loader2,
  Settings,
  Save,
  TrendingUp,
  Users,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Interface cho progression settings
 */
interface ProgressionSettings {
  autoAdvancementEnabled: boolean;
  manualReviewRequired: boolean;
  criteria: {
    courseCompletionRate: number;
    examAverageScore: number;
    activeParticipationDays: number;
    minimumTimeInRole: number;
  };
  notifications: {
    userNotificationEnabled: boolean;
    adminNotificationEnabled: boolean;
  };
}

/**
 * Interface cho progression statistics
 */
interface ProgressionStatistics {
  totalProgressions: number;
  automaticProgressions: number;
  manualOverrides: number;
  adminPromotions: number;
  progressionsByRole: Record<string, number>;
}

/**
 * Level Progression Management Component
 * Component để quản lý level progression settings và monitoring
 */
export function LevelProgressionManagement() {
  // State management
  const [settings, setSettings] = useState<ProgressionSettings | null>(null);
  const [statistics, setStatistics] = useState<ProgressionStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  /**
   * Load progression settings và statistics
   */
  const loadData = async () => {
    setIsLoading(true);

    try {
      const [settingsResponse, statisticsResponse] = await Promise.all([
        fetch("/api/v1/admin/level-progression/settings", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        fetch("/api/v1/admin/level-progression/statistics", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
      ]);

      if (settingsResponse.ok && statisticsResponse.ok) {
        const [settingsData, statisticsData] = await Promise.all([
          settingsResponse.json(),
          statisticsResponse.json(),
        ]);

        setSettings(settingsData);
        setStatistics(statisticsData);
      } else {
        toast.error("Không thể tải dữ liệu progression");
      }
    } catch (error) {
      console.error("Failed to load progression data:", error);
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save progression criteria
   */
  const saveCriteria = async () => {
    if (!settings) return;

    setIsSaving(true);

    try {
      const response = await fetch("/api/v1/admin/level-progression/criteria", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(settings.criteria),
      });

      if (response.ok) {
        toast.success("Progression criteria updated successfully");
        setHasChanges(false);
        loadData(); // Reload data
      } else {
        const error = await response.json();
        toast.error(error.message || "Không thể cập nhật criteria");
      }
    } catch (error) {
      console.error("Failed to save criteria:", error);
      toast.error("Lỗi khi lưu criteria");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Toggle auto advancement
   */
  const toggleAutoAdvancement = async (enabled: boolean) => {
    try {
      const response = await fetch("/api/v1/admin/level-progression/toggle-auto-advancement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ enabled }),
      });

      if (response.ok) {
        toast.success(`Auto advancement ${enabled ? "enabled" : "disabled"} successfully`);
        setSettings((prev) => (prev ? { ...prev, autoAdvancementEnabled: enabled } : null));
      } else {
        const error = await response.json();
        toast.error(error.message || "Không thể toggle auto advancement");
      }
    } catch (error) {
      console.error("Failed to toggle auto advancement:", error);
      toast.error("Lỗi khi toggle auto advancement");
    }
  };

  /**
   * Update criteria value
   */
  const updateCriteria = (field: keyof ProgressionSettings["criteria"], value: number) => {
    if (!settings) return;

    setSettings((prev) =>
      prev
        ? {
            ...prev,
            criteria: {
              ...prev.criteria,
              [field]: value,
            },
          }
        : null
    );
    setHasChanges(true);
  };

  /**
   * Get role badge color
   */
  const getRoleBadgeColor = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    const colorMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      GUEST: "outline",
      STUDENT: "secondary",
      TUTOR: "default",
      TEACHER: "default",
      ADMIN: "destructive",
    };
    return colorMap[role] || "default";
  };

  // Effects
  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải progression settings...</span>
      </div>
    );
  }

  if (!settings || !statistics) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <p className="text-lg font-medium">Không thể tải progression settings</p>
        <Button onClick={loadData} className="mt-4">
          <Loader2 className="h-4 w-4 mr-2" />
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Level Progression Management
          </h2>
          <p className="text-muted-foreground">
            Quản lý cài đặt và monitoring level progression system
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          <Loader2 className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg text-center">
          <div className="text-2xl font-bold">{statistics.totalProgressions}</div>
          <div className="text-sm text-muted-foreground">Total Progressions</div>
        </div>

        <div className="p-4 border rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {statistics.automaticProgressions}
          </div>
          <div className="text-sm text-muted-foreground">Automatic</div>
        </div>

        <div className="p-4 border rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{statistics.manualOverrides}</div>
          <div className="text-sm text-muted-foreground">Manual Overrides</div>
        </div>

        <div className="p-4 border rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{statistics.adminPromotions}</div>
          <div className="text-sm text-muted-foreground">Admin Promotions</div>
        </div>
      </div>

      {/* Progressions by Role */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Progressions by Role
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(statistics.progressionsByRole).map(([role, count]) => (
            <div key={role} className="text-center">
              <Badge variant={getRoleBadgeColor(role)} className="mb-2">
                {role}
              </Badge>
              <div className="text-xl font-bold">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Auto Advancement Settings */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Auto Advancement Settings
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Auto Advancement</Label>
              <p className="text-sm text-muted-foreground">Tự động nâng level khi đạt criteria</p>
            </div>
            <Switch
              checked={settings.autoAdvancementEnabled}
              onCheckedChange={toggleAutoAdvancement}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Manual Review Required</Label>
              <p className="text-sm text-muted-foreground">
                Yêu cầu admin phê duyệt trước khi nâng level
              </p>
            </div>
            <Switch
              checked={settings.manualReviewRequired}
              onCheckedChange={(checked: boolean) =>
                setSettings((prev) => (prev ? { ...prev, manualReviewRequired: checked } : null))
              }
            />
          </div>
        </div>
      </div>

      {/* Progression Criteria */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Progression Criteria
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="courseCompletion">Course Completion Rate (%)</Label>
            <Input
              id="courseCompletion"
              type="number"
              min="0"
              max="100"
              value={settings.criteria.courseCompletionRate}
              onChange={(e) =>
                updateCriteria("courseCompletionRate", parseInt(e.target.value) || 0)
              }
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Tỷ lệ hoàn thành khóa học tối thiểu
            </p>
          </div>

          <div>
            <Label htmlFor="examScore">Exam Average Score (%)</Label>
            <Input
              id="examScore"
              type="number"
              min="0"
              max="100"
              value={settings.criteria.examAverageScore}
              onChange={(e) => updateCriteria("examAverageScore", parseInt(e.target.value) || 0)}
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Điểm trung bình bài kiểm tra tối thiểu
            </p>
          </div>

          <div>
            <Label htmlFor="participation">Active Participation (days)</Label>
            <Input
              id="participation"
              type="number"
              min="0"
              value={settings.criteria.activeParticipationDays}
              onChange={(e) =>
                updateCriteria("activeParticipationDays", parseInt(e.target.value) || 0)
              }
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Số ngày tham gia hoạt động tối thiểu
            </p>
          </div>

          <div>
            <Label htmlFor="timeInRole">Minimum Time in Role (days)</Label>
            <Input
              id="timeInRole"
              type="number"
              min="0"
              value={settings.criteria.minimumTimeInRole}
              onChange={(e) => updateCriteria("minimumTimeInRole", parseInt(e.target.value) || 0)}
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Thời gian tối thiểu ở role hiện tại
            </p>
          </div>
        </div>

        {hasChanges && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Bạn có thay đổi chưa lưu. Nhấn "Save Changes" để áp dụng.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-2 mt-6">
          <Button
            onClick={saveCriteria}
            disabled={!hasChanges || isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>

          {hasChanges && (
            <Button
              variant="outline"
              onClick={() => {
                loadData();
                setHasChanges(false);
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Notification Settings
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">User Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Gửi thông báo cho user khi level thay đổi
              </p>
            </div>
            <Switch
              checked={settings.notifications.userNotificationEnabled}
              onCheckedChange={(checked: boolean) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        notifications: { ...prev.notifications, userNotificationEnabled: checked },
                      }
                    : null
                )
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Admin Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Gửi thông báo cho admin khi có level progression
              </p>
            </div>
            <Switch
              checked={settings.notifications.adminNotificationEnabled}
              onCheckedChange={(checked: boolean) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        notifications: { ...prev.notifications, adminNotificationEnabled: checked },
                      }
                    : null
                )
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
