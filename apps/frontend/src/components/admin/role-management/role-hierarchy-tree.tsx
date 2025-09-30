"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import {
  GitBranch,
  Users,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Shield,
  Crown,
  RefreshCw,
  Info,
} from "lucide-react";

import { UserRole } from "@/lib/mockdata/core-types";
import { toast } from '@/hooks';

// Import mockdata functions
import {
  getRoleHierarchy,
  type RoleHierarchyNode,
  type RoleHierarchyResponse,
} from "@/lib/mockdata/role-management";

/**
 * Role Hierarchy Tree Props
 */
interface RoleHierarchyTreeProps {
  onRoleSelect?: (role: UserRole) => void;
  selectedRole?: UserRole | null;
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
 * Role icons
 */
const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  [UserRole.GUEST]: <Users className="h-4 w-4" />,
  [UserRole.STUDENT]: <Users className="h-4 w-4" />,
  [UserRole.TUTOR]: <Shield className="h-4 w-4" />,
  [UserRole.TEACHER]: <Shield className="h-4 w-4" />,
  [UserRole.ADMIN]: <Crown className="h-4 w-4" />,
};

/**
 * Role Tree Node Component
 */
interface RoleTreeNodeProps {
  node: RoleHierarchyNode;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onSelect: () => void;
  children?: React.ReactNode;
}

function RoleTreeNode({
  node,
  level,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  children,
}: RoleTreeNodeProps) {
  const hasChildren = node.children.length > 0;
  const indentLevel = level * 24;

  return (
    <div>
      <div
        className={`flex items-center gap-2 p-3 rounded cursor-pointer transition-colors ${
          isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-muted/25'
        }`}
        style={{ marginLeft: `${indentLevel}px` }}
        onClick={onSelect}
      >
        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          disabled={!hasChildren}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )
          ) : (
            <div className="h-3 w-3" />
          )}
        </Button>

        {/* Role Icon */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
          {ROLE_ICONS[node.role]}
        </div>

        {/* Role Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge className={ROLE_COLORS[node.role]}>
              {USER_ROLE_LABELS[node.role]}
            </Badge>
            <span className="text-sm text-muted-foreground">Level {node.level}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {node.userCount} users • {node.permissions.length} permissions
          </div>
        </div>

        {/* Promotion Indicators */}
        <div className="flex items-center gap-1">
          {node.canPromoteTo.length > 0 && (
            <Badge variant="outline" className="text-xs">
              <ArrowUp className="h-3 w-3 mr-1" />
              {node.canPromoteTo.length}
            </Badge>
          )}
          {node.canDemoteTo.length > 0 && (
            <Badge variant="outline" className="text-xs">
              <ArrowDown className="h-3 w-3 mr-1" />
              {node.canDemoteTo.length}
            </Badge>
          )}
        </div>
      </div>

      {/* Children */}
      {isExpanded && children}
    </div>
  );
}

/**
 * Role Hierarchy Tree Component
 * Component hiển thị visual tree representation của role hierarchy
 */
export function RoleHierarchyTree({
  onRoleSelect,
  selectedRole,
  className = "",
}: RoleHierarchyTreeProps) {
  // State management
  const [hierarchyData, setHierarchyData] = useState<RoleHierarchyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<UserRole>>(new Set([UserRole.ADMIN]));
  const [showPromotionPaths, setShowPromotionPaths] = useState(false);

  /**
   * Load role hierarchy data
   */
  const loadHierarchy = async () => {
    setIsLoading(true);
    try {
      const data = await getRoleHierarchy();
      setHierarchyData(data);
    } catch (error) {
      console.error("Error loading role hierarchy:", error);
      toast({
        title: "Lỗi tải role hierarchy",
        description: "Không thể tải dữ liệu role hierarchy",
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
    loadHierarchy();
  }, []);

  /**
   * Handle node toggle
   */
  const handleNodeToggle = (role: UserRole) => {
    setExpandedNodes(prev => {
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
   * Handle role selection
   */
  const handleRoleSelect = (role: UserRole) => {
    onRoleSelect?.(role);
  };

  /**
   * Build tree structure
   */
  const buildTreeStructure = (nodes: RoleHierarchyNode[]): RoleHierarchyNode[] => {
    // Sort by level (highest first)
    return nodes.sort((a, b) => b.level - a.level);
  };

  /**
   * Render tree node recursively
   */
  const renderTreeNode = (node: RoleHierarchyNode, level: number = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.role);
    const isSelected = selectedRole === node.role;
    const childNodes = hierarchyData?.hierarchy.filter(n => node.children.includes(n.role)) || [];

    return (
      <RoleTreeNode
        key={node.role}
        node={node}
        level={level}
        isExpanded={isExpanded}
        isSelected={isSelected}
        onToggle={() => handleNodeToggle(node.role)}
        onSelect={() => handleRoleSelect(node.role)}
      >
        {isExpanded && childNodes.map(childNode => renderTreeNode(childNode, level + 1))}
      </RoleTreeNode>
    );
  };

  /**
   * Get hierarchy statistics
   */
  const getHierarchyStats = () => {
    if (!hierarchyData) return { totalUsers: 0, totalRoles: 0, totalPermissions: 0 };

    const totalUsers = hierarchyData.hierarchy.reduce((sum, node) => sum + node.userCount, 0);
    const totalRoles = hierarchyData.hierarchy.length;
    const allPermissions = hierarchyData.hierarchy.flatMap(node => node.permissions);
    const uniquePermissions = allPermissions.filter((perm, index, self) =>
      index === self.findIndex(p => p.id === perm.id)
    );

    return {
      totalUsers,
      totalRoles,
      totalPermissions: uniquePermissions.length,
    };
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            <p className="text-muted-foreground">Đang tải role hierarchy...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hierarchyData) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <GitBranch className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-muted-foreground">Không thể tải role hierarchy</p>
            <Button onClick={loadHierarchy} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const treeNodes = buildTreeStructure(hierarchyData.hierarchy);
  const rootNodes = treeNodes.filter(node => !node.parent);
  const stats = getHierarchyStats();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Role Hierarchy Tree
            </CardTitle>
            <CardDescription>
              Visual tree representation của role hierarchy và relationships
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPromotionPaths(!showPromotionPaths)}
            >
              <Info className="h-4 w-4 mr-2" />
              {showPromotionPaths ? 'Hide' : 'Show'} Paths
            </Button>
            <Button variant="outline" onClick={loadHierarchy}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Hierarchy Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 border rounded">
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
          <div className="text-center p-3 border rounded">
            <div className="text-2xl font-bold text-green-600">{stats.totalRoles}</div>
            <div className="text-sm text-muted-foreground">Total Roles</div>
          </div>
          <div className="text-center p-3 border rounded">
            <div className="text-2xl font-bold text-purple-600">{stats.totalPermissions}</div>
            <div className="text-sm text-muted-foreground">Unique Permissions</div>
          </div>
        </div>

        {/* Tree View */}
        <div className="border rounded-lg p-4 bg-muted/25">
          <div className="space-y-1">
            {rootNodes.map(node => renderTreeNode(node))}
          </div>
        </div>

        {/* Promotion Paths */}
        {showPromotionPaths && (
          <div className="space-y-3">
            <h4 className="font-medium">Promotion Paths</h4>
            <div className="space-y-2">
              {hierarchyData.promotionPaths.map((path, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded">
                  <Badge className={ROLE_COLORS[path.from]}>
                    {USER_ROLE_LABELS[path.from]}
                  </Badge>
                  <ArrowUp className="h-4 w-4 text-green-500" />
                  <Badge className={ROLE_COLORS[path.to]}>
                    {USER_ROLE_LABELS[path.to]}
                  </Badge>
                  <div className="flex-1 text-sm text-muted-foreground">
                    Requirements: {path.requirements.join(', ')}
                  </div>
                  {path.isDirectPath && (
                    <Badge variant="outline" className="text-xs">Direct</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <ArrowUp className="h-3 w-3" />
              <span>Can promote to</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowDown className="h-3 w-3" />
              <span>Can demote to</span>
            </div>
          </div>
          <div className="mt-1">
            Click on roles để select • Click arrows để expand/collapse
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
