/**
 * Question Actions Dropdown Component
 * Enhanced dropdown với context-aware actions và permissions
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Trash2,
  Download,
  Share2,
  Archive,
  Star,
  Flag,
  History,
  FileText,
  ExternalLink,
  AlertTriangle
} from "lucide-react";

// Import types
import { Question } from "@/types/question";

// ===== TYPES =====

export interface QuestionActionsDropdownProps {
  question: Question;
  onView?: (questionId: string) => void;
  onEdit?: (questionId: string) => void;
  onDuplicate?: (questionId: string) => void;
  onDelete?: (questionId: string) => void;
  onExport?: (questionId: string, format: string) => void;
  onShare?: (questionId: string) => void;
  onArchive?: (questionId: string) => void;
  onFavorite?: (questionId: string) => void;
  onReport?: (questionId: string) => void;
  userRole?: "GUEST" | "STUDENT" | "TUTOR" | "TEACHER" | "ADMIN";
  disabled?: boolean;
  className?: string;
}

export interface QuestionAction {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  requiresConfirmation?: boolean;
  minRole?: string;
  condition?: (question: Question) => boolean;
}

// ===== CONSTANTS =====

const ROLE_HIERARCHY = ['GUEST', 'STUDENT', 'TUTOR', 'TEACHER', 'ADMIN'];

// ===== MAIN COMPONENT =====

export function QuestionActionsDropdown({
  question,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onExport,
  onShare,
  onArchive,
  onFavorite,
  onReport,
  userRole = "GUEST",
  disabled = false,
  className = ""
}: QuestionActionsDropdownProps) {
  // ===== STATE =====
  
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showArchiveConfirmation, setShowArchiveConfirmation] = useState(false);
  
  // ===== HELPERS =====
  
  /**
   * Check if user has permission for action
   */
  const hasPermission = (minRole: string): boolean => {
    const userRoleIndex = ROLE_HIERARCHY.indexOf(userRole);
    const minRoleIndex = ROLE_HIERARCHY.indexOf(minRole);
    return userRoleIndex >= minRoleIndex;
  };
  
  /**
   * Check if question can be edited
   */
  const canEdit = (): boolean => {
    if (question.status === 'ARCHIVED') return false;
    if (question.creator && question.creator !== 'current-user-id') {
      return hasPermission('ADMIN');
    }
    return hasPermission('TEACHER');
  };
  
  /**
   * Check if question can be deleted
   */
  const canDelete = (): boolean => {
    if (question.usageCount && question.usageCount > 0) return false;
    if (question.creator && question.creator !== 'current-user-id') {
      return hasPermission('ADMIN');
    }
    return hasPermission('TEACHER');
  };
  
  // ===== ACTION DEFINITIONS =====
  
  const actions: QuestionAction[] = [
    // View actions
    {
      key: 'view',
      label: 'Xem chi tiết',
      icon: Eye,
      onClick: () => onView?.(question.id),
      minRole: 'GUEST'
    },
    {
      key: 'preview',
      label: 'Xem trước',
      icon: ExternalLink,
      onClick: () => window.open(`/questions/${question.id}/preview`, '_blank'),
      minRole: 'STUDENT'
    },
    
    // Edit actions
    {
      key: 'edit',
      label: 'Chỉnh sửa',
      icon: Edit,
      onClick: () => onEdit?.(question.id),
      minRole: 'TEACHER',
      condition: canEdit
    },
    {
      key: 'duplicate',
      label: 'Nhân bản',
      icon: Copy,
      onClick: () => onDuplicate?.(question.id),
      minRole: 'TEACHER'
    },
    
    // Export actions
    {
      key: 'export-pdf',
      label: 'Xuất PDF',
      icon: FileText,
      onClick: () => onExport?.(question.id, 'pdf'),
      minRole: 'TUTOR'
    },
    {
      key: 'export-word',
      label: 'Xuất Word',
      icon: Download,
      onClick: () => onExport?.(question.id, 'docx'),
      minRole: 'TUTOR'
    },
    
    // Social actions
    {
      key: 'share',
      label: 'Chia sẻ',
      icon: Share2,
      onClick: () => onShare?.(question.id),
      minRole: 'STUDENT'
    },
    {
      key: 'favorite',
      label: question.isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích',
      icon: Star,
      onClick: () => onFavorite?.(question.id),
      minRole: 'STUDENT'
    },
    
    // Management actions
    {
      key: 'archive',
      label: 'Lưu trữ',
      icon: Archive,
      onClick: () => setShowArchiveConfirmation(true),
      minRole: 'TEACHER',
      requiresConfirmation: true,
      condition: (q) => q.status !== 'ARCHIVED'
    },
    {
      key: 'history',
      label: 'Lịch sử thay đổi',
      icon: History,
      onClick: () => window.open(`/questions/${question.id}/history`, '_blank'),
      minRole: 'TEACHER'
    },
    
    // Report actions
    {
      key: 'report',
      label: 'Báo cáo vấn đề',
      icon: Flag,
      onClick: () => onReport?.(question.id),
      minRole: 'STUDENT'
    },
    
    // Destructive actions
    {
      key: 'delete',
      label: 'Xóa',
      icon: Trash2,
      onClick: () => setShowDeleteConfirmation(true),
      variant: 'destructive',
      requiresConfirmation: true,
      minRole: 'TEACHER',
      condition: canDelete
    }
  ];
  
  // ===== FILTER ACTIONS =====
  
  const availableActions = actions.filter(action => {
    // Check permission
    if (action.minRole && !hasPermission(action.minRole)) {
      return false;
    }
    
    // Check condition
    if (action.condition && !action.condition(question)) {
      return false;
    }
    
    return true;
  });
  
  // Group actions
  const viewActions = availableActions.filter(a => ['view', 'preview'].includes(a.key));
  const editActions = availableActions.filter(a => ['edit', 'duplicate'].includes(a.key));
  const exportActions = availableActions.filter(a => a.key.startsWith('export-'));
  const socialActions = availableActions.filter(a => ['share', 'favorite'].includes(a.key));
  const managementActions = availableActions.filter(a => ['archive', 'history'].includes(a.key));
  const reportActions = availableActions.filter(a => ['report'].includes(a.key));
  const destructiveActions = availableActions.filter(a => ['delete'].includes(a.key));
  
  // ===== HANDLERS =====
  
  const handleDeleteConfirm = () => {
    onDelete?.(question.id);
    setShowDeleteConfirmation(false);
  };
  
  const handleArchiveConfirm = () => {
    onArchive?.(question.id);
    setShowArchiveConfirmation(false);
  };
  
  // ===== RENDER HELPERS =====
  
  const renderActionGroup = (actions: QuestionAction[], showSeparator = true) => {
    if (actions.length === 0) return null;
    
    return (
      <>
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={action.key}
              onClick={action.onClick}
              className={action.variant === 'destructive' ? 'text-destructive' : ''}
            >
              <Icon className="h-4 w-4 mr-2" />
              {action.label}
            </DropdownMenuItem>
          );
        })}
        {showSeparator && <DropdownMenuSeparator />}
      </>
    );
  };
  
  // ===== MAIN RENDER =====
  
  return (
    <>
      <DropdownMenu>
        {/*
          Technical: Fixed nested button issue causing "Maximum update depth exceeded" error
          Root cause: DropdownMenuTrigger automatically renders a button element
          When we put <Button> inside it → nested buttons → hydration error → infinite loop
          Solution: Style DropdownMenuTrigger directly without Button component
          Note: This component is used inside questions.map(), cannot use asChild
        */}
        <DropdownMenuTrigger
          className={`h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${className}`}
          disabled={disabled}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Mở menu hành động</span>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* View actions */}
          {renderActionGroup(viewActions)}
          
          {/* Edit actions */}
          {renderActionGroup(editActions)}
          
          {/* Export actions */}
          {exportActions.length > 0 && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Xuất dữ liệu
              </DropdownMenuLabel>
              {renderActionGroup(exportActions)}
            </>
          )}
          
          {/* Social actions */}
          {renderActionGroup(socialActions)}
          
          {/* Management actions */}
          {managementActions.length > 0 && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Quản lý
              </DropdownMenuLabel>
              {renderActionGroup(managementActions)}
            </>
          )}
          
          {/* Report actions */}
          {renderActionGroup(reportActions)}
          
          {/* Destructive actions */}
          {destructiveActions.length > 0 && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground text-destructive">
                Nguy hiểm
              </DropdownMenuLabel>
              {renderActionGroup(destructiveActions, false)}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Xác nhận xóa câu hỏi
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Thông tin câu hỏi:</p>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
              <p><strong>ID:</strong> {question.id}</p>
              <p><strong>Nội dung:</strong> {question.content?.substring(0, 100)}...</p>
              <p><strong>Loại:</strong> {question.type}</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirmation(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa câu hỏi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Archive confirmation dialog */}
      <Dialog open={showArchiveConfirmation} onOpenChange={setShowArchiveConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận lưu trữ câu hỏi</DialogTitle>
            <DialogDescription>
              Câu hỏi sẽ được chuyển vào kho lưu trữ và không hiển thị trong danh sách chính.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowArchiveConfirmation(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleArchiveConfirm}>
              <Archive className="h-4 w-4 mr-2" />
              Lưu trữ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
