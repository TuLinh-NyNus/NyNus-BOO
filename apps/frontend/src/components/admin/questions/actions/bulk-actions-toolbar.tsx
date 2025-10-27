/**
 * Bulk Actions Toolbar Component
 * Toolbar cho bulk operations với confirmation dialogs
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Badge,
  Progress,
  Alert,
  AlertDescription,
} from "@/components/ui";
import {
  Trash2,
  Download,
  Archive,
  Copy,
  Tag,
  // FolderOpen,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2
} from "lucide-react";

// Import types và utilities
import {
  BulkOperationType,
  BulkOperationResult,
  BulkOperationProgress,
  getOperationDisplayName,
  getOperationConfirmationMessage,
  formatOperationResultMessage,
  estimateOperationTime
} from "@/lib/utils/bulk-operation-utils";

// ===== TYPES =====

export interface BulkActionsToolbarProps {
  selectedCount: number;
  selectedIds: string[];
  onBulkOperation: (type: BulkOperationType, parameters?: Record<string, unknown>) => Promise<BulkOperationResult>;
  onClearSelection: () => void;
  disabled?: boolean;
  userRole?: "GUEST" | "STUDENT" | "TUTOR" | "TEACHER" | "ADMIN";
  className?: string;
}

// ===== CONSTANTS =====

const BULK_ACTIONS = {
  DELETE: {
    type: 'delete' as BulkOperationType,
    label: 'Xóa',
    icon: Trash2,
    variant: 'destructive' as const,
    requiresConfirmation: true,
    minRole: 'TEACHER'
  },
  STATUS_CHANGE: {
    type: 'status-change' as BulkOperationType,
    label: 'Thay đổi trạng thái',
    icon: CheckCircle,
    variant: 'default' as const,
    requiresConfirmation: true,
    minRole: 'TEACHER'
  },
  EXPORT: {
    type: 'export' as BulkOperationType,
    label: 'Xuất dữ liệu',
    icon: Download,
    variant: 'outline' as const,
    requiresConfirmation: false,
    minRole: 'TUTOR'
  },
  TAG_ASSIGNMENT: {
    type: 'tag-assignment' as BulkOperationType,
    label: 'Gán thẻ',
    icon: Tag,
    variant: 'outline' as const,
    requiresConfirmation: false,
    minRole: 'TEACHER'
  },
  DUPLICATE: {
    type: 'duplicate' as BulkOperationType,
    label: 'Nhân bản',
    icon: Copy,
    variant: 'outline' as const,
    requiresConfirmation: true,
    minRole: 'TEACHER'
  },
  ARCHIVE: {
    type: 'archive' as BulkOperationType,
    label: 'Lưu trữ',
    icon: Archive,
    variant: 'outline' as const,
    requiresConfirmation: true,
    minRole: 'TEACHER'
  }
};

// ===== MAIN COMPONENT =====

export function BulkActionsToolbar({
  selectedCount,
  selectedIds,
  onBulkOperation,
  onClearSelection,
  disabled = false,
  userRole = "GUEST",
  className = ""
}: BulkActionsToolbarProps) {
  // ===== STATE =====

  // TODO: selectedIds sẽ được sử dụng để implement specific bulk operations
  const _selectedIds = selectedIds;
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<BulkOperationType | null>(null);
  const [operationProgress, setOperationProgress] = useState<BulkOperationProgress | null>(null);
  const [operationResult, setOperationResult] = useState<BulkOperationResult | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<{
    type: BulkOperationType;
    parameters?: Record<string, unknown>;
  } | null>(null);
  
  // ===== HELPERS =====
  
  /**
   * Check if user has permission for action
   */
  const hasPermission = (minRole: string): boolean => {
    const roleHierarchy = ['GUEST', 'STUDENT', 'TUTOR', 'TEACHER', 'ADMIN'];
    const userRoleIndex = roleHierarchy.indexOf(userRole);
    const minRoleIndex = roleHierarchy.indexOf(minRole);
    return userRoleIndex >= minRoleIndex;
  };
  
  /**
   * Get available actions based on user role
   */
  const getAvailableActions = () => {
    return Object.values(BULK_ACTIONS).filter(action => 
      hasPermission(action.minRole)
    );
  };
  
  // ===== HANDLERS =====
  
  /**
   * Handle bulk operation execution
   */
  const handleBulkOperation = async (
    type: BulkOperationType,
    parameters?: Record<string, unknown>
  ) => {
    if (selectedCount === 0 || isProcessing) return;
    
    const action = Object.values(BULK_ACTIONS).find(a => a.type === type);
    if (!action) return;
    
    // Show confirmation if required
    if (action.requiresConfirmation) {
      setShowConfirmation({ type, parameters });
      return;
    }
    
    await executeOperation(type, parameters);
  };
  
  /**
   * Execute operation after confirmation
   */
  const executeOperation = async (
    type: BulkOperationType,
    parameters?: Record<string, unknown>
  ) => {
    setIsProcessing(true);
    setCurrentOperation(type);
    setOperationResult(null);
    setShowConfirmation(null);
    
    // Simulate progress tracking
    const estimatedTime = estimateOperationTime(type, selectedCount);
    const progressInterval = setInterval(() => {
      setOperationProgress(prev => {
        if (!prev) {
          return {
            total: selectedCount,
            processed: 0,
            percentage: 0
          };
        }
        
        const newProcessed = Math.min(prev.processed + 1, selectedCount);
        return {
          ...prev,
          processed: newProcessed,
          percentage: (newProcessed / selectedCount) * 100
        };
      });
    }, estimatedTime / selectedCount);
    
    try {
      const result = await onBulkOperation(type, parameters);
      setOperationResult(result);
      
      // Clear selection if operation was successful
      if (result.success) {
        setTimeout(() => {
          onClearSelection();
        }, 2000);
      }
    } catch (error) {
      setOperationResult({
        success: false,
        processedCount: 0,
        failedCount: selectedCount,
        errors: [error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'],
        warnings: []
      });
    } finally {
      clearInterval(progressInterval);
      setIsProcessing(false);
      setCurrentOperation(null);
      setOperationProgress(null);
    }
  };
  
  /**
   * Handle confirmation dialog
   */
  const handleConfirmOperation = () => {
    if (showConfirmation) {
      executeOperation(showConfirmation.type, showConfirmation.parameters);
    }
  };
  
  /**
   * Handle cancel confirmation
   */
  const handleCancelConfirmation = () => {
    setShowConfirmation(null);
  };
  
  // ===== RENDER HELPERS =====
  
  /**
   * Render operation progress
   */
  const renderProgress = () => {
    if (!isProcessing || !operationProgress || !currentOperation) return null;
    
    const operationName = getOperationDisplayName(currentOperation);
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Đang {operationName.toLowerCase()}...</span>
          <span>{operationProgress.processed}/{operationProgress.total}</span>
        </div>
        <Progress value={operationProgress.percentage} className="h-2" />
        {operationProgress.estimatedTimeRemaining && (
          <div className="text-xs text-muted-foreground">
            Còn lại khoảng {Math.ceil(operationProgress.estimatedTimeRemaining / 1000)}s
          </div>
        )}
      </div>
    );
  };
  
  /**
   * Render operation result
   */
  const renderResult = () => {
    if (!operationResult) return null;
    
    const variant = operationResult.success ? "default" : "destructive";
    const Icon = operationResult.success ? CheckCircle : XCircle;
    
    return (
      <Alert variant={variant} className="mt-2">
        <Icon className="h-4 w-4" />
        <AlertDescription>
          {formatOperationResultMessage(operationResult)}
          {operationResult.errors.length > 0 && (
            <ul className="mt-1 text-xs">
              {operationResult.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          )}
        </AlertDescription>
      </Alert>
    );
  };
  
  /**
   * Render confirmation dialog
   */
  const renderConfirmation = () => {
    if (!showConfirmation) return null;
    
    const message = getOperationConfirmationMessage(
      showConfirmation.type,
      selectedCount,
      showConfirmation.parameters
    );
    
    return (
      <Alert variant="destructive" className="mt-2">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-3">
            <p>{message}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={handleConfirmOperation}
              >
                Xác nhận
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelConfirmation}
              >
                Hủy
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  };
  
  // ===== MAIN RENDER =====
  
  if (selectedCount === 0) return null;
  
  const availableActions = getAvailableActions();
  
  return (
    <div className={`bulk-actions-toolbar space-y-3 ${className}`}>
      {/* Toolbar header */}
      <div className="flex items-center justify-between p-3 bg-primary/5 border rounded-lg">
        <div className="flex items-center gap-3">
          <Badge variant="default" className="px-3 py-1">
            {selectedCount} câu hỏi được chọn
          </Badge>
          
          {/* Quick actions */}
          <div className="flex items-center gap-2">
            {availableActions.slice(0, 3).map(action => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.type}
                  variant={action.variant}
                  size="sm"
                  onClick={() => handleBulkOperation(action.type)}
                  disabled={disabled || isProcessing}
                >
                  {isProcessing && currentOperation === action.type ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Icon className="h-4 w-4 mr-1" />
                  )}
                  {action.label}
                </Button>
              );
            })}
            
            {/* More actions dropdown */}
            {availableActions.length > 3 && (
              <DropdownMenu>
                {/* Technical: Using asChild is SAFE here (not in Array.map) */}
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={disabled || isProcessing}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Thêm hành động</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {availableActions.slice(3).map(action => {
                    const Icon = action.icon;
                    return (
                      <DropdownMenuItem
                        key={action.type}
                        onClick={() => handleBulkOperation(action.type)}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {action.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        {/* Clear selection */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          disabled={disabled || isProcessing}
        >
          <XCircle className="h-4 w-4 mr-1" />
          Bỏ chọn
        </Button>
      </div>
      
      {/* Progress */}
      {renderProgress()}
      
      {/* Result */}
      {renderResult()}
      
      {/* Confirmation */}
      {renderConfirmation()}
    </div>
  );
}
