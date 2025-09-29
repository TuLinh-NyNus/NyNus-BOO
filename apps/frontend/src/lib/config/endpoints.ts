/**
 * Centralized API Endpoints Configuration
 * 
 * Consolidates all hardcoded URLs and endpoints into a single configuration file
 * Supports environment variable overrides for different deployment environments
 */

// ===== GRPC ENDPOINTS =====

export const API_ENDPOINTS = {
  // gRPC-Web URL for backend communication
  GRPC_URL: process.env.NEXT_PUBLIC_GRPC_URL || process.env.NEXT_PUBLIC_GRPC_WEB_URL || 'http://localhost:8080',
  
  // HTTP API URL (fallback)
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  
  // WebSocket URL for real-time features
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000',
  
  // Health check endpoint
  HEALTH_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
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
  return `${API_ENDPOINTS.HEALTH_URL}/health`;
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
