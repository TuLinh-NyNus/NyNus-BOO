/**
 * gRPC-Web Client Base
 * Initialize service hosts and metadata (Authorization + CSRF)
 *
 * ARCHITECTURE UPDATE (2025-10-24):
 * - gRPC calls now route through Next.js API proxy at /api/grpc/[...path]
 * - API proxy extracts JWT from NextAuth session (server-side)
 * - Solves httpOnly cookie + gRPC-Web authentication mismatch
 * - Authorization header added by proxy, not client
 */

import * as grpcWeb from 'grpc-web';
import { getGrpcUrl } from '@/lib/config/endpoints';
import { AuthHelpers } from '@/lib/utils/auth-helpers';
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
  : getGrpcUrl(); // Direct to backend

// Log gRPC configuration
logger.debug('gRPC Client initialized', {
  host: GRPC_WEB_HOST,
  useProxy: USE_API_PROXY,
  mode: USE_API_PROXY ? 'API Proxy' : 'Direct gRPC-Web',
});

/**
 * Get authentication metadata for gRPC calls
 *
 * IMPORTANT: When using API proxy, Authorization header is added by proxy
 * Client only needs to send CSRF token
 *
 * @returns gRPC metadata object
 */
export function getAuthMetadata(): grpcWeb.Metadata {
  const md: grpcWeb.Metadata = {};

  if (typeof window !== 'undefined') {
    // ===== CSRF TOKEN (REQUIRED) =====
    // Add CSRF token for protection against CSRF attacks
    // This is required for both proxy and direct modes
    const csrfToken = AuthHelpers.getCSRFToken();
    if (csrfToken) {
      md['x-csrf-token'] = csrfToken;
      logger.debug('CSRF token added to gRPC metadata');
    } else {
      logger.warn('No CSRF token available for gRPC request');
    }

    // ===== AUTHORIZATION TOKEN (DEPRECATED) =====
    // Primary path: Next.js API proxy injects backend token from secure session
    // Fallback: include browser token metadata so proxy can forward when session sync falters
    const token = localStorage.getItem('nynus-auth-token');
    if (token) {
      md['authorization'] = `Bearer ${token}`;
      logger.debug(`Authorization token added (${USE_API_PROXY ? 'proxy fallback' : 'direct mode'})`);
    } else if (!USE_API_PROXY) {
      logger.warn('No authorization token in localStorage (direct mode)');
    }
  }

  return md;
}
