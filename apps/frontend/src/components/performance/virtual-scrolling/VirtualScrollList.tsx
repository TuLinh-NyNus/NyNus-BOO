/**
 * Virtual Scrolling List Component
 * High-performance virtual scrolling cho large question lists
 * Optimized cho 1000+ items với smooth scrolling
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

// ===== TYPES =====

export interface VirtualScrollItem {
  id: string;
  height?: number;
  data: unknown;
}

export interface VirtualScrollProps {
  items: VirtualScrollItem[];
  itemHeight: number | ((index: number, item: VirtualScrollItem) => number);
  containerHeight: number;
  renderItem: (item: VirtualScrollItem, index: number, style: React.CSSProperties) => React.ReactNode;
  overscanCount?: number;
  scrollToIndex?: number;
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
  className?: string;
  estimatedItemSize?: number;
  getItemKey?: (index: number, item: VirtualScrollItem) => string;
}

export interface VirtualScrollState {
  scrollTop: number;
  startIndex: number;
  endIndex: number;
  visibleItems: VirtualScrollItem[];
}

// ===== CONSTANTS =====

const DEFAULT_OVERSCAN_COUNT = 5;
const DEFAULT_ESTIMATED_SIZE = 80;
const SCROLL_DEBOUNCE_DELAY = 16; // ~60fps

// ===== VIRTUAL SCROLL LIST COMPONENT =====

export const VirtualScrollList: React.FC<VirtualScrollProps> = ({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscanCount = DEFAULT_OVERSCAN_COUNT,
  scrollToIndex,
  onScroll,
  className = '',
  estimatedItemSize = DEFAULT_ESTIMATED_SIZE,
  getItemKey,
}) => {
  // ===== STATE =====
  
  const [scrollState, setScrollState] = useState<VirtualScrollState>({
    scrollTop: 0,
    startIndex: 0,
    endIndex: 0,
    visibleItems: [],
  });

  const [itemHeights, setItemHeights] = useState<Map<number, number>>(new Map());
  const [isScrolling, setIsScrolling] = useState(false);

  // ===== REFS =====
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // ===== DEBOUNCED SCROLL =====
  
  const debouncedScrollTop = useDebounce(scrollState.scrollTop, SCROLL_DEBOUNCE_DELAY);

  // ===== MEMOIZED CALCULATIONS =====

  /**
   * Calculate item height for given index
   */
  const getItemHeight = useCallback((index: number): number => {
    if (typeof itemHeight === 'function') {
      return itemHeight(index, items[index]);
    }
    return itemHeight;
  }, [itemHeight, items]);

  /**
   * Calculate total height of all items
   */
  const totalHeight = useMemo(() => {
    if (typeof itemHeight === 'number') {
      return items.length * itemHeight;
    }

    let height = 0;
    for (let i = 0; i < items.length; i++) {
      const cachedHeight = itemHeights.get(i);
      height += cachedHeight || getItemHeight(i) || estimatedItemSize;
    }
    return height;
  }, [items.length, itemHeight, itemHeights, getItemHeight, estimatedItemSize]);

  /**
   * Calculate offset for given index
   */
  const getItemOffset = useCallback((index: number): number => {
    if (typeof itemHeight === 'number') {
      return index * itemHeight;
    }

    let offset = 0;
    for (let i = 0; i < index; i++) {
      const cachedHeight = itemHeights.get(i);
      offset += cachedHeight || getItemHeight(i) || estimatedItemSize;
    }
    return offset;
  }, [itemHeight, itemHeights, getItemHeight, estimatedItemSize]);

  /**
   * Find start index based on scroll position
   */
  const findStartIndex = useCallback((scrollTop: number): number => {
    if (typeof itemHeight === 'number') {
      return Math.floor(scrollTop / itemHeight);
    }

    let offset = 0;
    for (let i = 0; i < items.length; i++) {
      const height = itemHeights.get(i) || getItemHeight(i) || estimatedItemSize;
      if (offset + height > scrollTop) {
        return i;
      }
      offset += height;
    }
    return items.length - 1;
  }, [itemHeight, items.length, itemHeights, getItemHeight, estimatedItemSize]);

  /**
   * Calculate visible range
   */
  const calculateVisibleRange = useCallback((scrollTop: number) => {
    const startIndex = Math.max(0, findStartIndex(scrollTop) - overscanCount);
    
    let endIndex = startIndex;
    let currentOffset = getItemOffset(startIndex);
    
    while (endIndex < items.length && currentOffset < scrollTop + containerHeight + overscanCount * estimatedItemSize) {
      const height = itemHeights.get(endIndex) || getItemHeight(endIndex) || estimatedItemSize;
      currentOffset += height;
      endIndex++;
    }
    
    endIndex = Math.min(items.length - 1, endIndex + overscanCount);
    
    return { startIndex, endIndex };
  }, [findStartIndex, getItemOffset, items.length, containerHeight, overscanCount, estimatedItemSize, itemHeights, getItemHeight]);

  // ===== EFFECTS =====

  /**
   * Update visible items when scroll position changes
   */
  useEffect(() => {
    const { startIndex, endIndex } = calculateVisibleRange(debouncedScrollTop);
    const visibleItems = items.slice(startIndex, endIndex + 1);

    setScrollState(prev => ({
      ...prev,
      startIndex,
      endIndex,
      visibleItems,
    }));
  }, [debouncedScrollTop, calculateVisibleRange, items]);

  /**
   * Handle scroll to index
   */
  useEffect(() => {
    if (scrollToIndex !== undefined && scrollElementRef.current) {
      const offset = getItemOffset(scrollToIndex);
      scrollElementRef.current.scrollTop = offset;
    }
  }, [scrollToIndex, getItemOffset]);

  /**
   * Measure item heights after render
   */
  useEffect(() => {
    const newHeights = new Map(itemHeights);
    let hasChanges = false;

    itemRefs.current.forEach((element, index) => {
      if (element) {
        const height = element.getBoundingClientRect().height;
        const currentHeight = newHeights.get(index);
        
        if (currentHeight !== height) {
          newHeights.set(index, height);
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setItemHeights(newHeights);
    }
  }, [itemHeights]);

  // ===== EVENT HANDLERS =====

  /**
   * Handle scroll events
   */
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    const scrollLeft = event.currentTarget.scrollLeft;

    setScrollState(prev => ({ ...prev, scrollTop }));
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set timeout to detect scroll end
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);

    onScroll?.(scrollTop, scrollLeft);
  }, [onScroll]);

  /**
   * Set item ref for height measurement
   */
  const setItemRef = useCallback((index: number) => (element: HTMLDivElement | null) => {
    if (element) {
      itemRefs.current.set(index, element);
    } else {
      itemRefs.current.delete(index);
    }
  }, []);

  // ===== RENDER =====

  return (
    <div
      ref={containerRef}
      className={`virtual-scroll-container ${className}`}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div
        ref={scrollElementRef}
        style={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        {scrollState.visibleItems.map((item, virtualIndex) => {
          const actualIndex = scrollState.startIndex + virtualIndex;
          const offset = getItemOffset(actualIndex);
          const height = itemHeights.get(actualIndex) || getItemHeight(actualIndex) || estimatedItemSize;
          
          const style: React.CSSProperties = {
            position: 'absolute',
            top: offset,
            left: 0,
            right: 0,
            height: height,
          };

          const key = getItemKey ? getItemKey(actualIndex, item) : item.id || actualIndex;

          return (
            <div
              key={key}
              ref={setItemRef(actualIndex)}
              style={style}
              className="virtual-scroll-item"
            >
              {renderItem(item, actualIndex, style)}
            </div>
          );
        })}
      </div>
      
      {/* Scroll indicator */}
      {isScrolling && (
        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
          {scrollState.startIndex + 1}-{scrollState.endIndex + 1} / {items.length}
        </div>
      )}
    </div>
  );
};

// ===== PERFORMANCE UTILITIES =====

/**
 * Calculate optimal item height for performance
 */
export const calculateOptimalItemHeight = (
  containerHeight: number,
  itemCount: number,
  minItemHeight: number = 40
): number => {
  const optimalHeight = Math.max(
    minItemHeight,
    Math.floor(containerHeight / Math.min(10, itemCount))
  );
  return optimalHeight;
};

/**
 * Estimate total scroll height
 */
export const estimateScrollHeight = (
  itemCount: number,
  averageItemHeight: number
): number => {
  return itemCount * averageItemHeight;
};

/**
 * Performance monitoring for virtual scroll
 */
export const useVirtualScrollPerformance = (itemCount: number) => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    scrollFPS: 0,
    memoryUsage: 0,
  });

  useEffect(() => {
    const startTime = performance.now();
    
    // Measure render time
    const measureRenderTime = () => {
      const renderTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, renderTime }));
    };

    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(measureRenderTime);

    // Memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as { memory?: { usedJSHeapSize: number } }).memory;
      if (memory && memory.usedJSHeapSize) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024, // MB
        }));
      }
    }
  }, [itemCount]);

  return metrics;
};
