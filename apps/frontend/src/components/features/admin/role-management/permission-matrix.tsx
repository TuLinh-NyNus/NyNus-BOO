"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/display/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/form/select";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import {
  Grid,
  Search,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

import { UserRole } from "@/lib/mockdata/core-types";
import { toast } from "@/hooks/use-toast";

// Import mockdata functions
import {
  getPermissionMatrix,
  type PermissionMatrixResponse,
  mockPermissionCategories,
  mockPermissionLevels,
} from "@/lib/mockdata/role-management";

/**
 * Permission Matrix Props
 */
interface PermissionMatrixProps {
  onRoleSelect?: (role: UserRole) => void;
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
  read: "bg-blue-100 text-blue-800",
  write: "bg-green-100 text-green-800",
  delete: "bg-orange-100 text-orange-800",
  admin: "bg-red-100 text-red-800",
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
 * Permission Matrix Component
 * Component hiển thị matrix permissions across roles và resources
 */
export function PermissionMatrix({
  onRoleSelect,
  className = "",
}: PermissionMatrixProps) {
  // State management
  const [matrixData, setMatrixData] = useState<PermissionMatrixResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"compact" | "detailed">("compact");

  /**
   * Load permission matrix data
   */
  const loadPermissionMatrix = async () => {
    setIsLoading(true);
    try {
      const data = await getPermissionMatrix();
      setMatrixData(data);
    } catch (error) {
      console.error("Error loading permission matrix:", error);
      toast({
        title: "Lỗi tải permission matrix",
        description: "Không thể tải dữ liệu permission matrix",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load data on mount
   */
  useEffect(() => {
    loadPermissionMatrix();
  }, []);

  /**
   * Get filtered permissions
   */
  const getFilteredPermissions = () => {
    if (!matrixData) return [];

    const allPermissions = Object.values(matrixData.matrix).flat();
    const uniquePermissions = allPermissions.filter((permission, index, self) =>
      index === self.findIndex(p => p.id === permission.id)
    );

    return uniquePermissions.filter(permission => {
      const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permission.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || permission.category === selectedCategory;
      const matchesLevel = selectedLevel === "all" || permission.level === selectedLevel;
      
      return matchesSearch && matchesCategory && matchesLevel;
    });
  };

  /**
   * Check if role has permission
   */
  const hasPermission = (role: UserRole, permissionId: string): boolean => {
    if (!matrixData) return false;
    return matrixData.matrix[role]?.some(p => p.id === permissionId) || false;
  };

  /**
   * Get permission level for role
   */
  const getPermissionLevel = (role: UserRole, permissionId: string): string | null => {
    if (!matrixData) return null;
    const permission = matrixData.matrix[role]?.find(p => p.id === permissionId);
    return permission?.level || null;
  };

  /**
   * Handle export matrix
   */
  const handleExportMatrix = () => {
    if (!matrixData) return;

    const csvData = [];
    const roles = Object.values(UserRole);
    const permissions = getFilteredPermissions();

    // Header row
    csvData.push(['Permission', ...roles.map(role => USER_ROLE_LABELS[role])]);

    // Data rows
    permissions.forEach(permission => {
      const row = [permission.name];
      roles.forEach(role => {
        const level = getPermissionLevel(role, permission.id);
        row.push(level || 'No');
      });
      csvData.push(row);
    });

    // Create and download CSV
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'permission-matrix.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export thành công",
      description: "Permission matrix đã được export thành file CSV",
    });
  };

  /**
   * Get role permission summary
   */
  const getRolePermissionSummary = (role: UserRole) => {
    if (!matrixData) return { total: 0, byLevel: {} };

    const permissions = matrixData.matrix[role] || [];
    const byLevel = permissions.reduce((acc, perm) => {
      acc[perm.level] = (acc[perm.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: permissions.length,
      byLevel,
    };
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            <p className="text-muted-foreground">Đang tải permission matrix...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!matrixData) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-muted-foreground">Không thể tải permission matrix</p>
            <Button onClick={loadPermissionMatrix} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredPermissions = getFilteredPermissions();
  const roles = Object.values(UserRole);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Grid className="h-5 w-5" />
              Permission Matrix
            </CardTitle>
            <CardDescription>
              Matrix view của permissions across roles và resources
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadPermissionMatrix}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExportMatrix}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
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

          <div>
            <Label htmlFor="view-mode">View Mode</Label>
            <Select value={viewMode} onValueChange={(value: "compact" | "detailed") => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Role Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {roles.map(role => {
            const summary = getRolePermissionSummary(role);
            return (
              <div 
                key={role} 
                className="text-center p-3 border rounded cursor-pointer hover:bg-muted/25 transition-colors"
                onClick={() => onRoleSelect?.(role)}
              >
                <Badge className={ROLE_COLORS[role]} variant="outline">
                  {USER_ROLE_LABELS[role]}
                </Badge>
                <div className="text-lg font-bold mt-1">{summary.total}</div>
                <div className="text-sm text-muted-foreground">permissions</div>
              </div>
            );
          })}
        </div>

        {/* Permission Matrix Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-64">Permission</TableHead>
                  {roles.map(role => (
                    <TableHead key={role} className="text-center min-w-24">
                      <Badge className={ROLE_COLORS[role]} variant="outline">
                        {USER_ROLE_LABELS[role]}
                      </Badge>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.map(permission => (
                  <TableRow key={permission.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{permission.name}</div>
                        {viewMode === "detailed" && (
                          <div className="text-sm text-muted-foreground">
                            {permission.description}
                          </div>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {permission.category}
                          </Badge>
                          <Badge 
                            className={`text-xs ${PERMISSION_LEVEL_COLORS[permission.level]}`}
                          >
                            {permission.level}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    {roles.map(role => {
                      const hasAccess = hasPermission(role, permission.id);
                      const level = getPermissionLevel(role, permission.id);
                      
                      return (
                        <TableCell key={role} className="text-center">
                          {hasAccess ? (
                            <div className="flex flex-col items-center">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              {viewMode === "detailed" && level && (
                                <Badge className={`text-xs mt-1 ${PERMISSION_LEVEL_COLORS[level]}`}>
                                  {level}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-300" />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Matrix Statistics */}
        <div className="text-sm text-muted-foreground">
          Hiển thị {filteredPermissions.length} permissions • 
          Cập nhật lần cuối: {new Date(matrixData.timestamp).toLocaleString('vi-VN')}
        </div>
      </CardContent>
    </Card>
  );
}
