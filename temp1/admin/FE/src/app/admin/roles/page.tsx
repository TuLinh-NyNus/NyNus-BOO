/**
 * Roles Management Page
 * Trang quản lý vai trò với role hierarchy visualization
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import {
  Users,
  Shield,
  Settings,
  BarChart3,
  RefreshCw,
  Download,
  Upload,
  Plus,
} from "lucide-react";

import { RoleHierarchyTree } from "../../../components/role-management/role-hierarchy-tree";
import { RolePermissionsPanel } from "../../../components/role-management/role-permissions-panel";
import { UserRole, USER_ROLE_LABELS } from "../../../types/admin-user";
import { getAllRolesInOrder, ROLE_LEVELS } from "../../../lib/role-hierarchy";

/**
 * Roles Management Page Component
 * Component trang quản lý vai trò
 */
export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("STUDENT");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle role selection
   * Xử lý chọn role
   */
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  /**
   * Handle refresh data
   * Xử lý refresh dữ liệu
   */
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle export roles
   * Xử lý export roles
   */
  const handleExportRoles = () => {
    // Simulate export functionality
    alert("Xuất dữ liệu vai trò thành công!");
  };

  /**
   * Handle import roles
   * Xử lý import roles
   */
  const handleImportRoles = () => {
    // Simulate import functionality
    alert("Nhập dữ liệu vai trò thành công!");
  };

  const allRoles = getAllRolesInOrder();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý vai trò</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý hệ thống phân cấp vai trò và quyền hạn
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportRoles}>
            <Download className="h-4 w-4 mr-1" />
            Xuất
          </Button>
          <Button variant="outline" size="sm" onClick={handleImportRoles}>
            <Upload className="h-4 w-4 mr-1" />
            Nhập
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Tạo vai trò mới
          </Button>
        </div>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {allRoles.map((role) => (
          <Card key={role} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{USER_ROLE_LABELS[role]}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      Level {ROLE_LEVELS[role]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {Math.floor(Math.random() * 100)} người dùng
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Hierarchy Tree */}
        <div className="space-y-4">
          <RoleHierarchyTree
            selectedRole={selectedRole}
            onRoleSelect={handleRoleSelect}
            showPermissions={true}
          />

          {/* Role Management Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Thao tác quản lý
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Quản lý người dùng theo vai trò
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Cấu hình quyền hạn
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Báo cáo phân tích vai trò
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Role Permissions Panel */}
        <div className="space-y-4">
          <RolePermissionsPanel selectedRole={selectedRole} />

          {/* Role Statistics Detail */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Thống kê vai trò
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRole && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        {Math.floor(Math.random() * 100)}
                      </p>
                      <p className="text-sm text-muted-foreground">Người dùng hiện tại</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {Math.floor(Math.random() * 20)}
                      </p>
                      <p className="text-sm text-muted-foreground">Hoạt động tuần này</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tỷ lệ hoạt động:</span>
                      <span className="font-medium">{Math.floor(Math.random() * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Mức độ sử dụng quyền:</span>
                      <span className="font-medium">{Math.floor(Math.random() * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Role Hierarchy Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Tóm tắt hệ thống phân cấp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{allRoles.length}</p>
              <p className="text-sm text-muted-foreground">Tổng số vai trò</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {Object.values(ROLE_LEVELS).reduce((max, level) => Math.max(max, level), 0) + 1}
              </p>
              <p className="text-sm text-muted-foreground">Cấp độ phân cấp</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{Math.floor(Math.random() * 500)}</p>
              <p className="text-sm text-muted-foreground">Tổng người dùng</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2">Cấu trúc phân cấp:</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {allRoles.map((role, index) => (
                <React.Fragment key={role}>
                  <span className="font-medium">{USER_ROLE_LABELS[role]}</span>
                  {index < allRoles.length - 1 && <span>→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
