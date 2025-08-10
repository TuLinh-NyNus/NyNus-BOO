/**
 * Filter Presets Component
 * Component quản lý filter presets cho user management
 */

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu";
import { 
  Bookmark, 
  BookmarkPlus, 
  ChevronDown, 
  Users, 
  Shield, 
  AlertTriangle,
  Clock,
  Star,
  Trash2
} from "lucide-react";

import { UserRole } from "@/lib/mockdata/core-types";
import { type UserFilterOptions } from "@/lib/mockdata/user-management";

/**
 * Filter preset interface
 */
interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: UserFilterOptions;
  isDefault?: boolean;
  icon?: React.ReactNode;
  color?: string;
}

/**
 * Filter Presets Props
 */
interface FilterPresetsProps {
  currentFilters: UserFilterOptions;
  onApplyPreset: (filters: UserFilterOptions) => void;
  onSavePreset?: (name: string, filters: UserFilterOptions) => void;
  className?: string;
}

/**
 * Predefined filter presets
 */
const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'all-users',
    name: 'Tất cả Users',
    description: 'Hiển thị tất cả users trong hệ thống',
    filters: {
      roles: [],
      statuses: [],
      dateRange: { from: '', to: '' },
      riskLevels: [],
      activityLevel: 'ALL',
    },
    isDefault: true,
    icon: <Users className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'active-students',
    name: 'Học viên Hoạt động',
    description: 'Học viên đang hoạt động và đã xác thực email',
    filters: {
      roles: [UserRole.STUDENT],
      statuses: ['ACTIVE'],
      dateRange: { from: '', to: '' },
      riskLevels: [],
      activityLevel: 'ACTIVE',
      emailVerified: true,
    },
    icon: <Users className="h-4 w-4" />,
    color: 'bg-green-100 text-green-800',
  },
  {
    id: 'teachers-tutors',
    name: 'Giảng viên & Trợ giảng',
    description: 'Tất cả giảng viên và trợ giảng',
    filters: {
      roles: [UserRole.TEACHER, UserRole.TUTOR],
      statuses: [],
      dateRange: { from: '', to: '' },
      riskLevels: [],
      activityLevel: 'ALL',
    },
    icon: <Shield className="h-4 w-4" />,
    color: 'bg-purple-100 text-purple-800',
  },
  {
    id: 'high-risk-users',
    name: 'Users Rủi ro Cao',
    description: 'Users có risk score cao cần theo dõi',
    filters: {
      roles: [],
      statuses: [],
      dateRange: { from: '', to: '' },
      riskLevels: ['HIGH'],
      activityLevel: 'ALL',
    },
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'bg-red-100 text-red-800',
  },
  {
    id: 'suspended-users',
    name: 'Users Bị Khóa',
    description: 'Users đang bị tạm khóa hoặc chờ xác thực',
    filters: {
      roles: [],
      statuses: ['SUSPENDED', 'PENDING_VERIFICATION'],
      dateRange: { from: '', to: '' },
      riskLevels: [],
      activityLevel: 'ALL',
    },
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'bg-orange-100 text-orange-800',
  },
  {
    id: 'recent-users',
    name: 'Users Mới',
    description: 'Users đăng ký trong 30 ngày qua',
    filters: {
      roles: [],
      statuses: [],
      dateRange: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
      },
      riskLevels: [],
      activityLevel: 'ALL',
    },
    icon: <Clock className="h-4 w-4" />,
    color: 'bg-cyan-100 text-cyan-800',
  },
];

/**
 * Filter Presets Component
 */
export function FilterPresets({
  currentFilters,
  onApplyPreset,
  onSavePreset,
  className = "",
}: FilterPresetsProps) {
  const [customPresets, setCustomPresets] = useState<FilterPreset[]>([]);

  /**
   * Handle preset application
   */
  const handleApplyPreset = (preset: FilterPreset) => {
    onApplyPreset(preset.filters);
  };

  /**
   * Handle save current filters as preset
   */
  const handleSaveCurrentAsPreset = () => {
    if (!onSavePreset) return;

    const name = prompt('Nhập tên cho filter preset:');
    if (name) {
      const newPreset: FilterPreset = {
        id: `custom-${Date.now()}`,
        name,
        description: 'Custom filter preset',
        filters: currentFilters,
        icon: <Star className="h-4 w-4" />,
        color: 'bg-yellow-100 text-yellow-800',
      };
      
      setCustomPresets(prev => [...prev, newPreset]);
      onSavePreset(name, currentFilters);
    }
  };

  /**
   * Handle delete custom preset
   */
  const handleDeletePreset = (presetId: string) => {
    setCustomPresets(prev => prev.filter(p => p.id !== presetId));
  };

  /**
   * Get active preset
   */
  const getActivePreset = () => {
    const allPresets = [...DEFAULT_PRESETS, ...customPresets];
    return allPresets.find(preset => 
      JSON.stringify(preset.filters) === JSON.stringify(currentFilters)
    );
  };

  /**
   * Check if filters have any active values
   */
  const hasActiveFilters = () => {
    return (
      (currentFilters.roles?.length || 0) > 0 ||
      (currentFilters.statuses?.length || 0) > 0 ||
      (currentFilters.riskLevels?.length || 0) > 0 ||
      currentFilters.dateRange?.from ||
      currentFilters.dateRange?.to ||
      currentFilters.activityLevel !== 'ALL' ||
      currentFilters.emailVerified !== undefined
    );
  };

  const activePreset = getActivePreset();
  // const allPresets = [...DEFAULT_PRESETS, ...customPresets];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Quick Preset Buttons */}
      <div className="flex items-center gap-1">
        {DEFAULT_PRESETS.slice(0, 3).map((preset) => (
          <Button
            key={preset.id}
            variant={activePreset?.id === preset.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleApplyPreset(preset)}
            className="flex items-center gap-1"
          >
            {preset.icon}
            <span className="hidden sm:inline">{preset.name}</span>
          </Button>
        ))}
      </div>

      {/* Preset Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Bookmark className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">
              {activePreset ? activePreset.name : 'Presets'}
            </span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Filter Presets</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Default Presets */}
          {DEFAULT_PRESETS.map((preset) => (
            <DropdownMenuItem
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2 flex-1">
                {preset.icon}
                <div>
                  <div className="font-medium">{preset.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {preset.description}
                  </div>
                </div>
              </div>
              {activePreset?.id === preset.id && (
                <Badge variant="secondary" className="text-xs">Active</Badge>
              )}
            </DropdownMenuItem>
          ))}

          {/* Custom Presets */}
          {customPresets.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Custom Presets</DropdownMenuLabel>
              {customPresets.map((preset) => (
                <DropdownMenuItem
                  key={preset.id}
                  className="flex items-center gap-2"
                >
                  <div 
                    className="flex items-center gap-2 flex-1 cursor-pointer"
                    onClick={() => handleApplyPreset(preset)}
                  >
                    {preset.icon}
                    <div>
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {preset.description}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePreset(preset.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </DropdownMenuItem>
              ))}
            </>
          )}

          {/* Save Current Filters */}
          {hasActiveFilters() && onSavePreset && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSaveCurrentAsPreset}>
                <BookmarkPlus className="h-4 w-4 mr-2" />
                Save Current Filters
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active Preset Indicator */}
      {activePreset && (
        <Badge className={activePreset.color}>
          {activePreset.icon}
          <span className="ml-1">{activePreset.name}</span>
        </Badge>
      )}
    </div>
  );
}
