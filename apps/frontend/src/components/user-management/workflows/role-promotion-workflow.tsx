'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/overlay/dialog';
import { 
  ArrowRight, 
  Users, 
  Crown, 
  Shield, 
  GraduationCap,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { AdminUser } from '@/lib/mockdata/types';
import { UserRole, UserStatus } from '@/lib/mockdata/core-types';

// ===== INTERFACES =====

/**
 * Props cho RolePromotionWorkflow component
 */
interface RolePromotionWorkflowProps {
  selectedUsers: AdminUser[];                                   // Danh sách users được chọn
  onRefresh: () => void;                                        // Callback để refresh data
  className?: string;
}

/**
 * Role hierarchy definition
 */
interface RoleHierarchy {
  role: UserRole;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  level: number;
  description: string;
  requirements: string[];
}

/**
 * Promotion action definition
 */
interface PromotionAction {
  fromRole: UserRole;
  toRole: UserRole;
  users: AdminUser[];
  requiresLevel?: boolean;
  minLevel?: number;
}

// ===== CONSTANTS =====

/**
 * Role hierarchy configuration
 */
const ROLE_HIERARCHY: RoleHierarchy[] = [
  {
    role: UserRole.GUEST,
    label: 'Khách',
    icon: Users,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    level: 0,
    description: 'Người dùng chưa xác thực',
    requirements: ['Email chưa xác thực', 'Quyền hạn hạn chế']
  },
  {
    role: UserRole.STUDENT,
    label: 'Học sinh',
    icon: GraduationCap,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    level: 1,
    description: 'Học viên đã xác thực',
    requirements: ['Email đã xác thực', 'Hoàn thành đăng ký']
  },
  {
    role: UserRole.TUTOR,
    label: 'Gia sư',
    icon: UserCheck,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    level: 2,
    description: 'Người hướng dẫn',
    requirements: ['Level ≥ 5', 'Kinh nghiệm giảng dạy', 'Đánh giá tốt']
  },
  {
    role: UserRole.TEACHER,
    label: 'Giáo viên',
    icon: Crown,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    level: 3,
    description: 'Giáo viên chính thức',
    requirements: ['Level ≥ 7', 'Chứng chỉ giảng dạy', 'Kinh nghiệm 2+ năm']
  },
  {
    role: UserRole.ADMIN,
    label: 'Quản trị viên',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    level: 4,
    description: 'Quản trị hệ thống',
    requirements: ['Được chỉ định', 'Quyền hạn cao nhất', 'Trách nhiệm toàn hệ thống']
  }
];

/**
 * Promotion rules configuration
 */
const PROMOTION_RULES: Record<UserRole, { canPromoteTo: UserRole[]; requirements: string[] }> = {
  [UserRole.GUEST]: {
    canPromoteTo: [UserRole.STUDENT],
    requirements: ['Email verification required']
  },
  [UserRole.STUDENT]: {
    canPromoteTo: [UserRole.TUTOR],
    requirements: ['Level ≥ 5', 'Good performance record']
  },
  [UserRole.TUTOR]: {
    canPromoteTo: [UserRole.TEACHER],
    requirements: ['Level ≥ 7', 'Teaching experience', 'Positive reviews']
  },
  [UserRole.TEACHER]: {
    canPromoteTo: [UserRole.ADMIN],
    requirements: ['Special authorization required']
  },
  [UserRole.ADMIN]: {
    canPromoteTo: [],
    requirements: ['Highest level - no promotion available']
  }
};

// ===== HELPER FUNCTIONS =====

/**
 * Get role hierarchy info
 */
function getRoleInfo(role: UserRole): RoleHierarchy {
  return ROLE_HIERARCHY.find(r => r.role === role) || ROLE_HIERARCHY[0];
}

/**
 * Check if user can be promoted to target role
 */
function canPromoteUser(user: AdminUser, targetRole: UserRole): { canPromote: boolean; reason?: string } {
  const currentRoleInfo = getRoleInfo(user.role);
  const targetRoleInfo = getRoleInfo(targetRole);

  // Cannot demote
  if (targetRoleInfo.level <= currentRoleInfo.level) {
    return { canPromote: false, reason: 'Không thể hạ cấp hoặc giữ nguyên vai trò' };
  }

  // Check if target role is in allowed promotions
  const allowedPromotions = PROMOTION_RULES[user.role]?.canPromoteTo || [];
  if (!allowedPromotions.includes(targetRole)) {
    return { canPromote: false, reason: 'Không thể thăng cấp trực tiếp lên vai trò này' };
  }

  // Check level requirements
  if (targetRole === UserRole.TUTOR && (user.level || 0) < 5) {
    return { canPromote: false, reason: 'Cần Level ≥ 5 để trở thành Gia sư' };
  }

  if (targetRole === UserRole.TEACHER && (user.level || 0) < 7) {
    return { canPromote: false, reason: 'Cần Level ≥ 7 để trở thành Giáo viên' };
  }

  // Check email verification for STUDENT promotion
  if (targetRole === UserRole.STUDENT && !user.emailVerified) {
    return { canPromote: false, reason: 'Cần xác thực email để trở thành Học sinh' };
  }

  // Check status
  if (user.status !== UserStatus.ACTIVE) {
    return { canPromote: false, reason: 'Chỉ có thể thăng cấp người dùng đang hoạt động' };
  }

  return { canPromote: true };
}

/**
 * Group users by current role
 */
function groupUsersByRole(users: AdminUser[]): Record<UserRole, AdminUser[]> {
  const groups = {} as Record<UserRole, AdminUser[]>;
  
  // Initialize all roles
  Object.values(UserRole).forEach(role => {
    groups[role] = [];
  });

  // Group users
  users.forEach(user => {
    groups[user.role].push(user);
  });

  return groups;
}

// ===== MAIN COMPONENT =====

/**
 * Role Promotion Workflow Component
 * Quản lý thăng cấp vai trò cho users được chọn
 */
export function RolePromotionWorkflow({
  selectedUsers,
  onRefresh,
  className = ''
}: RolePromotionWorkflowProps) {
  // ===== STATES =====
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState<boolean>(false);
  const [selectedTargetRole, setSelectedTargetRole] = useState<UserRole | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [promotionActions, setPromotionActions] = useState<PromotionAction[]>([]);

  // ===== COMPUTED VALUES =====

  /**
   * Group selected users by role
   */
  const usersByRole = useMemo(() => {
    return groupUsersByRole(selectedUsers);
  }, [selectedUsers]);

  /**
   * Available promotion targets
   */
  const availablePromotions = useMemo(() => {
    const promotions: { role: UserRole; count: number; label: string }[] = [];

    Object.entries(usersByRole).forEach(([role, users]) => {
      if (users.length === 0) return;

      const currentRole = role as UserRole;
      const allowedTargets = PROMOTION_RULES[currentRole]?.canPromoteTo || [];

      allowedTargets.forEach(targetRole => {
        const eligibleUsers = users.filter(user => 
          canPromoteUser(user, targetRole).canPromote
        );

        if (eligibleUsers.length > 0) {
          const existing = promotions.find(p => p.role === targetRole);
          if (existing) {
            existing.count += eligibleUsers.length;
          } else {
            const roleInfo = getRoleInfo(targetRole);
            promotions.push({
              role: targetRole,
              count: eligibleUsers.length,
              label: roleInfo.label
            });
          }
        }
      });
    });

    return promotions;
  }, [usersByRole]);

  /**
   * Check if có users được chọn
   */
  const hasSelectedUsers = selectedUsers.length > 0;

  // ===== EVENT HANDLERS =====

  /**
   * Handle open promotion dialog
   */
  const handleOpenPromotionDialog = useCallback(() => {
    setIsPromotionDialogOpen(true);
  }, []);

  /**
   * Handle close promotion dialog
   */
  const handleClosePromotionDialog = useCallback(() => {
    setIsPromotionDialogOpen(false);
    setSelectedTargetRole(null);
    setPromotionActions([]);
  }, []);

  /**
   * Handle target role selection
   */
  const handleTargetRoleSelect = useCallback((targetRole: UserRole) => {
    setSelectedTargetRole(targetRole);

    // Calculate promotion actions
    const actions: PromotionAction[] = [];

    Object.entries(usersByRole).forEach(([role, users]) => {
      if (users.length === 0) return;

      const currentRole = role as UserRole;
      const eligibleUsers = users.filter(user => 
        canPromoteUser(user, targetRole).canPromote
      );

      if (eligibleUsers.length > 0) {
        actions.push({
          fromRole: currentRole,
          toRole: targetRole,
          users: eligibleUsers,
          requiresLevel: targetRole === UserRole.TUTOR || targetRole === UserRole.TEACHER,
          minLevel: targetRole === UserRole.TUTOR ? 5 : targetRole === UserRole.TEACHER ? 7 : undefined
        });
      }
    });

    setPromotionActions(actions);
  }, [usersByRole]);

  /**
   * Handle execute promotion
   */
  const handleExecutePromotion = useCallback(async () => {
    if (!selectedTargetRole || promotionActions.length === 0) return;

    setIsProcessing(true);
    try {
      // Simulate API calls
      for (const action of promotionActions) {
        console.log(`Promoting ${action.users.length} users from ${action.fromRole} to ${action.toRole}`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Refresh data
      onRefresh();

      // Close dialog
      handleClosePromotionDialog();
    } catch (error) {
      console.error('Failed to execute promotions:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedTargetRole, promotionActions, onRefresh, handleClosePromotionDialog]);

  // ===== RENDER HELPERS =====

  /**
   * Render role hierarchy visualization
   */
  const renderRoleHierarchy = useCallback(() => {
    return (
      <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-2">
        {ROLE_HIERARCHY.map((roleInfo, index) => {
          const Icon = roleInfo.icon;
          const userCount = usersByRole[roleInfo.role]?.length || 0;

          return (
            <React.Fragment key={roleInfo.role}>
              {/* Role Card */}
              <div className={`flex flex-col items-center p-3 rounded-lg border-2 min-w-[120px] ${
                userCount > 0 
                  ? `${roleInfo.bgColor} border-current ${roleInfo.color}` 
                  : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}>
                <Icon className="h-6 w-6 mb-2" />
                <div className="text-sm font-medium text-center">{roleInfo.label}</div>
                <div className="text-xs text-center mt-1">Level {roleInfo.level}</div>
                {userCount > 0 && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {userCount} người
                  </Badge>
                )}
              </div>

              {/* Arrow */}
              {index < ROLE_HIERARCHY.length - 1 && (
                <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }, [usersByRole]);

  /**
   * Render promotion summary
   */
  const renderPromotionSummary = useCallback(() => {
    if (!hasSelectedUsers) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Chọn người dùng để xem các tùy chọn thăng cấp</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          Đã chọn <strong>{selectedUsers.length}</strong> người dùng
        </div>

        {availablePromotions.length > 0 ? (
          <div className="space-y-2">
            <div className="text-sm font-medium">Có thể thăng cấp:</div>
            {availablePromotions.map((promotion) => {
              const roleInfo = getRoleInfo(promotion.role);
              const Icon = roleInfo.icon;

              return (
                <div key={promotion.role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${roleInfo.color}`} />
                    <span className="font-medium">{promotion.label}</span>
                  </div>
                  <Badge variant="secondary">
                    {promotion.count} người
                  </Badge>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <p>Không có người dùng nào đủ điều kiện thăng cấp</p>
          </div>
        )}
      </div>
    );
  }, [hasSelectedUsers, selectedUsers.length, availablePromotions]);

  // ===== RENDER =====

  return (
    <>
      <Card className={`bg-transparent ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Quy trình Thăng cấp Vai trò
            </span>
            <Button
              onClick={handleOpenPromotionDialog}
              disabled={!hasSelectedUsers || availablePromotions.length === 0}
              size="sm"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Thăng cấp ({selectedUsers.length})
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Role Hierarchy */}
          <div>
            <h4 className="text-sm font-medium mb-4">Hệ thống phân cấp vai trò</h4>
            {renderRoleHierarchy()}
          </div>

          {/* Promotion Summary */}
          <div>
            <h4 className="text-sm font-medium mb-4">Tóm tắt thăng cấp</h4>
            {renderPromotionSummary()}
          </div>
        </CardContent>
      </Card>

      {/* Promotion Dialog */}
      <Dialog open={isPromotionDialogOpen} onOpenChange={setIsPromotionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thăng cấp Vai trò</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Target Role Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Chọn vai trò đích:</label>
              <Select
                value={selectedTargetRole || ''}
                onValueChange={(value) => handleTargetRoleSelect(value as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò để thăng cấp" />
                </SelectTrigger>
                <SelectContent>
                  {availablePromotions.map((promotion) => (
                    <SelectItem key={promotion.role} value={promotion.role}>
                      {promotion.label} ({promotion.count} người)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Promotion Actions Preview */}
            {promotionActions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Xem trước thăng cấp:</h4>
                <div className="space-y-3">
                  {promotionActions.map((action, index) => {
                    const fromRoleInfo = getRoleInfo(action.fromRole);
                    const toRoleInfo = getRoleInfo(action.toRole);
                    const FromIcon = fromRoleInfo.icon;
                    const ToIcon = toRoleInfo.icon;

                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <FromIcon className={`h-4 w-4 ${fromRoleInfo.color}`} />
                            <span className="text-sm">{fromRoleInfo.label}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <div className="flex items-center space-x-2">
                            <ToIcon className={`h-4 w-4 ${toRoleInfo.color}`} />
                            <span className="text-sm font-medium">{toRoleInfo.label}</span>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {action.users.length} người
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Requirements */}
            {selectedTargetRole && (
              <div>
                <h4 className="text-sm font-medium mb-3">Yêu cầu thăng cấp:</h4>
                <div className="space-y-2">
                  {PROMOTION_RULES[selectedTargetRole]?.requirements?.map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{requirement}</span>
                    </div>
                  )) || []}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClosePromotionDialog}
              disabled={isProcessing}
            >
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button
              onClick={handleExecutePromotion}
              disabled={!selectedTargetRole || promotionActions.length === 0 || isProcessing}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              {isProcessing ? 'Đang xử lý...' : `Thăng cấp ${promotionActions.reduce((sum, action) => sum + action.users.length, 0)} người`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
