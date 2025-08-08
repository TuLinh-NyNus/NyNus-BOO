/**
 * MapCode Version Editor Component
 * Simple editor cho MapCode configuration
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import { Alert } from "@/components/ui/feedback/alert";
import { Save, X, Eye, EyeOff, AlertCircle, FileText, Code } from "lucide-react";

// Import types
import type { MapCodeVersion } from "@/lib/mockdata/mapcode";

/**
 * Props for MapCodeVersionEditor component
 */
interface MapCodeVersionEditorProps {
  version?: MapCodeVersion | null;
  onSave: (versionData: Partial<MapCodeVersion>) => Promise<void>;
  onCancel: () => void;
}

/**
 * MapCode Version Editor Component
 * Simple editor với validation rules
 */
export function MapCodeVersionEditor({ version, onSave, onCancel }: MapCodeVersionEditorProps) {
  // Form state
  const [formData, setFormData] = useState({
    version: "",
    name: "",
    description: "",
    content: "",
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  /**
   * Initialize form data
   */
  useEffect(() => {
    if (version) {
      setFormData({
        version: version.version || "",
        name: version.name || "",
        description: version.description || "",
        content: version.content || "",
      });
    } else {
      // Default content for new version
      const defaultContent = {
        version: "1.0.0",
        categories: {
          math: {
            code: "M",
            name: "Toán học",
            subcategories: {
              algebra: { code: "A", name: "Đại số" },
              geometry: { code: "G", name: "Hình học" },
            },
          },
          physics: {
            code: "P",
            name: "Vật lý",
            subcategories: {
              mechanics: { code: "M", name: "Cơ học" },
              thermodynamics: { code: "T", name: "Nhiệt học" },
            },
          },
        },
        difficulties: {
          easy: { code: "E", name: "Dễ", points: 1 },
          medium: { code: "M", name: "Trung bình", points: 2 },
          hard: { code: "H", name: "Khó", points: 3 },
        },
        grades: {
          "10": { code: "0", name: "Lớp 10" },
          "11": { code: "1", name: "Lớp 11" },
          "12": { code: "2", name: "Lớp 12" },
        },
      };

      setFormData({
        version: "1.0.0",
        name: "New MapCode Version",
        description: "",
        content: JSON.stringify(defaultContent, null, 2),
      });
    }
  }, [version]);

  /**
   * Handle field change
   */
  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  /**
   * Validate form
   */
  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.version.trim()) {
      errors.push("Version không được để trống");
    }

    if (!formData.name.trim()) {
      errors.push("Tên MapCode không được để trống");
    }

    if (!formData.content.trim()) {
      errors.push("Nội dung MapCode không được để trống");
    } else {
      try {
        JSON.parse(formData.content);
      } catch (e) {
        errors.push("Nội dung MapCode phải là JSON hợp lệ");
      }
    }

    return errors;
  };

  /**
   * Handle save
   */
  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Validate form
      const errors = validateForm();
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      // Prepare save data
      const saveData = {
        id: version?.id,
        version: formData.version,
        name: formData.name,
        description: formData.description,
        content: formData.content,
      };

      await onSave(saveData);
    } catch (error) {
      console.error("Error saving MapCode version:", error);
      setValidationErrors(["Có lỗi xảy ra khi lưu MapCode version"]);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Parse and preview JSON content
   */
  const getPreviewContent = () => {
    try {
      const parsed = JSON.parse(formData.content);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return "Invalid JSON format";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            {version ? "Edit MapCode Version" : "Create New MapCode Version"}
          </h2>
          <p className="text-muted-foreground">
            {version ? "Chỉnh sửa MapCode version hiện có" : "Tạo MapCode version mới"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Validation Errors</h4>
            <ul className="text-sm text-muted-foreground mt-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        </Alert>
      )}

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Thông tin cơ bản của MapCode version</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="version">Version *</Label>
              <Input
                id="version"
                placeholder="e.g., v2.1.0"
                value={formData.version}
                onChange={(e) => handleFieldChange("version", e.target.value)}
                className={
                  validationErrors.some((error) => error.includes("Version"))
                    ? "border-red-500"
                    : ""
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., MapCode 2024 Q3"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                className={
                  validationErrors.some((error) => error.includes("Tên MapCode"))
                    ? "border-red-500"
                    : ""
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Mô tả về MapCode version này..."
                value={formData.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                className="w-full min-h-[100px] p-3 border rounded-md resize-y"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Content Preview</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPreview ? "Hide" : "Show"}
              </Button>
            </CardTitle>
            <CardDescription>Preview của MapCode JSON content</CardDescription>
          </CardHeader>
          <CardContent>
            {showPreview ? (
              <pre className="text-xs bg-muted/50 p-3 rounded overflow-auto max-h-[300px]">
                {getPreviewContent()}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                <div className="text-center">
                  <Eye className="h-8 w-8 mx-auto mb-2" />
                  <p>Click &quot;Show&quot; để xem preview</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* MapCode Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Nội dung MapCode *
          </CardTitle>
          <CardDescription>Cấu hình JSON cho hệ thống phân loại câu hỏi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <textarea
              placeholder="Nhập nội dung JSON cho MapCode..."
              value={formData.content}
              onChange={(e) => handleFieldChange("content", e.target.value)}
              className={`w-full min-h-[300px] p-3 border rounded-md resize-y font-mono text-sm ${
                validationErrors.some((error) => error.includes("Nội dung MapCode"))
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            <p className="text-xs text-muted-foreground">
              Nội dung phải là JSON hợp lệ. Sử dụng preview để kiểm tra format.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Help */}
      <Card>
        <CardHeader>
          <CardTitle>MapCode Structure Guide</CardTitle>
          <CardDescription>Hướng dẫn cấu trúc JSON cho MapCode</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Required Fields</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <code>version</code>: Version string</li>
                <li>• <code>categories</code>: Subject categories</li>
                <li>• <code>difficulties</code>: Difficulty levels</li>
                <li>• <code>grades</code>: Grade levels</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Category Structure</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <code>code</code>: Single character code</li>
                <li>• <code>name</code>: Display name</li>
                <li>• <code>subcategories</code>: Optional subcategories</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
