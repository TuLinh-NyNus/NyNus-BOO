"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/form/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu";
import { Badge } from "@/components/ui/display/badge";
import { ArrowUp, ArrowDown, Users, MoreVertical, UserCheck, UserX, Shield } from "lucide-react";
import { UserRole, UserStatus } from "@/lib/mockdata/core-types";
import { AdminUser } from "@/types/user/admin";
import {
  getProtobufRoleLabel,
  getProtobufRoleColor,
  convertProtobufRoleToEnum,
  isProtobufRoleEqual,
  isProtobufStatusEqual
} from "@/lib/utils/type-converters";
import { toast } from "@/hooks/use-toast";

// Import dialog components
import { RolePromotionDialog } from "./role-promotion-dialog";
import { BulkRolePromotionDialog } from "./bulk-role-promotion";

// AdminUser imported from canonical source above

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
 * User role colors mapping
 */
const USER_ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.GUEST]: "bg-gray-100 text-gray-800",
  [UserRole.STUDENT]: "bg-blue-100 text-blue-800",
  [UserRole.TUTOR]: "bg-green-100 text-green-800",
  [UserRole.TEACHER]: "bg-purple-100 text-purple-800",
  [UserRole.ADMIN]: "bg-red-100 text-red-800",
};

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
      toast({
        title: "Không có users được chọn",
        description: "Vui lòng chọn ít nhất một user để thực hiện bulk promotion",
        variant: "destructive",
      });
      return;
    }

    setBulkPromotionDialog(true);
  };

  /**
   * Handle promotion success
   */
  const handlePromotionSuccess = () => {
    onRefresh();
    toast({
      title: "Role promotion thành công",
      description: "Đã cập nhật role cho user(s) thành công",
    });
  };

  /**
   * Get role statistics
   */
  const getRoleStatistics = () => {
    const roleStats = selectedUsers.reduce((acc, user) => {
      const enumRole = convertProtobufRoleToEnum(user.role);
      acc[enumRole] = (acc[enumRole] || 0) + 1;
      return acc;
    }, {} as Record<UserRole, number>);

    return Object.entries(roleStats).map(([role, count]) => ({
      role: role as UserRole,
      count,
      label: USER_ROLE_LABELS[role as UserRole],
    }));
  };

  /**
   * Get promotion suggestions
   */
  const getPromotionSuggestions = () => {
    const suggestions = [];

    // Suggest promoting students to tutors
    const students = selectedUsers.filter(u => isProtobufRoleEqual(u.role, UserRole.STUDENT));
    if (students.length > 0) {
      suggestions.push({
        from: UserRole.STUDENT,
        to: UserRole.TUTOR,
        count: students.length,
        type: 'promotion' as const,
      });
    }

    // Suggest promoting tutors to teachers
    const tutors = selectedUsers.filter(u => isProtobufRoleEqual(u.role, UserRole.TUTOR));
    if (tutors.length > 0) {
      suggestions.push({
        from: UserRole.TUTOR,
        to: UserRole.TEACHER,
        count: tutors.length,
        type: 'promotion' as const,
      });
    }

    return suggestions;
  };

  /**
   * Get user display name
   */
  const getUserDisplayName = (user: AdminUser): string => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  };

  const roleStats = getRoleStatistics();
  const promotionSuggestions = getPromotionSuggestions();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Workflow Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Role Promotion Workflow</h3>
          <p className="text-sm text-muted-foreground">
            Quản lý role promotion cho {selectedUsers.length} users được chọn
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleBulkPromotion}
            disabled={selectedUsers.length === 0}
          >
            <Users className="h-4 w-4 mr-2" />
            Bulk Promotion
          </Button>
        </div>
      </div>

      {/* Selected Users Summary */}
      {selectedUsers.length > 0 && (
        <div className="border rounded-lg p-4 bg-muted/25">
          <h4 className="font-medium mb-3">Users được chọn ({selectedUsers.length})</h4>
          
          {/* Role Statistics */}
          <div className="flex flex-wrap gap-2 mb-4">
            {roleStats.map(({ role, count, label }) => (
              <Badge key={role} className={USER_ROLE_COLORS[role]}>
                {label}: {count}
              </Badge>
            ))}
          </div>

          {/* Promotion Suggestions */}
          {promotionSuggestions.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Gợi ý promotion:</h5>
              <div className="flex flex-wrap gap-2">
                {promotionSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Badge className={USER_ROLE_COLORS[suggestion.from]}>
                      {USER_ROLE_LABELS[suggestion.from]}
                    </Badge>
                    <ArrowUp className="h-3 w-3 text-green-500" />
                    <Badge className={USER_ROLE_COLORS[suggestion.to]}>
                      {USER_ROLE_LABELS[suggestion.to]}
                    </Badge>
                    <span className="text-muted-foreground">({suggestion.count} users)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Individual User Actions */}
      {selectedUsers.length > 0 && (
        <div className="border rounded-lg">
          <div className="p-4 border-b bg-muted/25">
            <h4 className="font-medium">Individual Actions</h4>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {selectedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium">{getUserDisplayName(user)}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                  <Badge className={`bg-${getProtobufRoleColor(user.role)}-100 text-${getProtobufRoleColor(user.role)}-700`}>
                    {getProtobufRoleLabel(user.role)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSinglePromotion(user)}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    Promote
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleSinglePromotion(user)}>
                        <ArrowUp className="h-4 w-4 mr-2" />
                        Promote Role
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ArrowDown className="h-4 w-4 mr-2" />
                        Demote Role
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {isProtobufStatusEqual(user.status, UserStatus.ACTIVE) ? (
                        <DropdownMenuItem>
                          <UserX className="h-4 w-4 mr-2" />
                          Suspend User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Activate User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedUsers.length === 0 && (
        <div className="border rounded-lg p-8 text-center">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <h4 className="font-medium mb-1">Chưa có users được chọn</h4>
          <p className="text-sm text-muted-foreground">
            Chọn users từ bảng để bắt đầu role promotion workflow
          </p>
        </div>
      )}

      {/* Dialogs */}
      <RolePromotionDialog
        isOpen={singlePromotionDialog}
        onClose={() => setSinglePromotionDialog(false)}
        user={selectedUser}
        onSuccess={handlePromotionSuccess}
      />

      <BulkRolePromotionDialog
        isOpen={bulkPromotionDialog}
        onClose={() => setBulkPromotionDialog(false)}
        selectedUsers={selectedUsers}
        onSuccess={handlePromotionSuccess}
      />
    </div>
  );
}
