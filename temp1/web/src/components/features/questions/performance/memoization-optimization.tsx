'use client';

import React, { memo, useMemo, useCallback, useState, useRef, useEffect } from 'react';

/**
 * Memoization and Re-render Optimization
 * 
 * Task 2.2.2 - Component Performance:
 * - Optimize re-renders using React.memo, useMemo, useCallback
 * - Implement memoization for expensive computations
 * - Add performance monitoring for large components
 */

// =====================================================
// MEMOIZATION UTILITIES
// =====================================================

/**
 * Advanced memoization hook with TTL and size limits
 */
export function useAdvancedMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  options: {
    ttl?: number; // Time to live in milliseconds
    maxSize?: number; // Maximum cache size
  } = {}
): T {
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = options; // Default 5 minutes TTL
  const cacheRef = useRef<Map<string, { value: T; timestamp: number }>>(new Map());
  
  return useMemo(() => {
    const key = JSON.stringify(deps);
    const cache = cacheRef.current;
    const cached = cache.get(key);
    
    // Check if cached value is still valid
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.value;
    }
    
    // Compute new value
    const value = factory();
    
    // Clean up old entries if cache is too large
    if (cache.size >= maxSize) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
    
    // Store new value
    cache.set(key, { value, timestamp: Date.now() });
    
    return value;
  }, deps);
}

/**
 * Memoized computation hook for expensive operations
 */
export function useExpensiveComputation<T>(
  computation: () => T,
  deps: React.DependencyList,
  options: {
    threshold?: number; // Log if computation takes longer than threshold (ms)
    enableLogging?: boolean;
  } = {}
): T {
  const { threshold = 10, enableLogging = true } = options;
  
  return useMemo(() => {
    const startTime = performance.now();
    const result = computation();
    const duration = performance.now() - startTime;
    
    if (enableLogging && duration > threshold) {
      console.warn(`Expensive computation took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  }, deps);
}

// =====================================================
// OPTIMIZED QUESTION COMPONENTS
// =====================================================

/**
 * Optimized Question Item Component
 */
export interface OptimizedQuestionItemProps {
  question: {
    id: string;
    content: string;
    type: string;
    status: string;
    createdAt: string;
    tags?: string[];
    usageCount?: number;
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  isSelected?: boolean;
  showActions?: boolean;
}

export const OptimizedQuestionItem = memo(function OptimizedQuestionItem({
  question,
  onEdit,
  onDelete,
  onView,
  isSelected = false,
  showActions = true
}: OptimizedQuestionItemProps) {
  
  // Memoized handlers to prevent re-renders
  const handleEdit = useCallback(() => {
    onEdit?.(question.id);
  }, [onEdit, question.id]);
  
  const handleDelete = useCallback(() => {
    onDelete?.(question.id);
  }, [onDelete, question.id]);
  
  const handleView = useCallback(() => {
    onView?.(question.id);
  }, [onView, question.id]);
  
  // Memoized computed values
  const formattedDate = useMemo(() => {
    return new Date(question.createdAt).toLocaleDateString('vi-VN');
  }, [question.createdAt]);
  
  const truncatedContent = useMemo(() => {
    return question.content.length > 100 
      ? question.content.substring(0, 100) + '...'
      : question.content;
  }, [question.content]);
  
  const statusColor = useMemo(() => {
    switch (question.status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-red-100 text-red-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, [question.status]);
  
  const typeColor = useMemo(() => {
    switch (question.type) {
      case 'MULTIPLE_CHOICE': return 'bg-blue-100 text-blue-800';
      case 'TRUE_FALSE': return 'bg-purple-100 text-purple-800';
      case 'FILL_BLANK': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, [question.type]);
  
  return (
    <div className={`p-4 border rounded-lg transition-all duration-200 ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-2">
          <h3 className="font-medium text-sm line-clamp-2">
            {truncatedContent}
          </h3>
          
          <div className="flex gap-2 text-xs">
            <span className={`px-2 py-1 rounded ${typeColor}`}>
              {question.type}
            </span>
            <span className={`px-2 py-1 rounded ${statusColor}`}>
              {question.status}
            </span>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formattedDate}</span>
            {question.usageCount !== undefined && (
              <span>Sử dụng: {question.usageCount} lần</span>
            )}
          </div>
        </div>
        
        {showActions && (
          <div className="flex gap-1 ml-4">
            <button
              onClick={handleView}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
              title="Xem"
            >
              👁️
            </button>
            <button
              onClick={handleEdit}
              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
              title="Chỉnh sửa"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-red-600 hover:bg-red-100 rounded"
              title="Xóa"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

// =====================================================
// OPTIMIZED QUESTION LIST
// =====================================================

export interface OptimizedQuestionListProps {
  questions: OptimizedQuestionItemProps['question'][];
  selectedIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  loading?: boolean;
  className?: string;
}

export const OptimizedQuestionList = memo(function OptimizedQuestionList({
  questions,
  selectedIds = new Set(),
  onSelectionChange,
  onEdit,
  onDelete,
  onView,
  loading = false,
  className = ''
}: OptimizedQuestionListProps) {
  
  // Memoized selection handlers
  const handleItemClick = useCallback((questionId: string) => {
    if (!onSelectionChange) return;
    
    const newSelection = new Set(selectedIds);
    if (newSelection.has(questionId)) {
      newSelection.delete(questionId);
    } else {
      newSelection.add(questionId);
    }
    onSelectionChange(newSelection);
  }, [selectedIds, onSelectionChange]);
  
  // Memoized question items
  const questionItems = useMemo(() => {
    return questions.map((question) => (
      <div
        key={question.id}
        onClick={() => handleItemClick(question.id)}
        className="cursor-pointer"
      >
        <OptimizedQuestionItem
          question={question}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          isSelected={selectedIds.has(question.id)}
        />
      </div>
    ));
  }, [questions, selectedIds, onEdit, onDelete, onView, handleItemClick]);
  
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg animate-pulse">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {questionItems}
    </div>
  );
});

// =====================================================
// PERFORMANCE MONITORING HOOKS
// =====================================================

/**
 * Hook to monitor component render performance
 */
export function useRenderPerformance(componentName: string, enabled: boolean = true) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(0);
  
  useEffect(() => {
    if (!enabled) return;
    
    renderCount.current++;
    const currentTime = performance.now();
    
    if (lastRenderTime.current > 0) {
      const timeSinceLastRender = currentTime - lastRenderTime.current;
      
      if (timeSinceLastRender < 16) { // Less than 60fps
        console.warn(
          `${componentName} rendered too frequently: ${timeSinceLastRender.toFixed(2)}ms since last render`
        );
      }
    }
    
    lastRenderTime.current = currentTime;
    
    if (renderCount.current % 10 === 0) {
      console.log(`${componentName} has rendered ${renderCount.current} times`);
    }
  });
  
  return {
    renderCount: renderCount.current,
    resetCount: () => { renderCount.current = 0; }
  };
}

/**
 * Hook to detect unnecessary re-renders
 */
export function useWhyDidYouUpdate(name: string, props: Record<string, any>) {
  const previous = useRef<Record<string, any>>();
  
  useEffect(() => {
    if (previous.current) {
      const allKeys = Object.keys({ ...previous.current, ...props });
      const changedProps: Record<string, { from: any; to: any }> = {};
      
      allKeys.forEach(key => {
        if (previous.current![key] !== props[key]) {
          changedProps[key] = {
            from: previous.current![key],
            to: props[key]
          };
        }
      });
      
      if (Object.keys(changedProps).length) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }
    
    previous.current = props;
  });
}

// =====================================================
// MEMOIZATION HELPERS
// =====================================================

/**
 * Create a memoized selector function
 */
export function createMemoizedSelector<T, R>(
  selector: (data: T) => R,
  equalityFn?: (a: R, b: R) => boolean
) {
  let lastInput: T;
  let lastResult: R;
  
  return (input: T): R => {
    if (input !== lastInput) {
      const newResult = selector(input);
      
      if (!equalityFn || !equalityFn(lastResult, newResult)) {
        lastResult = newResult;
      }
      
      lastInput = input;
    }
    
    return lastResult;
  };
}

/**
 * Shallow equality comparison for objects
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }
  
  return true;
}

/**
 * Memoize component with custom equality function
 */
export function memoWithCustomEqual<P extends object>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) {
  return memo(Component, areEqual || shallowEqual);
}
