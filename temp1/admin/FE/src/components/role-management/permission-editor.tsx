"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/forms/dialog";
import { Button } from "@/components/ui/forms/button";
import { Label } from "@/components/ui/forms/label";
import { Textarea } from "@/components/ui/forms/textarea";
import { Badge } from "@/components/ui/data-display/badge";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import {
  Loader2,
  Save,
  X,
  Plus,
  Minus,
  Shield,
  Users,
  FileText,
  Settings,
  Lock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { UserRole, USER_ROLE_LABELS } from "@/types/admin-user";
import { toast } from "sonner";

/**
 * Interface cho role permission
 */
interface RolePermission {
  id: string;
  name: string;
  description: string;
  category: "user" | "content" | "system" | "security" | "admin";
  level: "read" | "write" | "delete" | "admin";
}

/**
 * Interface cho permission editor props
 */
interface PermissionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole | null;
  onSuccess: () => void;
}

/**
 * Permission Editor Component
 * Component để edit permissions cho specific role
 */
export function PermissionEditor({ isOpen, onClose, role, onSuccess }: PermissionEditorProps) {
  // State management
  const [currentPermissions, setCurrentPermissions] = useState<RolePermission[]>([]);
  const [editedPermissions, setEditedPermissions] = useState<RolePermission[]>([]);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  /**
   * Load current permissions for role
   */
  const loadRolePermissions = async () => {
    if (!role) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/v1/admin/roles/${role}/permissions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const permissions = await response.json();
        setCurrentPermissions(permissions);
        setEditedPermissions([...permissions]);
      } else {
        toast.error("Không thể tải permissions cho role");
      }
    } catch (error) {
      console.error("Failed to load role permissions:", error);
      toast.error("Lỗi khi tải permissions");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get category icon
   */
  const getCategoryIcon = (category: string) => {
    const icons = {
      user: Users,
      content: FileText,
      system: Settings,
      security: Lock,
      admin: Shield,
    };
    const IconComponent = icons[category as keyof typeof icons] || Shield;
    return <IconComponent className="h-4 w-4" />;
  };

  /**
   * Get level badge color
   */
  const getLevelBadgeColor = (
    level: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    const colorMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      read: "outline",
      write: "secondary",
      delete: "destructive",
      admin: "default",
    };
    return colorMap[level] || "outline";
  };

  /**
   * Toggle permission
   */
  const togglePermission = (permission: RolePermission) => {
    const exists = editedPermissions.some((p) => p.id === permission.id);

    if (exists) {
      // Remove permission
      setEditedPermissions((prev) => prev.filter((p) => p.id !== permission.id));
    } else {
      // Add permission
      setEditedPermissions((prev) => [...prev, permission]);
    }
  };

  /**
   * Check if permission is selected
   */
  const isPermissionSelected = (permissionId: string): boolean => {
    return editedPermissions.some((p) => p.id === permissionId);
  };

  /**
   * Get available permissions (all possible permissions)
   */
  const getAvailablePermissions = (): RolePermission[] => {
    // This would typically come from an API endpoint
    // For now, we'll use a predefined list
    return [
      // User permissions
      {
        id: "view_profile",
        name: "Xem hồ sơ",
        description: "Có thể xem hồ sơ cá nhân",
        category: "user",
        level: "read",
      },
      {
        id: "edit_profile",
        name: "Chỉnh sửa hồ sơ",
        description: "Có thể chỉnh sửa thông tin cá nhân",
        category: "user",
        level: "write",
      },
      {
        id: "view_students",
        name: "Xem học viên",
        description: "Có thể xem danh sách học viên",
        category: "user",
        level: "read",
      },
      {
        id: "manage_students",
        name: "Quản lý học viên",
        description: "Có thể quản lý học viên",
        category: "user",
        level: "write",
      },
      {
        id: "manage_users",
        name: "Quản lý người dùng",
        description: "Có thể tạo, sửa, xóa tài khoản người dùng",
        category: "user",
        level: "admin",
      },

      // Content permissions
      {
        id: "view_public_content",
        name: "Xem nội dung công khai",
        description: "Có thể xem các khóa học và tài liệu công khai",
        category: "content",
        level: "read",
      },
      {
        id: "access_courses",
        name: "Truy cập khóa học",
        description: "Có thể truy cập và học các khóa học",
        category: "content",
        level: "read",
      },
      {
        id: "create_courses",
        name: "Tạo khóa học",
        description: "Có thể tạo và quản lý khóa học",
        category: "content",
        level: "write",
      },
      {
        id: "create_content",
        name: "Tạo nội dung",
        description: "Có thể tạo bài giảng, tài liệu",
        category: "content",
        level: "write",
      },
      {
        id: "full_content_access",
        name: "Truy cập toàn bộ nội dung",
        description: "Có quyền truy cập tất cả nội dung",
        category: "content",
        level: "admin",
      },

      // System permissions
      {
        id: "basic_system_access",
        name: "Truy cập cơ bản",
        description: "Có thể sử dụng các tính năng cơ bản của hệ thống",
        category: "system",
        level: "read",
      },
      {
        id: "advanced_system_access",
        name: "Truy cập nâng cao",
        description: "Có thể sử dụng các tính năng nâng cao",
        category: "system",
        level: "write",
      },
      {
        id: "system_configuration",
        name: "Cấu hình hệ thống",
        description: "Có thể thay đổi cấu hình hệ thống",
        category: "system",
        level: "admin",
      },

      // Security permissions
      {
        id: "manage_roles",
        name: "Quản lý vai trò",
        description: "Có thể thay đổi vai trò của người dùng",
        category: "security",
        level: "admin",
      },
      {
        id: "security_management",
        name: "Quản lý bảo mật",
        description: "Có thể quản lý các cài đặt bảo mật",
        category: "security",
        level: "admin",
      },

      // Admin permissions
      {
        id: "full_system_access",
        name: "Truy cập toàn hệ thống",
        description: "Có quyền truy cập và quản lý toàn bộ hệ thống",
        category: "admin",
        level: "admin",
      },
    ];
  };

  /**
   * Group permissions by category
   */
  const groupPermissionsByCategory = (permissions: RolePermission[]) => {
    return permissions.reduce(
      (groups, permission) => {
        const category = permission.category;
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(permission);
        return groups;
      },
      {} as Record<string, RolePermission[]>
    );
  };

  /**
   * Save permission changes
   */
  const savePermissions = async () => {
    if (!role) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/v1/admin/roles/${role}/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          role,
          permissions: editedPermissions,
          reason: reason.trim() || undefined,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || "Permissions updated successfully");
        onSuccess();
        onClose();
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.message || "Không thể cập nhật permissions");
      }
    } catch (error) {
      console.error("Failed to save permissions:", error);
      toast.error("Lỗi khi lưu permissions");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Reset form
   */
  const resetForm = () => {
    setCurrentPermissions([]);
    setEditedPermissions([]);
    setReason("");
    setHasChanges(false);
  };

  /**
   * Check for changes
   */
  const checkForChanges = () => {
    const currentIds = new Set(currentPermissions.map((p) => p.id));
    const editedIds = new Set(editedPermissions.map((p) => p.id));

    const hasChanges =
      currentIds.size !== editedIds.size ||
      [...currentIds].some((id) => !editedIds.has(id)) ||
      [...editedIds].some((id) => !currentIds.has(id));

    setHasChanges(hasChanges);
  };

  // Effects
  useEffect(() => {
    if (isOpen && role) {
      loadRolePermissions();
    } else {
      resetForm();
    }
  }, [isOpen, role]);

  useEffect(() => {
    checkForChanges();
  }, [currentPermissions, editedPermissions]);

  if (!role) return null;

  const availablePermissions = getAvailablePermissions();
  const groupedPermissions = groupPermissionsByCategory(availablePermissions);
  const categories = Object.keys(groupedPermissions);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Edit Permissions - {USER_ROLE_LABELS[role]}
          </DialogTitle>
          <DialogDescription>
            Chỉnh sửa permissions cho role {USER_ROLE_LABELS[role]}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Đang tải permissions...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current vs New Permissions Summary */}
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
              <div>
                <div className="text-sm font-medium">Current Permissions</div>
                <div className="text-2xl font-bold">{currentPermissions.length}</div>
              </div>
              <div>
                <div className="text-sm font-medium">New Permissions</div>
                <div className="text-2xl font-bold">{editedPermissions.length}</div>
                {hasChanges && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {editedPermissions.length - currentPermissions.length > 0 ? "+" : ""}
                    {editedPermissions.length - currentPermissions.length} changes
                  </Badge>
                )}
              </div>
            </div>

            {/* Permission Categories */}
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {getCategoryIcon(category)}
                    <h3 className="font-semibold capitalize">{category} Permissions</h3>
                    <Badge variant="outline" className="text-xs">
                      {
                        groupedPermissions[category].filter((p) => isPermissionSelected(p.id))
                          .length
                      }
                      /{groupedPermissions[category].length}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {groupedPermissions[category].map((permission) => (
                      <div
                        key={permission.id}
                        className={`flex items-center justify-between p-3 border rounded cursor-pointer transition-colors ${
                          isPermissionSelected(permission.id)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => togglePermission(permission)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{permission.name}</span>
                            <Badge
                              variant={getLevelBadgeColor(permission.level)}
                              className="text-xs"
                            >
                              {permission.level}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {permission.description}
                          </p>
                        </div>

                        <div className="ml-4">
                          {isPermissionSelected(permission.id) ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Reason */}
            <div>
              <Label htmlFor="reason">Lý do thay đổi</Label>
              <Textarea
                id="reason"
                placeholder="Nhập lý do thay đổi permissions..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Changes Warning */}
            {hasChanges && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Bạn có {Math.abs(editedPermissions.length - currentPermissions.length)} thay đổi
                  chưa lưu. Nhấn "Save Changes" để áp dụng các thay đổi.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={savePermissions}
            disabled={!hasChanges || isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
