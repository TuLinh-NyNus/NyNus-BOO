"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/form/select";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import {
  Save,
  Shield,
  AlertTriangle,
  CheckCircle,
  X,
  Search,
} from "lucide-react";

import { UserRole } from "@/lib/mockdata/core-types";
import { toast } from "@/hooks/use-toast";

// Import mockdata functions
import {
  getRolePermissions,
  updateRolePermissions,
  type RolePermission,
  mockPermissionCategories,
  mockPermissionLevels,
} from "@/lib/mockdata/role-management";

/**
 * Permission Editor Props
 */
interface PermissionEditorProps {
  selectedRole: UserRole | null;
  onPermissionsChange?: (role: UserRole, permissions: RolePermission[]) => void;
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
 * Permission level colors
 */
const PERMISSION_LEVEL_COLORS: Record<string, string> = {
  read: "bg-primary text-primary-foreground",
  write: "bg-badge-success text-badge-success-foreground",
  delete: "bg-badge-warning text-badge-warning-foreground",
  admin: "bg-destructive text-destructive-foreground",
};

/**
 * Permission category colors
 */
const PERMISSION_CATEGORY_COLORS: Record<string, string> = {
  user: "bg-accent text-accent-foreground",
  content: "bg-primary text-primary-foreground",
  system: "bg-badge-warning text-badge-warning-foreground",
  security: "bg-destructive text-destructive-foreground",
  admin: "bg-secondary text-secondary-foreground",
};

/**
 * Permission Editor Component
 * Component để edit permissions cho từng role cụ thể
 */
export function PermissionEditor({
  selectedRole,
  onPermissionsChange,
  className = "",
}: PermissionEditorProps) {
  // State management
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  // const [editingPermission, setEditingPermission] = useState<RolePermission | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  /**
   * Load permissions for selected role
   */
  const loadPermissions = useCallback(async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    try {
      const rolePermissions = await getRolePermissions(selectedRole);
      setPermissions(rolePermissions);
      setHasChanges(false);
    } catch (error) {
      console.error("Error loading permissions:", error);
      toast({
        title: "Lỗi tải permissions",
        description: "Không thể tải danh sách permissions cho role này",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedRole]);

  /**
   * Load permissions when role changes
   */
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  /**
   * Handle permission toggle
   */
  const handlePermissionToggle = (permission: RolePermission) => {
    const updatedPermissions = permissions.some(p => p.id === permission.id)
      ? permissions.filter(p => p.id !== permission.id)
      : [...permissions, permission];
    
    setPermissions(updatedPermissions);
    setHasChanges(true);
    
    if (onPermissionsChange && selectedRole) {
      onPermissionsChange(selectedRole, updatedPermissions);
    }
  };

  /**
   * Handle save permissions
   */
  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    const reason = prompt("Nhập lý do thay đổi permissions:");
    if (!reason) return;

    setIsSaving(true);
    try {
      await updateRolePermissions(selectedRole, permissions);
      setHasChanges(false);
      
      toast({
        title: "Cập nhật permissions thành công",
        description: `Đã cập nhật permissions cho role ${USER_ROLE_LABELS[selectedRole]}`,
      });
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast({
        title: "Lỗi cập nhật permissions",
        description: "Không thể cập nhật permissions. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle reset permissions
   */
  const handleResetPermissions = () => {
    if (confirm("Bạn có chắc chắn muốn reset về permissions ban đầu?")) {
      loadPermissions();
    }
  };

  /**
   * Filter permissions based on search and filters
   */
  const getFilteredPermissions = () => {
    const allPermissions = [...mockPermissionCategories.flatMap(cat => cat.permissions)];
    
    // Add current role permissions that might not be in categories
    permissions.forEach(perm => {
      if (!allPermissions.some(p => p.id === perm.id)) {
        allPermissions.push(perm);
      }
    });

    return allPermissions.filter(permission => {
      const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permission.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || permission.category === selectedCategory;
      const matchesLevel = selectedLevel === "all" || permission.level === selectedLevel;
      
      return matchesSearch && matchesCategory && matchesLevel;
    });
  };

  /**
   * Check if permission is enabled
   */
  const isPermissionEnabled = (permission: RolePermission) => {
    return permissions.some(p => p.id === permission.id);
  };

  /**
   * Get permission count by category
   */
  const getPermissionCountByCategory = () => {
    const counts: Record<string, { total: number; enabled: number }> = {};
    
    mockPermissionCategories.forEach(category => {
      const categoryPermissions = getFilteredPermissions().filter(p => p.category === category.id);
      const enabledCount = categoryPermissions.filter(p => isPermissionEnabled(p)).length;
      
      counts[category.id] = {
        total: categoryPermissions.length,
        enabled: enabledCount,
      };
    });
    
    return counts;
  };

  if (!selectedRole) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Chọn một role để edit permissions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredPermissions = getFilteredPermissions();
  const permissionCounts = getPermissionCountByCategory();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permission Editor
            </CardTitle>
            <CardDescription>
              Edit permissions cho role: {USER_ROLE_LABELS[selectedRole]}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Button variant="outline" onClick={handleResetPermissions}>
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
            <Button 
              onClick={handleSavePermissions}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <Label htmlFor="search">Search Permissions</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Tìm kiếm permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả categories</SelectItem>
                {mockPermissionCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="level">Level</Label>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {mockPermissionLevels.map(level => (
                  <SelectItem key={level.id} value={level.id.replace('level-', '')}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Permission Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {mockPermissionCategories.map(category => {
            const count = permissionCounts[category.id];
            return (
              <div key={category.id} className="text-center p-3 border rounded">
                <div className="text-lg font-bold">
                  {count?.enabled || 0}/{count?.total || 0}
                </div>
                <div className="text-sm text-muted-foreground">{category.name}</div>
              </div>
            );
          })}
        </div>

        {/* Permissions List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            <span className="ml-2">Đang tải permissions...</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredPermissions.map((permission) => {
              const isEnabled = isPermissionEnabled(permission);
              
              return (
                <div
                  key={permission.id}
                  className={`flex items-center justify-between p-3 border rounded cursor-pointer transition-colors ${
                    isEnabled ? 'bg-badge-success/10 border-badge-success/20' : 'hover:bg-muted/25'
                  }`}
                  onClick={() => handlePermissionToggle(permission)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center">
                      {isEnabled ? (
                        <CheckCircle className="h-5 w-5 text-badge-success-foreground" />
                      ) : (
                        <div className="h-5 w-5 border-2 border-border rounded-full" />
                      )}
                    </div>
                    
                    <div>
                      <div className="font-medium">{permission.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {permission.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={PERMISSION_CATEGORY_COLORS[permission.category]}>
                      {permission.category}
                    </Badge>
                    <Badge className={PERMISSION_LEVEL_COLORS[permission.level]}>
                      {permission.level}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Changes Warning */}
        {hasChanges && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Bạn có thay đổi chưa được lưu. Nhớ click &quot;Save Changes&quot; để lưu lại.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
