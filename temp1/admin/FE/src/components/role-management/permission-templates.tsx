"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/forms/button";
import { Badge } from "@/components/ui/data-display/badge";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
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
import { Label } from "@/components/ui/forms/label";
import { Textarea } from "@/components/ui/forms/textarea";
import {
  Loader2,
  File,
  Play,
  Star,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Shield,
  Users,
  FileText,
  Settings,
  Lock,
} from "lucide-react";
import { UserRole, USER_ROLE_LABELS } from "@/types/admin-user";
import { toast } from "sonner";

/**
 * Interface cho role permission
 */
interface RolePermission {
  id: string;
  name: string;
  description: string;
  category: "user" | "content" | "system" | "security" | "admin";
  level: "read" | "write" | "delete" | "admin";
}

/**
 * Interface cho permission template
 */
interface PermissionTemplate {
  id: string;
  name: string;
  description: string;
  permissions: RolePermission[];
  applicableRoles: UserRole[];
  isDefault: boolean;
  createdAt?: string;
  createdBy?: string;
}

/**
 * Interface cho permission templates response
 */
interface PermissionTemplatesResponse {
  templates: PermissionTemplate[];
  totalTemplates: number;
  defaultTemplates: number;
  timestamp: string;
}

/**
 * Interface cho permission templates props
 */
interface PermissionTemplatesProps {
  onTemplateApplied?: () => void;
  className?: string;
}

/**
 * Permission Templates Component
 * Component để quản lý permission templates
 */
export function PermissionTemplates({
  onTemplateApplied,
  className = "",
}: PermissionTemplatesProps) {
  // State management
  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PermissionTemplate | null>(null);
  const [targetRole, setTargetRole] = useState<UserRole | "">("");
  const [reason, setReason] = useState("");
  const [override, setOverride] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  /**
   * Load permission templates
   */
  const loadTemplates = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/admin/permissions/templates", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data: PermissionTemplatesResponse = await response.json();
        setTemplates(data.templates);
      } else {
        toast.error("Không thể tải permission templates");
      }
    } catch (error) {
      console.error("Failed to load templates:", error);
      toast.error("Lỗi khi tải templates");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get category icon
   */
  const getCategoryIcon = (category: string) => {
    const icons = {
      user: Users,
      content: FileText,
      system: Settings,
      security: Lock,
      admin: Shield,
    };
    const IconComponent = icons[category as keyof typeof icons] || Shield;
    return <IconComponent className="h-3 w-3" />;
  };

  /**
   * Get level badge color
   */
  const getLevelBadgeColor = (
    level: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    const colorMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      read: "outline",
      write: "secondary",
      delete: "destructive",
      admin: "default",
    };
    return colorMap[level] || "outline";
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
   * Group permissions by category
   */
  const groupPermissionsByCategory = (permissions: RolePermission[]) => {
    return permissions.reduce(
      (groups, permission) => {
        const category = permission.category;
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(permission);
        return groups;
      },
      {} as Record<string, RolePermission[]>
    );
  };

  /**
   * Open apply template dialog
   */
  const openApplyDialog = (template: PermissionTemplate) => {
    setSelectedTemplate(template);
    setTargetRole("");
    setReason("");
    setOverride(false);
    setIsApplyDialogOpen(true);
  };

  /**
   * Apply template to role
   */
  const applyTemplate = async () => {
    if (!selectedTemplate || !targetRole) return;

    setIsApplying(true);

    try {
      const response = await fetch("/api/v1/admin/permissions/apply-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          targetRole,
          reason: reason.trim() || undefined,
          override,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || "Template applied successfully");
        onTemplateApplied?.();
        setIsApplyDialogOpen(false);
        resetApplyForm();
      } else {
        const error = await response.json();
        toast.error(error.message || "Không thể áp dụng template");
      }
    } catch (error) {
      console.error("Failed to apply template:", error);
      toast.error("Lỗi khi áp dụng template");
    } finally {
      setIsApplying(false);
    }
  };

  /**
   * Reset apply form
   */
  const resetApplyForm = () => {
    setSelectedTemplate(null);
    setTargetRole("");
    setReason("");
    setOverride(false);
  };

  /**
   * Delete template
   */
  const deleteTemplate = async (templateId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa template này?")) return;

    try {
      const response = await fetch(`/api/v1/admin/permissions/templates/${templateId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        toast.success("Template deleted successfully");
        loadTemplates();
      } else {
        const error = await response.json();
        toast.error(error.message || "Không thể xóa template");
      }
    } catch (error) {
      console.error("Failed to delete template:", error);
      toast.error("Lỗi khi xóa template");
    }
  };

  // Effects
  useEffect(() => {
    loadTemplates();
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải templates...</span>
      </div>
    );
  }

  const defaultTemplates = templates.filter((t) => t.isDefault);
  const customTemplates = templates.filter((t) => !t.isDefault);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <File className="h-6 w-6" />
            Permission Templates
          </h2>
          <p className="text-muted-foreground">Quản lý và áp dụng permission templates cho roles</p>
        </div>
        <Button onClick={loadTemplates} variant="outline">
          <Loader2 className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg text-center">
          <div className="text-2xl font-bold">{templates.length}</div>
          <div className="text-sm text-muted-foreground">Total Templates</div>
        </div>

        <div className="p-4 border rounded-lg text-center">
          <div className="text-2xl font-bold">{defaultTemplates.length}</div>
          <div className="text-sm text-muted-foreground">Default Templates</div>
        </div>

        <div className="p-4 border rounded-lg text-center">
          <div className="text-2xl font-bold">{customTemplates.length}</div>
          <div className="text-sm text-muted-foreground">Custom Templates</div>
        </div>
      </div>

      {/* Default Templates */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Default Templates
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {defaultTemplates.map((template) => {
            const groupedPermissions = groupPermissionsByCategory(template.permissions);

            return (
              <div key={template.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{template.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Default
                  </Badge>
                </div>

                {/* Permissions Summary */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    Permissions ({template.permissions.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(groupedPermissions).map(([category, perms]) => (
                      <div key={category} className="flex items-center gap-1 text-xs">
                        {getCategoryIcon(category)}
                        <span>{perms.length}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Applicable Roles */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Applicable Roles</div>
                  <div className="flex flex-wrap gap-1">
                    {template.applicableRoles.map((role) => (
                      <Badge key={role} variant={getRoleBadgeColor(role)} className="text-xs">
                        {USER_ROLE_LABELS[role]}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => openApplyDialog(template)} className="flex-1">
                    <Play className="h-4 w-4 mr-1" />
                    Apply
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Templates */}
      {customTemplates.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Custom Templates
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customTemplates.map((template) => {
              const groupedPermissions = groupPermissionsByCategory(template.permissions);

              return (
                <div key={template.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Custom
                    </Badge>
                  </div>

                  {/* Permissions Summary */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">
                      Permissions ({template.permissions.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(groupedPermissions).map(([category, perms]) => (
                        <div key={category} className="flex items-center gap-1 text-xs">
                          {getCategoryIcon(category)}
                          <span>{perms.length}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Applicable Roles */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Applicable Roles</div>
                    <div className="flex flex-wrap gap-1">
                      {template.applicableRoles.map((role) => (
                        <Badge key={role} variant={getRoleBadgeColor(role)} className="text-xs">
                          {USER_ROLE_LABELS[role]}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => openApplyDialog(template)} className="flex-1">
                      <Play className="h-4 w-4 mr-1" />
                      Apply
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Apply Template Dialog */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <File className="h-5 w-5" />
              Apply Template
            </DialogTitle>
            <DialogDescription>
              Áp dụng template "{selectedTemplate?.name}" cho role
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Template Info */}
            {selectedTemplate && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="font-medium">{selectedTemplate.name}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {selectedTemplate.description}
                </div>
                <div className="text-sm mt-2">
                  <strong>{selectedTemplate.permissions.length}</strong> permissions
                </div>
              </div>
            )}

            {/* Target Role Selection */}
            <div>
              <Label htmlFor="targetRole">Target Role</Label>
              <Select
                value={targetRole}
                onValueChange={(value) => setTargetRole(value as UserRole)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn role để áp dụng template" />
                </SelectTrigger>
                <SelectContent>
                  {selectedTemplate?.applicableRoles.map((role) => (
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

            {/* Override Option */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="override"
                checked={override}
                onChange={(e) => setOverride(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="override" className="text-sm">
                Override existing permissions (thay thế hoàn toàn)
              </Label>
            </div>

            {/* Reason */}
            <div>
              <Label htmlFor="reason">Lý do áp dụng template</Label>
              <Textarea
                id="reason"
                placeholder="Nhập lý do áp dụng template..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApplyDialogOpen(false)}
              disabled={isApplying}
            >
              Cancel
            </Button>
            <Button
              onClick={applyTemplate}
              disabled={!targetRole || isApplying}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isApplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Play className="mr-2 h-4 w-4" />
              Apply Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
