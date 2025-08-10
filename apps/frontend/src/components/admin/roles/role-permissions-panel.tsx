/**
 * Role Permissions Panel Component
 * Component hiển thị chi tiết permissions cho role
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  ChevronDown,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Settings,
  User,
  FileText,
  Server,
  Lock,
  Crown,
  Info,
} from "lucide-react";

import {
  RolePermission,
  getPermissionsByCategory,
  ROLE_RESTRICTIONS,
  getPromotionPaths,
} from "../../../lib/role-hierarchy";
import { UserRole, USER_ROLE_LABELS, USER_ROLE_COLORS } from "../../../types/admin-user";

/**
 * Role Permissions Panel Props
 * Props cho Role Permissions Panel component
 */
interface RolePermissionsPanelProps {
  selectedRole?: UserRole;
  compareWithRole?: UserRole;
  className?: string;
}

/**
 * Get category icon
 * Lấy icon cho permission category
 */
function getCategoryIcon(category: string) {
  switch (category) {
    case "user":
      return <User className="h-4 w-4" />;
    case "content":
      return <FileText className="h-4 w-4" />;
    case "system":
      return <Server className="h-4 w-4" />;
    case "security":
      return <Lock className="h-4 w-4" />;
    case "admin":
      return <Crown className="h-4 w-4" />;
    default:
      return <Shield className="h-4 w-4" />;
  }
}

/**
 * Get permission level icon
 * Lấy icon cho permission level
 */
function getPermissionLevelIcon(level: string) {
  switch (level) {
    case "read":
      return <Eye className="h-3 w-3" />;
    case "write":
      return <Edit className="h-3 w-3" />;
    case "delete":
      return <Trash2 className="h-3 w-3" />;
    case "admin":
      return <Settings className="h-3 w-3" />;
    default:
      return <Shield className="h-3 w-3" />;
  }
}

/**
 * Get permission level color
 * Lấy màu cho permission level
 */
function getPermissionLevelColor(level: string): string {
  switch (level) {
    case "read":
      return "text-blue-600";
    case "write":
      return "text-green-600";
    case "delete":
      return "text-red-600";
    case "admin":
      return "text-purple-600";
    default:
      return "text-gray-600";
  }
}

/**
 * Permission Category Section Component
 * Component hiển thị permissions theo category
 */
interface PermissionCategorySectionProps {
  category: string;
  permissions: RolePermission[];
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function PermissionCategorySection({
  category,
  permissions,
  isExpanded,
  onToggleExpand,
}: PermissionCategorySectionProps) {
  const categoryLabels = {
    user: "Quản lý người dùng",
    content: "Quản lý nội dung",
    system: "Hệ thống",
    security: "Bảo mật",
    admin: "Quản trị",
  };

  const categoryLabel = categoryLabels[category as keyof typeof categoryLabels] || category;

  return (
    <div className="border rounded-lg">
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-2">
          {getCategoryIcon(category)}
          <span className="font-medium">{categoryLabel}</span>
          <Badge variant="outline" className="text-xs">
            {permissions.length} quyền
          </Badge>
        </div>
        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </div>

      {isExpanded && (
        <div className="border-t bg-muted/20">
          <div className="p-3 space-y-2">
            {permissions.map((permission) => (
              <div
                key={permission.id}
                className="flex items-start gap-3 p-2 bg-background rounded border"
              >
                <div className={`p-1 rounded ${getPermissionLevelColor(permission.level)}`}>
                  {getPermissionLevelIcon(permission.level)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{permission.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getPermissionLevelColor(permission.level)}`}
                    >
                      {permission.level}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{permission.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Role Permissions Panel Component
 * Component panel permissions cho role
 */
export function RolePermissionsPanel({
  selectedRole,
  className = "",
}: RolePermissionsPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["user", "content"])
  );

  /**
   * Handle toggle category expand
   * Xử lý mở rộng/thu gọn category
   */
  const handleToggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  /**
   * Expand all categories
   * Mở rộng tất cả categories
   */
  const expandAll = () => {
    const allCategories = ["user", "content", "system", "security", "admin"];
    setExpandedCategories(new Set(allCategories));
  };

  /**
   * Collapse all categories
   * Thu gọn tất cả categories
   */
  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  if (!selectedRole) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chọn một vai trò để xem chi tiết quyền hạn</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const permissionsByCategory = getPermissionsByCategory(selectedRole);
  const roleRestrictions = ROLE_RESTRICTIONS[selectedRole];
  const promotionPaths = getPromotionPaths(selectedRole);
  const roleColor = USER_ROLE_COLORS[selectedRole];
  const roleLabel = USER_ROLE_LABELS[selectedRole];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quyền hạn vai trò
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              Mở rộng tất cả
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Thu gọn
            </Button>
          </div>
        </div>

        {/* Selected Role Info */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <div className="p-2 rounded-full" style={{ backgroundColor: `${roleColor}20` }}>
            <Shield className="h-4 w-4" style={{ color: roleColor }} />
          </div>
          <div>
            <h3 className="font-semibold">{roleLabel}</h3>
            <p className="text-sm text-muted-foreground">
              {Object.values(permissionsByCategory).flat().length} quyền hạn
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Permissions by Category */}
        <div className="space-y-3">
          {Object.entries(permissionsByCategory).map(([category, permissions]) => (
            <PermissionCategorySection
              key={category}
              category={category}
              permissions={permissions}
              isExpanded={expandedCategories.has(category)}
              onToggleExpand={() => handleToggleCategory(category)}
            />
          ))}
        </div>

        {/* Role Restrictions */}
        {roleRestrictions.length > 0 && (
          <div className="border rounded-lg p-3 bg-red-50/50 border-red-200">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-red-700">
              <Info className="h-4 w-4" />
              Hạn chế vai trò
            </h4>
            <ul className="space-y-1">
              {roleRestrictions.map((restriction, index) => (
                <li key={index} className="text-xs text-red-600 flex items-start gap-2">
                  <span className="w-1 h-1 bg-red-600 rounded-full mt-1.5 flex-shrink-0" />
                  {restriction}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Promotion Paths */}
        {promotionPaths.length > 0 && (
          <div className="border rounded-lg p-3 bg-green-50/50 border-green-200">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-green-700">
              <Info className="h-4 w-4" />
              Đường dẫn thăng tiến
            </h4>
            <div className="flex flex-wrap gap-2">
              {promotionPaths.map((targetRole) => (
                <Badge
                  key={targetRole}
                  variant="outline"
                  className="text-xs border-green-300 text-green-700"
                >
                  {USER_ROLE_LABELS[targetRole]}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Permission Summary */}
        <div className="border rounded-lg p-3 bg-blue-50/50 border-blue-200">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-blue-700">
            <Info className="h-4 w-4" />
            Tóm tắt quyền hạn
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(permissionsByCategory).map(([category, permissions]) => (
              <div key={category} className="flex justify-between">
                <span className="text-blue-600 capitalize">{category}:</span>
                <span className="font-medium text-blue-700">{permissions.length} quyền</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
