/**
 * Security Audit Logger
 *
 * Comprehensive logging system cho security events và audit trails
 * Hỗ trợ compliance requirements và security monitoring
 */

import logger from '@/lib/utils/logger';

/**
 * Security event types
 */
export enum SecurityEventType {
  // Authentication events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',

  // Registration events
  REGISTRATION_SUCCESS = 'REGISTRATION_SUCCESS',
  REGISTRATION_FAILED = 'REGISTRATION_FAILED',

  // Password reset events
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_SUCCESS = 'PASSWORD_RESET_SUCCESS',
  PASSWORD_RESET_FAILED = 'PASSWORD_RESET_FAILED',

  // Authorization events
  ACCESS_GRANTED = 'ACCESS_GRANTED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  USER_ACCESS = 'USER_ACCESS',
  ROLE_ESCALATION_ATTEMPT = 'ROLE_ESCALATION_ATTEMPT',

  // Token security events
  TOKEN_BLACKLISTED = 'TOKEN_BLACKLISTED',
  TOKEN_ENCRYPTION_FAILED = 'TOKEN_ENCRYPTION_FAILED',
  TOKEN_DECRYPTION_FAILED = 'TOKEN_DECRYPTION_FAILED',
  TOKEN_VALIDATION_SUCCESS = 'TOKEN_VALIDATION_SUCCESS',
  TOKEN_VALIDATION_FAILED = 'TOKEN_VALIDATION_FAILED',
  INVALID_TOKEN_DETECTED = 'INVALID_TOKEN_DETECTED',

  // Session security events
  SESSION_CREATED = 'SESSION_CREATED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_HIJACK_DETECTED = 'SESSION_HIJACK_DETECTED',
  SUSPICIOUS_SESSION_ACTIVITY = 'SUSPICIOUS_SESSION_ACTIVITY',
  FINGERPRINT_MISMATCH = 'FINGERPRINT_MISMATCH',

  // CSRF events
  CSRF_TOKEN_VALIDATION_FAILED = 'CSRF_TOKEN_VALIDATION_FAILED',
  CSRF_TOKEN_MISSING = 'CSRF_TOKEN_MISSING',

  // Rate limiting events
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_REQUEST_PATTERN = 'SUSPICIOUS_REQUEST_PATTERN',

  // Security violations
  IP_BLACKLISTED = 'IP_BLACKLISTED',
  MALICIOUS_REQUEST_DETECTED = 'MALICIOUS_REQUEST_DETECTED',
  SECURITY_HEADER_VIOLATION = 'SECURITY_HEADER_VIOLATION',

  // System events
  SECURITY_CONFIG_CHANGED = 'SECURITY_CONFIG_CHANGED',
  ENCRYPTION_KEY_ROTATED = 'ENCRYPTION_KEY_ROTATED',
}

/**
 * Security event severity levels
 */
export enum SecuritySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Security event data structure
 */
export interface SecurityEvent {
  id: string;
  timestamp: number;
  type: SecurityEventType;
  severity: SecuritySeverity;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  details: Record<string, any>;
  metadata?: {
    requestId?: string;
    correlationId?: string;
    source?: string;
    environment?: string;
  };
}

/**
 * Audit log configuration
 */
export const AUDIT_CONFIG = {
  // Log retention (30 days)
  LOG_RETENTION_MS: 30 * 24 * 60 * 60 * 1000,
  
  // Maximum log entries in memory
  MAX_MEMORY_LOGS: 1000,
  
  // Batch size for log processing
  BATCH_SIZE: 100,
  
  // Log levels to persist
  PERSIST_LEVELS: [SecuritySeverity.MEDIUM, SecuritySeverity.HIGH, SecuritySeverity.CRITICAL],
  
  // Events that require immediate alerting
  ALERT_EVENTS: [
    SecurityEventType.SESSION_HIJACK_DETECTED,
    SecurityEventType.ROLE_ESCALATION_ATTEMPT,
    SecurityEventType.MALICIOUS_REQUEST_DETECTED,
    SecurityEventType.SUSPICIOUS_REQUEST_PATTERN,
  ],
} as const;

/**
 * Security Audit Logger Service
 */
export class SecurityAuditLogger {
  private static logs: SecurityEvent[] = [];
  private static logCounter = 0;

  /**
   * Generate unique event ID
   */
  private static generateEventId(): string {
    this.logCounter++;
    return `sec_${Date.now()}_${this.logCounter}`;
  }

  /**
   * Log security event
   */
  static logEvent(
    type: SecurityEventType,
    severity: SecuritySeverity,
    details: Record<string, any>,
    context?: {
      userId?: string;
      sessionId?: string;
      ipAddress?: string;
      userAgent?: string;
      resource?: string;
      action?: string;
      requestId?: string;
    }
  ): void {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      type,
      severity,
      userId: context?.userId,
      sessionId: context?.sessionId,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      resource: context?.resource,
      action: context?.action,
      details,
      metadata: {
        requestId: context?.requestId,
        source: 'nynus-web',
        environment: process.env.NODE_ENV || 'development',
      },
    };

    // Add to memory logs
    this.logs.push(event);

    // Maintain memory limit
    if (this.logs.length > AUDIT_CONFIG.MAX_MEMORY_LOGS) {
      this.logs = this.logs.slice(-AUDIT_CONFIG.MAX_MEMORY_LOGS);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(event);
    }

    // Check if event requires alerting
    if (AUDIT_CONFIG.ALERT_EVENTS.includes(type as any)) {
      this.handleSecurityAlert(event);
    }

    // Persist high-priority events
    if (AUDIT_CONFIG.PERSIST_LEVELS.includes(severity as any)) {
      this.persistEvent(event);
    }
  }

  /**
   * Log to console với formatting
   */
  private static logToConsole(event: SecurityEvent): void {
    const emoji = this.getSeverityEmoji(event.severity);
    const timestamp = new Date(event.timestamp).toISOString();
    
    logger.info(`${emoji} [SECURITY] ${timestamp} ${event.type}`);
    logger.info(`  User: ${event.userId || 'anonymous'}`);
    logger.info(`  IP: ${event.ipAddress || 'unknown'}`);
    logger.info(`  Details:`, event.details);
    
    if (event.severity === SecuritySeverity.CRITICAL) {
      logger.error('🚨 CRITICAL SECURITY EVENT DETECTED 🚨');
    }
  }

  /**
   * Get emoji for severity level
   */
  private static getSeverityEmoji(severity: SecuritySeverity): string {
    switch (severity) {
      case SecuritySeverity.LOW: return '🟢';
      case SecuritySeverity.MEDIUM: return '🟡';
      case SecuritySeverity.HIGH: return '🟠';
      case SecuritySeverity.CRITICAL: return '🔴';
      default: return '⚪';
    }
  }

  /**
   * Handle security alerts
   */
  private static handleSecurityAlert(event: SecurityEvent): void {
    // In production, this would send alerts to monitoring systems
    logger.warn(`🚨 SECURITY ALERT: ${event.type}`, {
      eventId: event.id,
      severity: event.severity,
      userId: event.userId,
      ipAddress: event.ipAddress,
      details: event.details,
    });
  }

  /**
   * Persist event to storage
   */
  private static persistEvent(event: SecurityEvent): void {
    // In production, this would save to database or external logging service
    // For now, we'll just ensure it's in memory
    if (process.env.NODE_ENV === 'development') {
      logger.info(`💾 Persisting security event: ${event.id}`);
    }
  }

  /**
   * Get recent security events
   */
  static getRecentEvents(limit: number = 50): SecurityEvent[] {
    return this.logs.slice(-limit).reverse();
  }

  /**
   * Get events by type
   */
  static getEventsByType(type: SecurityEventType, limit: number = 50): SecurityEvent[] {
    return this.logs
      .filter(event => event.type === type)
      .slice(-limit)
      .reverse();
  }

  /**
   * Get events by user
   */
  static getEventsByUser(userId: string, limit: number = 50): SecurityEvent[] {
    return this.logs
      .filter(event => event.userId === userId)
      .slice(-limit)
      .reverse();
  }

  /**
   * Get events by severity
   */
  static getEventsBySeverity(severity: SecuritySeverity, limit: number = 50): SecurityEvent[] {
    return this.logs
      .filter(event => event.severity === severity)
      .slice(-limit)
      .reverse();
  }

  /**
   * Clear old logs
   */
  static cleanupOldLogs(): void {
    const cutoff = Date.now() - AUDIT_CONFIG.LOG_RETENTION_MS;
    const initialCount = this.logs.length;
    
    this.logs = this.logs.filter(event => event.timestamp > cutoff);
    
    const removedCount = initialCount - this.logs.length;
    if (removedCount > 0 && process.env.NODE_ENV === 'development') {
      logger.info(`🧹 SecurityAuditLogger: Cleaned up ${removedCount} old log entries`);
    }
  }

  /**
   * Get security statistics
   */
  static getSecurityStats(): {
    totalEvents: number;
    eventsBySeverity: Record<SecuritySeverity, number>;
    eventsByType: Record<string, number>;
    recentAlerts: number;
  } {
    const eventsBySeverity = {
      [SecuritySeverity.LOW]: 0,
      [SecuritySeverity.MEDIUM]: 0,
      [SecuritySeverity.HIGH]: 0,
      [SecuritySeverity.CRITICAL]: 0,
    };

    const eventsByType: Record<string, number> = {};
    let recentAlerts = 0;
    const oneHourAgo = Date.now() - (60 * 60 * 1000);

    this.logs.forEach(event => {
      eventsBySeverity[event.severity]++;
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      
      if (event.timestamp > oneHourAgo && AUDIT_CONFIG.ALERT_EVENTS.includes(event.type as any)) {
        recentAlerts++;
      }
    });

    return {
      totalEvents: this.logs.length,
      eventsBySeverity,
      eventsByType,
      recentAlerts,
    };
  }
}

/**
 * Convenience functions cho common security events
 */

export function logLoginSuccess(userId: string, ipAddress: string, userAgent?: string): void {
  SecurityAuditLogger.logEvent(
    SecurityEventType.LOGIN_SUCCESS,
    SecuritySeverity.LOW,
    { message: 'User logged in successfully' },
    { userId, ipAddress, userAgent }
  );
}

export function logLoginFailed(email: string, ipAddress: string, reason: string): void {
  SecurityAuditLogger.logEvent(
    SecurityEventType.LOGIN_FAILED,
    SecuritySeverity.MEDIUM,
    { email, reason },
    { ipAddress }
  );
}

export function logTokenBlacklisted(userId: string, reason: string, sessionId?: string): void {
  SecurityAuditLogger.logEvent(
    SecurityEventType.TOKEN_BLACKLISTED,
    SecuritySeverity.MEDIUM,
    { reason },
    { userId, sessionId }
  );
}

export function logSessionHijackDetected(userId: string, ipAddress: string, details: unknown): void {
  SecurityAuditLogger.logEvent(
    SecurityEventType.SESSION_HIJACK_DETECTED,
    SecuritySeverity.CRITICAL,
    details as Record<string, any>, // Type assertion for unknown details
    { userId, ipAddress }
  );
}

export function logSuspiciousActivity(type: SecurityEventType, details: unknown, context?: unknown): void {
  SecurityAuditLogger.logEvent(
    type,
    SecuritySeverity.HIGH,
    details as Record<string, any>, // Type assertion for unknown details
    context as any // Type assertion for unknown context
  );
}

export default SecurityAuditLogger;
