/**
 * Dashboard Header Component
 * Header component cho admin dashboard với refresh controls và status
 */

'use client';

import React from 'react';
import { RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';

import { Button } from '@/components/ui/form/button';
import { Badge } from '@/components/ui/display/badge';

/**
 * Dashboard Header Props
 * Props cho DashboardHeader component
 */
export interface DashboardHeaderProps {
  isLoading?: boolean; // Đang loading data
  isRefreshing?: boolean; // Đang refresh data
  lastUpdated?: Date | null; // Thời gian update cuối
  refreshCount?: number; // Số lần đã refresh
  error?: string | null; // Error message nếu có
  onRefresh?: () => void; // Callback khi click refresh
}

/**
 * Format time ago
 * Format thời gian thành "X phút trước"
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return 'Vừa xong';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  } else if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  } else {
    return `${diffDays} ngày trước`;
  }
}

/**
 * Dashboard Header Component
 * Component hiển thị header của dashboard với controls và status
 */
export function DashboardHeader({
  isLoading = false,
  isRefreshing = false,
  lastUpdated = null,
  refreshCount = 0,
  error = null,
  onRefresh
}: DashboardHeaderProps) {
  
  /**
   * Get status badge
   * Lấy status badge dựa trên trạng thái hiện tại
   */
  const getStatusBadge = () => {
    if (error) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Lỗi
        </Badge>
      );
    }

    if (isLoading || isRefreshing) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <RefreshCw className="h-3 w-3 animate-spin" />
          {isLoading ? 'Đang tải' : 'Đang cập nhật'}
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle className="h-3 w-3" />
        Hoạt động
      </Badge>
    );
  };

  /**
   * Get last updated text
   * Lấy text hiển thị thời gian update cuối
   */
  const getLastUpdatedText = () => {
    if (!lastUpdated) {
      return 'Chưa cập nhật';
    }

    return formatTimeAgo(lastUpdated);
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-white/10">
      {/* Left section - Title and description */}
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-xl font-bold text-white">
            Dashboard Admin
          </h1>
          <p className="text-sm text-white/70">
            Tổng quan hệ thống và thống kê hoạt động
          </p>
        </div>

        {/* Status info */}
        <div className="flex items-center gap-4 text-sm text-white/70">
          {/* Last Updated */}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-blue-300" />
            <span>Cập nhật: {getLastUpdatedText()}</span>
          </div>

          {/* Refresh Count */}
          {refreshCount > 0 && (
            <div className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4 text-emerald-300" />
              <span>Đã làm mới {refreshCount} lần</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-1 text-red-300">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right section - Status and actions */}
      <div className="flex items-center gap-3">
        {/* Status Badge */}
        {getStatusBadge()}

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading || isRefreshing}
          className="flex items-center gap-2 border-white/20 text-white hover:bg-white/10"
        >
          <RefreshCw
            className={`h-4 w-4 ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`}
          />
          Làm mới
        </Button>
      </div>
    </div>
  );
}

/**
 * Default export
 */
export default DashboardHeader;
