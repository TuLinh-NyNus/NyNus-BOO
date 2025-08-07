"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/forms/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/navigation/dropdown-menu";
import { Badge } from "@/components/ui/data-display/badge";
import { ArrowUp, ArrowDown, Users, MoreVertical, UserCheck, UserX, Shield } from "lucide-react";
import { UserRole, USER_ROLE_LABELS, USER_ROLE_COLORS } from "@/types/admin-user";
import { AdminUser } from "@/types/admin-user";
import { RolePromotionDialog } from "./role-promotion-dialog";
import { BulkRolePromotionDialog } from "./bulk-role-promotion";
import { toast } from "sonner";

/**
 * Interface cho role promotion workflow props
 */
interface RolePromotionWorkflowProps {
  selectedUsers: AdminUser[];
  onRefresh: () => void;
  className?: string;
}

/**
 * Role Promotion Workflow Component
 * Component chính để quản lý role promotion workflow
 */
export function RolePromotionWorkflow({
  selectedUsers,
  onRefresh,
  className = "",
}: RolePromotionWorkflowProps) {
  // State management
  const [singlePromotionDialog, setSinglePromotionDialog] = useState(false);
  const [bulkPromotionDialog, setBulkPromotionDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  /**
   * Handle single user role promotion
   */
  const handleSinglePromotion = (user: AdminUser) => {
    setSelectedUser(user);
    setSinglePromotionDialog(true);
  };

  /**
   * Handle bulk role promotion
   */
  const handleBulkPromotion = () => {
    if (selectedUsers.length === 0) {
      toast.error("Vui lòng chọn ít nhất một user");
      return;
    }

    if (selectedUsers.length > 1000) {
      toast.error("Không thể xử lý quá 1000 users trong một lần");
      return;
    }

    setBulkPromotionDialog(true);
  };

  /**
   * Get role statistics từ selected users
   */
  const getRoleStatistics = () => {
    const roleCount: Record<UserRole, number> = {
      GUEST: 0,
      STUDENT: 0,
      TUTOR: 0,
      TEACHER: 0,
      ADMIN: 0,
    };

    selectedUsers.forEach((user) => {
      roleCount[user.role]++;
    });

    return Object.entries(roleCount)
      .filter(([_, count]) => count > 0)
      .map(([role, count]) => ({
        role: role as UserRole,
        count,
      }));
  };

  /**
   * Check if bulk operations are available
   */
  const canPerformBulkOperations = () => {
    return selectedUsers.length > 0 && selectedUsers.length <= 1000;
  };

  /**
   * Get role badge color
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
   * Handle dialog success
   */
  const handleDialogSuccess = () => {
    onRefresh();
    setSinglePromotionDialog(false);
    setBulkPromotionDialog(false);
    setSelectedUser(null);
  };

  const roleStats = getRoleStatistics();
  const hasSelection = selectedUsers.length > 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Role Promotion Actions */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Management Workflow
          </h3>

          {hasSelection ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedUsers.length} users đã chọn:
              </span>
              {roleStats.map(({ role, count }) => (
                <Badge key={role} variant={getRoleBadgeColor(role)} className="text-xs">
                  {count} {USER_ROLE_LABELS[role]}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Chọn users để thực hiện role promotion/demotion
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Single User Actions */}
          {selectedUsers.length === 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Single User Actions
                  <MoreVertical className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Role Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleSinglePromotion(selectedUsers[0])}>
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Promote/Demote Role
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Bulk Actions */}
          {selectedUsers.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={!canPerformBulkOperations()}>
                  <Users className="h-4 w-4 mr-2" />
                  Bulk Actions ({selectedUsers.length})
                  <MoreVertical className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Bulk Role Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleBulkPromotion}>
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Bulk Role Promotion
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBulkPromotion}>
                  <ArrowDown className="h-4 w-4 mr-2" />
                  Bulk Role Demotion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Quick Actions */}
          {hasSelection && (
            <Button
              onClick={handleBulkPromotion}
              disabled={!canPerformBulkOperations()}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Shield className="h-4 w-4 mr-2" />
              Role Workflow
            </Button>
          )}
        </div>
      </div>

      {/* Role Hierarchy Information */}
      <div className="p-4 border rounded-lg bg-muted/50">
        <h4 className="text-sm font-medium mb-2">Role Hierarchy</h4>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant={getRoleBadgeColor("GUEST")} className="text-xs">
            {USER_ROLE_LABELS.GUEST}
          </Badge>
          <ArrowUp className="h-3 w-3" />
          <Badge variant={getRoleBadgeColor("STUDENT")} className="text-xs">
            {USER_ROLE_LABELS.STUDENT}
          </Badge>
          <ArrowUp className="h-3 w-3" />
          <Badge variant={getRoleBadgeColor("TUTOR")} className="text-xs">
            {USER_ROLE_LABELS.TUTOR}
          </Badge>
          <ArrowUp className="h-3 w-3" />
          <Badge variant={getRoleBadgeColor("TEACHER")} className="text-xs">
            {USER_ROLE_LABELS.TEACHER}
          </Badge>
          <ArrowUp className="h-3 w-3" />
          <Badge variant={getRoleBadgeColor("ADMIN")} className="text-xs">
            {USER_ROLE_LABELS.ADMIN}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Users chỉ có thể được promote lên role kế tiếp hoặc demote xuống role thấp hơn
        </p>
      </div>

      {/* Safety Guidelines */}
      {selectedUsers.length > 100 && (
        <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
          <div className="flex items-center gap-2 text-yellow-800">
            <UserX className="h-4 w-4" />
            <span className="text-sm font-medium">Bulk Operation Warning</span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            Bạn đang thực hiện bulk operation với {selectedUsers.length} users. Thao tác này sẽ yêu
            cầu xác nhận đặc biệt và có thể mất thời gian.
          </p>
        </div>
      )}

      {/* Dialogs */}
      <RolePromotionDialog
        isOpen={singlePromotionDialog}
        onClose={() => {
          setSinglePromotionDialog(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={handleDialogSuccess}
      />

      <BulkRolePromotionDialog
        isOpen={bulkPromotionDialog}
        onClose={() => setBulkPromotionDialog(false)}
        selectedUsers={selectedUsers}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
