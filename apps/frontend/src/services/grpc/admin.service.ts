/**
 * Admin Service Client (gRPC-Web)
 * Implements AdminService RPCs for user management, audit logs, resource access, and system stats
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

// TODO: Re-enable when protobuf files are generated
// import { GRPC_WEB_HOST, getAuthMetadata } from './client';
// import { GetSystemStatsRequest } from '@/generated/v1/admin_pb';
// import { AdminServiceClient } from '@/generated/v1/admin_pb_service';
// const client = new AdminServiceClient(GRPC_WEB_HOST);

// Temporary stub implementation
export class AdminService {
  static async listUsers(_req: any): Promise<any> {
    console.warn('AdminService.listUsers is stubbed - need protobuf generation');
    return Promise.resolve({
      getUsersList: () => [],
      getPagination: () => ({
        getPage: () => 1,
        getLimit: () => 20,
        getTotalCount: () => 0,
        getTotalPages: () => 0
      })
    });
  }

  static async updateUserRole(_req: any): Promise<any> {
    console.warn('AdminService.updateUserRole is stubbed - need protobuf generation');
    return Promise.resolve({
      getUpdatedUser: () => null
    });
  }

  static async updateUserLevel(_req: any): Promise<any> {
    console.warn('AdminService.updateUserLevel is stubbed - need protobuf generation');
    return Promise.resolve({ getUpdatedUser: () => null });
  }

  static async updateUserStatus(_req: any): Promise<any> {
    console.warn('AdminService.updateUserStatus is stubbed - need protobuf generation');
    return Promise.resolve({ getUpdatedUser: () => null });
  }

  static async getAuditLogs(_req: any): Promise<any> {
    console.warn('AdminService.getAuditLogs is stubbed - need protobuf generation');
    return Promise.resolve({
      getLogsList: () => [],
      getPagination: () => ({
        getPage: () => 1,
        getLimit: () => 20,
        getTotalCount: () => 0,
        getTotalPages: () => 0
      })
    });
  }

  static async getResourceAccess(_req: any): Promise<any> {
    console.warn('AdminService.getResourceAccess is stubbed - need protobuf generation');
    return Promise.resolve({
      getAccessesList: () => [],
      getPagination: () => ({
        getPage: () => 1,
        getLimit: () => 20,
        getTotalCount: () => 0,
        getTotalPages: () => 0
      })
    });
  }

  static async getSecurityAlerts(_req: any): Promise<any> {
    console.warn('AdminService.getSecurityAlerts is stubbed - need protobuf generation');
    return Promise.resolve({
      getAlertsList: () => [],
      getPagination: () => ({
        getPage: () => 1,
        getLimit: () => 20,
        getTotalCount: () => 0,
        getTotalPages: () => 0
      })
    });
  }

  static async getSystemStats(_req?: any): Promise<any> {
    console.warn('AdminService.getSystemStats is stubbed - need protobuf generation');
    return Promise.resolve({
      getStats: () => ({
        getTotalUsers: () => 0,
        getActiveUsers: () => 0,
        getTotalSessions: () => 0,
        getActiveSessions: () => 0,
        getUsersByRoleMap: () => ({ toObject: () => ({}) }),
        getUsersByStatusMap: () => ({ toObject: () => ({}) }),
        getSuspiciousActivities: () => 0
      })
    });
  }
}
