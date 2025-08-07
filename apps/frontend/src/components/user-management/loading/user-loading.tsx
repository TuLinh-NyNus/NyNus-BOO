'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/feedback/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

// ===== INTERFACES =====

/**
 * Props cho UserStatsLoading component
 */
interface UserStatsLoadingProps {
  className?: string;
}

/**
 * Props cho UserTableLoading component
 */
interface UserTableLoadingProps {
  rows?: number;           // Số rows để hiển thị skeleton (default: 10)
  className?: string;
}

/**
 * Props cho UserErrorState component
 */
interface UserErrorStateProps {
  error: string;           // Error message để hiển thị
  onRetry?: () => void;    // Callback khi user click retry
  className?: string;
}

/**
 * Props cho UserPaginationLoading component
 */
interface UserPaginationLoadingProps {
  className?: string;
}

// ===== USER STATS LOADING COMPONENT =====

/**
 * Loading skeleton cho user statistics cards
 */
export function UserStatsLoading({ className = '' }: UserStatsLoadingProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {/* Total Users Card Skeleton */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>

      {/* Active Users Card Skeleton */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-36" />
        </CardContent>
      </Card>

      {/* Suspended Users Card Skeleton */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-28" />
        </CardContent>
      </Card>

      {/* New Users Card Skeleton */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-40" />
        </CardContent>
      </Card>
    </div>
  );
}

// ===== USER TABLE LOADING COMPONENT =====

/**
 * Loading skeleton cho user table với virtual scrolling
 */
export function UserTableLoading({ rows = 10, className = '' }: UserTableLoadingProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Table Header Skeleton */}
        <div className="border rounded-lg">
          <div className="border-b bg-muted/50 p-4">
            <div className="grid grid-cols-6 gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          
          {/* Table Rows Skeleton */}
          <div className="divide-y">
            {Array.from({ length: rows }).map((_, index) => (
              <div key={index} className="p-4">
                <div className="grid grid-cols-6 gap-4 items-center">
                  {/* User Info */}
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  
                  {/* Role */}
                  <Skeleton className="h-6 w-16 rounded-full" />
                  
                  {/* Status */}
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  
                  {/* Last Login */}
                  <Skeleton className="h-4 w-28" />
                  
                  {/* Security Info */}
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== USER ERROR STATE COMPONENT =====

/**
 * Error state component cho user management
 */
export function UserErrorState({ 
  error, 
  onRetry, 
  className = '' 
}: UserErrorStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <div className="space-y-2">
              <p className="font-medium text-destructive">
                Có lỗi xảy ra khi tải dữ liệu người dùng
              </p>
              <p className="text-sm text-muted-foreground">
                {error}
              </p>
              {onRetry && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRetry}
                  className="mt-3"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Thử lại
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

// ===== USER PAGINATION LOADING COMPONENT =====

/**
 * Loading skeleton cho pagination controls
 */
export function UserPaginationLoading({ className = '' }: UserPaginationLoadingProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Page Info Skeleton */}
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-8" />
      </div>
      
      {/* Pagination Controls Skeleton */}
      <div className="flex items-center space-x-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-20" />
      </div>
      
      {/* Items per page Skeleton */}
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-16" />
      </div>
    </div>
  );
}

// ===== COMBINED LOADING COMPONENT =====

/**
 * Combined loading component cho toàn bộ user management page
 */
export function UserManagementLoading() {
  return (
    <div className="space-y-6">
      {/* Stats Loading */}
      <UserStatsLoading />
      
      {/* Filters Loading */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-9 w-24" />
          </div>
        </CardContent>
      </Card>
      
      {/* Table Loading */}
      <UserTableLoading />
      
      {/* Pagination Loading */}
      <UserPaginationLoading />
    </div>
  );
}

// ===== EXPORTS =====

const UserLoadingComponents = {
  UserStatsLoading,
  UserTableLoading,
  UserErrorState,
  UserPaginationLoading,
  UserManagementLoading,
};

export default UserLoadingComponents;
