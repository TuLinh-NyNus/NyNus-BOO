/**
 * Structured Logger for NyNus Frontend
 * Provides type-safe logging with context and levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  stack?: string;
}

interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
}

class Logger {
  private config: LoggerConfig;
  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      minLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      enableConsole: true,
      enableRemote: process.env.NODE_ENV === 'production',
      ...config,
    };
  }

  /**
   * Check if log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.config.minLevel];
  }

  /**
   * Format log entry for console output
   */
  private formatConsoleLog(entry: LogEntry): void {
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '🔴',
    };

    const timestamp = new Date(entry.timestamp).toLocaleTimeString('vi-VN');
    const prefix = `${emoji[entry.level]} [${entry.level.toUpperCase()}] ${timestamp}`;

    if (entry.level === 'error') {
      console.error(prefix, entry.message, entry.context || '', entry.stack || '');
    } else if (entry.level === 'warn') {
      console.warn(prefix, entry.message, entry.context || '');
    } else {
      console.log(prefix, entry.message, entry.context || '');
    }
  }

  /**
   * Send log to remote service (Sentry, LogRocket, etc.)
   */
  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote) return;

    try {
      // TODO: Implement remote logging service
      // Example: Sentry.captureMessage(entry.message, { level: entry.level, extra: entry.context });
      
      // For now, just log that we would send to remote
      if (process.env.NODE_ENV === 'development') {
        console.log('📡 Would send to remote:', entry);
      }
    } catch (error) {
      // Don't throw errors from logger
      console.error('Failed to send log to remote:', error);
    }
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      stack: error?.stack,
    };

    // Console logging
    if (this.config.enableConsole) {
      this.formatConsoleLog(entry);
    }

    // Remote logging (async, non-blocking)
    if (this.config.enableRemote) {
      this.sendToRemote(entry).catch(() => {
        // Silently fail remote logging
      });
    }
  }

  /**
   * Debug level logging
   * Use for detailed debugging information
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  /**
   * Info level logging
   * Use for general informational messages
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  /**
   * Warning level logging
   * Use for warning messages that don't prevent operation
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  /**
   * Error level logging
   * Use for error messages
   */
  error(message: string, errorOrContext?: Error | Record<string, unknown>, context?: Record<string, unknown>): void {
    let error: Error | undefined;
    let finalContext: Record<string, unknown> | undefined;

    // Handle overloaded parameters
    if (errorOrContext instanceof Error) {
      error = errorOrContext;
      finalContext = context;
    } else if (typeof errorOrContext === 'object') {
      finalContext = errorOrContext;
    }

    this.log('error', message, finalContext, error);
  }

  /**
   * Create a child logger with additional context
   */
  child(defaultContext: Record<string, unknown>): Logger {
    const childLogger = new Logger(this.config);
    
    // Override log method to include default context
    const originalLog = childLogger.log.bind(childLogger);
    childLogger.log = (level, message, context?, error?) => {
      originalLog(level, message, { ...defaultContext, ...context }, error);
    };

    return childLogger;
  }

  /**
   * Set minimum log level
   */
  setMinLevel(level: LogLevel): void {
    this.config.minLevel = level;
  }

  /**
   * Enable/disable console logging
   */
  setConsoleLogging(enabled: boolean): void {
    this.config.enableConsole = enabled;
  }

  /**
   * Enable/disable remote logging
   */
  setRemoteLogging(enabled: boolean): void {
    this.config.enableRemote = enabled;
  }
}

/**
 * Default logger instance
 * Use this for general logging throughout the application
 * 
 * Example:
 * import { logger } from '@/lib/logger';
 * logger.info('User logged in', { userId: '123' });
 * logger.error('Failed to fetch data', error, { endpoint: '/api/users' });
 */
export const logger = new Logger();

/**
 * Create a logger with specific context
 * Useful for component-specific or feature-specific logging
 *
 * Example:
 * const authLogger = createLogger({ component: 'AuthService' });
 * authLogger.info('Login attempt', { email: 'user@example.com' });
 */
export function createLogger(defaultContext: Record<string, unknown>): Logger {
  return logger.child(defaultContext);
}

/**
 * Performance logging helper
 * Measures and logs execution time of async operations
 *
 * Example:
 * const result = await logPerformance('fetchUsers', async () => {
 *   return await fetch('/api/users');
 * });
 */
export async function logPerformance<T>(
  operationName: string,
  operation: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - startTime;
    
    logger.debug(`Performance: ${operationName}`, {
      duration: `${duration.toFixed(2)}ms`,
      ...context,
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    logger.error(
      `Performance: ${operationName} failed`,
      error as Error,
      {
        duration: `${duration.toFixed(2)}ms`,
        ...context,
      }
    );
    
    throw error;
  }
}

/**
 * API request logging helper
 * Logs API requests with method, URL, and response status
 * 
 * Example:
 * const response = await logApiRequest('GET', '/api/users', async () => {
 *   return await fetch('/api/users');
 * });
 */
export async function logApiRequest(
  method: string,
  url: string,
  request: () => Promise<Response>
): Promise<Response> {
  const startTime = performance.now();
  
  logger.debug(`API Request: ${method} ${url}`);
  
  try {
    const response = await request();
    const duration = performance.now() - startTime;
    
    logger.info(`API Response: ${method} ${url}`, {
      status: response.status,
      statusText: response.statusText,
      duration: `${duration.toFixed(2)}ms`,
    });
    
    return response;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    logger.error(
      `API Error: ${method} ${url}`,
      error as Error,
      {
        duration: `${duration.toFixed(2)}ms`,
      }
    );
    
    throw error;
  }
}

