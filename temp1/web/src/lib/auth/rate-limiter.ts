/**
 * Rate Limiting Service
 * 
 * Provides in-memory rate limiting for authentication endpoints
 * to prevent brute force attacks and abuse.
 */

interface RateLimitEntry {
  attempts: number;
  resetTime: number;
  firstAttempt: number;
}

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * In-memory rate limiter
 * 
 * Features:
 * - IP-based và user-based rate limiting
 * - Configurable limits per endpoint
 * - Automatic cleanup of expired entries
 * - Memory efficient với sliding window
 */
class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check rate limit cho một key
   */
  check(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now();
    const entry = this.store.get(key);

    // Nếu không có entry hoặc đã hết hạn window
    if (!entry || now - entry.firstAttempt > config.windowMs) {
      const newEntry: RateLimitEntry = {
        attempts: 1,
        resetTime: now + config.windowMs,
        firstAttempt: now,
      };
      
      this.store.set(key, newEntry);
      
      return {
        allowed: true,
        remaining: config.maxAttempts - 1,
        resetTime: newEntry.resetTime,
      };
    }

    // Kiểm tra nếu đã vượt quá limit
    if (entry.attempts >= config.maxAttempts) {
      const blockDuration = config.blockDurationMs || config.windowMs;
      const retryAfter = Math.max(0, entry.resetTime - now);
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil(retryAfter / 1000), // Convert to seconds
      };
    }

    // Increment attempts
    entry.attempts++;
    this.store.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxAttempts - entry.attempts,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reset rate limit cho một key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Get current status cho một key
   */
  getStatus(key: string): RateLimitEntry | null {
    return this.store.get(key) || null;
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.store.delete(key));
  }

  /**
   * Destroy rate limiter và cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Rate limit configurations cho different endpoints
 */
export const RATE_LIMIT_CONFIGS = {
  // Login attempts: 5 attempts per 15 minutes
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 15 * 60 * 1000, // Block for 15 minutes
  },
  
  // Register attempts: 3 attempts per hour
  REGISTER: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // Block for 1 hour
  },
  
  // Password reset: 3 attempts per hour
  PASSWORD_RESET: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // Block for 1 hour
  },
  
  // Token refresh: 10 attempts per 5 minutes
  TOKEN_REFRESH: {
    maxAttempts: 10,
    windowMs: 5 * 60 * 1000, // 5 minutes
    blockDurationMs: 5 * 60 * 1000, // Block for 5 minutes
  },
  
  // General API: 100 requests per minute
  API_GENERAL: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minute
  },
} as const;

/**
 * Generate rate limit key
 */
export function generateRateLimitKey(
  type: keyof typeof RATE_LIMIT_CONFIGS,
  identifier: string, // IP address hoặc user ID
  endpoint?: string
): string {
  const parts = [type.toLowerCase(), identifier];
  if (endpoint) {
    parts.push(endpoint);
  }
  return parts.join(':');
}

/**
 * Check rate limit cho một request
 */
export function checkRateLimit(
  type: keyof typeof RATE_LIMIT_CONFIGS,
  identifier: string,
  endpoint?: string
): RateLimitResult {
  const key = generateRateLimitKey(type, identifier, endpoint);
  const config = RATE_LIMIT_CONFIGS[type];
  
  return rateLimiter.check(key, config);
}

/**
 * Reset rate limit cho một identifier
 */
export function resetRateLimit(
  type: keyof typeof RATE_LIMIT_CONFIGS,
  identifier: string,
  endpoint?: string
): void {
  const key = generateRateLimitKey(type, identifier, endpoint);
  rateLimiter.reset(key);
}

/**
 * Get rate limit status
 */
export function getRateLimitStatus(
  type: keyof typeof RATE_LIMIT_CONFIGS,
  identifier: string,
  endpoint?: string
): RateLimitEntry | null {
  const key = generateRateLimitKey(type, identifier, endpoint);
  return rateLimiter.getStatus(key);
}

/**
 * Helper để get client IP từ request
 */
export function getClientIP(request: Request): string {
  // Try different headers for IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    // x-forwarded-for có thể chứa multiple IPs, lấy first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP.trim();
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }
  
  // Fallback to localhost for development
  return '127.0.0.1';
}

/**
 * Create rate limit headers cho response
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.remaining + (result.allowed ? 1 : 0)),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
  };
  
  if (result.retryAfter) {
    headers['Retry-After'] = String(result.retryAfter);
  }
  
  return headers;
}

export default rateLimiter;
