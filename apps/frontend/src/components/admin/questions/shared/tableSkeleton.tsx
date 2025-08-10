/**
 * Table Skeleton Component
 * Loading skeleton cho tables
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  Skeleton 
} from "@/components/ui";

/**
 * Props for TableSkeleton component
 */
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showCheckbox?: boolean;
  showActions?: boolean;
  className?: string;
}

/**
 * Table Skeleton Component
 * Reusable loading skeleton cho các tables trong admin
 */
export function TableSkeleton({
  rows = 5,
  columns = 6,
  showCheckbox = false,
  showActions = true,
  className = "",
}: TableSkeletonProps) {
  // Calculate actual columns including checkbox and actions
  // const totalColumns = columns + (showCheckbox ? 1 : 0) + (showActions ? 1 : 0);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toolbar Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-80" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {showCheckbox && (
                <TableHead className="w-12">
                  <Skeleton className="h-4 w-4" />
                </TableHead>
              )}
              
              {Array.from({ length: columns }).map((_, index) => (
                <TableHead key={index}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
              
              {showActions && (
                <TableHead className="w-12">
                  <Skeleton className="h-4 w-4" />
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {showCheckbox && (
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                )}
                
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    {colIndex === 0 ? (
                      // First column usually has more content
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    ) : colIndex === 1 || colIndex === 2 ? (
                      // Badge-like columns
                      <Skeleton className="h-6 w-20" />
                    ) : (
                      // Regular text columns
                      <Skeleton className="h-4 w-16" />
                    )}
                  </TableCell>
                ))}
                
                {showActions && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-16" />
          <div className="flex items-center space-x-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

/**
 * Question List Skeleton
 * Specialized skeleton cho question list
 */
export function QuestionListSkeleton() {
  return (
    <TableSkeleton
      rows={10}
      columns={7}
      showCheckbox={true}
      showActions={true}
    />
  );
}

/**
 * Question Bank Skeleton
 * Specialized skeleton cho question bank
 */
export function QuestionBankSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="rounded-md border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        
        {/* Filters Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <Skeleton className="h-9 w-full" />
          </div>
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>

      {/* Table Skeleton */}
      <TableSkeleton
        rows={15}
        columns={6}
        showCheckbox={true}
        showActions={true}
      />
    </div>
  );
}
