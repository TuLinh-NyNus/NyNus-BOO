'use client';

import { PermissionMatrix } from '@/components/features/admin/security/permission-matrix';

export default function AdminUsersPermissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý phân quyền</h1>
        <p className="text-muted-foreground">
          Cấu hình quyền hạn cho từng vai trò trong hệ thống
        </p>
      </div>

      <PermissionMatrix />
    </div>
  );
}
