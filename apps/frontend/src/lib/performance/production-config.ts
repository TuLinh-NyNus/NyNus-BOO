/**
 * Production Configuration for Performance Optimization
 * Cấu hình tối ưu cho production environment
 */

// Environment detection
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isClient = typeof window !== 'undefined';
export const isServer = typeof window === 'undefined';

/**
 * Performance Configuration
 */
export const PERFORMANCE_CONFIG = {
  // Cache settings
  cache: {
    // Browser cache durations (in seconds)
    staticAssets: 31536000, // 1 year
    apiResponses: 300, // 5 minutes
    userSession: 900, // 15 minutes
    
    // Memory cache limits
    maxMemoryCacheSize: 50 * 1024 * 1024, // 50MB
    maxLocalStorageSize: 5 * 1024 * 1024, // 5MB
  },
  
  // Enhanced network settings for production
  network: {
    // Optimized request timeouts (in milliseconds)
    apiTimeout: 15000, // 15 seconds for production stability
    authTimeout: 8000, // 8 seconds for auth operations
    uploadTimeout: 60000, // 60 seconds for large uploads

    // Enhanced retry settings
    maxRetries: 3,
    retryDelay: 2000, // 2 seconds retry delay
    exponentialBackoff: true, // Enable exponential backoff

    // Optimized connection settings
    keepAlive: true,
    maxConnections: 20, // Increased for production load
    keepAliveTimeout: 30000, // 30 seconds
  },
  
  // Bundle optimization
  bundle: {
    // Code splitting thresholds
    chunkSizeLimit: 244 * 1024, // 244KB
    maxAsyncRequests: 30,
    maxInitialRequests: 30,
    
    // Preload settings
    preloadCriticalComponents: true,
    prefetchNextPage: true,
  },
  
  // Image optimization
  images: {
    // Quality settings
    quality: isProduction ? 85 : 95,
    formats: ['avif', 'webp', 'jpg'],
    
    // Size settings
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Loading settings
    lazy: true,
    placeholder: 'blur',
  },
  
  // Monitoring settings
  monitoring: {
    // Performance metrics
    enableWebVitals: isProduction,
    enableErrorTracking: isProduction,
    enablePerformanceTracking: true,
    
    // Sampling rates
    performanceSampleRate: isProduction ? 0.1 : 1.0, // 10% in prod, 100% in dev
    errorSampleRate: isProduction ? 1.0 : 1.0, // 100% always
    
    // Thresholds
    slowPageThreshold: 3000, // 3 seconds
    slowApiThreshold: 1000, // 1 second
  },
  
  // Security settings
  security: {
    // CSP settings
    enableCSP: isProduction,
    enableHSTS: isProduction,
    enableXSSProtection: true,
    
    // Rate limiting
    enableRateLimit: isProduction,
    maxRequestsPerMinute: 60,
    
    // Session settings
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    refreshTokenThreshold: 5 * 60 * 1000, // 5 minutes before expiry
  }
} as const;

import { API_ENDPOINTS } from '@/lib/config/endpoints';

/**
 * API Configuration
 */
export const API_CONFIG = {
  baseURL: API_ENDPOINTS.API_URL,
  grpcURL: API_ENDPOINTS.GRPC_URL,
  
  // Endpoints
  endpoints: {
    auth: '/api/auth',
    users: '/api/users',
    admin: '/api/admin',
    notifications: '/api/notifications',
    resources: '/api/resources',
  },
  
  // Headers
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(isProduction && {
      'X-Requested-With': 'XMLHttpRequest',
    }),
  },
  
  // Timeouts
  timeout: PERFORMANCE_CONFIG.network.apiTimeout,
  retries: PERFORMANCE_CONFIG.network.maxRetries,
} as const;

/**
 * Feature Flags
 */
export const FEATURE_FLAGS = {
  // Authentication features
  enableGoogleOAuth: true,
  enableEmailAuth: true,
  enableMFA: false, // TODO: Implement in future
  
  // Admin features
  enableUserManagement: true,
  enableAuditLogs: true,
  enableSystemMonitoring: true,
  
  // Resource protection
  enableResourceProtection: true,
  enableRiskScoring: true,
  enableAutoBlocking: true,
  
  // Notifications
  enableRealTimeNotifications: true,
  enableEmailNotifications: false, // TODO: Implement email service
  enablePushNotifications: false, // TODO: Implement push service
  
  // Performance features
  enableServiceWorker: isProduction,
  enableOfflineMode: false, // TODO: Implement offline support
  enablePrefetching: true,
  
  // Development features
  enablePerformanceMonitoring: true,
  enableDebugMode: isDevelopment,
  enableHotReload: isDevelopment,
} as const;

/**
 * Database Configuration (for reference)
 */
export const DATABASE_CONFIG = {
  // Connection pool settings
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
  },
  
  // Query optimization
  query: {
    timeout: 30000, // 30 seconds
    maxRows: 1000,
    enableQueryLogging: isDevelopment,
  },
  
  // Cache settings
  cache: {
    enableQueryCache: true,
    queryTTL: 300000, // 5 minutes
    maxCacheSize: 100,
  },
} as const;

/**
 * Logging Configuration
 */
export const LOGGING_CONFIG = {
  level: isProduction ? 'error' : 'debug',
  
  // Console logging
  console: {
    enabled: isDevelopment,
    colors: true,
    timestamp: true,
  },
  
  // Remote logging (for production)
  remote: {
    enabled: isProduction,
    endpoint: process.env.LOGGING_ENDPOINT,
    apiKey: process.env.LOGGING_API_KEY,
    batchSize: 10,
    flushInterval: 5000, // 5 seconds
  },
  
  // Error tracking
  errors: {
    enabled: true,
    captureUnhandledRejections: true,
    captureUncaughtExceptions: isProduction,
    maxBreadcrumbs: 50,
  },
} as const;

/**
 * Build Configuration
 */
export const BUILD_CONFIG = {
  // Optimization settings
  optimization: {
    minimize: isProduction,
    splitChunks: true,
    treeShaking: true,
    deadCodeElimination: true,
  },
  
  // Bundle analysis
  analyze: process.env.ANALYZE === 'true',
  
  // Source maps
  sourceMaps: isDevelopment,
  
  // Compression
  compression: {
    enabled: isProduction,
    algorithm: 'gzip',
    level: 6,
  },
} as const;

/**
 * Runtime Configuration Helpers
 */
export const RuntimeConfig = {
  /**
   * Get configuration based on environment
   */
  getConfig: () => ({
    performance: PERFORMANCE_CONFIG,
    api: API_CONFIG,
    features: FEATURE_FLAGS,
    database: DATABASE_CONFIG,
    logging: LOGGING_CONFIG,
    build: BUILD_CONFIG,
  }),
  
  /**
   * Check if feature is enabled
   */
  isFeatureEnabled: (feature: keyof typeof FEATURE_FLAGS): boolean => {
    return FEATURE_FLAGS[feature];
  },
  
  /**
   * Get API endpoint
   */
  getApiEndpoint: (endpoint: keyof typeof API_CONFIG.endpoints): string => {
    return `${API_CONFIG.baseURL}${API_CONFIG.endpoints[endpoint]}`;
  },
  
  /**
   * Get cache TTL for specific type
   */
  getCacheTTL: (type: 'static' | 'api' | 'session'): number => {
    switch (type) {
      case 'static': return PERFORMANCE_CONFIG.cache.staticAssets;
      case 'api': return PERFORMANCE_CONFIG.cache.apiResponses;
      case 'session': return PERFORMANCE_CONFIG.cache.userSession;
      default: return 300; // 5 minutes default
    }
  },
  
  /**
   * Get timeout for specific operation
   */
  getTimeout: (operation: 'api' | 'auth' | 'upload'): number => {
    switch (operation) {
      case 'api': return PERFORMANCE_CONFIG.network.apiTimeout;
      case 'auth': return PERFORMANCE_CONFIG.network.authTimeout;
      case 'upload': return PERFORMANCE_CONFIG.network.uploadTimeout;
      default: return 10000; // 10 seconds default
    }
  },
  
  /**
   * Check if monitoring is enabled
   */
  isMonitoringEnabled: (type: 'webVitals' | 'errors' | 'performance'): boolean => {
    switch (type) {
      case 'webVitals': return PERFORMANCE_CONFIG.monitoring.enableWebVitals;
      case 'errors': return PERFORMANCE_CONFIG.monitoring.enableErrorTracking;
      case 'performance': return PERFORMANCE_CONFIG.monitoring.enablePerformanceTracking;
      default: return false;
    }
  },
};

/**
 * Environment-specific overrides
 */
if (isProduction) {
  // Production-specific optimizations
  console.log = () => {}; // Disable console.log in production
  console.debug = () => {}; // Disable console.debug in production
}

export default RuntimeConfig;
