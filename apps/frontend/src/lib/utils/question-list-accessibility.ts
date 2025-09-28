/**
 * Question List Accessibility Utilities
 * Accessibility enhancements cho question list components
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { Question } from '@/lib/types/question';

// ===== TYPES =====

export interface AccessibilityConfig {
  enableKeyboardNavigation: boolean;
  enableScreenReader: boolean;
  enableFocusManagement: boolean;
  enableAriaLabels: boolean;
  announceChanges: boolean;
}

export interface KeyboardNavigationConfig {
  enableArrowKeys: boolean;
  enableHomeEnd: boolean;
  enablePageUpDown: boolean;
  enableEnterSpace: boolean;
  enableEscape: boolean;
}

// ===== CONSTANTS =====

export const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityConfig = {
  enableKeyboardNavigation: true,
  enableScreenReader: true,
  enableFocusManagement: true,
  enableAriaLabels: true,
  announceChanges: true
};

export const DEFAULT_KEYBOARD_CONFIG: KeyboardNavigationConfig = {
  enableArrowKeys: true,
  enableHomeEnd: true,
  enablePageUpDown: true,
  enableEnterSpace: true,
  enableEscape: true
};

// ===== ARIA LABEL UTILITIES =====

/**
 * Generate ARIA labels cho question list items
 */
export function generateQuestionAriaLabel(question: {
  id: string;
  content?: string;
  type?: string;
  difficulty?: string;
  status?: string;
  questionCodeId?: string;
}): string {
  const parts = [];
  
  if (question.questionCodeId) {
    parts.push(`Mã câu hỏi ${question.questionCodeId}`);
  }
  
  if (question.content) {
    const truncatedContent = question.content.length > 100 
      ? question.content.substring(0, 100) + '...'
      : question.content;
    parts.push(`Nội dung: ${truncatedContent}`);
  }
  
  if (question.type) {
    const typeMap = {
      'MULTIPLE_CHOICE': 'Trắc nghiệm',
      'TRUE_FALSE': 'Đúng sai',
      'SHORT_ANSWER': 'Trả lời ngắn',
      'ESSAY': 'Tự luận',
      'MATCHING': 'Ghép đôi'
    };
    parts.push(`Loại: ${typeMap[question.type as keyof typeof typeMap] || question.type}`);
  }
  
  if (question.difficulty) {
    parts.push(`Độ khó: ${question.difficulty}`);
  }
  
  if (question.status) {
    const statusMap = {
      'ACTIVE': 'Hoạt động',
      'INACTIVE': 'Không hoạt động',
      'DRAFT': 'Bản nháp',
      'ARCHIVED': 'Lưu trữ'
    };
    parts.push(`Trạng thái: ${statusMap[question.status as keyof typeof statusMap] || question.status}`);
  }
  
  return parts.join(', ');
}

/**
 * Generate ARIA labels cho bulk actions
 */
export function generateBulkActionAriaLabel(
  actionType: string,
  selectedCount: number
): string {
  const actionMap = {
    'delete': 'xóa',
    'export': 'xuất',
    'archive': 'lưu trữ',
    'duplicate': 'nhân bản',
    'status-change': 'thay đổi trạng thái'
  };
  
  const action = actionMap[actionType as keyof typeof actionMap] || actionType;
  return `${action} ${selectedCount} câu hỏi đã chọn`;
}

/**
 * Generate ARIA live region announcements
 */
export function generateLiveRegionAnnouncement(
  type: 'filter' | 'sort' | 'selection' | 'action',
  details: Record<string, unknown>
): string {
  switch (type) {
    case 'filter':
      return `Đã lọc, hiển thị ${details.count} câu hỏi`;
    
    case 'sort':
      return `Đã sắp xếp theo ${details.field} ${details.direction === 'asc' ? 'tăng dần' : 'giảm dần'}`;
    
    case 'selection':
      if (details.count === 0) {
        return 'Đã bỏ chọn tất cả câu hỏi';
      } else if (details.isAll) {
        return `Đã chọn tất cả ${details.count} câu hỏi`;
      } else {
        return `Đã chọn ${details.count} câu hỏi`;
      }
    
    case 'action':
      return `Đã ${details.action} ${details.count} câu hỏi thành công`;
    
    default:
      return '';
  }
}

// ===== KEYBOARD NAVIGATION =====

/**
 * Keyboard navigation hook cho question list
 */
export function useKeyboardNavigation(
  items: Question[],
  config: KeyboardNavigationConfig = DEFAULT_KEYBOARD_CONFIG
) {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isNavigating, setIsNavigating] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!config.enableArrowKeys || items.length === 0) return;

    const { key } = event;
    let newIndex = focusedIndex;
    let handled = false;

    // Arrow key navigation
    if (config.enableArrowKeys) {
      if (key === 'ArrowDown') {
        newIndex = Math.min(focusedIndex + 1, items.length - 1);
        handled = true;
      } else if (key === 'ArrowUp') {
        newIndex = Math.max(focusedIndex - 1, 0);
        handled = true;
      }
    }

    // Home/End navigation
    if (config.enableHomeEnd) {
      if (key === 'Home') {
        newIndex = 0;
        handled = true;
      } else if (key === 'End') {
        newIndex = items.length - 1;
        handled = true;
      }
    }

    // Page Up/Down navigation
    if (config.enablePageUpDown) {
      const pageSize = 10; // Items per page
      if (key === 'PageDown') {
        newIndex = Math.min(focusedIndex + pageSize, items.length - 1);
        handled = true;
      } else if (key === 'PageUp') {
        newIndex = Math.max(focusedIndex - pageSize, 0);
        handled = true;
      }
    }

    if (handled) {
      event.preventDefault();
      setFocusedIndex(newIndex);
      setIsNavigating(true);
      
      // Focus the element
      const element = containerRef.current?.querySelector(
        `[data-question-index="${newIndex}"]`
      ) as HTMLElement;
      element?.focus();
    }
  }, [focusedIndex, items.length, config]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    focusedIndex,
    setFocusedIndex,
    isNavigating,
    containerRef
  };
}

// ===== SCREEN READER SUPPORT =====

/**
 * Screen reader announcements hook
 */
export function useScreenReaderAnnouncements() {
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!liveRegionRef.current) return;

    // Clear previous message
    liveRegionRef.current.textContent = '';
    
    // Set new message after a brief delay to ensure screen readers pick it up
    setTimeout(() => {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = message;
        liveRegionRef.current.setAttribute('aria-live', priority);
      }
    }, 100);
  }, []);

  const LiveRegion = useCallback(() => {
    return React.createElement('div', {
      ref: liveRegionRef,
      'aria-live': 'polite',
      'aria-atomic': 'true',
      className: 'sr-only'
    });
  }, []);

  return { announce, LiveRegion };
}

// ===== FOCUS MANAGEMENT =====

/**
 * Focus management hook
 */
export function useFocusManagement() {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const focusTrapRef = useRef<HTMLElement>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, []);

  const trapFocus = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !focusTrapRef.current) return;

    const focusableElements = focusTrapRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, []);

  return {
    saveFocus,
    restoreFocus,
    trapFocus,
    focusTrapRef
  };
}

// ===== REDUCED MOTION SUPPORT =====

/**
 * Reduced motion preference hook
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// ===== HIGH CONTRAST SUPPORT =====

/**
 * High contrast mode detection
 */
export function useHighContrast(): boolean {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const checkHighContrast = () => {
      // Check for Windows high contrast mode
      const isWindowsHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      
      // Check for forced colors (Windows high contrast)
      const isForcedColors = window.matchMedia('(forced-colors: active)').matches;
      
      setIsHighContrast(isWindowsHighContrast || isForcedColors);
    };

    checkHighContrast();

    // Listen for changes
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const forcedColorsQuery = window.matchMedia('(forced-colors: active)');

    contrastQuery.addEventListener('change', checkHighContrast);
    forcedColorsQuery.addEventListener('change', checkHighContrast);

    return () => {
      contrastQuery.removeEventListener('change', checkHighContrast);
      forcedColorsQuery.removeEventListener('change', checkHighContrast);
    };
  }, []);

  return isHighContrast;
}

// ===== MAIN ACCESSIBILITY HOOK =====

/**
 * Main accessibility hook combining all features
 */
export function useQuestionListAccessibility(
  items: Question[],
  config: Partial<AccessibilityConfig> = {}
) {
  const accessibilityConfig = { ...DEFAULT_ACCESSIBILITY_CONFIG, ...config };
  
  const { announce, LiveRegion } = useScreenReaderAnnouncements();
  const { saveFocus, restoreFocus, trapFocus, focusTrapRef } = useFocusManagement();
  const { focusedIndex, setFocusedIndex, isNavigating, containerRef } = useKeyboardNavigation(items);
  
  const prefersReducedMotion = useReducedMotion();
  const isHighContrast = useHighContrast();

  return {
    // Screen reader
    announce,
    LiveRegion,
    
    // Focus management
    saveFocus,
    restoreFocus,
    trapFocus,
    focusTrapRef,
    
    // Keyboard navigation
    focusedIndex,
    setFocusedIndex,
    isNavigating,
    containerRef,
    
    // Preferences
    prefersReducedMotion,
    isHighContrast,
    
    // Config
    config: accessibilityConfig
  };
}
