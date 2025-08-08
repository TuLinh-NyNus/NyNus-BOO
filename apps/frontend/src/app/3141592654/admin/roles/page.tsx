/**
 * Roles Management Page
 * Trang quản lý vai trò với role hierarchy visualization
 */

"use client";

import React from "react";

import { RolePermissionsPanel } from "@/components/features/admin/role-management";
import { UserRole } from "@/lib/mockdata/core-types";

/**
 * Roles Management Page Component
 * Component trang quản lý vai trò
 */
export default function RolesPage() {

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Role Management</h1>
        <p className="text-muted-foreground">
          Quản lý roles và permissions trong hệ thống NyNus
        </p>
      </div>

      {/* Role Management Panel */}
      <RolePermissionsPanel />
    </div>
  );
}
