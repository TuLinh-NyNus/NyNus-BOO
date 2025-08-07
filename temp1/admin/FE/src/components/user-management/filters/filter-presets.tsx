/**
 * Filter Presets Component
 * Component quản lý filter presets
 */

"use client";

import React from "react";
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Star, Play, Trash2, Users, Shield, Clock, AlertTriangle } from "lucide-react";

import {
  FilterPreset,
  AdvancedUserFilters,
  ROLE_LABELS,
  STATUS_LABELS,
} from "../../../types/user-filters";

/**
 * Filter Presets Props
 * Props cho Filter Presets component
 */
interface FilterPresetsProps {
  presets: FilterPreset[];
  onApplyPreset: (presetId: string) => void;
  onDeletePreset?: (presetId: string) => void;
  currentFilters?: AdvancedUserFilters;
  className?: string;
}

/**
 * Get preset icon based on preset type
 * Lấy icon cho preset dựa trên loại
 */
function getPresetIcon(preset: FilterPreset) {
  const { filters } = preset;

  if (filters.statuses?.includes("SUSPENDED")) {
    return <Shield className="h-4 w-4 text-red-500" />;
  }

  if (filters.registrationDateRange) {
    return <Clock className="h-4 w-4 text-blue-500" />;
  }

  if (filters.riskScoreRange?.min && filters.riskScoreRange.min >= 7) {
    return <AlertTriangle className="h-4 w-4 text-orange-500" />;
  }

  if (filters.roles?.includes("STUDENT")) {
    return <Users className="h-4 w-4 text-green-500" />;
  }

  return <Star className="h-4 w-4 text-gray-500" />;
}

/**
 * Format filter summary for display
 * Format tóm tắt filter để hiển thị
 */
function formatFilterSummary(filters: AdvancedUserFilters): string[] {
  const summary: string[] = [];

  // Roles
  if (filters.roles?.length) {
    const roleLabels = filters.roles.map((role) => ROLE_LABELS[role]).join(", ");
    summary.push(`Vai trò: ${roleLabels}`);
  }

  // Statuses
  if (filters.statuses?.length) {
    const statusLabels = filters.statuses.map((status) => STATUS_LABELS[status]).join(", ");
    summary.push(`Trạng thái: ${statusLabels}`);
  }

  // Level range
  if (filters.levelRange?.min !== undefined || filters.levelRange?.max !== undefined) {
    const { min, max } = filters.levelRange;
    if (min !== undefined && max !== undefined) {
      summary.push(`Cấp độ: ${min} - ${max}`);
    } else if (min !== undefined) {
      summary.push(`Cấp độ: >= ${min}`);
    } else if (max !== undefined) {
      summary.push(`Cấp độ: <= ${max}`);
    }
  }

  // Registration date range
  if (filters.registrationDateRange?.from || filters.registrationDateRange?.to) {
    const { from, to } = filters.registrationDateRange;
    if (from && to) {
      summary.push(
        `Đăng ký: ${from.toLocaleDateString("vi-VN")} - ${to.toLocaleDateString("vi-VN")}`
      );
    } else if (from) {
      summary.push(`Đăng ký: từ ${from.toLocaleDateString("vi-VN")}`);
    } else if (to) {
      summary.push(`Đăng ký: đến ${to.toLocaleDateString("vi-VN")}`);
    }
  }

  // Email verification
  if (filters.emailVerified !== undefined) {
    summary.push(`Email: ${filters.emailVerified ? "đã xác thực" : "chưa xác thực"}`);
  }

  // Active session
  if (filters.hasActiveSession !== undefined) {
    summary.push(`Phiên: ${filters.hasActiveSession ? "có hoạt động" : "không hoạt động"}`);
  }

  // Risk score
  if (filters.riskScoreRange?.min !== undefined || filters.riskScoreRange?.max !== undefined) {
    const { min, max } = filters.riskScoreRange;
    if (min !== undefined && max !== undefined) {
      summary.push(`Rủi ro: ${min} - ${max}`);
    } else if (min !== undefined) {
      summary.push(`Rủi ro: >= ${min}`);
    } else if (max !== undefined) {
      summary.push(`Rủi ro: <= ${max}`);
    }
  }

  return summary;
}

/**
 * Check if preset matches current filters
 * Kiểm tra preset có khớp với filters hiện tại không
 */
function isPresetActive(preset: FilterPreset, currentFilters?: AdvancedUserFilters): boolean {
  if (!currentFilters) return false;

  // Simple comparison - could be more sophisticated
  return JSON.stringify(preset.filters) === JSON.stringify(currentFilters);
}

/**
 * Filter Presets Component
 * Component hiển thị và quản lý filter presets
 */
export function FilterPresets({
  presets,
  onApplyPreset,
  onDeletePreset,
  currentFilters,
  className = "",
}: FilterPresetsProps) {
  if (presets.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Chưa có preset nào</p>
        <p className="text-sm text-muted-foreground mt-1">
          Tạo preset để lưu các bộ lọc thường dùng
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {presets.map((preset) => {
        const isActive = isPresetActive(preset, currentFilters);
        const summary = formatFilterSummary(preset.filters);
        const icon = getPresetIcon(preset);

        return (
          <Card
            key={preset.id}
            className={`transition-all hover:shadow-md ${isActive ? "ring-2 ring-primary" : ""}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {icon}
                  <CardTitle className="text-sm">{preset.name}</CardTitle>
                  {preset.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      Mặc định
                    </Badge>
                  )}
                  {isActive && (
                    <Badge variant="default" className="text-xs">
                      Đang áp dụng
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onApplyPreset(preset.id)}
                    disabled={isActive}
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                  {!preset.isDefault && onDeletePreset && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeletePreset(preset.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              {preset.description && (
                <CardDescription className="text-xs">{preset.description}</CardDescription>
              )}
            </CardHeader>

            {summary.length > 0 && (
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1">
                  {summary.slice(0, 3).map((item, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                  {summary.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{summary.length - 3} khác
                    </Badge>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
