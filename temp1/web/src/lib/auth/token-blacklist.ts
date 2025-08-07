/**
 * Token Blacklist Service
 * 
 * Manages blacklisted JWT tokens để prevent reuse of revoked tokens.
 * Uses in-memory storage với automatic cleanup of expired tokens.
 */

import { decodeJwt } from 'jose';

import { createHash } from '@/lib/polyfills/crypto-polyfill';
import logger from '@/lib/utils/logger';

interface BlacklistEntry {
  tokenHash: string;
  expiryTime: number;
  revokedAt: number;
  reason?: string;
}

/**
 * Token Blacklist Manager
 * 
 * Features:
 * - Hash-based token storage (không store full tokens)
 * - Automatic cleanup of expired entries
 * - Memory efficient
 * - Revocation reasons tracking
 */
class TokenBlacklist {
  private blacklist = new Map<string, BlacklistEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired tokens every 10 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000);
  }

  /**
   * Hash token để avoid storing full token
   */
  private async hashToken(token: string): Promise<string> {
    return await createHash('sha256', token);
  }

  /**
   * Get token expiry time từ JWT payload
   */
  private getTokenExpiry(token: string): number {
    try {
      const payload = decodeJwt(token);
      return (payload.exp || 0) * 1000; // Convert to milliseconds
    } catch (error) {
      // If can't decode, assume expired immediately
      return Date.now();
    }
  }

  /**
   * Add token to blacklist
   */
  async addToken(token: string, reason?: string): Promise<void> {
    const tokenHash = await this.hashToken(token);
    const expiryTime = this.getTokenExpiry(token);
    const now = Date.now();

    // Only add if token hasn't expired yet
    if (expiryTime > now) {
      const entry: BlacklistEntry = {
        tokenHash,
        expiryTime,
        revokedAt: now,
        reason,
      };

      this.blacklist.set(tokenHash, entry);
    }
  }

  /**
   * Check if token is blacklisted
   */
  async isBlacklisted(token: string): Promise<boolean> {
    const tokenHash = await this.hashToken(token);
    const entry = this.blacklist.get(tokenHash);

    if (!entry) {
      return false;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now >= entry.expiryTime) {
      // Remove expired entry
      this.blacklist.delete(tokenHash);
      return false;
    }

    return true;
  }

  /**
   * Get blacklist entry info
   */
  async getBlacklistInfo(token: string): Promise<BlacklistEntry | null> {
    const tokenHash = await this.hashToken(token);
    const entry = this.blacklist.get(tokenHash);

    if (!entry) {
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now >= entry.expiryTime) {
      this.blacklist.delete(tokenHash);
      return null;
    }

    return entry;
  }

  /**
   * Remove token from blacklist (if needed for testing)
   */
  async removeToken(token: string): Promise<boolean> {
    const tokenHash = await this.hashToken(token);
    return this.blacklist.delete(tokenHash);
  }

  /**
   * Get blacklist statistics
   */
  getStats(): {
    totalEntries: number;
    expiredEntries: number;
    activeEntries: number;
  } {
    const now = Date.now();
    let expiredCount = 0;
    let activeCount = 0;

    for (const entry of this.blacklist.values()) {
      if (now >= entry.expiryTime) {
        expiredCount++;
      } else {
        activeCount++;
      }
    }

    return {
      totalEntries: this.blacklist.size,
      expiredEntries: expiredCount,
      activeEntries: activeCount,
    };
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [tokenHash, entry] of this.blacklist.entries()) {
      if (now >= entry.expiryTime) {
        keysToDelete.push(tokenHash);
      }
    }

    keysToDelete.forEach(key => this.blacklist.delete(key));

    // Log cleanup stats in development
    if (process.env.NODE_ENV === 'development' && keysToDelete.length > 0) {
      logger.info(`Token blacklist cleanup: removed ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Clear all entries (for testing)
   */
  clear(): void {
    this.blacklist.clear();
  }

  /**
   * Destroy blacklist và cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.blacklist.clear();
  }
}

// Singleton instance
const tokenBlacklist = new TokenBlacklist();

/**
 * Blacklist reasons
 */
export const BLACKLIST_REASONS = {
  LOGOUT: 'User logout',
  SECURITY_BREACH: 'Security breach detected',
  PASSWORD_CHANGE: 'Password changed',
  ACCOUNT_DISABLED: 'Account disabled',
  ADMIN_REVOKE: 'Admin revoked',
  SUSPICIOUS_ACTIVITY: 'Suspicious activity',
} as const;

/**
 * Add token to blacklist
 */
export async function blacklistToken(
  token: string,
  reason?: keyof typeof BLACKLIST_REASONS | string
): Promise<void> {
  const reasonText = reason && reason in BLACKLIST_REASONS
    ? BLACKLIST_REASONS[reason as keyof typeof BLACKLIST_REASONS]
    : reason;

  await tokenBlacklist.addToken(token, reasonText);
}

/**
 * Check if token is blacklisted
 */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  return await tokenBlacklist.isBlacklisted(token);
}

/**
 * Get blacklist information for token
 */
export async function getTokenBlacklistInfo(token: string): Promise<BlacklistEntry | null> {
  return await tokenBlacklist.getBlacklistInfo(token);
}

/**
 * Remove token from blacklist
 */
export async function removeTokenFromBlacklist(token: string): Promise<boolean> {
  return await tokenBlacklist.removeToken(token);
}

/**
 * Get blacklist statistics
 */
export function getBlacklistStats():  {
  totalEntries: number;
  expiredEntries: number;
  activeEntries: number;
} {
  return tokenBlacklist.getStats();
}

/**
 * Clear blacklist (for testing)
 */
export function clearBlacklist(): void {
  tokenBlacklist.clear();
}

/**
 * Middleware helper để check blacklisted tokens
 */
export async function checkTokenBlacklist(token: string): Promise<{
  isBlacklisted: boolean;
  reason?: string;
  revokedAt?: number;
}> {
  const info = await getTokenBlacklistInfo(token);

  if (info) {
    return {
      isBlacklisted: true,
      reason: info.reason,
      revokedAt: info.revokedAt,
    };
  }

  return {
    isBlacklisted: false,
  };
}

export default tokenBlacklist;
