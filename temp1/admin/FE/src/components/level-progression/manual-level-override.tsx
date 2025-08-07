"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/forms/dialog";
import { Button } from "@/components/ui/forms/button";
import { Label } from "@/components/ui/forms/label";
import { Input } from "@/components/ui/forms/input";
import { Textarea } from "@/components/ui/forms/textarea";
import { Switch } from "@/components/ui/forms/switch";
import { Badge } from "@/components/ui/data-display/badge";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { Loader2, Save, X, AlertTriangle, CheckCircle, TrendingUp, Shield } from "lucide-react";
import { UserRole, USER_ROLE_LABELS } from "@/types/admin-user";
import { toast } from "sonner";

/**
 * Interface cho user info
 */
interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  level: number;
  status: string;
}

/**
 * Interface cho manual level override props
 */
interface ManualLevelOverrideProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserInfo | null;
  onSuccess: () => void;
}

/**
 * Manual Level Override Component
 * Component để admin override level cho user
 */
export function ManualLevelOverride({
  isOpen,
  onClose,
  user,
  onSuccess,
}: ManualLevelOverrideProps) {
  // State management
  const [newLevel, setNewLevel] = useState<number>(1);
  const [reason, setReason] = useState("");
  const [bypassValidation, setBypassValidation] = useState(false);
  const [isOverriding, setIsOverriding] = useState(false);

  /**
   * Get max level for role
   */
  const getMaxLevel = (role: UserRole): number => {
    const maxLevels: Record<UserRole, number> = {
      GUEST: 1,
      STUDENT: 9,
      TUTOR: 9,
      TEACHER: 9,
      ADMIN: 1,
    };
    return maxLevels[role];
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
   * Validate level override
   */
  const validateOverride = (): string | null => {
    if (!user) return "User information not available";

    if (newLevel < 1) {
      return "Level không thể nhỏ hơn 1";
    }

    const maxLevel = getMaxLevel(user.role);
    if (newLevel > maxLevel) {
      return `Level cho role ${USER_ROLE_LABELS[user.role]} không thể vượt quá ${maxLevel}`;
    }

    if (user.role === "GUEST" && newLevel > 1) {
      return "GUEST role chỉ có thể có level 1";
    }

    if (user.role === "ADMIN" && newLevel > 1) {
      return "ADMIN role chỉ có thể có level 1";
    }

    if (newLevel === user.level) {
      return "Level mới phải khác với level hiện tại";
    }

    if (!reason.trim()) {
      return "Lý do override là bắt buộc";
    }

    return null;
  };

  /**
   * Perform level override
   */
  const performOverride = async () => {
    if (!user) return;

    // Validate if not bypassing
    if (!bypassValidation) {
      const validationError = validateOverride();
      if (validationError) {
        toast.error(validationError);
        return;
      }
    }

    setIsOverriding(true);

    try {
      const response = await fetch(`/api/v1/admin/users/${user.id}/level-override`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          newLevel,
          reason: reason.trim(),
          bypassValidation,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(
          `Level override successful: ${user.firstName} ${user.lastName} từ level ${user.level} → ${newLevel}`
        );
        onSuccess();
        onClose();
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.message || "Không thể override level");
      }
    } catch (error) {
      console.error("Failed to override level:", error);
      toast.error("Lỗi khi override level");
    } finally {
      setIsOverriding(false);
    }
  };

  /**
   * Reset form
   */
  const resetForm = () => {
    setNewLevel(1);
    setReason("");
    setBypassValidation(false);
  };

  /**
   * Handle dialog open change
   */
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      resetForm();
    }
  };

  // Set initial level when user changes
  React.useEffect(() => {
    if (user) {
      setNewLevel(user.level);
    }
  }, [user]);

  if (!user) return null;

  const maxLevel = getMaxLevel(user.role);
  const validationError = bypassValidation ? null : validateOverride();
  const canOverride = bypassValidation || !validationError;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Manual Level Override
          </DialogTitle>
          <DialogDescription>
            Override level cho user {user.firstName} {user.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Information */}
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">
                {user.firstName} {user.lastName}
              </div>
              <Badge variant={getRoleBadgeColor(user.role)}>{USER_ROLE_LABELS[user.role]}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              <div>Email: {user.email}</div>
              <div>Current Level: {user.level}</div>
              <div>Status: {user.status}</div>
            </div>
          </div>

          {/* Level Override Settings */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="newLevel">New Level</Label>
              <Input
                id="newLevel"
                type="number"
                min="1"
                max={bypassValidation ? 99 : maxLevel}
                value={newLevel}
                onChange={(e) => setNewLevel(parseInt(e.target.value) || 1)}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Max level cho {USER_ROLE_LABELS[user.role]}: {maxLevel}
                {bypassValidation && " (Validation bypassed)"}
              </p>
            </div>

            <div>
              <Label htmlFor="reason">Reason for Override</Label>
              <Textarea
                id="reason"
                placeholder="Nhập lý do override level..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1"
                rows={3}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Lý do này sẽ được ghi vào audit log
              </p>
            </div>

            {/* Bypass Validation Option */}
            <div className="flex items-center space-x-2 p-3 border rounded-lg bg-yellow-50 border-yellow-200">
              <Shield className="h-4 w-4 text-yellow-600" />
              <div className="flex-1">
                <Label htmlFor="bypassValidation" className="text-sm font-medium">
                  Bypass Validation
                </Label>
                <p className="text-xs text-muted-foreground">
                  Bỏ qua validation rules (chỉ dành cho emergency cases)
                </p>
              </div>
              <Switch
                id="bypassValidation"
                checked={bypassValidation}
                onCheckedChange={setBypassValidation}
              />
            </div>
          </div>

          {/* Level Change Preview */}
          <div className="p-4 border rounded-lg">
            <div className="text-sm font-medium mb-2">Level Change Preview</div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Current: {user.level}</Badge>
              <span>→</span>
              <Badge variant={newLevel > user.level ? "default" : "destructive"}>
                New: {newLevel}
              </Badge>
              <span className="text-sm text-muted-foreground">
                ({newLevel > user.level ? "+" : ""}
                {newLevel - user.level} levels)
              </span>
            </div>
          </div>

          {/* Validation Errors */}
          {validationError && !bypassValidation && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* Bypass Warning */}
          {bypassValidation && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Validation đã được bypass. Override này sẽ được thực hiện
                mà không kiểm tra business rules. Hãy chắc chắn bạn hiểu rõ hậu quả.
              </AlertDescription>
            </Alert>
          )}

          {/* Success Conditions */}
          {canOverride && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Level override sẵn sàng thực hiện. Thao tác này sẽ được ghi vào audit log.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isOverriding}>
            Cancel
          </Button>
          <Button
            onClick={performOverride}
            disabled={!canOverride || isOverriding}
            className={
              newLevel > user.level
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }
          >
            {isOverriding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {newLevel > user.level ? "Promote" : "Demote"} to Level {newLevel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
