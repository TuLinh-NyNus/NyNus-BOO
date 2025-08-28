"use client";

import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Interface cho horizontal scroll state
 */
export interface HorizontalScrollState {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  isScrolling: boolean;
  currentIndex: number;
}

/**
 * Options cho useHorizontalScroll hook
 */
export interface UseHorizontalScrollOptions {
  scrollAmount?: number; // Phần trăm width để scroll (default: 0.8)
  scrollThreshold?: number; // Threshold để detect scroll end (default: 10)
  scrollDelay?: number; // Delay sau khi scroll để check state (default: 300)
}

/**
 * Return type cho useHorizontalScroll hook
 */
export interface UseHorizontalScrollReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  scrollState: HorizontalScrollState;
  scroll: (direction: 'left' | 'right') => void;
  checkScrollable: () => void;
  scrollToIndex: (index: number) => void;
}

/**
 * Custom hook để quản lý horizontal scroll behavior
 * Dựa trên pattern từ featured-courses.tsx
 * 
 * @param options - Cấu hình cho scroll behavior
 * @returns Object chứa ref, state và functions để control scroll
 */
export function useHorizontalScroll(
  options: UseHorizontalScrollOptions = {}
): UseHorizontalScrollReturn {
  const {
    scrollAmount = 0.8,
    scrollThreshold = 10,
    scrollDelay = 300
  } = options;

  // Refs và state
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState<HorizontalScrollState>({
    canScrollLeft: false,
    canScrollRight: true,
    isScrolling: false,
    currentIndex: 0
  });

  /**
   * Kiểm tra khả năng scroll left/right
   */
  const checkScrollable = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;

    // Xác định bước scroll thực tế giữa các card bằng khoảng cách offsetLeft của 2 phần tử liên tiếp
    let stepWidth = clientWidth * 0.85; // fallback an toàn
    const children = Array.from(containerRef.current.children) as HTMLElement[];
    if (children.length >= 2) {
      const firstLeft = children[0].offsetLeft;
      const secondLeft = children[1].offsetLeft;
      const delta = secondLeft - firstLeft;
      if (delta > 0) stepWidth = delta;
    } else if (children.length === 1) {
      // Khi chỉ có 1 item, step chính là chiều rộng của nó
      stepWidth = children[0].getBoundingClientRect().width;
    }

    const currentIndex = Math.round(scrollLeft / stepWidth);
    const maxScrollLeft = Math.max(0, scrollWidth - clientWidth);

    setScrollState(prev => ({
      ...prev,
      canScrollLeft: scrollLeft > 0,
      canScrollRight: scrollLeft < maxScrollLeft - scrollThreshold,
      isScrolling: false,
      currentIndex: Math.max(0, currentIndex)
    }));
  }, [scrollThreshold]);

  /**
   * Scroll theo direction với smooth behavior
   */
  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!containerRef.current) return;

    setScrollState(prev => ({ ...prev, isScrolling: true }));

    const scrollAmountPx = containerRef.current.clientWidth * scrollAmount;
    const newScrollLeft = direction === 'left'
      ? containerRef.current.scrollLeft - scrollAmountPx
      : containerRef.current.scrollLeft + scrollAmountPx;

    containerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });

    // Kiểm tra lại state sau khi scroll
    setTimeout(checkScrollable, scrollDelay);
  }, [scrollAmount, scrollDelay, checkScrollable]);

  /**
   * Cuộn tới item theo index dựa trên step thực tế của các card
   */
  const scrollToIndex = useCallback((index: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const children = Array.from(container.children) as HTMLElement[];

    // Ưu tiên dùng offsetLeft của chính phần tử mục tiêu nếu có
    if (children[index]) {
      container.scrollTo({ left: children[index].offsetLeft, behavior: 'smooth' });
      setTimeout(checkScrollable, scrollDelay);
      return;
    }

    // Fallback: tính theo stepWidth
    let stepWidth = container.clientWidth * 0.85;
    if (children.length >= 2) {
      const delta = children[1].offsetLeft - children[0].offsetLeft;
      if (delta > 0) stepWidth = delta;
    } else if (children.length === 1) {
      stepWidth = children[0].getBoundingClientRect().width;
    }

    const targetLeft = Math.max(0, Math.round(index) * stepWidth);
    container.scrollTo({ left: targetLeft, behavior: 'smooth' });
    setTimeout(checkScrollable, scrollDelay);
  }, [checkScrollable, scrollDelay]);

  /**
   * Setup scroll event listener để update state
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial check
    checkScrollable();

    // Add scroll listener
    const handleScroll = () => {
      checkScrollable();
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [checkScrollable]);

  /**
   * Resize observer để update state khi container size thay đổi
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      checkScrollable();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [checkScrollable]);

  return {
    containerRef,
    scrollState,
    scroll,
    checkScrollable,
    scrollToIndex
  };
}


