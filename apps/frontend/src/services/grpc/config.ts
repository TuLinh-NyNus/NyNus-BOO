/**
 * gRPC Configuration
 * ==================
 * 
 * Centralized gRPC configuration to avoid circular dependencies
 * This file should only contain configuration constants and utilities
 * 
 * @author NyNus Development Team
 * @version 2.0.0 - Phase 2 Auto-Retry Implementation
 */

import { getGrpcUrl } from '@/lib/config/endpoints';
import { logger } from '@/lib/logger';

// ===== CONFIGURATION =====

/**
 * Enable API proxy for gRPC calls
 *
 * When true: Client → /api/grpc/[...path] → Backend
 * When false: Client → Backend (direct gRPC-Web)
 *
 * Default: true (required for NextAuth v5 httpOnly cookies)
 */
const USE_API_PROXY = process.env.NEXT_PUBLIC_USE_GRPC_PROXY !== 'false'; // Default true

/**
 * gRPC endpoint configuration
 *
 * If USE_API_PROXY = true:  Uses /api/grpc (Next.js API route)
 * If USE_API_PROXY = false: Uses backend URL directly
 */
export const GRPC_WEB_HOST = USE_API_PROXY
  ? '/api/grpc'  // Route through Next.js API proxy
  : (getGrpcUrl() || 'http://localhost:8080'); // Direct to backend with fallback

// ✅ FIX: Validate GRPC_WEB_HOST is not undefined
if (!GRPC_WEB_HOST) {
  throw new Error('[gRPC Config] GRPC_WEB_HOST is undefined. Check environment variables.');
}

/**
 * Export proxy configuration for other modules
 */
export const GRPC_CONFIG = {
  host: GRPC_WEB_HOST,
  useProxy: USE_API_PROXY,
  mode: USE_API_PROXY ? 'API Proxy' : 'Direct gRPC-Web',
} as const;

// Log gRPC configuration
logger.debug('gRPC Configuration initialized', GRPC_CONFIG);

