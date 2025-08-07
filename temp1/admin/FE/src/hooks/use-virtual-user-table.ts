/**
 * useVirtualUserTable Hook
 * Hook cho virtual scrolling user table với dynamic row heights
 */

import { useRef, useMemo, useCallback, useState, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { AdminUser } from "../types/admin-user";

/**
 * Virtual table options
 * Options cho virtual table
 */
interface UseVirtualUserTableOptions {
  users: AdminUser[];
  containerHeight?: number;
  estimateSize?: number;
  overscan?: number;
  enableSmoothScrolling?: boolean;
  enableDynamicSizing?: boolean;
  onScrollToIndex?: (index: number) => void;
  onVisibleRangeChange?: (startIndex: number, endIndex: number) => void;
}

/**
 * Virtual table return interface
 * Interface cho return của virtual table
 */
interface UseVirtualUserTableReturn {
  // Virtualizer instance
  virtualizer: any; // Use any to avoid complex type issues

  // Container ref
  containerRef: React.RefObject<HTMLDivElement>;

  // Virtual items
  virtualItems: any[]; // Use any[] to avoid complex type issues

  // Measurements
  totalSize: number;
  visibleRange: { start: number; end: number };

  // Actions
  scrollToIndex: (index: number, options?: { align?: "start" | "center" | "end" | "auto" }) => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;
  measureElement: (index: number, element: HTMLElement) => void;

  // State
  isScrolling: boolean;
  scrollDirection: "forward" | "backward" | null;

  // Performance metrics
  metrics: {
    renderedItemsCount: number;
    totalItemsCount: number;
    renderRatio: number;
    averageItemHeight: number;
  };
}

/**
 * Default row height estimation
 * Ước tính chiều cao row mặc định
 */
const DEFAULT_ROW_HEIGHT = 80; // Estimated height for user row với badges và buttons

/**
 * Calculate estimated row height based on user data
 * Tính toán ước tính chiều cao row dựa trên user data
 */
function estimateRowHeight(user: AdminUser): number {
  let height = 60; // Base height

  // Add height for email verification badge
  if (!user.emailVerified) {
    height += 20;
  }

  // Add height for level display
  if (user.level) {
    height += 16;
  }

  // Add height for long names or emails
  const displayName =
    user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "Chưa cập nhật tên";

  if (displayName.length > 30 || user.email.length > 30) {
    height += 10;
  }

  return Math.max(height, 70); // Minimum height
}

/**
 * Main useVirtualUserTable hook
 * Hook chính cho virtual user table
 */
export function useVirtualUserTable(
  options: UseVirtualUserTableOptions
): UseVirtualUserTableReturn {
  const {
    users,
    containerHeight = 600,
    estimateSize = DEFAULT_ROW_HEIGHT,
    overscan = 5,
    enableSmoothScrolling = true,
    enableDynamicSizing = true,
    onScrollToIndex,
    onVisibleRangeChange,
  } = options;

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"forward" | "backward" | null>(null);
  const lastScrollTop = useRef(0);

  /**
   * Dynamic size estimator
   * Ước tính kích thước động
   */
  const sizeEstimator = useCallback(
    (index: number) => {
      if (enableDynamicSizing && users[index]) {
        return estimateRowHeight(users[index]);
      }
      return estimateSize;
    },
    [users, enableDynamicSizing, estimateSize]
  );

  /**
   * Create virtualizer instance
   * Tạo virtualizer instance
   */
  const virtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => containerRef.current,
    estimateSize: sizeEstimator,
    overscan,
    measureElement: enableDynamicSizing
      ? (element) => {
          // Measure actual element height for dynamic sizing
          return element.getBoundingClientRect().height;
        }
      : undefined,
  });

  /**
   * Get virtual items
   * Lấy virtual items
   */
  const virtualItems = virtualizer.getVirtualItems() as any[];

  /**
   * Calculate visible range
   * Tính toán visible range
   */
  const visibleRange = useMemo(() => {
    if (virtualItems.length === 0) {
      return { start: 0, end: 0 };
    }

    return {
      start: virtualItems[0].index,
      end: virtualItems[virtualItems.length - 1].index,
    };
  }, [virtualItems]);

  /**
   * Scroll to index
   * Scroll đến index
   */
  const scrollToIndex = useCallback(
    (index: number, options?: { align?: "start" | "center" | "end" | "auto" }) => {
      virtualizer.scrollToIndex(index, options);

      if (onScrollToIndex) {
        onScrollToIndex(index);
      }
    },
    [virtualizer, onScrollToIndex]
  );

  /**
   * Scroll to top
   * Scroll lên đầu
   */
  const scrollToTop = useCallback(() => {
    scrollToIndex(0, { align: "start" });
  }, [scrollToIndex]);

  /**
   * Scroll to bottom
   * Scroll xuống cuối
   */
  const scrollToBottom = useCallback(() => {
    if (users.length > 0) {
      scrollToIndex(users.length - 1, { align: "end" });
    }
  }, [scrollToIndex, users.length]);

  /**
   * Measure element manually
   * Đo element thủ công
   */
  const measureElement = useCallback(
    (index: number, element: HTMLElement) => {
      if (enableDynamicSizing) {
        virtualizer.measureElement(element);
      }
    },
    [virtualizer, enableDynamicSizing]
  );

  /**
   * Handle scroll events
   * Xử lý scroll events
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;

      // Determine scroll direction
      if (currentScrollTop > lastScrollTop.current) {
        setScrollDirection("forward");
      } else if (currentScrollTop < lastScrollTop.current) {
        setScrollDirection("backward");
      }

      lastScrollTop.current = currentScrollTop;
      setIsScrolling(true);

      // Clear existing timeout
      clearTimeout(scrollTimeout);

      // Set scrolling to false after scroll ends
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
        setScrollDirection(null);
      }, 150);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  /**
   * Handle visible range changes
   * Xử lý thay đổi visible range
   */
  useEffect(() => {
    if (onVisibleRangeChange) {
      onVisibleRangeChange(visibleRange.start, visibleRange.end);
    }
  }, [visibleRange, onVisibleRangeChange]);

  /**
   * Calculate performance metrics
   * Tính toán performance metrics
   */
  const metrics = useMemo(() => {
    const renderedItemsCount = virtualItems.length;
    const totalItemsCount = users.length;
    const renderRatio = totalItemsCount > 0 ? (renderedItemsCount / totalItemsCount) * 100 : 0;

    // Calculate average item height from virtual items
    const totalHeight = virtualItems.reduce((sum, item) => sum + item.size, 0);
    const averageItemHeight =
      virtualItems.length > 0 ? totalHeight / virtualItems.length : estimateSize;

    return {
      renderedItemsCount,
      totalItemsCount,
      renderRatio: Math.round(renderRatio * 100) / 100,
      averageItemHeight: Math.round(averageItemHeight * 100) / 100,
    };
  }, [virtualItems, users.length, estimateSize]);

  /**
   * Apply smooth scrolling styles
   * Áp dụng smooth scrolling styles
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enableSmoothScrolling) return;

    // Add smooth scrolling behavior
    container.style.scrollBehavior = "smooth";

    return () => {
      container.style.scrollBehavior = "auto";
    };
  }, [enableSmoothScrolling]);

  return {
    // Virtualizer instance
    virtualizer,

    // Container ref
    containerRef,

    // Virtual items
    virtualItems,

    // Measurements
    totalSize: virtualizer.getTotalSize(),
    visibleRange,

    // Actions
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
    measureElement,

    // State
    isScrolling,
    scrollDirection,

    // Performance metrics
    metrics,
  };
}
