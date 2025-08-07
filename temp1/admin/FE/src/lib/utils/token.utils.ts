/**
 * Token Utilities for Admin Authentication
 * Utilities cho token authentication admin
 */

/**
 * JWT payload interface
 * Interface cho JWT payload
 */
interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
  iss?: string;
  aud?: string;
}

/**
 * Token validation result
 * Kết quả validation token
 */
interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  expiresAt: Date | null;
  timeUntilExpiration: number | null;
  payload: JWTPayload | null;
  error?: string;
}

/**
 * Decode JWT token without verification
 * Decode JWT token không cần verification
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    if (!token || typeof token !== "string") {
      return null;
    }

    // Split token into parts
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Decode payload (second part)
    const payload = parts[1];

    // Add padding if needed
    const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4);

    // Decode base64
    const decodedPayload = atob(paddedPayload.replace(/-/g, "+").replace(/_/g, "/"));

    // Parse JSON
    return JSON.parse(decodedPayload) as JWTPayload;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

/**
 * Check if token is expired
 * Kiểm tra xem token có hết hạn không
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Check if token is expiring soon
 * Kiểm tra xem token có sắp hết hạn không
 */
export function isTokenExpiringSoon(token: string, thresholdMs: number = 5 * 60 * 1000): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const thresholdSeconds = Math.floor(thresholdMs / 1000);

  return payload.exp - currentTime <= thresholdSeconds;
}

/**
 * Get time until token expiration
 * Lấy thời gian còn lại đến khi token hết hạn
 */
export function getTimeUntilExpiration(token: string): number | null {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return null;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const timeUntilExpiration = payload.exp - currentTime;

  return timeUntilExpiration > 0 ? timeUntilExpiration * 1000 : 0;
}

/**
 * Get token expiration date
 * Lấy ngày hết hạn của token
 */
export function getTokenExpirationDate(token: string): Date | null {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return null;
  }

  return new Date(payload.exp * 1000);
}

/**
 * Validate token comprehensively
 * Validate token một cách toàn diện
 */
export function validateToken(token: string): TokenValidationResult {
  const result: TokenValidationResult = {
    isValid: false,
    isExpired: true,
    expiresAt: null,
    timeUntilExpiration: null,
    payload: null,
  };

  try {
    if (!token || typeof token !== "string") {
      result.error = "Token is empty or invalid format";
      return result;
    }

    const payload = decodeJWT(token);
    if (!payload) {
      result.error = "Failed to decode token payload";
      return result;
    }

    result.payload = payload;

    // Check expiration
    if (!payload.exp) {
      result.error = "Token does not have expiration time";
      return result;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    result.isExpired = payload.exp < currentTime;
    result.expiresAt = new Date(payload.exp * 1000);
    result.timeUntilExpiration = result.isExpired ? 0 : (payload.exp - currentTime) * 1000;

    // Check if token is valid (not expired and has required fields)
    result.isValid = !result.isExpired && !!payload.sub && !!payload.email && !!payload.role;

    if (!result.isValid && !result.isExpired) {
      result.error = "Token is missing required fields (sub, email, role)";
    }

    return result;
  } catch (error) {
    result.error = `Token validation error: ${error instanceof Error ? error.message : "Unknown error"}`;
    return result;
  }
}

/**
 * Check if user has admin role
 * Kiểm tra xem user có role admin không
 */
export function hasAdminRole(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload) {
    return false;
  }

  return payload.role === "ADMIN" || payload.role === "SUPER_ADMIN";
}

/**
 * Check if user has specific permission
 * Kiểm tra xem user có permission cụ thể không
 */
export function hasPermission(token: string, permission: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.permissions) {
    return false;
  }

  return payload.permissions.includes(permission);
}

/**
 * Get user info from token
 * Lấy thông tin user từ token
 */
export function getUserFromToken(token: string): {
  id: string;
  email: string;
  role: string;
  permissions: string[];
} | null {
  const payload = decodeJWT(token);
  if (!payload) {
    return null;
  }

  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    permissions: payload.permissions || [],
  };
}

/**
 * Format time until expiration for display
 * Format thời gian còn lại để hiển thị
 */
export function formatTimeUntilExpiration(token: string): string {
  const timeMs = getTimeUntilExpiration(token);
  if (timeMs === null || timeMs <= 0) {
    return "Đã hết hạn";
  }

  const minutes = Math.floor(timeMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} ngày ${hours % 24} giờ`;
  } else if (hours > 0) {
    return `${hours} giờ ${minutes % 60} phút`;
  } else {
    return `${minutes} phút`;
  }
}

/**
 * Create token refresh scheduler
 * Tạo scheduler để refresh token
 */
export function createTokenRefreshScheduler(
  token: string,
  refreshCallback: () => Promise<void>,
  thresholdMs: number = 5 * 60 * 1000
): (() => void) | null {
  const timeUntilExpiration = getTimeUntilExpiration(token);
  if (timeUntilExpiration === null) {
    return null;
  }

  const refreshTime = timeUntilExpiration - thresholdMs;
  if (refreshTime <= 0) {
    // Token is already expiring soon, refresh immediately
    refreshCallback().catch(console.error);
    return null;
  }

  const timeoutId = setTimeout(() => {
    refreshCallback().catch(console.error);
  }, refreshTime);

  // Return cleanup function
  return () => clearTimeout(timeoutId);
}

/**
 * Token security utilities
 * Utilities bảo mật token
 */
export const TokenSecurity = {
  /**
   * Check if token looks suspicious
   * Kiểm tra xem token có đáng nghi không
   */
  isSuspiciousToken(token: string): boolean {
    if (!token) return true;

    // Check token length (JWT should be reasonably long)
    if (token.length < 100) return true;

    // Check token structure (should have 3 parts)
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    // Check for obvious tampering
    if (token.includes(" ") || token.includes("\n") || token.includes("\t")) {
      return true;
    }

    return false;
  },

  /**
   * Sanitize token for logging
   * Làm sạch token để log
   */
  sanitizeTokenForLogging(token: string): string {
    if (!token) return "[EMPTY_TOKEN]";
    if (token.length < 20) return "[INVALID_TOKEN]";

    return `${token.substring(0, 10)}...${token.substring(token.length - 10)}`;
  },

  /**
   * Generate token fingerprint for tracking
   * Tạo fingerprint của token để tracking
   */
  generateTokenFingerprint(token: string): string {
    if (!token) return "";

    // Simple hash function for fingerprinting
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(16);
  },
};
