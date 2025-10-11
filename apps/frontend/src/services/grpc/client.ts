/**
 * gRPC-Web Client Base
 * Initialize service hosts and metadata (Authorization + CSRF)
 */

import * as grpcWeb from 'grpc-web';
import { getGrpcUrl } from '@/lib/config/endpoints';
import { AuthHelpers } from '@/lib/utils/auth-helpers';
import { logger } from '@/lib/logger';

export const GRPC_WEB_HOST = getGrpcUrl();

// Log gRPC configuration
logger.debug('gRPC Client initialized', { host: GRPC_WEB_HOST });

/**
 * Get authentication metadata for gRPC calls
 * Includes Authorization token and CSRF token for security
 */
export function getAuthMetadata(): grpcWeb.Metadata {
  const md: grpcWeb.Metadata = {};

  if (typeof window !== 'undefined') {
    // Add Authorization token (from localStorage - deprecated)
    const token = localStorage.getItem('nynus-auth-token');
    if (token) {
      md['Authorization'] = `Bearer ${token}`;
    }

    // ✅ NEW: Add CSRF token for protection against CSRF attacks
    const csrfToken = AuthHelpers.getCSRFToken();
    if (csrfToken) {
      md['x-csrf-token'] = csrfToken;
      logger.debug('CSRF token added to gRPC metadata');
    } else {
      logger.warn('No CSRF token available for gRPC request');
    }
  }

  return md;
}