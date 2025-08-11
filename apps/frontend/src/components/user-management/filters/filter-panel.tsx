'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/form/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/display/separator';
import {
  Search,
  Filter,
  X,
  Shield,
  Users,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { AdminUser, AdvancedUserFilters } from '@/lib/mockdata/types';
import { UserRole, UserStatus } from '@/lib/mockdata/core-types';
import { searchUsers as searchUsersFromMock } from '@/lib/mockdata';

// ===== INTERFACES =====

/**
 * Props cho FilterPanel component
 */
interface FilterPanelProps {
  users: AdminUser[];                                           // Danh sách users để filter
  onFiltersChange: (filters: AdvancedUserFilters) => void;      // Callback khi filters thay đổi
  onSearchResults: (query: string, results: AdminUser[]) => void; // Callback khi có search results
  className?: string;
}

/**
 * Internal state cho filter values
 */
interface FilterState {
  search: string;
  selectedRoles: UserRole[];
  selectedStatuses: UserStatus[];
  emailVerified: boolean | null;
  levelMin: string;
  levelMax: string;
  riskScoreMin: string;
  riskScoreMax: string;
  isLocked: boolean | null;
  highRiskUsers: boolean | null;
  multipleSessionUsers: boolean | null;
}

// ===== CONSTANTS =====

/**
 * Role options cho select dropdown
 */
const ROLE_OPTIONS = [
  { value: UserRole.GUEST, label: 'Khách', color: 'bg-gray-100 text-gray-800' },
  { value: UserRole.STUDENT, label: 'Học sinh', color: 'bg-green-100 text-green-800' },
  { value: UserRole.TUTOR, label: 'Gia sư', color: 'bg-purple-100 text-purple-800' },
  { value: UserRole.TEACHER, label: 'Giáo viên', color: 'bg-blue-100 text-blue-800' },
  { value: UserRole.ADMIN, label: 'Quản trị viên', color: 'bg-red-100 text-red-800' },
];

/**
 * Status options cho select dropdown
 */
const STATUS_OPTIONS = [
  { value: UserStatus.ACTIVE, label: 'Hoạt động', color: 'bg-green-100 text-green-800' },
  { value: UserStatus.INACTIVE, label: 'Không hoạt động', color: 'bg-gray-100 text-gray-800' },
  { value: UserStatus.SUSPENDED, label: 'Tạm ngưng', color: 'bg-red-100 text-red-800' },
  { value: UserStatus.PENDING_VERIFICATION, label: 'Chờ xác thực', color: 'bg-yellow-100 text-yellow-800' },
];

/**
 * Default filter state
 */
const DEFAULT_FILTER_STATE: FilterState = {
  search: '',
  selectedRoles: [],
  selectedStatuses: [],
  emailVerified: null,
  levelMin: '',
  levelMax: '',
  riskScoreMin: '',
  riskScoreMax: '',
  isLocked: null,
  highRiskUsers: null,
  multipleSessionUsers: null,
};

// ===== MAIN COMPONENT =====

/**
 * Advanced Filter Panel cho User Management
 * Hỗ trợ filtering theo Enhanced User Model fields
 */
export function FilterPanel({
  onFiltersChange,
  onSearchResults,
  className = ''
}: FilterPanelProps) {
  // ===== STATES =====
  const [filterState, setFilterState] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // ===== COMPUTED VALUES =====
  
  /**
   * Check if có filters nào được áp dụng
   */
  const hasActiveFilters = useMemo(() => {
    return (
      filterState.search.length > 0 ||
      filterState.selectedRoles.length > 0 ||
      filterState.selectedStatuses.length > 0 ||
      filterState.emailVerified !== null ||
      filterState.levelMin !== '' ||
      filterState.levelMax !== '' ||
      filterState.riskScoreMin !== '' ||
      filterState.riskScoreMax !== '' ||
      filterState.isLocked !== null ||
      filterState.highRiskUsers !== null ||
      filterState.multipleSessionUsers !== null
    );
  }, [filterState]);

  /**
   * Count số active filters
   */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterState.search.length > 0) count++;
    if (filterState.selectedRoles.length > 0) count++;
    if (filterState.selectedStatuses.length > 0) count++;
    if (filterState.emailVerified !== null) count++;
    if (filterState.levelMin !== '' || filterState.levelMax !== '') count++;
    if (filterState.riskScoreMin !== '' || filterState.riskScoreMax !== '') count++;
    if (filterState.isLocked !== null) count++;
    if (filterState.highRiskUsers !== null) count++;
    if (filterState.multipleSessionUsers !== null) count++;
    return count;
  }, [filterState]);

  // ===== HELPER FUNCTIONS =====

  /**
   * Convert FilterState to AdvancedUserFilters
   */
  const convertToAdvancedFilters = useCallback((state: FilterState): AdvancedUserFilters => {
    return {
      search: state.search,
      roles: state.selectedRoles,
      statuses: state.selectedStatuses,
      emailVerified: state.emailVerified,
      levelRange: (state.levelMin !== '' || state.levelMax !== '') ? {
        min: state.levelMin !== '' ? parseInt(state.levelMin) : 1,
        max: state.levelMax !== '' ? parseInt(state.levelMax) : 9,
      } : null,
      riskScoreRange: (state.riskScoreMin !== '' || state.riskScoreMax !== '') ? {
        min: state.riskScoreMin !== '' ? parseInt(state.riskScoreMin) : 0,
        max: state.riskScoreMax !== '' ? parseInt(state.riskScoreMax) : 100,
      } : null,
      createdDateRange: null, // TODO: Implement date range picker
      lastLoginDateRange: null, // TODO: Implement date range picker
      isLocked: state.isLocked,
      highRiskUsers: state.highRiskUsers,
      multipleSessionUsers: state.multipleSessionUsers,
    };
  }, []);

  /**
   * Apply filters và notify parent
   */
  const applyFilters = useCallback(() => {
    const advancedFilters = convertToAdvancedFilters(filterState);
    onFiltersChange(advancedFilters);

    // Nếu có search term, thực hiện search
    if (filterState.search.trim()) {
      setIsSearching(true);
      try {
        const searchResults = searchUsersFromMock(filterState.search.trim());
        onSearchResults(filterState.search.trim(), searchResults);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }
  }, [filterState, convertToAdvancedFilters, onFiltersChange, onSearchResults]);

  /**
   * Clear all filters
   */
  const clearAllFilters = useCallback(() => {
    setFilterState(DEFAULT_FILTER_STATE);
    const defaultFilters = convertToAdvancedFilters(DEFAULT_FILTER_STATE);
    onFiltersChange(defaultFilters);
  }, [convertToAdvancedFilters, onFiltersChange]);

  // ===== EVENT HANDLERS =====

  /**
   * Handle search input change
   */
  const handleSearchChange = useCallback((value: string) => {
    setFilterState(prev => ({ ...prev, search: value }));
  }, []);

  /**
   * Handle role selection
   */
  const handleRoleToggle = useCallback((role: UserRole) => {
    setFilterState(prev => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(role)
        ? prev.selectedRoles.filter(r => r !== role)
        : [...prev.selectedRoles, role]
    }));
  }, []);

  /**
   * Handle status selection
   */
  const handleStatusToggle = useCallback((status: UserStatus) => {
    setFilterState(prev => ({
      ...prev,
      selectedStatuses: prev.selectedStatuses.includes(status)
        ? prev.selectedStatuses.filter(s => s !== status)
        : [...prev.selectedStatuses, status]
    }));
  }, []);

  /**
   * Handle email verified filter
   */
  const handleEmailVerifiedChange = useCallback((value: string) => {
    const emailVerified = value === 'all' ? null : value === 'verified';
    setFilterState(prev => ({ ...prev, emailVerified }));
  }, []);

  /**
   * Handle level range change
   */
  const handleLevelChange = useCallback((field: 'levelMin' | 'levelMax', value: string) => {
    setFilterState(prev => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Handle risk score range change
   */
  const handleRiskScoreChange = useCallback((field: 'riskScoreMin' | 'riskScoreMax', value: string) => {
    setFilterState(prev => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Handle security filters
   */
  const handleSecurityFilterChange = useCallback((
    field: 'isLocked' | 'highRiskUsers' | 'multipleSessionUsers',
    value: string
  ) => {
    const boolValue = value === 'all' ? null : value === 'true';
    setFilterState(prev => ({ ...prev, [field]: boolValue }));
  }, []);

  // ===== RENDER =====

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc nâng cao
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Xóa bộ lọc
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Thu gọn' : 'Mở rộng'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search Bar - Always visible */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, email, username..."
            value={filterState.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
          {isSearching && (
            <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Quick Filters - Always visible */}
        <div className="flex flex-wrap gap-2">
          {/* Role Badges */}
          {ROLE_OPTIONS.map((role) => (
            <Badge
              key={role.value}
              variant={filterState.selectedRoles.includes(role.value) ? "default" : "outline"}
              className={`cursor-pointer ${filterState.selectedRoles.includes(role.value) ? role.color : ''}`}
              onClick={() => handleRoleToggle(role.value)}
            >
              <Users className="h-3 w-3 mr-1" />
              {role.label}
            </Badge>
          ))}
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Trạng thái</Label>
                <div className="flex flex-wrap gap-1">
                  {STATUS_OPTIONS.map((status) => (
                    <Badge
                      key={status.value}
                      variant={filterState.selectedStatuses.includes(status.value) ? "default" : "outline"}
                      className={`cursor-pointer text-xs ${filterState.selectedStatuses.includes(status.value) ? status.color : ''}`}
                      onClick={() => handleStatusToggle(status.value)}
                    >
                      {status.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Email Verified Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email đã xác thực</Label>
                <Select
                  value={filterState.emailVerified === null ? 'all' : filterState.emailVerified ? 'verified' : 'unverified'}
                  onValueChange={handleEmailVerifiedChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="verified">Đã xác thực</SelectItem>
                    <SelectItem value="unverified">Chưa xác thực</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Level Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Cấp độ (Level)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    min="1"
                    max="9"
                    value={filterState.levelMin}
                    onChange={(e) => handleLevelChange('levelMin', e.target.value)}
                    className="w-20"
                  />
                  <span className="self-center text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    min="1"
                    max="9"
                    value={filterState.levelMax}
                    onChange={(e) => handleLevelChange('levelMax', e.target.value)}
                    className="w-20"
                  />
                </div>
              </div>

              {/* Risk Score Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Điểm rủi ro
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    min="0"
                    max="100"
                    value={filterState.riskScoreMin}
                    onChange={(e) => handleRiskScoreChange('riskScoreMin', e.target.value)}
                    className="w-20"
                  />
                  <span className="self-center text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    min="0"
                    max="100"
                    value={filterState.riskScoreMax}
                    onChange={(e) => handleRiskScoreChange('riskScoreMax', e.target.value)}
                    className="w-20"
                  />
                </div>
              </div>

              {/* Security Filters */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Bảo mật
                </Label>
                <div className="space-y-1">
                  <Select
                    value={filterState.isLocked === null ? 'all' : filterState.isLocked ? 'true' : 'false'}
                    onValueChange={(value) => handleSecurityFilterChange('isLocked', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tài khoản bị khóa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="true">Bị khóa</SelectItem>
                      <SelectItem value="false">Không bị khóa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* High Risk Users */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Người dùng rủi ro cao</Label>
                <Select
                  value={filterState.highRiskUsers === null ? 'all' : filterState.highRiskUsers ? 'true' : 'false'}
                  onValueChange={(value) => handleSecurityFilterChange('highRiskUsers', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="true">Rủi ro cao (&gt;70)</SelectItem>
                    <SelectItem value="false">Rủi ro thấp (≤70)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Apply Filters Button */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                disabled={!hasActiveFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Xóa tất cả
              </Button>
              <Button onClick={applyFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Áp dụng bộ lọc
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
