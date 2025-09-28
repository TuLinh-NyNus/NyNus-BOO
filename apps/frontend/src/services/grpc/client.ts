/**
 * gRPC-Web Client Base
 * Initialize service hosts and metadata (Authorization)
 */

import * as grpcWeb from 'grpc-web';

export const GRPC_WEB_HOST = process.env.NEXT_PUBLIC_GRPC_URL || process.env.NEXT_PUBLIC_GRPC_WEB_URL || 'http://localhost:8080';

export function getAuthMetadata(): grpcWeb.Metadata {
  const md: grpcWeb.Metadata = {};
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('nynus-auth-token');
    if (token) md['Authorization'] = `Bearer ${token}`;
  }
  return md;
}