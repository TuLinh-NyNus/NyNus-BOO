'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FixedSizeList as List, VariableSizeList } from 'react-window';

import { Card, CardContent } from '@/components/ui/display/card';
import { Skeleton } from '@/components/ui/display/skeleton';

/**
 * Virtual Scrolling Components
 * 
 * Task 2.2.2 - Component Performance:
 * - Add virtual scrolling for question lists
 * - Optimize large data displays
 * - Improve performance for 1000+ items
 */

// =====================================================
// VIRTUAL SCROLLING INTERFACES
// =====================================================

export interface VirtualScrollItem {
  id: string;
  height?: number;
  data: any;
}

export interface VirtualScrollProps {
  items: VirtualScrollItem[];
  itemHeight?: number;
  containerHeight?: number;
  renderItem: (item: VirtualScrollItem, index: number) => React.ReactNode;
  onItemClick?: (item: VirtualScrollItem, index: number) => void;
  className?: string;
  loading?: boolean;
  estimatedItemSize?: number;
}

// =====================================================
// FIXED SIZE VIRTUAL SCROLL
// =====================================================

export const VirtualScrollList = React.memo(function VirtualScrollList({
  items,
  itemHeight = 80,
  containerHeight = 400,
  renderItem,
  onItemClick,
  className = '',
  loading = false
}: VirtualScrollProps) {
  const listRef = useRef<List>(null);

  // Memoized item renderer
  const ItemRenderer = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    if (!item) return null;

    return (
      <div 
        style={style}
        className={`cursor-pointer hover:bg-gray-50 transition-colors ${onItemClick ? 'cursor-pointer' : ''}`}
        onClick={() => onItemClick?.(item, index)}
      >
        {renderItem(item, index)}
      </div>
    );
  }, [items, renderItem, onItemClick]);

  // Loading skeleton
  if (loading) {
    return (
      <div className={`space-y-2 ${className}`} style={{ height: containerHeight }}>
        {Array.from({ length: Math.ceil(containerHeight / itemHeight) }).map((_, i) => (
          <Skeleton key={i} className="w-full" style={{ height: itemHeight }} />
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <List
        ref={listRef}
        height={containerHeight}
        itemCount={items.length}
        itemSize={itemHeight}
        itemData={items}
        overscanCount={5} // Render 5 extra items for smooth scrolling
      >
        {ItemRenderer}
      </List>
    </div>
  );
});

// =====================================================
// VARIABLE SIZE VIRTUAL SCROLL
// =====================================================

export const VariableSizeVirtualScrollList = React.memo(function VariableSizeVirtualScrollList({
  items,
  containerHeight = 400,
  renderItem,
  onItemClick,
  className = '',
  loading = false,
  estimatedItemSize = 80
}: VirtualScrollProps) {
  const listRef = useRef<VariableSizeList>(null);
  const itemSizeCache = useRef<Map<number, number>>(new Map());

  // Get item size with caching
  const getItemSize = useCallback((index: number): number => {
    const cached = itemSizeCache.current.get(index);
    if (cached) return cached;

    const item = items[index];
    const size = item?.height || estimatedItemSize;
    itemSizeCache.current.set(index, size);
    return size;
  }, [items, estimatedItemSize]);

  // Clear cache when items change
  useEffect(() => {
    itemSizeCache.current.clear();
    listRef.current?.resetAfterIndex(0);
  }, [items]);

  // Memoized item renderer
  const ItemRenderer = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    if (!item) return null;

    return (
      <div 
        style={style}
        className={`hover:bg-gray-50 transition-colors ${onItemClick ? 'cursor-pointer' : ''}`}
        onClick={() => onItemClick?.(item, index)}
      >
        {renderItem(item, index)}
      </div>
    );
  }, [items, renderItem, onItemClick]);

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`} style={{ height: containerHeight }}>
        {Array.from({ length: Math.ceil(containerHeight / estimatedItemSize) }).map((_, i) => (
          <Skeleton key={i} className="w-full" style={{ height: estimatedItemSize }} />
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <VariableSizeList
        ref={listRef}
        height={containerHeight}
        itemCount={items.length}
        itemSize={getItemSize}
        estimatedItemSize={estimatedItemSize}
        overscanCount={5}
      >
        {ItemRenderer}
      </VariableSizeList>
    </div>
  );
});

// =====================================================
// QUESTION-SPECIFIC VIRTUAL SCROLL
// =====================================================

export interface QuestionVirtualScrollProps {
  questions: any[];
  onQuestionClick?: (question: any, index: number) => void;
  onQuestionEdit?: (question: any) => void;
  onQuestionDelete?: (question: any) => void;
  containerHeight?: number;
  loading?: boolean;
  className?: string;
}

export const VirtualQuestionList = React.memo(function VirtualQuestionList({
  questions,
  onQuestionClick,
  onQuestionEdit,
  onQuestionDelete,
  containerHeight = 500,
  loading = false,
  className = ''
}: QuestionVirtualScrollProps) {
  
  // Convert questions to virtual scroll items
  const virtualItems = useMemo(() => 
    questions.map((question, index) => ({
      id: question.id || `question-${index}`,
      height: 120, // Estimated height for question items
      data: question
    }))
  , [questions]);

  // Memoized question item renderer
  const renderQuestionItem = useCallback((item: VirtualScrollItem, index: number) => {
    const question = item.data;
    
    return (
      <Card className="mx-2 my-1">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-2">
              <h3 className="font-medium text-sm line-clamp-2">
                {question.content || question.title || 'Câu hỏi không có tiêu đề'}
              </h3>
              
              <div className="flex gap-2 text-xs text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {question.type || 'Không xác định'}
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  {question.status || 'ACTIVE'}
                </span>
              </div>
              
              <div className="text-xs text-gray-400">
                ID: {question.questionId || question.id}
              </div>
            </div>
            
            <div className="flex gap-1 ml-4">
              {onQuestionEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuestionEdit(question);
                  }}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  title="Chỉnh sửa"
                >
                  ✏️
                </button>
              )}
              
              {onQuestionDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuestionDelete(question);
                  }}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Xóa"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }, [onQuestionEdit, onQuestionDelete]);

  return (
    <VirtualScrollList
      items={virtualItems}
      itemHeight={120}
      containerHeight={containerHeight}
      renderItem={renderQuestionItem}
      onItemClick={onQuestionClick}
      loading={loading}
      className={className}
    />
  );
});

// =====================================================
// PERFORMANCE MONITORING
// =====================================================

export const VirtualScrollPerformanceMonitor = {
  renderCount: 0,
  lastRenderTime: 0,
  
  startRender() {
    this.lastRenderTime = performance.now();
  },
  
  endRender() {
    const renderTime = performance.now() - this.lastRenderTime;
    this.renderCount++;
    
    console.log(`Virtual scroll render #${this.renderCount}: ${renderTime.toFixed(2)}ms`);
    
    if (renderTime > 16) { // 60fps threshold
      console.warn(`Slow virtual scroll render: ${renderTime.toFixed(2)}ms`);
    }
  }
};

// =====================================================
// VIRTUAL SCROLL UTILITIES
// =====================================================

/**
 * Calculate optimal item height based on content
 */
export const calculateItemHeight = (content: string, baseHeight: number = 80): number => {
  const lineHeight = 20;
  const padding = 32;
  const lines = Math.ceil(content.length / 50); // Rough estimate
  
  return Math.max(baseHeight, lines * lineHeight + padding);
};

/**
 * Optimize virtual scroll performance
 */
export const optimizeVirtualScroll = {
  // Debounce scroll events
  debounceScroll: (callback: () => void, delay: number = 16) => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, delay);
    };
  },
  
  // Throttle resize events
  throttleResize: (callback: () => void, delay: number = 100) => {
    let lastCall = 0;
    return () => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        callback();
      }
    };
  }
};

/**
 * Virtual scroll hook for custom implementations
 */
export const useVirtualScroll = (
  items: any[],
  containerHeight: number,
  itemHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length]);
  
  const visibleItems = useMemo(() => 
    items.slice(visibleRange.start, visibleRange.end)
  , [items, visibleRange]);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
    visibleRange
  };
};
