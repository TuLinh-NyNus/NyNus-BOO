/**
 * Role Hierarchy Tree Component
 * Component hiển thị cây phân cấp vai trò với interactive features
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  ChevronRight,
  ChevronDown,
  Crown,
  Shield,
  GraduationCap,
  UserCheck,
  User,
  ArrowUp,
  Info,
} from "lucide-react";

import {
  getRoleHierarchyTree,
  getAllRolesInOrder,
  RoleHierarchyNode,
} from "../../../lib/role-hierarchy";
import { UserRole } from "@/lib/mockdata/core-types";

const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.GUEST]: "Khách",
  [UserRole.STUDENT]: "Học viên",
  [UserRole.TUTOR]: "Trợ giảng",
  [UserRole.TEACHER]: "Giảng viên",
  [UserRole.ADMIN]: "Quản trị viên",
};

/**
 * Role Hierarchy Tree Props
 * Props cho Role Hierarchy Tree component
 */
interface RoleHierarchyTreeProps {
  onRoleSelect?: (role: UserRole) => void;
  selectedRole?: UserRole;
  showPermissions?: boolean;
  className?: string;
}

/**
 * Get role icon
 * Lấy icon cho role
 */
function getRoleIcon(role: UserRole) {
  switch (role) {
    case "ADMIN":
      return <Crown className="h-5 w-5" />;
    case "TEACHER":
      return <GraduationCap className="h-5 w-5" />;
    case "TUTOR":
      return <UserCheck className="h-5 w-5" />;
    case "STUDENT":
      return <User className="h-5 w-5" />;
    case "GUEST":
      return <Users className="h-5 w-5" />;
    default:
      return <User className="h-5 w-5" />;
  }
}

/**
 * Role Node Component
 * Component hiển thị node role trong tree
 */
interface RoleNodeProps {
  node: RoleHierarchyNode;
  isSelected: boolean;
  onSelect: (role: UserRole) => void;
  onToggleExpand: (role: UserRole) => void;
  isExpanded: boolean;
  level: number;
}

function RoleNode({
  node,
  isSelected,
  onSelect,
  onToggleExpand,
  isExpanded,
  level,
}: RoleNodeProps) {
  const hasChildren = node.children.length > 0;
  const indentLevel = level * 24;

  return (
    <div className="relative">
      {/* Connecting Lines */}
      {level > 0 && (
        <>
          {/* Vertical line from parent */}
          <div
            className="absolute border-l-2 border-muted-foreground/20"
            style={{
              left: `${indentLevel - 24}px`,
              top: "-12px",
              height: "24px",
              width: "1px",
            }}
          />
          {/* Horizontal line to node */}
          <div
            className="absolute border-t-2 border-muted-foreground/20"
            style={{
              left: `${indentLevel - 24}px`,
              top: "12px",
              width: "20px",
              height: "1px",
            }}
          />
        </>
      )}

      {/* Role Node */}
      <div
        className={`
          group flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-300 cursor-pointer
          transform hover:scale-[1.02] hover:shadow-lg
          ${
            isSelected
              ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
              : "border-border hover:border-primary/50 hover:bg-muted/50 hover:shadow-md"
          }
        `}
        style={{ marginLeft: `${indentLevel}px` }}
        onClick={() => onSelect(node.role)}
        title={`${node.label} - ${node.description}`}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node.role);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Role Icon */}
        <div
          className="p-2 rounded-full transition-all duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${node.color}20` }}
        >
          <div
            className="transition-all duration-300 group-hover:drop-shadow-sm"
            style={{ color: node.color }}
          >
            {getRoleIcon(node.role)}
          </div>
        </div>

        {/* Role Information */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{node.label}</h3>
            <Badge
              variant="outline"
              className="text-xs"
              style={{
                borderColor: node.color,
                color: node.color,
              }}
            >
              Level {node.level}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{node.description}</p>
        </div>

        {/* Promotion Paths Indicator */}
        {node.promotionPaths.length > 0 && (
          <div
            className="flex items-center gap-1 transition-all duration-300 group-hover:scale-105"
            title={`Có thể thăng tiến lên: ${node.promotionPaths.map((role) => USER_ROLE_LABELS[role]).join(", ")}`}
          >
            <ArrowUp className="h-3 w-3 text-green-600 transition-transform duration-300 group-hover:translate-y-[-1px]" />
            <span className="text-xs text-green-600 font-medium">
              {node.promotionPaths.length} path{node.promotionPaths.length > 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Permissions Count */}
        <div
          className="flex items-center gap-1 transition-all duration-300 group-hover:scale-105"
          title={`${node.permissions.length} quyền hạn: ${node.permissions
            .slice(0, 3)
            .map((p) => p.name)
            .join(", ")}${node.permissions.length > 3 ? "..." : ""}`}
        >
          <Shield className="h-3 w-3 text-blue-600 transition-transform duration-300 group-hover:rotate-12" />
          <span className="text-xs text-blue-600 font-medium">
            {node.permissions.length} permission{node.permissions.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Children Nodes */}
      {hasChildren && (
        <div
          className={`
            mt-2 overflow-hidden transition-all duration-500 ease-in-out
            ${isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          {node.children.map((child, index) => (
            <div
              key={child.role}
              className="animate-in slide-in-from-left-2 duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <RoleNodeContainer
                node={child}
                isSelected={isSelected}
                onSelect={onSelect}
                onToggleExpand={onToggleExpand}
                isExpanded={isExpanded}
                level={level + 1}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Role Node Container
 * Container cho role node với state management
 */
interface RoleNodeContainerProps {
  node: RoleHierarchyNode;
  isSelected: boolean;
  onSelect: (role: UserRole) => void;
  onToggleExpand: (role: UserRole) => void;
  isExpanded: boolean;
  level: number;
}

function RoleNodeContainer(props: RoleNodeContainerProps) {
  return <RoleNode {...props} />;
}

/**
 * Role Hierarchy Tree Component
 * Component cây phân cấp vai trò
 */
export function RoleHierarchyTree({
  onRoleSelect,
  selectedRole,
  className = "",
}: RoleHierarchyTreeProps) {
  const [hierarchyTree, setHierarchyTree] = useState<RoleHierarchyNode | null>(null);
  const [expandedRoles, setExpandedRoles] = useState<Set<UserRole>>(new Set([UserRole.GUEST]));
  const [selectedRoleState, setSelectedRoleState] = useState<UserRole | undefined>(selectedRole);

  /**
   * Initialize hierarchy tree
   * Khởi tạo cây phân cấp
   */
  useEffect(() => {
    const tree = getRoleHierarchyTree();
    setHierarchyTree(tree);
  }, []);

  /**
   * Handle role selection
   * Xử lý chọn role
   */
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRoleState(role);
    if (onRoleSelect) {
      onRoleSelect(role);
    }
  };

  /**
   * Handle expand/collapse
   * Xử lý mở rộng/thu gọn
   */
  const handleToggleExpand = (role: UserRole) => {
    setExpandedRoles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(role)) {
        newSet.delete(role);
      } else {
        newSet.add(role);
      }
      return newSet;
    });
  };

  /**
   * Expand all roles
   * Mở rộng tất cả roles
   */
  const expandAll = () => {
    const allRoles = getAllRolesInOrder();
    setExpandedRoles(new Set(allRoles));
  };

  /**
   * Collapse all roles
   * Thu gọn tất cả roles
   */
  const collapseAll = () => {
    setExpandedRoles(new Set([UserRole.GUEST]));
  };

  if (!hierarchyTree) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Đang tải cây phân cấp...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Cây phân cấp vai trò
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
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <RoleNode
            node={hierarchyTree}
            isSelected={selectedRoleState === hierarchyTree.role}
            onSelect={handleRoleSelect}
            onToggleExpand={handleToggleExpand}
            isExpanded={expandedRoles.has(hierarchyTree.role)}
            level={0}
          />
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Chú thích
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <ArrowUp className="h-3 w-3 text-green-600" />
              <span>Đường dẫn thăng tiến</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3 text-blue-600" />
              <span>Số lượng quyền hạn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-primary rounded" />
              <span>Vai trò được chọn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-muted-foreground/20 rounded" />
              <span>Đường kết nối phân cấp</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
