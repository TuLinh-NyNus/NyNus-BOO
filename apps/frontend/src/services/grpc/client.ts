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
import { AuthHelpers } from '@/lib/utils/auth-helpers';
import { logger } from '@/lib/logger';
// ✅ PHASE 2: Import gRPC configuration (moved to avoid circular dependency)
import { GRPC_CONFIG } from './config';
// ✅ PHASE 2: Import auth interceptor
import { getAuthInterceptor, interceptGrpcCall } from './interceptors/auth-interceptor';

/**
 * Get authentication metadata for gRPC calls (LEGACY)
 *
 * IMPORTANT: When using API proxy, Authorization header is added by proxy
 * Client only needs to send CSRF token
 *
 * @deprecated Use getAuthMetadataWithInterceptor() for new code
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
      logger.debug(`Authorization token added (${GRPC_CONFIG.useProxy ? 'proxy fallback' : 'direct mode'})`);
    } else if (!GRPC_CONFIG.useProxy) {
      logger.warn('No authorization token in localStorage (direct mode)');
    }
  }

  return md;
}

/**
 * Get authentication metadata with interceptor support (PHASE 2)
 * 
 * This function works with the AuthInterceptor to provide:
 * - Automatic token refresh
 * - Retry logic on token expiry
 * - Fresh token for each request
 *
 * @returns Promise<Record<string, string>> - Authentication metadata
 */
export async function getAuthMetadataWithInterceptor(): Promise<Record<string, string>> {
  const interceptor = getAuthInterceptor();
  const metadata: Record<string, string> = {};

  if (typeof window !== 'undefined') {
    // Get fresh token through interceptor
    try {
      const token = await interceptor['getFreshToken']?.() || AuthHelpers.getAccessToken();
      if (token) {
        metadata['authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      logger.warn('[getAuthMetadataWithInterceptor] Failed to get fresh token:', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      // Fallback to existing token
      const fallbackToken = AuthHelpers.getAccessToken();
      if (fallbackToken) {
        metadata['authorization'] = `Bearer ${fallbackToken}`;
      }
    }

    // Add CSRF token
    const csrfToken = AuthHelpers.getCSRFToken();
    if (csrfToken) {
      metadata['x-csrf-token'] = csrfToken;
    }
  }

  return metadata;
}

/**
 * Wrapper function for making intercepted gRPC calls
 * 
 * This is the recommended way to make gRPC calls with automatic:
 * - Token refresh
 * - Retry on token expiry
 * - Error handling
 * 
 * @example
 * ```typescript
 * const response = await makeInterceptedGrpcCall(
 *   request,
 *   async (req, metadata) => {
 *     const client = getUserServiceClient();
 *     return await client.getCurrentUser(req, metadata);
 *   },
 *   'getCurrentUser'
 * );
 * ```
 */
export async function makeInterceptedGrpcCall<TRequest, TResponse>(
  request: TRequest,
  grpcCall: (request: TRequest, metadata: Record<string, string>) => Promise<TResponse>,
  context: string = 'grpc-call'
): Promise<TResponse> {
  return await interceptGrpcCall(
    request,
    async (req, metadata) => {
      // If no metadata provided, get fresh metadata
      const finalMetadata = metadata || await getAuthMetadataWithInterceptor();
      return await grpcCall(req, finalMetadata);
    },
    context
  );
}
