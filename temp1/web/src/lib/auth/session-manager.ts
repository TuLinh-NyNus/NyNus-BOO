/**
 * Enhanced Session Manager
 * 
 * Manages concurrent sessions với device tracking và security features
 */

import { createHash } from '@/lib/polyfills/crypto-polyfill';
import logger from '@/lib/utils/logger';

import { DeviceFingerprint } from './device-fingerprinting';

export interface SessionData {
  sessionId: string;
  userId: string;
  deviceFingerprint: DeviceFingerprint;
  createdAt: number;
  lastActivity: number;
  expiresAt: number;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  trustLevel: 'high' | 'medium' | 'low';
  location?: string;
}

export interface SessionLimits {
  maxConcurrentSessions: number;
  sessionTimeout: number; // milliseconds
  inactivityTimeout: number; // milliseconds
  maxSessionsPerDevice: number;
}

/**
 * Enhanced Session Manager
 * 
 * Features:
 * - Concurrent session limits
 * - Device-based session tracking
 * - Automatic cleanup
 * - Security monitoring
 */
export class EnhancedSessionManager {
  private sessions = new Map<string, SessionData>();
  private userSessions = new Map<string, Set<string>>();
  private cleanupInterval: NodeJS.Timeout;

  private readonly limits: SessionLimits = {
    maxConcurrentSessions: 3, // Max 3 sessions per user
    sessionTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days
    inactivityTimeout: 2 * 60 * 60 * 1000, // 2 hours
    maxSessionsPerDevice: 2, // Max 2 sessions per device
  };

  constructor() {
    // Cleanup expired sessions every 10 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 10 * 60 * 1000);
  }

  /**
   * Create new session
   */
  async createSession(
    userId: string,
    deviceFingerprint: DeviceFingerprint,
    ipAddress: string,
    userAgent: string
  ): Promise<SessionData> {
    const now = Date.now();
    const sessionId = await this.generateSessionId(userId, deviceFingerprint.id);

    // Check concurrent session limits
    await this.enforceConcurrentLimits(userId, deviceFingerprint.id);

    // Determine trust level
    const trustLevel = this.calculateTrustLevel(deviceFingerprint, ipAddress);

    const session: SessionData = {
      sessionId,
      userId,
      deviceFingerprint,
      createdAt: now,
      lastActivity: now,
      expiresAt: now + this.limits.sessionTimeout,
      ipAddress,
      userAgent,
      isActive: true,
      trustLevel,
    };

    // Store session
    this.sessions.set(sessionId, session);

    // Track user sessions
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set());
    }
    this.userSessions.get(userId)!.add(sessionId);

    logger.info('Session created', {
      sessionId: sessionId.slice(0, 8) + '...',
      userId,
      deviceId: deviceFingerprint.id.slice(0, 8) + '...',
      trustLevel,
      ipAddress,
    });

    return session;
  }

  /**
   * Validate session
   */
  validateSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return null;
    }

    const now = Date.now();

    // Check if session expired
    if (session.expiresAt < now) {
      this.removeSession(sessionId);
      logger.info('Session expired', { sessionId: sessionId.slice(0, 8) + '...' });
      return null;
    }

    // Check inactivity timeout
    if (now - session.lastActivity > this.limits.inactivityTimeout) {
      this.removeSession(sessionId);
      logger.info('Session inactive', { sessionId: sessionId.slice(0, 8) + '...' });
      return null;
    }

    // Update last activity
    session.lastActivity = now;

    return session;
  }

  /**
   * Update session activity
   */
  updateSessionActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
    }
  }

  /**
   * Remove session
   */
  removeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      // Remove from user sessions
      const userSessionSet = this.userSessions.get(session.userId);
      if (userSessionSet) {
        userSessionSet.delete(sessionId);
        if (userSessionSet.size === 0) {
          this.userSessions.delete(session.userId);
        }
      }

      // Remove session
      this.sessions.delete(sessionId);

      logger.info('Session removed', {
        sessionId: sessionId.slice(0, 8) + '...',
        userId: session.userId,
      });
    }
  }

  /**
   * Get user sessions
   */
  getUserSessions(userId: string): SessionData[] {
    const sessionIds = this.userSessions.get(userId);
    if (!sessionIds) return [];

    return Array.from(sessionIds)
      .map(id => this.sessions.get(id))
      .filter((session): session is SessionData => session !== undefined);
  }

  /**
   * Revoke all user sessions except current
   */
  revokeOtherSessions(userId: string, currentSessionId: string): number {
    const sessions = this.getUserSessions(userId);
    let revokedCount = 0;

    for (const session of sessions) {
      if (session.sessionId !== currentSessionId) {
        this.removeSession(session.sessionId);
        revokedCount++;
      }
    }

    logger.info('Other sessions revoked', { userId, revokedCount });
    return revokedCount;
  }

  /**
   * Enforce concurrent session limits
   */
  private async enforceConcurrentLimits(userId: string, deviceId: string): Promise<void> {
    const userSessions = this.getUserSessions(userId);

    // Check total session limit
    if (userSessions.length >= this.limits.maxConcurrentSessions) {
      // Remove oldest session
      const oldestSession = userSessions
        .sort((a, b) => a.lastActivity - b.lastActivity)[0];
      
      this.removeSession(oldestSession.sessionId);
      
      logger.info('Session limit exceeded, removed oldest', {
        userId,
        removedSessionId: oldestSession.sessionId.slice(0, 8) + '...',
      });
    }

    // Check device session limit
    const deviceSessions = userSessions.filter(
      s => s.deviceFingerprint.id === deviceId
    );

    if (deviceSessions.length >= this.limits.maxSessionsPerDevice) {
      // Remove oldest device session
      const oldestDeviceSession = deviceSessions
        .sort((a, b) => a.lastActivity - b.lastActivity)[0];
      
      this.removeSession(oldestDeviceSession.sessionId);
      
      logger.info('Device session limit exceeded, removed oldest', {
        userId,
        deviceId: deviceId.slice(0, 8) + '...',
        removedSessionId: oldestDeviceSession.sessionId.slice(0, 8) + '...',
      });
    }
  }

  /**
   * Calculate trust level based on device và context
   */
  private calculateTrustLevel(
    deviceFingerprint: DeviceFingerprint,
    ipAddress: string
  ): 'high' | 'medium' | 'low' {
    let score = 0;

    // Known device fingerprint
    if (deviceFingerprint.timestamp) {
      score += 30;
    }

    // Stable user agent
    if (deviceFingerprint.userAgent && deviceFingerprint.userAgent.length > 50) {
      score += 20;
    }

    // Known platform
    if (['Windows', 'macOS', 'Linux'].includes(deviceFingerprint.platform)) {
      score += 20;
    }

    // Cookies enabled
    if (deviceFingerprint.cookieEnabled) {
      score += 15;
    }

    // Reasonable screen resolution
    if (deviceFingerprint.screenResolution && 
        deviceFingerprint.screenResolution !== 'server-unknown') {
      score += 15;
    }

    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  /**
   * Generate unique session ID
   */
  private async generateSessionId(userId: string, deviceId: string): Promise<string> {
    const timestamp = Date.now();
    const random = Math.random().toString(36);
    const data = `${userId}:${deviceId}:${timestamp}:${random}`;
    
    return await createHash('sha256', data);
  }

  /**
   * Cleanup expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now || 
          (now - session.lastActivity) > this.limits.inactivityTimeout) {
        this.removeSession(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info(`Session cleanup: removed ${cleanedCount} expired sessions`);
    }
  }

  /**
   * Get session statistics
   */
  getStats(): {
    totalSessions: number;
    activeSessions: number;
    totalUsers: number;
    averageSessionsPerUser: number;
  } {
    const now = Date.now();
    const activeSessions = Array.from(this.sessions.values())
      .filter(s => s.isActive && s.expiresAt > now).length;

    return {
      totalSessions: this.sessions.size,
      activeSessions,
      totalUsers: this.userSessions.size,
      averageSessionsPerUser: this.userSessions.size > 0 
        ? this.sessions.size / this.userSessions.size 
        : 0,
    };
  }

  /**
   * Destroy session manager
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.sessions.clear();
    this.userSessions.clear();
  }
}

// Export singleton instance
export const sessionManager = new EnhancedSessionManager();
