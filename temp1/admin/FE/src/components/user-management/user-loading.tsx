/**
 * User Loading Components
 * Components loading states cho user management
 */

"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";

/**
 * User Stats Loading
 * Loading skeleton cho user statistics
 */
export function UserStatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * User Table Loading
 * Loading skeleton cho user table
 */
export function UserTableLoading({ rows = 10 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-muted animate-pulse rounded mb-2" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        {/* Filters Loading */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1">
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-10 w-[180px] bg-muted animate-pulse rounded" />
          <div className="h-10 w-[180px] bg-muted animate-pulse rounded" />
        </div>

        {/* Table Loading */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </TableHead>
              <TableHead>
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              </TableHead>
              <TableHead>
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </TableHead>
              <TableHead>
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </TableHead>
              <TableHead>
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              </TableHead>
              <TableHead>
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-12 bg-muted animate-pulse rounded" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="h-5 w-20 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination Loading */}
        <div className="flex items-center justify-between mt-6">
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * User Search Loading
 * Loading state cho search functionality
 */
export function UserSearchLoading() {
  return (
    <div className="flex items-center space-x-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <div className="h-10 bg-muted animate-pulse rounded" />
        </div>
      </div>
      <div className="h-10 w-[180px] bg-muted animate-pulse rounded" />
      <div className="h-10 w-[180px] bg-muted animate-pulse rounded" />
      <div className="h-10 w-24 bg-muted animate-pulse rounded" />
    </div>
  );
}

/**
 * User Detail Modal Loading
 * Loading state cho user detail modal
 */
export function UserDetailModalLoading() {
  return (
    <div className="space-y-6">
      {/* Tabs Loading */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <div className="h-8 w-20 bg-background animate-pulse rounded" />
        <div className="h-8 w-20 bg-muted-foreground/10 animate-pulse rounded" />
        <div className="h-8 w-20 bg-muted-foreground/10 animate-pulse rounded" />
      </div>

      {/* Content Loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activity Summary Card */}
        <Card>
          <CardHeader>
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * User Activity Loading
 * Loading state cho user activity timeline
 */
export function UserActivityLoading({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
          <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-3 w-16 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-3 w-48 bg-muted animate-pulse rounded" />
            <div className="h-3 w-24 bg-muted animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * User Management Page Loading
 * Loading state cho entire user management page
 */
export function UserManagementPageLoading() {
  return (
    <div className="space-y-8">
      {/* Header Loading */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-10 w-24 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
      </div>

      {/* Stats Loading */}
      <UserStatsLoading />

      {/* Table Loading */}
      <UserTableLoading />
    </div>
  );
}

/**
 * User Pagination Loading
 * Loading state cho pagination
 */
export function UserPaginationLoading() {
  return (
    <div className="flex items-center justify-between mt-6">
      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      <div className="flex items-center space-x-2">
        <div className="h-8 w-20 bg-muted animate-pulse rounded" />
        <div className="h-8 w-8 bg-muted animate-pulse rounded" />
        <div className="h-8 w-8 bg-muted animate-pulse rounded" />
        <div className="h-8 w-8 bg-muted animate-pulse rounded" />
        <div className="h-8 w-8 bg-muted animate-pulse rounded" />
        <div className="h-8 w-20 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

/**
 * User Error State
 * Error state component cho user management
 */
export function UserErrorState({
  error,
  onRetry,
  className = "",
}: {
  error: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <Card className={`border-destructive/20 ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <svg
            className="h-6 w-6 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Không thể tải dữ liệu người dùng
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
          >
            Thử lại
          </button>
        )}
      </CardContent>
    </Card>
  );
}
