/**
 * gRPC Client Factory
 * ===================
 * 
 * Centralized factory for creating gRPC service clients with lazy initialization
 * Prevents "Cannot read properties of undefined (reading 'replace')" errors
 * 
 * @author NyNus Development Team
 * @version 2.0.0 - Phase 2 Auto-Retry Implementation
 */

import { GRPC_WEB_HOST } from './config';
import { logger } from '@/lib/logger';

/**
 * Default gRPC client options
 */
const DEFAULT_CLIENT_OPTIONS = {
  format: 'text' as const, // Use text format for consistency with proto generation
  withCredentials: false,
  unaryInterceptors: [],
  streamInterceptors: []
};

/**
 * Generic gRPC client factory with lazy initialization
 * 
 * @param ClientClass - The gRPC service client class constructor
 * @param serviceName - Name of the service for logging
 * @returns Function that returns initialized client instance
 */
export function createGrpcClient<T>(
  ClientClass: new (endpoint: string, credentials?: { [index: string]: string } | null, options?: { [index: string]: unknown } | null) => T,
  serviceName: string
): () => T {
  let clientInstance: T | null = null;
  
  return function getClient(): T {
    // Only allow client-side usage
    if (typeof window === 'undefined') {
      throw new Error(`[${serviceName}] gRPC client can only be used on client-side`);
    }
    
    // Lazy initialization
    if (!clientInstance) {
      logger.debug(`[${serviceName}] Initializing gRPC client`, { 
        endpoint: GRPC_WEB_HOST,
        serviceName 
      });
      
      clientInstance = new ClientClass(GRPC_WEB_HOST, null, DEFAULT_CLIENT_OPTIONS);
    }
    
    return clientInstance;
  };
}

/**
 * Simple gRPC client factory for clients that don't use options
 * 
 * @param ClientClass - The gRPC service client class constructor
 * @param serviceName - Name of the service for logging
 * @returns Function that returns initialized client instance
 */
export function createSimpleGrpcClient<T>(
  ClientClass: new (endpoint: string) => T,
  serviceName: string
): () => T {
  let clientInstance: T | null = null;
  
  return function getClient(): T {
    // Only allow client-side usage
    if (typeof window === 'undefined') {
      throw new Error(`[${serviceName}] gRPC client can only be used on client-side`);
    }
    
    // Lazy initialization
    if (!clientInstance) {
      logger.debug(`[${serviceName}] Initializing simple gRPC client`, { 
        endpoint: GRPC_WEB_HOST,
        serviceName 
      });
      
      clientInstance = new ClientClass(GRPC_WEB_HOST);
    }
    
    return clientInstance;
  };
}

/**
 * Reset all client instances (useful for testing)
 */
export function resetAllClients(): void {
  logger.debug('[ClientFactory] Resetting all gRPC client instances');
  // Note: Individual clients will be reset when their getter functions are called again
}
