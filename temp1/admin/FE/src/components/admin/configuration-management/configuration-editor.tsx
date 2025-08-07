/**
 * Configuration Editor Component
 * Component chỉnh sửa configurations theo category
 *
 * Features:
 * - Category-based configuration editing
 * - Real-time validation
 * - Configuration history tracking
 * - Bulk edit capabilities
 * - Auto-save functionality
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/layout/card";
import { Button } from "../../ui/forms/button";
import { Input } from "../../ui/forms/input";
import { Label } from "../../ui/forms/label";
import { Switch } from "../../ui/forms/switch";
import { Textarea } from "../../ui/forms/textarea";
import { Badge } from "../../ui/data-display/badge";
import { useConfigurationRealtime } from "../../../hooks/use-configuration-realtime";
import { ConfigurationRollback } from "./configuration-rollback";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/forms/select";
import {
  Save,
  RefreshCw,
  History,
  AlertTriangle,
  CheckCircle,
  Edit,
  Eye,
  EyeOff,
  Undo,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Configuration Editor Props
 */
interface ConfigurationEditorProps {
  category: string;
  title: string;
  description: string;
}

/**
 * Configuration item interface
 */
interface ConfigurationItem {
  id: string;
  configKey: string;
  configValue: any;
  dataType: "string" | "number" | "boolean" | "json";
  description: string;
  isEditable: boolean;
  isActive: boolean;
  lastModified: Date;
  lastModifiedBy: string;
  hasChanges?: boolean;
  originalValue?: any;
}

/**
 * Mock configuration data by category
 */
const mockConfigurations: Record<string, ConfigurationItem[]> = {
  security: [
    {
      id: "1",
      configKey: "max_login_attempts",
      configValue: 5,
      dataType: "number",
      description: "Số lần đăng nhập tối đa trước khi khóa tài khoản",
      isEditable: true,
      isActive: true,
      lastModified: new Date("2025-07-27T09:15:00Z"),
      lastModifiedBy: "admin@nynus.com",
    },
    {
      id: "2",
      configKey: "session_timeout",
      configValue: 3600,
      dataType: "number",
      description: "Thời gian timeout session (giây)",
      isEditable: true,
      isActive: true,
      lastModified: new Date("2025-07-26T14:30:00Z"),
      lastModifiedBy: "admin@nynus.com",
    },
    {
      id: "3",
      configKey: "password_min_length",
      configValue: 8,
      dataType: "number",
      description: "Độ dài tối thiểu của mật khẩu",
      isEditable: true,
      isActive: true,
      lastModified: new Date("2025-07-25T10:00:00Z"),
      lastModifiedBy: "admin@nynus.com",
    },
  ],
  notifications: [
    {
      id: "4",
      configKey: "email_enabled",
      configValue: true,
      dataType: "boolean",
      description: "Bật/tắt email notifications",
      isEditable: true,
      isActive: true,
      lastModified: new Date("2025-07-27T08:45:00Z"),
      lastModifiedBy: "admin@nynus.com",
    },
    {
      id: "5",
      configKey: "smtp_host",
      configValue: "smtp.gmail.com",
      dataType: "string",
      description: "SMTP server host",
      isEditable: true,
      isActive: true,
      lastModified: new Date("2025-07-26T16:20:00Z"),
      lastModifiedBy: "admin@nynus.com",
    },
  ],
  performance: [
    {
      id: "6",
      configKey: "cache_ttl",
      configValue: 600,
      dataType: "number",
      description: "Cache TTL (giây)",
      isEditable: true,
      isActive: true,
      lastModified: new Date("2025-07-27T08:30:00Z"),
      lastModifiedBy: "admin@nynus.com",
    },
  ],
  ui: [
    {
      id: "7",
      configKey: "items_per_page",
      configValue: 20,
      dataType: "number",
      description: "Số items hiển thị trên mỗi trang",
      isEditable: true,
      isActive: true,
      lastModified: new Date("2025-07-26T12:00:00Z"),
      lastModifiedBy: "admin@nynus.com",
    },
  ],
  features: [
    {
      id: "8",
      configKey: "enable_social_login",
      configValue: true,
      dataType: "boolean",
      description: "Bật/tắt đăng nhập qua mạng xã hội",
      isEditable: true,
      isActive: true,
      lastModified: new Date("2025-07-25T15:30:00Z"),
      lastModifiedBy: "admin@nynus.com",
    },
  ],
};

/**
 * Configuration Editor Component
 */
export function ConfigurationEditor({ category, title, description }: ConfigurationEditorProps) {
  const [configurations, setConfigurations] = useState<ConfigurationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  // Real-time configuration updates
  const { isConnected, recentChanges } = useConfigurationRealtime({
    enableNotifications: true,
    categories: [category],
    onConfigurationChange: (event) => {
      // Update local configuration if it matches current category
      if (event.category === category) {
        setConfigurations((prev) =>
          prev.map((config) =>
            config.configKey === event.configKey
              ? {
                  ...config,
                  configValue: event.newValue,
                  originalValue: event.newValue,
                  hasChanges: false,
                  lastModified: new Date(),
                  lastModifiedBy: event.changedByEmail || event.changedBy,
                }
              : config
          )
        );
      }
    },
  });

  /**
   * Load configurations for category
   */
  useEffect(() => {
    loadConfigurations();
  }, [category]);

  /**
   * Load configurations
   */
  const loadConfigurations = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call
      // const response = await fetch(`/api/configuration/category/${category}`);
      // const data = await response.json();

      // Mock data for now
      const categoryConfigs = mockConfigurations[category] || [];
      setConfigurations(
        categoryConfigs.map((config) => ({
          ...config,
          originalValue: config.configValue,
        }))
      );
    } catch (error) {
      toast.error("Lỗi khi tải cấu hình");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update configuration value
   */
  const updateConfigValue = (configId: string, newValue: any) => {
    setConfigurations((prev) =>
      prev.map((config) =>
        config.id === configId
          ? {
              ...config,
              configValue: newValue,
              hasChanges: newValue !== config.originalValue,
            }
          : config
      )
    );
  };

  /**
   * Save configuration changes
   */
  const saveConfiguration = async (configId: string) => {
    setSaving(true);
    try {
      const config = configurations.find((c) => c.id === configId);
      if (!config) return;

      // TODO: Implement API call
      // await fetch(`/api/configuration/${configId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     configValue: config.configValue
      //   })
      // });

      // Update local state
      setConfigurations((prev) =>
        prev.map((c) =>
          c.id === configId
            ? {
                ...c,
                hasChanges: false,
                originalValue: c.configValue,
                lastModified: new Date(),
                lastModifiedBy: "admin@nynus.com",
              }
            : c
        )
      );

      toast.success(`Đã lưu cấu hình ${config.configKey}`);
    } catch (error) {
      toast.error("Lỗi khi lưu cấu hình");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Reset configuration to original value
   */
  const resetConfiguration = (configId: string) => {
    setConfigurations((prev) =>
      prev.map((config) =>
        config.id === configId
          ? {
              ...config,
              configValue: config.originalValue,
              hasChanges: false,
            }
          : config
      )
    );
  };

  /**
   * Render configuration input based on data type
   */
  const renderConfigInput = (config: ConfigurationItem) => {
    const { dataType, configValue, configKey, isEditable } = config;

    if (!isEditable) {
      return (
        <div className="flex items-center space-x-2 text-muted-foreground">
          <EyeOff className="h-4 w-4" />
          <span>Không thể chỉnh sửa</span>
        </div>
      );
    }

    switch (dataType) {
      case "boolean":
        return (
          <Switch
            checked={configValue}
            onCheckedChange={(checked) => updateConfigValue(config.id, checked)}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={configValue}
            onChange={(e) => updateConfigValue(config.id, parseInt(e.target.value) || 0)}
            className="w-32"
          />
        );

      case "json":
        return (
          <Textarea
            value={JSON.stringify(configValue, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                updateConfigValue(config.id, parsed);
              } catch (error) {
                // Invalid JSON, don't update
              }
            }}
            className="font-mono text-sm"
            rows={4}
          />
        );

      case "string":
      default:
        return (
          <Input
            value={configValue}
            onChange={(e) => updateConfigValue(config.id, e.target.value)}
            className="flex-1"
          />
        );
    }
  };

  /**
   * Filter configurations
   */
  const filteredConfigurations = configurations.filter((config) => showInactive || config.isActive);

  const hasChanges = configurations.some((config) => config.hasChanges);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Switch checked={showInactive} onCheckedChange={setShowInactive} />
            <Label>Hiển thị inactive</Label>
          </div>

          {/* Real-time connection indicator */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
            />
            <span className="text-xs text-muted-foreground">
              {isConnected ? "Real-time" : "Offline"}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={loadConfigurations}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Configurations List */}
      <div className="space-y-4">
        {filteredConfigurations.map((config) => (
          <Card
            key={config.id}
            className={config.hasChanges ? "border-orange-200 bg-orange-50" : ""}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div>
                    <CardTitle className="text-lg">{config.configKey}</CardTitle>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                  </div>
                  {config.hasChanges && (
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      Có thay đổi
                    </Badge>
                  )}
                  {!config.isActive && (
                    <Badge variant="outline" className="text-gray-600">
                      Inactive
                    </Badge>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {config.dataType}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Configuration Input */}
              <div className="flex items-center space-x-4">
                <Label className="w-20">Giá trị:</Label>
                <div className="flex-1">{renderConfigInput(config)}</div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  Cập nhật lần cuối: {config.lastModified.toLocaleString("vi-VN")} bởi{" "}
                  {config.lastModifiedBy}
                </div>

                <div className="flex items-center space-x-2">
                  {config.hasChanges && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resetConfiguration(config.id)}
                      className="flex items-center space-x-1"
                    >
                      <Undo className="h-3 w-3" />
                      <span>Reset</span>
                    </Button>
                  )}

                  <Button
                    size="sm"
                    onClick={() => saveConfiguration(config.id)}
                    disabled={!config.hasChanges || saving}
                    className="flex items-center space-x-1"
                  >
                    <Save className="h-3 w-3" />
                    <span>Lưu</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Toggle rollback view for this configuration
                      const configElement = document.getElementById(`config-rollback-${config.id}`);
                      if (configElement) {
                        configElement.style.display =
                          configElement.style.display === "none" ? "block" : "none";
                      }
                    }}
                    className="flex items-center space-x-1"
                  >
                    <History className="h-3 w-3" />
                    <span>Lịch sử</span>
                  </Button>
                </div>
              </div>
            </CardContent>

            {/* Configuration Rollback Section */}
            <div id={`config-rollback-${config.id}`} style={{ display: "none" }} className="mt-4">
              <ConfigurationRollback
                configurationId={config.id}
                category={category}
                configKey={config.configKey}
                currentValue={config.configValue}
                onRollbackSuccess={() => {
                  // Reload configurations after successful rollback
                  loadConfigurations();
                }}
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredConfigurations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Không có cấu hình nào</h3>
            <p className="text-muted-foreground">
              {showInactive
                ? "Không tìm thấy cấu hình nào trong category này"
                : 'Không có cấu hình active nào. Thử bật "Hiển thị inactive"'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {hasChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-orange-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">
                  Có {configurations.filter((c) => c.hasChanges).length} cấu hình chưa được lưu
                </span>
              </div>
              <Button
                onClick={() => {
                  configurations
                    .filter((c) => c.hasChanges)
                    .forEach((c) => saveConfiguration(c.id));
                }}
                disabled={saving}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Lưu tất cả</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
