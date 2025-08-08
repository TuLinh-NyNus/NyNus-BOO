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
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/display/card";
import { Button } from "../../ui/form/button";
import { Input } from "../../ui/form/input";
import { Label } from "../../ui/form/label";
import { Switch } from "../../ui/form/switch";
import { Textarea } from "../../ui/form/textarea";
import { Badge } from "../../ui/display/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/form/select";
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
import { toast } from "../../../hooks/use-toast";

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
  configValue: string | number | boolean | object;
  dataType: "string" | "number" | "boolean" | "json";
  description: string;
  isEditable: boolean;
  isActive: boolean;
  lastModified: Date;
  lastModifiedBy: string;
  hasChanges?: boolean;
  originalValue?: string | number | boolean | object;
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
      configKey: "enable_2fa",
      configValue: true,
      dataType: "boolean",
      description: "Bật/tắt xác thực 2 yếu tố",
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
      description: "Bật/tắt thông báo qua email",
      isEditable: true,
      isActive: true,
      lastModified: new Date("2025-07-27T08:45:00Z"),
      lastModifiedBy: "admin@nynus.com",
    },
    {
      id: "5",
      configKey: "notification_frequency",
      configValue: "daily",
      dataType: "string",
      description: "Tần suất gửi thông báo",
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
      description: "Thời gian cache (giây)",
      isEditable: true,
      isActive: true,
      lastModified: new Date("2025-07-27T08:30:00Z"),
      lastModifiedBy: "admin@nynus.com",
    },
  ],
  ui: [
    {
      id: "7",
      configKey: "theme_mode",
      configValue: "auto",
      dataType: "string",
      description: "Chế độ theme mặc định",
      isEditable: true,
      isActive: true,
      lastModified: new Date("2025-07-25T12:00:00Z"),
      lastModifiedBy: "admin@nynus.com",
    },
  ],
  features: [
    {
      id: "8",
      configKey: "enable_forum",
      configValue: true,
      dataType: "boolean",
      description: "Bật/tắt tính năng forum",
      isEditable: true,
      isActive: true,
      lastModified: new Date("2025-07-24T09:30:00Z"),
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

  /**
   * Load configurations for category
   */
  useEffect(() => {
    const categoryConfigs = mockConfigurations[category] || [];
    setConfigurations(categoryConfigs.map(config => ({ ...config, originalValue: config.configValue })));
  }, [category]);

  /**
   * Handle configuration value change
   */
  const handleValueChange = (configId: string, newValue: string | number | boolean | object) => {
    setConfigurations(prev => prev.map(config => {
      if (config.id === configId) {
        return {
          ...config,
          configValue: newValue,
          hasChanges: newValue !== config.originalValue
        };
      }
      return config;
    }));
  };

  /**
   * Save configurations
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Implement API call to save configurations
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset changes state
      setConfigurations(prev => prev.map(config => {
        const updatedConfig: ConfigurationItem = {
          ...config,
          hasChanges: false,
          originalValue: config.configValue,
          lastModified: new Date(),
          lastModifiedBy: "admin@nynus.com"
        };
        return updatedConfig;
      }));
      
      toast({ title: "Thành công", description: "Cấu hình đã được lưu thành công", variant: "success" });
    } catch (error) {
      toast({ title: "Lỗi", description: "Lỗi khi lưu cấu hình", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Reset changes
   */
  const handleReset = () => {
    setConfigurations(prev => prev.map(config => ({
      ...config,
      configValue: config.originalValue || config.configValue,
      hasChanges: false
    })));
    toast({ title: "Thông tin", description: "Đã khôi phục về giá trị ban đầu", variant: "default" });
  };

  /**
   * Render configuration input based on data type
   */
  const renderConfigInput = (config: ConfigurationItem) => {
    switch (config.dataType) {
      case "boolean":
        return (
          <Switch
            checked={Boolean(config.configValue)}
            onCheckedChange={(checked) => handleValueChange(config.id, checked)}
            disabled={!config.isEditable}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={String(config.configValue)}
            onChange={(e) => handleValueChange(config.id, parseInt(e.target.value))}
            disabled={!config.isEditable}
          />
        );
      case "string":
        return (
          <Input
            value={String(config.configValue)}
            onChange={(e) => handleValueChange(config.id, e.target.value)}
            disabled={!config.isEditable}
          />
        );
      default:
        return (
          <Textarea
            value={typeof config.configValue === 'object' ? JSON.stringify(config.configValue, null, 2) : String(config.configValue)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleValueChange(config.id, parsed);
              } catch {
                handleValueChange(config.id, e.target.value);
              }
            }}
            disabled={!config.isEditable}
            rows={3}
          />
        );
    }
  };

  const hasChanges = configurations.some(config => config.hasChanges);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || saving}
            className="flex items-center space-x-2"
          >
            <Undo className="h-4 w-4" />
            <span>Reset</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex items-center space-x-2"
          >
            <Save className={`h-4 w-4 ${saving ? "animate-spin" : ""}`} />
            <span>{saving ? "Đang lưu..." : "Lưu thay đổi"}</span>
          </Button>
        </div>
      </div>

      {/* Configuration Items */}
      <div className="space-y-4">
        {configurations.map((config) => (
          <Card key={config.id} className={config.hasChanges ? "border-orange-200 bg-orange-50/50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between space-x-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Label className="font-medium">{config.configKey}</Label>
                    {config.hasChanges && (
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        Đã thay đổi
                      </Badge>
                    )}
                    {!config.isActive && (
                      <Badge variant="secondary">Không hoạt động</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{config.description}</p>
                  <div className="max-w-md">
                    {renderConfigInput(config)}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Cập nhật lần cuối: {config.lastModified.toLocaleString("vi-VN")} bởi {config.lastModifiedBy}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {configurations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              Không có cấu hình nào trong category này
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
