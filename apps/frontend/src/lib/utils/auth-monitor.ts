/**
 * Authentication Monitoring and Metrics
 * ====================================
 * Centralized monitoring cho authentication operations
 * 
 * Business Logic:
 * - Track authentication events và metrics
 * - Monitor token refresh success/failure rates
 * - Detect authentication issues và patterns
 * - Provide debugging information
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

import { logger } from '@/lib/utils/logger';
import { AuthErrorType } from '@/lib/utils/auth-error-handler';

/**
 * Authentication event types
 */
export enum AuthEventType {
  // Login events
  LOGIN_ATTEMPT = 'LOGIN_ATTEMPT',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  
  // Token events
  TOKEN_REFRESH_ATTEMPT = 'TOKEN_REFRESH_ATTEMPT',
  TOKEN_REFRESH_SUCCESS = 'TOKEN_REFRESH_SUCCESS',
  TOKEN_REFRESH_FAILURE = 'TOKEN_REFRESH_FAILURE',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Session events
  SESSION_CREATED = 'SESSION_CREATED',
  SESSION_EXTENDED = 'SESSION_EXTENDED',
  SESSION_DESTROYED = 'SESSION_DESTROYED',
  FORCED_LOGOUT = 'FORCED_LOGOUT',
  
  // Error events
  AUTH_ERROR = 'AUTH_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
}

/**
 * Authentication event data
 */
export interface AuthEvent {
  type: AuthEventType;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  operation?: string;
  success: boolean;
  duration?: number;
  errorType?: AuthErrorType;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

/**
 * Authentication metrics
 */
export interface AuthMetrics {
  // Login metrics
  totalLoginAttempts: number;
  successfulLogins: number;
  failedLogins: number;
  loginSuccessRate: number;
  
  // Token refresh metrics
  totalRefreshAttempts: number;
  successfulRefreshes: number;
  failedRefreshes: number;
  refreshSuccessRate: number;
  
  // Session metrics
  activeSessions: number;
  averageSessionDuration: number;
  forcedLogouts: number;
  
  // Error metrics
  errorsByType: Record<AuthErrorType, number>;
  networkErrors: number;
  serverErrors: number;
  
  // Performance metrics
  averageLoginDuration: number;
  averageRefreshDuration: number;
}

/**
 * Authentication Monitor Class
 */
export class AuthMonitor {
  private static events: AuthEvent[] = [];
  private static maxEvents = 1000; // Keep last 1000 events
  
  /**
   * Record authentication event
   * 
   * @param event - Authentication event data
   */
  static recordEvent(event: Omit<AuthEvent, 'timestamp'>): void {
    const fullEvent: AuthEvent = {
      ...event,
      timestamp: Date.now(),
    };
    
    // Add to events array
    this.events.push(fullEvent);
    
    // Keep only last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
    
    // Log event
    const logLevel = event.success ? 'info' : 'warn';
    logger[logLevel]('[AuthMonitor] Authentication event recorded', {
      type: event.type,
      success: event.success,
      operation: event.operation,
      duration: event.duration,
      errorType: event.errorType,
      userId: event.userId,
      metadata: event.metadata,
    });
  }

  /**
   * Record login attempt
   */
  static recordLoginAttempt(userId?: string, metadata?: Record<string, any>): void {
    this.recordEvent({
      type: AuthEventType.LOGIN_ATTEMPT,
      userId,
      operation: 'login',
      success: true, // Attempt itself is successful
      metadata,
    });
  }

  /**
   * Record login success
   */
  static recordLoginSuccess(userId: string, duration: number, metadata?: Record<string, any>): void {
    this.recordEvent({
      type: AuthEventType.LOGIN_SUCCESS,
      userId,
      operation: 'login',
      success: true,
      duration,
      metadata,
    });
  }

  /**
   * Record login failure
   */
  static recordLoginFailure(errorType: AuthErrorType, errorMessage: string, duration: number, metadata?: Record<string, any>): void {
    this.recordEvent({
      type: AuthEventType.LOGIN_FAILURE,
      operation: 'login',
      success: false,
      duration,
      errorType,
      errorMessage,
      metadata,
    });
  }

  /**
   * Record token refresh attempt
   */
  static recordTokenRefreshAttempt(userId?: string, metadata?: Record<string, any>): void {
    this.recordEvent({
      type: AuthEventType.TOKEN_REFRESH_ATTEMPT,
      userId,
      operation: 'token_refresh',
      success: true, // Attempt itself is successful
      metadata,
    });
  }

  /**
   * Record token refresh success
   */
  static recordTokenRefreshSuccess(duration: number, userId?: string, metadata?: Record<string, any>): void {
    this.recordEvent({
      type: AuthEventType.TOKEN_REFRESH_SUCCESS,
      userId,
      operation: 'token_refresh',
      success: true,
      duration,
      metadata,
    });
  }

  /**
   * Record token refresh failure
   */
  static recordTokenRefreshFailure(errorType: AuthErrorType, errorMessage: string, duration: number, metadata?: Record<string, any>): void {
    this.recordEvent({
      type: AuthEventType.TOKEN_REFRESH_FAILURE,
      operation: 'token_refresh',
      success: false,
      duration,
      errorType,
      errorMessage,
      metadata,
    });
  }

  /**
   * Record session creation
   */
  static recordSessionCreated(userId: string, sessionId?: string, metadata?: Record<string, any>): void {
    this.recordEvent({
      type: AuthEventType.SESSION_CREATED,
      userId,
      sessionId,
      operation: 'session_create',
      success: true,
      metadata,
    });
  }

  /**
   * Record forced logout
   */
  static recordForcedLogout(userId?: string, reason?: string, metadata?: Record<string, any>): void {
    this.recordEvent({
      type: AuthEventType.FORCED_LOGOUT,
      userId,
      operation: 'forced_logout',
      success: false,
      errorMessage: reason,
      metadata,
    });
  }

  /**
   * Get authentication metrics
   */
  static getMetrics(): AuthMetrics {
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    const recentEvents = this.events.filter(event => event.timestamp >= last24Hours);
    
    // Login metrics
    const loginAttempts = recentEvents.filter(e => e.type === AuthEventType.LOGIN_ATTEMPT);
    const loginSuccesses = recentEvents.filter(e => e.type === AuthEventType.LOGIN_SUCCESS);
    const loginFailures = recentEvents.filter(e => e.type === AuthEventType.LOGIN_FAILURE);
    
    // Token refresh metrics
    const refreshAttempts = recentEvents.filter(e => e.type === AuthEventType.TOKEN_REFRESH_ATTEMPT);
    const refreshSuccesses = recentEvents.filter(e => e.type === AuthEventType.TOKEN_REFRESH_SUCCESS);
    const refreshFailures = recentEvents.filter(e => e.type === AuthEventType.TOKEN_REFRESH_FAILURE);
    
    // Session metrics
    const sessionCreated = recentEvents.filter(e => e.type === AuthEventType.SESSION_CREATED);
    const forcedLogouts = recentEvents.filter(e => e.type === AuthEventType.FORCED_LOGOUT);
    
    // Error metrics
    const errorsByType: Record<AuthErrorType, number> = {} as Record<AuthErrorType, number>;
    Object.values(AuthErrorType).forEach(type => {
      errorsByType[type] = recentEvents.filter(e => e.errorType === type).length;
    });
    
    const networkErrors = recentEvents.filter(e => e.errorType === AuthErrorType.NETWORK_ERROR || e.errorType === AuthErrorType.TIMEOUT_ERROR).length;
    const serverErrors = recentEvents.filter(e => e.errorType === AuthErrorType.SERVER_ERROR || e.errorType === AuthErrorType.SERVICE_UNAVAILABLE).length;
    
    // Performance metrics
    const loginDurations = loginSuccesses.filter(e => e.duration).map(e => e.duration!);
    const refreshDurations = refreshSuccesses.filter(e => e.duration).map(e => e.duration!);
    
    return {
      // Login metrics
      totalLoginAttempts: loginAttempts.length,
      successfulLogins: loginSuccesses.length,
      failedLogins: loginFailures.length,
      loginSuccessRate: loginAttempts.length > 0 ? (loginSuccesses.length / loginAttempts.length) * 100 : 0,
      
      // Token refresh metrics
      totalRefreshAttempts: refreshAttempts.length,
      successfulRefreshes: refreshSuccesses.length,
      failedRefreshes: refreshFailures.length,
      refreshSuccessRate: refreshAttempts.length > 0 ? (refreshSuccesses.length / refreshAttempts.length) * 100 : 0,
      
      // Session metrics
      activeSessions: sessionCreated.length,
      averageSessionDuration: 0, // Would need session end events to calculate
      forcedLogouts: forcedLogouts.length,
      
      // Error metrics
      errorsByType,
      networkErrors,
      serverErrors,
      
      // Performance metrics
      averageLoginDuration: loginDurations.length > 0 ? loginDurations.reduce((a, b) => a + b, 0) / loginDurations.length : 0,
      averageRefreshDuration: refreshDurations.length > 0 ? refreshDurations.reduce((a, b) => a + b, 0) / refreshDurations.length : 0,
    };
  }

  /**
   * Get recent events for debugging
   */
  static getRecentEvents(limit: number = 50): AuthEvent[] {
    return this.events.slice(-limit).reverse(); // Most recent first
  }

  /**
   * Get events by type
   */
  static getEventsByType(type: AuthEventType, limit: number = 50): AuthEvent[] {
    return this.events
      .filter(event => event.type === type)
      .slice(-limit)
      .reverse();
  }

  /**
   * Get events by user
   */
  static getEventsByUser(userId: string, limit: number = 50): AuthEvent[] {
    return this.events
      .filter(event => event.userId === userId)
      .slice(-limit)
      .reverse();
  }

  /**
   * Clear old events (for memory management)
   */
  static clearOldEvents(olderThanMs: number = 7 * 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - olderThanMs;
    const originalLength = this.events.length;
    this.events = this.events.filter(event => event.timestamp >= cutoff);
    
    const removedCount = originalLength - this.events.length;
    if (removedCount > 0) {
      logger.info('[AuthMonitor] Cleared old authentication events', {
        removedCount,
        remainingCount: this.events.length,
        cutoffDate: new Date(cutoff).toISOString(),
      });
    }
  }

  /**
   * Generate authentication health report
   */
  static generateHealthReport(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    metrics: AuthMetrics;
  } {
    const metrics = this.getMetrics();
    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    // Check login success rate
    if (metrics.loginSuccessRate < 80 && metrics.totalLoginAttempts > 10) {
      issues.push(`Login success rate thấp: ${metrics.loginSuccessRate.toFixed(1)}%`);
      status = 'warning';
    }
    
    // Check token refresh success rate
    if (metrics.refreshSuccessRate < 90 && metrics.totalRefreshAttempts > 10) {
      issues.push(`Token refresh success rate thấp: ${metrics.refreshSuccessRate.toFixed(1)}%`);
      if (metrics.refreshSuccessRate < 70) {
        status = 'critical';
      } else if (status === 'healthy') {
        status = 'warning';
      }
    }
    
    // Check network errors
    if (metrics.networkErrors > metrics.totalRefreshAttempts * 0.3) {
      issues.push(`Nhiều network errors: ${metrics.networkErrors}`);
      if (status !== 'critical') {
        status = 'warning';
      }
    }
    
    // Check server errors
    if (metrics.serverErrors > metrics.totalRefreshAttempts * 0.2) {
      issues.push(`Nhiều server errors: ${metrics.serverErrors}`);
      if (status !== 'critical') {
        status = 'warning';
      }
    }
    
    // Check forced logouts
    if (metrics.forcedLogouts > metrics.successfulLogins * 0.1) {
      issues.push(`Nhiều forced logouts: ${metrics.forcedLogouts}`);
      status = 'critical';
    }
    
    return {
      status,
      issues,
      metrics,
    };
  }

  /**
   * Log health report
   */
  static logHealthReport(): void {
    const report = this.generateHealthReport();
    
    const logLevel = report.status === 'critical' ? 'error' : 
                    report.status === 'warning' ? 'warn' : 'info';
    
    logger[logLevel]('[AuthMonitor] Authentication health report', {
      status: report.status,
      issues: report.issues,
      loginSuccessRate: report.metrics.loginSuccessRate,
      refreshSuccessRate: report.metrics.refreshSuccessRate,
      networkErrors: report.metrics.networkErrors,
      serverErrors: report.metrics.serverErrors,
      forcedLogouts: report.metrics.forcedLogouts,
    });
  }
}

/**
 * Utility function to start periodic health monitoring
 */
export function startAuthMonitoring(intervalMs: number = 5 * 60 * 1000): void {
  // Log health report every 5 minutes
  setInterval(() => {
    AuthMonitor.logHealthReport();
  }, intervalMs);
  
  // Clear old events every hour
  setInterval(() => {
    AuthMonitor.clearOldEvents();
  }, 60 * 60 * 1000);
  
  logger.info('[AuthMonitor] Authentication monitoring started', {
    healthReportInterval: intervalMs,
    cleanupInterval: 60 * 60 * 1000,
  });
}

export default AuthMonitor;

