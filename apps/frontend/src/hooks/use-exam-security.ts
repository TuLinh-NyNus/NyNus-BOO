/**
 * React Hook for Exam Security Management
 * Provides exam security functionality with React integration
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  BrowserSecurityService, 
  BrowserSecurityConfig, 
  SecurityEvent, 
  defaultExamSecurityConfig 
} from '@/lib/security/browser-security';

export interface ExamSecurityStatus {
  isActive: boolean;
  violations: number;
  maxViolations: number;
  isFullscreen: boolean;
  tabSwitchCount: number;
  windowBlurCount: number;
  copyPasteAttempts: number;
  rightClickAttempts: number;
  isBlocked: boolean;
}

export interface UseExamSecurityOptions {
  config?: Partial<BrowserSecurityConfig>;
  onSecurityEvent?: (event: SecurityEvent) => void;
  onViolationLimitReached?: () => void;
  onSecurityBlocked?: () => void;
  autoStart?: boolean;
  examId?: string;
  sessionId?: string;
}

export interface UseExamSecurityReturn {
  status: ExamSecurityStatus;
  startSecurity: () => void;
  stopSecurity: () => void;
  isSecurityActive: boolean;
  securityEvents: SecurityEvent[];
  clearEvents: () => void;
  reportToBackend: (event: SecurityEvent) => Promise<void>;
}

export function useExamSecurity(options: UseExamSecurityOptions = {}): UseExamSecurityReturn {
  const {
    config = {},
    onSecurityEvent,
    onViolationLimitReached,
    onSecurityBlocked,
    autoStart = false,
    examId,
    sessionId
  } = options;

  const securityServiceRef = useRef<BrowserSecurityService | null>(null);
  const [isSecurityActive, setIsSecurityActive] = useState(false);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [status, setStatus] = useState<ExamSecurityStatus>({
    isActive: false,
    violations: 0,
    maxViolations: 5,
    isFullscreen: false,
    tabSwitchCount: 0,
    windowBlurCount: 0,
    copyPasteAttempts: 0,
    rightClickAttempts: 0,
    isBlocked: false,
  });

  // Initialize security service
  useEffect(() => {
    const securityConfig: BrowserSecurityConfig = {
      ...defaultExamSecurityConfig,
      ...config,
      onSecurityEvent: (event: SecurityEvent) => {
        // Add to events list
        setSecurityEvents(prev => [...prev, event]);
        
        // Update status
        updateStatus();
        
        // Report to backend
        reportToBackend(event).catch(console.error);
        
        // Call custom handler
        if (onSecurityEvent) {
          onSecurityEvent(event);
        }
        
        // Check if should block
        const currentStatus = securityServiceRef.current?.getSecurityStatus();
        if (currentStatus && currentStatus.violations >= currentStatus.maxViolations) {
          setStatus(prev => ({ ...prev, isBlocked: true }));
          if (onSecurityBlocked) {
            onSecurityBlocked();
          }
        }
      },
      onViolationLimitReached: () => {
        setStatus(prev => ({ ...prev, isBlocked: true }));
        if (onViolationLimitReached) {
          onViolationLimitReached();
        }
        if (onSecurityBlocked) {
          onSecurityBlocked();
        }
      }
    };

    securityServiceRef.current = new BrowserSecurityService(securityConfig);

    return () => {
      if (securityServiceRef.current) {
        securityServiceRef.current.stop();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, onSecurityEvent, onViolationLimitReached, onSecurityBlocked]);

  // Update status from security service
  const updateStatus = useCallback(() => {
    if (securityServiceRef.current) {
      const serviceStatus = securityServiceRef.current.getSecurityStatus();
      setStatus(prev => ({
        ...prev,
        ...serviceStatus,
      }));
    }
  }, []);

  // Start security monitoring
  const startSecurity = useCallback(() => {
    if (securityServiceRef.current && !isSecurityActive) {
      securityServiceRef.current.start();
      setIsSecurityActive(true);
      updateStatus();
      
      console.log('Exam security started', { examId, sessionId });
    }
  }, [isSecurityActive, examId, sessionId, updateStatus]);

  // Stop security monitoring
  const stopSecurity = useCallback(() => {
    if (securityServiceRef.current && isSecurityActive) {
      securityServiceRef.current.stop();
      setIsSecurityActive(false);
      setStatus(prev => ({ ...prev, isActive: false }));
      
      console.log('Exam security stopped', { examId, sessionId });
    }
  }, [isSecurityActive, examId, sessionId]);

  // Clear security events
  const clearEvents = useCallback(() => {
    setSecurityEvents([]);
  }, []);

  // Report security event to backend
  const reportToBackend = useCallback(async (event: SecurityEvent) => {
    if (!sessionId) {
      console.warn('No session ID provided for security event reporting');
      return;
    }

    try {
      // This would be replaced with actual API call
      const response = await fetch('/api/exam/security/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          examId,
          eventType: event.type,
          severity: event.severity,
          timestamp: event.timestamp,
          data: event.data,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to report security event: ${response.statusText}`);
      }

      console.log('Security event reported to backend:', event.type);
    } catch (error) {
      console.error('Failed to report security event to backend:', error);
      
      // Store failed events for retry
      const failedEvents = JSON.parse(localStorage.getItem('failedSecurityEvents') || '[]');
      failedEvents.push({
        ...event,
        sessionId,
        examId,
        failedAt: Date.now(),
      });
      localStorage.setItem('failedSecurityEvents', JSON.stringify(failedEvents));
    }
  }, [sessionId, examId]);

  // Retry failed events
  useEffect(() => {
    const retryFailedEvents = async () => {
      const failedEvents = JSON.parse(localStorage.getItem('failedSecurityEvents') || '[]');
      if (failedEvents.length === 0) return;

      const retryPromises = failedEvents.map(async (event: SecurityEvent) => {
        try {
          await reportToBackend(event);
          return event; // Mark for removal
        } catch (error) {
          console.error('Failed to retry security event:', error);
          return null; // Keep for next retry
        }
      });

      const results = await Promise.allSettled(retryPromises);
      const remainingEvents = failedEvents.filter((_: SecurityEvent, index: number) => {
        const result = results[index];
        return result.status === 'rejected' || result.value === null;
      });

      localStorage.setItem('failedSecurityEvents', JSON.stringify(remainingEvents));
    };

    if (isSecurityActive) {
      // Retry failed events every 30 seconds
      const retryInterval = setInterval(retryFailedEvents, 30000);
      return () => clearInterval(retryInterval);
    }
  }, [isSecurityActive, reportToBackend]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (securityServiceRef.current) {
        securityServiceRef.current.stop();
      }
    };
  }, []);

  // Handle page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isSecurityActive) {
        // Page is hidden, this might be a tab switch
        console.log('Page visibility changed - potential tab switch');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isSecurityActive]);

  // Handle beforeunload to warn about leaving exam
  useEffect(() => {
    if (!isSecurityActive) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = 'Bạn có chắc chắn muốn rời khỏi bài thi? Điều này có thể được ghi nhận như một vi phạm bảo mật.';
      return event.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSecurityActive]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && securityServiceRef.current && !isSecurityActive) {
      startSecurity();
    }
  }, [autoStart, isSecurityActive, startSecurity]);

  // Update status periodically
  useEffect(() => {
    if (!isSecurityActive) return;

    const interval = setInterval(() => {
      updateStatus();
    }, 1000);

    return () => clearInterval(interval);
  }, [isSecurityActive, updateStatus]);

  return {
    status,
    startSecurity,
    stopSecurity,
    isSecurityActive,
    securityEvents,
    clearEvents,
    reportToBackend,
  };
}

/**
 * Hook for exam security with automatic session management
 */
export function useExamSecurityWithSession(examId: string, sessionId: string, options: Omit<UseExamSecurityOptions, 'examId' | 'sessionId'> = {}) {
  return useExamSecurity({
    ...options,
    examId,
    sessionId,
    autoStart: true,
  });
}

/**
 * Hook for getting security status without starting security
 */
export function useExamSecurityStatus() {
  const [status, setStatus] = useState<ExamSecurityStatus>({
    isActive: false,
    violations: 0,
    maxViolations: 5,
    isFullscreen: false,
    tabSwitchCount: 0,
    windowBlurCount: 0,
    copyPasteAttempts: 0,
    rightClickAttempts: 0,
    isBlocked: false,
  });

  useEffect(() => {
    const updateStatus = () => {
      setStatus(prev => ({
        ...prev,
        isFullscreen: document.fullscreenElement !== null,
      }));
    };

    document.addEventListener('fullscreenchange', updateStatus);
    return () => document.removeEventListener('fullscreenchange', updateStatus);
  }, []);

  return status;
}
