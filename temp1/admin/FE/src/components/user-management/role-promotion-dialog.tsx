"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/forms/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms/select";
import { Button } from "@/components/ui/forms/button";
import { Label } from "@/components/ui/forms/label";
import { Textarea } from "@/components/ui/forms/textarea";
import { Badge } from "@/components/ui/data-display/badge";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { Loader2, AlertTriangle, CheckCircle, ArrowUp, ArrowDown } from "lucide-react";
import { UserRole, USER_ROLE_LABELS, USER_ROLE_COLORS } from "@/types/admin-user";
import { toast } from "sonner";

/**
 * Interface cho role promotion dialog props
 */
interface RolePromotionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    email: string;
    name?: string;
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
 * Role Promotion Dialog Component
 * Component dialog để thăng cấp hoặc hạ cấp role cho user
 */
export function RolePromotionDialog({
  isOpen,
  onClose,
  user,
  onSuccess,
}: RolePromotionDialogProps) {
  // State management
  const [targetRole, setTargetRole] = useState<UserRole | "">("");
  const [reason, setReason] = useState("");
  const [force, setForce] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [availableTransitions, setAvailableTransitions] = useState<RoleTransitions | null>(null);
  const [validation, setValidation] = useState<RoleValidationResponse | null>(null);
  const [operationType, setOperationType] = useState<"promotion" | "demotion" | null>(null);

  /**
   * Reset form khi dialog đóng hoặc user thay đổi
   */
  const resetForm = () => {
    setTargetRole("");
    setReason("");
    setForce(false);
    setValidation(null);
    setOperationType(null);
  };

  /**
   * Load available role transitions cho user
   */
  const loadAvailableTransitions = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/v1/admin/users/${user.id}/role-transitions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableTransitions(data);
      }
    } catch (error) {
      console.error("Failed to load available transitions:", error);
    }
  };

  /**
   * Validate role transition
   */
  const validateRoleTransition = async (currentRole: UserRole, newTargetRole: UserRole) => {
    setIsValidating(true);

    try {
      const response = await fetch("/api/v1/admin/roles/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          currentRole,
          targetRole: newTargetRole,
        }),
      });

      if (response.ok) {
        const validationResult = await response.json();
        setValidation(validationResult);

        // Determine operation type
        if (validationResult.allowedPromotions.includes(newTargetRole)) {
          setOperationType("promotion");
        } else if (validationResult.allowedDemotions.includes(newTargetRole)) {
          setOperationType("demotion");
        } else {
          setOperationType(null);
        }
      }
    } catch (error) {
      console.error("Failed to validate role transition:", error);
      toast.error("Không thể validate role transition");
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Handle target role change
   */
  const handleTargetRoleChange = (newTargetRole: string) => {
    setTargetRole(newTargetRole as UserRole);

    if (user && newTargetRole) {
      validateRoleTransition(user.role, newTargetRole as UserRole);
    } else {
      setValidation(null);
      setOperationType(null);
    }
  };

  /**
   * Handle role promotion/demotion submission
   */
  const handleSubmit = async () => {
    if (!user || !targetRole || !operationType) return;

    setIsLoading(true);

    try {
      const endpoint =
        operationType === "promotion"
          ? `/api/v1/admin/users/${user.id}/promote`
          : `/api/v1/admin/users/${user.id}/demote`;

      const body = {
        targetRole,
        reason: reason.trim() || undefined,
        ...(operationType === "promotion" && { force }),
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || `Role ${operationType} thành công`);
        onSuccess();
        onClose();
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.message || `Không thể thực hiện ${operationType}`);
      }
    } catch (error) {
      console.error(`Failed to ${operationType} user role:`, error);
      toast.error(`Lỗi khi thực hiện ${operationType}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get available roles cho select dropdown
   */
  const getAvailableRoles = (): UserRole[] => {
    if (!availableTransitions) return [];

    return [
      ...availableTransitions.availablePromotions,
      ...availableTransitions.availableDemotions,
    ];
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

  // Effects
  useEffect(() => {
    if (isOpen && user) {
      loadAvailableTransitions();
    } else {
      resetForm();
    }
  }, [isOpen, user]);

  if (!user) return null;

  const availableRoles = getAvailableRoles();
  const canSubmit = targetRole && validation?.isValid && !isLoading && !isValidating;
  const requiresReason = operationType === "demotion";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {operationType === "promotion" && <ArrowUp className="h-5 w-5 text-green-600" />}
            {operationType === "demotion" && <ArrowDown className="h-5 w-5 text-red-600" />}
            Thay đổi Role User
          </DialogTitle>
          <DialogDescription>
            Thay đổi role cho user: <strong>{user.email}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Role */}
          <div>
            <Label>Role hiện tại</Label>
            <div className="mt-1">
              <Badge variant={getRoleBadgeColor(user.role)}>{USER_ROLE_LABELS[user.role]}</Badge>
            </div>
          </div>

          {/* Target Role Selection */}
          <div>
            <Label htmlFor="targetRole">Role mới</Label>
            <Select value={targetRole} onValueChange={handleTargetRoleChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Chọn role mới" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeColor(role)} className="text-xs">
                        {USER_ROLE_LABELS[role]}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Validation Status */}
          {isValidating && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang kiểm tra tính hợp lệ...
            </div>
          )}

          {validation && targetRole && (
            <Alert variant={validation.isValid ? "default" : "destructive"}>
              {validation.isValid ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertDescription>
                {validation.isValid
                  ? `Có thể ${operationType === "promotion" ? "thăng cấp" : "hạ cấp"} lên ${USER_ROLE_LABELS[targetRole as UserRole]}`
                  : validation.reason}
              </AlertDescription>
            </Alert>
          )}

          {/* Reason */}
          <div>
            <Label htmlFor="reason">
              Lý do {requiresReason && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="reason"
              placeholder={`Nhập lý do cho ${operationType}...`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Force Option (chỉ cho promotion) */}
          {operationType === "promotion" && !validation?.isValid && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="force"
                checked={force}
                onChange={(e) => setForce(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="force" className="text-sm">
                Force promotion (bỏ qua validation)
              </Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || (requiresReason && !reason.trim())}
            className={
              operationType === "promotion"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {operationType === "promotion" ? "Thăng cấp" : "Hạ cấp"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
