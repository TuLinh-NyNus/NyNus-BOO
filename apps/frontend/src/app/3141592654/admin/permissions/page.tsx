"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
// Simple Tabs implementation
const Tabs = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={className}>{children}</div>;

const TabsList = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex border-b ${className}`}>{children}</div>
);

const TabsTrigger = ({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <button onClick={onClick} className={`px-4 py-2 border-b-2 transition-colors ${className}`}>
    {children}
  </button>
);

const TabsContent = ({
  value,
  children,
  className,
  activeTab,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
}) => {
  if (activeTab !== value) return null;

  return <div className={className}>{children}</div>;
};
import { Shield, Grid3X3, File, Settings, RefreshCw } from "lucide-react";
import { UserRole } from "@/lib/mockdata/core-types";
import { PermissionMatrix } from "../../../../components/admin/roles/permission-matrix";
import { PermissionEditor } from "../../../../components/admin/roles/permission-editor";
import { PermissionTemplates } from "../../../../components/admin/roles/permission-templates";

/**
 * Permission Management Page
 * Trang quản lý permissions và templates
 */
export default function PermissionManagementPage() {
  // State management
  const [activeTab, setActiveTab] = useState("matrix");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  /**
   * Handle edit role permissions
   */
  const handleEditRole = (role: UserRole) => {
    setSelectedRole(role);
    setIsEditorOpen(true);
  };

  /**
   * Handle editor success
   */
  const handleEditorSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setIsEditorOpen(false);
    setSelectedRole(null);
  };

  /**
   * Handle template applied
   */
  const handleTemplateApplied = () => {
    setRefreshKey((prev) => prev + 1);
  };

  /**
   * Refresh all data
   */
  const refreshAllData = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8" />
            Permission Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Quản lý permissions và templates cho hệ thống role-based access control
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={refreshAllData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            className={`flex items-center gap-2 ${
              activeTab === "matrix"
                ? "border-blue-500 text-blue-600"
                : "border-transparent hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("matrix")}
          >
            <Grid3X3 className="h-4 w-4" />
            Permission Matrix
          </TabsTrigger>
          <TabsTrigger
            className={`flex items-center gap-2 ${
              activeTab === "templates"
                ? "border-blue-500 text-blue-600"
                : "border-transparent hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("templates")}
          >
            <File className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Permission Matrix Tab */}
        <TabsContent value="matrix" className="space-y-6" activeTab={activeTab}>
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Grid3X3 className="h-5 w-5" />
                  Role Permission Matrix
                </h2>
                <p className="text-muted-foreground">Xem và chỉnh sửa permissions cho từng role</p>
              </div>
            </div>

            <PermissionMatrix key={`matrix-${refreshKey}`} onEditRole={handleEditRole} />
          </div>
        </TabsContent>

        {/* Permission Templates Tab */}
        <TabsContent value="templates" className="space-y-6" activeTab={activeTab}>
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <File className="h-5 w-5" />
                  Permission Templates
                </h2>
                <p className="text-muted-foreground">Quản lý và áp dụng permission templates</p>
              </div>
            </div>

            <PermissionTemplates
              key={`templates-${refreshKey}`}
              onTemplateApplied={handleTemplateApplied}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Permission Editor Dialog */}
      <PermissionEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedRole(null);
        }}
        role={selectedRole}
        onSuccess={handleEditorSuccess}
      />

      {/* Quick Actions Panel */}
      <div className="fixed bottom-6 right-6 space-y-2">
        <div className="bg-white border rounded-lg shadow-lg p-4 space-y-2">
          <div className="text-sm font-medium">Quick Actions</div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTab("matrix")}
            className="w-full justify-start"
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            View Matrix
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTab("templates")}
            className="w-full justify-start"
          >
            <File className="h-4 w-4 mr-2" />
            Manage Templates
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={refreshAllData}
            className="w-full justify-start"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Help Panel */}
      <div className="border rounded-lg p-6 bg-muted/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Permission Management Guide
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Permission Matrix</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Xem tất cả permissions theo role</li>
              <li>• Filter theo category và level</li>
              <li>• Click &quot;Edit&quot; để chỉnh sửa permissions</li>
              <li>• Theo dõi thống kê permissions</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Permission Templates</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Sử dụng default templates có sẵn</li>
              <li>• Tạo custom templates cho use cases đặc biệt</li>
              <li>• Apply templates cho roles phù hợp</li>
              <li>• Quản lý và xóa custom templates</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-4 border rounded bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 text-blue-800 font-medium">
            <Shield className="h-4 w-4" />
            Security Best Practices
          </div>
          <ul className="text-sm text-blue-700 mt-2 space-y-1">
            <li>• Luôn ghi lý do khi thay đổi permissions</li>
            <li>• Kiểm tra kỹ trước khi apply templates</li>
            <li>• Sử dụng principle of least privilege</li>
            <li>• Review permissions định kỳ</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
