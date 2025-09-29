"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Shield,
  Edit,
  AlertCircle,
  Settings,
  Users,
  FileText,
  Lock,
} from "lucide-react";
import { UserRole } from "@/lib/mockdata/core-types";

const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.GUEST]: "Khách",
  [UserRole.STUDENT]: "Học viên",
  [UserRole.TUTOR]: "Trợ giảng",
  [UserRole.TEACHER]: "Giảng viên",
  [UserRole.ADMIN]: "Quản trị viên",
};
import {
  mockPermissions,
  mockRoles,
  Permission
} from "@/lib/mockdata/admin";

/**
 * Interface cho permission matrix response
 * Interface for permission matrix response
 */
interface PermissionMatrixResponse {
  matrix: Record<UserRole, Permission[]>;
  categories: string[];
  levels: string[];
  timestamp: string;
}

/**
 * Interface cho permission matrix props
 * Interface for permission matrix props
 */
interface PermissionMatrixProps {
  onEditRole?: (role: UserRole) => void;
  className?: string;
}

/**
 * Permission Matrix Component
 * Component hiển thị permission matrix cho tất cả roles
 */
export function PermissionMatrix({ onEditRole, className = "" }: PermissionMatrixProps) {
  // State management
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrixResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  /**
   * Load permission matrix data from mockdata
   * Tải dữ liệu permission matrix từ mockdata
   */
  const loadPermissionMatrix = async () => {
    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Build matrix from mockdata
      const matrix: Record<UserRole, Permission[]> = {} as Record<UserRole, Permission[]>;
      
      mockRoles.forEach(role => {
        const rolePermissions = mockPermissions.filter(permission => 
          role.permissions.includes(permission.id)
        );
        matrix[role.name as UserRole] = rolePermissions;
      });

      const categories = Array.from(new Set(mockPermissions.map(p => p.category)));
      const levels = Array.from(new Set(mockPermissions.map(p => p.action)));

      setPermissionMatrix({
        matrix,
        categories,
        levels,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to load permission matrix:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get category icon
   * Lấy icon cho category
   */
  const getCategoryIcon = (category: string) => {
    const icons = {
      users: Users,
      content: FileText,
      system: Settings,
      security: Lock,
      analytics: Shield,
    };
    const IconComponent = icons[category as keyof typeof icons] || Shield;
    return <IconComponent className="h-4 w-4" />;
  };

  /**
   * Get level badge color
   * Lấy màu badge cho level
   */
  const getLevelBadgeColor = (
    level: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    const colorMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      read: "outline",
      create: "secondary",
      update: "secondary", 
      delete: "destructive",
      manage: "default",
    };
    return colorMap[level] || "outline";
  };

  /**
   * Get role badge color
   * Lấy màu badge cho role
   */
  const getRoleBadgeColor = (
    role: UserRole
  ): "default" | "secondary" | "destructive" | "outline" => {
    const colorMap: Record<UserRole, "default" | "secondary" | "destructive" | "outline"> = {
      GUEST: "outline",
      STUDENT: "secondary",
      TUTOR: "default",
      TEACHER: "default",
      ADMIN: "destructive",
    };
    return colorMap[role] || "default";
  };

  /**
   * Filter permissions based on selected category and level
   * Lọc permissions theo category và level đã chọn
   */
  const filterPermissions = (permissions: Permission[]): Permission[] => {
    return permissions.filter((permission) => {
      const categoryMatch = selectedCategory === "all" || permission.category === selectedCategory;
      const levelMatch = selectedLevel === "all" || permission.action === selectedLevel;
      return categoryMatch && levelMatch;
    });
  };

  /**
   * Get permissions count by category for a role
   * Lấy số lượng permissions theo category cho role
   */
  const getPermissionCountByCategory = (
    permissions: Permission[],
    category: string
  ): number => {
    return permissions.filter((p) => p.category === category).length;
  };

  /**
   * Check if role has permission
   * Kiểm tra role có permission không
   */
  // const hasPermission = (rolePermissions: Permission[], permissionId: string): boolean => {
  //   return rolePermissions.some((p) => p.id === permissionId);
  // };

  // Effects
  useEffect(() => {
    loadPermissionMatrix();
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải permission matrix...</span>
      </div>
    );
  }

  if (!permissionMatrix) {
    return (
      <div className={`flex items-center justify-center p-8 text-red-600 ${className}`}>
        <AlertCircle className="h-4 w-4 mr-2" />
        <span>Không thể tải permission matrix. Vui lòng thử lại.</span>
      </div>
    );
  }

  const roles = Object.keys(permissionMatrix.matrix) as UserRole[];
  const categories = permissionMatrix.categories;
  const levels = permissionMatrix.levels;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Permission Matrix
          </h2>
          <p className="text-muted-foreground">Quản lý permissions cho từng role trong hệ thống</p>
        </div>
        <Button onClick={loadPermissionMatrix} variant="outline">
          <Loader2 className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1 border rounded text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Level:</span>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-1 border rounded text-sm"
          >
            <option value="all">All Levels</option>
            {levels.map((level) => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-sm text-muted-foreground">
          Last updated: {new Date(permissionMatrix.timestamp).toLocaleString()}
        </div>
      </div>

      {/* Permission Matrix Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="w-[120px]">Total</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => {
              const rolePermissions = permissionMatrix.matrix[role];
              const filteredPermissions = filterPermissions(rolePermissions);

              return (
                <TableRow key={role}>
                  <TableCell>
                    <div className="space-y-2">
                      <Badge variant={getRoleBadgeColor(role)}>{USER_ROLE_LABELS[role]}</Badge>

                      {/* Category breakdown */}
                      <div className="flex flex-wrap gap-1">
                        {categories.map((category) => {
                          const count = getPermissionCountByCategory(rolePermissions, category);
                          if (count === 0) return null;

                          return (
                            <div key={category} className="flex items-center gap-1 text-xs">
                              {getCategoryIcon(category)}
                              <span>{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-2">
                      {filteredPermissions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {filteredPermissions.slice(0, 5).map((permission) => (
                            <Badge
                              key={permission.id}
                              variant={getLevelBadgeColor(permission.action)}
                              className="text-xs"
                              title={permission.description}
                            >
                              {getCategoryIcon(permission.category)}
                              <span className="ml-1">{permission.name}</span>
                            </Badge>
                          ))}
                          {filteredPermissions.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{filteredPermissions.length - 5} more
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          No permissions match current filters
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{rolePermissions.length}</div>
                      <div className="text-xs text-muted-foreground">permissions</div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditRole?.(role)}
                        title="Edit permissions"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg text-center">
          <div className="text-2xl font-bold">{roles.length}</div>
          <div className="text-sm text-muted-foreground">Total Roles</div>
        </div>

        <div className="p-4 border rounded-lg text-center">
          <div className="text-2xl font-bold">{categories.length}</div>
          <div className="text-sm text-muted-foreground">Categories</div>
        </div>

        <div className="p-4 border rounded-lg text-center">
          <div className="text-2xl font-bold">{levels.length}</div>
          <div className="text-sm text-muted-foreground">Permission Levels</div>
        </div>

        <div className="p-4 border rounded-lg text-center">
          <div className="text-2xl font-bold">
            {Object.values(permissionMatrix.matrix).reduce(
              (total, permissions) => total + permissions.length,
              0
            )}
          </div>
          <div className="text-sm text-muted-foreground">Total Permissions</div>
        </div>
      </div>
    </div>
  );
}
