/**
 * Storage Utilities for Admin Authentication
 * Utilities cho storage authentication admin
 */

/**
 * Storage strategy types
 * Các loại strategy storage
 */
export type StorageStrategy = "localStorage" | "sessionStorage" | "hybrid";

/**
 * Storage configuration
 * Cấu hình storage
 */
interface StorageConfig {
  strategy: StorageStrategy;
  encryptionEnabled: boolean;
  keyPrefix: string;
  maxAge?: number; // in milliseconds
}

/**
 * Storage keys for admin authentication
 * Keys storage cho admin authentication
 */
export const ADMIN_STORAGE_KEYS = {
  ACCESS_TOKEN: "admin_auth_token",
  REFRESH_TOKEN: "admin_refresh_token",
  USER_INFO: "admin_user_info",
  AUTH_STATE: "admin_auth_state",
  REMEMBER_ME: "admin_remember_me",
  SESSION_ID: "admin_session_id",
  LAST_ACTIVITY: "admin_last_activity",
  TOKEN_EXPIRY: "admin_token_expiry",
} as const;

/**
 * Default storage configuration for admin
 * Cấu hình storage mặc định cho admin
 */
const DEFAULT_CONFIG: StorageConfig = {
  strategy: "hybrid",
  encryptionEnabled: false, // Can be enabled for production
  keyPrefix: "nynus_admin_",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Simple encryption/decryption utilities
 * Utilities mã hóa/giải mã đơn giản
 */
const CryptoUtils = {
  /**
   * Simple base64 encoding (not secure, just obfuscation)
   * Mã hóa base64 đơn giản (không bảo mật, chỉ làm mờ)
   */
  encode(data: string): string {
    try {
      return btoa(encodeURIComponent(data));
    } catch (error) {
      console.error("Encoding error:", error);
      return data;
    }
  },

  /**
   * Simple base64 decoding
   * Giải mã base64 đơn giản
   */
  decode(encodedData: string): string {
    try {
      return decodeURIComponent(atob(encodedData));
    } catch (error) {
      console.error("Decoding error:", error);
      return encodedData;
    }
  },
};

/**
 * Storage wrapper with encryption and expiration support
 * Wrapper storage với hỗ trợ mã hóa và expiration
 */
class AdminStorage {
  private config: StorageConfig;

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get storage instance based on strategy
   * Lấy storage instance dựa trên strategy
   */
  private getStorage(forPersistent: boolean = false): Storage | null {
    if (typeof window === "undefined") return null;

    switch (this.config.strategy) {
      case "localStorage":
        return localStorage;
      case "sessionStorage":
        return sessionStorage;
      case "hybrid":
        // Use localStorage for persistent data, sessionStorage for temporary
        return forPersistent ? localStorage : sessionStorage;
      default:
        return localStorage;
    }
  }

  /**
   * Generate full key with prefix
   * Tạo key đầy đủ với prefix
   */
  private getFullKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  /**
   * Set item with optional encryption and expiration
   * Set item với tùy chọn mã hóa và expiration
   */
  setItem(
    key: string,
    value: string,
    options: {
      persistent?: boolean;
      encrypt?: boolean;
      maxAge?: number;
    } = {}
  ): boolean {
    try {
      const storage = this.getStorage(options.persistent);
      if (!storage) return false;

      const fullKey = this.getFullKey(key);
      let processedValue = value;

      // Add expiration metadata
      const item = {
        value: processedValue,
        timestamp: Date.now(),
        maxAge: options.maxAge || this.config.maxAge,
      };

      // Encrypt if enabled
      if (options.encrypt || this.config.encryptionEnabled) {
        item.value = CryptoUtils.encode(processedValue);
      }

      storage.setItem(fullKey, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error("Storage setItem error:", error);
      return false;
    }
  }

  /**
   * Get item with automatic decryption and expiration check
   * Get item với tự động giải mã và kiểm tra expiration
   */
  getItem(key: string, options: { persistent?: boolean; decrypt?: boolean } = {}): string | null {
    try {
      const storage = this.getStorage(options.persistent);
      if (!storage) return null;

      const fullKey = this.getFullKey(key);
      const rawItem = storage.getItem(fullKey);

      if (!rawItem) return null;

      // Try to parse as JSON (new format with metadata)
      try {
        const item = JSON.parse(rawItem);

        // Check expiration
        if (item.maxAge && item.timestamp) {
          const age = Date.now() - item.timestamp;
          if (age > item.maxAge) {
            this.removeItem(key, { persistent: options.persistent });
            return null;
          }
        }

        // Decrypt if needed
        if (options.decrypt || this.config.encryptionEnabled) {
          return CryptoUtils.decode(item.value);
        }

        return item.value;
      } catch (parseError) {
        // Fallback to raw value (old format)
        return rawItem;
      }
    } catch (error) {
      console.error("Storage getItem error:", error);
      return null;
    }
  }

  /**
   * Remove item from storage
   * Xóa item khỏi storage
   */
  removeItem(key: string, options: { persistent?: boolean } = {}): boolean {
    try {
      const storage = this.getStorage(options.persistent);
      if (!storage) return false;

      const fullKey = this.getFullKey(key);
      storage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.error("Storage removeItem error:", error);
      return false;
    }
  }

  /**
   * Clear all admin storage items
   * Xóa tất cả items storage admin
   */
  clear(): boolean {
    try {
      if (typeof window === "undefined") return false;

      const storages = [localStorage, sessionStorage];

      storages.forEach((storage) => {
        const keysToRemove: string[] = [];

        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(this.config.keyPrefix)) {
            keysToRemove.push(key);
          }
        }

        keysToRemove.forEach((key) => storage.removeItem(key));
      });

      return true;
    } catch (error) {
      console.error("Storage clear error:", error);
      return false;
    }
  }

  /**
   * Check if remember me is enabled
   * Kiểm tra xem remember me có được bật không
   */
  isRememberMeEnabled(): boolean {
    const rememberMe = this.getItem(ADMIN_STORAGE_KEYS.REMEMBER_ME, { persistent: true });
    return rememberMe === "true";
  }

  /**
   * Set remember me preference
   * Set tùy chọn remember me
   */
  setRememberMe(enabled: boolean): void {
    this.setItem(ADMIN_STORAGE_KEYS.REMEMBER_ME, enabled.toString(), { persistent: true });
  }

  /**
   * Get storage info for debugging
   * Lấy thông tin storage để debug
   */
  getStorageInfo(): {
    strategy: StorageStrategy;
    itemCount: number;
    totalSize: number;
    items: Array<{ key: string; size: number; age: number }>;
  } {
    const info = {
      strategy: this.config.strategy,
      itemCount: 0,
      totalSize: 0,
      items: [] as Array<{ key: string; size: number; age: number }>,
    };

    try {
      if (typeof window === "undefined") return info;

      const storages = [localStorage, sessionStorage];

      storages.forEach((storage) => {
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(this.config.keyPrefix)) {
            const value = storage.getItem(key);
            if (value) {
              const size = new Blob([value]).size;
              let age = 0;

              try {
                const item = JSON.parse(value);
                if (item.timestamp) {
                  age = Date.now() - item.timestamp;
                }
              } catch {
                // Ignore parse errors for age calculation
              }

              info.items.push({
                key: key.replace(this.config.keyPrefix, ""),
                size,
                age,
              });
              info.totalSize += size;
              info.itemCount++;
            }
          }
        }
      });
    } catch (error) {
      console.error("Storage info error:", error);
    }

    return info;
  }
}

/**
 * Create admin storage instance
 * Tạo instance admin storage
 */
export const adminStorage = new AdminStorage();

/**
 * Convenience functions for common operations
 * Các hàm tiện ích cho operations thường dùng
 */

/**
 * Set admin tokens with appropriate persistence
 * Set admin tokens với persistence phù hợp
 */
export function setAdminTokens(accessToken: string, refreshToken: string): void {
  const persistent = adminStorage.isRememberMeEnabled();

  adminStorage.setItem(ADMIN_STORAGE_KEYS.ACCESS_TOKEN, accessToken, {
    persistent,
    encrypt: true,
  });

  adminStorage.setItem(ADMIN_STORAGE_KEYS.REFRESH_TOKEN, refreshToken, {
    persistent: true, // Refresh token should always be persistent
    encrypt: true,
  });

  // Store token expiry time for quick checks
  adminStorage.setItem(ADMIN_STORAGE_KEYS.TOKEN_EXPIRY, Date.now().toString(), {
    persistent,
  });
}

/**
 * Get admin access token
 * Lấy admin access token
 */
export function getAdminAccessToken(): string | null {
  const persistent = adminStorage.isRememberMeEnabled();
  return adminStorage.getItem(ADMIN_STORAGE_KEYS.ACCESS_TOKEN, {
    persistent,
    decrypt: true,
  });
}

/**
 * Get admin refresh token
 * Lấy admin refresh token
 */
export function getAdminRefreshToken(): string | null {
  return adminStorage.getItem(ADMIN_STORAGE_KEYS.REFRESH_TOKEN, {
    persistent: true,
    decrypt: true,
  });
}

/**
 * Clear all admin authentication data
 * Xóa tất cả dữ liệu authentication admin
 */
export function clearAdminAuth(): void {
  adminStorage.clear();
}

/**
 * Set admin user info
 * Set thông tin admin user
 */
export function setAdminUserInfo(userInfo: any): void {
  const persistent = adminStorage.isRememberMeEnabled();
  adminStorage.setItem(ADMIN_STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo), {
    persistent,
  });
}

/**
 * Get admin user info
 * Lấy thông tin admin user
 */
export function getAdminUserInfo(): any | null {
  const persistent = adminStorage.isRememberMeEnabled();
  const userInfoStr = adminStorage.getItem(ADMIN_STORAGE_KEYS.USER_INFO, { persistent });

  if (!userInfoStr) return null;

  try {
    return JSON.parse(userInfoStr);
  } catch (error) {
    console.error("Error parsing user info:", error);
    return null;
  }
}

/**
 * Update last activity timestamp
 * Cập nhật timestamp hoạt động cuối
 */
export function updateLastActivity(): void {
  adminStorage.setItem(ADMIN_STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString(), {
    persistent: false, // Always use sessionStorage for activity tracking
  });
}

/**
 * Get last activity timestamp
 * Lấy timestamp hoạt động cuối
 */
export function getLastActivity(): number | null {
  const lastActivity = adminStorage.getItem(ADMIN_STORAGE_KEYS.LAST_ACTIVITY, {
    persistent: false,
  });

  return lastActivity ? parseInt(lastActivity, 10) : null;
}

/**
 * Cross-tab storage event listener
 * Listener cho storage events cross-tab
 */
export function addStorageEventListener(
  callback: (key: string, newValue: string | null) => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key && event.key.startsWith(DEFAULT_CONFIG.keyPrefix)) {
      const cleanKey = event.key.replace(DEFAULT_CONFIG.keyPrefix, "");
      callback(cleanKey, event.newValue);
    }
  };

  window.addEventListener("storage", handleStorageChange);

  // Return cleanup function
  return () => {
    window.removeEventListener("storage", handleStorageChange);
  };
}
