/**
 * Permission Editor Component
 * Component chỉnh sửa permissions cho role
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Shield,
  Save,
  X,
  Users,
  FileText,
  Settings,
  Lock,
  Crown,
} from "lucide-react";

import { UserRole, USER_ROLE_LABELS } from "../../../types/admin-user";
import {
  mockPermissions,
  mockRoles,
  Permission
} from "@/lib/mockdata/admin";

/**
 * Permission Editor Props
 * Props cho Permission Editor component
 */
interface PermissionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole | null;
  onSuccess?: () => void;
}

/**
 * Get category icon
 * Lấy icon cho category
 */
function getCategoryIcon(category: string) {
  switch (category) {
    case "users":
      return <Users className="h-4 w-4" />;
    case "content":
      return <FileText className="h-4 w-4" />;
    case "system":
      return <Settings className="h-4 w-4" />;
    case "security":
      return <Lock className="h-4 w-4" />;
    case "analytics":
      return <Crown className="h-4 w-4" />;
    default:
      return <Shield className="h-4 w-4" />;
  }
}

/**
 * Permission Editor Component
 * Component chỉnh sửa permissions cho role
 */
export function PermissionEditor({ isOpen, onClose, role, onSuccess }: PermissionEditorProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Load current role permissions
   * Tải permissions hiện tại của role
   */
  useEffect(() => {
    if (role && isOpen) {
      const currentRole = mockRoles.find(r => r.name === role);
      if (currentRole) {
        setSelectedPermissions(new Set(currentRole.permissions));
      }
    }
  }, [role, isOpen]);

  /**
   * Handle permission toggle
   * Xử lý bật/tắt permission
   */
  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  /**
   * Handle save permissions
   * Xử lý lưu permissions
   */
  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, would call API to update role permissions
      console.log(`Updating permissions for role ${role}:`, Array.from(selectedPermissions));
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to save permissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Group permissions by category
   * Nhóm permissions theo category
   */
  const permissionsByCategory = mockPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (!role) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Chỉnh sửa quyền hạn - {USER_ROLE_LABELS[role]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Role Info */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-2">Thông tin vai trò</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{USER_ROLE_LABELS[role]}</Badge>
              <span className="text-sm text-muted-foreground">
                {selectedPermissions.size} quyền được chọn
              </span>
            </div>
          </div>

          {/* Permissions by Category */}
          <div className="space-y-4">
            {Object.entries(permissionsByCategory).map(([category, permissions]) => (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getCategoryIcon(category)}
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                    <Badge variant="outline" className="ml-auto">
                      {permissions.filter(p => selectedPermissions.has(p.id)).length} / {permissions.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        <Switch
                          checked={selectedPermissions.has(permission.id)}
                          onCheckedChange={() => handlePermissionToggle(permission.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{permission.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {permission.action}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
