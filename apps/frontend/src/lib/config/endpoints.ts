/**
 * Centralized API Endpoints Configuration
 * 
 * Consolidates all hardcoded URLs and endpoints into a single configuration file
 * Supports environment variable overrides for different deployment environments
 * 
 * @version 2.1.0 - Enhanced with logging and validation
 */

// ===== ENDPOINT VALIDATION =====

/**
 * Validate and log endpoint configuration on startup
 */
function validateEndpoints() {
  const grpcUrl = process.env.NEXT_PUBLIC_GRPC_URL;
  const grpcWebUrl = process.env.NEXT_PUBLIC_GRPC_WEB_URL;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (typeof window !== 'undefined') {
    console.log('[ENDPOINTS] Configuration loaded:', {
      GRPC_URL: grpcUrl || 'undefined (using fallback)',
      GRPC_WEB_URL: grpcWebUrl || 'undefined (using fallback)',
      API_URL: apiUrl || 'undefined (using fallback)',
      FALLBACK: 'http://localhost:8080'
    });

    if (!grpcUrl && !grpcWebUrl && !apiUrl) {
      console.warn('[ENDPOINTS] ⚠️ No environment variables found! Using hardcoded fallback URLs.');
      console.warn('[ENDPOINTS] Make sure to set NEXT_PUBLIC_GRPC_URL in your .env file');
    }
  }
}

// Validate endpoints on module load (client-side only)
if (typeof window !== 'undefined') {
  validateEndpoints();
}

// ===== GRPC ENDPOINTS =====

export const API_ENDPOINTS = {
  // ✅ FIXED: Use correct port 8080 for gRPC-Web and HTTP Gateway
  // Priority: NEXT_PUBLIC_GRPC_URL > NEXT_PUBLIC_GRPC_WEB_URL > fallback
  GRPC_URL: process.env.NEXT_PUBLIC_GRPC_URL || process.env.NEXT_PUBLIC_GRPC_WEB_URL || 'http://localhost:8080',

  // HTTP API URL (fallback)
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',

  // WebSocket URL for real-time features
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000',

  // Health check endpoint
  HEALTH_URL: (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_GRPC_URL || 'http://localhost:8080') + '/health',
} as const;

// ===== EXTERNAL SERVICE ENDPOINTS =====

export const EXTERNAL_ENDPOINTS = {
  // Google OAuth endpoints
  GOOGLE_OAUTH: 'https://accounts.google.com/oauth/authorize',
  
  // CDN endpoints for static assets
  CDN_URL: process.env.NEXT_PUBLIC_CDN_URL || '',
  
  // Analytics endpoints
  ANALYTICS_URL: process.env.NEXT_PUBLIC_ANALYTICS_URL || '',
} as const;

// ===== DEVELOPMENT ENDPOINTS =====

export const DEV_ENDPOINTS = {
  // Local development URLs
  LOCAL_GRPC: 'http://localhost:8080',
  LOCAL_API: 'http://localhost:8080',
  LOCAL_WS: 'ws://localhost:3000',
} as const;

// ===== ENDPOINT UTILITIES =====

/**
 * Get the appropriate gRPC URL based on environment
 */
export function getGrpcUrl(): string {
  return API_ENDPOINTS.GRPC_URL;
}

/**
 * Get the appropriate API URL based on environment
 */
export function getApiUrl(): string {
  return API_ENDPOINTS.API_URL;
}

/**
 * Get health check URL
 */
export function getHealthUrl(): string {
  return API_ENDPOINTS.HEALTH_URL;
}

/**
 * Check backend health status
 * 
 * @returns Promise with health status
 */
export async function checkBackendHealth(): Promise<{
  healthy: boolean;
  service?: string;
  timestamp?: number;
  error?: string;
}> {
  try {
    const response = await fetch(getHealthUrl(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Short timeout for health check
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return {
        healthy: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      healthy: data.status === 'healthy',
      service: data.service,
      timestamp: data.timestamp,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Get appropriate endpoint based on environment
 */
export function getEndpoint(endpoint: keyof typeof API_ENDPOINTS): string {
  return API_ENDPOINTS[endpoint];
}

// ===== TYPE EXPORTS =====

export type ApiEndpoint = keyof typeof API_ENDPOINTS;
export type ExternalEndpoint = keyof typeof EXTERNAL_ENDPOINTS;
export type DevEndpoint = keyof typeof DEV_ENDPOINTS;
