/**
 * Virtual User Table Hook
 * Hook cho virtualized user table với performance optimization
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { useState, useCallback, useMemo } from 'react';

/**
 * Interface cho virtual table item
 */
interface VirtualTableItem {
  id: string;
  index: number;
  height: number;
  offsetTop: number;
}

/**
 * Interface cho virtual table state
 */
interface VirtualTableState {
  scrollTop: number;
  containerHeight: number;
  totalHeight: number;
  visibleStartIndex: number;
  visibleEndIndex: number;
  visibleItems: VirtualTableItem[];
}

/**
 * Interface cho virtual user table hook options
 */
interface UseVirtualUserTableOptions {
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
  totalItems: number;
}

/**
 * Interface cho virtual user table hook return
 */
interface UseVirtualUserTableReturn {
  virtualState: VirtualTableState;
  scrollElementProps: {
    onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
    style: React.CSSProperties;
  };
  getItemProps: (index: number) => {
    key: string;
    style: React.CSSProperties;
    'data-index': number;
  };
  scrollToIndex: (index: number) => void;
  scrollToTop: () => void;
}

/**
 * Default values
 */
const DEFAULT_ITEM_HEIGHT = 60;
const DEFAULT_CONTAINER_HEIGHT = 400;
const DEFAULT_OVERSCAN = 5;

/**
 * Virtual User Table Hook
 * Hook để implement virtualized table cho performance với large datasets
 */
export function useVirtualUserTable({
  itemHeight = DEFAULT_ITEM_HEIGHT,
  containerHeight = DEFAULT_CONTAINER_HEIGHT,
  overscan = DEFAULT_OVERSCAN,
  totalItems,
}: UseVirtualUserTableOptions): UseVirtualUserTableReturn {
  // State management
  const [scrollTop, setScrollTop] = useState(0);

  /**
   * Calculate virtual state
   */
  const virtualState = useMemo((): VirtualTableState => {
    const totalHeight = totalItems * itemHeight;
    
    // Calculate visible range
    const visibleStartIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleEndIndex = Math.min(
      totalItems - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    // Generate visible items
    const visibleItems: VirtualTableItem[] = [];
    for (let i = visibleStartIndex; i <= visibleEndIndex; i++) {
      visibleItems.push({
        id: `item-${i}`,
        index: i,
        height: itemHeight,
        offsetTop: i * itemHeight,
      });
    }

    return {
      scrollTop,
      containerHeight,
      totalHeight,
      visibleStartIndex,
      visibleEndIndex,
      visibleItems,
    };
  }, [scrollTop, containerHeight, itemHeight, totalItems, overscan]);

  /**
   * Handle scroll event
   */
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
  }, []);

  /**
   * Scroll to specific index
   */
  const scrollToIndex = useCallback((index: number) => {
    const targetScrollTop = index * itemHeight;
    setScrollTop(targetScrollTop);
  }, [itemHeight]);

  /**
   * Scroll to top
   */
  const scrollToTop = useCallback(() => {
    setScrollTop(0);
  }, []);

  /**
   * Get item props for rendering
   */
  const getItemProps = useCallback((index: number) => {
    return {
      key: `virtual-item-${index}`,
      style: {
        position: 'absolute' as const,
        top: index * itemHeight,
        left: 0,
        right: 0,
        height: itemHeight,
      },
      'data-index': index,
    };
  }, [itemHeight]);

  /**
   * Scroll element props
   */
  const scrollElementProps = useMemo(() => ({
    onScroll: handleScroll,
    style: {
      height: containerHeight,
      overflow: 'auto' as const,
      position: 'relative' as const,
    },
  }), [handleScroll, containerHeight]);

  return {
    virtualState,
    scrollElementProps,
    getItemProps,
    scrollToIndex,
    scrollToTop,
  };
}

/**
 * Calculate optimal item height based on content
 */
export function calculateOptimalItemHeight(
  sampleContent: string,
  fontSize: number = 14,
  padding: number = 16
): number {
  // Simple calculation based on content length and font size
  const baseHeight = fontSize * 1.5; // line height
  const contentLines = Math.ceil(sampleContent.length / 50); // rough estimate
  const calculatedHeight = (contentLines * baseHeight) + (padding * 2);
  
  return Math.max(DEFAULT_ITEM_HEIGHT, calculatedHeight);
}

/**
 * Get visible range for debugging
 */
export function getVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = DEFAULT_OVERSCAN
): { start: number; end: number; total: number } {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const end = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  return { start, end, total: end - start + 1 };
}

/**
 * Performance metrics for virtual table
 */
export interface VirtualTableMetrics {
  totalItems: number;
  visibleItems: number;
  renderRatio: number;
  scrollPosition: number;
  scrollPercentage: number;
}

/**
 * Get virtual table performance metrics
 */
export function getVirtualTableMetrics(
  virtualState: VirtualTableState,
  totalItems: number
): VirtualTableMetrics {
  const visibleItems = virtualState.visibleEndIndex - virtualState.visibleStartIndex + 1;
  const renderRatio = totalItems > 0 ? visibleItems / totalItems : 0;
  const scrollPercentage = virtualState.totalHeight > 0 
    ? (virtualState.scrollTop / (virtualState.totalHeight - virtualState.containerHeight)) * 100
    : 0;

  return {
    totalItems,
    visibleItems,
    renderRatio,
    scrollPosition: virtualState.scrollTop,
    scrollPercentage: Math.max(0, Math.min(100, scrollPercentage)),
  };
}
