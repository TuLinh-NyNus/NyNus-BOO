/**
 * Accessibility Utility
 * 
 * Provides comprehensive accessibility tools and helpers for the NyNus application
 * including ARIA attributes, keyboard navigation, and screen reader support
 */

import logger from './logger';

interface A11yConfig {
  announcePageChanges?: boolean;
  enableKeyboardNavigation?: boolean;
  enableFocusManagement?: boolean;
  enableScreenReaderSupport?: boolean;
}

interface FocusableElement extends HTMLElement {
  tabIndex: number;
}

interface FocusManagementOptions {
  preventScroll?: boolean;
  restoreFocus?: boolean;
}

interface FormFieldAriaOptions {
  labelId?: string;
  descriptionId?: string;
  errorId?: string;
  required?: boolean;
  invalid?: boolean;
}

interface InteractiveAriaOptions {
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
  pressed?: boolean;
  checked?: boolean;
}

class AccessibilityManager {
  private config: A11yConfig;
  private announcer: HTMLElement | null = null;
  private focusHistory: HTMLElement[] = [];
  private isInitialized = false;

  constructor(config: A11yConfig = {}) {
    this.config = {
      announcePageChanges: true,
      enableKeyboardNavigation: true,
      enableFocusManagement: true,
      enableScreenReaderSupport: true,
      ...config
    };
  }

  /**
   * Initialize accessibility features
   */
  initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    if (this.config.announcePageChanges) {
      this.setupAnnouncer();
    }

    if (this.config.enableKeyboardNavigation) {
      this.setupKeyboardNavigation();
    }

    if (this.config.enableFocusManagement) {
      this.setupFocusManagement();
    }

    this.isInitialized = true;
    logger.info('♿ Accessibility features initialized');
  }

  /**
   * Announce message to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.announcer) {
      this.setupAnnouncer();
    }

    if (this.announcer) {
      this.announcer.setAttribute('aria-live', priority);
      this.announcer.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (this.announcer) {
          this.announcer.textContent = '';
        }
      }, 1000);
    }

    logger.info(`📢 A11y announcement (${priority}): ${message}`);
  }

  /**
   * Manage focus for better keyboard navigation
   */
  manageFocus(element: HTMLElement | null, Options: FocusManagementOptions = {}): void {
    if (!element) return;

    const { preventScroll = false, restoreFocus = false } = options;

    if (restoreFocus && this.focusHistory.length > 0) {
      const previousElement = this.focusHistory.pop();
      if (previousElement && document.contains(previousElement)) {
        previousElement.focus({ preventScroll });
        return;
      }
    }

    // Store current focus for restoration
    const currentFocus = document.activeElement as HTMLElement;
    if (currentFocus && currentFocus !== document.body) {
      this.focusHistory.push(currentFocus);
    }

    element.focus({ preventScroll });
  }

  /**
   * Trap focus within a container (for modals, dropdowns)
   */
  trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    
    if (focusableElements.length === 0) {
      return () => {}; // No cleanup needed
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Focus first element
    firstElement.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  /**
   * Get all focusable elements within a container
   */
  getFocusableElements(container: HTMLElement): FocusableElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    const elements = container.querySelectorAll(focusableSelectors) as NodeListOf<FocusableElement>;
    
    return Array.from(elements).filter(element => {
      return element.offsetWidth > 0 && 
             element.offsetHeight > 0 && 
             !element.hidden &&
             window.getComputedStyle(element).visibility !== 'hidden';
    });
  }

  /**
   * Generate unique ID for ARIA attributes
   */
  generateId(prefix = 'a11y'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create ARIA attributes for form fields
   */
  createFormFieldAria(Options: FormFieldAriaOptions): Record<string, string> {
    const aria: Record<string, string> = {};

    if (options.labelId) {
      aria['aria-labelledby'] = options.labelId;
    }

    if (options.descriptionId) {
      aria['aria-describedby'] = options.descriptionId;
    }

    if (options.errorId && options.invalid) {
      const describedBy = aria['aria-describedby'];
      aria['aria-describedby'] = describedBy 
        ? `${describedBy} ${options.errorId}`
        : options.errorId;
    }

    if (options.required) {
      aria['aria-required'] = 'true';
    }

    if (options.invalid) {
      aria['aria-invalid'] = 'true';
    }

    return aria;
  }

  /**
   * Create ARIA attributes for interactive elements
   */
  createInteractiveAria(Options: InteractiveAriaOptions & {
    controls?: string;
    describedBy?: string;
    label?: string;
  }): Record<string, string> {
    const aria: Record<string, string> = {};

    if (typeof options.expanded === 'boolean') {
      aria['aria-expanded'] = options.expanded.toString();
    }

    if (options.controls) {
      aria['aria-controls'] = options.controls;
    }

    if (options.describedBy) {
      aria['aria-describedby'] = options.describedBy;
    }

    if (options.label) {
      aria['aria-label'] = options.label;
    }

    if (typeof options.pressed === 'boolean') {
      aria['aria-pressed'] = options.pressed.toString();
    }

    if (typeof options.selected === 'boolean') {
      aria['aria-selected'] = options.selected.toString();
    }

    if (options.disabled) {
      aria['aria-disabled'] = 'true';
    }

    return aria;
  }

  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Check if user prefers high contrast
   */
  prefersHighContrast(): boolean {
    if (typeof window === 'undefined') return false;
    
    return window.matchMedia('(prefers-contrast: high)').matches;
  }

  /**
   * Check if user prefers dark theme
   */
  prefersDarkTheme(): boolean {
    if (typeof window === 'undefined') return false;
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Setup live announcer for screen readers
   */
  private setupAnnouncer(): void {
    if (this.announcer || typeof document === 'undefined') return;

    this.announcer = document.createElement('div');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.setAttribute('aria-relevant', 'text');
    this.announcer.style.position = 'absolute';
    this.announcer.style.left = '-10000px';
    this.announcer.style.width = '1px';
    this.announcer.style.height = '1px';
    this.announcer.style.overflow = 'hidden';

    document.body.appendChild(this.announcer);
  }

  /**
   * Setup keyboard navigation helpers
   */
  private setupKeyboardNavigation(): void {
    if (typeof document === 'undefined') return;

    // Add visible focus indicators for keyboard users
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });

    // Escape key handler for modals and dropdowns
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        const activeModal = document.querySelector('[role="dialog"][aria-modal="true"]');
        if (activeModal) {
          const closeButton = activeModal.querySelector('[data-close]') as HTMLElement;
          if (closeButton) {
            closeButton.click();
          }
        }
      }
    });
  }

  /**
   * Setup focus management
   */
  private setupFocusManagement(): void {
    if (typeof document === 'undefined') return;

    // Skip links for keyboard users
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Chuyển đến nội dung chính';
    skipLink.className = 'skip-link';
    skipLink.style.position = 'absolute';
    skipLink.style.top = '-40px';
    skipLink.style.left = '6px';
    skipLink.style.background = '#000';
    skipLink.style.color = '#fff';
    skipLink.style.padding = '8px';
    skipLink.style.textDecoration = 'none';
    skipLink.style.zIndex = '9999';

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  /**
   * Cleanup accessibility features
   */
  cleanup(): void {
    if (this.announcer && this.announcer.parentNode) {
      this.announcer.parentNode.removeChild(this.announcer);
      this.announcer = null;
    }

    this.focusHistory = [];
    this.isInitialized = false;
    
    logger.info('♿ Accessibility features cleaned up');
  }
}

// Export singleton instance
export const accessibilityManager = new AccessibilityManager();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  accessibilityManager.initialize();
}

// Export utility functions
export const a11y = {
  announce: (message: string, priority?: 'polite' | 'assertive'): void =>
    accessibilityManager.announce(message, priority),
  
  manageFocus: (element: HTMLElement | null, options?: FocusManagementOptions): void =>
    accessibilityManager.manageFocus(element, options),

  trapFocus: (container: HTMLElement): () => void =>
    accessibilityManager.trapFocus(container),

  generateId: (prefix?: string): string =>
    accessibilityManager.generateId(prefix),

  createFormFieldAria: (Options: FormFieldAriaOptions): Record<string, string> =>
    accessibilityManager.createFormFieldAria(options),

  createInteractiveAria: (Options: InteractiveAriaOptions & { controls?: string; describedBy?: string; label?: string }): Record<string, string> =>
    accessibilityManager.createInteractiveAria(options),
  
  prefersReducedMotion: (): boolean =>
    accessibilityManager.prefersReducedMotion(),
  
  prefersHighContrast: (): boolean =>
    accessibilityManager.prefersHighContrast(),
  
  prefersDarkTheme: (): boolean =>
    accessibilityManager.prefersDarkTheme()
};

export default accessibilityManager;
