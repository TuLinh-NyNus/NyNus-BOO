/**
 * Notification Settings Component
 * Component cài đặt notifications và sound alerts
 *
 * Features:
 * - Sound settings configuration
 * - Volume control
 * - Notification type preferences
 * - Real-time testing
 * - Priority level settings
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
import {
  Volume2,
  VolumeX,
  Play,
  Settings,
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  TestTube,
} from "lucide-react";
import { toast } from "sonner";

import { soundService } from "../../../lib/services/sound-service";

/**
 * Notification Settings Component
 */
export function NotificationSettings() {
  const [soundSettings, setSoundSettings] = useState({
    enabled: true,
    volume: 0.7,
    securityAlertsEnabled: true,
    generalNotificationsEnabled: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    securityAlerts: true,
    courseUpdates: true,
    systemMessages: true,
    achievements: true,
    social: false,
    payments: true,
  });

  const [testing, setTesting] = useState(false);

  /**
   * Load settings on component mount
   */
  useEffect(() => {
    const settings = soundService.getSettings();
    setSoundSettings(settings);
  }, []);

  /**
   * Update sound settings
   */
  const updateSoundSettings = (newSettings: Partial<typeof soundSettings>) => {
    const updated = { ...soundSettings, ...newSettings };
    setSoundSettings(updated);
    soundService.updateSettings(updated);

    toast.success("Cài đặt âm thanh đã được cập nhật");
  };

  /**
   * Test sound playback
   */
  const testSound = async (type: "security-alert" | "notification" | "error" | "success") => {
    setTesting(true);
    try {
      const success = await soundService.testSound(type);
      if (success) {
        toast.success(`Âm thanh ${type} phát thành công`);
      } else {
        toast.error(`Không thể phát âm thanh ${type}`);
      }
    } catch (error) {
      toast.error("Lỗi khi test âm thanh");
    } finally {
      setTesting(false);
    }
  };

  /**
   * Get sound status
   */
  const soundStatus = soundService.getSoundStatus();
  const isAudioSupported = soundService.isAudioSupported();

  return (
    <div className="space-y-6">
      {/* Audio Support Status */}
      {!isAudioSupported && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-orange-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Trình duyệt không hỗ trợ phát âm thanh hoặc âm thanh bị tắt
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sound Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5" />
            <span>Cài đặt âm thanh</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">Bật âm thanh thông báo</div>
              <div className="text-sm text-muted-foreground">Bật/tắt tất cả âm thanh thông báo</div>
            </div>
            <Switch
              checked={soundSettings.enabled}
              onCheckedChange={(enabled) => updateSoundSettings({ enabled })}
            />
          </div>

          {soundSettings.enabled && (
            <>
              <hr className="my-4" />

              {/* Volume Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Âm lượng</div>
                  <Badge variant="outline">{Math.round(soundSettings.volume * 100)}%</Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="range"
                    value={soundSettings.volume}
                    onChange={(e) => updateSoundSettings({ volume: parseFloat(e.target.value) })}
                    max={1}
                    min={0}
                    step={0.1}
                    className="flex-1"
                  />
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <hr className="my-4" />

              {/* Sound Categories */}
              <div className="space-y-4">
                <div className="font-medium">Loại âm thanh</div>

                <div className="space-y-3">
                  {/* Security Alerts */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <div>
                        <div className="font-medium">Cảnh báo bảo mật</div>
                        <div className="text-sm text-muted-foreground">
                          Âm thanh cho các sự kiện bảo mật quan trọng
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={soundSettings.securityAlertsEnabled}
                        onCheckedChange={(securityAlertsEnabled) =>
                          updateSoundSettings({ securityAlertsEnabled })
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testSound("security-alert")}
                        disabled={testing || !soundSettings.securityAlertsEnabled}
                        className="flex items-center space-x-1"
                      >
                        <Play className="h-3 w-3" />
                        <span>Test</span>
                      </Button>
                    </div>
                  </div>

                  {/* General Notifications */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="font-medium">Thông báo chung</div>
                        <div className="text-sm text-muted-foreground">
                          Âm thanh cho thông báo thường
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={soundSettings.generalNotificationsEnabled}
                        onCheckedChange={(generalNotificationsEnabled) =>
                          updateSoundSettings({ generalNotificationsEnabled })
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testSound("notification")}
                        disabled={testing || !soundSettings.generalNotificationsEnabled}
                        className="flex items-center space-x-1"
                      >
                        <Play className="h-3 w-3" />
                        <span>Test</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="my-4" />

              {/* Sound Test Section */}
              <div className="space-y-3">
                <div className="font-medium">Test âm thanh</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => testSound("success")}
                    disabled={testing}
                    className="flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Thành công</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => testSound("error")}
                    disabled={testing}
                    className="flex items-center space-x-2"
                  >
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>Lỗi</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification Type Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Loại thông báo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {Object.entries(notificationSettings).map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-medium">
                    {key === "securityAlerts" && "Cảnh báo bảo mật"}
                    {key === "courseUpdates" && "Cập nhật khóa học"}
                    {key === "systemMessages" && "Thông báo hệ thống"}
                    {key === "achievements" && "Thành tích"}
                    {key === "social" && "Hoạt động xã hội"}
                    {key === "payments" && "Thanh toán"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {key === "securityAlerts" && "Đăng nhập mới, hoạt động đáng nghi"}
                    {key === "courseUpdates" && "Bài học mới, cập nhật nội dung"}
                    {key === "systemMessages" && "Bảo trì, cập nhật hệ thống"}
                    {key === "achievements" && "Lên cấp, nhận chứng chỉ"}
                    {key === "social" && "Người theo dõi, tin nhắn"}
                    {key === "payments" && "Thanh toán, hoàn tiền"}
                  </div>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={(checked) =>
                    setNotificationSettings((prev) => ({ ...prev, [key]: checked }))
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sound Status Debug Info */}
      {process.env.NODE_ENV === "development" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TestTube className="h-5 w-5" />
              <span>Debug Info</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>Audio Support: {isAudioSupported ? "✅" : "❌"}</div>
              {Object.entries(soundStatus).map(([type, status]) => (
                <div key={type}>
                  {type}: {status.loaded ? "✅" : "❌"}
                  {status.error && ` (${status.error})`}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
