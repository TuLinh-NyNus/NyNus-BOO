/**
 * MapCode Version Editor Component
 * Simple editor cho MapCode configuration
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Alert,
} from "@/components/ui";
import { Save, X, Eye, EyeOff, AlertCircle, FileText, Code } from "lucide-react";

/**
 * MapCode version interface
 */
interface MapCodeVersion {
  id?: string;
  version: string;
  name: string;
  description: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  author?: string;
  questionCount?: number;
  fileSize?: number;
}

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
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  /**
   * Initialize form data
   */
  useEffect(() => {
    if (version) {
      setFormData({
        version: version.version || "",
        name: version.name || "",
        description: version.description || "",
        content: "", // TODO: Load actual MapCode content
      });
    } else {
      // Generate new version number
      const now = new Date();
      const versionNumber = `v${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}`;

      setFormData({
        version: versionNumber,
        name: `MapCode ${now.getFullYear()} Q${Math.ceil((now.getMonth() + 1) / 3)}`,
        description: "",
        content: getDefaultMapCodeContent(),
      });
    }
  }, [version]);

  /**
   * Get default MapCode content template
   */
  const getDefaultMapCodeContent = (): string => {
    return `{
  "version": "2.1.0",
  "name": "MapCode Configuration",
  "description": "Question classification and coding system",
  "grades": {
    "0": "Lớp 10",
    "1": "Lớp 11", 
    "2": "Lớp 12",
    "3": "Lớp 6",
    "4": "Lớp 7",
    "5": "Lớp 8",
    "6": "Lớp 9"
  },
  "subjects": {
    "P": "Toán học",
    "L": "Vật lý",
    "H": "Hóa học",
    "S": "Sinh học",
    "V": "Văn học",
    "A": "Tiếng Anh"
  },
  "levels": {
    "N": "Nhận biết",
    "H": "Thông hiểu", 
    "V": "Vận dụng",
    "C": "Vận dụng cao",
    "T": "VIP",
    "M": "Note"
  },
  "chapters": {
    "1": "Chương 1",
    "2": "Chương 2",
    "3": "Chương 3",
    "4": "Chương 4",
    "5": "Chương 5"
  }
}`;
  };

  /**
   * Handle form field change
   */
  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation errors when user makes changes
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  /**
   * Validate form data
   */
  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.version.trim()) {
      errors.push("Version không được để trống");
    }

    if (!formData.name.trim()) {
      errors.push("Tên version không được để trống");
    }

    if (!formData.content.trim()) {
      errors.push("Nội dung MapCode không được để trống");
    } else {
      // Validate JSON format
      try {
        JSON.parse(formData.content);
      } catch (error) {
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
   * Render JSON preview
   */
  const renderPreview = () => {
    try {
      const parsed = JSON.parse(formData.content);
      return (
        <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto max-h-64">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      );
    } catch (error) {
      return (
        <div className="text-red-600 text-sm p-3 bg-red-50 rounded border">
          JSON không hợp lệ: {(error as Error).message}
        </div>
      );
    }
  };

  return (
    <div className="mapcode-version-editor space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            {version ? "Chỉnh sửa MapCode Version" : "Tạo MapCode Version mới"}
          </h2>
          <p className="text-muted-foreground">
            {version
              ? `Chỉnh sửa version ${version.version}`
              : "Tạo version mới cho hệ thống MapCode"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showPreview ? "Ẩn preview" : "Xem preview"}
          </Button>

          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Hủy
          </Button>

          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium mb-2">Có lỗi cần sửa:</h4>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm">
                  {error}
                </li>
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
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>Thông tin metadata cho MapCode version</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Version */}
            <div className="space-y-2">
              <Label htmlFor="version">Version *</Label>
              <Input
                id="version"
                placeholder="v2.1.0"
                value={formData.version}
                onChange={(e) => handleFieldChange("version", e.target.value)}
                className={
                  validationErrors.some((error) => error.includes("Version"))
                    ? "border-red-500"
                    : ""
                }
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Tên version *</Label>
              <Input
                id="name"
                placeholder="MapCode 2024 Q3"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                className={
                  validationErrors.some((error) => error.includes("Tên version"))
                    ? "border-red-500"
                    : ""
                }
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <textarea
                id="description"
                placeholder="Mô tả về version này..."
                value={formData.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                className="w-full min-h-[80px] p-3 border border-gray-300 rounded-md resize-y"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        {showPreview && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Preview
              </CardTitle>
              <CardDescription>Xem trước nội dung MapCode</CardDescription>
            </CardHeader>
            <CardContent>{renderPreview()}</CardContent>
          </Card>
        )}
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
    </div>
  );
}
