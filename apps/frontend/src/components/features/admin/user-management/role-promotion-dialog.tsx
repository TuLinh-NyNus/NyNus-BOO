"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/form/select";
import { Button } from "@/components/ui/form/button";
import { Label } from "@/components/ui/form/label";
import { Textarea } from "@/components/ui/form/textarea";
import { Badge } from "@/components/ui/display/badge";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { Loader2, AlertTriangle, CheckCircle, ArrowUp, ArrowDown } from "lucide-react";
import { UserRole } from "@/lib/mockdata/core-types";
import { toast } from "@/hooks/use-toast";

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
  [UserRole.GUEST]: "bg-secondary text-secondary-foreground",
  [UserRole.STUDENT]: "bg-primary text-primary-foreground",
  [UserRole.TUTOR]: "bg-badge-success text-badge-success-foreground",
  [UserRole.TEACHER]: "bg-accent text-accent-foreground",
  [UserRole.ADMIN]: "bg-destructive text-destructive-foreground",
};

/**
 * Interface cho role promotion dialog props
 */
interface RolePromotionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
  } | null;
  onSuccess: () => void;
}

/**
 * Interface cho available role transitions
 */
interface RoleTransitions {
  currentRole: UserRole;
  availablePromotions: UserRole[];
  availableDemotions: UserRole[];
}

/**
 * Interface cho role validation response
 */
interface RoleValidationResponse {
  isValid: boolean;
  reason?: string;
  allowedPromotions: UserRole[];
  allowedDemotions: UserRole[];
}

/**
 * Get role hierarchy level
 */
const getRoleLevel = (role: UserRole): number => {
  const levels = {
    [UserRole.GUEST]: 0,
    [UserRole.STUDENT]: 1,
    [UserRole.TUTOR]: 2,
    [UserRole.TEACHER]: 3,
    [UserRole.ADMIN]: 4,
  };
  return levels[role];
};

/**
 * Get available role transitions
 */
const getRoleTransitions = (currentRole: UserRole): RoleTransitions => {
  const currentLevel = getRoleLevel(currentRole);
  const allRoles = Object.values(UserRole);
  
  const availablePromotions = allRoles.filter(role => 
    getRoleLevel(role) > currentLevel && getRoleLevel(role) <= currentLevel + 1
  );
  
  const availableDemotions = allRoles.filter(role => 
    getRoleLevel(role) < currentLevel && getRoleLevel(role) >= currentLevel - 1
  );

  return {
    currentRole,
    availablePromotions,
    availableDemotions,
  };
};

/**
 * Validate role change
 */
const validateRoleChange = async (
  userId: string,
  currentRole: UserRole,
  targetRole: UserRole
): Promise<RoleValidationResponse> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const transitions = getRoleTransitions(currentRole);
      const allAllowed = [...transitions.availablePromotions, ...transitions.availableDemotions];
      
      if (allAllowed.includes(targetRole)) {
        resolve({
          isValid: true,
          allowedPromotions: transitions.availablePromotions,
          allowedDemotions: transitions.availableDemotions,
        });
      } else {
        resolve({
          isValid: false,
          reason: "Role change không được phép. Chỉ có thể thay đổi 1 level tại một thời điểm.",
          allowedPromotions: transitions.availablePromotions,
          allowedDemotions: transitions.availableDemotions,
        });
      }
    }, 300);
  });
};

/**
 * Role Promotion Dialog Component
 * Dialog để thực hiện role promotion/demotion cho single user
 */
export function RolePromotionDialog({
  isOpen,
  onClose,
  user,
  onSuccess,
}: RolePromotionDialogProps) {
  // State management
  const [targetRole, setTargetRole] = useState<string>("");
  const [reason, setReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [validation, setValidation] = useState<RoleValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Reset form when dialog opens/closes
   */
  useEffect(() => {
    if (!isOpen || !user) {
      setTargetRole("");
      setReason("");
      setValidation(null);
      setIsValidating(false);
      setIsProcessing(false);
    }
  }, [isOpen, user]);

  /**
   * Load role validation when user changes
   */
  /**
   * Load role validation
   */
  const loadRoleValidation = useCallback(async () => {
    if (!user) return;

    setIsValidating(true);
    try {
      const validationResult = await validateRoleChange(user.id, user.role, user.role);
      setValidation(validationResult);
    } catch (error) {
      console.error("Error loading role validation:", error);
      toast({
        title: "Lỗi validation",
        description: "Không thể tải thông tin role validation",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && isOpen) {
      loadRoleValidation();
    }
  }, [user, isOpen, loadRoleValidation]);

  /**
   * Handle role promotion
   */
  const handleRolePromotion = async () => {
    if (!user || !targetRole || !reason.trim()) return;

    setIsProcessing(true);
    try {
      // Validate role change
      const validationResult = await validateRoleChange(user.id, user.role, targetRole as UserRole);
      
      if (!validationResult.isValid) {
        toast({
          title: "Role change không hợp lệ",
          description: validationResult.reason,
          variant: "destructive",
        });
        return;
      }

      // Simulate role promotion API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Role promotion thành công",
        description: `Đã thay đổi role của ${getUserDisplayName(user)} từ ${USER_ROLE_LABELS[user.role]} thành ${USER_ROLE_LABELS[targetRole as UserRole]}`,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error promoting user role:", error);
      toast({
        title: "Lỗi role promotion",
        description: "Không thể thực hiện role promotion. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Get user display name
   */
  const getUserDisplayName = (user: { firstName?: string; lastName?: string; email: string }): string => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  };

  /**
   * Get promotion type
   */
  const getPromotionType = (currentRole: UserRole, newRole: UserRole): 'promotion' | 'demotion' | 'same' => {
    const currentLevel = getRoleLevel(currentRole);
    const newLevel = getRoleLevel(newRole);
    
    if (newLevel > currentLevel) return 'promotion';
    if (newLevel < currentLevel) return 'demotion';
    return 'same';
  };

  /**
   * Check if form is valid
   */
  const isFormValid = () => {
    return targetRole && reason.trim().length >= 10 && user && targetRole !== user.role;
  };

  if (!user) return null;

  const availableRoles = validation 
    ? [...validation.allowedPromotions, ...validation.allowedDemotions]
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Role Promotion</DialogTitle>
          <DialogDescription>
            Thay đổi role cho user: {getUserDisplayName(user)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Role */}
          <div className="space-y-2">
            <Label>Role hiện tại</Label>
            <div className="p-2 border rounded bg-muted/25">
              <Badge className={USER_ROLE_COLORS[user.role]}>
                {USER_ROLE_LABELS[user.role]}
              </Badge>
            </div>
          </div>

          {/* Target Role */}
          <div className="space-y-2">
            <Label htmlFor="target-role">Role mới *</Label>
            {isValidating ? (
              <div className="flex items-center gap-2 p-2 border rounded">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Đang tải role options...</span>
              </div>
            ) : (
              <Select value={targetRole} onValueChange={setTargetRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn role mới..." />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center gap-2">
                        <span>{USER_ROLE_LABELS[role]}</span>
                        {targetRole === role && user && (
                          <>
                            {getPromotionType(user.role, role) === 'promotion' && (
                              <ArrowUp className="h-3 w-3 text-badge-success-foreground" />
                            )}
                            {getPromotionType(user.role, role) === 'demotion' && (
                              <ArrowDown className="h-3 w-3 text-destructive" />
                            )}
                          </>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Lý do thay đổi *</Label>
            <Textarea
              id="reason"
              placeholder="Nhập lý do thực hiện role promotion..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="text-xs text-muted-foreground">
              Tối thiểu 10 ký tự ({reason.length}/10)
            </div>
          </div>

          {/* Validation Warning */}
          {validation && !validation.isValid && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {validation.reason}
              </AlertDescription>
            </Alert>
          )}

          {/* Promotion Type Warning */}
          {targetRole && user && getPromotionType(user.role, targetRole as UserRole) === 'demotion' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Đây là demotion (hạ cấp). Hãy chắc chắn đây là điều bạn muốn thực hiện.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Hủy
          </Button>
          <Button
            onClick={handleRolePromotion}
            disabled={!isFormValid() || isProcessing || isValidating}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Thực hiện
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
