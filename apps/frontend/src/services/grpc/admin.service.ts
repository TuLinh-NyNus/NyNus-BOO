/**
 * Admin Service Client (gRPC-Web)
 * Implements AdminService RPCs for user management, audit logs, resource access, and system stats
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { GRPC_WEB_HOST, getAuthMetadata } from './client';

// Generated stubs (assuming codegen created these; otherwise ambient types must exist)
import { GetSystemStatsRequest } from '@/generated/v1/admin_pb';
import { AdminServiceClient } from '@/generated/v1/admin_pb_service';

const client = new AdminServiceClient(GRPC_WEB_HOST);

export class AdminService {
  static async listUsers(req: any): Promise<any> {
    return new Promise((resolve, reject) => {
      client.listUsers(req, getAuthMetadata(), (err: unknown, res: unknown) => {
        if (err) return reject(err);
        resolve(res as any);
      });
    });
  }

  static async updateUserRole(req: any): Promise<any> {
    return new Promise((resolve, reject) => {
      client.updateUserRole(req, getAuthMetadata(), (err: unknown, res: unknown) => {
        if (err) return reject(err);
        resolve(res as any);
      });
    });
  }

  static async updateUserLevel(req: any): Promise<any> {
    return new Promise((resolve, reject) => {
      client.updateUserLevel(req, getAuthMetadata(), (err: unknown, res: unknown) => {
        if (err) return reject(err);
        resolve(res as any);
      });
    });
  }

  static async updateUserStatus(req: any): Promise<any> {
    return new Promise((resolve, reject) => {
      client.updateUserStatus(req, getAuthMetadata(), (err: unknown, res: unknown) => {
        if (err) return reject(err);
        resolve(res as any);
      });
    });
  }

  static async getAuditLogs(req: any): Promise<any> {
    return new Promise((resolve, reject) => {
      client.getAuditLogs(req, getAuthMetadata(), (err: unknown, res: unknown) => {
        if (err) return reject(err);
        resolve(res as any);
      });
    });
  }

  static async getResourceAccess(req: any): Promise<any> {
    return new Promise((resolve, reject) => {
      client.getResourceAccess(req, getAuthMetadata(), (err: unknown, res: unknown) => {
        if (err) return reject(err);
        resolve(res as any);
      });
    });
  }

  static async getSecurityAlerts(req: any): Promise<any> {
    return new Promise((resolve, reject) => {
      client.getSecurityAlerts(req, getAuthMetadata(), (err: unknown, res: unknown) => {
        if (err) return reject(err);
        resolve(res as any);
      });
    });
  }

  static async getSystemStats(_req?: any): Promise<any> {
    const req = new GetSystemStatsRequest();
    return new Promise((resolve, reject) => {
      client.getSystemStats(req, getAuthMetadata(), (err: unknown, res: unknown) => {
        if (err) return reject(err);
        resolve(res as any);
      });
    });
  }
}
