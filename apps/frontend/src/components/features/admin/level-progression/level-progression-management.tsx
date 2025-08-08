"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/form/button";
import { Label } from "@/components/ui/form/label";
import { Input } from "@/components/ui/form/input";
import { Switch } from "@/components/ui/form/switch";
import { Badge } from "@/components/ui/display/badge";
import { Alert } from "@/components/ui/feedback/alert";
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
import { toast } from "@/hooks/use-toast";

// Import mockdata
import {
  getProgressionSettings,
  getProgressionStatistics,
  updateProgressionSettings,
  type ProgressionSettings,
  type ProgressionStatistics,
} from "@/lib/mockdata/level-progression";

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
      const [settingsData, statisticsData] = await Promise.all([
        getProgressionSettings(),
        getProgressionStatistics(),
      ]);

      setSettings(settingsData);
      setStatistics(statisticsData);
      setHasChanges(false);
    } catch (error) {
      console.error("Error loading progression data:", error);
      toast({ title: "Không thể tải dữ liệu progression", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle settings change
   */
  const handleSettingsChange = (field: keyof ProgressionSettings, value: unknown) => {
    if (!settings) return;

    setSettings((prev) => {
      if (!prev) return prev;

      if (field === 'criteria' && typeof value === 'object' && value !== null) {
        return {
          ...prev,
          criteria: {
            ...prev.criteria,
            ...(value as Partial<ProgressionSettings['criteria']>),
          },
        };
      }

      return {
        ...prev,
        [field]: value,
      } as ProgressionSettings;
    });
    setHasChanges(true);
  };

  /**
   * Save settings
   */
  const saveSettings = async () => {
    if (!settings || !hasChanges) return;

    setIsSaving(true);
    try {
      const updatedSettings = await updateProgressionSettings(settings);
      setSettings(updatedSettings);
      setHasChanges(false);
      toast({ title: "Đã lưu cài đặt progression thành công" });
    } catch (error) {
      console.error("Error saving progression settings:", error);
      toast({ title: "Không thể lưu cài đặt progression", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Format number with commas
   */
  const formatNumber = (num: number) => {
    return num.toLocaleString('vi-VN');
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Đang tải dữ liệu progression...</span>
        </div>
      </div>
    );
  }

  if (!settings || !statistics) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <div>
          <h4 className="font-medium">Không thể tải dữ liệu</h4>
          <p className="text-sm text-muted-foreground">
            Vui lòng thử lại sau hoặc liên hệ admin.
          </p>
        </div>
      </Alert>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Total Users</span>
          </div>
          <div className="text-2xl font-bold">{formatNumber(statistics.totalUsers)}</div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Total Progressions</span>
          </div>
          <div className="text-2xl font-bold">{formatNumber(statistics.totalProgressions)}</div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">Automatic</span>
          </div>
          <div className="text-2xl font-bold">{formatNumber(statistics.automaticProgressions)}</div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">Avg. Time (days)</span>
          </div>
          <div className="text-2xl font-bold">{statistics.averageProgressionTime}</div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="border rounded-lg p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Progression Settings
          </h3>
          {hasChanges && (
            <Badge variant="secondary">
              <AlertCircle className="h-3 w-3 mr-1" />
              Có thay đổi chưa lưu
            </Badge>
          )}
        </div>

        {/* Auto Advancement Toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Auto Advancement</Label>
              <p className="text-sm text-muted-foreground">
                Tự động thăng cấp users khi đạt criteria
              </p>
            </div>
            <Switch
              checked={settings.autoAdvancementEnabled}
              onCheckedChange={(checked) => handleSettingsChange('autoAdvancementEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Gửi thông báo khi có progression
              </p>
            </div>
            <Switch
              checked={settings.notificationEnabled}
              onCheckedChange={(checked) => handleSettingsChange('notificationEnabled', checked)}
            />
          </div>
        </div>

        {/* Criteria Settings */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Progression Criteria
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Course Completion Rate (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={settings.criteria.courseCompletionRate}
                onChange={(e) => handleSettingsChange('criteria', {
                  courseCompletionRate: parseInt(e.target.value) || 0
                })}
              />
            </div>

            <div className="space-y-2">
              <Label>Exam Average Score (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={settings.criteria.examAverageScore}
                onChange={(e) => handleSettingsChange('criteria', {
                  examAverageScore: parseInt(e.target.value) || 0
                })}
              />
            </div>

            <div className="space-y-2">
              <Label>Active Participation (days)</Label>
              <Input
                type="number"
                min="0"
                value={settings.criteria.activeParticipationDays}
                onChange={(e) => handleSettingsChange('criteria', {
                  activeParticipationDays: parseInt(e.target.value) || 0
                })}
              />
            </div>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Cooldown Period (days)</Label>
            <Input
              type="number"
              min="0"
              value={settings.cooldownPeriod}
              onChange={(e) => handleSettingsChange('cooldownPeriod', parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Thời gian chờ giữa các lần progression
            </p>
          </div>

          <div className="space-y-2">
            <Label>Max Advancements per Month</Label>
            <Input
              type="number"
              min="0"
              value={settings.maxAdvancementsPerMonth}
              onChange={(e) => handleSettingsChange('maxAdvancementsPerMonth', parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Giới hạn số lần thăng cấp mỗi tháng
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={saveSettings}
            disabled={!hasChanges || isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Đang lưu..." : "Lưu cài đặt"}
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {settings.autoAdvancementEnabled ? (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Auto Advancement đang hoạt động</h4>
            <p className="text-sm text-muted-foreground">
              System sẽ tự động thăng cấp users khi đạt đủ criteria đã cài đặt.
            </p>
          </div>
        </Alert>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Auto Advancement đã tắt</h4>
            <p className="text-sm text-muted-foreground">
              Tất cả progressions sẽ cần được thực hiện thủ công bởi admin.
            </p>
          </div>
        </Alert>
      )}
    </div>
  );
}
