/**
 * gRPC-Web Client Base
 * Initialize service hosts and metadata (Authorization)
 */

import { grpc } from '@improbable-eng/grpc-web';

export const GRPC_WEB_HOST = process.env.NEXT_PUBLIC_GRPC_URL || process.env.NEXT_PUBLIC_GRPC_WEB_URL || 'http://localhost:8080';

export function getAuthMetadata(): grpc.Metadata {
  const md = new grpc.Metadata();
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('nynus-auth-token');
    if (token) md.set('Authorization', `Bearer ${token}`);
  }
  return md;
}