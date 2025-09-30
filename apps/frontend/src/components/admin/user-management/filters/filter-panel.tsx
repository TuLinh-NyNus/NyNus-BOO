/**
 * Advanced Filter Panel Component
 * Component panel filter nâng cao cho user management
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import { Input } from "@/components/ui/form/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/form/select";
import { Label } from "@/components/ui/form/label";
import {
  Filter,
  Search,
  Calendar,
  Users,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { UserRole } from "@/lib/mockdata/core-types";
import { type UserFilterOptions } from "@/lib/mockdata/user-management";

/**
 * User role labels mapping
 */
const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.GUEST]: "Khách",
  [UserRole.STUDENT]: "Học viên",
  [UserRole.TUTOR]: "Trợ giảng",
  [UserRole.TEACHER]: "Giảng viên",
  [UserRole.ADMIN]: "Quản trị viên",
};

/**
 * Filter Panel Props
 */
interface FilterPanelProps {
  filters: UserFilterOptions;
  onFiltersChange: (filters: UserFilterOptions) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  className?: string;
}

/**
 * Default filter values
 */
const DEFAULT_FILTERS: UserFilterOptions = {
  roles: [],
  statuses: [],
  dateRange: {
    from: '',
    to: '',
  },
  riskLevels: [],
  activityLevel: 'ALL',
  emailVerified: undefined,
};

/**
 * Advanced Filter Panel Component
 */
export function FilterPanel({
  filters,
  onFiltersChange,
  onApplyFilters,
  onResetFilters,
  className = "",
}: FilterPanelProps) {
  // State management
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<UserFilterOptions>(filters);

  /**
   * Handle filter change
   */
  const handleFilterChange = (key: keyof UserFilterOptions, value: unknown) => {
    const updatedFilters = { ...localFilters, [key]: value };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  /**
   * Handle role selection
   */
  const handleRoleToggle = (role: UserRole) => {
    const currentRoles = localFilters.roles || [];
    const updatedRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];
    
    handleFilterChange('roles', updatedRoles);
  };

  /**
   * Handle status selection
   */
  const handleStatusToggle = (status: string) => {
    const currentStatuses = localFilters.statuses || [];
    const updatedStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    handleFilterChange('statuses', updatedStatuses);
  };

  /**
   * Handle risk level selection
   */
  const handleRiskLevelToggle = (riskLevel: string) => {
    const currentRiskLevels = localFilters.riskLevels || [];
    const updatedRiskLevels = currentRiskLevels.includes(riskLevel)
      ? currentRiskLevels.filter(r => r !== riskLevel)
      : [...currentRiskLevels, riskLevel];
    
    handleFilterChange('riskLevels', updatedRiskLevels);
  };

  /**
   * Reset to default filters
   */
  const handleReset = () => {
    setLocalFilters(DEFAULT_FILTERS);
    onFiltersChange(DEFAULT_FILTERS);
    onResetFilters();
  };

  /**
   * Get active filter count
   */
  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.roles?.length) count++;
    if (localFilters.statuses?.length) count++;
    if (localFilters.riskLevels?.length) count++;
    if (localFilters.dateRange?.from || localFilters.dateRange?.to) count++;
    if (localFilters.activityLevel !== 'ALL') count++;
    if (localFilters.emailVerified !== undefined) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Advanced Filters</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount} active</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription>
          Filter users theo role, status, activity và các tiêu chí khác
        </CardDescription>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Role Filters */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Roles
            </Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(USER_ROLE_LABELS).map(([role, label]) => (
                <Button
                  key={role}
                  variant={localFilters.roles?.includes(role as UserRole) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRoleToggle(role as UserRole)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Status Filters */}
          <div className="space-y-3">
            <Label>User Status</Label>
            <div className="flex flex-wrap gap-2">
              {['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'].map((status) => (
                <Button
                  key={status}
                  variant={localFilters.statuses?.includes(status) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusToggle(status)}
                >
                  {status === 'ACTIVE' && 'Hoạt động'}
                  {status === 'SUSPENDED' && 'Tạm khóa'}
                  {status === 'PENDING_VERIFICATION' && 'Chờ xác thực'}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Range
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="date-from" className="text-xs">From</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={localFilters.dateRange?.from || ''}
                  onChange={(e) => handleFilterChange('dateRange', {
                    ...localFilters.dateRange,
                    from: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="date-to" className="text-xs">To</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={localFilters.dateRange?.to || ''}
                  onChange={(e) => handleFilterChange('dateRange', {
                    ...localFilters.dateRange,
                    to: e.target.value
                  })}
                />
              </div>
            </div>
          </div>

          {/* Risk Levels */}
          <div className="space-y-3">
            <Label>Risk Levels</Label>
            <div className="flex flex-wrap gap-2">
              {['LOW', 'MEDIUM', 'HIGH'].map((riskLevel) => (
                <Button
                  key={riskLevel}
                  variant={localFilters.riskLevels?.includes(riskLevel) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRiskLevelToggle(riskLevel)}
                >
                  {riskLevel === 'LOW' && 'Thấp'}
                  {riskLevel === 'MEDIUM' && 'Trung bình'}
                  {riskLevel === 'HIGH' && 'Cao'}
                </Button>
              ))}
            </div>
          </div>

          {/* Activity Level */}
          <div className="space-y-3">
            <Label>Activity Level</Label>
            <Select
              value={localFilters.activityLevel}
              onValueChange={(value) => handleFilterChange('activityLevel', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email Verification */}
          <div className="space-y-3">
            <Label>Email Verification</Label>
            <Select
              value={localFilters.emailVerified?.toString() || 'all'}
              onValueChange={(value) => 
                handleFilterChange('emailVerified', 
                  value === 'all' ? undefined : value === 'true'
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="true">Đã xác thực</SelectItem>
                <SelectItem value="false">Chưa xác thực</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <Button onClick={onApplyFilters} className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
