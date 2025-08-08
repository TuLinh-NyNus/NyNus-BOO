"use client";

import React, { useState, useEffect } from "react";
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
import { UserRole } from "@/lib/mockdata/core-types";
import { toast } from "@/hooks/use-toast";

// Import mockdata functions
import {
  performBulkRolePromotion,
  type BulkRolePromotionData,
  type BulkOperationResult,
} from "@/lib/mockdata/user-management";

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
 * Interface cho admin user (simplified)
 */
interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  status: string;
}

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
 * Interface cho operation result display
 */
interface OperationResultItem {
  userId: string;
  success: boolean;
  previousRole?: UserRole;
  newRole?: UserRole;
  error?: string;
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
  const [targetRole, setTargetRole] = useState<string>("");
  const [reason, setReason] = useState("");
  const [notifyUsers, setNotifyUsers] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [operationResult, setOperationResult] = useState<BulkOperationResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [progress, setProgress] = useState(0);

  /**
   * Reset form khi dialog đóng
   */
  useEffect(() => {
    if (!isOpen) {
      setTargetRole("");
      setReason("");
      setNotifyUsers(true);
      setIsProcessing(false);
      setOperationResult(null);
      setShowResults(false);
      setProgress(0);
    }
  }, [isOpen]);

  /**
   * Validate form data
   */
  const isFormValid = () => {
    return targetRole && reason.trim().length >= 10 && selectedUsers.length > 0;
  };

  /**
   * Get role hierarchy level for comparison
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
   * Check if role change is promotion or demotion
   */
  const getPromotionType = (currentRole: UserRole, newRole: UserRole): 'promotion' | 'demotion' | 'same' => {
    const currentLevel = getRoleLevel(currentRole);
    const newLevel = getRoleLevel(newRole);
    
    if (newLevel > currentLevel) return 'promotion';
    if (newLevel < currentLevel) return 'demotion';
    return 'same';
  };

  /**
   * Handle bulk role promotion
   */
  const handleBulkPromotion = async () => {
    if (!isFormValid() || !targetRole) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const bulkData: BulkRolePromotionData = {
        userIds: selectedUsers.map(user => user.id),
        targetRole: targetRole as UserRole,
        reason: reason.trim(),
        notifyUsers,
        performedBy: 'current-admin', // In real app, get from auth context
      };

      const result = await performBulkRolePromotion(bulkData);
      
      clearInterval(progressInterval);
      setProgress(100);
      setOperationResult(result);
      setShowResults(true);

      // Show success toast
      toast({
        title: "Bulk promotion hoàn thành",
        description: `Đã xử lý ${result.totalUsers} users: ${result.successCount} thành công, ${result.failedCount} thất bại`,
      });

      // Call success callback after a delay
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (error) {
      console.error("Error performing bulk promotion:", error);
      toast({
        title: "Lỗi bulk promotion",
        description: "Không thể thực hiện bulk promotion. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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

  /**
   * Render operation results
   */
  const renderResults = () => {
    if (!operationResult) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="font-medium">Kết quả bulk promotion</span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 border rounded">
            <div className="text-2xl font-bold text-blue-600">{operationResult.totalUsers}</div>
            <div className="text-muted-foreground">Tổng users</div>
          </div>
          <div className="text-center p-3 border rounded">
            <div className="text-2xl font-bold text-green-600">{operationResult.successCount}</div>
            <div className="text-muted-foreground">Thành công</div>
          </div>
          <div className="text-center p-3 border rounded">
            <div className="text-2xl font-bold text-red-600">{operationResult.failedCount}</div>
            <div className="text-muted-foreground">Thất bại</div>
          </div>
        </div>

        {operationResult.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-600">Lỗi xảy ra:</h4>
            <ScrollArea className="max-h-32">
              {operationResult.errors.map((error, index) => (
                <div key={index} className="text-sm p-2 border rounded bg-red-50">
                  <span className="font-medium">User {error.userId}:</span> {error.error}
                </div>
              ))}
            </ScrollArea>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Role Promotion
          </DialogTitle>
          <DialogDescription>
            Thực hiện thay đổi role cho {selectedUsers.length} users đã chọn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Users Preview */}
          <div className="space-y-3">
            <Label>Users được chọn ({selectedUsers.length})</Label>
            <ScrollArea className="max-h-32 border rounded p-3">
              <div className="space-y-2">
                {selectedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between text-sm">
                    <span>{getUserDisplayName(user)}</span>
                    <Badge className={USER_ROLE_COLORS[user.role]}>
                      {USER_ROLE_LABELS[user.role]}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Target Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="target-role">Role đích *</Label>
            <Select value={targetRole} onValueChange={setTargetRole}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn role mới..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(USER_ROLE_LABELS).map(([role, label]) => (
                  <SelectItem key={role} value={role}>
                    <div className="flex items-center gap-2">
                      <span>{label}</span>
                      {targetRole && selectedUsers.some(user => {
                        const type = getPromotionType(user.role, role as UserRole);
                        return type === 'promotion';
                      }) && <ArrowUp className="h-3 w-3 text-green-500" />}
                      {targetRole && selectedUsers.some(user => {
                        const type = getPromotionType(user.role, role as UserRole);
                        return type === 'demotion';
                      }) && <ArrowDown className="h-3 w-3 text-red-500" />}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Lý do thay đổi *</Label>
            <Textarea
              id="reason"
              placeholder="Nhập lý do thực hiện bulk role promotion..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="text-xs text-muted-foreground">
              Tối thiểu 10 ký tự ({reason.length}/10)
            </div>
          </div>

          {/* Notification Option */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="notify-users"
              checked={notifyUsers}
              onChange={(e) => setNotifyUsers(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="notify-users">Gửi email thông báo cho users</Label>
          </div>

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Đang xử lý bulk promotion...</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Results */}
          {showResults && renderResults()}

          {/* Warnings */}
          {targetRole && selectedUsers.some(user => getPromotionType(user.role, targetRole as UserRole) === 'demotion') && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Một số users sẽ bị hạ cấp (demotion). Hãy chắc chắn đây là điều bạn muốn thực hiện.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            {showResults ? "Đóng" : "Hủy"}
          </Button>
          {!showResults && (
            <Button
              onClick={handleBulkPromotion}
              disabled={!isFormValid() || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Thực hiện Bulk Promotion"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
