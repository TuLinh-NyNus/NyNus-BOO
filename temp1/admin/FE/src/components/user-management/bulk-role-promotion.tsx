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

// Simple Progress component
const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${value}%` }}
    />
  </div>
);

// Simple ScrollArea component
const ScrollArea = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`overflow-auto ${className}`}>{children}</div>
);
import {
  Loader2,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Users,
  X,
  AlertCircle,
} from "lucide-react";
import { UserRole, USER_ROLE_LABELS, USER_ROLE_COLORS } from "@/types/admin-user";
import { AdminUser } from "@/types/admin-user";
import { toast } from "sonner";

/**
 * Interface cho bulk role promotion dialog props
 */
interface BulkRolePromotionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsers: AdminUser[];
  onSuccess: () => void;
}

/**
 * Interface cho bulk operation result
 */
interface BulkOperationResult {
  userId: string;
  success: boolean;
  previousRole?: UserRole;
  newRole?: UserRole;
  error?: string;
}

/**
 * Interface cho bulk operation response
 */
interface BulkOperationResponse {
  totalUsers: number;
  successCount: number;
  failureCount: number;
  results: BulkOperationResult[];
  startedAt: string;
  completedAt: string;
  performedBy: string;
  reason?: string;
}

/**
 * Bulk Role Promotion Component
 * Component để thực hiện bulk role promotion/demotion
 */
export function BulkRolePromotionDialog({
  isOpen,
  onClose,
  selectedUsers,
  onSuccess,
}: BulkRolePromotionDialogProps) {
  // State management
  const [targetRole, setTargetRole] = useState<UserRole | "">("");
  const [reason, setReason] = useState("");
  const [force, setForce] = useState(false);
  const [operationType, setOperationType] = useState<"promotion" | "demotion">("promotion");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [results, setResults] = useState<BulkOperationResponse | null>(null);
  const [showResults, setShowResults] = useState(false);

  /**
   * Reset form khi dialog đóng
   */
  const resetForm = () => {
    setTargetRole("");
    setReason("");
    setForce(false);
    setOperationType("promotion");
    setProgress(0);
    setCurrentStep("");
    setResults(null);
    setShowResults(false);
  };

  /**
   * Get unique roles từ selected users
   */
  const getUniqueRoles = (): UserRole[] => {
    const roles = new Set(selectedUsers.map((user) => user.role));
    return Array.from(roles);
  };

  /**
   * Get available target roles based on operation type
   */
  const getAvailableTargetRoles = (): UserRole[] => {
    const allRoles: UserRole[] = ["GUEST", "STUDENT", "TUTOR", "TEACHER", "ADMIN"];

    if (operationType === "promotion") {
      // Cho promotion, chỉ show roles cao hơn role thấp nhất trong selection
      const minRoleLevel = Math.min(...selectedUsers.map((user) => getRoleLevel(user.role)));
      return allRoles.filter((role) => getRoleLevel(role) > minRoleLevel);
    } else {
      // Cho demotion, chỉ show roles thấp hơn role cao nhất trong selection
      const maxRoleLevel = Math.max(...selectedUsers.map((user) => getRoleLevel(user.role)));
      return allRoles.filter((role) => getRoleLevel(role) < maxRoleLevel);
    }
  };

  /**
   * Get role level for comparison
   */
  const getRoleLevel = (role: UserRole): number => {
    const levels = { GUEST: 0, STUDENT: 1, TUTOR: 2, TEACHER: 3, ADMIN: 4 };
    return levels[role] || 0;
  };

  /**
   * Validate bulk operation
   */
  const validateBulkOperation = (): { isValid: boolean; warnings: string[] } => {
    const warnings: string[] = [];

    if (selectedUsers.length === 0) {
      return { isValid: false, warnings: ["Không có user nào được chọn"] };
    }

    if (selectedUsers.length > 1000) {
      warnings.push("Số lượng users vượt quá giới hạn 1000");
      return { isValid: false, warnings };
    }

    if (!targetRole) {
      return { isValid: false, warnings: ["Chưa chọn target role"] };
    }

    // Check for users với same role as target
    const sameRoleUsers = selectedUsers.filter((user) => user.role === targetRole);
    if (sameRoleUsers.length > 0) {
      warnings.push(
        `${sameRoleUsers.length} users đã có role ${USER_ROLE_LABELS[targetRole as UserRole]}`
      );
    }

    // Check for invalid transitions
    const invalidUsers = selectedUsers.filter((user) => {
      const currentLevel = getRoleLevel(user.role);
      const targetLevel = getRoleLevel(targetRole as UserRole);

      if (operationType === "promotion") {
        return targetLevel <= currentLevel;
      } else {
        return targetLevel >= currentLevel;
      }
    });

    if (invalidUsers.length > 0) {
      warnings.push(`${invalidUsers.length} users có invalid role transition`);
    }

    if (selectedUsers.length > 100) {
      warnings.push("Bulk operation với >100 users cần xác nhận đặc biệt");
    }

    return { isValid: true, warnings };
  };

  /**
   * Handle bulk operation submission
   */
  const handleBulkOperation = async () => {
    if (!targetRole) return;

    setIsProcessing(true);
    setProgress(0);
    setCurrentStep("Đang chuẩn bị bulk operation...");

    try {
      const userIds = selectedUsers.map((user) => user.id);
      const endpoint =
        operationType === "promotion"
          ? "/api/v1/admin/users/bulk/promote"
          : "/api/v1/admin/users/bulk/demote";

      const body = {
        userIds,
        targetRole,
        reason: reason.trim() || undefined,
        ...(operationType === "promotion" && { force }),
      };

      setCurrentStep(`Đang thực hiện ${operationType} cho ${userIds.length} users...`);
      setProgress(25);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      });

      setProgress(75);
      setCurrentStep("Đang xử lý kết quả...");

      if (response.ok) {
        const result: BulkOperationResponse = await response.json();
        setResults(result);
        setProgress(100);
        setCurrentStep("Hoàn thành!");

        toast.success(
          `Bulk ${operationType} hoàn thành: ${result.successCount}/${result.totalUsers} thành công`
        );

        setShowResults(true);
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || `Không thể thực hiện bulk ${operationType}`);
      }
    } catch (error) {
      console.error(`Failed to perform bulk ${operationType}:`, error);
      toast.error(`Lỗi khi thực hiện bulk ${operationType}`);
    } finally {
      setIsProcessing(false);
    }
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
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const uniqueRoles = getUniqueRoles();
  const availableTargetRoles = getAvailableTargetRoles();
  const validation = validateBulkOperation();
  const canSubmit = validation.isValid && targetRole && !isProcessing;
  const requiresReason = operationType === "demotion";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Role {operationType === "promotion" ? "Promotion" : "Demotion"}
          </DialogTitle>
          <DialogDescription>
            Thay đổi role cho {selectedUsers.length} users đã chọn
          </DialogDescription>
        </DialogHeader>

        {!showResults ? (
          <div className="space-y-4">
            {/* Operation Type */}
            <div>
              <Label>Loại thao tác</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={operationType === "promotion" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOperationType("promotion")}
                  disabled={isProcessing}
                >
                  <ArrowUp className="h-4 w-4 mr-1" />
                  Promotion
                </Button>
                <Button
                  variant={operationType === "demotion" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOperationType("demotion")}
                  disabled={isProcessing}
                >
                  <ArrowDown className="h-4 w-4 mr-1" />
                  Demotion
                </Button>
              </div>
            </div>

            {/* Selected Users Summary */}
            <div>
              <Label>Users đã chọn ({selectedUsers.length})</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {uniqueRoles.map((role) => {
                  const count = selectedUsers.filter((user) => user.role === role).length;
                  return (
                    <Badge key={role} variant={getRoleBadgeColor(role)} className="text-xs">
                      {count} {USER_ROLE_LABELS[role]}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Target Role Selection */}
            <div>
              <Label htmlFor="targetRole">Target Role</Label>
              <Select
                value={targetRole}
                onValueChange={(value) => setTargetRole(value as UserRole)}
                disabled={isProcessing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn target role" />
                </SelectTrigger>
                <SelectContent>
                  {availableTargetRoles.map((role) => (
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

            {/* Validation Warnings */}
            {validation.warnings.length > 0 && (
              <Alert variant={validation.isValid ? "default" : "destructive"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    {validation.warnings.map((warning, index) => (
                      <div key={index}>• {warning}</div>
                    ))}
                  </div>
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
                placeholder={`Nhập lý do cho bulk ${operationType}...`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1"
                rows={3}
                disabled={isProcessing}
              />
            </div>

            {/* Force Option (chỉ cho promotion) */}
            {operationType === "promotion" && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="force"
                  checked={force}
                  onChange={(e) => setForce(e.target.checked)}
                  disabled={isProcessing}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="force" className="text-sm">
                  Force promotion (bỏ qua validation)
                </Label>
              </div>
            )}

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">{currentStep}</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </div>
        ) : (
          /* Results Display */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Kết quả Bulk Operation</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowResults(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {results && (
              <>
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{results.successCount}</div>
                    <div className="text-sm text-muted-foreground">Thành công</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{results.failureCount}</div>
                    <div className="text-sm text-muted-foreground">Thất bại</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{results.totalUsers}</div>
                    <div className="text-sm text-muted-foreground">Tổng cộng</div>
                  </div>
                </div>

                {/* Detailed Results */}
                <ScrollArea className="h-[200px] border rounded-md p-4">
                  <div className="space-y-2">
                    {results.results.map((result, index) => {
                      const user = selectedUsers.find((u) => u.id === result.userId);
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div className="flex items-center gap-2">
                            {result.success ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-sm">{user?.email || result.userId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {result.success ? (
                              <>
                                <Badge
                                  variant={getRoleBadgeColor(result.previousRole!)}
                                  className="text-xs"
                                >
                                  {USER_ROLE_LABELS[result.previousRole!]}
                                </Badge>
                                <ArrowUp className="h-3 w-3" />
                                <Badge
                                  variant={getRoleBadgeColor(result.newRole!)}
                                  className="text-xs"
                                >
                                  {USER_ROLE_LABELS[result.newRole!]}
                                </Badge>
                              </>
                            ) : (
                              <span className="text-xs text-red-600">{result.error}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            {showResults ? "Đóng" : "Hủy"}
          </Button>
          {!showResults && (
            <Button
              onClick={handleBulkOperation}
              disabled={!canSubmit || (requiresReason && !reason.trim())}
              className={
                operationType === "promotion"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Thực hiện Bulk {operationType === "promotion" ? "Promotion" : "Demotion"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
