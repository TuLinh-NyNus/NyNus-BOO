/**
 * Performance Optimization Hook
 * Hook để optimize performance cho user authentication components
 *
 * @deprecated This file is DEPRECATED and will be removed in v2.0.0
 *
 * ⚠️ MIGRATION REQUIRED:
 * Please update your imports to use the canonical version:
 *
 * OLD (deprecated):
 * import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization'
 *
 * NEW (recommended):
 * import { usePerformanceOptimization } from '@/hooks/performance/usePerformanceOptimization'
 *
 * This file currently re-exports from the canonical location for backward compatibility.
 * All new code should import from '@/hooks/performance/usePerformanceOptimization'
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context-grpc';

// ===== TYPES =====

export interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  memoryUsage: number;
  cacheHits: number;
  cacheMisses: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface PerformanceConfig {
  enableCaching: boolean;
  cacheTimeout: number; // milliseconds
  enableMetrics: boolean;
  enableLazyLoading: boolean;
  debounceDelay: number;
}

// ===== CONSTANTS =====

const DEFAULT_CONFIG: PerformanceConfig = {
  enableCaching: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  enableMetrics: process.env.NODE_ENV === 'development',
  enableLazyLoading: true,
  debounceDelay: 300
};

// ===== MAIN HOOK =====

/**
 * usePerformanceOptimization Hook
 * Main hook để optimize performance
 */
export function usePerformanceOptimization(config: Partial<PerformanceConfig> = {}) {
  const finalConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  
  // ===== STATE =====
  
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    memoryUsage: 0,
    cacheHits: 0,
    cacheMisses: 0
  });

  const cacheRef = useRef<Map<string, CacheEntry<unknown>>>(new Map());
  const renderTimesRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(0);

  // ===== PERFORMANCE TRACKING =====

  const startRender = useCallback(() => {
    if (finalConfig.enableMetrics) {
      startTimeRef.current = performance.now();
    }
  }, [finalConfig.enableMetrics]);

  const endRender = useCallback(() => {
    if (!finalConfig.enableMetrics) return;

    const endTime = performance.now();
    const renderTime = endTime - startTimeRef.current;
    
    renderTimesRef.current.push(renderTime);
    
    // Keep only last 100 render times for average calculation
    if (renderTimesRef.current.length > 100) {
      renderTimesRef.current.shift();
    }

    const averageRenderTime = renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length;

    setMetrics(prev => ({
      ...prev,
      renderCount: prev.renderCount + 1,
      lastRenderTime: renderTime,
      averageRenderTime,
      memoryUsage: (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0
    }));
  }, [finalConfig.enableMetrics]);

  // ===== CACHING =====

  const setCache = useCallback(<T>(key: string, data: T): void => {
    if (!finalConfig.enableCaching) return;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + finalConfig.cacheTimeout
    };

    cacheRef.current.set(key, entry);
  }, [finalConfig.enableCaching, finalConfig.cacheTimeout]);

  const getCache = useCallback(<T>(key: string): T | null => {
    if (!finalConfig.enableCaching) return null;

    const entry = cacheRef.current.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      setMetrics(prev => ({ ...prev, cacheMisses: prev.cacheMisses + 1 }));
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      cacheRef.current.delete(key);
      setMetrics(prev => ({ ...prev, cacheMisses: prev.cacheMisses + 1 }));
      return null;
    }

    setMetrics(prev => ({ ...prev, cacheHits: prev.cacheHits + 1 }));
    return entry.data;
  }, [finalConfig.enableCaching]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const getCacheSize = useCallback(() => {
    return cacheRef.current.size;
  }, []);

  // ===== DEBOUNCING =====

  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const debounce = useCallback(<T extends (...args: unknown[]) => unknown>(
    func: T,
    delay: number = finalConfig.debounceDelay
  ): ((...args: Parameters<T>) => void) => {
    return (...args: Parameters<T>) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    };
  }, [finalConfig.debounceDelay]);

  // ===== LAZY LOADING =====

  const [isVisible, setIsVisible] = useState(!finalConfig.enableLazyLoading);
  const observerRef = useRef<IntersectionObserver | undefined>(undefined);

  const lazyRef = useCallback((node: HTMLElement | null) => {
    if (!finalConfig.enableLazyLoading) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (node) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observerRef.current?.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      
      observerRef.current.observe(node);
    }
  }, [finalConfig.enableLazyLoading]);

  // ===== CLEANUP =====

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // ===== RETURN =====

  return {
    // Performance tracking
    metrics,
    startRender,
    endRender,
    
    // Caching
    setCache,
    getCache,
    clearCache,
    getCacheSize,
    
    // Debouncing
    debounce,
    
    // Lazy loading
    isVisible,
    lazyRef,
    
    // Config
    config: finalConfig
  };
}

// ===== SPECIALIZED HOOKS =====

/**
 * useUserDisplayOptimization
 * Specialized hook for UserDisplay component optimization
 * ✅ FIX: Tối ưu để tránh re-render loop do optimization object dependency
 */
export function useUserDisplayOptimization() {
  const { user, isAuthenticated } = useAuth();
  const optimization = usePerformanceOptimization({
    enableCaching: true,
    cacheTimeout: 10 * 60 * 1000, // 10 minutes for user data
    enableLazyLoading: false // User display should always be visible
  });

  // Extract stable functions từ optimization
  const { getCache, setCache, startRender, endRender } = optimization;

  // Cache user display data
  // ✅ FIX: Chỉ depend vào user và isAuthenticated, không depend vào optimization object
  const cachedUserData = useMemo(() => {
    if (!user || !isAuthenticated) return null;

    const cacheKey = `user-display-${user.id}`;
    const cached = getCache<typeof user>(cacheKey);

    if (cached) return cached;

    // Cache the user data
    setCache(cacheKey, user);
    return user;
  }, [user, isAuthenticated, getCache, setCache]);

  // ✅ FIX: Return chỉ những gì cần thiết, không spread optimization object
  return {
    startRender,
    endRender,
    cachedUserData
  };
}

/**
 * useNotificationOptimization
 * Specialized hook for notification optimization
 */
export function useNotificationOptimization() {
  return usePerformanceOptimization({
    enableCaching: true,
    cacheTimeout: 2 * 60 * 1000, // 2 minutes for notifications
    enableLazyLoading: true,
    debounceDelay: 500 // Longer debounce for notifications
  });
}

/**
 * useAuthOptimization
 * Specialized hook for authentication optimization
 */
export function useAuthOptimization() {
  return usePerformanceOptimization({
    enableCaching: true,
    cacheTimeout: 15 * 60 * 1000, // 15 minutes for auth data
    enableLazyLoading: false,
    debounceDelay: 100 // Quick response for auth
  });
}
