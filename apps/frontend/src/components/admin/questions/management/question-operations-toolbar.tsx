/**
 * Question Operations Toolbar Component
 * Advanced toolbar cho question management operations
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import {
  Plus,
  Copy,
  Archive,
  RotateCcw,
  Trash2,
  Edit,
  // Eye,
  // History,
  // Download,
  // Upload,
  Settings,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  // Star
} from "lucide-react";

// Import types
import { Question } from "@/lib/types/question";
import {
  QuestionOperation,
  QuestionOperationResult,
  validateQuestionForOperation
} from "@/lib/utils/question-management";

// ===== TYPES =====

export interface QuestionOperationsToolbarProps {
  question?: Question;
  selectedQuestions?: Question[];
  onOperation: (operation: QuestionOperation, data?: { questions: Question[]; isBulk: boolean }) => Promise<QuestionOperationResult>;
  userRole?: "GUEST" | "STUDENT" | "TUTOR" | "TEACHER" | "ADMIN";
  disabled?: boolean;
  showBulkActions?: boolean;
  className?: string;
}

// ===== OPERATION DEFINITIONS =====

interface OperationDefinition {
  key: QuestionOperation;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'default' | 'outline' | 'destructive' | 'ghost';
  requiresConfirmation: boolean;
  minRole: string;
  category: 'primary' | 'secondary' | 'destructive';
  tooltip: string;
}

const OPERATIONS: OperationDefinition[] = [
  {
    key: 'create',
    label: 'Tạo mới',
    icon: Plus,
    variant: 'default',
    requiresConfirmation: false,
    minRole: 'TEACHER',
    category: 'primary',
    tooltip: 'Tạo câu hỏi mới'
  },
  {
    key: 'duplicate',
    label: 'Nhân bản',
    icon: Copy,
    variant: 'outline',
    requiresConfirmation: false,
    minRole: 'TEACHER',
    category: 'primary',
    tooltip: 'Tạo bản sao câu hỏi'
  },
  {
    key: 'update',
    label: 'Chỉnh sửa',
    icon: Edit,
    variant: 'outline',
    requiresConfirmation: false,
    minRole: 'TEACHER',
    category: 'primary',
    tooltip: 'Chỉnh sửa câu hỏi'
  },
  {
    key: 'publish',
    label: 'Xuất bản',
    icon: CheckCircle,
    variant: 'default',
    requiresConfirmation: true,
    minRole: 'TEACHER',
    category: 'secondary',
    tooltip: 'Xuất bản câu hỏi'
  },
  {
    key: 'unpublish',
    label: 'Hủy xuất bản',
    icon: XCircle,
    variant: 'outline',
    requiresConfirmation: true,
    minRole: 'TEACHER',
    category: 'secondary',
    tooltip: 'Hủy xuất bản câu hỏi'
  },
  {
    key: 'archive',
    label: 'Lưu trữ',
    icon: Archive,
    variant: 'outline',
    requiresConfirmation: true,
    minRole: 'TEACHER',
    category: 'secondary',
    tooltip: 'Lưu trữ câu hỏi'
  },
  {
    key: 'restore',
    label: 'Khôi phục',
    icon: RotateCcw,
    variant: 'outline',
    requiresConfirmation: true,
    minRole: 'TEACHER',
    category: 'secondary',
    tooltip: 'Khôi phục từ lưu trữ'
  },
  {
    key: 'delete',
    label: 'Xóa',
    icon: Trash2,
    variant: 'destructive',
    requiresConfirmation: true,
    minRole: 'ADMIN',
    category: 'destructive',
    tooltip: 'Xóa câu hỏi vĩnh viễn'
  }
];

// ===== MAIN COMPONENT =====

export function QuestionOperationsToolbar({
  question,
  selectedQuestions = [],
  onOperation,
  userRole = "GUEST",
  disabled = false,
  showBulkActions = false,
  className = ""
}: QuestionOperationsToolbarProps) {
  // ===== STATE =====
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingOperation, setProcessingOperation] = useState<QuestionOperation | null>(null);
  
  // ===== COMPUTED VALUES =====
  
  const isBulkMode = showBulkActions && selectedQuestions.length > 0;
  const targetQuestions = isBulkMode ? selectedQuestions : (question ? [question] : []);
  
  // ===== HELPERS =====
  
  /**
   * Check if user has permission for operation
   */
  const hasPermission = (minRole: string): boolean => {
    const roleHierarchy = ['GUEST', 'STUDENT', 'TUTOR', 'TEACHER', 'ADMIN'];
    const userRoleIndex = roleHierarchy.indexOf(userRole);
    const minRoleIndex = roleHierarchy.indexOf(minRole);
    return userRoleIndex >= minRoleIndex;
  };
  
  /**
   * Check if operation is available for current questions
   */
  const isOperationAvailable = (operation: OperationDefinition): boolean => {
    if (!hasPermission(operation.minRole)) return false;
    
    if (targetQuestions.length === 0) {
      return operation.key === 'create';
    }
    
    // Check operation validity for each question
    return targetQuestions.every(q => {
      const validation = validateQuestionForOperation(q, operation.key);
      return validation.isValid || validation.errors.length === 0;
    });
  };
  
  /**
   * Get available operations
   */
  const getAvailableOperations = () => {
    return OPERATIONS.filter(isOperationAvailable);
  };
  
  // ===== HANDLERS =====
  
  /**
   * Handle operation execution
   */
  const handleOperation = async (operation: QuestionOperation) => {
    if (isProcessing || disabled) return;
    
    setIsProcessing(true);
    setProcessingOperation(operation);
    
    try {
      const result = await onOperation(operation, {
        questions: targetQuestions,
        isBulk: isBulkMode
      });
      
      // Handle result (could show toast, etc.)
      console.log('Operation result:', result);
    } catch (error) {
      console.error('Operation failed:', error);
    } finally {
      setIsProcessing(false);
      setProcessingOperation(null);
    }
  };
  
  // ===== RENDER HELPERS =====
  
  /**
   * Render operation button
   */
  const renderOperationButton = (operation: OperationDefinition) => {
    const Icon = operation.icon;
    const isCurrentlyProcessing = processingOperation === operation.key;
    
    return (
      <TooltipProvider key={operation.key}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={operation.variant}
              size="sm"
              onClick={() => handleOperation(operation.key)}
              disabled={disabled || isProcessing}
              className="flex items-center gap-2"
            >
              <Icon className={`h-4 w-4 ${isCurrentlyProcessing ? 'animate-spin' : ''}`} />
              {operation.label}
              {isBulkMode && (
                <Badge variant="outline" className="ml-1">
                  {selectedQuestions.length}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{operation.tooltip}</p>
            {isBulkMode && (
              <p className="text-xs text-muted-foreground">
                Áp dụng cho {selectedQuestions.length} câu hỏi
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };
  
  /**
   * Render operations by category
   */
  const renderOperationsByCategory = (category: string) => {
    const operations = getAvailableOperations().filter(op => op.category === category);
    return operations.map(renderOperationButton);
  };
  
  // ===== MAIN RENDER =====
  
  const availableOperations = getAvailableOperations();
  const primaryOperations = availableOperations.filter(op => op.category === 'primary');
  const secondaryOperations = availableOperations.filter(op => op.category === 'secondary');
  const destructiveOperations = availableOperations.filter(op => op.category === 'destructive');
  
  return (
    <div className={`question-operations-toolbar flex items-center gap-2 ${className}`}>
      {/* Bulk mode indicator */}
      {isBulkMode && (
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-md">
          <CheckCircle className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {selectedQuestions.length} câu hỏi được chọn
          </span>
        </div>
      )}
      
      {/* Primary operations */}
      <div className="flex items-center gap-1">
        {renderOperationsByCategory('primary')}
      </div>
      
      {/* Primary operations buttons */}
      {primaryOperations.map(operation => {
        const Icon = operation.icon;
        return (
          <Button
            key={operation.key}
            variant="default"
            size="sm"
            onClick={() => handleOperation(operation.key)}
            disabled={disabled || isProcessing}
            className="flex items-center gap-1"
          >
            <Icon className="h-4 w-4" />
            {operation.label}
          </Button>
        );
      })}

      {/* Secondary operations dropdown */}
      {secondaryOperations.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={disabled || isProcessing}>
              <Settings className="h-4 w-4 mr-1" />
              Thao tác
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Thao tác khác</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {secondaryOperations.map(operation => {
              const Icon = operation.icon;
              return (
                <DropdownMenuItem
                  key={operation.key}
                  onClick={() => handleOperation(operation.key)}
                  disabled={disabled || isProcessing}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {operation.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      
      {/* Destructive operations dropdown */}
      {destructiveOperations.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={disabled || isProcessing}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-destructive">Thao tác nguy hiểm</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {destructiveOperations.map(operation => {
              const Icon = operation.icon;
              return (
                <DropdownMenuItem
                  key={operation.key}
                  onClick={() => handleOperation(operation.key)}
                  disabled={disabled || isProcessing}
                  className="text-destructive focus:text-destructive"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {operation.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      
      {/* Processing indicator */}
      {isProcessing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 animate-spin" />
          Đang xử lý...
        </div>
      )}
    </div>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Compact operations toolbar
 */
export function CompactQuestionOperationsToolbar(props: QuestionOperationsToolbarProps) {
  return (
    <QuestionOperationsToolbar
      {...props}
      className={`compact-toolbar ${props.className || ''}`}
    />
  );
}

/**
 * Bulk operations toolbar
 */
export function BulkQuestionOperationsToolbar(props: QuestionOperationsToolbarProps) {
  return (
    <QuestionOperationsToolbar
      {...props}
      showBulkActions={true}
      className={`bulk-toolbar ${props.className || ''}`}
    />
  );
}
