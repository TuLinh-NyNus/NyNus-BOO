/**
 * Public Pagination Controls Component
 * Pagination controls cho public question browsing theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

// Import UI components
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui";

// Import utilities
import { getOptimalPageSize } from "@/lib/utils/question-list-performance";

// ===== CONSTANTS =====

const DEFAULT_PAGE_SIZES = [10, 20, 50, 100];
const MOBILE_PAGE_SIZES = [10, 20];
const TABLET_PAGE_SIZES = [10, 20, 50];
const MAX_VISIBLE_PAGES = 5;
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

// ===== TYPES =====

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PublicPaginationControlsProps {
  /** Pagination information */
  pagination: PaginationInfo;
  
  /** Page change handler */
  onPageChange: (page: number) => void;
  
  /** Page size change handler */
  onPageSizeChange: (pageSize: number) => void;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Show page size selector */
  showPageSizeSelector?: boolean;
  
  /** Show results summary */
  showResultsSummary?: boolean;
  
  /** Compact layout for mobile */
  compact?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

// ===== HELPER FUNCTIONS =====

/**
 * Detect current device type
 */
const detectDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < MOBILE_BREAKPOINT) return 'mobile';
  if (width < TABLET_BREAKPOINT) return 'tablet';
  return 'desktop';
};

/**
 * Get available page sizes based on device type
 */
const getAvailablePageSizes = (deviceType: 'mobile' | 'tablet' | 'desktop'): number[] => {
  switch (deviceType) {
    case 'mobile':
      return MOBILE_PAGE_SIZES;
    case 'tablet':
      return TABLET_PAGE_SIZES;
    case 'desktop':
      return DEFAULT_PAGE_SIZES;
    default:
      return DEFAULT_PAGE_SIZES;
  }
};

/**
 * Generate page numbers to display
 */
const generatePageNumbers = (currentPage: number, totalPages: number): (number | 'ellipsis')[] => {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  
  const pages: (number | 'ellipsis')[] = [];
  
  // Always show first page
  pages.push(1);
  
  // Calculate range around current page
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  
  // Add ellipsis if there's a gap
  if (start > 2) {
    pages.push('ellipsis');
  }
  
  // Add pages around current page
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  // Add ellipsis if there's a gap
  if (end < totalPages - 1) {
    pages.push('ellipsis');
  }
  
  // Always show last page (if not already included)
  if (totalPages > 1) {
    pages.push(totalPages);
  }
  
  return pages;
};

/**
 * Calculate results summary
 */
const calculateResultsSummary = (pagination: PaginationInfo) => {
  const { page, limit, total } = pagination;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  
  return { startItem, endItem };
};

// ===== MAIN COMPONENT =====

export const PublicPaginationControls: React.FC<PublicPaginationControlsProps> = ({
  pagination,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  showPageSizeSelector = true,
  showResultsSummary = true,
  compact = false,
  className = ''
}) => {
  // ===== STATE =====
  
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>(() => detectDeviceType());
  
  // ===== EFFECTS =====
  
  // Handle window resize for device type detection
  useEffect(() => {
    const handleResize = () => {
      setDeviceType(detectDeviceType());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // ===== COMPUTED VALUES =====
  
  const { page, limit, total, totalPages } = pagination;
  
  const availablePageSizes = useMemo(() => 
    getAvailablePageSizes(deviceType),
    [deviceType]
  );
  
  const pageNumbers = useMemo(() => 
    generatePageNumbers(page, totalPages),
    [page, totalPages]
  );
  
  const { startItem, endItem } = useMemo(() => 
    calculateResultsSummary(pagination),
    [pagination]
  );
  
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;
  
  const isCompactMode = compact || deviceType === 'mobile';
  
  // ===== EVENT HANDLERS =====
  
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page && !isLoading) {
      onPageChange(newPage);
    }
  }, [page, totalPages, isLoading, onPageChange]);
  
  const handlePageSizeChange = useCallback((newPageSize: string) => {
    const pageSize = parseInt(newPageSize, 10);
    if (pageSize !== limit && !isLoading) {
      onPageSizeChange(pageSize);
    }
  }, [limit, isLoading, onPageSizeChange]);
  
  const handlePreviousPage = useCallback(() => {
    handlePageChange(page - 1);
  }, [page, handlePageChange]);
  
  const handleNextPage = useCallback(() => {
    handlePageChange(page + 1);
  }, [page, handlePageChange]);
  
  // ===== RENDER =====
  
  // Don't render if no pagination needed
  if (totalPages <= 1 && !showResultsSummary) {
    return null;
  }
  
  return (
    <div className={cn(
      "public-pagination-controls",
      "flex items-center justify-between gap-4",
      isCompactMode && "flex-col gap-3",
      className
    )}>
      {/* Results Summary */}
      {showResultsSummary && (
        <div className={cn(
          "results-summary text-sm text-muted-foreground",
          isCompactMode && "order-2"
        )}>
          {total > 0 ? (
            <>
              Hiển thị <span className="font-medium text-foreground">{startItem.toLocaleString()}</span>
              {' - '}
              <span className="font-medium text-foreground">{endItem.toLocaleString()}</span>
              {' trong tổng số '}
              <span className="font-medium text-foreground">{total.toLocaleString()}</span>
              {' câu hỏi'}
            </>
          ) : (
            'Không có câu hỏi nào'
          )}
        </div>
      )}
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className={cn(
          "pagination-controls flex items-center gap-2",
          isCompactMode && "order-1"
        )}>
          {/* Previous Button */}
          <Button
            variant="outline"
            size={isCompactMode ? "sm" : "default"}
            onClick={handlePreviousPage}
            disabled={!canGoPrevious || isLoading}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            {!isCompactMode && <span>Trước</span>}
          </Button>
          
          {/* Page Numbers */}
          {!isCompactMode && (
            <div className="flex items-center gap-1">
              {pageNumbers.map((pageNum, index) => {
                if (pageNum === 'ellipsis') {
                  return (
                    <div key={`ellipsis-${index}`} className="px-2">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </div>
                  );
                }
                
                const isCurrentPage = pageNum === page;
                
                return (
                  <Button
                    key={pageNum}
                    variant={isCurrentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isLoading}
                    className="w-9 h-9 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
          )}
          
          {/* Compact Page Info */}
          {isCompactMode && (
            <div className="px-3 py-1 text-sm text-muted-foreground bg-muted rounded">
              {page} / {totalPages}
            </div>
          )}
          
          {/* Next Button */}
          <Button
            variant="outline"
            size={isCompactMode ? "sm" : "default"}
            onClick={handleNextPage}
            disabled={!canGoNext || isLoading}
            className="flex items-center gap-1"
          >
            {!isCompactMode && <span>Sau</span>}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Page Size Selector */}
      {showPageSizeSelector && availablePageSizes.length > 1 && (
        <div className={cn(
          "page-size-selector flex items-center gap-2",
          isCompactMode && "order-3"
        )}>
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Hiển thị:
          </span>
          <Select
            value={limit.toString()}
            onValueChange={handlePageSizeChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availablePageSizes.map(size => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

// ===== UTILITY FUNCTIONS =====

/**
 * Get optimal pagination settings for current context
 */
export const getOptimalPaginationSettings = (
  totalItems: number,
  deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
) => {
  const availablePageSizes = getAvailablePageSizes(deviceType);
  const optimalPageSize = getOptimalPageSize(
    totalItems,
    deviceType,
    totalItems > 100 ? 'virtual' : 'cards'
  );
  
  // Find closest available page size
  const pageSize = availablePageSizes.reduce((prev, curr) => 
    Math.abs(curr - optimalPageSize) < Math.abs(prev - optimalPageSize) ? curr : prev
  );
  
  return {
    pageSize,
    availablePageSizes,
    shouldUseVirtualScrolling: totalItems > 100,
    recommendation: totalItems > 100 
      ? 'Nên sử dụng virtual scrolling cho hiệu suất tốt'
      : 'Pagination phù hợp cho dataset này'
  };
};

// ===== DEFAULT EXPORT =====

export default PublicPaginationControls;
