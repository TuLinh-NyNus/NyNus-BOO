/**
 * Permission Templates Component
 * Component quản lý permission templates
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  CheckCircle,
  Download,
} from "lucide-react";

import { mockPermissions } from "@/lib/mockdata/admin";

/**
 * Permission Template Interface
 * Interface cho permission template
 */
interface PermissionTemplate {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
  createdAt: Date;
  usageCount: number;
}

/**
 * Permission Templates Props
 * Props cho Permission Templates component
 */
interface PermissionTemplatesProps {
  onTemplateApplied?: () => void;
  className?: string;
}

/**
 * Mock permission templates
 * Mock data cho permission templates
 */
const mockTemplates: PermissionTemplate[] = [
  {
    id: "template-001",
    name: "Basic User",
    description: "Quyền cơ bản cho người dùng mới",
    permissions: ["perm-002", "perm-007"], // users.read, questions.read
    isDefault: true,
    createdAt: new Date("2024-01-01"),
    usageCount: 45
  },
  {
    id: "template-002", 
    name: "Content Creator",
    description: "Quyền tạo và quản lý nội dung",
    permissions: ["perm-002", "perm-006", "perm-007", "perm-008"], // users.read, questions CRUD
    isDefault: true,
    createdAt: new Date("2024-01-01"),
    usageCount: 23
  },
  {
    id: "template-003",
    name: "Moderator",
    description: "Quyền kiểm duyệt và quản lý người dùng",
    permissions: ["perm-002", "perm-003", "perm-007", "perm-012"], // users read/update, questions.read, analytics
    isDefault: true,
    createdAt: new Date("2024-01-01"),
    usageCount: 12
  },
  {
    id: "template-004",
    name: "Full Access",
    description: "Toàn quyền truy cập hệ thống",
    permissions: mockPermissions.map(p => p.id),
    isDefault: true,
    createdAt: new Date("2024-01-01"),
    usageCount: 3
  }
];

/**
 * Permission Templates Component
 * Component quản lý permission templates
 */
export function PermissionTemplates({ onTemplateApplied, className = "" }: PermissionTemplatesProps) {
  const [templates, setTemplates] = useState<PermissionTemplate[]>(mockTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  /**
   * Handle apply template
   * Xử lý áp dụng template
   */
  const handleApplyTemplate = async (templateId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update usage count
      setTemplates(prev => prev.map(template => 
        template.id === templateId 
          ? { ...template, usageCount: template.usageCount + 1 }
          : template
      ));

      console.log(`Applied template: ${templateId}`);
      onTemplateApplied?.();
    } catch (error) {
      console.error("Failed to apply template:", error);
    }
  };

  /**
   * Handle duplicate template
   * Xử lý nhân bản template
   */
  const handleDuplicateTemplate = (template: PermissionTemplate) => {
    const newTemplate: PermissionTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: new Date(),
      usageCount: 0
    };

    setTemplates(prev => [...prev, newTemplate]);
  };

  /**
   * Handle delete template
   * Xử lý xóa template
   */
  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(template => template.id !== templateId));
  };

  /**
   * Get permission names for template
   * Lấy tên permissions cho template
   */
  const getPermissionNames = (permissionIds: string[]): string[] => {
    return permissionIds
      .map(id => mockPermissions.find(p => p.id === id)?.name)
      .filter(Boolean) as string[];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Permission Templates
          </h2>
          <p className="text-muted-foreground">Quản lý và áp dụng permission templates</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tạo Template Mới
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === template.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {template.description}
                  </p>
                </div>
                {template.isDefault && (
                  <Badge variant="outline" className="text-xs">
                    Default
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Permissions Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Permissions</span>
                  <Badge variant="secondary" className="text-xs">
                    {template.permissions.length}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {getPermissionNames(template.permissions).slice(0, 3).map((name, index) => (
                    <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      {name}
                    </div>
                  ))}
                  {template.permissions.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{template.permissions.length - 3} more permissions
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Đã sử dụng: {template.usageCount} lần</span>
                <span>{template.createdAt.toLocaleDateString()}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyTemplate(template.id);
                  }}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Áp dụng
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicateTemplate(template);
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                {!template.isDefault && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(template.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Details */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết Template</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const template = templates.find(t => t.id === selectedTemplate);
              if (!template) return null;

              return (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Permissions ({template.permissions.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {getPermissionNames(template.permissions).map((name, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          {name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
