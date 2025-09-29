/**
 * gRPC-Web Client Base
 * Initialize service hosts and metadata (Authorization)
 */

import * as grpcWeb from 'grpc-web';
import { getGrpcUrl } from '@/lib/config/endpoints';

export const GRPC_WEB_HOST = getGrpcUrl();

export function getAuthMetadata(): grpcWeb.Metadata {
  const md: grpcWeb.Metadata = {};
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('nynus-auth-token');
    if (token) md['Authorization'] = `Bearer ${token}`;
  }
  return md;
}