/**
 * Advanced Filter Panel Component
 * Component panel filter nâng cao cho user management
 */

"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import {
  Filter,
  X,
  Search,
  Calendar,
  Users,
  Settings,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { useAdvancedUserFilters } from "../../../hooks/use-advanced-user-filters";
import {
  AdvancedUserFilters,
  ROLE_LABELS,
  STATUS_LABELS,
  SORT_FIELD_LABELS,
  UserRole,
  UserStatus,
} from "../../../types/user-filters";
import { AdminUser } from "../../../types/admin-user";
import { DateRangePicker } from "./date-range-picker";
import { FilterPresets } from "./filter-presets";
import { SavedFilters } from "./saved-filters";
import { EnhancedSearch } from "../search/enhanced-search";

/**
 * Filter Panel Props
 * Props cho Filter Panel component
 */
interface FilterPanelProps {
  users?: AdminUser[];
  onFiltersChange?: (filters: AdvancedUserFilters) => void;
  onSearchResults?: (query: string, results: AdminUser[]) => void;
  className?: string;
}

/**
 * Advanced Filter Panel Component
 * Component panel filter nâng cao
 */
export function FilterPanel({
  users = [],
  onFiltersChange,
  onSearchResults,
  className = "",
}: FilterPanelProps) {
  const {
    filters,
    activeFiltersCount,
    hasActiveFilters,
    presets,
    savedFilters,
    uiState,
    updateFilters,
    clearFilters,
    resetFilters,
    applyPreset,
    saveAsPreset,
    applySavedFilter,
    saveCurrentFilters,
    updateUIState,
    toggleFilterPanel,
  } = useAdvancedUserFilters({
    enableUrlPersistence: true,
    onFiltersChange,
  });

  const [savePresetName, setSavePresetName] = useState("");
  const [saveFilterName, setSaveFilterName] = useState("");

  /**
   * Handle role selection
   * Xử lý chọn role
   */
  const handleRoleChange = (role: string) => {
    const currentRoles = filters.roles || [];
    let newRoles: UserRole[];

    if (role === "all") {
      newRoles = [];
    } else if (currentRoles.includes(role as UserRole)) {
      newRoles = currentRoles.filter((r) => r !== role);
    } else {
      newRoles = [...currentRoles, role as UserRole];
    }

    updateFilters({ roles: newRoles.length > 0 ? newRoles : undefined });
  };

  /**
   * Handle status selection
   * Xử lý chọn status
   */
  const handleStatusChange = (status: string) => {
    const currentStatuses = filters.statuses || [];
    let newStatuses: UserStatus[];

    if (status === "all") {
      newStatuses = [];
    } else if (currentStatuses.includes(status as UserStatus)) {
      newStatuses = currentStatuses.filter((s) => s !== status);
    } else {
      newStatuses = [...currentStatuses, status as UserStatus];
    }

    updateFilters({ statuses: newStatuses.length > 0 ? newStatuses : undefined });
  };

  /**
   * Handle level range change
   * Xử lý thay đổi level range
   */
  const handleLevelRangeChange = (type: "min" | "max", value: string) => {
    const numValue = value ? parseInt(value) : undefined;
    const currentRange = filters.levelRange || {};

    updateFilters({
      levelRange: {
        ...currentRange,
        [type]: numValue,
      },
    });
  };

  /**
   * Handle save preset
   * Xử lý lưu preset
   */
  const handleSavePreset = () => {
    if (!savePresetName.trim()) return;

    saveAsPreset(savePresetName.trim());
    setSavePresetName("");
  };

  /**
   * Handle save filter
   * Xử lý lưu filter
   */
  const handleSaveFilter = () => {
    if (!saveFilterName.trim()) return;

    saveCurrentFilters(saveFilterName.trim());
    setSaveFilterName("");
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Bộ lọc nâng cao
            </CardTitle>
            {hasActiveFilters && <Badge variant="secondary">{activeFiltersCount} bộ lọc</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={clearFilters} disabled={!hasActiveFilters}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Xóa tất cả
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleFilterPanel}>
              {uiState.isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <CardDescription>Lọc người dùng theo nhiều tiêu chí khác nhau</CardDescription>
      </CardHeader>

      {uiState.isExpanded && (
        <CardContent>
          <Tabs
            value={uiState.activeTab}
            onValueChange={(value) => updateUIState({ activeTab: value as any })}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Cơ bản</TabsTrigger>
              <TabsTrigger value="advanced">Nâng cao</TabsTrigger>
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="saved">Đã lưu</TabsTrigger>
            </TabsList>

            {/* Basic Filters Tab */}
            <TabsContent value="basic" className="space-y-4">
              {/* Enhanced Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Tìm kiếm nâng cao</Label>
                <EnhancedSearch
                  users={users}
                  value={filters.search || ""}
                  onChange={(value) => updateFilters({ search: value || undefined })}
                  onSearch={onSearchResults}
                  placeholder="Tìm kiếm theo email, tên hoặc vai trò..."
                />
              </div>

              {/* Roles */}
              <div className="space-y-2">
                <Label>Vai trò</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ROLE_LABELS).map(([role, label]) => (
                    <Button
                      key={role}
                      variant={filters.roles?.includes(role as UserRole) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleRoleChange(role)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Statuses */}
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_LABELS).map(([status, label]) => (
                    <Button
                      key={status}
                      variant={
                        filters.statuses?.includes(status as UserStatus) ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleStatusChange(status)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sắp xếp theo</Label>
                  <Select
                    value={filters.sort?.field || "createdAt"}
                    onValueChange={(value) =>
                      updateFilters({
                        sort: {
                          field: value as any,
                          direction: filters.sort?.direction || "desc",
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SORT_FIELD_LABELS).map(([field, label]) => (
                        <SelectItem key={field} value={field}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Thứ tự</Label>
                  <Select
                    value={filters.sort?.direction || "desc"}
                    onValueChange={(value) =>
                      updateFilters({
                        sort: {
                          field: filters.sort?.field || "createdAt",
                          direction: value as any,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Tăng dần</SelectItem>
                      <SelectItem value="desc">Giảm dần</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Advanced Filters Tab */}
            <TabsContent value="advanced" className="space-y-4">
              {/* Level Range */}
              <div className="space-y-2">
                <Label>Cấp độ</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="level-min" className="text-sm text-muted-foreground">
                      Tối thiểu
                    </Label>
                    <Input
                      id="level-min"
                      type="number"
                      placeholder="0"
                      value={filters.levelRange?.min || ""}
                      onChange={(e) => handleLevelRangeChange("min", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="level-max" className="text-sm text-muted-foreground">
                      Tối đa
                    </Label>
                    <Input
                      id="level-max"
                      type="number"
                      placeholder="100"
                      value={filters.levelRange?.max || ""}
                      onChange={(e) => handleLevelRangeChange("max", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Registration Date Range */}
              <div className="space-y-2">
                <Label>Ngày đăng ký</Label>
                <DateRangePicker
                  value={filters.registrationDateRange}
                  onChange={(range) => updateFilters({ registrationDateRange: range })}
                  placeholder="Chọn khoảng thời gian đăng ký"
                />
              </div>

              {/* Last Login Date Range */}
              <div className="space-y-2">
                <Label>Đăng nhập cuối</Label>
                <DateRangePicker
                  value={filters.lastLoginDateRange}
                  onChange={(range) => updateFilters({ lastLoginDateRange: range })}
                  placeholder="Chọn khoảng thời gian đăng nhập cuối"
                />
              </div>

              {/* Boolean Filters */}
              <div className="space-y-2">
                <Label>Tùy chọn khác</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={filters.emailVerified === true ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        updateFilters({
                          emailVerified: filters.emailVerified === true ? undefined : true,
                        })
                      }
                    >
                      Email đã xác thực
                    </Button>
                    <Button
                      variant={filters.emailVerified === false ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        updateFilters({
                          emailVerified: filters.emailVerified === false ? undefined : false,
                        })
                      }
                    >
                      Email chưa xác thực
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={filters.hasActiveSession === true ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        updateFilters({
                          hasActiveSession: filters.hasActiveSession === true ? undefined : true,
                        })
                      }
                    >
                      Có phiên hoạt động
                    </Button>
                    <Button
                      variant={filters.hasActiveSession === false ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        updateFilters({
                          hasActiveSession: filters.hasActiveSession === false ? undefined : false,
                        })
                      }
                    >
                      Không có phiên hoạt động
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Presets Tab */}
            <TabsContent value="presets" className="space-y-4">
              <FilterPresets
                presets={presets}
                onApplyPreset={applyPreset}
                currentFilters={filters}
              />

              {/* Save Current as Preset */}
              {hasActiveFilters && (
                <div className="border-t pt-4">
                  <Label htmlFor="preset-name">Lưu bộ lọc hiện tại thành preset</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="preset-name"
                      placeholder="Tên preset..."
                      value={savePresetName}
                      onChange={(e) => setSavePresetName(e.target.value)}
                    />
                    <Button onClick={handleSavePreset} disabled={!savePresetName.trim()}>
                      <Save className="h-3 w-3 mr-1" />
                      Lưu
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Saved Filters Tab */}
            <TabsContent value="saved" className="space-y-4">
              <SavedFilters
                savedFilters={savedFilters}
                onApplySavedFilter={applySavedFilter}
                currentFilters={filters}
              />

              {/* Save Current Filter */}
              {hasActiveFilters && (
                <div className="border-t pt-4">
                  <Label htmlFor="filter-name">Lưu bộ lọc hiện tại</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="filter-name"
                      placeholder="Tên bộ lọc..."
                      value={saveFilterName}
                      onChange={(e) => setSaveFilterName(e.target.value)}
                    />
                    <Button onClick={handleSaveFilter} disabled={!saveFilterName.trim()}>
                      <Save className="h-3 w-3 mr-1" />
                      Lưu
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}
