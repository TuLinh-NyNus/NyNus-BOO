"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import { Textarea } from "@/components/ui/form/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/form/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu";
import {
  FileText,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Star,
  StarOff,
  CheckCircle,
  Users,
} from "lucide-react";

import { UserRole } from "@/lib/mockdata/core-types";
import { toast } from "@/hooks/use-toast";

// Import mockdata functions
import {
  getPermissionTemplates,
  createPermissionTemplate,
  applyPermissionTemplate,
  type PermissionTemplate,
  type RolePermission,
  mockRolePermissions,
} from "@/lib/mockdata/role-management";

/**
 * Permission Templates Props
 */
interface PermissionTemplatesProps {
  selectedRole?: UserRole | null;
  onTemplateApply?: (template: PermissionTemplate, role: UserRole) => void;
  className?: string;
}

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
 * Permission Templates Component
 * Component quản lý permission templates với predefined permission sets
 */
export function PermissionTemplates({
  selectedRole,
  onTemplateApply,
  className = "",
}: PermissionTemplatesProps) {
  // State management
  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PermissionTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Create template form state
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<RolePermission[]>([]);
  const [applicableRoles, setApplicableRoles] = useState<UserRole[]>([]);
  const [targetRole, setTargetRole] = useState<UserRole | "">("");

  /**
   * Load permission templates
   */
  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const templateData = await getPermissionTemplates();
      setTemplates(templateData);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast({
        title: "Lỗi tải templates",
        description: "Không thể tải danh sách permission templates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load templates on mount
   */
  useEffect(() => {
    loadTemplates();
  }, []);

  /**
   * Handle create template
   */
  const handleCreateTemplate = async () => {
    if (!templateName.trim() || selectedPermissions.length === 0) {
      toast({
        title: "Thông tin không đầy đủ",
        description: "Vui lòng nhập tên template và chọn ít nhất một permission",
        variant: "destructive",
      });
      return;
    }

    try {
      const newTemplate = await createPermissionTemplate(
        templateName.trim(),
        templateDescription.trim(),
        selectedPermissions,
        applicableRoles
      );

      setTemplates(prev => [...prev, newTemplate]);
      setIsCreateDialogOpen(false);
      resetCreateForm();

      toast({
        title: "Tạo template thành công",
        description: `Template "${templateName}" đã được tạo`,
      });
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        title: "Lỗi tạo template",
        description: "Không thể tạo permission template",
        variant: "destructive",
      });
    }
  };

  /**
   * Handle apply template
   */
  const handleApplyTemplate = async () => {
    if (!selectedTemplate || !targetRole) return;

    const reason = prompt("Nhập lý do apply template:");
    if (!reason) return;

    try {
      await applyPermissionTemplate(selectedTemplate.id, targetRole as UserRole, reason);
      
      if (onTemplateApply) {
        onTemplateApply(selectedTemplate, targetRole as UserRole);
      }

      setIsApplyDialogOpen(false);
      setSelectedTemplate(null);
      setTargetRole("");

      toast({
        title: "Apply template thành công",
        description: `Template "${selectedTemplate.name}" đã được apply cho role ${USER_ROLE_LABELS[targetRole as UserRole]}`,
      });
    } catch (error) {
      console.error("Error applying template:", error);
      toast({
        title: "Lỗi apply template",
        description: "Không thể apply permission template",
        variant: "destructive",
      });
    }
  };

  /**
   * Reset create form
   */
  const resetCreateForm = () => {
    setTemplateName("");
    setTemplateDescription("");
    setSelectedPermissions([]);
    setApplicableRoles([]);
  };

  /**
   * Handle permission toggle in create form
   */
  const handlePermissionToggle = (permission: RolePermission) => {
    setSelectedPermissions(prev => 
      prev.some(p => p.id === permission.id)
        ? prev.filter(p => p.id !== permission.id)
        : [...prev, permission]
    );
  };

  /**
   * Handle role toggle in create form
   */
  const handleRoleToggle = (role: UserRole) => {
    setApplicableRoles(prev => 
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  /**
   * Get filtered templates
   */
  const getFilteredTemplates = () => {
    return templates.filter(template =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredTemplates = getFilteredTemplates();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Permission Templates
            </CardTitle>
            <CardDescription>
              Quản lý predefined permission sets cho các roles
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <Label htmlFor="search">Search Templates</Label>
          <Input
            id="search"
            placeholder="Tìm kiếm templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
            <span className="ml-2">Đang tải templates...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        {template.isDefault && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <CardDescription className="text-sm">
                        {template.description}
                      </CardDescription>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedTemplate(template);
                            setIsApplyDialogOpen(true);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Apply Template
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm font-medium mb-1">Permissions ({template.permissions.length})</div>
                    <div className="flex flex-wrap gap-1">
                      {template.permissions.slice(0, 3).map((permission) => (
                        <Badge key={permission.id} variant="outline" className="text-xs">
                          {permission.name}
                        </Badge>
                      ))}
                      {template.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">Applicable Roles</div>
                    <div className="flex flex-wrap gap-1">
                      {template.applicableRoles.map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {USER_ROLE_LABELS[role]}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Used {template.usageCount} times</span>
                    <span>{formatDate(template.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredTemplates.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Không có templates nào</p>
          </div>
        )}
      </CardContent>

      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Permission Template</DialogTitle>
            <DialogDescription>
              Tạo template mới với predefined permission set
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Nhập tên template..."
              />
            </div>

            <div>
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Mô tả template..."
                rows={3}
              />
            </div>

            <div>
              <Label>Applicable Roles</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.values(UserRole).map((role) => (
                  <Button
                    key={role}
                    variant={applicableRoles.includes(role) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleRoleToggle(role)}
                  >
                    {USER_ROLE_LABELS[role]}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Permissions ({selectedPermissions.length} selected)</Label>
              <div className="max-h-64 overflow-y-auto border rounded p-3 mt-2">
                {mockRolePermissions.map((permission) => (
                  <div
                    key={permission.id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                      selectedPermissions.some(p => p.id === permission.id)
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-muted/25'
                    }`}
                    onClick={() => handlePermissionToggle(permission)}
                  >
                    <div>
                      <div className="font-medium text-sm">{permission.name}</div>
                      <div className="text-xs text-muted-foreground">{permission.description}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">{permission.category}</Badge>
                      <Badge variant="outline" className="text-xs">{permission.level}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Apply Template Dialog */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Permission Template</DialogTitle>
            <DialogDescription>
              Apply template &quot;{selectedTemplate?.name}&quot; to a role
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="target-role">Target Role *</Label>
              <Select value={targetRole} onValueChange={(value) => setTargetRole(value as UserRole | "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn role..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(UserRole).map((role) => (
                    <SelectItem key={role} value={role}>
                      {USER_ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate && (
              <div className="p-3 border rounded bg-muted/25">
                <div className="font-medium">{selectedTemplate.name}</div>
                <div className="text-sm text-muted-foreground mb-2">
                  {selectedTemplate.description}
                </div>
                <div className="text-sm">
                  <strong>Permissions:</strong> {selectedTemplate.permissions.length}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyTemplate} disabled={!targetRole}>
              Apply Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
