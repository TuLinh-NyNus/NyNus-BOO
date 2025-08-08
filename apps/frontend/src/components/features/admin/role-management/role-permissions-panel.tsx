"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/navigation/tabs";
import {
  Settings,
  Shield,
  Users,
  Grid,
  FileText,
  GitBranch,
  RefreshCw,
  Download,
  Upload,
} from "lucide-react";

import { UserRole } from "@/lib/mockdata/core-types";
import { toast } from "@/hooks/use-toast";

// Import components
import { PermissionEditor } from "./permission-editor";
import { PermissionMatrix } from "./permission-matrix";
import { PermissionTemplates } from "./permission-templates";
import { RoleHierarchyTree } from "./role-hierarchy-tree";

// Import types
import { type RolePermission, type PermissionTemplate } from "@/lib/mockdata/role-management";

/**
 * Role Permissions Panel Props
 */
interface RolePermissionsPanelProps {
  className?: string;
}

/**
 * User role labels mapping
 */
const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.GUEST]: "Khách",
  [UserRole.STUDENT]: "Học viên",
  [UserRole.TUTOR]: "Trợ giảng",
  [UserRole.TEACHER]: "Giảng viên",
  [UserRole.ADMIN]: "Quản trị viên",
};

/**
 * Role colors
 */
const ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.GUEST]: "bg-gray-100 text-gray-800",
  [UserRole.STUDENT]: "bg-blue-100 text-blue-800",
  [UserRole.TUTOR]: "bg-green-100 text-green-800",
  [UserRole.TEACHER]: "bg-purple-100 text-purple-800",
  [UserRole.ADMIN]: "bg-red-100 text-red-800",
};

/**
 * Role Permissions Panel Component
 * Component chính để quản lý comprehensive role management panel
 */
export function RolePermissionsPanel({
  className = "",
}: RolePermissionsPanelProps) {
  // State management
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState("hierarchy");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  /**
   * Handle role selection
   */
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    // Switch to editor tab when role is selected
    if (activeTab === "hierarchy") {
      setActiveTab("editor");
    }
    
    toast({
      title: "Role selected",
      description: `Đã chọn role: ${USER_ROLE_LABELS[role]}`,
    });
  };

  /**
   * Handle permissions change
   */
  const handlePermissionsChange = (role: UserRole, permissions: RolePermission[]) => {
    toast({
      title: "Permissions updated",
      description: `Đã cập nhật ${permissions.length} permissions cho ${USER_ROLE_LABELS[role]}`,
    });
  };

  /**
   * Handle template apply
   */
  const handleTemplateApply = (template: PermissionTemplate, role: UserRole) => {
    toast({
      title: "Template applied",
      description: `Template "${template.name}" đã được apply cho ${USER_ROLE_LABELS[role]}`,
    });
    
    // Refresh data
    setLastRefresh(new Date());
  };

  /**
   * Handle global refresh
   */
  const handleGlobalRefresh = () => {
    setLastRefresh(new Date());
    toast({
      title: "Data refreshed",
      description: "Đã refresh tất cả dữ liệu role management",
    });
  };

  /**
   * Handle export all data
   */
  const handleExportAll = () => {
    // In real app, this would export comprehensive role data
    toast({
      title: "Export started",
      description: "Đang export tất cả dữ liệu role management...",
    });
  };

  /**
   * Handle import data
   */
  const handleImportData = () => {
    // In real app, this would open file picker for import
    toast({
      title: "Import feature",
      description: "Import functionality sẽ được implement trong version tiếp theo",
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Panel Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Role & Permissions Management
              </CardTitle>
              <CardDescription>
                Comprehensive role management panel với hierarchy, permissions, và templates
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleImportData}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportAll}>
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
              <Button variant="outline" size="sm" onClick={handleGlobalRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Selected Role Info */}
        {selectedRole && (
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 p-3 border rounded bg-muted/25">
              <Shield className="h-5 w-5" />
              <span className="font-medium">Selected Role:</span>
              <Badge className={ROLE_COLORS[selectedRole]}>
                {USER_ROLE_LABELS[selectedRole]}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRole(null)}
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hierarchy" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Hierarchy
          </TabsTrigger>
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="matrix" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            Matrix
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Role Hierarchy Tab */}
        <TabsContent value="hierarchy" className="space-y-4">
          <RoleHierarchyTree
            onRoleSelect={handleRoleSelect}
            selectedRole={selectedRole}
          />
        </TabsContent>

        {/* Permission Editor Tab */}
        <TabsContent value="editor" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Role Selection Sidebar */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Select Role
                </CardTitle>
                <CardDescription>
                  Chọn role để edit permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.values(UserRole).map((role) => (
                    <Button
                      key={role}
                      variant={selectedRole === role ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleRoleSelect(role)}
                    >
                      <Badge className={`mr-2 ${ROLE_COLORS[role]}`} variant="outline">
                        {USER_ROLE_LABELS[role]}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Permission Editor */}
            <div className="lg:col-span-2">
              <PermissionEditor
                selectedRole={selectedRole}
                onPermissionsChange={handlePermissionsChange}
              />
            </div>
          </div>
        </TabsContent>

        {/* Permission Matrix Tab */}
        <TabsContent value="matrix" className="space-y-4">
          <PermissionMatrix
            onRoleSelect={handleRoleSelect}
          />
        </TabsContent>

        {/* Permission Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <PermissionTemplates
            selectedRole={selectedRole}
            onTemplateApply={handleTemplateApply}
          />
        </TabsContent>
      </Tabs>

      {/* Panel Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Role Management Panel • Last refresh: {lastRefresh.toLocaleTimeString('vi-VN')}
            </div>
            <div className="flex items-center gap-4">
              <span>Active Role: {selectedRole ? USER_ROLE_LABELS[selectedRole] : 'None'}</span>
              <span>Current Tab: {activeTab}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
