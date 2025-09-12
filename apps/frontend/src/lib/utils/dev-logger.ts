/**
 * Development Logger Utility
 * Kiểm soát logging trong development environment
 * 
 * @author Tu120
 * @created 2025-09-10
 */

// Kiểm tra environment variables
const isQuietMode = process.env.QUIET_MODE === 'true';
const disableDevLogs = process.env.DISABLE_DEV_LOGS === 'true';
const isDevelopment = process.env.NODE_ENV === 'development';

// Logger functions
export const devLogger = {
  /**
   * Log thông tin chỉ trong development và không phải quiet mode
   */
  info: (...args: unknown[]) => {
    if (isDevelopment && !isQuietMode && !disableDevLogs) {
      console.info('[DEV]', ...args);
    }
  },

  /**
   * Log warning - luôn hiển thị trừ khi QUIET_MODE
   */
  warn: (...args: unknown[]) => {
    if (!isQuietMode) {
      console.warn('[WARN]', ...args);
    }
  },

  /**
   * Log error - luôn hiển thị
   */
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
  },

  /**
   * Debug log - chỉ trong development và verbose mode
   */
  debug: (...args: unknown[]) => {
    if (isDevelopment && !isQuietMode && !disableDevLogs && process.env.DEBUG) {
      console.debug('[DEBUG]', ...args);
    }
  },

  /**
   * Performance log - chỉ khi không quiet mode
   */
  perf: (...args: unknown[]) => {
    if (isDevelopment && !isQuietMode) {
      console.log('[PERF]', ...args);
    }
  }
};

// Wrapper function để replace console.log trong components
export const conditionalLog = (...args: unknown[]) => {
  if (isDevelopment && !isQuietMode && !disableDevLogs) {
    console.log(...args);
  }
};

// Export environment checks
export const loggerConfig = {
  isQuietMode,
  disableDevLogs,
  isDevelopment,
  shouldLog: isDevelopment && !isQuietMode && !disableDevLogs
};
