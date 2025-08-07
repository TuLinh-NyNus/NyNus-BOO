/**
 * Saved Filters Component
 * Component quản lý saved filters
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
import { Bookmark, Play, Trash2, Globe, Lock, Clock, User } from "lucide-react";

import {
  SavedFilterConfig,
  AdvancedUserFilters,
  ROLE_LABELS,
  STATUS_LABELS,
} from "../../../types/user-filters";

/**
 * Saved Filters Props
 * Props cho Saved Filters component
 */
interface SavedFiltersProps {
  savedFilters: SavedFilterConfig[];
  onApplySavedFilter: (filterId: string) => void;
  onDeleteSavedFilter?: (filterId: string) => void;
  currentFilters?: AdvancedUserFilters;
  currentUserId?: string;
  className?: string;
}

/**
 * Format filter summary for display
 * Format tóm tắt filter để hiển thị
 */
function formatFilterSummary(filters: AdvancedUserFilters): string[] {
  const summary: string[] = [];

  // Search
  if (filters.search?.trim()) {
    summary.push(`Tìm kiếm: "${filters.search}"`);
  }

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
      const fromStr = from.toLocaleDateString("vi-VN");
      const toStr = to.toLocaleDateString("vi-VN");
      summary.push(`Đăng ký: ${fromStr} - ${toStr}`);
    } else if (from) {
      summary.push(`Đăng ký: từ ${from.toLocaleDateString("vi-VN")}`);
    } else if (to) {
      summary.push(`Đăng ký: đến ${to.toLocaleDateString("vi-VN")}`);
    }
  }

  // Last login date range
  if (filters.lastLoginDateRange?.from || filters.lastLoginDateRange?.to) {
    const { from, to } = filters.lastLoginDateRange;
    if (from && to) {
      const fromStr = from.toLocaleDateString("vi-VN");
      const toStr = to.toLocaleDateString("vi-VN");
      summary.push(`Đăng nhập: ${fromStr} - ${toStr}`);
    } else if (from) {
      summary.push(`Đăng nhập: từ ${from.toLocaleDateString("vi-VN")}`);
    } else if (to) {
      summary.push(`Đăng nhập: đến ${to.toLocaleDateString("vi-VN")}`);
    }
  }

  // Boolean filters
  if (filters.emailVerified !== undefined) {
    summary.push(`Email: ${filters.emailVerified ? "đã xác thực" : "chưa xác thực"}`);
  }

  if (filters.hasActiveSession !== undefined) {
    summary.push(`Phiên: ${filters.hasActiveSession ? "có hoạt động" : "không hoạt động"}`);
  }

  // Risk score range
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
 * Check if saved filter matches current filters
 * Kiểm tra saved filter có khớp với filters hiện tại không
 */
function isSavedFilterActive(
  savedFilter: SavedFilterConfig,
  currentFilters?: AdvancedUserFilters
): boolean {
  if (!currentFilters) return false;

  // Simple comparison - could be more sophisticated
  return JSON.stringify(savedFilter.filters) === JSON.stringify(currentFilters);
}

/**
 * Format time ago
 * Format thời gian trước đây
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} phút trước`;
    }
    return `${diffHours} giờ trước`;
  } else if (diffDays === 1) {
    return "Hôm qua";
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else if (diffDays < 30) {
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} tuần trước`;
  } else {
    return date.toLocaleDateString("vi-VN");
  }
}

/**
 * Saved Filters Component
 * Component hiển thị và quản lý saved filters
 */
export function SavedFilters({
  savedFilters,
  onApplySavedFilter,
  onDeleteSavedFilter,
  currentFilters,
  currentUserId = "current-user",
  className = "",
}: SavedFiltersProps) {
  if (savedFilters.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Chưa có filter nào được lưu</p>
        <p className="text-sm text-muted-foreground mt-1">Lưu các bộ lọc để sử dụng lại sau này</p>
      </div>
    );
  }

  // Sort saved filters by usage count and last used date
  const sortedFilters = [...savedFilters].sort((a, b) => {
    // First by usage count (descending)
    if (a.usageCount !== b.usageCount) {
      return b.usageCount - a.usageCount;
    }

    // Then by last used date (descending)
    if (a.lastUsedAt && b.lastUsedAt) {
      return b.lastUsedAt.getTime() - a.lastUsedAt.getTime();
    } else if (a.lastUsedAt) {
      return -1;
    } else if (b.lastUsedAt) {
      return 1;
    }

    // Finally by created date (descending)
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <div className={`space-y-3 ${className}`}>
      {sortedFilters.map((savedFilter) => {
        const isActive = isSavedFilterActive(savedFilter, currentFilters);
        const summary = formatFilterSummary(savedFilter.filters);
        const isOwner = savedFilter.createdBy === currentUserId;
        const canDelete = isOwner || savedFilter.isPublic;

        return (
          <Card
            key={savedFilter.id}
            className={`transition-all hover:shadow-md ${isActive ? "ring-2 ring-primary" : ""}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-blue-500" />
                  <CardTitle className="text-sm">{savedFilter.name}</CardTitle>

                  {/* Visibility Badge */}
                  {savedFilter.isPublic ? (
                    <Badge variant="outline" className="text-xs">
                      <Globe className="h-2 w-2 mr-1" />
                      Công khai
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      <Lock className="h-2 w-2 mr-1" />
                      Riêng tư
                    </Badge>
                  )}

                  {/* Active Badge */}
                  {isActive && (
                    <Badge variant="default" className="text-xs">
                      Đang áp dụng
                    </Badge>
                  )}

                  {/* Owner Badge */}
                  {isOwner && (
                    <Badge variant="secondary" className="text-xs">
                      <User className="h-2 w-2 mr-1" />
                      Của tôi
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onApplySavedFilter(savedFilter.id)}
                    disabled={isActive}
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                  {canDelete && onDeleteSavedFilter && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteSavedFilter(savedFilter.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {savedFilter.description && (
                <CardDescription className="text-xs">{savedFilter.description}</CardDescription>
              )}
            </CardHeader>

            <CardContent className="pt-0">
              {/* Filter Summary */}
              {summary.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
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
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(savedFilter.createdAt)}
                  </span>
                  {savedFilter.usageCount > 0 && <span>Đã dùng {savedFilter.usageCount} lần</span>}
                  {savedFilter.lastUsedAt && (
                    <span>Dùng lần cuối: {formatTimeAgo(savedFilter.lastUsedAt)}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
