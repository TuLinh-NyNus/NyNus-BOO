/**
 * Browser Security Service for Exam Anti-Cheating
 * Implements client-side security measures to prevent cheating during exams
 */

export interface SecurityEvent {
  type: SecurityEventType;
  severity: SecuritySeverity;
  timestamp: number;
  data?: Record<string, unknown>;
}

export type SecurityEventType = 
  | 'tab_switch'
  | 'window_blur'
  | 'copy_paste'
  | 'right_click'
  | 'devtools_open'
  | 'fullscreen_exit'
  | 'suspicious_time'
  | 'keyboard_shortcut';

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface BrowserSecurityConfig {
  requireFullscreen: boolean;
  blockCopyPaste: boolean;
  blockRightClick: boolean;
  detectDevTools: boolean;
  monitorTabSwitching: boolean;
  blockKeyboardShortcuts: boolean;
  maxViolations: number;
  onSecurityEvent?: (event: SecurityEvent) => void;
  onViolationLimitReached?: () => void;
}

export class BrowserSecurityService {
  private config: BrowserSecurityConfig;
  private violations: number = 0;
  private isActive: boolean = false;
  private eventListeners: Array<{ element: EventTarget; event: string; handler: EventListener }> = [];
  private devToolsDetector?: NodeJS.Timeout;
  private tabSwitchCount: number = 0;
  private windowBlurCount: number = 0;
  private copyPasteAttempts: number = 0;
  private rightClickAttempts: number = 0;

  constructor(config: BrowserSecurityConfig) {
    // Set defaults first, then override with user config
    const defaults: BrowserSecurityConfig = {
      requireFullscreen: true,
      blockCopyPaste: true,
      blockRightClick: true,
      detectDevTools: true,
      monitorTabSwitching: true,
      blockKeyboardShortcuts: true,
      maxViolations: 5
    };

    this.config = { ...defaults, ...config };
  }

  /**
   * Start security monitoring
   */
  public start(): void {
    if (this.isActive) {
      console.warn('Browser security is already active');
      return;
    }

    this.isActive = true;
    this.violations = 0;

    // Enable fullscreen if required
    if (this.config.requireFullscreen) {
      this.enableFullscreen();
    }

    // Set up event listeners
    this.setupEventListeners();

    // Start developer tools detection
    if (this.config.detectDevTools) {
      this.startDevToolsDetection();
    }

    console.log('Browser security monitoring started');
  }

  /**
   * Stop security monitoring
   */
  public stop(): void {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;

    // Remove all event listeners
    this.removeEventListeners();

    // Stop developer tools detection
    if (this.devToolsDetector) {
      clearInterval(this.devToolsDetector);
      this.devToolsDetector = undefined;
    }

    console.log('Browser security monitoring stopped');
  }

  /**
   * Get current security status
   */
  public getSecurityStatus() {
    return {
      isActive: this.isActive,
      violations: this.violations,
      maxViolations: this.config.maxViolations,
      isFullscreen: document.fullscreenElement !== null,
      tabSwitchCount: this.tabSwitchCount,
      windowBlurCount: this.windowBlurCount,
      copyPasteAttempts: this.copyPasteAttempts,
      rightClickAttempts: this.rightClickAttempts,
    };
  }

  /**
   * Enable fullscreen mode
   */
  private async enableFullscreen(): Promise<void> {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error('Failed to enable fullscreen:', error);
      this.recordSecurityEvent('fullscreen_exit', 'medium', {
        reason: 'Failed to enable fullscreen',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Set up all security event listeners
   */
  private setupEventListeners(): void {
    // Tab switching / window blur detection
    if (this.config.monitorTabSwitching) {
      this.addEventListener(window, 'blur', this.handleWindowBlur.bind(this));
      this.addEventListener(window, 'focus', this.handleWindowFocus.bind(this));
      this.addEventListener(document, 'visibilitychange', this.handleVisibilityChange.bind(this));
    }

    // Copy/paste blocking
    if (this.config.blockCopyPaste) {
      this.addEventListener(document, 'copy', this.handleCopyPaste.bind(this));
      this.addEventListener(document, 'paste', this.handleCopyPaste.bind(this));
      this.addEventListener(document, 'cut', this.handleCopyPaste.bind(this));
    }

    // Right-click blocking
    if (this.config.blockRightClick) {
      this.addEventListener(document, 'contextmenu', this.handleRightClick.bind(this));
    }

    // Keyboard shortcut blocking
    if (this.config.blockKeyboardShortcuts) {
      this.addEventListener(document, 'keydown', this.handleKeyDown.bind(this) as EventListener);
    }

    // Fullscreen exit detection
    if (this.config.requireFullscreen) {
      this.addEventListener(document, 'fullscreenchange', this.handleFullscreenChange.bind(this));
    }

    // Prevent text selection
    this.addEventListener(document, 'selectstart', this.handleSelectStart.bind(this));
  }

  /**
   * Add event listener and track it for cleanup
   */
  private addEventListener(element: EventTarget, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }

  /**
   * Remove all event listeners
   */
  private removeEventListeners(): void {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }

  /**
   * Handle window blur (tab switch)
   */
  private handleWindowBlur(): void {
    this.windowBlurCount++;
    this.recordSecurityEvent('window_blur', 'medium', {
      count: this.windowBlurCount,
      timestamp: Date.now()
    });
  }

  /**
   * Handle window focus
   */
  private handleWindowFocus(): void {
    // Log focus return but don't count as violation
    console.log('Window focus returned');
  }

  /**
   * Handle visibility change (tab switch)
   */
  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.tabSwitchCount++;
      this.recordSecurityEvent('tab_switch', 'high', {
        count: this.tabSwitchCount,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle copy/paste attempts
   */
  private handleCopyPaste(event: Event): void {
    event.preventDefault();
    this.copyPasteAttempts++;
    
    this.recordSecurityEvent('copy_paste', 'critical', {
      type: event.type,
      count: this.copyPasteAttempts,
      timestamp: Date.now()
    });
  }

  /**
   * Handle right-click attempts
   */
  private handleRightClick(event: Event): void {
    event.preventDefault();
    this.rightClickAttempts++;
    
    this.recordSecurityEvent('right_click', 'medium', {
      count: this.rightClickAttempts,
      timestamp: Date.now()
    });
  }

  /**
   * Handle keyboard shortcuts
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const blockedCombinations: Array<{
      key: string;
      ctrl?: boolean;
      shift?: boolean;
      alt?: boolean;
    }> = [
      // Developer tools
      { key: 'F12' },
      { key: 'I', ctrl: true, shift: true }, // Ctrl+Shift+I
      { key: 'J', ctrl: true, shift: true }, // Ctrl+Shift+J
      { key: 'C', ctrl: true, shift: true }, // Ctrl+Shift+C

      // Copy/paste
      { key: 'C', ctrl: true }, // Ctrl+C
      { key: 'V', ctrl: true }, // Ctrl+V
      { key: 'X', ctrl: true }, // Ctrl+X
      { key: 'A', ctrl: true }, // Ctrl+A

      // Navigation
      { key: 'R', ctrl: true }, // Ctrl+R (refresh)
      { key: 'F5' }, // F5 (refresh)
      { key: 'W', ctrl: true }, // Ctrl+W (close tab)
      { key: 'T', ctrl: true }, // Ctrl+T (new tab)
      { key: 'N', ctrl: true }, // Ctrl+N (new window)

      // Browser functions
      { key: 'U', ctrl: true }, // Ctrl+U (view source)
      { key: 'S', ctrl: true }, // Ctrl+S (save)
      { key: 'P', ctrl: true }, // Ctrl+P (print)
    ];

    const isBlocked = blockedCombinations.some(combo => {
      return combo.key === event.key &&
             (!combo.ctrl || event.ctrlKey) &&
             (!combo.shift || event.shiftKey) &&
             (!combo.alt || event.altKey);
    });

    if (isBlocked) {
      event.preventDefault();
      event.stopPropagation();
      
      this.recordSecurityEvent('keyboard_shortcut', 'high', {
        key: event.key,
        ctrl: event.ctrlKey,
        shift: event.shiftKey,
        alt: event.altKey,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle fullscreen change
   */
  private handleFullscreenChange(): void {
    if (!document.fullscreenElement && this.config.requireFullscreen) {
      this.recordSecurityEvent('fullscreen_exit', 'critical', {
        timestamp: Date.now()
      });
      
      // Try to re-enable fullscreen
      setTimeout(() => {
        if (this.isActive) {
          this.enableFullscreen();
        }
      }, 1000);
    }
  }

  /**
   * Handle text selection
   */
  private handleSelectStart(event: Event): void {
    // Allow selection in input fields
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }
    
    event.preventDefault();
  }

  /**
   * Start developer tools detection
   */
  private startDevToolsDetection(): void {
    const devtools = { open: false };
    
    const threshold = 160;
    
    this.devToolsDetector = setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          this.recordSecurityEvent('devtools_open', 'critical', {
            timestamp: Date.now(),
            windowSize: {
              outer: { width: window.outerWidth, height: window.outerHeight },
              inner: { width: window.innerWidth, height: window.innerHeight }
            }
          });
        }
      } else {
        devtools.open = false;
      }
    }, 500);
  }

  /**
   * Record a security event
   */
  private recordSecurityEvent(type: SecurityEventType, severity: SecuritySeverity, data?: Record<string, unknown>): void {
    const event: SecurityEvent = {
      type,
      severity,
      timestamp: Date.now(),
      data
    };

    // Increment violations for medium and higher severity
    if (severity === 'medium' || severity === 'high' || severity === 'critical') {
      this.violations++;
    }

    // Call event handler if provided
    if (this.config.onSecurityEvent) {
      this.config.onSecurityEvent(event);
    }

    // Check if violation limit reached
    if (this.violations >= this.config.maxViolations && this.config.onViolationLimitReached) {
      this.config.onViolationLimitReached();
    }

    console.warn(`Security event: ${type} (${severity})`, data);
  }
}

/**
 * Default browser security configuration for exams
 */
export const defaultExamSecurityConfig: BrowserSecurityConfig = {
  requireFullscreen: true,
  blockCopyPaste: true,
  blockRightClick: true,
  detectDevTools: true,
  monitorTabSwitching: true,
  blockKeyboardShortcuts: true,
  maxViolations: 5,
};
